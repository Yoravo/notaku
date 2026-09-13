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
import { useTranslations } from "next-intl";

export function SecurityForm() {
  const tSet = useTranslations("settings");
  const tSec = useTranslations("security");
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
      setError(tSec("minCharsError"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(tSec("mismatchError"));
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
        setError(res.error.message || tSec("updateFailed"));
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError(tSec("systemError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0f6b4f] flex items-center justify-center border border-emerald-100">
          <KeyIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {tSet("tabSecurity")}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {tSec("subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-center gap-2 font-medium"
          >
            <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-[#0f6b4f] flex items-center gap-2 font-semibold shadow-2xs">
            <CheckCircleIcon className="w-4 h-4 shrink-0 text-[#0f6b4f]" />
            <span>
              {tSec("successAlert")}
            </span>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            {tSet("currentPassword")}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setError(null);
              }}
              placeholder={tSet("currentPasswordPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            {tSet("newPassword")}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(null);
              }}
              placeholder={tSet("newPasswordPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            {tSet("confirmPassword")}{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              placeholder={tSet("confirmPasswordPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Revoke other sessions checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={revokeOtherSessions}
              onChange={(e) => setRevokeOtherSessions(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f] cursor-pointer"
            />
            <div>
              <p className="text-xs font-semibold text-slate-700">
                {tSec("revokeLabel")}
              </p>
              <p className="text-[11px] text-slate-500">
                {tSec("revokeDesc")}
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white cursor-pointer hover:bg-[#0c553e] disabled:opacity-50 transition-all shadow-xs active:scale-[0.98]"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>{tSet("saving")}</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-4 h-4" />
                <span>{tSet("saveChanges")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
