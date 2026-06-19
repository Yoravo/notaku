import { prisma } from "@/lib/prisma";
import { verifySignature } from "@/lib/midtrans";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/audit-log";

export async function GET() {
  return new Response("OK", { status: 200 })
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = body;

  const isValid = verifySignature({
    orderId: order_id,
    statusCode: status_code,
    grossAmount: gross_amount,
    signatureKey: signature_key,
  });
  if (!isValid) {
    auditLog("payment.signature_invalid", { orderId: order_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { midtransOrderId: order_id },
  });
  if (!subscription) {
    auditLog("payment.subscription_not_found", { orderId: order_id });
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  if (
    subscription.status === "ACTIVE" &&
    subscription.midtransOrderId === order_id
  ) {
    auditLog("payment.already_processed", { orderId: order_id });
    return NextResponse.json({ message: "Already processed" });
  }

  const isSettlement =
    transaction_status === "settlement" || transaction_status === "capture";
  const isFraudOk = fraud_status === "accept" || !fraud_status;

  if (isSettlement && isFraudOk) {
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", currentPeriodEnd },
      }),
      prisma.user.update({
        where: { id: subscription.userId },
        data: { plan: "PRO" },
      }),
    ]);

    auditLog("payment.settlement", {
      orderId: order_id,
      userId: subscription.userId,
      transactionStatus: transaction_status,
    });
  } else if (["expire", "cancel", "deny"].includes(transaction_status)) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "INACTIVE" },
    });

    auditLog("payment.failed", {
      orderId: order_id,
      userId: subscription.userId,
      transactionStatus: transaction_status,
    });
  }

  return NextResponse.json({ message: "OK" });
}
