"use client";

import { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: () => void;
          onPending: () => void;
          onError: () => void;
          onClose: () => void;
        },
      ) => void;
    };
  }
}

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    );
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/payment/create", { method: "POST" });
      const { token } = await res.json();

      if (!token) {
        alert("Gagal membuat pembayaran. Coba lagi.");
        setLoading(false);
        return;
      }

      window.snap.pay(token, {
        onSuccess: async () => {
          // Verifikasi & update subscription langsung
          const verify = await fetch("/api/payment/verify");
          const result = await verify.json();
          if (result.status === "activated") {
            alert("Pembayaran berhasil! Akun kamu sekarang Pro");
          }
          window.location.reload();
        },
        onPending: () => {
          alert("Pembayaran sedang diproses. Status akan diperbarui otomatis.");
          onClose();
        },
        onError: () => {
          alert("Pembayaran gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Upgrade ke Pro</h2>
        <p className="mt-2 text-sm text-gray-600">
          Dapatkan akses unlimited invoice, custom branding, dan fitur premium
          lainnya.
        </p>

        <div className="mt-4 rounded-md bg-blue-50 p-4">
          <p className="text-2xl font-bold text-gray-900">
            Rp49.000
            <span
              className="text-sm font-normal
  text-gray-500"
            >
              /bulan
            </span>
          </p>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-green-600"><CheckIcon className="h-4 w-4" /></span> Invoice unlimited
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600"><CheckIcon className="h-4 w-4" /></span> Custom logo & branding
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600"><CheckIcon className="h-4 w-4" /></span> Template premium
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600"><CheckIcon className="h-4 w-4" /></span> Tanpa watermark
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600"><CheckIcon className="h-4 w-4" /></span> Laporan bulanan
          </li>
        </ul>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100
  transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer
  hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
