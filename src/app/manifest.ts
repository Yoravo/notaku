import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NotaKu - Aplikasi Invoice & Billing UMKM Indonesia",
    short_name: "NotaKu",
    description:
      "Aplikasi invoice generator online otomatis, kuitansi resmi, dan billing SaaS untuk UMKM dan bisnis Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#0f6b4f",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
