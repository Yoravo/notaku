"use client";

import Link from "next/link";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { statusConfig, formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { useLocale, useTranslations } from "next-intl";

interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface InvoiceItemData {
  id: string;
  number: string | null;
  status: InvoiceStatus;
  total: number;
  currency?: string;
  createdAt: string;
  customer: CustomerData;
}

interface InvoicesClientProps {
  invoices: InvoiceItemData[];
  total: number;
  totalAll: number;
  currentPage: number;
  totalPages: number;
  activeStatus: InvoiceStatus | "";
  exportUrl: string;
  from?: string;
  to?: string;
}

export function InvoicesClient({
  invoices,
  total,
  totalAll,
  currentPage,
  totalPages,
  activeStatus,
  exportUrl,
  from,
  to,
}: InvoicesClientProps) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
  const tStatus = useTranslations("common.status");

  // Explicit status label mapping (seller perspective)
  const sellerStatusLabelMap: Record<InvoiceStatus, string> = {
    DRAFT: tStatus("draft"),
    SENT: tStatus("sent"),
    PAID: tStatus("paid"),
    OVERDUE: tStatus("overdue"),
    CANCELLED: tStatus("cancelled"),
  };

  const filterTabs = [
    { label: tInv("filterAll"), value: "" },
    { label: sellerStatusLabelMap.DRAFT, value: "DRAFT" },
    { label: sellerStatusLabelMap.SENT, value: "SENT" },
    { label: sellerStatusLabelMap.PAID, value: "PAID" },
    { label: sellerStatusLabelMap.OVERDUE, value: "OVERDUE" },
    { label: sellerStatusLabelMap.CANCELLED, value: "CANCELLED" },
  ];

  const buildHref = (s: string, p = 1) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/invoices${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tInv("title")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {tInv("subtitle", { total: totalAll })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {total > 0 && (
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs min-h-[44px]"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-slate-400" />
              <span>{tInv("exportCsv")}</span>
            </a>
          )}
          <Link
            href="/invoices/new"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all shadow-xs min-h-[44px]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{tInv("newInvoice")}</span>
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = (activeStatus ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value)}
              prefetch={true}
              className={`whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all min-h-[38px] inline-flex items-center ${
                isActive
                  ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/20 text-[#0f6b4f] dark:text-emerald-400 border border-[#0f6b4f]/20 dark:border-emerald-500/30 shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center mb-3 border border-[#0f6b4f]/20">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {activeStatus
              ? tInv("noInvoicesStatus", { status: sellerStatusLabelMap[activeStatus] || activeStatus })
              : tInv("noInvoicesCreated")}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {!activeStatus
              ? tInv("emptyCreateFirst")
              : tInv("emptyStatusFilter")}
          </p>
          {!activeStatus && (
            <Link
              href="/invoices/new"
              prefetch={true}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs min-h-[44px]"
            >
              {tInv("createFirstInvoice")}
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Card View: Mobile only (md:hidden) */}
          <div className="space-y-2.5 md:hidden">
            {invoices.map((invoice) => {
              const s = statusConfig[invoice.status];
              const displayStatus = sellerStatusLabelMap[invoice.status];

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs active:bg-slate-50 dark:active:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-[#0f6b4f] dark:group-hover:text-emerald-400 transition-colors">
                        {invoice.number || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                        {invoice.customer.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {formatDateWIB(invoice.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                        {formatMoney(Number(invoice.total), invoice.currency || "IDR", locale)}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dotClassName}`} />
                        {displayStatus}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Table View: Desktop only (hidden md:block) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tInv("invoiceNumber")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tInv("customer")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tInv("issueDate")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tInv("status")}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {tInv("total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((invoice) => {
                  const s = statusConfig[invoice.status] || statusConfig.DRAFT;
                  const displayStatus = sellerStatusLabelMap[invoice.status] || tStatus("draft");

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          prefetch={true}
                          className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0f6b4f] dark:group-hover:text-emerald-400 transition-colors"
                        >
                          {invoice.number || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                        {invoice.customer.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {formatDateWIB(invoice.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dotClassName}`} />
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatMoney(Number(invoice.total), invoice.currency || "IDR", locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <p>
                {tInv.rich("pageIndicator", {
                  current: currentPage,
                  total: totalPages,
                  b: (chunks) => <strong className="text-slate-900 dark:text-white">{chunks}</strong>,
                })}
              </p>
              <div className="flex gap-2">
                <Link
                  href={buildHref(activeStatus ?? "", currentPage - 1)}
                  prefetch={true}
                  className={`flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all min-h-[36px] ${
                    currentPage <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-slate-50 text-slate-700 shadow-2xs"
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>{tInv("prev")}</span>
                </Link>
                <Link
                  href={buildHref(activeStatus ?? "", currentPage + 1)}
                  prefetch={true}
                  className={`flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-slate-50 text-slate-700 shadow-2xs"
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  <span>{tInv("next")}</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
