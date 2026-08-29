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

  const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "notaku.store";

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
        domainData={{
          plan: (user.plan as "FREE" | "PRO") || "FREE",
          customDomain: user.customDomain,
          customDomainVerified: user.customDomainVerified,
          customDomainTxt: user.customDomainTxt,
          subdomainSlug: user.subdomainSlug,
          cnameTarget: process.env.NEXT_PUBLIC_CNAME_TARGET || "cname.notaku.store",
          subdomainUrl: user.subdomainSlug ? `https://${user.subdomainSlug}.${baseDomain}` : null,
          customDomainUrl:
            user.customDomain && user.customDomainVerified ? `https://${user.customDomain}` : null,
        }}
      />
    </div>
  );
}
