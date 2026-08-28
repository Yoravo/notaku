"use client";

import { useLanguage, type Locale } from "@/lib/i18n/context";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "id" ? "en" : "id");
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-deep/80 px-2.5 py-1 text-xs font-semibold text-ink transition-all hover:bg-line hover:border-ink/20 cursor-pointer shadow-2xs"
      title={locale === "id" ? "Ganti ke Bahasa Inggris" : "Switch to Indonesian"}
      aria-label="Toggle Language"
    >
      <GlobeAltIcon className="w-3.5 h-3.5 text-emerald" />
      <span className="font-mono uppercase tracking-wider">{locale}</span>
    </button>
  );
}
