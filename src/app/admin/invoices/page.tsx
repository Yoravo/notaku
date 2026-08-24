import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pdf/format";
import Link from "next/link";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: "bg-emerald-100 border-emerald-200", text: "text-emerald-800", label: "Lunas (PAID)" },
  SENT: { bg: "bg-blue-100 border-blue-200", text: "text-blue-800", label: "Terkirim (SENT)" },
  DRAFT: { bg: "bg-slate-100 border-slate-200", text: "text-slate-700", label: "Draft" },
  OVERDUE: { bg: "bg-rose-100 border-rose-200", text: "text-rose-800", label: "Jatuh Tempo" },
  CANCELLED: { bg: "bg-gray-100 border-gray-200", text: "text-gray-600", label: "Dibatalkan" },
};

export default async function AdminInvoicesPage(props: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const searchQuery = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status?.toUpperCase() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const PAGE_SIZE = 15;

  // Build where condition
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { number: { contains: searchQuery, mode: "insensitive" } },
      { customer: { name: { contains: searchQuery, mode: "insensitive" } } },
      { customer: { email: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  if (
    ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].includes(statusFilter)
  ) {
    where.status = statusFilter;
  }

  // Fetch summary & invoices list
  const [
    totalFilteredInvoices,
    invoices,
    totalAllInvoices,
    paidInvoicesSum,
    statusCounts,
  ] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            plan: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const totalPages = Math.ceil(totalFilteredInvoices / PAGE_SIZE) || 1;

  const statusCountMap = statusCounts.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <DocumentTextIcon className="w-8 h-8 text-amber-600" />
            Monitoring Seluruh Invoice
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pantau peredaran invoice publik, total transaksi, dan verifikasi invoice pengguna.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-center">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Total Invoice
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {totalAllInvoices.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white border border-emerald-200 rounded-xl px-4 py-2 shadow-sm text-center">
            <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-600">
              Total Lunas (GMV)
            </p>
            <p className="text-lg font-extrabold text-emerald-700">
              {formatCurrency(Number(paidInvoicesSum._sum.total || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Filter by Status Quick Tabs & Search Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        {/* Status Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Link
            href={`/admin/invoices?q=${searchQuery}`}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              !statusFilter
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({totalAllInvoices})
          </Link>
          {["PAID", "SENT", "DRAFT", "OVERDUE", "CANCELLED"].map((st) => (
            <Link
              key={st}
              href={`/admin/invoices?q=${searchQuery}&status=${st}`}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st} ({statusCountMap[st] || 0})
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-9 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari nomor invoice, nama pembuat, email, atau pelanggan..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <input type="hidden" name="status" value={statusFilter} />
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg py-2 transition-colors cursor-pointer"
            >
              Cari Invoice
            </button>
          </div>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3">No. Invoice</th>
                <th className="px-4 py-3">Pembuat (User)</th>
                <th className="px-4 py-3">Ditagihkan Ke</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Nominal</th>
                <th className="px-4 py-3">Tgl Dibuat</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-slate-400 text-sm"
                  >
                    Tidak ada invoice yang ditemukan.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = STATUS_BADGES[inv.status] || STATUS_BADGES.DRAFT;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      {/* Invoice Number */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900">
                          {inv.number}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {inv._count.items} item
                        </p>
                      </td>

                      {/* Creator info */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 truncate max-w-[160px]">
                          {inv.user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[160px] font-mono">
                          {inv.user.email}
                        </p>
                        {inv.user.businessName && (
                          <p className="text-[11px] text-emerald-700 truncate max-w-[160px]">
                            {inv.user.businessName}
                          </p>
                        )}
                      </td>

                      {/* Customer info */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900 truncate max-w-[150px]">
                          {inv.customer.name}
                        </p>
                        {inv.customer.email && (
                          <p className="text-xs text-slate-400 truncate max-w-[150px] font-mono">
                            {inv.customer.email}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(Number(inv.total))}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Public Link Action */}
                      <td className="px-5 py-3.5 text-right">
                        <a
                          href={`/i/${inv.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <span>Lihat Web</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan hal <strong>{currentPage}</strong> dari{" "}
              <strong>{totalPages}</strong> ({totalFilteredInvoices} total invoice)
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
                    currentPage - 1
                  }`}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 font-medium text-slate-700"
                >
                  Sebelumnya
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/invoices?q=${searchQuery}&status=${statusFilter}&page=${
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
