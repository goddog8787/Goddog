import { Order } from '../types';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStoredCustomerSession } from './customerPersistence';

export interface EligibilityResult {
  canReview: boolean;
  reason: 'not_purchased' | 'not_delivered_yet' | 'already_reviewed' | 'eligible';
  message: string;
  matchedOrder?: Order;
}

/**
 * Known mock / template / test order IDs and numbers that MUST NOT be treated as genuine purchases.
 */
export const MOCK_ORDER_IDS = new Set([
  'ord-1001',
  'ord-1002',
  'ord-1003',
  'ord-101',
  'ord-102',
  'ord-mock-01',
  'ord-mock-02',
]);

export const MOCK_ORDER_NUMBERS = new Set([
  'TW20260906-0812',
  'TW-20260906-0812',
  'TW-20260906-8921',
  'TW-20260906-8922',
  'TW-20260906-8923',
  'TW-20260905-8910',
  'TW-20260905-3129',
  'TW-20260904-7712',
  'TW-20260907-9001',
  'TW-20260907-1102',
  'TW-20260905-8899',
  'TW-20260904-8872',
]);

/**
 * Strictly identifies if an order is mock/demo/test data.
 */
export function isMockOrder(order: any): boolean {
  if (!order) return true;
  const id = String(order.id || '').trim();
  const orderNumber = String(order.orderNumber || '').trim();
  const email = String(order.customerEmail || '').trim().toLowerCase();
  const tracking = String(order.trackingNumber || '').trim();

  // Test tracking numbers
  if (tracking === '77391829310' || tracking.includes('77391829310')) {
    return true;
  }

  // Legacy mock IDs or numbers
  if (
    MOCK_ORDER_IDS.has(id) || 
    id.startsWith('ord-mock') || 
    id === 'ord-1001' || 
    id === 'ord-1002' || 
    id === 'ord-1003' ||
    id.includes('test')
  ) {
    return true;
  }
  if (
    MOCK_ORDER_NUMBERS.has(orderNumber) || 
    orderNumber.startsWith('TW2026') || 
    orderNumber.startsWith('TW-2026') ||
    orderNumber.includes('0812') ||
    orderNumber.includes('TEST')
  ) {
    return true;
  }
  if (email === 'kuanyu.chen@maker.tw' || email === 'mock@printcore.tw') {
    return true;
  }
  if (order.isMock === true) {
    return true;
  }
  return false;
}

/**
 * Normalizes string for fuzzy product name/id matching
 */
function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/[\s\-_+()【】\[\]]/g, '');
}

/**
 * Checks whether an order item matches a given product (by id or name similarity)
 */
export function isItemMatchingProduct(item: { productId?: string; name: string }, productId: string, productName?: string): boolean {
  if (item.productId && (item.productId === productId || productId.includes(item.productId) || item.productId.includes(productId))) {
    return true;
  }
  if (productName && item.name) {
    const normItemName = normalizeText(item.name);
    const normProdName = normalizeText(productName);
    if (normItemName.includes(normProdName) || normProdName.includes(normItemName)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether the order status represents "確認收貨 / 已完成"
 */
export function isOrderDeliveredAndConfirmed(orderStatus: string): boolean {
  const normalized = (orderStatus || '').toLowerCase().trim();
  return (
    normalized === 'completed' ||
    normalized === 'delivered' ||
    normalized === '已完成' ||
    normalized === '已簽收送達' ||
    normalized === '已取貨完成'
  );
}

export function getOrderStatusLabel(status: string): string {
  const normalized = (status || '').toLowerCase().trim();
  switch (normalized) {
    case 'unpaid': return '待付款';
    case 'paid':
    case 'picking':
    case 'processing': return '撿貨備貨中';
    case 'shipped':
    case 'shipping': return '包裹運送中';
    case 'delivered':
    case 'completed': return '已送達簽收';
    case 'cancelled': return '已取消';
    case 'returning': return '退換貨處理中';
    default: return status || '備貨處理中';
  }
}

/**
 * Helper to map a Firestore order document to the Order model
 */
function mapFirestoreDocToOrder(docId: string, d: any): Order {
  return {
    id: docId,
    orderNumber: d.orderNumber || docId,
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
    paymentGateway: d.paymentMethod || 'credit_card',
    paymentStatus: 'paid',
    orderStatus: d.status || 'picking',
    trackingNumber: d.trackingNumber || '',
    invoiceNumber: d.invoiceNumber || '',
    invoiceType: d.invoiceType || 'cloud',
  };
}

/**
 * Retrieves ONLY genuine, authentic orders belonging to the current buyer.
 * Filters out all mock, test, and admin sample orders completely.
 */
export async function getGenuineUserOrders(inMemoryOrders?: Order[]): Promise<Order[]> {
  const ordersMap = new Map<string, Order>();
  const session = getStoredCustomerSession();
  const currentUid = auth.currentUser?.uid || session?.id;
  const userEmail = (auth.currentUser?.email || session?.email || '').trim().toLowerCase();

  // 1. From customer specific storage in localStorage (user orders saved on checkout)
  if (currentUid) {
    try {
      const userOrdersRaw = localStorage.getItem(`printcore_user_orders_${currentUid}`);
      if (userOrdersRaw) {
        const parsed: Order[] = JSON.parse(userOrdersRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((o) => {
            if (!isMockOrder(o)) ordersMap.set(o.id, o);
          });
        }
      }
    } catch {}
  }

  // 2. From guest orders storage in localStorage (orders placed in this browser before/without login)
  try {
    const guestKeys = ['printcore_guest_orders', 'printcore_user_orders_guest_maker'];
    guestKeys.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: Order[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((o) => {
            if (!isMockOrder(o)) {
              // If logged in with email, verify matching or allow if placed in session
              if (!userEmail || !o.customerEmail || o.customerEmail.trim().toLowerCase() === userEmail) {
                ordersMap.set(o.id, o);
              }
            }
          });
        }
      }
    });
  } catch {}

  // 3. Filter inMemoryOrders strictly (ONLY if they belong to current user and are NOT mock)
  if (inMemoryOrders && Array.isArray(inMemoryOrders)) {
    inMemoryOrders.forEach((o) => {
      if (isMockOrder(o)) return;
      const orderUser = (o as any).userId;
      const orderEmail = (o.customerEmail || '').trim().toLowerCase();
      
      const belongsToUser =
        (currentUid && orderUser === currentUid) ||
        (userEmail && orderEmail === userEmail) ||
        (!currentUid && orderUser === 'guest_maker');

      if (belongsToUser) {
        ordersMap.set(o.id, o);
      }
    });
  }

  // 4. From Firestore online database (ground truth for real purchases)
  if (currentUid || userEmail) {
    try {
      if (currentUid) {
        const qUser = query(collection(db, 'orders'), where('userId', '==', currentUid));
        const snap = await getDocs(qUser);
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (!isMockOrder(d) && !isMockOrder({ id: docSnap.id, ...d })) {
            ordersMap.set(docSnap.id, mapFirestoreDocToOrder(docSnap.id, d));
          }
        });
      }
      if (userEmail) {
        const qEmail = query(collection(db, 'orders'), where('customerEmail', '==', userEmail));
        const snapEmail = await getDocs(qEmail);
        snapEmail.forEach((docSnap) => {
          const d = docSnap.data() as any;
          if (!isMockOrder(d) && !isMockOrder({ id: docSnap.id, ...d })) {
            ordersMap.set(docSnap.id, mapFirestoreDocToOrder(docSnap.id, d));
          }
        });
      }
    } catch (e) {
      console.warn('Firestore real orders lookup fallback:', e);
    }
  }

  return Array.from(ordersMap.values()).filter((o) => !isMockOrder(o));
}

/**
 * Backward compatible alias for getGenuineUserOrders
 */
export async function getAllUserOrders(inMemoryOrders?: Order[]): Promise<Order[]> {
  return getGenuineUserOrders(inMemoryOrders);
}

/**
 * Core Verification Function:
 * Verifies whether the customer is strictly eligible to write a review:
 * 1. Must have genuine purchase of this product in a real order (NO mock orders, NO test numbers).
 * 2. That real order must be confirmed received / completed (orderStatus === 'completed' or 'delivered').
 */
export async function verifyProductReviewEligibility(
  productId: string,
  productName?: string,
  inMemoryOrders?: Order[]
): Promise<EligibilityResult> {
  const genuineOrders = await getGenuineUserOrders(inMemoryOrders);

  if (genuineOrders.length === 0) {
    return {
      canReview: false,
      reason: 'not_purchased',
      message: '系統查無此商品的購買紀錄。為杜絕虛標與不實刷評，本商城嚴格規範：僅限真實付款購買並完成確認收貨的顧客才可發表評價。',
    };
  }

  // Strictly filter to genuine, successfully PAID orders only (pending or failed payments are strictly forbidden)
  const paidGenuineOrders = genuineOrders.filter(
    (ord) => ord.paymentStatus === 'paid'
  );

  if (paidGenuineOrders.length === 0) {
    return {
      canReview: false,
      reason: 'not_purchased',
      message: '系統查無此商品的有效付款紀錄。本商城嚴格規範：未付款或尚未完成金流授權之訂單不得進行商品評價。',
    };
  }

  // Find all genuine paid orders containing this product
  const matchedOrders = paidGenuineOrders.filter((ord) =>
    ord.items?.some((item) => isItemMatchingProduct(item, productId, productName))
  );

  if (matchedOrders.length === 0) {
    return {
      canReview: false,
      reason: 'not_purchased',
      message: '您尚未真實付款購買過此款耗材商品。請於實際下單付款並完成取件收貨後，再來分享真實列印心得！',
    };
  }

  // Check if any genuine matched order is completed / delivered (確認收貨)
  const completedOrder = matchedOrders.find((ord) =>
    isOrderDeliveredAndConfirmed(ord.orderStatus)
  );

  if (!completedOrder) {
    // There is a genuine paid order, but not delivered/completed yet
    const pendingOrder = matchedOrders[0];
    const statusText = getOrderStatusLabel(pendingOrder.orderStatus);
    return {
      canReview: false,
      reason: 'not_delivered_yet',
      message: `已核對您已付款之真實訂單【${pendingOrder.orderNumber}】，目前物流狀態為「${statusText}」。本商城嚴格執行「確認收貨後才能評價」原則，請待您收到包裹並至「會員中心 - 我的訂單」點選確認收貨後，方可發表評價！`,
      matchedOrder: pendingOrder,
    };
  }

  return {
    canReview: true,
    reason: 'eligible',
    message: `✅ 已通過真實購買與收貨雙重核驗！您於訂單【${completedOrder.orderNumber}】已完成簽收，享有專業創客實測評價資格。`,
    matchedOrder: completedOrder,
  };
}

/**
 * Customer confirms receipt for a real order (買家點選「確認收貨」)
 */
export async function confirmOrderReceipt(
  orderId: string,
  allOrders: Order[],
  setOrders: (orders: Order[]) => void
): Promise<Order | null> {
  let updatedOrder: Order | null = null;

  const newOrders = allOrders.map((ord) => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      updatedOrder = {
        ...ord,
        orderStatus: 'completed' as const,
      };
      return updatedOrder;
    }
    return ord;
  });

  if (updatedOrder) {
    // 1. Update State
    setOrders(newOrders);

    // 2. Persist to localStorage
    try {
      localStorage.setItem('printcore_orders', JSON.stringify(newOrders));
      const session = getStoredCustomerSession();
      const currentUid = auth.currentUser?.uid || session?.id;
      if (currentUid) {
        const userKey = `printcore_user_orders_${currentUid}`;
        const raw = localStorage.getItem(userKey);
        if (raw) {
          const parsed: Order[] = JSON.parse(raw);
          const updatedUserList = parsed.map((o) => (o.id === orderId || o.orderNumber === orderId ? updatedOrder! : o));
          localStorage.setItem(userKey, JSON.stringify(updatedUserList));
        }
      }
      const guestKey = 'printcore_guest_orders';
      const rawGuest = localStorage.getItem(guestKey);
      if (rawGuest) {
        const parsedGuest: Order[] = JSON.parse(rawGuest);
        const updatedGuestList = parsedGuest.map((o) => (o.id === orderId || o.orderNumber === orderId ? updatedOrder! : o));
        localStorage.setItem(guestKey, JSON.stringify(updatedGuestList));
      }
    } catch {}

    // 3. Persist to Firestore
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore updateDoc order completion fallback:', e);
    }
  }

  return updatedOrder;
}

