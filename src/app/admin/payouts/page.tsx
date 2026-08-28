import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminPayoutsClient } from "./admin-payouts-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Penarikan Dana (Payouts) — Admin NotaKu",
};

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const payouts = await prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Persetujuan & Pencairan Dana (Payouts)
        </h1>
        <p className="text-sm text-slate-500">
          Daftar permintaan penarikan saldo pendapatan dari pengguna hasil pembayaran invoice digital.
        </p>
      </div>

      <AdminPayoutsClient
        payouts={payouts.map((p) => ({
          id: p.id,
          userId: p.userId,
          userName: p.user.name,
          userEmail: p.user.email,
          amount: Number(p.amount),
          feeAmount: Number(p.feeAmount),
          netAmount: Number(p.netAmount),
          bankName: p.bankName,
          accountNumber: p.accountNumber,
          accountName: p.accountName,
          status: p.status,
          notes: p.notes,
          adminNotes: p.adminNotes,
          createdAt: p.createdAt.toISOString(),
          processedAt: p.processedAt?.toISOString() || null,
        }))}
      />
    </div>
  );
}
