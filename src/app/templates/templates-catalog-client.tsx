"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { NICHE_TEMPLATES, NicheTemplate } from "@/lib/templates-data";

export function TemplatesCatalogClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "ALL", label: "Semua Kategori" },
    { id: "Freelance & Jasa", label: "Freelance & Jasa" },
    { id: "Kreatif & IT", label: "Kreatif & IT" },
    { id: "Bisnis & UKM", label: "Bisnis & UKM" },
    { id: "Operasional & Properti", label: "Properti & Sewa" },
  ];

  const filteredTemplates = NICHE_TEMPLATES.filter((tpl) => {
    const matchCat = selectedCategory === "ALL" || tpl.category === selectedCategory;
    const matchSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-emerald/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-ink flex items-center gap-1.5">
            <span>Nota</span>
            <span className="text-emerald">Ku</span>
            <span className="ml-2 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald border border-emerald/20">
              Templates Hub
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/buat-invoice"
              className="text-xs font-bold text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Invoice Generator
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald px-4 py-2 text-xs font-bold text-paper shadow-sm hover:bg-emerald-bright transition-all"
            >
              <span>Daftar Gratis</span>
              <SparklesIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-line bg-paper-deep/40 py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald border border-emerald/20 mb-3.5">
            <FolderOpenIcon className="w-4 h-4" />
            Katalog Template Invoice Gratis
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
            Koleksi Format & Template Invoice Siap Pakai
          </h1>
          <p className="mt-3.5 text-xs sm:text-base text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Pilih contoh template invoice sesuai jenis profesi dan industri bisnis Anda. Disesuaikan dengan standar penagihan Indonesia dan siap cetak/download PDF gratis.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template: freelance, desain, bengkel, sewa..."
              className="w-full rounded-2xl border border-line bg-white pl-11 pr-4 py-3 text-xs sm:text-sm text-ink placeholder:text-ink-soft/60 focus:border-emerald focus:ring-1 focus:ring-emerald focus:outline-none shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Category Pills & Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-emerald text-paper shadow-xs"
                  : "bg-paper-deep text-ink-soft hover:text-ink hover:bg-paper-deep/80 border border-line"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.slug}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-2xs hover:shadow-md hover:border-emerald/40 transition-all duration-200"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-paper-deep px-2.5 py-1 text-[11px] font-bold text-ink-soft border border-line/60">
                    {template.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald">
                    Template {template.pdfTemplate}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-ink group-hover:text-emerald transition-colors">
                  <Link href={`/templates/${template.slug}`}>
                    {template.title}
                  </Link>
                </h3>

                <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                  {template.shortDesc}
                </p>

                {/* Sample items preview pill */}
                <div className="rounded-xl bg-paper-deep/50 p-3 border border-line/50 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Contoh Isian Item:
                  </div>
                  <div className="text-xs font-medium text-ink truncate">
                    • {template.sampleData.items[0]?.description}
                  </div>
                  {template.sampleData.items[1] && (
                    <div className="text-xs font-medium text-ink-soft truncate">
                      • {template.sampleData.items[1]?.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between">
                <Link
                  href={`/templates/${template.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-emerald transition-colors"
                >
                  <span>Lihat Detail Template</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/buat-invoice?template=${template.slug}`}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald/10 px-3 py-1.5 text-xs font-bold text-emerald hover:bg-emerald hover:text-paper transition-all"
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  <span>Gunakan</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-line bg-paper-deep/30">
            <p className="text-sm font-bold text-ink">Tidak ada template yang cocok dengan pencarian Anda.</p>
            <p className="text-xs text-ink-soft mt-1">Coba gunakan kata kunci lain atau pilih &quot;Semua Kategori&quot;.</p>
          </div>
        )}
      </main>
    </div>
  );
}
