"use client";

import { UpgradeButton } from "@/components/upgrade-button";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  SparklesIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  UsersIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();
  const isPro = user.plan === "PRO";

  const invoicePercent = isPro
    ? 0
    : Math.min(100, Math.round((invoiceUsage.used / invoiceUsage.limit) * 100));

  const customerPercent = isPro
    ? 0
    : Math.min(100, Math.round((customerUsage.used / customerUsage.limit) * 100));

  return (
    <div className="space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {t.billing?.title || (locale === "id" ? "Paket Langganan & Kuota" : "Subscription & Usage Limits")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.billing?.subtitle ||
            (locale === "id"
              ? "Pantau sisa kuota invoice bulanan, jumlah pelanggan terdaftar, dan upgrade ke NotaKu PRO."
              : "Monitor monthly invoice quota, saved client contacts, and upgrade to NotaKu PRO.")}
        </p>
      </div>

      {/* Active Plan Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
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
                <h2 className="text-lg font-bold text-slate-900">
                  {isPro
                    ? t.billing?.proMember || "NotaKu PRO Member"
                    : t.billing?.freeMember || (locale === "id" ? "Paket Free (Starter)" : "Free Plan (Starter)")}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isPro
                      ? "bg-amber-50 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isPro
                    ? t.billing?.activeBadge || (locale === "id" ? "AKTIF" : "ACTIVE")
                    : t.billing?.freeBadge || (locale === "id" ? "GRATIS" : "FREE")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPro
                  ? t.billing?.proDesc ||
                    (locale === "id"
                      ? "Akses penuh tanpa batas seluruh fitur bisnis & pembayaran digital"
                      : "Unlimited access to all business features & automated digital payments")
                  : t.billing?.freeDesc ||
                    (locale === "id"
                      ? "Cocok untuk freelancer dan bisnis yang baru merintis"
                      : "Perfect for freelancers and early-stage business owners")}
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
                {t.billing?.activeUntil || (locale === "id" ? "Masa aktif langganan PRO berlaku hingga:" : "PRO active subscription valid until:")}{" "}
                <strong className="font-bold text-slate-900">
                  {formatDateWIB(user.subscription.currentPeriodEnd, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-amber-700">
              {t.billing?.autoRenewNote || (locale === "id" ? "Perpanjangan otomatis via Mayar Gateway" : "Automatic renewal via Mayar Gateway")}
            </span>
          </div>
        )}

        {/* Quota Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Invoices Quota */}
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">
                  {t.billing?.invoicesQuota || (locale === "id" ? "Invoice Bulan Ini" : "Invoices This Month")}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-900">
                {isPro ? (
                  <span className="text-emerald-700">{locale === "id" ? "Unlimited (∞)" : "Unlimited (∞)"}</span>
                ) : (
                  `${invoiceUsage.used} / ${invoiceUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      invoicePercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${invoicePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {t.billing?.quotaResetNote || (locale === "id" ? "Kuota direset otomatis setiap tanggal 1 awal bulan (WIB)." : "Quota resets automatically on the 1st of every month (WIB).")}
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                {t.billing?.proBenefitInvoices || (locale === "id" ? "Bebas buat invoice sebanyak apa pun tanpa watermark" : "Create unlimited invoices without any watermark")}
              </p>
            )}
          </div>

          {/* Customers Quota */}
          <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">
                  {t.billing?.customersQuota || (locale === "id" ? "Total Pelanggan Terdaftar" : "Total Saved Clients")}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-900">
                {isPro ? (
                  <span className="text-emerald-700">{locale === "id" ? "Unlimited (∞)" : "Unlimited (∞)"}</span>
                ) : (
                  `${customerUsage.used} / ${customerUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      customerPercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${customerPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {t.billing?.freeLimitCustomers || (locale === "id" ? "Maksimal 20 kontak pelanggan tersimpan di paket gratis." : "Up to 20 client contacts saved on the free plan.")}
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                {t.billing?.proBenefitCustomers || (locale === "id" ? "Database kontak pelanggan tidak terbatas" : "Unlimited client contact database")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t.billing?.compareTitle || (locale === "id" ? "Perbandingan Fitur Paket" : "Plan Feature Comparison")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.billing?.compareSubtitle || (locale === "id" ? "Tingkatkan produktivitas bisnis Anda dengan fitur eksklusif NotaKu PRO." : "Elevate your business productivity with exclusive NotaKu PRO features.")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-3">{t.billing?.tableFeature || (locale === "id" ? "Fitur & Keunggulan" : "Features & Benefits")}</th>
                <th className="py-3 px-3 text-center">{t.billing?.tableFree || (locale === "id" ? "Paket Free" : "Free Plan")}</th>
                <th className="py-3 px-3 text-center text-[#0f6b4f] bg-emerald-50/50 rounded-t-lg">
                  {t.billing?.tablePro || "NotaKu PRO"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Batas Invoice per Bulan" : "Monthly Invoice Limit"}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {locale === "id" ? "5 Invoice" : "5 Invoices"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {locale === "id" ? "Unlimited (Tanpa Batas)" : "Unlimited"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Watermark & Branding NotaKu" : "NotaKu Watermark & Branding"}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {locale === "id" ? "Ada Watermark" : "With Watermark"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {locale === "id" ? "Bersih / Tanpa Watermark" : "Clean / No Watermark"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Pilihan Template PDF Invoice" : "PDF Layout Templates"}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {locale === "id" ? "Hanya Template Classic" : "Classic Only"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  Classic, Modern, Minimal
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Pembayaran Digital Otomatis (QRIS / VA)" : "Automated Digital Payments (QRIS / VA)"}
                </td>
                <td className="py-3 px-3 text-center text-emerald-600 font-bold">
                  {locale === "id" ? "Tersedia" : "Available"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {locale === "id" ? "Tersedia + Notifikasi Instan" : "Available + Instant Alerts"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Batas Database Pelanggan" : "Saved Client Limit"}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {locale === "id" ? "20 Pelanggan" : "20 Clients"}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {locale === "id" ? "Unlimited" : "Unlimited"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {locale === "id" ? "Tanda Tangan Digital & Stempel Usaha" : "Digital Signature & Company Stamp"}
                </td>
                <td className="py-3 px-3 text-center text-slate-400">—</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50 rounded-b-lg">
                  {locale === "id" ? "Tersedia" : "Available"}
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
