"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { expenseSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit-log";
import { checkServerActionRateLimit } from "@/lib/rate-limit";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function createExpense(formData: FormData) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = expenseSchema.safeParse({
    title: formData.get("title"),
    amount: Number(formData.get("amount") || 0),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Set time ke tengah hari waktu lokal (menghindari timezone bug tanggal bergeser)
  const expenseDate = new Date(`${parsed.data.date}T12:00:00+07:00`);

  await prisma.expense.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: expenseDate,
      notes: parsed.data.notes || null,
    },
  });

  auditLog(
    "expense.created",
    { expenseTitle: parsed.data.title, amount: parsed.data.amount },
    { userId: user.id }
  );

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = expenseSchema.safeParse({
    title: formData.get("title"),
    amount: Number(formData.get("amount") || 0),
    category: formData.get("category"),
    date: formData.get("date"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const existing = await prisma.expense.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) throw new Error("Data pengeluaran tidak ditemukan");

  const expenseDate = new Date(`${parsed.data.date}T12:00:00+07:00`);

  await prisma.expense.update({
    where: { id: existing.id },
    data: {
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: expenseDate,
      notes: parsed.data.notes || null,
    },
  });

  auditLog(
    "expense.updated",
    { expenseId: existing.id, expenseTitle: parsed.data.title },
    { userId: user.id }
  );

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "destructive");

  const existing = await prisma.expense.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) throw new Error("Data pengeluaran tidak ditemukan");

  await prisma.expense.delete({
    where: { id: existing.id },
  });

  auditLog(
    "expense.deleted",
    { expenseId: existing.id, title: existing.title },
    { userId: user.id }
  );

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
