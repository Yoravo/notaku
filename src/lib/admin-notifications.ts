import { sendDiscordWebhook } from "./bot-notifications";
import { formatMoney } from "./currencies";
import { formatDateWIB } from "./invoice-utils";

/**
 * Mengirimkan alert real-time ke Discord Webhook admin saat ada akun baru yang telah TERVERIFIKASI.
 * Non-blocking: kegagalan Discord tidak menggagalkan proses auth/verifikasi.
 */
export async function notifyAdminVerifiedUser(user: {
  id: string;
  name?: string | null;
  email: string;
  provider?: string;
}): Promise<void> {
  const webhookUrl = process.env.ADMIN_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await sendDiscordWebhook({
      webhookUrl,
      title: "👤 Pengguna Baru Terverifikasi",
      description: `Akun baru telah aktif dan siap membuat invoice di NotaKu.`,
      color: 0x0f6b4f, // Emerald brand
      fields: [
        { name: "Nama", value: user.name || "Tanpa Nama", inline: true },
        { name: "Email", value: user.email, inline: true },
        { name: "Metode", value: user.provider || "Email Verifikasi", inline: true },
        { name: "Waktu (WIB)", value: formatDateWIB(new Date()), inline: false },
      ],
    });
  } catch (err) {
    console.error("[ADMIN_NOTIF_USER_ERROR]", err);
  }
}

/**
 * Mengirimkan alert real-time ke Discord Webhook admin saat langganan PRO atau BUSINESS sukses diselesaikan.
 * Non-blocking: kegagalan Discord tidak menggagalkan webhook payment gateway.
 */
export async function notifyAdminNewSubscription(data: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  plan: "PRO" | "BUSINESS";
  amount: number;
  intervalDays: number;
  paymentId?: string | null;
}): Promise<void> {
  const webhookUrl = process.env.ADMIN_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const planColor = data.plan === "BUSINESS" ? 0x7c3aed : 0xd97706; // Violet vs Amber
  const intervalLabel = data.intervalDays >= 365 ? "1 Tahun (Tahunan)" : "1 Bulan (Bulanan)";

  try {
    await sendDiscordWebhook({
      webhookUrl,
      title: `💎 Langganan Baru: NotaKu ${data.plan}`,
      description: `Pembayaran langganan paket berbayar berhasil dikonfirmasi via Mayar.id.`,
      color: planColor,
      fields: [
        { name: "Pelanggan", value: `${data.userName || "User"} (${data.userEmail})`, inline: false },
        { name: "Paket", value: `NotaKu ${data.plan}`, inline: true },
        { name: "Durasi", value: intervalLabel, inline: true },
        { name: "Nominal", value: formatMoney(data.amount, "IDR"), inline: true },
        { name: "Payment Ref", value: data.paymentId || "-", inline: true },
        { name: "Waktu (WIB)", value: formatDateWIB(new Date()), inline: true },
      ],
    });
  } catch (err) {
    console.error("[ADMIN_NOTIF_SUB_ERROR]", err);
  }
}
