import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerList } from "@/components/customers/customer-list";

export default async function CustomerPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;

  const customers = await prisma.customer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      { searchParams?.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {searchParams.error}
        </div>
      )}
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
