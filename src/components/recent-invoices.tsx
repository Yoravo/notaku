"use client";

import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import { InvoiceCard } from "./invoice-card";
import { InvoiceTable } from "./invoice-table";
import { DocumentTextIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface RecentInvoicesProps {
  invoices: SerializedInvoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const tDash = useTranslations("dashboard");
  const tInv = useTranslations("invoices");

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {tDash("recentInvoices")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {invoices.length > 0
              ? tDash("recentInvoicesSubtitle", { count: invoices.length })
              : tDash("recentInvoicesSubtitleEmpty")}
          </p>
        </div>
        <Link
          href="/invoices"
          prefetch={true}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0f6b4f] dark:text-emerald-400 hover:text-[#0c553e] dark:hover:text-emerald-300 transition-colors group min-h-[44px] sm:min-h-[36px]"
        >
          <span>{tDash("viewAll")}</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 dark:bg-emerald-500/20 text-[#0f6b4f] dark:text-emerald-400 flex items-center justify-center mb-3 border border-[#0f6b4f]/20 dark:border-emerald-500/30">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {tDash("emptyInvoicesTitle")}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {tDash("emptyInvoicesDesc")}
          </p>
          <Link
            href="/invoices/new"
            prefetch={true}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs min-h-[40px]"
          >
            {tInv("newInvoice")}
          </Link>
        </div>
      ) : (
        <>
          {/* Card View: Mobile only */}
          <div className="space-y-2.5 md:hidden">
            {invoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>

          {/* Table View: Desktop only */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <InvoiceTable invoices={invoices} />
          </div>
        </>
      )}
    </div>
  );
}
