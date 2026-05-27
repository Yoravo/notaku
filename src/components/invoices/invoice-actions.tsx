"use client";

import { updateInvoiceStatus, deleteInvoice } from "@/actions/invoices";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  const handleMarkSent = async () => {
    await updateInvoiceStatus(invoiceId, "SENT");
  };

  const handleMarkPaid = async () => {
    await updateInvoiceStatus(invoiceId, "PAID");
  };

  const handleCancel = async () => {
    if (!confirm("Batalkan invoice ini?")) return;
    await updateInvoiceStatus(invoiceId, "CANCELLED");
  };

  const handleDelete = async () => {
    if (!confirm("Hapus invoice ini? Tindakan ini tidak bisa dibatalkan."))
      return;
    await deleteInvoice(invoiceId);
  };

  return (
    <div className="flex gap-2">
      {status === "DRAFT" && (
        <button
          onClick={handleMarkSent}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer
  hover:bg-blue-700 transition-colors"
        >
          Kirim
        </button>
      )}
      {(status === "SENT" || status === "OVERDUE") && (
        <button
          onClick={handleMarkPaid}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer
  hover:bg-green-700 transition-colors"
        >
          Tandai Lunas
        </button>
      )}
      {status !== "CANCELLED" && status !== "PAID" && (
        <button
          onClick={handleCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 cursor-pointer
  hover:bg-gray-50 transition-colors"
        >
          Batalkan
        </button>
      )}
      <button
        onClick={handleDelete}
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 cursor-pointer
  hover:bg-red-50 transition-colors"
      >
        Hapus
      </button>
    </div>
  );
}
