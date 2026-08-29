import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TrafficTracker } from "@/components/traffic-tracker";
import { LanguageProvider } from "@/lib/i18n/context";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "NotaKu - Aplikasi Invoice Generator Online & Kuitansi Digital UMKM",
    template: "%s · NotaKu",
  },
  description:
    "Buat invoice dan kuitansi profesional dalam 30 detik. Gratis untuk UMKM, freelancer, & bisnis Indonesia. Kirim otomatis via WhatsApp, terima QRIS, dan unduh PDF resmi.",
  keywords: [
    "aplikasi invoice",
    "invoice generator online",
    "buat invoice online gratis",
    "aplikasi tagihan umkm",
    "software invoice indonesia",
    "kuitansi digital resmi",
    "faktur tagihan",
    "contoh invoice jasa",
    "invoice whatsapp otomatis",
    "pembayaran qris invoice",
    "nota penjualan online",
  ],
  authors: [{ name: "NotaKu", url: baseUrl }],
  creator: "NotaKu",
  publisher: "NotaKu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    title: "NotaKu - Aplikasi Invoice Generator Online & Kuitansi Digital UMKM",
    description:
      "Buat invoice dan kuitansi profesional dalam 30 detik. Gratis untuk UMKM, freelancer, & bisnis Indonesia. Kirim otomatis via WhatsApp, terima QRIS, dan unduh PDF resmi.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "NotaKu - Invoice Generator untuk UMKM & Bisnis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NotaKu - Aplikasi Invoice Generator Online & Kuitansi Digital UMKM",
    description:
      "Buat invoice dan kuitansi profesional dalam 30 detik. Gratis untuk UMKM, freelancer, & bisnis Indonesia.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TrafficTracker />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
