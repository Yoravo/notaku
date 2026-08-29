"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { SupportedCurrency } from "@/lib/currencies";

export interface MonthlyTaxSummary {
  periodKey: string; // e.g. "2026-08"
  periodLabel: string; // e.g. "Agustus 2026"
  year: number;
  month: number; // 1-12
  currency: SupportedCurrency;
  invoiceCount: number;
  paidInvoiceCount: number;
  grossTurnover: number; // Total omset kotor (total invoice)
  taxableTurnover: number; // DPP (Dasar Pengenaan Pajak)
  taxAmount: number; // PPN Terutang (Total PPN)
  paidTurnover: number; // Omset yang sudah lunas (PAID)
  unpaidTurnover: number; // Omset yang belum lunas (SENT, OVERDUE, DRAFT)
}

export interface TaxReportOverview {
  year: number;
  availableYears: number[];
  currency: SupportedCurrency;
  monthlySummaries: MonthlyTaxSummary[];
  annualTotals: {
    invoiceCount: number;
    paidInvoiceCount: number;
    grossTurnover: number;
    taxableTurnover: number;
    taxAmount: number;
    paidTurnover: number;
    unpaidTurnover: number;
  };
  ppnBreakdown: {
    ppn11Taxable: number;
    ppn11Amount: number;
    ppn12Taxable: number;
    ppn12Amount: number;
    customTaxable: number;
    customAmount: number;
    nonTaxableTurnover: number;
  };
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getTaxReportsData(
  targetYear?: number,
  targetCurrency?: SupportedCurrency,
  locale: "id" | "en" = "id"
): Promise<TaxReportOverview> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const currentYear = new Date().getFullYear();
  const year = targetYear || currentYear;
  const currency: SupportedCurrency = targetCurrency || "IDR";

  // Ambil semua invoice user untuk ekstrak availableYears
  const userInvoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      status: { not: "CANCELLED" }, // Tidak memasukkan invoice dibatalkan
    },
    select: {
      id: true,
      number: true,
      createdAt: true,
      status: true,
      subtotal: true,
      discountAmount: true,
      taxRate: true,
      taxAmount: true,
      total: true,
      currency: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Ekstrak tahun-tahun unik
  const yearSet = new Set<number>([currentYear]);
  userInvoices.forEach((inv) => {
    const invYear = new Date(inv.createdAt).getFullYear();
    yearSet.add(invYear);
  });
  const availableYears = Array.from(yearSet).sort((a, b) => b - a);

  // Inisialisasi 12 bulan
  const monthNames = locale === "id" ? MONTH_NAMES_ID : MONTH_NAMES_EN;
  const monthlyMap = new Map<number, MonthlyTaxSummary>();

  for (let m = 1; m <= 12; m++) {
    const mStr = m.toString().padStart(2, "0");
    monthlyMap.set(m, {
      periodKey: `${year}-${mStr}`,
      periodLabel: `${monthNames[m - 1]} ${year}`,
      year,
      month: m,
      currency,
      invoiceCount: 0,
      paidInvoiceCount: 0,
      grossTurnover: 0,
      taxableTurnover: 0,
      taxAmount: 0,
      paidTurnover: 0,
      unpaidTurnover: 0,
    });
  }

  const ppnBreakdown = {
    ppn11Taxable: 0,
    ppn11Amount: 0,
    ppn12Taxable: 0,
    ppn12Amount: 0,
    customTaxable: 0,
    customAmount: 0,
    nonTaxableTurnover: 0,
  };

  // Filter invoice sesuai tahun & mata uang yang dipilih
  userInvoices.forEach((inv) => {
    const invDate = new Date(inv.createdAt);
    const invYear = invDate.getFullYear();
    const invCurrency = ((inv as any).currency || "IDR") as SupportedCurrency;

    if (invYear !== year || invCurrency !== currency) {
      return;
    }

    const month = invDate.getMonth() + 1; // 1-12
    const summary = monthlyMap.get(month);
    if (!summary) return;

    const total = Number(inv.total) || 0;
    const subtotal = Number(inv.subtotal || inv.total) || 0;
    const discountAmount = Number(inv.discountAmount || 0);
    const dpp = Math.max(0, subtotal - discountAmount);
    const taxRate = Number(inv.taxRate || 0);
    const taxAmount = Number(inv.taxAmount || 0);
    const isPaid = inv.status === "PAID";

    summary.invoiceCount += 1;
    summary.grossTurnover += total;
    summary.taxableTurnover += taxRate > 0 ? dpp : 0;
    summary.taxAmount += taxAmount;

    if (isPaid) {
      summary.paidInvoiceCount += 1;
      summary.paidTurnover += total;
    } else {
      summary.unpaidTurnover += total;
    }

    // PPN Breakdown Calculation
    if (taxRate === 11) {
      ppnBreakdown.ppn11Taxable += dpp;
      ppnBreakdown.ppn11Amount += taxAmount;
    } else if (taxRate === 12) {
      ppnBreakdown.ppn12Taxable += dpp;
      ppnBreakdown.ppn12Amount += taxAmount;
    } else if (taxRate > 0) {
      ppnBreakdown.customTaxable += dpp;
      ppnBreakdown.customAmount += taxAmount;
    } else {
      ppnBreakdown.nonTaxableTurnover += dpp;
    }
  });

  const monthlySummaries = Array.from(monthlyMap.values());

  const annualTotals = monthlySummaries.reduce(
    (acc, cur) => ({
      invoiceCount: acc.invoiceCount + cur.invoiceCount,
      paidInvoiceCount: acc.paidInvoiceCount + cur.paidInvoiceCount,
      grossTurnover: acc.grossTurnover + cur.grossTurnover,
      taxableTurnover: acc.taxableTurnover + cur.taxableTurnover,
      taxAmount: acc.taxAmount + cur.taxAmount,
      paidTurnover: acc.paidTurnover + cur.paidTurnover,
      unpaidTurnover: acc.unpaidTurnover + cur.unpaidTurnover,
    }),
    {
      invoiceCount: 0,
      paidInvoiceCount: 0,
      grossTurnover: 0,
      taxableTurnover: 0,
      taxAmount: 0,
      paidTurnover: 0,
      unpaidTurnover: 0,
    }
  );

  return {
    year,
    availableYears,
    currency,
    monthlySummaries,
    annualTotals,
    ppnBreakdown,
  };
}
