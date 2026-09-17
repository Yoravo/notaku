"use client";

import { useState } from "react";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerModal } from "@/components/customers/customer-modal";
import { PlusIcon, TrashIcon, ArchiveBoxIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  calculateInvoiceTotals,
  DiscountType,
} from "@/lib/invoice-calculations";
import { useLocale, useTranslations } from "next-intl";
import {
  CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  formatMoney,
} from "@/lib/currencies";

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
  currency?: string;
  enableDirectTransfer?: boolean;
  enableDigitalPayment?: boolean;
  enableReminder?: boolean;
  items: { description: string; quantity: number; price: number }[];
};

const DISCOUNT_PERCENT_PRESETS = [5, 10, 15, 20, 50];

type CatalogItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
};

export function InvoiceForm({
  customers,
  catalogItems = [],
  invoice,
  isCloneMode = false,
  defaultCustomerId,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
}: {
  customers: Customer[];
  catalogItems?: CatalogItem[];
  invoice?: Invoice;
  isCloneMode?: boolean;
  defaultCustomerId?: string;
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
}) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
  const isEdit = !!invoice && !isCloneMode;

  const [customerId, setCustomerId] = useState(
    invoice?.customerId || defaultCustomerId || "",
  );
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? invoice.dueDate.split("T")[0] : "",
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(
    (invoice?.currency as SupportedCurrency) || "IDR",
  );
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [enableDirectTransfer, setEnableDirectTransfer] = useState(
    invoice?.enableDirectTransfer ?? true
  );
  const [enableDigitalPayment, setEnableDigitalPayment] = useState(
    invoice?.enableDigitalPayment ?? false
  );
  const [enableReminder, setEnableReminder] = useState(
    invoice?.enableReminder ?? true
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

  // Catalog Picker State
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const router = useRouter();

  const currConf = CURRENCY_MAP[currency] || CURRENCY_MAP.IDR;
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

  const addFromCatalog = (catItem: CatalogItem) => {
    const label = catItem.unit
      ? `${catItem.name} (${catItem.unit})`
      : catItem.name;
    const newLine: InvoiceItem = {
      description: label,
      quantity: 1,
      price: catItem.price,
    };
    // Jika baris pertama masih kosong, timpa; jika tidak, tambahkan baris baru
    setItems((prev) => {
      const isFirstEmpty =
        prev.length === 1 && !prev[0].description && prev[0].price === 0;
      return isFirstEmpty ? [newLine] : [...prev, newLine];
    });
    setShowCatalogPicker(false);
    setCatalogSearch("");
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
      return setError(tInv("validationCustomer"));
    }
    if (items.some((i) => !i.description || i.price <= 0)) {
      return setError(tInv("validationItems"));
    }

    setLoading(true);
    const payload = {
      customerId,
      dueDate: dueDate || null,
      notes: notes || null,
      discountType,
      discountValue: totals.discountValue,
      taxRate: activeTaxRate,
      currency,
      enableDirectTransfer,
      enableDigitalPayment,
      enableReminder,
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
          : tInv("saveError");
      setError(message);
      setLoading(false);
    }
  };

  const taxPresets = [
    { label: tInv("taxPresetNone"), value: 0 },
    { label: "PPN 11%", value: 11 },
    { label: "PPN 12%", value: 12 },
    { label: tInv("taxPresetCustom"), value: "custom" },
  ] as const;

  return (
    <div className="max-w-4xl space-y-6 pb-24 md:pb-6">
      {/* Customer & Due Date Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          {tInv("customerPaymentInfo")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {tInv("customer")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium min-h-[44px]"
              >
                <option value="">{tInv("selectCustomer")}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-2xs min-h-[44px]"
              >
                <PlusIcon className="h-4 w-4 text-[#0f6b4f] dark:text-emerald-400" />
                <span>{tInv("newCustomer")}</span>
              </button>
            </div>
            {customers.length === 0 && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                {tInv("noCustomers")}
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
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {tInv("dueDate")}{" "}
              <span className="text-slate-400 font-normal">({tInv("optional")})</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {tInv("currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium min-h-[44px]"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {CURRENCY_MAP[cur].name} ({CURRENCY_MAP[cur].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Line Items Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {tInv("itemsTitle")}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {tInv("itemCount", { count: items.length })}
          </span>
        </div>

        {/* Mobile Items Layout */}
        <div className="space-y-3.5 md:hidden">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {tInv("itemIndex", { number: index + 1 })}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer inline-flex items-center gap-1 min-h-[36px] px-2"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>{tInv("delete")}</span>
                  </button>
                )}
              </div>
              <input
                placeholder={tInv("itemPlaceholder")}
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {tInv("quantityLabel")}
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
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums min-h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    {tInv("unitPrice", { symbol: currConf.symbol })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={currConf.decimalPlaces > 0 ? "0.01" : "1"}
                    placeholder="0"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums min-h-[40px]"
                  />
                </div>
              </div>
              <div className="text-right pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{tInv("subtotal")}:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatMoney(item.quantity * item.price, currency, locale)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Items Layout */}
        <div className="hidden md:block space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            <div className="col-span-5">{tInv("itemName")}</div>
            <div className="col-span-2 text-center">{tInv("quantity")}</div>
            <div className="col-span-2 text-right">{tInv("unitPrice", { symbol: currConf.symbol })}</div>
            <div className="col-span-2 text-right">{tInv("amount")}</div>
            <div className="col-span-1 text-center">{tInv("actions")}</div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5">
                <input
                  placeholder={tInv("itemPlaceholder")}
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
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
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-center text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step={currConf.decimalPlaces > 0 ? "0.01" : "1"}
                  placeholder="0"
                  value={item.price || ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "price",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-right text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                />
              </div>
              <div className="col-span-2 text-right font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                {formatMoney(item.quantity * item.price, currency, locale)}
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                  title={tInv("removeItem")}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 hover:text-[#0c553e] dark:hover:text-emerald-300 transition-colors cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs active:scale-[0.98] min-h-[44px]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{tInv("addItem")}</span>
          </button>

          {catalogItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCatalogPicker(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs active:scale-[0.98] min-h-[44px]"
            >
              <ArchiveBoxIcon className="h-4 w-4" />
              <span>Pilih dari Katalog</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Picker Katalog Item */}
      {showCatalogPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <ArchiveBoxIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Pilih Item dari Katalog
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Klik item untuk menyisipkan rincian dan harga otomatis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogPicker(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari item di katalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-3.5 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#0f6b4f] min-h-[44px]"
              />
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {catalogItems
                .filter((ci) =>
                  ci.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                  (ci.description && ci.description.toLowerCase().includes(catalogSearch.toLowerCase()))
                )
                .map((ci) => (
                  <button
                    key={ci.id}
                    type="button"
                    onClick={() => addFromCatalog(ci)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0f6b4f] dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 transition-all cursor-pointer flex items-center justify-between group min-h-[44px]"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0f6b4f] dark:group-hover:text-emerald-400">
                        {ci.name}
                      </p>
                      {ci.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {ci.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs sm:text-sm font-extrabold text-[#0f6b4f] dark:text-emerald-400">
                        {formatMoney(ci.price, currency, locale)}
                      </p>
                      {ci.unit && (
                        <p className="text-[10px] text-slate-400">/ {ci.unit}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 font-medium">
                Total {catalogItems.length} item tersimpan
              </span>
              <button
                type="button"
                onClick={() => setShowCatalogPicker(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diskon & Pajak (PPN) Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {tInv("discountTaxSettings")}
        </h2>

        {/* Section Diskon */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {tInv("discount")}
            </label>
            {/* Toggle Tipe Diskon */}
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  discountType === "FIXED"
                    ? "bg-white dark:bg-slate-900 text-[#0f6b4f] dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tInv("discountTypeFixed", { symbol: currConf.symbol })}
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("PERCENTAGE")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  discountType === "PERCENTAGE"
                    ? "bg-white dark:bg-slate-900 text-[#0f6b4f] dark:text-emerald-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tInv("discountTypePercent")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-7">
              <div className="relative">
                {discountType === "FIXED" && (
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                    {currConf.symbol}
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  step={currConf.decimalPlaces > 0 ? "0.01" : "1"}
                  max={discountType === "PERCENTAGE" ? "100" : undefined}
                  value={discountValue || ""}
                  onChange={(e) =>
                    setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  placeholder={discountType === "FIXED" ? "0" : tInv("percentageExample")}
                  className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums font-medium min-h-[44px] ${
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
                {DISCOUNT_PERCENT_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountValue(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer min-h-[32px] ${
                      discountValue === pct
                        ? "bg-[#0f6b4f] text-white border-[#0f6b4f]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Pajak (PPN) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {tInv("taxVatFull")}
          </label>

          <div className="flex flex-wrap gap-2">
            {taxPresets.map((preset) => (
              <button
                key={String(preset.value)}
                type="button"
                onClick={() => setSelectedTaxMode(preset.value)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer min-h-[38px] ${
                  selectedTaxMode === preset.value
                    ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/20 border-[#0f6b4f]/30 dark:border-emerald-500/40 text-[#0f6b4f] dark:text-emerald-400 shadow-2xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedTaxMode === "custom" && (
            <div className="max-w-xs pt-1">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                {tInv("customTaxRate")}
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
                  placeholder={tInv("taxRateExample")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] font-medium min-h-[44px]"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  %
                </span>
              </div>
            </div>
          )}

          {activeTaxRate > 0 && (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {tInv("taxCalculatedFrom")}{" "}
              <strong>{tInv("taxableBase")}</strong> ={" "}
              <span>{formatMoney(totals.taxableBase, currency, locale)}</span>:{" "}
              <strong className="text-slate-900 dark:text-white">
                +{formatMoney(totals.taxAmount, currency, locale)}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Payment Options Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {tInv("paymentMethodsForCustomer")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tInv("paymentMethodsDesc")}
          </p>
        </div>

        <div className="space-y-3">
          {/* Option 1: Direct Transfer */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer bg-slate-50/60 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={enableDirectTransfer}
              onChange={(e) => setEnableDirectTransfer(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {tInv("directTransferFormTitle")}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userBankName && userBankAccountNumber ? (
                  tInv.rich("directTransferConfigured", {
                    bank: userBankName,
                    number: userBankAccountNumber,
                    holder: userBankAccountName || "",
                    b: (chunks) => <strong>{chunks}</strong>,
                  })
                ) : (
                  tInv.rich("directTransferMissing", {
                    settings: (chunks) => (
                      <Link href="/settings" className="text-[#0f6b4f] dark:text-emerald-400 underline font-bold">
                        {chunks}
                      </Link>
                    ),
                  })
                )}
              </p>
            </div>
          </label>

          {/* Option 2: Digital Payment via NotaKu */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer bg-emerald-50/40 dark:bg-emerald-950/30">
            <input
              type="checkbox"
              checked={enableDigitalPayment}
              onChange={(e) => setEnableDigitalPayment(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tInv("digitalPaymentFormTitle")}
                </span>
                <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-[#0f6b4f] dark:text-emerald-300">
                  {tInv("autoSettled")}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {tInv("digitalPaymentFormDesc")}
              </p>
            </div>
          </label>

          {/* Option 3: Automated Payment Reminders */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer bg-slate-50/60 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={enableReminder}
              onChange={(e) => setEnableReminder(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {tInv("automatedReminderTitle")}
                </span>
                <span className="rounded-md bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {tInv("reminderSchedule")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tInv("automatedReminderOptionDesc")}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          {tInv("additionalNotes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={tInv("notesPlaceholder")}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs min-h-[44px]"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/60 dark:border-rose-900 px-4 py-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-semibold shadow-2xs animate-in fade-in"
        >
          {error}
        </div>
      )}

      {/* Desktop Summary & Action Buttons */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span className="font-medium">{tInv("subtotal")}</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {formatMoney(totals.subtotal, currency, locale)}
            </span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-[#0f6b4f] dark:text-emerald-400 font-semibold">
              <span>
                {tInv("discount")}{" "}
                {discountType === "PERCENTAGE"
                  ? `(${totals.discountValue}%)`
                  : ""}
              </span>
              <span className="tabular-nums">
                -{formatMoney(totals.discountAmount, currency, locale)}
              </span>
            </div>
          )}

          {activeTaxRate > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span className="font-medium">{tInv("taxVat")} ({activeTaxRate}%)</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                +{formatMoney(totals.taxAmount, currency, locale)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {tInv("total")}
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatMoney(totals.total, currency, locale)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              prefetch={true}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs min-h-[44px] inline-flex items-center"
            >
              {tInv("cancelBtn")}
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-50 transition-all shadow-xs min-h-[44px]"
            >
              {loading
                ? tInv("savingBtn")
                : isEdit
                ? tInv("saveChanges")
                : tInv("createAndSave")}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 md:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tInv("total")}
            </span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatMoney(totals.total, currency, locale)}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 max-w-[200px] rounded-xl bg-[#0f6b4f] px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-50 transition-all text-center cursor-pointer min-h-[44px]"
          >
            {loading
              ? tInv("savingBtn")
              : isEdit
              ? tInv("saveChanges")
              : tInv("saveInvoice")}
          </button>
        </div>
      </div>
    </div>
  );
}
