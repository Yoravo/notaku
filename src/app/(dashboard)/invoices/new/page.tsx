import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/app/components/invoices/invoice-form";

export default async function NewInvoicePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Buat Invoice</h1>
      <div className="mt-6">
        <InvoiceForm customers={customers} />
      </div>
    </div>
  );
}
