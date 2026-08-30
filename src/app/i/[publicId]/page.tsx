import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateWIB } from "@/lib/invoice-utils";
import { formatMoney } from "@/lib/currencies";
import { PublicPaymentBox } from "@/components/invoices/public-payment-box";
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

  const currency = (invoice as any).currency || "IDR";
  const businessName = invoice.user.businessName || invoice.user.name;
  const totalFormatted = formatMoney(Number(invoice.total), currency);

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
      index: false,
      follow: false,
      nocache: true,
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

  const currency = (invoice as any).currency || "IDR";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tagihan Resmi
            </span>
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-0.5">
              {invoice.number}
            </h1>
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  invoice.status === "PAID"
                    ? "bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60"
                    : invoice.status === "SENT"
                      ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                      : invoice.status === "OVERDUE"
                        ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
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
                          : "bg-slate-400"
                  }`}
                />
                {invoice.status === "PAID"
                  ? "Lunas (PAID)"
                  : invoice.status === "SENT"
                    ? "Menunggu Pembayaran"
                    : invoice.status === "OVERDUE"
                      ? "Jatuh Tempo"
                      : invoice.status}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end shrink-0">
            {invoice.user.logoUrl && (
              <img
                src={invoice.user.logoUrl}
                alt="Logo Bisnis"
                className="h-10 max-w-[120px] object-contain mb-1.5"
              />
            )}
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              {invoice.user.businessName || invoice.user.name}
            </p>
          </div>
        </div>

        {/* Customer & dates */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50/70 p-4 border border-slate-200/60">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ditagihkan kepada:
            </p>
            <p className="mt-1 font-bold text-slate-900 text-sm">
              {invoice.customer.name}
            </p>
            {invoice.customer.email && (
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {invoice.customer.email.replace(/^(.)(.*)(@.*)$/, "$1****$3")}
              </p>
            )}
            {invoice.customer.phone && (
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {invoice.customer.phone}
              </p>
            )}
            {invoice.customer.address && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {invoice.customer.address}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tanggal Terbit
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              {formatDateWIB(invoice.createdAt, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            {invoice.dueDate && (
              <>
                <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Batas Pembayaran (Jatuh Tempo)
                </p>
                <p className="mt-0.5 text-xs font-bold text-rose-700">
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
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="pb-3 text-left">Deskripsi</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Harga</th>
                <th className="pb-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 text-slate-900 font-medium">{item.description}</td>
                  <td className="py-3 text-center text-slate-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-slate-600 tabular-nums">
                    {formatMoney(Number(item.price), currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                    {formatMoney(Number(item.amount), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <div className="w-full max-w-xs space-y-2 text-right">
            <div className="flex justify-between text-xs sm:text-sm text-slate-600">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatMoney(Number(invoice.subtotal || invoice.total), currency)}
              </span>
            </div>

            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-[#0f6b4f] font-semibold">
                <span>
                  Diskon {invoice.discountType === "PERCENTAGE" ? `(${Number(invoice.discountValue)}%)` : ""}
                </span>
                <span className="tabular-nums">
                  -{formatMoney(Number(invoice.discountAmount), currency)}
                </span>
              </div>
            )}

            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span className="font-medium">Pajak (PPN {Number(invoice.taxRate)}%)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  +{formatMoney(Number(invoice.taxAmount), currency)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {formatMoney(Number(invoice.total), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Box */}
        <div className="mt-8">
          <PublicPaymentBox
            invoiceId={invoice.id}
            publicId={invoice.publicId}
            invoiceNumber={invoice.number}
            total={Number(invoice.total)}
            status={invoice.status}
            enableDirectTransfer={invoice.enableDirectTransfer}
            enableDigitalPayment={invoice.enableDigitalPayment}
            sellerName={invoice.user.businessName || invoice.user.name}
            bankName={invoice.user.bankName}
            bankAccountNumber={invoice.user.bankAccountNumber}
            bankAccountName={invoice.user.bankAccountName}
          />
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Catatan
            </p>
            <p className="mt-1 text-xs text-slate-600 italic leading-relaxed">
              &quot;{invoice.notes}&quot;
            </p>
          </div>
        )}

        {/* Viral Branding & Structured Backlink Badge */}
        {invoice.user.plan === "FREE" ? (
          <div className="mt-8 border-t border-slate-100 pt-6 text-center space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">
              Dokumen tagihan ini dibuat secara otomatis dengan{" "}
              <Link
                href="https://notaku.store"
                target="_blank"
                rel="noopener"
                className="font-bold text-[#0f6b4f] hover:underline"
              >
                NotaKu
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Kelola invoice bisnis, kirim via WhatsApp, & terima QRIS tanpa ribet.{" "}
              <Link
                href="https://notaku.store/register"
                target="_blank"
                rel="noopener"
                className="text-slate-600 font-semibold hover:text-[#0f6b4f] underline ml-1"
              >
                Buat Invoice Anda Gratis
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Invoice resmi diterbitkan oleh{" "}
              <span className="font-semibold text-slate-600">
                {invoice.user.businessName || invoice.user.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
