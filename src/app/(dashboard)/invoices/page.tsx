import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { statusLabel } from "@/lib/invoice-utils";

const PER_PAGE = 10;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.invoice.count({
      where: { userId: session.user.id },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">{total} invoice</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="inline h-4 w-4" />
          Buat Invoice
        </Link>
      </div>

      {total === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">Belum ada invoice.</p>
          <Link
            href="/invoices/new"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            Buat invoice pertama
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">No. Invoice</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Pelanggan</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Tanggal</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => {
                  const status = statusLabel[invoice.status] || statusLabel.DRAFT;
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {invoice.number || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{invoice.customer.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {invoice.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
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
                  href={`/invoices?page=${currentPage - 1}`}
                  className={`flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors
                    ${currentPage <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:bg-gray-50 text-gray-700"
                    }`}
                  aria-disabled={currentPage <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Prev
                </Link>
                <Link
                  href={`/invoices?page=${currentPage + 1}`}
                  className={`flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors
                    ${currentPage >= totalPages
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