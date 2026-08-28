"use client";

import Link from "next/link";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { statusLabel, formatDateWIB } from "@/lib/invoice-utils";
import { useLanguage } from "@/lib/i18n/context";

interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface InvoiceItemData {
  id: string;
  number: string | null;
  status: string;
  total: number;
  createdAt: string;
  customer: CustomerData;
}

interface InvoicesClientProps {
  invoices: InvoiceItemData[];
  total: number;
  totalAll: number;
  currentPage: number;
  totalPages: number;
  activeStatus: string;
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
  const { t, locale } = useLanguage();

  const filterTabs = [
    { label: t.invoices?.filterAll || (locale === "id" ? "Semua Status" : "All Statuses"), value: "" },
    { label: t.invoices?.filterDraft || (locale === "id" ? "Draft" : "Draft"), value: "DRAFT" },
    { label: t.invoices?.filterSent || (locale === "id" ? "Terkirim" : "Sent"), value: "SENT" },
    { label: t.invoices?.filterPaid || (locale === "id" ? "Lunas" : "Paid"), value: "PAID" },
    { label: t.invoices?.filterOverdue || (locale === "id" ? "Lewat Tempo" : "Overdue"), value: "OVERDUE" },
    { label: t.invoices?.filterCancelled || (locale === "id" ? "Dibatalkan" : "Cancelled"), value: "CANCELLED" },
  ];

  const statusTextMap: Record<string, string> = {
    DRAFT: t.invoices?.statusDraft || "Draft",
    SENT: t.invoices?.statusSent || "Terkirim",
    PAID: t.invoices?.statusPaid || "Lunas",
    OVERDUE: t.invoices?.statusOverdue || "Lewat Tempo",
    CANCELLED: t.invoices?.statusCancelled || "Dibatalkan",
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.invoices?.title || (locale === "id" ? "Daftar Invoice & Tagihan" : "Invoices & Billing")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {locale === "id"
              ? `Kelola ${totalAll} invoice transaksi bisnis dan pantau status pembayarannya.`
              : `Manage ${totalAll} business invoices and track their payment statuses.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {total > 0 && (
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-slate-400" />
              <span>{locale === "id" ? "Ekspor CSV" : "Export CSV"}</span>
            </a>
          )}
          <Link
            href="/invoices/new"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{t.invoices?.newInvoice || (locale === "id" ? "Buat Invoice" : "Create Invoice")}</span>
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = (activeStatus ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value)}
              prefetch={true}
              className={`whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                isActive
                  ? "bg-[#0f6b4f]/10 text-[#0f6b4f] border border-[#0f6b4f]/20 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center mb-3 border border-[#0f6b4f]/20">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {activeStatus
              ? locale === "id"
                ? `Tidak ada invoice dengan status ${statusTextMap[activeStatus] || activeStatus}`
                : `No invoices found with status ${statusTextMap[activeStatus] || activeStatus}`
              : locale === "id"
              ? "Belum ada invoice dibuat"
              : "No invoices created yet"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {!activeStatus
              ? locale === "id"
                ? "Mulai buat invoice penagihan pertamamu dan kirimkan ke pelanggan dalam hitungan detik."
                : "Start creating your first billing invoice and send it to your client in seconds."
              : locale === "id"
              ? "Coba ganti filter status atau buat invoice baru."
              : "Try switching the status filter or create a new invoice."}
          </p>
          {!activeStatus && (
            <Link
              href="/invoices/new"
              prefetch={true}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs"
            >
              {locale === "id" ? "Buat Invoice Pertama" : "Create First Invoice"}
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Card View: Mobile only (md:hidden) */}
          <div className="space-y-2.5 md:hidden">
            {invoices.map((invoice) => {
              const s = statusLabel[invoice.status] || statusLabel.DRAFT;
              const displayStatus = statusTextMap[invoice.status] || s.text;

              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-2xs active:bg-slate-50 transition-all hover:border-slate-300 hover:shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-bold text-slate-900 text-xs truncate group-hover:text-[#0f6b4f] transition-colors">
                        {invoice.number || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium truncate">
                        {invoice.customer.name}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDateWIB(invoice.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900 text-sm tabular-nums">
                        Rp{Number(invoice.total).toLocaleString("id-ID")}
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
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.invoices?.invoiceNumber || (locale === "id" ? "No. Invoice" : "Invoice #")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.invoices?.customer || (locale === "id" ? "Pelanggan" : "Client")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.invoices?.issueDate || (locale === "id" ? "Tanggal" : "Date")}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.invoices?.status || (locale === "id" ? "Status" : "Status")}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.invoices?.total || (locale === "id" ? "Total" : "Total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const s = statusLabel[invoice.status] || statusLabel.DRAFT;
                  const displayStatus = statusTextMap[invoice.status] || s.text;

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          prefetch={true}
                          className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#0f6b4f] transition-colors"
                        >
                          {invoice.number || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {invoice.customer.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
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
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                        Rp{Number(invoice.total).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-slate-600">
              <p>
                {locale === "id" ? (
                  <>
                    Halaman <strong className="text-slate-900">{currentPage}</strong> dari{" "}
                    <strong className="text-slate-900">{totalPages}</strong>
                  </>
                ) : (
                  <>
                    Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
                    <strong className="text-slate-900">{totalPages}</strong>
                  </>
                )}
              </p>
              <div className="flex gap-2">
                <Link
                  href={buildHref(activeStatus ?? "", currentPage - 1)}
                  prefetch={true}
                  className={`flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    currentPage <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-slate-50 text-slate-700 shadow-2xs"
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>{locale === "id" ? "Sebelumnya" : "Prev"}</span>
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
                  <span>{locale === "id" ? "Berikutnya" : "Next"}</span>
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
