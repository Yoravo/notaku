import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getMayarConfig, getMayarTransaction } from "@/lib/mayar";
import { validateVerifiedTransaction } from "@/lib/payment-verification";
import { applyNonPaidProviderObservation } from "@/lib/payment-reconciliation-control";
import { hasProFeatures } from "@/lib/plan-limits";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/referral";

export type ReconciliationOutcome =
  | { state: "completed"; purpose: "INVOICE" | "SUBSCRIPTION"; attemptId: string; invoiceId: string | null; userId: string; alreadyCompleted: boolean }
  | { state: "pending" | "rejected" | "busy"; attemptId: string; reason: string };

export async function reconcileOutstandingPayments(limit = 50): Promise<{ examined: number; completed: number; failed: number }> {
  const attempts = await prisma.paymentAttempt.findMany({
    where: {
      providerTransactionId: { not: null },
      status: { in: ["PENDING", "CREATE_UNKNOWN", "PAID"] },
    },
    orderBy: [{ lastReconciledAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: { id: true },
  });
  let completed = 0;
  let failed = 0;
  for (const attempt of attempts) {
    try {
      const outcome = await reconcilePaymentAttempt(attempt.id);
      if (outcome.state === "completed") completed++;
    } catch {
      failed++;
    }
  }
  return { examined: attempts.length, completed, failed };
}

export async function reconcilePaymentAttempt(attemptId: string): Promise<ReconciliationOutcome> {
  const config = getMayarConfig();
  const attempt = await prisma.paymentAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error("Payment attempt not found");
  if (attempt.status === "COMPLETED") {
    return { state: "completed", purpose: attempt.purpose, attemptId, invoiceId: attempt.invoiceId, userId: attempt.userId, alreadyCompleted: true };
  }
  if (!attempt.providerTransactionId) return { state: "pending", attemptId, reason: "provider_transaction_unknown" };

  const snapshotConfig = {
    ...config,
    environment: attempt.environment,
    merchantId: attempt.merchantIdSnapshot,
    baseUrl: attempt.environment === "PRODUCTION" ? "https://api.mayar.id/hl/v2" : "https://api.mayar.io/hl/v2",
  };
  const transaction = await getMayarTransaction(snapshotConfig, attempt.providerTransactionId);
  const verification = validateVerifiedTransaction(attempt, transaction, {
    environment: attempt.environment,
    merchantId: attempt.merchantIdSnapshot,
  });
  if (!verification.ok) {
    if (verification.reason === "transaction_not_paid") {
      const observation = await applyNonPaidProviderObservation(attempt.id, transaction.status, async ({ status, releaseKey }) => {
        await prisma.paymentAttempt.updateMany({
          where: { id: attempt.id, status: { not: "COMPLETED" } },
          data: { ...(status ? { status } : {}), ...(releaseKey ? { activeCheckoutKey: null } : {}), reconcileAttempts: { increment: 1 }, lastReconciledAt: new Date() },
        });
      });
      return { ...observation, attemptId };
    }
    await prisma.paymentAttempt.updateMany({
      where: { id: attempt.id, status: { not: "COMPLETED" } },
      data: { errorCode: "VERIFY", errorMessage: verification.reason, reconcileAttempts: { increment: 1 }, lastReconciledAt: new Date() },
    });
    return { state: "rejected", attemptId, reason: verification.reason };
  }

  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status::text FROM payment_attempt WHERE id = ${attempt.id} FOR UPDATE
    `;
    if (!locked[0]) throw new Error("Payment attempt disappeared");
    if (locked[0].status === "COMPLETED") {
      return { state: "completed", purpose: attempt.purpose, attemptId, invoiceId: attempt.invoiceId, userId: attempt.userId, alreadyCompleted: true } as const;
    }

    if (attempt.purpose === "INVOICE") {
      if (!attempt.invoiceId) throw new Error("Invoice payment attempt has no invoice");
      const rows = await tx.$queryRaw<Array<{ id: string; status: string; currency: string; total: unknown; userId: string; number: string; publicId: string; customerId: string }>>`
        SELECT id, status::text, currency, total, "userId", number, "publicId", "customerId" FROM "Invoice" WHERE id = ${attempt.invoiceId} FOR UPDATE
      `;
      const invoice = rows[0];
      const invoiceTotal = invoice ? new Prisma.Decimal(String(invoice.total)) : null;
      if (!invoice || !invoiceTotal || !["SENT", "OVERDUE"].includes(invoice.status) || invoice.currency !== "IDR" || !invoiceTotal.equals(attempt.amount)) {
        throw new Error("Invoice is no longer eligible for digital settlement");
      }
      const gross = Number(attempt.amount);
      const fee = Math.round(gross * 0.007);
      const net = Math.max(0, gross - fee);
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: "PAID", paidAt: new Date(), paymentMethod: "NOTAKU_DIGITAL" } });
      await tx.user.update({ where: { id: invoice.userId }, data: { balance: { increment: net } } });
      await tx.transaction.create({ data: { userId: invoice.userId, invoiceId: invoice.id, type: "INVOICE_PAYMENT", amount: net, grossAmount: gross, feeAmount: fee, description: `Pembayaran ${invoice.number} via Mayar`, referenceId: attempt.providerTransactionId } });
      const customer = await tx.customer.findUnique({ where: { id: invoice.customerId }, select: { id: true, name: true, email: true } });
      const paidAt = new Date().toISOString();
      const payload = { id: invoice.id, publicId: invoice.publicId, number: invoice.number, status: "PAID", total: gross, currency: invoice.currency, customer, paidAt, paymentMethod: "NOTAKU_DIGITAL" };
      await tx.paymentOutbox.createMany({ data: [
        { attemptId: attempt.id, userId: invoice.userId, kind: "CUSTOM_WEBHOOK_INVOICE_PAID", payload, idempotencyKey: `${attempt.id}:custom-webhook` },
        { attemptId: attempt.id, userId: invoice.userId, kind: "SELLER_INVOICE_PAID", payload: { ...payload, customerName: customer?.name ?? "Pelanggan" }, idempotencyKey: `${attempt.id}:seller-notification` },
      ], skipDuplicates: true });
    } else {
      await tx.$queryRaw`SELECT id FROM "user" WHERE id = ${attempt.userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: attempt.userId } });
      if (!user || !attempt.plan || !attempt.intervalDays || attempt.intervalDays <= 0) throw new Error("Invalid subscription snapshot");
      const subscription = await tx.subscription.findUnique({ where: { userId: user.id } });
      const permanent = subscription?.status === "ACTIVE" && subscription.currentPeriodEnd === null;
      const base = subscription?.currentPeriodEnd && subscription.currentPeriodEnd > new Date() ? subscription.currentPeriodEnd : new Date();
      const periodEnd = permanent ? null : new Date(base.getTime() + attempt.intervalDays * 86_400_000);
      await tx.subscription.upsert({
        where: { userId: user.id },
        create: { userId: user.id, status: "ACTIVE", plan: attempt.plan, intervalDays: attempt.intervalDays, currentPeriodEnd: periodEnd, upgradeEventAt: new Date() },
        update: { status: "ACTIVE", plan: attempt.plan, intervalDays: attempt.intervalDays, currentPeriodEnd: periodEnd, ...(!subscription?.upgradeEventAt ? { upgradeEventAt: new Date() } : {}) },
      });
      await tx.user.update({ where: { id: user.id }, data: { plan: attempt.plan } });
      const adminPayload = { userId: user.id, userEmail: user.email, userName: user.name, plan: attempt.plan, amount: Number(attempt.amount), intervalDays: attempt.intervalDays, paymentId: attempt.providerPaymentId };
      await tx.paymentOutbox.create({ data: { attemptId: attempt.id, userId: user.id, kind: "ADMIN_NEW_SUBSCRIPTION", payload: adminPayload, idempotencyKey: `${attempt.id}:admin-notification` } });
      if (!subscription?.upgradeEventAt && attempt.gaClientId) {
        await tx.paymentOutbox.create({ data: { attemptId: attempt.id, userId: user.id, kind: "GA_UPGRADE_TO_PAID", payload: { ...adminPayload, gaMeasurementId: attempt.gaMeasurementId, gaClientId: attempt.gaClientId, gaSessionId: attempt.gaSessionId }, idempotencyKey: `${attempt.id}:ga-upgrade` } });
      }

      if (user.referredById && user.emailVerified && hasProFeatures(attempt.plan)) {
        const reward = await tx.referralReward.findFirst({ where: { referredUserId: user.id, status: "COMPLETED" } });
        if (!reward) {
          await tx.$queryRaw`SELECT id FROM "user" WHERE id = ${user.referredById} FOR UPDATE`;
          await tx.user.update({ where: { id: user.referredById }, data: { balance: { increment: REFERRAL_BONUS_AMOUNT } } });
          await tx.transaction.create({ data: { userId: user.referredById, type: "REFERRAL_REWARD", amount: REFERRAL_BONUS_AMOUNT, grossAmount: REFERRAL_BONUS_AMOUNT, feeAmount: 0, description: `Bonus referral upgrade ${attempt.plan}`, referenceId: `REF-${user.id.slice(0, 8)}` } });
          await tx.referralReward.create({ data: { referrerId: user.referredById, referredUserId: user.id, amount: REFERRAL_BONUS_AMOUNT, status: "COMPLETED", notes: `Upgrade ${attempt.plan}` } });
        }
      }
    }

    await tx.auditLog.create({
      data: {
        userId: attempt.userId,
        event: attempt.purpose === "INVOICE" ? "payment.invoice_digital_settled" : "payment.mayar_settlement",
        detail: {
          attemptId: attempt.id,
          transactionId: attempt.providerTransactionId,
          amount: Number(attempt.amount),
          currency: attempt.currency,
          purpose: attempt.purpose,
          invoiceId: attempt.invoiceId,
          plan: attempt.plan,
          promoCode: attempt.promoCode,
        },
      },
    });
    await tx.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "COMPLETED", completedAt: new Date(), activeCheckoutKey: null, promoConsumedAt: attempt.promoCode ? new Date() : null, errorCode: null, errorMessage: null } });
    return { state: "completed", purpose: attempt.purpose, attemptId, invoiceId: attempt.invoiceId, userId: attempt.userId, alreadyCompleted: false } as const;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
