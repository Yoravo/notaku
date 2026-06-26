import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { RecentInvoices } from "@/components/recent-invoices";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [invoiceThisMonth, totalCustomers, paidAgg, user, recentInvoices] =
    await Promise.all([
      prisma.invoice.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.customer.count({ where: { userId } }),
      prisma.invoice.aggregate({
        where: { userId, status: "PAID", createdAt: { gte: startOfMonth } },
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

  const revenue = Number(paidAgg._sum.total || 0);
  const isPro = user?.plan === "PRO";
  const { used, limit } = await canCreateInvoice(userId);

  const stats = [
    {
      label: "Invoice Bulan Ini",
      value: isPro ? String(invoiceThisMonth) : `${used}/${limit}`,
    },
    {
      label: "Pendapatan Bulan Ini",
      value: `Rp${revenue.toLocaleString("id-ID")}`,
    },
    { label: "Total Pelanggan", value: String(totalCustomers) },
    { label: "Plan", value: isPro ? "Pro" : "Free" },
  ];

  return (
    <div className="space-y-6">
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
        <Link
          href="/invoices/new"
          className={`
            flex items-center justify-center gap-2 rounded-lg
            bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
            transition-colors hover:bg-blue-700 active:bg-blue-800
            sm:justify-start sm:py-2
            h-10 sm:h-auto
            shrink-0
          `}
        >
          <PlusIcon className="h-5 w-5 shrink-0" />
          <span>Buat Invoice</span>
        </Link>
      </div>

      {/* Stats: Mobile 1-col, sm 2-col, lg 4-col */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5"
          >
            <p className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">
              {s.label}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Invoices: Card view mobile, table desktop */}
      <RecentInvoices
        invoices={recentInvoices.map((inv) => ({
          ...inv,
          total: Number(inv.total),
          dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
          createdAt: inv.createdAt.toISOString(),
          customer: {
            ...inv.customer,
            createdAt: inv.customer.createdAt.toISOString(),
          },
        }))}
      />
    </div>
  );
}
