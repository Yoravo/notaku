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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";

export function InvoiceActions({
  invoiceId,
  status,
  invoiceNumber,
}: {
  invoiceId: string;
  status: string;
  invoiceNumber?: string;
}) {
  const tInv = useTranslations("invoices");
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "cancel" | "delete" | null;
  }>({
    isOpen: false,
    type: null,
  });

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
      const message =
        err instanceof Error
          ? err.message
          : tInv("genericError");
      setError(message);
    } finally {
      setLoading(null);
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  const handleMarkSent = () =>
    handleAction("sent", () => updateInvoiceStatus(invoiceId, "SENT"));

  const handleMarkPaid = () =>
    handleAction("paid", () => updateInvoiceStatus(invoiceId, "PAID"));

  const handleExecuteCancel = () =>
    handleAction("cancel", () => updateInvoiceStatus(invoiceId, "CANCELLED"));

  const handleExecuteDelete = () =>
    handleAction("delete", () => deleteInvoice(invoiceId));

  const handleClone = () => {
    handleAction("clone", () => cloneInvoice(invoiceId));
  };

  const isLoading = (action: string) => loading === action;
  const busy = loading !== null;

  return (
    <>
      <div className="relative inline-flex items-center gap-2" ref={dropdownRef}>
        {/* Primary Action Button based on current status */}
        {status === "DRAFT" && (
          <button
            onClick={handleMarkSent}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xs"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>
              {isLoading("sent")
                ? tInv("updating")
                : tInv("markSent")}
            </span>
          </button>
        )}

        {(status === "SENT" || status === "OVERDUE") && (
          <button
            onClick={handleMarkPaid}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-3.5 py-2 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xs"
          >
            <CheckIcon className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isLoading("paid")
                ? tInv("saving")
                : tInv("markPaid")}
            </span>
          </button>
        )}

        {/* Overflow / Secondary Actions Dropdown */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={busy}
          aria-label={tInv("moreActions")}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <EllipsisVerticalIcon className="w-4 h-4" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={handleClone}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <DocumentDuplicateIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{tInv("duplicateInvoice")}</span>
            </button>

            {status === "DRAFT" && (
              <button
                onClick={handleMarkPaid}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#0f6b4f] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
              >
                <CheckIcon className="w-4 h-4" />
                <span>{tInv("markPaidDirect")}</span>
              </button>
            )}

            {status !== "CANCELLED" && status !== "PAID" && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setConfirmModal({ isOpen: true, type: "cancel" });
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
              >
                <XCircleIcon className="w-4 h-4 text-amber-500" />
                <span>{tInv("cancelInvoice")}</span>
              </button>
            )}

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              onClick={() => {
                setDropdownOpen(false);
                setConfirmModal({ isOpen: true, type: "delete" });
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              <span>{tInv("deleteInvoice")}</span>
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="absolute right-0 top-full mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 font-medium shadow-md whitespace-nowrap z-40 animate-in fade-in"
          >
            {error}
          </div>
        )}
      </div>

      {/* Cancel Invoice Confirm Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen && confirmModal.type === "cancel"}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={handleExecuteCancel}
        title={tInv("cancelConfirmTitle")}
        description={tInv("cancelConfirmDesc")}
        confirmLabel={tInv("cancelConfirmAction")}
        cancelLabel={tInv("goBack")}
        variant="warning"
        isLoading={isLoading("cancel")}
      />

      {/* Delete Invoice Confirm Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen && confirmModal.type === "delete"}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={handleExecuteDelete}
        title={tInv("deleteConfirmTitle")}
        description={tInv("deleteConfirmDesc")}
        confirmLabel={tInv("deleteConfirmAction")}
        cancelLabel={tInv("cancel")}
        variant="danger"
        isLoading={isLoading("delete")}
      />
    </>
  );
}
