import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordClient } from "./reset-password-client";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Reset Kata Sandi — NotaKu",
  description: "Buat kata sandi baru untuk akun NotaKu Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-4">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-[#0f6b4f] mx-auto" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Memuat halaman reset kata sandi...
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
