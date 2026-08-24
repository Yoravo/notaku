import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { InvoiceStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const validStatuses = new Set([
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]);

  const activeStatus =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as InvoiceStatus)
      : undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      ...(activeStatus ? { status: activeStatus } : {}),
    },
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusLabel: Record<string, string> = {
    DRAFT: "Draft",
    SENT: "Terkirim",
    PAID: "Lunas",
    OVERDUE: "Jatuh Tempo",
    CANCELLED: "Dibatalkan",
  };

  // CSV Headers
  const csvHeaders = [
    "No. Invoice",
    "Tanggal Dibuat",
    "Jatuh Tempo",
    "Nama Pelanggan",
    "Email Pelanggan",
    "No. HP Pelanggan",
    "Alamat Pelanggan",
    "Status",
    "Jumlah Item",
    "Total (IDR)",
    "Catatan",
  ];

  // Helper escape CSV cell
  const escapeCsv = (str: string | number | null | undefined) => {
    if (str === null || str === undefined) return '""';
    const stringVal = String(str);
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  const rows = invoices.map((inv) => {
    const createdDate = inv.createdAt.toISOString().split("T")[0];
    const dueDate = inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "-";
    const statusText = statusLabel[inv.status] || inv.status;
    const totalItems = inv.items.reduce((sum, item) => sum + item.quantity, 0);

    return [
      escapeCsv(inv.number || "-"),
      escapeCsv(createdDate),
      escapeCsv(dueDate),
      escapeCsv(inv.customer.name),
      escapeCsv(inv.customer.email || "-"),
      escapeCsv(inv.customer.phone || "-"),
      escapeCsv(inv.customer.address || "-"),
      escapeCsv(statusText),
      escapeCsv(totalItems),
      escapeCsv(Number(inv.total)),
      escapeCsv(inv.notes || "-"),
    ].join(",");
  });

  // Tambahkan UTF-8 BOM (﻿) agar Microsoft Excel membuka karakter & koma secara rapi
  const csvContent = "﻿" + [csvHeaders.join(","), ...rows].join("\r\n");

  const today = new Date().toISOString().split("T")[0];
  const filename = `notaku-invoices-${statusParam ? statusParam.toLowerCase() + "-" : ""}${today}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
