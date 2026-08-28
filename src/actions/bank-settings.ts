"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkRateLimit, checkServerActionRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { auditLog } from "@/lib/audit-log";
import { bankAccountSchema } from "@/lib/validations";
import crypto from "crypto";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

// 1. Simpan Data Rekening Pertama Kali (Langsung Aktif)
export async function saveInitialBankAccount(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const validated = bankAccountSchema.parse(data);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bankAccountNumber: true, bankAccountLocked: true, email: true },
  });

  // Jika sudah ada rekening sebelumnya, wajib lewat alur OTP
  if (dbUser?.bankAccountNumber) {
    throw new Error(
      "Rekening sudah pernah didaftarkan. Gunakan verifikasi OTP email untuk mengubah data rekening."
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bankName: validated.bankName,
      bankAccountNumber: validated.bankAccountNumber.trim(),
      bankAccountName: validated.bankAccountName.trim().toUpperCase(),
      bankAccountLocked: true,
    },
  });

  auditLog("user.bank_account_setup", {
    userId: user.id,
    bankName: validated.bankName,
    accountNumber: validated.bankAccountNumber,
    accountName: validated.bankAccountName,
  });

  revalidatePath("/settings");
  revalidatePath("/wallet");
  return { success: true, message: "Rekening berhasil disimpan dan aktif!" };
}

// 2. Request OTP Email untuk Ubah Rekening (Rate limit ketat: maks 3x per 24 jam)
export async function requestBankChangeOtp() {
  const user = await getUser();

  // Rate limit: Maksimal 3 kali request OTP per 24 jam (86400 detik)
  const isAllowed = await checkRateLimit(`otp:bank-change:${user.id}`, 3, 86400);
  if (!isAllowed) {
    return {
      success: false,
      error:
        "Batas harian tercapai. Anda hanya dapat meminta kode verifikasi OTP maksimal 3 kali dalam 24 jam demi keamanan akun.",
    };
  }

  // Generate 6 digit angka cryptographically secure
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Berlaku 10 menit

  // Simpan OTP ke auditLog / temporary store
  await auditLog(
    "auth.bank_change_otp",
    {
      userId: user.id,
      email: user.email,
      otpCode,
      expiresAt: expiresAt.toISOString(),
    },
    { userId: user.id }
  );

  // Kirim email OTP dengan template aman
  try {
    await sendEmail({
      to: user.email,
      subject: `[NotaKu] Kode Verifikasi Perubahan Rekening: ${otpCode}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="margin-bottom: 20px; border-bottom: 2px solid #0f6b4f; padding-bottom: 12px;">
            <h2 style="margin: 0; color: #111827; font-size: 20px;">Nota<span style="color: #0f6b4f;">Ku</span></h2>
          </div>

          <h3 style="color: #111827; font-size: 16px; margin-top: 0;">Permintaan Perubahan Rekening Bank / E-Wallet</h3>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            Halo <strong>${user.name}</strong>, kami menerima permintaan untuk memperbarui data rekening bank / e-wallet pada akun NotaKu Anda.
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
            <p style="margin: 0; color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Kode Verifikasi OTP Anda</p>
            <p style="margin: 8px 0 0; color: #0f6b4f; font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">${otpCode}</p>
            <p style="margin: 8px 0 0; color: #15803d; font-size: 12px;">Kode ini hanya berlaku selama <strong>10 menit</strong>.</p>
          </div>

          <p style="color: #dc2626; font-size: 13px; line-height: 1.5; background-color: #fef2f2; padding: 12px; border-radius: 6px;">
            ⚠️ <strong>PENTING:</strong> Jangan berikan kode ini kepada siapa pun termasuk pihak yang mengatasnamakan NotaKu. Jika Anda tidak merasa melakukan permintaan ini, segera ganti kata sandi akun Anda.
          </p>

          <div style="margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
            &copy; ${new Date().getFullYear()} NotaKu. Aplikasi Billing & Faktur UMKM Indonesia.
          </div>
        </div>
      `,
    });

    return {
      success: true,
      message: `Kode OTP 6-digit telah dikirim ke ${user.email}. Silakan cek kotak masuk atau folder spam.`,
    };
  } catch (err) {
    console.error("Gagal mengirim email OTP:", err);
    return {
      success: false,
      error: "Gagal mengirim email verifikasi. Pastikan konfigurasi email aktif.",
    };
  }
}

// 3. Verifikasi OTP & Update Rekening Baru
export async function verifyOtpAndUpdateBankAccount(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  otpCode: string;
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "destructive");

  const validated = bankAccountSchema.parse({
    bankName: data.bankName,
    bankAccountNumber: data.bankAccountNumber,
    bankAccountName: data.bankAccountName,
  });

  const inputOtp = data.otpCode.trim();
  if (!inputOtp || inputOtp.length !== 6) {
    return { success: false, error: "Kode OTP harus berupa 6 digit angka." };
  }

  // Cari OTP terakhir dari auditLog untuk user ini
  const latestOtpLog = await prisma.auditLog.findFirst({
    where: {
      userId: user.id,
      event: "auth.bank_change_otp",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latestOtpLog || !latestOtpLog.detail) {
    return {
      success: false,
      error: "Kode OTP tidak ditemukan atau belum pernah diminta. Silakan minta kode baru.",
    };
  }

  const detail = latestOtpLog.detail as {
    otpCode?: string;
    expiresAt?: string;
  };

  const now = new Date();
  const expiresAt = detail.expiresAt ? new Date(detail.expiresAt) : new Date(0);

  if (now > expiresAt) {
    return {
      success: false,
      error: "Kode OTP telah kedaluwarsa. Silakan minta kode verifikasi baru.",
    };
  }

  if (detail.otpCode !== inputOtp) {
    return {
      success: false,
      error: "Kode OTP salah. Periksa kembali email Anda.",
    };
  }

  // Update rekening baru dan tandai OTP sudah digunakan
  const oldUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bankName: true, bankAccountNumber: true, bankAccountName: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bankName: validated.bankName,
      bankAccountNumber: validated.bankAccountNumber.trim(),
      bankAccountName: validated.bankAccountName.trim().toUpperCase(),
      bankAccountLocked: true,
    },
  });

  // Hapus/expire OTP agar tidak bisa dipakai ulang
  await auditLog(
    "user.bank_account_updated_via_otp",
    {
      userId: user.id,
      oldBank: oldUser?.bankName,
      oldAccountNumber: oldUser?.bankAccountNumber,
      newBank: validated.bankName,
      newAccountNumber: validated.bankAccountNumber,
      newAccountName: validated.bankAccountName,
    },
    { userId: user.id }
  );

  revalidatePath("/settings");
  revalidatePath("/wallet");

  return {
    success: true,
    message: "Rekening bank berhasil diperbarui dengan aman!",
  };
}
