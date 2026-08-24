import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pdf/format";
import {
  CurrencyDollarIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ChartBarSquareIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
import { TrafficBarChart } from "./traffic-chart";

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
    recentViews,
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
    prisma.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
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
  // Estimated total income based on successful payment settlements or active pro users
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

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin & Analytics Center
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Pantau real-time revenue, performa pengguna, dan trafik website
              NotaKu.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking Active
          </div>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL & REVENUE METRICS */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
          Pendapatan & Subscription (SaaS)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition-all">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Est. Pendapatan
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
              {formatCurrency(totalEstimatedIncome)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Dari {settlementLogsCount || proUsers} transaksi Pro
            </p>
          </div>

          {/* Monthly Recurring Revenue */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              MRR (Pendapatan Bulanan)
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">
              {formatCurrency(currentMRR)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {proUsers} Active Pro Subscribers (Rp49k/bln)
            </p>
          </div>

          {/* Pro Conversion Rate */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Konversi Pengguna Pro
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {proUsers} Pro dari {totalUsers} total user
            </p>
          </div>

          {/* GMV Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Volume Invoice Terbayar
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 truncate">
              {formatCurrency(paidInvoiceVolume)}
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Total GMV: {formatCurrency(totalInvoiceVolume)}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRAFFIC & VISITOR ANALYTICS */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <GlobeAltIcon className="w-4 h-4 text-blue-600" />
          Trafik & Kunjungan Website (Pageviews)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              24 Jam Terakhir
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {views24h.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
              <span>Views</span>
              <span className="font-semibold text-emerald-600">
                {uniqueVisitors24h.length} Pengunjung Unik
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              7 Hari Terakhir
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {views7d.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
              <span>Views</span>
              <span className="font-semibold text-emerald-600">
                {uniqueVisitors7d.length} Pengunjung Unik
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              30 Hari Terakhir
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {views30d.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
              <span>Views</span>
              <span className="font-semibold text-emerald-600">
                {uniqueVisitors30d.length} Pengunjung Unik
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Total Kunjungan (All Time)
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {totalViews.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
              <span>Total Views</span>
              <span className="font-semibold text-emerald-600">
                {uniqueVisitorsAll.length} Total Unik
              </span>
            </div>
          </div>
        </div>

        {/* Visual Trend Chart 14 Days */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mt-4">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ChartBarSquareIcon className="w-4 h-4 text-blue-600" />
            Grafik Tren Trafik Harian (Pageviews vs Pengunjung Unik)
          </h3>
          <TrafficBarChart data={trafficChartData} />
        </div>

        {/* Traffic Breakdown: Top Pages & Top Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Top Pages */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-blue-600" />
              Halaman Paling Sering Dikunjungi
            </h3>
            {topPagesRaw.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                Belum ada data kunjungan halaman.
              </p>
            ) : (
              <div className="space-y-2">
                {topPagesRaw.map((p) => {
                  const percentage =
                    totalViews > 0
                      ? ((p._count.path / totalViews) * 100).toFixed(0)
                      : "0";
                  return (
                    <div
                      key={p.path}
                      className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-mono text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                        {p.path}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold text-slate-900">
                          {p._count.path.toLocaleString("id-ID")} views
                        </span>
                        <span className="text-slate-400 text-xs w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
              Sumber Trafik (Top Referrers)
            </h3>
            {topReferrersRaw.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                Belum ada data referrer (kebanyakan direct traffic).
              </p>
            ) : (
              <div className="space-y-2">
                {topReferrersRaw.map((r) => (
                  <div
                    key={r.referrer || "direct"}
                    className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-slate-700 truncate max-w-[200px] sm:max-w-xs font-mono">
                      {r.referrer || "Direct / Bookmark"}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {r._count.referrer.toLocaleString("id-ID")} views
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT USERS & ACTIVITY LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-blue-600" />
              Pengguna Terbaru ({totalUsers} total)
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              +{newUsers30d} bln ini
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">Plan</th>
                  <th className="pb-2 font-semibold">Invoices</th>
                  <th className="pb-2 font-semibold">Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-2">
                      <p className="font-medium text-slate-900 truncate max-w-[140px]">
                        {u.name}
                      </p>
                      <p className="text-slate-400 truncate max-w-[140px]">
                        {u.email}
                      </p>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.plan === "PRO"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 font-mono">
                      {u._count.invoices} inv
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit & System Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-emerald-600" />
            Aktivitas Terkini (Audit Log)
          </h3>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                Belum ada audit log terekam.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-slate-800 font-mono">
                      {log.event}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      IP: {log.ipAddress || "system"}
                    </p>
                  </div>
                  <span className="text-slate-400 shrink-0 text-[11px] font-mono">
                    {new Date(log.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: DATABASE & STORAGE HEALTH CHECK */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ServerStackIcon className="w-4 h-4 text-purple-600" />
          Kapasitas Database & Table Rows (PostgreSQL Health)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Tabel Users</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalUsers.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Tabel Invoices</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalInvoices.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Invoice Items</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalInvoiceItems.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Pelanggan</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalCustomers.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Audit Logs</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalAuditLogs.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium uppercase">Trafik Records</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{totalViews.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
