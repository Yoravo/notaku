"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "Apakah NotaKu benar-benar gratis?",
    a: "Ya! Anda bisa menggunakan paket Free selamanya tanpa kartu kredit. Paket Free mencakup pembuatan hingga 5 invoice per bulan, manajemen pelanggan tanpa batas, ekspor PDF, dan fitur kirim via WhatsApp.",
  },
  {
    q: "Apa keuntungan upgrade ke NotaKu PRO?",
    a: "Dengan paket PRO (hanya Rp49.000/30 hari), Anda mendapatkan akses pembuatan invoice unlimited, ekspor PDF bersih tanpa watermark NotaKu, kustomisasi logo bisnis, tanda tangan digital (draw canvas), cap stempel usaha, serta ekspor laporan keuangan CSV.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung untuk upgrade PRO?",
    a: "Kami menggunakan gateway pembayaran resmi Mayar.id yang mendukung QRIS (GoPay, OVO, DANA, ShopeePay, LinkAja), Virtual Account bank nasional (BCA, Mandiri, BRI, BNI, Permata), dan Kartu Kredit.",
  },
  {
    q: "Bagaimana cara mengirim invoice ke pelanggan via WhatsApp?",
    a: "Setelah membuat invoice, cukup klik tombol 'Share WhatsApp'. NotaKu akan otomatis menyusun pesan tagihan rapi lengkap dengan nomor invoice, total nominal, batas waktu, dan tautan invoice publik interaktif yang bisa langsung dibuka pelanggan.",
  },
  {
    q: "Apakah invoice NotaKu mendukung perhitungan Pajak PPN & Diskon?",
    a: "Tentu saja! NotaKu dilengkapi fitur kalkulasi pajak PPN otomatis (preset 11%, 12%, atau kustom) dengan perhitungan Dasar Pengenaan Pajak (DPP) yang akurat sesuai regulasi perpajakan Indonesia, serta diskon dalam bentuk persentase (%) maupun nominal rupiah (Rp).",
  },
  {
    q: "Apakah pelanggan saya harus menginstal aplikasi atau login untuk melihat invoice?",
    a: "Tidak perlu. Pelanggan cukup membuka tautan invoice publik melalui browser handphone atau komputer mereka secara langsung dan bisa mengunduh PDF resminya kapan saja.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`overflow-hidden rounded-2xl border transition-all ${
              isOpen
                ? "border-emerald/30 bg-white shadow-sm"
                : "border-line bg-paper-deep/50 hover:bg-paper-deep"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-6 py-4.5 text-left font-medium text-ink transition-colors cursor-pointer"
            >
              <span className="text-base font-semibold text-ink sm:text-lg">
                {faq.q}
              </span>
              <div
                className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 bg-emerald text-paper"
                    : "bg-paper-deep text-ink-soft"
                }`}
              >
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-line/50 px-6 pb-5 pt-3 text-sm leading-relaxed text-ink-soft sm:text-base animate-in fade-in duration-200">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
