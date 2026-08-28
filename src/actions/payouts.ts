"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { payoutRequestSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

export async function requestPayout(data: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Sesi telah berakhir. Silakan login kembali." };
  }

  const parsed = payoutRequestSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data penarikan dana tidak valid",
    };
  }

  const { amount, notes } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        bankAccountLocked: true,
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    if (!user.bankAccountNumber || !user.bankName) {
      return {
        success: false,
        error:
          "Anda belum mendaftarkan rekening bank tujuan. Buka menu Pengaturan > Rekening & Pembayaran terlebih dahulu.",
      };
    }

    const currentBalance = Number(user.balance);
    if (amount > currentBalance) {
      return {
        success: false,
        error: `Saldo tidak mencukupi. Saldo tersedia saat ini: Rp${currentBalance.toLocaleString("id-ID")}`,
      };
    }

    // Biaya transfer antar-bank / admin jika ada (Rp0 untuk standar platform)
    const feeAmount = 0;
    const netAmount = amount - feeAmount;

    const payout = await prisma.$transaction(async (tx) => {
      // 1. Kurangi saldo pengguna secara atomic
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // 2. Buat record Payout
      const newPayout = await tx.payout.create({
        data: {
          userId: user.id,
          amount,
          feeAmount,
          netAmount,
          bankName: user.bankName!,
          accountNumber: user.bankAccountNumber!,
          accountName: user.bankAccountName || user.name,
          notes,
          status: "PENDING",
        },
      });

      // 3. Catat entri mutasi Ledger Transaksi
      await tx.transaction.create({
        data: {
          userId: user.id,
          payoutId: newPayout.id,
          type: "PAYOUT_WITHDRAWAL",
          amount: -amount,
          grossAmount: amount,
          feeAmount: feeAmount,
          description: `Penarikan saldo ke ${user.bankName} ${user.bankAccountNumber} (a/n ${user.bankAccountName || user.name})`,
          referenceId: newPayout.id,
        },
      });

      return newPayout;
    });

    auditLog("payout.requested", {
      userId: user.id,
      payoutId: payout.id,
      amount,
      netAmount,
      bankName: user.bankName,
      accountNumber: user.bankAccountNumber,
    });

    revalidatePath("/wallet");
    revalidatePath("/dashboard");
    revalidatePath("/admin/payouts");

    return {
      success: true,
      message: `Permintaan penarikan dana sebesar Rp${amount.toLocaleString("id-ID")} berhasil diajukan dan sedang diproses.`,
      payoutId: payout.id,
    };
  } catch (error: any) {
    console.error("Error requesting payout:", error);
    return {
      success: false,
      error: "Gagal memproses penarikan dana. Silakan coba beberapa saat lagi.",
    };
  }
}
