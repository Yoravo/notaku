import { prisma } from "./prisma";
import type { PrismaClientOrTx } from "./prisma";

export async function generateInvoiceNumber(
  userId: string,
  tx?: PrismaClientOrTx,
): Promise<string>{
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const client = tx ?? prisma;

  const lastInvoice = await client.invoice.findFirst({
    where: {
      userId,
      number: { startsWith: prefix },
    },
    orderBy: { number: "desc" },
  });

  let sequence = 1;
  if (lastInvoice?.number) {
    const lastSeq = parseInt(lastInvoice.number.replace(prefix, ""), 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(3, "0")}`;
}
