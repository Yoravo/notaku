"use client";

import { useState } from "react";
import { updateInvoiceTemplate } from "@/actions/settings";
import { InvoiceTemplate } from "@/generated/prisma/client";

const templates = [
  { value: "CLASSIC", label: "Classic", desc: "Bersih dan profesional" },
  { value: "MODERN", label: "Modern", desc: "Header gelap, kesan korporat" },
  { value: "MINIMAL", label: "Minimal", desc: "Ultra-clean, aksen hijau" },
] as const;

export function TemplateSelector({ current }: { current: InvoiceTemplate }) {
  const [selected, setSelected] = useState<InvoiceTemplate>(current);
  const [loading, setLoading] = useState(false);

  const handleChange = async (value: InvoiceTemplate) => {
    setSelected(value);
    setLoading(true);
    await updateInvoiceTemplate(value);
    setLoading(false);
  };

  return (
    <div className="mt-3 grid grid-cols-3 gap-3">
      {templates.map((t) => (
        <button
          key={t.value}
          onClick={() => handleChange(t.value)}
          disabled={loading}
          className={`rounded-lg border-2 p-3 text-left transition-colors cursor-pointer ${
            selected === t.value
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="text-sm font-medium text-gray-900">{t.label}</p>
          <p className="mt-0.5 text-xs text-gray-500">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}
