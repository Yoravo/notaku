"use client";

import Link from "next/link";
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
      href: "/customers",
      label: t.dashboard?.customers || "Pelanggan",
      icon: UsersIcon,
    },
    {
      href: "/wallet",
      label: t.dashboard?.wallet || "Saldo & Penarikan",
      icon: BanknotesIcon,
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
      className={`flex flex-col border-r border-slate-200 bg-white ${className}`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-5 shrink-0">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80 flex items-center whitespace-nowrap"
        >
          <span>Nota</span>
          <span className="text-[#0f6b4f]">Ku</span>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 whitespace-nowrap">
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
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] font-bold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Preferences & Subscription Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 whitespace-nowrap">
            {locale === "id" ? "Akun & Layanan" : "Account & Plan"}
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
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] font-bold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user.role === "ADMIN" && (
            <div className="pt-2">
              <Link
                href="/admin"
                prefetch={true}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  pathname.startsWith("/admin")
                    ? "bg-rose-50 text-rose-700 font-bold border border-rose-200 shadow-2xs"
                    : "text-rose-600 hover:bg-rose-50"
                }`}
              >
                <ShieldCheckIcon className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{t.dashboard?.adminPanel || "Admin Panel"}</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* User info & Signout section */}
      <div className="border-t border-slate-200 p-4 space-y-3 shrink-0 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f6b4f]/15 text-xs font-bold text-[#0f6b4f] shrink-0 border border-[#0f6b4f]/20">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-bold text-slate-900">
              {user.name || "User"}
            </p>
            <p className="truncate text-[11px] text-slate-500 font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200 bg-white shadow-2xs"
        >
          <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>{t.dashboard?.logout || "Keluar dari Akun"}</span>
        </button>
      </div>
    </aside>
  );
}
