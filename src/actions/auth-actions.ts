"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const trimmedEmail = email?.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return {
        success: false,
        error: "Format alamat email tidak valid.",
      };
    }

    // 1. Anti-Spam Rate Limiting: IP-based & Email-based
    const reqHeaders = await headers();
    const clientIp =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "anonymous";

    // Limit 1: Maksimal 5 request per IP per 15 menit
    const ipAllowed = await checkRateLimit(`reset_pwd_ip:${clientIp}`, 5, 15 * 60);
    if (!ipAllowed) {
      return {
        success: false,
        error: "Terlalu banyak permintaan reset password dari perangkat Anda. Silakan coba lagi setelah 15 menit.",
      };
    }

    // Limit 2: Maksimal 3 request per email per 15 menit (mencegah inbox spamming)
    const emailAllowed = await checkRateLimit(
      `reset_pwd_email:${Buffer.from(trimmedEmail).toString("base64")}`,
      3,
      15 * 60
    );
    if (!emailAllowed) {
      return {
        success: false,
        error: "Permintaan reset password untuk email ini sudah mencapai batas. Silakan periksa inbox atau coba lagi nanti.",
      };
    }

    // 2. Trigger Better-Auth Password Reset Request via Server API
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://www.notaku.store";

    await auth.api.requestPasswordReset({
      body: {
        email: trimmedEmail,
        redirectTo: `${baseUrl}/reset-password`,
      },
    });

    return {
      success: true,
      message: "Tautan reset kata sandi telah dikirimkan ke email Anda jika terdaftar.",
    };
  } catch (err: any) {
    console.error("Gagal memproses request reset password:", err);
    // Keamanan: Jangan membocorkan error spesifik internal ke client
    return {
      success: false,
      error: "Gagal mengirim link reset password. Pastikan email benar atau coba lagi nanti.",
    };
  }
}
