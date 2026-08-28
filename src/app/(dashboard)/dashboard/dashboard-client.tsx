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
import { AnnouncementBanner } from "@/components/announcement-banner";
import { useLanguage } from "@/lib/i18n/context";

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
  totalCustomers,
  recentInvoices,
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
    <div className="space-y-6">
      {/* Global Broadcast Announcement */}
      <AnnouncementBanner />

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
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>{t.dashboard?.createInvoice || (locale === "id" ? "Buat Invoice" : "Create Invoice")}</span>
          </Link>
        </div>
      </div>

      {/* Financial Overview & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {locale === "id" ? "Ringkasan Keuangan & Tagihan" : "Financial & Billing Summary"}
          </h2>
          <p className="text-xs text-slate-500">
            {locale === "id" ? (
              <>
                Pantau arus kas, total terbayar, dan tagihan aktif periode{" "}
                <span className="font-semibold text-slate-700 lowercase">{periodLabel}</span>.
              </>
            ) : (
              <>
                Track cash flow, settled volume, and active billings for{" "}
                <span className="font-semibold text-slate-700 lowercase">{periodLabel}</span>.
              </>
            )}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-xl bg-slate-100/80 p-1 self-start sm:self-auto border border-slate-200/60">
          {[
            { id: "month", label: locale === "id" ? "Bulan Ini" : "This Month" },
            { id: "year", label: locale === "id" ? "Tahun Ini" : "This Year" },
            { id: "all", label: locale === "id" ? "Semua Waktu" : "All Time" },
          ].map((tab) => {
            const active = selectedRange === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/dashboard?range=${tab.id}`}
                prefetch={true}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  active
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Financial Stats: 4 Cards Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pendapatan Lunas */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#0f6b4f] uppercase tracking-wider">
              {locale === "id" ? "Pendapatan Terbayar" : "Settled Revenue"}
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0f6b4f] border border-emerald-200/60">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            Rp{paidRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-[#0f6b4f] font-semibold">
            {locale === "id" ? `Status Lunas (${periodLabel})` : `Settled Status (${periodLabel})`}
          </p>
        </div>

        {/* Tagihan Tertunda */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              {locale === "id" ? "Tagihan Tertunda" : "Pending Invoices"}
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-200/60">
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            Rp{pendingRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-amber-700 font-semibold">
            {locale === "id" ? "Terkirim & Lewat Tempo" : "Sent & Overdue"}
          </p>
        </div>

        {/* Total Omset/Volume Tagihan */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              {locale === "id" ? "Total Volume Tagihan" : "Total Invoice Volume"}
            </p>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200/60">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            Rp{totalVolume.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-blue-700 font-semibold">
            {locale === "id" ? `Akumulasi nilai (${periodLabel})` : `Accumulated value (${periodLabel})`}
          </p>
        </div>

        {/* Kuota & Total Invoice */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {locale === "id" ? "Volume & Kuota" : "Volume & Quota"}
            </p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/60">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {isPro ? String(invoiceCount) : `${used}/${limit}`}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            {isPro
              ? locale === "id"
                ? "Paket Pro (Unlimited Invoice)"
                : "PRO Plan (Unlimited Invoices)"
              : locale === "id"
              ? `Paket Free • ${totalCustomers} Pelanggan`
              : `Free Plan • ${totalCustomers} Clients`}
          </p>
        </div>
      </div>

      {/* Recent Invoices: Card view mobile, table desktop */}
      <RecentInvoices invoices={recentInvoices} />
    </div>
  );
}
