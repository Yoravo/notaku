import { prisma } from "./prisma";
import { DiscountType } from "./invoice-calculations";

export type RecurringFrequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "ANNUALLY";

export type RecurringStatus = "ACTIVE" | "PAUSED" | "CANCELLED";

export interface RecurringInvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface RecurringInvoiceData {
  id: string;
  userId: string;
  customerId: string;
  title: string;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  nextRunDate: string; // YYYY-MM-DD
  lastRunDate: string | null; // YYYY-MM-DD
  dueDaysOffset: number; // Jumlah hari dari invoice diterbitkan sampai jatuh tempo
  notes: string | null;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number;
  enableDirectTransfer: boolean;
  enableDigitalPayment: boolean;
  autoSendEmail: boolean;
  items: RecurringInvoiceItem[];
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

/**
 * Menghitung tanggal eksekusi berikutnya berdasarkan frekuensi dan tanggal acuan
 * Menggunakan zona waktu Asia/Jakarta (WIB)
 */
export function calculateNextRunDate(
  currentDateStr: string,
  frequency: RecurringFrequency
): string {
  // Parsing YYYY-MM-DD
  const [yearStr, monthStr, dayStr] = currentDateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(year, month, day));

  switch (frequency) {
    case "WEEKLY":
      date.setUTCDate(date.getUTCDate() + 7);
      break;
    case "BIWEEKLY":
      date.setUTCDate(date.getUTCDate() + 14);
      break;
    case "MONTHLY":
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
    case "QUARTERLY":
      date.setUTCMonth(date.getUTCMonth() + 3);
      break;
    case "ANNUALLY":
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
  }

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/**
 * Format string tanggal hari ini di zona waktu Asia/Jakarta (YYYY-MM-DD)
 */
export function getTodayDateStrWIB(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Format tanggal jatuh tempo dari tanggal terbit + dueDaysOffset (YYYY-MM-DD)
 */
export function calculateDueDateStr(issueDateStr: string, offsetDays: number): string {
  const [yearStr, monthStr, dayStr] = issueDateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(year, month, day));
  date.setUTCDate(date.getUTCDate() + Math.max(0, offsetDays));

  const dueYear = date.getUTCFullYear();
  const dueMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dueDay = String(date.getUTCDate()).padStart(2, "0");

  return `${dueYear}-${dueMonth}-${dueDay}`;
}
