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

  if (!(await checkRateLimit(`payment:${session.user.id}`))) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 },
    );
  }

  const user = session.user;
  const orderId = `PRO-${user.id.slice(0, 8)}-${Date.now()}`;

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
