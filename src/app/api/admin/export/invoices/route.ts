import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sanitizeCsvCell } from "@/lib/csv";
import { formatDateWIB } from "@/lib/invoice-utils";

export async function GET() {
  try {
    await requireAdmin();

    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: {
        user: {
          select: { name: true, email: true, businessName: true },
        },
        customer: {
          select: { name: true, email: true },
        },
      },
    });

    const headers = [
      "ID",
      "Nomor Invoice",
      "Status",
      "Currency",
      "Subtotal",
      "Tipe Diskon",
      "Nilai Diskon",
      "Potongan Diskon",
      "Tarif PPN (%)",
      "Pajak PPN",
      "Total",
      "User Pembuat",
      "Email Pembuat",
      "Bisnis",
      "Pelanggan",
      "Tanggal Dibuat",
      "Jatuh Tempo",
    ];

    const rows = invoices.map((inv) => [
      sanitizeCsvCell(inv.id),
      sanitizeCsvCell(inv.number),
      sanitizeCsvCell(inv.status),
      sanitizeCsvCell(inv.currency),
      sanitizeCsvCell((inv.subtotal || inv.total).toString()),
      sanitizeCsvCell(inv.discountType === "PERCENTAGE" ? "Persentase (%)" : "Nominal"),
      sanitizeCsvCell((inv.discountValue || 0).toString()),
      sanitizeCsvCell((inv.discountAmount || 0).toString()),
      sanitizeCsvCell((inv.taxRate || 0).toString()),
      sanitizeCsvCell((inv.taxAmount || 0).toString()),
      sanitizeCsvCell(inv.total.toString()),
      sanitizeCsvCell(inv.user?.name || ""),
      sanitizeCsvCell(inv.user?.email || ""),
      sanitizeCsvCell(inv.user?.businessName || ""),
      sanitizeCsvCell(inv.customer?.name || ""),
      sanitizeCsvCell(formatDateWIB(inv.createdAt, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })),
      sanitizeCsvCell(inv.dueDate ? formatDateWIB(inv.dueDate, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) : ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const filename = `notaku-invoices-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
