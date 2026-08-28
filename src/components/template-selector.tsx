"use client";

import { useState } from "react";
import { updateInvoiceTemplate } from "@/actions/settings";
import { InvoiceTemplate } from "@/generated/prisma/client";
import dynamic from "next/dynamic";

const TemplatePreview = dynamic(() => import("@/components/template-preview"), {
  ssr: false,
});

const templates = [
  { value: "CLASSIC", label: "Classic", desc: "Bersih, rapi, dan profesional" },
  { value: "MODERN", label: "Modern", desc: "Header gelap, kesan korporat" },
  { value: "MINIMAL", label: "Minimal", desc: "Ultra-clean, aksen emerald" },
] as const;

interface TemplateSelectorProps {
  current: InvoiceTemplate;
}

export function TemplateSelector({ current }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<InvoiceTemplate>(current);
  const [loading, setLoading] = useState(false);

  const handleChange = async (value: InvoiceTemplate) => {
    setSelected(value);
    setLoading(true);
    await updateInvoiceTemplate(value);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Template Chooser Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => (
          <button
            key={t.value}
            onClick={() => handleChange(t.value)}
            disabled={loading}
            className={`rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
              selected === t.value
                ? "border-[#0f6b4f] bg-emerald-50/50 shadow-2xs"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-bold ${selected === t.value ? "text-[#0f6b4f]" : "text-gray-900"}`}>
                {t.label}
              </p>
              {selected === t.value && (
                <span className="inline-block w-2 h-2 rounded-full bg-[#0f6b4f]" />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* PDF Live Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Pratinjau Hasil PDF Invoice
          </p>
          <span className="text-[11px] text-gray-400">
            Termasuk rincian tanda tangan, cap & rekening usaha Anda
          </span>
        </div>

        <TemplatePreview template={selected} />
      </div>
    </div>
  );
}
