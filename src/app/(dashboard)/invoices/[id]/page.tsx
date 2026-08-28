import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceDetailClient } from "./invoice-detail-client";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: {
      items: true,
      customer: true,
      user: { select: { businessName: true, name: true } },
    },
  });

  if (!invoice) notFound();

  const serializedInvoice = {
    id: invoice.id,
    publicId: invoice.publicId,
    number: invoice.number,
    status: invoice.status,
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    notes: invoice.notes,
    subtotal: Number(invoice.subtotal || invoice.total),
    discountType: invoice.discountType,
    discountValue: Number(invoice.discountValue || 0),
    discountAmount: Number(invoice.discountAmount || 0),
    taxRate: Number(invoice.taxRate || 0),
    taxAmount: Number(invoice.taxAmount || 0),
    total: Number(invoice.total),
    createdAt: invoice.createdAt.toISOString(),
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: Number(item.price),
      amount: Number(item.amount),
    })),
    customer: {
      id: invoice.customer.id,
      name: invoice.customer.name,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
      address: invoice.customer.address,
    },
    businessName: invoice.user.businessName || invoice.user.name,
  };

  return <InvoiceDetailClient invoice={serializedInvoice} />;
}
