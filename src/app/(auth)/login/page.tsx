import type { Metadata } from "next";
import { LoginClient } from "./login-client";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Masuk ke Akun Anda",
  description:
    "Masuk ke dashboard NotaKu untuk mengelola faktur tagihan, kuitansi resmi, dan pembayaran digital bisnis Anda.",
  alternates: {
    canonical: `${baseUrl}/login`,
  },
  openGraph: {
    title: "Masuk ke Akun Anda · NotaKu",
    description: "Akses dashboard pengelolaan invoice dan penagihan usaha Anda.",
    url: `${baseUrl}/login`,
    siteName: "NotaKu",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
