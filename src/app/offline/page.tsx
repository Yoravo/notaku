import type { Metadata } from "next";
import { OfflineClient } from "./offline-client";

export const metadata: Metadata = {
  title: "Tidak Ada Koneksi Internet",
  description: "Koneksi internet terputus. Periksa jaringan Anda dan coba lagi.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineClient />;
}
