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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();
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
      setError(locale === "id" ? "Silakan pilih Bank atau E-Wallet." : "Please select a Bank or E-Wallet.");
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.trim().length < 4) {
      setError(locale === "id" ? "Nomor rekening minimal 4 digit." : "Account number must be at least 4 digits.");
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.trim().length < 2) {
      setError(locale === "id" ? "Nama pemilik rekening wajib diisi." : "Account holder name is required.");
      return;
    }

    setAgreeCheck(false);
    setShowConfirmModal(true);
  };

  const handleConfirmInitialSave = async () => {
    if (!agreeCheck) {
      setError(
        locale === "id"
          ? "Anda wajib mencentang persetujuan keabsahan data rekening."
          : "You must check the agreement confirming account details are valid."
      );
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
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Gagal menyimpan rekening."
          : "Failed to save bank account."
      );
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
        setError(res.error || (locale === "id" ? "Gagal meminta kode OTP" : "Failed to request OTP code"));
      } else {
        setOtpSent(true);
        setSuccess(res.message || (locale === "id" ? "Kode OTP berhasil dikirim!" : "OTP code sent successfully!"));
      }
    } catch {
      setError(locale === "id" ? "Terjadi gangguan jaringan saat mengirim OTP." : "Network error while requesting OTP.");
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
      setError(locale === "id" ? "Pilih Bank atau E-Wallet baru." : "Please choose a new Bank or E-Wallet.");
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 4) {
      setError(locale === "id" ? "Nomor rekening baru minimal 4 digit." : "Account number must be at least 4 digits.");
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.length < 2) {
      setError(locale === "id" ? "Nama pemilik rekening baru wajib diisi." : "Account holder name is required.");
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setError(locale === "id" ? "Masukkan 6 digit kode OTP verifikasi email." : "Enter the 6-digit OTP verification code.");
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
        setError(res.error || (locale === "id" ? "Verifikasi OTP gagal" : "OTP verification failed"));
      } else {
        setSuccess(res.message || (locale === "id" ? "Rekening berhasil diperbarui!" : "Bank account updated successfully!"));
        setIsEditing(false);
        setOtpSent(false);
        setOtpCode("");
      }
    } catch {
      setError(locale === "id" ? "Gagal memproses pembaruan rekening." : "Failed to process bank account update.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Bank Card Display */}
      {hasExistingAccount && !isEditing && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60">
                <BuildingLibraryIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {bankName}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0f6b4f] border border-emerald-200/60 shadow-2xs">
                    <CheckCircleIcon className="h-3 w-3" />
                    {locale === "id" ? "Terverifikasi" : "Verified"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {locale === "id" ? "Tujuan transfer langsung invoice & penarikan saldo" : "Destination for invoice payments & fund withdrawals"}
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
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer min-h-[44px] sm:min-h-[38px]"
            >
              <PencilSquareIcon className="h-4 w-4 text-slate-400" />
              <span>{locale === "id" ? "Ubah Rekening" : "Change Account"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/60 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">{locale === "id" ? "Nomor Rekening / No HP:" : "Account / Phone Number:"}</span>
              <p className="font-mono font-bold text-slate-900 text-sm tracking-wider mt-0.5">
                {bankAccountNumber}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/60 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">{t.invoices?.accountHolder || (locale === "id" ? "Atas Nama (Pemilik):" : "Account Holder:")}</span>
              <p className="font-bold text-slate-900 text-sm uppercase mt-0.5">
                {bankAccountName || userFullName}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <LockClosedIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {locale === "id"
                ? "Perubahan data rekening dilindungi dengan verifikasi OTP email (maks 3x per hari)."
                : "Account modifications are protected via Email OTP verification (max 3x per day)."}
            </span>
          </p>
        </div>
      )}

      {/* Form Card (Setup or Edit with OTP) */}
      {(!hasExistingAccount || isEditing) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60">
                {hasExistingAccount ? (
                  <KeyIcon className="h-5 w-5" />
                ) : (
                  <ShieldCheckIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {hasExistingAccount
                    ? (locale === "id" ? "Ubah Data Rekening (Verifikasi OTP)" : "Update Account (Email OTP)")
                    : (locale === "id" ? "Pendaftaran Rekening Pertama Kali" : "First-Time Bank Registration")}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {hasExistingAccount
                    ? (locale === "id" ? "Masukkan rekening baru dan konfirmasi kode OTP yang dikirim ke email Anda" : "Enter new bank details and confirm with the OTP sent to your email")
                    : (locale === "id" ? "Data rekening akan dicetak pada invoice dan digunakan untuk pencairan saldo" : "Account details will be printed on invoices and used for payouts")}
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
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                title={locale === "id" ? "Batal Ubah" : "Cancel Edit"}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs font-semibold text-rose-700 shadow-2xs animate-in fade-in">
              <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs font-semibold text-[#0f6b4f] shadow-2xs animate-in fade-in">
              <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5 text-[#0f6b4f]" />
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {locale === "id" ? "Bank / E-Wallet Tujuan" : "Target Bank / E-Wallet"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BuildingLibraryIcon className="w-5 h-5" />
                </div>
                <select
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bankName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
                  required
                >
                  <option value="">{locale === "id" ? "-- Pilih Bank / E-Wallet --" : "-- Select Bank / E-Wallet --"}</option>
                  <optgroup label={locale === "id" ? "Bank Nasional & Digital" : "National & Digital Banks"}>
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {locale === "id" ? "Nomor Rekening / No HP E-Wallet" : "Account Number / E-Wallet Phone"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={locale === "id" ? "Contoh: 1234567890 atau 081234567890" : "e.g. 1234567890 or 081234567890"}
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccountNumber: e.target.value.replace(/[^0-9]/g, ""),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] tracking-wider shadow-2xs min-h-[44px] sm:min-h-[40px]"
                  required
                />
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.invoices?.accountHolder || (locale === "id" ? "Nama Pemilik Rekening (Atas Nama)" : "Account Holder Name")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={locale === "id" ? "Contoh: BUDI SANTOSO" : "e.g. JOHN DOE"}
                  value={formData.bankAccountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccountName: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] uppercase shadow-2xs min-h-[44px] sm:min-h-[40px]"
                  required
                />
              </div>
            </div>

            {/* OTP Section for Edit Mode */}
            {hasExistingAccount && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {locale === "id" ? "Kode Verifikasi OTP Email" : "Email OTP Verification Code"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {locale === "id"
                        ? "Maksimal 3 permintaan kode per 24 jam demi keamanan akun."
                        : "Maximum 3 OTP requests per 24 hours for account security."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loadingOtp}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-emerald-300 px-3 py-1.5 text-xs font-bold text-[#0f6b4f] hover:bg-emerald-50 disabled:opacity-50 transition-all cursor-pointer shadow-2xs shrink-0 min-h-[40px] sm:min-h-[34px]"
                  >
                    {loadingOtp ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {otpSent
                        ? locale === "id" ? "Kirim Ulang OTP" : "Resend OTP"
                        : locale === "id" ? "Minta Kode OTP" : "Request OTP Code"}
                    </span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs"
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
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs min-h-[44px]"
                >
                  {locale === "id" ? "Batal" : "Cancel"}
                </button>
              )}

              <button
                type="submit"
                disabled={loadingSave || (hasExistingAccount && !otpCode)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c553e] disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer min-h-[44px]"
              >
                {loadingSave ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>{locale === "id" ? "Memproses..." : "Processing..."}</span>
                  </>
                ) : hasExistingAccount ? (
                  <span>{locale === "id" ? "Verifikasi OTP & Simpan Rekening" : "Verify OTP & Save Account"}</span>
                ) : (
                  <span>{locale === "id" ? "Simpan Data Rekening" : "Save Bank Account"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal for First-time Setup */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {locale === "id" ? "Konfirmasi Kebenaran Rekening" : "Confirm Account Details"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {locale === "id" ? "Periksa kembali kebenaran nomor rekening Anda" : "Please double-check your account details"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Recap Card */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-2.5 text-xs shadow-2xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{locale === "id" ? "Bank / E-Wallet:" : "Bank / E-Wallet:"}</span>
                <span className="font-bold text-slate-900">{formData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{locale === "id" ? "Nomor Rekening:" : "Account Number:"}</span>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                  {formData.bankAccountNumber}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium">{locale === "id" ? "Atas Nama (Pemilik):" : "Account Holder:"}</span>
                <span className="font-bold text-slate-900 uppercase">
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
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
                />
                <span className="text-xs text-slate-700 font-medium leading-snug">
                  {locale === "id"
                    ? "Saya menyatakan bahwa data rekening di atas adalah benar milik saya dan siap digunakan untuk penerimaan pembayaran."
                    : "I hereby declare that the account information above is valid, belongs to me, and is authorized for invoice payouts."}
                </span>
              </label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
              >
                {locale === "id" ? "Periksa Lagi" : "Review Again"}
              </button>
              <button
                type="button"
                disabled={!agreeCheck || loadingSave}
                onClick={handleConfirmInitialSave}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer shadow-xs active:scale-[0.98] min-h-[44px]"
              >
                {loadingSave ? (
                  <>
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === "id" ? "Menyimpan..." : "Saving..."}</span>
                  </>
                ) : (
                  <span>{locale === "id" ? "Konfirmasi & Simpan" : "Confirm & Save"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
