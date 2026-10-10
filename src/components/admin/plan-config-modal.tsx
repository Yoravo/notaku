"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  XMarkIcon,
  SparklesIcon,
  CalendarDaysIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  ADMIN_PLANS,
  ADMIN_PLAN_DURATIONS,
  computeAdminPeriodEnd,
  type AdminPlan,
  type AdminPlanDuration,
} from "@/lib/admin-plan";

interface PlanConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: AdminPlan, duration: AdminPlanDuration) => void | Promise<void>;
  userName: string;
  userEmail: string;
  currentPlan: AdminPlan;
  currentExpiresAt?: string | null;
  isLoading?: boolean;
}

const PLAN_META: Record<
  AdminPlan,
  { label: string; badgeClass: string; descKey: string }
> = {
  FREE: {
    label: "FREE",
    badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    descKey: "planDescFree",
  },
  LITE: {
    label: "LITE",
    badgeClass: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800",
    descKey: "planDescLite",
  },
  PRO: {
    label: "PRO",
    badgeClass: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-800",
    descKey: "planDescPro",
  },
  BUSINESS: {
    label: "BUSINESS",
    badgeClass: "bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-200/60 dark:border-violet-800",
    descKey: "planDescBusiness",
  },
};

const DURATION_OPTIONS: { id: AdminPlanDuration; labelKey: string }[] = [
  { id: "30_DAYS", labelKey: "duration30" },
  { id: "90_DAYS", labelKey: "duration90" },
  { id: "180_DAYS", labelKey: "duration180" },
  { id: "365_DAYS", labelKey: "duration365" },
  { id: "PERMANENT", labelKey: "durationPermanent" },
];

export function PlanConfigModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
  currentPlan,
  currentExpiresAt,
  isLoading = false,
}: PlanConfigModalProps) {
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [selectedPlan, setSelectedPlan] = useState<AdminPlan>(currentPlan);
  const [selectedDuration, setSelectedDuration] = useState<AdminPlanDuration>("30_DAYS");

  // Sync initial state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(currentPlan);
      setSelectedDuration("30_DAYS");
    }
  }, [isOpen, currentPlan]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isFree = selectedPlan === "FREE";
  const projectedExpiry = computeAdminPeriodEnd(selectedPlan, selectedDuration);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="min-w-0">
            <h2
              id="plan-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{tAdmin("managePlan")}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {userName || "User"} ({userEmail})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Pilih Tier */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {tAdmin("selectTier")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_PLANS.map((plan) => {
              const meta = PLAN_META[plan];
              const isSelected = selectedPlan === plan;
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                    isSelected
                      ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20 dark:ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {tAdmin(meta.descKey as any)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Pilih Durasi (Hanya untuk Paket Berbayar) */}
        {!isFree ? (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
              <span>{tAdmin("selectDuration")}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = selectedDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer min-h-[44px] inline-flex items-center justify-center ${
                      isSelected
                        ? "border-[#0f6b4f] dark:border-emerald-500 bg-[#0f6b4f] dark:bg-emerald-700 text-white font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tAdmin(opt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-xs text-slate-600 dark:text-slate-400">
            {tAdmin("noExpiration")}
          </div>
        )}

        {/* Summary Info Box */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">{tAdmin("planCurrentLabel")}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentPlan}{" "}
              {currentExpiresAt ? `(s/d ${formatDateWIB(currentExpiresAt)})` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{tAdmin("planNewLabel")}</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              {selectedPlan}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{tAdmin("planValidityLabel")}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {isFree
                ? tAdmin("noExpiration")
                : projectedExpiry === null
                ? tAdmin("durationPermanent")
                : formatDateWIB(projectedExpiry, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px]"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedPlan, selectedDuration)}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isLoading ? (
              <span>{tAdmin("planProcessing")}</span>
            ) : (
              <span>{tAdmin("savePlanChanges")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
