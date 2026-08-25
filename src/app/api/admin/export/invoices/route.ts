import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
      `"${inv.id}"`,
      `"${inv.number}"`,
      `"${inv.status}"`,
      `"${(inv.subtotal || inv.total).toString()}"`,
      `"${inv.discountType === "PERCENTAGE" ? "Persentase (%)" : "Nominal (Rp)"}"`,
      `"${(inv.discountValue || 0).toString()}"`,
      `"${(inv.discountAmount || 0).toString()}"`,
      `"${(inv.taxRate || 0).toString()}"`,
      `"${(inv.taxAmount || 0).toString()}"`,
      `"${inv.total.toString()}"`,
      `"${(inv.user?.name || "").replace(/"/g, '""')}"`,
      `"${(inv.user?.email || "").replace(/"/g, '""')}"`,
      `"${(inv.user?.businessName || "").replace(/"/g, '""')}"`,
      `"${(inv.customer?.name || "").replace(/"/g, '""')}"`,
      `"${inv.createdAt.toISOString()}"`,
      `"${inv.dueDate ? inv.dueDate.toISOString() : ""}"`,
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
