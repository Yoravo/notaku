import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderInvoicePDF } from "@/lib/pdf/invoice-template";
import { formatDateWIB } from "@/lib/invoice-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const { searchParams } = new URL(request.url);
  const isPreview = searchParams.get("preview") === "true";

  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: { items: true, customer: true, user: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  const formattedDate = (date: Date) =>
    formatDateWIB(date, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const currency = (invoice as any).currency || "IDR";

  const data = {
    number: invoice.number,
    status: invoice.status,
    createdAt: formattedDate(invoice.createdAt),
    dueDate: invoice.dueDate ? formattedDate(invoice.dueDate) : null,
    notes: invoice.notes,
    currency,
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
      ? `inline; filename="Invoice-${invoice.number}.pdf"`
      : `attachment; filename="Invoice-${invoice.number}.pdf"`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("Public Invoice PDF render error:", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF Invoice. Coba lagi." },
      { status: 500 },
    );
  }
}
