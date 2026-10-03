"use client";

import { ClockIcon, ArrowUturnLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface DraftRecoveryBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
  title?: string;
  description?: string;
}

function formatDraftTime(timestamp: number): string {
  if (!timestamp) return "";
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "beberapa detik yang lalu";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const d = new Date(timestamp);
  return d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DraftRecoveryBanner({
  savedAt,
  onRestore,
  onDiscard,
  title = "Draf Sebelumnya Ditemukan",
  description,
}: DraftRecoveryBannerProps) {
  const relativeTime = formatDraftTime(savedAt);

  return (
    <div
      role="region"
      aria-label={title}
      className="mb-6 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-[#0f6b4f] dark:text-emerald-400 shrink-0 mt-0.5">
          <ClockIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {description || `Ada draf pengisian belum selesai yang tersimpan otomatis ${relativeTime}. Ingin memulihkan data tersebut?`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={onDiscard}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors min-h-[44px] sm:min-h-[38px] cursor-pointer"
        >
          <XMarkIcon className="w-4 h-4" />
          <span>Buang Draf</span>
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0f6b4f] hover:bg-[#0c5740] active:scale-[0.98] transition-all shadow-xs min-h-[44px] sm:min-h-[38px] cursor-pointer"
        >
          <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
          <span>Pulihkan</span>
        </button>
      </div>
    </div>
  );
}
