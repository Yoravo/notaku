import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  // Verify cron secret (prevent unauthorized calls)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[CRON_ERROR] CRON_SECRET is not configured on server.");
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const expectedHeader = `Bearer ${cronSecret}`;

  // Timing-safe comparison to prevent timing attacks
  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  if (
    authBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(authBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find expired subscriptions
  const expired = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { lt: now },
    },
  });

  // Downgrade each expired user
  for (const sub of expired) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "INACTIVE" },
      }),
      prisma.user.update({
        where: { id: sub.userId },
        data: { plan: "FREE" },
      }),
    ]);
  }

  return NextResponse.json({ downgraded: expired.length });
}
