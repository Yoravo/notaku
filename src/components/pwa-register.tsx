"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

// Registers the PWA service worker in production and presents a non-intrusive
// update toast whenever a newer worker has been installed and is waiting.
export function PWARegister() {
  const t = useTranslations("pwaUpdate");
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let removeFocusListener: (() => void) | undefined;

    const setupRegistration = (reg: ServiceWorkerRegistration) => {
      // 1. If an update is already waiting from a previous session, show toast.
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setShowToast(true);
      }

      // 2. Listen for newly downloaded updates.
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowToast(true);
          }
        });
      });

      // 3. Proactively check for newer SW on window focus.
      const onFocus = () => {
        reg.update().catch(() => {
          // Network errors during background check are non-fatal.
        });
      };
      window.addEventListener("focus", onFocus);
      removeFocusListener = () => window.removeEventListener("focus", onFocus);
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => setupRegistration(reg))
        .catch(() => {
          // Registration failure is non-fatal; app still works online.
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
    }

    return () => {
      window.removeEventListener("load", register);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (removeFocusListener) removeFocusListener();
    };
  }, []);

  const handleReload = () => {
    setIsReloading(true);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  if (!showToast) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md pointer-events-auto">
      <aside
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 flex items-start gap-3 sm:gap-3.5 ring-1 ring-black/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f] dark:bg-emerald-950/60 dark:text-emerald-400">
          <ArrowPathIcon
            aria-hidden="true"
            className={`h-5 w-5 ${isReloading ? "animate-spin" : ""}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("desc")}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={isReloading}
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-[#0f6b4f] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#0c553e] active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <ArrowPathIcon
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${isReloading ? "animate-spin" : ""}`}
              />
              <span>{isReloading ? t("reloading") : t("reload")}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="inline-flex min-h-[38px] items-center justify-center rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              {t("dismiss")}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowToast(false)}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer -mr-2 -mt-2 focus-visible:outline-2 focus-visible:outline-emerald-600"
          aria-label={t("dismiss")}
        >
          <XMarkIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </aside>
    </div>
  );
}
