"use client";

import { useState } from "react";
import { updateInvoiceDesign } from "@/actions/settings";
import { InvoiceTemplate } from "@/generated/prisma/client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const TemplatePreview = dynamic(() => import("@/components/template-preview"), {
  ssr: false,
});

interface TemplateSelectorProps {
  current: InvoiceTemplate;
  currentColor?: string | null;
  currentFont?: string | null;
}

export function TemplateSelector({
  current,
  currentColor = "#0f6b4f",
  currentFont = "Helvetica",
}: TemplateSelectorProps) {
  const tTmpl = useTranslations("templates");
  const [selected, setSelected] = useState<InvoiceTemplate>(current);
  const [color, setColor] = useState<string>(currentColor || "#0f6b4f");
  const [font, setFont] = useState<string>(currentFont || "Helvetica");
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      value: "CLASSIC" as const,
      label: tTmpl("classicLabel"),
      desc: tTmpl("classicDesc"),
    },
    {
      value: "MODERN" as const,
      label: tTmpl("modernLabel"),
      desc: tTmpl("modernDesc"),
    },
    {
      value: "MINIMAL" as const,
      label: tTmpl("minimalLabel"),
      desc: tTmpl("minimalDesc"),
    },
  ];

  const colors = [
    { label: "Emerald (Default)", value: "#0f6b4f" },
    { label: "Classic Navy", value: "#1e3a8a" },
    { label: "Charcoal Slate", value: "#334155" },
    { label: "Crimson Red", value: "#991b1b" },
    { label: "Royal Purple", value: "#6b21a8" },
  ];

  const fonts = [
    { label: "Helvetica (Clean & Sans)", value: "Helvetica" },
    { label: "Times-Roman (Formal & Serif)", value: "Times-Roman" },
    { label: "Courier (Monospace / Tech)", value: "Courier" },
  ];

  const handleSave = async (
    newTemplate: InvoiceTemplate = selected,
    newColor: string = color,
    newFont: string = font
  ) => {
    setLoading(true);
    try {
      await updateInvoiceDesign(newTemplate, newColor, newFont);
    } catch (err) {
      console.error("Gagal simpan desain invoice", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Template Chooser */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pilihan Layout Template
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((tmpl) => {
            const isSelected = selected === tmpl.value;
            return (
              <button
                key={tmpl.value}
                type="button"
                onClick={() => {
                  setSelected(tmpl.value);
                  handleSave(tmpl.value, color, font);
                }}
                disabled={loading}
                className={`rounded-2xl border-2 p-4 text-left transition-all cursor-pointer shadow-2xs relative min-h-[44px] ${
                  isSelected
                    ? "border-[#0f6b4f] dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60 ring-1 ring-[#0f6b4f]/20 dark:ring-emerald-500/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-bold ${
                      isSelected
                        ? "text-[#0f6b4f] dark:text-emerald-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {tmpl.label}
                  </p>
                  {isSelected ? (
                    <CheckCircleIcon className="w-5 h-5 text-[#0f6b4f] dark:text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {tmpl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Styling Options: Color & Font Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Accent Color */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Warna Aksen Dokumen
          </label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setColor(c.value);
                  handleSave(selected, c.value, font);
                }}
                disabled={loading}
                title={c.label}
                className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center border-2 ${
                  color === c.value
                    ? "scale-110 border-slate-900 dark:border-white shadow-xs ring-2 ring-[#0f6b4f]/30"
                    : "border-white dark:border-slate-800 opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.value }}
              >
                {color === c.value && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Warna utama untuk heading, garis tabel, dan border dokumen PDF.
          </p>
        </div>

        {/* Font Selection */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Tipografi Font PDF
          </label>
          <select
            value={font}
            onChange={(e) => {
              const newFont = e.target.value;
              setFont(newFont);
              handleSave(selected, color, newFont);
            }}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
          >
            {fonts.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Mempengaruhi semua teks saat mencetak dan mengunduh PDF.
          </p>
        </div>
      </div>

      {/* 3. PDF Live Preview Box */}
      <div className="space-y-2 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {tTmpl("previewHeading")}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {tTmpl("previewHint")}
          </span>
        </div>

        <TemplatePreview template={selected} color={color} font={font} />
      </div>
    </div>
  );
}
