"use client";

import Link from "next/link";
import {
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { AdvancedAnalyticsData } from "@/lib/analytics";
import { formatCurrency } from "@/lib/pdf/format";
import { useTranslations } from "next-intl";

interface ClientPerformanceMetricsProps {
  analytics: AdvancedAnalyticsData;
  isPro: boolean;
}

export function ClientPerformanceMetrics({
  analytics,
  isPro,
}: ClientPerformanceMetricsProps) {
  const tPerf = useTranslations("clientPerformance");

  const {
    dsoDays,
    onTimePaymentRate,
    totalPaidCount,
    totalLateCount,
    topClients,
    avgInvoiceValue,
  } = analytics;

  // Evaluasi label DSO
  let dsoStatusLabel = tPerf("dsoHealthy");
  let dsoBadgeClass = "bg-emerald-50 text-[#0f6b4f] border-emerald-200";

  if (dsoDays === null) {
    dsoStatusLabel = tPerf("dsoNoData");
    dsoBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
  } else if (dsoDays <= 14) {
    dsoStatusLabel = tPerf("dsoVeryFast");
    dsoBadgeClass = "bg-emerald-50 text-[#0f6b4f] border-emerald-200";
  } else if (dsoDays <= 30) {
    dsoStatusLabel = tPerf("dsoNormal");
    dsoBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else {
    dsoStatusLabel = tPerf("dsoAttention");
    dsoBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div className="relative">
      {/* Container utama performa */}
      <div className="space-y-6">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {tPerf("title")}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <SparklesIcon className="w-3 h-3 text-[#0f6b4f] dark:text-emerald-400" />
                PRO Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tPerf("subtitle")}
            </p>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Metric 1: DSO (Days Sales Outstanding) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {tPerf("dsoTitle")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {dsoDays !== null ? tPerf("dsoDays", { count: dsoDays }) : "-"}
                </p>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${dsoBadgeClass}`}>
                  {dsoStatusLabel}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tPerf("dsoDesc")}
              </p>
            </div>
          </div>

          {/* Metric 2: On-Time Settlement Rate */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {tPerf("onTimeTitle")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400">
                <CheckCircleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
                  {onTimePaymentRate}%
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  ({totalPaidCount} / {totalPaidCount + totalLateCount})
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#0f6b4f] dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, onTimePaymentRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metric 3: Rata-rata Nilai Transaksi */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {tPerf("avgInvoiceTitle")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(avgInvoiceValue)}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tPerf("avgInvoiceDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 Clients Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400">
                <UsersIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {tPerf("topClientsTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tPerf("topClientsSubtitle")}
                </p>
              </div>
            </div>

            <Link
              href="/customers"
              prefetch={true}
              className="text-xs font-semibold text-[#0f6b4f] dark:text-emerald-400 hover:text-[#0c553e] dark:hover:text-emerald-300 transition-colors"
            >
              {tPerf("viewAllClients")}
            </Link>
          </div>

          {topClients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tPerf("dsoNoData")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold text-xs">
                    <th className="py-3 px-4">{tPerf("thClient")}</th>
                    <th className="py-3 px-4 text-center">{tPerf("thInvoices")}</th>
                    <th className="py-3 px-4 text-center">{tPerf("thVelocity")}</th>
                    <th className="py-3 px-4 text-right">{tPerf("thContribution")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal text-slate-700 dark:text-slate-300">
                  {topClients.map((client, idx) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <div className="truncate max-w-[200px] sm:max-w-none">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {client.name}
                            </span>
                            {client.email && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate font-normal">
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {client.paidInvoices} / {client.totalInvoices}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        {client.averagePaymentDays !== null ? (
                          <span className="font-semibold text-slate-700">
                            ~{client.averagePaymentDays}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#0f6b4f] tabular-nums">
                        {formatCurrency(client.totalPaidAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FREE User Locked Overlay Banner */}
      {!isPro && (
        <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-emerald-200/80 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f6b4f] mb-3 shadow-2xs">
            <LockClosedIcon className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {tPerf("proGateTitle")}
          </h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
            {tPerf("proGateDesc")}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/billing"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{tPerf("upgradeProBtn")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
