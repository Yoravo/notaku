"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/lib/i18n/context";

interface NavbarProps {
  session: any;
}

export function LandingNavbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { name: t.nav.features, href: "/#fitur" },
    { name: t.nav.howItWorks, href: "/#cara-kerja" },
    { name: t.nav.freeTools || "Tools Gratis", href: "/tools" },
    { name: t.nav.templates || "Template", href: "/templates" },
    { name: t.nav.pricing, href: "/#pricing" },
    { name: t.nav.faq, href: "/#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-paper/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo - NotaKu two-tone standard without trailing bubble ID */}
        <Link
          href="/"
          className="flex items-center text-2xl font-bold tracking-tight text-ink transition-transform hover:scale-[1.02]"
        >
          <span>Nota</span>
          <span className="text-emerald">Ku</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-emerald"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons & Language Switcher */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />

          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition-all hover:bg-emerald hover:shadow-md hover:shadow-emerald/20"
            >
              {t.nav.dashboard}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink px-2"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-emerald-bright hover:shadow-md hover:shadow-emerald/25"
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls (Language + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-ink hover:bg-paper-deep transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-line bg-paper px-6 py-5 shadow-lg animate-in slide-in-from-top-2 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-ink-soft transition-colors hover:text-emerald py-1"
              >
                {item.name}
              </a>
            ))}
            <hr className="border-line my-1" />
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-paper hover:bg-emerald transition-colors"
              >
                {t.nav.dashboard}
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-full border border-line bg-paper-deep py-2.5 text-center text-sm font-medium text-ink hover:bg-line transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-full bg-emerald py-2.5 text-center text-sm font-semibold text-paper hover:bg-emerald-bright transition-colors shadow-sm"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
