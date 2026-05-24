import Link from "next/link";

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Invoice</h1>
        <Link
          href="/invoices/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Buat Invoice
        </Link>
      </div>
      <p className="mt-4 text-sm text-gray-500">Belum ada invoice.</p>
    </div>
  );
}
