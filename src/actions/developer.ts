"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkServerActionRateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";
import { generateApiKey, generateWebhookSecret } from "@/lib/api-keys";
import { z } from "zod";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}

export type ApiKeyData = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type WebhookEndpointData = {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  description: string | null;
  createdAt: string;
  lastLogs?: {
    id: string;
    event: string;
    statusCode: number | null;
    success: boolean;
    durationMs: number | null;
    createdAt: string;
  }[];
};

export async function getDeveloperSettings(): Promise<{
  isPro: boolean;
  apiKeys: ApiKeyData[];
  webhooks: WebhookEndpointData[];
}> {
  const user = await getUser();

  const [dbUser, apiKeys, webhooks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    }),
    prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.webhookEndpoint.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            event: true,
            statusCode: true,
            success: true,
            durationMs: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  const isPro = dbUser?.plan === "PRO";

  return {
    isPro,
    apiKeys: apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
      isActive: k.isActive,
      createdAt: k.createdAt.toISOString(),
    })),
    webhooks: webhooks.map((w) => ({
      id: w.id,
      url: w.url,
      secret: w.secret,
      events: w.events,
      isActive: w.isActive,
      description: w.description,
      createdAt: w.createdAt.toISOString(),
      lastLogs: w.logs.map((l) => ({
        id: l.id,
        event: l.event,
        statusCode: l.statusCode,
        success: l.success,
        durationMs: l.durationMs,
        createdAt: l.createdAt.toISOString(),
      })),
    })),
  };
}

export async function createApiKeyAction(data: { name: string }): Promise<{
  success: boolean;
  rawKey?: string;
  error?: string;
}> {
  try {
    const user = await getUser();
    await checkServerActionRateLimit(user.id, "write");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });

    if (dbUser?.plan !== "PRO") {
      throw new Error("Fitur Developer API Keys hanya tersedia untuk paket NotaKu PRO.");
    }

    const name = data.name.trim();
    if (!name || name.length > 50) {
      throw new Error("Nama API Key harus diisi (maksimal 50 karakter)");
    }

    const count = await prisma.apiKey.count({ where: { userId: user.id } });
    if (count >= 10) {
      throw new Error("Batas maksimal 10 API Key telah tercapai.");
    }

    const { rawKey, keyPrefix, keyHash } = generateApiKey();

    await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        keyPrefix,
        keyHash,
      },
    });

    auditLog("developer.api_key_created", { name, keyPrefix }, { userId: user.id });
    revalidatePath("/settings");

    return { success: true, rawKey };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal membuat API Key" };
  }
}

export async function deleteApiKeyAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    await checkServerActionRateLimit(user.id, "destructive");

    const key = await prisma.apiKey.findUnique({
      where: { id, userId: user.id },
    });

    if (!key) throw new Error("API Key tidak ditemukan");

    await prisma.apiKey.delete({ where: { id } });

    auditLog("developer.api_key_deleted", { id, name: key.name }, { userId: user.id });
    revalidatePath("/settings");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghapus API Key" };
  }
}

const webhookSchema = z.object({
  url: z.string().url("Format URL webhook tidak valid").startsWith("https://", "URL Webhook harus menggunakan protokol aman HTTPS"),
  description: z.string().max(100).optional(),
  events: z.array(z.string()).min(1, "Pilih minimal 1 event untuk disubscribe"),
});

export async function createWebhookAction(data: {
  url: string;
  description?: string;
  events: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    await checkServerActionRateLimit(user.id, "write");

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });

    if (dbUser?.plan !== "PRO") {
      throw new Error("Fitur Webhook Endpoints hanya tersedia untuk paket NotaKu PRO.");
    }

    const parsed = webhookSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0].message);
    }

    const count = await prisma.webhookEndpoint.count({ where: { userId: user.id } });
    if (count >= 5) {
      throw new Error("Batas maksimal 5 Webhook Endpoint telah tercapai.");
    }

    const secret = generateWebhookSecret();

    await prisma.webhookEndpoint.create({
      data: {
        userId: user.id,
        url: parsed.data.url,
        description: parsed.data.description || null,
        events: parsed.data.events,
        secret,
      },
    });

    auditLog("developer.webhook_created", { url: parsed.data.url, events: parsed.data.events }, { userId: user.id });
    revalidatePath("/settings");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal mendaftarkan webhook" };
  }
}

export async function deleteWebhookAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    await checkServerActionRateLimit(user.id, "destructive");

    const endpoint = await prisma.webhookEndpoint.findUnique({
      where: { id, userId: user.id },
    });

    if (!endpoint) throw new Error("Webhook endpoint tidak ditemukan");

    await prisma.webhookEndpoint.delete({ where: { id } });

    auditLog("developer.webhook_deleted", { id, url: endpoint.url }, { userId: user.id });
    revalidatePath("/settings");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal menghapus webhook" };
  }
}
