export type AdminPlan = "FREE" | "LITE" | "PRO" | "BUSINESS";

export const ADMIN_PLANS: readonly AdminPlan[] = ["FREE", "LITE", "PRO", "BUSINESS"];

// Durasi dalam hari. PERMANENT = currentPeriodEnd null, tidak pernah disentuh cron check-subscriptions.
export const ADMIN_PLAN_DURATIONS = {
  "30_DAYS": 30,
  "90_DAYS": 90,
  "180_DAYS": 180,
  "365_DAYS": 365,
  PERMANENT: null,
} as const;

export type AdminPlanDuration = keyof typeof ADMIN_PLAN_DURATIONS;

export function isAdminPlanDuration(value: unknown): value is AdminPlanDuration {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ADMIN_PLAN_DURATIONS, value);
}

export function computeAdminPeriodEnd(
  plan: AdminPlan,
  duration: AdminPlanDuration,
  now: number = Date.now(),
): Date | null {
  if (plan === "FREE") return null;
  const days = ADMIN_PLAN_DURATIONS[duration];
  return days === null ? null : new Date(now + days * 86_400_000);
}
