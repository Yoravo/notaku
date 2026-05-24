import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerList } from "@/app/components/customers/customer-list";

export default async function CustomerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pelanggan</h1>
          <p className="mt-1 text-sm text-gray-500">
            {customers.length} pelanggan terdaftar
          </p>
        </div>
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}
