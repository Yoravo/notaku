"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { calculateInvoiceTotals, type DiscountType } from "@/lib/invoice-calculations";
import { formatMoney, SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currencies";
import { NICHE_TEMPLATES } from "@/lib/templates-data";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export function FreeInvoiceGeneratorClient() {
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get("template");

  // 1. State Form
  const [currency, setCurrency] = useState<SupportedCurrency>("IDR");
  const [template, setTemplate] = useState<"classic" | "modern" | "minimal">("classic");
  const [number, setNumber] = useState("INV-001");
  const [status, setStatus] = useState<"DRAFT" | "SENT" | "PAID">("SENT");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("Terima kasih atas kerja samanya. Mohon konfirmasi jika pembayaran telah dilakukan.");

  // Bisnis Pengirim
  const [businessName, setBusinessName] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // Klien Penerima
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Jasa Konsultasi / Pembuatan Desain", quantity: 1, price: 750000 },
    { id: "2", description: "Layanan Maintenance & Support", quantity: 1, price: 250000 },
  ]);

  // Pajak & Diskon
  const [discountType, setDiscountType] = useState<DiscountType>("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  // Auto-populate from template slug query parameter
  useEffect(() => {
    if (!templateSlug) return;
    const foundTemplate = NICHE_TEMPLATES.find((t) => t.slug === templateSlug);
    if (foundTemplate) {
      setTemplate(foundTemplate.pdfTemplate);
      setCurrency(foundTemplate.currency);
      setNumber(foundTemplate.sampleData.invoiceNumber);
      setBusinessName(foundTemplate.sampleData.businessName);
      setCustomerName(foundTemplate.sampleData.customerName);
      setNotes(foundTemplate.sampleData.notes);
      if (foundTemplate.taxRate) {
        setTaxRate(foundTemplate.taxRate);
      }
      setItems(
        foundTemplate.sampleData.items.map((it, idx) => ({
          id: (idx + 1).toString(),
          description: it.description,
          quantity: it.quantity,
          price: it.price,
        }))
      );
    }
  }, [templateSlug]);

  // Status Download Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Kalkulasi Realtime
  const totals = calculateInvoiceTotals({
    items: items.map((it) => ({ quantity: it.quantity, price: it.price })),
    discountType,
    discountValue,
    taxRate,
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        return { ...it, [field]: val };
      })
    );
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const payload = {
        number,
        status,
        currency,
        createdAt,
        dueDate: dueDate || null,
        notes,
        businessName: businessName || "Bisnis Saya",
        userName: userName || "Pemilik",
        userEmail,
        userPhone,
        userAddress,
        bankName,
        bankAccountNumber,
        bankAccountName,
        customerName: customerName || "Pelanggan Yth.",
        customerEmail,
        customerPhone,
        customerAddress,
        items,
        discountType,
        discountValue,
        taxRate,
        template,
      };

      const res = await fetch("/api/tools/invoice-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal mengunduh PDF invoice.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${number || "NotaKu"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat membuat file PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-emerald/20">
      {/* Top Header & Breadcrumb */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
            <span>Nota</span>
            <span className="text-emerald">Ku</span>
            <span className="ml-2 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald border border-emerald/20">
              Free Tool
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden sm:inline-block text-xs font-bold text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Masuk
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

      {/* Hero Intro Header */}
      <section className="border-b border-line bg-paper-deep/40 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald border border-emerald/20 mb-3">
            <DocumentTextIcon className="w-4 h-4" />
            100% Gratis & Tanpa Registrasi
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            Free Online Invoice Generator Indonesia
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Buat, hitung otomatis (DPP & PPN), dan download invoice PDF berstandar profesional dalam 30 detik. Siap kirim langsung ke klien Anda.
          </p>
        </div>
      </section>

      {/* Main Workspace: Form & Summary */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Builder (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Header Pengaturan & Desain Invoice */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3.5">
                <h2 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-emerald" />
                  <span>Informasi Dokumen Tagihan</span>
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Pilihan Template PDF */}
                  <div className="flex items-center gap-1 bg-paper-deep p-1 rounded-xl text-xs font-semibold">
                    {(["classic", "modern", "minimal"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTemplate(t)}
                        className={`capitalize px-2.5 py-1 rounded-lg transition-all ${
                          template === t
                            ? "bg-white text-emerald shadow-2xs font-bold"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Pilihan Mata Uang */}
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                    aria-label="Pilih Mata Uang"
                    className="rounded-xl border border-line bg-paper-deep px-3 py-1.5 text-xs font-bold text-ink focus:border-emerald focus:outline-none"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                    No. Invoice
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="INV-001"
                    className="w-full rounded-xl border border-line p-2.5 text-xs sm:text-sm font-semibold text-ink focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="w-full rounded-xl border border-line p-2.5 text-xs sm:text-sm text-ink focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-soft mb-1">
                    Jatuh Tempo (Opsional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-line p-2.5 text-xs sm:text-sm text-ink focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Informasi Bisnis Anda & Pelanggan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bisnis Pengirim */}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-line/60 pb-2.5">
                  <BuildingOffice2Icon className="w-4 h-4 text-emerald" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                    Dari (Bisnis Anda)
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Nama Bisnis / Toko <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Studio Kreatif Nusantara"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Nama Pemilik / PIC
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-ink-soft mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="kontak@bisnis.com"
                      className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-ink-soft mb-1">
                      No. WhatsApp
                    </label>
                    <input
                      type="text"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Jl. Sudirman No. 12, Jakarta"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                  />
                </div>
              </div>

              {/* Klien / Pembeli */}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-line/60 pb-2.5">
                  <UserIcon className="w-4 h-4 text-emerald" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                    Ditagihkan Kepada (Klien)
                  </h3>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Nama Klien / Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: PT Maju Bersama"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-ink-soft mb-1">
                      Email Klien
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="finance@klien.com"
                      className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-ink-soft mb-1">
                      WhatsApp Klien
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08198765432"
                      className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Alamat Klien
                  </label>
                  <textarea
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Gedung Cyber 2 Lantai 15, Kuningan, Jakarta Selatan"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Line Items Table */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-ink">
                  Daftar Barang / Jasa
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald hover:text-emerald-bright transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 rounded-xl border border-line/60 bg-paper-deep/30 p-3 sm:p-2.5"
                  >
                    <div className="w-full sm:flex-1">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder={`Deskripsi item / pekerjaan #${index + 1}`}
                        className="w-full rounded-lg border border-line bg-white p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="w-full rounded-lg border border-line bg-white p-2 text-xs text-center text-ink focus:border-emerald focus:outline-none font-mono"
                        />
                      </div>

                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                          placeholder="Harga"
                          className="w-full rounded-lg border border-line bg-white p-2 text-xs text-right text-ink focus:border-emerald focus:outline-none font-mono"
                        />
                      </div>

                      <div className="w-28 text-right font-bold text-xs text-ink tabular-nums px-2">
                        {formatMoney(item.quantity * item.price, currency)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length <= 1}
                        aria-label="Hapus Baris"
                        className="p-1.5 text-ink-soft hover:text-rose-600 disabled:opacity-30 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Rekening Bank & Catatan */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-line/60 pb-2.5">
                <BanknotesIcon className="w-4 h-4 text-emerald" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Informasi Pembayaran / Rekening Bank
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA / Mandiri / BRI"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full rounded-xl border border-line p-2 text-xs font-mono text-ink focus:border-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-soft mb-1">
                    Atas Nama
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Nama Pemilik Rekening"
                    className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-soft mb-1">
                  Catatan / Syarat Pembayaran
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-line p-2 text-xs text-ink focus:border-emerald focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Download Actions (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            {/* Kalkulasi Ringkasan Tagihan */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink border-b border-line/60 pb-3">
                Ringkasan Perhitungan
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatMoney(totals.subtotal, currency)}
                  </span>
                </div>

                {/* Diskon Setting */}
                <div className="space-y-1.5 pt-1 border-t border-line/40">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Diskon</span>
                    <div className="flex items-center gap-1">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                        aria-label="Tipe Diskon"
                        className="rounded-lg border border-line bg-paper-deep px-1.5 py-0.5 text-[11px] font-bold"
                      >
                        <option value="FIXED">Nominal</option>
                        <option value="PERCENTAGE">%</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                        placeholder="0"
                        aria-label="Nilai Diskon"
                        className="w-16 rounded-lg border border-line p-0.5 text-right text-xs font-mono"
                      />
                    </div>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald font-semibold">
                      <span>Potongan</span>
                      <span className="tabular-nums">-{formatMoney(totals.discountAmount, currency)}</span>
                    </div>
                  )}
                </div>

                {/* Pajak PPN Setting */}
                <div className="space-y-1.5 pt-1 border-t border-line/40">
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Pajak (PPN)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                        placeholder="0"
                        aria-label="Persentase PPN"
                        className="w-14 rounded-lg border border-line p-0.5 text-right text-xs font-mono"
                      />
                      <span className="font-bold text-[11px]">%</span>
                    </div>
                  </div>
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-ink font-semibold">
                      <span>PPN ({totals.taxRate}%)</span>
                      <span className="tabular-nums">+{formatMoney(totals.taxAmount, currency)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline pt-3 border-t-2 border-line">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    Total Tagihan
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-ink tabular-nums">
                    {formatMoney(totals.total, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald py-3 px-4 text-xs sm:text-sm font-bold text-paper shadow-md hover:bg-emerald-bright active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Menyiapkan PDF...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      <span>Unduh File PDF Resmi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Upsell Banner: Keuntungan Punya Akun NotaKu */}
            <div className="rounded-2xl border border-emerald/30 bg-emerald-50/50 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#0f6b4f]">
                <SparklesIcon className="w-5 h-5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Mau Lebih Praktis?
                </h4>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Buat akun NotaKu gratis untuk mengaktifkan fitur otomatis:
              </p>
              <ul className="space-y-1.5 text-xs text-ink font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald" />
                  <span>Kirim via WhatsApp 1-klik</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald" />
                  <span>Terima Pembayaran QRIS Otomatis</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald" />
                  <span>Simpan Riwayat Tagihan & Pelanggan</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-2 block w-full text-center rounded-xl bg-[#0f6b4f] py-2.5 text-xs font-bold text-white hover:bg-emerald-bright transition-all shadow-xs"
              >
                Daftar Akun Gratis Sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Educational Content: Cara Membuat Invoice & Panduan */}
        <section className="mt-16 sm:mt-24 border-t border-line pt-12 max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Panduan Pembuatan Invoice Bisnis & UMKM
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft">
              Semua yang perlu Anda ketahui tentang faktur tagihan profesional berstandar Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-line bg-white p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-ink">Nomor & Tanggal Jelas</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Gunakan format nomor urut teratur (misal INV/2026/08/001) dan tanggal jatuh tempo agar klien membayar tepat waktu.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-ink">Rincian Item Transparan</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Tulis deskripsi jasa/produk, jumlah satuan, dan harga dengan spesifik untuk menghindari komplain dari pembeli.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-ink">Kanal Pembayaran Lengkap</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Sertakan nama bank, nomor rekening, dan nama pemilik rekening secara valid untuk mempermudah transfer pelanggan.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
