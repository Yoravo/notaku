import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { createOrReuseCheckout, CheckoutConflictError } from "@/lib/payment-checkout";
import { reconcilePaymentAttempt } from "@/lib/payment-reconciliation";
import { validatePromoCode, getPlanPrice, type PlanType, type PlanInterval } from "@/lib/promos";
import { getCanonicalAppOrigin } from "@/lib/app-url";

const PLAN_LABELS: Record<PlanType, string> = { LITE: "NotaKu LITE", PRO: "NotaKu PRO", BUSINESS: "NotaKu BUSINESS" };
const INTERVAL_META: Record<PlanInterval, { label: string; days: number }> = { MONTHLY: { label: "1 Bulan", days: 30 }, ANNUALLY: { label: "1 Tahun", days: 365 } };

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const attemptId = new URL(request.url).searchParams.get("attemptId");
  if (!attemptId) return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
  const attempt = await prisma.paymentAttempt.findFirst({ where: { id: attemptId, userId: session.user.id, purpose: "SUBSCRIPTION" }, select: { id: true } });
  if (!attempt) return NextResponse.json({ error: "Payment attempt not found" }, { status: 404 });
  try { return NextResponse.json(await reconcilePaymentAttempt(attempt.id)); }
  catch { return NextResponse.json({ error: "Payment status verification failed" }, { status: 502 }); }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkRateLimit(`payment:${session.user.id}`, 5, 60))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (!["LITE", "PRO", "BUSINESS"].includes(String(input.plan)) || !["MONTHLY", "ANNUALLY"].includes(String(input.interval))) {
    return NextResponse.json({ error: "Plan and interval are required" }, { status: 400 });
  }
  const plan = input.plan as PlanType;
  const interval = input.interval as PlanInterval;
  const promoCode = typeof input.promoCode === "string" && input.promoCode.trim() ? input.promoCode.trim().toUpperCase() : null;
  const analyticsId = (value: unknown, max: number) => typeof value === "string" && value.trim().length > 0 && value.length <= max && /^[A-Za-z0-9._-]+$/.test(value) ? value : null;
  const gaClientId = analyticsId(input.gaClientId, 128);
  const gaSessionId = analyticsId(input.gaSessionId, 128);
  if ((input.gaClientId != null && !gaClientId) || (input.gaSessionId != null && !gaSessionId)) return NextResponse.json({ error: "Invalid analytics identifiers" }, { status: 400 });
  let amount = getPlanPrice(plan, interval);
  if (promoCode) {
    const promo = await validatePromoCode(promoCode, amount);
    if (!promo.valid) return NextResponse.json({ error: promo.error }, { status: 400 });
    amount = promo.finalPrice;
  }

  try {
    const payer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, phone: true } });
    if (!payer?.email || !payer.phone) return NextResponse.json({ error: "Email dan nomor ponsel wajib dilengkapi sebelum pembayaran." }, { status: 400 });
    const checkout = await createOrReuseCheckout({
      purpose: "SUBSCRIPTION", userId: session.user.id, amount, plan, intervalDays: INTERVAL_META[interval].days, promoCode,
      name: `${PLAN_LABELS[plan]} - ${INTERVAL_META[interval].label}`,
      email: payer.email, mobile: payer.phone,
      description: `Pembelian Paket Langganan ${PLAN_LABELS[plan]}`,
      returnUrl: new URL("/billing", getCanonicalAppOrigin(process.env.NEXT_PUBLIC_APP_URL)).toString(), gaClientId, gaSessionId,
    });
    return NextResponse.json({ paymentUrl: checkout.paymentUrl, paymentId: checkout.paymentId, attemptId: checkout.attemptId, finalPrice: amount, plan, interval, promoCode });
  } catch (error) {
    if (error instanceof CheckoutConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Payment checkout creation failed");
    return NextResponse.json({ error: "Gagal membuat tautan pembayaran. Silakan coba lagi." }, { status: 502 });
  }
}
