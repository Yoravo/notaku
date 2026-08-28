import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import { NewInvoiceClient } from "./new-invoice-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Invoice Baru — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function NewInvoicePage(props: {
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
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
      },
    }),
  ]);

  const { allowed, used, limit } = await canCreateInvoice(session.user.id);

  return (
    <NewInvoiceClient
      customers={customers}
      initialCustomerId={initialCustomerId}
      userBankName={user?.bankName}
      userBankAccountNumber={user?.bankAccountNumber}
      userBankAccountName={user?.bankAccountName}
      allowed={allowed}
      used={used}
      limit={limit}
    />
  );
}
