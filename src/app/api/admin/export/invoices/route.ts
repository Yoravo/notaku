import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sanitizeCsvCell } from "@/lib/csv";

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
      "Subtotal (IDR)",
      "Tipe Diskon",
      "Nilai Diskon",
      "Potongan Diskon (IDR)",
      "Tarif PPN (%)",
      "Pajak PPN (IDR)",
      "Total (IDR)",
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
      sanitizeCsvCell((inv.subtotal || inv.total).toString()),
      sanitizeCsvCell(inv.discountType === "PERCENTAGE" ? "Persentase (%)" : "Nominal (Rp)"),
      sanitizeCsvCell((inv.discountValue || 0).toString()),
      sanitizeCsvCell((inv.discountAmount || 0).toString()),
      sanitizeCsvCell((inv.taxRate || 0).toString()),
      sanitizeCsvCell((inv.taxAmount || 0).toString()),
      sanitizeCsvCell(inv.total.toString()),
      sanitizeCsvCell(inv.user?.name || ""),
      sanitizeCsvCell(inv.user?.email || ""),
      sanitizeCsvCell(inv.user?.businessName || ""),
      sanitizeCsvCell(inv.customer?.name || ""),
      sanitizeCsvCell(inv.createdAt.toISOString()),
      sanitizeCsvCell(inv.dueDate ? inv.dueDate.toISOString() : ""),
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
