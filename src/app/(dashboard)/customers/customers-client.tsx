"use client";

import { CustomerList } from "@/components/customers/customer-list";
import { useTranslations, useLocale } from "next-intl";

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
  autoOpen = false,
}: {
  customers: Customer[];
  errorMessage?: string;
  autoOpen?: boolean;
}) {
  const tCust = useTranslations("customers");
  const locale = useLocale();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
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
            {tCust("title")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {tCust("clientsCountDesc", { count: customers.length })}
          </p>
        </div>
      </div>
      <CustomerList customers={customers} autoOpen={autoOpen} />
    </div>
  );
}
