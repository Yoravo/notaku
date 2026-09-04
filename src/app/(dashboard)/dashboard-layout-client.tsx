"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LanguageDropdown } from "@/components/language-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/i18n/context";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

export function DashboardLayoutClient({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  // Mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop collapse state (default: show/expanded)
  const [desktopOpen, setDesktopOpen] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed overlay mobile, relative desktop with collapse transition */}
      <Sidebar
        user={user}
        className={`
          fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out shrink-0
          md:relative md:z-auto
          ${
            sidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full md:translate-x-0"
          }
          ${desktopOpen ? "md:w-64" : "md:w-0 md:border-r-0 md:overflow-hidden"}
        `}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        {/* Top Header Bar (Desktop & Mobile) */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5">
            {/* Desktop 3-Bar Toggle Button */}
            <button
              onClick={() => setDesktopOpen(!desktopOpen)}
              className="hidden md:inline-flex items-center justify-center rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              aria-label="Toggle Sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white cursor-pointer"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Brand indicator when Desktop Sidebar is closed */}
            {!desktopOpen && (
              <Link
                href="/"
                className="hidden md:flex items-center gap-1.5 text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white transition-opacity hover:opacity-80 ml-1"
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
                </span>
              </Link>
            )}

            {/* Mobile Brand */}
            <Link
              href="/"
              className="md:hidden flex items-center gap-1.5 text-lg font-bold font-display tracking-tight text-slate-900 dark:text-white transition-opacity hover:opacity-80"
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
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle (Light / Dark / System) */}
            <ThemeToggle />

            {/* Unified Language Switcher Dropdown */}
            <LanguageDropdown variant="light" />

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              aria-label={t.dashboard?.logout || "Keluar"}
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 text-gray-400 dark:text-slate-400" />
              <span className="hidden sm:inline">{t.dashboard?.logout || "Keluar"}</span>
            </button>
          </div>
        </header>

        {/* Content Area: Overflow-y, mobile-first padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
