"use client";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";
import { DiscountType } from "@/lib/invoice-calculations";

type Customer = { id: string; name: string };
type InvoiceData = {
  id: string;
  customerId: string;
  dueDate: string | null;
  notes: string | null;
  discountType?: DiscountType | string;
  discountValue?: number | string;
  taxRate?: number | string;
  enableDirectTransfer?: boolean;
  enableDigitalPayment?: boolean;
  items: { description: string; quantity: number; price: number }[];
};

export function EditInvoiceClient({
  customers,
  userBankName,
  userBankAccountNumber,
  userBankAccountName,
  invoice,
}: {
  customers: Customer[];
  userBankName?: string | null;
  userBankAccountNumber?: string | null;
  userBankAccountName?: string | null;
  invoice: InvoiceData;
}) {
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
          <span>{locale === "id" ? "Edit Data Invoice" : "Edit Invoice"}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {locale === "id"
            ? "Perbarui item produk/jasa, potongan diskon, tarif PPN, dan opsi metode pembayaran invoice."
            : "Update line items, discount values, tax rates, and payment methods for this invoice."}
        </p>
      </div>

      <div className="mt-2">
        <InvoiceForm
          customers={customers}
          userBankName={userBankName}
          userBankAccountNumber={userBankAccountNumber}
          userBankAccountName={userBankAccountName}
          invoice={invoice}
        />
      </div>
    </div>
  );
}
