"use client";

import { useEffect, useState, useCallback } from "react";
import {
  XMarkIcon,
  SparklesIcon,
  TagIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useTranslations, useLocale } from "next-intl";
import {
  APP_VERSION,
  CHANGELOG_RELEASES,
  type ChangelogCategory,
  type ReleaseSemverType,
} from "@/lib/changelog";

export const OPEN_CHANGELOG_EVENT = "notaku:open-changelog";

export function openChangelogModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_CHANGELOG_EVENT));
  }
}

interface ChangelogModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChangelogModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: ChangelogModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("changelog");
  const isEn = locale === "en";

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const handleClose = useCallback(() => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, controlledOnClose]);

  // Global event listener and URL hash / query check
  useEffect(() => {
    const onOpenEvent = () => setInternalOpen(true);
    window.addEventListener(OPEN_CHANGELOG_EVENT, onOpenEvent);

    // Auto-open on mount if hash is #changelog or query has changelog=1
    try {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (hash === "#changelog" || search.get("changelog") === "1") {
        setInternalOpen(true);
        // Clean hash/query without reload
        if (search.get("changelog") === "1") {
          search.delete("changelog");
          const query = search.toString();
          const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${hash === "#changelog" ? "" : hash}`;
          window.history.replaceState(null, "", cleanUrl);
        }
      }
    } catch {}

    const onHashChange = () => {
      if (window.location.hash === "#changelog") {
        setInternalOpen(true);
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener(OPEN_CHANGELOG_EVENT, onOpenEvent);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  // Keyboard navigation (Escape key) & Body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const categoryConfig: Record<
    ChangelogCategory,
    { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    feat: {
      label: t("categoryFeat"),
      badge:
        "bg-emerald-50 dark:bg-emerald-950/60 text-[#0f6b4f] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: SparklesIcon,
    },
    perf: {
      label: t("categoryPerf"),
      badge:
        "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      icon: CheckCircleIcon,
    },
    fix: {
      label: t("categoryFix"),
      badge:
        "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      icon: TagIcon,
    },
    security: {
      label: t("categorySecurity"),
      badge:
        "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      icon: ShieldCheckIcon,
    },
  };

  const semverBadgeConfig: Record<ReleaseSemverType, { label: string; badge: string }> = {
    major: {
      label: "MAJOR",
      badge:
        "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    },
    minor: {
      label: "MINOR",
      badge:
        "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
    patch: {
      label: "PATCH",
      badge:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl sm:max-w-3xl rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0f6b4f] dark:text-emerald-400 text-xs font-bold font-mono shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f6b4f] dark:bg-emerald-400 animate-pulse" />
                <span>v{APP_VERSION}</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t("badgeActive")}
              </span>
            </div>
            <h2
              id="changelog-modal-title"
              className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {t("title")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {t("desc")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label={t("closeModal")}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Timeline Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8 sm:space-y-10">
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2.5 sm:ml-3 pl-5 sm:pl-7 space-y-8 sm:space-y-10">
            {CHANGELOG_RELEASES.map((release) => {
              const releaseTitle = isEn ? release.title.en : release.title.id;
              const releaseSummary = isEn ? release.summary.en : release.summary.id;
              const releaseDate = isEn ? release.date.en : release.date.id;

              return (
                <article key={release.version} className="relative group">
                  {/* Timeline Dot Indicator */}
                  <span
                    className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      release.isLatest
                        ? "bg-[#0f6b4f] border-emerald-200 dark:border-emerald-500 ring-4 ring-emerald-500/20"
                        : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    }`}
                    aria-hidden="true"
                  />

                  {/* Release Card */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    {/* Meta Row: Version + Tag + Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                          v{release.version}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            semverBadgeConfig[release.type].badge
                          }`}
                        >
                          {semverBadgeConfig[release.type].label}
                        </span>
                        {release.isLatest && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-[#0f6b4f] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {t("latestRelease")}
                          </span>
                        )}
                      </div>
                      <time className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {releaseDate}
                      </time>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {releaseTitle}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {releaseSummary}
                    </p>

                    {/* Highlights Bullet List */}
                    <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700/60 space-y-2">
                      {release.highlights.map((item, idx) => {
                        const cat = categoryConfig[item.category] || categoryConfig.feat;
                        const Icon = cat.icon;
                        const itemText = isEn ? item.text.en : item.text.id;

                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span
                              className={`inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${cat.badge}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{cat.label}</span>
                            </span>
                            <span className="leading-relaxed flex-1">{itemText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {t("featureSuggestionDesc")}
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px] cursor-pointer"
          >
            {t("closeModal")}
          </button>
        </div>
      </div>
    </div>
  );
}
