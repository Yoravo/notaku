"use client";

import { useState } from "react";
import { INDONESIA_BANKS_AND_EWALLETS } from "@/lib/bank-list";
import {
  saveInitialBankAccount,
  requestBankChangeOtp,
  verifyOtpAndUpdateBankAccount,
} from "@/actions/bank-settings";
import {
  BuildingLibraryIcon,
  CreditCardIcon,
  UserIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  KeyIcon,
  EnvelopeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

interface BankSettingsFormProps {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  isLocked: boolean;
  userFullName: string;
}

export function BankSettingsForm({
  bankName,
  bankAccountNumber,
  bankAccountName,
  userFullName,
}: BankSettingsFormProps) {
  // Existing state
  const hasExistingAccount = Boolean(bankName && bankAccountNumber);

  // Form State
  const [formData, setFormData] = useState({
    bankName: bankName || "",
    bankAccountNumber: bankAccountNumber || "",
    bankAccountName: bankAccountName || userFullName || "",
  });

  // Edit / OTP State
  const [isEditing, setIsEditing] = useState(!hasExistingAccount);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [agreeCheck, setAgreeCheck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Handle Simpan Pertama Kali (Initial Setup)
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.bankName) {
      setError("Silakan pilih Bank atau E-Wallet.");
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.trim().length < 4) {
      setError("Nomor rekening minimal 4 digit.");
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.trim().length < 2) {
      setError("Nama pemilik rekening wajib diisi.");
      return;
    }

    setAgreeCheck(false);
    setShowConfirmModal(true);
  };

  const handleConfirmInitialSave = async () => {
    if (!agreeCheck) {
      setError("Anda wajib mencentang persetujuan keabsahan data rekening.");
      return;
    }

    setLoadingSave(true);
    setError(null);

    try {
      const res = await saveInitialBankAccount({
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName,
      });

      if (res.success) {
        setSuccess(res.message);
        setShowConfirmModal(false);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rekening.");
    } finally {
      setLoadingSave(false);
    }
  };

  // 2. Request OTP untuk Ganti Rekening
  const handleRequestOtp = async () => {
    setError(null);
    setSuccess(null);
    setLoadingOtp(true);

    try {
      const res = await requestBankChangeOtp();
      if (!res.success) {
        setError(res.error || "Gagal meminta kode OTP");
      } else {
        setOtpSent(true);
        setSuccess(res.message || "Kode OTP berhasil dikirim!");
      }
    } catch {
      setError("Terjadi gangguan jaringan saat mengirim OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  // 3. Verifikasi OTP dan Update Rekening Baru
  const handleVerifyAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.bankName) {
      setError("Pilih Bank atau E-Wallet baru.");
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 4) {
      setError("Nomor rekening baru minimal 4 digit.");
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.length < 2) {
      setError("Nama pemilik rekening baru wajib diisi.");
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Masukkan 6 digit kode OTP verifikasi email.");
      return;
    }

    setLoadingSave(true);
    try {
      const res = await verifyOtpAndUpdateBankAccount({
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName,
        otpCode: otpCode.trim(),
      });

      if (!res.success) {
        setError(res.error || "Verifikasi OTP gagal");
      } else {
        setSuccess(res.message || "Rekening berhasil diperbarui!");
        setIsEditing(false);
        setOtpSent(false);
        setOtpCode("");
      }
    } catch {
      setError("Gagal memproses pembaruan rekening.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Bank Card Display (Jika Sudah Terdaftar & Tidak Sedang Mode Edit) */}
      {hasExistingAccount && !isEditing && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                <BuildingLibraryIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {bankName}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                    <CheckCircleIcon className="h-3 w-3" />
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Tujuan transfer langsung invoice & penarikan saldo
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setError(null);
                setSuccess(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <PencilSquareIcon className="h-4 w-4 text-gray-500" />
              <span>Ubah Rekening</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
              <span className="text-gray-500 text-[11px]">Nomor Rekening / No HP:</span>
              <p className="font-mono font-bold text-gray-900 text-sm tracking-wider mt-0.5">
                {bankAccountNumber}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
              <span className="text-gray-500 text-[11px]">Atas Nama (Pemilik):</span>
              <p className="font-bold text-gray-900 text-sm uppercase mt-0.5">
                {bankAccountName || userFullName}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <LockClosedIcon className="h-3.5 w-3.5" />
            <span>Perubahan data rekening dilindungi dengan verifikasi OTP email (maks 3x per hari).</span>
          </p>
        </div>
      )}

      {/* Form Card (Mode Setup Baru atau Mode Edit dengan OTP) */}
      {(!hasExistingAccount || isEditing) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header Mode */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f]">
                {hasExistingAccount ? (
                  <KeyIcon className="h-5 w-5" />
                ) : (
                  <ShieldCheckIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {hasExistingAccount
                    ? "Ubah Data Rekening (Verifikasi OTP)"
                    : "Pendaftaran Rekening Pertama Kali"}
                </h3>
                <p className="text-xs text-gray-500">
                  {hasExistingAccount
                    ? "Masukkan rekening baru dan konfirmasi kode OTP yang dikirim ke email Anda"
                    : "Data rekening akan dicetak pada invoice dan digunakan untuk pencairan saldo"}
                </p>
              </div>
            </div>

            {hasExistingAccount && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setOtpSent(false);
                  setError(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                title="Batal Ubah"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs font-medium text-rose-700">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs font-medium text-emerald-800">
              <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Main Form Fields */}
          <form
            onSubmit={
              hasExistingAccount ? handleVerifyAndUpdate : handleInitialSubmit
            }
            className="space-y-4"
          >
            {/* Bank / E-Wallet Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Bank / E-Wallet Tujuan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <BuildingLibraryIcon className="w-5 h-5" />
                </div>
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-medium text-gray-900 focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
                  required
                >
                  <option value="">-- Pilih Bank / E-Wallet --</option>
                  <optgroup label="Bank Nasional & Digital">
                    {INDONESIA_BANKS_AND_EWALLETS.filter(
                      (b) => b.category === "BANK"
                    ).map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="E-Wallet">
                    {INDONESIA_BANKS_AND_EWALLETS.filter(
                      (b) => b.category === "EWALLET"
                    ).map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nomor Rekening / No HP E-Wallet <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890 atau 081234567890"
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-mono font-medium text-gray-900 focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] tracking-wider"
                  required
                />
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nama Pemilik Rekening (Atas Nama) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: BUDI SANTOSO"
                  value={formData.bankAccountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccountName: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-medium text-gray-900 focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] uppercase"
                  required
                />
              </div>
            </div>

            {/* Section OTP Khusus Mode Ubah Rekening */}
            {hasExistingAccount && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Kode Verifikasi OTP Email <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Maksimal 3 permintaan kode per 24 jam demi keamanan akun.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loadingOtp}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    {loadingOtp ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                    )}
                    <span>{otpSent ? "Kirim Ulang OTP" : "Minta Kode OTP"}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-4 text-center text-lg font-mono font-bold tracking-widest text-gray-900 focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Action Submit */}
            <div className="pt-2 flex gap-2.5">
              {hasExistingAccount && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setOtpSent(false);
                  }}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                disabled={loadingSave || (hasExistingAccount && !otpCode)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loadingSave ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : hasExistingAccount ? (
                  <span>Verifikasi OTP & Simpan Rekening</span>
                ) : (
                  <span>Simpan Data Rekening</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Strict Confirmation Modal untuk Pendaftaran Awal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Konfirmasi Kebenaran Rekening
                  </h3>
                  <p className="text-xs text-gray-500">
                    Periksa kembali kebenaran nomor rekening Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Rekap Card */}
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank / E-Wallet:</span>
                <span className="font-bold text-gray-900">{formData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nomor Rekening:</span>
                <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                  {formData.bankAccountNumber}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200/60 pt-2">
                <span className="text-gray-500">Atas Nama (Pemilik):</span>
                <span className="font-bold text-gray-900 uppercase">
                  {formData.bankAccountName}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeCheck}
                  onChange={(e) => setAgreeCheck(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
                />
                <span className="text-xs text-gray-700 leading-snug">
                  Saya menyatakan bahwa data rekening di atas adalah benar milik saya dan siap digunakan untuk penerimaan pembayaran.
                </span>
              </label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={!agreeCheck || loadingSave}
                onClick={handleConfirmInitialSave}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c5740] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                {loadingSave ? (
                  <>
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Konfirmasi & Simpan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
