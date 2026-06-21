import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Selamat datang kembali, {session.user.name}.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700
  transition-colors"
        >
          <PlusIcon className="inline h-4 w-4" />
          Buat Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Invoice Terbaru</h2>
          <Link
            href="/invoices"
            className="text-sm text-blue-600 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Belum ada invoice.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    No. Invoice
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {inv.number || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {inv.customer.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                      Rp{Number(inv.total).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
