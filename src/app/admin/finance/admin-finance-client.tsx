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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-2xs">
              <BanknotesIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t.admin?.finance || (locale === "id" ? "Laporan Finansial & Metrik SaaS" : "Financial Reports & SaaS Metrics")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Analisis pendapatan langganan (MRR), total perputaran invoice (GMV), dan laporan transaksi."
                  : "Analyze subscription revenue (MRR), platform invoice volume (GMV), and transaction reports."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/invoices"
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs w-full sm:w-auto cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-500" />
            <span>{locale === "id" ? "Ekspor Data Transaksi CSV" : "Export Transactions CSV"}</span>
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated MRR */}
        <div className="bg-white rounded-2xl border border-emerald-200/60 p-5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#0f6b4f] uppercase tracking-wider">
              {locale === "id" ? "Estimasi MRR (SaaS)" : "Estimated MRR (SaaS)"}
            </p>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0f6b4f] mt-2 tabular-nums">
            {formatCurrency(estimatedMRR)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {locale === "id"
              ? `Dari ${totalProUsers} user PRO aktif (@Rp 49rb/bln)`
              : `From ${totalProUsers} active PRO users (@IDR 49k/mo)`}
          </p>
        </div>

        {/* Estimated ARR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Estimasi ARR (Tahunan)" : "Estimated ARR (Annual)"}
            </p>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(estimatedARR)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {locale === "id" ? "Run-rate proyeksi tahunan" : "Annual projection run-rate"}
          </p>
        </div>

        {/* Free to Pro Conversion Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Conversion Rate" : "Conversion Rate"}
            </p>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-2 tabular-nums">
            {conversionRate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {locale === "id"
              ? `${totalProUsers} PRO dari ${totalUsers} total user`
              : `${totalProUsers} PRO from ${totalUsers} total users`}
          </p>
        </div>

        {/* Total GMV Processed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Total GMV Invoice" : "Total Invoice GMV"}
            </p>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-2 tabular-nums">
            {formatCurrency(platformGMV)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            {locale === "id" ? "Nilai invoice terbayar platform" : "Platform paid invoices total"}
          </p>
        </div>
      </div>

      {/* Monthly Invoice Volume Comparison & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Invoice Volume */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DocumentDuplicateIcon className="w-4 h-4 text-slate-600" />
            <span>{locale === "id" ? "Performa Invoice Bulan Berjalan" : "Current Month Invoice Performance"}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/60 shadow-2xs">
              <p className="text-[11px] text-[#0f6b4f] font-bold uppercase tracking-wider">
                {locale === "id" ? "Bulan Ini (M-to-D)" : "This Month (M-to-D)"}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0f6b4f] mt-1 tabular-nums">
                {formatCurrency(paidThisMonthTotal)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {paidThisMonthCount} {locale === "id" ? "invoice PAID" : "PAID invoices"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-2xs">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                {locale === "id" ? "Bulan Lalu (Full)" : "Last Month (Full)"}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1 tabular-nums">
                {formatCurrency(paidLastMonthTotal)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {paidLastMonthCount} {locale === "id" ? "invoice PAID" : "PAID invoices"}
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 leading-relaxed font-medium">
            {locale === "id" ? (
              <>
                Perputaran total invoice tercatat mencakup keseluruhan pembuatan invoice di sistem senilai{" "}
                <strong className="text-slate-900 font-bold">{formatCurrency(totalInvoiceValue)}</strong> ({allInvoicesCount} total invoice).
              </>
            ) : (
              <>
                Total registered invoice volume across the platform is valued at{" "}
                <strong className="text-slate-900 font-bold">{formatCurrency(totalInvoiceValue)}</strong> ({allInvoicesCount} total invoices).
              </>
            )}
          </div>
        </div>

        {/* Recent Paid Invoices Feed */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-[#0f6b4f]" />
              <span>{locale === "id" ? "Invoice PAID Terkini Platform" : "Recent Platform PAID Invoices"}</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {locale === "id" ? "10 transaksi terakhir" : "Last 10 transactions"}
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentPaidInvoices.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400 font-medium">
                {locale === "id"
                  ? "Belum ada invoice berstatus PAID tercatat di sistem."
                  : "No PAID invoices recorded yet in the system."}
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">{locale === "id" ? "Invoice" : "Invoice"}</th>
                    <th className="py-3 px-4">{locale === "id" ? "Pengirim / User" : "Sender / User"}</th>
                    <th className="py-3 px-4 text-right">{locale === "id" ? "Nominal" : "Amount"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPaidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900">
                          {inv.number}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {inv.customerName || (locale === "id" ? "Pelanggan Umum" : "General Client")}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 truncate max-w-[150px]">
                          {inv.userName || "User"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                          {inv.userEmail}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0f6b4f] tabular-nums">
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
