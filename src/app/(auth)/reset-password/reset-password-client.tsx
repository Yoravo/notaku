"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { LanguageDropdown } from "@/components/language-dropdown";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const tAuth = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "INVALID_TOKEN" ? tAuth("invalidResetToken") : ""
  );
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(tAuth("invalidResetToken"));
      return;
    }

    if (password.length < 8) {
      setError(tAuth("passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(tAuth("passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setError(error.message || tAuth("invalidResetToken"));
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch {
      setError(tAuth("invalidResetToken"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Header: Brand Link + Language Switcher */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          prefetch={true}
          className="flex items-center gap-1.5 group text-slate-600 hover:text-slate-900 transition-colors min-h-[44px]"
        >
          <Image
            src="/logo.png"
            alt="NotaKu Logo"
            width={28}
            height={28}
            className="w-7 h-7 object-contain shrink-0"
          />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Nota<span className="text-[#0f6b4f]">Ku</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageDropdown />
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f6b4f] border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                  <KeyIcon className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {tAuth("resetPasswordTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
                  {tAuth("resetPasswordSubtitle")}
                </p>
              </div>

              {!token && !error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-2xs">
                  <ExclamationCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{tAuth("invalidResetToken")}</span>
                </div>
              )}

              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                  <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {tAuth("newPassword")}
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={tAuth("passwordPlaceholder")}
                      className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] transition-colors text-xs sm:text-sm font-medium min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 inset-y-0 px-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer min-h-[44px]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {tAuth("confirmPassword")}
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={tAuth("passwordPlaceholder")}
                      className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] transition-colors text-xs sm:text-sm font-medium min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 inset-y-0 px-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer min-h-[44px]"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-2.5 px-4 bg-[#0f6b4f] hover:bg-[#0c553e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] min-h-[44px] text-xs sm:text-sm mt-2"
                >
                  {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading ? tAuth("processing") : tAuth("resetPasswordBtn")}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f6b4f] border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <CheckCircleIcon className="w-6 h-6 text-[#0f6b4f]" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {tAuth("resetPasswordTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {tAuth("passwordResetSuccess")}
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  prefetch={true}
                  className="w-full py-2.5 px-4 bg-[#0f6b4f] hover:bg-[#0c553e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px] text-xs sm:text-sm"
                >
                  <span>{tAuth("loginBtn")}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/login"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] hover:text-[#0c553e] hover:underline min-h-[44px]"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>{tAuth("backToLogin")}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="w-full max-w-6xl mx-auto py-2 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} NotaKu &bull; Simple & Fast Invoicing
      </footer>
    </div>
  );
}
