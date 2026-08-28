import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WalletClient } from "./wallet-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saldo & Penarikan Dana — NotaKu",
};

export default async function WalletPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [user, transactions, payouts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        balance: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        invoice: {
          select: { number: true },
        },
      },
    }),
    prisma.payout.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <WalletClient
      balance={Number(user.balance || 0)}
      bankName={user.bankName}
      bankAccountNumber={user.bankAccountNumber}
      bankAccountName={user.bankAccountName}
      transactions={transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        grossAmount: Number(tx.grossAmount),
        feeAmount: Number(tx.feeAmount),
        description: tx.description,
        createdAt: tx.createdAt.toISOString(),
        invoiceNumber: tx.invoice?.number || null,
      }))}
      payouts={payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        feeAmount: Number(p.feeAmount),
        netAmount: Number(p.netAmount),
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        processedAt: p.processedAt?.toISOString() || null,
      }))}
    />
  );
}
