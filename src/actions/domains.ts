"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkServerActionRateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";
import {
  sanitizeDomain,
  generateDomainVerificationToken,
  verifyDomainDns,
  CNAME_TARGET,
  type DnsCheckResult,
} from "@/lib/domain-verification";
import { customDomainSchema } from "@/lib/validations";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export interface CustomDomainData {
  plan: "FREE" | "PRO";
  customDomain: string | null;
  customDomainVerified: boolean;
  customDomainTxt: string | null;
  subdomainSlug: string | null;
  cnameTarget: string;
  subdomainUrl: string | null;
  customDomainUrl: string | null;
}

/**
 * Mengambil pengaturan domain dan status verifikasi user
 */
export async function getCustomDomainSettings(): Promise<CustomDomainData> {
  const sessionUser = await getUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      plan: true,
      customDomain: true,
      customDomainVerified: true,
      customDomainTxt: true,
      subdomainSlug: true,
    },
  });

  const isPro = user?.plan === "PRO";
  const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "notaku.store";

  return {
    plan: (user?.plan as "FREE" | "PRO") || "FREE",
    customDomain: user?.customDomain || null,
    customDomainVerified: Boolean(user?.customDomainVerified),
    customDomainTxt: user?.customDomainTxt || null,
    subdomainSlug: user?.subdomainSlug || null,
    cnameTarget: CNAME_TARGET,
    subdomainUrl: user?.subdomainSlug ? `https://${user.subdomainSlug}.${baseDomain}` : null,
    customDomainUrl:
      user?.customDomain && user.customDomainVerified ? `https://${user.customDomain}` : null,
  };
}

/**
 * Simpan konfigurasi subdomain bawaan atau custom domain
 */
export async function saveDomainSettings(data: {
  subdomainSlug?: string;
  customDomain?: string;
}) {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const validated = customDomainSchema.parse(data);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, customDomain: true, customDomainTxt: true, subdomainSlug: true },
  });

  if (dbUser?.plan !== "PRO") {
    throw new Error("Fitur Custom Domain dan Subdomain White-Label eksklusif untuk pelanggan NotaKu PRO.");
  }

  const cleanSubdomain = validated.subdomainSlug ? validated.subdomainSlug.trim().toLowerCase() : null;
  const rawDomain = validated.customDomain ? sanitizeDomain(validated.customDomain) : null;

  // 1. Validasi keunikan subdomain jika diisi
  if (cleanSubdomain && cleanSubdomain !== dbUser?.subdomainSlug) {
    // Blokir reserved subdomains
    const reserved = ["www", "app", "api", "admin", "mail", "cdn", "cname", "static", "dashboard"];
    if (reserved.includes(cleanSubdomain)) {
      throw new Error(`Subdomain '${cleanSubdomain}' tidak dapat digunakan.`);
    }

    const existingSub = await prisma.user.findUnique({
      where: { subdomainSlug: cleanSubdomain },
      select: { id: true },
    });
    if (existingSub && existingSub.id !== user.id) {
      throw new Error("Subdomain ini sudah digunakan oleh akun lain.");
    }
  }

  // 2. Validasi keunikan custom domain jika diisi
  let isDomainChanged = false;
  let newTxtToken = dbUser?.customDomainTxt;

  if (rawDomain && rawDomain !== dbUser?.customDomain) {
    isDomainChanged = true;
    const existingDomain = await prisma.user.findUnique({
      where: { customDomain: rawDomain },
      select: { id: true },
    });
    if (existingDomain && existingDomain.id !== user.id) {
      throw new Error("Custom domain ini sudah dihubungkan ke akun lain.");
    }

    newTxtToken = generateDomainVerificationToken(user.id);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subdomainSlug: cleanSubdomain,
      customDomain: rawDomain,
      customDomainTxt: newTxtToken,
      // Jika domain berubah, reset status verifikasi ke false
      customDomainVerified: isDomainChanged ? false : undefined,
    },
  });

  auditLog("user.domain_settings_updated", {
    userId: user.id,
    subdomainSlug: cleanSubdomain,
    customDomain: rawDomain,
  });

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Pemicu verifikasi DNS custom domain secara real-time
 */
export async function verifyCustomDomain(): Promise<DnsCheckResult> {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      customDomain: true,
      customDomainTxt: true,
      customDomainVerified: true,
    },
  });

  if (dbUser?.plan !== "PRO") {
    throw new Error("Fitur ini hanya untuk pengguna NotaKu PRO.");
  }

  if (!dbUser?.customDomain) {
    throw new Error("Belum ada custom domain yang dikonfigurasi.");
  }

  const dnsResult = await verifyDomainDns(dbUser.customDomain, dbUser.customDomainTxt);

  if (dnsResult.verified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { customDomainVerified: true },
    });

    auditLog("user.custom_domain_verified", {
      userId: user.id,
      domain: dbUser.customDomain,
      cnameMatched: dnsResult.cnameMatched,
      txtMatched: dnsResult.txtMatched,
    });

    revalidatePath("/settings");
  }

  return dnsResult;
}

/**
 * Hapus konfigurasi custom domain
 */
export async function removeCustomDomain() {
  const user = await getUser();
  await checkServerActionRateLimit(user.id, "write");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      customDomain: null,
      customDomainVerified: false,
      customDomainTxt: null,
    },
  });

  auditLog("user.custom_domain_removed", { userId: user.id });

  revalidatePath("/settings");
  return { success: true };
}
