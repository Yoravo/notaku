"use client";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import { UpgradeButton } from "@/components/upgrade-button";
import { SparklesIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

type Customer = { id: string; name: string };

type NewInvoiceClientProps = {
  customers: Customer[];
  initialCustomerId?: string;
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
  allowed: boolean;
  used: number;
  limit: number;
};

export function NewInvoiceClient({
  customers,
  initialCustomerId,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
  allowed,
  used,
  limit,
}: NewInvoiceClientProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <DocumentPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
          <span>{t.invoices?.newInvoice || (locale === "id" ? "Buat Invoice Baru" : "Create New Invoice")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {locale === "id"
            ? `Penggunaan kuota: ${used} dari ${limit === Infinity ? "Unlimited" : limit} invoice bulan ini.`
            : `Monthly quota usage: ${used} of ${limit === Infinity ? "Unlimited" : limit} invoices.`}
        </p>
      </div>

      {!allowed ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
            <SparklesIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              {locale === "id"
                ? "Batas Kuota Invoice Gratis Telah Tercapai"
                : "Free Invoice Monthly Limit Reached"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            {locale === "id"
              ? `Anda telah membuat ${used}/${limit} invoice gratis pada bulan ini. Tingkatkan ke paket NotaKu PRO untuk pembuatan invoice tanpa batas (unlimited), kustomisasi PDF tanpa watermark, dan fitur pembayaran digital otomatis.`
              : `You have reached your limit of ${used}/${limit} free invoices this month. Upgrade to NotaKu PRO for unlimited invoices, watermark-free PDF exports, and automatic digital payment features.`}
          </p>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-all cursor-pointer active:scale-[0.98] min-h-[44px]" />
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <InvoiceForm
            customers={customers}
            defaultCustomerId={initialCustomerId}
            userBankName={userBankName}
            userBankAccountNumber={userBankAccountNumber}
            userBankAccountName={userBankAccountName}
          />
        </div>
      )}
    </div>
  );
}
