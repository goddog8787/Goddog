import type { Firestore } from 'firebase-admin/firestore';
import { ALL_MARKET_PRODUCTS } from '../data/allMarketProducts';
import type { FilamentProduct } from '../types';

interface CartLine {
  productId: string;
  color: string;
  quantity: number;
}

interface InventoryHold {
  orderId: string;
  expiresAt: number;
  lines: CartLine[];
}

export interface CheckoutInventory {
  amount: number;
  lines: CartLine[];
  paid?: { tradeNo: string; payTime: string; paymentType: string };
}

const initialProducts = new Map(ALL_MARKET_PRODUCTS.map(product => [product.id, product]));

export function parseInventoryLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || !input.length || input.length > 50) return null;
  const lines: CartLine[] = [];
  for (const value of input) {
    if (!value || typeof value.productId !== 'string' ||
        !/^[a-zA-Z0-9_-]{1,120}$/.test(value.productId) ||
        typeof value.color !== 'string' || !value.color.trim() || value.color.length > 100 ||
        !Number.isSafeInteger(value.quantity) || value.quantity < 1 || value.quantity > 999) return null;
    lines.push({ productId: value.productId, color: value.color, quantity: value.quantity });
  }
  return lines;
}

export function applyPaidQuantities(product: FilamentProduct, lines: CartLine[]) {
  const orderedColors = new Map<string, number>();
  let quantity = 0;
  for (const line of lines) {
    orderedColors.set(line.color, (orderedColors.get(line.color) ?? 0) + line.quantity);
    quantity += line.quantity;
  }
  return {
    stock: product.stock - quantity,
    colors: product.colors.map(color => ({ ...color, stock: color.stock - (orderedColors.get(color.name) ?? 0) })),
  };
}

function groupLines(lines: CartLine[]) {
  const groups = new Map<string, CartLine[]>();
  for (const line of lines) {
    const batch = groups.get(line.productId) ?? [];
    batch.push(line);
    groups.set(line.productId, batch);
  }
  return groups;
}

export class InventoryConflict extends Error {}

export async function rememberCheckout(
  db: Firestore, orderId: string, amount: number, lines: CartLine[], expiresAt: number,
) {
  await db.runTransaction(async tx => {
    const order = db.collection('paymentInventory').doc(orderId);
    const existing = await tx.get(order);
    if (existing.exists) throw new InventoryConflict('這個付款單號已使用，請重新結帳。');

    const groups = groupLines(lines);
    const productRefs = Array.from(groups.keys(), id => db.collection('products').doc(id));
    const holdRefs = Array.from(groups.keys(), id => db.collection('paymentInventoryHolds').doc(id));
    const snapshots = await tx.getAll(...productRefs, ...holdRefs);
    const documents = snapshots.slice(0, productRefs.length);
    const now = Date.now();
    if (expiresAt <= now) throw new InventoryConflict('付款期限已過，請重新結帳。');
    for (const [index, doc] of documents.entries()) {
      const product = doc.exists ? doc.data() as FilamentProduct & { _isDeleted?: boolean } : initialProducts.get(doc.id);
      const batch = groups.get(doc.id)!;
      if (!product || ('_isDeleted' in product && product._isDeleted) ||
          !Array.isArray(product.colors) || batch.some(line => !product.colors.some(color => color.name === line.color))) {
        throw new InventoryConflict('購物車內的商品或顏色已下架，請重新選購。');
      }
      const held = snapshots[productRefs.length + index];
      const active = ((held.data()?.holds ?? []) as InventoryHold[]).filter(hold => hold.expiresAt > now);
      const next = applyPaidQuantities(product, [...batch, ...active.flatMap(hold => hold.lines)]);
      if (next.stock < 0 || next.colors.some(color => color.stock < 0)) {
        throw new InventoryConflict('商品庫存不足，請更新購物車數量後再試。');
      }
      tx.set(held.ref, { holds: [...active, { orderId, expiresAt, lines: batch }] });
    }
    tx.create(order, { amount, lines, createdAt: now });
  });
}

export async function loadCheckout(db: Firestore, orderId: string): Promise<CheckoutInventory | undefined> {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(orderId)) return;
  return (await db.collection('paymentInventory').doc(orderId).get()).data() as CheckoutInventory | undefined;
}

export async function settleCheckout(
  db: Firestore, orderId: string, amount: number, paid: NonNullable<CheckoutInventory['paid']>,
) {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(orderId)) return;
  await db.runTransaction(async tx => {
    const order = db.collection('paymentInventory').doc(orderId);
    const saved = (await tx.get(order)).data() as CheckoutInventory | undefined;
    if (!saved) return; // Legacy orders did not record cart lines.
    if (saved.amount !== amount || (saved.paid && saved.paid.tradeNo !== paid.tradeNo)) {
      throw new InventoryConflict('交易資料與結帳資料不符。');
    }
    if (saved.paid) return; // ReturnURL, NotifyURL and active queries can arrive in any order.

    const groups = groupLines(saved.lines);
    const productRefs = Array.from(groups.keys(), id => db.collection('products').doc(id));
    const holdRefs = Array.from(groups.keys(), id => db.collection('paymentInventoryHolds').doc(id));
    const snapshots = await tx.getAll(...productRefs, ...holdRefs);
    const documents = snapshots.slice(0, productRefs.length);
    const now = Date.now();
    const unavailable: string[] = [];
    for (const doc of documents) {
      const product = doc.exists ? doc.data() as FilamentProduct & { _isDeleted?: boolean } : initialProducts.get(doc.id);
      const batch = groups.get(doc.id)!;
      if (!product || ('_isDeleted' in product && product._isDeleted) ||
          !Array.isArray(product.colors) || batch.some(line => !product.colors.some(color => color.name === line.color))) {
        unavailable.push(doc.id);
        continue;
      }
      const next = applyPaidQuantities(product, batch);
      if (next.stock < 0 || next.colors.some(color => color.stock < 0)) unavailable.push(doc.id);
      const stock = Math.max(0, next.stock);
      const colors = next.colors.map(color => ({ ...color, stock: Math.max(0, color.stock) }));
      const patch = { id: doc.id, stock, colors, _updatedAt: now };
      if (doc.exists) tx.update(doc.ref, patch);
      else tx.create(doc.ref, { ...product, ...patch });
    }
    for (const doc of snapshots.slice(productRefs.length)) {
      if (!doc.exists) continue;
      const holds = doc.data()?.holds as InventoryHold[];
      const active = holds.filter(hold => hold.orderId !== orderId && hold.expiresAt > now);
      if (!active.length) tx.delete(doc.ref);
      else if (active.length !== holds.length) tx.update(doc.ref, { holds: active });
    }
    tx.update(order, { paid, settledAt: now, unavailable });
  });
}
