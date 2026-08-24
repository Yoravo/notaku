"use client";

import { useState, useTransition } from "react";
import { saveAnnouncement } from "@/actions/admin";
import {
  MegaphoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type AnnouncementFormProps = {
  initialData: {
    message: string;
    type: "info" | "warning" | "success";
    isActive: boolean;
    linkText?: string | null;
    linkUrl?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
  } | null;
};

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(initialData?.message || "");
  const [type, setType] = useState<"info" | "warning" | "success">(
    initialData?.type || "info"
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? false);
  const [linkText, setLinkText] = useState(initialData?.linkText || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "");
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isActive && !message.trim()) {
      setStatusFeedback({
        type: "error",
        text: "Pesan pengumuman tidak boleh kosong saat status aktif.",
      });
      return;
    }

    startTransition(async () => {
      setStatusFeedback(null);
      const res = await saveAnnouncement({
        message,
        type,
        isActive,
        linkText,
        linkUrl,
      });

      if (res.success) {
        setStatusFeedback({
          type: "success",
          text: "Pengumuman berhasil diperbarui dan disiarkan ke dashboard!",
        });
        setTimeout(() => setStatusFeedback(null), 4000);
      } else {
        setStatusFeedback({
          type: "error",
          text: res.error || "Gagal menyimpan pengumuman.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Live Preview (Tampilan di Dashboard User)
        </h3>
        {isActive && message.trim() ? (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
              type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-900"
                : type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <MegaphoneIcon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium leading-relaxed">{message}</p>
            </div>
            {linkText && linkUrl && (
              <span className="text-xs font-bold underline shrink-0 cursor-pointer">
                {linkText} →
              </span>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-sm">
            Pengumuman saat ini <strong>NONAKTIF</strong> (Tidak akan tampil di
            dashboard pengguna).
          </div>
        )}
      </div>

      {/* Main Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        {/* Toggle Active Status */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Status Pengumuman
            </p>
            <p className="text-xs text-slate-500">
              Aktifkan untuk menampilkan banner ini di dashboard seluruh pengguna.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Isi Pesan Pengumuman
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contoh: Fitur Template PDF Modern & Minimal kini sudah aktif! Upgrade ke Pro untuk menikmati."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Banner Type / Tone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Tipe / Warna Banner
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "info", label: "Info (Biru)", bg: "bg-blue-50 text-blue-800 border-blue-200" },
              { id: "warning", label: "Warning (Kuning)", bg: "bg-amber-50 text-amber-800 border-amber-200" },
              { id: "success", label: "Promo / Rilis (Hijau)", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as any)}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                  type === t.id
                    ? `${t.bg} ring-2 ring-slate-900`
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Action Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Teks Tombol/Tautan (Opsional)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Contoh: Lihat Detail"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              URL Tautan (Opsional)
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Contoh: /settings atau https://..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            statusFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusFeedback.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusFeedback.text}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {initialData?.updatedBy ? (
          <p className="text-xs text-slate-400">
            Terakhir diubah oleh <strong>{initialData.updatedBy}</strong>
          </p>
        ) : (
          <div />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          {isPending && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          <span>{isPending ? "Menyimpan..." : "Simpan & Siarkan"}</span>
        </button>
      </div>
    </form>
  );
}
