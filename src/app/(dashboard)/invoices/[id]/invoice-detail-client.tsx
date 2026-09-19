"use client";

import Link from "next/link";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { WhatsAppShareModal } from "@/components/invoices/whatsapp-share-modal";
import { EmailShareModal } from "@/components/invoices/email-share-modal";
import { statusConfig, formatDateWIB } from "@/lib/invoice-utils";
import type { InvoiceStatus } from "@/generated/prisma/client";
import {
  PencilSquareIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currencies";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface CustomerData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface InvoiceDetailClientProps {
  invoice: {
    id: string;
    publicId: string;
    customPublicUrl?: string | null;
    number: string | null;
    status: InvoiceStatus;
    dueDate: string | null;
    notes: string | null;
    subtotal: number;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    currency?: string;
    createdAt: string;
    items: InvoiceItem[];
    customer: CustomerData;
    businessName: string;
  };
}

export function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
  const tStatus = useTranslations("common.status");

  const status = statusConfig[invoice.status] || statusConfig.DRAFT;

  const sellerStatusLabelMap: Record<InvoiceStatus, string> = {
    DRAFT: tStatus("draft"),
    SENT: tStatus("sent"),
    PAID: tStatus("paid"),
    OVERDUE: tStatus("overdue"),
    CANCELLED: tStatus("cancelled"),
  };

  const displayStatus = sellerStatusLabelMap[invoice.status];

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-6">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Invoice Identification with Status under Date */}
        <div>
          <Link
            href="/invoices"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{tInv("backToList")}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {invoice.number || tInv("draftInvoice")}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {tInv("createdOn")}{" "}
              {formatDateWIB(invoice.createdAt, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
          {/* Status badge placed neatly under the date */}
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} />
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick PDF Action Group */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <a
              href={`/api/invoices/${invoice.id}/pdf?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800 min-h-[44px]"
              title={tInv("previewPdf")}
            >
              <EyeIcon className="w-4 h-4 text-slate-400" />
              <span>{tInv("viewPdf")}</span>
            </a>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              download
              className="inline-flex items-center p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[40px] justify-center"
              title={tInv("downloadPdf")}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Receipt PDF Action Group (Hanya saat status PAID) */}
          {invoice.status === "PAID" && (
            <div className="inline-flex items-center rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/60 shadow-2xs overflow-hidden">
              <a
                href={`/api/invoices/${invoice.id}/receipt?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0f6b4f] dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 transition-colors border-r border-emerald-200 dark:border-emerald-800 min-h-[44px]"
                title={tInv("viewReceipt")}
              >
                <DocumentCheckIcon className="w-4 h-4 text-[#0f6b4f] dark:text-emerald-400" />
                <span>{tInv("receipt")}</span>
              </a>
              <a
                href={`/api/invoices/${invoice.id}/receipt`}
                download
                className="inline-flex items-center p-2 text-[#0f6b4f] dark:text-emerald-400 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/80 transition-colors min-h-[44px] min-w-[40px] justify-center"
                title={tInv("downloadReceipt")}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Edit Button (jika belum lunas/batal) */}
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              prefetch={true}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs min-h-[44px]"
            >
              <PencilSquareIcon className="w-4 h-4 text-slate-400" />
              <span>{tInv("edit")}</span>
            </Link>
          )}

          {/* Email Share Modal */}
          <EmailShareModal
            invoiceId={invoice.id}
            invoiceNumber={invoice.number || tInv("draftInvoice")}
            customerName={invoice.customer.name}
            customerEmail={invoice.customer.email}
            total={invoice.total}
            dueDate={
              invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
            status={invoice.status}
          />

          {/* WhatsApp Share Modal */}
          <WhatsAppShareModal
            invoiceNumber={invoice.number || tInv("draftInvoice")}
            customerName={invoice.customer.name}
            customerPhone={invoice.customer.phone}
            total={invoice.total}
            currency={invoice.currency}
            dueDate={
              invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
            publicId={invoice.publicId}
            customPublicUrl={invoice.customPublicUrl}
            businessName={invoice.businessName}
            status={invoice.status}
          />

          {/* Status Lifecycle & Delete Dropdown */}
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      {/* Main Invoice Card Preview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {/* Customer & Due Date Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              {tInv("billedTo")}
            </span>
            <p className="mt-1.5 font-bold text-slate-900 dark:text-white text-base">
              {invoice.customer.name}
            </p>
            {invoice.customer.email && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                {invoice.customer.email}
              </p>
            )}
            {invoice.customer.phone && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                {invoice.customer.phone}
              </p>
            )}
            {invoice.customer.address && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {invoice.customer.address}
              </p>
            )}
          </div>

          <div className="sm:text-right flex flex-col justify-start sm:items-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {tInv("dueDate")}
            </span>
            <p className="mt-1.5 font-semibold text-slate-900 dark:text-white text-sm">
              {invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : tInv("dueDateUnspecified")}
            </p>
            {invoice.notes && (
              <div className="mt-3 text-left sm:text-right max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  {tInv("notes")}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-0.5">
                  &quot;{invoice.notes}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{tInv("itemName")}</th>
                <th className="px-4 py-3.5 text-center">{tInv("quantity")}</th>
                <th className="px-4 py-3.5 text-right">{tInv("price")}</th>
                <th className="px-6 py-3.5 text-right">{tInv("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white">
                    {item.description}
                  </td>
                  <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300 font-mono">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                    {formatMoney(item.price, invoice.currency, locale)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(item.amount, invoice.currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs"
                >
                  {tInv("subtotal")}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white text-sm tabular-nums">
                  {formatMoney(invoice.subtotal || invoice.total, invoice.currency, locale)}
                </td>
              </tr>

              {invoice.discountAmount > 0 && (
                <tr className="text-[#0f6b4f] dark:text-emerald-400">
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-xs"
                  >
                    {tInv("discount")}{" "}
                    {invoice.discountType === "PERCENTAGE" ? `(${invoice.discountValue}%)` : ""}
                  </td>
                  <td className="px-6 py-2.5 text-right font-bold text-sm tabular-nums">
                    -{formatMoney(invoice.discountAmount, invoice.currency, locale)}
                  </td>
                </tr>
              )}

              {invoice.taxAmount > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300 text-xs"
                  >
                    {tInv("taxVat")} ({invoice.taxRate}%)
                  </td>
                  <td className="px-6 py-2.5 text-right font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                    +{formatMoney(invoice.taxAmount, invoice.currency, locale)}
                  </td>
                </tr>
              )}

              <tr className="bg-slate-100/70 dark:bg-slate-800/80">
                <td
                  colSpan={3}
                  className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs sm:text-sm"
                >
                  {tInv("grandTotal")}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white text-lg sm:text-xl tabular-nums">
                  {formatMoney(invoice.total, invoice.currency, locale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
