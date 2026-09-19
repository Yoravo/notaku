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
  UserPlusIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { RecentInvoices } from "@/components/recent-invoices";
import { SerializedInvoice } from "@/types/invoice";
import { AnnouncementBanner, AnnouncementData } from "@/components/announcement-banner";
import { useTranslations, useLocale } from "next-intl";
import { AdvancedAnalyticsData } from "@/lib/analytics";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ClientPerformanceMetrics } from "@/components/dashboard/client-performance-metrics";
import { formatMoney } from "@/lib/currencies";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";

interface DashboardClientProps {
  userName: string;
  isPro: boolean;
  selectedRange: string;
  paidRevenue: number;
  pendingRevenue: number;
  totalVolume: number;
  totalExpenses?: number;
  netProfit?: number;
  invoiceCount: number;
  used: number;
  limit: number;
  totalCustomers: number;
  recentInvoices: SerializedInvoice[];
  announcement?: AnnouncementData | null;
  analytics: AdvancedAnalyticsData;
  userId: string;
  hasBusinessName: boolean;
  hasBankAccount: boolean;
  hasInvoices: boolean;
}

export function DashboardClient({
  userName,
  isPro,
  selectedRange,
  paidRevenue,
  pendingRevenue,
  totalVolume,
  totalExpenses = 0,
  netProfit = 0,
  invoiceCount,
  used,
  limit,
  totalCustomers,
  recentInvoices,
  announcement = null,
  analytics,
  userId,
  hasBusinessName,
  hasBankAccount,
  hasInvoices,
}: DashboardClientProps) {
  const tDash = useTranslations("dashboard");
  const tInv = useTranslations("invoices");
  const locale = useLocale() === "en" ? "en" : "id";

  const rangeLabels: Record<string, string> = {
    month: tDash("rangeMonth"),
    year: tDash("rangeYear"),
    all: tDash("rangeAll"),
  };

  const periodLabel = rangeLabels[selectedRange] || tDash("rangeMonth");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Global Broadcast Announcement */}
      {announcement && <AnnouncementBanner announcement={announcement} />}

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        hasBusinessName={hasBusinessName}
        hasBankAccount={hasBankAccount}
        hasCustomers={totalCustomers > 0}
        hasInvoices={hasInvoices}
        userId={userId}
      />

      {/* Header: Mobile-first stack, desktop row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tDash("title")}
            </h1>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <SparklesIcon className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-emerald-400" />
                {tDash("planBadgePro")}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {tDash("planBadgeFree")}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {tDash("welcome", { name: userName })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/invoices/export`}
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs min-h-[44px]"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
            <span>{tDash("exportReport")}</span>
          </a>
          <Link
            href="/invoices/new"
            prefetch={true}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] shadow-xs min-h-[44px]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{tInv("newInvoice")}</span>
          </Link>
        </div>
      </div>

      {/* Period Filter Selector */}
      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-2xs w-fit">
        {(["month", "year", "all"] as const).map((r) => (
          <Link
            key={r}
            href={`/dashboard?range=${r}`}
            prefetch={true}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors min-h-[44px] sm:min-h-[32px] inline-flex items-center ${
              selectedRange === r
                ? "bg-[#0f6b4f] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {rangeLabels[r]}
          </Link>
        ))}
      </div>

      {/* Primary KPI Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Volume Transaksi */}
        <div
          role="group"
          tabIndex={0}
          className="min-w-0 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors hover:border-emerald-400 focus-visible:border-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:hover:border-emerald-500 dark:focus-visible:border-emerald-400 dark:focus-visible:outline-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tDash("totalRevenue")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formatMoney(totalVolume, "IDR", locale)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {invoiceCount} invoice • {periodLabel}
            </p>
          </div>
        </div>

        {/* Card 2: Pendapatan Lunas */}
        <div
          role="group"
          tabIndex={0}
          className="min-w-0 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors hover:border-emerald-400 focus-visible:border-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:hover:border-emerald-500 dark:focus-visible:border-emerald-400 dark:focus-visible:outline-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tDash("totalPaid")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400">
              <CheckBadgeIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
              {formatMoney(paidRevenue, "IDR", locale)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {tDash("paidRevenueSubtitle")}
            </p>
          </div>
        </div>

        {/* Card 3: Tagihan Tertunda (Pending / Overdue) */}
        <div
          role="group"
          tabIndex={0}
          className="min-w-0 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors hover:border-emerald-400 focus-visible:border-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:hover:border-emerald-500 dark:focus-visible:border-emerald-400 dark:focus-visible:outline-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tDash("unpaidAmount")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {formatMoney(pendingRevenue, "IDR", locale)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {tDash("unpaidAmountSubtitle")}
            </p>
          </div>
        </div>

        {/* Card 4: Kuota Invoice Bulanan */}
        <div
          role="group"
          tabIndex={0}
          className="min-w-0 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors hover:border-emerald-400 focus-visible:border-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:hover:border-emerald-500 dark:focus-visible:border-emerald-400 dark:focus-visible:outline-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tDash("monthlyLimit")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BanknotesIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {used} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {limit === Infinity ? "∞" : limit}</span>
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#0f6b4f] dark:bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${limit === Infinity ? 100 : Math.min(100, (used / limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profit & Loss Summary (Laba Bersih) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ScaleIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{tDash("profitLossTitle")}</span>
          </h2>
          <Link
            href="/expenses"
            prefetch={true}
            className="text-[11px] font-bold text-[#0f6b4f] dark:text-emerald-400 hover:underline"
          >
            {tDash("manageExpenses")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          {/* Pendapatan Lunas */}
          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4">
            <p className="text-[11px] font-bold text-[#0f6b4f] dark:text-emerald-400 uppercase tracking-wider">
              {tDash("plRevenue")}
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-[#0f6b4f] dark:text-emerald-400 mt-1 tabular-nums">
              {formatMoney(paidRevenue, "IDR", locale)}
            </p>
          </div>

          {/* Total Pengeluaran */}
          <div className="rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 p-4">
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {tDash("plExpenses")}
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              &minus; {formatMoney(totalExpenses, "IDR", locale)}
            </p>
          </div>

          {/* Laba Bersih */}
          <div className={`rounded-xl p-4 border ${netProfit >= 0 ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white" : "bg-rose-600 border-rose-600"}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${netProfit >= 0 ? "text-slate-300 dark:text-slate-600" : "text-rose-100"}`}>
              {tDash("plNetProfit")}
            </p>
            <p className={`text-lg sm:text-xl font-extrabold mt-1 tabular-nums ${netProfit >= 0 ? "text-white dark:text-slate-900" : "text-white"}`}>
              {formatMoney(netProfit, "IDR", locale)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {tDash("profitLossNote")}
        </p>
      </div>

      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {tDash("quickActionsTitle")}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/invoices/new"
            prefetch={true}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0c553e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:focus-visible:outline-emerald-400 shadow-xs"
          >
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
            {tInv("newInvoice")}
          </Link>
          <Link
            href="/customers"
            prefetch={true}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:focus-visible:outline-emerald-400 shadow-2xs"
          >
            <UserPlusIcon aria-hidden="true" className="h-5 w-5" />
            {tDash("addCustomer")}
          </Link>
        </div>
      </section>

      {/* Cashflow Bar Chart Component */}
      <CashflowChart data={analytics.monthlyCashflow} />

      {/* Advanced Client Performance & DSO Metrics (PRO) */}
      <ClientPerformanceMetrics analytics={analytics} isPro={isPro} />

      {/* Recent Invoices Table Component */}
      <RecentInvoices invoices={recentInvoices} />
    </div>
  );
}
