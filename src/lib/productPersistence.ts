import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FilamentProduct } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

const PRODUCTS_STORAGE_KEY = 'printcore_products_catalog_v2';
const PRODUCTS_LAST_SAVED_KEY = 'printcore_products_catalog_last_saved';
const LEGACY_STORAGE_KEY = 'printcore_custom_products';

/**
 * Synchronously retrieves the stored products catalog.
 * Prioritizes modern local storage, falls back to legacy key, then INITIAL_PRODUCTS.
 */
export function getStoredProductsCatalog(): FilamentProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local stored products catalog:', e);
  }
  return INITIAL_PRODUCTS;
}

/**
 * Persists the entire product catalog immediately to localStorage
 * and asynchronously backs it up to Firebase Firestore.
 */
export async function saveProductsCatalog(products: FilamentProduct[]): Promise<boolean> {
  if (!Array.isArray(products) || products.length === 0) {
    return false;
  }

  const nowIso = new Date().toISOString();

  // 1. Instant local persistence for zero data loss on F5 / browser reload
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_LAST_SAVED_KEY, nowIso);
  } catch (err) {
    console.warn('Failed to save products to localStorage:', err);
  }

  // 2. Cloud database synchronization to Firestore
  try {
    const catalogRef = doc(db, 'settings', 'products_catalog');
    await setDoc(catalogRef, {
      id: 'products_catalog',
      totalCount: products.length,
      updatedAt: nowIso,
      data: JSON.stringify(products),
    });
    console.log(`📦 Cloud synced ${products.length} products to Firestore at ${nowIso}`);
    return true;
  } catch (err) {
    console.warn('Firestore cloud sync notice (local storage preserved):', err);
    return false;
  }
}

/**
 * Loads the latest product catalog from Firebase Firestore if available.
 */
export async function loadProductsFromFirestore(): Promise<FilamentProduct[] | null> {
  try {
    const catalogRef = doc(db, 'settings', 'products_catalog');
    const snap = await getDoc(catalogRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Update local cache
          localStorage.setItem(PRODUCTS_STORAGE_KEY, data.data);
          if (data.updatedAt) {
            localStorage.setItem(PRODUCTS_LAST_SAVED_KEY, data.updatedAt);
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Unable to fetch products catalog from Firestore:', err);
  }
  return null;
}

/**
 * Resets the products catalog to the original factory default (INITIAL_PRODUCTS).
 */
export async function resetProductsCatalogToDefault(): Promise<FilamentProduct[]> {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_LAST_SAVED_KEY);
  } catch (err) {
    console.warn('Failed to clear local products:', err);
  }

  // Also update Firestore to reflect reset
  try {
    const catalogRef = doc(db, 'settings', 'products_catalog');
    await setDoc(catalogRef, {
      id: 'products_catalog',
      totalCount: INITIAL_PRODUCTS.length,
      updatedAt: new Date().toISOString(),
      isDefault: true,
      data: JSON.stringify(INITIAL_PRODUCTS),
    });
  } catch (err) {
    console.warn('Failed to reset cloud products:', err);
  }

  return INITIAL_PRODUCTS;
}

/**
 * Returns formatted human-readable timestamp of last save.
 */
export function getLastProductsSavedTime(): string | null {
  try {
    const raw = localStorage.getItem(PRODUCTS_LAST_SAVED_KEY);
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('zh-TW', { hour12: false });
      }
    }
  } catch {}
  return null;
}
