import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, generateUserReferralCode, saveUserProfileToFirestore } from './firebase';
import { CartItem, Order, MemberProfile } from '../types';
import { isMockOrder } from './orderVerification';

// Storage key prefixes
const ACTIVE_USER_KEY = 'printcore_active_customer_session';
const GUEST_CART_KEY = 'printcore_guest_cart_items';
const GUEST_WISHLIST_KEY = 'printcore_wishlist_ids';
const GUEST_COMPARISON_KEY = 'printcore_guest_comparison_ids';
const GUEST_TRACKING_KEY = 'printcore_saved_tracking_numbers';
const GUEST_CHAT_KEY = 'printcore_guest_chat_history';

export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  points: number;
  totalSpent: number;
  phone?: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export function normalizeCustomerId(userId?: string | null): string | null {
  if (!userId || typeof userId !== 'string') return null;
  const trimmed = userId.trim();
  if (!trimmed || trimmed === 'guest' || trimmed === 'guest_maker' || trimmed.startsWith('guest_')) {
    return null;
  }
  return trimmed;
}

// -------------------------------------------------------------
// 1. Customer Auth Session
// -------------------------------------------------------------

export function getStoredCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && normalizeCustomerId(parsed.id)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse customer session:', e);
  }
  return null;
}

export function saveStoredCustomerSession(session: CustomerSession): void {
  const cleanId = normalizeCustomerId(session?.id);
  if (!cleanId) return;
  try {
    localStorage.setItem(
      ACTIVE_USER_KEY,
      JSON.stringify({
        ...session,
        id: cleanId,
      })
    );
  } catch (e) {
    console.warn('Failed to persist customer session:', e);
  }
}

export function clearStoredCustomerSession(): void {
  try {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } catch (e) {
    console.warn('Failed to clear customer session:', e);
  }
}

// -------------------------------------------------------------
// 2. 購物車 (Cart Items) Persistence & Isolation
// -------------------------------------------------------------

function isValidCartArray(arr: any): arr is CartItem[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      item.product &&
      typeof item.product.id === 'string' &&
      item.selectedColor &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
  );
}

/**
 * Merges two carts (e.g. saved member cart + items added while browsing as guest)
 * without duplicating identical product+color+diameter combinations.
 */
export function mergeCartItems(primaryCart: CartItem[], guestOrSecondaryCart: CartItem[]): CartItem[] {
  const safePrimary = isValidCartArray(primaryCart) ? primaryCart : [];
  const safeSecondary = isValidCartArray(guestOrSecondaryCart) ? guestOrSecondaryCart : [];

  if (safeSecondary.length === 0) return [...safePrimary];
  if (safePrimary.length === 0) return [...safeSecondary];

  const merged: CartItem[] = safePrimary.map((item) => ({ ...item }));

  for (const secItem of safeSecondary) {
    const existingIdx = merged.findIndex(
      (m) =>
        m.product.id === secItem.product.id &&
        m.selectedColor?.name === secItem.selectedColor?.name &&
        m.selectedDiameter === secItem.selectedDiameter
    );
    if (existingIdx > -1) {
      // Keep the higher or combined quantity if added during guest session
      merged[existingIdx] = {
        ...merged[existingIdx],
        quantity: merged[existingIdx].quantity + secItem.quantity,
      };
    } else {
      merged.push({ ...secItem });
    }
  }

  return merged;
}

export function getStoredCustomerCartSync(userId?: string | null): CartItem[] {
  const cleanUid = normalizeCustomerId(userId);
  const key = cleanUid ? `printcore_user_cart_${cleanUid}` : GUEST_CART_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidCartArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cart cache:', e);
  }
  return [];
}

export function clearGuestCartStorage(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {}
}

export async function saveCustomerCart(
  userId: string | null | undefined,
  cart: CartItem[],
  options?: { explicitClear?: boolean }
): Promise<void> {
  const safeCart = isValidCartArray(cart) ? cart : [];
  const cleanUid = normalizeCustomerId(userId);

  if (!cleanUid) {
    // Guest cart in isolated guest key only
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(safeCart));
    } catch {}
    return;
  }

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  // Safety guard: Never accidentally overwrite a non-empty saved customer cart with an empty array
  // unless explicitClear is true (e.g., user clicked "Clear Cart", removed the last item, or completed checkout).
  if (safeCart.length === 0 && !options?.explicitClear) {
    const existingLocal = getStoredCustomerCartSync(cleanUid);
    if (existingLocal.length > 0) {
      return;
    }
  }

  // 1. Mirror locally for instant UI recovery across page reloads & logins
  try {
    // Ensure guest cart is always empty when a logged-in user saves their cart
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.setItem(`printcore_user_cart_${cleanUid}`, JSON.stringify(safeCart));
    localStorage.setItem(
      `printcore_user_cart_meta_${cleanUid}`,
      JSON.stringify({
        updatedAt: nowIso,
        updatedAtMs: nowMs,
        explicitClear: Boolean(options?.explicitClear && safeCart.length === 0),
        count: safeCart.length,
      })
    );
  } catch {}

  // 2. Persist to Firestore subcollection
  try {
    const cartRef = doc(db, 'users', cleanUid, 'userData', 'cart');
    await setDoc(cartRef, {
      id: 'cart',
      userId: cleanUid,
      type: 'cart',
      data: JSON.stringify(safeCart),
      updatedAt: nowIso,
      updatedAtMs: nowMs,
      explicitClear: Boolean(options?.explicitClear && safeCart.length === 0),
    });
  } catch (error) {
    console.warn('Firestore cart sync fallback:', error);
  }
}

function repairDoubledCartOnce(cleanUid: string, cart: CartItem[]): { cart: CartItem[]; repaired: boolean } {
  if (!cleanUid || !Array.isArray(cart) || cart.length === 0) {
    return { cart, repaired: false };
  }
  const fixFlagKey = `printcore_cart_dedup_fix_v1_${cleanUid}`;
  try {
    if (localStorage.getItem(fixFlagKey) === '1') {
      return { cart, repaired: false };
    }
    localStorage.setItem(fixFlagKey, '1');
    // If all items in the stored cart were doubled by the previous self-merge bug (all quantities >= 2 and even)
    const allEvenAndAtLeastTwo = cart.every((item) => item.quantity >= 2 && item.quantity % 2 === 0);
    if (allEvenAndAtLeastTwo) {
      const fixedCart = cart.map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity / 2)),
      }));
      return { cart: fixedCart, repaired: true };
    }
  } catch {}
  return { cart, repaired: false };
}

export async function loadCustomerCart(userId: string | null | undefined): Promise<CartItem[]> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    return getStoredCustomerCartSync(null);
  }

  let localCart = getStoredCustomerCartSync(cleanUid);
  let localMeta: { updatedAtMs?: number; explicitClear?: boolean } = {};
  try {
    const metaRaw = localStorage.getItem(`printcore_user_cart_meta_${cleanUid}`);
    if (metaRaw) localMeta = JSON.parse(metaRaw);
  } catch {}

  // Try Firestore and reconcile with local cache so items are never lost or doubled
  try {
    const cartRef = doc(db, 'users', cleanUid, 'userData', 'cart');
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (isValidCartArray(parsed)) {
          const cloudMs = Number(data.updatedAtMs) || (data.updatedAt ? new Date(data.updatedAt).getTime() : 0);
          const localMs = Number(localMeta.updatedAtMs) || 0;

          // Case 1: Cloud has items, local has items -> pick the newer snapshot (NEVER sum quantities of two replicas)
          if (parsed.length > 0 && localCart.length > 0) {
            const rawBest = localMs >= cloudMs ? localCart : parsed;
            const { cart: best, repaired } = repairDoubledCartOnce(cleanUid, rawBest);
            localStorage.setItem(`printcore_user_cart_${cleanUid}`, JSON.stringify(best));
            if (repaired || localMs > cloudMs) {
              saveCustomerCart(cleanUid, best).catch(() => {});
            }
            return best;
          }

          // Case 2: Cloud has items, local is empty
          if (parsed.length > 0 && localCart.length === 0) {
            if (localMeta.explicitClear && localMs > cloudMs) {
              saveCustomerCart(cleanUid, [], { explicitClear: true }).catch(() => {});
              return [];
            }
            const { cart: best, repaired } = repairDoubledCartOnce(cleanUid, parsed);
            localStorage.setItem(`printcore_user_cart_${cleanUid}`, JSON.stringify(best));
            if (repaired) {
              saveCustomerCart(cleanUid, best).catch(() => {});
            }
            return best;
          }

          // Case 3: Cloud is empty, but local has items
          if (parsed.length === 0 && localCart.length > 0) {
            if (data.explicitClear && cloudMs > localMs) {
              localStorage.setItem(`printcore_user_cart_${cleanUid}`, JSON.stringify([]));
              return [];
            }
            const { cart: best } = repairDoubledCartOnce(cleanUid, localCart);
            saveCustomerCart(cleanUid, best).catch(() => {});
            return best;
          }

          return parsed;
        }
      }
    } else if (localCart.length > 0) {
      const { cart: best } = repairDoubledCartOnce(cleanUid, localCart);
      saveCustomerCart(cleanUid, best).catch(() => {});
      return best;
    }
  } catch (error) {
    console.warn('Firestore cart load fallback to local:', error);
  }

  const { cart: repairedLocal, repaired } = repairDoubledCartOnce(cleanUid, localCart);
  if (repaired) {
    saveCustomerCart(cleanUid, repairedLocal).catch(() => {});
  }
  return repairedLocal;
}

// -------------------------------------------------------------
// 3. 收藏清單 (Wishlist) Persistence & Isolation
// -------------------------------------------------------------

export function getStoredCustomerWishlistSync(userId?: string | null): string[] {
  const cleanUid = normalizeCustomerId(userId);
  const key = cleanUid ? `printcore_user_wishlist_${cleanUid}` : GUEST_WISHLIST_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
      }
    }
  } catch {}
  return [];
}

export function clearGuestWishlistStorage(): void {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {}
}

export async function saveCustomerWishlist(
  userId: string | null | undefined,
  wishlistIds: string[],
  options?: { explicitClear?: boolean }
): Promise<void> {
  const safeIds = Array.isArray(wishlistIds)
    ? Array.from(new Set(wishlistIds.filter((id) => typeof id === 'string' && id.trim().length > 0)))
    : [];
  const cleanUid = normalizeCustomerId(userId);

  if (!cleanUid) {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(safeIds));
    } catch {}
    return;
  }

  if (safeIds.length === 0 && !options?.explicitClear) {
    const existingLocal = getStoredCustomerWishlistSync(cleanUid);
    if (existingLocal.length > 0) {
      return;
    }
  }

  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  try {
    localStorage.setItem(`printcore_user_wishlist_${cleanUid}`, JSON.stringify(safeIds));
    localStorage.setItem(
      `printcore_user_wishlist_meta_${cleanUid}`,
      JSON.stringify({
        updatedAtMs: nowMs,
        explicitClear: Boolean(options?.explicitClear && safeIds.length === 0),
      })
    );
  } catch {}

  try {
    const wishRef = doc(db, 'users', cleanUid, 'userData', 'wishlist');
    await setDoc(wishRef, {
      id: 'wishlist',
      userId: cleanUid,
      type: 'wishlist',
      data: JSON.stringify(safeIds),
      updatedAt: nowIso,
      updatedAtMs: nowMs,
      explicitClear: Boolean(options?.explicitClear && safeIds.length === 0),
    });
  } catch (error) {
    console.warn('Firestore wishlist sync fallback:', error);
  }
}

export async function loadCustomerWishlist(userId: string | null | undefined): Promise<string[]> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    return getStoredCustomerWishlistSync(null);
  }

  const localIds = getStoredCustomerWishlistSync(cleanUid);

  try {
    const wishRef = doc(db, 'users', cleanUid, 'userData', 'wishlist');
    const snap = await getDoc(wishRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) {
          const cleanCloud = parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
          if (cleanCloud.length === 0 && localIds.length > 0 && !data.explicitClear) {
            saveCustomerWishlist(cleanUid, localIds).catch(() => {});
            return localIds;
          }
          const merged = Array.from(new Set([...cleanCloud, ...localIds]));
          localStorage.setItem(`printcore_user_wishlist_${cleanUid}`, JSON.stringify(merged));
          return merged;
        }
      }
    } else if (localIds.length > 0) {
      saveCustomerWishlist(cleanUid, localIds).catch(() => {});
      return localIds;
    }
  } catch (error) {
    console.warn('Firestore wishlist load fallback to local:', error);
  }

  return localIds;
}

// -------------------------------------------------------------
// 3B. 規格對比清單 (Comparison IDs) Persistence & Isolation
// -------------------------------------------------------------

export function getStoredCustomerComparisonSync(userId?: string | null): string[] {
  const cleanUid = normalizeCustomerId(userId);
  const key = cleanUid ? `printcore_user_comparison_${cleanUid}` : GUEST_COMPARISON_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0).slice(0, 4);
      }
    }
  } catch {}
  return [];
}

export async function saveCustomerComparison(
  userId: string | null | undefined,
  comparisonIds: string[]
): Promise<void> {
  const safeIds = Array.isArray(comparisonIds)
    ? Array.from(new Set(comparisonIds.filter((id) => typeof id === 'string'))).slice(0, 4)
    : [];
  const cleanUid = normalizeCustomerId(userId);

  if (!cleanUid) {
    try {
      localStorage.setItem(GUEST_COMPARISON_KEY, JSON.stringify(safeIds));
    } catch {}
    return;
  }

  try {
    localStorage.setItem(`printcore_user_comparison_${cleanUid}`, JSON.stringify(safeIds));
  } catch {}

  try {
    const compRef = doc(db, 'users', cleanUid, 'userData', 'comparison');
    await setDoc(compRef, {
      id: 'comparison',
      userId: cleanUid,
      type: 'comparison',
      data: JSON.stringify(safeIds),
      updatedAt: new Date().toISOString(),
    });
  } catch {}
}

export async function loadCustomerComparison(userId: string | null | undefined): Promise<string[]> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) return getStoredCustomerComparisonSync(null);

  const localIds = getStoredCustomerComparisonSync(cleanUid);
  try {
    const compRef = doc(db, 'users', cleanUid, 'userData', 'comparison');
    const snap = await getDoc(compRef);
    if (snap.exists()) {
      const d = snap.data();
      if (d?.data) {
        const parsed = JSON.parse(d.data);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((id) => typeof id === 'string').slice(0, 4);
          localStorage.setItem(`printcore_user_comparison_${cleanUid}`, JSON.stringify(valid));
          return valid;
        }
      }
    }
  } catch {}
  return localIds;
}

// -------------------------------------------------------------
// 4. 購買紀錄與訂單 (Purchase History / Orders)
// -------------------------------------------------------------

export function getStoredCustomerOrdersSync(userId?: string | null): Order[] {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) return [];
  try {
    const raw = localStorage.getItem(`printcore_user_orders_${cleanUid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((o) => !isMockOrder(o));
      }
    }
  } catch {}
  return [];
}

export async function saveCustomerOrderRecord(order: Order, userId: string | null | undefined): Promise<void> {
  const effectiveUid = normalizeCustomerId(userId) || normalizeCustomerId(auth.currentUser?.uid) || 'guest_maker';

  // 1. Cache in customer orders list locally
  if (effectiveUid !== 'guest_maker') {
    try {
      const localKey = `printcore_user_orders_${effectiveUid}`;
      const raw = localStorage.getItem(localKey);
      const existing: Order[] = raw ? JSON.parse(raw) : [];
      const orderWithUid = { ...order, userId: effectiveUid };
      const updated = [orderWithUid, ...existing.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)];
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}
  }

  // 2. Persist to Firestore /orders/{order.id}
  try {
    const orderDoc = {
      id: order.id,
      userId: effectiveUid,
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      shippingAddress: order.storeOrAddress || '',
      shippingMethod: order.shippingMethod || '7-11',
      paymentMethod: order.paymentGateway || 'newebpay',
      totalAmount: Number(order.total) || 0,
      status: order.orderStatus || 'confirmed',
      createdAt: order.createdAt || new Date().toISOString(),
      orderNumber: order.orderNumber,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      pointsDeduction: order.pointsDeduction,
      pointsEarned: order.pointsEarned,
      trackingNumber: order.trackingNumber,
      invoiceNumber: order.invoiceNumber,
      invoiceType: order.invoiceType,
      invoiceCarrierValue: order.invoiceCarrierValue || '',
      notes: order.notes || '',
    };
    await setDoc(doc(db, 'orders', order.id), orderDoc);
  } catch (error) {
    console.warn('Firestore order save fallback:', error);
  }
}

export async function loadCustomerOrders(userId: string | null | undefined): Promise<Order[]> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    return [];
  }

  const localOrders = getStoredCustomerOrdersSync(cleanUid);

  // 1. Query Firestore for this customer's orders
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', cleanUid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        ordersList.push({
          id: d.id || docSnap.id,
          orderNumber: d.orderNumber || `ORD-${docSnap.id.substring(0, 8)}`,
          createdAt: d.createdAt || '',
          customerName: d.customerName || '',
          customerEmail: d.customerEmail || '',
          customerPhone: d.customerPhone || '',
          shippingMethod: d.shippingMethod || '7-11',
          storeOrAddress: d.shippingAddress || '',
          items: d.items || [],
          subtotal: d.subtotal || d.totalAmount || 0,
          shippingFee: d.shippingFee || 0,
          discount: d.discount || 0,
          pointsDeduction: d.pointsDeduction || 0,
          pointsEarned: d.pointsEarned || 0,
          total: d.totalAmount || 0,
          paymentGateway: d.paymentMethod || d.paymentGateway || 'ecpay_credit',
          paymentStatus:
            d.paymentStatus ||
            (String(d.status || d.orderStatus || '').toLowerCase() === 'unpaid' ? 'unpaid' : 'paid'),
          orderStatus: (d.orderStatus || d.status || 'paid') as any,
          trackingNumber: d.trackingNumber || '',
          invoiceNumber: d.invoiceNumber || `TW-${Date.now().toString().substring(5)}`,
          invoiceType: d.invoiceType || 'cloud',
          invoiceCarrierValue: d.invoiceCarrierValue,
          notes: d.notes,
          userId: d.userId || cleanUid,
        });
      });

      // Merge with any local orders for this user
      const byOrderNo = new Map<string, Order>();
      for (const lo of localOrders) {
        if (!isMockOrder(lo)) byOrderNo.set(lo.orderNumber || lo.id, { ...lo, userId: cleanUid });
      }
      for (const co of ordersList) {
        if (!isMockOrder(co)) byOrderNo.set(co.orderNumber || co.id, { ...co, userId: cleanUid });
      }

      const genuineOrders = Array.from(byOrderNo.values());
      genuineOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      try {
        localStorage.setItem(`printcore_user_orders_${cleanUid}`, JSON.stringify(genuineOrders));
      } catch {}
      return genuineOrders;
    }
  } catch (error) {
    console.warn('Firestore orders query fallback to local cache:', error);
  }

  return localOrders;
}

// -------------------------------------------------------------
// 5. 物流追蹤紀錄 (Logistics Tracking Numbers)
// -------------------------------------------------------------

function sanitizeTrackingNumbers(numbers: string[]): string[] {
  if (!Array.isArray(numbers)) return [];
  return numbers.filter((n) => {
    if (!n || typeof n !== 'string') return false;
    const clean = n.trim();
    if (clean === '77391829310' || clean.includes('77391829310')) return false;
    if (clean.startsWith('MOCK') || clean.startsWith('TEST')) return false;
    return clean.length >= 8;
  });
}

export async function saveCustomerTrackingNumbers(
  userId: string | null | undefined,
  trackingNumbers: string[]
): Promise<void> {
  const sanitized = sanitizeTrackingNumbers(trackingNumbers);
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    try {
      localStorage.setItem(GUEST_TRACKING_KEY, JSON.stringify(sanitized));
    } catch {}
    return;
  }

  try {
    localStorage.setItem(`printcore_user_tracking_${cleanUid}`, JSON.stringify(sanitized));
  } catch {}

  try {
    const trackRef = doc(db, 'users', cleanUid, 'userData', 'tracking');
    await setDoc(trackRef, {
      id: 'tracking',
      userId: cleanUid,
      type: 'tracking',
      data: JSON.stringify(sanitized),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore tracking save fallback:', error);
  }
}

export async function loadCustomerTrackingNumbers(userId: string | null | undefined): Promise<string[]> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    try {
      const raw = localStorage.getItem(GUEST_TRACKING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return sanitizeTrackingNumbers(parsed);
      }
    } catch {}
    return [];
  }

  try {
    const trackRef = doc(db, 'users', cleanUid, 'userData', 'tracking');
    const snap = await getDoc(trackRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) {
          const cleaned = sanitizeTrackingNumbers(parsed);
          localStorage.setItem(`printcore_user_tracking_${cleanUid}`, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore tracking load fallback to local:', error);
  }

  try {
    const localRaw = localStorage.getItem(`printcore_user_tracking_${cleanUid}`);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      return sanitizeTrackingNumbers(parsed);
    }
  } catch {}

  return [];
}

// -------------------------------------------------------------
// 6. 客服與 AI 技術對話 (Chat Messages - Strict Per-User Isolation)
// -------------------------------------------------------------

export interface DiagnosticSolution {
  answer?: string;
  probableCauses?: string[];
  solutions?: string[];
  recommendedAdjustment?: {
    temperature?: string;
    speed?: string;
    retraction?: string;
    cooling?: string;
  };
  checklist?: string[];
}

export interface ChatMessage {
  id?: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp?: number;
  solution?: DiagnosticSolution;
  isLoading?: boolean;
  modelUsed?: string;
}

function cleanStoredMessages(msgs: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(msgs)) return [];
  return msgs.filter((m) => {
    if (!m || !m.text) return false;
    if (
      m.text.includes('【Gemini 模型調度指示】') ||
      m.text.includes('【Gemini 模型調度異常】') ||
      m.text.includes('【Gemini 調度異常】') ||
      m.text.includes('尚未偵測到 Google Gemini API Key') ||
      m.text.includes('針對您詢問的') ||
      m.text.includes('神狗勾 3D 專家團隊為您提供以下建議')
    ) {
      return false;
    }
    return true;
  });
}

export function getStoredCustomerChatSync(userId?: string | null): ChatMessage[] {
  const cleanUid = normalizeCustomerId(userId);
  const storageKey = cleanUid ? `printcore_user_chat_${cleanUid}` : GUEST_CHAT_KEY;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return cleanStoredMessages(parsed);
      }
    }
  } catch {}
  return [];
}

export async function saveCustomerChatMessages(
  userId: string | null | undefined,
  messages: ChatMessage[]
): Promise<void> {
  const cleanUid = normalizeCustomerId(userId);
  const sanitized = cleanStoredMessages(messages);
  const storageKey = cleanUid ? `printcore_user_chat_${cleanUid}` : GUEST_CHAT_KEY;

  // Strictly save only to this user's isolated key (never to a global shared key)
  try {
    localStorage.setItem(storageKey, JSON.stringify(sanitized));
    // Purge legacy global shared key so accounts never mix chat histories
    localStorage.removeItem('goddog_ai_chat_history_v2');
  } catch {}

  if (!cleanUid) return;

  // Persist to Firestore for logged-in user
  try {
    const chatRef = doc(db, 'users', cleanUid, 'userData', 'chat');
    const trimmed = sanitized.slice(-100);
    await setDoc(chatRef, {
      id: 'chat',
      userId: cleanUid,
      type: 'chat',
      data: JSON.stringify(trimmed),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore chat save fallback:', error);
  }
}

export async function loadCustomerChatMessages(
  userId: string | null | undefined
): Promise<ChatMessage[] | null> {
  const cleanUid = normalizeCustomerId(userId);
  const localMessages = getStoredCustomerChatSync(cleanUid);

  if (cleanUid) {
    try {
      const chatRef = doc(db, 'users', cleanUid, 'userData', 'chat');
      const snap = await getDoc(chatRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.data) {
          const parsed = JSON.parse(data.data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = cleanStoredMessages(parsed);
            if (cleaned.length >= localMessages.length && cleaned.length > 0) {
              localStorage.setItem(`printcore_user_chat_${cleanUid}`, JSON.stringify(cleaned));
              return cleaned;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Firestore chat load fallback to local:', error);
    }
  }

  return localMessages.length > 0 ? localMessages : null;
}

// -------------------------------------------------------------
// 7. 擴充會員數據 (Printers, Addresses, Coupons, Settings, Profile)
// -------------------------------------------------------------

export async function saveCustomerUserData(
  userId: string | null | undefined,
  collectionName: string,
  data: any
): Promise<void> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) {
    try {
      localStorage.setItem(`printcore_user_${collectionName}_guest`, JSON.stringify(data));
    } catch {}
    return;
  }
  try {
    localStorage.setItem(`printcore_user_${collectionName}_${cleanUid}`, JSON.stringify(data));
  } catch {}

  try {
    const ref = doc(db, 'users', cleanUid, 'userData', collectionName);
    await setDoc(ref, {
      id: collectionName,
      userId: cleanUid,
      type: collectionName,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn(`Firestore ${collectionName} save fallback:`, error);
  }
}

export async function loadCustomerUserData(
  userId: string | null | undefined,
  collectionName: string
): Promise<any | null> {
  const cleanUid = normalizeCustomerId(userId);
  const effectiveKey = cleanUid
    ? `printcore_user_${collectionName}_${cleanUid}`
    : `printcore_user_${collectionName}_guest`;

  let localData: any = null;
  try {
    const raw = localStorage.getItem(effectiveKey);
    if (raw) localData = JSON.parse(raw);
  } catch {}

  if (cleanUid) {
    try {
      const ref = doc(db, 'users', cleanUid, 'userData', collectionName);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.data) {
          const parsed = JSON.parse(data.data);
          localStorage.setItem(effectiveKey, data.data);
          return parsed;
        }
      } else if (localData !== null) {
        // Sync existing local data to Firestore
        saveCustomerUserData(cleanUid, collectionName, localData).catch(() => {});
      }
    } catch (error) {
      console.warn(`Firestore ${collectionName} load fallback:`, error);
    }
  }

  return localData;
}

/**
 * Unified VIP validity check across storefront, cart, checkout, subscription, profile & achievements
 */
export function isMemberVipActive(member: any): boolean {
  if (!member || typeof member !== 'object') return false;
  const plan = member.subscriptionPlan;
  if (!plan || plan === 'None') return false;
  const status = member.subscriptionStatus;
  if (status === 'expired' || status === 'inactive') return false;
  if (member.subscriptionExpiry) {
    const expiryMs = new Date(member.subscriptionExpiry).getTime();
    if (!Number.isNaN(expiryMs) && expiryMs <= Date.now()) {
      return false;
    }
  }
  return status === 'active' || status === 'cancelled';
}

/**
 * Strictly sanitizes customer profiles to purge any legacy mock/simulated subscription and delegation data
 */
export function sanitizeCustomerProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') return profile;

  const cleaned = { ...profile };

  const expiryMs = cleaned.subscriptionExpiry ? new Date(cleaned.subscriptionExpiry).getTime() : NaN;
  const isUnexpiredCancelled =
    cleaned.subscriptionStatus === 'cancelled' && !Number.isNaN(expiryMs) && expiryMs > Date.now();

  const hasGenuinePlan = Boolean(
    cleaned.subscriptionPlan &&
      cleaned.subscriptionPlan !== 'None' &&
      (cleaned.subscriptionStatus === 'active' || isUnexpiredCancelled)
  );

  if (!hasGenuinePlan) {
    cleaned.subscriptionPlan = 'None';
    cleaned.subscriptionStatus = 'inactive';
    cleaned.subscriptionPeriodNo = undefined;
    cleaned.subscriptionCardLast4 = undefined;
    cleaned.subscriptionNextBillingDate = undefined;
    cleaned.subscriptionStartDate = undefined;
    cleaned.subscriptionExpiry = undefined;
    cleaned.subscriptionAmount = undefined;
    cleaned.autoRenew = false;
    cleaned.subscriptionHistory = [];
  } else if (Array.isArray(cleaned.subscriptionHistory)) {
    cleaned.subscriptionHistory = cleaned.subscriptionHistory.filter((item: any) => {
      if (!item) return false;
      if (item.periodNo === 'P2609160012' || item.periodNo === 'P8839201948') return false;
      if (
        typeof item.authCode === 'string' &&
        (item.authCode === 'AUTH-524176' || item.authCode.startsWith('AUTH-MOCK'))
      )
        return false;
      if (typeof item.invoiceNumber === 'string' && item.invoiceNumber === 'TW-202609-91971652')
        return false;
      return true;
    });
  }

  return cleaned;
}

export function getStoredCustomerProfileSync(userId?: string | null): MemberProfile | null {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) return null;

  // Check user-specific profile keys first
  try {
    const rawSpecific =
      localStorage.getItem(`printcore_user_profile_${cleanUid}`) ||
      localStorage.getItem(`printcore_user_profile_${cleanUid}_doc`);
    if (rawSpecific) {
      const parsed = JSON.parse(rawSpecific);
      if (parsed && typeof parsed === 'object' && parsed.id === cleanUid) {
        return sanitizeCustomerProfile(parsed);
      }
    }
  } catch {}

  // Fallback to active member key ONLY if its ID strictly matches cleanUid
  try {
    const rawActive = localStorage.getItem('printcore_member');
    if (rawActive) {
      const parsed = JSON.parse(rawActive);
      if (parsed && typeof parsed === 'object' && parsed.id === cleanUid) {
        return sanitizeCustomerProfile(parsed);
      }
    }
  } catch {}

  return null;
}

export async function saveCustomerProfileDoc(userId: string, profile: any): Promise<void> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid || !profile) return;
  const sanitized = sanitizeCustomerProfile({
    ...profile,
    id: cleanUid,
  });

  try {
    localStorage.setItem(`printcore_user_profile_${cleanUid}`, JSON.stringify(sanitized));
  } catch {}

  try {
    const userDocRef = doc(db, 'users', cleanUid);
    await setDoc(
      userDocRef,
      {
        ...sanitized,
        id: cleanUid,
        email: sanitized.email || 'maker@gmail.com',
        name: sanitized.name || '創客會員',
        tier: sanitized.tier || 'Bronze',
        points: typeof sanitized.points === 'number' && sanitized.points >= 0 ? sanitized.points : 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore profile save fallback:', error);
  }
}

export async function loadCustomerProfileDoc(
  userId: string,
  fallbackUser?: { email?: string | null; displayName?: string | null; points?: number; tier?: string }
): Promise<MemberProfile | null> {
  const cleanUid = normalizeCustomerId(userId);
  if (!cleanUid) return null;

  const localCached = getStoredCustomerProfileSync(cleanUid);

  try {
    const userDocRef = doc(db, 'users', cleanUid);
    const snap = await getDoc(userDocRef);

    // Also check subcollection userData/profile in case extra fields were saved there
    let subProfile: any = null;
    try {
      const subSnap = await getDoc(doc(db, 'users', cleanUid, 'userData', 'profile'));
      if (subSnap.exists() && subSnap.data()?.data) {
        subProfile = JSON.parse(subSnap.data().data);
      }
    } catch {}

    if (snap.exists() || subProfile) {
      const rootData = snap.exists() ? snap.data() : {};
      const merged = sanitizeCustomerProfile({
        ...(localCached || {}),
        ...(subProfile || {}),
        ...rootData,
        id: cleanUid,
        email: rootData.email || subProfile?.email || localCached?.email || fallbackUser?.email || '',
        name:
          rootData.name ||
          subProfile?.name ||
          localCached?.name ||
          fallbackUser?.displayName ||
          fallbackUser?.email?.split('@')[0] ||
          '創客會員',
        tier: rootData.tier || subProfile?.tier || localCached?.tier || fallbackUser?.tier || 'Bronze',
        points:
          typeof rootData.points === 'number'
            ? Math.max(rootData.points, subProfile?.points || 0)
            : typeof subProfile?.points === 'number'
            ? subProfile.points
            : typeof localCached?.points === 'number'
            ? localCached.points
            : 120,
        coupons:
          Array.isArray(subProfile?.coupons) && subProfile.coupons.length > 0
            ? subProfile.coupons
            : Array.isArray(rootData.coupons) && rootData.coupons.length > 0
            ? rootData.coupons
            : Array.isArray(localCached?.coupons)
            ? localCached.coupons
            : [],
        referralCode:
          rootData.referralCode ||
          subProfile?.referralCode ||
          localCached?.referralCode ||
          generateUserReferralCode(cleanUid, rootData.email || fallbackUser?.email || ''),
      });

      // If user has a pending referral code in localStorage and hasn't bound a referrer yet, bind it now
      if (localStorage.getItem('printcore_referral_code') && !merged.referredBy) {
        const syncedWithRef = await saveUserProfileToFirestore(merged);
        if (syncedWithRef) {
          localStorage.setItem(`printcore_user_profile_${cleanUid}`, JSON.stringify(syncedWithRef));
          return sanitizeCustomerProfile(syncedWithRef);
        }
      }

      localStorage.setItem(`printcore_user_profile_${cleanUid}`, JSON.stringify(merged));
      return merged;
    } else if (localCached) {
      // Push local cached profile to Firestore (and bind referral if pending)
      const withRefCode = {
        ...localCached,
        referralCode:
          localCached.referralCode ||
          generateUserReferralCode(cleanUid, localCached.email || fallbackUser?.email || ''),
      };
      const synced = await saveUserProfileToFirestore(withRefCode);
      return sanitizeCustomerProfile(synced || withRefCode);
    } else {
      // Brand new user — initialize clean profile once with unique referralCode & referral binding
      const initialProfile: MemberProfile = {
        id: cleanUid,
        name: fallbackUser?.displayName || fallbackUser?.email?.split('@')[0] || '創客會員',
        email: fallbackUser?.email || '',
        phone: '',
        tier: (fallbackUser?.tier as any) || 'Bronze',
        points: typeof fallbackUser?.points === 'number' ? fallbackUser.points : 120,
        totalSpent: 0,
        ordersCount: 0,
        referralCode: generateUserReferralCode(cleanUid, fallbackUser?.email || ''),
        birthday: '',
        subscriptionPlan: 'None',
        subscriptionStatus: 'inactive',
        autoRenew: false,
        subscriptionFrequency: '',
        subscriptionHistory: [],
        coupons: [],
      };
      const synced = await saveUserProfileToFirestore(initialProfile);
      return sanitizeCustomerProfile(synced || initialProfile);
    }
  } catch (error) {
    console.warn('Firestore load profile fallback:', error);
    if (localCached) return localCached;
  }
  return null;
}

// -------------------------------------------------------------
// 8. 最近瀏覽紀錄 (Recently Viewed - Strict Per-User Isolation)
// -------------------------------------------------------------

export function getStoredRecentlyViewedSync(userId?: string | null): any[] {
  const cleanUid = normalizeCustomerId(userId);

  if (cleanUid) {
    try {
      const rawUser = localStorage.getItem(`printcore_user_recent_${cleanUid}`);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: any) => item && item.id);
        }
      }
    } catch (e) {
      console.warn('Error reading user recently viewed cache:', e);
    }
    return [];
  }

  try {
    const rawGuest = localStorage.getItem('printcore_guest_recent');
    if (rawGuest) {
      const parsed = JSON.parse(rawGuest);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: any) => item && item.id);
      }
    }
  } catch (e) {
    console.warn('Error reading guest recently viewed cache:', e);
  }
  return [];
}

export async function saveCustomerRecentlyViewed(
  userId: string | null | undefined,
  product: any
): Promise<void> {
  if (!product || !product.id) return;

  const viewItem = {
    id: String(product.id),
    name: String(product.name || '3D 列印優質耗材'),
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || product.price || 0),
    imageUrl: product.imageUrl || product.image || product.img || '',
    image: product.imageUrl || product.image || product.img || '',
    category: product.category || product.material || 'PLA',
    material: product.material || 'PLA',
    brand: product.brand || '神狗勾',
    weight: product.weight || '1.0kg',
    rating: Number(product.rating || 5.0),
    colors: Array.isArray(product.colors) ? product.colors : [],
    diameter: product.diameter || '1.75mm',
    viewedAt: new Date().toISOString(),
  };

  const cleanUid = normalizeCustomerId(userId);
  const targetStorageKey = cleanUid ? `printcore_user_recent_${cleanUid}` : 'printcore_guest_recent';

  let currentList: any[] = [];
  try {
    const raw = localStorage.getItem(targetStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) currentList = parsed;
    }
  } catch {}

  currentList = currentList.filter((p: any) => p && p.id !== viewItem.id);
  currentList.unshift(viewItem);
  if (currentList.length > 50) currentList = currentList.slice(0, 50);

  try {
    localStorage.setItem(targetStorageKey, JSON.stringify(currentList));
  } catch (e) {
    console.warn('Failed to update local recently viewed:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('printcore_recently_viewed_updated', {
        detail: { item: viewItem, list: currentList, userId: cleanUid },
      })
    );
  }

  if (cleanUid) {
    try {
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(
        ref,
        {
          id: 'recentlyViewed',
          userId: cleanUid,
          type: 'recentlyViewed',
          data: JSON.stringify(currentList),
          count: currentList.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((e) => {
        console.warn('Firestore recentlyViewed sync notice:', e);
      });
    } catch (e) {
      console.warn('Error syncing recently viewed to Firestore:', e);
    }
  }
}

export async function deleteSingleCustomerRecentlyViewed(
  userId: string | null | undefined,
  productId: string
): Promise<any[]> {
  if (!productId) return [];
  const cleanUid = normalizeCustomerId(userId);
  const targetStorageKey = cleanUid ? `printcore_user_recent_${cleanUid}` : 'printcore_guest_recent';

  let currentList: any[] = [];
  try {
    const raw = localStorage.getItem(targetStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) currentList = parsed;
    }
  } catch {}

  const updatedList = currentList.filter((p: any) => p && p.id !== productId);

  try {
    localStorage.setItem(targetStorageKey, JSON.stringify(updatedList));
  } catch {}

  if (cleanUid) {
    try {
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(
        ref,
        {
          id: 'recentlyViewed',
          userId: cleanUid,
          type: 'recentlyViewed',
          data: JSON.stringify(updatedList),
          count: updatedList.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } catch (e) {
      console.warn('Failed to update Firestore after item deletion:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('printcore_recently_viewed_updated', {
        detail: { removedId: productId, list: updatedList, userId: cleanUid },
      })
    );
  }

  return updatedList;
}

export async function loadCustomerRecentlyViewed(userId: string | null | undefined): Promise<any[]> {
  const cleanUid = normalizeCustomerId(userId);
  const localList = getStoredRecentlyViewedSync(cleanUid);

  if (!cleanUid) {
    return localList;
  }

  try {
    const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      if (d?.data) {
        const parsed = JSON.parse(d.data);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0 && localList.length > 0) {
            return localList;
          }
          localStorage.setItem(`printcore_user_recent_${cleanUid}`, JSON.stringify(parsed));
          return parsed;
        }
      }
    } else if (localList.length > 0) {
      await setDoc(ref, {
        id: 'recentlyViewed',
        userId: cleanUid,
        type: 'recentlyViewed',
        data: JSON.stringify(localList),
        count: localList.length,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('Firestore load recently viewed notice:', e);
  }

  return localList;
}

export async function clearCustomerRecentlyViewed(userId: string | null | undefined): Promise<void> {
  const cleanUid = normalizeCustomerId(userId);
  try {
    if (cleanUid) {
      localStorage.removeItem(`printcore_user_recent_${cleanUid}`);
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(ref, {
        id: 'recentlyViewed',
        userId: cleanUid,
        type: 'recentlyViewed',
        data: JSON.stringify([]),
        count: 0,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } else {
      localStorage.removeItem('printcore_guest_recent');
    }
    localStorage.removeItem('printcore_recent_views_all');
  } catch (e) {
    console.warn('Failed to clear recently viewed:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('printcore_recently_viewed_cleared', {
        detail: { userId: cleanUid },
      })
    );
  }
}
