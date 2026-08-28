import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoicesClient } from "./invoices-client";
import { InvoiceStatus } from "@/generated/prisma/client";

const PER_PAGE = 10;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; from?: string; to?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { page, status, from, to } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const validStatuses = new Set([
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]);
  const activeStatus =
    status && validStatuses.has(status) ? (status as InvoiceStatus) : undefined;

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (from) {
    const fromDate = new Date(`${from}T00:00:00.000+07:00`);
    if (!isNaN(fromDate.getTime())) dateFilter.gte = fromDate;
  }
  if (to) {
    const toDate = new Date(`${to}T23:59:59.999+07:00`);
    if (!isNaN(toDate.getTime())) dateFilter.lte = toDate;
  }

  const where = {
    userId: session.user.id,
    ...(activeStatus ? { status: activeStatus } : {}),
    ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
  };

  const [invoices, total, totalAll] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip,
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.count({ where: { userId: session.user.id } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const exportUrl = `/api/invoices/export?${new URLSearchParams({
    ...(activeStatus ? { status: activeStatus } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString()}`;

  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    total: Number(inv.total),
    createdAt: inv.createdAt.toISOString(),
    customer: {
      id: inv.customer.id,
      name: inv.customer.name,
      email: inv.customer.email,
      phone: inv.customer.phone,
    },
  }));

  return (
    <InvoicesClient
      invoices={serializedInvoices}
      total={total}
      totalAll={totalAll}
      currentPage={currentPage}
      totalPages={totalPages}
      activeStatus={activeStatus || ""}
      exportUrl={exportUrl}
      from={from}
      to={to}
    />
  );
}
