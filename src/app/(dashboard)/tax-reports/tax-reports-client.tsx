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
import { useLanguage } from "@/lib/i18n/context";
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
  const { t, locale } = useLanguage();
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
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {locale === "id" ? "Rekap Pajak & Omset Bulanan" : "Tax & Monthly Turnover Report"}
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#0f6b4f] border border-emerald-200">
              SPT Ready
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {locale === "id"
              ? "Akumulasi Dasar Pengenaan Pajak (DPP), PPN terutang, dan rekapitulasi omset per masa pajak."
              : "Taxable turnover (DPP), output VAT, and revenue reconciliation per tax period."}
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs focus:border-[#0f6b4f] focus:outline-none cursor-pointer"
            >
              {data.availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {locale === "id" ? `Tahun ${yr}` : `Year ${yr}`}
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs focus:border-[#0f6b4f] focus:outline-none cursor-pointer"
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{locale === "id" ? "Ekspor CSV" : "Export CSV"}</span>
          </a>
        </div>
      </div>

      {/* Top 4 KPI Metrics Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Omset Kotor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Total Omset Bruto" : "Gross Turnover"}
            </span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <DocumentChartBarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatMoney(data.annualTotals.grossTurnover, selectedCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.annualTotals.invoiceCount} {locale === "id" ? "invoice diterbitkan" : "invoices issued"}
          </p>
        </div>

        {/* Dasar Pengenaan Pajak (DPP) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Total DPP (Kena Pajak)" : "Taxable Base (DPP)"}
            </span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <ReceiptPercentIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatMoney(data.annualTotals.taxableTurnover, selectedCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "id" ? "Dasar perhitungan PPN" : "VAT assessment base"}
          </p>
        </div>

        {/* PPN Terutang (Output VAT) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "PPN Terutang" : "Output VAT"}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-[#0f6b4f]">
              <ReceiptPercentIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-[#0f6b4f] tabular-nums">
            {formatMoney(data.annualTotals.taxAmount, selectedCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "id" ? "Pajak keluaran wajib setor" : "VAT payable to tax office"}
          </p>
        </div>

        {/* Omset Lunas (Realisasi Kas) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Realisasi Lunas" : "Settled Revenue"}
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatMoney(data.annualTotals.paidTurnover, selectedCurrency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data.annualTotals.paidInvoiceCount} {locale === "id" ? "invoice lunas (PAID)" : "settled invoices"}
          </p>
        </div>
      </div>

      {/* Tax Category Summary Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          {locale === "id" ? "Rincian Tarif Pajak (PPN)" : "VAT Rates Breakdown"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1">
              <span>PPN 11%</span>
              <span className="text-slate-900">
                {formatMoney(data.ppnBreakdown.ppn11Amount, selectedCurrency)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              DPP: {formatMoney(data.ppnBreakdown.ppn11Taxable, selectedCurrency)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1">
              <span>PPN 12%</span>
              <span className="text-slate-900">
                {formatMoney(data.ppnBreakdown.ppn12Amount, selectedCurrency)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              DPP: {formatMoney(data.ppnBreakdown.ppn12Taxable, selectedCurrency)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1">
              <span>{locale === "id" ? "Non-Pajak / 0%" : "Non-Taxable / 0%"}</span>
              <span className="text-slate-900">
                {formatMoney(data.ppnBreakdown.nonTaxableTurnover, selectedCurrency)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {locale === "id" ? "Omset bebas pajak" : "Tax-exempt turnover"}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Tax Period Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableCellsIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">
              {locale === "id"
                ? `Rekapitulasi 12 Masa Pajak (${selectedYear})`
                : `12-Month Tax Period Summary (${selectedYear})`}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {currConf.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{locale === "id" ? "Masa Pajak" : "Period"}</th>
                <th className="px-4 py-3.5 text-center">{locale === "id" ? "Faktur/Inv" : "Invoices"}</th>
                <th className="px-4 py-3.5 text-right">{locale === "id" ? "Omset Bruto" : "Gross Turnover"}</th>
                <th className="px-4 py-3.5 text-right">{locale === "id" ? "DPP (Kena Pajak)" : "Taxable (DPP)"}</th>
                <th className="px-4 py-3.5 text-right">{locale === "id" ? "PPN Terutang" : "Output VAT"}</th>
                <th className="px-4 py-3.5 text-right">{locale === "id" ? "Realisasi Lunas" : "Paid Amount"}</th>
                <th className="px-5 py-3.5 text-center">{locale === "id" ? "Aksi" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.monthlySummaries.map((m) => (
                <tr
                  key={m.periodKey}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    m.invoiceCount > 0 ? "bg-white" : "bg-slate-50/20 text-slate-400"
                  }`}
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {m.periodLabel}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                    {m.invoiceCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-900 tabular-nums">
                    {formatMoney(m.grossTurnover, selectedCurrency)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 tabular-nums font-medium">
                    {formatMoney(m.taxableTurnover, selectedCurrency)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-[#0f6b4f] tabular-nums">
                    {formatMoney(m.taxAmount, selectedCurrency)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-900 tabular-nums font-medium">
                    {formatMoney(m.paidTurnover, selectedCurrency)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {m.invoiceCount > 0 ? (
                      <a
                        href={`/api/reports/tax/export?year=${selectedYear}&month=${m.month}&currency=${selectedCurrency}`}
                        download
                        title={locale === "id" ? "Unduh CSV Masa Pajak Ini" : "Download Period CSV"}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0f6b4f] hover:underline"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-100/70 font-bold text-slate-900">
              <tr>
                <td className="px-5 py-4 uppercase text-xs">
                  {locale === "id" ? "Total Akumulasi Tahunan" : "Annual Total"}
                </td>
                <td className="px-4 py-4 text-center font-mono">
                  {data.annualTotals.invoiceCount}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.grossTurnover, selectedCurrency)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.taxableTurnover, selectedCurrency)}
                </td>
                <td className="px-4 py-4 text-right text-[#0f6b4f] tabular-nums">
                  {formatMoney(data.annualTotals.taxAmount, selectedCurrency)}
                </td>
                <td className="px-4 py-4 text-right tabular-nums">
                  {formatMoney(data.annualTotals.paidTurnover, selectedCurrency)}
                </td>
                <td className="px-5 py-4 text-center">
                  <a
                    href={`/api/reports/tax/export?year=${selectedYear}&currency=${selectedCurrency}`}
                    download
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0f6b4f] hover:underline"
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
