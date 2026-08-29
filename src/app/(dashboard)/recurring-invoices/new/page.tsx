import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewRecurringInvoiceClient } from "./new-recurring-invoice-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Tagihan Berulang Baru — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function NewRecurringInvoicePage(props: {
  searchParams?: Promise<{ customerId?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const initialCustomerId = searchParams?.customerId;

  const [customers, user] = await Promise.all([
    prisma.customer.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
      },
    }),
  ]);

  const isPro = user?.plan === "PRO";

  return (
    <NewRecurringInvoiceClient
      customers={customers}
      initialCustomerId={initialCustomerId}
      isPro={isPro}
      userBankName={user?.bankName}
      userBankAccountNumber={user?.bankAccountNumber}
      userBankAccountName={user?.bankAccountName}
    />
  );
}
