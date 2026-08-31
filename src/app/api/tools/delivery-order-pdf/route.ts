import { NextResponse } from "next/server";
import { renderDeliveryOrderPDF } from "@/lib/pdf/delivery-order-template";
import type { DeliveryOrderData } from "@/lib/pdf/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "anonymous";

    const isAllowed = await checkRateLimit(`public_pdf:${clientIp}`, 20, 60);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan download PDF. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const {
      orderNumber = "SJ-2026-001",
      date = new Date().toISOString().split("T")[0],
      poNumber = "",
      vehicleNumber = "",
      driverName = "",
      senderName = "Pengirim",
      senderBusinessName = "Perusahaan / Toko Pengirim",
      senderPhone = "",
      senderAddress = "",
      recipientName = "Penerima",
      recipientCompany = "",
      recipientPhone = "",
      recipientAddress = "",
      items = [],
      notes = "",
    } = body;

    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return "Hari ini";
      try {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, "0");
        const months = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch {
        return dateStr;
      }
    };

    const sanitizedItems = Array.isArray(items) && items.length > 0
      ? items.map((it: any) => ({
          description: String(it.description || "Nama Barang").slice(0, 200),
          quantity: Math.max(1, Number(it.quantity) || 1),
          unit: String(it.unit || "Pcs").slice(0, 30),
          notes: it.notes ? String(it.notes).slice(0, 150) : undefined,
        }))
      : [
          {
            description: "Barang Contoh / Produk 01",
            quantity: 10,
            unit: "Pcs",
            notes: "Kondisi baik & tersegel",
          },
        ];

    const pdfPayload: DeliveryOrderData = {
      orderNumber: String(orderNumber || "SJ-001").slice(0, 50),
      date: formatDateStr(date),
      poNumber: poNumber ? String(poNumber).slice(0, 50) : undefined,
      vehicleNumber: vehicleNumber ? String(vehicleNumber).slice(0, 50) : undefined,
      driverName: driverName ? String(driverName).slice(0, 100) : undefined,
      sender: {
        name: String(senderName || "Pengirim").slice(0, 100),
        businessName: String(senderBusinessName || "Pengirim").slice(0, 100),
        phone: senderPhone ? String(senderPhone).slice(0, 30) : undefined,
        address: senderAddress ? String(senderAddress).slice(0, 200) : undefined,
      },
      recipient: {
        name: String(recipientName || "Penerima").slice(0, 100),
        company: recipientCompany ? String(recipientCompany).slice(0, 100) : undefined,
        phone: recipientPhone ? String(recipientPhone).slice(0, 30) : undefined,
        address: recipientAddress ? String(recipientAddress).slice(0, 200) : undefined,
      },
      items: sanitizedItems,
      notes: notes ? String(notes).slice(0, 400) : undefined,
      isFree: true,
    };

    const buffer = await renderDeliveryOrderPDF(pdfPayload);
    const cleanFileName = `SuratJalan_${pdfPayload.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanFileName}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Public delivery order PDF generator error:", err);
    return NextResponse.json(
      { error: "Gagal memproses file PDF surat jalan." },
      { status: 500 }
    );
  }
}
