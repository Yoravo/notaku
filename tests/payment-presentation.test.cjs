const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const privateReceipt = 'src/app/api/invoices/[id]/receipt/route.ts';
const publicReceipt = 'src/app/api/invoices/public/[publicId]/receipt/route.ts';
const userExport = 'src/app/api/invoices/export/route.ts';
const adminExport = 'src/app/api/admin/export/invoices/route.ts';

test('receipt routes pass invoice currency and omit rupiah words for non-IDR receipts', () => {
  for (const file of [privateReceipt, publicReceipt]) {
    const source = read(file);
    assert.match(source, /currency:\s*invoice\.currency/);
    assert.match(source, /invoice\.currency\s*===\s*["']IDR["']\s*\?\s*terbilangRupiah\(totalAmount\)\s*:\s*["']["']/);
  }
});

test('invoice CSV exports declare currency separately and format dates in WIB', () => {
  for (const file of [userExport, adminExport]) {
    const source = read(file);
    assert.match(source, /["']Currency["']/);
    assert.doesNotMatch(source, /Subtotal \(IDR\)|Potongan Diskon \(IDR\)|Pajak PPN \(IDR\)|Total \(IDR\)|Nominal \(Rp\)/);
    assert.match(source, /formatDateWIB|formatDateTimeWIB/);
    assert.doesNotMatch(source, /createdAt\.toISOString\(|dueDate\.toISOString\(/);
  }
});

test('upgrade checkout uses synchronous submission and stale promo guards', () => {
  const source = read('src/components/upgrade-modal.tsx');
  assert.match(source, /checkoutPendingRef/);
  assert.match(source, /if \(checkoutPendingRef\.current\) return/);
  assert.match(source, /promoRequestRef/);
  assert.match(source, /requestId !== promoRequestRef\.current/);
  assert.match(source, /disabled=\{loading\}/);
  assert.match(source, /aria-live=["']polite["']/);
});

test('public digital checkout is limited to IDR sent or overdue invoices and guarded synchronously', () => {
  const source = read('src/components/invoices/public-payment-box.tsx');
  assert.match(source, /currencyCode\s*===\s*["']IDR["']/);
  assert.match(source, /status\s*===\s*["']SENT["']/);
  assert.match(source, /status\s*===\s*["']OVERDUE["']/);
  assert.match(source, /paymentPendingRef/);
  assert.match(source, /if \(paymentPendingRef\.current\) return/);
  assert.match(source, /role=["']alert["']/);
  assert.match(source, /aria-live=["']polite["']/);
});
