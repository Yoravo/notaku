import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

  const publicInvoices = await prisma.invoice.findMany({
    where: {
      status: { not: "DRAFT" },
    },
    select: {
      publicId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50000,
  });

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    ...publicInvoices.map((inv) => ({
      url: `${baseUrl}/i/${inv.publicId}`,
      lastModified: inv.createdAt,
      changeFrequency: "never" as const,
      priority: 0.3,
    })),
  ];

  return entries;
}
