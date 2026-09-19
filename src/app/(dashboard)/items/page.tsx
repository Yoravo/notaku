import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemsClient } from "./items-client";

export const metadata = {
  title: "Katalog Produk & Jasa - NotaKu",
};

const PER_PAGE = 20;

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { page, q } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const where = {
    userId: session.user.id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.item.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Serialisasi data untuk Client Component
  const serializedItems = items.map((it) => ({
    ...it,
    price: Number(it.price),
    createdAt: it.createdAt.toISOString(),
    updatedAt: it.updatedAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <ItemsClient
        items={serializedItems}
        totalPages={totalPages}
        currentPage={currentPage}
        searchQuery={q || ""}
      />
    </div>
  );
}
