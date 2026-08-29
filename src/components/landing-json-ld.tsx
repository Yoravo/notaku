import type { FC } from "react";

export const LandingJsonLd: FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NotaKu",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    sameAs: [],
    description:
      "Aplikasi invoice generator online, manajemen tagihan, kuitansi digital, dan billing SaaS terpercaya untuk UMKM dan bisnis Indonesia.",
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
        price: "49000",
        priceCurrency: "IDR",
        name: "Paket PRO (30 Hari)",
        description:
          "Invoice tanpa batas, bebas watermark, tanda tangan digital, stempel lunas, custom domain, dan recurring invoice",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1280",
      bestRating: "5",
      worstRating: "1",
    },
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
    mainEntity: [
      {
        "@type": "Question",
        name: "Apakah NotaKu benar-benar gratis digunakan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya! Anda dapat menggunakan paket Free selamanya tanpa perlu kartu kredit. Sudah termasuk 5 invoice per bulan, manajemen pelanggan dasar, ekspor PDF, dan berbagi via WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "Apa keuntungan upgrade ke NotaKu PRO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dengan NotaKu PRO (hanya Rp49.000 / 30 hari), Anda mendapatkan pembuatan invoice tanpa batas, ekspor PDF bebas watermark, logo kustom, tanda tangan digital, stempel resmi, recurring invoice, custom domain white-label, dan laporan keuangan CSV.",
        },
      },
      {
        "@type": "Question",
        name: "Metode pembayaran apa saja yang didukung untuk upgrade PRO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kami menggunakan payment gateway resmi Mayar.id yang mendukung QRIS (GoPay, OVO, DANA, ShopeePay, LinkAja), Virtual Account bank nasional (BCA, Mandiri, BRI, BNI, Permata), dan Kartu Kredit.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara mengirimkan invoice ke pelanggan via WhatsApp?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Setelah membuat invoice, cukup klik tombol 'Bagi ke WhatsApp'. NotaKu akan otomatis menyiapkan draf pesan rapi berisi rincian tagihan beserta tautan invoice publik interaktif untuk pelanggan Anda.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah NotaKu mendukung perhitungan pajak PPN?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya, NotaKu mendukung perhitungan pajak PPN (11% atau 12%) secara otomatis pada setiap baris item invoice, lengkap dengan rekapitulasi laporan masa pajak bulanan dan ekspor CSV siap SPT.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
