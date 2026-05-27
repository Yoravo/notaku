import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { renderInvoicePDF } from "@/lib/pdf/invoice-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true, customer: true, user: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = {
    number: invoice.number,
    status: invoice.status,
    createdAt: invoice.createdAt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dueDate:
      invoice.dueDate?.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) || null,
    notes: invoice.notes,
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email || undefined,
      phone: invoice.customer.phone || undefined,
      address: invoice.customer.address || undefined,
    },
    user: {
      name: invoice.user.name,
      email: invoice.user.email,
      businessName: invoice.user.businessName || undefined,
      phone: invoice.user.phone || undefined,
      address: invoice.user.address || undefined,
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: Number(item.price),
      amount: Number(item.amount),
    })),
    total: Number(invoice.total),
    isFree: invoice.user.plan === "FREE",
  };

  const buffer = await renderInvoicePDF(data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
    },
  });
}
