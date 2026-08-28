import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createMayarPayment } from "@/lib/mayar";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID invoice wajib disertakan" },
        { status: 400 }
      );
    }

    if (!(await checkRateLimit(`pay-invoice:${publicId}`, 10, 60))) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pembayaran. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { publicId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            businessName: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice ini sudah lunas." },
        { status: 400 }
      );
    }

    if (!invoice.enableDigitalPayment) {
      return NextResponse.json(
        { error: "Pembayaran digital tidak diaktifkan untuk invoice ini." },
        { status: 400 }
      );
    }

    const sellerTitle = invoice.user.businessName || invoice.user.name;
    const amount = Number(invoice.total);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Nominal invoice tidak valid untuk pembayaran digital" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
    const redirectUrl = `${appUrl}/i/${invoice.publicId}?payment=success`;

    // Buat Payment Link Mayar per-Invoice
    const orderId = `INV-${invoice.id.slice(0, 8)}-${Date.now()}`;
    const { paymentUrl, paymentId } = await createMayarPayment({
      name: `Pembayaran ${invoice.number} - ${sellerTitle}`,
      amount,
      customerName: invoice.customer.name,
      customerEmail: invoice.customer.email || invoice.user.email,
      customerMobile: invoice.customer.phone || invoice.user.phone || "081234567890",
      description: `Tagihan Invoice ${invoice.number} kepada ${invoice.customer.name}`,
      redirectUrl,
      orderId,
    });

    // Simpan link & paymentId pada invoice
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        mayarPaymentUrl: paymentUrl,
        mayarPaymentId: paymentId || orderId,
      },
    });

    return NextResponse.json({
      paymentUrl,
      paymentId: paymentId || orderId,
    });
  } catch (err: any) {
    console.error("Error creating Mayar invoice payment:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Gagal memproses tautan pembayaran digital",
      },
      { status: 502 }
    );
  }
}
