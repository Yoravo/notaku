import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderInvoicePDF } from "@/lib/pdf/invoice-template";
import type { InvoiceData } from "@/lib/pdf/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const templateParam = (searchParams.get("template") || "classic").toLowerCase() as
    | "classic"
    | "modern"
    | "minimal";

  // Ambil data profil bisnis & preferensi user saat ini
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      businessName: true,
      phone: true,
      address: true,
      logoUrl: true,
      signatureUrl: true,
      stampUrl: true,
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
      plan: true,
    },
  });

  const now = new Date();
  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("id-ID", { month: "long" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const sampleData: InvoiceData = {
    number: "INV-PREVIEW-001",
    status: "PAID",
    createdAt: formatDate(now),
    dueDate: formatDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
    notes:
      "Terima kasih atas kepercayaan Anda. Pembayaran invoice ini telah kami terima dengan lunas.",
    customer: {
      name: "PT Cahaya Pelita Gemilang",
      email: "finance@cahayapelita.co.id",
      phone: "021-5556789",
      address: "Kawasan Industri MM2100, Cikarang Barat",
    },
    user: {
      name: user?.name || "Nama Pemilik Bisnis",
      email: user?.email || "kontak@bisnisanda.com",
      businessName: user?.businessName || "Bisnis / Toko Anda",
      phone: user?.phone || "0812-3456-7890",
      address: user?.address || "Jl. Sudirman No. 45, Jakarta",
      logoUrl: user?.logoUrl || undefined,
      signatureUrl: user?.signatureUrl || undefined,
      stampUrl: user?.stampUrl || undefined,
      bankName: user?.bankName || "Bank Central Asia (BCA)",
      bankAccountNumber: user?.bankAccountNumber || "1234567890",
      bankAccountName: user?.bankAccountName || user?.name || "BUDI SANTOSO",
    },
    items: [
      {
        description: "Jasa Konsultasi & Desain Branding",
        quantity: 1,
        price: 750000,
        amount: 750000,
      },
      {
        description: "Pengembangan Website & Sistem Billing",
        quantity: 1,
        price: 1250000,
        amount: 1250000,
      },
    ],
    subtotal: 2000000,
    discountType: "PERCENTAGE",
    discountValue: 10,
    discountAmount: 200000,
    taxRate: 11,
    taxAmount: 198000,
    total: 1998000,
    isFree: user?.plan === "FREE",
    template: templateParam,
  };

  try {
    const buffer = await renderInvoicePDF(sampleData);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="preview.pdf"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("PDF Preview generation error:", err);
    return NextResponse.json(
      { error: "Gagal membuat pratinjau PDF." },
      { status: 500 }
    );
  }
}
