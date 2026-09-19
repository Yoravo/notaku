export type PlanType = "PRO" | "BUSINESS";
export type PlanInterval = "MONTHLY" | "ANNUALLY";

export const PLAN_PRICES = {
  PRO: {
    MONTHLY: 49000,
    ANNUALLY: 390000,
  },
  BUSINESS: {
    MONTHLY: 99000,
    ANNUALLY: 790000,
  },
} as const;

export const BASE_PRO_PRICE = PLAN_PRICES.PRO.MONTHLY;

export function getPlanPrice(plan: PlanType, interval: PlanInterval = "MONTHLY"): number {
  const selectedPlan = PLAN_PRICES[plan] || PLAN_PRICES.PRO;
  return selectedPlan[interval] || selectedPlan.MONTHLY;
}
