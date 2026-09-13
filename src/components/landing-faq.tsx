"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface FAQItem {
  q: string;
  a: string;
}

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations("faq");

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = t.raw("items") as FAQItem[];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald">
            {t("tag")}
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
            {t("title")}
          </h2>
          <p className="mt-3 text-base text-ink-soft">
            {t("desc")}
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const questionId = `faq-q-${idx}`;
            const answerId = `faq-a-${idx}`;
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen
                    ? "border-emerald/40 bg-white dark:bg-slate-900 shadow-xs"
                    : "border-line bg-paper-deep/40 hover:bg-paper-deep/80 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                }`}
              >
                <button
                  type="button"
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between px-6 py-4.5 text-left font-medium text-ink transition-colors cursor-pointer min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  <span className="text-base font-semibold text-ink sm:text-lg pr-4">
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isOpen
                        ? "rotate-180 bg-emerald text-paper"
                        : "bg-paper-deep dark:bg-slate-800 text-ink-soft"
                    }`}
                  >
                    <ChevronDownIcon className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                  </div>
                </button>
                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    className="border-t border-line/60 dark:border-slate-800 px-6 pb-5 pt-3 text-sm leading-relaxed text-ink-soft sm:text-base animate-in fade-in duration-150"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
