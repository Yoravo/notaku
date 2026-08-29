import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getReferralStats } from "@/actions/referrals";
import { ReferralsClient } from "./referrals-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program Referral & Afiliasi — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const stats = await getReferralStats();

  if (!stats) {
    redirect("/login");
  }

  return <ReferralsClient initialStats={stats} />;
}
