"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createRecurringInvoice } from "@/actions/recurring-invoices";
import { CustomerModal } from "@/components/customers/customer-modal";
import { UpgradeButton } from "@/components/upgrade-button";
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  CreditCardIcon,
  InformationCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import {
  calculateInvoiceTotals,
  DiscountType,
} from "@/lib/invoice-calculations";
import {
  RecurringFrequency,
  getTodayDateStrWIB,
} from "@/lib/recurring-invoices";
import { useLanguage } from "@/lib/i18n/context";

type Customer = { id: string; name: string };
type InvoiceItem = { description: string; quantity: number; price: number };

const FREQUENCY_OPTIONS: {
  value: RecurringFrequency;
  labelId: string;
  labelEn: string;
  descId: string;
  descEn: string;
}[] = [
  {
    value: "WEEKLY",
    labelId: "Mingguan",
    labelEn: "Weekly",
    descId: "Setiap 7 hari",
    descEn: "Every 7 days",
  },
  {
    value: "BIWEEKLY",
    labelId: "2 Mingguan",
    labelEn: "Biweekly",
    descId: "Setiap 14 hari",
    descEn: "Every 14 days",
  },
  {
    value: "MONTHLY",
    labelId: "Bulanan",
    labelEn: "Monthly",
    descId: "Tanggal yang sama tiap bulan",
    descEn: "Same day each month",
  },
  {
    value: "QUARTERLY",
    labelId: "Triwulan",
    labelEn: "Quarterly",
    descId: "Setiap 3 bulan",
    descEn: "Every 3 months",
  },
  {
    value: "ANNUALLY",
    labelId: "Tahunan",
    labelEn: "Annually",
    descId: "Setiap 1 tahun",
    descEn: "Once a year",
  },
];

const DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20, 50];

export function NewRecurringInvoiceClient({
  customers,
  initialCustomerId,
  isPro,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
}: {
  customers: Customer[];
  initialCustomerId?: string;
  isPro: boolean;
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
}) {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState(initialCustomerId || "");
  const [frequency, setFrequency] = useState<RecurringFrequency>("MONTHLY");
  const [startDate, setStartDate] = useState(getTodayDateStrWIB());
  const [dueDaysOffset, setDueDaysOffset] = useState<number>(7);
  const [notes, setNotes] = useState("");
  const [autoSendEmail, setAutoSendEmail] = useState(true);
  const [enableDirectTransfer, setEnableDirectTransfer] = useState(true);
  const [enableDigitalPayment, setEnableDigitalPayment] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);

  // Discount & Tax State
  const [discountType, setDiscountType] = useState<DiscountType>("FIXED");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [selectedTaxMode, setSelectedTaxMode] = useState<number | "custom">(0);
  const [customTaxRate, setCustomTaxRate] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const activeTaxRate =
    selectedTaxMode === "custom" ? customTaxRate : selectedTaxMode;

  const totals = calculateInvoiceTotals({
    items,
    discountType,
    discountValue,
    taxRate: activeTaxRate,
  });

  const addItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === "quantity" || field === "price") {
        next[index] = { ...next[index], [field]: Number(value) || 0 };
      } else if (field === "description") {
        next[index] = { ...next[index], description: String(value) };
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) return;

    if (!title.trim()) {
      setError(
        locale === "id"
          ? "Judul atau label tagihan berulang wajib diisi."
          : "Schedule title is required."
      );
      return;
    }

    if (!customerId) {
      setError(
        locale === "id"
          ? "Silakan pilih pelanggan."
          : "Please select a client/customer."
      );
      return;
    }

    if (items.some((item) => !item.description.trim() || item.price <= 0)) {
      setError(
        locale === "id"
          ? "Pastikan semua baris item memiliki deskripsi dan harga lebih dari 0."
          : "Please ensure all items have descriptions and price greater than 0."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createRecurringInvoice({
        title: title.trim(),
        customerId,
        frequency,
        startDate,
        dueDaysOffset,
        notes: notes.trim() || null,
        discountType,
        discountValue,
        taxRate: activeTaxRate,
        enableDirectTransfer,
        enableDigitalPayment,
        autoSendEmail,
        items,
      });

      router.push("/recurring-invoices");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan jadwal.");
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
            <span>{locale === "id" ? "Buat Tagihan Berulang" : "New Recurring Schedule"}</span>
          </h1>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <SparklesIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {locale === "id" ? "Fitur Eksklusif NotaKu PRO" : "Exclusive NotaKu PRO Feature"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
              {locale === "id"
                ? "Fitur pembuatan invoice berulang (recurring invoices) otomatis hanya tersedia untuk pelanggan paket NotaKu PRO. Tingkatkan paket Anda untuk mengaktifkan otomatisasi penagihan."
                : "Automated recurring invoices are available exclusively for NotaKu PRO members. Upgrade now to automate periodic billing."}
            </p>
          </div>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-all cursor-pointer active:scale-[0.98] min-h-[44px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
            <span>{locale === "id" ? "Buat Tagihan Berulang" : "New Recurring Schedule"}</span>
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] border border-emerald-200 shadow-2xs">
            <SparklesIcon className="w-3.5 h-3.5 text-[#0f6b4f]" />
            PRO
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {locale === "id"
            ? "Atur jadwal penerbitan dan pengiriman invoice otomatis berkala ke pelanggan Anda."
            : "Configure automatic periodic invoice generation and dispatch for your clients."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 shadow-2xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <CalendarDaysIcon className="w-5 h-5 text-[#0f6b4f]" />
            <span>{locale === "id" ? "Informasi & Jadwal Tagihan" : "Schedule & Client Info"}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title / Label */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {locale === "id" ? "Nama / Label Jadwal Tagihan" : "Schedule Title / Label"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  locale === "id"
                    ? "Contoh: Langganan Maintenance Website - PT Maju Jaya"
                    : "e.g. Monthly Retainer - Acme Corp"
                }
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              />
            </div>

            {/* Customer Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                  {locale === "id" ? "Pelanggan" : "Client"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs font-bold text-[#0f6b4f] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>{locale === "id" ? "+ Tambah Baru" : "+ Add New"}</span>
                </button>
              </div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              >
                <option value="">
                  {locale === "id" ? "-- Pilih Pelanggan --" : "-- Select Client --"}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {locale === "id" ? "Frekuensi Berulang" : "Recurring Frequency"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              >
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {locale === "id" ? f.labelId : f.labelEn} (
                    {locale === "id" ? f.descId : f.descEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {locale === "id" ? "Tanggal Mulai / Terbit Pertama" : "First Run Date (WIB)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {locale === "id"
                  ? "Sistem cron berjalan tiap pukul 08:00 WIB untuk menerbitkan tagihan pada tanggal ini."
                  : "Automated cron triggers daily at 08:00 WIB on this scheduled date."}
              </p>
            </div>

            {/* Due Days Offset */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {locale === "id" ? "Jatuh Tempo (Hari setelah Terbit)" : "Due Date Offset (Days)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={dueDaysOffset}
                  onChange={(e) => setDueDaysOffset(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-600 shrink-0">
                  {locale === "id" ? "Hari" : "Days"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {locale === "id"
                  ? `Contoh: 7 hari = jatuh tempo 7 hari sejak invoice dibuat.`
                  : `e.g. 7 days after invoice is generated.`}
              </p>
            </div>
          </div>

          {/* Auto Dispatch Toggles */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={autoSendEmail}
                onChange={(e) => setAutoSendEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-600" />
                  {locale === "id" ? "Kirim Email Otomatis" : "Auto Send Email"}
                </span>
                <p className="text-slate-500 mt-0.5">
                  {locale === "id"
                    ? "Kirim invoice dan tautan pembayaran langsung ke email pelanggan saat terbit."
                    : "Instantly email the invoice link and payment details upon dispatch."}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={enableDirectTransfer}
                onChange={(e) => setEnableDirectTransfer(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCardIcon className="w-3.5 h-3.5 text-slate-600" />
                  {locale === "id" ? "Transfer Bank Manual" : "Direct Bank Transfer"}
                </span>
                <p className="text-slate-500 mt-0.5">
                  {userBankName
                    ? `${userBankName} (${userBankAccountNumber})`
                    : locale === "id"
                    ? "Tampilkan rekening bank Anda di invoice."
                    : "Display your bank account on invoice."}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {locale === "id" ? "Rincian Item Tagihan" : "Invoice Items"}
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0f6b4f] hover:underline cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{locale === "id" ? "Tambah Baris" : "Add Item"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 sm:gap-3 items-center rounded-xl bg-slate-50/70 p-3 border border-slate-200"
              >
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">
                    {locale === "id" ? "Deskripsi" : "Description"}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder={
                      locale === "id"
                        ? "Nama layanan / produk langganan"
                        : "Service / subscription item name"
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">
                    {locale === "id" ? "Jumlah" : "Qty"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 text-center shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">
                    {locale === "id" ? "Harga Satuan (Rp)" : "Price (Rp)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 text-right shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                    title={locale === "id" ? "Hapus Item" : "Delete Item"}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Discount & Tax Options */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Discount */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                {locale === "id" ? "Diskon / Potongan" : "Discount"}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-[#0f6b4f] focus:outline-none"
                >
                  <option value="FIXED">Rp (Nominal)</option>
                  <option value="PERCENTAGE">% (Persen)</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none"
                />
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                {locale === "id" ? "Pajak / PPN" : "Tax (PPN)"}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTaxMode}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedTaxMode(v === "custom" ? "custom" : Number(v));
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-[#0f6b4f] focus:outline-none"
                >
                  <option value={0}>Tanpa Pajak (0%)</option>
                  <option value={11}>PPN 11%</option>
                  <option value={12}>PPN 12%</option>
                  <option value="custom">Kustom %</option>
                </select>
                {selectedTaxMode === "custom" && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customTaxRate}
                    onChange={(e) => setCustomTaxRate(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="%"
                    className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 text-center shadow-2xs focus:border-[#0f6b4f] focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums font-semibold">
                  Rp{totals.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon:</span>
                  <span className="font-mono tabular-nums font-semibold">
                    -Rp{totals.discountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Pajak ({activeTaxRate}%):</span>
                  <span className="font-mono tabular-nums font-semibold">
                    +Rp{totals.taxAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Estimasi:</span>
                <span className="font-mono tabular-nums text-[#0f6b4f]">
                  Rp{totals.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700">
            {locale === "id" ? "Catatan / Ketentuan Pembayaran" : "Notes & Payment Terms"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              locale === "id"
                ? "Contoh: Mohon lakukan pembayaran sebelum tanggal jatuh tempo. Terima kasih atas kerja samanya."
                : "e.g. Please complete payment before the due date. Thank you for your business."
            }
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href="/recurring-invoices"
            className="w-full sm:w-auto text-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs min-h-[44px] flex items-center justify-center"
          >
            {locale === "id" ? "Batal" : "Cancel"}
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            <CheckBadgeIcon className="w-4 h-4" />
            <span>
              {loading
                ? locale === "id"
                  ? "Menyimpan..."
                  : "Saving..."
                : locale === "id"
                ? "Simpan & Jadwalkan Tagihan"
                : "Save & Schedule Recurring"}
            </span>
          </button>
        </div>
      </form>

      {/* Quick Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={(newCust) => {
            setShowCustomerModal(false);
            setCustomerId(newCust.id);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
