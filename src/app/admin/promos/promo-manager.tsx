"use client";

import { useState, useTransition } from "react";
import { savePromoCode, type PromoData } from "@/actions/admin";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  TagIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export function PromoManager({ initialPromos }: { initialPromos: PromoData[] }) {
  const tAdmin = useTranslations("admin");
  const [promos, setPromos] = useState<PromoData[]>(initialPromos);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setFeedback({
        type: "error",
        text: tAdmin("codeRequired"),
      });
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      const res = await savePromoCode({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive,
      });

      if (res.success && res.promo) {
        setFeedback({
          type: "success",
          text: tAdmin("saveSuccess", { code: res.promo.code }),
        });
        // Update local list
        setPromos((prev) => {
          const filtered = prev.filter((p) => p.code !== res.promo!.code);
          return [res.promo!, ...filtered];
        });
        // Reset inputs
        setCode("");
        setDescription("");
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Gagal menyimpan promo",
        });
      }
    });
  };

  const handleToggleStatus = (promo: PromoData) => {
    startTransition(async () => {
      const updated = { ...promo, isActive: !promo.isActive };
      const res = await savePromoCode(updated);
      if (res.success) {
        setPromos((prev) =>
          prev.map((p) => (p.code === promo.code ? { ...p, isActive: !p.isActive } : p))
        );
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Promo Creation Form */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs h-fit">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <TagIcon className="w-5 h-5 text-[#0f6b4f]" />
          <span>{tAdmin("formTitle")}</span>
        </h2>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 shadow-2xs ${
              feedback.type === "success"
                ? "bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60"
                : "bg-rose-50 text-rose-800 border border-rose-200/60"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-[#0f6b4f] shrink-0" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {tAdmin("codeLabel")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={tAdmin("codePlaceholder")}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl uppercase font-mono font-bold tracking-wider focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {tAdmin("descLabel")}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tAdmin("descPlaceholder")}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors font-medium min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tAdmin("discountTypeLabel")}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              >
                <option value="PERCENTAGE">{tAdmin("discountPercentage")}</option>
                <option value="FIXED">{tAdmin("discountFixed")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tAdmin("discountValueLabel")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold bg-slate-50/50 focus:bg-white text-slate-900 focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tAdmin("maxUsesLabel")}
              </label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder={tAdmin("maxUsesPlaceholder")}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {tAdmin("expiresAtLabel")}
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:ring-1 focus:ring-[#0f6b4f] font-mono text-xs min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 min-h-[44px]">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#0f6b4f] focus:ring-[#0f6b4f] border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-slate-700 font-semibold cursor-pointer select-none text-xs">
              {tAdmin("activateVoucherNow")}
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-[#0f6b4f] hover:bg-[#0c553e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
          >
            {isPending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SparklesIcon className="w-4 h-4 text-emerald-300" />
            )}
            <span>{isPending ? tAdmin("saving") : tAdmin("saveVoucherBtn")}</span>
          </button>
        </form>
      </div>

      {/* Promo List Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-600" />
            <span>
              {tAdmin("tableTitle")} ({promos.length})
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {tAdmin("readyForCheckout")}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          {promos.length === 0 ? (
            <div className="p-12 text-center">
              <TagIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {tAdmin("emptyPromos")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {tAdmin("firstPromoPrompt")}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">{tAdmin("colCode")}</th>
                  <th className="py-3.5 px-4">{tAdmin("colDiscount")}</th>
                  <th className="py-3.5 px-4">{tAdmin("colUsage")} / {tAdmin("colExpires")}</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">{tAdmin("colAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promos.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                        {p.code}
                      </span>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate max-w-xs font-medium">
                          {p.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#0f6b4f]">
                      {p.discountType === "PERCENTAGE"
                        ? `${p.discountValue}% OFF`
                        : `Rp ${p.discountValue.toLocaleString("id-ID")}`}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-medium">
                      <div>
                        {tAdmin("claims")}{" "}
                        {p.maxUses
                          ? `${p.usedCount || 0} / ${p.maxUses}`
                          : `${p.usedCount || 0} (${tAdmin("unlimited")})`}
                      </div>
                      {p.expiresAt && (
                        <div className="text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <ClockIcon className="w-3 h-3" />
                          {formatDateWIB(p.expiresAt)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                          p.isActive
                            ? "bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {p.isActive
                          ? tAdmin("statusActive")
                          : tAdmin("statusInactive")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs min-h-[36px] ${
                          p.isActive
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 text-[#0f6b4f] hover:bg-emerald-100 border border-emerald-200/60"
                        }`}
                      >
                        {p.isActive
                          ? tAdmin("actionDeactivate")
                          : tAdmin("actionActivate")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
