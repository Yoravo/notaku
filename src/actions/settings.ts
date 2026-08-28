"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { InvoiceTemplate } from "@/generated/prisma/client";
import { checkServerActionRateLimit } from "@/lib/rate-limit";

import { auditLog } from "@/lib/audit-log";
import { bankAccountSchema } from "@/lib/validations";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function updateBankAccount(data: {
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const validated = bankAccountSchema.parse(data);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bankAccountLocked: true, email: true },
  });

  if (dbUser?.bankAccountLocked) {
    throw new Error(
      "Data rekening sudah terkunci demi keamanan. Hubungi bantuan untuk mengubah rekening penarikan."
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bankName: validated.bankName,
      bankAccountNumber: validated.bankAccountNumber.trim(),
      bankAccountName: validated.bankAccountName.trim().toUpperCase(),
      bankAccountLocked: true, // Kunci rekening setelah disimpan
    },
  });

  auditLog("user.bank_account_locked", {
    userId: user.id,
    bankName: validated.bankName,
    accountNumber: validated.bankAccountNumber,
    accountName: validated.bankAccountName,
  });

  revalidatePath("/settings");
  return { success: true };
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
