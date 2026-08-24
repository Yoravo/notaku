import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentVerifier } from "@/components/payment-verifier";
import { SettingsTabsClient } from "./settings-tabs-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PaymentVerifier />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-display">
          Pengaturan Akun & Profil
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola profil bisnis, logo invoice, preferensi template, keamanan kata sandi, dan paket langganan.
        </p>
      </div>

      <SettingsTabsClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          phone: user.phone,
          address: user.address,
          logoUrl: user.logoUrl,
          plan: user.plan,
          invoiceTemplate: user.invoiceTemplate,
          subscription: user.subscription
            ? {
                currentPeriodEnd: user.subscription.currentPeriodEnd,
                status: user.subscription.status,
              }
            : null,
        }}
      />
    </div>
  );
}
