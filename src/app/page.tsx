import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFAQ } from "@/components/landing-faq";
import {
  CheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  CalculatorIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const mainFeatures = [
  {
    icon: BoltIcon,
    title: "Buat Invoice Kilat (< 30 Detik)",
    desc: "Input item dinamis, kalkulasi otomatis, dan penomoran faktur rapi tanpa perlu rumus Excel yang rumit.",
    badge: "Super Cepat",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Share WhatsApp & Email Otomatis",
    desc: "Kirim link invoice ke kontak pelanggan via WhatsApp atau email dalam 1 klik dengan draft pesan profesional.",
    badge: "1-Klik Kirim",
  },
  {
    icon: ArrowDownTrayIcon,
    title: "Ekspor PDF Berkualitas Tinggi",
    desc: "Cetak & unduh invoice format PDF resmi dengan 3 pilihan gaya template: Classic, Modern, dan Minimal.",
    badge: "Siap Cetak",
  },
  {
    icon: CalculatorIcon,
    title: "Kalkulasi Pajak (PPN) & Diskon",
    desc: "Mendukung DPP & tarif PPN standar Indonesia (11%, 12%, Kustom) serta diskon nominal maupun persentase.",
    badge: "Standar Pajak",
  },
  {
    icon: PencilSquareIcon,
    title: "Tanda Tangan Digital & Cap Usaha",
    desc: "Gambar tanda tangan langsung di layar (touch / stylus) dan sematkan stempel bisnis pada dokumen invoice.",
    badge: "PRO",
  },
  {
    icon: UserGroupIcon,
    title: "Buku Pelanggan Terintegrasi",
    desc: "Simpan profil pelanggan sekali, gunakan berulang kali saat penagihan tanpa perlu input manual.",
    badge: "Hemat Waktu",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Isi Rincian Tagihan",
    desc: "Pilih pelanggan dan tambahkan produk / jasa yang ingin ditagihkan. Total, diskon, dan PPN terhitung otomatis.",
  },
  {
    step: "02",
    title: "Pilih Template & Branding",
    desc: "Gunakan logo usaha, tanda tangan digital, stempel, dan pilih template PDF yang sesuai dengan karakter bisnismu.",
  },
  {
    step: "03",
    title: "Kirim & Pantau Pembayaran",
    desc: "Bagikan link invoice via WhatsApp atau download PDF resminya. Pantau status pembayaran hingga lunas.",
  },
];

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="grain min-h-screen bg-paper text-ink flex flex-col selection:bg-emerald/20 selection:text-emerald-900">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "NotaKu",
            description:
              "Invoice generator dan aplikasi penagihan praktis untuk UMKM, freelancer, dan bisnis Indonesia. Bikin invoice profesional dalam hitungan detik.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "IDR",
                description:
                  "5 invoice per bulan, pelanggan unlimited, PDF download, share WhatsApp",
              },
              {
                "@type": "Offer",
                name: "Pro",
                price: "49000",
                priceCurrency: "IDR",
                priceUnit: "month",
                description:
                  "Invoice unlimited, tanpa watermark, custom branding, TTD digital, ekspor laporan",
              },
            ],
          }),
        }}
      />

      {/* Sticky Header Navigation */}
      <LandingNavbar session={session} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 sm:pt-16 sm:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rise inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3.5 py-1 text-xs font-semibold text-emerald">
                <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                Solusi Invoice & Penagihan UMKM Indonesia
              </div>

              <h1
                className="rise font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl text-ink"
                style={{ animationDelay: "0.1s" }}
              >
                Bikin invoice profesional,{" "}
                <span className="text-emerald italic">cepat & tanpa ribet.</span>
              </h1>

              <p
                className="rise max-w-xl text-base sm:text-lg leading-relaxed text-ink-soft"
                style={{ animationDelay: "0.2s" }}
              >
                Tinggalkan nota manual dan file Excel berantakan. Buat invoice
                dalam 30 detik, hitung pajak PPN otomatis, dan langsung kirim via
                WhatsApp ke pelanggan Anda.
              </p>

              {/* Action Buttons */}
              <div
                className="rise flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-8 py-3.5 text-sm font-bold text-paper shadow-lg shadow-emerald/20 transition-all hover:bg-emerald-bright hover:shadow-emerald/30 hover:scale-[1.02]"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>{session ? "Buka Dashboard" : "Mulai Gratis Sekarang"}</span>
                </Link>

                <a
                  href="#cara-kerja"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-paper-deep px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-line"
                >
                  Lihat Cara Kerja
                </a>
              </div>

              {/* Trust Badges */}
              <div
                className="rise flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-ink-soft font-medium"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  Gratis 5 invoice/bulan
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  Tanpa kartu kredit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  Siap kirim via WhatsApp
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="tilt-in mx-auto w-full max-w-md rounded-2xl border border-line bg-white p-6 sm:p-7 shadow-2xl shadow-ink/10 transition-transform">
                {/* Header Mockup */}
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-1.5 font-display text-lg font-bold">
                      <span>Nota</span>
                      <span className="text-emerald">Ku</span>
                    </div>
                    <p className="tnum text-xs text-ink-soft mt-0.5">INV/2026/08/024</p>
                  </div>
                  <span className="rounded-full bg-emerald/15 px-3 py-1 text-xs font-bold text-emerald">
                    Lunas (PAID)
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mt-4 flex justify-between text-xs">
                  <div>
                    <span className="text-ink-soft">Ditagihkan Kepada:</span>
                    <p className="font-semibold text-ink text-sm mt-0.5">
                      Kopi Kenangan Senja
                    </p>
                    <p className="text-ink-soft">Jakarta Selatan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-soft">Jatuh Tempo:</span>
                    <p className="font-semibold text-ink mt-0.5">28 Agu 2026</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mt-5 space-y-2.5 rounded-xl bg-paper-deep/50 p-3.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>Biji Kopi Arabika 1kg (x3)</span>
                    <span className="tnum font-bold">Rp450.000</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Cup Kopi Sablon 500 pcs</span>
                    <span className="tnum font-bold">Rp250.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft pt-1 border-t border-line/60">
                    <span>Subtotal</span>
                    <span className="tnum">Rp700.000</span>
                  </div>
                  <div className="flex justify-between text-emerald font-medium">
                    <span>Diskon Promo UMKM (10%)</span>
                    <span className="tnum">-Rp70.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>PPN (11%)</span>
                    <span className="tnum">Rp69.300</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="mt-4 flex items-baseline justify-between border-t border-ink/80 pt-3">
                  <div>
                    <span className="text-xs font-medium text-ink-soft uppercase tracking-wider">
                      Total Tagihan
                    </span>
                  </div>
                  <span className="tnum font-display text-2xl font-bold text-ink">
                    Rp699.300
                  </span>
                </div>

                {/* Badges / Signature Placeholder */}
                <div className="mt-4 flex items-center justify-between pt-2 text-[11px] text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald" />
                    Terverifikasi Digital
                  </span>
                  <span className="italic font-display font-medium text-emerald">
                    Lunas via QRIS
                  </span>
                </div>
              </div>

              {/* Decorative Floating Card */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 rounded-xl border border-line bg-paper-deep px-4 py-2.5 shadow-md animate-bounce duration-1000">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald" />
                <span className="text-xs font-semibold text-ink">
                  Kirim ke WhatsApp 1-Klik!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="border-y border-line bg-paper-deep py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Fitur Lengkap & Praktis
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Segala kebutuhan invoice dalam satu tempat.
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Dirancang khusus untuk mempermudah operasional pemilik usaha,
              freelancer, dan UMKM di seluruh Indonesia.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-line bg-white p-7 shadow-xs transition-all hover:border-emerald/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-paper">
                      <IconComp className="h-6 w-6 stroke-[2]" />
                    </div>
                    <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="cara-kerja" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Alur Kerja Simpel
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Hanya 3 Langkah Menagih Lebih Cepat
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Tidak perlu keahlian teknis atau akuntansi rumit untuk membuat invoice rapi.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-line bg-paper-deep/40 p-8 text-center transition-all hover:bg-paper-deep"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-paper font-display text-lg font-bold shadow-md shadow-emerald/20">
                  {step.step}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-line bg-paper-deep py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Paket & Biaya
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Pilihan Harga Jujur & Transparan
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Mulai gratis untuk kebutuhan dasar. Upgrade ke PRO saat bisnis Anda berkembang.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-3xl border border-line bg-white p-8 sm:p-10 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-ink">Paket Free</h3>
                  <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-soft">
                    Cocok untuk Pemula
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  Fitur esensial untuk freelance dan usaha rintisan.
                </p>
                <div className="mt-6 border-b border-line pb-6">
                  <p className="tnum font-display text-4xl font-extrabold text-ink">
                    Rp0
                    <span className="text-sm font-normal text-ink-soft ml-1">
                      / selamanya
                    </span>
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-ink-soft">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span><strong>5 Invoice</strong> per bulan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Manajemen Pelanggan Unlimited</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Download PDF Invoice</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Share WhatsApp & Email</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="block w-full rounded-full border border-ink py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper cursor-pointer"
                >
                  {session ? "Masuk Dashboard" : "Daftar Gratis"}
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-3xl bg-ink p-8 sm:p-10 text-paper shadow-xl shadow-ink/20">
              <span className="absolute -top-3.5 right-8 rounded-full bg-emerald px-3.5 py-1 text-xs font-bold text-paper shadow-md">
                Paling Diminati
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">
                    Nota<span className="text-emerald-400">Ku</span> PRO
                  </h3>
                </div>
                <p className="mt-2 text-sm text-paper/70">
                  Akses tanpa batas untuk bisnis profesional.
                </p>
                <div className="mt-6 border-b border-paper/15 pb-6">
                  <p className="tnum font-display text-4xl font-extrabold">
                    Rp49.000
                    <span className="text-sm font-normal opacity-70 ml-1">
                      / 30 hari
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    Didukung pembayaran QRIS & Virtual Account Mayar.id
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-paper/90">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Invoice & Pelanggan Unlimited</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Ekspor PDF <strong>Tanpa Watermark</strong> NotaKu</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Custom Logo Bisnis, TTD Digital & Cap Stempel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Pilihan 3 Template Premium (Classic, Modern, Minimal)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>Laporan Rekap Keuangan & Ekspor CSV Lengkap</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/settings" : "/register"}
                  className="block w-full rounded-full bg-emerald py-3.5 text-center text-sm font-bold text-paper transition-all hover:bg-emerald-bright hover:shadow-lg hover:shadow-emerald/30 cursor-pointer"
                >
                  {session ? "Upgrade ke PRO Sekarang" : "Coba Paket PRO"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Pertanyaan Umum
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Punya pertanyaan seputar cara kerja atau langganan NotaKu? Temukan jawabannya di sini.
            </p>
          </div>

          <LandingFAQ />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-line bg-paper-deep py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald mb-6">
            <BuildingStorefrontIcon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl text-ink">
            Mulai tagih pelanggan dengan rapi hari ini.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
            Gabung bersama ratusan pelaku usaha dan UMKM yang telah beralih dari nota manual ke NotaKu.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-9 py-4 text-sm font-bold text-paper shadow-xl shadow-emerald/25 transition-all hover:bg-emerald-bright hover:scale-[1.02]"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{session ? "Buka Dashboard Saya" : "Buat Invoice Pertama Gratis"}</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-soft font-medium">
            Tanpa instalasi · Bisa langsung diakses di HP & Laptop
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-paper py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link
                href="/"
                className="font-display text-2xl font-bold tracking-tight text-ink"
              >
                Nota<span className="text-emerald">Ku</span>
              </Link>
              <p className="text-xs text-ink-soft text-center md:text-left">
                Aplikasi Invoice Generator & Billing SaaS untuk UMKM Indonesia.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-ink-soft font-medium">
              <a href="#fitur" className="hover:text-emerald transition-colors">
                Fitur
              </a>
              <a href="#cara-kerja" className="hover:text-emerald transition-colors">
                Cara Kerja
              </a>
              <a href="#pricing" className="hover:text-emerald transition-colors">
                Harga
              </a>
              <a href="#faq" className="hover:text-emerald transition-colors">
                FAQ
              </a>
              <Link href="/login" className="hover:text-emerald transition-colors">
                Masuk
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
            <span>© 2026 NotaKu. Dibuat untuk kemajuan UMKM Indonesia.</span>
            <span>Didukung pembayaran resmi Mayar.id</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
