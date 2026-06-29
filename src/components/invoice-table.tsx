"use client";
import Link from "next/link";
import { SerializedInvoice } from "@/types/invoice";
import { getStatusColor } from "@/lib/invoice-utils";

interface InvoiceTableProps {
  invoices: SerializedInvoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-gray-200 bg-gray-50">
        <tr>
          <th className="px-4 py-3 font-medium text-gray-700">No. Invoice</th>
          <th className="px-4 py-3 font-medium text-gray-700">Pelanggan</th>
          <th className="px-4 py-3 font-medium text-gray-700">Status</th>
          <th className="px-4 py-3 text-right font-medium text-gray-700">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {invoices.map((inv) => (
          <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              <Link
                href={`/invoices/${inv.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {inv.number || "—"}
              </Link>
            </td>
            <td className="px-4 py-3 text-gray-900">{inv.customer.name}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(inv.status)}`}
              >
                {inv.status}
              </span>
            </td>
            <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
              Rp{inv.total.toLocaleString("id-ID")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
