"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import {
  EnvelopeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageDropdown } from "@/components/language-dropdown";
import { requestPasswordResetAction } from "@/actions/auth-actions";

export default function ForgotPasswordPage() {
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await requestPasswordResetAction(email);
      if (!res.success) {
        setError(res.error || (locale === "id" ? "Gagal memproses permintaan." : "Failed to process request."));
      } else {
        setSubmittedEmail(email);
        setSuccessMessage(
          res.message ||
            t.auth?.resetEmailSent ||
            (locale === "id"
              ? "Link reset kata sandi telah dikirim ke email Anda."
              : "Password reset link has been sent to your email.")
        );
      }
    } catch {
      setError(
        locale === "id"
          ? "Terjadi kesalahan sistem. Silakan coba lagi."
          : "System error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    setLoading(true);
    setError("");
    try {
      const res = await requestPasswordResetAction(submittedEmail);
      if (!res.success) {
        setError(res.error || (locale === "id" ? "Gagal mengirim ulang." : "Failed to resend."));
      } else {
        setSuccessMessage(
          res.message ||
            (locale === "id"
              ? "Link baru berhasil dikirimkan ke email Anda."
              : "A new link has been sent to your email.")
        );
      }
    } catch {
      setError(
        locale === "id"
          ? "Terjadi kesalahan sistem. Silakan coba lagi."
          : "System error occurred. Please try again."
      );
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

      {/* Main Card Container */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/40">
          {!submittedEmail ? (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f6b4f] border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                  <EnvelopeIcon className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {t.auth?.forgotPasswordTitle ||
                    (locale === "id" ? "Lupa Kata Sandi?" : "Forgot Password?")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium leading-relaxed">
                  {t.auth?.forgotPasswordSubtitle ||
                    (locale === "id"
                      ? "Masukkan email terdaftar Anda untuk menerima tautan pembuatan kata sandi baru."
                      : "Enter your registered email address to receive a password reset link.")}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                  <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {t.auth?.email || (locale === "id" ? "Alamat Email" : "Email Address")}
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={
                        t.auth?.emailPlaceholder ||
                        (locale === "id" ? "nama@bisnis.com" : "name@company.com")
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] transition-colors text-xs sm:text-sm font-medium min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 px-4 bg-[#0f6b4f] hover:bg-[#0c553e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] min-h-[44px] text-xs sm:text-sm"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                  )}
                  <span>
                    {loading
                      ? t.auth?.sending || (locale === "id" ? "Mengirim..." : "Sending...")
                      : t.auth?.sendResetLink ||
                        (locale === "id" ? "Kirim Link Reset" : "Send Reset Link")}
                  </span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0f6b4f] border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                <CheckCircleIcon className="w-6 h-6 text-[#0f6b4f]" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {locale === "id" ? "Periksa Kotak Masuk Email" : "Check Your Inbox"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {locale === "id" ? (
                  <>
                    Kami telah mengirimkan instruksi dan tautan reset kata sandi ke{" "}
                    <strong className="text-slate-900 break-all">{submittedEmail}</strong>.
                  </>
                ) : (
                  <>
                    We have sent password reset instructions and link to{" "}
                    <strong className="text-slate-900 break-all">{submittedEmail}</strong>.
                  </>
                )}
              </p>

              {error && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs font-semibold flex items-start gap-2 text-left">
                  <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && !error && (
                <p className="mt-3 text-xs font-semibold text-[#0f6b4f]">
                  {successMessage}
                </p>
              )}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
                >
                  {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                  <span>
                    {locale === "id" ? "Kirim Ulang Link Reset" : "Resend Reset Link"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedEmail("");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 min-h-[40px] inline-flex items-center"
                >
                  {locale === "id" ? "Gunakan email lain" : "Use a different email"}
                </button>
              </div>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6b4f] hover:text-[#0c553e] hover:underline min-h-[44px]"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>
                {t.auth?.backToLogin ||
                  (locale === "id" ? "Kembali ke Halaman Masuk" : "Back to Sign In")}
              </span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-2 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium min-h-[44px]"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>
            {locale === "id" ? "Kembali ke Beranda Utama" : "Back to Home"}
          </span>
        </Link>
      </footer>
    </div>
  );
}
