import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice, canCreateCustomer } from "@/lib/plan-limits";
import { BillingClient } from "./billing-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket & Kuota — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const [user, invoiceQuota, customerQuota] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    }),
    canCreateInvoice(session.user.id),
    canCreateCustomer(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BillingClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          subscription: user.subscription
            ? {
                currentPeriodEnd: user.subscription.currentPeriodEnd,
                status: user.subscription.status,
              }
            : null,
        }}
        invoiceUsage={{
          used: invoiceQuota.used,
          limit: invoiceQuota.limit,
        }}
        customerUsage={{
          used: customerQuota.used,
          limit: customerQuota.limit,
        }}
      />
    </div>
  );
}
