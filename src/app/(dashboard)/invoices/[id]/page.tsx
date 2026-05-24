import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true, customer: true },
  });

  if (!invoice) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">
        Invoice #{invoice.number || "Draft"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Untuk: {invoice.customer.name}
      </p>
      <p className="mt-2 text-lg font-semibold text-gray-900">
        Rp{Number(invoice.total).toLocaleString("id-ID")}
      </p>
    </div>
  );
}
