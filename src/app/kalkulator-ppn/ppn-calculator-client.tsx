"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalculatorIcon,
  SparklesIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { FreeToolsNav } from "@/components/free-tools-nav";

export function PpnCalculatorClient() {
  const [calculationMode, setCalculationMode] = useState<"EXCLUDE_PPN" | "INCLUDE_PPN">("EXCLUDE_PPN");
  const [rateType, setRateType] = useState<"11" | "12" | "CUSTOM">("12");
  const [customRate, setCustomRate] = useState<number>(11);
  const [amountInput, setAmountInput] = useState<string>("1000000");
  const [copied, setCopied] = useState(false);

  const activeRate = rateType === "11" ? 11 : rateType === "12" ? 12 : Math.max(0, customRate);
  const rawAmount = Number(amountInput.replace(/\D/g, "")) || 0;

  // Logika Perhitungan:
  // 1. Belum Termasuk PPN (Exclude PPN): Nilai Input = DPP
  //    PPN = DPP * (Rate / 100)
  //    Total Akhir = DPP + PPN
  // 2. Sudah Termasuk PPN (Include PPN): Nilai Input = Total Akhir
  //    DPP = Total Akhir / (1 + (Rate / 100))
  //    PPN = Total Akhir - DPP
  let dpp = 0;
  let ppn = 0;
  let total = 0;

  if (calculationMode === "EXCLUDE_PPN") {
    dpp = rawAmount;
    ppn = Math.round((dpp * activeRate) / 100);
    total = dpp + ppn;
  } else {
    total = rawAmount;
    dpp = Math.round(total / (1 + activeRate / 100));
    ppn = total - dpp;
  }

  const formatRupiah = (num: number) => {
    return `Rp${Math.round(num).toLocaleString("id-ID")}`;
  };

  const handleCopySummary = () => {
    const summaryText = `Rincian Perhitungan Pajak:\n• Nilai Transaksi: ${formatRupiah(rawAmount)} (${calculationMode === "EXCLUDE_PPN" ? "Sebelum Pajak" : "Sudah Termasuk Pajak"})\n• Tarif PPN: ${activeRate}%\n• Dasar Pengenaan Pajak (DPP): ${formatRupiah(dpp)}\n• Nominal PPN: ${formatRupiah(ppn)}\n• Total Akhir Tagihan: ${formatRupiah(total)}\n\nDihitung dengan NotaKu (https://notaku.store/kalkulator-ppn)`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-emerald/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
            <span>Nota</span>
            <span className="text-emerald">Ku</span>
            <span className="ml-2 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald border border-emerald/20">
              Tax Tool
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/buat-invoice"
              className="text-xs font-bold text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Invoice Generator
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald px-4 py-2 text-xs font-bold text-paper shadow-sm hover:bg-emerald-bright transition-all"
            >
              <span>Daftar Gratis</span>
              <SparklesIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-line bg-paper-deep/40 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald border border-emerald/20 mb-3">
            <CalculatorIcon className="w-4 h-4" />
            Kalkulator Pajak Online Indonesia
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            Kalkulator PPN 11% & 12% dan DPP Online
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Hitung otomatis nilai DPP (Dasar Pengenaan Pajak), nominal PPN, serta total tagihan sebelum atau sesudah pajak sesuai regulasi perpajakan terbaru di Indonesia.
          </p>
        </div>
      </section>

      {/* Calculator Workspace */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Pilih Jenis Perhitungan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCalculationMode("EXCLUDE_PPN")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  calculationMode === "EXCLUDE_PPN"
                    ? "border-emerald bg-emerald-50/70 text-[#0f6b4f] ring-1 ring-emerald shadow-2xs font-bold"
                    : "border-line bg-paper-deep/30 text-ink-soft hover:bg-paper-deep"
                }`}
              >
                <div className="text-xs sm:text-sm">Nilai Belum Termasuk PPN</div>
                <div className="text-[11px] font-normal text-ink-soft mt-0.5">
                  Input adalah DPP, hitung tambahan PPN & Grand Total
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCalculationMode("INCLUDE_PPN")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  calculationMode === "INCLUDE_PPN"
                    ? "border-emerald bg-emerald-50/70 text-[#0f6b4f] ring-1 ring-emerald shadow-2xs font-bold"
                    : "border-line bg-paper-deep/30 text-ink-soft hover:bg-paper-deep"
                }`}
              >
                <div className="text-xs sm:text-sm">Nilai Sudah Termasuk PPN</div>
                <div className="text-[11px] font-normal text-ink-soft mt-0.5">
                  Input adalah Total Akhir, cari DPP & PPN di dalamnya
                </div>
              </button>
            </div>
          </div>

          {/* Rate Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
              Tarif Pajak (PPN)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRateType("12")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  rateType === "12"
                    ? "border-emerald bg-emerald text-paper shadow-2xs"
                    : "border-line bg-paper-deep text-ink hover:border-ink/30"
                }`}
              >
                PPN 12% (Standar Terbaru)
              </button>

              <button
                type="button"
                onClick={() => setRateType("11")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  rateType === "11"
                    ? "border-emerald bg-emerald text-paper shadow-2xs"
                    : "border-line bg-paper-deep text-ink hover:border-ink/30"
                }`}
              >
                PPN 11%
              </button>

              <button
                type="button"
                onClick={() => setRateType("CUSTOM")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  rateType === "CUSTOM"
                    ? "border-emerald bg-emerald text-paper shadow-2xs"
                    : "border-line bg-paper-deep text-ink hover:border-ink/30"
                }`}
              >
                Kustom Tarif %
              </button>

              {rateType === "CUSTOM" && (
                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                    className="w-20 rounded-xl border border-line p-2 text-xs font-bold text-center text-ink focus:border-emerald focus:outline-none"
                  />
                  <span className="text-xs font-bold text-ink-soft">%</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {calculationMode === "EXCLUDE_PPN" ? "Nominal Nilai Sebelum Pajak (DPP)" : "Nominal Total Tagihan (Termasuk Pajak)"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-soft">
                Rp
              </span>
              <input
                type="text"
                value={Number(rawAmount).toLocaleString("id-ID")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmountInput(val);
                }}
                placeholder="1.000.000"
                className="w-full rounded-xl border border-line bg-paper-deep/20 pl-11 pr-4 py-3 text-base sm:text-lg font-bold font-mono text-ink focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-2xl border border-emerald/30 bg-emerald-50/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald/20 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f6b4f]">
                Hasil Perhitungan Resmi
              </span>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f6b4f] hover:text-emerald-bright transition-colors"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Salin Rincian</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="rounded-xl bg-white p-4 border border-emerald/20 shadow-2xs">
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  Dasar Pengenaan Pajak (DPP)
                </span>
                <p className="font-display text-lg sm:text-xl font-bold text-ink mt-1 tabular-nums">
                  {formatRupiah(dpp)}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-emerald/20 shadow-2xs">
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">
                  Nominal PPN ({activeRate}%)
                </span>
                <p className="font-display text-lg sm:text-xl font-bold text-emerald mt-1 tabular-nums">
                  {formatRupiah(ppn)}
                </p>
              </div>

              <div className="rounded-xl bg-[#0f6b4f] p-4 text-white shadow-xs">
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
                  Total Tagihan Akhir
                </span>
                <p className="font-display text-lg sm:text-xl font-bold mt-1 tabular-nums">
                  {formatRupiah(total)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald/20">
              <div className="flex items-center gap-1.5 text-xs text-[#0f6b4f]">
                <InformationCircleIcon className="w-4 h-4 shrink-0" />
                <span>Ingin langsung memasukkan rincian ini ke invoice PDF resmi?</span>
              </div>
              <Link
                href="/buat-invoice"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] hover:underline"
              >
                <span>Buka Generator Invoice</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Educational Guide: Rumus & Ketentuan PPN */}
        <section className="border-t border-line pt-10 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
              Panduan & Rumus Menghitung PPN di Indonesia
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft">
              Memahami perbedaan cara menghitung nilai barang sebelum dan sesudah dikenakan PPN.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-line bg-white p-5 space-y-2.5">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald/10 text-emerald text-xs font-bold">
                  A
                </span>
                <span>Rumus PPN Belum Termasuk (Exclude)</span>
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Jika harga barang belum ada pajak, maka harga tersebut adalah <strong>DPP</strong>.
              </p>
              <div className="rounded-xl bg-paper-deep/60 p-3 font-mono text-xs text-ink space-y-1">
                <div>PPN = DPP × Tarif Pajak (12%)</div>
                <div>Total = DPP + PPN</div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 space-y-2.5">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald/10 text-emerald text-xs font-bold">
                  B
                </span>
                <span>Rumus PPN Sudah Termasuk (Include)</span>
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Jika harga tertera sudah termasuk pajak, gunakan pembagian faktor:
              </p>
              <div className="rounded-xl bg-paper-deep/60 p-3 font-mono text-xs text-ink space-y-1">
                <div>DPP = Total Akhir ÷ (1 + 0.12)</div>
                <div>PPN = Total Akhir - DPP</div>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-linking Free Tools Navigation */}
        <FreeToolsNav />
      </main>
    </div>
  );
}
