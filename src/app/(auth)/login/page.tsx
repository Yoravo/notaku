"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageDropdown } from "@/components/language-dropdown";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        if (error.status === 403) {
          setError(
            t.auth?.unverifiedEmailError ||
              (locale === "id"
                ? "Email belum diverifikasi. Cek inbox atau coba login lagi nanti."
                : "Email has not been verified yet. Check your inbox or try again.")
          );
        } else {
          setError(
            t.auth?.invalidCredentialsError ||
              (locale === "id"
                ? "Email atau password salah. Silakan periksa kembali."
                : "Invalid email or password. Please check your credentials.")
          );
        }
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(
        locale === "id"
          ? "Terjadi kesalahan sistem. Silakan coba lagi."
          : "System error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setError(
        t.auth?.googleError ||
          (locale === "id"
            ? "Gagal terhubung ke Google. Coba lagi."
            : "Failed to connect to Google. Please try again.")
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Navbar Bar: Brand Link + Language Switcher */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-2 group text-slate-600 hover:text-slate-900 transition-colors min-h-[44px]"
        >
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {t.auth?.loginTitle || (locale === "id" ? "Masuk ke NotaKu" : "Log In to NotaKu")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
              {t.auth?.loginSubtitle ||
                (locale === "id"
                  ? "Kelola invoice dan tagihan bisnis Anda dengan mudah."
                  : "Manage your business invoices and billings with ease.")}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs font-semibold flex items-start gap-2.5 shadow-2xs animate-in fade-in">
              <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700"
                >
                  {t.auth?.password || (locale === "id" ? "Password" : "Password")}
                </label>
              </div>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={
                    t.auth?.passwordPlaceholder ||
                    (locale === "id" ? "Masukkan kata sandi" : "Enter your password")
                  }
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] transition-colors text-xs sm:text-sm font-medium min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 inset-y-0 px-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer min-h-[44px]"
                  aria-label={
                    showPassword
                      ? locale === "id" ? "Sembunyikan password" : "Hide password"
                      : locale === "id" ? "Tampilkan password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#0f6b4f] hover:bg-[#0c553e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] min-h-[44px] text-xs sm:text-sm"
            >
              {loading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              <span>
                {loading
                  ? t.auth?.processing || (locale === "id" ? "Memproses..." : "Processing...")
                  : t.auth?.loginBtn || (locale === "id" ? "Masuk Sekarang" : "Sign In Now")}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.auth?.orDivider || (locale === "id" ? "atau masuk dengan" : "or continue with")}
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2.5 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs active:scale-[0.98] min-h-[44px]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>
              {t.auth?.googleSignIn ||
                (locale === "id" ? "Lanjutkan dengan Google" : "Continue with Google")}
            </span>
          </button>

          {/* Footer Register Link */}
          <p className="mt-6 text-center text-xs text-slate-500 font-medium">
            {t.auth?.noAccount ||
              (locale === "id" ? "Belum punya akun NotaKu?" : "Don't have a NotaKu account?")}{" "}
            <Link
              href="/register"
              className="text-[#0f6b4f] font-bold hover:underline min-h-[32px] inline-flex items-center cursor-pointer"
            >
              {t.auth?.signUpLink || (locale === "id" ? "Daftar Sekarang" : "Sign Up Now")}
            </Link>
          </p>
        </div>
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="text-center py-2 text-[11px] text-slate-400 font-medium">
        © 2026 NotaKu · {t.tagline || (locale === "id" ? "Invoice Generator untuk UMKM & Bisnis Indonesia" : "Professional Invoice Generator")}
      </footer>
    </div>
  );
}
