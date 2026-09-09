import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { CartItem, Order, MemberProfile } from '../types';

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
      customerName: order.customerName || '創客客戶',
      customerEmail: order.customerEmail || 'customer@gmail.com',
      customerPhone: order.customerPhone || '0900000000',
      shippingAddress: order.storeOrAddress || '7-11 科技門市',
      shippingMethod: order.shippingMethod || '7-11',
      paymentMethod: order.paymentGateway || 'ecpay_credit',
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
          trackingNumber: d.trackingNumber || `77${Math.floor(100000000 + Math.random() * 900000000)}`,
          invoiceNumber: d.invoiceNumber || `TW-${Date.now().toString().substring(5)}`,
          invoiceType: d.invoiceType || 'cloud',
          invoiceCarrierValue: d.invoiceCarrierValue,
          notes: d.notes,
        });
      });
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Mirror to local cache
      try {
        localStorage.setItem(`printcore_user_orders_${userId}`, JSON.stringify(ordersList));
      } catch {}
      console.log(`📦 Loaded ${ordersList.length} orders from Firestore for user ${userId}`);
      return ordersList;
    }
  } catch (error) {
    console.warn('Firestore orders query fallback to local cache:', error);
  }

  // 2. Fallback to local cache
  try {
    const raw = localStorage.getItem(`printcore_user_orders_${userId}`);
    if (raw) {
      const localOrders = JSON.parse(raw);
      if (Array.isArray(localOrders) && localOrders.length > 0) {
        return localOrders;
      }
    }
  } catch {}

  return [];
}

// -------------------------------------------------------------
// 5. 物流追蹤紀錄 (Logistics Tracking Numbers)
// -------------------------------------------------------------

export async function saveCustomerTrackingNumbers(userId: string | null | undefined, trackingNumbers: string[]): Promise<void> {
  if (!userId) {
    try {
      localStorage.setItem(GUEST_TRACKING_KEY, JSON.stringify(trackingNumbers));
    } catch {}
    return;
  }

  try {
    localStorage.setItem(`printcore_user_tracking_${userId}`, JSON.stringify(trackingNumbers));
  } catch {}

  try {
    const trackRef = doc(db, 'users', userId, 'userData', 'tracking');
    await setDoc(trackRef, {
      id: 'tracking',
      userId,
      type: 'tracking',
      data: JSON.stringify(trackingNumbers),
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
      if (raw) return JSON.parse(raw);
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
          localStorage.setItem(`printcore_user_tracking_${userId}`, data.data);
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore tracking load fallback to local:', error);
  }

  try {
    const localRaw = localStorage.getItem(`printcore_user_tracking_${userId}`);
    if (localRaw) return JSON.parse(localRaw);
  } catch {}

  return [];
}

// -------------------------------------------------------------
// 6. 客服與 AI 技術對話 (Chat Messages)
// -------------------------------------------------------------

export interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  timestamp?: number;
}

export async function saveCustomerChatMessages(userId: string | null | undefined, messages: ChatMessage[]): Promise<void> {
  const effectiveUid = userId || 'guest_chat';

  // Cache locally
  try {
    localStorage.setItem(`printcore_user_chat_${effectiveUid}`, JSON.stringify(messages));
    // Keep legacy key in sync if guest
    if (!userId) {
      localStorage.setItem('goddog_ai_chat_history_v2', JSON.stringify(messages));
    }
  } catch {}

  if (!userId) return;

  // Persist to Firestore
  try {
    const chatRef = doc(db, 'users', userId, 'userData', 'chat');
    // Keep up to last 100 messages for storage quota efficiency
    const trimmed = messages.slice(-100);
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
  if (!userId) {
    try {
      const raw = localStorage.getItem('goddog_ai_chat_history_v2');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  // Try Firestore
  try {
    const chatRef = doc(db, 'users', userId, 'userData', 'chat');
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.data) {
        const parsed = JSON.parse(data.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(`printcore_user_chat_${userId}`, data.data);
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn('Firestore chat load fallback to local:', error);
  }

  // Local fallback
  try {
    const localRaw = localStorage.getItem(`printcore_user_chat_${userId}`);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return null;
}
