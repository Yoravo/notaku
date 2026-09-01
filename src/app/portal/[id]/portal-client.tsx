"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { formatMoney } from "@/lib/currencies";
import { formatDateWIB } from "@/lib/invoice-utils";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageDropdown } from "@/components/language-dropdown";

interface InvoiceItem {
  id: string;
  publicId: string;
  number: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string | null;
  createdAt: string;
  paidAt: string | null;
  total: number;
  currency: string;
}

interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface SellerData {
  name: string;
  businessName: string | null;
  email: string;
  phone: string | null;
  logoUrl: string | null;
  plan: string;
}

export function PortalClient({
  customer,
  seller,
  invoices,
}: {
  customer: CustomerData;
  seller: SellerData;
  invoices: InvoiceItem[];
}) {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNPAID" | "PAID" | "OVERDUE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const sellerDisplayName = seller.businessName || seller.name;
  const primaryCurrency = invoices[0]?.currency || "IDR";

  // Hitung ringkasan statistik keuangan klien
  const metrics = useMemo(() => {
    let totalUnpaid = 0;
    let countUnpaid = 0;
    let totalPaid = 0;
    let countPaid = 0;

    for (const inv of invoices) {
      if (inv.status === "PAID") {
        totalPaid += inv.total;
        countPaid += 1;
      } else if (inv.status === "SENT" || inv.status === "OVERDUE") {
        totalUnpaid += inv.total;
        countUnpaid += 1;
      }
    }

    return {
      totalInvoices: invoices.length,
      totalUnpaid,
      countUnpaid,
      totalPaid,
      countPaid,
    };
  }, [invoices]);

  // Filter invoices berdasarkan tab & pencarian
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.number.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (activeTab === "ALL") return true;
      if (activeTab === "UNPAID") return inv.status === "SENT" || inv.status === "OVERDUE";
      if (activeTab === "PAID") return inv.status === "PAID";
      if (activeTab === "OVERDUE") return inv.status === "OVERDUE";

      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0f6b4f]/20">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {seller.logoUrl ? (
              <img
                src={seller.logoUrl}
                alt={sellerDisplayName}
                className="h-9 max-w-[120px] object-contain shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0f6b4f] border border-emerald-100 flex items-center justify-center font-bold text-base shadow-2xs">
                <BuildingStorefrontIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                {t.portal.badge}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                {sellerDisplayName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t.portal.clientLabel}
              </span>
              <p className="text-xs font-bold text-[#0f6b4f]">{customer.name}</p>
            </div>
            <LanguageDropdown variant="light" />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Customer Profile Banner */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-[#0f6b4f] text-[11px] font-bold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.portal.activeBadge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {t.portal.greeting} {customer.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              {t.portal.description}{" "}
              <strong className="text-slate-800">{sellerDisplayName}</strong> {t.portal.forYou}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 font-medium">
              {customer.email && (
                <div className="flex items-center gap-1.5">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-1.5">
                  <PhoneIcon className="w-4 h-4 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-xs">{customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col justify-between sm:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.portal.totalHistory}
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                {metrics.totalInvoices}{" "}
                <span className="text-xs font-sans font-semibold text-slate-500">
                  {t.portal.invoicesCount}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unpaid Card */}
          <div className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50/70 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-amber-600" />
                <span>{t.portal.unpaidTitle}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                {metrics.countUnpaid} {t.portal.unpaidCount}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono tracking-tight">
              {formatMoney(metrics.totalUnpaid, primaryCurrency)}
            </p>
            <p className="text-xs text-amber-700 font-medium">
              {metrics.countUnpaid > 0
                ? t.portal.unpaidDescHas
                : t.portal.unpaidDescEmpty}
            </p>
          </div>

          {/* Paid Card */}
          <div className="rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/70 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f6b4f] flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-[#0f6b4f]" />
                <span>{t.portal.paidTitle}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0f6b4f] text-[11px] font-bold">
                {metrics.countPaid} {t.portal.paidCount}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
              {formatMoney(metrics.totalPaid, primaryCurrency)}
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              {t.portal.paidDesc}
            </p>
          </div>
        </div>

        {/* Invoice Filters & List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  activeTab === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.portal.tabAll} ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UNPAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  activeTab === "UNPAID"
                    ? "bg-white text-amber-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.portal.tabUnpaid} ({metrics.countUnpaid})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PAID")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  activeTab === "PAID"
                    ? "bg-white text-[#0f6b4f] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.portal.tabPaid} ({metrics.countPaid})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.portal.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs"
              />
            </div>
          </div>

          {/* Invoices Table & Card View */}
          {filteredInvoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white shadow-2xs">
              <DocumentTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">{t.portal.emptyTitle}</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? `${t.portal.emptyDescSearch} "${searchQuery}".`
                  : t.portal.emptyDescCategory}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">{t.portal.thNumber}</th>
                      <th className="px-5 py-3.5">{t.portal.thIssueDate}</th>
                      <th className="px-5 py-3.5">{t.portal.thDueDate}</th>
                      <th className="px-5 py-3.5">{t.portal.thStatus}</th>
                      <th className="px-5 py-3.5 text-right">{t.portal.thTotal}</th>
                      <th className="px-5 py-3.5 text-right">{t.portal.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Invoice Number */}
                        <td className="px-5 py-4 font-mono font-bold text-slate-900">
                          <Link
                            href={`/i/${inv.publicId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0f6b4f] hover:underline inline-flex items-center gap-1.5"
                          >
                            <span>{inv.number}</span>
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                          </Link>
                        </td>

                        {/* Issue Date */}
                        <td className="px-5 py-4 text-slate-600 font-medium text-xs">
                          {formatDateWIB(inv.createdAt, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-4 text-slate-600 font-medium text-xs">
                          {inv.dueDate ? (
                            <span className={inv.status === "OVERDUE" ? "text-rose-600 font-bold" : ""}>
                              {formatDateWIB(inv.dueDate, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              inv.status === "PAID"
                                ? "bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60"
                                : inv.status === "SENT"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                  : inv.status === "OVERDUE"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                inv.status === "PAID"
                                  ? "bg-emerald-500"
                                  : inv.status === "SENT"
                                    ? "bg-blue-500"
                                    : inv.status === "OVERDUE"
                                      ? "bg-rose-500"
                                      : "bg-slate-400"
                              }`}
                            />
                            {inv.status === "PAID"
                              ? t.portal.statusPaid
                              : inv.status === "SENT"
                                ? t.portal.statusSent
                                : inv.status === "OVERDUE"
                                  ? t.portal.statusOverdue
                                  : inv.status}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="px-5 py-4 text-right font-mono font-extrabold text-slate-900 tabular-nums">
                          {formatMoney(inv.total, inv.currency)}
                        </td>

                        {/* Actions & PDF Downloads */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Primary Action Button */}
                            <Link
                              href={`/i/${inv.publicId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                                inv.status === "PAID"
                                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                  : "bg-[#0f6b4f] text-white hover:bg-[#0c553e]"
                              }`}
                            >
                              <span>{inv.status === "PAID" ? t.portal.btnViewInvoice : t.portal.btnPayNow}</span>
                              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                            </Link>

                            {/* Download Invoice PDF */}
                            <a
                              href={`/api/invoices/public/${inv.publicId}/pdf`}
                              download={`Invoice-${inv.number}.pdf`}
                              title={t.portal.downloadInvoice}
                              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4" />
                            </a>

                            {/* Download Receipt PDF if PAID */}
                            {inv.status === "PAID" && (
                              <a
                                href={`/api/invoices/public/${inv.publicId}/receipt`}
                                download={`Kuitansi-${inv.number}.pdf`}
                                title={t.portal.downloadReceipt}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-[#0f6b4f] hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200/60"
                              >
                                <span>{t.portal.receiptLabel}</span>
                                <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {t.portal.footerBilledBy} <strong className="text-slate-800">{sellerDisplayName}</strong>.
          </p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{t.portal.footerPoweredBy}</span>
            <Link
              href="https://notaku.store"
              target="_blank"
              rel="noopener"
              className="font-bold text-slate-700 hover:text-[#0f6b4f] transition-colors"
            >
              Nota<span className="text-[#0f6b4f]">Ku</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

