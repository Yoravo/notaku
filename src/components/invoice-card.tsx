'use client';

import Link from 'next/link';
import { Invoice, Customer } from "@/generated/prisma/client";

interface InvoiceCardProps {
  invoice: Invoice & { customer: Customer };
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="rounded-lg border border-gray-200 bg-white p-4 active:bg-gray-50 transition-colors cursor-pointer hover:border-gray-300">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Invoice No + Customer */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {invoice.number || '—'}
            </p>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {invoice.customer.name}
            </p>
          </div>

          {/* Right: Total + Status */}
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-900 text-sm tabular-nums">
              Rp{Number(invoice.total).toLocaleString('id-ID')}
            </p>
            <span
              className={`
              inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1
              ${getStatusColor(invoice.status)}
            `}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
