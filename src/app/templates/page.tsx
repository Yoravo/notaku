import type { Metadata } from "next";
import { TemplatesCatalogClient } from "./templates-catalog-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
  twitter: {
    card: "summary_large_image",
    title: "Katalog Template Invoice Gratis Indonesia · NotaKu",
    description: "Koleksi contoh template invoice gratis untuk freelance, desainer, dan UMKM.",
    images: ["/opengraph-image"],
  },
};

export default async function TemplatesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Template Invoice & Tagihan Bisnis Indonesia - NotaKu",
    url: `${baseUrl}/templates`,
    description:
      "Direktori kumpulan contoh template invoice resmi siap pakai untuk berbagai industri dan profesi di Indonesia.",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Katalog Template",
        item: `${baseUrl}/templates`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <TemplatesCatalogClient session={session} />
    </>
  );
}
