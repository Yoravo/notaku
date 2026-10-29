import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateMoneyByCurrency,
  buildJakartaDailyTraffic,
  getJakartaMonthBounds,
  normalizeAcquisitionReferrer,
  parseTrafficPayload,
} from "../src/lib/admin-analytics.ts";

test("aggregateMoneyByCurrency keeps currencies separate", () => {
  assert.deepEqual(
    aggregateMoneyByCurrency([
      { currency: "USD", total: 12.5 },
      { currency: "IDR", total: 10_000 },
      { currency: "USD", total: 7.5 },
    ]),
    [
      { currency: "IDR", total: 10_000 },
      { currency: "USD", total: 20 },
    ],
  );
});

test("Jakarta month bounds use paid-month WIB boundaries", () => {
  const bounds = getJakartaMonthBounds(new Date("2026-03-15T12:00:00.000Z"));
  assert.equal(bounds.currentStart.toISOString(), "2026-02-28T17:00:00.000Z");
  assert.equal(bounds.previousStart.toISOString(), "2026-01-31T17:00:00.000Z");
  assert.equal(bounds.previousEnd.toISOString(), "2026-02-28T16:59:59.999Z");
});

test("daily traffic buckets UTC timestamps into WIB dates", () => {
  const result = buildJakartaDailyTraffic(
    [
      { createdAt: new Date("2026-03-01T16:59:59.000Z"), ipAddress: "a" },
      { createdAt: new Date("2026-03-01T17:00:00.000Z"), ipAddress: "a" },
    ],
    new Date("2026-03-02T03:00:00.000Z"),
    2,
  );
  assert.deepEqual(result.map(({ dateKey, views, uniques }) => ({ dateKey, views, uniques })), [
    { dateKey: "2026-03-01", views: 1, uniques: 1 },
    { dateKey: "2026-03-02", views: 1, uniques: 1 },
  ]);
});

test("referrers normalize to external origins and exclude first-party/auth origins", () => {
  const options = { canonicalUrl: "https://app.example.com" };
  assert.equal(normalizeAcquisitionReferrer("https://News.Example/path?q=1", options), "https://news.example");
  assert.equal(normalizeAcquisitionReferrer("https://www.notaku.store/pricing", options), null);
  assert.equal(normalizeAcquisitionReferrer("https://notaku.store/", options), null);
  assert.equal(normalizeAcquisitionReferrer("https://accounts.google.com/o/oauth2/auth", options), null);
  assert.equal(normalizeAcquisitionReferrer("https://app.example.com/login", options), null);
  assert.equal(normalizeAcquisitionReferrer("javascript:alert(1)", options), null);
});

test("tracking payload validation is strict and normalizes accepted fields", () => {
  assert.deepEqual(parseTrafficPayload({ path: "/pricing", referrer: "https://example.com/a?b=1", utm_source: " google " }), {
    path: "/pricing",
    referrer: "https://example.com",
    utmSource: "google",
    utmMedium: null,
    utmCampaign: null,
  });
  assert.equal(parseTrafficPayload({ path: "https://evil.test/" }), null);
  assert.equal(parseTrafficPayload({ path: "/ok", unknown: true }), null);
  assert.equal(parseTrafficPayload({ path: "/ok", utm_source: 42 }), null);
});
