"use client";

import { formatCurrency } from "@/lib/pdf/format";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export type RecentPaidInvoice = {
  id: string;
  number: string;
  total: number;
  userName: string | null;
  userEmail: string;
  customerName: string | null;
};

export type AdminFinanceClientProps = {
  estimatedMRR: number;
  estimatedARR: number;
  conversionRate: string;
  platformGMV: number;
  totalInvoiceValue: number;
  totalUsers: number;
  totalProUsers: number;
  allInvoicesCount: number;
  paidThisMonthTotal: number;
  paidThisMonthCount: number;
  paidLastMonthTotal: number;
  paidLastMonthCount: number;
  recentPaidInvoices: RecentPaidInvoice[];
};

export function AdminFinanceClient({
  estimatedMRR,
  estimatedARR,
  conversionRate,
  platformGMV,
  totalInvoiceValue,
  totalUsers,
  totalProUsers,
  allInvoicesCount,
  paidThisMonthTotal,
  paidThisMonthCount,
  paidLastMonthTotal,
  paidLastMonthCount,
  recentPaidInvoices,
}: AdminFinanceClientProps) {
  const tAdmin = useTranslations("admin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
              <BanknotesIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {tAdmin("financeTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {tAdmin("financeSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/invoices"
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs w-full sm:w-auto cursor-pointer min-h-[44px]"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{tAdmin("exportReport")}</span>
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated MRR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/60 dark:border-emerald-800 p-5 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#0f6b4f] dark:text-emerald-400 uppercase tracking-wider">
              {tAdmin("estimatedMRR")}
            </p>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f6b4f] dark:text-emerald-400 mt-2 tabular-nums">
            {formatCurrency(estimatedMRR)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tAdmin("activeProUsersCount", { count: totalProUsers })}
          </p>
        </div>

        {/* Estimated ARR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("estimatedARR")}
            </p>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tabular-nums">
            {formatCurrency(estimatedARR)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tAdmin("annualProjectionRunRate")}
          </p>
        </div>

        {/* Free to Pro Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("proRatio")}
            </p>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 mt-2 tabular-nums">
            {conversionRate}%
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tAdmin("proUsersCount", { pro: totalProUsers, total: totalUsers, rate: `${conversionRate}%` })}
          </p>
        </div>

        {/* Total GMV Processed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:border-amber-300 dark:hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tAdmin("gmvTitle")}
            </p>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 dark:text-amber-300 mt-2 tabular-nums">
            {formatCurrency(platformGMV)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {tAdmin("gmvSubtitle", { count: allInvoicesCount })}
          </p>
        </div>
      </div>

      {/* Monthly Invoice Volume Comparison & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Invoice Volume */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DocumentDuplicateIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{tAdmin("paidInvoices")}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
              <p className="text-[11px] text-[#0f6b4f] dark:text-emerald-400 font-bold uppercase tracking-wider">
                {tAdmin("thisMonth")}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0f6b4f] dark:text-emerald-400 mt-1 tabular-nums">
                {formatCurrency(paidThisMonthTotal)}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                {tAdmin("invoicesPaidCount", { count: paidThisMonthCount })}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {tAdmin("lastMonth")}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                {formatCurrency(paidLastMonthTotal)}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                {tAdmin("invoicesPaidCount", { count: paidLastMonthCount })}
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {tAdmin("totalInvoiceVolumeDesc", { total: formatCurrency(totalInvoiceValue), count: allInvoicesCount })}
          </div>
        </div>

        {/* Recent Paid Invoices Feed */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
              <span>{tAdmin("recentTransactions")}</span>
            </h2>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentPaidInvoices.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                {tAdmin("emptyRecent")}
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse min-w-[340px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    <th className="py-3 px-4">{tAdmin("tableInvoiceNumber")}</th>
                    <th className="py-3 px-4">{tAdmin("tableUser")}</th>
                    <th className="py-3 px-4 text-right">{tAdmin("tableTotal")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentPaidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {inv.number}
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {inv.customerName || tAdmin("generalClient")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {inv.userName || "User"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[150px]">
                          {inv.userEmail}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
                        {formatCurrency(inv.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
