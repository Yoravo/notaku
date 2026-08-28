"use client";

import { useState } from "react";
import { requestPayout } from "@/actions/payouts";
import {
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface PayoutRequestModalProps {
  balance: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PayoutRequestModal({
  balance,
  bankName,
  bankAccountNumber,
  bankAccountName,
  isOpen,
  onClose,
}: PayoutRequestModalProps) {
  const [amount, setAmount] = useState<number>(balance);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasBankAccount = Boolean(bankName && bankAccountNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBankAccount) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await requestPayout({
        amount: Number(amount),
        notes: notes || undefined,
      });

      if (!res.success) {
        setError(res.error || "Gagal mengajukan penarikan");
      } else {
        setSuccess(res.message || "Permintaan penarikan berhasil dikirim!");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Tarik Saldo Pendapatan
            </h3>
            <p className="text-xs text-gray-500">
              Saldo tersedia: Rp{balance.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200/60">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200/60">
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {!hasBankAccount ? (
          <div className="mt-5 space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <BuildingLibraryIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Rekening Bank Belum Didaftarkan
              </p>
              <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                Silakan daftarkan rekening bank tujuan pencairan Anda di menu Pengaturan sebelum mengajukan penarikan.
              </p>
            </div>
            <Link
              href="/settings?tab=bank"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Atur Rekening Bank Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Rekening Tujuan Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 text-xs">
              <p className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                Rekening Tujuan Pencairan
              </p>
              <p className="mt-1 font-bold text-gray-900 text-sm">
                {bankName} — {bankAccountNumber}
              </p>
              <p className="text-gray-500">a/n {bankAccountName}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nominal Penarikan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  min="10000"
                  max={balance}
                  step="1000"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="100000"
                  required
                  className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-sm font-semibold text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-500">
                <span>Minimal Rp10.000</span>
                <button
                  type="button"
                  onClick={() => setAmount(balance)}
                  className="font-medium text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Tarik Semua Saldo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pencairan omset mingguan"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading || amount < 10000 || amount > balance}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Memproses..." : "Konfirmasi Tarik"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
