import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { renderInvoiceEmailHtml } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";
import { formatDateWIB } from "@/lib/invoice-utils";
import { auditLog } from "@/lib/audit-log";
import { notifySellerDueToday } from "@/lib/bot-notifications";

/**
 * Automated Payment Reminders Cron Job
 *
 * Scheduled daily via Vercel Cron (e.g. 02:00 UTC / 09:00 WIB).
 * Runs through pending unpaid invoices (SENT & OVERDUE):
 * 1. H-3: Invoices due in 3 days (Friendly Reminder)
 * 2. H-0: Invoices due today (Due Date Reminder)
 * 3. H+3: Invoices overdue by 3 days (Overdue Notice & status update to OVERDUE if still SENT)
 *
 * Includes rate-limiting / duplicate prevention via AuditLog checks.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[CRON_ERROR] CRON_SECRET is not configured on server.");
    return NextResponse.json(
      { error: "Cron secret is not configured" },
      { status: 500 },
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.notaku.store";

  // Waktu WIB: Hitung range tanggal start dan end hari ini di zona waktu Asia/Jakarta
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "YYYY-MM-DD"

  // Helper untuk mendapatkan format string YYYY-MM-DD dengan offset hari
  const getOffsetDateStr = (daysOffset: number) => {
    const d = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  const hMinus3Str = getOffsetDateStr(3);  // 3 hari ke depan (H-3 jatuh tempo)
  const hTodayStr = todayStr;              // Hari ini (H-0 jatuh tempo)
  const hPlus3Str = getOffsetDateStr(-3);  // 3 hari lalu (H+3 lewat jatuh tempo)

  // Ambil semua invoice belum lunas (SENT & OVERDUE) yang mengaktifkan enableReminder, memiliki dueDate dan customer dengan email
  const candidateInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "OVERDUE"] },
      enableReminder: true,
      dueDate: { not: null },
      customer: {
        email: { not: null },
      },
    },
    include: {
      customer: true,
      user: {
        select: {
          businessName: true,
          name: true,
        },
      },
      items: true,
    },
  });

  const results = {
    totalChecked: candidateInvoices.length,
    remindersSent: 0,
    statusUpdatedToOverdue: 0,
    skippedDuplicateOrNoEmail: 0,
    errors: 0,
  };

  const dueTodayByUser = new Map<string, Array<{
    number: string;
    publicId: string;
    total: number | string;
    currency?: string;
    customerName: string;
    dueDate: Date;
  }>>();

  for (const invoice of candidateInvoices) {
    if (!invoice.dueDate || !invoice.customer.email) {
      results.skippedDuplicateOrNoEmail++;
      continue;
    }

    const invoiceDueDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(invoice.dueDate));

    let reminderType: "reminder_h3" | "reminder_today" | "reminder_overdue" | null = null;

    if (invoiceDueDateStr === hMinus3Str) {
      reminderType = "reminder_h3";
    } else if (invoiceDueDateStr === hTodayStr) {
      reminderType = "reminder_today";
      // Kumpulkan invoice jatuh tempo hari ini per seller untuk notifikasi Bot
      if (!dueTodayByUser.has(invoice.userId)) {
        dueTodayByUser.set(invoice.userId, []);
      }
      dueTodayByUser.get(invoice.userId)!.push({
        number: invoice.number,
        publicId: invoice.publicId,
        total: Number(invoice.total),
        currency: invoice.currency,
        customerName: invoice.customer.name,
        dueDate: new Date(invoice.dueDate),
      });
    } else if (invoiceDueDateStr === hPlus3Str || invoiceDueDateStr <= hPlus3Str) {
      reminderType = "reminder_overdue";
    }

    // Jika invoice sudah lewat jatuh tempo tapi masih berstatus SENT, update ke OVERDUE
    if (invoiceDueDateStr < todayStr && invoice.status === "SENT") {
      try {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "OVERDUE" },
        });
        results.statusUpdatedToOverdue++;
      } catch (err) {
        console.error(`[CRON_UPDATE_STATUS_FAILED] Invoice ${invoice.id}:`, err);
      }
    }

    if (!reminderType) {
      continue;
    }

    // Deduplikasi Ketat:
    // 1. Cek field lastReminderType & lastReminderAt pada model Invoice
    // 2. reminder_h3 dan reminder_today hanya dikirim 1 kali pada milestone masing-masing
    // 3. reminder_overdue hanya dikirim 1 kali setelah melewati H+3
    if (invoice.lastReminderType === reminderType) {
      // Jika reminderType sama dan sudah dikirim dalam 24 jam terakhir atau untuk overdue sudah pernah dikirim
      if (reminderType === "reminder_overdue") {
        results.skippedDuplicateOrNoEmail++;
        continue;
      }
      if (invoice.lastReminderAt) {
        const lastSentDateStr = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(invoice.lastReminderAt));
        if (lastSentDateStr === todayStr) {
          results.skippedDuplicateOrNoEmail++;
          continue;
        }
      }
    }

    // Cek juga audit log sebagai fallback layer perlindungan ganda
    const existingLogs = await prisma.auditLog.findMany({
      where: {
        event: "invoice.automated_reminder_sent",
        userId: invoice.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const alreadySentInLogs = existingLogs.some((log) => {
      if (!log.detail) return false;
      const detail = log.detail as {
        invoiceId?: string;
        reminderType?: string;
        sentDateStr?: string;
      };
      if (detail.invoiceId !== invoice.id) return false;
      if (reminderType === "reminder_overdue" && detail.reminderType === "reminder_overdue") {
        return true;
      }
      return detail.reminderType === reminderType && detail.sentDateStr === todayStr;
    });

    if (alreadySentInLogs) {
      results.skippedDuplicateOrNoEmail++;
      continue;
    }

    // Susun subjek dan konten email
    const businessName = invoice.user.businessName || invoice.user.name || "NotaKu";
    const formattedDueDate = formatDateWIB(invoice.dueDate, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const subjectMap = {
      reminder_h3: `[Pengingat] Tagihan ${invoice.number} dari ${businessName} jatuh tempo dalam 3 hari`,
      reminder_today: `[PENTING] Tagihan ${invoice.number} dari ${businessName} jatuh tempo HARI INI`,
      reminder_overdue: `[Pemberitahuan] Tagihan ${invoice.number} dari ${businessName} telah melewati jatuh tempo`,
    };

    const customMessageMap = {
      reminder_h3: `Pengingat ramah: Pembayaran invoice sebesar Rp${Number(invoice.total).toLocaleString("id-ID")} akan jatuh tempo pada ${formattedDueDate}.`,
      reminder_today: `Pemberitahuan: Pembayaran invoice sebesar Rp${Number(invoice.total).toLocaleString("id-ID")} jatuh tempo HARI INI (${formattedDueDate}).`,
      reminder_overdue: `Pemberitahuan: Pembayaran invoice sebesar Rp${Number(invoice.total).toLocaleString("id-ID")} telah melewati jatuh tempo (${formattedDueDate}). Mohon kesediaannya untuk segera menyelesaikan pembayaran.`,
    };

    try {
      const emailHtml = renderInvoiceEmailHtml({
        invoiceNumber: invoice.number,
        customerName: invoice.customer.name,
        businessName,
        subtotal: Number(invoice.subtotal),
        discountAmount: Number(invoice.discountAmount),
        discountType: invoice.discountType,
        discountValue: Number(invoice.discountValue),
        taxRate: Number(invoice.taxRate),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        dueDate: formattedDueDate,
        publicId: invoice.publicId,
        invoiceUrl: `${appUrl}/i/${invoice.publicId}`,
        type: "reminder",
        customMessage: customMessageMap[reminderType],
        items: invoice.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          price: Number(it.price),
          amount: Number(it.amount),
        })),
      });

      await sendEmail({
        to: invoice.customer.email,
        subject: subjectMap[reminderType],
        html: emailHtml,
      });

      // Update state reminder pada invoice untuk idempotency mutlak
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          lastReminderType: reminderType,
          lastReminderAt: now,
        },
      });

      await auditLog(
        "invoice.automated_reminder_sent",
        {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          customerId: invoice.customerId,
          customerEmail: invoice.customer.email,
          reminderType,
          sentDateStr: todayStr,
        },
        { userId: invoice.userId }
      );

      results.remindersSent++;
    } catch (err) {
      console.error(`[CRON_REMINDER_SEND_ERROR] Invoice ${invoice.id}:`, err);
      results.errors++;
    }
  }

  // Kirim rangkuman notifikasi bot (Telegram & Discord) untuk penjual yang memiliki invoice jatuh tempo hari ini
  for (const [sellerId, dueInvoices] of dueTodayByUser.entries()) {
    try {
      await notifySellerDueToday(sellerId, dueInvoices);
    } catch (botErr) {
      console.error(`[CRON_BOT_NOTIF_ERROR] Seller ${sellerId}:`, botErr);
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
