"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { numberToWordsRupiah } from "@/lib/terbilang";
import { formatMoney, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currencies";
import { FreeToolsNav } from "@/components/free-tools-nav";
import { LandingNavbar } from "@/components/landing-navbar";

export function FreeReceiptGeneratorClient({ session }: { session?: any }) {
  const [currency, setCurrency] = useState<SupportedCurrency>("IDR");
  const [receiptNumber, setReceiptNumber] = useState("KW-202608-001");
  const [invoiceNumber, setInvoiceNumber] = useState("INV/2026/08/01");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank BCA");

  // Pihak yang membayar (Customer)
  const [customerName, setCustomerName] = useState("Bpk. Hendra Wijaya");
  const [customerAddress, setCustomerAddress] = useState("Jl. Sudirman No. 45, Jakarta Pusat");

  // Pihak Penerima (User / Bisnis)
  const [businessName, setBusinessName] = useState("CV Studio Kreasi Digital");
  const [userName, setUserName] = useState("Ahmad Fauzi");
  const [userPhone, setUserPhone] = useState("0812-3456-7890");
  const [userAddress, setUserAddress] = useState("Gedung Graha Utama Lt. 3, Jakarta");

  // Detail Uang & Peruntukan
  const [total, setTotal] = useState<number>(3500000);
  const [itemsSummary, setItemsSummary] = useState("Pelunasan Jasa Pembuatan Website & Desain Logo Perusahaan");
  const [notes, setNotes] = useState("Kuitansi ini merupakan bukti pembayaran yang sah dan telah diterima lunas.");

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const words = currency === "IDR"
    ? numberToWordsRupiah(total)
    : `${total.toLocaleString("en-US")} ${currency}`;

  const handleDownloadPdf = async () => {
    if (!customerName.trim()) {
      setErrorMessage("Nama pembayar / telah terima dari wajib diisi.");
      return;
    }
    if (total <= 0) {
      setErrorMessage("Jumlah nominal pembayaran harus lebih dari 0.");
      return;
    }

    setErrorMessage("");
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      const payload = {
        receiptNumber,
        invoiceNumber,
        currency,
        paidAt,
        paymentMethod,
        customerName,
        customerAddress,
        userName,
        businessName,
        userPhone,
        userAddress,
        itemsSummary,
        total,
        notes,
      };

      const res = await fetch("/api/tools/receipt-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal membuat PDF Kuitansi.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kuitansi_${receiptNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setDownloadSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Top Navbar */}
      <LandingNavbar session={session} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <DocumentCheckIcon className="w-4 h-4" />
            100% Gratis • Tanpa Registrasi • Ejaan Terbilang Otomatis
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Buat Kuitansi Tanda Terima Pembayaran Online
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            Ketik data pembayaran, nominal otomatis dieja ke huruf terbilang rupiah resmi. Dilengkapi stempel lunas dan langsung unduh format PDF siap cetak dalam 30 detik.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {/* Success Alert / Viral Lead Magnet */}
        {downloadSuccess && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-ink">Kuitansi PDF Berhasil Diunduh!</h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Ingin menyimpan data pelanggan, kirim kuitansi via WhatsApp, dan buat invoice berkala otomatis?
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm transition"
            >
              Daftar Akun Gratis
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 2-Column Layout: Form (Left) vs Live Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Editor */}
          <div className="lg:col-span-6 space-y-6">
            {/* Box 1: Info Kuitansi & Mata Uang */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-light pb-3">
                <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4 text-emerald-600" />
                  Informasi Dokumen & Pembayaran
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-ink-soft">Mata Uang:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                    aria-label="Pilih Mata Uang"
                    className="text-xs font-bold bg-paper border border-border rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    No. Kuitansi
                  </label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="KW-202608-001"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Referensi No. Invoice (Opsional)
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="INV/2026/08/01"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Tanggal Pembayaran
                  </label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Metode Pembayaran
                  </label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Transfer Bank BCA / Tunai / QRIS"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Pihak Pembayar (Sudah Terima Dari) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border-light pb-3">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Pihak Pembayar (Telah Terima Dari)
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Nama Pembayar / Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Nama klien atau pembeli"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Alamat Pembayar (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Kota atau alamat lengkap pembayar"
                  />
                </div>
              </div>
            </div>

            {/* Box 3: Nominal & Peruntukan Pembayaran */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border-light pb-3">
                <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                Nominal & Peruntukan Pembayaran
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Jumlah Pembayaran (Nominal Angka) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-ink-soft">
                      {currency}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={total}
                      onChange={(e) => setTotal(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-xs bg-paper border border-border rounded-xl pl-12 pr-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-emerald-600"
                      placeholder="3500000"
                    />
                  </div>
                </div>

                {/* Live Terbilang Preview Box */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Terbilang Otomatis:
                  </div>
                  <div className="text-xs font-bold text-emerald-900 italic leading-relaxed">
                    &ldquo;{words}&rdquo;
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Untuk Pembayaran
                  </label>
                  <textarea
                    rows={2}
                    value={itemsSummary}
                    onChange={(e) => setItemsSummary(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Contoh: Pembayaran Pelunasan Jasa Pembuatan Website & Aplikasi"
                  />
                </div>
              </div>
            </div>

            {/* Box 4: Penerima / Penjual */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border-light pb-3">
                <BuildingOffice2Icon className="w-4 h-4 text-emerald-600" />
                Pihak Penerima (Penjual / Pemberi Kuitansi)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Nama Usaha / Toko
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="CV / Toko Anda"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Nama Penandatangan
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Nama Lengkap Penjual"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Alamat / Kontak
                  </label>
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Alamat atau nomor telepon usaha"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Sedang Merender Kuitansi PDF...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Kuitansi Resmi PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Document Preview (Right) */}
          <div className="lg:col-span-6 sticky top-20">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-xl relative overflow-hidden text-slate-800">
              {/* Top Watermark Badge */}
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                  <div className="text-base font-extrabold text-slate-900 tracking-tight">
                    {businessName || userName || "Nama Usaha"}
                  </div>
                  {userAddress && (
                    <div className="text-[11px] text-slate-500 mt-0.5">{userAddress}</div>
                  )}
                  {userPhone && (
                    <div className="text-[11px] text-slate-500">{userPhone}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-widest">
                    KUITANSI
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">No: {receiptNumber}</div>
                  {invoiceNumber && (
                    <div className="text-[10px] text-slate-500">Ref: {invoiceNumber}</div>
                  )}
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4 sm:col-span-3 font-bold text-slate-600 uppercase text-[11px]">
                    Telah Terima Dari
                  </div>
                  <div className="col-span-1 text-center font-bold">:</div>
                  <div className="col-span-7 sm:col-span-8 font-bold text-slate-900">
                    {customerName || "(Nama Pembayar)"}
                    {customerAddress && (
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        {customerAddress}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4 sm:col-span-3 font-bold text-slate-600 uppercase text-[11px]">
                    Uang Sejumlah
                  </div>
                  <div className="col-span-1 text-center font-bold">:</div>
                  <div className="col-span-7 sm:col-span-8">
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 text-emerald-800 font-bold italic text-[11px] leading-relaxed">
                      # {words} #
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4 sm:col-span-3 font-bold text-slate-600 uppercase text-[11px]">
                    Untuk Pembayaran
                  </div>
                  <div className="col-span-1 text-center font-bold">:</div>
                  <div className="col-span-7 sm:col-span-8 text-slate-800 leading-relaxed">
                    {itemsSummary || "(Keterangan pembayaran barang / jasa)"}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Jumlah Pembayaran
                  </div>
                  <div className="bg-slate-50 border-2 border-emerald-600 rounded-lg px-4 py-2 inline-block">
                    <span className="text-base sm:text-lg font-black text-emerald-700">
                      {formatMoney(total, currency)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Metode: <span className="font-semibold text-slate-700">{paymentMethod}</span>
                  </div>
                </div>

                <div className="text-center w-40 relative">
                  <div className="text-[10px] text-slate-600 mb-2">
                    {paidAt ? paidAt : "Tanggal Pelunasan"}
                  </div>

                  {/* Stamp Badge */}
                  <div className="h-14 flex items-center justify-center relative">
                    <div className="border-2 border-emerald-600 bg-emerald-50/90 text-emerald-700 font-black text-xs px-3 py-1 rounded rotate-[-12deg] tracking-wider shadow-sm">
                      LUNAS
                    </div>
                  </div>

                  <div className="border-t border-slate-400 pt-1 text-xs font-bold text-slate-900 mt-2">
                    {userName || "Penerima"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {businessName || "Tanda Tangan"}
                  </div>
                </div>
              </div>

              {/* Footer Watermark */}
              <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                Bukti Pembayaran Sah • Diterbitkan secara digital via NotaKu.store
              </div>
            </div>

            {/* Quick SEO FAQ Accordion */}
            <div className="mt-8 p-5 rounded-2xl bg-surface border border-border-light space-y-3">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                Panduan & Pertanyaan Umum (FAQ Kuitansi)
              </h2>

              <details className="text-xs group">
                <summary className="cursor-pointer font-bold text-ink-soft hover:text-ink py-1">
                  Apa perbedaan invoice dan kuitansi?
                </summary>
                <p className="mt-1 text-ink-soft pl-3 border-l-2 border-emerald-500 leading-relaxed">
                  <strong>Invoice</strong> adalah dokumen penagihan yang dikirimkan sebelum klien membayar, sedangkan <strong>Kuitansi</strong> adalah bukti tanda terima sah yang diterbitkan <em>setelah</em> pembayaran berhasil diterima (lunas).
                </p>
              </details>

              <details className="text-xs group">
                <summary className="cursor-pointer font-bold text-ink-soft hover:text-ink py-1">
                  Mengapa kuitansi wajib mencantumkan huruf terbilang?
                </summary>
                <p className="mt-1 text-ink-soft pl-3 border-l-2 border-emerald-500 leading-relaxed">
                  Penulisan terbilang rupiah berfungsi untuk mencegah manipulasi atau perubahan nominal angka oleh pihak tidak bertanggung jawab, sehingga diakui secara hukum dalam pembukuan keuangan.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Cross-linking Free Tools Navigation */}
        <FreeToolsNav />
      </main>
    </div>
  );
}
