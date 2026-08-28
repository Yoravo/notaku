import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { renderInvoicePDF } from "@/lib/pdf/invoice-template";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const isPreview = searchParams.get("preview") === "true";
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

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = date.toLocaleString("en-US", { month: "long" });
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  const data = {
    number: invoice.number,
    status: invoice.status,
    createdAt: formatDate(invoice.createdAt),
    dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : null,
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
      logoUrl: invoice.user.logoUrl || undefined,
      signatureUrl: invoice.user.signatureUrl || undefined,
      stampUrl: invoice.user.stampUrl || undefined,
      bankName: invoice.user.bankName || undefined,
      bankAccountNumber: invoice.user.bankAccountNumber || undefined,
      bankAccountName: invoice.user.bankAccountName || undefined,
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: Number(item.price),
      amount: Number(item.amount),
    })),
    subtotal: Number(invoice.subtotal || invoice.total),
    discountType: invoice.discountType,
    discountValue: Number(invoice.discountValue || 0),
    discountAmount: Number(invoice.discountAmount || 0),
    taxRate: Number(invoice.taxRate || 0),
    taxAmount: Number(invoice.taxAmount || 0),
    total: Number(invoice.total),
    isFree: invoice.user.plan === "FREE",
    template: invoice.user.invoiceTemplate.toLowerCase() as
      | "classic"
      | "modern"
      | "minimal",
  };

  try {
    const buffer = await renderInvoicePDF(data);

    const disposition = isPreview
      ? `inline; filename="${invoice.number}.pdf"`
      : `attachment; filename="${invoice.number}.pdf"`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("PDF render error:", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF. Coba lagi." },
      { status: 500 },
    );
  }
}
