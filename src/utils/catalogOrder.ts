import type { FilamentProduct } from '../types';

export const MAX_CATALOG_ORDER_IDS = 2000;

export interface CatalogOrder {
  productIds: string[];
  revision: number;
}

export function normalizeCatalogOrder(data: unknown): CatalogOrder {
  if (typeof data !== 'object' || data === null) return { productIds: [], revision: 0 };
  const { productIds, revision } = data as Partial<CatalogOrder>;
  return {
    productIds: Array.isArray(productIds)
      ? [...new Set(productIds.slice(0, MAX_CATALOG_ORDER_IDS).filter(id => typeof id === 'string' && id.length > 0 && id.length <= 128))]
      : [],
    revision: typeof revision === 'number' && Number.isSafeInteger(revision) && revision >= 0 ? revision : 0,
  };
}

export function orderCatalog<T extends Pick<FilamentProduct, 'id' | 'reviewsCount'>>(products: readonly T[], productIds: readonly string[]): T[] {
  const ranks = new Map(productIds.map((id, index) => [id, index]));
  return [...products].sort((a, b) => {
    const aRank = ranks.get(a.id) ?? ranks.size;
    const bRank = ranks.get(b.id) ?? ranks.size;
    return aRank - bRank || (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });
}

export function moveCatalogProduct(ids: readonly string[], id: string, position: number): string[] {
  const from = ids.indexOf(id);
  if (from < 0 || !Number.isInteger(position)) return [...ids];
  const next = [...ids];
  next.splice(from, 1);
  next.splice(Math.max(0, Math.min(position, next.length)), 0, id);
  return next;
}
