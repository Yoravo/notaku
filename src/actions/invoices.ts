"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@/generated/prisma/client";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { canCreateInvoice } from "@/lib/plan-limits";
import { invoiceSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit-log";
import { checkServerActionRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { renderInvoiceEmailHtml } from "@/lib/email-templates";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
};

export async function createInvoice(data: {
  customerId: string;
  dueDate: string | null;
  notes: string | null;
  items: { description: string; quantity: number; price: number }[];
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const total = data.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.price),
    0,
  );

  const invoice = await prisma.$transaction(async (tx) => {
    // Atomic: count check + create dalam satu transaksi
    const { allowed } = await canCreateInvoice(user.id, tx);
    if (!allowed) {
      throw new Error(
        "Batas invoice gratis tercapai. Upgrade ke Pro untuk unlimited.",
      );
    }

    const customer = await tx.customer.findUnique({
      where: { id: data.customerId, userId: user.id },
      select: { id: true },
    });
    if (!customer) {
      throw new Error("Pelanggan tidak ditemukan");
    }

    const number = await generateInvoiceNumber(user.id, tx);

    return tx.invoice.create({
      data: {
        userId: user.id,
        customerId: data.customerId,
        number,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || null,
        total,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: Math.round(item.quantity * item.price),
          })),
        },
      },
    });
  });

  auditLog(
    "invoice.created",
    { invoiceId: invoice.id, number: invoice.number },
    { userId: user.id },
  );

  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(
  id: string,
  data: {
    customerId: string;
    dueDate: string | null;
    notes: string | null;
    items: InvoiceItem[];
  },
) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Free user can only edit DRAFT invoices
  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: user.id },
    select: { status: true, user: { select: { plan: true } } },
  });
  if (!invoice) throw new Error("Invoice tidak ditemukan");
  if (invoice.user.plan === "FREE" && invoice.status !== "DRAFT") {
    throw new Error(
      "Akun gratis hanya bisa mengedit invoice draft. Invoice yang sudah dikirim/lunas tidak bisa diubah.",
    );
  }

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId, userId: user.id },
    select: { id: true },
  });
  if (!customer) {
    throw new Error("Pelanggan tidak ditemukan");
  }

  const total = data.items.reduce(
    (sum, item) => sum + Math.round(item.quantity * item.price),
    0,
  );

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

  await prisma.invoice.update({
    where: { id, userId: user.id },
    data: {
      customerId: data.customerId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      total,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: Math.round(item.quantity * item.price),
        })),
      },
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const VALID_STATUSES = new Set([
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]);
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Status invoice tidak valid");
  }

  const VALID_TRANSITIONS: Record<string, Set<string>> = {
    DRAFT: new Set(["SENT", "CANCELLED"]),
    SENT: new Set(["PAID", "OVERDUE", "CANCELLED"]),
    PAID: new Set(["OVERDUE"]),
    OVERDUE: new Set(["PAID", "CANCELLED"]),
    CANCELLED: new Set(),
  };

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: user.id },
    select: { status: true },
  });
  if (!invoice) throw new Error("Invoice tidak ditemukan");

  if (!VALID_TRANSITIONS[invoice.status]?.has(status)) {
    throw new Error(
      `Status tidak bisa diubah dari ${invoice.status} ke ${status}`,
    );
  }

  await prisma.invoice.update({
    where: { id, userId: user.id },
    data: { status: status as InvoiceStatus },
  });

  auditLog(
    "invoice.status_changed",
    { invoiceId: id, status },
    { userId: user.id },
  );

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}

export async function deleteInvoice(id: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "destructive");

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: user.id },
    include: { user: { select: { plan: true } } },
  });

  if (!invoice) throw new Error("Invoice tidak ditemukan");

  // Free users can only delete DRAFT invoices
  if (invoice.user.plan === "FREE" && invoice.status !== "DRAFT") {
    throw new Error(
      "Akun gratis hanya bisa menghapus invoice draft. Invoice yang sudah dikirim/lunas tidak bisa dihapus.",
    );
  }

  await prisma.invoice.delete({
    where: { id, userId: user.id },
  });

  auditLog("invoice.deleted", { invoiceId: id }, { userId: user.id });

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function sendInvoiceEmail(data: {
  invoiceId: string;
  recipientEmail?: string;
  templateType?: "new" | "reminder" | "paid";
  customMessage?: string;
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId, userId: user.id },
    include: {
      customer: true,
      items: true,
      user: {
        select: {
          businessName: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice tidak ditemukan");
  }

  const targetEmail = data.recipientEmail || invoice.customer.email;
  if (!targetEmail || !targetEmail.trim()) {
    throw new Error("Alamat email pelanggan tidak ditemukan. Silakan masukkan alamat email tujuan.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(targetEmail.trim())) {
    throw new Error("Format alamat email tidak valid");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.vercel.app";
  const invoiceUrl = `${baseUrl}/i/${invoice.publicId}`;
  const businessName = invoice.user.businessName || invoice.user.name || "NotaKu";
  const formattedDueDate = invoice.dueDate
    ? invoice.dueDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const subject = `[Invoice ${invoice.number || "Draft"}] Tagihan dari ${businessName}`;

  const html = renderInvoiceEmailHtml({
    invoiceNumber: invoice.number || "Draft",
    customerName: invoice.customer.name,
    businessName,
    total: Number(invoice.total),
    dueDate: formattedDueDate,
    publicId: invoice.publicId,
    invoiceUrl,
    type: data.templateType || (invoice.status === "PAID" ? "paid" : invoice.status === "OVERDUE" ? "reminder" : "new"),
    customMessage: data.customMessage,
    items: invoice.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      price: Number(it.price),
      amount: Number(it.amount),
    })),
  });

  await sendEmail({
    to: targetEmail.trim(),
    subject,
    html,
  });

  // Jika invoice berstatus DRAFT, otomatis perbarui status menjadi SENT
  if (invoice.status === "DRAFT") {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "SENT" },
    });
  }

  auditLog(
    "invoice.email_sent",
    {
      invoiceId: invoice.id,
      recipientEmail: targetEmail.trim(),
      templateType: data.templateType,
    },
    { userId: user.id },
  );

  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/invoices");

  return { success: true, recipient: targetEmail.trim() };
}
