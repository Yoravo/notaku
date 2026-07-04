"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { InvoiceTemplate } from "@/generated/prisma/client";
import { checkServerActionRateLimit } from "@/lib/rate-limit";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function updateInvoiceTemplate(template: InvoiceTemplate) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  // Verify user is Pro
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });
  if (dbUser?.plan !== "PRO") {
    throw new Error("Fitur ini hanya untuk pengguna Pro");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { invoiceTemplate: template },
  });

  revalidatePath("/settings");
}
