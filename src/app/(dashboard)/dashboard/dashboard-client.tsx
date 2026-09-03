"use client";

import Link from "next/link";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ClockIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { RecentInvoices } from "@/components/recent-invoices";
import { SerializedInvoice } from "@/types/invoice";
import { AnnouncementBanner, AnnouncementData } from "@/components/announcement-banner";
import { useLanguage } from "@/lib/i18n/context";
import { AdvancedAnalyticsData } from "@/lib/analytics";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ClientPerformanceMetrics } from "@/components/dashboard/client-performance-metrics";

interface DashboardClientProps {
  userName: string;
  isPro: boolean;
  selectedRange: string;
  paidRevenue: number;
  pendingRevenue: number;
  totalVolume: number;
  invoiceCount: number;
  used: number;
  limit: number;
  totalCustomers: number;
  recentInvoices: SerializedInvoice[];
  announcement?: AnnouncementData | null;
  analytics: AdvancedAnalyticsData;
}

export function DashboardClient({
  userName,
  isPro,
  selectedRange,
  paidRevenue,
  pendingRevenue,
  totalVolume,
  invoiceCount,
  used,
  limit,
  totalCustomers: _totalCustomers,
  recentInvoices,
  announcement = null,
  analytics,
}: DashboardClientProps) {
  const { t, locale } = useLanguage();

  const rangeLabels: Record<string, { id: string; en: string }> = {
    month: { id: "Bulan Ini", en: "This Month" },
    year: { id: "Tahun Ini", en: "This Year" },
    all: { id: "Semua Waktu", en: "All Time" },
  };

  const periodLabel =
    rangeLabels[selectedRange]?.[locale] || (locale === "id" ? "Bulan Ini" : "This Month");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Global Broadcast Announcement */}
      {announcement && <AnnouncementBanner announcement={announcement} />}

      {/* Header: Mobile-first stack, desktop row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {locale === "id" ? "Ringkasan Dashboard" : "Dashboard Overview"}
            </h1>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] border border-emerald-200 shadow-2xs">
                <SparklesIcon className="w-3.5 h-3.5 text-[#0f6b4f]" />
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                FREE
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {locale === "id" ? (
              <>
                Selamat datang kembali,{" "}
                <span className="font-semibold text-slate-800">{userName}</span>. Berikut
                performa transaksi tagihan Anda.
              </>
            ) : (
              <>
                Welcome back,{" "}
                <span className="font-semibold text-slate-800">{userName}</span>. Here is your
                billing and transaction performance.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/invoices/export`}
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
            <span>{locale === "id" ? "Ekspor Rekap" : "Export Report"}</span>
          </a>
          <Link
            href="/invoices/new"
            prefetch={true}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t.invoices?.newInvoice || (locale === "id" ? "Buat Invoice" : "New Invoice")}</span>
          </Link>
        </div>
      </div>

      {/* Period Filter Selector */}
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs w-fit">
        {(["month", "year", "all"] as const).map((r) => (
          <Link
            key={r}
            href={`/dashboard?range=${r}`}
            prefetch={true}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              selectedRange === r
                ? "bg-[#0f6b4f] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {rangeLabels[r][locale]}
          </Link>
        ))}
      </div>

      {/* Primary KPI Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Volume Transaksi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Total Tagihan" : "Total Billed"}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              Rp{totalVolume.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {invoiceCount} invoice • {periodLabel}
            </p>
          </div>
        </div>

        {/* Card 2: Pendapatan Lunas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Pendapatan Lunas" : "Paid Revenue"}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
              <CheckBadgeIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-[#0f6b4f] tabular-nums">
              Rp{paidRevenue.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {locale === "id" ? "Berhasil diterima" : "Successfully collected"}
            </p>
          </div>
        </div>

        {/* Card 3: Tagihan Tertunda (Pending / Overdue) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Menunggu Bayar" : "Pending Payment"}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              Rp{pendingRevenue.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {locale === "id" ? "Belum dibayar klien" : "Awaiting settlement"}
            </p>
          </div>
        </div>

        {/* Card 4: Kuota Invoice Bulanan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Kuota Invoice" : "Invoice Quota"}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BanknotesIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {used} <span className="text-sm font-normal text-slate-400">/ {limit === Infinity ? "∞" : limit}</span>
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#0f6b4f] rounded-full transition-all duration-500"
                style={{
                  width: `${limit === Infinity ? 100 : Math.min(100, (used / limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow Bar Chart Component */}
      <CashflowChart data={analytics.monthlyCashflow} />

      {/* Advanced Client Performance & DSO Metrics (PRO) */}
      <ClientPerformanceMetrics analytics={analytics} isPro={isPro} />

      {/* Recent Invoices Table Component */}
      <RecentInvoices invoices={recentInvoices} />
    </div>
  );
}
