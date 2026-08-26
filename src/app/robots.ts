import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.notaku.store";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/invoices",
        "/customers",
        "/settings",
        "/admin",
        "/api",
        "/i/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

