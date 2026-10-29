import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice, hasBusinessFeatures, hasProFeatures } from "@/lib/plan-limits";
import { DashboardClient } from "./dashboard-client";
import { SerializedInvoice } from "@/types/invoice";
import { getActiveAnnouncement } from "@/actions/admin";
import { getAdvancedAnalytics, getMonthlyCashflow } from "@/lib/analytics";
import { resolveEffectivePlan } from "@/lib/effective-plan";
import { getWibRange, groupInvoiceMetrics, normalizeDashboardRange } from "@/lib/dashboard-metrics";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const { range } = await searchParams;
  const selectedRange = normalizeDashboardRange(range);
  const dateRange = getWibRange(selectedRange);
  const createdAt = Object.keys(dateRange).length ? dateRange : undefined;

  const [user, invoices, totalCustomers, recentInvoices, announcement] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        businessName: true,
        bankName: true,
        bankAccountNumber: true,
        subscription: {
          select: { status: true, plan: true, currentPeriodEnd: true },
        },
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId,
        ...(createdAt ? { createdAt } : {}),
      },
      select: {
        currency: true,
        total: true,
        status: true,
      },
    }),
    prisma.customer.count({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getActiveAnnouncement("DASHBOARD"),
  ]);

  const effectivePlan = resolveEffectivePlan(user);
  const isPro = hasProFeatures(effectivePlan);
  const isBusiness = hasBusinessFeatures(effectivePlan);

  const [quota, expenses, cashflow, analytics] = await Promise.all([
    canCreateInvoice(userId),
    isPro
      ? prisma.expense.aggregate({
          where: {
            userId,
            ...(createdAt ? { date: createdAt } : {}),
          },
          _sum: { amount: true },
        })
      : Promise.resolve(null),
    getMonthlyCashflow(userId),
    isBusiness ? getAdvancedAnalytics(userId) : Promise.resolve(null),
  ]);

  const currencyMetrics = groupInvoiceMetrics(
    invoices.map((inv) => ({
      currency: inv.currency,
      total: Number(inv.total),
      status: inv.status,
    }))
  );
  const idrMetric = currencyMetrics.find((m) => m.currency === "IDR");
  const totalExpenses = Number(expenses?._sum.amount || 0);
  const netProfit = (idrMetric?.paidRevenue || 0) - totalExpenses;

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
    currency: inv.currency,
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
      isBusiness={isBusiness}
      userPlan={effectivePlan}
      selectedRange={selectedRange}
      currencyMetrics={currencyMetrics}
      totalExpenses={totalExpenses}
      netProfit={netProfit}
      used={quota.used}
      limit={quota.limit}
      totalCustomers={totalCustomers}
      recentInvoices={serializedInvoices}
      announcement={announcement}
      cashflow={cashflow}
      analytics={analytics}
      userId={userId}
      hasBusinessName={Boolean(user?.businessName?.trim())}
      hasBankAccount={Boolean(user?.bankName?.trim() && user?.bankAccountNumber?.trim())}
      hasInvoices={recentInvoices.length > 0}
    />
  );
}
