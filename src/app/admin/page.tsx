import { prisma } from "@/lib/prisma";
import { AdminOverviewClient, type AdminOverviewData } from "./admin-overview-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin & Analytics Center — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all business & traffic metrics in parallel
  const [
    totalUsers,
    proUsers,
    newUsers30d,
    totalInvoices,
    paidInvoicesAgg,
    allInvoicesAgg,
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
    prisma.user.count({ where: { plan: "PRO" } }),
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
      orderBy: { _count: { referrer: "desc" } },
      take: 6,
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

  // Income calculations (Rp 49.000 per Pro Subscription)
  const PRO_PRICE = 49000;
  const currentMRR = proUsers * PRO_PRICE;
  const totalEstimatedIncome =
    Math.max(settlementLogsCount, proUsers) * PRO_PRICE;

  const totalInvoiceVolume = Number(allInvoicesAgg._sum.total || 0);
  const paidInvoiceVolume = Number(paidInvoicesAgg._sum.total || 0);

  // Group 14-day traffic by date (Asia/Jakarta day)
  const trafficChartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    // Filter pageviews on this day
    const dayViews = views14dRaw.filter((v) => {
      const vDateStr = new Date(v.createdAt).toISOString().split("T")[0];
      return vDateStr === dateStr;
    });

    const uniqueIps = new Set(dayViews.map((v) => v.ipAddress).filter(Boolean));

    return {
      dateKey: dateStr,
      label,
      views: dayViews.length,
      uniques: uniqueIps.size,
    };
  });

  const data: AdminOverviewData = {
    totalEstimatedIncome,
    currentMRR,
    proUsers,
    totalUsers,
    newUsers30d,
    settlementLogsCount,
    paidInvoiceVolume,
    totalInvoiceVolume,
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
    topReferrers: topReferrersRaw.map((r) => ({
      referrer: r.referrer,
      count: r._count.referrer,
    })),
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
