import type { Metadata } from "next";
import { RegisterClient } from "./register-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Daftar Akun Gratis",
  description:
    "Daftar akun NotaKu gratis tanpa kartu kredit. Buat dan kirim invoice profesional, terima pembayaran QRIS, dan unduh kuitansi resmi dalam 30 detik.",
  alternates: {
    canonical: `${baseUrl}/register`,
  },
  openGraph: {
    title: "Daftar Akun Gratis · NotaKu",
    description:
      "Mulai kelola invoice tagihan dan kuitansi resmi usaha Anda secara gratis.",
    url: `${baseUrl}/register`,
    siteName: "NotaKu",
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
