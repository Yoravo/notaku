import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InvoiceActions } from "@/app/components/invoices/invoice-actions";

const statusLabel: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "Draft", className: "bg-gray-100 text-gray-700" },
  SENT: { text: "Terkirim", className: "bg-blue-50 text-blue-700" },
  PAID: { text: "Lunas", className: "bg-green-50 text-green-700" },
  OVERDUE: { text: "Jatuh Tempo", className: "bg-red-50 text-red-700" },
  CANCELLED: { text: "Dibatalkan", className: "bg-gray-100 text-gray-500" },
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true, customer: true },
  });

  if (!invoice) notFound();

  const status = statusLabel[invoice.status] || statusLabel.DRAFT;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              {invoice.number || "Draft"}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
            >
              {status.text}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Dibuat{" "}
            {invoice.createdAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/invoices/${invoice.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700
  hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            download
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50
  transition-colors"
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Customer info */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Ditagihkan kepada
        </p>
        <p className="mt-1 font-medium text-gray-900">
          Nama: {invoice.customer.name}
        </p>
        {invoice.customer.email && (
          <p className="text-sm text-gray-600">
            Email: {invoice.customer.email}
          </p>
        )}
        {invoice.customer.phone && (
          <p className="text-sm text-gray-600">
            Telepon: {invoice.customer.phone}
          </p>
        )}
        {invoice.customer.address && (
          <p className="mt-1 text-sm text-gray-600">
            Alamat: {invoice.customer.address}
          </p>
        )}
      </div>

      {/* Items table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Qty
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Harga
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Jumlah
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-gray-900">{item.description}</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  Rp{Number(item.price).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  Rp{Number(item.amount).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200">
            <tr>
              <td
                colSpan={3}
                className="px-4 py-3 text-right font-medium text-gray-700"
              >
                Total
              </td>
              <td className="px-4 py-3 text-right text-lg font-semibold text-gray-900">
                Rp{Number(invoice.total).toLocaleString("id-ID")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes & Due date */}
      {(invoice.notes || invoice.dueDate) && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5 space-y-2">
          {invoice.dueDate && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Jatuh tempo:</span>{" "}
              {invoice.dueDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          {invoice.notes && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">Catatan:</span>{" "}
              {invoice.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
