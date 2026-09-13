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
import { useTranslations } from "next-intl";

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
  const tBank = useTranslations("bank");
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
      setError(tBank("selectBankError"));
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.trim().length < 4) {
      setError(tBank("accNumberMinError"));
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.trim().length < 2) {
      setError(tBank("accHolderRequiredError"));
      return;
    }

    setAgreeCheck(false);
    setShowConfirmModal(true);
  };

  const handleConfirmInitialSave = async () => {
    if (!agreeCheck) {
      setError(tBank("agreementRequiredError"));
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
          : tBank("saveFailed")
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
        setError(res.error || tBank("requestOtpFailed"));
      } else {
        setOtpSent(true);
        setSuccess(res.message || tBank("otpSentSuccess"));
      }
    } catch {
      setError(tBank("otpNetworkError"));
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
      setError(tBank("selectBankNewError"));
      return;
    }
    if (!formData.bankAccountNumber || formData.bankAccountNumber.length < 4) {
      setError(tBank("accNumberNewMinError"));
      return;
    }
    if (!formData.bankAccountName || formData.bankAccountName.length < 2) {
      setError(tBank("accHolderNewRequiredError"));
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setError(tBank("otpLengthError"));
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
        setError(res.error || tBank("otpVerificationFailed"));
      } else {
        setSuccess(res.message || tBank("bankAccountUpdatedSuccess"));
        setIsEditing(false);
        setOtpSent(false);
        setOtpCode("");
      }
    } catch {
      setError(tBank("updateFailed"));
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
                    {tBank("cardTitleVerified")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {tBank("cardDescription")}
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
              <span>{tBank("changeAccountBtn")}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/60 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">{tBank("accountNumberCardLabel")}</span>
              <p className="font-mono font-bold text-slate-900 text-sm tracking-wider mt-0.5">
                {bankAccountNumber}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-200/60 shadow-2xs">
              <span className="text-slate-500 text-[11px] font-semibold">{tBank("accountHolderCardLabel")}</span>
              <p className="font-bold text-slate-900 text-sm uppercase mt-0.5">
                {bankAccountName || userFullName}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <LockClosedIcon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {tBank("otpSecurityNotice")}
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
                    ? tBank("editTitle")
                    : tBank("initialTitle")}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {hasExistingAccount
                    ? tBank("editSubtitle")
                    : tBank("initialSubtitle")}
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
                title={tBank("cancelEdit")}
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
                {tBank("targetBankLabel")}{" "}
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
                  <option value="">{tBank("selectBankPlaceholder")}</option>
                  <optgroup label={tBank("nationalBankGroup")}>
                    {INDONESIA_BANKS_AND_EWALLETS.filter(
                      (b) => b.category === "BANK"
                    ).map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={tBank("ewalletGroup")}>
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
                {tBank("accountNumberFieldLabel")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={tBank("accountNumberPlaceholder")}
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
                {tBank("accountHolderFieldLabel")}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={tBank("accountHolderPlaceholder")}
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
                      {tBank("otpFieldLabel")}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {tBank("otpFieldHint")}
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
                        ? tBank("resendOtp")
                        : tBank("requestOtp")}
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
                  {tBank("cancel")}
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
                    <span>{tBank("processing")}</span>
                  </>
                ) : hasExistingAccount ? (
                  <span>{tBank("verifyOtpAndSave")}</span>
                ) : (
                  <span>{tBank("saveBankAccount")}</span>
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
                    {tBank("confirmModalTitle")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {tBank("confirmModalSubtitle")}
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
                <span className="text-slate-500 font-medium">{tBank("confirmBankLabel")}</span>
                <span className="font-bold text-slate-900">{formData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{tBank("confirmAccNumberLabel")}</span>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                  {formData.bankAccountNumber}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500 font-medium">{tBank("confirmAccHolderLabel")}</span>
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
                  {tBank("agreeDeclaration")}
                </span>
              </label>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer min-h-[44px]"
              >
                {tBank("reviewAgain")}
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
                    <span>{tBank("saving")}</span>
                  </>
                ) : (
                  <span>{tBank("confirmAndSave")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
