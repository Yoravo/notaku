"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { openCommandPalette } from "./command-palette";

export function CommandTrigger({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 sm:px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer min-h-[44px] sm:min-h-[38px] ${className}`}
      aria-label="Buka command palette (Ctrl+K)"
      title="Cari atau aksi cepat (Ctrl+K)"
    >
      <MagnifyingGlassIcon className="w-4 h-4 shrink-0 text-slate-400" />
      <span className="hidden md:inline font-medium">Cari atau aksi...</span>
      <span className="md:hidden font-medium">Cari</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
        ⌘K
      </kbd>
    </button>
  );
}
