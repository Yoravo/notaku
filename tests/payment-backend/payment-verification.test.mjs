import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVerifiedTransaction, webhookCandidateReferences } from '../../src/lib/payment-verification.ts';

const attempt = {
  environment: 'SANDBOX', amount: 49000, currency: 'IDR',
  providerPaymentId: 'pay_1', providerTransactionId: 'tx_1'
};

test('accepts only a paid transaction bound to stored refs, amount, merchant and environment', () => {
  const result = validateVerifiedTransaction(attempt, {
    id: 'tx_1', status: 'paid', amount: 49000,
    paymentLink: { id: 'pay_1' }, user: { id: 'merchant_sandbox' }
  }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' });
  assert.deepEqual(result, { ok: true });
});

test('rejects non-paid status including reminder SUCCESS scenarios', () => {
  const result = validateVerifiedTransaction(attempt, {
    id: 'tx_1', status: 'created', amount: 49000,
    paymentLink: { id: 'pay_1' }, user: { id: 'merchant_sandbox' }
  }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'transaction_not_paid');
});

test('rejects mismatched amount, refs, merchant, or environment', () => {
  const base = { id: 'tx_1', status: 'paid', amount: 49000, paymentLink: { id: 'pay_1' }, user: { id: 'merchant_sandbox' } };
  for (const [transaction, config, reason] of [
    [{ ...base, amount: 1 }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' }, 'amount_mismatch'],
    [{ ...base, id: 'tx_other' }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' }, 'transaction_mismatch'],
    [{ ...base, paymentLink: { id: 'pay_other' } }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' }, 'payment_link_mismatch'],
    [{ ...base, user: { id: 'other' } }, { environment: 'SANDBOX', merchantId: 'merchant_sandbox' }, 'merchant_mismatch'],
    [base, { environment: 'PRODUCTION', merchantId: 'merchant_sandbox' }, 'environment_mismatch'],
  ]) {
    const result = validateVerifiedTransaction(attempt, transaction, config);
    assert.equal(result.ok, false);
    assert.equal(result.reason, reason);
  }
});

test('extracts only documented candidate references and never data.id', () => {
  assert.deepEqual(webhookCandidateReferences({
    data: { id: 'webhook-id', productId: 'pay_1', transactionId: 'untrusted' },
    paymentLinkId: 'pay_2', paymentLinkTransactionId: 'tx_1'
  }), { paymentIds: ['pay_1', 'pay_2'], transactionIds: ['untrusted', 'tx_1'] });
});
