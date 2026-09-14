"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  BuildingOffice2Icon,
  BuildingLibraryIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface OnboardingChecklistProps {
  hasBusinessName: boolean;
  hasBankAccount: boolean;
  hasCustomers: boolean;
  hasInvoices: boolean;
  userId: string;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function OnboardingChecklist({
  hasBusinessName,
  hasBankAccount,
  hasCustomers,
  hasInvoices,
  userId,
}: OnboardingChecklistProps) {
  const t = useTranslations("dashboard.onboarding");
  const storageKey = `notaku_onboarding_dismissed_${userId}`;
  const [dismissedUserId, setDismissedUserId] = useState<string | null>(null);
  const storedDismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    },
    () => true,
  );

  const steps = [
    { done: hasBusinessName, label: t("step1"), desc: t("step1Desc"), href: "/settings", icon: BuildingOffice2Icon },
    { done: hasBankAccount, label: t("step2"), desc: t("step2Desc"), href: "/settings?tab=bank", icon: BuildingLibraryIcon },
    { done: hasCustomers, label: t("step3"), desc: t("step3Desc"), href: "/customers", icon: UserGroupIcon },
    { done: hasInvoices, label: t("step4"), desc: t("step4Desc"), href: "/invoices/new", icon: DocumentPlusIcon },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const percent = (doneCount / steps.length) * 100;

  if (storedDismissed || dismissedUserId === userId || doneCount === steps.length) return null;

  function handleDismiss() {
    setDismissedUserId(userId);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // ponytail: blocked storage keeps dismissal only until this component unmounts.
    }
  }

  return (
    <section
      className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-5"
      aria-labelledby="onboarding-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="onboarding-title" className="text-base font-bold tracking-tight text-slate-900">
            {t.rich("title", {
              ku: (chunks) => <span className="text-[#0f6b4f] dark:text-emerald-400">{chunks}</span>,
            })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:hover:bg-emerald-900 dark:focus-visible:outline-emerald-400"
          aria-label={t("dismiss")}
          type="button"
        >
          <XMarkIcon aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4">
        <p id="onboarding-progress" className="mb-2 text-sm font-semibold text-slate-700">
          {t("progressText", { percent, done: doneCount, total: steps.length })}
        </p>
        <div
          role="progressbar"
          aria-labelledby="onboarding-progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900"
        >
          <div className="h-full rounded-full bg-[#0f6b4f] dark:bg-emerald-400" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.done ? CheckCircleIcon : step.icon;
          return (
            <li key={step.href} className="min-w-0">
              <Link
                href={step.href}
                prefetch={true}
                className="group flex h-full min-h-11 items-center gap-3 rounded-xl bg-white/80 p-3 transition-colors hover:bg-emerald-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transition-none dark:bg-slate-900/80 dark:hover:bg-emerald-900/50 dark:focus-visible:outline-emerald-400"
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0f6b4f] dark:text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-slate-900">{step.label}</span>
                  <p className="mt-0.5 text-xs text-slate-600">{step.done ? t("completed") : step.desc}</p>
                </div>
                {!step.done && <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-600" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
