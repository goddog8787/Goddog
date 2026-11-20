import assert from 'node:assert/strict';
import test from 'node:test';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { applyPaidQuantities, InventoryConflict, parseInventoryLines, rememberCheckout, settleCheckout } from '../src/server/checkoutInventory';
import type { FilamentProduct } from '../src/types';

const productId = 'inventory-fixture';
const fixture = { id: productId, name: 'Test filament', price: 199, stock: 4, colors: [
  { name: 'Black', hex: '#000000', stock: 3 },
  { name: 'White', hex: '#ffffff', stock: 1 },
] } as FilamentProduct;

test('inventory counts multiple lines for the same color and preserves other variants', () => {
  const lines = parseInventoryLines([
    { productId, color: 'Black', quantity: 1 },
    { productId, color: 'Black', quantity: 2 },
  ]);
  assert.ok(lines);
  const next = applyPaidQuantities(fixture, lines);
  assert.equal(next.stock, 1);
  assert.deepEqual(next.colors.map(color => color.stock), [0, 1]);
  assert.equal(fixture.stock, 4);
  assert.equal(parseInventoryLines([{ productId, color: 'Black', quantity: -1 }]), null);
  assert.equal(parseInventoryLines([]), null);
});

test('Firestore applies one shared inventory deduction when payment confirmation repeats', {
  skip: !process.env.FIRESTORE_EMULATOR_HOST,
}, async () => {
  const app = initializeApp({ projectId: 'demo-goddog-inventory' }, 'inventory-test');
  try {
    const db = getFirestore(app);
    const item = db.collection('products').doc(productId);
    await item.set(fixture);
    const lines = [{ productId, color: 'Black', quantity: 2 }];
    const id = 'GD' + Date.now();
    await rememberCheckout(db, id, 398, lines);
    const paid = { tradeNo: 'fixture-123', payTime: '2026-11-20T00:00:00Z', paymentType: 'CREDIT' };
    await assert.rejects(settleCheckout(db, id, 397, paid), InventoryConflict);
    await Promise.all([settleCheckout(db, id, 398, paid), settleCheckout(db, id, 398, paid)]);
    const current = (await item.get()).data();
    assert.equal(current?.stock, 2);
    assert.deepEqual(current?.colors.map((color: { stock: number }) => color.stock), [1, 1]);
    await assert.rejects(rememberCheckout(db, id + 'x', 398, lines), InventoryConflict);
  } finally {
    await deleteApp(app);
  }
});
