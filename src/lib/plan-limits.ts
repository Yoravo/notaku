import { prisma } from "./prisma";
import type { PrismaClientOrTx } from "./prisma";

const FREE_INVOICE_LIMIT = 5;
const FREE_CUSTOMER_LIMIT = 20;

export type PlanTier = "FREE" | "PRO" | "BUSINESS";

/** PRO & BUSINESS berbagi seluruh fitur inti berbayar (unlimited, watermark-free, branding, dll). */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "PRO" || plan === "BUSINESS";
}

/** Fitur enterprise (custom domain, REST API, webhook, bot alert) eksklusif tier BUSINESS. */
export function hasBusinessFeatures(plan: string | null | undefined): boolean {
  return plan === "BUSINESS";
}

export async function canCreateInvoice(
  userId: string,
  tx?: PrismaClientOrTx,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  // Convert to Jakarta timezone and get the start of the current month
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
  });
  const [month, year] = formatter.format(now).split("/");
  const startOfMonth = new Date(
    `${year}-${month.padStart(2, "0")}-01T00:00:00+07:00`,
  );

  const client = tx ?? prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === "PRO" || user?.plan === "BUSINESS") {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const count = await client.invoice.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: count < FREE_INVOICE_LIMIT,
    used: count,
    limit: FREE_INVOICE_LIMIT,
  };
}

export async function canCreateCustomer(
  userId: string,
  tx?: PrismaClientOrTx,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const client = tx ?? prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === "PRO" || user?.plan === "BUSINESS") {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const count = await client.customer.count({
    where: { userId },
  });

  return {
    allowed: count < FREE_CUSTOMER_LIMIT,
    used: count,
    limit: FREE_CUSTOMER_LIMIT,
  };
}
