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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "NotaKu - Invoice Generator untuk UMKM & Bisnis",
    template: "%s · NotaKu",
  },
  description:
    "Bikin invoice profesional dalam 30 detik. Gratis untuk UMKM Indonesia. Buat, kirim via WhatsApp, dan download PDF.",
  keywords: [
    "invoice",
    "nota",
    "UMKM",
    "invoice generator",
    "faktur",
    "tagihan",
    "bisnis",
  ],
  authors: [{ name: "NotaKu" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "NotaKu - Invoice Generator untuk UMKM & Bisnis",
    description:
      "Bikin invoice profesional dalam 30 detik. Gratis untuk UMKM Indonesia.",
    siteName: "NotaKu",
  },
  twitter: {
    card: "summary_large_image",
    title: "NotaKu - Invoice Generator untuk UMKM & Bisnis",
    description:
      "Bikin invoice profesional dalam 30 detik. Gratis untuk UMKM Indonesia.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
