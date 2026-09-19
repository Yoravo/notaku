"use client";

import { useState } from "react";
import { updateProfile, updateNewsletterPreference } from "@/actions/user";
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassMinusIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  PencilSquareIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { SignaturePadModal } from "@/components/signature-pad-modal";
import { useTranslations } from "next-intl";

type Props = {
  name: string;
  businessName: string | null;
  phone: string | null;
  address: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  email: string;
  receiveNewsletter?: boolean;
};

export function ProfileForm({
  name,
  businessName,
  phone,
  address,
  logoUrl,
  signatureUrl,
  stampUrl,
  email,
  receiveNewsletter = true,
}: Props) {
  const tSet = useTranslations("settings");
  const tProf = useTranslations("profile");
  const [form, setForm] = useState({
    name,
    businessName: businessName ?? "",
    phone: phone ?? "",
    address: address ?? "",
    logoUrl: logoUrl ?? "",
    signatureUrl: signatureUrl ?? "",
    stampUrl: stampUrl ?? "",
  });
  const [optInNewsletter, setOptInNewsletter] = useState(receiveNewsletter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Modal crop / custom resize (target: logo | signature | stamp)
  const [cropTarget, setCropTarget] = useState<"logo" | "signature" | "stamp">("logo");
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "signature" | "stamp",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(tProf("maxFileSize", { target }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropTarget(target);
      setTempImage(event.target?.result as string);
      setScale(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleApplyCrop = () => {
    if (!tempImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 500;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const finalDataUrl = canvas.toDataURL("image/png");
        if (cropTarget === "logo") {
          setForm((prev) => ({ ...prev, logoUrl: finalDataUrl }));
        } else if (cropTarget === "signature") {
          setForm((prev) => ({ ...prev, signatureUrl: finalDataUrl }));
        } else if (cropTarget === "stamp") {
          setForm((prev) => ({ ...prev, stampUrl: finalDataUrl }));
        }
        setTempImage(null);
        setError(null);
      }
    };
    img.src = tempImage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await Promise.all([
        updateProfile({
          name: form.name.trim(),
          businessName: form.businessName.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          logoUrl: form.logoUrl.trim() || null,
          signatureUrl: form.signatureUrl.trim() || null,
          stampUrl: form.stampUrl.trim() || null,
        }),
        updateNewsletterPreference(optInNewsletter),
      ]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : tProf("saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          <span>{tProf("saveSuccess")}</span>
        </div>
      )}

      {/* Business Logo Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          {tProf("logoLabel")}
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Business Logo"
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <PhotoIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs min-h-[44px] sm:min-h-[38px]">
                <span>
                  {form.logoUrl ? tProf("logoChange") : tProf("logoSelect")}
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  className="hidden"
                />
              </label>

              {form.logoUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCropTarget("logo");
                      setTempImage(form.logoUrl);
                      setScale(1);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 bg-white cursor-pointer inline-flex items-center gap-1.5 shadow-2xs min-h-[44px] sm:min-h-[38px]"
                  >
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{tProf("adjustSize")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-h-[44px] sm:min-h-[38px]"
                  >
                    {tProf("removeLogo")}
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              {tProf("logoHint")}
            </p>
          </div>
        </div>
      </div>

      {/* Digital Signature & Stamp Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Digital Signature */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {tProf("signatureLabel")}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {form.signatureUrl ? (
                <img
                  src={form.signatureUrl}
                  alt="Signature"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] text-slate-400 font-medium text-center px-1">
                  {tProf("noSignature")}
                </span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="cursor-pointer inline-flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-[#0f6b4f] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-2xs min-h-[44px] sm:min-h-[38px]"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  <span>
                    {form.signatureUrl ? tProf("redrawSignature") : tProf("drawSignature")}
                  </span>
                </button>

                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs min-h-[44px] sm:min-h-[38px]">
                  <span>{tProf("uploadFile")}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => handleFileUpload(e, "signature")}
                    className="hidden"
                  />
                </label>
              </div>

              {form.signatureUrl && (
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCropTarget("signature");
                      setTempImage(form.signatureUrl);
                      setScale(1);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    {tProf("resize")}
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, signatureUrl: "" }))}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    {tProf("remove")}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {tProf("signatureHint")}
          </p>
        </div>

        {/* Digital Business Stamp */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {tProf("stampLabel")}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {form.stampUrl ? (
                <img
                  src={form.stampUrl}
                  alt="Company Stamp"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] text-slate-400 font-medium text-center px-1">
                  {tProf("noStamp")}
                </span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs min-h-[44px] sm:min-h-[38px]">
                <span>
                  {form.stampUrl ? tProf("changeStamp") : tProf("uploadStamp")}
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload(e, "stamp")}
                  className="hidden"
                />
              </label>
              {form.stampUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, stampUrl: "" }))}
                  className="block text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  {tProf("removeStamp")}
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {tProf("stampHint")}
          </p>
        </div>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={(dataUrl) => {
          setForm((prev) => ({ ...prev, signatureUrl: dataUrl }));
          setError(null);
        }}
      />

      {/* Custom Resize & Crop Modal */}
      {tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {tProf("cropTitle")}{" "}
                  {cropTarget === "logo"
                    ? tProf("targetLogo")
                    : cropTarget === "signature"
                    ? tProf("targetSignature")
                    : tProf("targetStamp")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {tProf("cropGuide")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer min-h-[44px] sm:min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box with Drag */}
            <div
              className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-900/5 dark:bg-slate-950/40 flex items-center justify-center overflow-hidden cursor-move select-none"
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
              }}
              onMouseMove={(e) => {
                if (isDragging) {
                  setOffsetX(e.clientX - dragStart.x);
                  setOffsetY(e.clientY - dragStart.y);
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                if (touch) {
                  setIsDragging(true);
                  setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
                }
              }}
              onTouchMove={(e) => {
                if (isDragging) {
                  const touch = e.touches[0];
                  if (touch) {
                    setOffsetX(touch.clientX - dragStart.x);
                    setOffsetY(touch.clientY - dragStart.y);
                  }
                }
              }}
              onTouchEnd={() => setIsDragging(false)}
            >
              <img
                src={tempImage}
                alt="Crop preview"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.05s ease-out",
                }}
                className="max-w-none max-h-40 sm:max-h-48 object-contain pointer-events-none"
              />

              {/* Target Overlay Guide */}
              <div className="absolute inset-4 pointer-events-none border border-[#0f6b4f]/40 rounded-xl flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0f6b4f] bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-md shadow-xs">
                  {tProf("pdfPrintArea")}
                </span>
              </div>
            </div>

            {/* Scale Control Slider */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold flex items-center gap-1">
                  <MagnifyingGlassMinusIcon className="w-4 h-4 text-slate-400" />
                  {tProf("sizeZoom")}
                </span>
                <span className="font-mono text-[#0f6b4f] dark:text-emerald-400 font-bold">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0f6b4f]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer min-h-[44px] sm:min-h-[38px]"
              >
                {tProf("cancel")}
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0f6b4f] hover:bg-[#0c553e] rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] sm:min-h-[38px]"
              >
                {tProf("applyImage")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal & Business Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>{tProf("fullName")}</span> <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BuildingOfficeIcon className="w-4 h-4 text-slate-400" />
            <span>{tSet("businessName")}</span>
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder={tProf("businessNamePlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            {tProf("accountEmail")}
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-slate-500 font-mono text-xs cursor-not-allowed shadow-2xs min-h-[44px] sm:min-h-[40px]"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <PhoneIcon className="w-4 h-4 text-slate-400" />
            <span>{tSet("businessPhone")}</span>
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={tProf("phonePlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-mono min-h-[44px] sm:min-h-[40px]"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
          <MapPinIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{tSet("businessAddress")}</span>
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          placeholder={tProf("addressPlaceholder")}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs leading-relaxed"
        />
      </div>

      {/* Preferensi Email & Komunikasi Resmi */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-4 sm:p-5 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={optInNewsletter}
            onChange={(e) => setOptInNewsletter(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[#0f6b4f] focus:ring-[#0f6b4f]"
          />
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <EnvelopeIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{tProf("newsletterTitle")}</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
              {tProf("newsletterDesc")}
            </span>
          </div>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0c553e] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-xs w-full sm:w-auto min-h-[44px]"
        >
          {loading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-emerald-200" />
          )}
          <span>
            {loading ? tSet("saving") : tSet("saveChanges")}
          </span>
        </button>
      </div>
    </form>
  );
}
