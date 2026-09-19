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
import { useTranslations } from "next-intl";

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
  const tBilling = useTranslations("billing");
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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tBilling("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tBilling("subtitle")}
        </p>
      </div>

      {/* Active Plan Overview Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isPro
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400"
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isPro ? tBilling("proMember") : tBilling("freeMember")}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isPro
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isPro ? tBilling("activeBadge") : tBilling("freeBadge")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPro ? tBilling("proDesc") : tBilling("freeDesc")}
              </p>
            </div>
          </div>

          {!isPro && (
            <UpgradeButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer min-h-[44px]" />
          )}
        </div>

        {/* PRO Expiration details if active */}
        {isPro && user.subscription?.currentPeriodEnd && (
          <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
              <CheckBadgeIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {tBilling("activeUntil")}{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatDateWIB(user.subscription.currentPeriodEnd, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              {tBilling("autoRenewNote")}
            </span>
          </div>
        )}

        {/* Quota Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Invoices Quota */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tBilling("invoicesQuota")}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                {isPro ? (
                  <span className="text-emerald-700 dark:text-emerald-400">{tBilling("quotaUnlimited")}</span>
                ) : (
                  `${invoiceUsage.used} / ${invoiceUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      invoicePercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${invoicePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {tBilling("quotaResetNote")}
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                {tBilling("proBenefitInvoices")}
              </p>
            )}
          </div>

          {/* Customers Quota */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/60 p-4 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {tBilling("customersQuota")}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                {isPro ? (
                  <span className="text-emerald-700 dark:text-emerald-400">{tBilling("quotaUnlimited")}</span>
                ) : (
                  `${customerUsage.used} / ${customerUsage.limit}`
                )}
              </span>
            </div>

            {!isPro && (
              <>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      customerPercent >= 80 ? "bg-rose-500" : "bg-[#0f6b4f]"
                    }`}
                    style={{ width: `${customerPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {tBilling("freeLimitCustomers")}
                </p>
              </>
            )}

            {isPro && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckBadgeIcon className="w-3.5 h-3.5" />
                {tBilling("proBenefitCustomers")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {tBilling("compareTitle")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tBilling("compareSubtitle")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[320px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-3">{tBilling("tableFeature")}</th>
                <th className="py-3 px-3 text-center">{tBilling("tableFree")}</th>
                <th className="py-3 px-3 text-center text-[#0f6b4f] bg-emerald-50/50 rounded-t-lg">
                  {tBilling("tablePro")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("monthlyInvoiceLimit")}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {tBilling("fiveInvoices")}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {tBilling("unlimited")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("watermarkBranding")}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {tBilling("withWatermark")}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {tBilling("noWatermark")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("pdfTemplates")}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {tBilling("classicOnly")}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {tBilling("allTemplates")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("automatedPayments")}
                </td>
                <td className="py-3 px-3 text-center text-emerald-600 font-bold">
                  {tBilling("available")}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {tBilling("availableWithAlerts")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("savedClientLimit")}
                </td>
                <td className="py-3 px-3 text-center text-slate-600">
                  {tBilling("twentyClients")}
                </td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50">
                  {tBilling("unlimited")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-slate-900">
                  {tBilling("digitalSignatureStamp")}
                </td>
                <td className="py-3 px-3 text-center text-slate-400">-</td>
                <td className="py-3 px-3 text-center font-bold text-[#0f6b4f] bg-emerald-50/50 rounded-b-lg">
                  {tBilling("available")}
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
