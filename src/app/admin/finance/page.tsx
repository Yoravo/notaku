import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminFinanceClient } from "./admin-finance-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan Finansial & Metrik SaaS — Admin NotaKu",
};

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Pro Subscription pricing baseline (Rp 49.000 / month)
  const PRO_PRICE = 49000;

  const [
    totalUsers,
    totalProUsers,
    paidInvoicesAgg,
    allInvoicesAgg,
    paidThisMonthAgg,
    paidLastMonthAgg,
    allInvoicesCount,
    paidInvoicesCount,
    recentPaidInvoices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfMonth },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        customer: { select: { name: true } },
      },
    }),
  ]);

  // Financial Estimates
  const estimatedMRR = totalProUsers * PRO_PRICE;
  const estimatedARR = estimatedMRR * 12;
  const conversionRate = totalUsers > 0 ? ((totalProUsers / totalUsers) * 100).toFixed(1) : "0";
  const platformGMV = Number(paidInvoicesAgg._sum.total || 0);
  const totalInvoiceValue = Number(allInvoicesAgg._sum.total || 0);

  const serializedRecentPaid = recentPaidInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    total: Number(inv.total),
    userName: inv.user?.name || null,
    userEmail: inv.user?.email || "",
    customerName: inv.customer?.name || null,
  }));

  return (
    <AdminFinanceClient
      estimatedMRR={estimatedMRR}
      estimatedARR={estimatedARR}
      conversionRate={conversionRate}
      platformGMV={platformGMV}
      totalInvoiceValue={totalInvoiceValue}
      totalUsers={totalUsers}
      totalProUsers={totalProUsers}
      allInvoicesCount={allInvoicesCount}
      paidThisMonthTotal={Number(paidThisMonthAgg._sum.total || 0)}
      paidThisMonthCount={paidThisMonthAgg._count.id || 0}
      paidLastMonthTotal={Number(paidLastMonthAgg._sum.total || 0)}
      paidLastMonthCount={paidLastMonthAgg._count.id || 0}
      recentPaidInvoices={serializedRecentPaid}
    />
  );
}
