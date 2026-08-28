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
        setPromoError(data.error || "Kode voucher tidak valid");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoError(null);
      }
    } catch {
      setPromoError("Gagal memeriksa voucher");
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
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: appliedPromo ? appliedPromo.code : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        setError(data.error || "Gagal membuat tautan pembayaran. Coba lagi.");
        setLoading(false);
        return;
      }

      // Redirect ke checkout Mayar
      window.location.href = data.paymentUrl;
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
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
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0f6b4f] flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Upgrade ke Nota<span className="text-[#0f6b4f]">Ku</span> PRO
              </h2>
              <p className="text-xs text-gray-500">
                Buka seluruh potensi bisnis Anda tanpa batas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Box with Promo Support */}
        <div className="rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 p-4 border border-emerald-200/80">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Akses Penuh Unlimited
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  Rp{currentPrice.toLocaleString("id-ID")}
                  <span className="text-xs font-medium text-gray-500 ml-1">
                    / 30 hari
                  </span>
                </p>
                {appliedPromo && (
                  <span className="text-xs text-gray-400 line-through font-semibold">
                    Rp49.000
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {appliedPromo
                ? appliedPromo.discountType === "PERCENTAGE"
                  ? `Hemat ${appliedPromo.discountValue}%`
                  : `Hemat Rp${appliedPromo.discountAmount.toLocaleString("id-ID")}`
                : "Diskon Peluncuran"}
            </span>
          </div>
        </div>

        {/* Promo Voucher Input Box */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Punya Kode Voucher Promo?</span>
            </label>
            {appliedPromo && (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Hapus Promo
              </button>
            )}
          </div>

          {!appliedPromo ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE VOUCHER"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase placeholder:text-gray-400 focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={validatingPromo || !inputCode.trim()}
                className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1"
              >
                {validatingPromo ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Terapkan"
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-emerald-900">
                    {appliedPromo.code}
                  </span>
                  <span className="text-[11px] text-emerald-700 ml-1.5">
                    (Potongan Rp{appliedPromo.discountAmount.toLocaleString("id-ID")})
                  </span>
                </div>
              </div>
            </div>
          )}

          {promoError && (
            <p className="text-[11px] text-rose-600 font-medium">
              {promoError}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Feature List */}
        <ul className="space-y-2 text-xs text-gray-700">
          {[
            "Pembuatan invoice & kuota pelanggan Unlimited",
            "Ekspor PDF resmi tanpa watermark NotaKu",
            "Kustomisasi Logo Bisnis, TTD Digital & Cap Stempel",
            "Pilihan Template Premium (Classic, Modern, Minimal)",
            "Kirim Pengingat Tagihan WhatsApp & Email Otomatis",
            "Laporan rekap keuangan & ekspor data lengkap (CSV)",
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 font-medium">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#0f6b4f] flex items-center justify-center shrink-0">
                <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Payment Methods Info */}
        <div className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-2.5">
          Didukung pembayaran resmi via <strong>QRIS</strong>, <strong>Virtual Account</strong>, <strong>E-Wallet</strong>, dan <strong>Kartu Kredit</strong>.
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Nanti Saja
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c5740] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            {loading ? "Menyiapkan Pembayaran..." : `Bayar Rp${currentPrice.toLocaleString("id-ID")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
