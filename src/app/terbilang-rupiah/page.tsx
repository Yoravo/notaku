import type { Metadata } from "next";
import { TerbilangConverterClient } from "./terbilang-converter-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Konverter Angka ke Huruf Terbilang Rupiah Online - Kuitansi & Faktur",
  description:
    "Ubah nominal angka ke huruf kalimat terbilang rupiah resmi bahasa Indonesia otomatis dan instan. Cocok untuk kuitansi, faktur, kwitansi, cek, dan surat perjanjian bisnis.",
  keywords: [
    "konverter terbilang rupiah online",
    "angka ke huruf terbilang",
    "terbilang kuitansi otomatis",
    "cara penulisan terbilang rupiah",
    "ejaan angka rupiah indonesia",
    "generator terbilang faktur",
    "terbilang nota tagihan",
  ],
  alternates: {
    canonical: `${baseUrl}/terbilang-rupiah`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/terbilang-rupiah`,
    title: "Konverter Angka ke Huruf Terbilang Rupiah Online · NotaKu",
    description:
      "Ubah nominal uang menjadi susunan kalimat ejaan rupiah resmi untuk faktur & kuitansi dalam 1 klik.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Konverter Terbilang Rupiah Online - NotaKu",
      },
    ],
  },
};

export default function TerbilangConverterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Konverter Angka Terbilang Rupiah Online - NotaKu",
    url: `${baseUrl}/terbilang-rupiah`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Aplikasi web gratis untuk konversi angka nominal ke huruf kalimat terbilang rupiah bahasa Indonesia untuk kuitansi dan dokumen keuangan.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TerbilangConverterClient />
    </>
  );
}
