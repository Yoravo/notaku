import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currencies";
import { formatDateWIB } from "@/lib/invoice-utils";

interface SendTelegramOptions {
  botToken?: string | null;
  chatId?: string | null;
  text: string;
  parseMode?: "HTML" | "Markdown";
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface SendDiscordOptions {
  webhookUrl?: string | null;
  title: string;
  description?: string;
  fields?: DiscordEmbedField[];
  color?: number; // decimal color code (e.g. 0x0f6b4f = 1010511)
  url?: string;
}

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramMessage({
  botToken,
  chatId,
  text,
  parseMode = "HTML",
}: SendTelegramOptions): Promise<{ success: boolean; error?: string }> {
  if (!botToken || !chatId) {
    return { success: false, error: "Telegram Bot Token and Chat ID are required" };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.description || "Telegram API error" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to send Telegram message" };
  }
}

/**
 * Send embed message via Discord Webhook
 */
export async function sendDiscordWebhook({
  webhookUrl,
  title,
  description,
  fields,
  color = 0x0f6b4f, // Emerald default
  url,
}: SendDiscordOptions): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return { success: false, error: "Invalid Discord Webhook URL" };
  }

  try {
    const embed: any = {
      title,
      color,
      timestamp: new Date().toISOString(),
      footer: {
        text: "NotaKu • Notifikasi Penjual",
        icon_url: "https://notaku.store/logo.png",
      },
    };

    if (description) embed.description = description;
    if (fields && fields.length > 0) embed.fields = fields;
    if (url) embed.url = url;

    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "NotaKu Bot",
        avatar_url: "https://notaku.store/logo.png",
        embeds: [embed],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { success: false, error: `Discord HTTP ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to send Discord webhook" };
  }
}

/**
 * Notify Seller when an invoice is settled / marked as PAID
 */
export async function notifySellerInvoicePaid(
  userId: string,
  invoice: {
    number: string;
    publicId: string;
    total: number | string;
    currency?: string;
    customerName: string;
    paymentMethod?: string;
    paidAt?: Date | string;
  },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        telegramBotToken: true,
        telegramChatId: true,
        telegramEnabled: true,
        discordWebhookUrl: true,
        discordEnabled: true,
        notifyOnPayment: true,
      },
    });

    if (!user || user.plan !== "PRO" || !user.notifyOnPayment) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
    const invoiceUrl = `${appUrl}/i/${invoice.publicId}`;
    const formattedAmount = formatMoney(Number(invoice.total), invoice.currency || "IDR");
    const method = invoice.paymentMethod === "NOTAKU_DIGITAL" ? "Digital (QRIS/VA)" : "Transfer Manual";

    // 1. Dispatch to Telegram
    if (user.telegramEnabled && user.telegramBotToken && user.telegramChatId) {
      const tgMessage = [
        `💰 <b>Pembayaran Tagihan Diterima!</b>`,
        ``,
        `Invoice <code>${invoice.number}</code> sebesar <b>${formattedAmount}</b> telah berhasil dilunasi oleh pelanggan.`,
        ``,
        `👤 <b>Pelanggan:</b> ${invoice.customerName}`,
        `💳 <b>Metode:</b> ${method}`,
        `🕒 <b>Waktu:</b> ${formatDateWIB(invoice.paidAt || new Date())}`,
        ``,
        `🔗 <a href="${invoiceUrl}">Buka Invoice Publik</a>`,
      ].join("\n");

      sendTelegramMessage({
        botToken: user.telegramBotToken,
        chatId: user.telegramChatId,
        text: tgMessage,
      }).catch((e) => console.error("[TG_NOTIF_ERROR]", e));
    }

    // 2. Dispatch to Discord
    if (user.discordEnabled && user.discordWebhookUrl) {
      sendDiscordWebhook({
        webhookUrl: user.discordWebhookUrl,
        title: "💰 Pembayaran Tagihan Diterima!",
        description: `Invoice **${invoice.number}** telah berhasil dilunasi oleh pelanggan.`,
        color: 0x10b981, // Emerald green
        url: invoiceUrl,
        fields: [
          { name: "Total Pembayaran", value: `**${formattedAmount}**`, inline: true },
          { name: "Pelanggan", value: invoice.customerName, inline: true },
          { name: "Metode", value: method, inline: true },
          { name: "Nomor Invoice", value: invoice.number, inline: true },
        ],
      }).catch((e) => console.error("[DISCORD_NOTIF_ERROR]", e));
    }
  } catch (err) {
    console.error("[BOT_NOTIF_PAID_ERROR]", err);
  }
}

/**
 * Notify Seller when invoices are due today (H-0)
 */
export async function notifySellerDueToday(
  userId: string,
  invoices: {
    number: string;
    publicId: string;
    total: number | string;
    currency?: string;
    customerName: string;
    dueDate: Date | string;
  }[],
) {
  if (!invoices.length) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        telegramBotToken: true,
        telegramChatId: true,
        telegramEnabled: true,
        discordWebhookUrl: true,
        discordEnabled: true,
        notifyOnDueDate: true,
      },
    });

    if (!user || user.plan !== "PRO" || !user.notifyOnDueDate) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

    // 1. Dispatch to Telegram
    if (user.telegramEnabled && user.telegramBotToken && user.telegramChatId) {
      const tgLines = [
        `⏰ <b>Pemberitahuan: Tagihan Jatuh Tempo Hari Ini</b>`,
        ``,
        `Terdapat <b>${invoices.length} tagihan</b> yang jatuh tempo pada hari ini:`,
        ``,
      ];

      invoices.forEach((inv, idx) => {
        const formattedAmount = formatMoney(Number(inv.total), inv.currency || "IDR");
        tgLines.push(`${idx + 1}. <code>${inv.number}</code> - ${inv.customerName} (<b>${formattedAmount}</b>)`);
      });

      tgLines.push(``);
      tgLines.push(`🔗 <a href="${appUrl}/invoices">Buka Dashboard Tagihan</a>`);

      sendTelegramMessage({
        botToken: user.telegramBotToken,
        chatId: user.telegramChatId,
        text: tgLines.join("\n"),
      }).catch((e) => console.error("[TG_NOTIF_DUE_ERROR]", e));
    }

    // 2. Dispatch to Discord
    if (user.discordEnabled && user.discordWebhookUrl) {
      const fields: DiscordEmbedField[] = invoices.slice(0, 10).map((inv) => ({
        name: `${inv.number} • ${inv.customerName}`,
        value: `Total: **${formatMoney(Number(inv.total), inv.currency || "IDR")}**`,
        inline: false,
      }));

      sendDiscordWebhook({
        webhookUrl: user.discordWebhookUrl,
        title: `⏰ ${invoices.length} Tagihan Jatuh Tempo Hari Ini`,
        description: `Berikut adalah ringkasan invoice pelanggan Anda yang jatuh tempo hari ini:`,
        color: 0xf59e0b, // Amber
        url: `${appUrl}/invoices`,
        fields,
      }).catch((e) => console.error("[DISCORD_NOTIF_DUE_ERROR]", e));
    }
  } catch (err) {
    console.error("[BOT_NOTIF_DUE_ERROR]", err);
  }
}

/**
 * Notify Seller when a recurring invoice profile automatically generates a new invoice
 */
export async function notifySellerRecurringGenerated(
  userId: string,
  recurring: {
    title: string;
    frequency: string;
  },
  invoice: {
    number: string;
    publicId: string;
    total: number | string;
    currency?: string;
    customerName: string;
    dueDate?: Date | string | null;
  },
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        telegramBotToken: true,
        telegramChatId: true,
        telegramEnabled: true,
        discordWebhookUrl: true,
        discordEnabled: true,
        notifyOnRecurring: true,
      },
    });

    if (!user || user.plan !== "PRO" || !user.notifyOnRecurring) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
    const invoiceUrl = `${appUrl}/i/${invoice.publicId}`;
    const formattedAmount = formatMoney(Number(invoice.total), invoice.currency || "IDR");

    // 1. Dispatch to Telegram
    if (user.telegramEnabled && user.telegramBotToken && user.telegramChatId) {
      const tgMessage = [
        `🔄 <b>Tagihan Berulang Diterbitkan Otomatis!</b>`,
        ``,
        `Jadwal: <b>${recurring.title}</b> (${recurring.frequency})`,
        `Invoice: <code>${invoice.number}</code>`,
        `Pelanggan: <b>${invoice.customerName}</b>`,
        `Nominal: <b>${formattedAmount}</b>`,
        ``,
        `🔗 <a href="${invoiceUrl}">Lihat Invoice Baru</a>`,
      ].join("\n");

      sendTelegramMessage({
        botToken: user.telegramBotToken,
        chatId: user.telegramChatId,
        text: tgMessage,
      }).catch((e) => console.error("[TG_NOTIF_REC_ERROR]", e));
    }

    // 2. Dispatch to Discord
    if (user.discordEnabled && user.discordWebhookUrl) {
      sendDiscordWebhook({
        webhookUrl: user.discordWebhookUrl,
        title: "🔄 Tagihan Berulang Diterbitkan Otomatis",
        description: `Invoice baru berhasil digenerate dari jadwal **${recurring.title}**.`,
        color: 0x3b82f6, // Blue
        url: invoiceUrl,
        fields: [
          { name: "Nomor Invoice", value: invoice.number, inline: true },
          { name: "Total", value: `**${formattedAmount}**`, inline: true },
          { name: "Pelanggan", value: invoice.customerName, inline: true },
          { name: "Frekuensi", value: recurring.frequency, inline: true },
        ],
      }).catch((e) => console.error("[DISCORD_NOTIF_REC_ERROR]", e));
    }
  } catch (err) {
    console.error("[BOT_NOTIF_REC_ERROR]", err);
  }
}
