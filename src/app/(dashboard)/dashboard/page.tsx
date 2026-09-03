import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import { DashboardClient } from "./dashboard-client";
import { SerializedInvoice } from "@/types/invoice";
import { getActiveAnnouncement } from "@/actions/admin";
import { getAdvancedAnalytics } from "@/lib/analytics";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const { range } = await searchParams;
  const selectedRange = range || "month"; // "all" | "month" | "year"

  const now = new Date();
  let dateFilter: { gte?: Date } | undefined = undefined;

  if (selectedRange === "month") {
    dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
  } else if (selectedRange === "year") {
    dateFilter = { gte: new Date(now.getFullYear(), 0, 1) };
  }

  const [
    invoiceCount,
    totalCustomers,
    paidAgg,
    pendingAgg,
    totalVolumeAgg,
    user,
    recentInvoices,
    announcement,
    analytics,
  ] = await Promise.all([
    prisma.invoice.count({
      where: {
        userId,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
    }),
    prisma.customer.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: "PAID",
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ["SENT", "OVERDUE"] },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { not: "CANCELLED" },
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    prisma.invoice.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getActiveAnnouncement("DASHBOARD"),
    getAdvancedAnalytics(userId),
  ]);

  const paidRevenue = Number(paidAgg._sum.total || 0);
  const pendingRevenue = Number(pendingAgg._sum.total || 0);
  const totalVolume = Number(totalVolumeAgg._sum.total || 0);
  const isPro = user?.plan === "PRO";
  const { used, limit } = await canCreateInvoice(userId);

  const serializedInvoices: SerializedInvoice[] = recentInvoices.map((inv) => ({
    id: inv.id,
    publicId: inv.publicId,
    userId: inv.userId,
    customerId: inv.customerId,
    number: inv.number,
    status: inv.status,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    notes: inv.notes,
    total: Number(inv.total),
    createdAt: inv.createdAt.toISOString(),
    customer: {
      id: inv.customer.id,
      userId: inv.customer.userId,
      name: inv.customer.name,
      email: inv.customer.email,
      phone: inv.customer.phone,
      address: inv.customer.address,
      createdAt: inv.customer.createdAt.toISOString(),
    },
  }));

  return (
    <DashboardClient
      userName={session.user.name}
      isPro={isPro}
      selectedRange={selectedRange}
      paidRevenue={paidRevenue}
      pendingRevenue={pendingRevenue}
      totalVolume={totalVolume}
      invoiceCount={invoiceCount}
      used={used}
      limit={limit}
      totalCustomers={totalCustomers}
      recentInvoices={serializedInvoices}
      announcement={announcement}
      analytics={analytics}
    />
  );
}
