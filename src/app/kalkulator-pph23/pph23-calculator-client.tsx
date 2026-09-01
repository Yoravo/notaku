"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalculatorIcon,
  SparklesIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { FreeToolsNav } from "@/components/free-tools-nav";
import { LandingNavbar } from "@/components/landing-navbar";

export function Pph23CalculatorClient({ session }: { session?: any }) {
  const [grossAmount, setGrossAmount] = useState<string>("5000000");
  const [hasNpwp, setHasNpwp] = useState<boolean>(true);
  const [includePpn, setIncludePpn] = useState<boolean>(false);
  const [ppnRate, setPpnRate] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);

  const rawGross = Number(grossAmount.replace(/\D/g, "")) || 0;

  // Tarif PPh 23:
  // - Memiliki NPWP/NIK: 2%
  // - Tanpa NPWP: 100% lebih tinggi (4%)
  const pphRatePercent = hasNpwp ? 2 : 4;
  const pphAmount = Math.round(rawGross * (pphRatePercent / 100));

  // PPN jika berlaku
  const ppnAmount = includePpn ? Math.round(rawGross * (ppnRate / 100)) : 0;

  // Uang yang ditransfer klien (Net Cash Received by Vendor):
  // Bruto - Potongan PPh 23 (+ PPN jika ditagihkan ke klien)
  const netReceived = rawGross - pphAmount + ppnAmount;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopySummary = () => {
    const summaryText = `Rincian Perhitungan PPh 23 & Tagihan:
- Nilai Jasa (DPP Bruto): ${formatRupiah(rawGross)}
- Tarif PPh 23: ${pphRatePercent}% (${hasNpwp ? "Ber-NPWP" : "Tanpa NPWP"})
- Potongan PPh 23 (Dipotong Klien): ${formatRupiah(pphAmount)}
${includePpn ? `- PPN ${ppnRate}%: ${formatRupiah(ppnAmount)}\n` : ""}- Total Kas yang Diterima: ${formatRupiah(netReceived)}

Dihitung via Kalkulator Pajak NotaKu (notaku.store/kalkulator-pph23)`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Top Navbar */}
      <LandingNavbar session={session} />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <CalculatorIcon className="w-4 h-4" />
            Pajak Penghasilan Pasal 23 Jasa & Sewa
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Kalkulator PPh 23 Jasa & Potongan Invoice
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            Hitung besaran potongan pajak PPh Pasal 23 atas jasa konsultan, agensi, IT, dan sewa dengan tarif resmi (2% ber-NPWP atau 4% tanpa NPWP) secara akurat.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="rounded-3xl bg-surface border border-border-light shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          {/* Input Nilai Bruto */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2">
              Nilai Bruto Tagihan Jasa (DPP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-ink-soft">
                Rp
              </span>
              <input
                type="text"
                value={grossAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setGrossAmount(val ? Number(val).toLocaleString("id-ID") : "");
                }}
                className="w-full text-base sm:text-lg font-bold bg-paper border border-border rounded-2xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none text-ink"
                placeholder="5.000.000"
              />
            </div>
          </div>

          {/* Opsi NPWP */}
          <div className="p-4 rounded-2xl bg-paper border border-border-light space-y-2">
            <label className="block text-xs font-bold text-ink">
              Status Kepemilikan NPWP / NIK Penyedia Jasa:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasNpwp(true)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  hasNpwp
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-800"
                    : "border-border bg-surface text-ink-soft hover:border-border"
                }`}
              >
                <span>Memiliki NPWP / NIK Terdaftar</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                  Tarif 2%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHasNpwp(false)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  !hasNpwp
                    ? "border-rose-500 bg-rose-500/10 text-rose-800"
                    : "border-border bg-surface text-ink-soft hover:border-border"
                }`}
              >
                <span>Tidak Memiliki NPWP (100% lebih tinggi)</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                  Tarif 4%
                </span>
              </button>
            </div>
          </div>

          {/* Opsi Tambahan PPN */}
          <div className="p-4 rounded-2xl bg-paper border border-border-light space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-ink">Sertakan PPN pada Invoice</span>
                <p className="text-[11px] text-ink-soft">Jika penyedia jasa berstatus PKP (Pengusaha Kena Pajak)</p>
              </div>
              <input
                type="checkbox"
                checked={includePpn}
                onChange={(e) => setIncludePpn(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {includePpn && (
              <div className="flex items-center gap-3 pt-2 border-t border-border-light">
                <span className="text-xs font-semibold text-ink-soft">Tarif PPN:</span>
                <button
                  type="button"
                  onClick={() => setPpnRate(11)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    ppnRate === 11 ? "bg-emerald-600 text-white" : "bg-surface border border-border text-ink-soft"
                  }`}
                >
                  11%
                </button>
                <button
                  type="button"
                  onClick={() => setPpnRate(12)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    ppnRate === 12 ? "bg-emerald-600 text-white" : "bg-surface border border-border text-ink-soft"
                  }`}
                >
                  12% (Standar Terbaru)
                </button>
              </div>
            )}
          </div>

          {/* Hasil Rekapitulasi Pajak */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Ringkasan Potongan & Realisasi Transfer
              </span>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin!" : "Salin Hasil"}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Nilai Jasa Bruto (DPP):</span>
                <span className="font-bold text-white tabular-nums">{formatRupiah(rawGross)}</span>
              </div>

              <div className="flex justify-between items-center text-rose-300">
                <span>Potongan PPh 23 ({pphRatePercent}%):</span>
                <span className="font-bold tabular-nums">- {formatRupiah(pphAmount)}</span>
              </div>

              {includePpn && (
                <div className="flex justify-between items-center text-emerald-300">
                  <span>Ditambah PPN ({ppnRate}%):</span>
                  <span className="font-bold tabular-nums">+ {formatRupiah(ppnAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                <div>
                  <div className="text-xs font-extrabold text-white">Kas Bersih Diterima Penjual:</div>
                  <div className="text-[10px] text-slate-400">Total ditransfer klien setelah dipotong PPh 23</div>
                </div>
                <div className="text-lg sm:text-2xl font-black text-emerald-400 tabular-nums">
                  {formatRupiah(netReceived)}
                </div>
              </div>
            </div>
          </div>

          {/* CTA ke Generator Invoice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <InformationCircleIcon className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Ingin langsung buat invoice tagihan resmi ber-NPWP dengan format PDF?</span>
            </div>
            <Link
              href="/buat-invoice"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 shadow-sm transition"
            >
              Buat Invoice Sekarang
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Educational Content & FAQ */}
        <section className="mt-14 sm:mt-20 border-t border-border-light pt-12 max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
              Panduan Pajak Penghasilan Pasal 23 (PPh 23)
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft">
              Ketentuan pemotongan pajak atas transaksi jasa antar badan usaha & perorangan di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-border-light space-y-2">
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                Siapa yang Memotong PPh 23?
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Pihak yang wajib memotong dan menyetorkan PPh 23 ke kas negara adalah <strong>pihak pembeli / klien (pemberi penghasilan)</strong>. Penjual akan menerima bukti potong (Bupot) sebagai kredit pajak saat SPT Tahunan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border-light space-y-2">
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                Objek Jasa Kena PPh 23
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Meliputi jasa teknik, manajemen, konsultan hukum/bisnis, desain grafis, software development, periklanan/agensi, katering, serta sewa harta selain tanah dan/atau bangunan.
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
