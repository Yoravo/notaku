"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useLanguage();

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = t.faq.items;

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`overflow-hidden rounded-2xl border transition-all ${
              isOpen
                ? "border-emerald/30 bg-white shadow-sm"
                : "border-line bg-paper-deep/50 hover:bg-paper-deep"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-6 py-4.5 text-left font-medium text-ink transition-colors cursor-pointer"
            >
              <span className="text-base font-semibold text-ink sm:text-lg">
                {faq.q}
              </span>
              <div
                className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 bg-emerald text-paper"
                    : "bg-paper-deep text-ink-soft"
                }`}
              >
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-line/50 px-6 pb-5 pt-3 text-sm leading-relaxed text-ink-soft sm:text-base animate-in fade-in duration-200">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
