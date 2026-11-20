const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => dependencies[name] || require(name), mod, mod.exports);
  return mod.exports;
}

const order = load('src/lib/order.ts');
const { POST } = load('src/app/api/order/route.ts', { '@/lib/order': order });
const envKeys = ['CRM_LEADS_ENDPOINT', 'LANDING_API_KEY', 'LANDING_ID', 'SITE_URL'];
const savedEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
const originalFetch = global.fetch;
const requestId = 'dc06ae55-a844-4c80-88ed-d944b72d8249';
const valid = { name: 'Тестове Ім’я', phone: '067 123 45 67', requestId };
let calls;

beforeEach(() => {
  calls = [];
  process.env.CRM_LEADS_ENDPOINT = 'https://crm.invalid/api/leads';
  process.env.LANDING_API_KEY = 'unit-test-key';
  process.env.LANDING_ID = 'landing-4';
  delete process.env.SITE_URL;
  global.fetch = async (...args) => {
    calls.push(args);
    return Response.json({ success: true, orderId: 'test-order-id' }, { status: 201 });
  };
});
after(() => {
  global.fetch = originalFetch;
  for (const key of envKeys) {
    if (savedEnv[key] === undefined) delete process.env[key]; else process.env[key] = savedEnv[key];
  }
});

function request(body = valid, headers = { 'Content-Type': 'application/json' }) {
  return new Request('http://localhost/api/order', { method: 'POST', headers, body: JSON.stringify(body) });
}

test('rejects invalid JSON, null, arrays and empty contacts without CRM calls', async () => {
  for (const body of [null, [], {}, { name: ' ', phone: '123' }]) assert.equal((await POST(request(body))).status, 400);
  assert.equal((await POST(new Request('http://localhost/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal(calls.length, 0);
});

test('validates contacts and idempotency ID on the server', async () => {
  for (const body of [{ ...valid, name: '1' }, { ...valid, phone: '0000000000' }, { ...valid, requestId: 'bad-id' }, { ...valid, requestId: undefined }]) assert.equal((await POST(request(body))).status, 400);
  assert.equal(calls.length, 0);
});

test('rejects wrong content type and oversized bodies', async () => {
  assert.equal((await POST(request(valid, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await POST(request({ ...valid, extra: 'a'.repeat(4100) }))).status, 413);
  assert.equal(calls.length, 0);
});

test('missing server credentials prevent any upstream request', async () => {
  for (const key of ['CRM_LEADS_ENDPOINT', 'LANDING_API_KEY', 'LANDING_ID']) {
    const value = process.env[key];
    delete process.env[key];
    assert.equal((await POST(request())).status, 503);
    process.env[key] = value;
  }
  assert.equal(calls.length, 0);
});

test('sends the registered landingId and only server-owned attribution and contacts without product, price or quantity fields', async () => {
  const response = await POST(request({ ...valid, price: 1, productId: 'attacker-id', productName: 'Forged title', landingId: 'forged-id', source: 'other', quantity: 99 }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const [url, options] = calls[0];
  assert.equal(url, 'https://crm.invalid/api/leads');
  assert.equal(options.headers['x-api-key'], 'unit-test-key');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.redirect, 'error');
  const payload = JSON.parse(options.body);
  assert.equal(payload.customerPhone, '+380671234567');
  assert.equal('productId' in payload, false);
  assert.equal('productVariantId' in payload, false);
  assert.equal('productName' in payload, false);
  assert.equal('quantity' in payload, false);
  assert.equal(payload.source, 'Лендинг 3');
  assert.equal(payload.landingId, 'landing-4');
  assert.equal(payload.requestId, requestId);
  assert.equal('comment' in payload, false);
  assert.equal('price' in payload, false);
  assert.equal(payload.customerName, valid.name);
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('requires HTTP success, explicit boolean success and a CRM order ID', async () => {
  for (const [status, body] of [[500, { success: true, orderId: 'id' }], [200, { success: false }], [200, { success: 'true', orderId: 'id' }], [200, { success: true }], [200, { success: true, orderId: '' }], [200, null]]) {
    global.fetch = async () => Response.json(body, { status });
    const response = await POST(request());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
  }
});

test('non-JSON upstream responses, timeout and network errors never become success', async () => {
  for (const fetcher of [async () => new Response('not json'), async () => { throw new DOMException('Timeout', 'TimeoutError'); }, async () => { throw new Error('Network failed'); }]) {
    global.fetch = fetcher;
    assert.equal((await POST(request())).status, 502);
  }
});

test('retry preserves the CRM requestId and does not perform automatic retries', async () => {
  global.fetch = async (...args) => { calls.push(args); throw new Error('Network failed'); };
  await POST(request());
  assert.equal(calls.length, 1);
  await POST(request());
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[0][1].body).requestId, JSON.parse(calls[1][1].body).requestId);
});

test('blank/oversized landingId and insecure CRM endpoints fail before sending', async () => {
  for (const id of [' ', 'x'.repeat(121)]) {
    process.env.LANDING_ID = id;
    assert.equal((await POST(request())).status, 503);
  }
  process.env.LANDING_ID = 'landing-4';
  for (const endpoint of ['http://crm.invalid/api/leads', 'https://user:password@crm.invalid/api/leads', 'not-a-url']) {
    process.env.CRM_LEADS_ENDPOINT = endpoint;
    assert.equal((await POST(request())).status, 503);
  }
  assert.equal(calls.length, 0);
});

test('CRM authorization, registry and rate-limit errors never report success or expose upstream details', async () => {
  for (const status of [401, 403, 404, 422, 429, 503]) {
    global.fetch = async () => Response.json({ success: false, error: 'private-upstream-detail' }, { status });
    const response = await POST(request());
    assert.equal(response.status, 502);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.ok(!JSON.stringify(result).includes('private-upstream-detail'));
    assert.ok(!JSON.stringify(result).includes('unit-test-key'));
  }
});

test('name validation, phone normalization and SEO without an invented domain', () => {
  assert.deepEqual(order.validateOrder({ name: 'Анна-Марія', phone: '+380 (67) 123-45-67' }), {});
  assert.equal(order.prepareOrder(valid).phone, '+380671234567');
  const site = load('src/lib/site.ts');
  const robots = load('src/app/robots.ts', { '@/lib/site': site }).default;
  const sitemap = load('src/app/sitemap.ts', { '@/lib/site': site }).default;
  assert.equal(site.getSiteUrl(), undefined);
  assert.deepEqual(sitemap(), []);
  assert.equal('sitemap' in robots(), false);
  const product = site.productStructuredData();
  assert.equal(product.offers.price, '299');
  assert.equal('availability' in product.offers, false);
  assert.equal('aggregateRating' in product, false);
  assert.equal('url' in product, false);
  process.env.SITE_URL = 'https://seo-test.invalid';
  assert.equal(site.productStructuredData().url, 'https://seo-test.invalid/');
  assert.deepEqual(sitemap(), [{url: 'https://seo-test.invalid/'}]);
  assert.equal(robots().sitemap, 'https://seo-test.invalid/sitemap.xml');
  process.env.SITE_URL = 'not-a-url';
  assert.throws(() => site.getSiteUrl());
});
