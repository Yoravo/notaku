"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { customerSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit-log";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function createCustomer(formData: FormData) {
  const user = await getUser();

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  await prisma.customer.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    },
  });

  auditLog("customer.created", { customerName: parsed.data.name }, { userId: user.id });

  revalidatePath("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const user = await getUser();

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  // Verify ownership
  const existing = await prisma.customer.findUnique({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Pelanggan tidak ditemukan");
  }

  await prisma.customer.update({
    where: { id, userId: user.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    },
  });

  auditLog("customer.updated", { customerId: id }, { userId: user.id });

  revalidatePath("/customers");
}

export async function deleteCustomer(id: string) {
  const user = await getUser();

  await prisma.customer.delete({
    where: { id, userId: user.id },
  });

  auditLog("customer.deleted", { customerId: id }, { userId: user.id });

  revalidatePath("/customers");
}
