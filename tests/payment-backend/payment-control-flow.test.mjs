import test from 'node:test';
import assert from 'node:assert/strict';
import { decideExistingCheckout, runCheckoutCreation } from '../../src/lib/payment-checkout-control.ts';

const snapshot = { amount: 100_000 };

test('expired pending checkout with a known transaction must reconcile before reuse', () => {
  assert.deepEqual(decideExistingCheckout({ status: 'PENDING', paymentUrl: 'https://pay.test/1', providerTransactionId: 'tx_1', amount: 100_000, expiresAt: new Date('2026-01-01') }, snapshot, new Date('2026-01-02')), { kind: 'reconcile' });
});

test('checkout is never reused after its invoice amount changes', () => {
  assert.deepEqual(decideExistingCheckout({ status: 'PENDING', paymentUrl: 'https://pay.test/1', providerTransactionId: 'tx_1', amount: 100_000, expiresAt: new Date('2026-01-03') }, { amount: 125_000 }, new Date('2026-01-02')), { kind: 'conflict', reason: 'amount_changed' });
});

test('unexpired matching pending checkout may be reused', () => {
  assert.deepEqual(decideExistingCheckout({ status: 'PENDING', paymentUrl: 'https://pay.test/1', providerTransactionId: 'tx_1', amount: 100_000, expiresAt: new Date('2026-01-03') }, snapshot, new Date('2026-01-02')), { kind: 'reuse' });
});

import { applyNonPaidProviderObservation, inspectProviderStatus } from '../../src/lib/payment-reconciliation-control.ts';

test('provider success followed by persistence failure records CREATE_UNKNOWN with provider references and retains key', async () => {
  const writes = [];
  const provider = { id: 'pay_1', transactionId: 'tx_1', link: 'https://pay.test/1' };
  await assert.rejects(() => runCheckoutCreation({
    attempt: { id: 'attempt_1' }, activeCheckoutKey: 'key_1',
    createProviderPayment: async () => provider,
    persistProviderSuccess: async () => { throw new Error('database unavailable'); },
    persistFailure: async (data) => { writes.push(data); },
  }), /database unavailable/);
  assert.deepEqual(writes, [{ status: 'CREATE_UNKNOWN', activeCheckoutKey: 'key_1', providerPaymentId: 'pay_1', providerTransactionId: 'tx_1', paymentUrl: 'https://pay.test/1', errorCode: 'LOCAL_PERSIST', errorMessage: 'database unavailable' }]);
});

test('invalid provider JSON is ambiguous and never releases the checkout key', async () => {
  const writes = [];
  const error = Object.assign(new Error('invalid JSON'), { ambiguous: true, code: 'INVALID_RESPONSE' });
  await assert.rejects(() => runCheckoutCreation({
    attempt: { id: 'attempt_1' }, activeCheckoutKey: 'key_1',
    createProviderPayment: async () => { throw error; },
    persistProviderSuccess: async () => {},
    persistFailure: async (data) => { writes.push(data); },
  }), /invalid JSON/);
  assert.equal(writes[0].status, 'MANUAL_REVIEW');
  assert.equal(writes[0].activeCheckoutKey, 'key_1');
});

test('definitive provider rejection marks failed and releases checkout key', async () => {
  const writes = [];
  const error = Object.assign(new Error('bad request'), { ambiguous: false, code: '400' });
  await assert.rejects(() => runCheckoutCreation({
    attempt: { id: 'attempt_1' }, activeCheckoutKey: 'key_1',
    createProviderPayment: async () => { throw error; },
    persistProviderSuccess: async () => {},
    persistFailure: async (data) => { writes.push(data); },
  }), /bad request/);
  assert.equal(writes[0].status, 'FAILED');
  assert.equal(writes[0].activeCheckoutKey, null);
});

test('provider-confirmed terminal status unlocks retries but a local timeout does not', async () => {
  assert.deepEqual(inspectProviderStatus('expired'), { kind: 'terminal', status: 'EXPIRED' });
  assert.deepEqual(inspectProviderStatus('closed'), { kind: 'terminal', status: 'FAILED' });
  assert.deepEqual(inspectProviderStatus('failed'), { kind: 'terminal', status: 'FAILED' });
  assert.deepEqual(inspectProviderStatus('canceled'), { kind: 'terminal', status: 'FAILED' });
  assert.deepEqual(inspectProviderStatus('created'), { kind: 'pending' });
  assert.deepEqual(inspectProviderStatus('paid'), { kind: 'paid' });

  const writes = [];
  assert.deepEqual(await applyNonPaidProviderObservation('attempt_1', 'expired', async (data) => writes.push(data)), { state: 'rejected', reason: 'provider_expired' });
  assert.deepEqual(await applyNonPaidProviderObservation('attempt_2', 'created', async (data) => writes.push(data)), { state: 'pending', reason: 'transaction_not_paid' });
  assert.deepEqual(writes, [
    { attemptId: 'attempt_1', status: 'EXPIRED', releaseKey: true },
    { attemptId: 'attempt_2', releaseKey: false },
  ]);
});
