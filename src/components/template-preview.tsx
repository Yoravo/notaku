"use client";

import { useState } from "react";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function TemplatePreview({
  template,
}: {
  template: "CLASSIC" | "MODERN" | "MINIMAL";
}) {
  const [loading, setLoading] = useState(true);
  const previewUrl = `/api/invoices/preview?template=${template.toLowerCase()}&t=${Date.now()}`;

  return (
    <div className="relative w-full h-[580px] rounded-2xl border border-gray-200 bg-gray-100/60 overflow-hidden shadow-xs">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-10 space-y-2">
          <ArrowPathIcon className="w-6 h-6 text-[#0f6b4f] animate-spin" />
          <p className="text-xs font-semibold text-gray-600">
            Merender Dokumen PDF {template}...
          </p>
        </div>
      )}

      {/* Embedded Native PDF Viewer */}
      <iframe
        src={`/api/invoices/preview?template=${template.toLowerCase()}#toolbar=0&navpanes=0`}
        className="w-full h-full border-0 bg-white"
        title={`Pratinjau Template ${template}`}
        onLoad={() => setLoading(false)}
      />

      {/* Floating Action Button to open in new tab */}
      <div className="absolute bottom-3 right-3 z-20">
        <a
          href={`/api/invoices/preview?template=${template.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900/85 hover:bg-gray-900 text-white px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-xs transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          <span>Buka Full PDF</span>
        </a>
      </div>
    </div>
  );
}
