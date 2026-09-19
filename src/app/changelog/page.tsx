import type { Metadata } from "next";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import {
  APP_VERSION,
  CHANGELOG_RELEASES,
  type ChangelogCategory,
  type ReleaseSemverType,
} from "@/lib/changelog";
import {
  SparklesIcon,
  TagIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isEn = locale === "en";

  return {
    title: isEn
      ? "Release Notes & Version History (Changelog) · NotaKu"
      : "Catatan Rilis & Riwayat Versi (Changelog) · NotaKu",
    description: isEn
      ? "Version history, new features, performance improvements, and development updates of the NotaKu platform."
      : "Riwayat pembaruan, rilis fitur baru, peningkatan performa, dan catatan pengembangan platform NotaKu dari waktu ke waktu.",
    alternates: {
      canonical: `${baseUrl}/changelog`,
    },
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "id_ID",
      url: `${baseUrl}/changelog`,
      title: isEn
        ? "Release Notes & Version History · NotaKu"
        : "Catatan Rilis & Riwayat Versi · NotaKu",
      description: isEn
        ? "Follow all product updates, feature rollouts, and platform enhancements across NotaKu."
        : "Ikuti seluruh pembaruan fitur, perbaikan sistem, dan perkembangan platform invoice online NotaKu.",
      siteName: "NotaKu",
    },
  };
}

export default async function ChangelogPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const locale = await getLocale();
  const t = await getTranslations("changelog");
  const isEn = locale === "en";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Public Navbar */}
      <LandingNavbar session={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0f6b4f] dark:hover:text-emerald-400 transition-colors min-h-[44px]"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t("backHome")}</span>
          </Link>
        </div>

        {/* Header Title Banner */}
        <header className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-[#0f6b4f] dark:text-emerald-400 text-xs font-bold mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0f6b4f] dark:bg-emerald-400 animate-pulse" />
            <span>
              {t("badgeActive")}: v{APP_VERSION}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {t("desc")}
          </p>
        </header>

        {/* Timeline List */}
        <section className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-12">
          {CHANGELOG_RELEASES.map((release) => {
            const releaseTitle = isEn ? release.title.en : release.title.id;
            const releaseSummary = isEn ? release.summary.en : release.summary.id;
            const releaseDate = isEn ? release.date.en : release.date.id;

            return (
              <article
                key={release.version}
                id={`v${release.version}`}
                className="relative group scroll-mt-24"
              >
                {/* Timeline Dot Indicator */}
                <span
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                    release.isLatest
                      ? "bg-[#0f6b4f] border-emerald-200 dark:border-emerald-500 ring-4 ring-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                  }`}
                  aria-hidden="true"
                />

                {/* Release Card */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  {/* Version & Date Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        v{release.version}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase border ${
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
                    <time className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {releaseDate}
                    </time>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {releaseTitle}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {releaseSummary}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    {release.highlights.map((item, idx) => {
                      const cat = categoryConfig[item.category] || categoryConfig.feat;
                      const Icon = cat.icon;
                      const itemText = isEn ? item.text.en : item.text.id;

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                        >
                          <span
                            className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${cat.badge}`}
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
        </section>

        {/* CTA Box */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("featureSuggestionTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t("featureSuggestionDesc")}
            </p>
          </div>
          <Link
            href="/dashboard"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] text-white text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 min-h-[44px]"
          >
            <span>{t("openApp")}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Public Footer */}
      <LandingFooter />
    </div>
  );
}
