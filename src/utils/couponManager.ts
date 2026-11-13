import { StoreCoupon } from '../types';

export const STORE_COUPONS_KEY = 'printcore_store_coupons';

export const DEFAULT_STORE_COUPONS: StoreCoupon[] = [
  {
    id: 'c-goddog',
    code: 'GODDOG',
    title: '神狗勾粉絲 9 折專屬優惠',
    discountType: 'percentage',
    discountValue: 10, // 10% off
    minSpend: 0,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'c-free99',
    code: 'FREE99',
    title: '全館超商取貨免運費',
    discountType: 'free_shipping',
    discountValue: 0,
    minSpend: 499,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-08-01',
  },
  {
    id: 'c-maker100',
    code: 'MAKER100',
    title: '創客專屬現折 NT$ 100',
    discountType: 'fixed',
    discountValue: 100,
    minSpend: 999,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-08-15',
  },
  {
    id: 'c-bambulab',
    code: 'BAMBULAB',
    title: '拓竹用戶專屬折抵 NT$ 120',
    discountType: 'fixed',
    discountValue: 120,
    minSpend: 1200,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-08-20',
  },
  {
    id: 'c-summer3d',
    code: 'SUMMER3D',
    title: '夏日創客盛典 88 折',
    discountType: 'percentage',
    discountValue: 12, // 12% off
    minSpend: 1500,
    maxDiscount: 350,
    usageLimit: 200,
    usedCount: 0,
    expiryDate: '2026-10-31',
    isActive: true,
    createdAt: '2026-09-01',
  },
  {
    id: 'c-vip200',
    code: 'VIP200',
    title: '白金與鑽石創客專屬折抵 NT$ 200',
    discountType: 'fixed',
    discountValue: 200,
    minSpend: 1800,
    usedCount: 0,
    isActive: true,
    targetTier: 'vip',
    createdAt: '2026-09-01',
  },
];

export function getStoreCoupons(): StoreCoupon[] {
  try {
    const raw = localStorage.getItem(STORE_COUPONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize any legacy mock counts (e.g. 142, 289, 95, etc.)
        // Read genuine orders from localStorage to calculate actual usage count
        let realOrders: any[] = [];
        try {
          const ordersRaw = localStorage.getItem('printcore_orders');
          if (ordersRaw) {
            realOrders = JSON.parse(ordersRaw) || [];
          }
        } catch {}

        return parsed.map(c => {
          // Count only genuine paid orders that used this coupon
          const actualUsage = realOrders.filter(o => 
            (o.paymentStatus === 'paid' || o.orderStatus === 'completed') && 
            (o.couponCode === c.code || (c.code === 'GODDOG' && o.discount > 0 && o.couponCode === 'GODDOG'))
          ).length;

          return {
            ...c,
            // If the saved usedCount has legacy mock numbers (like 142, 289, 666), override with genuine count
            usedCount: actualUsage
          };
        });
      }
    }
  } catch (e) {
    console.warn('Failed to parse store coupons from localStorage:', e);
  }
  return DEFAULT_STORE_COUPONS;
}

export function saveStoreCoupons(coupons: StoreCoupon[]): void {
  try {
    localStorage.setItem(STORE_COUPONS_KEY, JSON.stringify(coupons));
    window.dispatchEvent(new Event('printcore_coupons_updated'));
  } catch (e) {
    console.warn('Failed to save store coupons to localStorage:', e);
  }
}

export interface CouponApplyResult {
  isValid: boolean;
  errorMessage?: string;
  coupon?: StoreCoupon;
  discountAmount: number;
  freeShipping: boolean;
  label: string;
}

export const BUILTIN_MEMBER_COUPONS: StoreCoupon[] = [
  {
    id: 'c-goddog2026',
    code: 'GODDOG2026',
    title: '新會員專屬首購折抵 NT$ 100',
    discountType: 'fixed',
    discountValue: 100,
    minSpend: 0,
    usedCount: 0,
    expiryDate: '2026-12-31',
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'c-achieve50',
    code: 'ACHIEVE50',
    title: '新手創客里程碑 $50 優惠券',
    discountType: 'fixed',
    discountValue: 50,
    minSpend: 0,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'c-achieve100',
    code: 'ACHIEVE100',
    title: '列印老手里程碑 $100 優惠券',
    discountType: 'fixed',
    discountValue: 100,
    minSpend: 0,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'c-achieve200',
    code: 'ACHIEVE200',
    title: '神狗勾大使里程碑 $200 優惠券',
    discountType: 'fixed',
    discountValue: 200,
    minSpend: 0,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'c-achievefree',
    code: 'ACHIEVEFREE',
    title: '列印大神滿級 $300 免運神券',
    discountType: 'fixed',
    discountValue: 300,
    minSpend: 0,
    usedCount: 0,
    isActive: true,
    createdAt: '2026-01-01',
  },
];

export function validateCoupon(
  inputCode: string,
  subtotal: number,
  isVipMember: boolean = false,
  memberCoupons: any[] = []
): CouponApplyResult {
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return { isValid: false, errorMessage: '請輸入優惠碼', discountAmount: 0, freeShipping: false, label: '' };
  }

  const coupons = getStoreCoupons();
  let coupon = coupons.find((c) => c.code.toUpperCase() === code);
  let forceFreeShipping = false;

  // Fallback to built-in welcome / achievement codes
  if (!coupon) {
    const builtin = BUILTIN_MEMBER_COUPONS.find((c) => c.code.toUpperCase() === code);
    if (builtin) {
      coupon = builtin;
      if (builtin.code === 'ACHIEVEFREE') {
        forceFreeShipping = true;
      }
    }
  }

  // Fallback to personal saved coupons on member profile
  if (!coupon && Array.isArray(memberCoupons)) {
    const personal = memberCoupons.find((mc) => String(mc?.code || '').trim().toUpperCase() === code);
    if (personal) {
      const inferredType: StoreCoupon['discountType'] =
        personal.discountType || (personal.freeShipping ? 'free_shipping' : 'fixed');
      coupon = {
        id: personal.id || `personal-${code}`,
        code,
        title: personal.name || personal.title || `專屬優惠券 (${code})`,
        discountType: inferredType,
        discountValue: Number(personal.discount ?? personal.discountValue ?? 0),
        minSpend: Number(personal.minSpend || 0),
        usedCount: 0,
        expiryDate: personal.expiry && personal.expiry !== '永久有效' ? personal.expiry : undefined,
        isActive: true,
        createdAt: '2026-01-01',
      };
      if (personal.freeShipping || code === 'ACHIEVEFREE') {
        forceFreeShipping = true;
      }
    }
  }

  if (!coupon) {
    return {
      isValid: false,
      errorMessage: `查無優惠代碼「${code}」，請確認是否輸入正確。`,
      discountAmount: 0,
      freeShipping: false,
      label: '',
    };
  }

  if (!coupon.isActive) {
    return {
      isValid: false,
      errorMessage: `優惠代碼「${code}」目前已暫停使用。`,
      discountAmount: 0,
      freeShipping: false,
      label: '',
    };
  }

  if (coupon.expiryDate && coupon.expiryDate !== '永久有效') {
    const expiry = new Date(coupon.expiryDate);
    if (!Number.isNaN(expiry.getTime())) {
      expiry.setHours(23, 59, 59, 999);
      const now = new Date();
      if (now > expiry) {
        return {
          isValid: false,
          errorMessage: `優惠代碼「${code}」已於 ${coupon.expiryDate} 過期。`,
          discountAmount: 0,
          freeShipping: false,
          label: '',
        };
      }
    }
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      isValid: false,
      errorMessage: `優惠代碼「${code}」已達領取與使用上限。`,
      discountAmount: 0,
      freeShipping: false,
      label: '',
    };
  }

  if (coupon.targetTier === 'vip' && !isVipMember) {
    return {
      isValid: false,
      errorMessage: `優惠代碼「${code}」為 VIP 訂閱創客專屬限定！`,
      discountAmount: 0,
      freeShipping: false,
      label: '',
    };
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      isValid: false,
      errorMessage: `此優惠碼需消費滿 NT$ ${coupon.minSpend.toLocaleString()} 方可使用（目前金額 NT$ ${subtotal.toLocaleString()}）。`,
      discountAmount: 0,
      freeShipping: false,
      label: '',
    };
  }

  let discountAmount = 0;
  let freeShipping = forceFreeShipping || code === 'ACHIEVEFREE';

  if (coupon.discountType === 'free_shipping') {
    freeShipping = true;
    discountAmount = 0;
  } else if (coupon.discountType === 'percentage') {
    discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(subtotal, coupon.discountValue);
  }

  return {
    isValid: true,
    coupon,
    discountAmount,
    freeShipping,
    label: coupon.title,
  };
}
