"use client";

import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import { statusLabel, formatDateWIB } from "@/lib/invoice-utils";
import { useLanguage } from "@/lib/i18n/context";

interface InvoiceTableProps {
  invoices: SerializedInvoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const { t } = useLanguage();

  const statusTextMap: Record<string, string> = {
    DRAFT: t.invoices?.statusDraft || "Draft",
    SENT: t.invoices?.statusSent || "Terkirim",
    PAID: t.invoices?.statusPaid || "Lunas",
    OVERDUE: t.invoices?.statusOverdue || "Lewat Tempo",
    CANCELLED: t.invoices?.statusCancelled || "Dibatalkan",
  };

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50/80">
        <tr>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.invoices?.invoiceNumber || "No. Invoice"}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.invoices?.customer || "Pelanggan"}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.invoices?.issueDate || "Tanggal"}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.invoices?.status || "Status"}
          </th>
          <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.invoices?.total || "Total"}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {invoices.map((inv) => {
          const s = statusLabel[inv.status] || statusLabel.DRAFT;
          const displayStatus = statusTextMap[inv.status] || s.text;

          return (
            <tr
              key={inv.id}
              className="hover:bg-slate-50/80 transition-colors group"
            >
              <td className="px-5 py-3.5">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="font-mono text-xs font-bold text-slate-900 group-hover:text-[#0f6b4f] transition-colors"
                >
                  {inv.number || "—"}
                </Link>
              </td>
              <td className="px-5 py-3.5 font-medium text-slate-900">
                {inv.customer.name}
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                {formatDateWIB(inv.createdAt, {
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
                Rp{inv.total.toLocaleString("id-ID")}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
