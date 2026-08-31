import { NextResponse } from "next/server";
import { renderReceiptPDF } from "@/lib/pdf/receipt-template";
import type { ReceiptData } from "@/lib/pdf/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { numberToWordsRupiah } from "@/lib/terbilang";

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
      receiptNumber = "KW-2026-001",
      invoiceNumber = "INV-001",
      currency = "IDR",
      paidAt = new Date().toISOString().split("T")[0],
      paymentMethod = "Transfer Bank",
      customerName = "Pelanggan",
      customerAddress = "",
      userName = "Penerima",
      businessName = "Bisnis / Usaha Saya",
      userPhone = "",
      userEmail = "",
      userAddress = "",
      itemsSummary = "Pelunasan tagihan pembayaran barang / jasa",
      total = 0,
      notes = "",
    } = body;

    const parsedTotal = Math.max(0, Number(total) || 0);

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

    const words = currency === "IDR"
      ? numberToWordsRupiah(parsedTotal)
      : `${parsedTotal.toLocaleString("en-US")} ${currency}`;

    const pdfPayload: ReceiptData = {
      receiptNumber: String(receiptNumber || "KW-001").slice(0, 50),
      invoiceNumber: String(invoiceNumber || "INV-001").slice(0, 50),
      currency: ["IDR", "USD", "SGD", "EUR"].includes(currency) ? currency : "IDR",
      paidAt: formatDateStr(paidAt),
      paymentMethod: String(paymentMethod || "Transfer Bank").slice(0, 50),
      customer: {
        name: String(customerName || "Pelanggan").slice(0, 100),
        address: customerAddress ? String(customerAddress).slice(0, 200) : undefined,
      },
      user: {
        name: String(userName || "Penerima").slice(0, 100),
        businessName: String(businessName || "Bisnis").slice(0, 100),
        email: userEmail ? String(userEmail).slice(0, 100) : undefined,
        phone: userPhone ? String(userPhone).slice(0, 30) : undefined,
        address: userAddress ? String(userAddress).slice(0, 200) : undefined,
      },
      itemsSummary: String(itemsSummary || "Pembayaran tagihan").slice(0, 300),
      total: parsedTotal,
      totalWords: words,
      notes: notes ? String(notes).slice(0, 300) : undefined,
      isFree: true,
    };

    const buffer = await renderReceiptPDF(pdfPayload);
    const cleanFileName = `Kuitansi_${pdfPayload.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanFileName}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Public receipt PDF generator error:", err);
    return NextResponse.json(
      { error: "Gagal memproses file PDF kuitansi." },
      { status: 500 }
    );
  }
}
