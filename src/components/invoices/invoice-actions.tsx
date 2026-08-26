"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateInvoiceStatus, deleteInvoice, cloneInvoice } from "@/actions/invoices";
import {
  EllipsisVerticalIcon,
  CheckIcon,
  PaperAirplaneIcon,
  XCircleIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setError(null);
    setLoading(action);
    setDropdownOpen(false);
    try {
      await fn();
      router.refresh();
    } catch (err: any) {
      if (
        err?.message?.includes("NEXT_REDIRECT") ||
        err?.digest?.includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
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

  const handleClone = () => {
    handleAction("clone", () => cloneInvoice(invoiceId));
  };

  const isLoading = (action: string) => loading === action;
  const busy = loading !== null;

  return (
    <div className="relative inline-flex items-center gap-2" ref={dropdownRef}>
      {/* Primary Action Button based on current status */}
      {status === "DRAFT" && (
        <button
          onClick={handleMarkSent}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          <span>{isLoading("sent") ? "Menandai..." : "Tandai Terkirim"}</span>
        </button>
      )}

      {(status === "SENT" || status === "OVERDUE") && (
        <button
          onClick={handleMarkPaid}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white cursor-pointer hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
        >
          <CheckIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{isLoading("paid") ? "Menyimpan..." : "Tandai Lunas"}</span>
        </button>
      )}

      {/* Overflow / Secondary Actions Dropdown */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={busy}
        aria-label="Menu Opsi Tambahan"
        className="p-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-gray-200 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleClone}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-blue-600" />
            <span>Duplikasi Invoice (1-Click)</span>
          </button>

          {status === "DRAFT" && (
            <button
              onClick={handleMarkPaid}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Langsung Tandai Lunas</span>
            </button>
          )}

          {status !== "CANCELLED" && status !== "PAID" && (
            <button
              onClick={handleCancel}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <XCircleIcon className="w-4 h-4 text-gray-500" />
              <span>Batalkan Invoice</span>
            </button>
          )}

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Hapus Invoice</span>
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="absolute right-0 top-full mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-medium shadow-md whitespace-nowrap z-40"
        >
          {error}
        </div>
      )}
    </div>
  );
}
