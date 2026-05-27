import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret (prevent unauthorized calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
