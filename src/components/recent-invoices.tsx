'use client';

import Link from 'next/link';
import { Invoice, Customer } from "@/generated/prisma/client";
import { InvoiceCard } from './invoice-card';
import { InvoiceTable } from './invoice-table';

interface RecentInvoicesProps {
  invoices: (Invoice & { customer: Customer })[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          Invoice Terbaru
        </h2>
        <Link
          href="/invoices"
          className="text-sm text-blue-600 hover:underline transition-colors"
        >
          Lihat semua →
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8 text-center">
          <p className="text-sm text-gray-500">Belum ada invoice.</p>
        </div>
      ) : (
        <>
          {/* Card View: Mobile only (md:hidden) */}
          <div className="space-y-2 md:hidden">
            {invoices.map((inv) => (
              <InvoiceCard key={inv.id} invoice={inv} />
            ))}
          </div>

          {/* Table View: Desktop only (hidden md:table-outer) */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white">
            <InvoiceTable invoices={invoices} />
          </div>
        </>
      )}
    </div>
  );
}
