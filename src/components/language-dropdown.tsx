"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Locale } from "@/lib/i18n/context";
import { GlobeAltIcon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface LanguageDropdownProps {
  variant?: "light" | "dark" | "ghost";
}

export function LanguageDropdown({ variant = "light" }: LanguageDropdownProps) {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: Locale; label: string; flag: string; native: string }[] = [
    {
      code: "id",
      label: "Bahasa Indonesia",
      flag: "ID",
      native: "Indonesia",
    },
    {
      code: "en",
      label: "English (US)",
      flag: "EN",
      native: "English",
    },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const buttonStyles = {
    light:
      "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs",
    dark:
      "bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white shadow-2xs",
    ghost:
      "bg-paper-deep/80 border-line text-ink hover:bg-line hover:border-ink/20 shadow-2xs",
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${buttonStyles[variant]}`}
      >
        <GlobeAltIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium">{currentLang.flag}</span>
        <ChevronDownIcon
          className={`w-3 h-3 transition-transform duration-200 text-slate-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/80 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {locale === "id" ? "Pilih Bahasa" : "Select Language"}
            </p>
          </div>

          <div className="space-y-0.5">
            {languages.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {lang.flag}
                    </span>
                    <span>{lang.label}</span>
                  </div>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
