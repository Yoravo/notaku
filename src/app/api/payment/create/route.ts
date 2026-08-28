import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createMayarPayment } from "@/lib/mayar";
import { checkRateLimit } from "@/lib/rate-limit";

const PRO_PRICE = 49000;

export async function POST() {
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

  const user = session.user;
  const orderId = `PRO-${user.id.slice(0, 8)}-${Date.now()}`;

  // Error Handling for Mayar API call
  try {
    const { paymentUrl, paymentId } = await createMayarPayment({
      name: "NotaKu PRO - 1 Bulan",
      amount: PRO_PRICE,
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
    });
  } catch (err) {
    console.error("Error creating Mayar payment:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create payment link" },
      { status: 502 },
    );
  }
}
