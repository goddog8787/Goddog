import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FilamentProduct } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

const PRODUCTS_STORAGE_KEY = 'printcore_products_catalog_v7_clean';
const PRODUCTS_LAST_SAVED_KEY = 'printcore_products_catalog_last_saved';
const LEGACY_STORAGE_KEY = 'printcore_custom_products';

/**
 * Synchronously retrieves the stored products catalog.
 * Prioritizes modern local storage, falls back to legacy key, then INITIAL_PRODUCTS.
 */
export function getStoredProductsCatalog(): FilamentProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = parsed
          .filter((p: FilamentProduct) => p.id !== 'test-01')
          .map((p: FilamentProduct) => {
            // Ensure zero external affiliate link artifacts
            const sanitized = { ...p };
            delete sanitized.affiliateUrl;
            delete sanitized.affiliateCtaText;

            const freshMatch = INITIAL_PRODUCTS.find(item => item.id === sanitized.id);
            if (freshMatch) {
              // Guarantee genuine filament image
              if (!sanitized.imageUrl || !sanitized.imageUrl.startsWith('/images/products/')) {
                return { ...sanitized, imageUrl: freshMatch.imageUrl };
              }
            }
            return sanitized;
          });

        // Ensure newly introduced products from INITIAL_PRODUCTS are included
        const existingIds = new Set(merged.map(p => p.id));
        const missingProducts = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
        return [...merged, ...missingProducts];
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
          const sanitized = parsed.map((p: FilamentProduct) => {
            const freshMatch = INITIAL_PRODUCTS.find(item => item.id === p.id);
            if (freshMatch && (!p.imageUrl || !p.imageUrl.startsWith('/images/products/'))) {
              return { ...p, imageUrl: freshMatch.imageUrl };
            }
            return p;
          });
          const existingIds = new Set(sanitized.map(p => p.id));
          const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
          const fullCatalog = [...sanitized, ...missing];

          // Update local cache
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(fullCatalog));
          if (data.updatedAt) {
            localStorage.setItem(PRODUCTS_LAST_SAVED_KEY, data.updatedAt);
          }
          return fullCatalog;
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
