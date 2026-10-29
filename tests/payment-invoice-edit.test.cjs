const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the real action with isolated auth/DB boundaries; never load Prisma or env.
function harness({ status = 'SENT', method = null, owner = true, fail = false, race = false } = {}) {
  const state = { items: ['original'], updates: 0, redirects: 0 };
  const prisma = {
    $transaction: async (callback) => {
      const snapshot = structuredClone(state);
      const tx = {
        $queryRaw: async () => owner ? [{ id: 'invoice' }] : [],
        paymentAttempt: { count: async () => 0 },
        invoice: {
          findUnique: async ({ where }) => {
            assert.equal(where.userId, 'owner');
            return owner ? { status, paymentMethod: method, user: { plan: 'PRO' } } : null;
          },
          update: async ({ where }) => {
            assert.equal(where.userId, 'owner');
            assert.deepEqual(JSON.parse(JSON.stringify(where.OR)), [
              { status: { not: 'PAID' } },
              { paymentMethod: { not: 'NOTAKU_DIGITAL' } },
              { paymentMethod: null },
            ]);
            if (fail || race) throw new Error('conditional update failed');
            state.items = ['replacement'];
            state.updates++;
          },
        },
        customer: { findUnique: async ({ where }) => { assert.equal(where.userId, 'owner'); return { id: 'customer' }; } },
        invoiceItem: { deleteMany: async () => { state.items = []; } },
      };
      try { return await callback(tx); } catch (error) { Object.assign(state, snapshot); throw error; }
    },
  };
  const dependencies = {
    '@/lib/auth': { auth: { api: { getSession: async () => ({ user: { id: 'owner' } }) } } },
    '@/lib/prisma': { prisma },
    'next/headers': { headers: async () => ({}) },
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect() { state.redirects++; } },
    '@/lib/validations': { invoiceSchema: { safeParse: (data) => ({ success: true, data }) } },
    '@/lib/rate-limit': { checkServerActionRateLimit: async () => {} },
    '@/lib/invoice-calculations': { calculateInvoiceTotals: () => ({ subtotal: 1000, total: 1000, discountType: 'FIXED', discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0 }) },
  };
  const source = fs.readFileSync(require.resolve('../src/actions/invoices.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => dependencies[name] || {}, console, Date, Set });
  const input = { customerId: 'customer', items: [{ description: 'replacement', quantity: 1, price: 1000 }], currency: 'IDR' };
  return { state, run: () => exports.updateInvoice('invoice', input) };
}

test('paid digital invoice edit is rejected before changing items', async () => {
  const h = harness({ status: 'PAID', method: 'NOTAKU_DIGITAL' });
  await assert.rejects(h.run(), /tidak dapat diubah/);
  assert.deepEqual(h.state.items, ['original']);
  assert.equal(h.state.updates, 0);
});
test('foreign owner invoice cannot be edited', async () => {
  const h = harness({ owner: false });
  await assert.rejects(h.run(), /tidak ditemukan/);
  assert.deepEqual(h.state.items, ['original']);
});
test('replacement failure rolls back deleted items through transaction', async () => {
  const h = harness({ fail: true });
  await assert.rejects(h.run(), /conditional update failed/);
  assert.deepEqual(h.state.items, ['original']);
  assert.equal(h.state.redirects, 0);
});
test('settlement racing the edit is rejected by write predicate', async () => {
  const h = harness({ race: true });
  await assert.rejects(h.run(), /conditional update failed/);
  assert.deepEqual(h.state.items, ['original']);
});
test('unpaid invoice replacement commits and redirects', async () => {
  const h = harness();
  await h.run();
  assert.deepEqual(h.state.items, ['replacement']);
  assert.equal(h.state.updates, 1);
  assert.equal(h.state.redirects, 1);
});
