import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCanonicalAppOrigin } from '../src/lib/app-url.ts';
import { toDurableCheckoutFailure } from '../src/lib/payment-checkout-control.ts';

test('canonical app origin accepts only an absolute HTTP(S) NEXT_PUBLIC_APP_URL and strips path data', () => {
  assert.equal(getCanonicalAppOrigin('https://notaku.store/app?source=test#section'), 'https://notaku.store');
  assert.equal(getCanonicalAppOrigin('http://localhost:3000/path'), 'http://localhost:3000');
  assert.throws(() => getCanonicalAppOrigin(undefined), /NEXT_PUBLIC_APP_URL/);
  assert.throws(() => getCanonicalAppOrigin('javascript:alert(1)'), /HTTP\(S\)/);
  assert.throws(() => getCanonicalAppOrigin('https://user:pass@notaku.store'), /credentials/);
});

test('payment return routes use canonical configured origin rather than request URL', async () => {
  const createRoute = await readFile(new URL('../src/app/api/payment/create/route.ts', import.meta.url), 'utf8');
  const invoiceRoute = await readFile(new URL('../src/app/api/payment/invoice/route.ts', import.meta.url), 'utf8');
  assert.match(createRoute, /getCanonicalAppOrigin\(process\.env\.NEXT_PUBLIC_APP_URL\)/);
  assert.match(invoiceRoute, /getCanonicalAppOrigin\(process\.env\.NEXT_PUBLIC_APP_URL\)/);
  assert.doesNotMatch(createRoute, /new URL\("\/billing", request\.url\)/);
  assert.doesNotMatch(invoiceRoute, /new URL\(`\/i\/\$\{encodeURIComponent\(invoice\.publicId\)\}`, request\.url\)/);
});

test('ambiguous create without provider references becomes durable manual review and keeps active key', () => {
  const error = Object.assign(new Error('request timed out'), { ambiguous: true, code: 'NETWORK' });
  assert.deepEqual(toDurableCheckoutFailure(error, undefined, 'production:invoice:invoice_1'), {
    status: 'MANUAL_REVIEW',
    activeCheckoutKey: 'production:invoice:invoice_1',
    errorCode: 'NETWORK',
    errorMessage: 'request timed out',
  });
});

test('manual review persistence includes an audit event and retryable admin-alert outbox job', async () => {
  const checkout = await readFile(new URL('../src/lib/payment-checkout.ts', import.meta.url), 'utf8');
  const outbox = await readFile(new URL('../src/lib/payment-outbox.ts', import.meta.url), 'utf8');
  assert.match(checkout, /event: "payment\.checkout_manual_review"/);
  assert.match(checkout, /kind: "ADMIN_PAYMENT_MANUAL_REVIEW"/);
  assert.match(checkout, /idempotencyKey: `\$\{createdAttempt\.id\}:manual-review-alert`/);
  assert.match(outbox, /notifyAdminPaymentManualReview\(.*throwOnFailure: true/s);
});

test('subscription admin alert remains retryable when its destination is not configured', async () => {
  const notifications = await readFile(new URL('../src/lib/admin-notifications.ts', import.meta.url), 'utf8');
  const subscriptionHandler = notifications.slice(notifications.indexOf('export async function notifyAdminNewSubscription'));
  assert.match(subscriptionHandler, /if \(!webhookUrl\) \{\s*if \(options\.throwOnFailure\) throw new Error\("ADMIN_DISCORD_WEBHOOK_URL is not configured"\)/s);
});
