import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/audit-log";
import crypto from "crypto";

export async function GET() {
  return new Response("Mayar Webhook Endpoint Active", { status: 200 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const tokenHeader =
      request.headers.get("x-mayar-token") ||
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.headers.get("webhook-token");

    const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN;

    // Verifikasi Webhook Token jika dikonfigurasi
    if (expectedToken && tokenHeader) {
      const a = Buffer.from(tokenHeader);
      const b = Buffer.from(expectedToken);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        auditLog("payment.webhook_unauthorized", { tokenReceived: tokenHeader });
        return NextResponse.json({ error: "Unauthorized token" }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Payload Mayar: { event: "payment.received" | "payment.settled" | "payment.success", data: { ... } }
    const event = payload.event || payload.status;
    const data = payload.data || payload;

    const customerEmail =
      data.customerEmail ||
      data.customer?.email ||
      data.customer_email ||
      data.email;
    const paymentId = data.id || data.paymentId || data.transactionId;
    const status = data.status || event;
    const amount = Number(data.amount || 0);

    const isSuccess =
      event === "payment.received" ||
      event === "payment.settled" ||
      event === "payment.success" ||
      event === "transaction.success" ||
      status === "PAID" ||
      status === "SETTLED" ||
      status === "SUCCESS";

    if (isSuccess) {
      let user = null;

      // Cari user berdasarkan subscription payment ID atau email
      if (paymentId) {
        const sub = await prisma.subscription.findFirst({
          where: { midtransOrderId: String(paymentId) },
          include: { user: true },
        });
        if (sub?.user) {
          user = sub.user;
        }
      }

      if (!user && customerEmail) {
        user = await prisma.user.findUnique({
          where: { email: customerEmail.toLowerCase().trim() },
        });
      }

      if (!user) {
        auditLog("payment.user_not_found", { paymentId, customerEmail, amount });
        return NextResponse.json({ message: "User not found for this transaction" });
      }

      // Upgrade / perpanjang masa aktif PRO 30 hari
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      const baseDate =
        existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > new Date()
          ? existingSub.currentPeriodEnd
          : new Date();

      const newPeriodEnd = new Date(baseDate);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);

      await prisma.$transaction([
        prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            midtransOrderId: String(paymentId || `MAYAR-${Date.now()}`),
            status: "ACTIVE",
            currentPeriodEnd: newPeriodEnd,
          },
          update: {
            status: "ACTIVE",
            currentPeriodEnd: newPeriodEnd,
            midtransOrderId: String(paymentId || existingSub?.midtransOrderId),
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { plan: "PRO" },
        }),
      ]);

      auditLog("payment.mayar_settlement", {
        userId: user.id,
        email: user.email,
        paymentId,
        amount,
        periodEnd: newPeriodEnd.toISOString(),
      });

      return NextResponse.json({ message: "Success: User upgraded to PRO" });
    }

    return NextResponse.json({ message: `Ignored event: ${event || status}` });
  } catch (err) {
    console.error("Mayar webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
