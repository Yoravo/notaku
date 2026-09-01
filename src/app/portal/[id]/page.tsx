import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortalClient } from "./portal-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          businessName: true,
          name: true,
        },
      },
    },
  });

  if (!customer) {
    return {
      title: "Portal Tagihan Klien — NotaKu",
    };
  }

  const sellerName = customer.user.businessName || customer.user.name;
  const title = `Portal Tagihan ${customer.name} — ${sellerName}`;
  const description = `Riwayat seluruh faktur invoice, status pembayaran, dan kuitansi resmi ${customer.name} dari ${sellerName}.`;

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
      locale: "id_ID",
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

  const customer = await prisma.customer.findUnique({
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
          createdAt: "desc",
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

  if (!customer) {
    notFound();
  }

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
  );
}
