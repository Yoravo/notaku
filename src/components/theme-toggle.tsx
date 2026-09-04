"use client";

import { useState, useRef, useEffect } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useTheme, Theme } from "@/lib/theme/context";
import { useLanguage } from "@/lib/i18n/context";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; icon: typeof SunIcon }[] = [
    { id: "light", label: locale === "id" ? "Terang (Light)" : "Light", icon: SunIcon },
    { id: "dark", label: locale === "id" ? "Gelap (Dark)" : "Dark", icon: MoonIcon },
    { id: "system", label: locale === "id" ? "Sistem (Auto)" : "System", icon: ComputerDesktopIcon },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={locale === "id" ? "Ganti Tema" : "Toggle Theme"}
        aria-label="Toggle Theme"
      >
        {resolvedTheme === "dark" ? (
          <MoonIcon className="h-4 w-4 text-emerald-400" />
        ) : (
          <SunIcon className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 sm:w-40 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 text-[#0f6b4f] dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-[#0f6b4f] dark:text-emerald-400" : "text-slate-400"}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
