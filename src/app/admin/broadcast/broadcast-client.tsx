"use client";

import { useState } from "react";
import {
  PaperAirplaneIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";
import {
  BroadcastAudience,
  BroadcastLogData,
  sendBroadcastEmail,
} from "@/actions/broadcast";
import { formatDateWIB } from "@/lib/invoice-utils";
import { useTranslations } from "next-intl";

interface BroadcastClientProps {
  estimates: {
    all: number;
    pro: number;
    free: number;
  };
  history: BroadcastLogData[];
}

export function BroadcastClient({ estimates, history }: BroadcastClientProps) {
  const t = useTranslations("admin.broadcast");
  const [subject, setSubject] = useState("");
  const [badgeType, setBadgeType] = useState<"announcement" | "update" | "promo" | "security">("announcement");
  const [badgeText, setBadgeText] = useState(t("badgeOfficial"));
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState(t("defaultCta"));
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
      setFeedback({ type: "error", message: t("validationRequired") });
      return;
    }

    if (currentAudienceCount === 0) {
      setFeedback({ type: "error", message: t("validationEmptyAudience") });
      return;
    }

    const confirmMsg = t("confirmSend", { count: currentAudienceCount, audience });
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
        message: t("sendSuccess", { sent: res.sentCount, failed: res.failedCount }),
      });

      // Reset form
      setSubject("");
      setContent("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || t("sendFailed"),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSend} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-5">
          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{feedback.message}</div>
            </div>
          )}

          {/* Audience Segment Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t("targetAudience")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "ALL" as const,
                  label: t("allUsers"),
                  count: estimates.all,
                  desc: t("allUsersDesc"),
                },
                {
                  id: "PRO_ONLY" as const,
                  label: t("proUsers"),
                  count: estimates.pro,
                  desc: t("proUsersDesc"),
                },
                {
                  id: "FREE_ONLY" as const,
                  label: t("freeUsers"),
                  count: estimates.free,
                  desc: t("freeUsersDesc"),
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAudience(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                    audience === opt.id
                      ? "border-[#0f6b4f] dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-1 ring-[#0f6b4f]"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</span>
                    <span className="text-xs font-mono font-bold text-[#0f6b4f] dark:text-emerald-400">
                      {t("userCount", { count: opt.count })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Newsletter Opt-in checkbox */}
            <label className="flex items-center gap-2 mt-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer min-h-[44px] sm:min-h-[32px]">
              <input
                type="checkbox"
                checked={respectOptIn}
                onChange={(e) => setRespectOptIn(e.target.checked)}
                className="rounded text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <span>{t("respectOptIn")}</span>
            </label>
          </div>

          {/* Badge & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("badgeCategory")}
              </label>
              <select
                value={badgeType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setBadgeType(val);
                  if (val === "announcement") setBadgeText(t("badgeOfficial"));
                  if (val === "update") setBadgeText(t("badgeFeature"));
                  if (val === "promo") setBadgeText(t("badgeSpecial"));
                  if (val === "security") setBadgeText(t("badgeSystem"));
                }}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              >
                <option value="announcement">{t("badgeAnnouncement")}</option>
                <option value="update">{t("badgeUpdate")}</option>
                <option value="promo">{t("badgePromo")}</option>
                <option value="security">{t("badgeSecurity")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("badgeTextLabel")}
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder={t("badgeTextPlaceholder")}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t("subjectLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t("contentLabel")} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("contentPlaceholder")}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] leading-relaxed font-sans"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t("contentHint")}
            </p>
          </div>

          {/* CTA Link (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("ctaTextLabel")}
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder={t("ctaTextPlaceholder")}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("ctaUrlLabel")}
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://notaku.store/dashboard"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] min-h-[44px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[44px]"
            >
              <EyeIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{showPreview ? t("hidePreview") : t("showPreview")}</span>
            </button>

            <button
              type="submit"
              disabled={isPending || !subject.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f6b4f] text-white text-xs sm:text-sm font-bold hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer shadow-xs min-h-[44px]"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>
                {isPending
                  ? t("sending")
                  : t("sendBtn", { count: currentAudienceCount })}
              </span>
            </button>
          </div>
        </form>

        {/* Live Email Preview Box */}
        {showPreview && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 p-4 sm:p-6 space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t("htmlPreview")}
            </span>
            <div className="max-w-[540px] mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
              {/* Header */}
              <div className="bg-[#0f172a] p-6 text-center">
                <span className="text-xl font-bold text-white tracking-tight">
                  Nota<span className="text-emerald-400">Ku</span>
                </span>
                <div className="mt-2">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#0f6b4f]">
                    {badgeText || t("badgeOfficial")}
                  </span>
                </div>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {subject || t("previewTitleFallback")}
                </h2>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {content || t("previewContentFallback")}
                </div>
                {ctaUrl && (
                  <div className="text-center pt-3">
                    <span className="inline-block px-6 py-2.5 rounded-xl bg-[#0f6b4f] text-white text-xs font-bold shadow-xs">
                      {ctaText || t("defaultCta")} →
                    </span>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
                &copy; {new Date().getFullYear()} NotaKu &bull; Simple & Fast Invoicing
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History & Insights Sidebar */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <InboxStackIcon className="w-5 h-5 text-[#0f6b4f] dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("historyTitle")}</h3>
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              {t("emptyHistory")}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-2 py-0.5 rounded">
                      {log.badge}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono">
                      {formatDateWIB(log.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {log.subject}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      {t("targetLabel")} <strong className="text-slate-700 dark:text-slate-300">{log.audience}</strong>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {log.recipientsCount}
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
