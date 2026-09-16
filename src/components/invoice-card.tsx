"use client";

import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { statusConfig, formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface InvoiceCardProps {
  invoice: SerializedInvoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const locale = useLocale() as "id" | "en";
  const tStatus = useTranslations("common.status");
  const s = statusConfig[invoice.status];

  const sellerStatusLabelMap: Record<InvoiceStatus, string> = {
    DRAFT: tStatus("draft"),
    SENT: tStatus("sent"),
    PAID: tStatus("paid"),
    OVERDUE: tStatus("overdue"),
    CANCELLED: tStatus("cancelled"),
  };

  const displayStatus = sellerStatusLabelMap[invoice.status];

  return (
    <Link href={`/invoices/${invoice.id}`} className="block group">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 shadow-2xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 active:bg-slate-50 dark:active:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0f6b4f] dark:group-hover:text-emerald-400 transition-colors truncate">
                {invoice.number || "—"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 truncate">
              {invoice.customer.name}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {formatDateWIB(invoice.createdAt, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">
              {formatMoney(invoice.total, invoice.currency, locale)}
            </p>
            <span
              className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.dotClassName}`} />
              {displayStatus}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
