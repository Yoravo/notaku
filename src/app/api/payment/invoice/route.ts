import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createOrReuseCheckout, CheckoutConflictError } from "@/lib/payment-checkout";
import { getCanonicalAppOrigin } from "@/lib/app-url";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  const input = body as Record<string, unknown>;
  const publicId = typeof input.publicId === "string" ? input.publicId.trim() : "";
  if (!publicId) return NextResponse.json({ error: "Public ID invoice wajib disertakan" }, { status: 400 });
  if (!(await checkRateLimit(`pay-invoice:${publicId}`, 10, 60))) return NextResponse.json({ error: "Terlalu banyak permintaan pembayaran." }, { status: 429 });
  const invoice = await prisma.invoice.findUnique({ where: { publicId }, include: { user: { select: { id: true, name: true, businessName: true } }, customer: { select: { name: true, email: true, phone: true } } } });
  if (!invoice) return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  if (!["SENT", "OVERDUE"].includes(invoice.status)) return NextResponse.json({ error: "Invoice tidak memenuhi syarat pembayaran digital." }, { status: 400 });
  if (!invoice.enableDigitalPayment) return NextResponse.json({ error: "Pembayaran digital tidak diaktifkan." }, { status: 400 });
  if (invoice.currency !== "IDR") return NextResponse.json({ error: "Pembayaran digital saat ini hanya mendukung IDR." }, { status: 400 });
  const amount = Number(invoice.total);
  if (!Number.isSafeInteger(amount) || amount <= 0) return NextResponse.json({ error: "Nominal invoice tidak valid." }, { status: 400 });
  if (!invoice.customer.email || !invoice.customer.phone) return NextResponse.json({ error: "Email dan nomor ponsel pelanggan wajib tersedia." }, { status: 400 });
  try {
    const checkout = await createOrReuseCheckout({ purpose: "INVOICE", userId: invoice.userId, invoiceId: invoice.id, amount, name: `Pembayaran ${invoice.number} - ${invoice.user.businessName || invoice.user.name}`, email: invoice.customer.email, mobile: invoice.customer.phone, description: `Tagihan Invoice ${invoice.number} kepada ${invoice.customer.name}`, returnUrl: new URL(`/i/${encodeURIComponent(invoice.publicId)}`, getCanonicalAppOrigin(process.env.NEXT_PUBLIC_APP_URL)).toString() });
    await prisma.invoice.update({ where: { id: invoice.id }, data: { mayarPaymentUrl: checkout.paymentUrl, mayarPaymentId: checkout.paymentId } });
    return NextResponse.json({ paymentUrl: checkout.paymentUrl, paymentId: checkout.paymentId, attemptId: checkout.attemptId });
  } catch (error) {
    if (error instanceof CheckoutConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Invoice payment checkout creation failed");
    return NextResponse.json({ error: "Gagal memproses tautan pembayaran digital" }, { status: 502 });
  }
}
