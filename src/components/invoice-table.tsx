"use client";

import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { statusConfig, formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface InvoiceTableProps {
  invoices: SerializedInvoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
  const tStatus = useTranslations("common.status");

  const sellerStatusLabelMap: Record<InvoiceStatus, string> = {
    DRAFT: tStatus("draft"),
    SENT: tStatus("sent"),
    PAID: tStatus("paid"),
    OVERDUE: tStatus("overdue"),
    CANCELLED: tStatus("cancelled"),
  };

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50/80">
        <tr>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {tInv("invoiceNumber")}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {tInv("customer")}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {tInv("issueDate")}
          </th>
          <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            {tInv("status")}
          </th>
          <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
            {tInv("total")}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {invoices.map((inv) => {
          const s = statusConfig[inv.status];
          const displayStatus = sellerStatusLabelMap[inv.status];

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
                {formatMoney(inv.total, inv.currency, locale)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
