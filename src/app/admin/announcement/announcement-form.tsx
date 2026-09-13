"use client";

import { useState, useTransition } from "react";
import { saveAnnouncement, type AnnouncementPlacement } from "@/actions/admin";
import {
  MegaphoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

type AnnouncementFormProps = {
  initialData: {
    message: string;
    type: "info" | "warning" | "success";
    placement?: AnnouncementPlacement;
    isActive: boolean;
    linkText?: string | null;
    linkUrl?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
  } | null;
};

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const tAdmin = useTranslations("admin");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(initialData?.message || "");
  const [type, setType] = useState<"info" | "warning" | "success">(
    initialData?.type || "info"
  );
  const [placement, setPlacement] = useState<AnnouncementPlacement>(
    initialData?.placement || "ALL"
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
        text: tAdmin("messageRequired"),
      });
      return;
    }

    startTransition(async () => {
      setStatusFeedback(null);
      const res = await saveAnnouncement({
        message,
        type,
        placement,
        isActive,
        linkText,
        linkUrl,
      });

      if (res.success) {
        setStatusFeedback({
          type: "success",
          text: tAdmin("announcementSaveSuccess"),
        });
        setTimeout(() => setStatusFeedback(null), 4000);
      } else {
        setStatusFeedback({
          type: "error",
          text: res.error || tAdmin("saveError", { fallback: "Gagal menyimpan pengumuman." }),
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <SparklesIcon className="w-4 h-4 text-[#0f6b4f]" />
          <span>{tAdmin("livePreviewTitle")}</span>
        </h3>
        {isActive && message.trim() ? (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-2xs ${
              type === "info"
                ? "bg-blue-50 border-blue-200/60 text-blue-900"
                : type === "warning"
                ? "bg-amber-50 border-amber-200/60 text-amber-900"
                : "bg-emerald-50 border-emerald-200/60 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <MegaphoneIcon className="w-5 h-5 shrink-0 text-current" />
              <p className="text-xs sm:text-sm font-semibold leading-relaxed">{message}</p>
            </div>
            {linkText && linkUrl && (
              <span className="text-xs font-bold underline shrink-0 cursor-pointer self-start sm:self-auto min-h-[32px] inline-flex items-center">
                {linkText} &rarr;
              </span>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-medium bg-slate-50/50">
            {tAdmin("announcementInactive")}
          </div>
        )}
      </div>

      {/* Main Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Toggle Active Status */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {tAdmin("statusActiveTitle")}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {tAdmin("statusActiveDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f6b4f]"></div>
          </label>
        </div>

        {/* Target Placement */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            {tAdmin("placementLabel")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "ALL",
                label: tAdmin("placementAll"),
                desc: tAdmin("placementDescAll"),
                icon: SparklesIcon,
              },
              {
                id: "LANDING",
                label: tAdmin("placementPublic"),
                desc: tAdmin("placementDescLanding"),
                icon: GlobeAltIcon,
              },
              {
                id: "DASHBOARD",
                label: tAdmin("placementDashboard"),
                desc: tAdmin("placementDescDashboard"),
                icon: ComputerDesktopIcon,
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlacement(p.id as AnnouncementPlacement)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs min-h-[44px] ${
                  placement === p.id
                    ? "border-[#0f6b4f] bg-emerald-50/50 ring-1 ring-[#0f6b4f]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p.icon
                    className={`w-4 h-4 ${
                      placement === p.id ? "text-[#0f6b4f]" : "text-slate-400"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900">{p.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {tAdmin("messageLabel")}
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={tAdmin("messagePlaceholder")}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>

        {/* Banner Type / Tone */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {tAdmin("typeLabel")}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "info",
                label: tAdmin("typeInfo"),
                bg: "bg-blue-50 text-blue-800 border-blue-200/60",
              },
              {
                id: "warning",
                label: tAdmin("typeWarning"),
                bg: "bg-amber-50 text-amber-800 border-amber-200/60",
              },
              {
                id: "success",
                label: tAdmin("typeSuccess"),
                bg: "bg-emerald-50 text-[#0f6b4f] border-emerald-200/60",
              },
            ].map((bt) => (
              <button
                key={bt.id}
                type="button"
                onClick={() => setType(bt.id as any)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer shadow-2xs min-h-[44px] ${
                  type === bt.id
                    ? `${bt.bg} ring-1 ring-[#0f6b4f]`
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Action Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tAdmin("linkTextLabel")}
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={tAdmin("linkTextPlaceholder")}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {tAdmin("linkUrlLabel")}
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={tAdmin("linkUrlPlaceholder")}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] focus:border-[#0f6b4f] bg-slate-50/50 focus:bg-white transition-colors min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs ${
            statusFeedback.type === "success"
              ? "bg-emerald-50 text-[#0f6b4f] border border-emerald-200/60"
              : "bg-rose-50 text-rose-800 border border-rose-200/60"
          }`}
        >
          {statusFeedback.type === "success" ? (
            <CheckCircleIcon className="w-4 h-4 text-[#0f6b4f] shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusFeedback.text}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {initialData?.updatedBy ? (
          <p className="text-xs text-slate-400 font-medium">
            {tAdmin("lastUpdatedBy")}{" "}
            <strong className="text-slate-700 font-mono">{initialData.updatedBy}</strong>
          </p>
        ) : (
          <div />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
        >
          {isPending && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          <span>
            {isPending ? tAdmin("savingBroadcast") : tAdmin("saveAndBroadcast")}
          </span>
        </button>
      </div>
    </form>
  );
}
