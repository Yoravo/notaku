"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  ShareIcon,
  PlusSmallIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

// Minimal type for the non-standard `beforeinstallprompt` event (Chromium only).
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function dismissKey(userId: string): string {
  return `notaku_pwa_install_dismissed_${userId}`;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes standalone on navigator, not matchMedia.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

function isIOSSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  try {
    const ua = navigator.userAgent || "";
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ reports as Mac; disambiguate via touch points.
      (ua.includes("Macintosh") && "ontouchend" in document);
    const webkit = /WebKit/.test(ua);
    const notOtherBrowser = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    return iOS && webkit && notOtherBrowser;
  } catch {
    return false;
  }
}

export function PWAInstallBanner({ userId }: { userId: string }) {
  const t = useTranslations("dashboard.pwaInstall");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [iosExpanded, setIosExpanded] = useState(false);

  useEffect(() => {
    // Already installed or previously dismissed -> never show.
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(dismissKey(userId)) === "1") return;
    } catch {
      // storage blocked; proceed to show the banner (harmless).
    }

    // Android / Chromium: capture the deferred prompt.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Once installed, hide immediately and remember it.
    const onInstalled = () => {
      setVisible(false);
      try {
        localStorage.setItem(dismissKey(userId), "1");
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt -> show manual guide banner.
    if (isIOSSafari()) {
      setShowIOSGuide(true);
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [userId]);

  function persistDismiss() {
    try {
      localStorage.setItem(dismissKey(userId), "1");
    } catch {
      // ponytail: blocked storage -> banner reappears next visit. Acceptable.
    }
  }

  function handleDismiss() {
    setVisible(false);
    persistDismiss();
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        persistDismiss();
      }
    } catch {
      // Prompt failed/unavailable; leave banner so user can retry.
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
      setVisible(false);
    }
  }

  if (!visible) return null;

  const brand = (chunks: React.ReactNode) => (
    <span className="text-[#0f6b4f] dark:text-emerald-400">{chunks}</span>
  );

  return (
    <section
      className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-5"
      aria-labelledby="pwa-install-title"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs ring-1 ring-emerald-200 dark:bg-slate-900 dark:ring-emerald-800">
          <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="pwa-install-title"
            className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {t.rich("title", { ku: brand })}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {showIOSGuide ? t.rich("descIOS", { ku: brand }) : t("descAndroid")}
          </p>

          {/* Android / Chromium: one-tap native install */}
          {!showIOSGuide && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing || !deferredPrompt}
              className="mt-3 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:focus-visible:outline-emerald-400 cursor-pointer"
            >
              <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
              {installing ? t("installing") : t("installButton")}
            </button>
          )}

          {/* iOS Safari: manual Add-to-Home-Screen instructions */}
          {showIOSGuide && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setIosExpanded((v) => !v)}
                aria-expanded={iosExpanded}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-[#0f6b4f] transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-900/50 dark:focus-visible:outline-emerald-400 cursor-pointer"
              >
                <ShareIcon aria-hidden="true" className="h-4 w-4" />
                {t("howToInstallIOS")}
              </button>

              {iosExpanded && (
                <ol className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {[
                    { icon: ShareIcon, text: t("iosStep1") },
                    { icon: PlusSmallIcon, text: t("iosStep2") },
                    { icon: null, text: t("iosStep3") },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-[#0f6b4f] dark:bg-emerald-900/60 dark:text-emerald-400">
                          {i + 1}
                        </span>
                        <span className="flex items-center gap-1.5 leading-relaxed">
                          {step.text}
                          {Icon && <Icon aria-hidden="true" className="inline h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-emerald-100 dark:text-slate-400 dark:hover:bg-emerald-900/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:focus-visible:outline-emerald-400 cursor-pointer"
          aria-label={t("close")}
        >
          <XMarkIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
