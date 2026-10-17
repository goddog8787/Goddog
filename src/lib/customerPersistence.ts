import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { CartItem, Order, MemberProfile } from '../types';
import { isMockOrder } from './orderVerification';

// Storage key prefixes
const ACTIVE_USER_KEY = 'printcore_active_customer_session';
const GUEST_CART_KEY = 'printcore_guest_cart_items';
const GUEST_WISHLIST_KEY = 'printcore_wishlist_ids';
const GUEST_TRACKING_KEY = 'printcore_saved_tracking_numbers';

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

// -------------------------------------------------------------
// 1. Customer Auth Session
// -------------------------------------------------------------

export function getStoredCustomerSession(): CustomerSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse customer session:', e);
  }
  return null;
}

export function saveStoredCustomerSession(session: CustomerSession): void {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(session));
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
// 2. 購物車 (Cart Items) Persistence
// -------------------------------------------------------------

export async function saveCustomerCart(userId: string | null | undefined, cart: CartItem[]): Promise<void> {
  if (!userId) {
    // Guest cart in localStorage
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch {}
    return;
  }

  // 1. Mirror locally for instant UI recovery
  try {
    localStorage.setItem(`printcore_user_cart_${userId}`, JSON.stringify(cart));
  } catch {}

  // 2. Persist to Firestore subcollection
  try {
    const cartRef = doc(db, 'users', userId, 'userData', 'cart');
    await setDoc(cartRef, {
      id: 'cart',
      userId,
      type: 'cart',
      data: JSON.stringify(cart),
      updatedAt: new Date().toISOString(),
    });
    console.log(`🛒 Cart successfully saved to Firestore for user: ${userId} (${cart.length} items)`);
  } catch (error) {
    console.warn('Firestore cart sync fallback:', error);
  }
}

export async function loadCustomerCart(userId: string | null | undefined): Promise<CartItem[] | null> {
  if (!userId) {
    try {
      const guestRaw = localStorage.getItem(GUEST_CART_KEY);
      if (guestRaw) return JSON.parse(guestRaw);
    } catch {}
    return null;
  }

  // Try Firestore first
  try {
    const cartRef = doc(db, 'users', userId, 'userData', 'cart');
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) {
          // Cache locally
          localStorage.setItem(`printcore_user_cart_${userId}`, data.data);
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore cart load fallback to local:', error);
  }

  // Local cache fallback
  try {
    const localRaw = localStorage.getItem(`printcore_user_cart_${userId}`);
    if (localRaw) return JSON.parse(localRaw);
  } catch {}

  return null;
}

// -------------------------------------------------------------
// 3. 收藏清單 (Wishlist) Persistence
// -------------------------------------------------------------

export async function saveCustomerWishlist(userId: string | null | undefined, wishlistIds: string[]): Promise<void> {
  if (!userId) {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {}
    return;
  }

  // Mirror locally
  try {
    localStorage.setItem(`printcore_user_wishlist_${userId}`, JSON.stringify(wishlistIds));
  } catch {}

  // Save to Firestore
  try {
    const wishRef = doc(db, 'users', userId, 'userData', 'wishlist');
    await setDoc(wishRef, {
      id: 'wishlist',
      userId,
      type: 'wishlist',
      data: JSON.stringify(wishlistIds),
      updatedAt: new Date().toISOString(),
    });
    console.log(`❤️ Wishlist successfully saved to Firestore for user: ${userId} (${wishlistIds.length} items)`);
  } catch (error) {
    console.warn('Firestore wishlist sync fallback:', error);
  }
}

export async function loadCustomerWishlist(userId: string | null | undefined): Promise<string[] | null> {
  if (!userId) {
    try {
      const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  // Try Firestore
  try {
    const wishRef = doc(db, 'users', userId, 'userData', 'wishlist');
    const snap = await getDoc(wishRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) {
          localStorage.setItem(`printcore_user_wishlist_${userId}`, data.data);
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore wishlist load fallback to local:', error);
  }

  // Local cache fallback
  try {
    const localRaw = localStorage.getItem(`printcore_user_wishlist_${userId}`);
    if (localRaw) return JSON.parse(localRaw);
  } catch {}

  return null;
}

// -------------------------------------------------------------
// 4. 購買紀錄與訂單 (Purchase History / Orders)
// -------------------------------------------------------------

export async function saveCustomerOrderRecord(order: Order, userId: string | null | undefined): Promise<void> {
  const effectiveUid = userId || auth.currentUser?.uid || 'guest_maker';

  // 1. Cache in customer orders list locally
  try {
    const localKey = `printcore_user_orders_${effectiveUid}`;
    const raw = localStorage.getItem(localKey);
    const existing: Order[] = raw ? JSON.parse(raw) : [];
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch {}

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
    console.log(`📦 Order ${order.id} persisted to Firestore for user: ${effectiveUid}`);
  } catch (error) {
    console.warn('Firestore order save fallback:', error);
  }
}

export async function loadCustomerOrders(userId: string | null | undefined): Promise<Order[]> {
  if (!userId) {
    return [];
  }

  // 1. Query Firestore for this customer's orders
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
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
          paymentGateway: d.paymentMethod || 'ecpay_credit',
          paymentStatus: 'paid',
          orderStatus: (d.status as any) || 'paid',
          trackingNumber: d.trackingNumber || '',
          invoiceNumber: d.invoiceNumber || `TW-${Date.now().toString().substring(5)}`,
          invoiceType: d.invoiceType || 'cloud',
          invoiceCarrierValue: d.invoiceCarrierValue,
          notes: d.notes,
        });
      });
      // Strictly exclude any mock orders (TW20260906-0812, 77391829310, etc.)
      const genuineOrders = ordersList.filter(o => !isMockOrder(o));
      // Sort newest first
      genuineOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Mirror to local cache
      try {
        localStorage.setItem(`printcore_user_orders_${userId}`, JSON.stringify(genuineOrders));
      } catch {}
      console.log(`📦 Loaded ${genuineOrders.length} genuine orders from Firestore for user ${userId}`);
      return genuineOrders;
    }
  } catch (error) {
    console.warn('Firestore orders query fallback to local cache:', error);
  }

  // 2. Fallback to local cache
  try {
    const raw = localStorage.getItem(`printcore_user_orders_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(o => !isMockOrder(o));
      }
    }
  } catch {}

  return [];
}

// -------------------------------------------------------------
// 5. 物流追蹤紀錄 (Logistics Tracking Numbers)
// -------------------------------------------------------------

function sanitizeTrackingNumbers(numbers: string[]): string[] {
  if (!Array.isArray(numbers)) return [];
  return numbers.filter(n => {
    if (!n || typeof n !== 'string') return false;
    const clean = n.trim();
    if (clean === '77391829310' || clean.includes('77391829310')) return false;
    if (clean.startsWith('MOCK') || clean.startsWith('TEST')) return false;
    return clean.length >= 8;
  });
}

export async function saveCustomerTrackingNumbers(userId: string | null | undefined, trackingNumbers: string[]): Promise<void> {
  const sanitized = sanitizeTrackingNumbers(trackingNumbers);
  if (!userId) {
    try {
      localStorage.setItem(GUEST_TRACKING_KEY, JSON.stringify(sanitized));
    } catch {}
    return;
  }

  try {
    localStorage.setItem(`printcore_user_tracking_${userId}`, JSON.stringify(sanitized));
  } catch {}

  try {
    const trackRef = doc(db, 'users', userId, 'userData', 'tracking');
    await setDoc(trackRef, {
      id: 'tracking',
      userId,
      type: 'tracking',
      data: JSON.stringify(sanitized),
      updatedAt: new Date().toISOString(),
    });
    console.log(`🚚 Logistics tracking numbers saved to Firestore for user: ${userId}`);
  } catch (error) {
    console.warn('Firestore tracking save fallback:', error);
  }
}

export async function loadCustomerTrackingNumbers(userId: string | null | undefined): Promise<string[]> {
  if (!userId) {
    try {
      const raw = localStorage.getItem(GUEST_TRACKING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const cleaned = sanitizeTrackingNumbers(parsed);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(GUEST_TRACKING_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    } catch {}
    return [];
  }

  try {
    const trackRef = doc(db, 'users', userId, 'userData', 'tracking');
    const snap = await getDoc(trackRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed)) {
          const cleaned = sanitizeTrackingNumbers(parsed);
          localStorage.setItem(`printcore_user_tracking_${userId}`, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore tracking load fallback to local:', error);
  }

  try {
    const localRaw = localStorage.getItem(`printcore_user_tracking_${userId}`);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      const cleaned = sanitizeTrackingNumbers(parsed);
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(`printcore_user_tracking_${userId}`, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch {}

  return [];
}

// -------------------------------------------------------------
// 6. 客服與 AI 技術對話 (Chat Messages)
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
      m.text.includes('尚未偵測到 Google Gemini API Key')
    ) {
      return false;
    }
    return true;
  });
}

export async function saveCustomerChatMessages(userId: string | null | undefined, messages: ChatMessage[]): Promise<void> {
  const effectiveUid = userId || 'guest_chat';
  const sanitized = cleanStoredMessages(messages);

  // Always cache locally to both user key and global storage key for zero-loss recovery
  try {
    const serialized = JSON.stringify(sanitized);
    localStorage.setItem(`printcore_user_chat_${effectiveUid}`, serialized);
    localStorage.setItem('goddog_ai_chat_history_v2', serialized);
  } catch {}

  if (!userId) return;

  // Persist to Firestore
  try {
    const chatRef = doc(db, 'users', userId, 'userData', 'chat');
    // Keep up to last 100 messages for storage quota efficiency
    const trimmed = sanitized.slice(-100);
    await setDoc(chatRef, {
      id: 'chat',
      userId,
      type: 'chat',
      data: JSON.stringify(trimmed),
      updatedAt: new Date().toISOString(),
    });
    console.log(`💬 Chat conversation saved to Firestore for user: ${userId} (${trimmed.length} msgs)`);
  } catch (error) {
    console.warn('Firestore chat save fallback:', error);
  }
}

export async function loadCustomerChatMessages(userId: string | null | undefined): Promise<ChatMessage[] | null> {
  // 1. Try local cache first for instant synchronous/near-instant return
  try {
    const localUserKey = userId ? `printcore_user_chat_${userId}` : null;
    const localRaw = (localUserKey ? localStorage.getItem(localUserKey) : null) || localStorage.getItem('goddog_ai_chat_history_v2');
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = cleanStoredMessages(parsed);
        if (cleaned.length > 0) return cleaned;
      }
    }
  } catch {}

  // 2. If user is logged in, attempt Firestore load
  if (userId) {
    try {
      const chatRef = doc(db, 'users', userId, 'userData', 'chat');
      const snap = await getDoc(chatRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.data) {
          const parsed = JSON.parse(data.data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = cleanStoredMessages(parsed);
            if (cleaned.length > 0) {
              localStorage.setItem(`printcore_user_chat_${userId}`, JSON.stringify(cleaned));
              localStorage.setItem('goddog_ai_chat_history_v2', JSON.stringify(cleaned));
              return cleaned;
            }
          }
        }
      }
    } catch (error) {
      console.warn('Firestore chat load fallback to local:', error);
    }
  }

  return null;
}


// -------------------------------------------------------------
// 7. 擴充會員數據 (Printers, Addresses, Coupons, Stats)
// -------------------------------------------------------------
export async function saveCustomerUserData(userId: string | null | undefined, collectionName: string, data: any): Promise<void> {
  if (!userId) {
    try {
      localStorage.setItem(`printcore_user_${collectionName}_guest`, JSON.stringify(data));
    } catch {}
    return;
  }
  try {
    localStorage.setItem(`printcore_user_${collectionName}_${userId}`, JSON.stringify(data));
  } catch {}
  
  try {
    const ref = doc(db, 'users', userId, 'userData', collectionName);
    await setDoc(ref, {
      id: collectionName,
      userId,
      type: collectionName,
      data: JSON.stringify(data),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn(`Firestore ${collectionName} save fallback:`, error);
  }
}

export async function loadCustomerUserData(userId: string | null | undefined, collectionName: string): Promise<any | null> {
  const effectiveUid = userId || 'guest';
  if (userId) {
    try {
      const ref = doc(db, 'users', userId, 'userData', collectionName);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.data) {
          const parsed = JSON.parse(data.data);
          localStorage.setItem(`printcore_user_${collectionName}_${effectiveUid}`, data.data);
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`Firestore ${collectionName} load fallback:`, error);
    }
  }
  
  try {
    const raw = localStorage.getItem(`printcore_user_${collectionName}_${effectiveUid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

/**
 * Persist and load customer profile document directly to /users/{userId}
 */
/**
 * Strictly sanitizes customer profiles to purge any legacy mock/simulated subscription and delegation data
 */
export function sanitizeCustomerProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') return profile;
  
  const cleaned = { ...profile };

  // If user does not have an active subscription or plan is None, purge fake subscription info
  const hasGenuinePlan = Boolean(
    cleaned.subscriptionPlan && 
    cleaned.subscriptionPlan !== 'None' && 
    cleaned.subscriptionStatus === 'active'
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
    // Purge known mock items from history even if plan is supposedly active
    cleaned.subscriptionHistory = cleaned.subscriptionHistory.filter((item: any) => {
      if (!item) return false;
      if (item.periodNo === 'P2609160012' || item.periodNo === 'P8839201948') return false;
      if (typeof item.authCode === 'string' && (item.authCode === 'AUTH-524176' || item.authCode.startsWith('AUTH-MOCK'))) return false;
      if (typeof item.invoiceNumber === 'string' && item.invoiceNumber === 'TW-202609-91971652') return false;
      return true;
    });
  }

  return cleaned;
}

export async function saveCustomerProfileDoc(userId: string, profile: any): Promise<void> {
  if (!userId) return;
  const sanitized = sanitizeCustomerProfile(profile);
  try {
    localStorage.setItem(`printcore_user_profile_${userId}`, JSON.stringify(sanitized));
  } catch {}

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...sanitized,
      id: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore profile save fallback:', error);
  }
}

export async function loadCustomerProfileDoc(userId: string, fallbackUser?: { email?: string | null; displayName?: string | null }): Promise<any> {
  if (!userId) return null;

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = sanitizeCustomerProfile(snap.data());
      localStorage.setItem(`printcore_user_profile_${userId}`, JSON.stringify(data));
      return data;
    } else {
      // Initialize a clean non-VIP profile for new user
      const initialProfile = {
        id: userId,
        name: fallbackUser?.displayName || fallbackUser?.email?.split('@')[0] || '創客會員',
        email: fallbackUser?.email || '',
        phone: '',
        tier: 'Bronze',
        points: 0,
        totalSpent: 0,
        ordersCount: 0,
        referralCode: `MAKER-${userId.substring(0, 6).toUpperCase()}`,
        birthday: '',
        subscriptionPlan: 'None',
        subscriptionStatus: 'inactive',
        autoRenew: false,
        subscriptionFrequency: '',
        subscriptionHistory: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, initialProfile);
      localStorage.setItem(`printcore_user_profile_${userId}`, JSON.stringify(initialProfile));
      return initialProfile;
    }
  } catch (error) {
    console.warn('Firestore load profile fallback:', error);
    try {
      const cached = localStorage.getItem(`printcore_user_profile_${userId}`);
      if (cached) return sanitizeCustomerProfile(JSON.parse(cached));
    } catch {}
  }
  return null;
}

/**
 * Persist, load, and clear recently viewed products with strict per-user isolation & cloud backup.
 * Guarantees that records are preserved, never mixed between users, and can be deleted individually or all at once.
 */
export function getStoredRecentlyViewedSync(userId?: string | null): any[] {
  const cleanUid = (userId && typeof userId === 'string' && userId.trim() !== '') ? userId.trim() : null;

  // 1. Authenticated User: Read STRICTLY from the user's isolated storage
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

  // 2. Guest User: Read STRICTLY from isolated guest storage (never contaminates member accounts)
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

export async function saveCustomerRecentlyViewed(userId: string | null | undefined, product: any): Promise<void> {
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

  const cleanUid = (userId && typeof userId === 'string' && userId.trim() !== '') ? userId.trim() : null;
  const targetStorageKey = cleanUid ? `printcore_user_recent_${cleanUid}` : 'printcore_guest_recent';

  let currentList: any[] = [];
  try {
    const raw = localStorage.getItem(targetStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) currentList = parsed;
    }
  } catch {}

  // Filter out the same product to move it to the very front (deduplicated)
  currentList = currentList.filter((p: any) => p && p.id !== viewItem.id);
  currentList.unshift(viewItem);
  if (currentList.length > 50) currentList = currentList.slice(0, 50);

  try {
    localStorage.setItem(targetStorageKey, JSON.stringify(currentList));
  } catch (e) {
    console.warn('Failed to update local recently viewed:', e);
  }

  // Reactive event for instantaneous UI reflection
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('printcore_recently_viewed_updated', {
      detail: { item: viewItem, list: currentList, userId: cleanUid }
    }));
  }

  // Cloud Persistence to Firestore if logged in
  if (cleanUid) {
    try {
      // 1. Save full history payload to users/{userId}/userData/recentlyViewed
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(ref, {
        id: 'recentlyViewed',
        userId: cleanUid,
        type: 'recentlyViewed',
        data: JSON.stringify(currentList),
        count: currentList.length,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((e) => {
        console.warn('Firestore recentlyViewed sync notice:', e);
      });

      // 2. Also register count and last activity on root user profile doc
      const userRef = doc(db, 'users', cleanUid);
      setDoc(userRef, {
        recentlyViewedCount: currentList.length,
        lastViewedAt: viewItem.viewedAt,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Error syncing recently viewed to Firestore:', e);
    }
  }
}

/**
 * Delete a single item from the customer's browsing history
 */
export async function deleteSingleCustomerRecentlyViewed(userId: string | null | undefined, productId: string): Promise<any[]> {
  if (!productId) return [];
  const cleanUid = (userId && typeof userId === 'string' && userId.trim() !== '') ? userId.trim() : null;
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

  // Sync to Firestore for authenticated user
  if (cleanUid) {
    try {
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(ref, {
        id: 'recentlyViewed',
        userId: cleanUid,
        type: 'recentlyViewed',
        data: JSON.stringify(updatedList),
        count: updatedList.length,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});

      const userRef = doc(db, 'users', cleanUid);
      setDoc(userRef, {
        recentlyViewedCount: updatedList.length,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } catch (e) {
      console.warn('Failed to update Firestore after item deletion:', e);
    }
  }

  // Dispatch global event for instant UI removal
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('printcore_recently_viewed_updated', {
      detail: { removedId: productId, list: updatedList, userId: cleanUid }
    }));
  }

  return updatedList;
}

export async function loadCustomerRecentlyViewed(userId: string | null | undefined): Promise<any[]> {
  const cleanUid = (userId && typeof userId === 'string' && userId.trim() !== '') ? userId.trim() : null;
  const localList = getStoredRecentlyViewedSync(cleanUid);

  if (!cleanUid) {
    return localList;
  }

  // Fetch from Firestore
  try {
    const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      if (d?.data) {
        const parsed = JSON.parse(d.data);
        if (Array.isArray(parsed)) {
          // If Firestore has newer or more complete data, update local storage
          localStorage.setItem(`printcore_user_recent_${cleanUid}`, JSON.stringify(parsed));
          return parsed;
        }
      }
    } else if (localList.length > 0) {
      // Local exists but Firestore empty: backup local to Firestore now
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
  const cleanUid = (userId && typeof userId === 'string' && userId.trim() !== '') ? userId.trim() : null;
  try {
    if (cleanUid) {
      localStorage.removeItem(`printcore_user_recent_${cleanUid}`);
      // Clear in Firestore
      const ref = doc(db, 'users', cleanUid, 'userData', 'recentlyViewed');
      setDoc(ref, {
        id: 'recentlyViewed',
        userId: cleanUid,
        type: 'recentlyViewed',
        data: JSON.stringify([]),
        count: 0,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      const userRef = doc(db, 'users', cleanUid);
      setDoc(userRef, {
        recentlyViewedCount: 0,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    } else {
      localStorage.removeItem('printcore_guest_recent');
    }
    // Clean up any legacy shared storage key to eliminate cross-account leakage
    localStorage.removeItem('printcore_recent_views_all');
  } catch (e) {
    console.warn('Failed to clear recently viewed:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('printcore_recently_viewed_cleared', {
      detail: { userId: cleanUid }
    }));
  }
}
