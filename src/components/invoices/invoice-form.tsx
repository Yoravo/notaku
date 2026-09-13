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

export function InvoiceForm({
  customers,
  invoice,
  isCloneMode = false,
  defaultCustomerId,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
}: {
  customers: Customer[];
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          {tInv("customerPaymentInfo")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tInv("customer")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <PlusIcon className="h-4 w-4 text-[#0f6b4f]" />
                <span>{tInv("newCustomer")}</span>
              </button>
            </div>
            {customers.length === 0 && (
              <p className="mt-2 text-xs text-amber-700 font-medium">
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tInv("dueDate")}{" "}
              <span className="text-slate-400 font-normal">({tInv("optional")})</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tInv("currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            {tInv("itemsTitle")}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {tInv("itemCount", { count: items.length })}
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                  />
                </div>
              </div>
              <div className="text-right pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{tInv("subtotal")}:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatMoney(item.quantity * item.price, currency, locale)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Items Layout */}
        <div className="hidden md:block space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tabular-nums"
                />
              </div>
              <div className="col-span-2 text-right font-bold text-sm text-slate-900 tabular-nums">
                {formatMoney(item.quantity * item.price, currency, locale)}
              </div>
              <div className="col-span-1 text-center">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title={tInv("removeItem")}
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
          <span>{tInv("addItem")}</span>
        </button>
      </div>

      {/* Diskon & Pajak (PPN) Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900">
          {tInv("discountTaxSettings")}
        </h2>

        {/* Section Diskon */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {tInv("discount")}
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
                {tInv("discountTypeFixed", { symbol: currConf.symbol })}
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
                {DISCOUNT_PERCENT_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountValue(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      discountValue === pct
                        ? "bg-[#0f6b4f] text-white border-[#0f6b4f]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {tInv("taxVatFull")}
          </label>

          <div className="flex flex-wrap gap-2">
            {taxPresets.map((preset) => (
              <button
                key={String(preset.value)}
                type="button"
                onClick={() => setSelectedTaxMode(preset.value)}
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
              {tInv("taxCalculatedFrom")}{" "}
              <strong>{tInv("taxableBase")}</strong> ={" "}
              <span>{formatMoney(totals.taxableBase, currency, locale)}</span>:{" "}
              <strong className="text-slate-900">
                +{formatMoney(totals.taxAmount, currency, locale)}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Payment Options Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {tInv("paymentMethodsForCustomer")}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {tInv("paymentMethodsDesc")}
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
                {tInv("directTransferFormTitle")}
              </span>
              <p className="text-xs text-slate-500">
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
                      <Link href="/settings" className="text-[#0f6b4f] underline font-bold">
                        {chunks}
                      </Link>
                    ),
                  })
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
                  {tInv("digitalPaymentFormTitle")}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#0f6b4f]">
                  {tInv("autoSettled")}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {tInv("digitalPaymentFormDesc")}
              </p>
            </div>
          </label>

          {/* Option 3: Automated Payment Reminders */}
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer bg-slate-50/60">
            <input
              type="checkbox"
              checked={enableReminder}
              onChange={(e) => setEnableReminder(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {tInv("automatedReminderTitle")}
                </span>
                <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {tInv("reminderSchedule")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {tInv("automatedReminderOptionDesc")}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notes Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {tInv("additionalNotes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={tInv("notesPlaceholder")}
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
            <span className="font-medium">{tInv("subtotal")}</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatMoney(totals.subtotal, currency, locale)}
            </span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-[#0f6b4f] font-semibold">
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
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">{tInv("taxVat")} ({activeTaxRate}%)</span>
              <span className="font-bold text-slate-900 tabular-nums">
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
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatMoney(totals.total, currency, locale)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {tInv("cancelBtn")}
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-50 transition-all shadow-xs"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 md:hidden shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tInv("total")}
            </span>
            <p className="text-base font-extrabold text-slate-900 tabular-nums">
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
