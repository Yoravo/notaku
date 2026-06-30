"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus, deleteInvoice } from "@/actions/invoices";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setError(null);
    setLoading(action);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkSent = () =>
    handleAction("sent", () => updateInvoiceStatus(invoiceId, "SENT"));

  const handleMarkPaid = () =>
    handleAction("paid", () => updateInvoiceStatus(invoiceId, "PAID"));

  const handleCancel = () => {
    if (!confirm("Batalkan invoice ini?")) return;
    handleAction("cancel", () => updateInvoiceStatus(invoiceId, "CANCELLED"));
  };

  const handleDelete = () => {
    if (!confirm("Hapus invoice ini? Tindakan ini tidak bisa dibatalkan."))
      return;
    handleAction("delete", () => deleteInvoice(invoiceId));
  };

  const isLoading = (action: string) => loading === action;
  const busy = loading !== null;

  return (
    <div>
      <div className="flex gap-2">
        {status === "DRAFT" && (
          <button
            onClick={handleMarkSent}
            disabled={busy}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer
  hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading("sent") ? "Mengirim..." : "Kirim"}
          </button>
        )}
        {(status === "SENT" || status === "OVERDUE") && (
          <button
            onClick={handleMarkPaid}
            disabled={busy}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white cursor-pointer
  hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading("paid") ? "Menyimpan..." : "Tandai Lunas"}
          </button>
        )}
        {status !== "CANCELLED" && status !== "PAID" && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 cursor-pointer
  hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading("cancel") ? "Membatalkan..." : "Batalkan"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={busy}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 cursor-pointer
  hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading("delete") ? "Menghapus..." : "Hapus"}
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
