export type EffectivePlan = "FREE" | "LITE" | "PRO" | "BUSINESS";

type PlanState = {
  plan: string;
  subscription?: {
    status: string;
    plan: string;
    currentPeriodEnd: Date | null;
  } | null;
};

/**
 * User.plan remains authoritative for legacy/permanent grants that have no
 * Subscription row. An explicit Subscription row is authoritative otherwise:
 * ACTIVE + no end date is permanent, ACTIVE + a future end is current, and a
 * stale/inactive row must not keep paid access alive.
 */
export function resolveEffectivePlan(state: PlanState | null, now = new Date()): EffectivePlan {
  if (!state) return "FREE";
  const subscription = state.subscription;
  if (subscription === undefined || subscription === null) return state.plan as EffectivePlan;
  if (subscription.status !== "ACTIVE") return "FREE";
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd <= now) return "FREE";
  return subscription.plan as EffectivePlan;
}

export async function getEffectivePlan(userId: string, now = new Date()): Promise<EffectivePlan> {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscription: { select: { status: true, plan: true, currentPeriodEnd: true } },
    },
  });
  return resolveEffectivePlan(user, now);
}
