import type { CartItem, ColorOption, FilamentProduct } from '../types';
import { translateColorName } from './i18n';

export function isProductInStock(product: FilamentProduct): boolean {
  return Number.isFinite(product.stock) && product.stock >= 1 &&
    Boolean(product.colors?.some(color => Number.isFinite(color.stock) && color.stock >= 1));
}

export function resolveCartColor(product: FilamentProduct, name: string): ColorOption | undefined {
  const exact = product.colors?.find(color => color.name === name);
  if (exact) return exact;
  const aliases = product.colors?.filter(color =>
    (['zh-TW', 'en', 'ja'] as const).some(lang => translateColorName(color.name, lang) === name)
  );
  return aliases?.length === 1 ? aliases[0] : undefined;
}

export function refreshCartItems(items: CartItem[], catalog: Map<string, FilamentProduct>): CartItem[] {
  const currentItems: CartItem[] = [];
  for (const item of items) {
    const product = catalog.get(item.product.id);
    const color = product && resolveCartColor(product, item.selectedColor.name);
    if (!product || !color) {
      currentItems.push(product ? { ...item, product } : item);
      continue;
    }
    const existing = currentItems.find(entry =>
      entry.product.id === product.id && entry.selectedColor.name === color.name &&
      entry.selectedDiameter === item.selectedDiameter
    );
    if (existing) existing.quantity += item.quantity;
    else currentItems.push({ ...item, product, selectedColor: color });
  }
  return currentItems;
}

export function cartStockRemaining(items: CartItem[], product: FilamentProduct, color: ColorOption, ignoreIndex = -1): number {
  let productRemaining = product.stock;
  let colorRemaining = color.stock;
  for (const [index, item] of items.entries()) {
    if (index === ignoreIndex || item.product.id !== product.id) continue;
    productRemaining -= item.quantity;
    if (item.selectedColor.name === color.name) colorRemaining -= item.quantity;
  }
  const remaining = Math.min(productRemaining, colorRemaining);
  return Number.isFinite(remaining) ? Math.max(0, Math.floor(remaining)) : 0;
}

export function isCartLineAvailable(items: CartItem[], index: number, catalog: Map<string, FilamentProduct>): boolean {
  const item = items[index];
  const product = catalog.get(item.product.id);
  if (!product) return false;
  const color = resolveCartColor(product, item.selectedColor.name);
  return Boolean(color && Number.isSafeInteger(item.quantity) && item.quantity > 0 &&
    item.quantity <= cartStockRemaining(items, product, color, index));
}
