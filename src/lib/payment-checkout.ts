import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createMayarPayment, getMayarConfig } from "@/lib/mayar";
import { decideExistingCheckout, runCheckoutCreation } from "@/lib/payment-checkout-control";
import { reconcilePaymentAttempt } from "@/lib/payment-reconciliation";

export type CheckoutSnapshot = {
  purpose: "SUBSCRIPTION" | "INVOICE";
  userId: string;
  invoiceId?: string;
  amount: number;
  plan?: "LITE" | "PRO" | "BUSINESS";
  intervalDays?: number;
  promoCode?: string | null;
  name: string;
  email: string;
  mobile: string;
  description: string;
  returnUrl: string;
  gaClientId?: string | null;
  gaSessionId?: string | null;
};

export class CheckoutConflictError extends Error {}

function activeKey(snapshot: CheckoutSnapshot, environment: string): string {
  return snapshot.purpose === "INVOICE"
    ? `${environment}:invoice:${snapshot.invoiceId}`
    : `${environment}:subscription:${snapshot.userId}:${snapshot.plan}:${snapshot.intervalDays}:${snapshot.promoCode ?? "-"}`;
}

export async function createOrReuseCheckout(snapshot: CheckoutSnapshot) {
  const config = getMayarConfig();
  const key = activeKey(snapshot, config.environment);
  const existing = snapshot.purpose === "SUBSCRIPTION"
    ? await prisma.paymentAttempt.findUnique({ where: { activeCheckoutKey: key } })
    : null;
  if (existing) {
    const decision = decideExistingCheckout(existing, snapshot);
    if (decision.kind === "reuse") {
      return { attemptId: existing.id, paymentUrl: existing.paymentUrl!, paymentId: existing.providerPaymentId, reused: true };
    }
    if (decision.kind === "reconcile") {
      const outcome = await reconcilePaymentAttempt(existing.id);
      if (outcome.state === "completed") {
        throw new CheckoutConflictError("Pembayaran sudah diterima.");
      }
      const refreshed = await prisma.paymentAttempt.findUnique({ where: { id: existing.id } });
      if (refreshed?.status === "PENDING" && refreshed.paymentUrl && refreshed.activeCheckoutKey === key) {
        return { attemptId: refreshed.id, paymentUrl: refreshed.paymentUrl, paymentId: refreshed.providerPaymentId, reused: true };
      }
      if (refreshed?.activeCheckoutKey) {
        throw new CheckoutConflictError("Status pembayaran belum final. Tautan baru tidak dibuat.");
      }
      return createOrReuseCheckout(snapshot);
    }
    if (decision.reason === "amount_changed") {
      throw new CheckoutConflictError("Nominal tagihan berubah. Selesaikan atau batalkan checkout sebelumnya sebelum membuat tautan baru.");
    }
    throw new CheckoutConflictError(existing.status === "MANUAL_REVIEW"
      ? "Pembayaran sedang ditinjau manual. Tautan baru tidak dibuat untuk mencegah pembayaran ganda."
      : existing.status === "CREATE_UNKNOWN"
        ? "Status pembuatan pembayaran belum pasti. Tunggu rekonsiliasi; tautan baru tidak dibuat."
        : "Pembuatan pembayaran sedang diproses.");
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const attemptId = randomUUID();
  const returnUrl = new URL(snapshot.returnUrl);
  returnUrl.searchParams.set("attemptId", attemptId);
  let attempt;
  let effectiveSnapshot = snapshot;
  try {
    attempt = await prisma.$transaction(async (tx) => {
      if (snapshot.purpose === "INVOICE") {
        if (!snapshot.invoiceId) {
          throw new CheckoutConflictError("Invoice tidak ditemukan.");
        }
        const locked = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM "Invoice" WHERE id = ${snapshot.invoiceId} FOR UPDATE
        `;
        if (!locked[0]) {
          throw new CheckoutConflictError("Invoice tidak ditemukan.");
        }
        const invoice = await tx.invoice.findUnique({
          where: { id: snapshot.invoiceId },
          include: {
            user: { select: { id: true, name: true, businessName: true } },
            customer: { select: { name: true, email: true, phone: true } },
          },
        });
        if (
          !invoice ||
          !["SENT", "OVERDUE"].includes(invoice.status) ||
          !invoice.enableDigitalPayment ||
          invoice.currency !== "IDR"
        ) {
          throw new CheckoutConflictError(
            "Invoice tidak lagi memenuhi syarat pembayaran digital.",
          );
        }
        const amount = Number(invoice.total);
        if (
          !Number.isSafeInteger(amount) ||
          amount <= 0 ||
          !invoice.customer.email ||
          !invoice.customer.phone
        ) {
          throw new CheckoutConflictError("Data pembayaran invoice tidak valid.");
        }
        effectiveSnapshot = {
          ...snapshot,
          userId: invoice.userId,
          amount,
          name: `Pembayaran ${invoice.number} - ${invoice.user.businessName || invoice.user.name}`,
          email: invoice.customer.email,
          mobile: invoice.customer.phone,
          description: `Tagihan Invoice ${invoice.number} kepada ${invoice.customer.name}`,
        };

        const activeCheckout = await tx.paymentAttempt.findUnique({
          where: { activeCheckoutKey: key },
        });
        if (activeCheckout) {
          const decision = decideExistingCheckout(activeCheckout, effectiveSnapshot);
          if (decision.kind === "reuse") {
            return { kind: "reuse" as const, attempt: activeCheckout };
          }
          if (decision.kind === "reconcile") {
            return { kind: "reconcile" as const, attempt: activeCheckout };
          }
          throw new CheckoutConflictError(
            decision.reason === "amount_changed"
              ? "Nominal tagihan berubah. Selesaikan atau batalkan checkout sebelumnya sebelum membuat tautan baru."
              : activeCheckout.status === "MANUAL_REVIEW"
                ? "Pembayaran sedang ditinjau manual. Tautan baru tidak dibuat untuk mencegah pembayaran ganda."
                : activeCheckout.status === "CREATE_UNKNOWN"
                  ? "Status pembuatan pembayaran belum pasti. Tunggu rekonsiliasi; tautan baru tidak dibuat."
                  : "Pembuatan pembayaran sedang diproses.",
          );
        }
      }

      let promoReservedAt: Date | undefined;
      if (snapshot.promoCode) {
        // Serialize reservations for one code while retaining historical audit counts.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`promo:${snapshot.promoCode}`}))`;
        const latest = await tx.auditLog.findFirst({
          where: { event: "admin.promo_saved", detail: { path: ["code"], equals: snapshot.promoCode } },
          orderBy: { createdAt: "desc" },
        });
        const promo = latest?.detail as Record<string, unknown> | null;
        const maxUses = Number(promo?.maxUses ?? 0);
        if (!promo || promo.isActive === false) throw new CheckoutConflictError("Kode voucher tidak aktif.");
        if (maxUses > 0) {
          const [historicalUsage, activeReservations] = await Promise.all([
            tx.auditLog.count({ where: { event: "payment.mayar_settlement", detail: { path: ["promoCode"], equals: snapshot.promoCode } } }),
            tx.paymentAttempt.count({ where: { promoCode: snapshot.promoCode, promoReservedAt: { not: null }, promoConsumedAt: null, activeCheckoutKey: { not: null } } }),
          ]);
          if (historicalUsage + activeReservations >= maxUses) throw new CheckoutConflictError("Kuota penggunaan kode voucher telah habis atau sedang direservasi.");
        }
        promoReservedAt = new Date();
      }
      const created = await tx.paymentAttempt.create({
        data: {
          id: attemptId,
          environment: config.environment,
          merchantIdSnapshot: config.merchantId,
          gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-52C2DD26LB",
          gaClientId: effectiveSnapshot.gaClientId,
          gaSessionId: effectiveSnapshot.gaSessionId,
          purpose: effectiveSnapshot.purpose,
          userId: effectiveSnapshot.userId,
          invoiceId: effectiveSnapshot.invoiceId,
          amount: effectiveSnapshot.amount,
          currency: "IDR",
          plan: effectiveSnapshot.plan,
          intervalDays: effectiveSnapshot.intervalDays,
          promoCode: effectiveSnapshot.promoCode,
          promoReservedAt,
          returnUrl: returnUrl.toString(),
          expiresAt,
          activeCheckoutKey: key,
        },
      });
      return { kind: "created" as const, attempt: created };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new CheckoutConflictError("Checkout lain untuk pembelian ini sedang aktif.");
    }
    throw error;
  }

  if (attempt.kind === "reuse") {
    return {
      attemptId: attempt.attempt.id,
      paymentUrl: attempt.attempt.paymentUrl!,
      paymentId: attempt.attempt.providerPaymentId,
      reused: true,
    };
  }
  if (attempt.kind === "reconcile") {
    const outcome = await reconcilePaymentAttempt(attempt.attempt.id);
    if (outcome.state === "completed") {
      throw new CheckoutConflictError("Pembayaran sudah diterima.");
    }
    const refreshed = await prisma.paymentAttempt.findUnique({
      where: { id: attempt.attempt.id },
    });
    if (
      refreshed?.status === "PENDING" &&
      refreshed.paymentUrl &&
      refreshed.activeCheckoutKey === key
    ) {
      return {
        attemptId: refreshed.id,
        paymentUrl: refreshed.paymentUrl,
        paymentId: refreshed.providerPaymentId,
        reused: true,
      };
    }
    if (refreshed?.activeCheckoutKey) {
      throw new CheckoutConflictError(
        "Status pembayaran belum final. Tautan baru tidak dibuat.",
      );
    }
    return createOrReuseCheckout(snapshot);
  }

  const createdAttempt = attempt.attempt;
  const payment = await runCheckoutCreation({
    attempt: createdAttempt,
    activeCheckoutKey: key,
    createProviderPayment: () => createMayarPayment(config, {
      name: effectiveSnapshot.name,
      amount: effectiveSnapshot.amount,
      email: effectiveSnapshot.email,
      mobile: effectiveSnapshot.mobile,
      description: effectiveSnapshot.description,
      redirectUrl: returnUrl.toString(),
      expiredAt: expiresAt.toISOString(),
      extraData: { attemptId: createdAttempt.id, purpose: effectiveSnapshot.purpose },
    }),
    persistProviderSuccess: async (created) => {
      await prisma.paymentAttempt.update({
        where: { id: createdAttempt.id },
        data: {
          status: "PENDING",
          providerPaymentId: created.id,
          providerTransactionId: created.transactionId,
          paymentUrl: created.link,
        },
      });
    },
    persistFailure: async (failure) => {
      await prisma.$transaction(async (tx) => {
        await tx.paymentAttempt.update({
          where: { id: createdAttempt.id },
          data: failure,
        });
        if (failure.status !== "MANUAL_REVIEW") return;

        const reviewPayload = {
          attemptId: createdAttempt.id,
          purpose: effectiveSnapshot.purpose,
          userId: effectiveSnapshot.userId,
          invoiceId: effectiveSnapshot.invoiceId ?? null,
          amount: effectiveSnapshot.amount,
          currency: "IDR",
          environment: config.environment,
          errorCode: failure.errorCode,
          errorMessage: failure.errorMessage,
        };
        await tx.auditLog.create({
          data: {
            userId: effectiveSnapshot.userId,
            event: "payment.checkout_manual_review",
            detail: reviewPayload,
          },
        });
        await tx.paymentOutbox.create({
          data: {
            attemptId: createdAttempt.id,
            userId: effectiveSnapshot.userId,
            kind: "ADMIN_PAYMENT_MANUAL_REVIEW",
            payload: reviewPayload,
            idempotencyKey: `${createdAttempt.id}:manual-review-alert`,
          },
        });
      });
    },
  });
  return { attemptId: createdAttempt.id, paymentUrl: payment.link, paymentId: payment.id, reused: false };
}
