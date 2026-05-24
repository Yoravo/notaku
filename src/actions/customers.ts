"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export async function createCustomer(formData: FormData) {
  const user = await getUser();

  await prisma.customer.create({
    data: {
      userId: user.id,
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
    },
  });

  revalidatePath("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const user = await getUser();

  await prisma.customer.update({
    where: { id, userId: user.id },
    data: {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
    },
  });

  revalidatePath("/customers");
}

export async function deleteCustomer(id: string) {
  const user = await getUser();

  await prisma.customer.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/customers");
}
