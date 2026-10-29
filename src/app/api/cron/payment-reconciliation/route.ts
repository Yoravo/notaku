import crypto from "crypto";
import { NextResponse } from "next/server";
import { processPaymentOutbox } from "@/lib/payment-outbox";
import { reconcileOutstandingPayments } from "@/lib/payment-reconciliation";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reconciliation = await reconcileOutstandingPayments();
  const outbox = await processPaymentOutbox();
  return NextResponse.json({ reconciliation, outbox });
}
