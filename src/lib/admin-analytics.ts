import { z } from "zod";

export interface CurrencyTotal {
  currency: string;
  total: number;
}

interface ReferrerOptions {
  canonicalUrl?: string | null;
}

interface TrafficRecord {
  createdAt: Date;
  ipAddress: string | null;
}

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const trustedHosts = new Set(["notaku.store", "www.notaku.store", "accounts.google.com"]);

const trafficPayloadSchema = z
  .object({
    path: z
      .string()
      .min(1)
      .max(255)
      .regex(/^\/(?!\/)[^?#\u0000-\u001f\\]*$/),
    referrer: z.string().max(2_048).optional().nullable(),
    utm_source: z.string().trim().min(1).max(100).optional(),
    utm_medium: z.string().trim().min(1).max(100).optional(),
    utm_campaign: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export function aggregateMoneyByCurrency(
  rows: Array<{ currency: string; total: number }>,
): CurrencyTotal[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const currency = row.currency.toUpperCase();
    totals.set(currency, (totals.get(currency) ?? 0) + row.total);
  }
  return Array.from(totals, ([currency, total]) => ({ currency, total })).sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

function jakartaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function utcFromJakartaParts(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day) - JAKARTA_OFFSET_MS);
}

export function getJakartaMonthBounds(now: Date) {
  const [year, month] = jakartaDateKey(now).split("-").map(Number);
  const currentStart = utcFromJakartaParts(year, month - 1, 1);
  const previousStart = utcFromJakartaParts(year, month - 2, 1);
  return {
    currentStart,
    previousStart,
    previousEnd: new Date(currentStart.getTime() - 1),
  };
}

export function buildJakartaDailyTraffic(records: TrafficRecord[], now: Date, days: number) {
  const todayKey = jakartaDateKey(now);
  const [year, month, day] = todayKey.split("-").map(Number);
  const buckets = new Map<string, { views: number; ips: Set<string> }>();

  for (const record of records) {
    const key = jakartaDateKey(record.createdAt);
    const bucket = buckets.get(key) ?? { views: 0, ips: new Set<string>() };
    bucket.views += 1;
    if (record.ipAddress) bucket.ips.add(record.ipAddress);
    buckets.set(key, bucket);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (days - 1 - index), 12));
    const dateKey = date.toISOString().slice(0, 10);
    const bucket = buckets.get(dateKey);
    return {
      dateKey,
      label: new Intl.DateTimeFormat("id-ID", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
      }).format(date),
      views: bucket?.views ?? 0,
      uniques: bucket?.ips.size ?? 0,
    };
  });
}

export function normalizeAcquisitionReferrer(
  value: string | null | undefined,
  { canonicalUrl }: ReferrerOptions = {},
): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const canonicalHost = canonicalUrl ? new URL(canonicalUrl).hostname.toLowerCase().replace(/\.$/, "") : null;
    if (trustedHosts.has(hostname) || hostname.endsWith(".notaku.store") || hostname === canonicalHost) return null;
    return `${url.protocol}//${url.host.toLowerCase()}`;
  } catch {
    return null;
  }
}

export function aggregateAcquisitionReferrers(
  rows: Array<{ referrer: string | null; count: number }>,
  options: ReferrerOptions = {},
) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const origin = normalizeAcquisitionReferrer(row.referrer, options);
    if (origin) totals.set(origin, (totals.get(origin) ?? 0) + row.count);
  }
  return Array.from(totals, ([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count || a.referrer.localeCompare(b.referrer))
    .slice(0, 6);
}

export function parseTrafficPayload(input: unknown) {
  const parsed = trafficPayloadSchema.safeParse(input);
  if (!parsed.success) return null;
  const data = parsed.data;
  return {
    path: data.path,
    referrer: normalizeAcquisitionReferrer(data.referrer, {
      canonicalUrl: process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL,
    }),
    utmSource: data.utm_source ?? null,
    utmMedium: data.utm_medium ?? null,
    utmCampaign: data.utm_campaign ?? null,
  };
}
