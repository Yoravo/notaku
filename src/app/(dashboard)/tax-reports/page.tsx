import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTaxReportsData } from "@/actions/tax-reports";
import { TaxReportsClient } from "./tax-reports-client";
import { SupportedCurrency } from "@/lib/currencies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rekap Laporan Pajak & Omset — NotaKu",
};

export const dynamic = "force-dynamic";

export default async function TaxReportsPage(props: {
  searchParams?: Promise<{ year?: string; currency?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = searchParams?.year ? parseInt(searchParams.year, 10) || currentYear : currentYear;
  const currency = (searchParams?.currency || "IDR") as SupportedCurrency;

  const reportData = await getTaxReportsData(year, currency);

  return <TaxReportsClient initialData={reportData} />;
}
