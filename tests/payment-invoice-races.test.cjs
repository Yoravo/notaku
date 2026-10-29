const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadTypeScript(file, dependencies) {
  const source = fs.readFileSync(require.resolve(file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => dependencies[name] || {},
    console,
    Date,
    Set,
    URL,
    process,
  });
  return exports;
}

function invoiceActionHarness({ activeCheckout = false, status = 'SENT', method = null } = {}) {
  const calls = [];
  const invoice = {
    id: 'invoice',
    status,
    paidAt: null,
    paymentMethod: method,
    number: 'INV-1',
    publicId: 'public',
    total: 1000,
    currency: 'IDR',
    customer: { name: 'Customer' },
    user: { plan: 'PRO' },
  };
  const tx = {
    $queryRaw: async () => {
      calls.push('lock');
      return [{ id: invoice.id }];
    },
    invoice: {
      findUnique: async () => {
        calls.push('invoice-read');
        return invoice;
      },
      update: async ({ data }) => {
        calls.push('invoice-update');
        Object.assign(invoice, data);
        return invoice;
      },
    },
    paymentAttempt: {
      count: async () => {
        calls.push('active-check');
        return activeCheckout ? 1 : 0;
      },
    },
    customer: { findUnique: async () => ({ id: 'customer' }) },
    invoiceItem: { deleteMany: async () => calls.push('items-delete') },
  };
  const prisma = { $transaction: async (callback) => callback(tx) };
  const dependencies = {
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { id: 'owner' } }) } } },
    '@/lib/prisma': { prisma },
    'next/headers': { headers: async () => ({}) },
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect() {} },
    '@/lib/validations': { invoiceSchema: { safeParse: (data) => ({ success: true, data }) } },
    '@/lib/rate-limit': { checkServerActionRateLimit: async () => {} },
    '@/lib/invoice-calculations': { calculateInvoiceTotals: () => ({ subtotal: 1000, total: 1000, discountType: 'FIXED', discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0 }) },
    '@/lib/bot-notifications': { notifySellerInvoicePaid: async () => {} },
    '@/lib/audit-log': { auditLog: async () => {} },
  };
  const actions = loadTypeScript('../src/actions/invoices.ts', dependencies);
  const editInput = { customerId: 'customer', items: [{ description: 'x', quantity: 1, price: 1000 }] };
  return { calls, invoice, actions, editInput };
}

test('invoice edit locks row and rejects an active checkout before mutation', async () => {
  const h = invoiceActionHarness({ activeCheckout: true });
  await assert.rejects(h.actions.updateInvoice('invoice', h.editInput), /checkout pembayaran aktif/i);
  assert.deepEqual(h.calls.slice(0, 3), ['lock', 'invoice-read', 'active-check']);
  assert.equal(h.calls.includes('items-delete'), false);
  assert.equal(h.calls.includes('invoice-update'), false);
});

test('manual status change locks row and rejects an active checkout', async () => {
  const h = invoiceActionHarness({ activeCheckout: true });
  await assert.rejects(h.actions.updateInvoiceStatus('invoice', 'PAID'), /checkout pembayaran aktif/i);
  assert.deepEqual(h.calls.slice(0, 3), ['lock', 'invoice-read', 'active-check']);
  assert.equal(h.calls.includes('invoice-update'), false);
  assert.equal(h.invoice.status, 'SENT');
});

function checkoutHarness() {
  const calls = [];
  const currentInvoice = {
    id: 'invoice', userId: 'seller', status: 'SENT', currency: 'IDR', total: 2000,
    enableDigitalPayment: true, number: 'INV-NEW', publicId: 'public',
    user: { name: 'Seller', businessName: 'Current Shop' },
    customer: { name: 'Current Customer', email: 'current@example.test', phone: '08123' },
  };
  const tx = {
    $queryRaw: async () => { calls.push('lock'); return [{ id: 'invoice' }]; },
    invoice: { findUnique: async () => { calls.push('invoice-read'); return currentInvoice; } },
    paymentAttempt: {
      findUnique: async () => { calls.push('active-check'); return null; },
      create: async ({ data }) => { calls.push('attempt-create'); return { ...data }; },
    },
  };
  const prisma = {
    paymentAttempt: { findUnique: async () => null, update: async () => {} },
    $transaction: async (callback) => callback(tx),
  };
  const dependencies = {
    crypto: { randomUUID: () => 'attempt' },
    '@/generated/prisma/client': {
      Prisma: {
        TransactionIsolationLevel: { Serializable: 'Serializable' },
        PrismaClientKnownRequestError: class extends Error {},
      },
    },
    '@/lib/prisma': { prisma },
    '@/lib/mayar': {
      getMayarConfig: () => ({ environment: 'SANDBOX', merchantId: 'merchant' }),
      createMayarPayment: async (_config, data) => {
        calls.push(['provider-create', data]);
        return { id: 'payment', transactionId: 'transaction', link: 'https://pay.test' };
      },
    },
    '@/lib/payment-checkout-control': {
      decideExistingCheckout: () => ({ kind: 'conflict', reason: 'not_reusable' }),
      runCheckoutCreation: async (deps) => deps.createProviderPayment(),
    },
    '@/lib/payment-reconciliation': { reconcilePaymentAttempt: async () => ({ state: 'pending' }) },
  };
  return { calls, checkout: loadTypeScript('../src/lib/payment-checkout.ts', dependencies) };
}

test('invoice checkout locks then rebuilds the payable snapshot before reservation', async () => {
  const h = checkoutHarness();
  await h.checkout.createOrReuseCheckout({
    purpose: 'INVOICE', userId: 'seller', invoiceId: 'invoice', amount: 1000,
    name: 'Stale', email: 'stale@example.test', mobile: '000', description: 'Stale',
    returnUrl: 'https://app.test/i/public',
  });
  assert.deepEqual(h.calls.slice(0, 4), ['lock', 'invoice-read', 'active-check', 'attempt-create']);
  const provider = h.calls.find((call) => Array.isArray(call) && call[0] === 'provider-create')[1];
  assert.equal(provider.amount, 2000);
  assert.equal(provider.email, 'current@example.test');
  assert.match(provider.name, /INV-NEW/);
});
