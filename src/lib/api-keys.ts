import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export function generateApiKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  // Key format: ntk_live_<32 random hex characters>
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const rawKey = `ntk_live_${randomBytes}`;
  const keyPrefix = `${rawKey.slice(0, 12)}...`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  return { rawKey, keyPrefix, keyHash };
}

export function generateWebhookSecret(): string {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  return `whsec_${randomBytes}`;
}

export async function validateApiKey(rawKey: string) {
  if (!rawKey || !rawKey.startsWith("ntk_live_")) {
    return null;
  }

  const keyHash = crypto.createHash("sha256").update(rawKey.trim()).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          businessName: true,
          plan: true,
        },
      },
    },
  });

  if (!apiKey || !apiKey.isActive) {
    return null;
  }

  // Update lastUsedAt asynchronously in background
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => console.error("Failed to update apiKey lastUsedAt:", err));

  return apiKey;
}
