import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createMayarPayment } from "@/lib/mayar";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePromoCode, BASE_PRO_PRICE } from "@/lib/promos";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`payment:${session.user.id}`, 5, 60))) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  let promoCode: string | null = null;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.promoCode && typeof body.promoCode === "string") {
      promoCode = body.promoCode.trim().toUpperCase();
    }
  } catch {
    // Body optional
  }

  let finalPrice = BASE_PRO_PRICE;
  let appliedPromoDescription = "";

  if (promoCode) {
    const promoCheck = await validatePromoCode(promoCode, BASE_PRO_PRICE);
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
  const orderId = `PRO-${user.id.slice(0, 8)}-${Date.now()}`;

  try {
    const { paymentUrl, paymentId } = await createMayarPayment({
      name: `NotaKu PRO - 1 Bulan${appliedPromoDescription}`,
      amount: finalPrice,
      customerName: user.name || "Pelanggan NotaKu",
      customerEmail: user.email,
      orderId,
    });

    // Simpan orderId & payment reference di subscription
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        midtransOrderId: paymentId || orderId,
        status: "INACTIVE",
      },
      update: {
        midtransOrderId: paymentId || orderId,
      },
    });

    return NextResponse.json({
      paymentUrl,
      paymentId: paymentId || orderId,
      finalPrice,
      promoCode,
    });
  } catch (err) {
    console.error("Error creating Mayar payment:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create payment link" },
      { status: 502 },
    );
  }
}
