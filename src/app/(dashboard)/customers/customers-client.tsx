"use client";

import { CustomerList } from "@/components/customers/customer-list";
import { useLanguage } from "@/lib/i18n/context";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function CustomersClient({
  customers,
  errorMessage,
}: {
  customers: Customer[];
  errorMessage?: string;
}) {
  const { t, locale } = useLanguage();

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl shadow-2xs"
        >
          {errorMessage}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.customers?.title || (locale === "id" ? "Buku Pelanggan" : "Client Directory")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {locale === "id"
              ? `Kelola ${customers.length} kontak pelanggan untuk mempermudah penagihan invoice berulang.`
              : `Manage ${customers.length} client contacts to streamline recurring invoice creation.`}
          </p>
        </div>
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}
