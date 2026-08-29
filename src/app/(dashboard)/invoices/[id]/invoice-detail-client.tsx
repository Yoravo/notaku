"use client";

import Link from "next/link";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { WhatsAppShareModal } from "@/components/invoices/whatsapp-share-modal";
import { EmailShareModal } from "@/components/invoices/email-share-modal";
import { statusLabel, formatDateWIB } from "@/lib/invoice-utils";
import {
  PencilSquareIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

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
    number: string | null;
    status: string;
    dueDate: string | null;
    notes: string | null;
    subtotal: number;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    createdAt: string;
    items: InvoiceItem[];
    customer: CustomerData;
    businessName: string;
  };
}

export function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
  const { t, locale } = useLanguage();

  const status = statusLabel[invoice.status] || statusLabel.DRAFT;

  const statusTextMap: Record<string, string> = {
    DRAFT: t.invoices?.statusDraft || "Draft",
    SENT: t.invoices?.statusSent || "Terkirim",
    PAID: t.invoices?.statusPaid || "Lunas",
    OVERDUE: t.invoices?.statusOverdue || "Lewat Tempo",
    CANCELLED: t.invoices?.statusCancelled || "Dibatalkan",
  };

  const displayStatus = statusTextMap[invoice.status] || status.text;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Invoice Identification with Status under Date */}
        <div>
          <Link
            href="/invoices"
            prefetch={true}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t.invoices?.backToList || (locale === "id" ? "Kembali ke Daftar Invoice" : "Back to Invoices")}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {invoice.number || (locale === "id" ? "Draft Invoice" : "Draft Invoice")}
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {t.invoices?.createdOn || (locale === "id" ? "Dibuat" : "Created on")}{" "}
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
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <a
              href={`/api/invoices/${invoice.id}/pdf?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200"
              title={t.invoices?.previewPdf || (locale === "id" ? "Lihat Pratinjau PDF" : "Preview PDF")}
            >
              <EyeIcon className="w-4 h-4 text-slate-400" />
              <span>{t.invoices?.viewPdf || (locale === "id" ? "Lihat PDF" : "View PDF")}</span>
            </a>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              download
              className="inline-flex items-center p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title={t.invoices?.downloadPdf || (locale === "id" ? "Unduh File PDF" : "Download PDF")}
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Receipt PDF Action Group (Hanya saat status PAID) */}
          {invoice.status === "PAID" && (
            <div className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50/60 shadow-2xs overflow-hidden">
              <a
                href={`/api/invoices/${invoice.id}/receipt?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#0f6b4f] hover:bg-emerald-100/60 transition-colors border-r border-emerald-200"
                title={t.invoices?.viewReceipt || (locale === "id" ? "Lihat Kuitansi Resmi" : "View Receipt")}
              >
                <DocumentCheckIcon className="w-4 h-4 text-[#0f6b4f]" />
                <span>{t.invoices?.viewReceipt || (locale === "id" ? "Kuitansi" : "Receipt")}</span>
              </a>
              <a
                href={`/api/invoices/${invoice.id}/receipt`}
                download
                className="inline-flex items-center p-2 text-[#0f6b4f] hover:bg-emerald-100/80 transition-colors"
                title={t.invoices?.downloadReceipt || (locale === "id" ? "Unduh Kuitansi PDF" : "Download Receipt PDF")}
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
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <PencilSquareIcon className="w-4 h-4 text-slate-400" />
              <span>{locale === "id" ? "Edit" : "Edit"}</span>
            </Link>
          )}

          {/* Email Share Modal */}
          <EmailShareModal
            invoiceId={invoice.id}
            invoiceNumber={invoice.number || "Draft"}
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
            invoiceNumber={invoice.number || "Draft"}
            customerName={invoice.customer.name}
            customerPhone={invoice.customer.phone}
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
            publicId={invoice.publicId}
            businessName={invoice.businessName}
            status={invoice.status}
          />

          {/* Status Lifecycle & Delete Dropdown */}
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      {/* Main Invoice Card Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Customer & Due Date Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              {t.invoices?.billedTo || (locale === "id" ? "Ditagihkan Kepada" : "Billed To")}
            </span>
            <p className="mt-1.5 font-bold text-slate-900 text-base">
              {invoice.customer.name}
            </p>
            {invoice.customer.email && (
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {invoice.customer.email}
              </p>
            )}
            {invoice.customer.phone && (
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {invoice.customer.phone}
              </p>
            )}
            {invoice.customer.address && (
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {invoice.customer.address}
              </p>
            )}
          </div>

          <div className="sm:text-right flex flex-col justify-start sm:items-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.invoices?.dueDate || (locale === "id" ? "Jatuh Tempo Pembayaran" : "Due Date")}
            </span>
            <p className="mt-1.5 font-semibold text-slate-900 text-sm">
              {invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : locale === "id" ? "Tidak ditentukan (Langsung)" : "Not specified (Direct)"}
            </p>
            {invoice.notes && (
              <div className="mt-3 text-left sm:text-right max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.invoices?.notes || (locale === "id" ? "Catatan" : "Notes")}
                </span>
                <p className="text-xs text-slate-600 italic mt-0.5">
                  &quot;{invoice.notes}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{t.invoices?.itemName || (locale === "id" ? "Deskripsi Item" : "Description")}</th>
                <th className="px-4 py-3.5 text-center">{t.invoices?.quantity || (locale === "id" ? "Qty" : "Qty")}</th>
                <th className="px-4 py-3.5 text-right">{t.invoices?.price || (locale === "id" ? "Harga Satuan" : "Unit Price")}</th>
                <th className="px-6 py-3.5 text-right">{t.invoices?.amount || (locale === "id" ? "Subtotal" : "Amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-3.5 text-center text-slate-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums">
                    Rp{item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                    Rp{item.amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50/40 divide-y divide-slate-200/60">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-right font-semibold text-slate-600 text-xs"
                >
                  {t.invoices?.subtotal || "Subtotal"}
                </td>
                <td className="px-6 py-3 text-right font-semibold text-slate-900 text-sm tabular-nums">
                  Rp{(invoice.subtotal || invoice.total).toLocaleString("id-ID")}
                </td>
              </tr>

              {invoice.discountAmount > 0 && (
                <tr className="text-[#0f6b4f]">
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-xs"
                  >
                    {t.invoices?.discount || (locale === "id" ? "Diskon" : "Discount")}{" "}
                    {invoice.discountType === "PERCENTAGE" ? `(${invoice.discountValue}%)` : ""}
                  </td>
                  <td className="px-6 py-2.5 text-right font-bold text-sm tabular-nums">
                    -Rp{invoice.discountAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}

              {invoice.taxAmount > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-slate-600 text-xs"
                  >
                    {t.invoices?.taxVat || (locale === "id" ? "Pajak (PPN)" : "Tax (VAT)")} ({invoice.taxRate}%)
                  </td>
                  <td className="px-6 py-2.5 text-right font-bold text-slate-900 text-sm tabular-nums">
                    +Rp{invoice.taxAmount.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}

              <tr className="bg-slate-100/70">
                <td
                  colSpan={3}
                  className="px-6 py-4 text-right font-bold text-slate-800 uppercase tracking-wider text-xs sm:text-sm"
                >
                  {t.invoices?.grandTotal || (locale === "id" ? "Total Tagihan" : "Grand Total")}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg sm:text-xl tabular-nums">
                  Rp{invoice.total.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
