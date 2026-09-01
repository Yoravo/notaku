import type { Metadata } from "next";
import { Pph23CalculatorClient } from "./pph23-calculator-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Kalkulator PPh 23 Jasa & Potongan Pajak Invoice Online Indonesia",
  description:
    "Hitung otomatis potongan pajak PPh Pasal 23 (tarif 2% ber-NPWP / 4% tanpa NPWP) dan PPN 11%/12% untuk invoice jasa, sewa, konsultan, dan freelance di Indonesia.",
  keywords: [
    "kalkulator pph 23 jasa",
    "hitung pph pasal 23 online",
    "potongan pph 23 invoice",
    "rumus pph 23 jasa freelance konsultan",
    "pph 23 tanpa npwp 4 persen",
    "kalkulator pajak invoice indonesia",
  ],
  alternates: {
    canonical: `${baseUrl}/kalkulator-pph23`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/kalkulator-pph23`,
    title: "Kalkulator PPh 23 Jasa Online Indonesia · NotaKu",
    description:
      "Hitung potongan PPh 23 (2% / 4%) dan PPN secara instan untuk transaksi invoice jasa bisnis Anda.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kalkulator PPh 23 Online - NotaKu",
      },
    ],
  },
};

export default async function Pph23CalculatorPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kalkulator PPh 23 Jasa Online - NotaKu",
    url: `${baseUrl}/kalkulator-pph23`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description:
      "Kalkulator potongan pajak PPh 23 atas jasa dan sewa untuk akuntan, perusahaan, konsultan, dan freelancer Indonesia.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Pph23CalculatorClient session={session} />
    </>
  );
}
