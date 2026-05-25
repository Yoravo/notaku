import { prisma } from "./prisma";

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await prisma.invoice.findFirst({
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
