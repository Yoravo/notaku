import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { WhatsAppShareModal } from "@/components/invoices/whatsapp-share-modal";
import { EmailShareModal } from "@/components/invoices/email-share-modal";
import { statusLabel, formatDateWIB } from "@/lib/invoice-utils";
import {
  PencilSquareIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

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
    include: {
      items: true,
      customer: true,
      user: { select: { businessName: true, name: true } },
    },
  });

  if (!invoice) notFound();

  const status = statusLabel[invoice.status] || statusLabel.DRAFT;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Invoice Identification with Status under Date */}
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Invoice</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {invoice.number || "Draft Invoice"}
          </h1>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5 font-medium">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Dibuat{" "}
              {formatDateWIB(invoice.createdAt, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
          {/* Status badge placed neatly under the date */}
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
              />
              {status.text}
            </span>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick PDF Action Group */}
          <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white shadow-xs overflow-hidden">
            <a
              href={`/api/invoices/${invoice.id}/pdf?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              title="Lihat Pratinjau PDF"
            >
              <EyeIcon className="w-4 h-4 text-gray-500" />
              <span>Lihat PDF</span>
            </a>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              download
              className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Unduh File PDF"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Edit Button (jika belum lunas/batal) */}
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <PencilSquareIcon className="w-4 h-4 text-gray-500" />
              <span>Edit</span>
            </Link>
          )}

          {/* Email Share Modal */}
          <EmailShareModal
            invoiceId={invoice.id}
            invoiceNumber={invoice.number || "Draft"}
            customerName={invoice.customer.name}
            customerEmail={invoice.customer.email}
            total={Number(invoice.total)}
            dueDate={
              invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
            status={invoice.status}
          />

          {/* WhatsApp Share Modal */}
          <WhatsAppShareModal
            invoiceNumber={invoice.number || "Draft"}
            customerName={invoice.customer.name}
            customerPhone={invoice.customer.phone}
            total={Number(invoice.total)}
            dueDate={
              invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
            publicId={invoice.publicId}
            businessName={invoice.user.businessName || invoice.user.name}
            status={invoice.status}
          />

          {/* Status Lifecycle & Delete Dropdown */}
          <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
        </div>
      </div>

      {/* Main Invoice Card Preview */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        {/* Customer & Due Date Section */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              Ditagihkan Kepada
            </span>
            <p className="mt-1.5 font-bold text-gray-900 text-base">
              {invoice.customer.name}
            </p>
            {invoice.customer.email && (
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                {invoice.customer.email}
              </p>
            )}
            {invoice.customer.phone && (
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                {invoice.customer.phone}
              </p>
            )}
            {invoice.customer.address && (
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {invoice.customer.address}
              </p>
            )}
          </div>

          <div className="sm:text-right flex flex-col justify-start sm:items-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Jatuh Tempo Pembayaran
            </span>
            <p className="mt-1.5 font-semibold text-gray-900 text-sm">
              {invoice.dueDate
                ? formatDateWIB(invoice.dueDate, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Tidak ditentukan (Langsung)"}
            </p>
            {invoice.notes && (
              <div className="mt-3 text-left sm:text-right max-w-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Catatan
                </span>
                <p className="text-xs text-gray-600 italic mt-0.5">
                  &quot;{invoice.notes}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Deskripsi Item</th>
                <th className="px-4 py-3.5 text-center">Qty</th>
                <th className="px-4 py-3.5 text-right">Harga Satuan</th>
                <th className="px-6 py-3.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3.5 font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-3.5 text-center text-gray-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3.5 text-right text-gray-600 tabular-nums">
                    Rp{Number(item.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900 tabular-nums">
                    Rp{Number(item.amount).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50/40 divide-y divide-gray-200/60">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-right font-semibold text-gray-600 text-xs"
                >
                  Subtotal
                </td>
                <td className="px-6 py-3 text-right font-semibold text-gray-900 text-sm tabular-nums">
                  Rp{Number(invoice.subtotal || invoice.total).toLocaleString("id-ID")}
                </td>
              </tr>

              {Number(invoice.discountAmount) > 0 && (
                <tr className="text-emerald-700">
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-xs"
                  >
                    Diskon {invoice.discountType === "PERCENTAGE" ? `(${Number(invoice.discountValue)}%)` : ""}
                  </td>
                  <td className="px-6 py-2.5 text-right font-semibold text-sm tabular-nums">
                    -Rp{Number(invoice.discountAmount).toLocaleString("id-ID")}
                  </td>
                </tr>
              )}

              {Number(invoice.taxAmount) > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-2.5 text-right font-semibold text-gray-600 text-xs"
                  >
                    Pajak (PPN {Number(invoice.taxRate)}%)
                  </td>
                  <td className="px-6 py-2.5 text-right font-semibold text-gray-900 text-sm tabular-nums">
                    +Rp{Number(invoice.taxAmount).toLocaleString("id-ID")}
                  </td>
                </tr>
              )}

              <tr className="bg-gray-100/60">
                <td
                  colSpan={3}
                  className="px-6 py-4 text-right font-bold text-gray-800 uppercase tracking-wider text-xs sm:text-sm"
                >
                  Total Tagihan
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900 text-base sm:text-lg tabular-nums">
                  Rp{Number(invoice.total).toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
