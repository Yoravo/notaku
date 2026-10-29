export type PaymentEnvironment = "SANDBOX" | "PRODUCTION";

export type StoredPaymentReference = {
  environment: PaymentEnvironment;
  amount: number | { toString(): string };
  currency: string;
  providerPaymentId: string | null;
  providerTransactionId: string | null;
};

export type VerifiedMayarTransaction = {
  id: string;
  status: string;
  amount: number;
  paymentLink?: { id?: string | null } | null;
  user?: { id?: string | null } | null;
};

type VerificationConfig = {
  environment: PaymentEnvironment;
  merchantId: string;
};

export type VerificationResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "environment_mismatch"
        | "transaction_mismatch"
        | "payment_link_mismatch"
        | "transaction_not_paid"
        | "amount_mismatch"
        | "currency_not_supported"
        | "merchant_mismatch";
    };

export function validateVerifiedTransaction(
  attempt: StoredPaymentReference,
  transaction: VerifiedMayarTransaction,
  config: VerificationConfig,
): VerificationResult {
  if (attempt.environment !== config.environment) {
    return { ok: false, reason: "environment_mismatch" };
  }
  if (!attempt.providerTransactionId || transaction.id !== attempt.providerTransactionId) {
    return { ok: false, reason: "transaction_mismatch" };
  }
  if (!attempt.providerPaymentId || transaction.paymentLink?.id !== attempt.providerPaymentId) {
    return { ok: false, reason: "payment_link_mismatch" };
  }
  if (transaction.status !== "paid") {
    return { ok: false, reason: "transaction_not_paid" };
  }
  if (attempt.currency !== "IDR") {
    return { ok: false, reason: "currency_not_supported" };
  }
  if (!Number.isSafeInteger(transaction.amount) || transaction.amount !== Number(attempt.amount)) {
    return { ok: false, reason: "amount_mismatch" };
  }
  if (!transaction.user?.id || transaction.user.id !== config.merchantId) {
    return { ok: false, reason: "merchant_mismatch" };
  }
  return { ok: true };
}

function strings(values: unknown[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))];
}

export function webhookCandidateReferences(payload: unknown): {
  paymentIds: string[];
  transactionIds: string[];
} {
  if (!payload || typeof payload !== "object") return { paymentIds: [], transactionIds: [] };
  const root = payload as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : {};

  // data.id is a webhook/event ID in public docs and is intentionally excluded.
  return {
    paymentIds: strings([data.paymentLinkId, data.productId, root.paymentLinkId]),
    transactionIds: strings([data.transactionId, root.paymentLinkTransactionId]),
  };
}
