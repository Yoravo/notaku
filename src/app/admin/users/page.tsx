import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { UserRowActions } from "./user-row-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  plan?: string;
  role?: string;
  page?: string;
}>;

export default async function AdminUsersPage(props: {
  searchParams: SearchParams;
}) {
  const currentAdmin = await requireAdmin();
  const searchParams = await props.searchParams;

  const searchQuery = searchParams.q?.trim() || "";
  const planFilter = searchParams.plan?.toUpperCase() || "";
  const roleFilter = searchParams.role?.toUpperCase() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const PAGE_SIZE = 15;

  // Build filter where clause
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { businessName: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (planFilter === "FREE" || planFilter === "PRO") {
    where.plan = planFilter;
  }

  if (roleFilter === "USER" || roleFilter === "ADMIN") {
    where.role = roleFilter;
  }

  const [totalFilteredUsers, users, totalAllUsers, totalProUsers] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          plan: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              invoices: true,
              customers: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { plan: "PRO" } }),
    ]);

  const totalPages = Math.ceil(totalFilteredUsers / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola akses, upgrade paket Pro secara manual, dan kelola peran admin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-center">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Total User
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {totalAllUsers.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl px-4 py-2 shadow-sm text-center">
            <p className="text-[11px] uppercase font-bold tracking-wider text-amber-600">
              User Pro
            </p>
            <p className="text-lg font-extrabold text-amber-700">
              {totalProUsers.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari nama, email, atau nama bisnis..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Plan Filter */}
          <div className="sm:col-span-3">
            <select
              name="plan"
              defaultValue={planFilter}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Paket (Plan)</option>
              <option value="FREE">Hanya FREE</option>
              <option value="PRO">Hanya PRO</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-2">
            <select
              name="role"
              defaultValue={roleFilter}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Role</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center py-2 transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-4 py-3">Status / Role</th>
                <th className="px-4 py-3 text-center">Invoices</th>
                <th className="px-4 py-3 text-center">Pelanggan</th>
                <th className="px-4 py-3">Tgl Daftar</th>
                <th className="px-5 py-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-slate-400 text-sm"
                  >
                    Tidak ditemukan pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentAdmin.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* User details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 uppercase border border-slate-200 hover:border-slate-400 hover:bg-slate-200 transition-colors"
                            title="Lihat Detail Pengguna"
                          >
                            {u.name ? u.name.charAt(0) : "U"}
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/users/${u.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-xs block"
                            >
                              {u.name || "Tanpa Nama"}
                            </Link>
                            <p className="text-xs text-slate-500 truncate max-w-xs font-mono">
                              {u.email}
                            </p>
                            {u.businessName && (
                              <p className="text-[11px] text-emerald-700 font-medium truncate max-w-xs">
                                🏢 {u.businessName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Plan & Role badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              u.plan === "PRO"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {u.plan === "PRO" && (
                              <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            {u.plan}
                          </span>
                          {u.role === "ADMIN" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                              <ShieldCheckIcon className="w-3 h-3" />
                              ADMIN
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Invoices Count */}
                      <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-700">
                        {u._count.invoices}
                      </td>

                      {/* Customers Count */}
                      <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                        {u._count.customers}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-xs text-slate-500">
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
                          userName={u.name}
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
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan hal <strong>{currentPage}</strong> dari{" "}
              <strong>{totalPages}</strong> ({totalFilteredUsers} total user)
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/users?q=${searchQuery}&plan=${planFilter}&role=${roleFilter}&page=${
                    currentPage - 1
                  }`}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium text-slate-700"
                >
                  Sebelumnya
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/users?q=${searchQuery}&plan=${planFilter}&role=${roleFilter}&page=${
                    currentPage + 1
                  }`}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium text-slate-700"
                >
                  Berikutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
