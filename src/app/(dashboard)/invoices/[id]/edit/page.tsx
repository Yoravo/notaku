import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  if (!invoice) notFound();

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Edit Invoice</h1>
      <div className="mt-6">
        <InvoiceForm
          customers={customers}
          invoice={{
            id: invoice.id,
            customerId: invoice.customerId,
            dueDate: invoice.dueDate,
            notes: invoice.notes,
            items: invoice.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              price: Number(i.price),
            })),
          }}
        />
      </div>
    </div>
  );
}
