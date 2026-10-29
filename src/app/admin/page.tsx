import { aggregateAcquisitionReferrers, buildJakartaDailyTraffic } from "@/lib/admin-analytics";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminOverviewClient, type AdminOverviewData } from "./admin-overview-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin & Analytics Center",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all business & traffic metrics in parallel
  const [
    totalUsers,
    planCounts,
    newUsers30d,
    totalInvoices,
    paidInvoicesAgg,
    allInvoicesAgg,
    paidInvoicesByCurrency,
    allInvoicesByCurrency,
    totalCustomers,
    totalInvoiceItems,
    totalAuditLogs,
    settlementLogsCount,
    // Traffic metrics
    totalViews,
    views24h,
    views7d,
    views30d,
    uniqueVisitors24h,
    uniqueVisitors7d,
    uniqueVisitors30d,
    uniqueVisitorsAll,
    views14dRaw,
    topPagesRaw,
    topReferrersRaw,
    // Recent Data
    recentUsers,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["plan"], _count: { id: true } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
    }),
    prisma.invoice.groupBy({
      by: ["currency"],
      where: { status: "PAID" },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.groupBy({
      by: ["currency"],
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.customer.count(),
    prisma.invoiceItem.count(),
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: { event: "payment.settlement" },
    }),
    // Traffic queries (Total Views)
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    // Unique Visitors (Distinct IP)
    prisma.pageView.groupBy({
      by: ["ipAddress"],
      where: { createdAt: { gte: oneDayAgo }, ipAddress: { not: null } },
    }),
    prisma.pageView.groupBy({
      by: ["ipAddress"],
      where: { createdAt: { gte: sevenDaysAgo }, ipAddress: { not: null } },
    }),
    prisma.pageView.groupBy({
      by: ["ipAddress"],
      where: { createdAt: { gte: thirtyDaysAgo }, ipAddress: { not: null } },
    }),
    prisma.pageView.groupBy({
      by: ["ipAddress"],
      where: { ipAddress: { not: null } },
    }),
    // 14 days traffic data for visual chart
    prisma.pageView.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, ipAddress: true },
    }),
    // Top pages (group by path)
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 8,
    }),
    // Top Referrers
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { referrer: { not: null } },
      _count: { referrer: true },
    }),
    // Recent Users
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        role: true,
        createdAt: true,
        _count: { select: { invoices: true, customers: true } },
      },
    }),
    // Recent Audit Logs
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // Income calculations (Run-rate based on active paid plan tiers)
  let proUsers = 0;
  let currentMRR = 0;
  const planBreakdown = { lite: 0, pro: 0, business: 0, free: 0 };

  planCounts.forEach((p) => {
    if (p.plan === "LITE") {
      currentMRR += p._count.id * 19000;
      proUsers += p._count.id;
      planBreakdown.lite = p._count.id;
    } else if (p.plan === "PRO") {
      currentMRR += p._count.id * 49000;
      proUsers += p._count.id;
      planBreakdown.pro = p._count.id;
    } else if (p.plan === "BUSINESS") {
      currentMRR += p._count.id * 99000;
      proUsers += p._count.id;
      planBreakdown.business = p._count.id;
    } else {
      planBreakdown.free = p._count.id;
    }
  });

  const totalEstimatedIncome = currentMRR;

  const paidInvoiceVolumes = paidInvoicesByCurrency.map((p) => ({
    currency: p.currency,
    total: Number(p._sum.total || 0),
  }));
  const totalInvoiceVolumes = allInvoicesByCurrency.map((a) => ({
    currency: a.currency,
    total: Number(a._sum.total || 0),
  }));

  const totalInvoiceVolume = Number(allInvoicesAgg._sum.total || 0);
  const paidInvoiceVolume = Number(paidInvoicesAgg._sum.total || 0);

  // Group 14-day traffic by Asia/Jakarta calendar day (WIB)
  const trafficChartData = buildJakartaDailyTraffic(views14dRaw, now, 14);

  // Filter and normalize referrers: exclude internal domain and auth provider
  const canonicalUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "https://notaku.store";
  const topReferrers = aggregateAcquisitionReferrers(
    topReferrersRaw.map((r) => ({ referrer: r.referrer, count: r._count.referrer })),
    { canonicalUrl },
  );

  const data: AdminOverviewData = {
    totalEstimatedIncome,
    currentMRR,
    proUsers,
    planBreakdown,
    totalUsers,
    newUsers30d,
    settlementLogsCount,
    paidInvoiceVolume,
    totalInvoiceVolume,
    paidInvoiceVolumes,
    totalInvoiceVolumes,
    totalInvoices,
    totalInvoiceItems,
    totalCustomers,
    totalAuditLogs,
    totalViews,
    views24h,
    views7d,
    views30d,
    uniqueVisitors24hCount: uniqueVisitors24h.length,
    uniqueVisitors7dCount: uniqueVisitors7d.length,
    uniqueVisitors30dCount: uniqueVisitors30d.length,
    uniqueVisitorsAllCount: uniqueVisitorsAll.length,
    trafficChartData,
    topPages: topPagesRaw.map((p) => ({
      path: p.path,
      count: p._count.path,
    })),
    topReferrers,
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      invoiceCount: u._count.invoices,
    })),
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      event: log.event,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    })),
  };

  return <AdminOverviewClient data={data} />;
}
