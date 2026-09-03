"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { renderBroadcastEmailHtml } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { auditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

export type BroadcastAudience = "ALL" | "PRO_ONLY" | "FREE_ONLY";

export interface SendBroadcastInput {
  subject: string;
  badge?: string;
  badgeType?: "announcement" | "update" | "promo" | "security";
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  audience: BroadcastAudience;
  respectNewsletterOptIn?: boolean; // Default true: hanya kirim ke user dengan receiveNewsletter === true
}

export interface BroadcastLogData {
  id: string;
  subject: string;
  audience: string;
  recipientsCount: number;
  badge: string;
  createdAt: string;
  adminEmail: string;
}

const BADGE_THEMES = {
  announcement: { label: "Pengumuman Resmi", bg: "#ecfdf5", color: "#0f6b4f" },
  update: { label: "Pembaruan Fitur", bg: "#eff6ff", color: "#2563eb" },
  promo: { label: "Promo & Penawaran", bg: "#fef3c7", color: "#d97706" },
  security: { label: "Pemberitahuan Sistem", bg: "#f1f5f9", color: "#475569" },
};

/**
 * Mengambil perkiraan jumlah penerima berdasarkan target audiens
 */
export async function getBroadcastAudienceEstimate(
  audience: BroadcastAudience,
  respectNewsletterOptIn = true
) {
  await requireAdmin();

  const whereClause: any = {};

  if (audience === "PRO_ONLY") {
    whereClause.plan = "PRO";
  } else if (audience === "FREE_ONLY") {
    whereClause.plan = "FREE";
  }

  if (respectNewsletterOptIn) {
    whereClause.receiveNewsletter = true;
  }

  const count = await prisma.user.count({ where: whereClause });
  return { count };
}

/**
 * Mengambil riwayat pengiriman email broadcast dari audit log
 */
export async function getBroadcastHistory(): Promise<BroadcastLogData[]> {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    where: { event: "admin.broadcast_email_sent" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const adminIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, email: true },
  });
  const adminMap = new Map(admins.map((a) => [a.id, a.email]));

  return logs.map((log) => {
    const detail = (log.detail || {}) as Record<string, any>;
    return {
      id: log.id,
      subject: detail.subject || "Tanpa Judul",
      audience: detail.audience || "ALL",
      recipientsCount: Number(detail.recipientsCount || 0),
      badge: detail.badge || "Pengumuman",
      createdAt: log.createdAt.toISOString(),
      adminEmail: log.userId ? adminMap.get(log.userId) || "Admin" : "System",
    };
  });
}

/**
 * Mengirimkan email broadcast via Resend ke seluruh target user
 */
export async function sendBroadcastEmail(input: SendBroadcastInput) {
  const admin = await requireAdmin();

  if (!input.subject || !input.subject.trim()) {
    throw new Error("Subjek email pengumuman wajib diisi.");
  }

  if (!input.content || !input.content.trim()) {
    throw new Error("Isi konten email pengumuman wajib diisi.");
  }

  const whereClause: any = {};

  if (input.audience === "PRO_ONLY") {
    whereClause.plan = "PRO";
  } else if (input.audience === "FREE_ONLY") {
    whereClause.plan = "FREE";
  }

  if (input.respectNewsletterOptIn !== false) {
    whereClause.receiveNewsletter = true;
  }

  // Ambil daftar email penerima
  const recipients = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, email: true, name: true },
  });

  if (recipients.length === 0) {
    throw new Error("Tidak ada pengguna aktif yang memenuhi kriteria audiens yang dipilih.");
  }

  const theme = BADGE_THEMES[input.badgeType || "announcement"];
  const badgeLabel = input.badge?.trim() || theme.label;

  const html = renderBroadcastEmailHtml({
    subject: input.subject.trim(),
    badge: badgeLabel,
    badgeBg: theme.bg,
    badgeColor: theme.color,
    content: input.content.trim(),
    ctaText: input.ctaText?.trim(),
    ctaUrl: input.ctaUrl?.trim(),
  });

  let sentCount = 0;
  let failedCount = 0;

  // Batch pengiriman dengan batasan concurrency aman untuk Resend API
  const BATCH_SIZE = 5;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (recipient) => {
        try {
          await sendEmail({
            to: recipient.email,
            subject: input.subject.trim(),
            html,
          });
          sentCount++;
        } catch (err) {
          console.error(`[BROADCAST_SEND_FAILED] User ${recipient.id} (${recipient.email}):`, err);
          failedCount++;
        }
      })
    );
  }

  // Catat ke Audit Log sistem
  await auditLog(
    "admin.broadcast_email_sent",
    {
      subject: input.subject.trim(),
      audience: input.audience,
      badge: badgeLabel,
      recipientsCount: sentCount,
      failedCount,
      totalAttempted: recipients.length,
      ctaText: input.ctaText?.trim() || null,
      ctaUrl: input.ctaUrl?.trim() || null,
    },
    { userId: admin.id }
  );

  revalidatePath("/admin/broadcast");

  return {
    success: true,
    sentCount,
    failedCount,
    total: recipients.length,
  };
}
