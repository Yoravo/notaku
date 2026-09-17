import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { renderWeeklyDigestEmailHtml } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { auditLog } from "@/lib/audit-log";

/**
 * Weekly Product Digest & Business Tips Cron Job
 *
 * Scheduled weekly via Vercel Cron (e.g. Monday 01:00 UTC / 08:00 WIB).
 * Sends business performance digest & tips to active users who enabled `receiveNewsletter`.
 *
 * Enforces rule 28: Dedicated DB timestamp tracking (`lastDigestAt`) to prevent duplicates.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[CRON_ERROR] CRON_SECRET is not configured on server.");
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const expectedHeader = `Bearer ${cronSecret}`;

  const authBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expectedHeader);

  if (
    authBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(authBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // 6 hari threshold untuk memastikan digest hanya dikirim seminggu sekali
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Daftar tips bisnis mingguan acak/terstruktur
  const tips = [
    "Sertakan link pembayaran QRIS langsung di invoice agar pelanggan membayar hingga 3x lebih cepat tanpa perlu konfirmasi manual.",
    "Kirimkan pengingat ramah H-3 sebelum tanggal jatuh tempo lewat WhatsApp untuk menjaga arus kas bisnis Anda tetap lancar.",
    "Pisahkan rekening operasional harian dan rekening penerimaan invoice agar pencatatan omset lebih rapi saat pelaporan SPT Pajak.",
    "Gunakan fitur Recurring Invoice untuk klien berlangganan bulanan agar Anda tidak pernah lupa menerbitkan tagihan tepat waktu.",
    "Cantumkan catatan detail atau rincian item dengan jelas untuk menghindari komplain dan penundaan pembayaran dari klien.",
  ];

  // Pilih tip acak berdasarkan minggu kalender
  const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const selectedTip = tips[weekNumber % tips.length];

  // Format tanggal rentang laporan WIB
  const formatDateWIBShort = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const startDateStr = formatDateWIBShort(sevenDaysAgo);
  const endDateStr = formatDateWIBShort(now);

  // Ambil user yang menerima newsletter dan belum dikirimi dalam 6 hari terakhir
  const targetUsers = await (prisma.user as any).findMany({
    where: {
      receiveNewsletter: true,
      OR: [
        { lastDigestAt: null },
        { lastDigestAt: { lte: sixDaysAgo } },
      ],
    },
    take: 50, // Batch limit untuk mencegah timeout function
  });

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const user of targetUsers) {
    try {
      // Ambil tagihan user dalam 7 hari terakhir
      const invoicesLast7Days = await prisma.invoice.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          status: true,
          total: true,
        },
      });

      // Ambil tagihan yang saat ini masih pending / belum lunas
      const outstandingInvoices = await prisma.invoice.findMany({
        where: {
          userId: user.id,
          status: { in: ["SENT", "OVERDUE"] },
        },
        select: {
          total: true,
        },
      });

      const newInvoicesCount = invoicesLast7Days.length;
      const newInvoicesValue = invoicesLast7Days.reduce(
        (sum, inv) => sum + Number(inv.total),
        0
      );

      const paidInvoices = invoicesLast7Days.filter((inv) => inv.status === "PAID");
      const paidInvoicesCount = paidInvoices.length;
      const paidInvoicesValue = paidInvoices.reduce(
        (sum, inv) => sum + Number(inv.total),
        0
      );

      const outstandingInvoicesCount = outstandingInvoices.length;
      const outstandingInvoicesValue = outstandingInvoices.reduce(
        (sum, inv) => sum + Number(inv.total),
        0
      );

      // Lewati jika user belum punya invoice sama sekali
      if (newInvoicesCount === 0 && outstandingInvoicesCount === 0) {
        skippedCount++;
        continue;
      }

      // Render template HTML
      const emailHtml = renderWeeklyDigestEmailHtml({
        userName: user.name || "Pengguna NotaKu",
        startDate: startDateStr,
        endDate: endDateStr,
        newInvoicesCount,
        newInvoicesValue,
        paidInvoicesCount,
        paidInvoicesValue,
        outstandingInvoicesCount,
        outstandingInvoicesValue,
        weeklyTip: selectedTip,
      });

      // Kirim email via Resend
      await sendEmail({
        to: user.email,
        subject: `📊 Rangkuman Mingguan NotaKu: ${startDateStr} - ${endDateStr}`,
        html: emailHtml,
      });

      // Update state mutlak tanggal pengiriman pada user
      await (prisma.user as any).update({
        where: { id: user.id },
        data: { lastDigestAt: new Date() },
      });

      auditLog(
        "email.weekly_digest_sent",
        {
          newInvoicesCount,
          paidInvoicesCount,
          outstandingInvoicesCount,
          period: `${startDateStr} - ${endDateStr}`,
        },
        { userId: user.id }
      );

      sentCount++;
    } catch (err: any) {
      console.error(`[WEEKLY_DIGEST_ERROR] Failed for user ${user.id}:`, err);
      failedCount++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: targetUsers.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
    period: `${startDateStr} - ${endDateStr}`,
  });
}
