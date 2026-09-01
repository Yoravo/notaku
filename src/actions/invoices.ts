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
import { formatDateWIB } from "@/lib/invoice-utils";

import { calculateInvoiceTotals, DiscountType } from "@/lib/invoice-calculations";

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
  discountType?: DiscountType | string;
  discountValue?: number;
  taxRate?: number;
  currency?: string;
  enableDirectTransfer?: boolean;
  enableDigitalPayment?: boolean;
  enableReminder?: boolean;
  items: { description: string; quantity: number; price: number }[];
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const totals = calculateInvoiceTotals({
    items: parsed.data.items,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    taxRate: parsed.data.taxRate,
  });

  const invoice = await prisma.$transaction(async (tx) => {
    // Atomic: count check + create dalam satu transaksi
    const { allowed } = await canCreateInvoice(user.id, tx);
    if (!allowed) {
      throw new Error(
        "Batas invoice gratis tercapai. Upgrade ke Pro untuk unlimited.",
      );
    }

    const customer = await tx.customer.findUnique({
      where: { id: parsed.data.customerId, userId: user.id },
      select: { id: true },
    });
    if (!customer) {
      throw new Error("Pelanggan tidak ditemukan");
    }

    const number = await generateInvoiceNumber(user.id, tx);

    return tx.invoice.create({
      data: {
        userId: user.id,
        customerId: parsed.data.customerId,
        number,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        notes: parsed.data.notes || null,
        subtotal: totals.subtotal,
        discountType: totals.discountType,
        discountValue: totals.discountValue,
        discountAmount: totals.discountAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        currency: parsed.data.currency || "IDR",
        enableDirectTransfer: parsed.data.enableDirectTransfer ?? true,
        enableDigitalPayment: parsed.data.enableDigitalPayment ?? false,
        enableReminder: parsed.data.enableReminder ?? true,
        items: {
          create: parsed.data.items.map((item) => ({
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
    discountType?: DiscountType | string;
    discountValue?: number;
    taxRate?: number;
    currency?: string;
    enableDirectTransfer?: boolean;
    enableDigitalPayment?: boolean;
    enableReminder?: boolean;
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
    where: { id: parsed.data.customerId, userId: user.id },
    select: { id: true },
  });
  if (!customer) {
    throw new Error("Pelanggan tidak ditemukan");
  }

  const totals = calculateInvoiceTotals({
    items: parsed.data.items,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    taxRate: parsed.data.taxRate,
  });

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

  await prisma.invoice.update({
    where: { id, userId: user.id },
    data: {
      customerId: parsed.data.customerId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes || null,
      subtotal: totals.subtotal,
      discountType: totals.discountType,
      discountValue: totals.discountValue,
      discountAmount: totals.discountAmount,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      currency: parsed.data.currency || "IDR",
      enableDirectTransfer: parsed.data.enableDirectTransfer ?? true,
      enableDigitalPayment: parsed.data.enableDigitalPayment ?? false,
      enableReminder: parsed.data.enableReminder ?? true,
      items: {
        create: parsed.data.items.map((item) => ({
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
    select: { status: true, paidAt: true, paymentMethod: true },
  });
  if (!invoice) throw new Error("Invoice tidak ditemukan");

  if (!VALID_TRANSITIONS[invoice.status]?.has(status)) {
    throw new Error(
      `Status tidak bisa diubah dari ${invoice.status} ke ${status}`,
    );
  }

  const updateData: {
    status: InvoiceStatus;
    paidAt?: Date;
    paymentMethod?: string;
  } = {
    status: status as InvoiceStatus,
  };

  // Jika ditandai PAID secara manual oleh user dan belum memiliki paidAt, set tanggal saat ini & direct transfer
  if (status === "PAID") {
    if (!invoice.paidAt) {
      updateData.paidAt = new Date();
    }
    if (!invoice.paymentMethod) {
      updateData.paymentMethod = "DIRECT_TRANSFER";
    }
  }

  await prisma.invoice.update({
    where: { id, userId: user.id },
    data: updateData,
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

export async function cloneInvoice(id: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  // Atomic limit check + copy
  const newInvoice = await prisma.$transaction(async (tx) => {
    const { allowed } = await canCreateInvoice(user.id, tx);
    if (!allowed) {
      throw new Error(
        "Batas invoice gratis tercapai. Upgrade ke Pro untuk unlimited invoice.",
      );
    }

    const source = await tx.invoice.findUnique({
      where: { id, userId: user.id },
      include: { items: true },
    });

    if (!source) {
      throw new Error("Invoice asal tidak ditemukan");
    }

    const number = await generateInvoiceNumber(user.id, tx);

    return tx.invoice.create({
      data: {
        userId: user.id,
        customerId: source.customerId,
        number,
        status: "DRAFT",
        dueDate: null, // Reset jatuh tempo agar diatur ulang
        notes: source.notes,
        subtotal: source.subtotal,
        discountType: source.discountType,
        discountValue: source.discountValue,
        discountAmount: source.discountAmount,
        taxRate: source.taxRate,
        taxAmount: source.taxAmount,
        total: source.total,
        currency: source.currency,
        enableDirectTransfer: source.enableDirectTransfer,
        enableDigitalPayment: source.enableDigitalPayment,
        enableReminder: source.enableReminder,
        items: {
          create: source.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            price: it.price,
            amount: it.amount,
          })),
        },
      },
    });
  });

  auditLog(
    "invoice.cloned",
    { sourceInvoiceId: id, newInvoiceId: newInvoice.id, number: newInvoice.number },
    { userId: user.id },
  );

  revalidatePath("/invoices");
  redirect(`/invoices/${newInvoice.id}`);
}

export async function sendInvoiceEmail(data: {
  invoiceId: string;
  recipientEmail?: string;
  templateType?: "new" | "reminder" | "paid";
  customMessage?: string;
}): Promise<{ success: boolean; recipient?: string; error?: string }> {
  try {
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
      return { success: false, error: "Invoice tidak ditemukan" };
    }

    const targetEmail = data.recipientEmail || invoice.customer.email;
    if (!targetEmail || !targetEmail.trim()) {
      return {
        success: false,
        error: "Alamat email pelanggan tidak ditemukan. Silakan masukkan alamat email tujuan.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail.trim())) {
      return { success: false, error: "Format alamat email tidak valid" };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.notaku.store";
    const invoiceUrl = `${baseUrl}/i/${invoice.publicId}`;
    const businessName = invoice.user.businessName || invoice.user.name || "NotaKu";
    const formattedDueDate = invoice.dueDate
      ? formatDateWIB(invoice.dueDate, {
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
      subtotal: Number(invoice.subtotal || invoice.total),
      discountType: invoice.discountType,
      discountValue: Number(invoice.discountValue || 0),
      discountAmount: Number(invoice.discountAmount || 0),
      taxRate: Number(invoice.taxRate || 0),
      taxAmount: Number(invoice.taxAmount || 0),
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

    await auditLog(
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
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal memproses pengiriman email";
    return { success: false, error: errorMsg };
  }
}
