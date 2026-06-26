"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  RectangleGroupIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

type User = {
  name: string;
  email: string;
  image?: string | null;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: RectangleGroupIcon },
  { href: "/invoices", label: "Invoice", icon: DocumentTextIcon },
  { href: "/customers", label: "Pelanggan", icon: UsersIcon },
  { href: "/settings", label: "Pengaturan", icon: Cog6ToothIcon },
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
      className={`flex w-64 flex-col border-r border-gray-200 bg-white ${className}`}
    >
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-gray-200 px-5">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="NotaKu"
            width={200}
            height={72}
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium
  text-blue-700"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-3 w-full rounded-md px-3 py-1.5 text-left text-sm text-gray-600 cursor-pointer
  hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
