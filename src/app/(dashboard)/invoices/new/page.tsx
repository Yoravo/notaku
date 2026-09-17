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
  searchParams?: Promise<{ customerId?: string; cloneFrom?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const initialCustomerId = searchParams?.customerId;
  const cloneFromId = searchParams?.cloneFrom;

  const [customers, catalogItems, user, cloneSource] = await Promise.all([
    prisma.customer.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.item.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true, price: true, unit: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
      },
    }),
    cloneFromId
      ? prisma.invoice.findUnique({
          where: { id: cloneFromId, userId: session.user.id },
          include: { items: true },
        })
      : null,
  ]);

  const initialInvoiceData = cloneSource
    ? {
        id: "",
        customerId: cloneSource.customerId,
        dueDate: null,
        notes: cloneSource.notes,
        discountType: cloneSource.discountType,
        discountValue: Number(cloneSource.discountValue),
        taxRate: Number(cloneSource.taxRate),
        currency: (cloneSource as any).currency || "IDR",
        enableDirectTransfer: cloneSource.enableDirectTransfer,
        enableDigitalPayment: cloneSource.enableDigitalPayment,
        enableReminder: cloneSource.enableReminder,
        items: cloneSource.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          price: Number(it.price),
        })),
      }
    : undefined;

  const { allowed, used, limit } = await canCreateInvoice(session.user.id);

  const serializedCatalogItems = catalogItems.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    price: Number(c.price),
    unit: c.unit,
  }));

  return (
    <NewInvoiceClient
      customers={customers}
      catalogItems={serializedCatalogItems}
      initialCustomerId={initialCustomerId || cloneSource?.customerId}
      initialInvoiceData={initialInvoiceData}
      isCloning={Boolean(cloneSource)}
      userBankName={user?.bankName}
      userBankAccountNumber={user?.bankAccountNumber}
      userBankAccountName={user?.bankAccountName}
      allowed={allowed}
      used={used}
      limit={limit}
    />
  );
}
