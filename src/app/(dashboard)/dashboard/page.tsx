import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import Link from "next/link";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  ClockIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { RecentInvoices } from "@/components/recent-invoices";
import { SerializedInvoice } from "@/types/invoice";
import { AnnouncementBanner } from "@/components/announcement-banner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const { range } = await searchParams;
  const selectedRange = range || "month"; // "all" | "month" | "year"

  const now = new Date();
  let dateFilter: { gte?: Date } | undefined = undefined;

  if (selectedRange === "month") {
    dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  } else if (selectedRange === "year") {
    dateFilter = { gte: new Date(now.getFullYear(), 0, 1) };
  }

  const [
    invoiceCount,
    totalCustomers,
    paidAgg,
    pendingAgg,
    totalVolumeAgg,
    user,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.count({
      where: {
        userId,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    prisma.customer.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: "PAID",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ["SENT", "OVERDUE"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { not: "CANCELLED" },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.invoice.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const paidRevenue = Number(paidAgg._sum.total || 0);
  const pendingRevenue = Number(pendingAgg._sum.total || 0);
  const totalVolume = Number(totalVolumeAgg._sum.total || 0);
  const isPro = user?.plan === "PRO";
  const { used, limit } = await canCreateInvoice(userId);

  const rangeLabels: Record<string, string> = {
    month: "Bulan Ini",
    year: "Tahun Ini",
    all: "Semua Waktu",
  };

  const periodLabel = rangeLabels[selectedRange] || "Bulan Ini";

  return (
    <div className="space-y-6">
      {/* Global Broadcast Announcement */}
      <AnnouncementBanner />

      {/* Header: Mobile-first stack, desktop row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Selamat datang kembali, {session.user.name}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/invoices/export`}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
            <span>Ekspor Rekap</span>
          </a>
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 shadow-xs"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            <span>Buat Invoice</span>
          </Link>
        </div>
      </div>

      {/* Financial Overview & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            Ringkasan Keuangan & Omset
          </h2>
          <p className="text-xs text-gray-500">
            Pantau arus kas, pendapatan lunas, dan tagihan aktif periode {periodLabel.toLowerCase()}.
          </p>
        </div>
        {/* Filter Pills */}
        <div className="inline-flex rounded-lg bg-gray-100 p-1 self-start sm:self-auto">
          {[
            { id: "month", label: "Bulan Ini" },
            { id: "year", label: "Tahun Ini" },
            { id: "all", label: "Semua Waktu" },
          ].map((tab) => {
            const active = selectedRange === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/dashboard?range=${tab.id}`}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  active
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Financial Stats: 4 Cards Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pendapatan Lunas */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
              Pendapatan Terbayar
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckBadgeIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-950 tabular-nums">
            Rp{paidRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            Lunas ({periodLabel})
          </p>
        </div>

        {/* Tagihan Tertunda */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              Tagihan Tertunda
            </p>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-950 tabular-nums">
            Rp{pendingRevenue.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-amber-700 font-medium">
            Terkirim & Jatuh Tempo
          </p>
        </div>

        {/* Total Omset/Volume Tagihan */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">
              Total Volume Tagihan
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <BanknotesIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-950 tabular-nums">
            Rp{totalVolume.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-[11px] text-blue-700 font-medium">
            Akumulasi nilai ({periodLabel})
          </p>
        </div>

        {/* Kuota & Total Invoice */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Volume Invoice
            </p>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
            {isPro ? String(invoiceCount) : `${used}/${limit}`}
          </p>
          <p className="mt-1 text-[11px] text-gray-500 font-medium">
            {isPro ? "Paket Pro (Unlimited)" : `Paket Free • ${totalCustomers} Pelanggan`}
          </p>
        </div>
      </div>

      {/* Recent Invoices: Card view mobile, table desktop */}
      <RecentInvoices
        invoices={recentInvoices.map(
          (inv): SerializedInvoice => ({
            ...inv,
            total: Number(inv.total),
            dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
            createdAt: inv.createdAt.toISOString(),
            customer: {
              ...inv.customer,
              createdAt: inv.customer.createdAt.toISOString(),
            },
          }),
        )}
      />
    </div>
  );
}
