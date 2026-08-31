import type { Metadata } from "next";
import { Suspense } from "react";
import { FreeDeliveryOrderGeneratorClient } from "./free-delivery-order-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Buat Surat Jalan Pengiriman Barang Online Gratis - Format PDF Standar",
  description:
    "Generator surat jalan pengiriman barang (delivery order) online gratis tanpa registrasi. Dilengkapi tabel kuantiti, kolom ekspedisi/kurir, 3 tanda tangan, dan langsung download PDF.",
  keywords: [
    "buat surat jalan online gratis",
    "contoh surat jalan barang pdf",
    "format surat jalan pengiriman",
    "delivery order online generator",
    "surat jalan ekspedisi logistik",
    "tanda terima pengiriman barang",
    "surat jalan excel word pdf",
  ],
  alternates: {
    canonical: `${baseUrl}/buat-surat-jalan`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/buat-surat-jalan`,
    title: "Buat Surat Jalan Pengiriman Barang Online Gratis · NotaKu",
    description:
      "Buat surat jalan (delivery order) pengiriman barang bisnis & UMKM dengan format standar resmi dan langsung unduh file PDF.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Free Delivery Order Generator Online - NotaKu",
      },
    ],
  },
};

export default function FreeDeliveryOrderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Surat Jalan Generator - NotaKu",
    url: `${baseUrl}/buat-surat-jalan`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Aplikasi generator surat jalan delivery order online gratis untuk logistik, supplier, toko grosir, dan UMKM Indonesia.",
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
              <p className="text-xs font-bold text-ink-soft">Memuat Generator Surat Jalan...</p>
            </div>
          </div>
        }
      >
        <FreeDeliveryOrderGeneratorClient />
      </Suspense>
    </>
  );
}
