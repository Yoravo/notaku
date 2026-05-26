import { prisma } from "./prisma";

const FREE_INVOICE_LIMIT = 5;

export async function canCreateInvoice(
  userId: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === "PRO") {
    return { allowed: true, used: 0, limit: Infinity };
  }

  const count = await prisma.invoice.count({
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
