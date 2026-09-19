"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/pdf/format";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";

export type AdminInvoiceItem = {
  id: string;
  number: string;
  publicId: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    businessName: string | null;
    plan: string;
  };
  customer: {
    id: string;
    name: string;
    email: string | null;
  };
};

export type AdminInvoicesClientProps = {
  invoices: AdminInvoiceItem[];
  totalAllInvoices: number;
  totalFilteredInvoices: number;
  paidInvoicesTotal: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  statusFilter: string;
  statusCountMap: Record<string, number>;
};

export function AdminInvoicesClient({
  invoices,
  totalAllInvoices,
  totalFilteredInvoices,
  paidInvoicesTotal,
  totalPages,
  currentPage,
  searchQuery,
  statusFilter,
  statusCountMap,
}: AdminInvoicesClientProps) {
  const locale = useLocale() as "id" | "en";
  const tAdmin = useTranslations("admin");
  const tStatus = useTranslations("common.status");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          bg: "bg-emerald-50 border-emerald-200/60",
          text: "text-[#0f6b4f]",
          dot: "bg-emerald-500",
          label: tStatus("paid"),
        };
      case "SENT":
        return {
          bg: "bg-blue-50 border-blue-200/60",
          text: "text-blue-700",
          dot: "bg-blue-500",
          label: tStatus("sent"),
        };
      case "DRAFT":
        return {
          bg: "bg-slate-100 border-slate-200",
          text: "text-slate-600",
          dot: "bg-slate-400",
          label: tStatus("draft"),
        };
      case "OVERDUE":
        return {
          bg: "bg-rose-50 border-rose-200/60",
          text: "text-rose-700",
          dot: "bg-rose-500",
          label: tStatus("overdue"),
        };
      case "CANCELLED":
        return {
          bg: "bg-gray-100 border-gray-200",
          text: "text-gray-600",
          dot: "bg-gray-400",
          label: tStatus("cancelled"),
        };
      default:
        return {
          bg: "bg-slate-100 border-slate-200",
          text: "text-slate-600",
          dot: "bg-slate-400",
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400" />
            <span>{tAdmin("invoicesTitle")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tAdmin("invoicesSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-28">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
              {tAdmin("totalInvoicesLabel")}
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
              {totalAllInvoices.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-32">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#0f6b4f] dark:text-emerald-400">
              {tAdmin("totalGmvPaid")}
            </p>
            <p className="text-lg font-extrabold text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
              {formatCurrency(paidInvoicesTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter by Status Quick Tabs & Search Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        {/* Status Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Link
            href={`/admin/invoices?q=${searchQuery}`}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer shadow-2xs min-h-[44px] sm:min-h-[36px] inline-flex items-center ${
              !statusFilter
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tAdmin("filterAll")} ({totalAllInvoices})
          </Link>
          {["PAID", "SENT", "DRAFT", "OVERDUE", "CANCELLED"].map((st) => (
            <Link
              key={st}
              href={`/admin/invoices?q=${searchQuery}&status=${st}`}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer shadow-2xs min-h-[44px] sm:min-h-[36px] inline-flex items-center ${
                statusFilter === st
                  ? "bg-slate-900 dark:bg-slate-800 text-white"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st} ({statusCountMap[st] || 0})
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-9 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={tAdmin("searchPlaceholder")}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors min-h-[44px]"
            />
          </div>

          <div className="sm:col-span-3">
            <input type="hidden" name="status" value={statusFilter} />
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer shadow-2xs min-h-[44px]"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">{tAdmin("colInvoiceNumber")}</th>
                <th className="px-4 py-3.5">{tAdmin("colCreator")}</th>
                <th className="px-4 py-3.5">{tAdmin("colBilledTo")}</th>
                <th className="px-4 py-3.5">{tAdmin("colStatus")}</th>
                <th className="px-4 py-3.5 text-right">{tAdmin("colAmount")}</th>
                <th className="px-4 py-3.5">{tAdmin("tableDate")}</th>
                <th className="px-5 py-3.5 text-right">{tAdmin("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs font-medium"
                  >
                    {tAdmin("emptyInvoices")}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      {/* Invoice Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {inv.number}
                        </span>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {inv.itemCount} item
                        </p>
                      </td>

                      {/* Creator info */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] text-xs sm:text-sm">
                          {inv.user.name || "User"}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[160px] font-mono">
                          {inv.user.email}
                        </p>
                        {inv.user.businessName && (
                          <p className="text-[11px] text-[#0f6b4f] dark:text-emerald-400 font-semibold truncate max-w-[160px] mt-0.5">
                            {inv.user.businessName}
                          </p>
                        )}
                      </td>

                      {/* Customer info */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] text-xs sm:text-sm">
                          {inv.customer.name}
                        </p>
                        {inv.customer.email && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px] font-mono">
                            {inv.customer.email}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(inv.total)}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {formatDateWIB(inv.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Public Link Action */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <a
                          href={`/i/${inv.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs min-h-[44px] sm:min-h-[36px]"
                        >
                          <span>{tAdmin("viewPublic")}</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50/80 dark:bg-slate-800/80 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {tAdmin("paginationSummary", { current: currentPage, total: totalPages, count: `${totalFilteredInvoices} total invoice` })}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
                    currentPage - 1
                  }`}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors min-h-[44px] sm:min-h-[36px] inline-flex items-center"
                >
                  {tAdmin("paginationPrev")}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
                    currentPage + 1
                  }`}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors min-h-[44px] sm:min-h-[36px] inline-flex items-center"
                >
                  {tAdmin("paginationNext")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
