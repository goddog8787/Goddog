import assert from 'node:assert/strict';
import test from 'node:test';
import type { CartItem, FilamentProduct } from '../src/types';
import { INITIAL_PRODUCTS } from '../src/data/mockData';
import { cartStockRemaining, isCartLineAvailable, refreshCartItems } from '../src/utils/cartStock';
import { translateColorName } from '../src/utils/i18n';

const [original] = INITIAL_PRODUCTS;
const product: FilamentProduct = {
  ...original,
  stock: 4,
  colors: [
    { name: '消光極地白 Matte White', hex: '#fff', stock: 2 },
    { name: '黑色 Black', hex: '#000', stock: 4 },
  ],
};
const white = product.colors[0];
const black = product.colors[1];
const catalog = new Map([[product.id, product]]);

function line(color: CartItem['selectedColor'], quantity: number, selectedDiameter: CartItem['selectedDiameter'] = '1.75mm'): CartItem {
  return { product, selectedColor: color, quantity, selectedDiameter };
}

test('cart stock shares a color across diameters and product stock across colors', () => {
  const cart = [line(white, 2, '2.85mm'), line(black, 1)];
  assert.equal(cartStockRemaining(cart, product, white), 0);
  assert.equal(cartStockRemaining(cart, product, black), 1);
  assert.equal(cartStockRemaining(cart, product, black, 0), 3);
  assert.equal(isCartLineAvailable(cart, 0, catalog), true);
  assert.equal(isCartLineAvailable([...cart, line(black, 2)], 2, catalog), false);
  assert.equal(isCartLineAvailable([line(white, 1.5)], 0, catalog), false);
  assert.equal(isCartLineAvailable([line(white, 1)], 0, new Map()), false);
});

test('saved display colors use current catalog names, prices and stock before checkout', () => {
  const saved = line({ ...white, stock: 90, name: translateColorName(white.name, 'en') }, 3);
  assert.notEqual(saved.selectedColor.name, white.name);
  const [refreshed] = refreshCartItems([{ ...saved, product: { ...product, price: 1, stock: 90 } }], catalog);
  assert.equal(refreshed.product.price, product.price);
  assert.equal(refreshed.selectedColor, white);
  assert.equal(isCartLineAvailable([refreshed], 0, catalog), false);
  assert.equal(isCartLineAvailable([{ ...refreshed, quantity: 2 }], 0, catalog), true);
  const merged = refreshCartItems([saved, line(white, 1)], catalog);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, 4);
  assert.equal(saved.quantity, 3);
});
