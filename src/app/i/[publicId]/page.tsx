import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDateWIB } from "@/lib/invoice-utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: {
      customer: { select: { name: true } },
      user: { select: { businessName: true, name: true, plan: true } },
    },
  });

  if (!invoice) return { title: "Invoice Tidak Ditemukan — NotaKu" };

  const businessName = invoice.user.businessName || invoice.user.name;
  const totalFormatted = `Rp${Number(invoice.total).toLocaleString("id-ID")}`;

  const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    SENT: "Menunggu Pembayaran",
    PAID: "Lunas",
    OVERDUE: "Jatuh Tempo",
    CANCELLED: "Dibatalkan",
  };

  const title = `Invoice ${invoice.number} — ${businessName}`;
  const description = `${statusLabel[invoice.status] || invoice.status} — ${businessName} menagih ${invoice.customer.name} sebesar ${totalFormatted}.`;

  return {
    title,
    description,
    robots: {
      index: invoice.status !== "DRAFT",
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
      siteName: "NotaKu",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                invoice.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : invoice.status === "SENT"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                    : invoice.status === "OVERDUE"
                      ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  invoice.status === "PAID"
                    ? "bg-emerald-500"
                    : invoice.status === "SENT"
                      ? "bg-blue-500"
                      : invoice.status === "OVERDUE"
                        ? "bg-rose-500"
                        : "bg-gray-400"
                }`}
              />
              {invoice.status === "PAID"
                ? "Lunas"
                : invoice.status === "SENT"
                  ? "Menunggu Pembayaran"
                  : invoice.status === "OVERDUE"
                    ? "Jatuh Tempo"
                    : invoice.status}
            </span>
          </div>
          <div className="text-right flex flex-col items-end">
            {invoice.user.logoUrl && (
              <img
                src={invoice.user.logoUrl}
                alt="Logo Bisnis"
                className="h-10 max-w-[120px] object-contain mb-1.5"
              />
            )}
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
                {invoice.customer.email.replace(/^(.)(.*)(@.*)$/, "$1****$3")}
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
              {formatDateWIB(invoice.createdAt, {
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
                  {formatDateWIB(invoice.dueDate, {
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
              {invoice.items.map((item, index) => (
                <tr key={index}>
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

        {/* Summary Breakdown */}
        <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
          <div className="w-full max-w-xs space-y-2 text-right">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                Rp{Number(invoice.subtotal || invoice.total).toLocaleString("id-ID")}
              </span>
            </div>

            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-emerald-700 font-medium">
                <span>
                  Diskon {invoice.discountType === "PERCENTAGE" ? `(${Number(invoice.discountValue)}%)` : ""}
                </span>
                <span className="tabular-nums">
                  -Rp{Number(invoice.discountAmount).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pajak (PPN {Number(invoice.taxRate)}%)</span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  +Rp{Number(invoice.taxAmount).toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total Tagihan</span>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">
                Rp{Number(invoice.total).toLocaleString("id-ID")}
              </span>
            </div>
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
