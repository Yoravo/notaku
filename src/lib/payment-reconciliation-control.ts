export type ProviderStatusInspection =
  | { kind: "paid" }
  | { kind: "pending" }
  | { kind: "terminal"; status: "EXPIRED" | "FAILED" };

export function inspectProviderStatus(rawStatus: string): ProviderStatusInspection {
  const status = rawStatus.trim().toLowerCase();
  if (status === "paid") return { kind: "paid" };
  if (status === "expired") return { kind: "terminal", status: "EXPIRED" };
  if (["closed", "failed", "canceled", "cancelled"].includes(status)) {
    return { kind: "terminal", status: "FAILED" };
  }
  return { kind: "pending" };
}

export async function applyNonPaidProviderObservation(
  attemptId: string,
  rawStatus: string,
  persist: (input: { attemptId: string; status?: "EXPIRED" | "FAILED"; releaseKey: boolean }) => Promise<void>,
): Promise<{ state: "pending" | "rejected"; reason: string }> {
  const observation = inspectProviderStatus(rawStatus);
  if (observation.kind === "terminal") {
    await persist({ attemptId, status: observation.status, releaseKey: true });
    return { state: "rejected", reason: `provider_${rawStatus.toLowerCase()}` };
  }
  await persist({ attemptId, releaseKey: false });
  return { state: "pending", reason: "transaction_not_paid" };
}
