import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { formatDateWIB } from "@/lib/invoice-utils";
import { sanitizeCsvCell } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month"); // e.g. "2026-03"
  const yearParam = searchParams.get("year");   // e.g. "2026"

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabel: string;
  let filePrefix: string;

  const validMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  const validYearRegex = /^\d{4}$/;

  if (monthParam && validMonthRegex.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    startDate.setHours(startDate.getHours() - 7);
    endDate.setHours(endDate.getHours() - 7);
    periodLabel = `Bulan ${monthParam}`;
    filePrefix = `Rekap-Laba-Rugi-${monthParam}`;
  } else if (yearParam && validYearRegex.test(yearParam)) {
    const y = Number(yearParam);
    startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
    endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    startDate.setHours(startDate.getHours() - 7);
    endDate.setHours(endDate.getHours() - 7);
    periodLabel = `Tahun ${yearParam}`;
    filePrefix = `Rekap-Laba-Rugi-Tahun-${yearParam}`;
  } else {
    const y = now.getFullYear();
    const m = now.getMonth();
    startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    startDate.setHours(startDate.getHours() - 7);
    endDate.setHours(endDate.getHours() - 7);
    const mm = String(m + 1).padStart(2, "0");
    periodLabel = `Bulan ${y}-${mm}`;
    filePrefix = `Rekap-Laba-Rugi-${y}-${mm}`;
  }

  // Fetch paid invoices and expenses within date range
  const [paidInvoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
        currency: "IDR",
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const totalExpense = expenses.reduce((acc, ex) => acc + Number(ex.amount || 0), 0);
  const netProfit = totalRevenue - totalExpense;

  const categoryTotals: Record<string, number> = {};
  for (const ex of expenses) {
    categoryTotals[ex.category] = (categoryTotals[ex.category] || 0) + Number(ex.amount || 0);
  }

  // Build CSV
  const lines: string[] = [];

  lines.push(`"LAPORAN LABA RUGI (PROFIT & LOSS) - NOTAKU"`);
  lines.push(`"Periode: ${periodLabel}"`);
  lines.push(`"Tanggal Unduh: ${formatDateWIB(now)} WIB"`);
  lines.push("");

  // Ringkasan Eksekutif
  lines.push(`"RINGKASAN EKSEKUTIF (IDR)"`);
  lines.push(`"Keterangan","Nominal (IDR)"`);
  lines.push(`"Total Pendapatan (Invoice Lunas)",${totalRevenue}`);
  lines.push(`"Total Beban Operasional / Pengeluaran",${totalExpense}`);
  lines.push(`"Laba Bersih (Net Profit)",${netProfit}`);
  lines.push("");

  // Rincian Beban per Kategori
  lines.push(`"RINCIAN PENGELUARAN PER KATEGORI"`);
  lines.push(`"Kategori","Jumlah Transaksi","Total Nominal (IDR)"`);
  const catKeys = Object.keys(categoryTotals).sort();
  if (catKeys.length === 0) {
    lines.push(`"Tidak ada pengeluaran",0,0`);
  } else {
    for (const k of catKeys) {
      const count = expenses.filter((e) => e.category === k).length;
      lines.push(`${sanitizeCsvCell(k)},${count},${categoryTotals[k]}`);
    }
  }
  lines.push("");

  // Daftar Transaksi Pendapatan
  lines.push(`"DAFTAR PENDAPATAN INVOICE LUNAS"`);
  lines.push(`"No. Invoice","Tanggal Lunas/Terbit","Pelanggan","Mata Uang","Nominal"`);
  if (paidInvoices.length === 0) {
    lines.push(`"-","-","Tidak ada invoice lunas pada periode ini","IDR",0`);
  } else {
    for (const inv of paidInvoices) {
      const d = formatDateWIB(inv.createdAt);
      lines.push(
        `${sanitizeCsvCell(inv.number || "DRAFT")},${sanitizeCsvCell(d)},${sanitizeCsvCell(inv.customer.name || "")},"IDR",${Number(inv.total || 0)}`
      );
    }
  }
  lines.push("");

  // Daftar Transaksi Pengeluaran
  lines.push(`"DAFTAR PENGELUARAN OPERASIONAL"`);
  lines.push(`"Tanggal","Keterangan","Kategori","Catatan","Nominal (IDR)"`);
  if (expenses.length === 0) {
    lines.push(`"-","Tidak ada pengeluaran pada periode ini","-","-",0`);
  } else {
    for (const ex of expenses) {
      const d = formatDateWIB(ex.date);
      lines.push(
        `${sanitizeCsvCell(d)},${sanitizeCsvCell(ex.title)},${sanitizeCsvCell(ex.category)},${sanitizeCsvCell(ex.notes || "")},${Number(ex.amount)}`
      );
    }
  }

  const csvContent = lines.join("\r\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filePrefix}.csv"`,
    },
  });
}
