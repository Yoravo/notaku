"use client";

import {
  CurrencyDollarIcon,
  UsersIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  SparklesIcon,
  ChartBarSquareIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";
import { TrafficBarChart } from "./traffic-chart";
import { formatCurrency } from "@/lib/pdf/format";
import { formatDateWIB } from "@/lib/invoice-utils";
import { useTranslations } from "next-intl";

export interface AdminOverviewData {
  totalEstimatedIncome: number;
  currentMRR: number;
  proUsers: number;
  totalUsers: number;
  newUsers30d: number;
  settlementLogsCount: number;
  paidInvoiceVolume: number;
  totalInvoiceVolume: number;
  totalInvoices: number;
  totalInvoiceItems: number;
  totalCustomers: number;
  totalAuditLogs: number;
  totalViews: number;
  views24h: number;
  views7d: number;
  views30d: number;
  uniqueVisitors24hCount: number;
  uniqueVisitors7dCount: number;
  uniqueVisitors30dCount: number;
  uniqueVisitorsAllCount: number;
  trafficChartData: {
    dateKey: string;
    label: string;
    views: number;
    uniques: number;
  }[];
  topPages: {
    path: string;
    count: number;
  }[];
  topReferrers: {
    referrer: string | null;
    count: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    plan: string;
    role: string;
    createdAt: string;
    invoiceCount: number;
  }[];
  recentLogs: {
    id: string;
    event: string;
    ipAddress: string | null;
    createdAt: string;
  }[];
}

export function AdminOverviewClient({ data }: { data: AdminOverviewData }) {
  const tAdmin = useTranslations("admin");

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tAdmin("title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {tAdmin("subtitle")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800 text-[#0f6b4f] dark:text-emerald-400 text-xs font-bold self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{tAdmin("liveTracking")}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL & REVENUE METRICS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <CurrencyDollarIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
          <span>{tAdmin("sectionRevenue")}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500 transition-all">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("totalIncome")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0f6b4f] dark:text-emerald-400 mt-2 tabular-nums">
              {formatCurrency(data.totalEstimatedIncome)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
              {tAdmin("proTransactionsCount", { count: data.settlementLogsCount || data.proUsers })}
            </p>
          </div>

          {/* Monthly Recurring Revenue */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500 transition-all">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("mrr")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 tabular-nums">
              {formatCurrency(data.currentMRR)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
              {tAdmin("activeProUsersPrice", { count: data.proUsers })}
            </p>
          </div>

          {/* Pro Conversion Rate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("proConversion")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
              {data.totalUsers > 0 ? ((data.proUsers / data.totalUsers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              {data.proUsers} Pro / {data.totalUsers} users
            </p>
          </div>

          {/* GMV Invoices */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("paidVolume")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 truncate tabular-nums">
              {formatCurrency(data.paidInvoiceVolume)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
              Total GMV: {formatCurrency(data.totalInvoiceVolume)}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRAFFIC & VISITOR ANALYTICS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <GlobeAltIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{tAdmin("sectionTraffic")}</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("traffic24h")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
              {data.views24h.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <span className="font-medium">Views</span>
              <span className="font-bold text-[#0f6b4f] dark:text-emerald-400">
                {data.uniqueVisitors24hCount} {tAdmin("views")}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("traffic7d")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
              {data.views7d.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <span className="font-medium">Views</span>
              <span className="font-bold text-[#0f6b4f] dark:text-emerald-400">
                {data.uniqueVisitors7dCount} {tAdmin("views")}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("traffic30d")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
              {data.views30d.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <span className="font-medium">Views</span>
              <span className="font-bold text-[#0f6b4f] dark:text-emerald-400">
                {data.uniqueVisitors30dCount} {tAdmin("views")}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("trafficAll")}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
              {data.totalViews.toLocaleString("id-ID")}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <span className="font-medium">Total Views</span>
              <span className="font-bold text-[#0f6b4f] dark:text-emerald-400">
                {data.uniqueVisitorsAllCount} {tAdmin("uniqueIps")}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Trend Chart 14 Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs mt-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <ChartBarSquareIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{tAdmin("trafficTrendsTitle")}</span>
          </h3>
          <TrafficBarChart data={data.trafficChartData} />
        </div>

        {/* Traffic Breakdown: Top Pages & Top Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Top Pages */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{tAdmin("mostVisitedPagesTitle")}</span>
            </h3>
            {data.topPages.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">
                {tAdmin("emptyPagesVisited")}
              </p>
            ) : (
              <div className="space-y-2">
                {data.topPages.map((p) => {
                  const percentage =
                    data.totalViews > 0
                      ? ((p.count / data.totalViews) * 100).toFixed(0)
                      : "0";
                  return (
                    <div
                      key={p.path}
                      className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 truncate max-w-50 sm:max-w-xs">
                        {p.path}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">
                          {p.count.toLocaleString("id-ID")} views
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs w-8 text-right font-semibold">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
              <span>{tAdmin("trafficSourcesTitle")}</span>
            </h3>
            {data.topReferrers.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">
                {tAdmin("emptyReferrers")}
              </p>
            ) : (
              <div className="space-y-2">
                {data.topReferrers.map((r) => (
                  <div
                    key={r.referrer || "direct"}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-50 sm:max-w-xs font-mono font-medium">
                      {r.referrer || "Direct / Bookmark"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {r.count.toLocaleString("id-ID")} views
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{tAdmin("recentUsersCount", { count: data.totalUsers })}</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {tAdmin("newUsersThisMonth", { count: data.newUsers30d })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[320px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="pb-2.5">User</th>
                  <th className="pb-2.5">Plan</th>
                  <th className="pb-2.5">Invoices</th>
                  <th className="pb-2.5">{tAdmin("colJoined")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-35">
                        {u.name}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px] truncate max-w-35">
                        {u.email}
                      </p>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.plan === "BUSINESS"
                            ? "bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800 shadow-2xs"
                            : u.plan === "PRO"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 font-mono font-semibold">
                      {u.invoiceCount} inv
                    </td>
                    <td className="py-2.5 text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                      {formatDateWIB(u.createdAt, {
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
            <span>{tAdmin("recentActivityTitle")}</span>
          </h3>
          <div className="space-y-2.5">
            {data.recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">
                {tAdmin("emptyAuditLogs")}
              </p>
            ) : (
              data.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {log.event}
                    </span>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-mono">
                      IP: {log.ipAddress || "system"}
                    </p>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 text-[10px] font-mono">
                    {formatDateWIB(log.createdAt, {
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ServerStackIcon className="w-4 h-4 text-purple-600" />
          <span>{tAdmin("dbHealthTitle")}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableUsersLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalUsers.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableInvoicesLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalInvoices.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableInvoiceItemsLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalInvoiceItems.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableCustomersLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalCustomers.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableAuditLogsLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalAuditLogs.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{tAdmin("tableTrafficRecordsLabel")}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-1 font-mono">{data.totalViews.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
