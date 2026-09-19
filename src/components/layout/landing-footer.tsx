"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { APP_VERSION } from "@/lib/changelog";

export function LandingFooter() {
  const pathname = usePathname();
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tTools = useTranslations("tools");

  const handleFooterHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      window.history.pushState(null, "", `/#${hash}`);
    }
  };

  return (
    <footer className="border-t border-line bg-paper py-14 sm:py-16 text-ink">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand & Description Column */}
          <div className="md:col-span-4 space-y-3">
            <Link
              href="/"
              prefetch={true}
              className="font-sans text-2xl font-bold tracking-tight text-ink inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
            >
              <Image
                src="/logo.png"
                alt="NotaKu Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain shrink-0"
              />
              <span>
                <span>Nota</span>
                <span className="text-emerald">Ku</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed max-w-sm">
              {tFooter("desc")}
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald" />
              <span>{tFooter("paymentSupport")}</span>
            </div>
          </div>

          {/* Tools Hub Column */}
          <div className="md:col-span-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {tTools("allTools")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <Link
                href="/buat-invoice"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("freeInvoice")}
              </Link>
              <Link
                href="/buat-kuitansi"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("freeReceipt")}
              </Link>
              <Link
                href="/buat-surat-jalan"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("freeDeliveryOrder")}
              </Link>
              <Link
                href="/kalkulator-ppn"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("ppnCalculator")}
              </Link>
              <Link
                href="/kalkulator-pph23"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("pph23Calculator")}
              </Link>
              <Link
                href="/terbilang-rupiah"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("terbilangRupiah")}
              </Link>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {tNav("features")}
            </p>
            <div className="flex flex-col gap-1">
              <Link
                href="/templates"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("templates")}
              </Link>
              <Link
                href="/tools"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tTools("allTools")}
              </Link>
              <a
                href="/#cara-kerja"
                onClick={(e) => handleFooterHashClick(e, "cara-kerja")}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tNav("howItWorks")}
              </a>
              <a
                href="/#pricing"
                onClick={(e) => handleFooterHashClick(e, "pricing")}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tNav("pricing")}
              </a>
              <Link
                href="/changelog"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-medium text-ink-soft hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tNav("changelog")}
              </Link>
              <Link
                href="/login"
                prefetch={true}
                className="inline-flex items-center min-h-[44px] py-2 text-xs sm:text-sm font-bold text-ink hover:text-emerald transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
              >
                {tNav("login")} &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft font-medium">
          <span>{tFooter("copyright")}</span>
          <div className="flex items-center gap-3">
            <Link
              href="/changelog"
              prefetch={true}
              className="font-mono text-slate-400 hover:text-emerald transition-colors"
              title="Catatan rilis"
            >
              v{APP_VERSION}
            </Link>
            <span className="text-slate-400">Jakarta, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
