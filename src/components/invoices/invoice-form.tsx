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
  items: { description: string; quantity: number; price: number }[];
};

const TAX_PRESETS = [
  { label: "Tanpa Pajak (0%)", value: 0 },
  { label: "PPN 11%", value: 11 },
  { label: "PPN 12%", value: 12 },
  { label: "Kustom", value: "custom" },
] as const;

const DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20, 50];

export function InvoiceForm({
  customers,
  invoice,
  defaultCustomerId,
}: {
  customers: Customer[];
  invoice?: Invoice;
  defaultCustomerId?: string;
}) {
  const isEdit = !!invoice;

  const [customerId, setCustomerId] = useState(
    invoice?.customerId || defaultCustomerId || "",
  );
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? invoice.dueDate.split("T")[0] : "",
  );
  const [notes, setNotes] = useState(invoice?.notes || "");
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

    if (!customerId) return setError("Pilih pelanggan terlebih dahulu");
    if (items.some((i) => !i.description || i.price <= 0)) {
      return setError("Lengkapi semua deskripsi dan harga item (minimal 1)");
    }

    setLoading(true);
    const payload = {
      customerId,
      dueDate: dueDate || null,
      notes: notes || null,
      discountType,
      discountValue: totals.discountValue,
      taxRate: activeTaxRate,
      items,
    };

    try {
      if (isEdit) {
        await updateInvoice(invoice.id, payload);
      } else {
        await createInvoice(payload);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 pb-24 md:pb-6">
      {/* Customer & Due Date Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Informasi Tagihan
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Pelanggan *
            </label>
            <div className="flex gap-2">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
              >
                <option value="">Pilih pelanggan</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <PlusIcon className="h-4 w-4 text-[#0f6b4f]" />
                <span>Baru</span>
              </button>
            </div>
            {customers.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                Belum ada pelanggan. Klik <strong>+ Baru</strong> untuk menambahkan dalam sekejap.
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
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Jatuh Tempo (Opsional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Daftar Item / Jasa</h2>
          <span className="text-xs text-gray-500 font-medium">
            {items.length} item
          </span>
        </div>

        {/* Mobile Items Layout */}
        <div className="space-y-4 md:hidden">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-3.5 bg-gray-50/50 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer inline-flex items-center gap-1"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
              <input
                placeholder="Deskripsi barang atau jasa"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Qty
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Harga Satuan (Rp)
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>
              </div>
              <div className="text-right pt-1 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-bold text-gray-900">
                  Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Items Layout */}
        <div className="hidden md:block space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase px-1">
            <div className="col-span-5">Deskripsi</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Harga (Rp)</div>
            <div className="col-span-2 text-right">Jumlah</div>
            <div className="col-span-1 text-center">Aksi</div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <input
                  placeholder="Deskripsi barang atau jasa"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-right text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                />
              </div>
              <div className="col-span-2 text-right font-semibold text-sm text-gray-900 tabular-nums">
                Rp{(item.quantity * item.price).toLocaleString("id-ID")}
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Hapus baris item"
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
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f6b4f] hover:text-[#0b503b] transition-colors cursor-pointer bg-emerald-50/60 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/50"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Tambah Baris Item</span>
        </button>
      </div>

      {/* Diskon & Pajak (PPN) Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">
          Pengaturan Diskon & Pajak
        </h2>

        {/* Section Diskon */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Diskon
            </label>
            {/* Toggle Tipe Diskon */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  discountType === "FIXED"
                    ? "bg-white text-[#0f6b4f] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Nominal (Rp)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "bg-white text-[#0f6b4f] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Persentase (%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-7">
              <div className="relative">
                {discountType === "FIXED" && (
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
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
                  placeholder={discountType === "FIXED" ? "0" : "Contoh: 10"}
                  className={`w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] ${
                    discountType === "FIXED" ? "pl-9 pr-3" : "px-3"
                  }`}
                />
                {discountType === "PERCENTAGE" && (
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
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
                    className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                      discountValue === p
                        ? "bg-emerald-50 border-[#0f6b4f] text-[#0f6b4f] font-semibold"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {totals.discountAmount > 0 && (
            <p className="text-xs text-emerald-700 font-medium">
              Potongan diskon:{" "}
              <strong>
                -Rp{totals.discountAmount.toLocaleString("id-ID")}
              </strong>{" "}
              {discountType === "PERCENTAGE" && `(${totals.discountValue}% dari subtotal)`}
            </p>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Section Pajak (PPN) */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Pajak Pertambahan Nilai (PPN)
          </label>

          <div className="flex flex-wrap gap-2">
            {TAX_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSelectedTaxMode(preset.value);
                  if (preset.value !== "custom") {
                    setCustomTaxRate(0);
                  }
                }}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedTaxMode === preset.value
                    ? "bg-emerald-50 border-[#0f6b4f] text-[#0f6b4f] shadow-xs"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedTaxMode === "custom" && (
            <div className="max-w-xs pt-1">
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Tarif Pajak Kustom (%)
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
                  placeholder="Contoh: 10 atau 2.5"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-gray-500 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          )}

          {activeTaxRate > 0 && (
            <p className="text-xs text-gray-600">
              Pajak dihitung dari <strong>DPP (Dasar Pengenaan Pajak)</strong> ={" "}
              <span>Rp{totals.taxableBase.toLocaleString("id-ID")}</span>:{" "}
              <strong className="text-gray-900">
                +Rp{totals.taxAmount.toLocaleString("id-ID")}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Contoh: Pembayaran dapat ditransfer ke rekening BCA 123456789 a/n Nama Bisnis"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium shadow-xs"
        >
          {error}
        </div>
      )}

      {/* Desktop Summary & Action Buttons */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="space-y-2 border-b border-gray-100 pb-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              Rp{totals.subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>
                Diskon{" "}
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
            <div className="flex justify-between text-gray-600">
              <span>Pajak (PPN {activeTaxRate}%)</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                +Rp{totals.taxAmount.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Tagihan
            </span>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              Rp{totals.total.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              Batal
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                  ? "Update Invoice"
                  : "Simpan & Buat Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar with Breakdown */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg">
        {(totals.discountAmount > 0 || activeTaxRate > 0) && (
          <div className="flex items-center justify-between text-[11px] text-gray-500 border-b border-gray-100 pb-1.5 mb-1.5">
            <span>
              Sub: Rp{totals.subtotal.toLocaleString("id-ID")}
              {totals.discountAmount > 0 && (
                <span className="text-emerald-600 font-semibold ml-1">
                  (Disc: -Rp{totals.discountAmount.toLocaleString("id-ID")})
                </span>
              )}
            </span>
            {activeTaxRate > 0 && (
              <span>PPN {activeTaxRate}%: +Rp{totals.taxAmount.toLocaleString("id-ID")}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Tagihan
            </span>
            <p className="text-base font-bold text-gray-900 tabular-nums">
              Rp{totals.total.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/invoices"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
