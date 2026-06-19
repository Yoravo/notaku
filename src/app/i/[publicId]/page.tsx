import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: { items: true, customer: true, user: true },
  });

  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">INVOICE</h1>
            <p className="text-sm text-gray-600">{invoice.number}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                invoice.status === "PAID"
                  ? "bg-green-50 text-green-700"
                  : invoice.status === "SENT"
                    ? "bg-blue-50 text-blue-700"
                    : invoice.status === "OVERDUE"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-700"
              }`}
            >
              {invoice.status === "PAID"
                ? "Lunas"
                : invoice.status === "SENT"
                  ? "Menunggu Pembayaran"
                  : invoice.status === "OVERDUE"
                    ? "Jatuh Tempo"
                    : invoice.status}
            </span>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {invoice.user.businessName || invoice.user.name}
            </p>
          </div>
        </div>

        {/* Customer & dates */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Ditagihkan kepada
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {invoice.customer.name}
            </p>
            {invoice.customer.email && (
              <p className="text-sm text-gray-600">
                {invoice.customer.email.replace(/(.{2})(.*)(@.*)/, "$1****$3")}
              </p>
            )}
            {invoice.customer.phone && (
              <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
            )}
            {invoice.customer.address && (
              <p className="text-sm text-gray-600">
                {invoice.customer.address}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Tanggal
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {invoice.createdAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {invoice.dueDate && (
              <>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Jatuh Tempo
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {invoice.dueDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 text-left font-medium text-gray-700">
                  Deskripsi
                </th>
                <th className="pb-2 text-right font-medium text-gray-700">
                  Qty
                </th>
                <th className="pb-2 text-right font-medium text-gray-700">
                  Harga
                </th>
                <th className="pb-2 text-right font-medium text-gray-700">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    Rp{Number(item.price).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    Rp{Number(item.amount).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900">
              Rp{Number(invoice.total).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Catatan
            </p>
            <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* Watermark for free tier */}
        {invoice.user.plan === "FREE" && (
          <p className="mt-8 text-center text-xs text-gray-400">
            Dibuat dengan NotaKu
          </p>
        )}
      </div>
    </div>
  );
}
