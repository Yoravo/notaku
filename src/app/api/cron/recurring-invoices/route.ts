import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  RecurringInvoiceData,
  calculateNextRunDate,
  getTodayDateStrWIB,
  calculateDueDateStr,
} from "@/lib/recurring-invoices";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { sendEmail } from "@/lib/email";
import { renderInvoiceEmailHtml } from "@/lib/email-templates";
import { formatDateWIB } from "@/lib/invoice-utils";
import { auditLog } from "@/lib/audit-log";

/**
 * Recurring Invoices Automated Cron Job
 *
 * Runs daily via Vercel Cron (e.g. 01:00 UTC / 08:00 WIB).
 * 1. Checks all active recurring invoices due for execution today (nextRunDate <= todayStrWIB).
 * 2. Verifies user's active PRO subscription.
 * 3. Generates the new Invoice & Line Items in an atomic transaction.
 * 4. Automatically sends invoice notification email to client if enabled.
 * 5. Updates nextRunDate for the next billing cycle.
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

  const todayStr = getTodayDateStrWIB();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.notaku.store";

  // Ambil semua log recurring invoice
  const logs = await prisma.auditLog.findMany({
    where: {
      event: { in: ["recurring_invoice.created", "recurring_invoice.updated"] },
    },
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<string, RecurringInvoiceData>();
  for (const log of logs) {
    if (!log.detail) continue;
    const item = log.detail as unknown as RecurringInvoiceData;
    if (item.id) {
      map.set(item.id, item);
    }
  }

  // Filter profil yang statusnya ACTIVE dan jadwalnya hari ini atau terlewat
  const dueProfiles = Array.from(map.values()).filter(
    (r) => r.status === "ACTIVE" && r.nextRunDate <= todayStr
  );

  const results = {
    totalChecked: dueProfiles.length,
    generatedInvoices: 0,
    skippedNonPro: 0,
    skippedDuplicateToday: 0,
    emailsSent: 0,
    errors: 0,
  };

  for (const profile of dueProfiles) {
    // Mencegah double trigger di hari yang sama
    if (profile.lastRunDate === todayStr) {
      results.skippedDuplicateToday++;
      continue;
    }

    try {
      // Cek apakah pemilik invoice masih aktif PRO
      const user = await prisma.user.findUnique({
        where: { id: profile.userId },
        select: { id: true, plan: true, businessName: true, name: true },
      });

      if (!user || user.plan !== "PRO") {
        results.skippedNonPro++;
        continue;
      }

      // Cek apakah customer masih ada
      const customer = await prisma.customer.findUnique({
        where: { id: profile.customerId, userId: profile.userId },
      });

      if (!customer) {
        results.errors++;
        continue;
      }

      const dueDateStr = calculateDueDateStr(todayStr, profile.dueDaysOffset);
      const nextRun = calculateNextRunDate(todayStr, profile.frequency);

      const totals = calculateInvoiceTotals({
        items: profile.items,
        discountType: profile.discountType,
        discountValue: profile.discountValue,
        taxRate: profile.taxRate,
      });

      // Generate invoice
      const invoice = await prisma.$transaction(async (tx) => {
        const number = await generateInvoiceNumber(user.id, tx);

        return tx.invoice.create({
          data: {
            userId: user.id,
            customerId: profile.customerId,
            number,
            dueDate: new Date(dueDateStr),
            notes: profile.notes
              ? `${profile.notes}\n(Diterbitkan otomatis: ${profile.title})`
              : `Tagihan Otomatis: ${profile.title}`,
            subtotal: totals.subtotal,
            discountType: totals.discountType,
            discountValue: totals.discountValue,
            discountAmount: totals.discountAmount,
            taxRate: totals.taxRate,
            taxAmount: totals.taxAmount,
            total: totals.total,
            enableDirectTransfer: profile.enableDirectTransfer,
            enableDigitalPayment: profile.enableDigitalPayment,
            status: "SENT",
            items: {
              create: profile.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                amount: Math.round(item.quantity * item.price),
              })),
            },
          },
          include: {
            customer: true,
            user: { select: { businessName: true, name: true } },
            items: true,
          },
        });
      });

      results.generatedInvoices++;

      // Update state recurring schedule
      const updated: RecurringInvoiceData = {
        ...profile,
        lastRunDate: todayStr,
        nextRunDate: nextRun,
        updatedAt: new Date().toISOString(),
      };

      await auditLog(
        "recurring_invoice.updated",
        updated as unknown as Record<string, unknown>,
        { userId: user.id }
      );

      // Kirim email notifikasi otomatis jika diaktifkan
      if (profile.autoSendEmail && customer.email) {
        try {
          const businessName =
            user.businessName || user.name || "NotaKu";
          const formattedDueDate = formatDateWIB(invoice.dueDate!, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const emailHtml = renderInvoiceEmailHtml({
            invoiceNumber: invoice.number,
            customerName: customer.name,
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
            type: "new",
            items: invoice.items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              price: Number(it.price),
              amount: Number(it.amount),
            })),
          });

          await sendEmail({
            to: customer.email,
            subject: `Tagihan Baru ${invoice.number} dari ${businessName}`,
            html: emailHtml,
          });

          results.emailsSent++;
        } catch (mailErr) {
          console.error(
            `[CRON_RECURRING_EMAIL_FAILED] Invoice ${invoice.id}:`,
            mailErr
          );
        }
      }
    } catch (profileErr) {
      console.error(
        `[CRON_RECURRING_EXEC_ERROR] Profile ${profile.id}:`,
        profileErr
      );
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
