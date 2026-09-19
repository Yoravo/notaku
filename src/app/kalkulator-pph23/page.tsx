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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Siapa yang wajib memotong pajak PPh 23?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pihak yang wajib memotong dan menyetorkan PPh 23 ke kas negara adalah pihak pembeli atau klien (pemberi penghasilan). Penjual atau penyedia jasa akan menerima Bukti Potong (Bupot) sebagai kredit pajak saat pelaporan SPT Tahunan.",
        },
      },
      {
        "@type": "Question",
        name: "Apa saja objek jasa yang dikenakan PPh Pasal 23?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Objek jasa kena PPh 23 meliputi jasa teknik, manajemen, konsultan hukum/bisnis, desain grafis, software development, periklanan/agensi, katering, serta sewa harta selain tanah dan/atau bangunan.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa tarif pajak PPh Pasal 23?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tarif resmi PPh Pasal 23 atas jasa dan sewa adalah 2% bagi wajib pajak yang memiliki NPWP, dan 4% (100% lebih tinggi) bagi wajib pajak yang tidak memiliki NPWP.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Pph23CalculatorClient session={session} />
    </>
  );
}
