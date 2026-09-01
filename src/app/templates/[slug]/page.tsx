import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { NICHE_TEMPLATES, NicheTemplate } from "@/lib/templates-data";
import { formatMoney } from "@/lib/currencies";
import { LandingNavbar } from "@/components/landing-navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export async function generateStaticParams() {
  return NICHE_TEMPLATES.map((tpl) => ({
    slug: tpl.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = NICHE_TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    return {
      title: "Template Invoice Tidak Ditemukan — NotaKu",
    };
  }

  const title = `${template.title} Gratis - Download Format PDF & Excel · NotaKu`;
  const description = `${template.shortDesc} Dilengkapi contoh isian item, ketentuan pembayaran, dan generator PDF instan tanpa login.`;

  return {
    title,
    description,
    keywords: template.keywords,
    alternates: {
      canonical: `${baseUrl}/templates/${slug}`,
    },
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: `${baseUrl}/templates/${slug}`,
      title,
      description,
      siteName: "NotaKu",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: template.title,
        },
      ],
    },
  };
}

export default async function NicheTemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const template = NICHE_TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: template.title,
    url: `${baseUrl}/templates/${template.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
    description: template.shortDesc,
  };

  const sampleSubtotal = template.sampleData.items.reduce(
    (acc, it) => acc + it.amount,
    0
  );

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-emerald/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Header */}
      <LandingNavbar session={session} />

      {/* Breadcrumbs & Title */}
      <section className="border-b border-line bg-paper-deep/40 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-ink-soft mb-3">
            <Link href="/templates" className="hover:text-emerald transition-colors">
              Templates
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">{template.category}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            {template.title}
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-soft leading-relaxed max-w-2xl">
            {template.shortDesc}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/buat-invoice?template=${template.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald px-5 py-2.5 text-xs sm:text-sm font-bold text-paper shadow-sm hover:bg-emerald-bright transition-all"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Gunakan Template & Buat Invoice Gratis</span>
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-ink hover:bg-paper-deep transition-all"
            >
              <span>Lihat Template Lainnya</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Sample Interactive Preview Card */}
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-line/60 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                Pratinjau Format Tagihan
              </span>
              <h2 className="font-display text-lg font-bold text-ink mt-0.5">
                Contoh Dokumen Invoice: {template.sampleData.invoiceNumber}
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#0f6b4f] border border-emerald/20">
              Style: {template.pdfTemplate}
            </span>
          </div>

          {/* Business & Customer Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-paper-deep/40 p-4 border border-line/60">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Diterbitkan Oleh:
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                {template.sampleData.businessName}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                Ditagihkan Kepada:
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                {template.sampleData.customerName}
              </p>
            </div>
          </div>

          {/* Sample Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-soft font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Deskripsi Layanan / Barang</th>
                  <th className="pb-2.5 text-center">Qty</th>
                  <th className="pb-2.5 text-right">Harga Satuan</th>
                  <th className="pb-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {template.sampleData.items.map((it, idx) => (
                  <tr key={idx} className="py-2.5">
                    <td className="py-2.5 font-medium text-ink">{it.description}</td>
                    <td className="py-2.5 text-center font-mono text-ink-soft">{it.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-ink-soft">
                      {formatMoney(it.price, template.currency)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-ink font-mono">
                      {formatMoney(it.amount, template.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end border-t border-line pt-4">
            <div className="w-full max-w-xs space-y-1.5 text-right">
              <div className="flex justify-between text-xs text-ink-soft">
                <span>Subtotal</span>
                <span className="font-bold text-ink font-mono">
                  {formatMoney(sampleSubtotal, template.currency)}
                </span>
              </div>
              {template.taxRate && (
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>PPN ({template.taxRate}%)</span>
                  <span className="font-bold text-emerald font-mono">
                    +{formatMoney((sampleSubtotal * template.taxRate) / 100, template.currency)}
                  </span>
                </div>
              )}
              <div className="border-t border-line/60 pt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">Total Tagihan</span>
                <span className="font-display text-base font-bold text-ink font-mono">
                  {formatMoney(
                    sampleSubtotal + (template.taxRate ? (sampleSubtotal * template.taxRate) / 100 : 0),
                    template.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl bg-paper-deep/60 p-3.5 border border-line/60 text-xs text-ink-soft italic">
            <strong>Catatan & Info Pembayaran:</strong> &quot;{template.sampleData.notes}&quot;
          </div>

          {/* CTA Box inside preview */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line">
            <p className="text-xs text-ink-soft">
              Ingin langsung mengubah nama, nominal, dan mendownload PDF template ini?
            </p>
            <Link
              href={`/buat-invoice?template=${template.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald px-4 py-2 text-xs font-bold text-paper hover:bg-emerald-bright transition-all shrink-0"
            >
              <span>Edit Template Ini Sekarang</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Educational Content & Checklist */}
        <section className="space-y-8 border-t border-line pt-10">
          <div className="space-y-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
              Panduan Pembuatan {template.title}
            </h2>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              {template.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald" />
                <span>Checklist Komponen Wajib</span>
              </h3>
              <ul className="space-y-2 text-xs text-ink-soft">
                {template.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4 text-emerald" />
                <span>Mengapa Format Ini Penting?</span>
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                {template.whyNeedGuide}
              </p>
            </div>
          </div>

          {/* FAQ Accordion */}
          {template.faq.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-display text-lg font-bold text-ink">
                Pertanyaan Seputar {template.title}
              </h3>
              <div className="space-y-3">
                {template.faq.map((f, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-white p-4 space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-ink">{f.q}</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
