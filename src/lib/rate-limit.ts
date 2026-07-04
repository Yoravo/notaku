import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  identifier: string,
  max: number = 60,
  windowSeconds: number = 60,
): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= max;
}

export async function checkServerActionRateLimit(
  userId: string,
  category: "write" | "destructive",
): Promise<void> {
  const limits = {
    write: { max: 30, window: 60 },
    destructive: { max: 10, window: 60 },
  };
  const { max, window } = limits[category];

  const [globalOk, categoryOk] = await Promise.all([
    checkRateLimit(`action:global:${userId}`, 60, 60),
    checkRateLimit(`action:${category}:${userId}`, max, window),
  ]);

  if (!globalOk || !categoryOk) {
    throw new Error("Terlalu banyak permintaan. Coba lagi nanti.");
  }
}
