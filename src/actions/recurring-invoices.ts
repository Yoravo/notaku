"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auditLog } from "@/lib/audit-log";
import { checkServerActionRateLimit } from "@/lib/rate-limit";
import {
  RecurringFrequency,
  RecurringStatus,
  RecurringInvoiceData,
  calculateNextRunDate,
  getTodayDateStrWIB,
  calculateDueDateStr,
} from "@/lib/recurring-invoices";
import { calculateInvoiceTotals, DiscountType } from "@/lib/invoice-calculations";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { sendEmail } from "@/lib/email";
import { renderInvoiceEmailHtml } from "@/lib/email-templates";
import { formatDateWIB } from "@/lib/invoice-utils";
import crypto from "crypto";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function getRecurringInvoices(): Promise<RecurringInvoiceData[]> {
  const user = await getUser();

  // Ambil semua recurring profile milik user dari audit log / data store
  const logs = await prisma.auditLog.findMany({
    where: {
      userId: user.id,
      event: { in: ["recurring_invoice.created", "recurring_invoice.updated"] },
    },
    orderBy: { createdAt: "asc" },
  });

  // Reconstruct state berdasarkan ID
  const map = new Map<string, RecurringInvoiceData>();

  for (const log of logs) {
    if (!log.detail) continue;
    const item = log.detail as unknown as RecurringInvoiceData;
    if (item.id) {
      map.set(item.id, item);
    }
  }

  // Filter yang tidak berstatus CANCELLED dan gabungkan data customer
  const list = Array.from(map.values()).filter((r) => r.status !== "CANCELLED");

  // Ambil data customer
  const customerIds = [...new Set(list.map((r) => r.customerId))];
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds }, userId: user.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  const customerMap = new Map(customers.map((c) => [c.id, c]));

  return list.map((item) => ({
    ...item,
    customer: customerMap.get(item.customerId),
  }));
}

export async function getRecurringInvoiceById(id: string): Promise<RecurringInvoiceData | null> {
  const user = await getUser();

  const logs = await prisma.auditLog.findMany({
    where: {
      userId: user.id,
      event: { in: ["recurring_invoice.created", "recurring_invoice.updated"] },
    },
    orderBy: { createdAt: "asc" },
  });

  let current: RecurringInvoiceData | null = null;
  for (const log of logs) {
    if (!log.detail) continue;
    const item = log.detail as unknown as RecurringInvoiceData;
    if (item.id === id) {
      current = item;
    }
  }

  if (!current || current.status === "CANCELLED") return null;

  const customer = await prisma.customer.findUnique({
    where: { id: current.customerId, userId: user.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  return {
    ...current,
    customer: customer || undefined,
  };
}

export async function createRecurringInvoice(data: {
  title: string;
  customerId: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  dueDaysOffset?: number;
  notes?: string | null;
  discountType?: DiscountType | string;
  discountValue?: number;
  taxRate?: number;
  enableDirectTransfer?: boolean;
  enableDigitalPayment?: boolean;
  autoSendEmail?: boolean;
  items: { description: string; quantity: number; price: number }[];
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  // Validasi user plan PRO
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  if (dbUser?.plan !== "PRO") {
    throw new Error(
      "Fitur Invoice Berulang (Recurring Invoices) adalah fitur eksklusif paket NotaKu PRO. Silakan upgrade paket Anda."
    );
  }

  if (!data.title || !data.title.trim()) {
    throw new Error("Judul / Label Tagihan Berulang wajib diisi");
  }

  if (!data.customerId) {
    throw new Error("Pelanggan wajib dipilih");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Minimal harus ada 1 item rincian tagihan");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId, userId: user.id },
  });
  if (!customer) {
    throw new Error("Pelanggan tidak ditemukan");
  }

  const id = `rec_${crypto.randomBytes(12).toString("hex")}`;
  const nowStr = new Date().toISOString();
  const nextRunDate = data.startDate || getTodayDateStrWIB();

  const recurringData: RecurringInvoiceData = {
    id,
    userId: user.id,
    customerId: data.customerId,
    title: data.title.trim(),
    frequency: data.frequency,
    status: "ACTIVE",
    nextRunDate,
    lastRunDate: null,
    dueDaysOffset: Number(data.dueDaysOffset) || 7,
    notes: data.notes || null,
    discountType: data.discountType === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
    discountValue: Number(data.discountValue) || 0,
    taxRate: Number(data.taxRate) || 0,
    enableDirectTransfer: data.enableDirectTransfer ?? true,
    enableDigitalPayment: data.enableDigitalPayment ?? false,
    autoSendEmail: data.autoSendEmail ?? true,
    items: data.items.map((it) => ({
      description: it.description,
      quantity: Number(it.quantity) || 1,
      price: Number(it.price) || 0,
    })),
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  await auditLog("recurring_invoice.created", recurringData as unknown as Record<string, unknown>, {
    userId: user.id,
  });

  revalidatePath("/recurring-invoices");
  return { success: true, id };
}

export async function updateRecurringInvoiceStatus(
  id: string,
  newStatus: RecurringStatus
) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const current = await getRecurringInvoiceById(id);
  if (!current) {
    throw new Error("Data tagihan berulang tidak ditemukan");
  }

  const updated: RecurringInvoiceData = {
    ...current,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  await auditLog("recurring_invoice.updated", updated as unknown as Record<string, unknown>, {
    userId: user.id,
  });

  revalidatePath("/recurring-invoices");
  revalidatePath(`/recurring-invoices/${id}`);
  return { success: true };
}

export async function deleteRecurringInvoice(id: string) {
  return updateRecurringInvoiceStatus(id, "CANCELLED");
}

/**
 * Memicu penerbitan invoice manual langsung sekarang (Run Now)
 */
export async function triggerRecurringInvoiceNow(id: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const current = await getRecurringInvoiceById(id);
  if (!current) {
    throw new Error("Data tagihan berulang tidak ditemukan");
  }

  const todayStr = getTodayDateStrWIB();
  const dueDateStr = calculateDueDateStr(todayStr, current.dueDaysOffset);
  const nextRun = calculateNextRunDate(todayStr, current.frequency);

  const totals = calculateInvoiceTotals({
    items: current.items,
    discountType: current.discountType,
    discountValue: current.discountValue,
    taxRate: current.taxRate,
  });

  // Buat invoice baru di database
  const invoice = await prisma.$transaction(async (tx) => {
    const number = await generateInvoiceNumber(user.id, tx);

    return tx.invoice.create({
      data: {
        userId: user.id,
        customerId: current.customerId,
        number,
        dueDate: new Date(dueDateStr),
        notes: current.notes
          ? `${current.notes}\n(Diterbitkan otomatis: ${current.title})`
          : `Tagihan Otomatis: ${current.title}`,
        subtotal: totals.subtotal,
        discountType: totals.discountType,
        discountValue: totals.discountValue,
        discountAmount: totals.discountAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        enableDirectTransfer: current.enableDirectTransfer,
        enableDigitalPayment: current.enableDigitalPayment,
        status: "SENT",
        items: {
          create: current.items.map((item) => ({
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

  // Update profil recurring dengan nextRunDate baru
  const updated: RecurringInvoiceData = {
    ...current,
    lastRunDate: todayStr,
    nextRunDate: nextRun,
    updatedAt: new Date().toISOString(),
  };

  await auditLog("recurring_invoice.updated", updated as unknown as Record<string, unknown>, {
    userId: user.id,
  });

  // Kirim email jika autoSendEmail aktif dan customer memiliki email
  if (current.autoSendEmail && invoice.customer.email) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
      const businessName = invoice.user.businessName || invoice.user.name || "NotaKu";
      const formattedDueDate = formatDateWIB(invoice.dueDate!, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

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
        type: "new",
        items: invoice.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          price: Number(it.price),
          amount: Number(it.amount),
        })),
      });

      await sendEmail({
        to: invoice.customer.email,
        subject: `Tagihan Baru ${invoice.number} dari ${businessName}`,
        html: emailHtml,
      });
    } catch (err) {
      console.error("[RECURRING_TRIGGER_EMAIL_ERROR]", err);
    }
  }

  revalidatePath("/invoices");
  revalidatePath("/recurring-invoices");
  return { success: true, invoiceId: invoice.id, invoiceNumber: invoice.number };
}
