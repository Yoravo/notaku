"use client";

import Link from "next/link";
import { WifiIcon, ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";

export function OfflineClient() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-md text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
          <WifiIcon className="w-7 h-7" />
        </div>

        <Link
          href="/"
          prefetch={true}
          className="inline-block text-xl font-bold tracking-tight mb-2 hover:opacity-90 transition-opacity"
        >
          <span className="text-slate-900 dark:text-white">Nota</span>
          <span className="text-emerald-600 dark:text-emerald-400">Ku</span>
        </Link>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          Koneksi Internet Terputus
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Anda sedang offline. Pastikan koneksi Wi-Fi atau data seluler Anda aktif, lalu coba muat ulang halaman.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs min-h-[44px]"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            prefetch={true}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors min-h-[44px]"
          >
            <HomeIcon className="w-4 h-4" />
            Ke Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
