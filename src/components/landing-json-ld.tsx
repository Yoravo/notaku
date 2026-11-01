import { getTranslations } from "next-intl/server";

export async function LandingJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
  const tFaq = await getTranslations("faq");
  const faqItems = (tFaq.raw("items") as { q: string; a: string }[]) || [];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NotaKu",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/opengraph-image`,
    description:
      "Aplikasi invoice generator online, manajemen tagihan, kuitansi digital, dan billing SaaS terpercaya untuk UMKM dan bisnis Indonesia.",
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NotaKu",
    url: baseUrl,
    description:
      "Aplikasi invoice generator online dan billing SaaS untuk UMKM dan bisnis Indonesia.",
    inLanguage: ["id", "en"],
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NotaKu",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: baseUrl,
    description:
      "Buat invoice profesional dalam 30 detik. Gratis untuk UMKM Indonesia dengan fitur WhatsApp share otomatis, pembayaran digital QRIS & Virtual Account, ekspor PDF kuitansi resmi, dan multi-currency.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
        name: "Paket Free",
        description: "Gratis 5 invoice per bulan, ekspor PDF, dan berbagi via WhatsApp",
      },
      {
        "@type": "Offer",
        price: "19000",
        priceCurrency: "IDR",
        name: "Paket LITE (30 Hari)",
        description: "Buat invoice & pelanggan unlimited tanpa watermark",
      },
      {
        "@type": "Offer",
        price: "49000",
        priceCurrency: "IDR",
        name: "Paket PRO (30 Hari)",
        description:
          "Semua fitur LITE ditambah tanda tangan digital, stempel lunas, 4 template PDF, multi-currency, recurring invoice, dan laporan pajak",
      },
      {
        "@type": "Offer",
        price: "99000",
        priceCurrency: "IDR",
        name: "Paket BUSINESS (30 Hari)",
        description:
          "Semua fitur PRO ditambah custom domain white-label, REST API keys, webhook, dan bot notifikasi",
      },
    ],
    featureList: [
      "Pembuatan Invoice Cepat (30 Detik)",
      "Ekspor PDF Format Standar Indonesia (Classic, Modern, Minimal, Receipt)",
      "Kuitansi Resmi Digital & Terbilang Rupiah Otomatis",
      "Kirim Tagihan Otomatis via WhatsApp",
      "Pembayaran Digital Otomatis QRIS & Virtual Account via Mayar.id",
      "Invoice Berulang (Recurring Invoices Otomatis)",
      "Dukungan Multi-Currency (IDR, USD, SGD, EUR)",
      "Rekap Laporan Pajak PPN & Omset Bulanan",
      "Custom Domain & Subdomain White-Label",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};
