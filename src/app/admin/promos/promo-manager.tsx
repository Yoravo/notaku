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

export function PromoManager({ initialPromos }: { initialPromos: PromoData[] }) {
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
      setFeedback({ type: "error", text: "Kode voucher tidak boleh kosong" });
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
        setFeedback({ type: "success", text: `Voucher ${res.promo.code} berhasil disimpan!` });
        // Update local list
        setPromos((prev) => {
          const filtered = prev.filter((p) => p.code !== res.promo!.code);
          return [res.promo!, ...filtered];
        });
        // Reset inputs
        setCode("");
        setDescription("");
      } else {
        setFeedback({ type: "error", text: res.error || "Gagal menyimpan promo" });
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
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs h-fit">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <TagIcon className="w-5 h-5 text-emerald-600" />
          Buat Kode Voucher Baru
        </h2>

        {feedback && (
          <div
            className={`p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kode Promo / Kupon <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: NOTAKULAUNCH, DISKON50"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-bold tracking-wider focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Deskripsi Promo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Diskon khusus peluncuran awal"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipe Diskon
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="PERCENTAGE">Persen (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Besaran Diskon <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Klaim (Opsional)
              </label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Tak terbatas"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kedaluwarsa (Opsional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-slate-700 font-medium cursor-pointer select-none">
              Aktifkan Voucher Ini Sekarang
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SparklesIcon className="w-4 h-4 text-emerald-400" />
            )}
            <span>Simpan Voucher Promo</span>
          </button>
        </form>
      </div>

      {/* Promo List Table */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-600" />
            Daftar Voucher Aktif & Riwayat ({promos.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">Siap untuk Mayar Checkout</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          {promos.length === 0 ? (
            <div className="p-12 text-center">
              <TagIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum ada kode promo</p>
              <p className="text-xs text-slate-400 mt-1">Buat voucher pertama Anda melalui form di samping.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Kode Voucher</th>
                  <th className="py-3 px-4">Diskon</th>
                  <th className="py-3 px-4">Batas / Expired</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promos.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                        {p.code}
                      </span>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate max-w-xs">
                          {p.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {p.discountType === "PERCENTAGE"
                        ? `${p.discountValue}% OFF`
                        : `Rp ${p.discountValue.toLocaleString("id-ID")}`}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      <div>Klaim: {p.maxUses ? `Maks ${p.maxUses}` : "Unlimited"}</div>
                      {p.expiresAt && (
                        <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <ClockIcon className="w-3 h-3" />
                          {formatDateWIB(p.expiresAt)}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {p.isActive ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          p.isActive
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {p.isActive ? "Nonaktifkan" : "Aktifkan"}
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
