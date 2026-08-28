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
import { useLanguage } from "@/lib/i18n/context";

export function SecurityForm() {
  const { t, locale } = useLanguage();
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
      setError(
        locale === "id"
          ? "Password baru harus minimal 8 karakter"
          : "New password must be at least 8 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        locale === "id"
          ? "Konfirmasi password baru tidak cocok"
          : "Password confirmation does not match"
      );
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
        setError(
          res.error.message ||
            (locale === "id"
              ? "Gagal mengubah kata sandi"
              : "Failed to update password")
        );
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Terjadi kesalahan sistem saat mengubah kata sandi"
          : "System error occurred while updating password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs sm:text-sm">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2.5 shadow-2xs animate-in fade-in"
        >
          <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-[#0f6b4f] flex items-center gap-2.5 font-semibold shadow-2xs animate-in fade-in">
          <CheckCircleIcon className="w-4 h-4 shrink-0 text-[#0f6b4f]" />
          <span>
            {locale === "id"
              ? "Kata sandi Anda berhasil diperbarui!"
              : "Your password has been updated successfully!"}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <LockClosedIcon className="w-4 h-4 text-slate-400" />
            <span>
              {t.settings?.currentPassword || (locale === "id" ? "Kata Sandi Saat Ini" : "Current Password")}{" "}
              <span className="text-rose-500">*</span>
            </span>
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={locale === "id" ? "Masukkan kata sandi lama Anda" : "Enter your current password"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4 text-slate-400" />
              <span>
                {t.settings?.newPassword || (locale === "id" ? "Kata Sandi Baru" : "New Password")}{" "}
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={locale === "id" ? "Minimal 8 karakter" : "At least 8 characters"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4 text-slate-400" />
              <span>
                {t.settings?.confirmPassword || (locale === "id" ? "Ulangi Kata Sandi Baru" : "Confirm New Password")}{" "}
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={locale === "id" ? "Konfirmasi password baru" : "Re-enter new password"}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="revokeSessions"
            checked={revokeOtherSessions}
            onChange={(e) => setRevokeOtherSessions(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f] cursor-pointer"
          />
          <label htmlFor="revokeSessions" className="text-slate-600 font-medium cursor-pointer select-none text-xs leading-snug">
            {locale === "id"
              ? "Keluarkan (logout) semua sesi aktif di perangkat lain setelah mengganti kata sandi"
              : "Log out of all active sessions on other devices after changing password"}
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-xs w-full sm:w-auto min-h-[44px]"
          >
            {loading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {loading
                ? locale === "id" ? "Memperbarui..." : "Updating..."
                : locale === "id" ? "Perbarui Kata Sandi" : "Update Password"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
