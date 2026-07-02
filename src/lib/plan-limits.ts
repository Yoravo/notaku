import { prisma } from "./prisma";
import type { PrismaClientOrTx } from "./prisma";

const FREE_INVOICE_LIMIT = 5;

export async function canCreateInvoice(
  userId: string,
  tx?: PrismaClientOrTx,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const client = tx ?? prisma;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === "PRO") {
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
