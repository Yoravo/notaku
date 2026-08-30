import type { Metadata } from "next";
import { TemplatesCatalogClient } from "./templates-catalog-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Katalog Template Invoice Gratis Indonesia - Word, Excel, PDF Siap Pakai",
  description:
    "Koleksi lengkap contoh dan template invoice gratis untuk freelance, desainer, programmer, konsultan, bengkel, dan sewa properti. Download PDF instan tanpa login.",
  keywords: [
    "template invoice gratis",
    "contoh invoice indonesia",
    "download template invoice word excel pdf",
    "format invoice tagihan bisnis",
    "contoh nota tagihan profesional",
    "template invoice freelance ukm",
  ],
  alternates: {
    canonical: `${baseUrl}/templates`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/templates`,
    title: "Katalog Template Invoice Gratis Indonesia · NotaKu",
    description:
      "Temukan format dan contoh tagihan yang sesuai dengan bidang usaha Anda. Lengkap dengan perhitungan otomatis dan download PDF langsung.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Katalog Template Invoice Gratis - NotaKu",
      },
    ],
  },
};

export default function TemplatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Template Invoice & Tagihan Bisnis Indonesia - NotaKu",
    url: `${baseUrl}/templates`,
    description:
      "Direktori kumpulan contoh template invoice resmi siap pakai untuk berbagai industri dan profesi di Indonesia.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplatesCatalogClient />
    </>
  );
}
