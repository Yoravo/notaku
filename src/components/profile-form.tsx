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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();
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
      setError(
        locale === "id"
          ? `Ukuran file ${target} maksimal 5MB`
          : `${target} file size max 5MB`
      );
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
      setError(
        err instanceof Error
          ? err.message
          : locale === "id"
          ? "Terjadi kesalahan saat menyimpan profil"
          : "Error occurred while saving profile"
      );
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
          <span>
            {locale === "id"
              ? "Profil dan identitas bisnis berhasil diperbarui!"
              : "Business profile and identities updated successfully!"}
          </span>
        </div>
      )}

      {/* Business Logo Section */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          {locale === "id" ? "Logo Bisnis / Toko (Header Invoice)" : "Business / Store Logo (Invoice Header)"}
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
                  {form.logoUrl
                    ? locale === "id" ? "Ganti Logo" : "Change Logo"
                    : locale === "id" ? "Pilih Gambar" : "Select Image"}
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
                    <span>{locale === "id" ? "Sesuaikan Ukuran" : "Adjust Size"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-h-[44px] sm:min-h-[38px]"
                  >
                    {locale === "id" ? "Hapus Logo" : "Remove Logo"}
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              {locale === "id"
                ? "Format PNG/JPG/WebP, maks 5MB. Ditampilkan di header/kop faktur."
                : "PNG/JPG/WebP format, max 5MB. Rendered in invoice header."}
            </p>
          </div>
        </div>
      </div>

      {/* Digital Signature & Stamp Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Digital Signature */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {locale === "id" ? "Tanda Tangan Digital (Bawah PDF)" : "Digital Signature (PDF Footer)"}
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
                  {locale === "id" ? "Tanpa TTD" : "No Signature"}
                </span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="cursor-pointer inline-flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-[#0f6b4f] hover:bg-emerald-100 transition-all shadow-2xs min-h-[38px]"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  <span>
                    {form.signatureUrl
                      ? locale === "id" ? "Gores Ulang" : "Redraw"
                      : locale === "id" ? "Buat TTD (Draw)" : "Draw Signature"}
                  </span>
                </button>

                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs min-h-[38px]">
                  <span>{locale === "id" ? "Unggah File" : "Upload File"}</span>
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
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    {locale === "id" ? "Atur Ukuran" : "Resize"}
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, signatureUrl: "" }))}
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    {locale === "id" ? "Hapus" : "Remove"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {locale === "id"
              ? "Goreskan tanda tangan langsung dengan jari/mouse, atau unggah foto/scan tanda tangan."
              : "Draw directly with touch/mouse, or upload an image of your signature."}
          </p>
        </div>

        {/* Digital Business Stamp */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {locale === "id" ? "Stempel Toko / Bisnis (Cap PDF)" : "Company Stamp (Official Seal)"}
          </label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {form.stampUrl ? (
                <img
                  src={form.stampUrl}
                  alt="Company Stamp"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] text-slate-400 font-medium text-center px-1">
                  {locale === "id" ? "Tanpa Cap" : "No Stamp"}
                </span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs min-h-[38px]">
                <span>
                  {form.stampUrl
                    ? locale === "id" ? "Ganti Cap" : "Change Stamp"
                    : locale === "id" ? "Unggah Cap" : "Upload Stamp"}
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
                  {locale === "id" ? "Hapus Cap" : "Remove Stamp"}
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {locale === "id"
              ? "Unggah stempel cap digital untuk dicetak menimpa area tanda tangan faktur."
              : "Upload a digital stamp to overlay above the signature block on invoice PDFs."}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {locale === "id" ? "Sesuaikan & Resize" : "Adjust & Resize"}{" "}
                  {cropTarget === "logo"
                    ? locale === "id" ? "Logo" : "Logo"
                    : cropTarget === "signature"
                    ? locale === "id" ? "Tanda Tangan" : "Signature"
                    : locale === "id" ? "Stempel Cap" : "Stamp"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {locale === "id"
                    ? "Geser dan atur perbesaran gambar agar pas dicetak pada faktur"
                    : "Drag and zoom image to fit properly on PDF printouts"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box with Drag */}
            <div
              className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-slate-300 bg-slate-900/5 flex items-center justify-center overflow-hidden cursor-move select-none"
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
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0f6b4f] bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                  {locale === "id" ? "Area Cetak PDF" : "PDF Print Area"}
                </span>
              </div>
            </div>

            {/* Scale Control Slider */}
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-bold flex items-center gap-1">
                  <MagnifyingGlassMinusIcon className="w-4 h-4 text-slate-400" />
                  {locale === "id" ? "Ukuran / Zoom" : "Size / Zoom"}
                </span>
                <span className="font-mono text-[#0f6b4f] font-bold">
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
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f6b4f]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline shrink-0 cursor-pointer"
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[44px] sm:min-h-[38px]"
              >
                {locale === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0f6b4f] hover:bg-[#0c553e] rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] sm:min-h-[38px]"
              >
                {locale === "id" ? "Terapkan Gambar" : "Apply Image"}
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
            <span>{locale === "id" ? "Nama Lengkap" : "Full Name"}</span> <span className="text-rose-500">*</span>
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
            <span>{t.settings?.businessName || (locale === "id" ? "Nama Bisnis / Toko" : "Business / Store Name")}</span>
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder={locale === "id" ? "Contoh: Toko Kopi Sejahtera" : "e.g. Acme Studio Inc."}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs min-h-[44px] sm:min-h-[40px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            {locale === "id" ? "Email Akun" : "Account Email"}
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
            <span>{t.settings?.businessPhone || (locale === "id" ? "No. WhatsApp / Telepon" : "WhatsApp / Phone Number")}</span>
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={locale === "id" ? "Contoh: 08123456789" : "e.g. +628123456789"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] shadow-2xs font-mono min-h-[44px] sm:min-h-[40px]"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
          <MapPinIcon className="w-4 h-4 text-slate-400" />
          <span>{t.settings?.businessAddress || (locale === "id" ? "Alamat Bisnis / Kantor" : "Business / Office Address")}</span>
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          placeholder={
            locale === "id"
              ? "Alamat yang akan dicetak pada invoice..."
              : "Address to appear on your invoice header..."
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none shadow-2xs leading-relaxed"
        />
      </div>

      {/* Preferensi Email & Komunikasi Resmi */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={optInNewsletter}
            onChange={(e) => setOptInNewsletter(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
          />
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block flex items-center gap-1.5">
              <EnvelopeIcon className="w-4 h-4 text-slate-500" />
              <span>
                {locale === "id"
                  ? "Terima Email Pengumuman & Berita Berkala dari NotaKu"
                  : "Receive Official Announcements & Periodic News from NotaKu"}
              </span>
            </span>
            <span className="text-xs text-slate-500 block mt-0.5 leading-relaxed">
              {locale === "id"
                ? "Dapatkan info rilis fitur baru, tips mengelola invoice bisnis, dan promo voucher diskon yang dikirim langsung ke email Anda."
                : "Get notified about new product features, invoicing best practices, and special discount vouchers directly in your inbox."}
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
            {loading
              ? t.settings?.saving || (locale === "id" ? "Menyimpan..." : "Saving...")
              : t.settings?.saveChanges || (locale === "id" ? "Simpan Perubahan" : "Save Changes")}
          </span>
        </button>
      </div>
    </form>
  );
}
