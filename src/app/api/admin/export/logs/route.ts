import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    const headers = ["ID", "Waktu (ISO)", "Event", "User ID", "IP Address", "Detail Payload"];
    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.createdAt.toISOString()}"`,
      `"${log.event.replace(/"/g, '""')}"`,
      `"${log.userId || ""}"`,
      `"${log.ipAddress || ""}"`,
      `"${JSON.stringify(log.detail || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const filename = `notaku-audit-logs-${new Date().toISOString().split("T")[0]}.csv`;

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
