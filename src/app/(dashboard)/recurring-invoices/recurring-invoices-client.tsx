"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ArrowPathIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckBadgeIcon,
  UsersIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  RecurringInvoiceData,
  RecurringStatus,
  RecurringFrequency,
} from "@/lib/recurring-invoices";
import {
  updateRecurringInvoiceStatus,
  triggerRecurringInvoiceNow,
} from "@/actions/recurring-invoices";
import { UpgradeButton } from "@/components/upgrade-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";
import { formatDateWIB } from "@/lib/invoice-utils";

interface RecurringInvoicesClientProps {
  recurringList: RecurringInvoiceData[];
  isPro: boolean;
}

export function RecurringInvoicesClient({
  recurringList,
  isPro,
}: RecurringInvoicesClientProps) {
  const tRec = useTranslations("recurring");
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirm Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "warning" | "success" | "primary";
    onConfirm: () => Promise<void>;
    itemDetails?: { label: string; value: string }[];
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "primary",
    onConfirm: async () => {},
  });

  const frequencyLabels: Record<RecurringFrequency, string> = {
    WEEKLY: tRec("freqWeekly"),
    BIWEEKLY: tRec("freqBiweekly"),
    MONTHLY: tRec("freqMonthly"),
    QUARTERLY: tRec("freqQuarterly"),
    ANNUALLY: tRec("freqAnnually"),
  };

  const handleStatusChange = async (id: string, newStatus: RecurringStatus, title: string) => {
    const isPausing = newStatus === "PAUSED";
    const isCancelling = newStatus === "CANCELLED";

    setDialogConfig({
      isOpen: true,
      title: isCancelling
        ? tRec("deleteTitle")
        : isPausing
        ? tRec("pauseTitle")
        : tRec("resumeTitle"),
      description: isCancelling
        ? tRec("deleteDesc")
        : isPausing
        ? tRec("pauseDesc")
        : tRec("resumeDesc"),
      confirmLabel: isCancelling
        ? tRec("deleteConfirm")
        : isPausing
        ? tRec("pauseConfirm")
        : tRec("resumeConfirm"),
      variant: isCancelling ? "danger" : isPausing ? "warning" : "success",
      itemDetails: [{ label: tRec("scheduleName"), value: title }],
      onConfirm: async () => {
        setLoadingId(id);
        try {
          await updateRecurringInvoiceStatus(id, newStatus);
          setSuccessMessage(tRec("statusUpdated"));
          setTimeout(() => setSuccessMessage(null), 4000);
          router.refresh();
        } catch (err: any) {
          setErrorMessage(err.message || tRec("genericError"));
          setTimeout(() => setErrorMessage(null), 4000);
        } finally {
          setLoadingId(null);
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleRunNow = async (id: string, title: string) => {
    setDialogConfig({
      isOpen: true,
      title: tRec("runNowTitle"),
      description: tRec("runNowDesc"),
      confirmLabel: tRec("runNowConfirm"),
      variant: "primary",
      itemDetails: [{ label: tRec("scheduleName"), value: title }],
      onConfirm: async () => {
        setLoadingId(id);
        try {
          const res = await triggerRecurringInvoiceNow(id);
          setSuccessMessage(tRec("runNowSuccess", { invoiceNumber: res.invoiceNumber }));
          setTimeout(() => setSuccessMessage(null), 5000);
          router.refresh();
        } catch (err: any) {
          setErrorMessage(err.message || tRec("runNowFailed"));
          setTimeout(() => setErrorMessage(null), 5000);
        } finally {
          setLoadingId(null);
          setDialogConfig((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
              <span>{tRec("title")}</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] border border-emerald-200 shadow-2xs">
              <SparklesIcon className="w-3.5 h-3.5 text-[#0f6b4f]" />
              PRO
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            {tRec("subtitle")}
          </p>
        </div>

        {isPro && (
          <Link
            href="/recurring-invoices/new"
            prefetch={true}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] shadow-xs shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{tRec("newRecurring")}</span>
          </Link>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckBadgeIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-2xs animate-in fade-in">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Non-PRO Upgrade Gate */}
      {!isPro ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <SparklesIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {tRec("proFeatureNotice")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
              {tRec("proFeatureDesc")}
            </p>
          </div>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-all cursor-pointer active:scale-[0.98] min-h-[44px]" />
          </div>
        </div>
      ) : recurringList.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ArrowPathIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {tRec("emptyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {tRec("emptyDesc")}
            </p>
          </div>
          <div>
            <Link
              href="/recurring-invoices/new"
              prefetch={true}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] transition-all shadow-xs"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{tRec("newRecurring")}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Cards / Table List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurringList.map((item) => {
            const isItemLoading = loadingId === item.id;
            const subtotal = item.items.reduce(
              (sum, it) => sum + Math.round(it.quantity * it.price),
              0
            );

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Title & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        {frequencyLabels[item.frequency]}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    {item.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0f6b4f] animate-pulse" />
                        {tRec("statusActive")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                        {tRec("statusPaused")}
                      </span>
                    )}
                  </div>

                  {/* Customer & Amount Info */}
                  <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {tRec("customer")}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {item.customer?.name || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">{tRec("estimatedTotal")}</span>
                      <span className="font-bold text-[#0f6b4f] text-sm tabular-nums">
                        Rp{subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {item.autoSendEmail && item.customer?.email && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{tRec("autoEmailActive", { email: item.customer.email })}</span>
                      </div>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <CalendarDaysIcon className="w-3 h-3" />
                        {tRec("nextRun")}
                      </span>
                      <p className="font-semibold text-slate-800">
                        {formatDateWIB(new Date(item.nextRunDate))}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[11px]">
                        {tRec("lastRun")}
                      </span>
                      <p className="font-medium text-slate-600">
                        {item.lastRunDate ? formatDateWIB(new Date(item.lastRunDate)) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunNow(item.id, item.title)}
                    disabled={isItemLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#0f6b4f] hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <PlayIcon className="w-3.5 h-3.5" />
                    <span>{tRec("runNow")}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {item.status === "ACTIVE" ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, "PAUSED", item.title)}
                        disabled={isItemLoading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 cursor-pointer"
                        title={tRec("pauseSchedule")}
                      >
                        <PauseIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, "ACTIVE", item.title)}
                        disabled={isItemLoading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50 cursor-pointer"
                        title={tRec("resumeSchedule")}
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.id, "CANCELLED", item.title)}
                      disabled={isItemLoading}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title={tRec("deleteSchedule")}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={dialogConfig.onConfirm}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmLabel={dialogConfig.confirmLabel}
        variant={dialogConfig.variant}
        itemDetails={dialogConfig.itemDetails}
      />
    </div>
  );
}
