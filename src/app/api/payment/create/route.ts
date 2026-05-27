import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSnapToken } from "@/lib/midtrans";

const PRO_PRICE = 49000;

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const orderId = `NOTAKU-PRO-${user.id}-${Date.now()}`;

  const token = await createSnapToken({
    orderId,
    amount: PRO_PRICE,
    customerName: user.name,
    customerEmail: user.email,
  });

  // Store orderId in subscription for later verification
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

  return NextResponse.json({
    token,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
  });
}
