"use client";

import { FormEvent, useState } from "react";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export function CustomerModal({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!customer;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isEdit) {
        await updateCustomer(customer.id, formData);
      } else {
        await createCustomer(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pelanggan");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Nama Pelanggan / Perusahaan *
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Contoh: PT Sumber Rejeki / Budi Santoso"
              defaultValue={customer?.name || ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Email (Opsional untuk kirim invoice)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contoh: client@perusahaan.com"
              defaultValue={customer?.email || ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              No. WhatsApp / Telepon (Opsional)
            </label>
            <input
              id="phone"
              name="phone"
              placeholder="Contoh: 081234567890"
              defaultValue={customer?.phone || ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Alamat Lengkap (Opsional)
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              placeholder="Alamat kantor atau domisili pelanggan"
              defaultValue={customer?.address || ""}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-xs"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors shadow-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pelanggan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
