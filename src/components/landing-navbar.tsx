"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface NavbarProps {
  session: any;
}

export function LandingNavbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Fitur", href: "#fitur" },
    { name: "Cara Kerja", href: "#cara-kerja" },
    { name: "Harga", href: "#pricing" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/60 bg-paper/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight text-ink transition-transform hover:scale-[1.02]"
        >
          <span>Nota</span>
          <span className="text-emerald">Ku</span>
          <span className="ml-1 rounded-md bg-emerald/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald">
            ID
          </span>
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

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3.5 md:flex">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-all hover:bg-emerald hover:shadow-md hover:shadow-emerald/20"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink-soft transition-colors hover:text-ink px-2"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-paper shadow-sm transition-all hover:bg-emerald-bright hover:shadow-md hover:shadow-emerald/25"
              >
                Coba Gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
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
                className="block w-full rounded-full bg-ink py-2.5 text-center text-sm font-medium text-paper hover:bg-emerald transition-colors"
              >
                Buka Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-full border border-line bg-paper-deep py-2.5 text-center text-sm font-medium text-ink hover:bg-line transition-colors"
                >
                  Masuk ke Akun
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-full bg-emerald py-2.5 text-center text-sm font-semibold text-paper hover:bg-emerald-bright transition-colors shadow-sm"
                >
                  Daftar Akun Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
