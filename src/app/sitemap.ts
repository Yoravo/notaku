import type { MetadataRoute } from "next";
import { NICHE_TEMPLATES } from "@/lib/templates-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

  // Public marketing, tools, and auth landing pages.
  // Invoices are private financial documents and MUST NOT be indexed in search engines
  // or listed in sitemap to prevent PII / confidential transaction data leakage.
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buat-invoice`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buat-kuitansi`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buat-surat-jalan`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kalkulator-ppn`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/kalkulator-pph23`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/terbilang-rupiah`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/login`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Niche Programmatic Template Pages
  const templateEntries: MetadataRoute.Sitemap = NICHE_TEMPLATES
    .filter((tpl) => Boolean(tpl?.slug && typeof tpl.slug === "string" && tpl.slug.trim().length > 0))
    .map((tpl) => ({
      url: `${baseUrl}/templates/${tpl.slug.trim()}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...templateEntries].filter((item) => Boolean(item?.url));
}
