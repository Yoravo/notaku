import { prisma } from "@/lib/prisma";
import { dispatchWebhook } from "@/lib/webhook-dispatcher";
import { notifySellerInvoicePaid } from "@/lib/bot-notifications";
import { notifyAdminNewSubscription, notifyAdminPaymentManualReview } from "@/lib/admin-notifications";

type Payload = Record<string, unknown>;

async function deliver(kind: string, userId: string, payload: Payload, idempotencyKey: string): Promise<void> {
  if (kind === "CUSTOM_WEBHOOK_INVOICE_PAID") {
    await dispatchWebhook(userId, "invoice.paid", payload, { throwOnFailure: true, eventId: `evt_${idempotencyKey}` });
    return;
  }
  if (kind === "SELLER_INVOICE_PAID") {
    await notifySellerInvoicePaid(userId, payload as Parameters<typeof notifySellerInvoicePaid>[1], { throwOnFailure: true });
    return;
  }
  if (kind === "ADMIN_NEW_SUBSCRIPTION") {
    await notifyAdminNewSubscription(payload as Parameters<typeof notifyAdminNewSubscription>[0], { throwOnFailure: true });
    return;
  }
  if (kind === "ADMIN_PAYMENT_MANUAL_REVIEW") {
    await notifyAdminPaymentManualReview(payload as Parameters<typeof notifyAdminPaymentManualReview>[0], { throwOnFailure: true });
    return;
  }
  if (kind === "GA_UPGRADE_TO_PAID") {
    const apiSecret = process.env.GA4_API_SECRET;
    if (!apiSecret) throw new Error("GA4_API_SECRET is not configured");
    const measurementId = String(payload.gaMeasurementId || "");
    const clientId = String(payload.gaClientId || "");
    if (!measurementId || !clientId) throw new Error("GA snapshot is incomplete");
    const params: Record<string, unknown> = {
      transaction_id: String(payload.paymentId || payload.userId), value: Number(payload.amount), currency: "IDR",
      items: [{ item_id: `notaku_${String(payload.plan).toLowerCase()}_${Number(payload.intervalDays) >= 365 ? "annual" : "monthly"}`, item_name: `NotaKu ${payload.plan}`, price: Number(payload.amount), quantity: 1 }],
    };
    if (payload.gaSessionId) params.session_id = payload.gaSessionId;
    const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, user_id: payload.userId, events: [{ name: "upgrade_to_paid", params }] }),
    });
    if (!response.ok) throw new Error(`GA4 delivery failed with HTTP ${response.status}`);
    return;
  }
  throw new Error(`Unknown payment outbox kind: ${kind}`);
}

export async function processPaymentOutbox(limit = 25): Promise<{ delivered: number; failed: number }> {
  const now = new Date();
  const stale = new Date(now.getTime() - 10 * 60_000);
  const jobs = await prisma.paymentOutbox.findMany({
    where: { deliveredAt: null, availableAt: { lte: now }, OR: [{ processingAt: null }, { processingAt: { lt: stale } }] },
    orderBy: { createdAt: "asc" }, take: limit,
  });
  let deliveredCount = 0;
  let failed = 0;
  for (const job of jobs) {
    const claim = await prisma.paymentOutbox.updateMany({ where: { id: job.id, deliveredAt: null, OR: [{ processingAt: null }, { processingAt: { lt: stale } }] }, data: { processingAt: now, attempts: { increment: 1 } } });
    if (claim.count !== 1) continue;
    try {
      await deliver(job.kind, job.userId, job.payload as Payload, job.idempotencyKey);
      await prisma.paymentOutbox.update({ where: { id: job.id }, data: { deliveredAt: new Date(), processingAt: null, lastError: null } });
      deliveredCount++;
    } catch (error) {
      failed++;
      const delayMinutes = Math.min(24 * 60, 2 ** Math.min(job.attempts + 1, 10));
      await prisma.paymentOutbox.update({ where: { id: job.id }, data: { processingAt: null, availableAt: new Date(Date.now() + delayMinutes * 60_000), lastError: (error instanceof Error ? error.message : "Unknown delivery error").slice(0, 500) } });
    }
  }
  return { delivered: deliveredCount, failed };
}
