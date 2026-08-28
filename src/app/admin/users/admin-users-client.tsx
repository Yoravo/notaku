"use client";

import Link from "next/link";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { UserRowActions } from "./user-row-actions";
import { useLanguage } from "@/lib/i18n/context";

export type AdminUserData = {
  id: string;
  name: string | null;
  email: string;
  businessName: string | null;
  plan: string;
  role: string;
  createdAt: string;
  emailVerified: boolean | null;
  invoiceCount: number;
  customerCount: number;
};

export type AdminUsersProps = {
  users: AdminUserData[];
  totalAllUsers: number;
  totalProUsers: number;
  totalFilteredUsers: number;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  planFilter: string;
  roleFilter: string;
  currentAdminId: string;
};

export function AdminUsersClient({
  users,
  totalAllUsers,
  totalProUsers,
  totalFilteredUsers,
  totalPages,
  currentPage,
  searchQuery,
  planFilter,
  roleFilter,
  currentAdminId,
}: AdminUsersProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span>
              {t.admin?.users || (locale === "id" ? "Manajemen Pengguna" : "User Management")}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {locale === "id"
              ? "Kelola akses, upgrade paket Pro secara manual, dan kelola otorisasi admin."
              : "Manage user access, manually assign Pro plans, and configure admin authorizations."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-28">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {locale === "id" ? "Total User" : "Total Users"}
            </p>
            <p className="text-lg font-extrabold text-slate-900 tabular-nums">
              {totalAllUsers.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl px-4 py-2.5 shadow-2xs text-center min-w-28">
            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
              {locale === "id" ? "User Pro" : "Pro Users"}
            </p>
            <p className="text-lg font-extrabold text-amber-800 tabular-nums">
              {totalProUsers.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={
                locale === "id"
                  ? "Cari nama, email, atau nama bisnis..."
                  : "Search name, email, or business name..."
              }
              className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Plan Filter */}
          <div className="sm:col-span-3">
            <select
              name="plan"
              defaultValue={planFilter}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-slate-50/50 focus:bg-white text-slate-700"
            >
              <option value="">{locale === "id" ? "Semua Paket (Plan)" : "All Plans"}</option>
              <option value="FREE">{locale === "id" ? "Hanya FREE" : "FREE Only"}</option>
              <option value="PRO">{locale === "id" ? "Hanya PRO" : "PRO Only"}</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-2">
            <select
              name="role"
              defaultValue={roleFilter}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-slate-50/50 focus:bg-white text-slate-700"
            >
              <option value="">{locale === "id" ? "Semua Role" : "All Roles"}</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full min-h-[42px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center py-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              {locale === "id" ? "Filter" : "Filter"}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">{locale === "id" ? "Pengguna" : "User"}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Status / Role" : "Status / Role"}</th>
                <th className="px-4 py-3.5 text-center">{locale === "id" ? "Invoices" : "Invoices"}</th>
                <th className="px-4 py-3.5 text-center">{locale === "id" ? "Pelanggan" : "Clients"}</th>
                <th className="px-4 py-3.5">{locale === "id" ? "Tgl Daftar" : "Joined Date"}</th>
                <th className="px-5 py-3.5 text-right">{locale === "id" ? "Aksi Admin" : "Admin Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-slate-400 text-xs font-medium"
                  >
                    {locale === "id"
                      ? "Tidak ditemukan pengguna yang sesuai dengan filter."
                      : "No users matched the current filter."}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminId;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase border border-slate-200 hover:border-slate-400 hover:bg-slate-200 transition-colors shadow-2xs"
                            title={locale === "id" ? "Lihat Detail Pengguna" : "View User Details"}
                          >
                            {u.name ? u.name.charAt(0) : "U"}
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/${u.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-xs block text-xs sm:text-sm"
                            >
                              {u.name || (locale === "id" ? "Tanpa Nama" : "Unnamed User")}
                            </Link>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                              {u.email}
                            </p>
                            {u.businessName && (
                              <p className="text-[11px] text-[#0f6b4f] font-semibold truncate max-w-xs flex items-center gap-1 mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{u.businessName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Plan & Role badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.plan === "PRO"
                                ? "bg-amber-50 text-amber-800 border border-amber-200/60 shadow-2xs"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {u.plan === "PRO" && (
                              <SparklesIcon className="w-3 h-3 text-amber-600" />
                            )}
                            {u.plan}
                          </span>
                          {u.role === "ADMIN" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
                              <ShieldCheckIcon className="w-3 h-3 text-rose-600" />
                              ADMIN
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Invoices Count */}
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 text-xs">
                        {u.invoiceCount}
                      </td>

                      {/* Customers Count */}
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-600 text-xs">
                        {u.customerCount}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-medium whitespace-nowrap">
                        {formatDateWIB(u.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <UserRowActions
                          userId={u.id}
                          userName={u.name || ""}
                          userEmail={u.email}
                          currentPlan={u.plan as "FREE" | "PRO"}
                          currentRole={u.role as "USER" | "ADMIN"}
                          isCurrentAdmin={isCurrentAdmin}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="bg-slate-50/80 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              {locale === "id" ? (
                <>
                  Menampilkan hal <strong className="text-slate-800">{currentPage}</strong> dari{" "}
                  <strong className="text-slate-800">{totalPages}</strong> ({totalFilteredUsers} total user)
                </>
              ) : (
                <>
                  Showing page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                  <strong className="text-slate-800">{totalPages}</strong> ({totalFilteredUsers} total users)
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/users?q=${searchQuery}&plan=${planFilter}&role=${roleFilter}&page=${
                    currentPage - 1
                  }`}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  {locale === "id" ? "Sebelumnya" : "Previous"}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/users?q=${searchQuery}&plan=${planFilter}&role=${roleFilter}&page=${
                    currentPage + 1
                  }`}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition-colors"
                >
                  {locale === "id" ? "Berikutnya" : "Next"}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
