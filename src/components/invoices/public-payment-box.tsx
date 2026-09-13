"use client";

import { useState } from "react";
import {
  BuildingLibraryIcon,
  QrCodeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { formatMoney } from "@/lib/currencies";
import { useLocale, useTranslations } from "next-intl";

interface PublicPaymentBoxProps {
  invoiceId: string;
  publicId: string;
  invoiceNumber: string;
  total: number;
  currency?: string;
  status: string;
  enableDirectTransfer: boolean;
  enableDigitalPayment: boolean;
  sellerName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}

export function PublicPaymentBox({
  publicId,
  invoiceNumber,
  total,
  currency,
  status,
  enableDirectTransfer,
  enableDigitalPayment,
  sellerName,
  bankName,
  bankAccountNumber,
  bankAccountName,
}: PublicPaymentBoxProps) {
  const locale = useLocale() as "id" | "en";
  const tInv = useTranslations("invoices");
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
        setPaymentError(data.error || tInv("digitalPaymentPrepareFailed"));
        setLoadingPayment(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setPaymentError(tInv("networkError"));
      setLoadingPayment(false);
    }
  };

  if (isPaid) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-4 shadow-2xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-[#0f6b4f] flex items-center justify-center border border-emerald-200/80">
          <CheckCircleIcon className="w-7 h-7 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-950">
            {tInv("publicPaidNotice")}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-emerald-800 font-medium">
            {tInv("publicPaidThanks", { invoiceNumber })}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <a
            href={`/api/invoices/public/${publicId}/receipt?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all"
          >
            <DocumentCheckIcon className="w-4 h-4" />
            <span>{tInv("officialReceiptPdf")}</span>
          </a>
        </div>
      </div>
    );
  }

  if (!hasDirectBank && !enableDigitalPayment) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0f6b4f]" />
          <h3 className="text-sm font-bold text-slate-900">
            {tInv("paymentMethodsTitle")}
          </h3>
        </div>
        <span className="text-xs font-bold text-[#0f6b4f] tabular-nums">
          {tInv("totalLabel")} {formatMoney(total, currency || "IDR", locale)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Method 1: Direct Transfer */}
        {hasDirectBank && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f6b4f] flex items-center justify-center shrink-0 border border-emerald-100">
                  <BuildingLibraryIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {tInv("directTransferTitle")}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {tInv("directTransferDestination", { sellerName })}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span className="font-medium">{tInv("bank")}</span>
                  <span className="font-bold text-slate-900">{bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{tInv("accountNumber")}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                      {bankAccountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-1 text-slate-400 hover:text-[#0f6b4f] cursor-pointer transition-colors"
                      title={tInv("copyAccountNumber")}
                    >
                      {copied ? (
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#0f6b4f]" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200/60 pt-1.5">
                  <span className="font-medium">{tInv("accountHolder")}</span>
                  <span className="font-bold text-slate-900">{bankAccountName}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              {tInv("transferInstruction")}
            </p>
          </div>
        )}

        {/* Method 2: Digital Payment via NotaKu (Mayar QRIS/VA) */}
        {enableDigitalPayment && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 space-y-3 shadow-2xs flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0f6b4f] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <QrCodeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {tInv("digitalPaymentTitle")}
                    </h4>
                    <p className="text-[11px] text-[#0f6b4f] font-bold">
                      {tInv("automaticConfirmation")}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#0f6b4f]">
                  {tInv("realTime")}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {tInv("digitalPaymentPublicDesc")}
              </p>

              {paymentError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-semibold animate-in fade-in">
                  {paymentError}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePayDigital}
              disabled={loadingPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {loadingPayment ? (
                <span>{tInv("preparingCheckout")}</span>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>{tInv("publicPayNow")}</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
