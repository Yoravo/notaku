"use client";

import { useState } from "react";
import { updatePayoutStatus } from "@/actions/admin";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  CheckCircleIcon,
  XCircleIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface PayoutRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export function AdminPayoutsClient({
  payouts,
}: {
  payouts: PayoutRecord[];
}) {
  const locale = useLocale() as "id" | "en";
  const tAdmin = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "COMPLETED" | "REJECTED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    payout: PayoutRecord | null;
    targetStatus: "COMPLETED" | "REJECTED" | null;
    adminNotes: string;
    errorMsg: string | null;
  }>({
    isOpen: false,
    payout: null,
    targetStatus: null,
    adminNotes: "",
    errorMsg: null,
  });

  const filteredPayouts = payouts.filter((p) => {
    if (activeTab === "ALL") return true;
    return p.status === activeTab;
  });

  const handleOpenConfirm = (
    payout: PayoutRecord,
    targetStatus: "COMPLETED" | "REJECTED"
  ) => {
    setDialogState({
      isOpen: true,
      payout,
      targetStatus,
      adminNotes: "",
      errorMsg: null,
    });
  };

  const handleExecuteStatusChange = async () => {
    const { payout, targetStatus, adminNotes } = dialogState;
    if (!payout || !targetStatus) return;

    setProcessingId(payout.id);
    try {
      const res = await updatePayoutStatus({
        payoutId: payout.id,
        status: targetStatus,
        adminNotes: adminNotes.trim() || undefined,
      });

      if (!res.success) {
        setDialogState((prev) => ({
          ...prev,
          errorMsg: res.error || tAdmin("updateStatusFailed"),
        }));
      } else {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        window.location.reload();
      }
    } catch {
      setDialogState((prev) => ({
        ...prev,
        errorMsg: tAdmin("systemError"),
      }));
    } finally {
      setProcessingId(null);
    }
  };

  const activePayout = dialogState.payout;
  const isRejecting = dialogState.targetStatus === "REJECTED";

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(["ALL", "PENDING", "COMPLETED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
              activeTab === tab
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
            }`}
          >
            {tab === "ALL"
              ? `${tAdmin("tabAll")} (${payouts.length})`
              : tab === "PENDING"
                ? `${tAdmin("tabPending")} (${
                    payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length
                  })`
                : tab === "COMPLETED"
                  ? `${tAdmin("tabCompleted")} (${
                      payouts.filter((p) => p.status === "COMPLETED").length
                    })`
                  : `${tAdmin("tabRejected")} (${
                      payouts.filter((p) => p.status === "REJECTED").length
                    })`}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        {filteredPayouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            {tAdmin("emptyPayouts")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">{tAdmin("colRequestedDate")}</th>
                  <th className="px-4 py-3.5">{tAdmin("colUser")}</th>
                  <th className="px-4 py-3.5">{tAdmin("colBank")}</th>
                  <th className="px-4 py-3.5 text-right">{tAdmin("colGross")}</th>
                  <th className="px-4 py-3.5 text-center">{tAdmin("colStatus")}</th>
                  <th className="px-4 py-3.5 text-center">{tAdmin("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p) => {
                  const statusMap: Record<PayoutRecord["status"], { label: string; badge: string; dot: string }> = {
                    PENDING: {
                      label: tAdmin("tabPending"),
                      badge: "bg-amber-50 text-amber-800 border-amber-200/60",
                      dot: "bg-amber-500",
                    },
                    PROCESSING: {
                      label: tAdmin("statusProcessing"),
                      badge: "bg-blue-50 text-blue-800 border-blue-200/60",
                      dot: "bg-blue-500",
                    },
                    COMPLETED: {
                      label: tAdmin("tabCompleted"),
                      badge: "bg-emerald-50 text-[#0f6b4f] border-emerald-200/60",
                      dot: "bg-emerald-500",
                    },
                    REJECTED: {
                      label: tAdmin("tabRejected"),
                      badge: "bg-rose-50 text-rose-700 border-rose-200/60",
                      dot: "bg-rose-500",
                    },
                  };
                  const s = statusMap[p.status];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-mono text-[11px] text-slate-500 font-bold">
                          #{p.id.slice(-6)}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          {formatDateWIB(p.createdAt, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{p.userName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{p.userEmail}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">
                          {p.bankName} — <span className="font-mono">{p.accountNumber}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          a/n {p.accountName}
                        </p>
                        {p.notes && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            Note: &quot;{p.notes}&quot;
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatMoney(p.amount, "IDR", locale)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shadow-2xs ${s.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        {p.adminNotes && (
                          <p className="text-[10px] text-rose-500 mt-1 font-medium">
                            {p.adminNotes}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {p.status === "PENDING" || p.status === "PROCESSING" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenConfirm(p, "COMPLETED")}
                              disabled={processingId === p.id}
                              title={tAdmin("approveBtn")}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#0f6b4f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer shadow-2xs min-h-[36px]"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>{tAdmin("tabCompleted")}</span>
                            </button>
                            <button
                              onClick={() => handleOpenConfirm(p, "REJECTED")}
                              disabled={processingId === p.id}
                              title={tAdmin("rejectBtn")}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200/60 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all cursor-pointer shadow-2xs min-h-[36px]"
                            >
                              <XCircleIcon className="h-3.5 w-3.5" />
                              <span>{tAdmin("rejectBtn")}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {tAdmin("tabCompleted")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Payout Action Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => !processingId && setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteStatusChange}
        title={
          isRejecting
            ? tAdmin("confirmRejectTitle")
            : tAdmin("confirmApprovalTitle")
        }
        description={
          isRejecting
            ? tAdmin("confirmRejectDesc", { amount: formatMoney(activePayout?.amount || 0, "IDR", locale) })
            : tAdmin("confirmApprovalDesc", { amount: formatMoney(activePayout?.amount || 0, "IDR", locale) })
        }
        confirmLabel={
          isRejecting
            ? tAdmin("confirmRejectAction")
            : tAdmin("confirmApproveAction")
        }
        cancelLabel={tAdmin("cancel")}
        variant={isRejecting ? "danger" : "success"}
        isLoading={Boolean(processingId)}
        itemDetails={
          activePayout
            ? [
                {
                  label: tAdmin("recipientLabel"),
                  value: `${activePayout.userName} (${activePayout.userEmail})`,
                },
                {
                  label: tAdmin("bankAccountLabel"),
                  value: `${activePayout.bankName} ${activePayout.accountNumber}`,
                },
                {
                  label: tAdmin("accountHolderLabel"),
                  value: activePayout.accountName,
                },
                {
                  label: tAdmin("payoutAmountLabel"),
                  value: formatMoney(activePayout.amount, "IDR", locale),
                },
              ]
            : []
        }
      >
        {isRejecting && (
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
              {tAdmin("adminNotesLabel")}
            </label>
            <input
              type="text"
              value={dialogState.adminNotes}
              onChange={(e) =>
                setDialogState((prev) => ({ ...prev, adminNotes: e.target.value }))
              }
              placeholder={tAdmin("adminNotesPlaceholder")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-slate-50/50 focus:bg-white min-h-[44px]"
            />
          </div>
        )}

        {dialogState.errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
            {dialogState.errorMsg}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
