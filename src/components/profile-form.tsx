"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";

type Props = {
  name: string;
  businessName: string | null;
  phone: string | null;
  address: string | null;
};

export function ProfileForm({ name, businessName, phone, address }: Props) {
  const [form, setForm] = useState({
    name,
    businessName: businessName ?? "",
    phone: phone ?? "",
    address: address ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({
        name: form.name,
        businessName: form.businessName || null,
        phone: form.phone || null,
        address: form.address || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nama
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nama Bisnis
        </label>
        <input
          name="businessName"
          value={form.businessName}
          onChange={handleChange}
          placeholder="Opsional"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nomor Telepon
        </label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Opsional"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Alamat
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          placeholder="Opsional"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          Profil berhasil disimpan.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
