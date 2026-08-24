"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

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

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
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
      <main className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top Header Bar (Desktop & Mobile) */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Desktop 3-Bar / Chevron Toggle Button */}
            <button
              onClick={() => setDesktopOpen(!desktopOpen)}
              className="hidden md:inline-flex items-center justify-center rounded-md p-1.5 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              title={desktopOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
              aria-label="Toggle Sidebar"
            >
              {desktopOpen ? (
                <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-900" />
              )}
            </button>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 transition-colors text-gray-900 cursor-pointer"
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
                className="hidden md:flex items-center text-lg font-bold font-display tracking-tight text-gray-900 transition-opacity hover:opacity-80 ml-1"
              >
                <span>Nota</span>
                <span className="text-[#0f6b4f]">Ku</span>
              </Link>
            )}

            {/* Mobile Brand */}
            <Link
              href="/"
              className="md:hidden text-lg font-bold font-display tracking-tight text-gray-900 transition-opacity hover:opacity-80"
            >
              <span>Nota</span>
              <span className="text-[#0f6b4f]">Ku</span>
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
            aria-label="Keluar"
          >
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </header>

        {/* Content Area: Overflow-y, mobile-first padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
