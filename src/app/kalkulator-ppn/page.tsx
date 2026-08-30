import type { Metadata } from "next";
import { PpnCalculatorClient } from "./ppn-calculator-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Kalkulator PPN 11% & 12% dan DPP Online Indonesia - Hitung Pajak Cepat",
  description:
    "Kalkulator PPN online akurat untuk menghitung DPP (Dasar Pengenaan Pajak), PPN 11%, dan PPN 12% secara instan. Mendukung perhitungan harga sebelum (exclude) dan sesudah pajak (include).",
  keywords: [
    "kalkulator ppn online",
    "hitung dpp dan ppn",
    "kalkulator ppn 11 persen",
    "kalkulator ppn 12 persen",
    "cara hitung dpp ppn",
    "rumus ppn include exclude",
    "pajak pertambahan nilai online",
  ],
  alternates: {
    canonical: `${baseUrl}/kalkulator-ppn`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/kalkulator-ppn`,
    title: "Kalkulator PPN 11% & 12% dan DPP Online Indonesia · NotaKu",
    description:
      "Hitung otomatis DPP dan PPN (11% / 12%) online dalam hitungan detik. Gratis untuk akuntan, bisnis, dan UMKM.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kalkulator PPN Online - NotaKu",
      },
    ],
  },
};

export default function PpnCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kalkulator PPN & DPP Online - NotaKu",
    url: `${baseUrl}/kalkulator-ppn`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Kalkulator hitung otomatis nilai DPP, PPN 11%, dan PPN 12% untuk tagihan dan transaksi bisnis di Indonesia.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PpnCalculatorClient />
    </>
  );
}
