import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Download,
  Lock,
  Store,
  Sparkles,
  ShieldAlert,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import { 
  CartItem, 
  CurrencyCode, 
  LanguageCode, 
  MemberProfile, 
  Order, 
  PaymentGateway, 
  ShippingMethod 
} from '../../types';
import { formatPrice, translations, translateProductName, translateProduct } from '../../utils/i18n';
import { auth } from '../../lib/firebase';
import { 
  downloadOrderProofJSON, 
  downloadOrderProofPDF 
} from '../../utils/orderCertificate';
import { OrderCertificateModal } from './OrderCertificateModal';
import { CvsStoreSelectorModal } from './CvsStoreSelectorModal';
import { TrustCertModal } from './TrustCertModal';
import { validateCoupon } from '../../utils/couponManager';
import { createClientNewebPayCheckout } from '../../lib/newebpayClient';
import { TaiwanAddressInput } from './TaiwanAddressInput';
import { loadCustomerUserData, isMemberVipActive } from '../../lib/customerPersistence';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: CurrencyCode;
  lang: LanguageCode;
  member: MemberProfile;
  pointsToUse: number;
  initialCouponCode?: string;
  onOrderCompleted: (newOrder: Order) => void;
  onOpenTracking: (trackingNumber: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  lang,
  member,
  pointsToUse,
  initialCouponCode = '',
  onOpenTracking,
}) => {
  const t = translations[lang];

  const isValidCustomerName = (name?: string) => {
    if (!name) return false;
    return !name.startsWith('guest') && name.trim().length > 0;
  };

  const isValidPhone = (phone?: string) => {
    if (!phone) return false;
    return phone.trim().length >= 8;
  };

  // Shipping & customer form
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('UNIMARTC2C');
  const [isIslandDelivery, setIsIslandDelivery] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    return member?.name && isValidCustomerName(member.name) ? member.name : '';
  });
  const [customerEmail, setCustomerEmail] = useState(member?.email || '');
  const [customerPhone, setCustomerPhone] = useState(() => {
    return member?.phone && isValidPhone(member.phone) ? member.phone : '';
  });
  const [shippingAddress, setShippingAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setCustomerName(member?.name && isValidCustomerName(member.name) ? member.name : '');
    setCustomerEmail(member?.email || '');
    setCustomerPhone(member?.phone && isValidPhone(member.phone) ? member.phone : '');
  }, [member?.id, member?.name, member?.email, member?.phone]);

  // Saved addresses from AddressModal / member profile
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showManualCvsInput, setShowManualCvsInput] = useState(false);

  // Invoice
  const [invoiceType, setInvoiceType] = useState<'cloud' | 'mobile_barcode' | 'tax_id'>('cloud');
  const [invoiceCarrierValue, setInvoiceCarrierValue] = useState('');

  // Payment gateway (default to credit_card)
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder] = useState<Order | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // CVS In-App Modal State
  const [isCvsModalOpen, setIsCvsModalOpen] = useState(false);
  const [cvsModalBrand, setCvsModalBrand] = useState<'7-11' | 'familymart' | 'hilife' | 'okmart'>('7-11');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; freeShipping: boolean; label: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showTrustCertModal, setShowTrustCertModal] = useState(false);

  // Load saved addresses whenever modal opens or AddressModal dispatches update
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    const hydrateAddresses = (list: any[]) => {
      if (!active) return;
      const validList = Array.isArray(list) ? list.filter((a) => a && (a.addr || a.address)) : [];
      if (validList.length > 0) {
        setSavedAddresses(validList);
      } else if (member?.address && member.address.trim()) {
        setSavedAddresses([
          {
            id: 'member-profile-default',
            name: member?.name && isValidCustomerName(member.name) ? member.name : '',
            phone: member?.phone && isValidPhone(member.phone) ? member.phone : '',
            addr: member.address.trim(),
            isDefault: true,
          },
        ]);
      } else {
        setSavedAddresses([]);
      }
    };

    const uid = member?.id && !member.id.startsWith('guest') ? member.id : auth.currentUser?.uid;
    loadCustomerUserData(uid, 'addresses')
      .then((data) => hydrateAddresses(data || []))
      .catch(() => hydrateAddresses([]));

    const onAddressesUpdated = (e: any) => {
      if (Array.isArray(e?.detail)) {
        hydrateAddresses(e.detail);
      }
    };
    window.addEventListener('printcore:addresses-updated', onAddressesUpdated);
    return () => {
      active = false;
      window.removeEventListener('printcore:addresses-updated', onAddressesUpdated);
    };
  }, [isOpen, member?.id, member?.address, member?.name, member?.phone]);

  // Auto-apply default address when already in HOME delivery and shippingAddress is empty
  const getDefaultSavedAddress = (list: any[] = savedAddresses) => {
    const def = list.find((a) => a.isDefault) || list[0];
    if (def) return def;
    if (member?.address && member.address.trim()) {
      return {
        id: 'member-default',
        name: member?.name && isValidCustomerName(member.name) ? member.name : '',
        phone: member?.phone && isValidPhone(member.phone) ? member.phone : '',
        addr: member.address.trim(),
        isDefault: true,
      };
    }
    return null;
  };

  const applySavedAddressEntry = (entry: any) => {
    if (!entry) return;
    setShippingAddress(entry.addr || entry.address || '');
    if (entry.name && isValidCustomerName(entry.name)) {
      setCustomerName(entry.name);
    }
    if (entry.phone && isValidPhone(entry.phone)) {
      setCustomerPhone(entry.phone);
    }
    if (formError) setFormError(null);
  };

  useEffect(() => {
    if (isOpen && shippingMethod === 'HOME' && !shippingAddress.trim()) {
      const def = getDefaultSavedAddress();
      if (def) {
        applySavedAddressEntry(def);
      }
    }
  }, [isOpen, shippingMethod, savedAddresses]);

  // Price calculations
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isVip = isMemberVipActive(member);
  const vipDiscountAmount = isVip ? Math.floor(rawSubtotal * 0.05) : 0;
  const subtotal = rawSubtotal - vipDiscountAmount;

  // Auto-apply initialCouponCode forwarded from CartDrawer when CheckoutModal opens
  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
      return;
    }
    if (initialCouponCode && initialCouponCode.trim()) {
      const upper = initialCouponCode.trim().toUpperCase();
      setCouponCode(upper);
      const res = validateCoupon(upper, subtotal, isVip, member?.coupons || []);
      if (res.isValid && res.coupon) {
        setAppliedCoupon({
          code: upper,
          discountAmount: res.discountAmount,
          freeShipping: res.freeShipping,
          label: res.label,
        });
        setCouponError('');
      }
    }
  }, [isOpen, initialCouponCode]);

  // Free shipping thresholds matching screenshot style:
  // Home delivery threshold: NT$ 1,500 (Fee: NT$ 100)
  // CVS pickup threshold: NT$ 999 (Fee: NT$ 65)
  const HOME_FREE_THRESHOLD = 1500;
  const CVS_FREE_THRESHOLD = 999;

  const hasFreeShippingItem = cartItems.length > 0 && cartItems.every(i => i.product.customShippingFee === 0);
  const homeDiffForFree = Math.max(0, HOME_FREE_THRESHOLD - subtotal);
  const cvsDiffForFree = Math.max(0, CVS_FREE_THRESHOLD - subtotal);

  const getMethodFee = (method: ShippingMethod) => {
    if (appliedCoupon?.freeShipping || hasFreeShippingItem) return 0;
    if (method === 'HOME') {
      const base = subtotal >= HOME_FREE_THRESHOLD ? 0 : 100;
      return isIslandDelivery ? base + 60 : base;
    }
    const base = subtotal >= CVS_FREE_THRESHOLD ? 0 : 65;
    return isIslandDelivery ? base + 40 : base;
  };

  const shippingFee = getMethodFee(shippingMethod);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const paymentFee = 0;
  const total = Math.max(0, subtotal + shippingFee - pointsToUse - discount);
  const pointsEarned = Math.floor(total * 0.05) * (isVip ? 2 : 1);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    const result = validateCoupon(code, subtotal, isVip, member?.coupons || []);
    if (result.isValid && result.coupon) {
      setAppliedCoupon({
        code,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping,
        label: result.label,
      });
      setCouponCode(code);
    } else {
      setCouponError(result.errorMessage || '無效的折扣碼，請確認代碼是否輸入正確。');
    }
  };

  const openCvsModal = (method: ShippingMethod = shippingMethod) => {
    let brand: '7-11' | 'familymart' | 'hilife' | 'okmart' = '7-11';
    if (method === 'FAMIC2C') brand = 'familymart';
    else if (method === 'HILIFEC2C') brand = 'hilife';
    else if (method === 'OKMARTC2C') brand = 'okmart';
    setCvsModalBrand(brand);
    setIsCvsModalOpen(true);
  };

  const cvsBrandInfo = useMemo(() => {
    if (shippingMethod === 'FAMIC2C') {
      return { name: '全家便利商店', shortName: '全家', mapUrl: 'https://www.family.com.tw/Marketing/Map' };
    }
    if (shippingMethod === 'HILIFEC2C') {
      return { name: '萊爾富便利商店', shortName: '萊爾富', mapUrl: 'https://www.hilife.com.tw/storeInquiry_street.aspx' };
    }
    if (shippingMethod === 'OKMARTC2C') {
      return { name: 'OK 超商', shortName: 'OK', mapUrl: 'https://www.okmart.com.tw/convenient_shopSearch' };
    }
    return { name: '7-ELEVEN 統一超商', shortName: '7-ELEVEN', mapUrl: 'https://emap.pcsc.com.tw/' };
  }, [shippingMethod]);

  const handleShippingMethodChange = (m: ShippingMethod) => {
    setShippingMethod(m);
    setShowManualCvsInput(false);
    if (m === 'HOME') {
      const def = getDefaultSavedAddress();
      if (def && def.addr) {
        applySavedAddressEntry(def);
      } else {
        setShippingAddress('');
      }
    } else {
      let brand: '7-11' | 'familymart' | 'hilife' | 'okmart' = '7-11';
      if (m === 'FAMIC2C') brand = 'familymart';
      else if (m === 'HILIFEC2C') brand = 'hilife';
      else if (m === 'OKMARTC2C') brand = 'okmart';

      const brandPrefix = brand === 'familymart' ? '全家' : brand === 'hilife' ? '萊爾富' : brand === 'okmart' ? 'OK' : '7-ELEVEN';
      if (!shippingAddress.startsWith(brandPrefix)) {
        setShippingAddress('');
      }
      setCvsModalBrand(brand);
    }
  };

  // Launch real NewebPay gateway form submit
  const triggerNewebPayCheckout = async (methodToUse: PaymentGateway = paymentGateway) => {
    setIsProcessing(true);
    try {
      const pendingOrderInfo = {
        userId: (member?.id && !member.id.startsWith('guest')) ? member.id : (auth.currentUser?.uid || 'guest'),
        customerName,
        customerEmail,
        customerPhone,
        shippingMethod,
        shippingAddress,
        cartItems,
        subtotal,
        shippingFee,
        paymentFee,
        discount,
        couponCode: appliedCoupon?.code || '',
        pointsToUse,
        total,
        paymentGateway: methodToUse,
        invoiceType,
        invoiceCarrierValue,
      };
      localStorage.setItem('printcore_pending_order', JSON.stringify(pendingOrderInfo));

      let checkoutData: { url: string; formParams: Record<string, string> } | null = null;

      try {
        const res = await fetch(window.location.origin + '/api/payment/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            email: customerEmail,
            desc: cartItems.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
            paymentMethod: methodToUse,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.formParams) {
            checkoutData = data;
          }
        }
      } catch (networkErr) {
        console.warn('[Checkout] 伺服器端結帳端點未啟動，自動切換至前端藍新金流加密模組:', networkErr);
      }

      if (!checkoutData) {
        checkoutData = createClientNewebPayCheckout({
          amount: total,
          email: customerEmail,
          desc: cartItems.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
          paymentMethod: methodToUse,
        });
      }

      if (checkoutData && checkoutData.formParams) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = checkoutData.url;
        if (window.self !== window.top) {
          form.target = '_blank';
        }

        Object.keys(checkoutData.formParams).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = checkoutData!.formParams[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      } else {
        setFormError('無法啟動藍新金流，請確認網路連線或稍後再試。');
      }
    } catch (err) {
      console.error(err);
      setFormError('啟動付款流程時發生未知的錯誤，請稍後再試或選擇其他付款方式。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPayment = async () => {
    setFormError(null);

    const missingFields: string[] = [];
    if (!shippingAddress) missingFields.push('物流取件門市或配送地址');
    if (!customerName.trim()) missingFields.push('收件人姓名');
    if (!customerPhone.trim()) missingFields.push('聯絡電話');
    if (!customerEmail.trim()) missingFields.push('電子郵件信箱');

    if (missingFields.length > 0) {
      setFormError(`請填寫以下必填資料：${missingFields.join('、')}`);
      return;
    }

    await triggerNewebPayCheckout(paymentGateway);
  };

  // Clean Radio Options for Shipping (matching the user's screenshot style)
  const shippingOptions: {
    id: ShippingMethod;
    label: string;
    fee: number;
    diffForFree: number;
  }[] = [
    {
      id: 'HOME',
      label: '宅配運輸',
      fee: getMethodFee('HOME'),
      diffForFree: appliedCoupon?.freeShipping || hasFreeShippingItem ? 0 : homeDiffForFree,
    },
    {
      id: 'UNIMARTC2C',
      label: '超商取貨 7-ELEVEN',
      fee: getMethodFee('UNIMARTC2C'),
      diffForFree: appliedCoupon?.freeShipping || hasFreeShippingItem ? 0 : cvsDiffForFree,
    },
    {
      id: 'FAMIC2C',
      label: '超商取貨 全家便利店',
      fee: getMethodFee('FAMIC2C'),
      diffForFree: appliedCoupon?.freeShipping || hasFreeShippingItem ? 0 : cvsDiffForFree,
    },
    {
      id: 'HILIFEC2C',
      label: '超商取貨 萊爾富',
      fee: getMethodFee('HILIFEC2C'),
      diffForFree: appliedCoupon?.freeShipping || hasFreeShippingItem ? 0 : cvsDiffForFree,
    },
  ];

  // Clean Radio Options for Payment (matching the user's screenshot style & wired to NewebPay MPG)
  const paymentRadioOptions: {
    id: PaymentGateway;
    label: string;
  }[] = [
    { id: 'webatm', label: '銀行轉帳' },
    { id: 'credit_card', label: '信用卡(一次付清)' },
    { id: 'atm', label: 'ATM' },
    { id: 'barcode', label: '超商條碼' },
    { id: 'applepay', label: 'Apple Pay' },
    { id: 'linepay', label: 'LINE Pay' },
    { id: 'credit_inst', label: '信用卡(分三期)' },
  ];

  if (!isOpen || (!createdOrder && cartItems.length === 0)) return null;

  return (
    <div 
      className="fixed inset-0 z-[95] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-5 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 flex flex-col relative cursor-default select-text pb-16 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-nowrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  {createdOrder
                    ? lang === 'en'
                      ? 'Payment Authorized'
                      : lang === 'ja'
                      ? 'お支払い完了'
                      : '訂單支付成功'
                    : lang === 'en'
                    ? 'Order Checkout'
                    : lang === 'ja'
                    ? 'ご注文・お支払い'
                    : '訂單結帳支付'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold whitespace-nowrap shrink-0">
                  <Lock className="w-2.5 h-2.5 shrink-0" />
                  {lang === 'en' ? 'SSL Secured' : lang === 'ja' ? 'SSL暗号化' : '藍新 SSL 加密'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {lang === 'en'
                  ? 'Credit Card · LINE Pay · Apple Pay · ATM · CVS'
                  : lang === 'ja'
                  ? 'クレジットカード・LINE Pay・Apple Pay・ATM・コンビニ決済'
                  : '支援信用卡・LINE Pay・Apple Pay・ATM・超商條碼'}
              </p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order is Created Success View */}
        {createdOrder ? (
          <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                藍新金流交易授權成功 (交易序號: LP-{createdOrder.id.slice(-8)})
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
                感謝您的訂購，包裹準備出貨中！
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                訂單編號：<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{createdOrder.orderNumber}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">配送方式</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {createdOrder.shippingMethod === '7-11' ? '7-ELEVEN 交貨便' : createdOrder.shippingMethod === 'familymart' ? '全家店到店' : '黑貓宅急便'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">收件門市 / 地址</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[280px] break-words">
                  {createdOrder.storeOrAddress}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">即時物流託運號</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {createdOrder.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">雲端發票號碼</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{createdOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900 dark:text-slate-100">
                <span>實付金額</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 text-base">
                  {formatPrice(createdOrder.total, currency)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-lg">
              <button
                id="btn-download-order-proof-action"
                type="button"
                onClick={() => downloadOrderProofJSON(createdOrder)}
                className="py-3 px-3.5 rounded-xl border border-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>下載證明檔案</span>
              </button>
              <button
                id="print-order-receipt-btn"
                type="button"
                onClick={() => downloadOrderProofPDF(createdOrder)}
                className="py-3 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>存為 PDF 憑證</span>
              </button>
              <button
                id="track-order-live-btn"
                onClick={() => {
                  onClose();
                  onOpenTracking(createdOrder.trackingNumber);
                }}
                className="flex-1 py-3 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>即時物流進度</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Checkout Form */
          <div className="p-4 sm:p-6 space-y-5">
            {/* Compact Trust & Security Banner */}
            <div className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-emerald-50/40 dark:from-slate-950/80 dark:via-indigo-950/20 dark:to-emerald-950/20 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  交易安全承諾
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  7天猶豫鑑賞期
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  藍新 256-bit SSL
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  165防詐騙保護
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrustCertModal(true)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80 cursor-pointer shadow-2xs transition-all shrink-0 ml-auto"
              >
                <FileCheck className="w-3 h-3" />
                <span>保障條款</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Main Form Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Clean Simple Checkout Flow */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section 1: 貨物 (物流取件方式) & 總計 */}
                <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  {/* 寄送到離島區域 Checkbox */}
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isIslandDelivery}
                      onChange={(e) => setIsIslandDelivery(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      寄送到離島區域
                    </span>
                  </label>

                  {/* 貨物 (Shipping Methods Radio List — zero orphan wrapping) */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="sm:w-24 shrink-0 sm:pt-0.5">
                      <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        配送方式
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {shippingOptions.map((opt) => {
                        const isSelected = shippingMethod === opt.id;
                        const feeText = opt.fee === 0 ? 'NT$0（免運）' : `NT$${opt.fee}`;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleShippingMethodChange(opt.id)}
                            className={`cursor-pointer group rounded-2xl p-2.5 -mx-1 transition-colors ${
                              isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Radio Circle */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected
                                    ? 'border-blue-600 dark:border-indigo-400'
                                    : 'border-slate-400 dark:border-slate-600 group-hover:border-blue-500'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-indigo-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                                <span className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 text-balance">
                                  {opt.label}
                                </span>
                                <span className="text-xs sm:text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0 tabular-nums">
                                  {feeText}
                                </span>
                              </div>
                            </div>

                            {/* Free Shipping Difference Pill Badge */}
                            <div className="pl-7 mt-1.5">
                              {opt.diffForFree > 0 ? (
                                <span className="inline-flex items-center whitespace-nowrap bg-[#d46b6b] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                                  還差 {opt.diffForFree} 元免運
                                </span>
                              ) : (
                                <span className="inline-flex items-center whitespace-nowrap bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                                  已享免運優惠
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 總計 Row */}
                  <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="sm:w-24 shrink-0">
                      <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        應付總計
                      </span>
                    </div>
                    <div className="sm:flex-1">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono whitespace-nowrap tabular-nums">
                        {formatPrice(total, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recipient & Store / Address Information */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    收件人與門市 / 配送地址
                  </h3>

                  {['UNIMARTC2C', 'FAMIC2C', 'HILIFEC2C', 'OKMARTC2C'].includes(shippingMethod) ? (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          {cvsBrandInfo.shortName} 取件門市
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          官方門市選店
                        </span>
                      </div>

                      {shippingAddress && !shippingAddress.includes('國泰金融大樓') ? (
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 break-words">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="break-words">{shippingAddress}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openCvsModal(shippingMethod)}
                            className="text-xs font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            變更門市
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                            尚未選擇 {cvsBrandInfo.shortName} 取件門市
                          </span>
                          <button
                            type="button"
                            onClick={() => openCvsModal(shippingMethod)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Store className="w-3.5 h-3.5" />
                            選擇 {cvsBrandInfo.shortName} 門市
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      {savedAddresses.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              從常用地址一鍵帶入：
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                            {savedAddresses.map((entry: any) => {
                              const entryAddr = entry.addr || entry.address || '';
                              const isSelected = shippingAddress.trim() === entryAddr.trim();
                              return (
                                <button
                                  key={entry.id || entryAddr}
                                  type="button"
                                  onClick={() => applySavedAddressEntry(entry)}
                                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                    isSelected
                                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500/40'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-slate-50/70 dark:bg-slate-800/50'
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-900 dark:text-slate-100">
                                      <span>{entry.name || '常用收件人'}</span>
                                      {entry.phone && (
                                        <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                          {entry.phone}
                                        </span>
                                      )}
                                      {entry.isDefault && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                                          預設收件
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 break-words">
                                      {entryAddr}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <TaiwanAddressInput
                        value={shippingAddress}
                        onChange={(addr) => {
                          setShippingAddress(addr);
                          if (formError) setFormError(null);
                        }}
                        memberAddress={getDefaultSavedAddress()?.addr || member?.address}
                        label="宅配收件地址"
                        placeholder="請輸入路名街巷、門牌號碼與樓層"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">收件人姓名</label>
                        <span className="text-[10px] text-rose-500 font-medium">* 必填</span>
                      </div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="請輸入真實姓名"
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">手機號碼</label>
                        <span className="text-[10px] text-rose-500 font-medium">* 必填</span>
                      </div>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="例：0912345678"
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">電子信箱 (接收訂單與發票通知)</label>
                      <span className="text-[10px] text-rose-500 font-medium">* 必填</span>
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="例：user@example.com"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {shippingMethod !== 'HOME' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowManualCvsInput(!showManualCvsInput)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {showManualCvsInput ? '隱藏手動輸入門市欄位' : '找不到門市？手動輸入門市名稱與代號'}
                      </button>
                      {showManualCvsInput && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              手動填寫 {cvsBrandInfo.shortName} 取件門市名稱 / 代號
                            </label>
                            <span className="text-[10px] text-rose-500 font-medium">* 必填</span>
                          </div>
                          <input
                            type="text"
                            value={shippingAddress}
                            onChange={(e) => {
                              setShippingAddress(e.target.value);
                              if (formError) setFormError(null);
                            }}
                            placeholder={`例：${cvsBrandInfo.shortName} 民雄門市 (154821)`}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 2: 付款方式 (2-Column Balanced Grid, zero orphan wrapping) */}
                <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-5">
                    <div className="sm:w-24 shrink-0 sm:pt-1 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
                      <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        付款方式
                      </span>
                      <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold sm:mt-1 whitespace-nowrap">
                        藍新金流
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {paymentRadioOptions.map((pm) => {
                        const isSelected = paymentGateway === pm.id;
                        return (
                          <div
                            key={pm.id}
                            onClick={() => {
                              setPaymentGateway(pm.id);
                              if (formError) setFormError(null);
                            }}
                            className={`flex items-center gap-2.5 cursor-pointer group px-3 py-2.5 rounded-2xl border transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-400'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'border-blue-600 dark:border-indigo-400'
                                  : 'border-slate-400 dark:border-slate-600 group-hover:border-blue-500'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-600 dark:bg-indigo-400" />
                              )}
                            </div>

                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                              {pm.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 3: 電子發票開立 (Compact) */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    電子發票開立
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setInvoiceType('mobile_barcode')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        invoiceType === 'mobile_barcode'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      手機條碼
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('cloud')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        invoiceType === 'cloud'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      會員載具
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceType('tax_id')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        invoiceType === 'tax_id'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      公司統編
                    </button>
                  </div>

                  {invoiceType === 'mobile_barcode' && (
                    <input
                      type="text"
                      placeholder="請輸入以 / 開頭的手機載具 (例：/AB8892.)"
                      value={invoiceCarrierValue}
                      onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  )}
                  {invoiceType === 'tax_id' && (
                    <input
                      type="text"
                      placeholder="請輸入公司 8 碼統一編號"
                      value={invoiceCarrierValue}
                      onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary & Checkout Button */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-fit">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.orderSummary}</h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      共 {cartItems.reduce((acc, i) => acc + i.quantity, 0)} 件商品
                    </span>
                  </div>

                  {/* Items preview list (Clean 1-2 line layout without redundant parentheses) */}
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1 mb-4">
                    {cartItems.map((item) => {
                      const translatedItem = translateProduct(item.product, lang);
                      const cleanItemName = (translatedItem.name || translateProductName(item.product.name, item.product.brand, item.product.material, item.product.weight, lang))
                        .replace(/神狗勾\s*/g, '')
                        .replace(/莫蘭迪\s*/g, '')
                        .replace(/\s*[\(（][^\)）]*[\)）]\s*$/g, '')
                        .trim();
                      return (
                        <div 
                          key={`${item.product.id}-${item.selectedColor.name}`}
                          className="flex items-center justify-between text-xs py-2 border-b border-slate-200/80 dark:border-slate-800/80 gap-2.5"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300 dark:border-slate-600"
                              style={{ backgroundColor: item.selectedColor.hex }} 
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {cleanItemName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                              × {item.quantity}
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 min-w-[68px] text-right tabular-nums whitespace-nowrap">
                              {formatPrice(item.product.price * item.quantity, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mb-3">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      優惠折扣代碼
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="輸入優惠碼 如: GODDOG"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-slate-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        套用
                      </button>
                    </div>

                    {Array.isArray(member?.coupons) && member.coupons.filter((mc: any) => mc?.code).length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">我的優惠券：</span>
                        {member.coupons
                          .filter((mc: any) => mc?.code)
                          .map((mc: any) => (
                            <button
                              key={mc.id || mc.code}
                              type="button"
                              onClick={() => handleApplyCoupon(mc.code)}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                            >
                              {mc.code}
                            </button>
                          ))}
                      </div>
                    )}

                    {couponError && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{couponError}</p>
                    )}

                    {appliedCoupon && (
                      <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between font-medium">
                        <span className="break-words">✓ {appliedCoupon.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode('');
                          }}
                          className="text-emerald-700 dark:text-emerald-400 hover:text-rose-600 underline text-[10px] shrink-0 ml-2 cursor-pointer"
                        >
                          移除
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>商品小計</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-medium tabular-nums">
                        {formatPrice(subtotal, currency)}
                      </span>
                    </div>
                    {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                        <span>優惠折抵 ({appliedCoupon.code})</span>
                        <span className="font-mono tabular-nums">-{formatPrice(appliedCoupon.discountAmount, currency)}</span>
                      </div>
                    )}
                    {pointsToUse > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>會員積分折抵</span>
                        <span className="font-mono tabular-nums">-{formatPrice(pointsToUse, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-3 text-slate-600 dark:text-slate-400">
                      <span className="min-w-0 text-pretty">貨物運費 ({shippingMethod === 'HOME' ? '宅配運輸' : `超商取貨 ${cvsBrandInfo.shortName}`})</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold tabular-nums whitespace-nowrap shrink-0">
                        {shippingFee === 0 ? 'NT$ 0 (免運)' : `NT$ ${shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-3 text-base font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="whitespace-nowrap">總計</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xl font-black tabular-nums whitespace-nowrap shrink-0">
                        {formatPrice(total, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      本次結帳回饋會員點數：
                    </span>
                    <span className="font-bold text-amber-800 dark:text-amber-300 font-mono shrink-0 tabular-nums">+{pointsEarned} pt</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span className="leading-relaxed break-words flex-1">{formError}</span>
                    </div>
                  )}

                  <button
                    id="start-payment-gateway-btn"
                    onClick={handleStartPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 sm:px-5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-600 dark:via-indigo-700 dark:to-indigo-800 hover:from-indigo-600 hover:to-blue-600 text-white shadow-indigo-900/20"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0"></span>
                        <span className="text-center text-balance leading-snug">正在連線藍新金流加密授權...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-center text-balance leading-snug">
                          前往藍新結帳・{(paymentRadioOptions.find(p => p.id === paymentGateway)?.label || '安全付款').replace(/[\(（]/g, ' ').replace(/[\)）]/g, '').trim()}
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center text-balance leading-relaxed">
                    🔒 藍新金流 NewebPay 256-bit SSL 安全加密收銀台
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <OrderCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        order={createdOrder}
      />

      <TrustCertModal
        isOpen={showTrustCertModal}
        onClose={() => setShowTrustCertModal(false)}
      />

      <CvsStoreSelectorModal
        isOpen={isCvsModalOpen}
        onClose={() => setIsCvsModalOpen(false)}
        targetBrand={cvsModalBrand}
        initialMethod={shippingMethod}
        onSelectStore={({ fullFormatted, shippingMethod: chosenMethod }) => {
          setShippingAddress(fullFormatted);
          setShippingMethod(chosenMethod);
          setShowManualCvsInput(false);
        }}
      />
    </div>
  );
};
