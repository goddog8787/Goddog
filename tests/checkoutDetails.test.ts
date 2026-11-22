import assert from 'node:assert/strict';
import test from 'node:test';
import { checkoutPointLimit, checkoutShippingFee, isValidTaiwanTaxId, parseTaiwanAddress } from '../src/utils/checkoutDetails';
import { chooseCustomerListSource } from '../src/utils/customerListSync';
import { waitForCatalogCloudSync } from '../src/utils/catalogSyncResult';

test('checkout uses the established pickup, home delivery, and island prices', () => {
  assert.equal(checkoutShippingFee('UNIMARTC2C', 998, false), 65);
  assert.equal(checkoutShippingFee('FAMIC2C', 999, false), 0);
  assert.equal(checkoutShippingFee('HOME', 1499, false), 100);
  assert.equal(checkoutShippingFee('HOME', 1500, false), 0);
  assert.equal(checkoutShippingFee('HOME', 1500, false, true), 60);
  assert.equal(checkoutShippingFee('UNIMARTC2C', 999, false, true), 40);
  assert.equal(checkoutShippingFee('HOME', 1499, true, true), 0);
  assert.equal(checkoutPointLimit(200, 899), 89);
  assert.equal(checkoutPointLimit(30, 899), 30);
  assert.equal(checkoutPointLimit(undefined, 899), 0);
});

test('the address parser recognizes 台 and 臺 spellings and incomplete addresses', () => {
  const address = parseTaiwanAddress('台北市 中正區 測試路 123 號');
  assert.ok(address.city === '臺北市' || address.city === '台北市');
  assert.equal(address.district, '中正區');
  assert.equal(address.street, '測試路 123 號');
  assert.equal(parseTaiwanAddress('台北市中正區').street, '');
  assert.equal(parseTaiwanAddress('測試路 123 號').city, '');
  assert.equal(isValidTaiwanTaxId('00000001'), false);
});

test('a newer list removal or clear stays in effect on another device', () => {
  assert.equal(chooseCustomerListSource(2, { updatedAtMs: 200 }, 3, { updatedAtMs: 100 }), 'local');
  assert.equal(chooseCustomerListSource(3, { updatedAtMs: 100 }, 2, { updatedAtMs: 200 }), 'cloud');
  assert.equal(chooseCustomerListSource(0, { updatedAtMs: 200, explicitClear: true }, 2, { updatedAtMs: 100 }), 'local');
  assert.equal(chooseCustomerListSource(3, { updatedAtMs: 100 }, 0, { updatedAtMs: 200, explicitClear: true }), 'cloud');
  assert.equal(chooseCustomerListSource(3, { updatedAtMs: 100 }, 0, { updatedAtMs: 200 }), 'local');
});

test('admin sync reports rejected and unconfirmed writes as unconfirmed', async () => {
  assert.equal(await waitForCatalogCloudSync(Promise.resolve(true)), true);
  assert.equal(await waitForCatalogCloudSync(Promise.resolve(false)), false);
  assert.equal(await waitForCatalogCloudSync(Promise.reject(new Error('Denied in fixture'))), false);
  assert.equal(await waitForCatalogCloudSync(new Promise(() => {}), 1), false);
});
