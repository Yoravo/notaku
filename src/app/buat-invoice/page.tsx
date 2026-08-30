import type { Metadata } from "next";
import { Suspense } from "react";
import { FreeInvoiceGeneratorClient } from "./free-invoice-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Free Invoice Generator Online Indonesia - Buat & Download PDF Gratis",
  description:
    "Buat invoice tagihan bisnis online gratis dalam 30 detik tanpa registrasi. Hitung otomatis diskon, DPP, dan pajak PPN 11%/12%. Langsung download file PDF resmi.",
  keywords: [
    "buat invoice online gratis",
    "free invoice generator",
    "invoice generator indonesia",
    "bikin invoice online",
    "template invoice pdf",
    "contoh invoice tagihan",
    "kalkulator ppn invoice",
    "faktur tagihan gratis",
  ],
  alternates: {
    canonical: `${baseUrl}/buat-invoice`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/buat-invoice`,
    title: "Free Invoice Generator Online Indonesia - Buat & Download PDF Gratis · NotaKu",
    description:
      "Buat invoice tagihan bisnis online gratis dalam 30 detik tanpa registrasi. Hitung otomatis DPP & PPN, langsung unduh PDF resmi.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Free Invoice Generator Online - NotaKu",
      },
    ],
  },
};

export default function FreeInvoicePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Invoice Generator - NotaKu",
    url: `${baseUrl}/buat-invoice`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Aplikasi pembuat invoice online gratis untuk UMKM dan freelancer Indonesia. Hitung otomatis diskon, DPP, PPN, dan langsung download PDF.",
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
              <p className="text-xs font-bold text-ink-soft">Memuat Generator Invoice...</p>
            </div>
          </div>
        }
      >
        <FreeInvoiceGeneratorClient />
      </Suspense>
    </>
  );
}

