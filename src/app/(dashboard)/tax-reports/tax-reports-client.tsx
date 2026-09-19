"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TaxReportOverview,
  getTaxReportsData,
  MonthlyTaxSummary,
} from "@/actions/tax-reports";
import {
  CURRENCY_MAP,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  formatMoney,
} from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ReceiptPercentIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

export function TaxReportsClient({
  initialData,
}: {
  initialData: TaxReportOverview;
}) {
  const router = useRouter();
  const locale = useLocale() as "id" | "en";
  const tTax = useTranslations("taxes");
  const [data, setData] = useState<TaxReportOverview>(initialData);
  const [selectedYear, setSelectedYear] = useState<number>(initialData.year);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(
    initialData.currency
  );
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newYear: number, newCurrency: SupportedCurrency) => {
    setSelectedYear(newYear);
    setSelectedCurrency(newCurrency);

    startTransition(async () => {
      try {
        const updated = await getTaxReportsData(newYear, newCurrency, locale);
        setData(updated);
        router.replace(`/tax-reports?year=${newYear}&currency=${newCurrency}`);
      } catch (err) {
        console.error("Failed to load tax report data", err);
      }
    });
  };

  const currConf = CURRENCY_MAP[selectedCurrency] || CURRENCY_MAP.IDR;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tTax("title")}
            </h1>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-[#0f6b4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {tTax("sptReady")}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {tTax("subtitle")}
          </p>
        </div>

        {/* Action Controls (Year, Currency, Export) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedYear}
              disabled={isPending}
              onChange={(e) =>
                handleFilterChange(parseInt(e.target.value, 10), selectedCurrency)
              }
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:border-[#0f6b4f] focus:outline-none cursor-pointer min-h-[44px]"
            >
              {data.availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {tTax("year", { year: yr })}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedCurrency}
              disabled={isPending}
              onChange={(e) =>
                handleFilterChange(selectedYear, e.target.value as SupportedCurrency)
              }
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs focus:border-[#0f6b4f] focus:outline-none cursor-pointer min-h-[44px]"
            >
              {SUPPORTED_CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({CURRENCY_MAP[cur].symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <a
            href={`/api/reports/tax/export?year=${selectedYear}&currency=${selectedCurrency}`}
            download
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{tTax("exportCsv")}</span>
          </a>
        </div>
      </div>

      {/* Top 4 KPI Metrics Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Omset Kotor */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tTax("grossTurnover")}
            </span>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300">
              <DocumentChartBarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(data.annualTotals.grossTurnover, selectedCurrency, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tTax("invoicesIssued", { count: data.annualTotals.invoiceCount })}
          </p>
        </div>

        {/* Dasar Pengenaan Pajak (DPP) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tTax("taxableBase")}
            </span>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-2 text-blue-600 dark:text-blue-400">
              <ReceiptPercentIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(data.annualTotals.taxableTurnover, selectedCurrency, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tTax("taxableBaseDesc")}
          </p>
        </div>

        {/* PPN Terutang (Output VAT) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tTax("vatPayable")}
            </span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-[#0f6b4f] dark:text-emerald-400">
              <ReceiptPercentIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
            {formatMoney(data.annualTotals.taxAmount, selectedCurrency, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tTax("vatPayableDesc")}
          </p>
        </div>

        {/* Omset Lunas (Realisasi Kas) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {tTax("settledRevenue")}
            </span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatMoney(data.annualTotals.paidTurnover, selectedCurrency, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tTax("settledInvoices", { count: data.annualTotals.paidInvoiceCount })}
          </p>
        </div>
      </div>

      {/* Tax Category Summary Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          {tTax("vatRatesBreakdown")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
              <span>PPN 11%</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {formatMoney(data.ppnBreakdown.ppn11Amount, selectedCurrency, locale)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              DPP: {formatMoney(data.ppnBreakdown.ppn11Taxable, selectedCurrency, locale)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
              <span>PPN 12%</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {formatMoney(data.ppnBreakdown.ppn12Amount, selectedCurrency, locale)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              DPP: {formatMoney(data.ppnBreakdown.ppn12Taxable, selectedCurrency, locale)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
              <span>{tTax("nonTaxable")}</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {formatMoney(data.ppnBreakdown.nonTaxableTurnover, selectedCurrency, locale)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {tTax("nonTaxableDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Tax Period Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableCellsIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {tTax("periodSummary", { year: selectedYear })}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {currConf.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[620px]">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{tTax("tablePeriod")}</th>
                <th className="px-4 py-3.5 text-center">{tTax("tableInvoices")}</th>
                <th className="px-4 py-3.5 text-right">{tTax("tableGross")}</th>
                <th className="px-4 py-3.5 text-right">{tTax("tableTaxable")}</th>
                <th className="px-4 py-3.5 text-right">{tTax("tableVat")}</th>
                <th className="px-4 py-3.5 text-right">{tTax("tableSettled")}</th>
                <th className="px-5 py-3.5 text-center">{tTax("tableAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.monthlySummaries.map((m) => (
                <tr
                  key={m.periodKey}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors ${
                    m.invoiceCount > 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/20 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                    {m.periodLabel}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                    {m.invoiceCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-900 dark:text-white tabular-nums">
                    {formatMoney(m.grossTurnover, selectedCurrency, locale)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300 tabular-nums font-medium">
                    {formatMoney(m.taxableTurnover, selectedCurrency, locale)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
                    {formatMoney(m.taxAmount, selectedCurrency, locale)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-900 dark:text-white tabular-nums font-medium">
                    {formatMoney(m.paidTurnover, selectedCurrency, locale)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {m.invoiceCount > 0 ? (
                      <a
                        href={`/api/reports/tax/export?year=${selectedYear}&month=${m.month}&currency=${selectedCurrency}`}
                        download
                        title={tTax("downloadCsvPeriod")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 hover:underline"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </a>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white">
              <tr>
                <td className="px-5 py-4 uppercase text-xs">
                  {tTax("annualTotal")}
                </td>
                <td className="px-4 py-4 text-center font-mono">
                  {data.annualTotals.invoiceCount}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.grossTurnover, selectedCurrency, locale)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.taxableTurnover, selectedCurrency, locale)}
                </td>
                <td className="px-4 py-4 text-right text-[#0f6b4f] dark:text-emerald-400 tabular-nums">
                  {formatMoney(data.annualTotals.taxAmount, selectedCurrency, locale)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.paidTurnover, selectedCurrency, locale)}
                </td>
                <td className="px-5 py-4 text-center">
                  <a
                    href={`/api/reports/tax/export?year=${selectedYear}&currency=${selectedCurrency}`}
                    download
                    title={tTax("downloadCsvYear")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 hover:underline"
                  >
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </a>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
