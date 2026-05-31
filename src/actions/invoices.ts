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

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { allowed } = await canCreateInvoice(user.id);
  if (!allowed) {
    throw new Error(
      "Batas invoice gratis tercapai. Upgrade ke Pro untuk unlimited.",
    );
  }

  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const number = await generateInvoiceNumber(user.id);

  const invoice = await prisma.invoice.create({
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
          amount: item.quantity * item.price,
        })),
      },
    },
  });

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

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Verify ownership BEFORE any mutation
  const existing = await prisma.invoice.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Invoice tidak ditemukan");
  }

  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
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
          amount: item.quantity * item.price,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus | string,
) {
  const user = await getUser();

  await prisma.invoice.update({
    where: { id, userId: user.id },
    data: { status: status as InvoiceStatus },
  });

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}

export async function deleteInvoice(id: string) {
  const user = await getUser();

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

  revalidatePath("/invoices");
  redirect("/invoices");
}
