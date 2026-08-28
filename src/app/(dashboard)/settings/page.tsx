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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Pengaturan Akun & Bisnis
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola profil usaha, logo & tanda tangan faktur, rekening pembayaran, preferensi template PDF, dan keamanan akun.
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
