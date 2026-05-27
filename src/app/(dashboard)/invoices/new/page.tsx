import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan-limits";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { UpgradeButton } from "@/components/upgrade-button";

export default async function NewInvoicePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const { allowed, used, limit } = await canCreateInvoice(session.user.id);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Buat Invoice</h1>

      {!allowed ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">
            Batas invoice gratis tercapai
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Kamu sudah membuat {used}/{limit} invoice bulan ini. Upgrade ke Pro
            untuk invoice unlimited.
          </p>
          <UpgradeButton
            className="mt-3 inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white
  cursor-pointer hover:bg-amber-700 transition-colors"
          />
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-500">
            {used}/{limit} invoice bulan ini
          </p>
          <div className="mt-6">
            <InvoiceForm customers={customers} />
          </div>
        </>
      )}
    </div>
  );
}
