"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { catalogItemSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit-log";
import { checkServerActionRateLimit } from "@/lib/rate-limit";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function createItem(formData: FormData) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = catalogItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: Number(formData.get("price") || 0),
    unit: formData.get("unit") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Cek batas maksimal item gratis jika diperlukan, sementara kita asumsikan 100 batas general atau unlimited
  const count = await prisma.item.count({ where: { userId: user.id } });
  if (count >= 1000) {
    throw new Error("Kapasitas maksimum katalog (1000 item) tercapai.");
  }

  await prisma.item.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      unit: parsed.data.unit || null,
    },
  });

  auditLog(
    "item.created",
    { itemName: parsed.data.name },
    { userId: user.id }
  );

  revalidatePath("/items");
  revalidatePath("/invoices/new");
}

export async function updateItem(id: string, formData: FormData) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const parsed = catalogItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    price: Number(formData.get("price") || 0),
    unit: formData.get("unit") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const existing = await prisma.item.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) throw new Error("Item tidak ditemukan");

  await prisma.item.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      unit: parsed.data.unit || null,
    },
  });

  auditLog(
    "item.updated",
    { itemId: existing.id, itemName: parsed.data.name },
    { userId: user.id }
  );

  revalidatePath("/items");
  revalidatePath("/invoices/new");
}

export async function deleteItem(id: string) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "destructive");

  const existing = await prisma.item.findUnique({
    where: { id, userId: user.id },
  });
  if (!existing) throw new Error("Item tidak ditemukan");

  await prisma.item.delete({
    where: { id: existing.id },
  });

  auditLog("item.deleted", { itemId: existing.id, itemName: existing.name }, { userId: user.id });

  revalidatePath("/items");
  revalidatePath("/invoices/new");
}
