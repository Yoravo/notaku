import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_REQUESTS = 60;

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const current = await redis.get<number>(key);

  if (current === null) {
    await redis.setex(key, 60, 1);
    return true;
  }

  if (current >= MAX_REQUESTS) {
    return false;
  }

  await redis.incr(key);
  return true;
}
