"use client";
import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import { getStatusColor } from "@/lib/invoice-utils";

interface InvoiceCardProps {
  invoice: SerializedInvoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 active:bg-gray-50 transition-colors cursor-pointer hover:border-gray-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {invoice.number || "—"}
            </p>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {invoice.customer.name}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-gray-900 text-sm tabular-nums">
              Rp{invoice.total.toLocaleString("id-ID")}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${getStatusColor(invoice.status)}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
