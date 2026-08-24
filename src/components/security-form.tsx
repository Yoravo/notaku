"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Password baru harus minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions,
      });

      if (res.error) {
        setError(res.error.message || "Gagal mengubah kata sandi");
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan sistem saat mengubah kata sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs sm:text-sm">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2"
        >
          <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Kata sandi Anda berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <LockClosedIcon className="w-4 h-4 text-gray-400" />
            Kata Sandi Saat Ini <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan kata sandi lama Anda"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4 text-gray-400" />
              Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4 text-gray-400" />
              Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="revokeSessions"
            checked={revokeOtherSessions}
            onChange={(e) => setRevokeOtherSessions(e.target.checked)}
            className="w-4 h-4 rounded text-[#0f6b4f] focus:ring-[#0f6b4f] border-gray-300 cursor-pointer"
          />
          <label htmlFor="revokeSessions" className="text-gray-700 font-medium cursor-pointer select-none text-xs">
            Keluarkan (logout) semua sesi aktif di perangkat lain setelah mengganti kata sandi
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs w-full sm:w-auto"
          >
            {loading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            )}
            <span>{loading ? "Memperbarui..." : "Perbarui Kata Sandi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
