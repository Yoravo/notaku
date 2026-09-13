import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { NextIntlClientProvider } from "next-intl";
import idMessages from "@/messages/id.json";
import enMessages from "@/messages/en.json";
import { PortalClient } from "./portal-client";

/**
 * Deduplicated customer portal data query wrapped with React cache()
 * Guarantees generateMetadata() and CustomerPortalPage() execute exactly one DB query per request.
 */
const getPortalCustomer = cache(async (id: string) => {
  return await prisma.customer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          businessName: true,
          email: true,
          phone: true,
          logoUrl: true,
          plan: true,
        },
      },
      invoices: {
        where: {
          // Jangan tampilkan DRAFT internal penjual ke portal publik klien
          status: {
            in: ["SENT", "PAID", "OVERDUE", "CANCELLED"],
          },
        },
        orderBy: {
          createdAt: "desc", // Transaksi terbaru di index [0]
        },
        select: {
          id: true,
          publicId: true,
          number: true,
          status: true,
          dueDate: true,
          createdAt: true,
          paidAt: true,
          total: true,
          currency: true,
        },
      },
    },
  });
});

/**
 * Strict Portal Locale Resolver:
 * 1. Field eksplisit (customer.locale) jika ada
 * 2. Heuristik transaksi terbaru (customer.invoices[0].currency)
 * 3. Fallback default: "id"
 */
function resolvePortalLocale(customer: Awaited<ReturnType<typeof getPortalCustomer>>): "id" | "en" {
  if (!customer) return "id";
  const explicitLocale = (customer as any).locale;
  if (explicitLocale === "id" || explicitLocale === "en") return explicitLocale;

  const latestCurrency = customer.invoices[0]?.currency || "IDR";
  return latestCurrency !== "IDR" ? "en" : "id";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = await getPortalCustomer(id);

  if (!customer) {
    return {
      title: "Portal Tagihan Klien — NotaKu",
    };
  }

  const portalLocale = resolvePortalLocale(customer);
  const sellerName = customer.user.businessName || customer.user.name;

  const title =
    portalLocale === "en"
      ? `Client Billing Portal for ${customer.name} — ${sellerName}`
      : `Portal Tagihan ${customer.name} — ${sellerName}`;

  const description =
    portalLocale === "en"
      ? `Billing history, invoice payment status, and official receipts for ${customer.name} from ${sellerName}.`
      : `Riwayat seluruh faktur invoice, status pembayaran, dan kuitansi resmi ${customer.name} dari ${sellerName}.`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: portalLocale === "en" ? "en_US" : "id_ID",
      siteName: "NotaKu",
    },
  };
}

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getPortalCustomer(id);

  if (!customer) {
    notFound();
  }

  const portalLocale = resolvePortalLocale(customer);
  const messages = portalLocale === "en" ? enMessages : idMessages;

  const mappedInvoices = customer.invoices.map((inv) => ({
    id: inv.id,
    publicId: inv.publicId,
    number: inv.number,
    status: inv.status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED",
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
    total: Number(inv.total),
    currency: (inv as any).currency || "IDR",
  }));

  return (
    <NextIntlClientProvider locale={portalLocale} messages={messages}>
      <PortalClient
        customer={{
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        }}
        seller={{
          name: customer.user.name,
          businessName: customer.user.businessName,
          email: customer.user.email,
          phone: customer.user.phone,
          logoUrl: customer.user.logoUrl,
          plan: customer.user.plan,
        }}
        invoices={mappedInvoices}
      />
    </NextIntlClientProvider>
  );
}
