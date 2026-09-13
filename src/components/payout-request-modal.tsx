"use client";

import { useState } from "react";
import { requestPayout } from "@/actions/payouts";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface PayoutRequestModalProps {
  balance: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PayoutRequestModal({
  balance,
  bankName,
  bankAccountNumber,
  bankAccountName,
  isOpen,
  onClose,
}: PayoutRequestModalProps) {
  const locale = useLocale() as "id" | "en";
  const tWallet = useTranslations("wallet");
  const [amount, setAmount] = useState<number>(balance);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasBankAccount = Boolean(bankName && bankAccountNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBankAccount) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await requestPayout({
        amount: Number(amount),
        notes: notes || undefined,
      });

      if (!res.success) {
        setError(res.error || tWallet("requestFailed"));
      } else {
        setSuccess(res.message || tWallet("requestSuccess"));
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch {
      setError(tWallet("systemError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {tWallet("modalTitle")}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {tWallet("modalAvailableBalance")}{" "}
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatMoney(balance, "IDR", locale)}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200 shadow-2xs animate-in fade-in">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-[#0f6b4f] border border-emerald-200 shadow-2xs animate-in fade-in">
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-[#0f6b4f]" />
            <span>{success}</span>
          </div>
        )}

        {!hasBankAccount ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
              <BuildingLibraryIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {tWallet("noBankTitle")}
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                {tWallet("noBankDesc")}
              </p>
            </div>
            <Link
              href="/settings"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
            >
              {tWallet("setUpBankBtn")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rekening Tujuan Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs shadow-2xs space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                {tWallet("destinationAccountBox")}
              </p>
              <p className="font-bold text-slate-900 text-sm">
                {bankName} — <span className="font-mono">{bankAccountNumber}</span>
              </p>
              <p className="text-slate-500 font-medium">a/n {bankAccountName}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tWallet("amountLabel")} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="10000"
                  max={balance}
                  step="1000"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="100000"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs tabular-nums min-h-[44px]"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{tWallet("minAmount")}</span>
                <button
                  type="button"
                  onClick={() => setAmount(balance)}
                  className="font-bold text-[#0f6b4f] hover:underline cursor-pointer min-h-[32px] inline-flex items-center"
                >
                  {tWallet("withdrawAll")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tWallet("notesLabel")}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tWallet("notesPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium min-h-[44px]"
              />
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors min-h-[44px]"
              >
                {tWallet("cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading || amount < 10000 || amount > balance}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c553e] disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>{tWallet("processing")}</span>
                  </>
                ) : (
                  <span>{tWallet("confirmWithdrawal")}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
