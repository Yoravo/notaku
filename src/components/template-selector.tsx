"use client";

import { useState } from "react";
import { updateInvoiceTemplate } from "@/actions/settings";
import { InvoiceTemplate } from "@/generated/prisma/client";
import dynamic from "next/dynamic";
import { useLanguage } from "@/lib/i18n/context";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const TemplatePreview = dynamic(() => import("@/components/template-preview"), {
  ssr: false,
});

interface TemplateSelectorProps {
  current: InvoiceTemplate;
}

export function TemplateSelector({ current }: TemplateSelectorProps) {
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState<InvoiceTemplate>(current);
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      value: "CLASSIC" as const,
      label: "Classic",
      desc: locale === "id" ? "Bersih, rapi, dan standar industri" : "Clean, structured, and industry standard",
    },
    {
      value: "MODERN" as const,
      label: "Modern",
      desc: locale === "id" ? "Header elegan, aksen korporat premium" : "Sleek header, premium corporate look",
    },
    {
      value: "MINIMAL" as const,
      label: "Minimal",
      desc: locale === "id" ? "Ultra-clean, aksen emerald profesional" : "Ultra-clean with emerald accents",
    },
  ];

  const handleChange = async (value: InvoiceTemplate) => {
    setSelected(value);
    setLoading(true);
    await updateInvoiceTemplate(value);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Template Chooser Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((tmpl) => {
          const isSelected = selected === tmpl.value;
          return (
            <button
              key={tmpl.value}
              type="button"
              onClick={() => handleChange(tmpl.value)}
              disabled={loading}
              className={`rounded-2xl border-2 p-4 text-left transition-all cursor-pointer shadow-2xs relative min-h-[44px] ${
                isSelected
                  ? "border-[#0f6b4f] bg-emerald-50/60 ring-1 ring-[#0f6b4f]/20"
                  : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm font-bold ${isSelected ? "text-[#0f6b4f]" : "text-slate-900"}`}>
                  {tmpl.label}
                </p>
                {isSelected ? (
                  <CheckCircleIcon className="w-5 h-5 text-[#0f6b4f]" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">{tmpl.desc}</p>
            </button>
          );
        })}
      </div>

      {/* PDF Live Preview Box */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {locale === "id" ? "Pratinjau Hasil PDF Invoice" : "Live PDF Invoice Preview"}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {locale === "id"
              ? "Termasuk rincian tanda tangan, cap & rekening usaha Anda"
              : "Includes digital signature, business stamp & bank details"}
          </span>
        </div>

        <TemplatePreview template={selected} />
      </div>
    </div>
  );
}
