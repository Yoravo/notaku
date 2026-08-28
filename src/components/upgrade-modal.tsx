"use client";

import { useState } from "react";
import { CheckIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        setError(data.error || "Gagal membuat tautan pembayaran. Coba lagi.");
        setLoading(false);
        return;
      }

      // Redirect langsung ke halaman checkout Mayar (QRIS, VA Bank, E-Wallet, Kartu Kredit)
      window.location.href = data.paymentUrl;
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-gray-100">
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

        {/* Pricing Box */}
        <div className="rounded-xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 p-4 border border-emerald-200/80">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Akses Penuh Unlimited
              </span>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                Rp49.000
                <span className="text-xs font-medium text-gray-500 ml-1">
                  / 30 hari
                </span>
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Diskon Peluncuran
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Feature List */}
        <ul className="space-y-2.5 text-xs text-gray-700">
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
        <div className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-3">
          Didukung pembayaran resmi via <strong>QRIS</strong>, <strong>Virtual Account (BCA, Mandiri, BRI, BNI)</strong>, <strong>E-Wallet</strong>, dan <strong>Kartu Kredit</strong>.
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
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
            {loading ? "Menyiapkan Pembayaran..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
