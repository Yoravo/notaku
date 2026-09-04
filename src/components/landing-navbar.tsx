"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/i18n/context";

interface NavbarProps {
  session: any;
}

export function LandingNavbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();
  const { t } = useLanguage();

  const navLinks = [
    { name: t.nav.features, href: "/#fitur", hash: "fitur", isRoute: false },
    { name: t.nav.howItWorks, href: "/#cara-kerja", hash: "cara-kerja", isRoute: false },
    { name: t.nav.pricing, href: "/#pricing", hash: "pricing", isRoute: false },
    { name: t.nav.faq, href: "/#faq", hash: "faq", isRoute: false },
    { name: t.nav.freeTools || "Tools Gratis", href: "/tools", hash: "", isRoute: true, matchPattern: "/tools" },
    { name: t.nav.templates || "Template", href: "/templates", hash: "", isRoute: true, matchPattern: "/templates" },
  ];

  // Scroll spy & hash change observer for in-page anchors on home page
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const updateActiveHashFromScroll = () => {
      const sectionIds = ["fitur", "cara-kerja", "pricing", "faq"];
      const scrollPos = window.scrollY + 120; // 120px offset for top header

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveHash(id);
            return;
          }
        }
      }

      // If scrolled near the top
      if (window.scrollY < 200) {
        setActiveHash("");
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveHash(hash);
      } else {
        updateActiveHashFromScroll();
      }
    };

    window.addEventListener("scroll", updateActiveHashFromScroll, { passive: true });
    window.addEventListener("hashchange", handleHashChange);

    // Initial check
    if (window.location.hash) {
      setActiveHash(window.location.hash.replace("#", ""));
    } else {
      updateActiveHashFromScroll();
    }

    return () => {
      window.removeEventListener("scroll", updateActiveHashFromScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  const isLinkActive = (item: (typeof navLinks)[0]) => {
    if (item.isRoute) {
      if (item.matchPattern) {
        return pathname.startsWith(item.matchPattern);
      }
      return pathname === item.href;
    }

    // Hash link on homepage
    if (pathname === "/" && item.hash) {
      return activeHash === item.hash;
    }

    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-paper/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo - NotaKu two-tone with logo emblem */}
        <Link
          href="/"
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

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:gap-8 md:flex">
          {navLinks.map((item) => {
            const active = isLinkActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                className={`text-sm font-medium transition-all relative py-1 ${
                  active
                    ? "text-emerald font-bold"
                    : "text-ink-soft hover:text-emerald"
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald rounded-full animate-in fade-in zoom-in duration-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons & Language Switcher & Theme */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
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

        {/* Mobile Controls (Theme + Language + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
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
          <div className="flex flex-col gap-3">
            {navLinks.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors py-1.5 flex items-center justify-between ${
                    active
                      ? "text-emerald font-bold"
                      : "text-ink-soft hover:text-emerald"
                  }`}
                >
                  <span>{item.name}</span>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-emerald" />
                  )}
                </Link>
              );
            })}
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
