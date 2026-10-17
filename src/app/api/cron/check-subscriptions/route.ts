import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/audit-log";
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
    // Sengaja tidak ditulis ke DB: request tanpa token bisa dibanjiri dan memenuhi tabel audit.
    console.warn("[CRON_UNAUTHORIZED] check-subscriptions");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startedAt = Date.now();

  try {
    // Satu transaksi atomik. Kondisi expiry diulang di dalam klaim (updateManyAndReturn),
    // jadi langganan yang diperpanjang webhook di antara read dan write tidak ikut di-downgrade.
    // `not: null` eksplisit: PERMANENT (currentPeriodEnd null) tidak boleh pernah tersentuh.
    const downgraded = await prisma.$transaction(async (tx) => {
      const claimed = await tx.subscription.updateManyAndReturn({
        where: {
          status: "ACTIVE",
          currentPeriodEnd: { not: null, lt: now },
        },
        data: { status: "INACTIVE" },
        select: { id: true, userId: true, plan: true, currentPeriodEnd: true },
      });

      if (claimed.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: claimed.map((s) => s.userId) } },
          data: { plan: "FREE" },
        });
      }

      return claimed;
    });

    // Audit per user agar riwayat akun di /admin/users/[id] menampilkan alasan downgrade.
    await Promise.all(
      downgraded.map((sub) =>
        auditLog(
          "subscription.expired_downgrade",
          {
            subscriptionId: sub.id,
            oldPlan: sub.plan,
            newPlan: "FREE",
            expiredAt: sub.currentPeriodEnd?.toISOString() ?? null,
            source: "cron.check-subscriptions",
          },
          { userId: sub.userId },
        ),
      ),
    );

    // Di-await: promise yang tidak ditunggu bisa terpotong saat function serverless selesai.
    await auditLog("system.cron_check_subscriptions", {
      status: "success",
      downgraded: downgraded.length,
      durationMs: Date.now() - startedAt,
      ranAt: now.toISOString(),
    });

    return NextResponse.json({ downgraded: downgraded.length });
  } catch (error) {
    console.error("[CRON_CHECK_SUBSCRIPTIONS_ERROR]", error);
    await auditLog("system.cron_check_subscriptions", {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
      ranAt: now.toISOString(),
    });
    return NextResponse.json({ error: "Cron run failed" }, { status: 500 });
  }
}
