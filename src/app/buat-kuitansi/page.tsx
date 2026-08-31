import type { Metadata } from "next";
import { Suspense } from "react";
import { FreeReceiptGeneratorClient } from "./free-receipt-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Buat Kuitansi Pembayaran Online Gratis - Ejaan Terbilang & Download PDF",
  description:
    "Generator kuitansi tanda terima pembayaran online gratis tanpa registrasi. Dilengkapi konversi terbilang rupiah otomatis, stempel lunas, dan langsung unduh PDF resmi.",
  keywords: [
    "buat kuitansi online gratis",
    "generator kuitansi pembayaran",
    "contoh kuitansi tanda terima uang",
    "format kuitansi pdf",
    "kuitansi lunas otomatis",
    "terbilang rupiah kuitansi",
    "kwitansi online indonesia",
  ],
  alternates: {
    canonical: `${baseUrl}/buat-kuitansi`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/buat-kuitansi`,
    title: "Buat Kuitansi Pembayaran Online Gratis · NotaKu",
    description:
      "Buat tanda terima & kuitansi pembayaran sah dengan ejaan terbilang rupiah otomatis dan download PDF dalam 30 detik.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Free Receipt Generator Online - NotaKu",
      },
    ],
  },
};

export default function FreeReceiptPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Kuitansi Generator - NotaKu",
    url: `${baseUrl}/buat-kuitansi`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Aplikasi pembuat kuitansi tanda terima pembayaran online resmi gratis dengan ejaan angka terbilang rupiah dan download PDF instan.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-paper flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald border-t-transparent" />
              <p className="text-xs font-bold text-ink-soft">Memuat Generator Kuitansi...</p>
            </div>
          </div>
        }
      >
        <FreeReceiptGeneratorClient />
      </Suspense>
    </>
  );
}
