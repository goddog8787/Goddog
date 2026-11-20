import assert from 'node:assert/strict';
import test from 'node:test';
import { ALL_MARKET_PRODUCTS } from '../src/data/allMarketProducts';
import { hasBlogArticleAnimation, loadBlogArticleAnimation } from '../src/data/blogAnimations';
import { evaluateProductDeepSearch, prepareProductSearch } from '../src/utils/productSearch';

test('prepared and direct queries give identical rankings and feature matches', () => {
  for (const raw of ['', ' PLA ', 'PETG AMS', '耐熱', 'esun matte', 'unmatched-xyz']) {
    const query = prepareProductSearch(raw);
    for (const product of ALL_MARKET_PRODUCTS) {
      assert.deepEqual(evaluateProductDeepSearch(product, query), evaluateProductDeepSearch(product, raw));
    }
  }
  assert.ok(ALL_MARKET_PRODUCTS.some(product => evaluateProductDeepSearch(product, 'PETG').matched));
  assert.ok(ALL_MARKET_PRODUCTS.every(product => !evaluateProductDeepSearch(product, 'unmatched-xyz').matched));
});

test('every advertised interactive article resolves to its own simulation', async () => {
  const titles = new Set<string>();
  for (let id = 1; id <= 18; id++) {
    assert.equal(hasBlogArticleAnimation(id), true);
    const entry = await loadBlogArticleAnimation(id);
    assert.ok(entry?.html.includes('<!DOCTYPE html>'));
    titles.add(entry.title);
  }
  assert.equal(titles.size, 18);
  for (const id of [-1, 0, 1.5, 19]) {
    assert.equal(hasBlogArticleAnimation(id), false);
    assert.equal(await loadBlogArticleAnimation(id), null);
  }
});
