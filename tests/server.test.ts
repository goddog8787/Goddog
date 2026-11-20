import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const serverFile = fileURLToPath(new URL('../server.ts', import.meta.url));

async function withServer(configured: boolean, run: (base: string, values: string[]) => Promise<void>) {
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
    body: JSON.stringify({ amount: 199, orderId: 'GDTEST000123', desc: 'Test item', paymentMethod: 'credit_card' }),
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
