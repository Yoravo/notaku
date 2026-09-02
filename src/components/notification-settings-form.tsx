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
import { useLanguage } from "@/lib/i18n/context";
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
  const { t, locale } = useLanguage();
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
          text: locale === "id" ? "Pengaturan notifikasi bot berhasil disimpan!" : "Bot notification settings saved successfully!",
        });
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err?.message || (locale === "id" ? "Gagal menyimpan pengaturan." : "Failed to save settings."),
        });
      }
    });
  };

  const handleTestTelegram = () => {
    if (!formData.telegramBotToken || !formData.telegramChatId) {
      setTestTgStatus({
        error: locale === "id" ? "Masukkan Bot Token dan Chat ID terlebih dahulu." : "Enter Bot Token and Chat ID first.",
      });
      return;
    }
    setTestTgStatus(null);
    startTestTgTransition(async () => {
      try {
        await sendTestTelegramNotification(formData.telegramBotToken!, formData.telegramChatId!);
        setTestTgStatus({ success: true });
      } catch (err: any) {
        setTestTgStatus({ error: err?.message || "Gagal mengirim pesan tes." });
      }
    });
  };

  const handleTestDiscord = () => {
    if (!formData.discordWebhookUrl) {
      setTestDiscordStatus({
        error: locale === "id" ? "Masukkan Webhook URL Discord terlebih dahulu." : "Enter Discord Webhook URL first.",
      });
      return;
    }
    setTestDiscordStatus(null);
    startTestDiscordTransition(async () => {
      try {
        await sendTestDiscordNotification(formData.discordWebhookUrl!);
        setTestDiscordStatus({ success: true });
      } catch (err: any) {
        setTestDiscordStatus({ error: err?.message || "Gagal mengirim webhook tes." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          {locale === "id" ? "Notifikasi Bot Telegram & Discord" : "Telegram & Discord Bot Notifications"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {locale === "id"
            ? "Dapatkan notifikasi instan langsung ke grup Telegram atau channel Discord Anda saat invoice dibayar atau jatuh tempo."
            : "Receive instant push alerts in your Telegram or Discord channels when invoices are paid or due today."}
        </p>
      </div>

      {!isPro && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <SparklesIcon className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{locale === "id" ? "Fitur Eksklusif NotaKu PRO" : "NotaKu PRO Exclusive Feature"}</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {locale === "id"
              ? "Integrasi notifikasi bot Telegram dan webhook Discord hanya tersedia untuk pengguna paket PRO. Tingkatkan akun untuk memantau arus kas bisnis Anda secara real-time."
              : "Telegram bot integration and Discord webhooks are exclusively available for PRO members. Upgrade now to monitor cash flow in real time."}
          </p>
          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer" />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Telegram Bot */}
        <div className="rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                <PaperAirplaneIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locale === "id" ? "Integrasi Bot Telegram" : "Telegram Bot Integration"}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === "id" ? "Kirim pesan ke chat pribadi atau grup kerja Anda" : "Dispatch alerts to personal chat or team group"}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.telegramEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f6b4f]"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-700">
                {formData.telegramEnabled
                  ? locale === "id"
                    ? "Aktif"
                    : "Enabled"
                  : locale === "id"
                  ? "Nonaktif"
                  : "Disabled"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {locale === "id" ? "Telegram Bot Token" : "Telegram Bot Token"}
              </label>
              <input
                type="password"
                disabled={!isPro || !formData.telegramEnabled}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={formData.telegramBotToken || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 disabled:text-slate-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {locale === "id" ? "Dapatkan dari " : "Get from "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline font-semibold"
                >
                  @BotFather
                </a>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {locale === "id" ? "Chat ID / Group ID" : "Chat ID / Group ID"}
              </label>
              <input
                type="text"
                disabled={!isPro || !formData.telegramEnabled}
                placeholder="Misal: 123456789 atau -1001234567890"
                value={formData.telegramChatId || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, telegramChatId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 disabled:text-slate-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {locale === "id" ? "Ketahui ID Anda via " : "Find your ID via "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline font-semibold"
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingTelegram ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                )}
                <span>{locale === "id" ? "Kirim Pesan Uji Coba" : "Send Test Message"}</span>
              </button>

              {testTgStatus?.success && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {locale === "id" ? "Pesan tes terkirim!" : "Test message sent!"}
                </span>
              )}
              {testTgStatus?.error && (
                <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                  {testTgStatus.error}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Discord Webhook */}
        <div className="rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <BellIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locale === "id" ? "Integrasi Discord Webhook" : "Discord Webhook Integration"}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === "id" ? "Kirim format Embed ke channel Discord server Anda" : "Send rich embeds to your Discord channel"}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.discordEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, discordEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f6b4f]"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-700">
                {formData.discordEnabled
                  ? locale === "id"
                    ? "Aktif"
                    : "Enabled"
                  : locale === "id"
                  ? "Nonaktif"
                  : "Disabled"}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {locale === "id" ? "Discord Webhook URL" : "Discord Webhook URL"}
            </label>
            <input
              type="password"
              disabled={!isPro || !formData.discordEnabled}
              placeholder="https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz"
              value={formData.discordWebhookUrl || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, discordWebhookUrl: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f6b4f]/20 focus:border-[#0f6b4f] disabled:bg-slate-100 disabled:text-slate-400 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {locale === "id"
                  ? "Buka Discord > Server Settings > Integrations > Webhooks > Copy Webhook URL."
                  : "Open Discord > Server Settings > Integrations > Webhooks > Copy Webhook URL."}
              </span>
            </p>
          </div>

          {formData.discordEnabled && isPro && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestDiscord}
                disabled={isTestingDiscord}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingDiscord ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                )}
                <span>{locale === "id" ? "Kirim Pesan Uji Coba" : "Send Test Webhook"}</span>
              </button>

              {testDiscordStatus?.success && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  {locale === "id" ? "Webhook tes terkirim!" : "Test webhook sent!"}
                </span>
              )}
              {testDiscordStatus?.error && (
                <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                  {testDiscordStatus.error}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Notification Events / Triggers */}
        <div className="rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            {locale === "id" ? "Pemicu Notifikasi (Triggers)" : "Notification Triggers"}
          </h3>
          <p className="text-xs text-slate-500">
            {locale === "id"
              ? "Pilih jenis peristiwa invoice yang ingin Anda terima pemberitahuannya:"
              : "Select which invoice events should trigger alerts:"}
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnPayment}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnPayment: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {locale === "id" ? "Pembayaran Invoice Berhasil / Lunas" : "Invoice Payment Settled / Paid"}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {locale === "id"
                    ? "Kirim notifikasi setiap kali ada pelanggan yang melunasi invoice via QRIS/VA digital maupun transfer manual."
                    : "Send notification every time a client settles an invoice digitally or manually."}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnDueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnDueDate: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {locale === "id" ? "Pengingat Tagihan Jatuh Tempo Hari Ini (H-0)" : "Invoices Due Today (H-0)"}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {locale === "id"
                    ? "Kirim ringkasan seluruh invoice pelanggan yang jatuh tempo pada hari ini."
                    : "Send a morning digest of all client invoices due today."}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                disabled={!isPro}
                checked={formData.notifyOnRecurring}
                onChange={(e) => setFormData((prev) => ({ ...prev, notifyOnRecurring: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-[#0f6b4f] focus:ring-[#0f6b4f]"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {locale === "id" ? "Invoice Berulang Diterbitkan Otomatis" : "Recurring Invoice Generated"}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {locale === "id"
                    ? "Kirim notifikasi saat sistem cron berhasil menerbitkan tagihan periodik baru untuk pelanggan Anda."
                    : "Send notification when cron automatically generates a new recurring invoice."}
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0f6b4f] hover:bg-[#0c5740] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            <span>
              {isSaving
                ? locale === "id"
                  ? "Menyimpan..."
                  : "Saving..."
                : locale === "id"
                ? "Simpan Pengaturan Notifikasi"
                : "Save Notification Settings"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
