"use client";

import { useState, useRef, useEffect } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useTheme, Theme } from "@/lib/theme/context";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const tTheme = useTranslations("theme");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const options: { id: Theme; label: string; icon: typeof SunIcon }[] = [
    { id: "light", label: tTheme("light"), icon: SunIcon },
    { id: "dark", label: tTheme("dark"), icon: MoonIcon },
    { id: "system", label: tTheme("system"), icon: ComputerDesktopIcon },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        title={tTheme("toggleTheme")}
        aria-label={tTheme("toggleTheme")}
      >
        {resolvedTheme === "dark" ? (
          <MoonIcon className="h-4 w-4 text-emerald-400" />
        ) : (
          <SunIcon className="h-4 w-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={tTheme("toggleTheme")}
          className="absolute right-0 mt-2 w-36 sm:w-40 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
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
