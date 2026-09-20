import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

export default async function GlobalNotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between text-ink font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-line/60 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 lg:px-8 py-3.5">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-1.5 text-2xl font-bold tracking-tight text-ink transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              alt="NotaKu Logo"
              width={34}
              height={34}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
              priority
            />
            <span>
              <span>Nota</span>
              <span className="text-emerald">Ku</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="max-w-md w-full text-center space-y-6">
          {/* 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#0f6b4f] dark:text-emerald-400 text-xs font-bold font-mono shadow-2xs">
            <span>ERROR 404</span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
              {t("desc")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald hover:bg-emerald-bright px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:shadow-md hover:shadow-emerald/25 min-h-[44px] cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>{t("backToHome")}</span>
            </Link>

            <Link
              href="/tools"
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper-deep/60 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-line transition-colors min-h-[44px] cursor-pointer"
            >
              <WrenchScrewdriverIcon className="w-4 h-4 text-ink-soft" />
              <span>{t("browseTools")}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="border-t border-line/60 py-6 text-center text-xs text-ink-soft">
        <p>© 2026 NotaKu. Hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
