import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { MAX_CATALOG_ORDER_IDS, normalizeCatalogOrder, type CatalogOrder } from '../utils/catalogOrder';

export class CatalogOrderConflict extends Error {
  constructor() {
    super('A newer catalog order has already been saved.');
  }
}

export function subscribeToCatalogOrder(onChange: (order: CatalogOrder) => void, onError: () => void) {
  return onSnapshot(doc(db, 'settings', 'catalog_order'), snapshot => {
    onChange(normalizeCatalogOrder(snapshot.data()));
  }, onError);
}

export async function saveCatalogOrder(productIds: string[], expectedRevision: number): Promise<CatalogOrder> {
  if (productIds.length > MAX_CATALOG_ORDER_IDS) throw new Error('Catalog order is too large.');
  const ref = doc(db, 'settings', 'catalog_order');
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    const existing = normalizeCatalogOrder(snapshot.data());
    if (existing.revision !== expectedRevision) throw new CatalogOrderConflict();
    const next = normalizeCatalogOrder({ productIds, revision: existing.revision + 1 });
    transaction.set(ref, next);
    return next;
  });
}
