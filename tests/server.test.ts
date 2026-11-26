import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer as createHttpServer } from 'node:http';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serverFile = fileURLToPath(new URL('../server.ts', import.meta.url));

test('Gemini chat uses Flash-Lite after a rate limit, timeout, or repeated 503', async () => {
  const hydrogen = 'gemini-4-hydrogen';
  const lite = 'gemini-3.1-flash-lite';
  const calls: Array<{ model: string; startedAt: number }> = [];
  let statuses: number[] = [];
  const gateway = createHttpServer((req, res) => {
    const model = req.url?.match(/models\/([^:]+)/)?.[1] ?? '';
    const streaming = req.url?.includes(':streamGenerateContent');
    calls.push({ model, startedAt: performance.now() });
    req.resume();
    const status = statuses.shift() ?? 200;
    if (status !== 200) {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { code: status, message: 'Simulated upstream error' } }));
      return;
    }
    const payload = JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Gemini smoke test' }] } }] });
    res.writeHead(200, { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' });
    res.end(streaming ? `data: ${payload}\n\n` : payload);
  });
  gateway.listen(0, '127.0.0.1');
  await once(gateway, 'listening');
  const addr = gateway.address();
  assert.ok(addr && typeof addr !== 'string');
  try {
    await withServer(false, async base => {
      async function ask(model?: string, stream = true) {
        return fetch(base + `/api/ai/chat${stream ? '/stream' : ''}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Test cloud reply', model }),
        });
      }
      async function checkStream(requested?: string) {
        const response = await ask(requested);
        assert.equal(response.status, 200);
        return await response.text();
      }
      const attemptedModels = () => calls.splice(0).map(call => call.model);

      for (let i = 0; i < 2; i++) {
        const reply = await checkStream();
        assert.match(reply, /"source":"gemini","modelId":"gemini-3\.1-flash-lite"/);
        assert.match(reply, /Gemini smoke test/);
        assert.doesNotMatch(reply, /fallbackFrom/);
        assert.deepEqual(attemptedModels(), [lite]);
      }

      statuses = [503, 200];
      const recovered = await checkStream(hydrogen);
      assert.match(recovered, /"modelId":"gemini-4-hydrogen"/);
      assert.doesNotMatch(recovered, /fallbackFrom/);
      assert.ok(calls[1].startedAt - calls[0].startedAt >= 300, 'A 503 retry waits briefly');
      assert.deepEqual(attemptedModels(), [hydrogen, hydrogen]);

      statuses = [503, 503, 200];
      const fallback = await checkStream(hydrogen);
      assert.match(fallback, /"modelId":"gemini-3\.1-flash-lite".*"fallbackFrom":"gemini-4-hydrogen"/);
      assert.match(fallback, /Gemini smoke test/);
      assert.deepEqual(attemptedModels(), [hydrogen, hydrogen, lite]);

      statuses = [503, 503, 200];
      const response = await ask(hydrogen, false);
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.equal(data.modelId, lite);
      assert.equal(data.fallbackFrom, hydrogen);
      assert.equal(data.reply, 'Gemini smoke test');
      assert.deepEqual(attemptedModels(), [hydrogen, hydrogen, lite]);

      for (const scenario of [
        { responses: [429, 200], expected: [hydrogen, lite] },
        { responses: [503, 429, 200], expected: [hydrogen, hydrogen, lite] },
        { responses: [504, 200], expected: [hydrogen, lite] },
      ]) {
        statuses = scenario.responses;
        const recovered = await checkStream(hydrogen);
        assert.match(recovered, /"modelId":"gemini-3\.1-flash-lite".*"fallbackFrom":"gemini-4-hydrogen"/);
        assert.match(recovered, /Gemini smoke test/);
        assert.deepEqual(attemptedModels(), scenario.expected);
      }

      const publicStatus = await fetch(base + '/api/ai/status');
      assert.equal(publicStatus.status, 200);
      const guestProbe = await fetch(base + '/api/ai/status?probe=gemini-4-hydrogen');
      assert.equal(guestProbe.status, 401);
      assert.deepEqual(attemptedModels(), []);

      for (const scenario of [
        { model: hydrogen, failures: [503, 503, 503], expected: [hydrogen, hydrogen, lite] },
        { model: hydrogen, failures: [429, 429], expected: [hydrogen, lite] },
        { model: lite, failures: [429], expected: [lite] },
        { model: lite, failures: [503, 503], expected: [lite, lite] },
      ]) {
        statuses = scenario.failures;
        const failed = await checkStream(scenario.model);
        assert.match(failed, /MODEL_UNAVAILABLE/);
        assert.doesNotMatch(failed, /modelUsed|Gemini smoke test/);
        assert.deepEqual(attemptedModels(), scenario.expected);
      }
    }, { GEMINI_API_KEY: 'local-test-key', GOOGLE_GEMINI_BASE_URL: `http://127.0.0.1:${addr.port}` });
  } finally {
    gateway.closeAllConnections();
    await new Promise<void>(resolve => gateway.close(() => resolve()));
  }
});

async function withServer(configured: boolean, run: (base: string, values: string[]) => Promise<void>, deployment: NodeJS.ProcessEnv = {}) {
  const workDir = await mkdtemp(path.join(tmpdir(), 'goddog-test-'));
  const portProbe = createServer();
  portProbe.listen(0, '127.0.0.1');
  await once(portProbe, 'listening');
  const address = portProbe.address();
  assert.ok(address && typeof address !== 'string');
  await new Promise<void>(resolve => portProbe.close(() => resolve()));
  await mkdir(path.join(workDir, 'dist/assets'), { recursive: true });
  await writeFile(path.join(workDir, 'dist/index.html'), '<!doctype html><title>Store</title>');
  await writeFile(path.join(workDir, 'dist/assets/app-aB1cD2eF.js'), 'export default 1;');

  const testHashKey = randomBytes(16).toString('hex');
  const testHashIV = randomBytes(8).toString('hex');
  const keyPath = path.join(workDir, 'sandbox-key');
  const ivPath = path.join(workDir, 'sandbox-iv');
  if (configured) {
    await writeFile(keyPath, testHashKey, { mode: 0o600 });
    await writeFile(ivPath, testHashIV, { mode: 0o600 });
  }

  const child = spawn(process.execPath, ['--import', import.meta.resolve('tsx'), serverFile], {
    cwd: workDir,
    env: {
      ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(address.port),
      FIRESTORE_AI_BRIDGE_ENABLED: 'false', GEMINI_API_KEY: '', RESEND_API_KEY: '',
      NEWEBPAY_ENV: 'sandbox', NEWEBPAY_MERCHANT_ID: configured ? 'TESTSHOP' : '',
      NEWEBPAY_HASH_KEY: '', NEWEBPAY_HASH_IV: '',
      NEWEBPAY_HASH_KEY_FILE: configured ? keyPath : '',
      NEWEBPAY_HASH_IV_FILE: configured ? ivPath : '',
      RENDER_EXTERNAL_URL: '', PAYMENT_API_ORIGIN: '', ...deployment,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', chunk => { errors += chunk.toString(); });
  const exited = once(child, 'exit');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const deadline = Date.now() + 15000;
    while (!(await fetch(base + '/api/health').then(r => r.ok, () => false))) {
      assert.ok(child.exitCode === null && Date.now() < deadline, 'Server did not start. ' + errors);
      await delay(50);
    }
    await run(base, [testHashKey, testHashIV]);
  } finally {
    child.kill('SIGTERM');
    await exited;
    await rm(workDir, { recursive: true, force: true });
  }
}

function sampleCheckout(base: string) {
  return fetch(base + '/api/payment/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 199, orderId: 'GDTEST000123', desc: 'Test item', paymentMethod: 'credit_card', returnFrom: 'checkout' }),
  });
}

test('a configured server prepares a sandbox checkout without calling the gateway', async () => {
  await withServer(true, async (base, secrets) => {
    const response = await sampleCheckout(base);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.ok(secrets.every(secret => !body.includes(secret)));
    const data = JSON.parse(body);
    assert.equal(data.orderId, 'GDTEST000123');
    assert.equal(data.url, 'https://ccore.newebpay.com/MPG/mpg_gateway');
    assert.deepEqual(Object.keys(data.formParams).sort(), ['MerchantID', 'TradeInfo', 'TradeSha', 'Version']);
  });
});

test('a storefront without payment configuration serves its pages and reports checkout as unavailable', async () => {
  await withServer(false, async base => {
    assert.equal((await sampleCheckout(base)).status, 503);
    assert.deepEqual(await fetch(base + '/api/payment/config-status').then(r => r.json()), { configured: false, sandbox: true });
    for (const route of ['/', '/blog']) {
      const page = await fetch(base + route);
      assert.equal(page.status, 200);
      assert.equal(page.headers.get('cache-control'), 'no-cache');
      assert.match(await page.text(), /<title>Store<\/title>/);
    }
    const asset = await fetch(base + '/assets/app-aB1cD2eF.js');
    assert.match(asset.headers.get('cache-control') || '', /immutable/);
    assert.equal((await fetch(base + '/api/payment/verified-orders')).status, 401);
    assert.equal((await fetch(base + '/api/payment/period-renewal', { method: 'POST' })).status, 401);
    assert.equal((await fetch(base + '/api/catalog/sync', { method: 'POST' })).status, 401);
  });
});

test('Firebase Auth receives public web configuration instead of storefront HTML', async () => {
  await withServer(false, async base => {
    const url = base + '/__/firebase/init.json';
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    const config = await response.json();
    assert.equal(config.apiKey, 'public-test-firebase-key');
    assert.equal(config.projectId, 'goddog-shop');
    assert.equal(config.authDomain, 'goddog-shop.firebaseapp.com');
    assert.deepEqual(Object.keys(config).sort(), [
      'apiKey', 'appId', 'authDomain', 'measurementId', 'messagingSenderId', 'projectId', 'storageBucket',
    ]);
    assert.equal((await fetch(url, { method: 'HEAD' })).status, 200);
    const post = await fetch(url, { method: 'POST' });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get('allow'), 'GET, HEAD');
  }, {
    VITE_FIREBASE_API_KEY: 'public-test-firebase-key',
    VITE_FIREBASE_PROJECT_ID: 'goddog-shop',
    VITE_FIREBASE_AUTH_DOMAIN: 'goddog-shop.firebaseapp.com',
  });
});

test('the canonical Render deployment keeps the production gateway and uses its own callback origin', async () => {
  await withServer(true, async (base, [key, iv]) => {
    const response = await sampleCheckout(base);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.url, 'https://core.newebpay.com/MPG/mpg_gateway');

    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    const rawFields = decipher.update(data.formParams.TradeInfo, 'hex', 'utf8') + decipher.final('utf8');
    const fields = new URLSearchParams(rawFields);
    assert.equal(fields.get('ReturnURL'), 'https://goddog.onrender.com/api/payment/return');
    assert.equal(fields.get('NotifyURL'), 'https://goddog.onrender.com/api/payment/notify');
  }, { NEWEBPAY_ENV: '', RENDER_EXTERNAL_URL: 'https://goddog.onrender.com' });
});

test('an explicit sandbox setting overrides the canonical Render deployment default', async () => {
  await withServer(true, async base => {
    const response = await sampleCheckout(base);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).url, 'https://ccore.newebpay.com/MPG/mpg_gateway');
  }, { NEWEBPAY_ENV: 'sandbox', RENDER_EXTERNAL_URL: 'https://goddog.onrender.com' });
});

test('a test payment callback updates shared inventory even without a browser return', {
  skip: !process.env.FIRESTORE_EMULATOR_HOST,
}, async () => {
  const projectId = 'demo-goddog-payment-e2e';
  const app = initializeApp({ projectId }, 'callback-test');
  try {
    const db = getFirestore(app);
    const product = db.collection('products').doc('callback-fixture');
    await product.set({ id: product.id, name: 'Test filament', price: 199, stock: 2, colors: [
      { name: 'Black', hex: '#000000', stock: 2 },
    ] });
    await withServer(true, async (base, [key, iv]) => {
      assert.deepEqual(await fetch(base + '/api/payment/inventory-status').then(r => r.json()), { ready: true });
      const orderId = 'GD' + Date.now();
      const start = await fetch(base + '/api/payment/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: 199, returnFrom: 'checkout', inventoryLines: [
          { productId: product.id, color: 'Black', quantity: 1 },
        ] }),
      });
      assert.equal(start.status, 200);

      const cipher = createCipheriv('aes-256-cbc', key, iv);
      const clear = JSON.stringify({ Status: 'SUCCESS', Result: {
        MerchantID: 'TESTSHOP', MerchantOrderNo: orderId, TradeNo: 'fixture-transaction', Amt: 199,
      } });
      const TradeInfo = cipher.update(clear, 'utf8', 'hex') + cipher.final('hex');
      const TradeSha = createHash('sha256').update(`HashKey=${key}&${TradeInfo}&HashIV=${iv}`).digest('hex').toUpperCase();
      const notify = () => fetch(base + '/api/payment/notify', {
        method: 'POST', body: new URLSearchParams({ TradeInfo, TradeSha }),
      });
      for (const response of await Promise.all([notify(), notify()])) {
        assert.equal(response.status, 200);
        assert.equal(await response.text(), '1|OK');
      }
      const checked = await fetch(base + '/api/payment/verify-status?orderId=' + orderId);
      assert.equal(checked.status, 200);
      const verified = await checked.json();
      assert.equal(verified.isPaid, true);
      assert.equal(verified.order.amt, 199);
      assert.ok(!('rawResult' in verified.order));
      const data = (await product.get()).data();
      assert.equal(data?.stock, 1);
      assert.equal(data?.colors[0].stock, 1);
    }, { VITE_FIREBASE_PROJECT_ID: projectId, VITE_FIREBASE_DATABASE_ID: '(default)' });
  } finally {
    await deleteApp(app);
  }
});

test('unknown API routes return a JSON 404 instead of the storefront', async () => {
  await withServer(false, async base => {
    for (const endpoint of ['/api', '/api/missing-fixture']) {
      const result = await fetch(base + endpoint);
      assert.equal(result.status, 404);
      assert.match(result.headers.get('content-type') ?? '', /application\/json/);
      assert.equal((await result.json()).error, 'API endpoint not found');
    }
  });
});

test('contact responds with validation and configuration errors without claiming delivery', async () => {
  await withServer(false, async base => {
    const send = (body: unknown) => fetch(base + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const malformed = await send({ name: 'Fixture', email: 'shop@example.test', message: [] });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).success, false);

    const unconfigured = await send({ name: 'Fixture', email: 'shop@example.test', message: 'Isolated test' });
    assert.equal(unconfigured.status, 503);
    assert.equal((await unconfigured.json()).success, false);
  });
});
