export type CheckoutFailureRecord = {
  status: "CREATE_UNKNOWN" | "MANUAL_REVIEW" | "FAILED";
  activeCheckoutKey: string | null;
  providerPaymentId?: string;
  providerTransactionId?: string;
  paymentUrl?: string;
  errorCode: string;
  errorMessage: string;
};

type ProviderPayment = { id: string; transactionId: string; link: string };

type ExistingCheckout = {
  status: string;
  paymentUrl: string | null;
  providerTransactionId: string | null;
  amount: number | { toString(): string };
  expiresAt: Date;
};

export type ExistingCheckoutDecision =
  | { kind: "reuse" }
  | { kind: "reconcile" }
  | { kind: "conflict"; reason: "amount_changed" | "not_reusable" };

export function decideExistingCheckout(
  existing: ExistingCheckout,
  snapshot: { amount: number },
  now = new Date(),
): ExistingCheckoutDecision {
  if (Number(existing.amount) !== snapshot.amount) return { kind: "conflict", reason: "amount_changed" };
  if (existing.status !== "PENDING" || !existing.paymentUrl) return { kind: "conflict", reason: "not_reusable" };
  if (existing.expiresAt <= now && existing.providerTransactionId) return { kind: "reconcile" };
  return { kind: "reuse" };
}

type CheckoutCreationDeps = {
  attempt: { id: string };
  activeCheckoutKey: string;
  createProviderPayment(): Promise<ProviderPayment>;
  persistProviderSuccess(payment: ProviderPayment): Promise<void>;
  persistFailure(data: CheckoutFailureRecord): Promise<void>;
};

function message(error: unknown): string {
  return (error instanceof Error ? error.message : "Unknown checkout error").slice(0, 500);
}

export function toDurableCheckoutFailure(
  error: unknown,
  payment: ProviderPayment | undefined,
  activeCheckoutKey: string,
): CheckoutFailureRecord {
  const ambiguous = Boolean(payment) || Boolean((error as { ambiguous?: boolean }).ambiguous);
  const hasReferences = Boolean(payment?.id || payment?.transactionId);
  const status = !ambiguous
    ? "FAILED"
    : hasReferences
      ? "CREATE_UNKNOWN"
      : "MANUAL_REVIEW";
  return {
    status,
    activeCheckoutKey: ambiguous ? activeCheckoutKey : null,
    ...(payment ? {
      providerPaymentId: payment.id,
      providerTransactionId: payment.transactionId,
      paymentUrl: payment.link,
    } : {}),
    errorCode: payment ? "LOCAL_PERSIST" : String((error as { code?: unknown }).code ?? "INTERNAL"),
    errorMessage: message(error),
  };
}

export async function runCheckoutCreation(deps: CheckoutCreationDeps): Promise<ProviderPayment> {
  let payment: ProviderPayment | undefined;
  try {
    payment = await deps.createProviderPayment();
    await deps.persistProviderSuccess(payment);
    return payment;
  } catch (error) {
    await deps.persistFailure(toDurableCheckoutFailure(error, payment, deps.activeCheckoutKey));
    throw error;
  }
}
