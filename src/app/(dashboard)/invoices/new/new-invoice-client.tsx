"use client";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import { UpgradeButton } from "@/components/upgrade-button";
import { SparklesIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

type Customer = { id: string; name: string };
type CatalogItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
};

type NewInvoiceClientProps = {
  customers: Customer[];
  catalogItems?: CatalogItem[];
  initialCustomerId?: string;
  initialInvoiceData?: any;
  isCloning?: boolean;
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
  currentUserId?: string;
  allowed: boolean;
  used: number;
  limit: number;
};

export function NewInvoiceClient({
  customers,
  catalogItems = [],
  initialCustomerId,
  initialInvoiceData,
  isCloning = false,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
  currentUserId,
  allowed,
  used,
  limit,
}: NewInvoiceClientProps) {
  const tInv = useTranslations("invoices");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <DocumentPlusIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
          <span>{isCloning ? tInv("cloneTitle") : tInv("createTitle")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isCloning
            ? tInv("cloneDesc")
            : tInv("quotaUsage", {
                used,
                limit: limit === Infinity ? tInv("quotaUnlimited") : limit,
              })}
        </p>
      </div>

      {!allowed ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
            <SparklesIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{tInv("limitTitle")}</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            {tInv("limitDesc", { used, limit })}
          </p>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-all cursor-pointer active:scale-[0.98] min-h-[44px]" />
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <InvoiceForm
            customers={customers}
            catalogItems={catalogItems}
            invoice={initialInvoiceData}
            isCloneMode={isCloning}
            defaultCustomerId={initialCustomerId}
            userBankName={userBankName}
            userBankAccountNumber={userBankAccountNumber}
            userBankAccountName={userBankAccountName}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
}
