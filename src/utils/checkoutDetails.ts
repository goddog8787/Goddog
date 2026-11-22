import { TAIWAN_CITIES } from '../data/taiwanDistricts';
import type { ShippingMethod } from '../types';

export const CHECKOUT_CVS_FREE_THRESHOLD = 999;
export const CHECKOUT_HOME_FREE_THRESHOLD = 1500;

export function checkoutShippingFee(method: ShippingMethod, subtotal: number, freeShipping: boolean, island = false): number {
  if (freeShipping) return 0;
  const home = method === 'HOME' || method === 'blackcat';
  const base = subtotal >= (home ? CHECKOUT_HOME_FREE_THRESHOLD : CHECKOUT_CVS_FREE_THRESHOLD) ? 0 : (home ? 100 : 65);
  return base + (island ? (home ? 60 : 40) : 0);
}

export function checkoutPointLimit(points: number | undefined, subtotal: number): number {
  const balance = typeof points === 'number' && Number.isFinite(points) ? Math.floor(points) : 0;
  return Math.max(0, Math.min(balance, Math.floor(subtotal * 0.1)));
}

export function parseTaiwanAddress(rawAddress: string): { city: string; district: string; street: string } {
  const trimmed = rawAddress.trim();
  const city = TAIWAN_CITIES.find(entry => trimmed.replace(/^台/, '臺').startsWith(entry.city.replace(/^台/, '臺')));
  if (!city) return { city: '', district: '', street: trimmed };
  const rest = trimmed.slice(city.city.length).trimStart();
  const district = city.districts.find(entry => rest.replace(/^台/, '臺').startsWith(entry.name.replace(/^台/, '臺')));
  return { city: city.city, district: district?.name ?? '', street: rest.slice(district?.name.length ?? 0).trim() };
}

export function isValidTaiwanTaxId(taxId: string): boolean {
  if (!/^\d{8}$/.test(taxId)) return false;
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  const sum = weights.reduce((total, weight, index) => {
    const value = Number(taxId[index]) * weight;
    return total + Math.floor(value / 10) + value % 10;
  }, 0);
  return sum % 5 === 0 || (taxId[6] === '7' && (sum + 1) % 5 === 0);
}
