"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auditLog } from "@/lib/audit-log";

export async function updateUserPlan(userId: string, plan: "FREE" | "PRO") {
  const admin = await requireAdmin();

  if (!userId || !["FREE", "PRO"].includes(plan)) {
    return { success: false, error: "Data input tidak valid" };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, plan: true },
    });

    if (!targetUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    // Catat ke Audit Log
    await auditLog(
      "admin.user_plan_updated",
      {
        targetUserId: userId,
        targetEmail: targetUser.email,
        oldPlan: targetUser.plan,
        newPlan: plan,
        performedBy: admin.email,
      },
      { userId: admin.id }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("[ADMIN_UPDATE_PLAN_ERROR]", error);
    return { success: false, error: "Gagal memperbarui paket pengguna" };
  }
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
  const admin = await requireAdmin();

  if (!userId || !["USER", "ADMIN"].includes(role)) {
    return { success: false, error: "Data input tidak valid" };
  }

  // Cegah admin mencabut role admin dirinya sendiri secara tidak sengaja
  if (userId === admin.id && role !== "ADMIN") {
    return {
      success: false,
      error: "Anda tidak dapat mencabut hak akses ADMIN diri Anda sendiri",
    };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    await auditLog(
      "admin.user_role_updated",
      {
        targetUserId: userId,
        targetEmail: targetUser.email,
        oldRole: targetUser.role,
        newRole: role,
        performedBy: admin.email,
      },
      { userId: admin.id }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("[ADMIN_UPDATE_ROLE_ERROR]", error);
    return { success: false, error: "Gagal memperbarui peran pengguna" };
  }
}

export type AnnouncementPlacement = "ALL" | "LANDING" | "DASHBOARD";

export async function saveAnnouncement(data: {
  message: string;
  type: "info" | "warning" | "success";
  placement?: AnnouncementPlacement;
  isActive: boolean;
  linkText?: string;
  linkUrl?: string;
}) {
  const admin = await requireAdmin();

  try {
    await auditLog(
      "system.announcement",
      {
        message: data.message.trim(),
        type: data.type,
        placement: data.placement || "ALL",
        isActive: data.isActive,
        linkText: data.linkText?.trim() || null,
        linkUrl: data.linkUrl?.trim() || null,
        updatedBy: admin.email,
        updatedAt: new Date().toISOString(),
      },
      { userId: admin.id }
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/admin/announcement");
    revalidatePath("/(dashboard)", "layout");

    return { success: true };
  } catch (error) {
    console.error("[ADMIN_SAVE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Gagal menyimpan pengumuman" };
  }
}

export async function getActiveAnnouncement(target?: "LANDING" | "DASHBOARD") {
  try {
    const latest = await prisma.auditLog.findFirst({
      where: { event: "system.announcement" },
      orderBy: { createdAt: "desc" },
    });

    if (!latest || !latest.detail) return null;

    const detail = latest.detail as {
      message?: string;
      type?: "info" | "warning" | "success";
      placement?: AnnouncementPlacement;
      isActive?: boolean;
      linkText?: string | null;
      linkUrl?: string | null;
    };

    if (!detail.isActive || !detail.message) {
      return null;
    }

    const placement = detail.placement || "ALL";
    if (target && placement !== "ALL" && placement !== target) {
      return null;
    }

    return {
      message: detail.message,
      type: detail.type || "info",
      placement,
      linkText: detail.linkText || null,
      linkUrl: detail.linkUrl || null,
    };
  } catch {
    return null;
  }
}

export type PromoData = {
  id?: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses?: number | null;
  usedCount?: number;
  expiresAt?: string | null;
  isActive: boolean;
};

export async function savePromoCode(data: PromoData) {
  const admin = await requireAdmin();

  if (!data.code || data.discountValue <= 0) {
    return { success: false, error: "Kode promo dan nilai diskon wajib diisi" };
  }

  const cleanCode = data.code.trim().toUpperCase();

  try {
    const promoEntry = {
      id: data.id || `promo_${Date.now()}`,
      code: cleanCode,
      description: data.description?.trim() || "",
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      isActive: data.isActive,
      updatedBy: admin.email,
      updatedAt: new Date().toISOString(),
    };

    await auditLog(
      "admin.promo_saved",
      promoEntry,
      { userId: admin.id }
    );

    revalidatePath("/admin/promos");

    return { success: true, promo: promoEntry };
  } catch (error) {
    console.error("[ADMIN_SAVE_PROMO_ERROR]", error);
    return { success: false, error: "Gagal menyimpan voucher promo" };
  }
}

export async function getPromoCodes(): Promise<PromoData[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { event: "admin.promo_saved" },
      orderBy: { createdAt: "desc" },
    });

    const promoMap = new Map<string, PromoData>();
    for (const log of logs) {
      if (!log.detail) continue;
      const d = log.detail as Record<string, any>;
      const codeKey = (d.code || "").toUpperCase();
      if (codeKey && !promoMap.has(codeKey)) {
        promoMap.set(codeKey, {
          id: d.id,
          code: codeKey,
          description: d.description,
          discountType: d.discountType || "PERCENTAGE",
          discountValue: Number(d.discountValue || 0),
          maxUses: d.maxUses ? Number(d.maxUses) : null,
          usedCount: 0,
          expiresAt: d.expiresAt,
          isActive: d.isActive ?? true,
        });
      }
    }

    const promos = Array.from(promoMap.values());

    // Hitung real-time usage count untuk setiap promo
    for (const promo of promos) {
      try {
        const count = await prisma.auditLog.count({
          where: {
            event: "payment.mayar_settlement",
            detail: {
              path: ["promoCode"],
              equals: promo.code,
            },
          },
        });
        promo.usedCount = count;
      } catch {
        promo.usedCount = 0;
      }
    }

    return promos;
  } catch {
    return [];
  }
}

export async function updatePayoutStatus(data: {
  payoutId: string;
  status: "PROCESSING" | "COMPLETED" | "REJECTED";
  adminNotes?: string;
}) {
  const admin = await requireAdmin();

  if (!data.payoutId || !["PROCESSING", "COMPLETED", "REJECTED"].includes(data.status)) {
    return { success: false, error: "Status atau ID penarikan tidak valid" };
  }

  try {
    const payout = await prisma.payout.findUnique({
      where: { id: data.payoutId },
      include: { user: true },
    });

    if (!payout) {
      return { success: false, error: "Permintaan penarikan dana tidak ditemukan" };
    }

    if (payout.status === "COMPLETED" || payout.status === "REJECTED") {
      return {
        success: false,
        error: `Penarikan ini sudah berstatus ${payout.status} dan tidak dapat diubah lagi`,
      };
    }

    await prisma.$transaction(async (tx) => {
      // Jika admin menolak penarikan, kembalikan saldo ke user secara otomatis (Refund atomic)
      if (data.status === "REJECTED") {
        await tx.user.update({
          where: { id: payout.userId },
          data: {
            balance: {
              increment: payout.amount,
            },
          },
        });

        // Catat entri REFUND di mutasi transaksi ledger
        await tx.transaction.create({
          data: {
            userId: payout.userId,
            payoutId: payout.id,
            type: "REFUND",
            amount: payout.amount,
            grossAmount: payout.amount,
            feeAmount: 0,
            description: `Pengembalian saldo: Penarikan #${payout.id.slice(-6)} ditolak (${data.adminNotes || "Dibatalkan Admin"})`,
            referenceId: payout.id,
          },
        });
      }

      // Update status payout
      await tx.payout.update({
        where: { id: payout.id },
        data: {
          status: data.status,
          adminNotes: data.adminNotes || null,
          processedAt: data.status === "COMPLETED" ? new Date() : payout.processedAt,
        },
      });
    });

    await auditLog(
      "admin.payout_status_updated",
      {
        payoutId: payout.id,
        userId: payout.userId,
        userEmail: payout.user.email,
        amount: Number(payout.amount),
        oldStatus: payout.status,
        newStatus: data.status,
        adminNotes: data.adminNotes || null,
        performedBy: admin.email,
      },
      { userId: admin.id }
    );

    revalidatePath("/admin/payouts");
    revalidatePath("/admin/finance");
    revalidatePath("/wallet");

    return { success: true };
  } catch (error) {
    console.error("[ADMIN_UPDATE_PAYOUT_ERROR]", error);
    return { success: false, error: "Gagal memperbarui status penarikan dana" };
  }
}
