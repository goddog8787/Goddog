import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
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
