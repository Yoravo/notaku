import { getJakartaMonthBounds } from "@/lib/admin-analytics";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminFinanceClient } from "./admin-finance-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laporan Finansial & Metrik SaaS",
};

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdmin();

  const { currentStart, previousStart, previousEnd } = getJakartaMonthBounds(new Date());

  const [
    totalUsers,
    planCounts,
    paidInvoicesByCurrency,
    allInvoicesByCurrency,
    paidThisMonthByCurrency,
    paidLastMonthByCurrency,
    allInvoicesCount,
    recentPaidInvoices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["plan"], _count: { id: true } }),
    prisma.invoice.groupBy({
      by: ["currency"], where: { status: "PAID" }, _sum: { total: true }, _count: { id: true },
    }),
    prisma.invoice.groupBy({
      by: ["currency"], _sum: { total: true }, _count: { id: true },
    }),
    prisma.invoice.groupBy({
      by: ["currency"],
      where: { status: "PAID", paidAt: { gte: currentStart } },
      _sum: { total: true }, _count: { id: true },
    }),
    prisma.invoice.groupBy({
      by: ["currency"],
      where: { status: "PAID", paidAt: { gte: previousStart, lte: previousEnd } },
      _sum: { total: true }, _count: { id: true },
    }),
    prisma.invoice.count(),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        customer: { select: { name: true } },
      },
    }),
  ]);

  let listPriceMonthlyRunRate = 0;
  let totalPaidUsers = 0;
  const planBreakdown = { lite: 0, pro: 0, business: 0 };
  planCounts.forEach((p) => {
    if (p.plan === "LITE") {
      listPriceMonthlyRunRate += p._count.id * 19000;
      totalPaidUsers += p._count.id;
      planBreakdown.lite = p._count.id;
    } else if (p.plan === "PRO") {
      listPriceMonthlyRunRate += p._count.id * 49000;
      totalPaidUsers += p._count.id;
      planBreakdown.pro = p._count.id;
    } else if (p.plan === "BUSINESS") {
      listPriceMonthlyRunRate += p._count.id * 99000;
      totalPaidUsers += p._count.id;
      planBreakdown.business = p._count.id;
    }
  });

  const serializeGroups = (groups: typeof paidInvoicesByCurrency) => groups.map((group) => ({
    currency: group.currency,
    total: Number(group._sum.total || 0),
    count: group._count.id,
  }));
  const serializedRecentPaid = recentPaidInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    total: Number(inv.total),
    currency: inv.currency,
    paidAt: inv.paidAt?.toISOString() || null,
    userName: inv.user?.name || null,
    userEmail: inv.user?.email || "",
    customerName: inv.customer?.name || null,
  }));

  return (
    <AdminFinanceClient
      listPriceMonthlyRunRate={listPriceMonthlyRunRate}
      listPriceAnnualRunRate={listPriceMonthlyRunRate * 12}
      conversionRate={totalUsers > 0 ? ((totalPaidUsers / totalUsers) * 100).toFixed(1) : "0"}
      paidInvoiceTotals={serializeGroups(paidInvoicesByCurrency)}
      allInvoiceTotals={serializeGroups(allInvoicesByCurrency)}
      paidThisMonthTotals={serializeGroups(paidThisMonthByCurrency)}
      paidLastMonthTotals={serializeGroups(paidLastMonthByCurrency)}
      totalUsers={totalUsers}
      totalPaidUsers={totalPaidUsers}
      planBreakdown={planBreakdown}
      allInvoicesCount={allInvoicesCount}
      recentPaidInvoices={serializedRecentPaid}
    />
  );
}
