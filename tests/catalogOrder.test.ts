import test from 'node:test';
import assert from 'node:assert/strict';
import { moveCatalogProduct, normalizeCatalogOrder, orderCatalog } from '../src/utils/catalogOrder';

const products = [
  { id: 'first', reviewsCount: 8 },
  { id: 'second', reviewsCount: 6 },
  { id: 'new-item', reviewsCount: 10 },
];

test('saved positions outrank review counts and unknown products append to the published order', () => {
  assert.deepEqual(orderCatalog(products, ['missing', 'second', 'first']).map(item => item.id),
    ['second', 'first', 'new-item']);
  assert.deepEqual(orderCatalog(products, []).map(item => item.id), ['new-item', 'first', 'second']);
  assert.equal(products[0].id, 'first');
});

test('moving products targets their full catalog position and never mutates the prior draft', () => {
  const order = ['first', 'second', 'third'];
  assert.deepEqual(moveCatalogProduct(order, 'first', 2), ['second', 'third', 'first']);
  assert.deepEqual(moveCatalogProduct(order, 'third', 0), ['third', 'first', 'second']);
  assert.deepEqual(moveCatalogProduct(order, 'missing', 0), order);
  assert.deepEqual(order, ['first', 'second', 'third']);
});

test('normalization handles an absent document and obsolete or repeated IDs', () => {
  assert.deepEqual(normalizeCatalogOrder(undefined), { productIds: [], revision: 0 });
  assert.deepEqual(normalizeCatalogOrder({ productIds: [null, 'first', 0, 'first', 'second', ''], revision: 2 }),
    { productIds: ['first', 'second'], revision: 2 });
});
