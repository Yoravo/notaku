import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Read-only. Memakai sesi 'admin' dari tests/admin-panel.e2e.ts (setup dijalankan otomatis).
test('sidebar groups contain the expected routes', { session: 'admin' }, async ({ app, browser }) => {
  await app.open('/dashboard');
  await expect(browser).toHaveURL('/dashboard');

  // Baca struktur grup sidebar langsung dari DOM: { judul grup: [href...] }
  const groups = await browser.evaluate(() => {
    const nav = document.querySelector('aside nav');
    if (!nav) return {};
    const out: Record<string, string[]> = {};
    for (const group of Array.from(nav.children)) {
      const title = group.querySelector('p')?.textContent?.trim();
      if (!title) continue;
      out[title.toUpperCase()] = Array.from(group.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '');
    }
    return out;
  });

  const find = (re: RegExp) => Object.entries(groups).find(([title]) => re.test(title))?.[1];
  expect(find(/AKTIVITAS|ACTIVITY/)).toEqual(['/dashboard', '/invoices', '/recurring-invoices', '/customers', '/items']);
  expect(find(/KEUANGAN|FINANCE/)).toEqual(['/wallet', '/expenses', '/tax-reports']);
  expect(find(/PREFERENSI|PREFERENCES/)).toEqual(['/billing', '/referrals', '/settings']);
});

test('settings: deep link, grouped nav, url sync', { session: 'admin' }, async ({ app, screen, browser }) => {
  await app.open('/settings?tab=security');
  await expect(browser).toHaveURL('/settings?tab=security');
  await expect(screen.getByRole('heading', /Keamanan Akun|Account Security/)).toBeVisible();

  await expect(screen.getByText(/Profil & Keamanan|Profile & Security/)).toBeVisible();
  await expect(screen.getByText(/Faktur & Pembayaran|Invoicing & Payments/)).toBeVisible();
  await expect(screen.getByText(/Integrasi & Lanjutan|Integrations & Advanced/)).toBeVisible();

  await screen.getByRole('button', /Bot Notifikasi|Notification Bots/).tap();
  await expect(browser).toHaveURL('/settings?tab=notifications');
});

test('settings nav has no horizontal scroll on phone width', { session: 'admin' }, async ({ app, browser }) => {
  await browser.setViewport({ width: 390, height: 844 });
  await app.open('/settings');

  const overflow = await browser.evaluate(() => {
    const nav = document.querySelector('main nav[aria-label]') as HTMLElement | null;
    return {
      found: Boolean(nav),
      navOverflow: nav ? nav.scrollWidth - nav.clientWidth : -1,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  expect(overflow.found).toBe(true);
  expect(overflow.navOverflow).toBe(0);
  expect(overflow.pageOverflow).toBeLessThanOrEqual(0);
});
