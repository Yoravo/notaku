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
import { useLanguage } from "@/lib/i18n/context";

export function PromoManager({ initialPromos }: { initialPromos: PromoData[] }) {
  const { t, locale } = useLanguage();
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
        text: locale === "id" ? "Kode voucher tidak boleh kosong" : "Promo voucher code cannot be empty",
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
          text:
            locale === "id"
              ? `Voucher ${res.promo.code} berhasil disimpan!`
              : `Voucher ${res.promo.code} saved successfully!`,
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
          text: res.error || (locale === "id" ? "Gagal menyimpan promo" : "Failed to save promo voucher"),
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
          <span>{locale === "id" ? "Buat Kode Voucher Baru" : "Create New Promo Voucher"}</span>
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
              {locale === "id" ? "Kode Promo / Kupon" : "Voucher Code"} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={locale === "id" ? "Contoh: NOTAKULAUNCH, DISKON50" : "e.g. NOTAKULAUNCH, DISKON50"}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl uppercase font-mono font-bold tracking-wider focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {locale === "id" ? "Deskripsi Promo" : "Description (Optional)"}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === "id" ? "Diskon khusus peluncuran awal" : "Special early launch promo"}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors font-medium min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {locale === "id" ? "Tipe Diskon" : "Discount Type"}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white font-medium text-slate-800 focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              >
                <option value="PERCENTAGE">{locale === "id" ? "Persen (%)" : "Percentage (%)"}</option>
                <option value="FIXED">{locale === "id" ? "Nominal Tetap (Rp)" : "Fixed Amount (IDR)"}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {locale === "id" ? "Besaran Diskon" : "Discount Value"} <span className="text-rose-500">*</span>
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
                {locale === "id" ? "Batas Klaim (Opsional)" : "Max Uses (Optional)"}
              </label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder={locale === "id" ? "Tak terbatas" : "Unlimited"}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white text-slate-900 focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {locale === "id" ? "Kedaluwarsa (Opsional)" : "Expires At (Optional)"}
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
              {locale === "id" ? "Aktifkan Voucher Ini Sekarang" : "Activate this voucher now"}
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
            <span>{locale === "id" ? "Simpan Voucher Promo" : "Save Promo Voucher"}</span>
          </button>
        </form>
      </div>

      {/* Promo List Table */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-600" />
            <span>
              {locale === "id"
                ? `Daftar Voucher Aktif & Riwayat (${promos.length})`
                : `Active Vouchers & History (${promos.length})`}
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {locale === "id" ? "Siap untuk Mayar Checkout" : "Ready for Mayar Checkout"}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          {promos.length === 0 ? (
            <div className="p-12 text-center">
              <TagIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">
                {locale === "id" ? "Belum ada kode promo" : "No promo vouchers yet"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {locale === "id"
                  ? "Buat voucher pertama Anda melalui form di samping."
                  : "Create your first promo voucher via the form on the left."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">{locale === "id" ? "Kode Voucher" : "Voucher Code"}</th>
                  <th className="py-3.5 px-4">{locale === "id" ? "Diskon" : "Discount"}</th>
                  <th className="py-3.5 px-4">{locale === "id" ? "Batas / Expired" : "Limit / Expired"}</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">{locale === "id" ? "Aksi" : "Action"}</th>
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
                        {locale === "id" ? "Klaim:" : "Uses:"}{" "}
                        {p.maxUses
                          ? `${p.usedCount || 0} / ${p.maxUses}`
                          : `${p.usedCount || 0} (${locale === "id" ? "Unlimited" : "Unlimited"})`}
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
                          ? locale === "id" ? "AKTIF" : "ACTIVE"
                          : locale === "id" ? "NONAKTIF" : "INACTIVE"}
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
                          ? locale === "id" ? "Nonaktifkan" : "Deactivate"
                          : locale === "id" ? "Aktifkan" : "Activate"}
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
