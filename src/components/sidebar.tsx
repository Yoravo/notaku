"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  RectangleGroupIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  XMarkIcon,
  BanknotesIcon,
  SparklesIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

type User = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  plan?: string | null;
};

export function Sidebar({
  user,
  className = "",
  onClose,
}: {
  user: User;
  className?: string;
  onClose?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useLanguage();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  const mainNavItems = [
    {
      href: "/dashboard",
      label: t.dashboard?.overview || "Dashboard",
      icon: RectangleGroupIcon,
      exact: true,
    },
    {
      href: "/invoices",
      label: t.dashboard?.invoices || "Invoice & Tagihan",
      icon: DocumentTextIcon,
    },
    {
      href: "/recurring-invoices",
      label: t.dashboard?.recurringInvoices || (locale === "id" ? "Invoice Berulang" : "Recurring Invoices"),
      icon: ArrowPathIcon,
    },
    {
      href: "/tax-reports",
      label: locale === "id" ? "Rekap Pajak & Omset" : "Tax & Turnover",
      icon: DocumentChartBarIcon,
    },
    {
      href: "/customers",
      label: t.dashboard?.customers || "Pelanggan",
      icon: UsersIcon,
    },
    {
      href: "/wallet",
      label: t.dashboard?.wallet || "Saldo & Penarikan",
      icon: BanknotesIcon,
    },
    {
      href: "/referrals",
      label: locale === "id" ? "Program Referral" : "Referrals & Affiliate",
      icon: GiftIcon,
    },
  ];

  const secondaryNavItems = [
    {
      href: "/billing",
      label: locale === "id" ? "Paket & Kuota" : "Billing & Plan",
      icon: SparklesIcon,
    },
    {
      href: "/settings",
      label: t.dashboard?.settings || "Pengaturan Akun",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200 ${className}`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 shrink-0">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-opacity hover:opacity-80 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Image
            src="/logo.png"
            alt="NotaKu Logo"
            width={30}
            height={30}
            className="w-7 h-7 object-contain shrink-0"
          />
          <span>
            <span>Nota</span>
            <span className="text-[#0f6b4f] dark:text-emerald-400">Ku</span>
          </span>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
        {/* Main Business Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 whitespace-nowrap">
            {locale === "id" ? "Menu Utama" : "Main Menu"}
          </p>
          {mainNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/15 text-[#0f6b4f] dark:text-emerald-400 font-bold shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-[#0f6b4f] dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Settings & Secondary Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 whitespace-nowrap">
            {locale === "id" ? "Pengaturan" : "Preferences"}
          </p>
          {secondaryNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/15 text-[#0f6b4f] dark:text-emerald-400 font-bold shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-[#0f6b4f] dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Navigation (Role: ADMIN only) */}
        {user.role === "ADMIN" && (
          <div className="space-y-1 border-t border-slate-200/80 dark:border-slate-800 pt-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 whitespace-nowrap">
              Admin & Analytics
            </p>
            <Link
              href="/admin"
              prefetch={true}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                pathname.startsWith("/admin")
                  ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300"
              }`}
            >
              <ShieldCheckIcon
                className={`h-5 w-5 shrink-0 ${
                  pathname.startsWith("/admin")
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span className="truncate">{t.dashboard?.adminPanel || "Admin Panel"}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile & Plan Badge Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 shrink-0">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200/60 dark:border-slate-700">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 text-xs uppercase">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.name || "User"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                    user.plan === "PRO"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {user.plan === "PRO" ? "PRO" : "FREE"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer shrink-0"
            title={t.dashboard?.logout || (locale === "id" ? "Keluar Akun" : "Sign Out")}
            aria-label="Keluar Akun"
          >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
