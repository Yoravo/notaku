"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  CpuChipIcon,
  BanknotesIcon,
  GiftIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/i18n/context";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

export function AdminLayoutClient({
  adminUser,
  children,
}: {
  adminUser: AdminUser;
  children: React.ReactNode;
}) {
  // Mobile drawer state (default: hidden)
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop sidebar collapse state (default: show/expanded)
  const [desktopOpen, setDesktopOpen] = useState(true);
  const pathname = usePathname();
  const { t, locale } = useLanguage();

  const adminNavItems = [
    { href: "/admin", label: t.admin?.overview || "Overview & Trafik", icon: ChartBarIcon, exact: true },
    { href: "/admin/users", label: t.admin?.users || "Manajemen User", icon: UsersIcon },
    { href: "/admin/invoices", label: t.admin?.invoices || "Semua Invoices", icon: DocumentTextIcon },
    { href: "/admin/payouts", label: t.admin?.payouts || "Pencairan Dana", icon: BanknotesIcon },
    { href: "/admin/finance", label: t.admin?.finance || "Laporan Finansial", icon: ChartBarIcon },
    { href: "/admin/promos", label: t.admin?.promos || "Voucher & Promo", icon: TagIcon },
    { href: "/admin/broadcast", label: locale === "id" ? "Email Broadcast" : "Email Broadcast", icon: EnvelopeIcon },
    { href: "/admin/referrals", label: locale === "id" ? "Program Afiliasi" : "Affiliates & Referrals", icon: GiftIcon },
    { href: "/admin/announcement", label: t.admin?.announcement || "Pengumuman", icon: MegaphoneIcon },
    { href: "/admin/logs", label: t.admin?.logs || "Audit Logs", icon: ClipboardDocumentListIcon },
    { href: "/admin/system", label: t.admin?.system || "System Health", icon: CpuChipIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0
          md:relative md:z-auto
          ${
            mobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0"
          }
          ${desktopOpen ? "md:w-64" : "md:w-0 md:border-r-0 md:overflow-hidden"}
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80 overflow-hidden"
          >
            <Image
              src="/logo.png"
              alt="NotaKu Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain shrink-0"
            />
            <span className="font-display text-2xl font-bold tracking-tight text-white flex items-center whitespace-nowrap">
              <span>Nota</span>
              <span className="text-emerald-400">Ku</span>
              <span className="ml-2 rounded-md bg-rose-500/20 text-rose-400 text-xs font-semibold px-2 py-0.5 border border-rose-500/30 font-sans flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                ADMIN
              </span>
            </span>
          </Link>

          {/* Close button on Mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 whitespace-nowrap">
            {locale === "id" ? "Menu Utama" : "Main Menu"}
          </p>
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin info & back button */}
        <div className="border-t border-slate-800 p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold flex items-center justify-center text-xs shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">
                {adminUser.name || "Admin"}
              </p>
              <p className="truncate text-[11px] text-slate-400 font-mono">
                {adminUser.email}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4 text-slate-400" />
            <span>{t.admin?.backToUserApp || "Kembali ke App User"}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100">
        {/* Top Navbar Header with Sidebar Toggle (Both Desktop & Mobile) */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Desktop Toggle Button (Icon 3 baris konsisten) */}
            <button
              onClick={() => setDesktopOpen(!desktopOpen)}
              className="hidden md:inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              aria-label="Toggle Desktop Sidebar"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Buka menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Brand indicator if desktop sidebar is closed */}
            {!desktopOpen && (
              <Link
                href="/"
                className="hidden md:flex items-center gap-1.5 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-opacity hover:opacity-80 ml-1"
              >
                <Image
                  src="/logo.png"
                  alt="NotaKu Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain shrink-0"
                />
                <span>
                  <span>Nota</span>
                  <span className="text-[#0f6b4f] dark:text-emerald-400">Ku</span>
                  <span className="text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 px-1.5 py-0.5 rounded font-sans font-bold ml-1">
                    ADMIN
                  </span>
                </span>
              </Link>
            )}

            {/* Mobile Brand */}
            <Link
              href="/"
              className="md:hidden font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5"
            >
              <Image
                src="/logo.png"
                alt="NotaKu Logo"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>
                <span>Nota</span>
                <span className="text-[#0f6b4f] dark:text-emerald-400">Ku</span>
                <span className="text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 px-1.5 py-0.2 rounded font-sans font-bold ml-1">
                  ADMIN
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle (Light / Dark / System) */}
            <ThemeToggle />

            {/* Global Language Switcher */}
            <LanguageDropdown variant="light" />

            <div className="text-right hidden md:block">
              <span className="text-xs text-slate-400">Logged in as: </span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
                {adminUser.email}
              </span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">{t.admin?.backToUserApp || "Ke App User"}</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
