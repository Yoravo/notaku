"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export function DashboardLayoutClient({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed overlay mobile, relative desktop */}
      <Sidebar
        user={user}
        className={`
          fixed left-0 top-0 z-50 h-screen transition-transform duration-300
          md:relative md:translate-x-0 md:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header: Hamburger + Title + Logout */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-900" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-900" />
              )}
            </button>
            <h1 className="text-base font-semibold text-gray-900">NotaKu</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            aria-label="Keluar"
          >
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>

        {/* Content Area: Overflow-y, mobile-first padding */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
