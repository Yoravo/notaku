import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSnapToken } from "@/lib/midtrans";
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

  // Save the orderId before calling Midtrans API
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      midtransOrderId: orderId,
      status: "INACTIVE",
    },
    update: {
      midtransOrderId: orderId,
    },
  });

  // Error Handling for Midtrans API call
  try {
    const token = await createSnapToken({
      orderId,
      amount: PRO_PRICE,
      customerName: user.name || "Pelanggan NotaKu",
      customerEmail: user.email,
    });

    return NextResponse.json({
      token,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });
  } catch (err) {
    console.error("Error creating Midtrans snap token:", err);
    return NextResponse.json(
      { error: "Failed to create payment token" },
      { status: 502 },
    );
  }
}