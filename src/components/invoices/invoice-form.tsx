"use client";

import { useState } from "react";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerModal } from "@/components/customers/customer-modal";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  calculateInvoiceTotals,
  DiscountType,
} from "@/lib/invoice-calculations";
import { useLanguage } from "@/lib/i18n/context";

type Customer = { id: string; name: string };
type InvoiceItem = { description: string; quantity: number; price: number };
type Invoice = {
  id: string;
  customerId: string;
  dueDate: string | null;
  notes: string | null;
  discountType?: DiscountType | string;
  discountValue?: number | string;
  taxRate?: number | string;
  enableDirectTransfer?: boolean;
  enableDigitalPayment?: boolean;
  items: { description: string; quantity: number; price: number }[];
};

const DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20, 50];

export function InvoiceForm({
  customers,
  invoice,
  defaultCustomerId,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
}: {
  customers: Customer[];
  invoice?: Invoice;
  defaultCustomerId?: string;
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
}) {
  const { t, locale } = useLanguage();
  const isEdit = !!invoice;

  const [customerId, setCustomerId] = useState(
    invoice?.customerId || defaultCustomerId || "",
  );
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? invoice.dueDate.split("T")[0] : "",
  );
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [enableDirectTransfer, setEnableDirectTransfer] = useState(
    invoice?.enableDirectTransfer ?? true
  );
  const [enableDigitalPayment, setEnableDigitalPayment] = useState(
    invoice?.enableDigitalPayment ?? false
  );
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items.length
      ? invoice.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          price: Number(i.price),
        }))
      : [{ description: "", quantity: 1, price: 0 }],
  );

  // Discount & Tax State
  const initialDiscountType: DiscountType =
    invoice?.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED";
  const [discountType, setDiscountType] =
    useState<DiscountType>(initialDiscountType);
  const [discountValue, setDiscountValue] = useState<number>(
    invoice?.discountValue ? Number(invoice.discountValue) : 0,
  );

  const initialTaxRate = invoice?.taxRate ? Number(invoice.taxRate) : 0;
  const isPresetTax = initialTaxRate === 0 || initialTaxRate === 11 || initialTaxRate === 12;
  const [selectedTaxMode, setSelectedTaxMode] = useState<number | "custom">(
    isPresetTax ? initialTaxRate : "custom",
  );
  const [customTaxRate, setCustomTaxRate] = useState<number>(
    isPresetTax ? 0 : initialTaxRate,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const router = useRouter();

  const activeTaxRate =
    selectedTaxMode === "custom" ? customTaxRate : selectedTaxMode;

  // Real-time calculation
  const totals = calculateInvoiceTotals({
    items,
    discountType,
    discountValue,
    taxRate: activeTaxRate,
  });

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!customerId) {
      return setError(
        locale === "id"
          ? "Pilih pelanggan terlebih dahulu"
          : "Please select a client first"
      );
    }
    if (items.some((i) => !i.description || i.price <= 0)) {
      return setError(
        locale === "id"
          ? "Lengkapi semua deskripsi dan harga item (minimal 1)"
          : "Complete all item descriptions and unit prices (min. 1)"
      );
    }

    setLoading(true);
    const payload = {
      customerId,
      dueDate: dueDate || null,
      notes: notes || null,
      discountType,
      discountValue: totals.discountValue,
      taxRate: activeTaxRate,
      enableDirectTransfer,
      enableDigitalPayment,
      items,
    };

    try {
      if (isEdit) {
        await updateInvoice(invoice.id, payload);
      } else {
        await createInvoice(payload);
      }
    } catch (err: any) {
      if (
        err?.message?.includes("NEXT_REDIRECT") ||
        err?.digest?.includes("NEXT_REDIRECT")
      ) {
        throw err;
      }
      const message =
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Terjadi kesalahan saat menyimpan invoice"
          : "An error occurred while saving the invoice";
      setError(message);
      setLoading(false);
    }
  };

  const taxPresets = [
    { label: t.invoices?.taxPresetNone || (locale === "id" ? "Tanpa Pajak (0%)" : "No Tax (0%)"), value: 0 },
    { label: "PPN 11%", value: 11 },
    { label: "PPN 12%", value: 12 },
    { label: t.invoices?.taxPresetCustom || (locale === "id" ? "Kustom %" : "Custom %"), value: "custom" },
  ] as const;

  return (
    <div className="max-w-4xl space-y-6 pb-24 md:pb-6">
      {/* Customer & Due Date Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          {locale === "id" ? "Informasi Pelanggan & Batas Pembayaran" : "Client & Payment Schedule"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.invoices?.customer || (locale === "id" ? "Pelanggan" : "Client")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
              >
                <option value="">
                  {t.invoices?.selectCustomer || (locale === "id" ? "Pilih pelanggan..." : "Select client...")}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <PlusIcon className="h-4 w-4 text-[#0f6b4f]" />
                <span>{locale === "id" ? "Baru" : "New"}</span>
              </button>
            </div>
            {customers.length === 0 && (
              <p className="mt-2 text-xs text-amber-700 font-medium">
                {locale === "id"
                  ? "Belum ada pelanggan. Klik + Baru untuk menambahkan."
                  : "No clients found. Click + New to add one."}
              </p>
            )}
            {showCustomerModal && (
              <CustomerModal
                customer={null}
                onClose={() => {
                  setShowCustomerModal(false);
                  router.refresh();
                }}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.invoices?.dueDate || (locale === "id" ? "Jatuh Tempo" : "Due Date")}{" "}
              <span className="text-slate-400 font-normal">({t.invoices?.optional || (locale === "id" ? "Opsional" : "Optional")})</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            {t.invoices?.itemsTitle || (locale === "id" ? "Daftar Item / Jasa" : "Line Items & Services")}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {items.length} {locale === "id" ? "item" : "items"}
          </span>
        </div>

        {/* Mobile Items Layout */}
        <div className="space-y-3.5 md:hidden">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {locale === "id" ? `Item #${index + 1}` : `Line #${index + 1}`}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer inline-flex items-center gap-1 min-h-[36px] px-2"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>{locale === "id" ? "Hapus" : "Delete"}</span>
                  </button>
                )}
              </div>
              <input
                placeholder={t.invoices?.itemName || (locale === "id" ? "Deskripsi barang atau jasa" : "Item or service description")}
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {t.invoices?.quantity || (locale === "id" ? "Jumlah (Qty)" : "Quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {t.invoices?.price || (locale === "id" ? "Harga Satuan (Rp)" : "Unit Price (Rp)")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                  />
                </div>
              </div>
              <div className="text-right pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Subtotal:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Items Layout */}
        <div className="hidden md:block space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <div className="col-span-5">{t.invoices?.itemName || (locale === "id" ? "Deskripsi" : "Description")}</div>
            <div className="col-span-2 text-center">{t.invoices?.quantity || "Qty"}</div>
            <div className="col-span-2 text-right">{t.invoices?.price || "Harga (Rp)"}</div>
            <div className="col-span-2 text-right">{t.invoices?.amount || "Jumlah"}</div>
            <div className="col-span-1 text-center">{t.invoices?.actions || "Aksi"}</div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <input
                  placeholder={t.invoices?.itemName || (locale === "id" ? "Deskripsi barang atau jasa" : "Item or service description")}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.price || ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "price",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                />
              </div>
              <div className="col-span-2 text-right font-bold text-sm text-slate-900 tabular-nums">
                Rp{(item.quantity * item.price).toLocaleString("id-ID")}
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title={locale === "id" ? "Hapus baris item" : "Remove item"}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] hover:text-[#0c553e] transition-colors cursor-pointer bg-emerald-50 hover:bg-emerald-100/70 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs active:scale-[0.98]"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t.invoices?.addItem || (locale === "id" ? "Tambah Baris Item" : "Add Line Item")}</span>
        </button>
      </div>

      {/* Diskon & Pajak (PPN) Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900">
          {locale === "id" ? "Pengaturan Diskon & Pajak (PPN)" : "Discount & Tax Settings"}
        </h2>

        {/* Section Diskon */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.invoices?.discount || (locale === "id" ? "Diskon" : "Discount")}
            </label>
            {/* Toggle Tipe Diskon */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  discountType === "FIXED"
                    ? "bg-white text-[#0f6b4f] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.invoices?.discountTypeFixed || "Rp (Nominal)"}
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "bg-white text-[#0f6b4f] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.invoices?.discountTypePercent || "% (Persen)"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-7">
              <div className="relative">
                {discountType === "FIXED" && (
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  max={discountType === "PERCENTAGE" ? "100" : undefined}
                  value={discountValue || ""}
                  onChange={(e) =>
                    setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  placeholder={discountType === "FIXED" ? "0" : (locale === "id" ? "Contoh: 10" : "e.g. 10")}
                  className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums font-medium ${
                    discountType === "FIXED" ? "pl-10 pr-3.5" : "px-3.5"
                  }`}
                />
                {discountType === "PERCENTAGE" && (
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                )}
              </div>
            </div>

            {/* Quick preset pills for % */}
            {discountType === "PERCENTAGE" && (
              <div className="sm:col-span-5 flex flex-wrap gap-1.5">
                {DISCOUNT_PERCENT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDiscountValue(p)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-colors cursor-pointer ${
                      discountValue === p
                        ? "bg-emerald-50 border-[#0f6b4f] text-[#0f6b4f]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {totals.discountAmount > 0 && (
            <p className="text-xs text-[#0f6b4f] font-semibold">
              {locale === "id" ? "Potongan diskon:" : "Discount deduction:"}{" "}
              <strong>
                -Rp{totals.discountAmount.toLocaleString("id-ID")}
              </strong>{" "}
              {discountType === "PERCENTAGE" && `(${totals.discountValue}% ${locale === "id" ? "dari subtotal" : "of subtotal"})`}
            </p>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Section Pajak (PPN) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t.invoices?.taxVat || (locale === "id" ? "Pajak Pertambahan Nilai (PPN)" : "Tax (VAT)")}
          </label>

          <div className="flex flex-wrap gap-2">
            {taxPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSelectedTaxMode(preset.value);
                  if (preset.value !== "custom") {
                    setCustomTaxRate(0);
                  }
                }}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                  selectedTaxMode === preset.value
                    ? "bg-[#0f6b4f]/10 border-[#0f6b4f]/30 text-[#0f6b4f] shadow-2xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedTaxMode === "custom" && (
            <div className="max-w-xs pt-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                {locale === "id" ? "Tarif Pajak Kustom (%)" : "Custom Tax Rate (%)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customTaxRate || ""}
                  onChange={(e) =>
                    setCustomTaxRate(
                      Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                    )
                  }
                  placeholder={locale === "id" ? "Contoh: 10 atau 2.5" : "e.g. 10 or 2.5"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] font-medium"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          )}

          {activeTaxRate > 0 && (
            <p className="text-xs text-slate-600 font-medium">
              {locale === "id" ? "Pajak dihitung dari" : "Tax calculated from"}{" "}
              <strong>{t.invoices?.taxableBase || "DPP"}</strong> ={" "}
              <span>Rp{totals.taxableBase.toLocaleString("id-ID")}</span>:{" "}
              <strong className="text-slate-900">
                +Rp{totals.taxAmount.toLocaleString("id-ID")}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Payment Options Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {t.invoices?.paymentMethodsTitle || (locale === "id" ? "Metode Pembayaran untuk Pelanggan" : "Payment Methods for Clients")}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "id"
              ? "Pilih opsi pembayaran yang akan ditampilkan pada halaman invoice publik."
              : "Choose payment options displayed on the public invoice page."}
          </p>
        </div>

        <div className="space-y-3">
          {/* Option 1: Direct Transfer */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer bg-slate-50/60">
            <input
              type="checkbox"
              checked={enableDirectTransfer}
              onChange={(e) => setEnableDirectTransfer(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900">
                {t.invoices?.directTransferTitle || (locale === "id" ? "Transfer Rekening Bank / E-Wallet Langsung (Direct Transfer)" : "Direct Bank Transfer")}
              </span>
              <p className="text-xs text-slate-500">
                {userBankName && userBankAccountNumber ? (
                  <>
                    {locale === "id" ? "Ditransfer langsung ke" : "Transferred directly to"}{" "}
                    <strong>{userBankName}</strong> ({userBankAccountNumber} {locale === "id" ? "a/n" : "a.n."} {userBankAccountName}). {locale === "id" ? "Anda mengonfirmasi lunas secara manual." : "You confirm settlement manually."}
                  </>
                ) : (
                  <>
                    {locale === "id"
                      ? "Tampilkan nomor rekening Anda pada invoice. (Anda belum mendaftarkan rekening di "
                      : "Display bank account on invoice. (You haven't configured a bank account in "}
                    <Link href="/settings" className="text-[#0f6b4f] underline font-bold">
                      {t.dashboard?.settings || "Settings"}
                    </Link>
                    ).
                  </>
                )}
              </p>
            </div>
          </label>

          {/* Option 2: Digital Payment via NotaKu */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer bg-emerald-50/40">
            <input
              type="checkbox"
              checked={enableDigitalPayment}
              onChange={(e) => setEnableDigitalPayment(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {t.invoices?.digitalPaymentTitle || (locale === "id" ? "Pembayaran Digital Instan (QRIS & Virtual Account via NotaKu)" : "Instant Digital Payment (QRIS & VA)")}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#0f6b4f]">
                  {locale === "id" ? "Otomatis Lunas" : "Auto Settled"}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {t.invoices?.digitalPaymentDesc ||
                  (locale === "id"
                    ? "Pelanggan scan QRIS atau bayar Virtual Account secara instan. Dana masuk ke Saldo NotaKu Anda dan invoice otomatis berstatus Lunas (MDR 0.7% dipotong saat settlement)."
                    : "Client scans QRIS or pays via Virtual Account instantly. Funds go to your NotaKu Wallet and the invoice is automatically settled (0.7% MDR applies).")}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {t.invoices?.notes || (locale === "id" ? "Catatan Tambahan (Opsional)" : "Additional Notes (Optional)")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={t.invoices?.notesPlaceholder || (locale === "id" ? "Contoh: Pembayaran dapat ditransfer ke rekening BCA 123456789 a/n Nama Bisnis" : "e.g. Payment due within 14 days of issue.")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-700 font-semibold shadow-2xs animate-in fade-in"
        >
          {error}
        </div>
      )}

      {/* Desktop Summary & Action Buttons */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="space-y-2 border-b border-slate-100 pb-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span className="font-medium">{t.invoices?.subtotal || "Subtotal"}</span>
            <span className="font-bold text-slate-900 tabular-nums">
              Rp{totals.subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-[#0f6b4f] font-semibold">
              <span>
                {t.invoices?.discount || (locale === "id" ? "Diskon" : "Discount")}{" "}
                {discountType === "PERCENTAGE"
                  ? `(${totals.discountValue}%)`
                  : ""}
              </span>
              <span className="tabular-nums">
                -Rp{totals.discountAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {activeTaxRate > 0 && (
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">{t.invoices?.taxVat || "Pajak"} ({activeTaxRate}%)</span>
              <span className="font-bold text-slate-900 tabular-nums">
                +Rp{totals.taxAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.invoices?.total || (locale === "id" ? "Total Tagihan" : "Grand Total")}
            </span>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              Rp{totals.total.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {locale === "id" ? "Batal" : "Cancel"}
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-50 transition-all shadow-xs"
            >
              {loading
                ? (locale === "id" ? "Menyimpan..." : "Saving...")
                : isEdit
                ? (locale === "id" ? "Simpan Perubahan" : "Save Changes")
                : (locale === "id" ? "Buat & Simpan Invoice" : "Create Invoice")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 md:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.invoices?.total || "Total"}
            </span>
            <p className="text-base font-extrabold text-slate-900 tabular-nums">
              Rp{totals.total.toLocaleString("id-ID")}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 max-w-[200px] rounded-xl bg-[#0f6b4f] px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-50 transition-all text-center cursor-pointer min-h-[44px]"
          >
            {loading
              ? (locale === "id" ? "Menyimpan..." : "Saving...")
              : isEdit
              ? (locale === "id" ? "Simpan Perubahan" : "Save Changes")
              : (locale === "id" ? "Simpan Invoice" : "Create Invoice")}
          </button>
        </div>
      </div>
    </div>
  );
}
