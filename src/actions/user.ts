"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkServerActionRateLimit } from "@/lib/rate-limit";

// Hanya izinkan data URI gambar (png/jpeg/jpg/webp/gif) atau URL https demi keamanan (cegah javascript:/data:text/html)
const safeImageSrc = z
  .string()
  .max(3000000)
  .refine(
    (val) =>
      val === "" ||
      /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(val) ||
      /^https:\/\//i.test(val),
    "Format gambar tidak valid. Gunakan file gambar (PNG/JPG/WebP) atau tautan HTTPS."
  )
  .nullable()
  .optional();

const profileSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong").max(100),
  businessName: z.string().max(100).nullable(),
  phone: z.string().max(20).nullable(),
  address: z.string().max(300).nullable(),
  logoUrl: safeImageSrc,
  signatureUrl: safeImageSrc,
  stampUrl: safeImageSrc,
});

export async function updateProfile(data: {
  name: string;
  businessName: string | null;
  phone: string | null;
  address: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await checkServerActionRateLimit(session.user.id, "write");

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      businessName: parsed.data.businessName || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      logoUrl: parsed.data.logoUrl || null,
      signatureUrl: parsed.data.signatureUrl || null,
      stampUrl: parsed.data.stampUrl || null,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateNewsletterPreference(receiveNewsletter: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await checkServerActionRateLimit(session.user.id, "write");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { receiveNewsletter },
  });

  revalidatePath("/settings");
  return { success: true };
}
