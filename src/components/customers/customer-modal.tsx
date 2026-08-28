"use client";

import { FormEvent, useState } from "react";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";

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
  onSuccess?: () => void;
}) {
  const { t, locale } = useLanguage();
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
      setError(
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Gagal menyimpan data pelanggan"
          : "Failed to save client profile"
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f6b4f] flex items-center justify-center border border-emerald-100">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {isEdit
                  ? t.customers?.editCustomer || (locale === "id" ? "Edit Profil Pelanggan" : "Edit Client Profile")
                  : t.customers?.addCustomer || (locale === "id" ? "Tambah Pelanggan Baru" : "Add New Client")}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {isEdit
                  ? (locale === "id" ? "Perbarui informasi kontak pelanggan" : "Update client contact information")
                  : (locale === "id" ? "Simpan kontak untuk invoice mendatang" : "Save contact for future invoicing")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 animate-in fade-in">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.customers?.name || (locale === "id" ? "Nama Pelanggan / Perusahaan" : "Client / Company Name")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="name"
                name="name"
                required
                placeholder={locale === "id" ? "Contoh: PT Sumber Rejeki / Budi Santoso" : "e.g. Acme Corp / John Doe"}
                defaultValue={customer?.name || ""}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.customers?.email || "Email"}
            </label>
            <div className="relative">
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="client@company.com"
                defaultValue={customer?.email || ""}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-mono"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.customers?.phone || (locale === "id" ? "No. WhatsApp / Telepon" : "WhatsApp / Phone Number")}
            </label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="phone"
                name="phone"
                placeholder="081234567890"
                defaultValue={customer?.phone || ""}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-mono"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.customers?.address || (locale === "id" ? "Alamat Lengkap" : "Billing Address")}
            </label>
            <div className="relative">
              <MapPinIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                id="address"
                name="address"
                rows={2}
                placeholder={locale === "id" ? "Alamat kantor atau domisili pelanggan" : "Client office or billing address"}
                defaultValue={customer?.address || ""}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs leading-relaxed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
            >
              {locale === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] disabled:opacity-50 transition-all shadow-xs active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{locale === "id" ? "Menyimpan..." : "Saving..."}</span>
                </>
              ) : (
                <span>
                  {isEdit
                    ? locale === "id" ? "Simpan Perubahan" : "Save Changes"
                    : locale === "id" ? "Simpan Pelanggan" : "Save Client"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
