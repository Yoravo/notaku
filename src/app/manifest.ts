import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NotaKu - Aplikasi Invoice & Billing UMKM Indonesia",
    short_name: "NotaKu",
    description:
      "Aplikasi invoice generator online otomatis, kuitansi resmi, dan billing SaaS untuk UMKM dan bisnis Indonesia.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf7f0",
    theme_color: "#0f6b4f",
    categories: ["business", "finance", "productivity"],
    lang: "id",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    shortcuts: [
      {
        name: "Buat Invoice Baru",
        short_name: "Invoice",
        description: "Buat tagihan invoice baru",
        url: "/invoices/new",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
      {
        name: "Buat Kuitansi",
        short_name: "Kuitansi",
        description: "Buat kuitansi tanda terima",
        url: "/buat-kuitansi",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
      {
        name: "Catat Pengeluaran",
        short_name: "Pengeluaran",
        description: "Catat beban usaha",
        url: "/expenses",
        icons: [{ src: "/logo.png", sizes: "192x192" }],
      },
    ],
  };
}
