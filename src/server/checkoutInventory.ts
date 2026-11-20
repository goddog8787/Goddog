import type { Firestore } from 'firebase-admin/firestore';
import { ALL_MARKET_PRODUCTS } from '../data/allMarketProducts';
import type { FilamentProduct } from '../types';

interface CartLine {
  productId: string;
  color: string;
  quantity: number;
}

interface CheckoutInventory {
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

export async function rememberCheckout(db: Firestore, orderId: string, amount: number, lines: CartLine[]) {
  await db.runTransaction(async tx => {
    const order = db.collection('paymentInventory').doc(orderId);
    const existing = await tx.get(order);
    if (existing.exists) throw new InventoryConflict('這個付款單號已使用，請重新結帳。');

    const groups = groupLines(lines);
    const documents = await tx.getAll(...Array.from(groups.keys(), id => db.collection('products').doc(id)));
    for (const doc of documents) {
      const product = doc.exists ? doc.data() as FilamentProduct & { _isDeleted?: boolean } : initialProducts.get(doc.id);
      const batch = groups.get(doc.id)!;
      if (!product || ('_isDeleted' in product && product._isDeleted) ||
          !Array.isArray(product.colors) || batch.some(line => !product.colors.some(color => color.name === line.color))) {
        throw new InventoryConflict('購物車內的商品或顏色已下架，請重新選購。');
      }
      const next = applyPaidQuantities(product, batch);
      if (next.stock < 0 || next.colors.some(color => color.stock < 0)) {
        throw new InventoryConflict('商品庫存不足，請更新購物車數量後再試。');
      }
    }
    tx.create(order, { amount, lines, createdAt: Date.now() });
  });
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
    const documents = await tx.getAll(...Array.from(groups.keys(), id => db.collection('products').doc(id)));
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
      const patch = { id: doc.id, stock, colors, _updatedAt: Date.now() };
      if (doc.exists) tx.update(doc.ref, patch);
      else tx.create(doc.ref, { ...product, ...patch });
    }
    tx.update(order, { paid, settledAt: Date.now(), unavailable });
  });
}
