"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DocumentCheckIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { terbilangRupiah, terbilang } from "@/lib/terbilang";
import { FreeToolsNav } from "@/components/free-tools-nav";
import { LandingNavbar } from "@/components/landing-navbar";

export function TerbilangConverterClient({ session }: { session?: any }) {
  const [amountInput, setAmountInput] = useState<string>("25500000");
  const [casingFormat, setCasingFormat] = useState<"Title" | "UPPER" | "lower">("Title");
  const [includeRupiah, setIncludeRupiah] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const rawNumber = Number(amountInput.replace(/\D/g, "")) || 0;

  // Konversi terbilang
  let baseText = includeRupiah ? terbilangRupiah(rawNumber) : terbilang(rawNumber);

  if (casingFormat === "UPPER") {
    baseText = baseText.toUpperCase();
  } else if (casingFormat === "lower") {
    baseText = baseText.toLowerCase();
  }

  const quickPicks = [
    { label: "Rp 500 Ribu", value: 500000 },
    { label: "Rp 2,5 Juta", value: 2500000 },
    { label: "Rp 15 Juta", value: 15000000 },
    { label: "Rp 100 Juta", value: 100000000 },
    { label: "Rp 1 Miliar", value: 1000000000 },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(baseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-emerald/20">
      {/* Top Navbar */}
      <LandingNavbar session={session} />

      {/* Hero Header */}
      <section className="border-b border-line bg-paper-deep/40 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald border border-emerald/20 mb-3">
            <DocumentCheckIcon className="w-4 h-4" />
            Generator Angka Terbilang Indonesia
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            Konverter Angka ke Huruf Terbilang Rupiah
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Ubah nominal angka menjadi susunan kata ejaan bahasa Indonesia resmi untuk kuitansi, faktur, cek, dan kwitansi pembayaran secara instan.
          </p>
        </div>
      </section>

      {/* Converter Workspace */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Input Nominal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              Masukkan Nominal Angka Rupiah
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-soft">
                Rp
              </span>
              <input
                type="text"
                value={Number(rawNumber).toLocaleString("id-ID")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmountInput(val);
                }}
                placeholder="25.000.000"
                className="w-full rounded-xl border border-line bg-paper-deep/20 pl-11 pr-4 py-3 text-base sm:text-lg font-bold font-mono text-ink focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none"
              />
            </div>

            {/* Quick Pick Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[11px] font-bold text-ink-soft">Pilihan Cepat:</span>
              {quickPicks.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAmountInput(qp.value.toString())}
                  className="rounded-lg border border-line bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink-soft hover:text-emerald hover:border-emerald/40 transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options: Casing & Suffix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-line/60 pt-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                Format Huruf (Kapitalisasi)
              </label>
              <div className="flex items-center gap-2">
                {(["Title", "UPPER", "lower"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setCasingFormat(fmt)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      casingFormat === fmt
                        ? "border-emerald bg-emerald text-paper shadow-2xs"
                        : "border-line bg-paper-deep text-ink hover:border-ink/30"
                    }`}
                  >
                    {fmt === "Title" ? "Huruf Besar Depan" : fmt === "UPPER" ? "HURUF KAPITAL" : "huruf kecil"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
                Akhiran & Prefix
              </label>
              <button
                type="button"
                onClick={() => setIncludeRupiah(!includeRupiah)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                  includeRupiah
                    ? "border-emerald bg-emerald-50 text-[#0f6b4f]"
                    : "border-line bg-paper-deep text-ink-soft"
                }`}
              >
                <span>Sertakan kata &quot;Rupiah&quot; di akhir</span>
                <span className="text-[11px] font-mono">{includeRupiah ? "Aktif" : "Nonaktif"}</span>
              </button>
            </div>
          </div>

          {/* Output Card */}
          <div className="rounded-2xl border border-emerald/30 bg-emerald-50/50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald/20 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f6b4f]">
                Hasil Kalimat Terbilang
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-emerald/30 text-xs font-bold text-[#0f6b4f] hover:bg-emerald-50 shadow-2xs transition-all"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-[#0f6b4f]" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Salin Terbilang</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl bg-white p-5 border border-emerald/20 shadow-2xs">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed font-sans select-all">
                &quot;{baseText}&quot;
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald/20">
              <p className="text-xs text-[#0f6b4f]">
                Butuh kuitansi resmi PDF lengkap dengan stempel lunas & tanda tangan digital?
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] hover:underline"
              >
                <span>Coba NotaKu PRO</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Educational Content */}
        <section className="border-t border-line pt-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
              Pentingnya Kalimat Terbilang pada Dokumen Keuangan
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft">
              Mengapa penulisan terbilang wajib ada pada kuitansi, nota tagihan, dan surat perjanjian.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-line bg-white p-5 space-y-2">
              <h3 className="text-sm font-bold text-ink">Mencegah Manipulasi Angka</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Penulisan nominal dalam bentuk huruf kata mencegah pemalsuan atau penambahan digit nol pada kuitansi fisik maupun digital.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 space-y-2">
              <h3 className="text-sm font-bold text-ink">Kekuatan Pembuktian Hukum</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Bila terjadi selisih ketik antara angka numerik dan kalimat terbilang, hukum pembukuan di Indonesia umumnya memprioritaskan kalimat terbilang.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-linking Free Tools Navigation */}
        <FreeToolsNav />
      </main>
    </div>
  );
}
