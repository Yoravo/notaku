import { test } from '@e2e-dev/web';
import { expect, credentials } from 'e2e';

// Read-only smoke test admin panel. Kredensial via E2E_USER_ADMIN_USERNAME / E2E_USER_ADMIN_PASSWORD.
test.setup('authenticate as admin', { sessions: ['admin'] }, async ({ app, session, browser }) => {
  const admin = credentials.user('admin');

  await app.open('/login');
  await browser.locator('#email').fill(admin.username);
  await browser.locator('#password').fill(admin.password);
  await browser.locator('form button[type="submit"]').tap();

  await expect(browser).toHaveURL('/dashboard', { timeout: 30_000 });
  await session.save('admin');
});

test('users page: 4-tier filter and plan modal', { session: 'admin' }, async ({ app, screen, browser }) => {
  await app.open('/admin/users');
  await expect(browser).toHaveURL('/admin/users');

  const options = await browser.evaluate(() =>
    Array.from(document.querySelectorAll('select[name="plan"] option')).map((o) => (o as HTMLOptionElement).value),
  );
  expect(options).toEqual(['', 'FREE', 'LITE', 'PRO', 'BUSINESS']);

  // Buka modal tanpa menyimpan: cek 4 tier + 5 durasi, lalu batal.
  await screen.getByRole('button', /Kelola Paket|Manage User Plan/).first().tap();
  const dialog = screen.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (const tier of ['FREE', 'LITE', 'PRO', 'BUSINESS']) {
    await expect(dialog.getByRole('button', new RegExp(`^${tier}`))).toBeVisible();
  }

  await dialog.getByRole('button', /^BUSINESS/).tap();
  for (const d of [/30/, /90/, /180/, /365/, /Permanen|Permanent/]) {
    await expect(dialog.getByRole('button', d).first()).toBeVisible();
  }

  await dialog.getByRole('button', /^FREE/).tap();
  await expect(dialog.getByRole('button', /Permanen|Permanent/)).toHaveCount(0);

  await browser.keyboard.press('Escape');
  await expect(screen.getByRole('dialog')).toHaveCount(0);
});

test('payouts page: tabs render', { session: 'admin' }, async ({ app, screen, browser }) => {
  await app.open('/admin/payouts');
  await expect(browser).toHaveURL('/admin/payouts');
  await expect(screen.getByRole('button', /^(Semua|All) \(\d+\)$/)).toBeVisible();
});

test('admin sub-pages respond for admin', { session: 'admin' }, async ({ app, browser }) => {
  for (const path of ['/admin', '/admin/finance', '/admin/promos', '/admin/referrals', '/admin/broadcast', '/admin/logs', '/admin/announcement']) {
    await app.open(path);
    await expect(browser).toHaveURL(path);
  }
});
