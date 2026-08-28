"use client";

import { useState } from "react";
import {
  BuildingLibraryIcon,
  QrCodeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface PublicPaymentBoxProps {
  invoiceId: string;
  publicId: string;
  invoiceNumber: string;
  total: number;
  status: string;
  enableDirectTransfer: boolean;
  enableDigitalPayment: boolean;
  sellerName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}

export function PublicPaymentBox({
  invoiceId,
  publicId,
  invoiceNumber,
  total,
  status,
  enableDirectTransfer,
  enableDigitalPayment,
  sellerName,
  bankName,
  bankAccountNumber,
  bankAccountName,
}: PublicPaymentBoxProps) {
  const [copied, setCopied] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isPaid = status === "PAID";
  const hasDirectBank = enableDirectTransfer && bankName && bankAccountNumber;

  const handleCopyAccount = () => {
    if (!bankAccountNumber) return;
    navigator.clipboard.writeText(bankAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePayDigital = async () => {
    setLoadingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/payment/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        setPaymentError(data.error || "Gagal menyiapkan pembayaran digital. Silakan coba lagi.");
        setLoadingPayment(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setPaymentError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoadingPayment(false);
    }
  };

  if (isPaid) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <CheckCircleIcon className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-base font-bold text-emerald-900">
          Tagihan Ini Telah Lunas
        </h3>
        <p className="text-xs text-emerald-700">
          Terima kasih, pembayaran Anda untuk invoice <strong>{invoiceNumber}</strong> telah terkonfirmasi.
        </p>
      </div>
    );
  }

  if (!hasDirectBank && !enableDigitalPayment) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-paper-deep/50 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-line/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald" />
          <h3 className="text-sm font-bold text-ink">
            Pilihan Metode Pembayaran
          </h3>
        </div>
        <span className="text-xs font-semibold text-emerald">
          Total: Rp{total.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Method 1: Direct Transfer */}
        {hasDirectBank && (
          <div className="rounded-xl border border-line bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center shrink-0">
                <BuildingLibraryIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink">
                  Transfer Bank / E-Wallet
                </h4>
                <p className="text-[11px] text-ink-soft">
                  Langsung ke rekening {sellerName}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-paper-deep/60 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-soft">
                <span>Bank/Tujuan:</span>
                <span className="font-semibold text-ink">{bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">No. Rekening:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-ink text-sm tracking-wider">
                    {bankAccountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 text-ink-soft hover:text-emerald cursor-pointer transition-colors"
                    title="Salin Nomor Rekening"
                  >
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-ink-soft border-t border-line/60 pt-1.5">
                <span>Atas Nama:</span>
                <span className="font-semibold text-ink">{bankAccountName}</span>
              </div>
            </div>

            <p className="text-[11px] text-ink-soft leading-tight">
              *Silakan transfer sesuai total tagihan dan konfirmasi bukti ke penjual.
            </p>
          </div>
        )}

        {/* Method 2: Digital Payment via NotaKu (Mayar QRIS/VA) */}
        {enableDigitalPayment && (
          <div className="rounded-xl border border-emerald-300/80 bg-linear-to-br from-emerald-500/10 to-teal-500/5 p-4 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald text-paper flex items-center justify-center shrink-0">
                    <QrCodeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Bayar Otomatis (QRIS & VA)
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Konfirmasi Instan 24/7
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald">
                  Real-Time
                </span>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed">
                Scan QRIS dengan GoPay, BCA, OVO, ShopeePay, DANA atau bayar via Virtual Account. Status invoice otomatis lunas.
              </p>

              {paymentError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-[11px] text-rose-700">
                  {paymentError}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePayDigital}
              disabled={loadingPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-xs font-bold text-paper shadow-sm hover:bg-emerald-bright transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingPayment ? (
                <span>Menyiapkan QRIS...</span>
              ) : (
                <>
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Bayar via QRIS / VA Sekarang</span>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
