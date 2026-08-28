import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./customers-client";

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
    <CustomersClient
      customers={customers}
      errorMessage={searchParams?.error}
    />
  );
}
