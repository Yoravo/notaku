"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/pdf/format";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          bg: "bg-emerald-50 border-emerald-200/60",
          text: "text-[#0f6b4f]",
          dot: "bg-emerald-500",
          label: locale === "id" ? "Lunas" : "Paid",
        };
      case "SENT":
        return {
          bg: "bg-blue-50 border-blue-200/60",
          text: "text-blue-700",
          dot: "bg-blue-500",
          label: locale === "id" ? "Terkirim" : "Sent",
        };
      case "DRAFT":
        return {
          bg: "bg-slate-100 border-slate-200",
          text: "text-slate-600",
          dot: "bg-slate-400",
          label: locale === "id" ? "Draft" : "Draft",
        };
      case "OVERDUE":
        return {
          bg: "bg-rose-50 border-rose-200/60",
          text: "text-rose-700",
          dot: "bg-rose-500",
          label: locale === "id" ? "Jatuh Tempo" : "Overdue",
        };
      case "CANCELLED":
        return {
          bg: "bg-gray-100 border-gray-200",
          text: "text-gray-600",
          dot: "bg-gray-400",
          label: locale === "id" ? "Dibatalkan" : "Cancelled",
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
            <span>
              {t.admin?.invoices || (locale === "id" ? "Monitoring Seluruh Invoice" : "All Invoices Monitoring")}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {locale === "id"
              ? "Pantau peredaran invoice publik, total transaksi, dan verifikasi invoice pengguna."
              : "Monitor public invoice distribution, platform transaction volume, and user invoices."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-28">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {locale === "id" ? "Total Invoice" : "Total Invoices"}
            </p>
            <p className="text-lg font-extrabold text-slate-900 tabular-nums">
              {totalAllInvoices.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-32">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#0f6b4f]">
              {locale === "id" ? "Total Lunas (GMV)" : "Total Paid (GMV)"}
            </p>
            <p className="text-lg font-extrabold text-[#0f6b4f] tabular-nums">
              {formatCurrency(paidInvoicesTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter by Status Quick Tabs & Search Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        {/* Status Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Link
            href={`/admin/invoices?q=${searchQuery}`}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
              !statusFilter
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {locale === "id" ? "Semua" : "All"} ({totalAllInvoices})
          </Link>
          {["PAID", "SENT", "DRAFT", "OVERDUE", "CANCELLED"].map((st) => (
            <Link
              key={st}
              href={`/admin/invoices?q=${searchQuery}&status=${st}`}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              placeholder={
                locale === "id"
                  ? "Cari nomor invoice, nama pembuat, email, atau pelanggan..."
                  : "Search invoice number, creator name, email, or client..."
              }
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <input type="hidden" name="status" value={statusFilter} />
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl py-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              {locale === "id" ? "Cari Invoice" : "Search Invoices"}
            </button>
          </div>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">{locale === "id" ? "No. Invoice" : "Invoice No."}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Pembuat (User)" : "Creator (User)"}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Ditagihkan Ke" : "Billed To"}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Status" : "Status"}</th>
                <th className="px-4 py-3.5 text-right">{locale === "id" ? "Nominal" : "Amount"}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Tgl Dibuat" : "Created Date"}</th>
                <th className="px-5 py-3.5 text-right">{locale === "id" ? "Aksi" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-400 text-xs font-medium"
                  >
                    {locale === "id"
                      ? "Tidak ada invoice yang ditemukan."
                      : "No invoices matched the current query."}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = getStatusBadge(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                          {inv.number}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {inv.itemCount} item
                        </p>
                      </td>

                      {/* Creator info */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 truncate max-w-[160px] text-xs sm:text-sm">
                          {inv.user.name || "User"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px] font-mono">
                          {inv.user.email}
                        </p>
                        {inv.user.businessName && (
                          <p className="text-[11px] text-[#0f6b4f] font-semibold truncate max-w-[160px] mt-0.5">
                            {inv.user.businessName}
                          </p>
                        )}
                      </td>

                      {/* Customer info */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 truncate max-w-[150px] text-xs sm:text-sm">
                          {inv.customer.name}
                        </p>
                        {inv.customer.email && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px] font-mono">
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
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(inv.total)}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap">
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                        >
                          <span>{locale === "id" ? "Lihat Web" : "View Live"}</span>
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
          <div className="bg-slate-50/80 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              {locale === "id" ? (
                <>
                  Menampilkan hal <strong className="text-slate-800">{currentPage}</strong> dari{" "}
                  <strong className="text-slate-800">{totalPages}</strong> ({totalFilteredInvoices} total invoice)
                </>
              ) : (
                <>
                  Showing page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                  <strong className="text-slate-800">{totalPages}</strong> ({totalFilteredInvoices} total invoices)
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
                    currentPage - 1
                  }`}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  {locale === "id" ? "Sebelumnya" : "Previous"}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
                    currentPage + 1
                  }`}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  {locale === "id" ? "Berikutnya" : "Next"}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
