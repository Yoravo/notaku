import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { pathToFileURL } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), '../..');
const hermesScratch = 'C:/Users/User/AppData/Local/hermes/cache/scratch';
const scratchRoot = process.env.TMPDIR?.replaceAll('\\', '/').includes('/hermes/cache/scratch')
  ? process.env.TMPDIR
  : hermesScratch;
mkdirSync(scratchRoot, { recursive: true });
const scratch = mkdtempSync(path.join(scratchRoot, 'notaku-payment-pg-'));
let db;
let server;
let prisma;
let reconcilePaymentAttempt;
let processPaymentOutbox;
let sendDiscordWebhook;
let webhookPost;
let gatewayTransaction;
let discordResponse;
let discordRequests;
const originalFetch = globalThis.fetch;

function freeLoopbackPort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const address = listener.address();
      listener.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

function assertLoopbackDatabaseUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'postgresql:' || !['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
    throw new Error(`Refusing non-loopback integration database: ${url.hostname}`);
  }
}

function generateSchemaSql(databaseUrl) {
  const configPath = path.join(scratch, 'prisma.config.ts');
  const prismaConfigUrl = pathToFileURL(path.join(projectRoot, 'node_modules/prisma/config')).href;
  const schemaPath = path.join(projectRoot, 'prisma/schema.prisma').replaceAll('\\', '/');
  writeFileSync(configPath, [
    `import { defineConfig } from ${JSON.stringify(prismaConfigUrl)};`,
    `export default defineConfig({ schema: ${JSON.stringify(schemaPath)}, datasource: { url: ${JSON.stringify(databaseUrl)} } });`,
  ].join('\n'));
  return execFileSync(
    process.execPath,
    [path.join(projectRoot, 'node_modules/prisma/build/index.js'), 'migrate', 'diff', `--config=${configPath}`, '--from-empty', `--to-schema=${schemaPath}`, '--script'],
    { cwd: projectRoot, encoding: 'utf8', env: { ...process.env, DATABASE_URL: databaseUrl } },
  );
}

function paidGatewayResponse(overrides = {}) {
  return {
    id: 'provider_tx_1',
    status: 'paid',
    amount: 100_000,
    expirationDate: Date.now() + 60_000,
    paymentMethod: 'qris',
    extraData: null,
    paymentLink: { id: 'provider_pay_1', amount: 100_000, status: 'paid', expiredAt: null, link: 'https://pay.invalid/test', type: 'qris' },
    user: { id: 'merchant_test', name: 'Test Merchant', email: 'merchant@example.test' },
    ...overrides,
  };
}

async function seedInvoiceAttempt() {
  await prisma.user.create({ data: { id: 'seller_1', email: 'seller@example.test', name: 'Seller', phone: '0800000000' } });
  await prisma.customer.create({ data: { id: 'customer_1', userId: 'seller_1', name: 'Customer', email: 'customer@example.test' } });
  await prisma.invoice.create({
    data: {
      id: 'invoice_1', publicId: 'invoice_public_1', userId: 'seller_1', customerId: 'customer_1', number: 'INV-TEST-1',
      status: 'SENT', subtotal: 100_000, total: 100_000, currency: 'IDR', enableDigitalPayment: true,
    },
  });
  await prisma.$executeRaw`
    INSERT INTO payment_attempt (
      id, environment, purpose, "userId", "invoiceId", amount, currency, "merchantIdSnapshot", status,
      "providerPaymentId", "providerTransactionId", "activeCheckoutKey", "expiresAt", "paymentUrl", "returnUrl", "updatedAt"
    ) VALUES (
      'attempt_1', 'SANDBOX', 'INVOICE', 'seller_1', 'invoice_1', 100000, 'IDR', 'merchant_test', 'PENDING',
      'provider_pay_1', 'provider_tx_1', 'invoice:invoice_1:100000', NOW() + INTERVAL '1 minute',
      'https://pay.invalid/test', 'http://localhost/invoices/invoice_1', NOW()
    )
  `;
}

async function snapshot() {
  const [attempt, invoice, user, transactions, outbox, audits] = await Promise.all([
    prisma.paymentAttempt.findUniqueOrThrow({ where: { id: 'attempt_1' } }),
    prisma.invoice.findUniqueOrThrow({ where: { id: 'invoice_1' } }),
    prisma.user.findUniqueOrThrow({ where: { id: 'seller_1' } }),
    prisma.transaction.findMany({ where: { invoiceId: 'invoice_1' } }),
    prisma.paymentOutbox.findMany({ where: { attemptId: 'attempt_1' } }),
    prisma.auditLog.findMany({ where: { userId: 'seller_1' } }),
  ]);
  return { attempt, invoice, user, transactions, outbox, audits };
}

before(async () => {
  const port = await freeLoopbackPort();
  const databaseUrl = `postgresql://test:test@127.0.0.1:${port}/notaku_test`;
  assertLoopbackDatabaseUrl(databaseUrl);

  db = await PGlite.create();
  server = new PGLiteSocketServer({ db, host: '127.0.0.1', port, maxConnections: 20 });
  await server.start();
  await db.exec(generateSchemaSql(databaseUrl));

  process.env.DATABASE_URL = databaseUrl;
  process.env.MAYAR_API_KEY = 'integration-test-key';
  process.env.MAYAR_MERCHANT_ID = 'merchant_test';
  process.env.MAYAR_ENVIRONMENT = 'sandbox';
  process.env.MAYAR_WEBHOOK_TOKEN = 'integration-webhook-token';

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.startsWith('https://discord.com/api/webhooks/')) {
      discordRequests.push({ url, init });
      return discordResponse;
    }
    assert.match(url, /^https:\/\/api\.mayar\.io\/hl\/v2\/transactions\/provider_tx_1$/);
    return Response.json({ statusCode: 200, data: gatewayTransaction });
  };

  ({ prisma } = await import('../../src/lib/prisma.ts'));
  ({ reconcilePaymentAttempt } = await import('../../src/lib/payment-reconciliation.ts'));
  ({ processPaymentOutbox } = await import('../../src/lib/payment-outbox.ts'));
  ({ sendDiscordWebhook } = await import('../../src/lib/bot-notifications.ts'));
  ({ POST: webhookPost } = await import('../../src/app/api/payment/notification/route.ts'));
});

beforeEach(async () => {
  await prisma.paymentOutbox.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  gatewayTransaction = paidGatewayResponse();
  discordResponse = new Response(null, { status: 204 });
  discordRequests = [];
});

after(async () => {
  globalThis.fetch = originalFetch;
  await prisma?.$disconnect();
  await server?.stop();
  await db?.close();
  rmSync(scratch, { recursive: true, force: true });
});

test('actual webhook route fails closed for missing and invalid tokens', async () => {
  const saved = process.env.MAYAR_WEBHOOK_TOKEN;
  delete process.env.MAYAR_WEBHOOK_TOKEN;
  const unavailable = await webhookPost(new Request('http://localhost/api/payment/notification', { method: 'POST', body: '{}' }));
  assert.equal(unavailable.status, 503);

  process.env.MAYAR_WEBHOOK_TOKEN = saved;
  const unauthorized = await webhookPost(new Request('http://localhost/api/payment/notification', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-mayar-token': 'wrong-token' }, body: '{}',
  }));
  assert.equal(unauthorized.status, 401);
});

test('actual webhook route rejects invalid JSON before database reconciliation', async () => {
  const response = await webhookPost(new Request('http://localhost/api/payment/notification', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-mayar-token': 'integration-webhook-token' }, body: '{invalid',
  }));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid JSON payload' });
});

test('actual reconcilePaymentAttempt rejects gateway amount tampering without settling stored state', async () => {
  await seedInvoiceAttempt();
  gatewayTransaction = paidGatewayResponse({ amount: 1 });

  assert.deepEqual(await reconcilePaymentAttempt('attempt_1'), { state: 'rejected', attemptId: 'attempt_1', reason: 'amount_mismatch' });
  const state = await snapshot();
  assert.equal(state.attempt.status, 'PENDING');
  assert.equal(state.attempt.errorCode, 'VERIFY');
  assert.equal(state.attempt.errorMessage, 'amount_mismatch');
  assert.equal(state.attempt.reconcileAttempts, 1);
  assert.equal(state.invoice.status, 'SENT');
  assert.equal(Number(state.user.balance), 0);
  assert.equal(state.transactions.length, 0);
  assert.equal(state.outbox.length, 0);
  assert.equal(state.audits.length, 0);
});

test('actual reconciliation route settles once and replay does not duplicate financial effects', async () => {
  await seedInvoiceAttempt();
  const request = () => new Request('http://localhost/api/payment/notification', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-mayar-token': 'integration-webhook-token' },
    body: JSON.stringify({ data: { paymentLinkId: 'provider_pay_1', transactionId: 'provider_tx_1' } }),
  });

  const first = await webhookPost(request());
  assert.equal(first.status, 200);
  assert.equal((await first.json()).outcomes[0].alreadyCompleted, false);

  const replay = await webhookPost(request());
  assert.equal(replay.status, 200);
  assert.equal((await replay.json()).outcomes[0].alreadyCompleted, true);

  const state = await snapshot();
  assert.equal(state.attempt.status, 'COMPLETED');
  assert.equal(state.attempt.activeCheckoutKey, null);
  assert.equal(state.invoice.status, 'PAID');
  assert.equal(state.invoice.paymentMethod, 'NOTAKU_DIGITAL');
  assert.equal(Number(state.user.balance), 99_300);
  assert.equal(state.transactions.length, 1);
  assert.equal(Number(state.transactions[0].grossAmount), 100_000);
  assert.equal(Number(state.transactions[0].feeAmount), 700);
  assert.equal(Number(state.transactions[0].amount), 99_300);
  assert.equal(state.outbox.length, 2);
  assert.equal(state.audits.length, 1);
});

test('actual Discord sender emits the expected embed payload and surfaces HTTP failure', async () => {
  const options = {
    webhookUrl: 'https://discord.com/api/webhooks/test-id/test-token',
    title: 'Paid',
    description: 'Invoice paid',
    color: 0x10b981,
    url: 'https://notaku.test/i/public-id',
    fields: [{ name: 'Total', value: '**Rp100.000**', inline: true }],
  };

  assert.deepEqual(await sendDiscordWebhook(options), { success: true });
  assert.equal(discordRequests.length, 1);
  assert.equal(discordRequests[0].url, options.webhookUrl);
  assert.equal(discordRequests[0].init.method, 'POST');
  assert.equal(discordRequests[0].init.headers['Content-Type'], 'application/json');
  const body = JSON.parse(discordRequests[0].init.body);
  assert.equal(body.username, 'NotaKu Bot');
  assert.equal(body.embeds[0].title, 'Paid');
  assert.equal(body.embeds[0].description, 'Invoice paid');
  assert.equal(body.embeds[0].color, 0x10b981);
  assert.equal(body.embeds[0].url, options.url);
  assert.deepEqual(body.embeds[0].fields, options.fields);
  assert.match(body.embeds[0].timestamp, /^\d{4}-\d{2}-\d{2}T/);

  discordResponse = new Response('rate limited', { status: 429 });
  assert.deepEqual(await sendDiscordWebhook(options), { success: false, error: 'Discord HTTP 429: rate limited' });
});

test('actual payment outbox records Discord failure and retries to delivered state', async () => {
  await seedInvoiceAttempt();
  await prisma.user.update({
    where: { id: 'seller_1' },
    data: { plan: 'BUSINESS', discordEnabled: true, discordWebhookUrl: 'https://discord.com/api/webhooks/test-id/test-token' },
  });
  await reconcilePaymentAttempt('attempt_1');
  await prisma.paymentOutbox.updateMany({
    where: { attemptId: 'attempt_1', kind: 'CUSTOM_WEBHOOK_INVOICE_PAID' },
    data: { deliveredAt: new Date() },
  });

  discordResponse = new Response('temporary outage', { status: 503 });
  assert.deepEqual(await processPaymentOutbox(), { delivered: 0, failed: 1 });
  let job = await prisma.paymentOutbox.findFirstOrThrow({ where: { attemptId: 'attempt_1', kind: 'SELLER_INVOICE_PAID' } });
  assert.equal(job.attempts, 1);
  assert.equal(job.deliveredAt, null);
  assert.equal(job.processingAt, null);
  assert.equal(job.lastError, 'Discord HTTP 503: temporary outage');
  assert.ok(job.availableAt > new Date());

  await prisma.paymentOutbox.update({ where: { id: job.id }, data: { availableAt: new Date(0) } });
  discordResponse = new Response(null, { status: 204 });
  assert.deepEqual(await processPaymentOutbox(), { delivered: 1, failed: 0 });
  job = await prisma.paymentOutbox.findUniqueOrThrow({ where: { id: job.id } });
  assert.equal(job.attempts, 2);
  assert.ok(job.deliveredAt instanceof Date);
  assert.equal(job.processingAt, null);
  assert.equal(job.lastError, null);
  assert.equal(discordRequests.length, 2);

  assert.deepEqual(await processPaymentOutbox(), { delivered: 0, failed: 0 });
  assert.equal(discordRequests.length, 2);
});

test('concurrent actual outbox processors claim one job for one external delivery', async () => {
  await seedInvoiceAttempt();
  await prisma.user.update({
    where: { id: 'seller_1' },
    data: { plan: 'BUSINESS', discordEnabled: true, discordWebhookUrl: 'https://discord.com/api/webhooks/test-id/test-token' },
  });
  await reconcilePaymentAttempt('attempt_1');
  await prisma.paymentOutbox.updateMany({
    where: { attemptId: 'attempt_1', kind: 'CUSTOM_WEBHOOK_INVOICE_PAID' },
    data: { deliveredAt: new Date() },
  });

  const results = await Promise.all([processPaymentOutbox(1), processPaymentOutbox(1)]);
  assert.equal(results.reduce((sum, result) => sum + result.delivered, 0), 1);
  assert.equal(results.reduce((sum, result) => sum + result.failed, 0), 0);
  assert.equal(discordRequests.length, 1);
  const job = await prisma.paymentOutbox.findFirstOrThrow({ where: { attemptId: 'attempt_1', kind: 'SELLER_INVOICE_PAID' } });
  assert.equal(job.attempts, 1);
  assert.ok(job.deliveredAt instanceof Date);
});

test('concurrent actual reconciliation calls produce one settlement in the PGlite fixture', async () => {
  await seedInvoiceAttempt();
  const outcomes = await Promise.all([reconcilePaymentAttempt('attempt_1'), reconcilePaymentAttempt('attempt_1')]);
  assert.equal(outcomes.filter((outcome) => outcome.state === 'completed').length, 2);
  assert.equal(outcomes.filter((outcome) => outcome.state === 'completed' && !outcome.alreadyCompleted).length, 1);
  assert.equal(outcomes.filter((outcome) => outcome.state === 'completed' && outcome.alreadyCompleted).length, 1);

  const state = await snapshot();
  assert.equal(state.attempt.status, 'COMPLETED');
  assert.equal(state.invoice.status, 'PAID');
  assert.equal(Number(state.user.balance), 99_300);
  assert.equal(state.transactions.length, 1);
  assert.equal(state.outbox.length, 2);
  assert.equal(state.audits.length, 1);
});

// PGlite exercises these actual functions over its PostgreSQL wire protocol, but it
// is not evidence that production PostgreSQL row-lock scheduling behaves identically.
