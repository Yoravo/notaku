"use client";

import Link from "next/link";
import Image from "next/image";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFAQ } from "@/components/landing-faq";
import { useLanguage } from "@/lib/i18n/context";
import {
  CheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
  CalculatorIcon,
  PencilSquareIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  TruckIcon,
  LanguageIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface HomeClientProps {
  session: any;
  announcementBanner: React.ReactNode;
}

export function HomeClient({ session, announcementBanner }: HomeClientProps) {
  const { t } = useLanguage();

  const mainFeatures = [
    {
      icon: BoltIcon,
      title: t.featuresSection.f1_title,
      desc: t.featuresSection.f1_desc,
      badge: t.featuresSection.f1_badge,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t.featuresSection.f2_title,
      desc: t.featuresSection.f2_desc,
      badge: t.featuresSection.f2_badge,
    },
    {
      icon: ArrowDownTrayIcon,
      title: t.featuresSection.f3_title,
      desc: t.featuresSection.f3_desc,
      badge: t.featuresSection.f3_badge,
    },
    {
      icon: CalculatorIcon,
      title: t.featuresSection.f4_title,
      desc: t.featuresSection.f4_desc,
      badge: t.featuresSection.f4_badge,
    },
    {
      icon: PencilSquareIcon,
      title: t.featuresSection.f5_title,
      desc: t.featuresSection.f5_desc,
      badge: t.featuresSection.f5_badge,
    },
    {
      icon: UserGroupIcon,
      title: t.featuresSection.f6_title,
      desc: t.featuresSection.f6_desc,
      badge: t.featuresSection.f6_badge,
    },
  ];

  const workflowSteps = [
    {
      step: t.workflow.s1_step,
      title: t.workflow.s1_title,
      desc: t.workflow.s1_desc,
    },
    {
      step: t.workflow.s2_step,
      title: t.workflow.s2_title,
      desc: t.workflow.s2_desc,
    },
    {
      step: t.workflow.s3_step,
      title: t.workflow.s3_title,
      desc: t.workflow.s3_desc,
    },
  ];

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
                  "5 invoice per bulan, pelanggan maks. 20, PDF download, share WhatsApp",
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

      {/* Global Broadcast Announcement Banner for Landing Page */}
      {announcementBanner}

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
                {t.hero.badge}
              </div>

              <h1
                className="rise font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl text-ink"
                style={{ animationDelay: "0.1s" }}
              >
                {t.hero.title}{" "}
                <span className="text-emerald italic">{t.hero.titleHighlight}</span>
              </h1>

              <p
                className="rise max-w-xl text-base sm:text-lg leading-relaxed text-ink-soft"
                style={{ animationDelay: "0.2s" }}
              >
                {t.hero.desc}
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
                  <span>{session ? t.hero.ctaDashboard : t.hero.ctaStart}</span>
                </Link>

                <Link
                  href="/buat-invoice"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-6 py-3.5 text-sm font-bold text-emerald transition-colors hover:bg-emerald/20"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Coba Generator Gratis</span>
                </Link>

                <a
                  href="#cara-kerja"
                  className="inline-flex items-center justify-center rounded-full border border-line bg-paper-deep px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-line"
                >
                  {t.hero.ctaHow}
                </a>
              </div>

              {/* Trust Badges */}
              <div
                className="rise flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs text-ink-soft font-medium"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {t.hero.trust1}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {t.hero.trust2}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {t.hero.trust3}
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="tilt-in mx-auto w-full max-w-md rounded-2xl border border-line bg-white p-6 sm:p-7 shadow-2xl shadow-ink/10 transition-transform">
                {/* Header Mockup */}
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 font-display text-lg font-bold transition-opacity hover:opacity-80"
                  >
                    <Image
                      src="/logo.png"
                      alt="NotaKu Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain shrink-0"
                    />
                    <span>
                      <span>Nota</span>
                      <span className="text-emerald">Ku</span>
                    </span>
                  </Link>
                  <span className="rounded-full bg-emerald/15 px-3 py-1 text-xs font-bold text-emerald">
                    {t.mockup.paid}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mt-4 flex justify-between text-xs">
                  <div>
                    <span className="text-ink-soft">{t.mockup.billedTo}</span>
                    <p className="font-semibold text-ink text-sm mt-0.5">
                      Kopi Kenangan Senja
                    </p>
                    <p className="text-ink-soft">Jakarta Selatan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-soft">{t.mockup.dueDate}</span>
                    <p className="font-semibold text-ink mt-0.5">28 Agu 2026</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mt-5 space-y-2.5 rounded-xl bg-paper-deep/50 p-3.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>{t.mockup.item1}</span>
                    <span className="tnum font-bold">Rp450.000</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>{t.mockup.item2}</span>
                    <span className="tnum font-bold">Rp250.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft pt-1 border-t border-line/60">
                    <span>{t.mockup.subtotal}</span>
                    <span className="tnum">Rp700.000</span>
                  </div>
                  <div className="flex justify-between text-emerald font-medium">
                    <span>{t.mockup.discount}</span>
                    <span className="tnum">-Rp70.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>{t.mockup.ppn}</span>
                    <span className="tnum">Rp69.300</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="mt-4 flex items-baseline justify-between border-t border-ink/80 pt-3">
                  <div>
                    <span className="text-xs font-medium text-ink-soft uppercase tracking-wider">
                      {t.mockup.grandTotal}
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
                    {t.mockup.verified}
                  </span>
                  <span className="italic font-display font-medium text-emerald">
                    {t.mockup.qrisPaid}
                  </span>
                </div>
              </div>

              {/* Decorative Floating Card */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2.5 rounded-xl border border-line bg-paper-deep px-4 py-2.5 shadow-md animate-bounce duration-1000">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald" />
                <span className="text-xs font-semibold text-ink">
                  {t.mockup.floatCard}
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
              {t.featuresSection.tag}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {t.featuresSection.title}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {t.featuresSection.desc}
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
              {t.workflow.tag}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {t.workflow.title}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {t.workflow.desc}
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

      {/* Free Business Tools & Calculators Showcase */}
      <section id="tools" className="border-t border-line bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                100% Gratis • Tanpa Login
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
                Pusat Alat & Kalkulator Bisnis Online
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                Koleksi generator dokumen resmi dan kalkulator pajak untuk mempermudah operasional usaha Anda kapan saja.
              </p>
            </div>
            <Link
              href="/tools"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald hover:text-emerald-bright transition-colors"
            >
              <span>Lihat Semua 7 Tools</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Invoice Generator Gratis",
                desc: "Buat faktur tagihan bisnis online dalam 30 detik tanpa daftar, hitung PPN otomatis, dan download PDF.",
                href: "/buat-invoice",
                icon: DocumentTextIcon,
                badge: "Populer",
              },
              {
                title: "Kuitansi Pembayaran Online",
                desc: "Generator tanda terima sah dengan ejaan terbilang rupiah otomatis, stempel lunas, dan ekspor PDF resmi.",
                href: "/buat-kuitansi",
                icon: DocumentCheckIcon,
                badge: "Baru",
              },
              {
                title: "Surat Jalan (Delivery Order)",
                desc: "Dokumen pengiriman barang standar ekspedisi logistik dengan rincian barang dan 3 kolom tanda tangan.",
                href: "/buat-surat-jalan",
                icon: TruckIcon,
                badge: "Baru",
              },
              {
                title: "Kalkulator PPN 11% / 12%",
                desc: "Hitung nilai Dasar Pengenaan Pajak (DPP) serta PPN sistem include maupun exclude harga secara akurat.",
                href: "/kalkulator-ppn",
                icon: CalculatorIcon,
              },
              {
                title: "Kalkulator PPh 23 Jasa",
                desc: "Kalkulasi potongan pajak PPh 23 (2% NPWP / 4% Non-NPWP) dan nilai kas bersih yang diterima vendor.",
                href: "/kalkulator-pph23",
                icon: CalculatorIcon,
                badge: "Baru",
              },
              {
                title: "Konverter Terbilang Rupiah",
                desc: "Ubah angka nominal uang menjadi kalimat ejaan huruf rupiah standar formal perbankan dan kuitansi.",
                href: "/terbilang-rupiah",
                icon: LanguageIcon,
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  prefetch={true}
                  className="group relative p-6 rounded-3xl border border-line bg-paper-deep/30 hover:bg-white hover:border-emerald/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-paper transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-ink group-hover:text-emerald transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-xs text-ink-soft leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-bold text-emerald">
                    <span>Gunakan Sekarang</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-line bg-paper-deep py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {t.pricing.tag}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {t.pricing.title}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {t.pricing.desc}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-3xl border border-line bg-white p-8 sm:p-10 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-ink">{t.pricing.freeTitle}</h3>
                  <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-soft">
                    {t.pricing.freeBadge}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {t.pricing.freeDesc}
                </p>
                <div className="mt-6 border-b border-line pb-6">
                  <p className="tnum font-display text-4xl font-extrabold text-ink">
                    {t.pricing.freePrice}
                    <span className="text-sm font-normal text-ink-soft ml-1">
                      {t.pricing.freePeriod}
                    </span>
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-ink-soft">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.freeItem1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.freeItem2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.freeItem3}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.freeItem4}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="block w-full rounded-full border border-ink py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper cursor-pointer"
                >
                  {session ? t.pricing.freeBtnUser : t.pricing.freeBtnGuest}
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-3xl bg-ink p-8 sm:p-10 text-paper shadow-xl shadow-ink/20">
              <span className="absolute -top-3.5 right-8 rounded-full bg-emerald px-3.5 py-1 text-xs font-bold text-paper shadow-md">
                {t.pricing.proBadge}
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold">
                    Nota<span className="text-emerald-400">Ku</span> PRO
                  </h3>
                </div>
                <p className="mt-2 text-sm text-paper/70">
                  {t.pricing.proDesc}
                </p>
                <div className="mt-6 border-b border-paper/15 pb-6">
                  <p className="tnum font-display text-4xl font-extrabold">
                    {t.pricing.proPrice}
                    <span className="text-sm font-normal opacity-70 ml-1">
                      {t.pricing.proPeriod}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    {t.pricing.proPaymentNote}
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-paper/90">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.proItem1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.proItem2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.proItem3}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.proItem4}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{t.pricing.proItem5}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/settings" : "/register"}
                  className="block w-full rounded-full bg-emerald py-3.5 text-center text-sm font-bold text-paper transition-all hover:bg-emerald-bright hover:shadow-lg hover:shadow-emerald/30 cursor-pointer"
                >
                  {session ? t.pricing.proBtnUser : t.pricing.proBtnGuest}
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
              {t.faq.tag}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {t.faq.desc}
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
            {t.bottomCta.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
            {t.bottomCta.desc}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-9 py-4 text-sm font-bold text-paper shadow-xl shadow-emerald/25 transition-all hover:bg-emerald-bright hover:scale-[1.02]"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{session ? t.bottomCta.ctaUser : t.bottomCta.ctaGuest}</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-soft font-medium">
            {t.bottomCta.note}
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
                className="font-display text-2xl font-bold tracking-tight text-ink flex items-center gap-1.5"
              >
                <Image
                  src="/logo.png"
                  alt="NotaKu Logo"
                  width={30}
                  height={30}
                  className="w-7 h-7 object-contain shrink-0"
                />
                <span>
                  <span>Nota</span>
                  <span className="text-emerald">Ku</span>
                </span>
              </Link>
              <p className="text-xs text-ink-soft text-center md:text-left">
                {t.footer.desc}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-ink-soft font-medium">
              <Link href="/buat-invoice" className="text-emerald font-bold hover:underline">
                Invoice Gratis
              </Link>
              <Link href="/buat-kuitansi" className="text-emerald font-bold hover:underline">
                Kuitansi Gratis
              </Link>
              <Link href="/buat-surat-jalan" className="text-emerald font-bold hover:underline">
                Surat Jalan
              </Link>
              <Link href="/templates" className="text-emerald font-bold hover:underline">
                Template
              </Link>
              <Link href="/kalkulator-ppn" className="text-emerald font-bold hover:underline">
                Kalkulator PPN
              </Link>
              <Link href="/kalkulator-pph23" className="text-emerald font-bold hover:underline">
                Kalkulator PPh 23
              </Link>
              <Link href="/tools" className="text-emerald font-bold hover:underline">
                Semua Tools
              </Link>
              <Link href="/terbilang-rupiah" className="text-emerald font-bold hover:underline">
                Terbilang Rupiah
              </Link>
              <a href="#fitur" className="hover:text-emerald transition-colors">
                {t.footer.features}
              </a>
              <a href="#cara-kerja" className="hover:text-emerald transition-colors">
                {t.footer.howItWorks}
              </a>
              <a href="#pricing" className="hover:text-emerald transition-colors">
                {t.footer.pricing}
              </a>
              <a href="#faq" className="hover:text-emerald transition-colors">
                {t.footer.faq}
              </a>
              <Link href="/login" className="hover:text-emerald transition-colors">
                {t.footer.login}
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
            <span>{t.footer.copyright}</span>
            <span>{t.footer.paymentSupport}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
