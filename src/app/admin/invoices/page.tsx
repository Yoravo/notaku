import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminInvoicesClient } from "./admin-invoices-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring Seluruh Invoice — Admin NotaKu",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

export default async function AdminInvoicesPage(props: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const searchQuery = searchParams.q?.trim() || "";
  const statusFilter = searchParams.status?.toUpperCase() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const PAGE_SIZE = 15;

  // Build where condition
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { number: { contains: searchQuery, mode: "insensitive" } },
      { customer: { name: { contains: searchQuery, mode: "insensitive" } } },
      { customer: { email: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  if (
    ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].includes(statusFilter)
  ) {
    where.status = statusFilter;
  }

  // Fetch summary & invoices list
  const [
    totalFilteredInvoices,
    invoices,
    totalAllInvoices,
    paidInvoicesSum,
    statusCounts,
  ] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            plan: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const totalPages = Math.ceil(totalFilteredInvoices / PAGE_SIZE) || 1;

  const statusCountMap = statusCounts.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    publicId: inv.publicId,
    status: inv.status,
    total: Number(inv.total),
    createdAt: inv.createdAt.toISOString(),
    itemCount: inv._count.items,
    user: {
      id: inv.user.id,
      name: inv.user.name,
      email: inv.user.email,
      businessName: inv.user.businessName,
      plan: inv.user.plan,
    },
    customer: {
      id: inv.customer.id,
      name: inv.customer.name,
      email: inv.customer.email,
    },
  }));

  return (
    <AdminInvoicesClient
      invoices={serializedInvoices}
      totalAllInvoices={totalAllInvoices}
      totalFilteredInvoices={totalFilteredInvoices}
      paidInvoicesTotal={Number(paidInvoicesSum._sum.total || 0)}
      totalPages={totalPages}
      currentPage={currentPage}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      statusCountMap={statusCountMap}
    />
  );
}
