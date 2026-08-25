import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { statusLabel, formatDateWIB } from "@/lib/invoice-utils";
import { InvoiceStatus } from "@/generated/prisma/client";

const PER_PAGE = 10;

const filterTabs: { label: string; value: string }[] = [
  { label: "Semua", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Terkirim", value: "SENT" },
  { label: "Lunas", value: "PAID" },
  { label: "Jatuh Tempo", value: "OVERDUE" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { page, status } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const validStatuses = new Set([
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]);
  const activeStatus =
    status && validStatuses.has(status) ? (status as InvoiceStatus) : undefined;

  const where = {
    userId: session.user.id,
    ...(activeStatus ? { status: activeStatus } : {}),
  };

  const [invoices, total, totalAll] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const buildHref = (s: string, p = 1) =>
    `/invoices?${s ? `status=${s}&` : ""}page=${p}`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">{totalAll} invoice</p>
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <a
              href={`/api/invoices/export${activeStatus ? `?status=${activeStatus}` : ""}`}
              download
              className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-gray-500" />
              <span>Ekspor CSV</span>
            </a>
          )}
          <Link
            href="/invoices/new"
            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            Buat Invoice
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200">
        {filterTabs.map((tab) => {
          const isActive = (activeStatus ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value)}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {total === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            {activeStatus
              ? `Tidak ada invoice dengan status ini.`
              : "Belum ada invoice."}
          </p>
          {!activeStatus && (
            <Link
              href="/invoices/new"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              Buat invoice pertama
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Card View: Mobile only (md:hidden) */}
          <div className="mt-4 space-y-2.5 md:hidden">
            {invoices.map((invoice) => {
              const s = statusLabel[invoice.status] || statusLabel.DRAFT;
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 shadow-xs active:bg-gray-50 transition-colors hover:border-gray-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {invoice.number || "—"}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 font-medium truncate">
                        {invoice.customer.name}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatDateWIB(invoice.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 text-sm tabular-nums">
                        Rp{Number(invoice.total).toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dotClassName}`} />
                        {s.text}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Table View: Desktop only (hidden md:block) */}
          <div className="mt-4 hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    No. Invoice
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Pelanggan
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => {
                  const s = statusLabel[invoice.status] || statusLabel.DRAFT;
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {invoice.number || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {invoice.customer.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateWIB(invoice.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dotClassName}`} />
                          {s.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                        Rp{Number(invoice.total).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <p>
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={buildHref(activeStatus ?? "", currentPage - 1)}
                  className={`flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors ${
                    currentPage <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Prev
                </Link>
                <Link
                  href={buildHref(activeStatus ?? "", currentPage + 1)}
                  className={`flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors ${
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
