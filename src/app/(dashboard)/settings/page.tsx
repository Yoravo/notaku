import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsTabsClient } from "./settings-tabs-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Akun & Bisnis — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SettingsTabsClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          phone: user.phone,
          address: user.address,
          logoUrl: user.logoUrl,
          signatureUrl: user.signatureUrl,
          stampUrl: user.stampUrl,
          bankName: user.bankName,
          bankAccountNumber: user.bankAccountNumber,
          bankAccountName: user.bankAccountName,
          bankAccountLocked: user.bankAccountLocked,
          plan: user.plan,
          invoiceTemplate: user.invoiceTemplate,
        }}
      />
    </div>
  );
}
