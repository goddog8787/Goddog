import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
}

function getEmptyDelta(): CatalogDelta {
  return {
    customProducts: [],
    editedProductsMap: {},
    deletedProductIds: [],
    itemTimestamps: {},
    deletedTimestamps: {},
    catalogItemIds: [],
    updatedAt: 0,
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

export function loadLocalCatalogDelta(): CatalogDelta {
  try {
    const raw = localStorage.getItem(DELTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
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
      const itemTimestamps: Record<string, number> =
        parsed.itemTimestamps && typeof parsed.itemTimestamps === 'object'
          ? parsed.itemTimestamps
          : {};
      const deletedTimestamps: Record<string, number> =
        parsed.deletedTimestamps && typeof parsed.deletedTimestamps === 'object'
          ? parsed.deletedTimestamps
          : {};
      const catalogItemIds = Array.from(
        new Set([...Object.keys(editedProductsMap), ...customProducts.map((p) => p.id)])
      );

      return {
        customProducts,
        editedProductsMap,
        deletedProductIds,
        itemTimestamps,
        deletedTimestamps,
        catalogItemIds,
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
    const clean = sanitizeForFirestore(delta);
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
 * Synchronously loads the product catalog on startup, preserving all admin edits, new products, and deletions.
 */
export function loadPersistedProductsSync(initialProducts: FilamentProduct[]): FilamentProduct[] {
  const delta = loadLocalCatalogDelta();

  // Recover any edits stored in printcore_products if not yet in delta
  try {
    const savedRaw = localStorage.getItem(FULL_PRODUCTS_KEY);
    if (savedRaw) {
      const savedList = JSON.parse(savedRaw);
      if (Array.isArray(savedList) && savedList.length > 0) {
        const initialMap = new Map(initialProducts.map((p) => [p.id, p]));
        let deltaChanged = false;
        const now = Date.now();

        for (const item of savedList) {
          if (!item || !item.id || item.id === 'test-01') continue;
          if ((delta.deletedProductIds || []).includes(item.id)) continue;

          if (!initialMap.has(item.id)) {
            const alreadyInCustom = delta.customProducts.some((cp) => cp.id === item.id);
            if (!alreadyInCustom) {
              const cleanItem = sanitizeProduct(item);
              delta.customProducts.unshift(cleanItem);
              delta.editedProductsMap[item.id] = cleanItem;
              delta.itemTimestamps = delta.itemTimestamps || {};
              delta.itemTimestamps[item.id] = delta.itemTimestamps[item.id] || now;
              deltaChanged = true;
            }
          } else {
            const base = initialMap.get(item.id)!;
            const hasDiff =
              item.name !== base.name ||
              item.price !== base.price ||
              item.stock !== base.stock ||
              item.brand !== base.brand ||
              item.material !== base.material ||
              item.imageUrl !== base.imageUrl ||
              item.description !== base.description ||
              item.nozzleTemp !== base.nozzleTemp ||
              item.bedTemp !== base.bedTemp ||
              item.maxSpeed !== base.maxSpeed ||
              (item.badge || '') !== (base.badge || '');

            if (hasDiff && !delta.editedProductsMap[item.id]) {
              delta.editedProductsMap[item.id] = sanitizeProduct(item);
              delta.itemTimestamps = delta.itemTimestamps || {};
              delta.itemTimestamps[item.id] = delta.itemTimestamps[item.id] || now;
              deltaChanged = true;
            }
          }
        }

        if (deltaChanged) {
          delta.updatedAt = Math.max(delta.updatedAt || 0, now);
          delta.catalogItemIds = Array.from(
            new Set([
              ...Object.keys(delta.editedProductsMap),
              ...delta.customProducts.map((p) => p.id),
            ])
          );
          saveLocalCatalogDelta(delta);
        }
      }
    }
  } catch (e) {
    console.warn('Error checking saved products:', e);
  }

  const finalProducts = applyCatalogDeltaToProducts(initialProducts, delta);
  try {
    localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(finalProducts));
  } catch {}
  return finalProducts;
}

/**
 * Syncs the current CatalogDelta and full product list to:
 * 1) Backend /api/catalog/sync (which directly rewrites /src/data/allMarketProducts.ts in the website codebase!)
 * 2) Per-product Firestore documents in settings/catalog_item_<id> (never hits 1MB doc limit, never corrupts images)
 * 3) Master index in Firestore settings/product_catalog
 */
export async function syncCatalogDeltaToCloud(
  delta: CatalogDelta,
  fullProducts?: FilamentProduct[],
  changedProduct?: FilamentProduct
): Promise<void> {
  const cleanDelta = sanitizeForFirestore(delta);
  const catalogItemIds = Array.from(
    new Set([
      ...Object.keys(cleanDelta.editedProductsMap || {}),
      ...(cleanDelta.customProducts || []).map((p) => p.id),
    ])
  );
  cleanDelta.catalogItemIds = catalogItemIds;

  // 1. Sync to backend server.ts API (rewrites /src/data/allMarketProducts.ts + /data/product_catalog_delta.json)
  try {
    fetch('/api/catalog/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delta: cleanDelta,
        fullProducts: fullProducts ? sanitizeForFirestore(fullProducts) : undefined,
      }),
    }).catch(() => {});
  } catch {}

  // 2. Write individual product document(s) to Firestore settings/catalog_item_<id>
  try {
    if (changedProduct && changedProduct.id) {
      const cleanProd = sanitizeProduct(changedProduct);
      const itemDocId = toSafeFirestoreDocId(cleanProd.id);
      await setDoc(doc(db, 'settings', itemDocId), {
        product: cleanProd,
        updatedAt: cleanDelta.itemTimestamps?.[cleanProd.id] || Date.now(),
      });
    } else {
      // Sync all edited/custom products to their individual Firestore docs
      for (const id of catalogItemIds) {
        const prod =
          cleanDelta.editedProductsMap?.[id] ||
          (cleanDelta.customProducts || []).find((p) => p.id === id);
        if (prod) {
          const cleanProd = sanitizeProduct(prod);
          const itemDocId = toSafeFirestoreDocId(cleanProd.id);
          await setDoc(doc(db, 'settings', itemDocId), {
            product: cleanProd,
            updatedAt: cleanDelta.itemTimestamps?.[cleanProd.id] || cleanDelta.updatedAt || Date.now(),
          });
        }
      }
    }
  } catch (e) {
    console.warn('Per-item Firestore catalog sync warning:', e);
  }

  // 3. Write master catalog index & lightweight delta to Firestore settings/product_catalog
  try {
    // Keep lightweight copies in the master doc if any image is a large base64 data URL (>80KB),
    // because the full base64 image is safely stored in its own settings/catalog_item_<id> document!
    const lightEditedMap: Record<string, FilamentProduct> = {};
    for (const [k, v] of Object.entries(cleanDelta.editedProductsMap || {})) {
      if (!v) continue;
      const copy = sanitizeProduct(v);
      if (copy.imageUrl && copy.imageUrl.startsWith('data:image/') && copy.imageUrl.length > 80000) {
        (copy as any).imageUrl = '__FIRESTORE_ITEM_DOC__';
      }
      lightEditedMap[k] = copy;
    }

    const lightCustomList = (cleanDelta.customProducts || []).map((v) => {
      const copy = sanitizeProduct(v);
      if (copy.imageUrl && copy.imageUrl.startsWith('data:image/') && copy.imageUrl.length > 80000) {
        (copy as any).imageUrl = '__FIRESTORE_ITEM_DOC__';
      }
      return copy;
    });

    await setDoc(doc(db, 'settings', 'product_catalog'), {
      customProducts: lightCustomList,
      editedProductsMap: lightEditedMap,
      deletedProductIds: cleanDelta.deletedProductIds || [],
      itemTimestamps: cleanDelta.itemTimestamps || {},
      deletedTimestamps: cleanDelta.deletedTimestamps || {},
      catalogItemIds,
      updatedAt: cleanDelta.updatedAt || Date.now(),
    });
  } catch (e) {
    console.warn('Firestore master product_catalog sync warning:', e);
  }
}

/**
 * Records an admin product creation or edit, saves to localStorage, rewrites website internal code via server API,
 * and saves to Firestore.
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

  syncCatalogDeltaToCloud(delta, updatedList, cleanProduct).catch(() => {});
  return updatedList;
}

/**
 * Records an admin product deletion, saves to localStorage, rewrites website internal code via server API,
 * and saves to Firestore.
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

  syncCatalogDeltaToCloud(delta, updatedList).catch(() => {});
  return updatedList;
}

/**
 * Subscribes to cloud & backend catalog updates and merges per-product by timestamp so
 * admin edits never revert, even across refreshes, devices, or days.
 */
export function subscribeToCloudCatalog(
  initialProducts: FilamentProduct[],
  onUpdate: (mergedProducts: FilamentProduct[]) => void
): () => void {
  // If local already has changes on startup, proactively push them to server & Firestore
  // so any edits made previously are guaranteed to be written into /src/data/allMarketProducts.ts and Firestore.
  const initialLocalDelta = loadLocalCatalogDelta();
  if (
    initialLocalDelta.updatedAt > 0 &&
    (Object.keys(initialLocalDelta.editedProductsMap).length > 0 ||
      initialLocalDelta.customProducts.length > 0 ||
      initialLocalDelta.deletedProductIds.length > 0)
  ) {
    const currentMerged = applyCatalogDeltaToProducts(initialProducts, initialLocalDelta);
    syncCatalogDeltaToCloud(initialLocalDelta, currentMerged).catch(() => {});
  }

  const mergeIncomingDelta = async (remoteDelta: Partial<CatalogDelta> | null | undefined) => {
    if (!remoteDelta || typeof remoteDelta !== 'object') return;
    const localDelta = loadLocalCatalogDelta();

    const remoteItemTimes = remoteDelta.itemTimestamps || {};
    const localItemTimes = localDelta.itemTimestamps || {};
    const remoteDeletedTimes = remoteDelta.deletedTimestamps || {};
    const localDeletedTimes = localDelta.deletedTimestamps || {};

    // Hydrate any '__FIRESTORE_ITEM_DOC__' placeholders from individual Firestore item documents
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
      const remoteItemTime = remoteItemTimes[id] || remoteDelta.updatedAt || 0;
      const localItemTime = localItemTimes[id] || 0;

      // Fetch individual doc if local doesn't have it, or remote is newer, or remote imageUrl was placeholder
      if (
        !localExisting ||
        remoteItemTime > localItemTime ||
        (remoteEditedMap[id] && (remoteEditedMap[id] as any).imageUrl === '__FIRESTORE_ITEM_DOC__')
      ) {
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

    // Merge deletions per product ID
    const mergedDeletedSet = new Set<string>([
      ...(localDelta.deletedProductIds || []),
      ...(Array.isArray(remoteDelta.deletedProductIds) ? remoteDelta.deletedProductIds : []),
    ]);
    const mergedDeletedTimes: Record<string, number> = {
      ...remoteDeletedTimes,
      ...localDeletedTimes,
    };

    // Merge editedProductsMap per product ID, keeping whichever version is newer
    const mergedEditedMap: Record<string, FilamentProduct> = { ...localDelta.editedProductsMap };
    const mergedItemTimes: Record<string, number> = { ...localItemTimes };

    for (const [id, rProd] of Object.entries(remoteEditedMap)) {
      if (!rProd || !rProd.id) continue;
      if ((rProd as any).imageUrl === '__FIRESTORE_ITEM_DOC__') {
        if (localDelta.editedProductsMap[id]?.imageUrl) {
          rProd.imageUrl = localDelta.editedProductsMap[id].imageUrl;
        }
      }
      const rTime = remoteItemTimes[id] || remoteDelta.updatedAt || 1;
      const lTime = localItemTimes[id] || (localDelta.editedProductsMap[id] ? localDelta.updatedAt || 1 : 0);
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

    // Merge customProducts per product ID
    const customMap = new Map<string, FilamentProduct>();
    for (const p of localDelta.customProducts || []) {
      if (p && p.id && !mergedDeletedSet.has(p.id)) {
        customMap.set(p.id, mergedEditedMap[p.id] || sanitizeProduct(p));
      }
    }
    for (const p of remoteCustomList) {
      if (p && p.id && !mergedDeletedSet.has(p.id)) {
        const rTime = remoteItemTimes[p.id] || remoteDelta.updatedAt || 1;
        const lTime = localItemTimes[p.id] || 0;
        if (!customMap.has(p.id) || rTime >= lTime) {
          customMap.set(p.id, mergedEditedMap[p.id] || sanitizeProduct(p));
        }
      }
    }

    // Filter out any deleted ID that was re-upserted more recently
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
    };

    saveLocalCatalogDelta(mergedDelta);
    const updatedProducts = applyCatalogDeltaToProducts(initialProducts, mergedDelta);
    try {
      localStorage.setItem(FULL_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch {}
    onUpdate(updatedProducts);
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
