import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/pdf/format";
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Pro Subscription pricing baseline (Rp 49.000 / month)
  const PRO_PRICE = 49000;

  const [
    totalUsers,
    totalProUsers,
    paidInvoicesAgg,
    allInvoicesAgg,
    paidThisMonthAgg,
    paidLastMonthAgg,
    allInvoicesCount,
    paidInvoicesCount,
    recentPaidInvoices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfMonth },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        customer: { select: { name: true } },
      },
    }),
  ]);

  // Financial Estimates
  const estimatedMRR = totalProUsers * PRO_PRICE;
  const estimatedARR = estimatedMRR * 12;
  const conversionRate = totalUsers > 0 ? ((totalProUsers / totalUsers) * 100).toFixed(1) : "0";
  const platformGMV = Number(paidInvoicesAgg._sum.total || 0);
  const totalInvoiceValue = Number(allInvoicesAgg._sum.total || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <BanknotesIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                Laporan Finansial & Metrik SaaS
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Analisis pendapatan langganan (MRR), total perputaran invoice (GMV), dan laporan transaksi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/export/invoices"
            download
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs w-full sm:w-auto"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-500" />
            <span>Ekspor Data Transaksi CSV</span>
          </a>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated MRR */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Estimasi MRR (SaaS)
            </p>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CurrencyDollarIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-display">
            {formatCurrency(estimatedMRR)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Dari {totalProUsers} user PRO aktif (@Rp 49rb/bln)
          </p>
        </div>

        {/* Estimated ARR */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estimasi ARR (Tahunan)
            </p>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-display">
            {formatCurrency(estimatedARR)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Run-rate tahunan proyeksi</p>
        </div>

        {/* Free to Pro Conversion Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conversion Rate
            </p>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2 font-display">
            {conversionRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalProUsers} PRO dari {totalUsers} total user
          </p>
        </div>

        {/* Total GMV Processed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total GMV Invoice
            </p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2 font-display">
            {formatCurrency(platformGMV)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Nilai invoice terbayar platform
          </p>
        </div>
      </div>

      {/* Monthly Invoice Volume Comparison & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Invoice Volume */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DocumentDuplicateIcon className="w-4 h-4 text-slate-600" />
            Performa Invoice Bulan Berjalan
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-xs text-slate-500 font-semibold uppercase">Bulan Ini (M-to-D)</p>
              <p className="text-xl font-bold text-emerald-700 mt-1 font-display">
                {formatCurrency(Number(paidThisMonthAgg._sum.total || 0))}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {paidThisMonthAgg._count.id || 0} invoice PAID
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-xs text-slate-500 font-semibold uppercase">Bulan Lalu (Full)</p>
              <p className="text-xl font-bold text-slate-700 mt-1 font-display">
                {formatCurrency(Number(paidLastMonthAgg._sum.total || 0))}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {paidLastMonthAgg._count.id || 0} invoice PAID
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 leading-relaxed">
            Perputaran total invoice tercatat mencakup keseluruhan pembuatan invoice di sistem senilai{" "}
            <strong className="text-slate-800">{formatCurrency(totalInvoiceValue)}</strong> ({allInvoicesCount} total invoice).
          </div>
        </div>

        {/* Recent Paid Invoices Feed */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
              Invoice PAID Terkini Platform
            </h2>
            <span className="text-xs text-slate-400">10 transaksi terakhir</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentPaidInvoices.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">
                Belum ada invoice berstatus PAID tercatat di sistem.
              </p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5 px-4">Invoice</th>
                    <th className="py-2.5 px-4">Pengirim / User</th>
                    <th className="py-2.5 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPaidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-semibold text-slate-800">
                          {inv.number}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {inv.customer?.name || "Pelanggan Umum"}
                        </p>
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-slate-800 truncate max-w-[150px]">
                          {inv.user.name || "User"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                          {inv.user.email}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(Number(inv.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
