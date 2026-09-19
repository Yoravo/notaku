import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createMayarPayment } from "@/lib/mayar";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  validatePromoCode,
  getPlanPrice,
  type PlanType,
  type PlanInterval,
} from "@/lib/promos";

// Label paket & durasi aktif untuk deskripsi checkout dan periode langganan.
const PLAN_LABELS: Record<PlanType, string> = {
  PRO: "NotaKu PRO",
  BUSINESS: "NotaKu BUSINESS",
};
const INTERVAL_META: Record<PlanInterval, { label: string; days: number }> = {
  MONTHLY: { label: "1 Bulan", days: 30 },
  ANNUALLY: { label: "1 Tahun", days: 365 },
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // OWASP A04 (Rate limiting): batasi pembuatan link pembayaran per user.
  if (!(await checkRateLimit(`payment:${session.user.id}`, 5, 60))) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  let promoCode: string | null = null;
  let gaClientId: string | null = null;
  let gaSessionId: string | null = null;
  // OWASP A03 (Injection) & A08: plan/interval WAJIB divalidasi ke whitelist enum ketat.
  let plan: PlanType = "PRO";
  let interval: PlanInterval = "MONTHLY";
  try {
    const body = await request.json().catch(() => ({}));
    if (body.promoCode && typeof body.promoCode === "string") {
      promoCode = body.promoCode.trim().toUpperCase();
    }
    if (body.plan === "BUSINESS" || body.plan === "PRO") {
      plan = body.plan;
    }
    if (body.interval === "ANNUALLY" || body.interval === "MONTHLY") {
      interval = body.interval;
    }
    if (typeof body.gaClientId === "string" && /^\d{1,20}\.\d{1,20}$/.test(body.gaClientId)) {
      gaClientId = body.gaClientId;
    }
    if (gaClientId && typeof body.gaSessionId === "string" && /^[1-9]\d{0,15}$/.test(body.gaSessionId)
      && Number.isSafeInteger(Number(body.gaSessionId))) {
      gaSessionId = body.gaSessionId;
    }
  } catch {
    // Body optional
  }

  // OWASP A04 (Insecure Design): harga DIKUNCI di server, tidak pernah menerima nominal dari client.
  const basePrice = getPlanPrice(plan, interval);
  let finalPrice = basePrice;
  let appliedPromoDescription = "";

  if (promoCode) {
    // Promo divalidasi ulang di server terhadap base price server-side (bukan client).
    const promoCheck = await validatePromoCode(promoCode, basePrice);
    if (!promoCheck.valid) {
      return NextResponse.json(
        { error: promoCheck.error },
        { status: 400 }
      );
    }
    finalPrice = promoCheck.finalPrice;
    appliedPromoDescription = ` (Diskon Voucher: ${promoCheck.code})`;
  }

  const user = session.user;
  const intervalDays = INTERVAL_META[interval].days;
  const orderId = `${plan}-${user.id.slice(0, 8)}-${Date.now()}`;

  try {
    const { paymentUrl, paymentId } = await createMayarPayment({
      name: `${PLAN_LABELS[plan]} - ${INTERVAL_META[interval].label}${appliedPromoDescription}`,
      amount: finalPrice,
      customerName: user.name || "Pelanggan NotaKu",
      customerEmail: user.email,
      orderId,
    });

    // Simpan orderId, tier, & durasi di subscription untuk aktivasi tier yang benar saat settlement.
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        midtransOrderId: paymentId || orderId,
        status: "INACTIVE",
        plan,
        intervalDays,
        gaClientId: gaClientId || null,
        gaSessionId: gaSessionId || null,
      },
      update: {
        midtransOrderId: paymentId || orderId,
        plan,
        intervalDays,
        gaClientId,
        gaSessionId,
      },
    });

    return NextResponse.json({
      paymentUrl,
      paymentId: paymentId || orderId,
      finalPrice,
      plan,
      interval,
      promoCode,
    });
  } catch (err) {
    // OWASP A09: log detail di server, jangan bocorkan pesan error internal mentah ke client.
    console.error("Error creating Mayar payment:", err);
    return NextResponse.json(
      { error: "Gagal membuat tautan pembayaran. Silakan coba lagi." },
      { status: 502 },
    );
  }
}
