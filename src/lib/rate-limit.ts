type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000; // 1 menit
const MAX_REQUESTS = 60;

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}
