import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { AdminUsersClient } from "./admin-users-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Pengguna — Admin NotaKu",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  plan?: string;
  role?: string;
  page?: string;
}>;

export default async function AdminUsersPage(props: {
  searchParams: SearchParams;
}) {
  const currentAdmin = await requireAdmin();
  const searchParams = await props.searchParams;

  const searchQuery = searchParams.q?.trim() || "";
  const planFilter = searchParams.plan?.toUpperCase() || "";
  const roleFilter = searchParams.role?.toUpperCase() || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const PAGE_SIZE = 15;

  // Build filter where clause
  const where: any = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { businessName: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  if (planFilter === "FREE" || planFilter === "PRO") {
    where.plan = planFilter;
  }

  if (roleFilter === "USER" || roleFilter === "ADMIN") {
    where.role = roleFilter;
  }

  const [totalFilteredUsers, users, totalAllUsers, totalProUsers] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          plan: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          _count: {
            select: {
              invoices: true,
              customers: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { plan: "PRO" } }),
    ]);

  const totalPages = Math.ceil(totalFilteredUsers / PAGE_SIZE) || 1;

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    businessName: u.businessName,
    plan: u.plan,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    emailVerified: u.emailVerified,
    invoiceCount: u._count.invoices,
    customerCount: u._count.customers,
  }));

  return (
    <AdminUsersClient
      users={serializedUsers}
      totalAllUsers={totalAllUsers}
      totalProUsers={totalProUsers}
      totalFilteredUsers={totalFilteredUsers}
      totalPages={totalPages}
      currentPage={currentPage}
      searchQuery={searchQuery}
      planFilter={planFilter}
      roleFilter={roleFilter}
      currentAdminId={currentAdmin.id}
    />
  );
}
