"use client";

import { MonthlyCashflowPoint } from "@/lib/analytics";
import { formatCurrency } from "@/lib/pdf/format";
import { useLanguage } from "@/lib/i18n/context";

interface CashflowChartProps {
  data: MonthlyCashflowPoint[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  const { locale } = useLanguage();

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.billed, d.collected)),
    1000000 // default minimum scale 1 juta
  );

  const totalBilled = data.reduce((acc, d) => acc + d.billed, 0);
  const totalCollected = data.reduce((acc, d) => acc + d.collected, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {locale === "id" ? "Arus Kas & Realisasi Pembayaran" : "Cashflow & Payment Collection"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {locale === "id"
              ? "Perbandingan nilai tagihan yang diterbitkan vs pembayaran yang diterima (6 Bulan Terakhir)"
              : "Comparison between invoiced amount vs collected revenue (Last 6 Months)"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span className="text-slate-600">
              {locale === "id" ? "Ditagihkan (Billed)" : "Invoiced"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#0f6b4f] inline-block" />
            <span className="text-slate-600">
              {locale === "id" ? "Diterima (Collected)" : "Collected"}
            </span>
          </div>
          <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#0f6b4f] border border-emerald-200/60">
            {collectionRate}% {locale === "id" ? "Tercairkan" : "Realized"}
          </div>
        </div>
      </div>

      {/* Responsive Bar Chart Canvas */}
      <div className="pt-6">
        <div className="h-48 sm:h-56 flex items-end gap-2 sm:gap-4 pb-2 px-1 border-b border-slate-200">
          {data.map((item) => {
            const billedPercent = Math.max((item.billed / maxVal) * 100, item.billed > 0 ? 6 : 0);
            const collectedPercent = Math.max(
              (item.collected / maxVal) * 100,
              item.collected > 0 ? 6 : 0
            );

            return (
              <div
                key={item.monthKey}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip Hover Interactive */}
                <div className="absolute -top-16 z-30 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200">
                  <span className="font-bold text-slate-200">{item.label}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-blue-300">
                      Billed: {formatCurrency(item.billed)}
                    </span>
                    <span className="text-emerald-300">
                      Paid: {formatCurrency(item.collected)}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1" />
                </div>

                {/* Paired Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Billed Bar */}
                  <div
                    style={{ height: `${billedPercent}%` }}
                    className="w-full max-w-[16px] sm:max-w-[20px] bg-blue-500/80 group-hover:bg-blue-600 rounded-t-md transition-all duration-300 shadow-2xs"
                  />
                  {/* Collected Bar */}
                  <div
                    style={{ height: `${collectedPercent}%` }}
                    className="w-full max-w-[16px] sm:max-w-[20px] bg-[#0f6b4f]/85 group-hover:bg-[#0f6b4f] rounded-t-md transition-all duration-300 shadow-2xs"
                  />
                </div>

                {/* X-axis Label */}
                <span className="text-[11px] text-slate-500 mt-2 font-medium truncate text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-xs">
              {locale === "id" ? "Total Tagihan Diterbitkan (6 Bln)" : "Total Invoiced (6 Mo)"}
            </span>
            <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-emerald-700 text-xs">
              {locale === "id" ? "Total Kas Masuk Terkumpul (6 Bln)" : "Total Cash Collected (6 Mo)"}
            </span>
            <p className="font-bold text-[#0f6b4f] mt-0.5">{formatCurrency(totalCollected)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
