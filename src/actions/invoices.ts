"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceStatus } from "@/generated/prisma";

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
  items: InvoiceItem[];
}) {
  const user = await getUser();

  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      customerId: data.customerId,
      number: "", // placeholder, will be set by numbering logic later
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

  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // Delete existing items and recreate
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

  await prisma.invoice.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}
