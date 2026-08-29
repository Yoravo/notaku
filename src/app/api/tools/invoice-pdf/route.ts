import { NextResponse } from "next/server";
import { renderInvoicePDF } from "@/lib/pdf/invoice-template";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import type { InvoiceData } from "@/lib/pdf/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Basic IP / Header Rate Limiting untuk mencegah abuse rendering PDF
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
      number = "INV-001",
      status = "DRAFT",
      currency = "IDR",
      createdAt = new Date().toISOString().split("T")[0],
      dueDate = null,
      notes = null,
      businessName = "Bisnis / Toko Saya",
      userName = "Nama Pemilik",
      userEmail = "",
      userPhone = "",
      userAddress = "",
      bankName = "",
      bankAccountNumber = "",
      bankAccountName = "",
      customerName = "Nama Pelanggan",
      customerEmail = "",
      customerPhone = "",
      customerAddress = "",
      items = [],
      discountType = "FIXED",
      discountValue = 0,
      taxRate = 0,
      template = "classic",
    } = body;

    // 2. Sanitasi & Kalkulasi Akurat
    const sanitizedItems = Array.isArray(items) && items.length > 0
      ? items.map((it: any) => ({
          description: String(it.description || "Item Tagihan").slice(0, 200),
          quantity: Math.max(1, Number(it.quantity) || 1),
          price: Math.max(0, Number(it.price) || 0),
          amount: Math.max(0, (Number(it.quantity) || 1) * (Number(it.price) || 0)),
        }))
      : [
          {
            description: "Jasa / Produk",
            quantity: 1,
            price: 100000,
            amount: 100000,
          },
        ];

    const totals = calculateInvoiceTotals({
      items: sanitizedItems,
      discountType,
      discountValue: Number(discountValue) || 0,
      taxRate: Number(taxRate) || 0,
    });

    const formatDateStr = (dateStr: string | null) => {
      if (!dateStr) return null;
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

    const pdfPayload: InvoiceData = {
      number: String(number || "INV-001").slice(0, 50),
      currency: ["IDR", "USD", "SGD", "EUR"].includes(currency) ? currency : "IDR",
      status: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].includes(status) ? status : "DRAFT",
      createdAt: formatDateStr(createdAt) || "Hari ini",
      dueDate: formatDateStr(dueDate),
      notes: notes ? String(notes).slice(0, 500) : null,
      customer: {
        name: String(customerName || "Pelanggan").slice(0, 100),
        email: customerEmail ? String(customerEmail).slice(0, 100) : undefined,
        phone: customerPhone ? String(customerPhone).slice(0, 30) : undefined,
        address: customerAddress ? String(customerAddress).slice(0, 200) : undefined,
      },
      user: {
        name: String(userName || "Pemilik").slice(0, 100),
        businessName: String(businessName || "Bisnis").slice(0, 100),
        email: userEmail ? String(userEmail).slice(0, 100) : undefined,
        phone: userPhone ? String(userPhone).slice(0, 30) : undefined,
        address: userAddress ? String(userAddress).slice(0, 200) : undefined,
        bankName: bankName ? String(bankName).slice(0, 100) : undefined,
        bankAccountNumber: bankAccountNumber ? String(bankAccountNumber).slice(0, 50) : undefined,
        bankAccountName: bankAccountName ? String(bankAccountName).slice(0, 100) : undefined,
      },
      items: sanitizedItems,
      subtotal: totals.subtotal,
      discountType: totals.discountType,
      discountValue: totals.discountValue,
      discountAmount: totals.discountAmount,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      isFree: true, // Free instant tool menyertakan watermark promosi branding NotaKu
      template: ["classic", "modern", "minimal"].includes(template) ? template : "classic",
    };

    const buffer = await renderInvoicePDF(pdfPayload);
    const cleanFileName = `Invoice_${pdfPayload.number.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanFileName}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Public instant invoice PDF generator error:", err);
    return NextResponse.json(
      { error: "Gagal memproses file PDF invoice." },
      { status: 500 }
    );
  }
}
