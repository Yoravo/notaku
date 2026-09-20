"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  DocumentDuplicateIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { openChangelogModal } from "@/components/changelog-modal";
import { useTranslations } from "next-intl";

interface NavbarProps {
  session: any;
}

export function LandingNavbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tTools = useTranslations("tools");
  const moreRef = useRef<HTMLDivElement>(null);

  // Primary in-page anchors (homepage sections only)
  const anchorLinks = [
    { name: tNav("features"), href: "/#fitur", hash: "fitur" },
    { name: tNav("howItWorks"), href: "/#cara-kerja", hash: "cara-kerja" },
    { name: tNav("pricing"), href: "/#pricing", hash: "pricing" },
    { name: tNav("faq"), href: "/#faq", hash: "faq" },
  ];

  // Secondary items grouped under the "More" dropdown.
  // Routes navigate; changelog opens a modal (action: "changelog").
  const moreItems = [
    {
      name: tTools("allTools"),
      desc: tTools("allToolsNavDesc"),
      href: "/tools",
      matchPattern: "/tools",
      icon: Squares2X2Icon,
      action: "route" as const,
    },
    {
      name: tTools("templates"),
      desc: tTools("templatesNavDesc"),
      href: "/templates",
      matchPattern: "/templates",
      icon: DocumentDuplicateIcon,
      action: "route" as const,
    },
    {
      name: tNav("changelog"),
      desc: tNav("changelogNavDesc"),
      href: "#changelog",
      matchPattern: "",
      icon: SparklesIcon,
      action: "changelog" as const,
    },
  ];

  const isMoreActive = moreItems.some(
    (item) => item.matchPattern && pathname.startsWith(item.matchPattern)
  );

  // Scroll spy & hash change observer for in-page anchors on home page
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const updateActiveHashFromScroll = () => {
      const sectionIds = ["fitur", "cara-kerja", "pricing", "faq"];
      const scrollPos = window.scrollY + 120;

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

      if (window.scrollY < 200) {
        setActiveHash("");
      }
    };

    const handleLocationChange = () => {
      const rawHash = window.location.hash;
      if (rawHash === "#changelog") return; // handled by ChangelogModal
      if (rawHash.includes("#")) {
        const parts = rawHash.split("#").filter(Boolean);
        const latestHash = parts[parts.length - 1];
        if (parts.length > 1) {
          window.history.replaceState(null, "", `/#${latestHash}`);
        }
        setActiveHash(latestHash || "");
      } else {
        updateActiveHashFromScroll();
      }
    };

    window.addEventListener("scroll", updateActiveHashFromScroll, { passive: true });
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    handleLocationChange();

    return () => {
      window.removeEventListener("scroll", updateActiveHashFromScroll);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [pathname]);

  // Close the "More" dropdown on outside click / Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
    if (hash && pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      window.history.pushState(null, "", `/#${hash}`);
      setActiveHash(hash);
    }
  };

  const handleMoreItemClick = (
    e: React.MouseEvent,
    item: (typeof moreItems)[0]
  ) => {
    setMoreOpen(false);
    setMobileMenuOpen(false);
    if (item.action === "changelog") {
      e.preventDefault();
      openChangelogModal();
    }
  };

  const isAnchorActive = (hash: string) =>
    pathname === "/" && !!hash && activeHash === hash;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-paper/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 py-3.5">
        {/* Left: Brand Logo */}
        <div className="flex items-center md:flex-1 justify-start">
          <Link
            href="/"
            prefetch={true}
            onClick={(e) => {
              if (pathname === "/" && window.location.hash) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                window.history.pushState(null, "", "/");
                setActiveHash("");
              }
            }}
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

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center justify-center gap-5 lg:gap-7 md:flex shrink-0">
          {anchorLinks.map((item) => {
            const active = isAnchorActive(item.hash);
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={(e) => handleAnchorClick(e, item.hash)}
                className={`text-sm font-medium transition-all relative py-1 whitespace-nowrap ${
                  active ? "text-emerald font-bold" : "text-ink-soft hover:text-emerald"
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald rounded-full animate-in fade-in zoom-in duration-200" />
                )}
              </Link>
            );
          })}

          {/* "More" Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1 text-sm font-medium transition-all py-1 cursor-pointer ${
                moreOpen || isMoreActive
                  ? "text-emerald font-bold"
                  : "text-ink-soft hover:text-emerald"
              }`}
            >
              {tNav("more")}
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-line bg-paper p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                {moreItems.map((item) => {
                  const active = item.matchPattern && pathname.startsWith(item.matchPattern);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={item.action === "route"}
                      onClick={(e) => handleMoreItemClick(e, item)}
                      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        active
                          ? "bg-emerald/10 text-emerald"
                          : "text-ink hover:bg-line/60"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-emerald/15 text-emerald"
                            : "bg-line/60 text-ink-soft"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight">
                          {item.name}
                        </span>
                        <span className="block text-xs text-ink-soft leading-snug mt-0.5">
                          {item.desc}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right: Auth / Theme / Language + Mobile Hamburger */}
        <div className="flex items-center justify-end md:flex-1 gap-2.5">
          <div className="hidden items-center gap-2 lg:gap-2.5 md:flex">
            <ThemeToggle />
            <LanguageSwitcher />

            {session ? (
              <Link
                href="/dashboard"
                prefetch={true}
                className="inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-emerald hover:text-white min-h-[38px] cursor-pointer shadow-2xs"
              >
                {tNav("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={true}
                  className="text-sm font-medium text-ink-soft transition-colors hover:text-ink px-2.5 py-2 min-h-[38px] inline-flex items-center"
                >
                  {tNav("login")}
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald hover:bg-emerald-bright px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:shadow-md hover:shadow-emerald/25 min-h-[38px] cursor-pointer"
                >
                  {tNav("register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-ink shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-line bg-paper px-6 py-5 shadow-lg animate-in slide-in-from-top-2 md:hidden">
          <div className="flex flex-col gap-2">
            {/* Primary anchors */}
            {anchorLinks.map((item) => {
              const active = isAnchorActive(item.hash);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => handleAnchorClick(e, item.hash)}
                  className={`text-base font-medium transition-colors min-h-[44px] flex items-center justify-between py-2 px-1 ${
                    active ? "text-emerald font-bold" : "text-ink-soft hover:text-emerald"
                  }`}
                >
                  <span>{item.name}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-emerald" />}
                </Link>
              );
            })}

            {/* Secondary group */}
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft/70 mt-3 mb-1 px-1">
              {tNav("more")}
            </p>
            {moreItems.map((item) => {
              const active = item.matchPattern && pathname.startsWith(item.matchPattern);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={item.action === "route"}
                  onClick={(e) => handleMoreItemClick(e, item)}
                  className={`flex items-center gap-3 min-h-[44px] py-2 px-1 transition-colors ${
                    active ? "text-emerald font-bold" : "text-ink-soft hover:text-emerald"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              );
            })}

            <hr className="border-line my-2" />
            {session ? (
              <Link
                href="/dashboard"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full min-h-[44px] rounded-xl bg-ink py-2.5 text-center text-sm font-semibold text-paper hover:bg-emerald hover:text-white transition-colors"
              >
                {tNav("dashboard")}
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full min-h-[44px] rounded-xl border border-line bg-paper-deep/60 py-2.5 text-center text-sm font-semibold text-ink hover:bg-line transition-colors"
                >
                  {tNav("login")}
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full min-h-[44px] rounded-xl bg-emerald py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-bright transition-colors shadow-xs"
                >
                  {tNav("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
