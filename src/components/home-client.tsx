"use client";

import Link from "next/link";
import Image from "next/image";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFAQ } from "@/components/landing-faq";
import { LandingFooter } from "@/components/layout/landing-footer";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currencies";
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
  const tHero = useTranslations("hero");
  const tMockup = useTranslations("mockup");
  const tFeatures = useTranslations("featuresSection");
  const tWorkflow = useTranslations("workflow");
  const tPricing = useTranslations("pricing");
  const tBottomCta = useTranslations("bottomCta");
  const tTools = useTranslations("tools");

  const mainFeatures = [
    {
      icon: BoltIcon,
      title: tFeatures("f1_title"),
      desc: tFeatures("f1_desc"),
      badge: tFeatures("f1_badge"),
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: tFeatures("f2_title"),
      desc: tFeatures("f2_desc"),
      badge: tFeatures("f2_badge"),
    },
    {
      icon: ArrowDownTrayIcon,
      title: tFeatures("f3_title"),
      desc: tFeatures("f3_desc"),
      badge: tFeatures("f3_badge"),
    },
    {
      icon: CalculatorIcon,
      title: tFeatures("f4_title"),
      desc: tFeatures("f4_desc"),
      badge: tFeatures("f4_badge"),
    },
    {
      icon: PencilSquareIcon,
      title: tFeatures("f5_title"),
      desc: tFeatures("f5_desc"),
      badge: tFeatures("f5_badge"),
    },
    {
      icon: UserGroupIcon,
      title: tFeatures("f6_title"),
      desc: tFeatures("f6_desc"),
      badge: tFeatures("f6_badge"),
    },
  ];

  const workflowSteps = [
    {
      step: tWorkflow("s1_step"),
      title: tWorkflow("s1_title"),
      desc: tWorkflow("s1_desc"),
    },
    {
      step: tWorkflow("s2_step"),
      title: tWorkflow("s2_title"),
      desc: tWorkflow("s2_desc"),
    },
    {
      step: tWorkflow("s3_step"),
      title: tWorkflow("s3_title"),
      desc: tWorkflow("s3_desc"),
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
      <section className="relative overflow-hidden pt-10 pb-20 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rise inline-flex items-center gap-2 rounded-xl border border-emerald/25 bg-emerald/10 px-3.5 py-1.5 text-xs font-bold text-emerald">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                <span>{tHero("badge")}</span>
              </div>

              <h1
                className="rise font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl text-ink"
                style={{ animationDelay: "0.1s" }}
              >
                {tHero("title")}{" "}
                <span className="text-emerald italic">{tHero("titleHighlight")}</span>
              </h1>

              <p
                className="rise max-w-xl text-base sm:text-lg leading-relaxed text-ink-soft"
                style={{ animationDelay: "0.2s" }}
              >
                {tHero("desc")}
              </p>

              {/* Action Buttons */}
              <div
                className="rise flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  <SparklesIcon className="w-4 h-4 text-emerald-300" />
                  <span>{session ? tHero("ctaDashboard") : tHero("ctaStart")}</span>
                </Link>

                <Link
                  href="/buat-invoice"
                  prefetch={true}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-paper-deep hover:bg-line px-6 py-3.5 text-sm sm:text-base font-bold text-ink transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  <DocumentTextIcon className="w-4 h-4 text-emerald" />
                  <span>{tTools("tryFreeGenerator")}</span>
                </Link>

                <a
                  href="#cara-kerja"
                  className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-ink-soft hover:text-emerald transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg text-center"
                >
                  {tHero("ctaHow")} &rarr;
                </a>
              </div>

              {/* Trust Badges */}
              <div
                className="rise flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 text-xs sm:text-sm text-ink-soft font-medium"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust1")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust2")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald stroke-[2.5]" />
                  {tHero("trust3")}
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup / Document Stage */}
            <div className="lg:col-span-5 relative">
              <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-white dark:bg-slate-900 mockup-paper-preview p-6 sm:p-7 shadow-xl shadow-ink/5 transition-all">
                {/* Header Mockup */}
                <div className="flex items-start justify-between border-b border-line dark:border-slate-800 pb-4">
                  <Link
                    href="/"
                    prefetch={true}
                    className="flex items-center gap-1.5 font-display text-lg font-bold text-ink transition-opacity hover:opacity-80"
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
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-[#0f6b4f] dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                    <span>{tMockup("paid")}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mt-4 flex justify-between text-xs">
                  <div>
                    <span className="text-ink-soft">{tMockup("billedTo")}</span>
                    <p className="font-bold text-ink text-sm mt-0.5">
                      Kopi Kenangan Senja
                    </p>
                    <p className="text-ink-soft">Jakarta Selatan</p>
                  </div>
                  <div className="text-right">
                    <span className="text-ink-soft">{tMockup("dueDate")}</span>
                    <p className="font-bold text-ink mt-0.5">28 Agu 2026</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mt-5 space-y-2.5 rounded-xl bg-paper-deep/40 dark:bg-slate-800/50 p-3.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-ink">{tMockup("item1")}</span>
                    <span className="tnum font-bold text-ink">Rp450.000</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-ink">{tMockup("item2")}</span>
                    <span className="tnum font-bold text-ink">Rp250.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft pt-1.5 border-t border-line/60 dark:border-slate-700">
                    <span>{tMockup("subtotal")}</span>
                    <span className="tnum font-medium">Rp700.000</span>
                  </div>
                  <div className="flex justify-between text-[#0f6b4f] dark:text-emerald-400 font-medium">
                    <span>{tMockup("discount")}</span>
                    <span className="tnum font-bold">-Rp70.000</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>{tMockup("ppn")}</span>
                    <span className="tnum font-medium">Rp69.300</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="mt-4 flex items-baseline justify-between border-t border-ink/80 dark:border-slate-700 pt-3">
                  <div>
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                      {tMockup("grandTotal")}
                    </span>
                  </div>
                  <span className="tnum font-display text-2xl sm:text-3xl font-bold text-ink">
                    Rp699.300
                  </span>
                </div>

                {/* Settlement Confirmation Strip */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-line/60 dark:border-slate-800 text-[11px] text-ink-soft font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald" />
                    <span>{tMockup("verified")}</span>
                  </span>
                  <span className="font-semibold text-emerald">
                    {tMockup("qrisPaid")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="border-y border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {tFeatures("tag")}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {tFeatures("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tFeatures("desc")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mainFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-line bg-white dark:bg-slate-900 p-7 shadow-xs transition-colors hover:border-emerald/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-paper">
                      <IconComp className="h-6 w-6 stroke-[2]" />
                    </div>
                    <span className="rounded-lg bg-paper-deep dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-ink-soft">
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
              {tWorkflow("tag")}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {tWorkflow("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tWorkflow("desc")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-line bg-paper-deep/40 dark:bg-slate-900/60 p-7 sm:p-8 text-left transition-colors hover:bg-paper-deep/80 dark:hover:bg-slate-900"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald text-paper font-mono text-sm font-bold shadow-xs">
                  {step.step}
                </div>
                <h3 className="mt-5 font-display text-lg sm:text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
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
                {tTools("badgeFreeNoLogin")}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
                {tTools("showcaseTitle")}
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                {tTools("showcaseDesc")}
              </p>
            </div>
            <Link
              href="/tools"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald hover:text-emerald-bright transition-colors min-h-[44px] py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald rounded-lg"
            >
              <span>{tTools("viewAllTools")}</span>
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
                  className="group relative p-6 rounded-2xl border border-line bg-paper-deep/30 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald/40 hover:shadow-md transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-paper transition-colors">
                        <Icon className="w-5 h-5" />
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
                    <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald min-h-[36px]">
                    <span>{tTools("useNow")}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              {tPricing("tag")}
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-ink">
              {tPricing("title")}
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              {tPricing("desc")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-ink">{tPricing("freeTitle")}</h3>
                  <span className="rounded-lg bg-paper-deep dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-ink-soft">
                    {tPricing("freeBadge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {tPricing("freeDesc")}
                </p>
                <div className="mt-6 border-b border-line dark:border-slate-800 pb-6">
                  <p className="tnum font-display text-4xl font-extrabold text-ink">
                    {formatMoney(0, "IDR")}
                    <span className="text-sm font-normal text-ink-soft ml-1">
                      {tPricing("freePeriod")}
                    </span>
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-ink-soft">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem1")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem2")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem3")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/10 text-emerald shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("freeItem4")}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="flex items-center justify-center w-full rounded-xl border border-line bg-paper-deep hover:bg-line text-ink py-3.5 text-sm font-bold transition-colors cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  {session ? tPricing("freeBtnUser") : tPricing("freeBtnGuest")}
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col justify-between rounded-2xl bg-[#09110E] dark:bg-slate-900 border border-emerald/30 p-8 sm:p-10 text-paper shadow-xl shadow-emerald-950/20">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-white">
                    Nota<span className="text-emerald-400">Ku</span> PRO
                  </h3>
                  <span className="rounded-lg bg-emerald px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                    {tPricing("proBadge")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-paper/70">
                  {tPricing("proDesc")}
                </p>
                <div className="mt-6 border-b border-paper/15 pb-6">
                  <p className="tnum font-display text-4xl font-extrabold text-white">
                    {formatMoney(49000, "IDR")}
                    <span className="text-sm font-normal opacity-70 ml-1">
                      {tPricing("proPeriod")}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-400 font-medium mt-1">
                    {tPricing("proPaymentNote")}
                  </p>
                </div>

                <ul className="mt-6 space-y-3.5 text-sm text-paper/90">
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem1")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem2")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem3")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem4")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-paper shrink-0">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{tPricing("proItem5")}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  prefetch={true}
                  className="flex items-center justify-center w-full rounded-xl bg-emerald hover:bg-emerald-bright py-3.5 text-sm font-bold text-white transition-colors cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
                >
                  {session ? tPricing("proBtnUser") : tPricing("proBtnGuest")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <LandingFAQ />

      {/* Bottom CTA Banner */}
      <section className="border-t border-line bg-paper-deep/60 dark:bg-slate-900/40 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald mb-6">
            <BuildingStorefrontIcon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl text-ink">
            {tBottomCta("title")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-xl mx-auto">
            {tBottomCta("desc")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/register"}
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c553e] px-9 py-4 text-sm sm:text-base font-bold text-white shadow-sm transition-all active:scale-[0.98] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2"
            >
              <SparklesIcon className="w-4 h-4 text-emerald-300" />
              <span>{session ? tBottomCta("ctaUser") : tBottomCta("ctaGuest")}</span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-soft font-medium">
            {tBottomCta("note")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
