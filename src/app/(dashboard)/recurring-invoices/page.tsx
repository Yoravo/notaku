import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRecurringInvoices } from "@/actions/recurring-invoices";
import { RecurringInvoicesClient } from "./recurring-invoices-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tagihan Berulang (Recurring) — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function RecurringInvoicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const isPro = user?.plan === "PRO";
  const recurringList = isPro ? await getRecurringInvoices() : [];

  return (
    <RecurringInvoicesClient
      recurringList={recurringList}
      isPro={isPro}
    />
  );
}
