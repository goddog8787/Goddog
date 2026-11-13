import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { FilamentProduct } from '../types';

const DELTA_STORAGE_KEY = 'printcore_admin_catalog_delta_v1';
const FULL_PRODUCTS_KEY = 'printcore_products';

export interface CatalogDelta {
  customProducts: FilamentProduct[];
  editedProductsMap: Record<string, FilamentProduct>;
  deletedProductIds: string[];
  itemTimestamps?: Record<string, number>;
  deletedTimestamps?: Record<string, number>;
  catalogItemIds?: string[];
  updatedAt: number;
  schemaVersion?: number;
}

const CURRENT_DELTA_SCHEMA_VERSION = 2;

function getEmptyDelta(): CatalogDelta {
  return {
    customProducts: [],
    editedProductsMap: {},
    deletedProductIds: [],
    itemTimestamps: {},
    deletedTimestamps: {},
    catalogItemIds: [],
    updatedAt: 0,
    schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
  };
}

/**
 * Strips all undefined fields recursively so Firebase Firestore setDoc() never throws
 * "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(obj: T): T {
  try {
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
    );
  } catch {
    return obj;
  }
}

export function sanitizeProduct(product: FilamentProduct): FilamentProduct {
  const copy: Record<string, any> = {};
  for (const [k, v] of Object.entries(product || {})) {
    if (k.startsWith('_')) continue; // Strip internal Firestore metadata keys
    if (v !== undefined && v !== null) {
      copy[k] = v;
    }
  }
  return sanitizeForFirestore(copy as FilamentProduct);
}

function toSafeFirestoreDocId(id: string): string {
  const cleaned = String(id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `catalog_item_${cleaned}`.slice(0, 120);
}

function toSafeProductCollectionDocId(id: string): string {
  const cleaned = String(id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return cleaned.slice(0, 120) || 'unknown_product';
}

/**
 * Ensures any base64 data URL image fits comfortably inside a single Firestore document (< 450KB)
 * so setDoc() never fails due to the 1MB Firestore document size limit.
 */
async function ensureFirestoreSafeImage(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl || !imageUrl.startsWith('data:image/') || imageUrl.length <= 420000) {
    return imageUrl;
  }
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return imageUrl;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 720;
          let w = img.width || 720;
          let h = img.height || 720;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressed);
            return;
          }
        } catch {}
        resolve(imageUrl);
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    } catch {
      resolve(imageUrl);
    }
  });
}

export function loadLocalCatalogDelta(): CatalogDelta {
  try {
    const raw = localStorage.getItem(DELTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isMigrated = parsed.schemaVersion === CURRENT_DELTA_SCHEMA_VERSION;
      const editedProductsMap: Record<string, FilamentProduct> = {};
      if (parsed.editedProductsMap && typeof parsed.editedProductsMap === 'object') {
        for (const [k, v] of Object.entries(parsed.editedProductsMap)) {
          if (v && typeof v === 'object') {
            editedProductsMap[k] = sanitizeProduct(v as FilamentProduct);
          }
        }
      }
      const customProducts: FilamentProduct[] = Array.isArray(parsed.customProducts)
        ? parsed.customProducts.filter((p: any) => p && p.id).map((p: any) => sanitizeProduct(p))
        : [];
      const deletedProductIds: string[] = Array.isArray(parsed.deletedProductIds)
        ? parsed.deletedProductIds
        : [];

      // If migrating from legacy v1 (where page loads fabricated Date.now() timestamps),
      // normalize legacy timestamps to 1 so Firestore server timestamps always take precedence on boot.
      const rawItemTimestamps: Record<string, number> =
        parsed.itemTimestamps && typeof parsed.itemTimestamps === 'object'
          ? parsed.itemTimestamps
          : {};
      const itemTimestamps: Record<string, number> = {};
      for (const [k, v] of Object.entries(rawItemTimestamps)) {
        itemTimestamps[k] = isMigrated && typeof v === 'number' ? v : 1;
      }

      const rawDeletedTimestamps: Record<string, number> =
        parsed.deletedTimestamps && typeof parsed.deletedTimestamps === 'object'
          ? parsed.deletedTimestamps
          : {};
      const deletedTimestamps: Record<string, number> = {};
      for (const [k, v] of Object.entries(rawDeletedTimestamps)) {
        deletedTimestamps[k] = isMigrated && typeof v === 'number' ? v : 1;
      }

      const catalogItemIds = Array.from(
        new Set([...Object.keys(editedProductsMap), ...customProducts.map((p) => p.id)])
      );

      const result: CatalogDelta = {
        customProducts,
        editedProductsMap,
        deletedProductIds,
        itemTimestamps,
        deletedTimestamps,
        catalogItemIds,
        updatedAt: isMigrated && typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 1,
        schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
      };

      if (!isMigrated) {
        try {
          localStorage.setItem(DELTA_STORAGE_KEY, JSON.stringify(result));
        } catch {}
      }

      return result;
    }
  } catch (e) {
    console.warn('Failed to parse local catalog delta:', e);
  }
  return getEmptyDelta();
}

export function saveLocalCatalogDelta(delta: CatalogDelta): void {
  try {
    const clean = sanitizeForFirestore({
      ...delta,
      schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
    });
    localStorage.setItem(DELTA_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Failed to save local catalog delta:', e);
  }
}

/**
 * Merges base INITIAL_PRODUCTS with the admin's persistent delta (custom additions, edits, and deletions).
 * Admin edits and additions ALWAYS take priority over INITIAL_PRODUCTS and can never be overwritten by defaults.
 */
export function applyCatalogDeltaToProducts(
  initialProducts: FilamentProduct[],
  delta: CatalogDelta
): FilamentProduct[] {
  const deletedSet = new Set(delta.deletedProductIds || []);
  const editedMap = delta.editedProductsMap || {};
  const customList = (delta.customProducts || []).filter(
    (p) => p && p.id && !deletedSet.has(p.id)
  );
  const initialIds = new Set(initialProducts.map((p) => p.id));

  // 1. Custom products added by admin (not in initialProducts)
  const seenCustomIds = new Set<string>();
  const pureCustomProducts: FilamentProduct[] = [];
  for (const p of customList) {
    if (!initialIds.has(p.id) && !seenCustomIds.has(p.id)) {
      seenCustomIds.add(p.id);
      const merged = editedMap[p.id] ? { ...p, ...editedMap[p.id], id: p.id } : p;
      pureCustomProducts.push(sanitizeProduct(merged));
    }
  }

  // Also include any product in editedMap whose ID is not in initialProducts and not yet in pureCustomProducts
  for (const [id, editedProd] of Object.entries(editedMap)) {
    if (!initialIds.has(id) && !seenCustomIds.has(id) && !deletedSet.has(id) && editedProd) {
      seenCustomIds.add(id);
      pureCustomProducts.push(sanitizeProduct(editedProd));
    }
  }

  // 2. Base initial products (excluding deleted ones), with any admin edits applied on top
  const mergedBaseProducts = initialProducts
    .filter((p) => !deletedSet.has(p.id))
    .map((baseProd) => {
      const adminEdited = editedMap[baseProd.id];
      if (adminEdited) {
        const merged: FilamentProduct = {
          ...baseProd,
          ...adminEdited,
          id: baseProd.id,
        };
        if (
          (merged as any).imageUrl === '__FIRESTORE_ITEM_DOC__' ||
          !merged.imageUrl
        ) {
          merged.imageUrl = baseProd.imageUrl;
        }
        if (!('badge' in adminEdited)) {
          delete (merged as any).badge;
        }
        return sanitizeProduct(merged);
      }
      return sanitizeProduct(baseProd);
    });

  return [...pureCustomProducts, ...mergedBaseProducts];
}

/**
 * Synchronously loads the product catalog on startup for instant 0ms render,
 * without fabricating timestamps that could block incoming Cloud data.
 */
export function loadPersistedProductsSync(initialProducts: FilamentProduct[]): FilamentProduct[] {
  const delta = loadLocalCatalogDelta();
  const finalProducts = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(finalProducts));
  } catch {}
  return finalProducts;
}

/**
 * Syncs the current CatalogDelta and changed product(s) immediately to:
 * 1) Firestore `products/{productId}` collection (primary per-product cloud source of truth)
 * 2) Firestore `settings/catalog_item_<id>` & `settings/product_catalog` (master catalog index)
 * 3) Backend `/api/catalog/sync`
 */
export async function syncCatalogDeltaToCloud(
  delta: CatalogDelta,
  fullProducts?: FilamentProduct[],
  changedProduct?: FilamentProduct,
  deletedProductId?: string
): Promise<void> {
  const cleanDelta = sanitizeForFirestore({
    ...delta,
    schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
  });
  const catalogItemIds = Array.from(
    new Set([
      ...Object.keys(cleanDelta.editedProductsMap || {}),
      ...(cleanDelta.customProducts || []).map((p) => p.id),
    ])
  );
  cleanDelta.catalogItemIds = catalogItemIds;

  // Compress image if changedProduct has a very large base64 data URL
  let safeChangedProduct = changedProduct ? sanitizeProduct(changedProduct) : undefined;
  if (safeChangedProduct?.imageUrl) {
    const compressedUrl = await ensureFirestoreSafeImage(safeChangedProduct.imageUrl);
    if (compressedUrl && compressedUrl !== safeChangedProduct.imageUrl) {
      safeChangedProduct = { ...safeChangedProduct, imageUrl: compressedUrl };
      if (cleanDelta.editedProductsMap?.[safeChangedProduct.id]) {
        cleanDelta.editedProductsMap[safeChangedProduct.id] = safeChangedProduct;
      }
      const cIdx = (cleanDelta.customProducts || []).findIndex((p) => p.id === safeChangedProduct!.id);
      if (cIdx >= 0) {
        cleanDelta.customProducts[cIdx] = safeChangedProduct;
      }
      saveLocalCatalogDelta(cleanDelta);
    }
  }

  // 1. Sync to backend server.ts API (Notice: do NOT set keepalive: true when body > 60KB because browsers reject keepalive bodies > 64KB!)
  try {
    const bodyStr = JSON.stringify({
      delta: cleanDelta,
      fullProducts: fullProducts ? sanitizeForFirestore(fullProducts) : undefined,
    });
    fetch('/api/catalog/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: bodyStr.length < 60000,
      body: bodyStr,
    }).catch(() => {});
  } catch {}

  const writePromises: Promise<any>[] = [];

  // 2. Write directly to Firestore `products/{docId}` AND `settings/catalog_item_{docId}`
  if (deletedProductId) {
    const prodDocId = toSafeProductCollectionDocId(deletedProductId);
    const itemDocId = toSafeFirestoreDocId(deletedProductId);
    const delTime = cleanDelta.deletedTimestamps?.[deletedProductId] || Date.now();

    writePromises.push(
      setDoc(doc(db, 'products', prodDocId), {
        id: deletedProductId,
        _isDeleted: true,
        _updatedAt: delTime,
      }).catch((e) => console.warn('Firestore products delete marker error:', e))
    );
    writePromises.push(
      setDoc(doc(db, 'settings', itemDocId), {
        id: deletedProductId,
        deleted: true,
        updatedAt: delTime,
      }).catch((e) => console.warn('Firestore settings item delete marker error:', e))
    );
  }

  if (safeChangedProduct && safeChangedProduct.id) {
    const prodDocId = toSafeProductCollectionDocId(safeChangedProduct.id);
    const itemDocId = toSafeFirestoreDocId(safeChangedProduct.id);
    const itemTime = cleanDelta.itemTimestamps?.[safeChangedProduct.id] || Date.now();
    const isCustom = (cleanDelta.customProducts || []).some((p) => p.id === safeChangedProduct!.id);

    writePromises.push(
      setDoc(doc(db, 'products', prodDocId), {
        ...safeChangedProduct,
        id: safeChangedProduct.id,
        _isDeleted: false,
        _isCustom: isCustom,
        _updatedAt: itemTime,
      }).catch((e) => console.warn('Firestore products write error:', e))
    );
    writePromises.push(
      setDoc(doc(db, 'settings', itemDocId), {
        product: safeChangedProduct,
        deleted: false,
        updatedAt: itemTime,
      }).catch((e) => console.warn('Firestore settings item write error:', e))
    );
  } else if (!deletedProductId) {
    // Bulk sync all edited/custom products
    for (const id of catalogItemIds) {
      const prod =
        cleanDelta.editedProductsMap?.[id] ||
        (cleanDelta.customProducts || []).find((p) => p.id === id);
      if (prod) {
        let cleanProd = sanitizeProduct(prod);
        if (cleanProd.imageUrl) {
          const compressed = await ensureFirestoreSafeImage(cleanProd.imageUrl);
          if (compressed) cleanProd = { ...cleanProd, imageUrl: compressed };
        }
        const prodDocId = toSafeProductCollectionDocId(cleanProd.id);
        const itemDocId = toSafeFirestoreDocId(cleanProd.id);
        const itemTime = cleanDelta.itemTimestamps?.[cleanProd.id] || cleanDelta.updatedAt || Date.now();
        const isCustom = (cleanDelta.customProducts || []).some((p) => p.id === cleanProd.id);

        writePromises.push(
          setDoc(doc(db, 'products', prodDocId), {
            ...cleanProd,
            id: cleanProd.id,
            _isDeleted: false,
            _isCustom: isCustom,
            _updatedAt: itemTime,
          }).catch(() => {})
        );
        writePromises.push(
          setDoc(doc(db, 'settings', itemDocId), {
            product: cleanProd,
            deleted: false,
            updatedAt: itemTime,
          }).catch(() => {})
        );
      }
    }
  }

  // 3. Write master catalog index & lightweight delta to Firestore `settings/product_catalog`
  try {
    const lightEditedMap: Record<string, FilamentProduct> = {};
    for (const [k, v] of Object.entries(cleanDelta.editedProductsMap || {})) {
      if (!v) continue;
      const copy = sanitizeProduct(v);
      if (copy.imageUrl && copy.imageUrl.startsWith('data:image/') && copy.imageUrl.length > 60000) {
        (copy as any).imageUrl = '__FIRESTORE_ITEM_DOC__';
      }
      lightEditedMap[k] = copy;
    }

    const lightCustomList = (cleanDelta.customProducts || []).map((v) => {
      const copy = sanitizeProduct(v);
      if (copy.imageUrl && copy.imageUrl.startsWith('data:image/') && copy.imageUrl.length > 60000) {
        (copy as any).imageUrl = '__FIRESTORE_ITEM_DOC__';
      }
      return copy;
    });

    writePromises.push(
      setDoc(doc(db, 'settings', 'product_catalog'), {
        customProducts: lightCustomList,
        editedProductsMap: lightEditedMap,
        deletedProductIds: cleanDelta.deletedProductIds || [],
        itemTimestamps: cleanDelta.itemTimestamps || {},
        deletedTimestamps: cleanDelta.deletedTimestamps || {},
        catalogItemIds,
        updatedAt: cleanDelta.updatedAt || Date.now(),
      }).catch((e) => console.warn('Firestore master product_catalog sync warning:', e))
    );
  } catch (e) {
    console.warn('Firestore master product_catalog build warning:', e);
  }

  await Promise.all(writePromises);
}

let lastCloudSyncPromise: Promise<void> = Promise.resolve();

export function waitForLastCatalogCloudSync(): Promise<void> {
  return lastCloudSyncPromise;
}

/**
 * Records an admin product creation or edit, saves to localStorage, rewrites website internal code via server API,
 * and immediately saves to Firestore (`products/{id}` + `settings/product_catalog`).
 */
export function recordAdminProductUpsert(
  product: FilamentProduct,
  initialProducts: FilamentProduct[]
): FilamentProduct[] {
  const now = Date.now();
  const cleanProduct = sanitizeProduct(product);
  const delta = loadLocalCatalogDelta();
  const isBaseProduct = initialProducts.some((p) => p.id === cleanProduct.id);

  // Remove from deleted list if it was previously deleted
  delta.deletedProductIds = (delta.deletedProductIds || []).filter((id) => id !== cleanProduct.id);
  if (delta.deletedTimestamps) {
    delete delta.deletedTimestamps[cleanProduct.id];
  }

  delta.itemTimestamps = delta.itemTimestamps || {};
  delta.itemTimestamps[cleanProduct.id] = now;

  if (isBaseProduct) {
    delta.editedProductsMap[cleanProduct.id] = cleanProduct;
  } else {
    const existingIdx = delta.customProducts.findIndex((p) => p.id === cleanProduct.id);
    if (existingIdx >= 0) {
      delta.customProducts[existingIdx] = cleanProduct;
    } else {
      delta.customProducts.unshift(cleanProduct);
    }
    delta.editedProductsMap[cleanProduct.id] = cleanProduct;
  }

  delta.catalogItemIds = Array.from(
    new Set([
      ...Object.keys(delta.editedProductsMap),
      ...delta.customProducts.map((p) => p.id),
    ])
  );
  delta.updatedAt = now;
  saveLocalCatalogDelta(delta);

  const updatedList = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedList));
  } catch {}

  lastCloudSyncPromise = syncCatalogDeltaToCloud(delta, updatedList, cleanProduct).catch((e) => {
    console.warn('Cloud catalog upsert sync error:', e);
  });
  return updatedList;
}

/**
 * Records an admin product deletion, saves to localStorage, rewrites website internal code via server API,
 * and immediately saves to Firestore (`products/{id}` + `settings/product_catalog`).
 */
export function recordAdminProductDelete(
  productId: string,
  initialProducts: FilamentProduct[]
): FilamentProduct[] {
  const now = Date.now();
  const delta = loadLocalCatalogDelta();
  if (!delta.deletedProductIds.includes(productId)) {
    delta.deletedProductIds.push(productId);
  }
  delta.deletedTimestamps = delta.deletedTimestamps || {};
  delta.deletedTimestamps[productId] = now;

  delta.customProducts = (delta.customProducts || []).filter((p) => p.id !== productId);
  delete delta.editedProductsMap[productId];
  delta.catalogItemIds = Array.from(
    new Set([
      ...Object.keys(delta.editedProductsMap),
      ...delta.customProducts.map((p) => p.id),
    ])
  );
  delta.updatedAt = now;

  saveLocalCatalogDelta(delta);

  const updatedList = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedList));
  } catch {}

  lastCloudSyncPromise = syncCatalogDeltaToCloud(delta, updatedList, undefined, productId).catch((e) => {
    console.warn('Cloud catalog delete sync error:', e);
  });
  return updatedList;
}

/**
 * Subscribes to Firestore (`products` collection + `settings/product_catalog`) and backend catalog updates.
 * On App startup, prioritizes pulling the latest cloud data from Firestore so refreshed pages NEVER revert to old defaults.
 */
export function subscribeToCloudCatalog(
  initialProducts: FilamentProduct[],
  onUpdate: (mergedProducts: FilamentProduct[]) => void
): () => void {
  const initialIds = new Set(initialProducts.map((p) => p.id));

  /**
   * Merges per-product documents from Firestore `products` collection directly into local delta,
   * comparing timestamps so the newest version always wins.
   */
  const mergeProductsCollectionDocs = (docsData: Record<string, any>[]) => {
    if (!Array.isArray(docsData) || docsData.length === 0) return;
    const localDelta = loadLocalCatalogDelta();
    const mergedEditedMap: Record<string, FilamentProduct> = { ...localDelta.editedProductsMap };
    const mergedItemTimes: Record<string, number> = { ...(localDelta.itemTimestamps || {}) };
    const mergedDeletedSet = new Set<string>(localDelta.deletedProductIds || []);
    const mergedDeletedTimes: Record<string, number> = { ...(localDelta.deletedTimestamps || {}) };
    const customMap = new Map<string, FilamentProduct>();

    for (const p of localDelta.customProducts || []) {
      if (p && p.id && !mergedDeletedSet.has(p.id)) {
        customMap.set(p.id, mergedEditedMap[p.id] || sanitizeProduct(p));
      }
    }

    let maxUpdatedAt = localDelta.updatedAt || 0;

    for (const rawDoc of docsData) {
      if (!rawDoc || !rawDoc.id) continue;
      const prodId = String(rawDoc.id);
      const docTime = typeof rawDoc._updatedAt === 'number' ? rawDoc._updatedAt : 2;
      maxUpdatedAt = Math.max(maxUpdatedAt, docTime);

      if (rawDoc._isDeleted === true) {
        const localEditTime = mergedItemTimes[prodId] || 0;
        if (docTime >= localEditTime) {
          mergedDeletedSet.add(prodId);
          mergedDeletedTimes[prodId] = Math.max(mergedDeletedTimes[prodId] || 0, docTime);
          delete mergedEditedMap[prodId];
          customMap.delete(prodId);
        }
        continue;
      }

      // Valid active product document in Firestore `products` collection
      if (!rawDoc.name || typeof rawDoc.price !== 'number') continue;
      const cleanProd = sanitizeProduct(rawDoc as FilamentProduct);
      if (
        (cleanProd as any).imageUrl === '__FIRESTORE_ITEM_DOC__' &&
        mergedEditedMap[prodId]?.imageUrl &&
        (mergedEditedMap[prodId] as any).imageUrl !== '__FIRESTORE_ITEM_DOC__'
      ) {
        cleanProd.imageUrl = mergedEditedMap[prodId].imageUrl;
      }

      const localTime = mergedItemTimes[prodId] || 0;
      const localDelTime = mergedDeletedTimes[prodId] || 0;

      if (!mergedEditedMap[prodId] || (docTime >= localTime && docTime >= localDelTime)) {
        mergedEditedMap[prodId] = cleanProd;
        mergedItemTimes[prodId] = Math.max(localTime, docTime);
        mergedDeletedSet.delete(prodId);
        delete mergedDeletedTimes[prodId];

        if (!initialIds.has(prodId) || rawDoc._isCustom) {
          customMap.set(prodId, cleanProd);
        }
      }
    }

    const nextDelta: CatalogDelta = {
      customProducts: Array.from(customMap.values()),
      editedProductsMap: mergedEditedMap,
      deletedProductIds: Array.from(mergedDeletedSet),
      itemTimestamps: mergedItemTimes,
      deletedTimestamps: mergedDeletedTimes,
      catalogItemIds: Array.from(
        new Set([...Object.keys(mergedEditedMap), ...Array.from(customMap.keys())])
      ),
      updatedAt: maxUpdatedAt,
      schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
    };

    saveLocalCatalogDelta(nextDelta);
    const updatedProducts = applyCatalogDeltaToProducts(initialProducts, nextDelta);
    try {
      localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch {}
    onUpdate(updatedProducts);
  };

  const mergeIncomingDelta = async (remoteDelta: Partial<CatalogDelta> | null | undefined) => {
    if (!remoteDelta || typeof remoteDelta !== 'object') return;
    const localDelta = loadLocalCatalogDelta();

    const remoteItemTimes = remoteDelta.itemTimestamps || {};
    const localItemTimes = localDelta.itemTimestamps || {};
    const remoteDeletedTimes = remoteDelta.deletedTimestamps || {};
    const localDeletedTimes = localDelta.deletedTimestamps || {};

    const remoteEditedMap: Record<string, FilamentProduct> = {
      ...(remoteDelta.editedProductsMap || {}),
    };
    const remoteCustomList: FilamentProduct[] = Array.isArray(remoteDelta.customProducts)
      ? [...remoteDelta.customProducts]
      : [];

    const idsToHydrate = new Set<string>(remoteDelta.catalogItemIds || []);
    for (const [id, prod] of Object.entries(remoteEditedMap)) {
      if (prod && (prod as any).imageUrl === '__FIRESTORE_ITEM_DOC__') {
        idsToHydrate.add(id);
      }
    }
    for (const prod of remoteCustomList) {
      if (prod && (prod as any).imageUrl === '__FIRESTORE_ITEM_DOC__') {
        idsToHydrate.add(prod.id);
      }
    }

    for (const id of idsToHydrate) {
      const localExisting = localDelta.editedProductsMap[id];
      const remoteItemTime = remoteItemTimes[id] || remoteDelta.updatedAt || 2;
      const localItemTime = localItemTimes[id] || 0;
      const needsPlaceholderHydration =
        remoteEditedMap[id] &&
        (remoteEditedMap[id] as any).imageUrl === '__FIRESTORE_ITEM_DOC__' &&
        (!localExisting?.imageUrl ||
          (localExisting as any).imageUrl === '__FIRESTORE_ITEM_DOC__' ||
          remoteItemTime > localItemTime);

      if (!localExisting || remoteItemTime > localItemTime || needsPlaceholderHydration) {
        try {
          const snap = await getDoc(doc(db, 'settings', toSafeFirestoreDocId(id)));
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.product && data.product.id) {
              const fullProd = sanitizeProduct(data.product as FilamentProduct);
              remoteEditedMap[id] = fullProd;
              const cIdx = remoteCustomList.findIndex((p) => p.id === id);
              if (cIdx >= 0) {
                remoteCustomList[cIdx] = fullProd;
              }
            }
          }
        } catch {}
      }
    }

    const mergedDeletedSet = new Set<string>([
      ...(localDelta.deletedProductIds || []),
      ...(Array.isArray(remoteDelta.deletedProductIds) ? remoteDelta.deletedProductIds : []),
    ]);
    const mergedDeletedTimes: Record<string, number> = {
      ...localDeletedTimes,
      ...remoteDeletedTimes,
    };

    const mergedEditedMap: Record<string, FilamentProduct> = { ...localDelta.editedProductsMap };
    const mergedItemTimes: Record<string, number> = { ...localItemTimes };

    for (const [id, rProd] of Object.entries(remoteEditedMap)) {
      if (!rProd || !rProd.id) continue;
      if ((rProd as any).imageUrl === '__FIRESTORE_ITEM_DOC__') {
        if (
          localDelta.editedProductsMap[id]?.imageUrl &&
          (localDelta.editedProductsMap[id] as any).imageUrl !== '__FIRESTORE_ITEM_DOC__'
        ) {
          rProd.imageUrl = localDelta.editedProductsMap[id].imageUrl;
        }
      }
      const rTime = remoteItemTimes[id] || remoteDelta.updatedAt || 2;
      const lTime = localItemTimes[id] || 0;
      const delTime = Math.max(remoteDeletedTimes[id] || 0, localDeletedTimes[id] || 0);

      if (delTime > rTime && delTime > lTime) {
        delete mergedEditedMap[id];
        continue;
      }

      if (!mergedEditedMap[id] || rTime >= lTime) {
        mergedEditedMap[id] = sanitizeProduct(rProd);
        mergedItemTimes[id] = Math.max(rTime, lTime);
        mergedDeletedSet.delete(id);
      }
    }

    const customMap = new Map<string, FilamentProduct>();
    for (const p of localDelta.customProducts || []) {
      if (p && p.id && !mergedDeletedSet.has(p.id)) {
        customMap.set(p.id, mergedEditedMap[p.id] || sanitizeProduct(p));
      }
    }
    for (const p of remoteCustomList) {
      if (p && p.id && !mergedDeletedSet.has(p.id)) {
        const rTime = remoteItemTimes[p.id] || remoteDelta.updatedAt || 2;
        const lTime = localItemTimes[p.id] || 0;
        if (!customMap.has(p.id) || rTime >= lTime) {
          customMap.set(p.id, mergedEditedMap[p.id] || sanitizeProduct(p));
        }
      }
    }

    for (const id of Array.from(mergedDeletedSet)) {
      const delTime = mergedDeletedTimes[id] || 0;
      const itemTime = mergedItemTimes[id] || 0;
      if (itemTime > delTime && mergedEditedMap[id]) {
        mergedDeletedSet.delete(id);
      } else {
        delete mergedEditedMap[id];
        customMap.delete(id);
      }
    }

    const mergedDelta: CatalogDelta = {
      customProducts: Array.from(customMap.values()),
      editedProductsMap: mergedEditedMap,
      deletedProductIds: Array.from(mergedDeletedSet),
      itemTimestamps: mergedItemTimes,
      deletedTimestamps: mergedDeletedTimes,
      catalogItemIds: Array.from(
        new Set([...Object.keys(mergedEditedMap), ...Array.from(customMap.keys())])
      ),
      updatedAt: Math.max(localDelta.updatedAt || 0, remoteDelta.updatedAt || 0),
      schemaVersion: CURRENT_DELTA_SCHEMA_VERSION,
    };

    saveLocalCatalogDelta(mergedDelta);
    const updatedProducts = applyCatalogDeltaToProducts(initialProducts, mergedDelta);
    try {
      localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch {}
    onUpdate(updatedProducts);
  };

  // 1. Priority Cloud Pull on App Boot: Fetch directly from Firestore server first
  (async () => {
    try {
      // Pull master catalog delta from Firestore server (bypassing stale cache if online)
      const masterRef = doc(db, 'settings', 'product_catalog');
      const masterSnap = await getDocFromServer(masterRef).catch(() => getDoc(masterRef));
      if (masterSnap && masterSnap.exists()) {
        await mergeIncomingDelta(masterSnap.data() as Partial<CatalogDelta>);
      }
    } catch {}

    try {
      // Pull individual product docs from Firestore `products` collection (server-first)
      const colRef = collection(db, 'products');
      const colSnap = await getDocsFromServer(colRef).catch(() => getDocs(colRef));
      if (colSnap && !colSnap.empty) {
        const docsList = colSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        mergeProductsCollectionDocs(docsList);
      } else {
        // If Firestore `products` collection is empty but local has admin edits, seed Firestore once
        const localDelta = loadLocalCatalogDelta();
        if (
          localDelta.updatedAt > 0 &&
          (Object.keys(localDelta.editedProductsMap).length > 0 ||
            localDelta.customProducts.length > 0 ||
            localDelta.deletedProductIds.length > 0)
        ) {
          const currentMerged = applyCatalogDeltaToProducts(initialProducts, localDelta);
          await syncCatalogDeltaToCloud(localDelta, currentMerged);
        }
      }
    } catch {}

    // Also check backend server delta as secondary fallback
    try {
      const res = await fetch('/api/catalog/sync');
      if (res.ok) {
        const data = await res.json();
        if (data && data.delta) {
          await mergeIncomingDelta(data.delta);
        }
      }
    } catch {}
  })();

  // 2. Real-time listener on Firestore `products` collection
  let unsubProductsCol = () => {};
  try {
    unsubProductsCol = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        if (!snap.empty) {
          const docsList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          mergeProductsCollectionDocs(docsList);
        }
      },
      () => {}
    );
  } catch {}

  // 3. Real-time listener on Firestore `settings/product_catalog`
  let unsubSettingsDoc = () => {};
  try {
    unsubSettingsDoc = onSnapshot(
      doc(db, 'settings', 'product_catalog'),
      (snap) => {
        if (snap.exists()) {
          mergeIncomingDelta(snap.data() as Partial<CatalogDelta>);
        }
      },
      () => {}
    );
  } catch {}

  return () => {
    unsubProductsCol();
    unsubSettingsDoc();
  };
}
