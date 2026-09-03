"use client";

import { useState } from "react";
import {
  PaperAirplaneIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UsersIcon,
  SparklesIcon,
  ClockIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";
import {
  BroadcastAudience,
  BroadcastLogData,
  sendBroadcastEmail,
} from "@/actions/broadcast";
import { formatDateWIB } from "@/lib/invoice-utils";

interface BroadcastClientProps {
  estimates: {
    all: number;
    pro: number;
    free: number;
  };
  history: BroadcastLogData[];
}

export function BroadcastClient({ estimates, history }: BroadcastClientProps) {
  const [subject, setSubject] = useState("");
  const [badgeType, setBadgeType] = useState<"announcement" | "update" | "promo" | "security">("announcement");
  const [badgeText, setBadgeText] = useState("Pengumuman Resmi");
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState("Buka NotaKu");
  const [ctaUrl, setCtaUrl] = useState("https://notaku.store");
  const [audience, setAudience] = useState<BroadcastAudience>("ALL");
  const [respectOptIn, setRespectOptIn] = useState(true);

  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const currentAudienceCount =
    audience === "ALL" ? estimates.all : audience === "PRO_ONLY" ? estimates.pro : estimates.free;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setFeedback({ type: "error", message: "Subjek dan konten email wajib diisi." });
      return;
    }

    if (currentAudienceCount === 0) {
      setFeedback({ type: "error", message: "Tidak ada penerima untuk audiens yang dipilih." });
      return;
    }

    const confirmMsg = `Konfirmasi pengiriman email broadcast ke ${currentAudienceCount} pengguna terdaftar (${audience})?`;
    if (!window.confirm(confirmMsg)) return;

    setIsPending(true);
    setFeedback(null);

    try {
      const res = await sendBroadcastEmail({
        subject: subject.trim(),
        badge: badgeText.trim(),
        badgeType,
        content: content.trim(),
        ctaText: ctaText.trim() || undefined,
        ctaUrl: ctaUrl.trim() || undefined,
        audience,
        respectNewsletterOptIn: respectOptIn,
      });

      setFeedback({
        type: "success",
        message: `Berhasil mengirim email ke ${res.sentCount} pengguna! (Gagal: ${res.failedCount})`,
      });

      // Reset form
      setSubject("");
      setContent("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Gagal memproses pengiriman email broadcast.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSend} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{feedback.message}</div>
            </div>
          )}

          {/* Audience Segment Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Audiens Penerima:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "ALL" as const,
                  label: "Semua User",
                  count: estimates.all,
                  desc: "Seluruh pendaftar aktif",
                },
                {
                  id: "PRO_ONLY" as const,
                  label: "Khusus PRO",
                  count: estimates.pro,
                  desc: "Pelanggan berbayar aktif",
                },
                {
                  id: "FREE_ONLY" as const,
                  label: "Khusus Free",
                  count: estimates.free,
                  desc: "Potensial upgrade PRO",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAudience(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    audience === opt.id
                      ? "border-[#0f6b4f] bg-emerald-50/50 ring-1 ring-[#0f6b4f]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                    <span className="text-xs font-mono font-bold text-[#0f6b4f]">
                      {opt.count} user
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Newsletter Opt-in checkbox */}
            <label className="flex items-center gap-2 mt-3 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={respectOptIn}
                onChange={(e) => setRespectOptIn(e.target.checked)}
                className="rounded text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <span>Hanya kirim ke pengguna yang mengaktifkan opsi menerima email pengumuman</span>
            </label>
          </div>

          {/* Badge & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Kategori Badge:
              </label>
              <select
                value={badgeType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setBadgeType(val);
                  if (val === "announcement") setBadgeText("Pengumuman Resmi");
                  if (val === "update") setBadgeText("Pembaruan Fitur");
                  if (val === "promo") setBadgeText("Promo Spesial");
                  if (val === "security") setBadgeText("Pemberitahuan Sistem");
                }}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
              >
                <option value="announcement">Pengumuman Resmi (Hijau Emerald)</option>
                <option value="update">Pembaruan Fitur (Biru)</option>
                <option value="promo">Promo & Diskon (Kuning / Amber)</option>
                <option value="security">Pemberitahuan Sistem (Slate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Teks Badge (Label):
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Misal: Update v2.5 / Promo Akhir Pekan"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Subjek Email (Subject Line): <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Misal: 🎉 Fitur Baru: Bot Telegram & Integrasi Discord Kini Hadir di NotaKu!"
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Isi Pesan Email: <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Halo Rekan Pengguna NotaKu,\n\nKami dengan bangga mengumumkan peluncuran fitur terbaru...\n\nGunakan kode promo DISKON50 untuk upgrade paket PRO!`}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] leading-relaxed font-sans"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan enter 2x untuk memisahkan paragraf baru.
            </p>
          </div>

          {/* CTA Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Teks Tombol Aksi (CTA):
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Misal: Buka Dashboard / Coba Sekarang"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                URL Tombol Aksi:
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://notaku.store/dashboard"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <EyeIcon className="w-4 h-4 text-slate-500" />
              <span>{showPreview ? "Sembunyikan Pratinjau" : "Pratinjau Tampilan Email"}</span>
            </button>

            <button
              type="submit"
              disabled={isPending || !subject.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f6b4f] text-white text-xs sm:text-sm font-bold hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>
                {isPending
                  ? "Mengirim via Resend..."
                  : `Kirim Broadcast ke ${currentAudienceCount} User`}
              </span>
            </button>
          </div>
        </form>

        {/* Live Email Preview Box */}
        {showPreview && (
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-6 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pratinjau Email HTML:
            </span>
            <div className="max-w-[540px] mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
              {/* Header */}
              <div className="bg-[#0f172a] p-6 text-center">
                <span className="text-xl font-bold text-white tracking-tight">
                  Nota<span className="text-emerald-400">Ku</span>
                </span>
                <div className="mt-2">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#0f6b4f]">
                    {badgeText || "Pengumuman Resmi"}
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {subject || "Judul Subjek Email Anda..."}
                </h2>
                <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {content || "Isi konten pengumuman email Anda akan tampil rapi di sini..."}
                </div>
                {ctaUrl && (
                  <div className="text-center pt-3">
                    <span className="inline-block px-6 py-2.5 rounded-xl bg-[#0f6b4f] text-white text-xs font-bold shadow-xs">
                      {ctaText || "Buka NotaKu"} →
                    </span>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
                &copy; {new Date().getFullYear()} NotaKu &bull; Simple & Fast Invoicing
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History & Insights Sidebar */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <InboxStackIcon className="w-5 h-5 text-[#0f6b4f]" />
            <h3 className="text-sm font-bold text-slate-900">Riwayat Email Terkirim</h3>
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              Belum ada riwayat email broadcast yang dikirim.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {log.badge}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {formatDateWIB(log.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {log.subject}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Target: <strong className="text-slate-700">{log.audience}</strong>
                    </span>
                    <span className="font-semibold text-[#0f6b4f]">
                      {log.recipientsCount} penerima
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
