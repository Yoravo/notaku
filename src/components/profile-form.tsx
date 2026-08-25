"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";
import {
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

type Props = {
  name: string;
  businessName: string | null;
  phone: string | null;
  address: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  email: string;
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
}: Props) {
  const [form, setForm] = useState({
    name,
    businessName: businessName ?? "",
    phone: phone ?? "",
    address: address ?? "",
    logoUrl: logoUrl ?? "",
    signatureUrl: signatureUrl ?? "",
    stampUrl: stampUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // State untuk modal crop / custom resize (target: logo | signature | stamp)
  const [cropTarget, setCropTarget] = useState<"logo" | "signature" | "stamp">("logo");
  const [tempImage, setTempImage] = useState<string | null>(null);
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
      setError(`Ukuran file ${target} maksimal 5MB`);
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
      await updateProfile({
        name: form.name.trim(),
        businessName: form.businessName.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
        signatureUrl: form.signatureUrl.trim() || null,
        stampUrl: form.stampUrl.trim() || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2"
        >
          <ExclamationCircleIcon className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Profil dan identitas bisnis berhasil diperbarui!</span>
        </div>
      )}

      {/* Logo Bisnis Section */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Logo Bisnis / Toko (Untuk Header Invoice)
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo Bisnis"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <PhotoIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
                <span>{form.logoUrl ? "Ganti Logo" : "Pilih Gambar"}</span>
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
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span>Sesuaikan Ukuran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus Logo
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-gray-500">
              Format PNG/JPG/WebP, maks 5MB. Ditampilkan di header/kop faktur.
            </p>
          </div>
        </div>
      </div>

      {/* Tanda Tangan & Stempel Digital Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tanda Tangan Digital */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Tanda Tangan Digital (Bawah PDF)
          </label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {form.signatureUrl ? (
                <img
                  src={form.signatureUrl}
                  alt="Tanda Tangan"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] text-gray-400 font-medium text-center px-1">Tanpa TTD</span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
                <span>{form.signatureUrl ? "Ganti TTD" : "Unggah TTD"}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleFileUpload(e, "signature")}
                  className="hidden"
                />
              </label>
              {form.signatureUrl && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, signatureUrl: "" }))}
                  className="block text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus TTD
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            Unggah foto/scan tanda tangan berlatar transparan/putih.
          </p>
        </div>

        {/* Stempel Bisnis Digital */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Stempel Toko / Bisnis (Cap PDF)
          </label>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
              {form.stampUrl ? (
                <img
                  src={form.stampUrl}
                  alt="Stempel Toko"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] text-gray-400 font-medium text-center px-1">Tanpa Cap</span>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
                <span>{form.stampUrl ? "Ganti Cap" : "Unggah Cap"}</span>
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
                  className="block text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Hapus Cap
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            Unggah stempel cap digital untuk dicetak menimpa area tanda tangan.
          </p>
        </div>
      </div>

      {/* Modal Custom Resize & Crop */}
      {tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Sesuaikan & Resize {cropTarget === "logo" ? "Logo" : cropTarget === "signature" ? "Tanda Tangan" : "Stempel Cap"}
                </h3>
                <p className="text-xs text-gray-500">
                  Geser dan atur perbesaran gambar agar pas dicetak pada faktur
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTempImage(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box with Drag */}
            <div
              className="relative w-full h-56 sm:h-64 rounded-xl border-2 border-dashed border-gray-300 bg-gray-900/5 flex items-center justify-center overflow-hidden cursor-move select-none"
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
              <div className="absolute inset-4 pointer-events-none border border-emerald-500/40 rounded-lg flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700/60 bg-white/80 px-2 py-0.5 rounded shadow-xs">
                  Area Cetak PDF
                </span>
              </div>
            </div>

            {/* Scale Control Slider */}
            <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200/80">
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span className="font-semibold flex items-center gap-1">
                  <MagnifyingGlassMinusIcon className="w-4 h-4 text-gray-400" />
                  Ukuran / Zoom
                </span>
                <span className="font-mono text-emerald-700 font-bold">
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
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0f6b4f]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setScale(1);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:underline shrink-0 cursor-pointer"
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
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0f6b4f] hover:bg-[#0c5740] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Terapkan Gambar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal & Business Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <UserIcon className="w-4 h-4 text-gray-400" />
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
            Nama Bisnis / Toko
          </label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="Contoh: Toko Kopi Sejahtera"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div>
          <label className="block font-semibold text-gray-700 mb-1.5">
            Email Akun
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-2 text-gray-500 font-mono text-xs cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <PhoneIcon className="w-4 h-4 text-gray-400" />
            No. WhatsApp / Telepon
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Contoh: 08123456789"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          Alamat Bisnis / Kantor
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={3}
          placeholder="Alamat yang akan dicetak pada invoice..."
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f6b4f] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0c5740] transition-colors disabled:opacity-50 cursor-pointer shadow-xs w-full sm:w-auto"
        >
          {loading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircleIcon className="w-4 h-4 text-emerald-200" />
          )}
          <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>
    </form>
  );
}
