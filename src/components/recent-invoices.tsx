"use client";

import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import { InvoiceCard } from "./invoice-card";
import { InvoiceTable } from "./invoice-table";
import { DocumentTextIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

interface RecentInvoicesProps {
  invoices: SerializedInvoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t.dashboard?.recentInvoices || "Invoice Terbaru"}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {invoices.length > 0
              ? `${invoices.length} tagihan terakhir yang dibuat di akun Anda`
              : "Daftar tagihan transaksi Anda"}
          </p>
        </div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0f6b4f] hover:text-[#0c553e] transition-colors group"
        >
          <span>{t.dashboard?.viewAll || "Lihat Semua"}</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0f6b4f]/10 text-[#0f6b4f] flex items-center justify-center mb-3 border border-[#0f6b4f]/20">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {t.dashboard?.emptyInvoicesTitle || "Belum ada invoice"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {t.dashboard?.emptyInvoicesDesc ||
              "Buat invoice pertamamu sekarang dan kirimkan ke pelanggan dalam 30 detik."}
          </p>
          <Link
            href="/invoices/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c553e] transition-all shadow-xs"
          >
            {t.dashboard?.createInvoice || "Buat Invoice"}
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
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <InvoiceTable invoices={invoices} />
          </div>
        </>
      )}
    </div>
  );
}
