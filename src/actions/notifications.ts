"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkServerActionRateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";
import { sendTelegramMessage, sendDiscordWebhook } from "@/lib/bot-notifications";
import { z } from "zod";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export type BotNotificationSettings = {
  isPro: boolean;
  telegramChatId: string | null;
  telegramBotToken: string | null;
  telegramEnabled: boolean;
  discordWebhookUrl: string | null;
  discordEnabled: boolean;
  notifyOnPayment: boolean;
  notifyOnDueDate: boolean;
  notifyOnRecurring: boolean;
};

const updateSchema = z.object({
  telegramBotToken: z.string().trim().optional().nullable(),
  telegramChatId: z.string().trim().optional().nullable(),
  telegramEnabled: z.boolean(),
  discordWebhookUrl: z.string().trim().optional().nullable(),
  discordEnabled: z.boolean(),
  notifyOnPayment: z.boolean(),
  notifyOnDueDate: z.boolean(),
  notifyOnRecurring: z.boolean(),
});

export async function getBotNotificationSettings(): Promise<BotNotificationSettings> {
  const user = await getUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      telegramChatId: true,
      telegramBotToken: true,
      telegramEnabled: true,
      discordWebhookUrl: true,
      discordEnabled: true,
      notifyOnPayment: true,
      notifyOnDueDate: true,
      notifyOnRecurring: true,
    },
  });

  return {
    isPro: dbUser?.plan === "PRO",
    telegramChatId: dbUser?.telegramChatId || null,
    telegramBotToken: dbUser?.telegramBotToken || null,
    telegramEnabled: dbUser?.telegramEnabled || false,
    discordWebhookUrl: dbUser?.discordWebhookUrl || null,
    discordEnabled: dbUser?.discordEnabled || false,
    notifyOnPayment: dbUser?.notifyOnPayment ?? true,
    notifyOnDueDate: dbUser?.notifyOnDueDate ?? true,
    notifyOnRecurring: dbUser?.notifyOnRecurring ?? true,
  };
}

export async function updateBotNotificationSettings(data: z.infer<typeof updateSchema>) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const validated = updateSchema.parse(data);

  // Verifikasi plan PRO
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  if (dbUser?.plan !== "PRO") {
    throw new Error("Fitur notifikasi bot Telegram & Discord hanya tersedia untuk member NotaKu PRO.");
  }

  // Validasi Discord URL jika diaktifkan
  if (validated.discordEnabled && validated.discordWebhookUrl) {
    if (!validated.discordWebhookUrl.startsWith("https://discord.com/api/webhooks/")) {
      throw new Error("URL Discord Webhook tidak valid. Pastikan berawalan https://discord.com/api/webhooks/");
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramBotToken: validated.telegramBotToken || null,
      telegramChatId: validated.telegramChatId || null,
      telegramEnabled: validated.telegramEnabled,
      discordWebhookUrl: validated.discordWebhookUrl || null,
      discordEnabled: validated.discordEnabled,
      notifyOnPayment: validated.notifyOnPayment,
      notifyOnDueDate: validated.notifyOnDueDate,
      notifyOnRecurring: validated.notifyOnRecurring,
    },
  });

  auditLog(
    "notification.bot_settings_updated",
    {
      telegramEnabled: validated.telegramEnabled,
      discordEnabled: validated.discordEnabled,
    },
    { userId: user.id },
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function sendTestTelegramNotification(botToken: string, chatId: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  if (!botToken || !chatId) {
    throw new Error("Bot Token dan Chat ID wajib diisi untuk melakukan tes.");
  }

  const message = [
    `🔔 <b>Tes Notifikasi NotaKu Berhasil!</b>`,
    ``,
    `Bot Telegram Anda telah sukses terhubung dengan akun NotaKu. Anda akan menerima notifikasi otomatis untuk invoice lunas dan pengingat jatuh tempo di channel ini.`,
    ``,
    `🕒 Waktu: <i>${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</i>`,
  ].join("\n");

  const res = await sendTelegramMessage({
    botToken,
    chatId,
    text: message,
  });

  if (!res.success) {
    throw new Error(res.error || "Gagal mengirim pesan ke Telegram.");
  }

  return { success: true };
}

export async function sendTestDiscordNotification(webhookUrl: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    throw new Error("Discord Webhook URL tidak valid.");
  }

  const res = await sendDiscordWebhook({
    webhookUrl,
    title: "🔔 Tes Notifikasi NotaKu Berhasil!",
    description: "Webhook Discord Anda telah sukses terhubung dengan akun NotaKu. Anda akan menerima pemberitahuan otomatis saat ada pembayaran digital masuk dan invoice jatuh tempo.",
    color: 0x0f6b4f,
    url: "https://notaku.store",
    fields: [
      { name: "Status Integrasi", value: "Terhubung ✅", inline: true },
      { name: "Waktu Server", value: `${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`, inline: true },
    ],
  });

  if (!res.success) {
    throw new Error(res.error || "Gagal mengirim webhook ke Discord.");
  }

  return { success: true };
}
