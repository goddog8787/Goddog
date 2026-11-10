import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { FilamentProduct } from '../types';

const DELTA_STORAGE_KEY = 'printcore_admin_catalog_delta_v1';
const FULL_PRODUCTS_KEY = 'printcore_products';
const CATALOG_VERSION_KEY = 'printcore_products_version';
export const CURRENT_CATALOG_VERSION = 'v20261110_clean_full_text_v8';

export interface CatalogDelta {
  customProducts: FilamentProduct[];
  editedProductsMap: Record<string, FilamentProduct>;
  deletedProductIds: string[];
  updatedAt: number;
}

function getEmptyDelta(): CatalogDelta {
  return {
    customProducts: [],
    editedProductsMap: {},
    deletedProductIds: [],
    updatedAt: 0,
  };
}

export function loadLocalCatalogDelta(): CatalogDelta {
  try {
    const raw = localStorage.getItem(DELTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
        editedProductsMap:
          parsed.editedProductsMap && typeof parsed.editedProductsMap === 'object'
            ? parsed.editedProductsMap
            : {},
        deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
      };
    }
  } catch (e) {
    console.warn('Failed to parse local catalog delta:', e);
  }
  return getEmptyDelta();
}

export function saveLocalCatalogDelta(delta: CatalogDelta): void {
  try {
    localStorage.setItem(DELTA_STORAGE_KEY, JSON.stringify(delta));
  } catch (e) {
    console.warn('Failed to save local catalog delta (quota or storage issue):', e);
  }
}

/**
 * Merges base INITIAL_PRODUCTS with the admin's persistent delta (custom additions, edits, and deletions).
 * Admin edits and additions ALWAYS take priority over INITIAL_PRODUCTS.
 */
export function applyCatalogDeltaToProducts(
  initialProducts: FilamentProduct[],
  delta: CatalogDelta
): FilamentProduct[] {
  const deletedSet = new Set(delta.deletedProductIds || []);
  const editedMap = delta.editedProductsMap || {};
  const customList = (delta.customProducts || []).filter((p) => p && p.id && !deletedSet.has(p.id));
  const initialIds = new Set(initialProducts.map((p) => p.id));

  // 1. Custom products added by admin (that are not in initialProducts)
  const pureCustomProducts = customList
    .filter((p) => !initialIds.has(p.id))
    .map((p) => (editedMap[p.id] ? { ...p, ...editedMap[p.id] } : p));

  // 2. Base initial products (excluding deleted ones), with any admin edits applied on top
  const mergedBaseProducts = initialProducts
    .filter((p) => !deletedSet.has(p.id))
    .map((baseProd) => {
      const adminEdited = editedMap[baseProd.id];
      if (adminEdited) {
        return {
          ...baseProd,
          ...adminEdited,
          id: baseProd.id,
        };
      }
      return baseProd;
    });

  return [...pureCustomProducts, ...mergedBaseProducts];
}

/**
 * Synchronously loads the product catalog on startup, preserving all admin edits, new products, and deletions.
 */
export function loadPersistedProductsSync(initialProducts: FilamentProduct[]): FilamentProduct[] {
  const delta = loadLocalCatalogDelta();

  // Check if there are any legacy custom products or edits in printcore_products before version migration
  try {
    const savedRaw = localStorage.getItem(FULL_PRODUCTS_KEY);
    const savedVersion = localStorage.getItem(CATALOG_VERSION_KEY);
    if (savedRaw) {
      const savedList = JSON.parse(savedRaw);
      if (Array.isArray(savedList) && savedList.length > 0) {
        const initialMap = new Map(initialProducts.map((p) => [p.id, p]));
        let deltaChanged = false;

        for (const item of savedList) {
          if (!item || !item.id || item.id === 'test-01') continue;
          if (!initialMap.has(item.id)) {
            // Custom product added by admin in localStorage
            const alreadyInCustom = delta.customProducts.some((cp) => cp.id === item.id);
            if (!alreadyInCustom && !delta.deletedProductIds.includes(item.id)) {
              delta.customProducts.unshift(item);
              deltaChanged = true;
            }
          } else if (savedVersion === CURRENT_CATALOG_VERSION) {
            // Same catalog version: if any field differs from initialMap, preserve it in editedProductsMap
            const base = initialMap.get(item.id)!;
            if (
              item.name !== base.name ||
              item.price !== base.price ||
              item.stock !== base.stock ||
              item.brand !== base.brand ||
              item.material !== base.material ||
              item.imageUrl !== base.imageUrl ||
              item.description !== base.description ||
              item.nozzleTemp !== base.nozzleTemp ||
              item.bedTemp !== base.bedTemp ||
              item.maxSpeed !== base.maxSpeed
            ) {
              if (!delta.editedProductsMap[item.id]) {
                delta.editedProductsMap[item.id] = item;
                deltaChanged = true;
              }
            }
          }
        }

        if (deltaChanged) {
          delta.updatedAt = Date.now();
          saveLocalCatalogDelta(delta);
        }
      }
    }
    localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_CATALOG_VERSION);
  } catch (e) {
    console.warn('Error migrating saved products:', e);
  }

  const finalProducts = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(finalProducts));
  } catch {}
  return finalProducts;
}

/**
 * Syncs the current CatalogDelta to Firestore and backend API so changes persist across refreshes & devices.
 */
export async function syncCatalogDeltaToCloud(delta: CatalogDelta): Promise<void> {
  // 1. Sync to backend server.ts API
  try {
    fetch('/api/catalog/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delta),
    }).catch(() => {});
  } catch {}

  // 2. Sync to Firestore settings/product_catalog
  try {
    // Strip ultra-large base64 strings (>250KB) only if needed to stay within Firestore 1MB doc limit,
    // while keeping normal images and resized base64 thumbnails intact
    const firestoreSafeCustom = (delta.customProducts || []).map((p) => ({
      ...p,
      imageUrl: p.imageUrl && p.imageUrl.length > 350000 ? p.imageUrl.slice(0, 350000) : p.imageUrl,
    }));
    const firestoreSafeEdited: Record<string, FilamentProduct> = {};
    for (const [k, v] of Object.entries(delta.editedProductsMap || {})) {
      if (!v) continue;
      firestoreSafeEdited[k] = {
        ...v,
        imageUrl: v.imageUrl && v.imageUrl.length > 350000 ? v.imageUrl.slice(0, 350000) : v.imageUrl,
      };
    }

    await setDoc(
      doc(db, 'settings', 'product_catalog'),
      {
        customProducts: firestoreSafeCustom,
        editedProductsMap: firestoreSafeEdited,
        deletedProductIds: delta.deletedProductIds || [],
        updatedAt: delta.updatedAt || Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Firestore product catalog sync fallback:', e);
  }
}

/**
 * Records an admin product creation or edit, saves to localStorage, Firestore, and server, and returns updated list.
 */
export function recordAdminProductUpsert(
  product: FilamentProduct,
  initialProducts: FilamentProduct[]
): FilamentProduct[] {
  const delta = loadLocalCatalogDelta();
  const isBaseProduct = initialProducts.some((p) => p.id === product.id);

  // Remove from deleted list if it was previously deleted
  delta.deletedProductIds = (delta.deletedProductIds || []).filter((id) => id !== product.id);

  if (isBaseProduct) {
    delta.editedProductsMap[product.id] = { ...product };
  } else {
    const existingIdx = delta.customProducts.findIndex((p) => p.id === product.id);
    if (existingIdx >= 0) {
      delta.customProducts[existingIdx] = { ...product };
    } else {
      delta.customProducts.unshift({ ...product });
    }
    delta.editedProductsMap[product.id] = { ...product };
  }

  delta.updatedAt = Date.now();
  saveLocalCatalogDelta(delta);

  const updatedList = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedList));
  } catch {}

  syncCatalogDeltaToCloud(delta).catch(() => {});
  return updatedList;
}

/**
 * Records an admin product deletion, saves to localStorage, Firestore, and server, and returns updated list.
 */
export function recordAdminProductDelete(
  productId: string,
  initialProducts: FilamentProduct[]
): FilamentProduct[] {
  const delta = loadLocalCatalogDelta();
  if (!delta.deletedProductIds.includes(productId)) {
    delta.deletedProductIds.push(productId);
  }
  delta.customProducts = (delta.customProducts || []).filter((p) => p.id !== productId);
  delete delta.editedProductsMap[productId];
  delta.updatedAt = Date.now();

  saveLocalCatalogDelta(delta);

  const updatedList = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedList));
  } catch {}

  syncCatalogDeltaToCloud(delta).catch(() => {});
  return updatedList;
}

/**
 * Subscribes to cloud & backend catalog updates so admin changes persist even across devices/browsers.
 */
export function subscribeToCloudCatalog(
  initialProducts: FilamentProduct[],
  onUpdate: (mergedProducts: FilamentProduct[]) => void
): () => void {
  const mergeIncomingDelta = (remoteDelta: Partial<CatalogDelta> | null | undefined) => {
    if (!remoteDelta || typeof remoteDelta !== 'object') return;
    const localDelta = loadLocalCatalogDelta();
    const remoteTime = typeof remoteDelta.updatedAt === 'number' ? remoteDelta.updatedAt : 0;

    // Merge if remote is newer or if local is empty
    const hasLocalChanges =
      localDelta.customProducts.length > 0 ||
      Object.keys(localDelta.editedProductsMap).length > 0 ||
      localDelta.deletedProductIds.length > 0;

    if (remoteTime > localDelta.updatedAt || !hasLocalChanges) {
      const mergedDelta: CatalogDelta = {
        customProducts: Array.isArray(remoteDelta.customProducts)
          ? remoteDelta.customProducts
          : localDelta.customProducts,
        editedProductsMap: {
          ...localDelta.editedProductsMap,
          ...(remoteDelta.editedProductsMap || {}),
        },
        deletedProductIds: Array.from(
          new Set([
            ...(localDelta.deletedProductIds || []),
            ...(Array.isArray(remoteDelta.deletedProductIds) ? remoteDelta.deletedProductIds : []),
          ])
        ),
        updatedAt: Math.max(localDelta.updatedAt, remoteTime),
      };

      saveLocalCatalogDelta(mergedDelta);
      const updatedProducts = applyCatalogDeltaToProducts(initialProducts, mergedDelta);
      try {
        localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      } catch {}
      onUpdate(updatedProducts);
    }
  };

  // 1. Fetch from backend server API
  fetch('/api/catalog/sync')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.delta) {
        mergeIncomingDelta(data.delta);
      }
    })
    .catch(() => {});

  // 2. Subscribe to Firestore settings/product_catalog
  try {
    const unsub = onSnapshot(
      doc(db, 'settings', 'product_catalog'),
      (snap) => {
        if (snap.exists()) {
          mergeIncomingDelta(snap.data() as Partial<CatalogDelta>);
        }
      },
      () => {}
    );
    return unsub;
  } catch {
    return () => {};
  }
}
