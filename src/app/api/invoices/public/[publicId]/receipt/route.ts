import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderReceiptPDF } from "@/lib/pdf/receipt-template";
import { terbilangRupiah } from "@/lib/terbilang";
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

  if (invoice.status !== "PAID") {
    return NextResponse.json(
      { error: "Kuitansi hanya dapat diakses setelah tagihan dinyatakan lunas (PAID)" },
      { status: 400 },
    );
  }

  const paymentDate = invoice.paidAt || invoice.createdAt;
  const formattedPaidDate = formatDateWIB(paymentDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const paymentMethodLabel =
    invoice.paymentMethod === "NOTAKU_DIGITAL"
      ? "Pembayaran Digital (QRIS / VA)"
      : invoice.paymentMethod === "DIRECT_TRANSFER"
        ? "Transfer Bank Langsung"
        : "Transfer Bank / Tunai";

  const itemsSummary = invoice.items.map((i) => i.description).slice(0, 3).join(", ");
  const receiptNumber = `KW/${invoice.number}`;
  const totalAmount = Number(invoice.total);

  const receiptData = {
    receiptNumber,
    invoiceNumber: invoice.number,
    paidAt: formattedPaidDate,
    paymentMethod: paymentMethodLabel,
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email || undefined,
      phone: invoice.customer.phone || undefined,
      address: invoice.customer.address || undefined,
    },
    user: {
      name: invoice.user.name,
      businessName: invoice.user.businessName || undefined,
      email: invoice.user.email,
      phone: invoice.user.phone || undefined,
      address: invoice.user.address || undefined,
      logoUrl: invoice.user.logoUrl || undefined,
      signatureUrl: invoice.user.signatureUrl || undefined,
      stampUrl: invoice.user.stampUrl || undefined,
    },
    itemsSummary,
    total: totalAmount,
    totalWords: terbilangRupiah(totalAmount),
    notes: invoice.notes || undefined,
    isFree: invoice.user.plan === "FREE",
  };

  try {
    const buffer = await renderReceiptPDF(receiptData);

    const disposition = isPreview
      ? `inline; filename="Kuitansi-${invoice.number}.pdf"`
      : `attachment; filename="Kuitansi-${invoice.number}.pdf"`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("Public Receipt PDF render error:", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF Kuitansi. Coba lagi." },
      { status: 500 },
    );
  }
}
