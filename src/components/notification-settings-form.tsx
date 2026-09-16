"use client";

import { useState, useTransition } from "react";
import {
  BellIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { UpgradeButton } from "@/components/upgrade-button";
import {
  updateBotNotificationSettings,
  sendTestTelegramNotification,
  sendTestDiscordNotification,
  type BotNotificationSettings,
} from "@/actions/notifications";

export function NotificationSettingsForm({
  initialData,
}: {
  initialData: BotNotificationSettings;
}) {
  const tNotif = useTranslations("notifications");
  const [formData, setFormData] = useState<BotNotificationSettings>(initialData);
  const [isSaving, startSaveTransition] = useTransition();
  const [isTestingTelegram, startTestTgTransition] = useTransition();
  const [isTestingDiscord, startTestDiscordTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testTgStatus, setTestTgStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [testDiscordStatus, setTestDiscordStatus] = useState<{ success?: boolean; error?: string } | null>(null);

  const isPro = formData.isPro;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startSaveTransition(async () => {
      try {
        await updateBotNotificationSettings({
          telegramBotToken: formData.telegramBotToken,
          telegramChatId: formData.telegramChatId,
          telegramEnabled: formData.telegramEnabled,
          discordWebhookUrl: formData.discordWebhookUrl,
          discordEnabled: formData.discordEnabled,
          notifyOnPayment: formData.notifyOnPayment,
          notifyOnDueDate: formData.notifyOnDueDate,
          notifyOnRecurring: formData.notifyOnRecurring,
        });

        setMessage({
          type: "success",
          text: tNotif("saveSuccess"),
        });
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err?.message || tNotif("saveError"),
        });
      }
    });
  };

  const handleTestTelegram = () => {
    if (!formData.telegramBotToken || !formData.telegramChatId) {
      setTestTgStatus({
        error: tNotif("tokenRequired"),
      });
      return;
    }
    setTestTgStatus(null);
    startTestTgTransition(async () => {
      try {
        await sendTestTelegramNotification(formData.telegramBotToken!, formData.telegramChatId!);
        setTestTgStatus({ success: true });
      } catch (err: any) {
        setTestTgStatus({ error: err?.message || tNotif("testFailed") });
      }
    });
  };

  const handleTestDiscord = () => {
    if (!formData.discordWebhookUrl) {
      setTestDiscordStatus({
        error: tNotif("webhookUrlRequired"),
      });
      return;
    }
    setTestDiscordStatus(null);
    startTestDiscordTransition(async () => {
      try {
        await sendTestDiscordNotification(formData.discordWebhookUrl!);
        setTestDiscordStatus({ success: true });
      } catch (err: any) {
        setTestDiscordStatus({ error: err?.message || tNotif("testFailed") });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {tNotif("title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {tNotif("subtitle")}
        </p>
      </div>

      {!isPro && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
            <SparklesIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{tNotif("proNoticeTitle")}</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {tNotif("proNoticeDesc")}
          </p>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer min-h-[44px]" />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Telegram Bot */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <PaperAirplaneIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {tNotif("telegramTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tNotif("telegramSubtitle")}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.telegramEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f6b4f]"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formData.telegramEnabled ? tNotif("enabled") : tNotif("disabled")}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {tNotif("telegramTokenLabel")}
              </label>
              <input
                type="password"
                disabled={!isPro || !formData.telegramEnabled}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={formData.telegramBotToken || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 font-mono min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {tNotif("telegramGetFrom")}{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  @BotFather
                </a>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {tNotif("telegramChatIdLabel")}
              </label>
              <input
                type="text"
                disabled={!isPro || !formData.telegramEnabled}
                placeholder={tNotif("telegramChatIdPlaceholder")}
                value={formData.telegramChatId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramChatId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 font-mono min-h-[44px]"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {tNotif("telegramFindId")}{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  @userinfobot
                </a>
              </p>
            </div>
          </div>

          {formData.telegramEnabled && isPro && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-bold border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {isTestingTelegram ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                )}
                <span>{tNotif("testTelegramBtn")}</span>
              </button>

              {testTgStatus?.success && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {tNotif("testSuccess")}
                </span>
              )}
              {testTgStatus?.error && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                  {testTgStatus.error}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Discord Webhook */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <BellIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {tNotif("discordTitle")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tNotif("discordSubtitle")}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.discordEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, discordEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f6b4f]"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formData.discordEnabled ? tNotif("enabled") : tNotif("disabled")}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {tNotif("discordUrlLabel")}
            </label>
            <input
              type="password"
              disabled={!isPro || !formData.discordEnabled}
              placeholder="https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz"
              value={formData.discordWebhookUrl || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, discordWebhookUrl: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 font-mono min-h-[44px]"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {tNotif("discordInstructions")} {tNotif("discordStep1")}
              </span>
            </p>
          </div>

          {formData.discordEnabled && isPro && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={isTestingDiscord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {isTestingDiscord ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                )}
                <span>{tNotif("testDiscordBtn")}</span>
              </button>

              {testDiscordStatus?.success && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {tNotif("testSuccess")}
                </span>
              )}
              {testDiscordStatus?.error && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                  {testDiscordStatus.error}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Notification Events / Triggers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {tNotif("eventTriggersTitle")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tNotif("eventTriggersSubtitle")}
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors min-h-[44px]">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnPayment}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnPayment: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {tNotif("notifyOnPayment")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {tNotif("notifyOnPaymentHint")}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors min-h-[44px]">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnDueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnDueDate: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {tNotif("notifyOnDueDate")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {tNotif("notifyOnDueDateHint")}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors min-h-[44px]">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnRecurring}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnRecurring: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  {tNotif("notifyOnRecurring")}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {tNotif("notifyOnRecurringHint")}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isPro || isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0c5740] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isSaving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            <span>
              {isSaving ? tNotif("saving") : tNotif("saveBtn")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
