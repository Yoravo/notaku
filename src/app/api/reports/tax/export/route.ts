import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { formatDateWIB } from "@/lib/invoice-utils";
import { SupportedCurrency } from "@/lib/currencies";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month"); // optional 1-12
  const currencyParam = (searchParams.get("currency") || "IDR") as SupportedCurrency;

  const currentYear = new Date().getFullYear();
  const year = yearParam ? parseInt(yearParam, 10) || currentYear : currentYear;
  const month = monthParam ? parseInt(monthParam, 10) : null;

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      status: { not: "CANCELLED" },
    },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const filteredInvoices = invoices.filter((inv) => {
    const d = new Date(inv.createdAt);
    const invYear = d.getFullYear();
    const invMonth = d.getMonth() + 1;
    const invCurrency = ((inv as any).currency || "IDR") as SupportedCurrency;

    if (invYear !== year) return false;
    if (invCurrency !== currencyParam) return false;
    if (month !== null && invMonth !== month) return false;
    return true;
  });

  // Build CSV
  const headersRow = [
    "No. Invoice",
    "Tanggal Terbit (WIB)",
    "Nama Pelanggan",
    "Status Pembayaran",
    "Mata Uang",
    "Subtotal",
    "Diskon",
    "DPP (Dasar Pengenaan Pajak)",
    "Tarif PPN (%)",
    "Nominal PPN",
    "Total Tagihan",
  ];

  const rows = filteredInvoices.map((inv) => {
    const subtotal = Number(inv.subtotal || inv.total) || 0;
    const discountAmount = Number(inv.discountAmount || 0);
    const dpp = Math.max(0, subtotal - discountAmount);
    const taxRate = Number(inv.taxRate || 0);
    const taxAmount = Number(inv.taxAmount || 0);
    const total = Number(inv.total) || 0;
    const currency = (inv as any).currency || "IDR";
    const dateStr = formatDateWIB(inv.createdAt, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const statusMap: Record<string, string> = {
      PAID: "LUNAS",
      SENT: "TERKIRIM",
      OVERDUE: "JATUH TEMPO",
      DRAFT: "DRAFT",
    };

    return [
      `"${inv.number || "DRAFT"}"`,
      `"${dateStr}"`,
      `"${(inv.customer.name || "").replace(/"/g, '""')}"`,
      `"${statusMap[inv.status] || inv.status}"`,
      `"${currency}"`,
      subtotal,
      discountAmount,
      dpp,
      `${taxRate}%`,
      taxAmount,
      total,
    ].join(",");
  });

  const csvContent = [headersRow.join(","), ...rows].join("\r\n");

  const fileName = month
    ? `Laporan-Pajak-Omset-Masa-${year}-${month.toString().padStart(2, "0")}-${currencyParam}.csv`
    : `Laporan-Pajak-Omset-Tahunan-${year}-${currencyParam}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
