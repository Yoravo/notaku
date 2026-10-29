import crypto from "crypto";
import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processPaymentOutbox } from "@/lib/payment-outbox";
import { webhookCandidateReferences } from "@/lib/payment-verification";
import { reconcilePaymentAttempt } from "@/lib/payment-reconciliation";

function authorized(request: Request): boolean {
  const expected = process.env.MAYAR_WEBHOOK_TOKEN;
  const supplied = request.headers.get("x-mayar-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.headers.get("webhook-token");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected); const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET() { return new Response("Mayar Webhook Endpoint Active", { status: 200 }); }

export async function POST(request: Request) {
  if (!process.env.MAYAR_WEBHOOK_TOKEN) return NextResponse.json({ error: "Webhook verification unavailable" }, { status: 503 });
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  const refs = webhookCandidateReferences(payload);
  if (!refs.paymentIds.length && !refs.transactionIds.length) return NextResponse.json({ message: "Accepted without a verifiable payment reference" }, { status: 202 });
  const candidates = await prisma.paymentAttempt.findMany({
    where: { OR: [...refs.paymentIds.map((id) => ({ providerPaymentId: id })), ...refs.transactionIds.map((id) => ({ providerTransactionId: id }))] },
    select: { id: true }, take: 5,
  });
  if (!candidates.length) return NextResponse.json({ message: "Unknown payment reference ignored" }, { status: 202 });
  const outcomes = [];
  for (const candidate of candidates) outcomes.push(await reconcilePaymentAttempt(candidate.id));
  after(async () => {
    try {
      await processPaymentOutbox();
    } catch (error) {
      console.error("Payment outbox post-webhook processing failed:", error);
    }
  });
  return NextResponse.json({ message: "Reconciliation complete", outcomes });
}
