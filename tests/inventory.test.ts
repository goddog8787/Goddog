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
    const expiresAt = Date.now() + 60_000;
    await rememberCheckout(db, id, 398, lines, expiresAt);
    const paid = { tradeNo: 'fixture-123', payTime: '2026-11-20T00:00:00Z', paymentType: 'CREDIT' };
    await assert.rejects(settleCheckout(db, id, 397, paid), InventoryConflict);
    await Promise.all([settleCheckout(db, id, 398, paid), settleCheckout(db, id, 398, paid)]);
    const current = (await item.get()).data();
    assert.equal(current?.stock, 2);
    assert.deepEqual(current?.colors.map((color: { stock: number }) => color.stock), [1, 1]);
    await assert.rejects(rememberCheckout(db, id + 'x', 398, lines, expiresAt), InventoryConflict);
    assert.equal((await db.collection('paymentInventoryHolds').doc(productId).get()).exists, false);
  } finally {
    await deleteApp(app);
  }
});

test('concurrent checkouts cannot reserve the same last unit and expired holds can be replaced', {
  skip: !process.env.FIRESTORE_EMULATOR_HOST,
}, async () => {
  const app = initializeApp({ projectId: 'demo-goddog-holds' }, 'checkout-holds-test');
  try {
    const db = getFirestore(app);
    const id = 'reservation-fixture';
    const item = db.collection('products').doc(id);
    const hold = db.collection('paymentInventoryHolds').doc(id);
    const lines = [{ productId: id, color: 'White', quantity: 1 }];
    const orderId = 'GD' + Date.now();
    await item.set({ ...fixture, id });
    await hold.set({ holds: [{ orderId: 'expired', expiresAt: Date.now() - 1000, lines }] });
    const expiresAt = Date.now() + 60_000;
    const reservations = await Promise.allSettled([
      rememberCheckout(db, orderId + 'A', 199, lines, expiresAt),
      rememberCheckout(db, orderId + 'B', 199, lines, expiresAt),
    ]);
    assert.equal(reservations.filter(result => result.status === 'fulfilled').length, 1);
    assert.ok(reservations.some(result => result.status === 'rejected' && result.reason instanceof InventoryConflict));
    assert.equal((await item.get()).data()?.colors[1].stock, 1);
    assert.equal((await hold.get()).data()?.holds.length, 1);
  } finally {
    await deleteApp(app);
  }
});
