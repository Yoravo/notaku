"use client";

import Link from "next/link";
import {
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AdvancedAnalyticsData } from "@/lib/analytics";
import { formatCurrency } from "@/lib/pdf/format";
import { useLanguage } from "@/lib/i18n/context";

interface ClientPerformanceMetricsProps {
  analytics: AdvancedAnalyticsData;
  isPro: boolean;
}

export function ClientPerformanceMetrics({
  analytics,
  isPro,
}: ClientPerformanceMetricsProps) {
  const { locale } = useLanguage();

  const {
    dsoDays,
    onTimePaymentRate,
    totalPaidCount,
    totalLateCount,
    topClients,
    avgInvoiceValue,
  } = analytics;

  // Evaluasi label DSO
  let dsoStatusLabel = locale === "id" ? "Normal & Sehat" : "Healthy";
  let dsoBadgeClass = "bg-emerald-50 text-[#0f6b4f] border-emerald-200";

  if (dsoDays === null) {
    dsoStatusLabel = locale === "id" ? "Belum Ada Data" : "No Data Yet";
    dsoBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
  } else if (dsoDays <= 14) {
    dsoStatusLabel = locale === "id" ? "Sangat Cepat (< 14 hari)" : "Very Fast (< 14 days)";
    dsoBadgeClass = "bg-emerald-50 text-[#0f6b4f] border-emerald-200";
  } else if (dsoDays <= 30) {
    dsoStatusLabel = locale === "id" ? "Normal & Sehat (14 - 30 hari)" : "Healthy (14 - 30 days)";
    dsoBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else {
    dsoStatusLabel = locale === "id" ? "Perlu Follow-up (> 30 hari)" : "Needs Attention (> 30 days)";
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
              <h2 className="text-lg font-bold text-slate-900">
                {locale === "id" ? "Performa Pembayaran & Loyalitas Klien" : "Client Payment & Cash Performance"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0f6b4f] border border-emerald-200 shadow-2xs">
                <SparklesIcon className="w-3 h-3 text-[#0f6b4f]" />
                PRO Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "id"
                ? "Metrik kecepatan pembayaran klien (DSO), rasio tepat waktu, dan pelanggan paling bernilai."
                : "Payment velocity (DSO), on-time settlement rates, and top revenue-generating clients."}
            </p>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Metric 1: DSO (Days Sales Outstanding) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {locale === "id" ? "Rata-rata Durasi Bayar (DSO)" : "Payment Velocity (DSO)"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {dsoDays !== null ? `${dsoDays} hari` : "—"}
                </p>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${dsoBadgeClass}`}>
                  {dsoStatusLabel}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {locale === "id"
                  ? "Rata-rata waktu yang dibutuhkan pelanggan untuk melunasi tagihan sejak faktur diterbitkan."
                  : "Average number of days clients take to settle invoices after issuance."}
              </p>
            </div>
          </div>

          {/* Metric 2: On-Time Settlement Rate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {locale === "id" ? "Tepat Waktu (On-Time)" : "On-Time Rate"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                <CheckCircleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight text-[#0f6b4f] tabular-nums">
                  {onTimePaymentRate}%
                </p>
                <span className="text-xs text-slate-500 font-medium">
                  ({totalPaidCount} tepat waktu / {totalLateCount} lewat tempo)
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#0f6b4f] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, onTimePaymentRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metric 3: Rata-rata Nilai Transaksi */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {locale === "id" ? "Rata-rata Nilai Invoice" : "Average Invoice Size"}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatCurrency(avgInvoiceValue)}
              </p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {locale === "id"
                  ? "Nilai rata-rata per transaksi invoice yang berhasil terbayar lunas."
                  : "Average monetary amount per settled invoice transaction."}
              </p>
            </div>
          </div>
        </div>

        {/* Top 5 Clients Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-[#0f6b4f]">
                <UsersIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locale === "id" ? "5 Pelanggan dengan Realisasi Pembayaran Terbesar" : "Top 5 Clients by Revenue Contribution"}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === "id"
                    ? "Daftar klien paling berkontribusi terhadap pendapatan usaha Anda."
                    : "Key clients driving the highest collected billing volume."}
                </p>
              </div>
            </div>

            <Link
              href="/customers"
              prefetch={true}
              className="text-xs font-semibold text-[#0f6b4f] hover:text-[#0c553e] transition-colors"
            >
              {locale === "id" ? "Lihat Semua Klien →" : "View All Clients →"}
            </Link>
          </div>

          {topClients.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500">
                {locale === "id"
                  ? "Belum ada riwayat transaksi lunas dengan pelanggan."
                  : "No completed invoice transactions recorded with clients yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold text-xs">
                    <th className="py-3 px-4">{locale === "id" ? "Pelanggan" : "Client"}</th>
                    <th className="py-3 px-4 text-center">{locale === "id" ? "Total Invoice" : "Invoices"}</th>
                    <th className="py-3 px-4 text-center">{locale === "id" ? "Kecepatan Bayar" : "Avg Settlement"}</th>
                    <th className="py-3 px-4 text-right">{locale === "id" ? "Total Kontribusi Lunas" : "Total Settled"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {topClients.map((client, idx) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <div className="truncate max-w-[200px] sm:max-w-none">
                            <span className="font-bold text-slate-900 block truncate">
                              {client.name}
                            </span>
                            {client.email && (
                              <span className="text-[11px] text-slate-400 block truncate font-normal">
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {client.paidInvoices} / {client.totalInvoices} lunas
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums">
                        {client.averagePaymentDays !== null ? (
                          <span className="font-semibold text-slate-700">
                            ~{client.averagePaymentDays} hari
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
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
            {locale === "id"
              ? "Buka Analitik Lanjutan & Insight Pelanggan"
              : "Unlock Advanced Analytics & Client Insights"}
          </h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
            {locale === "id"
              ? "Pantau durasi pembayaran klien (DSO), tren arus kas bulanan, rasio ketepatan waktu, dan identifikasi pelanggan terbaik Anda dengan paket NotaKu PRO."
              : "Track Days Sales Outstanding (DSO), cashflow trends, on-time rates, and identify your most valuable clients with NotaKu PRO."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/billing"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{locale === "id" ? "Upgrade ke PRO (Rp49.000)" : "Upgrade to PRO"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
