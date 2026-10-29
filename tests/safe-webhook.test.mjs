import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSafeWebhookUrl,
  isPublicWebhookAddress,
  requestSafeWebhook,
} from '../src/lib/safe-webhook.ts';

test('rejects non-HTTPS, credentials, and non-default ports', async () => {
  for (const url of [
    'http://example.com/hook',
    'https://user:pass@example.com/hook',
    'https://example.com:444/hook',
  ]) {
    await assert.rejects(assertSafeWebhookUrl(url), /Webhook URL/);
  }
});

test('rejects private and reserved IPv4 including encoded URL forms', async () => {
  for (const url of [
    'https://127.0.0.1/hook',
    'https://127.1/hook',
    'https://2130706433/hook',
    'https://0x7f000001/hook',
    'https://0177.0.0.1/hook',
    'https://10.0.0.1/hook',
    'https://169.254.169.254/latest/meta-data',
    'https://192.0.2.1/hook',
    'https://224.0.0.1/hook',
  ]) {
    await assert.rejects(assertSafeWebhookUrl(url), /public Internet address/);
  }
});

test('rejects private, reserved, mapped, and transition IPv6', () => {
  for (const address of [
    '::',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
    'fe80::1',
    'ff02::1',
    '2001:db8::1',
    '2002:7f00:1::',
  ]) {
    assert.equal(isPublicWebhookAddress(address), false, address);
  }
  assert.equal(isPublicWebhookAddress('2606:4700:4700::1111'), true);
});

test('rejects a hostname when any DNS answer is not public', async () => {
  await assert.rejects(
    assertSafeWebhookUrl('https://hooks.example/hook', {
      lookup: async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ],
    }),
    /public Internet address/,
  );
});

test('pins the validated DNS answer in the HTTPS connection lookup', async () => {
  let requestOptions;
  const response = await requestSafeWebhook('https://hooks.example/path?x=1', {
    method: 'POST',
    body: '{}',
    lookup: async () => [{ address: '93.184.216.34', family: 4 }],
    request: (options, onResponse) => {
      requestOptions = options;
      const listeners = new Map();
      const request = {
        on(event, listener) { listeners.set(event, listener); return request; },
        setTimeout(_timeout, listener) { request.timeoutListener = listener; return request; },
        write(body) { request.body = body; },
        end() {
          onResponse({
            statusCode: 204,
            on(event, listener) {
              if (event === 'end') queueMicrotask(listener);
              return this;
            },
            resume() {},
            destroy() {},
          });
        },
        destroy(error) { listeners.get('error')?.(error); },
      };
      return request;
    },
  });

  assert.equal(response.status, 204);
  assert.equal(requestOptions.hostname, 'hooks.example');
  assert.equal(requestOptions.servername, 'hooks.example');
  assert.equal(requestOptions.path, '/path?x=1');
  assert.equal(requestOptions.maxRedirects, undefined);
  await new Promise((resolve, reject) => {
    requestOptions.lookup('hooks.example', {}, (error, address, family) => {
      if (error) return reject(error);
      assert.equal(address, '93.184.216.34');
      assert.equal(family, 4);
      resolve();
    });
  });
});
