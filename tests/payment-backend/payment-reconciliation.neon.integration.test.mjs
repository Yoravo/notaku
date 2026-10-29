import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), '../..');
const expectedBranchId = 'br-patient-wildflower-aoy6pjal';
const baseUrl = process.env.DATABASE_URL;
if (!baseUrl?.startsWith('postgresql://') || baseUrl.includes('-pooler.')) throw new Error('Direct Neon DATABASE_URL required');
if (process.env.PAYMENT_VERIFY_BRANCH_ID !== expectedBranchId) throw new Error('Dedicated Neon branch safety check failed');
process.env.DATABASE_URL = baseUrl;
process.env.MAYAR_API_KEY = 'integration-test-key';
process.env.MAYAR_MERCHANT_ID = 'merchant_test';
process.env.MAYAR_ENVIRONMENT = 'sandbox';
process.env.MAYAR_WEBHOOK_TOKEN = 'integration-webhook-token';

const scratchRoot = process.env.TMPDIR?.replaceAll('\\', '/').includes('/hermes/cache/scratch')
  ? process.env.TMPDIR : 'C:/Users/User/AppData/Local/hermes/cache/scratch';
mkdirSync(scratchRoot, { recursive: true });
const scratch = mkdtempSync(path.join(scratchRoot, 'notaku-neon-pg-'));
const admin = new pg.Client({ connectionString: baseUrl });
let prisma;
let reconcilePaymentAttempt;
const originalFetch = globalThis.fetch;

function schemaSql(databaseUrl) {
  const configPath = path.join(scratch, 'prisma.config.ts');
  const prismaConfigUrl = pathToFileURL(path.join(projectRoot, 'node_modules/prisma/config')).href;
  const schemaPath = path.join(projectRoot, 'prisma/schema.prisma').replaceAll('\\', '/');
  writeFileSync(configPath, [
    `import { defineConfig } from ${JSON.stringify(prismaConfigUrl)};`,
    `export default defineConfig({ schema: ${JSON.stringify(schemaPath)}, datasource: { url: ${JSON.stringify(databaseUrl)} } });`,
  ].join('\n'));
  return execFileSync(process.execPath, [path.join(projectRoot, 'node_modules/prisma/build/index.js'), 'migrate', 'diff', `--config=${configPath}`, '--from-empty', `--to-schema=${schemaPath}`, '--script'], { cwd: projectRoot, encoding: 'utf8', env: { ...process.env, DATABASE_URL: databaseUrl } });
}

async function seed() {
  await prisma.user.create({ data: { id: 'neon_seller_1', email: 'neon-seller@example.test', name: 'Seller' } });
  await prisma.customer.create({ data: { id: 'neon_customer_1', userId: 'neon_seller_1', name: 'Customer', email: 'neon-customer@example.test' } });
  await prisma.invoice.create({ data: { id: 'neon_invoice_1', publicId: 'neon_public_1', userId: 'neon_seller_1', customerId: 'neon_customer_1', number: 'INV-NEON-1', status: 'SENT', subtotal: 100000, total: 100000, currency: 'IDR', enableDigitalPayment: true } });
  await prisma.$executeRaw`INSERT INTO payment_attempt (id, environment, purpose, "userId", "invoiceId", amount, currency, "merchantIdSnapshot", status, "providerPaymentId", "providerTransactionId", "activeCheckoutKey", "expiresAt", "paymentUrl", "returnUrl", "updatedAt") VALUES ('neon_attempt_1', 'SANDBOX', 'INVOICE', 'neon_seller_1', 'neon_invoice_1', 100000, 'IDR', 'merchant_test', 'PENDING', 'provider_pay_neon_1', 'provider_tx_neon_1', 'invoice:neon_invoice_1:100000', NOW() + INTERVAL '1 minute', 'https://pay.invalid/test', 'http://localhost/invoices/neon_invoice_1', NOW())`;
}

before(async () => {
  await admin.connect();
  const identity = await admin.query(`SELECT current_database() db, current_user usr, (SELECT count(*)::int FROM public."user") public_users`);
  assert.equal(identity.rows[0].public_users, 0, 'verification branch public schema must contain no customer rows');
  globalThis.fetch = async (input) => {
    assert.match(String(input), /^https:\/\/api\.mayar\.io\/hl\/v2\/transactions\/provider_tx_neon_1$/);
    return Response.json({ statusCode: 200, data: { id: 'provider_tx_neon_1', status: 'paid', amount: 100000, expirationDate: Date.now() + 60000, paymentMethod: 'qris', extraData: null, paymentLink: { id: 'provider_pay_neon_1', amount: 100000, status: 'paid', expiredAt: null, link: 'https://pay.invalid/test', type: 'qris' }, user: { id: 'merchant_test', name: 'Synthetic Merchant', email: 'merchant@example.test' } } });
  };
  ({ prisma } = await import('../../src/lib/prisma.ts'));
  ({ reconcilePaymentAttempt } = await import('../../src/lib/payment-reconciliation.ts'));
  const pathRows = await prisma.$queryRawUnsafe('SHOW search_path');
  assert.match(pathRows[0].search_path, /public/);
});

after(async () => {
  globalThis.fetch = originalFetch;
  await prisma?.$disconnect();
  await admin.end();
  rmSync(scratch, { recursive: true, force: true });
});

test('real Neon competing reconciliation settles synthetic invoice exactly once', async () => {
  await seed();
  const outcomes = await Promise.allSettled([reconcilePaymentAttempt('neon_attempt_1'), reconcilePaymentAttempt('neon_attempt_1')]);
  const fulfilled = outcomes.filter((item) => item.status === 'fulfilled').map((item) => item.value);
  const serializationFailures = outcomes.filter((item) => item.status === 'rejected' && /serialize|write conflict|P2034/i.test(String(item.reason)));
  assert.equal(fulfilled.filter((value) => value.state === 'completed' && !value.alreadyCompleted).length, 1);
  assert.ok(fulfilled.some((value) => value.state === 'completed' && value.alreadyCompleted) || serializationFailures.length === 1);

  const [attempts, invoices, users, transactions, outbox, audits] = await Promise.all([
    prisma.paymentAttempt.count({ where: { id: 'neon_attempt_1', status: 'COMPLETED' } }),
    prisma.invoice.count({ where: { id: 'neon_invoice_1', status: 'PAID', paymentMethod: 'NOTAKU_DIGITAL' } }),
    prisma.user.findUniqueOrThrow({ where: { id: 'neon_seller_1' }, select: { balance: true } }),
    prisma.transaction.count({ where: { invoiceId: 'neon_invoice_1' } }),
    prisma.paymentOutbox.count({ where: { attemptId: 'neon_attempt_1' } }),
    prisma.auditLog.count({ where: { userId: 'neon_seller_1', event: 'payment.invoice_digital_settled' } }),
  ]);
  assert.equal(attempts, 1);
  assert.equal(invoices, 1);
  assert.equal(Number(users.balance), 99300);
  assert.equal(transactions, 1);
  assert.equal(outbox, 2);
  assert.equal(audits, 1);
});

test('real Neon transaction rollback removes synthetic writes', async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    await tx.user.create({ data: { id: 'rollback_user', email: 'rollback@example.test', name: 'Rollback' } });
    await tx.auditLog.create({ data: { userId: 'rollback_user', event: 'rollback.probe' } });
    throw new Error('force rollback');
  }), /force rollback/);
  assert.equal(await prisma.user.count({ where: { id: 'rollback_user' } }), 0);
  assert.equal(await prisma.auditLog.count({ where: { userId: 'rollback_user', event: 'rollback.probe' } }), 0);
});
