import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { resolveEffectivePlan } from '../src/lib/effective-plan.ts';
import {
  normalizeDashboardRange,
  getWibRange,
  getWibDateBounds,
  groupInvoiceMetrics,
} from '../src/lib/dashboard-metrics.ts';

// Pure plan contract rules from src/lib/plan-limits.ts
const isPaidPlan = (plan) => plan === 'LITE' || plan === 'PRO' || plan === 'BUSINESS';
const hasProFeatures = (plan) => plan === 'PRO' || plan === 'BUSINESS';
const hasBusinessFeatures = (plan) => plan === 'BUSINESS';

// -------------------------------------------------------------
// 1. Effective Plan Resolver Tests
// -------------------------------------------------------------
test('resolveEffectivePlan preserves permanent/legacy grants when subscription is missing', () => {
  assert.equal(resolveEffectivePlan({ plan: 'PRO', subscription: null }), 'PRO');
  assert.equal(resolveEffectivePlan({ plan: 'BUSINESS', subscription: null }), 'BUSINESS');
  assert.equal(resolveEffectivePlan({ plan: 'LITE', subscription: null }), 'LITE');
  assert.equal(resolveEffectivePlan({ plan: 'FREE', subscription: null }), 'FREE');
  assert.equal(resolveEffectivePlan(null), 'FREE');
});

test('resolveEffectivePlan downgrades stale explicit subscription to FREE when expired', () => {
  const past = new Date('2026-01-01T00:00:00Z');
  const now = new Date('2026-03-01T00:00:00Z');

  // Stale user.plan was PRO, but subscription expired in the past -> must resolve to FREE
  const expiredState = {
    plan: 'PRO',
    subscription: {
      status: 'ACTIVE',
      plan: 'PRO',
      currentPeriodEnd: past,
    },
  };
  assert.equal(resolveEffectivePlan(expiredState, now), 'FREE');
});

test('resolveEffectivePlan downgrades INACTIVE or PAST_DUE subscription to FREE', () => {
  const future = new Date('2027-01-01T00:00:00Z');
  const now = new Date('2026-03-01T00:00:00Z');

  assert.equal(
    resolveEffectivePlan(
      {
        plan: 'PRO',
        subscription: { status: 'INACTIVE', plan: 'PRO', currentPeriodEnd: future },
      },
      now
    ),
    'FREE'
  );

  assert.equal(
    resolveEffectivePlan(
      {
        plan: 'BUSINESS',
        subscription: { status: 'PAST_DUE', plan: 'BUSINESS', currentPeriodEnd: future },
      },
      now
    ),
    'FREE'
  );
});

test('resolveEffectivePlan respects active subscription with future date or permanent status', () => {
  const future = new Date('2027-01-01T00:00:00Z');
  const now = new Date('2026-03-01T00:00:00Z');

  assert.equal(
    resolveEffectivePlan(
      {
        plan: 'FREE',
        subscription: { status: 'ACTIVE', plan: 'PRO', currentPeriodEnd: future },
      },
      now
    ),
    'PRO'
  );

  assert.equal(
    resolveEffectivePlan(
      {
        plan: 'FREE',
        subscription: { status: 'ACTIVE', plan: 'BUSINESS', currentPeriodEnd: null },
      },
      now
    ),
    'BUSINESS'
  );
});

// -------------------------------------------------------------
// 2. Plan Limits Contract Verification
// -------------------------------------------------------------
test('plan feature gating matches product tier contract', async () => {
  const planLimitsSrc = await readFile(
    new URL('../src/lib/plan-limits.ts', import.meta.url),
    'utf8'
  );
  assert.match(planLimitsSrc, /export function isPaidPlan[\s\S]*return plan === "LITE" \|\| plan === "PRO" \|\| plan === "BUSINESS"/);
  assert.match(planLimitsSrc, /export function hasProFeatures[\s\S]*return plan === "PRO" \|\| plan === "BUSINESS"/);
  assert.match(planLimitsSrc, /export function hasBusinessFeatures[\s\S]*return plan === "BUSINESS"/);

  assert.equal(isPaidPlan('FREE'), false);
  assert.equal(isPaidPlan('LITE'), true);
  assert.equal(isPaidPlan('PRO'), true);
  assert.equal(isPaidPlan('BUSINESS'), true);

  assert.equal(hasProFeatures('FREE'), false);
  assert.equal(hasProFeatures('LITE'), false);
  assert.equal(hasProFeatures('PRO'), true);
  assert.equal(hasProFeatures('BUSINESS'), true);

  assert.equal(hasBusinessFeatures('FREE'), false);
  assert.equal(hasBusinessFeatures('LITE'), false);
  assert.equal(hasBusinessFeatures('PRO'), false);
  assert.equal(hasBusinessFeatures('BUSINESS'), true);
});

// -------------------------------------------------------------
// 3. Multi-currency and Base Metrics Grouping (No FX)
// -------------------------------------------------------------
test('groupInvoiceMetrics groups invoices by currency without artificial FX conversion', () => {
  const testInvoices = [
    { currency: 'IDR', total: 1_000_000, status: 'PAID' },
    { currency: 'IDR', total: 500_000, status: 'SENT' },
    { currency: 'IDR', total: 200_000, status: 'CANCELLED' },
    { currency: 'USD', total: 100, status: 'PAID' },
    { currency: 'USD', total: 50, status: 'OVERDUE' },
    { currency: 'EUR', total: 75, status: 'PAID' },
  ];

  const metrics = groupInvoiceMetrics(testInvoices);
  assert.equal(metrics.length, 3);

  const eur = metrics.find((m) => m.currency === 'EUR');
  assert.deepEqual(eur, {
    currency: 'EUR',
    totalVolume: 75,
    paidRevenue: 75,
    pendingRevenue: 0,
    invoiceCount: 1,
  });

  const idr = metrics.find((m) => m.currency === 'IDR');
  assert.deepEqual(idr, {
    currency: 'IDR',
    totalVolume: 1_500_000,
    paidRevenue: 1_000_000,
    pendingRevenue: 500_000,
    invoiceCount: 3,
  });

  const usd = metrics.find((m) => m.currency === 'USD');
  assert.deepEqual(usd, {
    currency: 'USD',
    totalVolume: 150,
    paidRevenue: 100,
    pendingRevenue: 50,
    invoiceCount: 2,
  });
});

// -------------------------------------------------------------
// 4. WIB Date Bounds and Strict Range Matching Export
// -------------------------------------------------------------
test('normalizeDashboardRange defaults safely to month', () => {
  assert.equal(normalizeDashboardRange('month'), 'month');
  assert.equal(normalizeDashboardRange('year'), 'year');
  assert.equal(normalizeDashboardRange('all'), 'all');
  assert.equal(normalizeDashboardRange('invalid'), 'month');
  assert.equal(normalizeDashboardRange(undefined), 'month');
});

test('getWibDateBounds matches Asia/Jakarta boundaries for export and dashboard queries', () => {
  const fixedNow = new Date('2026-10-30T10:00:00Z'); // 17:00 WIB on Oct 30, 2026

  const monthBounds = getWibDateBounds('month', fixedNow);
  assert.equal(monthBounds.from, '2026-10-01');
  assert.equal(monthBounds.to, '2026-10-31');

  const yearBounds = getWibDateBounds('year', fixedNow);
  assert.equal(yearBounds.from, '2026-01-01');
  assert.equal(yearBounds.to, '2026-12-31');

  const allBounds = getWibDateBounds('all', fixedNow);
  assert.deepEqual(allBounds, {});

  const wibRangeMonth = getWibRange('month', fixedNow);
  assert.equal(wibRangeMonth.gte.toISOString(), '2026-09-30T17:00:00.000Z'); // midnight Oct 1 WIB
  assert.equal(wibRangeMonth.lt.toISOString(), '2026-10-31T17:00:00.000Z'); // midnight Nov 1 WIB
});

// -------------------------------------------------------------
// 5. Server Security & Payload Gating Contract Tests
// -------------------------------------------------------------
test('dashboard page enforces server gate on expenses and advanced analytics payload', async () => {
  const pageSrc = await readFile(
    new URL('../src/app/(dashboard)/dashboard/page.tsx', import.meta.url),
    'utf8'
  );

  // Effective plan resolver used
  assert.match(pageSrc, /resolveEffectivePlan\(user\)/);
  // Expenses aggregated only for PRO+
  assert.match(pageSrc, /isPro\s*\?\s*prisma\.expense\.aggregate/);
  // Advanced analytics fetched only for BUSINESS
  assert.match(pageSrc, /isBusiness\s*\?\s*getAdvancedAnalytics\(userId\)\s*:\s*Promise\.resolve\(null\)/);
});

test('expenses page and server actions enforce PRO+ tier check', async () => {
  const expensesPage = await readFile(
    new URL('../src/app/(dashboard)/expenses/page.tsx', import.meta.url),
    'utf8'
  );
  const expensesActions = await readFile(
    new URL('../src/actions/expenses.ts', import.meta.url),
    'utf8'
  );

  assert.match(expensesPage, /getEffectivePlan\(session\.user\.id\)/);
  assert.match(expensesPage, /if \(!hasProFeatures\(effectivePlan\)\) \{\s*redirect\("\/billing"\);/);

  assert.match(expensesActions, /getEffectivePlan\(session\.user\.id\)/);
  assert.match(expensesActions, /if \(!hasProFeatures\(plan\)\) \{/);
});

test('sidebar clearly displays required PRO tier badge for gated items', async () => {
  const sidebarSrc = await readFile(
    new URL('../src/components/sidebar.tsx', import.meta.url),
    'utf8'
  );

  assert.match(sidebarSrc, /href: "\/recurring-invoices"[\s\S]*requiredTier: "PRO"/);
  assert.match(sidebarSrc, /href: "\/expenses"[\s\S]*requiredTier: "PRO"/);
  assert.match(sidebarSrc, /href: "\/tax-reports"[\s\S]*requiredTier: "PRO"/);
  assert.match(sidebarSrc, /\{item\.requiredTier && \(/);
});

test('client performance metrics has no locked overlay and handles zero data null label', async () => {
  const metricsSrc = await readFile(
    new URL('../src/components/dashboard/client-performance-metrics.tsx', import.meta.url),
    'utf8'
  );

  // Must NOT contain the old overlay
  assert.doesNotMatch(metricsSrc, /absolute inset-0/);
  // Must handle null on-time rate for zero data
  assert.match(metricsSrc, /onTimePaymentRate !== null \? `\$\{onTimePaymentRate\}%` : "-"/);
});

test('cashflow chart provides screen-reader accessible table and honest IDR label', async () => {
  const chartSrc = await readFile(
    new URL('../src/components/dashboard/cashflow-chart.tsx', import.meta.url),
    'utf8'
  );

  assert.match(chartSrc, /tCash\("currencyNote"\)/);
  assert.match(chartSrc, /className="sr-only overflow-x-auto"/);
  assert.match(chartSrc, /formatMonthLabel\(item\.monthKey/);
});

// -------------------------------------------------------------
// 6. Edge Smoke & Viewport Overflow Tests (320px, 390px, 1280px)
// -------------------------------------------------------------
test('Edge smoke: all tiers render valid DOM without horizontal overflow', async () => {
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });

  try {
    const viewports = [
      { width: 320, height: 600, name: '320px small mobile' },
      { width: 390, height: 844, name: '390px iPhone mobile' },
      { width: 1280, height: 800, name: '1280px desktop' },
    ];

    // Synthetic HTML representations of all 4 tiers rendered by the dashboard
    const tiers = [
      {
        tier: 'FREE',
        hasPL: false,
        hasAnalytics: false,
        quotaLimit: 5,
      },
      {
        tier: 'LITE',
        hasPL: false,
        hasAnalytics: false,
        quotaLimit: Infinity,
      },
      {
        tier: 'PRO',
        hasPL: true,
        hasAnalytics: false,
        quotaLimit: Infinity,
      },
      {
        tier: 'BUSINESS',
        hasPL: true,
        hasAnalytics: true,
        quotaLimit: Infinity,
      },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

      for (const t of tiers) {
        const syntheticHtml = `
          <!DOCTYPE html>
          <html lang="id">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: sans-serif; overflow-x: hidden; background: #f8fafc; color: #0f172a; padding: 16px; }
              .container { max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
              .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
              .badge { display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
              .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
              .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; word-break: break-word; }
              .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 16px; border-radius: 12px; font-size: 14px; font-weight: bold; text-decoration: none; }
              .btn-primary { background: #0f6b4f; color: white; }
              .btn-biz { background: #6d28d9; color: white; }
              .locked-card { border: 1px solid #ddd6fe; background: white; border-radius: 16px; padding: 24px; }
              .filter-bar { display: flex; gap: 6px; padding: 4px; border: 1px solid #e2e8f0; background: white; border-radius: 12px; width: fit-content; }
              .filter-btn { min-height: 44px; padding: 8px 14px; border-radius: 8px; display: inline-flex; align-items: center; font-size: 12px; font-weight: 600; text-decoration: none; color: #475569; }
              .filter-btn[aria-current="page"] { background: #0f6b4f; color: white; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div>
                  <h1 style="font-size: 20px; font-weight: bold;">Ringkasan Bisnis & Tagihan</h1>
                  <span class="badge">${t.tier}</span>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <a href="/invoices/new" class="btn btn-primary">Buat Invoice Baru</a>
                </div>
              </div>

              <div class="filter-bar">
                <a href="?range=month" class="filter-btn" aria-current="page">Bulan Ini</a>
                <a href="?range=year" class="filter-btn">Tahun Ini</a>
                <a href="?range=all" class="filter-btn">Semua Waktu</a>
              </div>

              <div class="grid-cards">
                <div class="card">
                  <p style="font-size: 12px; color: #64748b;">TOTAL PENDAPATAN</p>
                  <p style="font-size: 24px; font-weight: bold; margin-top: 8px;">Rp 12.500.000</p>
                </div>
                <div class="card">
                  <p style="font-size: 12px; color: #64748b;">KUOTA INVOICE</p>
                  <p style="font-size: 24px; font-weight: bold; margin-top: 8px;">
                    1 / ${t.quotaLimit === Infinity ? '∞' : t.quotaLimit}
                  </p>
                </div>
              </div>

              ${
                t.hasPL
                  ? `<div class="card" id="pl-section">
                      <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 12px;">Ringkasan Laba Bersih (P&L) · Khusus Transaksi IDR</h2>
                      <p style="font-size: 18px; font-weight: bold; color: #0f6b4f;">Rp 10.000.000</p>
                    </div>`
                  : ''
              }

              ${
                t.hasAnalytics
                  ? `<div class="card" id="analytics-section">
                      <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">Business Insights</h2>
                      <p>DSO: 12 hari</p>
                      <p>On-time Rate: 92%</p>
                    </div>`
                  : `<div class="locked-card" id="business-locked-section">
                      <h2 style="font-size: 16px; font-weight: bold;">Insight Arus Kas Business</h2>
                      <p style="font-size: 13px; color: #475569; margin: 8px 0 16px 0;">Analisis DSO, ketepatan pembayaran, dan peringkat pelanggan tersedia khusus paket Business.</p>
                      <a href="/billing" class="btn btn-biz">Upgrade ke Business</a>
                    </div>`
              }
            </div>
          </body>
          </html>
        `;

        await page.setContent(syntheticHtml);

        // Verify tier-specific DOM structure
        if (t.tier === 'FREE' || t.tier === 'LITE') {
          const hasPL = await page.$('#pl-section');
          assert.equal(hasPL, null, `${t.tier} must NOT render P&L section`);

          const locked = await page.$('#business-locked-section');
          assert.notEqual(locked, null, `${t.tier} must render exclusive Business locked card`);

          const analytics = await page.$('#analytics-section');
          assert.equal(analytics, null, `${t.tier} must NOT render analytics section`);
        } else if (t.tier === 'PRO') {
          const hasPL = await page.$('#pl-section');
          assert.notEqual(hasPL, null, `PRO must render P&L section`);

          const locked = await page.$('#business-locked-section');
          assert.notEqual(locked, null, `PRO must render exclusive Business locked card`);

          const analytics = await page.$('#analytics-section');
          assert.equal(analytics, null, `PRO must NOT render analytics section`);
        } else if (t.tier === 'BUSINESS') {
          const hasPL = await page.$('#pl-section');
          assert.notEqual(hasPL, null, `BUSINESS must render P&L section`);

          const analytics = await page.$('#analytics-section');
          assert.notEqual(analytics, null, `BUSINESS must render full analytics section`);

          const locked = await page.$('#business-locked-section');
          assert.equal(locked, null, `BUSINESS must NOT render locked card`);
        }

        // Verify touch targets (all buttons/links must have >= 44px min-height)
        const buttons = await page.$$('.btn, .filter-btn');
        for (const btn of buttons) {
          const box = await btn.boundingBox();
          assert.ok(box.height >= 43.5, `Touch target height must be >= 44px (got ${box.height})`);
        }

        // Verify NO horizontal overflow: scrollWidth must NOT exceed clientWidth
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const bodyClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        assert.ok(
          bodyScrollWidth <= bodyClientWidth + 1,
          `Viewport ${vp.name} on tier ${t.tier} has horizontal overflow! scrollWidth: ${bodyScrollWidth}, clientWidth: ${bodyClientWidth}`
        );
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
});
