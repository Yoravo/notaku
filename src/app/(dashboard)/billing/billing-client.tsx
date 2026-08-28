"use client";

import { UpgradeButton } from "@/components/upgrade-button";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  SparklesIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

type UserBillingData = {
  id: string;
  name: string;
  email: string;
  plan: string;
  subscription: {
    currentPeriodEnd: Date | null;
    status: string;
  } | null;
};

interface BillingClientProps {
  user: UserBillingData;
  invoiceUsage: {
    used: number;
    limit: number;
  };
  customerUsage: {
    used: number;
    limit: number;
  };
}

export function BillingClient({
  user,
  invoiceUsage,
  customerUsage,
}: BillingClientProps) {
  const isPro = user.plan === "PRO";

  const invoicePercent = isPro
    ? 0
    : Math.min(100, Math.round((invoiceUsage.used / invoiceUsage.limit) * 100));

  const customerPercent = isPro
    ? 0
    : Math.min(100, Math.round((customerUsage.used / customerUsage.limit) * 100));

  return (
    <div className="space-y-6">
      {/* Active Plan Overview Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isPro
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-50 text-[#0f6b4f]"
              }`}
            >
              {isPro ? (
                <SparklesIcon className="h-6 w-6" />
              ) : (
                <BoltIcon className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {isPro ? "NotaKu PRO Member" : "Paket Free (Starter)"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isPro
                      ? "bg-amber-50 text-amber-800 border border-amber-300"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {isPro ? "AKTIF" : "GRATIS"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPro
                  ? "Akses penuh tanpa batas seluruh fitur bisnis & pembayaran digital"
                  : "Cocok untuk freelancer dan bisnis yang baru merintis"}
              </p>
            </div>
          </div>

          {!isPro && (
            <UpgradeButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer" />
          )}
        </div>

        {/* PRO Expiration details if active */}
        {isPro && user.subscription?.currentPeriodEnd && (
          <div className="rounded-xl bg-amber-50/60 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <CheckBadgeIcon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Masa aktif langganan PRO berlaku hingga:{" "}
                <strong className="font-bold text-gray-900">
                  {formatDateWIB(user.subscription.currentPeriodEnd, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-amber-700">
              Perpanjangan otomatis via Mayar Gateway
            </span>
          </div>
        )}

        {/* Quota Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Invoices Quota */}
          <div className="rounded-xl bg-gray-50/80 p-4 border border-gray-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">
                  Invoice Bulan Ini
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-gray-900">
                {isPro ? (
                  <span className="text-emerald-700">Unlimited (∞)</span>
                ) : (
                  `${invoiceUsage.used} / ${invoiceUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      invoicePercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${invoicePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Kuota direset otomatis setiap tanggal 1 awal bulan (WIB).
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                Bebas buat invoice sebanyak apa pun tanpa watermark
              </p>
            )}
          </div>

          {/* Customers Quota */}
          <div className="rounded-xl bg-gray-50/80 p-4 border border-gray-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">
                  Total Pelanggan Terdaftar
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-gray-900">
                {isPro ? (
                  <span className="text-emerald-700">Unlimited (∞)</span>
                ) : (
                  `${customerUsage.used} / ${customerUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      customerPercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${customerPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Maksimal 20 kontak pelanggan tersimpan di paket gratis.
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                Database kontak pelanggan tidak terbatas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Perbandingan Fitur Paket
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tingkatkan produktivitas bisnis Anda dengan fitur eksklusif NotaKu PRO.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                <th className="py-3 px-3">Fitur & Keunggulan</th>
                <th className="py-3 px-3 text-center">Paket Free</th>
                <th className="py-3 px-3 text-center text-[#0f6b4f] bg-emerald-50/50 rounded-t-lg">
                  NotaKu PRO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Batas Invoice per Bulan
                </td>
                <td className="py-3 px-3 text-center text-gray-600">5 Invoice</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Unlimited (Tanpa Batas)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Watermark & Branding NotaKu
                </td>
                <td className="py-3 px-3 text-center text-gray-600">Ada Watermark</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Bersih / Tanpa Watermark
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Pilihan Template PDF Invoice
                </td>
                <td className="py-3 px-3 text-center text-gray-600">
                  Hanya Template Classic
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Classic, Modern, Minimal
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Pembayaran Digital Otomatis (QRIS / VA)
                </td>
                <td className="py-3 px-3 text-center text-emerald-600 font-bold">
                  Tersedia
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Tersedia + Notifikasi Instan
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Batas Database Pelanggan
                </td>
                <td className="py-3 px-3 text-center text-gray-600">20 Pelanggan</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Unlimited
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-gray-900">
                  Tanda Tangan Digital & Stempel Usaha
                </td>
                <td className="py-3 px-3 text-center text-gray-400">—</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50 rounded-b-lg">
                  Tersedia
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {!isPro && (
          <div className="pt-3 flex justify-end">
            <UpgradeButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}
