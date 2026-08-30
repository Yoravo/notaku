import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/login",
          "/register",
          "/buat-invoice",
          "/kalkulator-ppn",
          "/terbilang-rupiah",
          "/tools",
          "/templates",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/invoices",
          "/invoices/",
          "/recurring-invoices",
          "/recurring-invoices/",
          "/customers",
          "/customers/",
          "/settings",
          "/settings/",
          "/wallet",
          "/wallet/",
          "/tax-reports",
          "/tax-reports/",
          "/referrals",
          "/referrals/",
          "/admin",
          "/admin/",
          "/api/",
          "/i/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/login",
          "/register",
          "/buat-invoice",
          "/kalkulator-ppn",
          "/terbilang-rupiah",
          "/tools",
          "/templates",
        ],
        disallow: [
          "/dashboard",
          "/invoices",
          "/recurring-invoices",
          "/customers",
          "/settings",
          "/wallet",
          "/tax-reports",
          "/referrals",
          "/admin",
          "/api/",
          "/i/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
