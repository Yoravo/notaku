"use client";

import { useState } from "react";
import {
  CheckIcon,
  SparklesIcon,
  XMarkIcon,
  TagIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

type PromoState = {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
} | null;

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("upgradeModal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo State
  const [inputCode, setInputCode] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoState>(null);

  const handleApplyPromo = async () => {
    if (!inputCode.trim()) return;
    setValidatingPromo(true);
    setPromoError(null);

    try {
      const res = await fetch("/api/payment/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inputCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || t("invalidVoucher"));
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoError(null);
      }
    } catch {
      setPromoError(t("failedCheckVoucher"));
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setInputCode("");
    setPromoError(null);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const getGaId = (field: "client_id" | "session_id") => new Promise<string | null>((resolve) => {
        if (typeof window.gtag !== "function") return resolve(null);
        const timeout = window.setTimeout(() => resolve(null), 800);
        try {
          window.gtag("get", "G-52C2DD26LB", field, (value: unknown) => {
            window.clearTimeout(timeout);
            const id = typeof value === "number" ? String(value) : value;
            resolve(typeof id === "string" && /^[0-9.]{1,100}$/.test(id) ? id : null);
          });
        } catch {
          window.clearTimeout(timeout);
          resolve(null);
        }
      });
      const [gaClientId, gaSessionId] = await Promise.all([
        getGaId("client_id"),
        getGaId("session_id"),
      ]);
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: appliedPromo ? appliedPromo.code : undefined,
          gaClientId: gaClientId || undefined,
          gaSessionId: gaSessionId || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        setError(data.error || t("failedPaymentLink"));
        setLoading(false);
        return;
      }

      // Redirect ke checkout Mayar
      window.location.href = data.paymentUrl;
    } catch {
      setError(t("connectionError"));
      setLoading(false);
    }
  };

  const currentPrice = appliedPromo ? appliedPromo.finalPrice : 49000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("titlePrefix")} Nota<span className="text-[#0f6b4f] dark:text-emerald-400">Ku</span> PRO
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Box with Promo Support */}
        <div className="rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-teal-950/20 p-4 border border-emerald-200/80 dark:border-emerald-800/80">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                {t("unlimitedAccess")}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Rp{currentPrice.toLocaleString("id-ID")}
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400 ml-1">
                    {t("per30Days")}
                  </span>
                </p>
                {appliedPromo && (
                  <span className="text-xs text-gray-400 dark:text-slate-500 line-through font-semibold">
                    Rp49.000
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
              {appliedPromo
                ? appliedPromo.discountType === "PERCENTAGE"
                  ? t("savePercent", { value: appliedPromo.discountValue })
                  : t("saveAmount", { amount: appliedPromo.discountAmount.toLocaleString("id-ID") })
                : t("launchDiscount")}
            </span>
          </div>
        </div>

        {/* Promo Voucher Input Box */}
        <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("hasPromoCode")}</span>
            </label>
            {appliedPromo && (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                {t("removePromo")}
              </button>
            )}
          </div>

          {!appliedPromo ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={t("voucherPlaceholder")}
                className="flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase placeholder:text-gray-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px] sm:min-h-[38px]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={validatingPromo || !inputCode.trim()}
                className="rounded-lg bg-slate-900 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 min-h-[44px] sm:min-h-[38px]"
              >
                {validatingPromo ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  t("apply")
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-300">
                    {appliedPromo.code}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 ml-1.5">
                    ({t("discountCut", { amount: appliedPromo.discountAmount.toLocaleString("id-ID") })})
                  </span>
                </div>
              </div>
            </div>
          )}

          {promoError && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              {promoError}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {error}
          </div>
        )}

        {/* Feature List */}
        <ul className="space-y-2 text-xs text-gray-700 dark:text-slate-300">
          {[
            t("feature1"),
            t("feature2"),
            t("feature3"),
            t("feature4"),
            t("feature5"),
            t("feature6"),
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 font-medium">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#0f6b4f] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800">
                <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Payment Methods Info */}
        <div className="text-[11px] text-gray-400 dark:text-slate-500 text-center border-t border-gray-100 dark:border-slate-800 pt-2.5">
          {t.rich("supportedPayments", {
            strong: (chunks) => <strong className="text-slate-600 dark:text-slate-300">{chunks}</strong>,
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[44px]"
          >
            {t("cancelBtn")}
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c5740] disabled:opacity-50 transition-colors cursor-pointer shadow-xs min-h-[44px]"
          >
            {loading ? t("preparingPayment") : t("payBtn", { price: currentPrice.toLocaleString("id-ID") })}
          </button>
        </div>
      </div>
    </div>
  );
}
