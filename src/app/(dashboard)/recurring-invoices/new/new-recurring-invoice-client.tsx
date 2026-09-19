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
import { useTranslations } from "next-intl";

type Customer = { id: string; name: string };
type InvoiceItem = { description: string; quantity: number; price: number };

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
  const tRec = useTranslations("recurring");
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
      setError(tRec("validationTitle"));
      return;
    }

    if (!customerId) {
      setError(tRec("validationCustomer"));
      return;
    }

    if (items.some((item) => !item.description.trim() || item.price <= 0)) {
      setError(tRec("validationItems"));
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
      setError(err.message || tRec("saveError"));
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f] dark:text-emerald-400" />
            <span>{tRec("newRecurring")}</span>
          </h1>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <SparklesIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {tRec("proFeatureNotice")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-lg mx-auto leading-relaxed">
              {tRec("proFeatureDesc")}
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ArrowPathIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f] dark:text-emerald-400" />
            <span>{tRec("newRecurring")}</span>
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <SparklesIcon className="w-3.5 h-3.5 text-[#0f6b4f] dark:text-emerald-400" />
            PRO
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tRec("formSubtitle")}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-300 shadow-2xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Profile Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CalendarDaysIcon className="w-5 h-5 text-[#0f6b4f] dark:text-emerald-400" />
            <span>{tRec("scheduleInfo")}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title / Label */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {tRec("scheduleTitle")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tRec("scheduleTitlePlaceholder")}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              />
            </div>

            {/* Customer Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {tRec("customer")}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>{tRec("addNew")}</span>
                </button>
              </div>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              >
                <option value="">{tRec("selectCustomer")}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {tRec("frequency")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              >
                {[
                  { value: "WEEKLY" as const, label: tRec("freqWeeklyLabel"), desc: tRec("freqWeeklyDesc") },
                  { value: "BIWEEKLY" as const, label: tRec("freqBiweeklyLabel"), desc: tRec("freqBiweeklyDesc") },
                  { value: "MONTHLY" as const, label: tRec("freqMonthlyLabel"), desc: tRec("freqMonthlyDesc") },
                  { value: "QUARTERLY" as const, label: tRec("freqQuarterlyLabel"), desc: tRec("freqQuarterlyDesc") },
                  { value: "ANNUALLY" as const, label: tRec("freqAnnuallyLabel"), desc: tRec("freqAnnuallyDesc") },
                ].map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label} ({f.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {tRec("startDate")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {tRec("cronHint")}
              </p>
            </div>

            {/* Due Days Offset */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {tRec("dueDaysOffset")}{" "}
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
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 min-h-[44px]"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
                  {tRec("days")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {tRec("dueDaysHint")}
              </p>
            </div>
          </div>

          {/* Auto Dispatch Toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors min-h-[44px]">
              <input
                type="checkbox"
                checked={autoSendEmail}
                onChange={(e) => setAutoSendEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {tRec("autoSendEmail")}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {tRec("autoSendEmailDesc")}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors min-h-[44px]">
              <input
                type="checkbox"
                checked={enableDirectTransfer}
                onChange={(e) => setEnableDirectTransfer(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCardIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  {tRec("directTransfer")}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {userBankName
                    ? `${userBankName} (${userBankAccountNumber})`
                    : tRec("bankMissing")}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {tRec("itemsTitle")}
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0f6b4f] dark:text-emerald-400 hover:underline cursor-pointer min-h-[44px] sm:min-h-[36px]"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{tRec("addItem")}</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 sm:gap-3 items-center rounded-xl bg-slate-50/70 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700"
              >
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 sm:hidden">
                    {tRec("description")}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder={tRec("itemPlaceholder")}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 sm:hidden">
                    {tRec("quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-center shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 sm:hidden">
                    {tRec("unitPrice")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white text-right shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-30 cursor-pointer min-h-[44px] sm:min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title={tRec("deleteItem")}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Discount & Tax Options */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Discount */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {tRec("discount")}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 shadow-2xs focus:border-[#0f6b4f] focus:outline-none min-h-[44px] sm:min-h-[38px]"
                >
                  <option value="FIXED">{tRec("discountFixed")}</option>
                  <option value="PERCENTAGE">{tRec("discountPercent")}</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none min-h-[44px] sm:min-h-[38px]"
                />
              </div>
            </div>

            {/* Tax */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {tRec("tax")}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTaxMode}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedTaxMode(v === "custom" ? "custom" : Number(v));
                  }}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 shadow-2xs focus:border-[#0f6b4f] focus:outline-none min-h-[44px] sm:min-h-[38px]"
                >
                  <option value={0}>{tRec("taxNone")}</option>
                  <option value={11}>PPN 11%</option>
                  <option value={12}>PPN 12%</option>
                  <option value="custom">{tRec("taxCustom")}</option>
                </select>
                {selectedTaxMode === "custom" && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customTaxRate}
                    onChange={(e) => setCustomTaxRate(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="%"
                    className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white text-center shadow-2xs focus:border-[#0f6b4f] focus:outline-none min-h-[44px] sm:min-h-[38px]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{tRec("subtotal")}</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                  Rp{totals.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>{tRec("discountSummary")}</span>
                  <span className="font-mono tabular-nums font-semibold">
                    -Rp{totals.discountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{tRec("taxSummary", { rate: activeTaxRate })}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    +Rp{totals.taxAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>{tRec("estimatedGrandTotal")}</span>
                <span className="font-mono tabular-nums text-[#0f6b4f] dark:text-emerald-400">
                  Rp{totals.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {tRec("notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={tRec("notesPlaceholder")}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href="/recurring-invoices"
            prefetch={true}
            className="w-full sm:w-auto text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs min-h-[44px] flex items-center justify-center"
          >
            {tRec("cancel")}
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            <CheckBadgeIcon className="w-4 h-4" />
            <span>
              {loading
                ? tRec("saving")
                : tRec("saveSchedule")}
            </span>
          </button>
        </div>
      </form>

      {/* Quick Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          customer={null}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={() => {
            setShowCustomerModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
