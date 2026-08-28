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

type User = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  plan?: string | null;
};

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: RectangleGroupIcon, exact: true },
  { href: "/invoices", label: "Invoice & Tagihan", icon: DocumentTextIcon },
  { href: "/customers", label: "Pelanggan", icon: UsersIcon },
  { href: "/wallet", label: "Saldo & Penarikan", icon: BanknotesIcon },
];

const secondaryNavItems = [
  { href: "/billing", label: "Paket & Kuota", icon: SparklesIcon },
  { href: "/settings", label: "Pengaturan Akun", icon: Cog6ToothIcon },
];

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

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <aside
      className={`flex flex-col border-r border-gray-200 bg-white ${className}`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-5 shrink-0">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-gray-900 transition-opacity hover:opacity-80 flex items-center whitespace-nowrap"
        >
          <span>Nota</span>
          <span className="text-[#0f6b4f]">Ku</span>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
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
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 whitespace-nowrap">
            Menu Utama
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] font-bold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 whitespace-nowrap">
            Akun & Langganan
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] font-bold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname.startsWith("/admin")
                    ? "bg-rose-50 text-rose-700 font-bold border border-rose-200"
                    : "text-rose-600 hover:bg-rose-50"
                }`}
              >
                <ShieldCheckIcon className="h-4 w-4 shrink-0 text-rose-600" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* User info & Signout section */}
      <div className="border-t border-gray-200 p-4 space-y-3 shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f6b4f]/15 text-xs font-bold text-[#0f6b4f] shrink-0 border border-[#0f6b4f]/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-bold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-gray-500 font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 transition-colors cursor-pointer border border-gray-200/80 bg-white"
        >
          <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5 text-gray-500" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
