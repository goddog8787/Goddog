import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  AlertCircle,
  Copy,
  Check,
  Download,
  Lock,
  Database,
  Store,
  Sparkles,
  ShieldAlert,
  Building2,
  Landmark,
  RotateCcw,
  Receipt,
  PhoneCall,
  ExternalLink,
  FileCheck,
  BadgeCheck,
  Gift,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CartItem, 
  CurrencyCode, 
  LanguageCode, 
  MemberProfile, 
  Order, 
  PaymentGateway, 
  ShippingMethod 
} from '../../types';
import { formatPrice, translations, translateProductName, translateColorName } from '../../utils/i18n';
import { auth } from '../../lib/firebase';
import { getStoredCustomerSession } from '../../lib/customerPersistence';
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: CurrencyCode;
  lang: LanguageCode;
  member: MemberProfile;
  pointsToUse: number;
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
  onOrderCompleted,
  onOpenTracking,
}) => {
  const t = translations[lang];

  // Helper to ensure customer enters their real name & phone
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
  const [customerName, setCustomerName] = useState(() => {
    return member?.name && isValidCustomerName(member.name) ? member.name : '';
  });
  const [customerEmail, setCustomerEmail] = useState(member?.email || '');
  const [customerPhone, setCustomerPhone] = useState(() => {
    return member?.phone && isValidPhone(member.phone) ? member.phone : '';
  });
  const [shippingAddress, setShippingAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync recipient fields when customer switches account or logs out so previous customer info never leaks
  useEffect(() => {
    setCustomerName(member?.name && isValidCustomerName(member.name) ? member.name : '');
    setCustomerEmail(member?.email || '');
    setCustomerPhone(member?.phone && isValidPhone(member.phone) ? member.phone : '');
  }, [member?.id, member?.name, member?.email, member?.phone]);

  // Invoice
  const [invoiceType, setInvoiceType] = useState<'cloud' | 'mobile_barcode' | 'tax_id'>('cloud');
  const [invoiceCarrierValue, setInvoiceCarrierValue] = useState('');

  // Payment gateway
  const isAppleDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('credit_card');
  const [paymentCategory, setPaymentCategory] = useState<'credit' | 'mobile' | 'atm' | 'cvs'>('credit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeGatewayModal, setActiveGatewayModal] = useState<'none' | 'ecpay_credit' | 'ecpay_atm' | 'ecpay_cvs' | 'linepay'>('none');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // CVS In-App Modal State
  const [isCvsModalOpen, setIsCvsModalOpen] = useState(false);
  const [cvsModalBrand, setCvsModalBrand] = useState<'7-11' | 'familymart' | 'hilife' | 'okmart'>('7-11');

  // Close on Escape key (if no active modal popup)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeGatewayModal === 'none') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeGatewayModal]);

  // Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; freeShipping: boolean; label: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showTrustCertModal, setShowTrustCertModal] = useState(false);

  // Price calculations
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isVip = (member?.subscriptionPlan && member.subscriptionPlan !== 'None');
  const vipDiscountAmount = isVip ? Math.floor(rawSubtotal * 0.05) : 0;
  const subtotal = rawSubtotal - vipDiscountAmount; // Subtotal after VIP discount

  // If item has customShippingFee: 0 (e.g. 1-dollar test item) or subtotal >= 999, free shipping
  const hasFreeShippingItem = cartItems.length > 0 && cartItems.every(i => i.product.customShippingFee === 0);
  const baseShippingFee = (subtotal >= 999 || hasFreeShippingItem) ? 0 : 60;
  const shippingFee = appliedCoupon?.freeShipping ? 0 : baseShippingFee;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const isFeePayment = ['atm', 'webatm', 'smartpay', 'cvs', 'barcode'].includes(paymentGateway);
  const paymentFee = isFeePayment ? 20 : 0;
  const total = Math.max(0, subtotal + shippingFee + paymentFee - pointsToUse - discount);
  const pointsEarned = Math.floor(total * 0.05) * (isVip ? 2 : 1);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    const result = validateCoupon(code, subtotal, isVip);
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

  // -------------------------
  // NewebPay Logistics & CVS Store Selector Logic
  // -------------------------
  const openCvsModal = (method: ShippingMethod = shippingMethod) => {
    let brand: '7-11' | 'familymart' | 'hilife' | 'okmart' = '7-11';
    if (method === 'FAMIC2C') brand = 'familymart';
    else if (method === 'HILIFEC2C') brand = 'hilife';
    else if (method === 'OKMARTC2C') brand = 'okmart';
    setCvsModalBrand(brand);
    setIsCvsModalOpen(true);
  };

  const openLogisticsMap = (logType: ShippingMethod = shippingMethod) => {
    openCvsModal(logType);
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
    if (m === 'HOME') {
      setShippingAddress(''); // 宅配由收件人填寫實際收件地址，完全不需門市
    } else {
      // 點選超商物流 (7-11、全家、萊爾富等)
      let brand: '7-11' | 'familymart' | 'hilife' | 'okmart' = '7-11';
      if (m === 'FAMIC2C') brand = 'familymart';
      else if (m === 'HILIFEC2C') brand = 'hilife';
      else if (m === 'OKMARTC2C') brand = 'okmart';

      // 若當前選取的門市不屬於該品牌或尚未選店，清空舊地址以避免門市混淆
      const brandPrefix = brand === 'familymart' ? '全家' : brand === 'hilife' ? '萊爾富' : brand === 'okmart' ? 'OK' : '7-ELEVEN';
      if (!shippingAddress.startsWith(brandPrefix)) {
        setShippingAddress('');
      }
      // 點擊什麼超商物流就立即跳出選取該物流的門市 (點全家彈出全家門市、點7-11彈出7-11門市)
      setCvsModalBrand(brand);
      setIsCvsModalOpen(true);
    }
  };

  // Launch real NewebPay gateway form submit
  const triggerNewebPayCheckout = async (methodToUse: PaymentGateway = paymentGateway) => {
    setIsProcessing(true);
    try {
      // 儲存待付款訂單資訊，供藍新跳轉回來時完成建立訂單與清空購物車
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

      if (methodToUse === 'linepay') {
        setFormError('LINE Pay 目前尚未開放，請選擇「信用卡線上刷卡」、「Apple Pay」或「超商取貨付款」。');
        return;
      }

      // 藍新金流真實串接 (支援伺服器端與靜態前端直接加密雙模式)
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
        console.warn('[Checkout] 伺服器端結帳端點未啟動，自動切換至前端高防護金流加密模組:', networkErr);
      }

      // 若後端端點未回應 (例如託管於靜態站點時)，自動啟用前端真實藍新 AES-256-CBC 與 SHA256 授權模組
      if (!checkoutData) {
        checkoutData = createClientNewebPayCheckout({
          amount: total,
          email: customerEmail,
          desc: cartItems.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
          paymentMethod: methodToUse,
        });
      }

      if (checkoutData && checkoutData.formParams) {
        // 建立隱藏表單自動送出跳轉到藍新金流 (真實付款流程)
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
        return; // 瀏覽器跳轉至藍新金流安全收銀台
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

  // Launch payment initiation
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

    if (paymentGateway === 'linepay') {
      setFormError('LINE Pay 目前尚未開放，請選擇「信用卡線上刷卡」、「Apple Pay」或「超商取貨付款」。');
      return;
    }

    if (paymentGateway === 'applepay' && !isAppleDevice) {
      setFormError('您目前使用的裝置非 Apple 系統（例如 Android 或 Windows PC），不支援 Apple Pay。請選擇「信用卡線上刷卡」或「超商代碼/ATM」付款。');
      return;
    }

    // 真實呼叫藍新金流前端進行安全授權 (包含信用卡、Apple Pay、ATM 等)
    await triggerNewebPayCheckout(paymentGateway);
  };

  if (!isOpen || (!createdOrder && cartItems.length === 0)) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 flex flex-col relative cursor-default select-text pb-16 sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                  {createdOrder ? '🎉 訂單支付成功與電子憑證' : t.checkoutTitle}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <Lock className="w-2.5 h-2.5" />
                  TLS 1.3 256-bit 加密連線
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                各大行庫信用卡 · 行動支付 · 超商與 ATM 256-bit SSL 安全代收
              </p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order is Created Success View */}
        {createdOrder ? (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                藍新 / LINE Pay 交易授權成功 (交易序號: LP-{createdOrder.id.slice(-8)})
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
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[280px] truncate">
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
              <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-800/70 text-amber-800 dark:text-amber-200 text-[11px] flex items-center justify-between">
                <span>本次消費獲得會員積分回饋：</span>
                <span className="font-bold font-mono text-amber-900 dark:text-amber-300">+{createdOrder.pointsEarned} pt</span>
              </div>

              {/* Convenience store barcode preview */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
                <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {createdOrder.shippingMethod === '7-11' ? '7-ELEVEN 門市交貨取件條碼' : '全家便利商店 門市取件條碼'}
                </div>
                {/* Visual Barcode bars */}
                <div className="h-9 flex items-center justify-center gap-[2px] py-1 bg-white p-1 rounded">
                  {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,4,1,2,4,3,1,2,4,1,3,2,1,4,2,3,1].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 h-full rounded-xs"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <div className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-widest">
                  {(createdOrder?.trackingNumber ? String(createdOrder.trackingNumber).replace(/\D/g, '') : '') || '77291823091'}
                </div>
              </div>
            </div>

            {/* Integrity Certificate Verification Card */}
            <div className="w-full max-w-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 p-4 rounded-2xl text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>資料完整性與特店數位簽章憑證</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full font-bold">
                  ✓ HMAC-SHA256 已簽核
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed text-justify break-words">
                本訂單已寫入 Google Firebase 雲端資料庫，並由藍新金流特店 MS1843364339 完成密碼學數位簽章，包含完整商品明細與物流單號，可供離線驗證資料完整性。
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="btn-download-order-proof-file"
                  type="button"
                  onClick={() => downloadOrderProofJSON(createdOrder)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer active:scale-98 transition-all"
                  title="下載包含完整訂單與數位簽章的 JSON 證明檔案"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下載證明檔案 (.JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="檢視詳細憑證校驗數據與防偽簽章"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>檢驗簽章與憑證</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-lg">
              <button
                id="btn-download-order-proof-action"
                type="button"
                onClick={() => downloadOrderProofJSON(createdOrder)}
                className="py-3 px-3.5 rounded-xl border border-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="下載包含訂單關鍵資料與數位簽章的 JSON 證明檔案"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>下載證明檔案</span>
              </button>
              <button
                id="print-order-receipt-btn"
                type="button"
                onClick={() => downloadOrderProofPDF(createdOrder)}
                className="py-3 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="列印或存為官方 PDF 憑證"
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
          <div className="p-4 sm:p-7 space-y-6">
            {/* Space-Efficient Trust & Security Banner */}
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
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/80 cursor-pointer shadow-2xs hover:shadow-xs transition-all shrink-0 ml-auto"
              >
                <FileCheck className="w-3 h-3" />
                <span>保障條款</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Main Form Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form details */}
              <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Shipping Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  選擇物流取件方式
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('UNIMARTC2C')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'UNIMARTC2C'
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">7-ELEVEN</span>
                      {shippingMethod === 'UNIMARTC2C' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">交貨便</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('FAMIC2C')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'FAMIC2C'
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700 dark:text-blue-400">全家店到店</span>
                      {shippingMethod === 'FAMIC2C' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">FamiPort 取件</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('HILIFEC2C')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'HILIFEC2C'
                        ? 'border-pink-600 bg-pink-50/80 dark:bg-pink-950/40 ring-2 ring-pink-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-pink-700 dark:text-pink-400">萊爾富</span>
                      {shippingMethod === 'HILIFEC2C' && <Check className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Life-ET 取件</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('HOME')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'HOME'
                        ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-800 dark:text-amber-400">黑貓宅急便</span>
                      {shippingMethod === 'HOME' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">專車到府</span>
                  </button>
                </div>

                {/* Recipient & Address Fields */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  {/* Recipient & Address Fields */}
                  {['UNIMARTC2C', 'FAMIC2C', 'HILIFEC2C', 'OKMARTC2C'].includes(shippingMethod) ? (
                    <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          已選 {cvsBrandInfo.shortName} 取件門市
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          已啟用防阻擋選店系統
                        </span>
                      </div>

                      {shippingAddress && !shippingAddress.includes('國泰金融大樓') ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-xs flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <span className="truncate">{shippingAddress}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-justify leading-relaxed break-words">
                              商品到店後，系統將發送取件簡訊通知取件，請攜帶身分證件至指定門市付款取貨。
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openCvsModal(shippingMethod)}
                            className="text-xs font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            變更門市
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 text-center space-y-2">
                          <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                            尚未指定 {cvsBrandInfo.shortName} 取件門市
                          </div>
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 text-justify leading-relaxed break-words [text-align-last:center]">
                            已為您連動 {cvsBrandInfo.name} 門市快速選店系統，請點選下方按鈕選取取件超商：
                          </p>
                          <button
                            type="button"
                            onClick={() => openCvsModal(shippingMethod)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Store className="w-3.5 h-3.5" />
                            選擇 {cvsBrandInfo.shortName} 取件門市
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-end text-[11px] pt-1">
                        <a
                          href={cvsBrandInfo.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <span>{cvsBrandInfo.shortName} 全台門市搜索</span>
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <TaiwanAddressInput
                        value={shippingAddress}
                        onChange={(addr) => {
                          setShippingAddress(addr);
                          if (formError) setFormError(null);
                        }}
                        memberAddress={member?.address}
                        label="宅配收件地址 (黑貓專車配送到府)"
                        placeholder="請輸入路名街巷、門牌號碼與樓層 (例：和平東路二段100號3樓)"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">收件人姓名</label>
                        <span className="text-[10px] text-rose-500 font-medium">* 必填 (需核對證件)</span>
                      </div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="請輸入收件人真實姓名 (例如：陳大明)"
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">手機號碼 (接收取件簡訊)</label>
                        <span className="text-[10px] text-rose-500 font-medium">* 必填 (發送簡訊)</span>
                      </div>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="請輸入 10 碼手機號碼 (例如：0912345678)"
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">電子信箱 (寄送訂單與電子發票)</label>
                      <span className="text-[10px] text-slate-400 font-medium">接收通知</span>
                    </div>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="請輸入常用電子信箱 (例如：user@example.com)"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {/* 僅在超商取貨且尚未填選門市時顯示門市名稱代號欄位；宅配到府時完全不需填寫門市 */}
                  {shippingMethod !== 'HOME' && !shippingAddress && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          超商取件門市名稱與代號
                        </label>
                        <span className="text-[10px] text-rose-500 font-medium">* 必填</span>
                      </div>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder={`點選上方按鈕選擇門市，或手動輸入 (例：${cvsBrandInfo.shortName} 敦南門市 991823)`}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Payment Gateway Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    選擇金流支付方式 (藍新金流 NewebPay)
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    256-bit SSL
                  </span>
                </div>

                {/* 4 Clean Payment Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('credit');
                      if (!['credit_card', 'credit_inst', 'credit_red', 'unionpay'].includes(paymentGateway)) {
                        setPaymentGateway('credit_card');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentCategory === 'credit'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>信用卡 / 分期</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('mobile');
                      if (!['applepay', 'googlepay', 'samsungpay', 'taiwanpay', 'esunwallet'].includes(paymentGateway)) {
                        setPaymentGateway(isAppleDevice ? 'applepay' : 'credit_card');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentCategory === 'mobile'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>行動支付</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('atm');
                      if (!['atm', 'webatm', 'smartpay'].includes(paymentGateway)) {
                        setPaymentGateway('atm');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentCategory === 'atm'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>ATM 轉帳</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentCategory('cvs');
                      if (!['cvs', 'barcode'].includes(paymentGateway)) {
                        setPaymentGateway('cvs');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentCategory === 'cvs'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>超商代收</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-2 pt-1">
                  {/* Category: 信用卡 / 分期 */}
                  {paymentCategory === 'credit' && (
                    <>
                      {/* 1. 信用卡線上刷卡 (一次付清) */}
                      <label 
                        onClick={() => setPaymentGateway('credit_card')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'credit_card'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>信用卡線上刷卡 (一次付清)</span>
                              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                                3D OTP 驗證
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援各大行庫 Visa、MasterCard、JCB 信用卡安全刷卡，藍新金流 3D OTP 加密驗證防護。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'credit_card' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'credit_card' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 2. 信用卡分期付款 */}
                      <label 
                        onClick={() => setPaymentGateway('credit_inst')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'credit_inst'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            分期
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>信用卡分期付款 (3 / 6 / 12 期)</span>
                              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                靈活分期
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援各大行庫信用卡 3、6、12 期靈活分期付款，分期付款輕鬆無負擔。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'credit_inst' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'credit_inst' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 3. 信用卡紅利折抵 */}
                      <label 
                        onClick={() => setPaymentGateway('credit_red')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'credit_red'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>信用卡紅利折抵</span>
                              <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                紅利變現金
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援多家銀行信用卡紅利點數，結帳即時折抵消費現金，點數折抵更優惠。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'credit_red' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'credit_red' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 4. 銀聯在線支付 */}
                      <label 
                        onClick={() => setPaymentGateway('unionpay')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'unionpay'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#005a9c] text-white flex items-center justify-center font-black text-xs shrink-0">
                            銀聯
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>銀聯卡 (UnionPay)</span>
                              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                銀聯在線
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援全台及海外發行之銀聯信用卡與提款卡線上扣款，跨境金流快速便利。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'unionpay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'unionpay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    </>
                  )}

                  {/* Category: 行動支付 */}
                  {paymentCategory === 'mobile' && (
                    <>
                      {/* 6. Apple Pay */}
                      <label 
                        id="checkout-payment-applepay"
                        onClick={() => {
                          if (!isAppleDevice) {
                            setFormError('您目前使用的裝置非 Apple 系統（例如 Android 或 Windows PC），不支援 Apple Pay。請選擇「信用卡線上刷卡」或「超商代碼/ATM」付款。');
                            return;
                          }
                          setPaymentGateway('applepay');
                          setFormError(null);
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          !isAppleDevice
                            ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : paymentGateway === 'applepay'
                            ? 'border-slate-900 dark:border-slate-400 bg-slate-100/90 dark:bg-slate-800/80 ring-2 ring-slate-900/20 dark:ring-slate-400/20 shadow-xs cursor-pointer'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-black text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs border border-white/10 shrink-0">
                            Pay
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>Apple Pay 快速支付</span>
                              {isAppleDevice ? (
                                <span className="bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  藍新官方串接
                                </span>
                              ) : (
                                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200/80 dark:border-amber-800/80">
                                  僅限 iOS / Mac
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              {isAppleDevice ? '透過 Apple 官方安全通道，支援 Face ID 或指紋快速感應扣款完成授權。' : '非 Apple 系統請切換至「線上刷卡」、「Google Pay」或「超商代碼/ATM」。'}
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'applepay' ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'applepay' && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />}
                        </div>
                      </label>

                      {/* 7. Google Pay */}
                      <label 
                        onClick={() => setPaymentGateway('googlepay')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'googlepay'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-sm shrink-0">
                            G
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>Google Pay</span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Google 錢包
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援 Android 智慧裝置與 Chrome 瀏覽器綁定之 Google 錢包快速結帳，一鍵安全認證扣款。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'googlepay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'googlepay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 8. 台灣 Pay */}
                      <label 
                        onClick={() => setPaymentGateway('taiwanpay')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'taiwanpay'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#e52420] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            TW
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>台灣 Pay (TWQR / 台灣行動支付)</span>
                              <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                金融卡/帳戶
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援全台各大行庫台灣 Pay App、TWQR 共通條碼即時掃碼扣款，跨行轉帳超便利。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'taiwanpay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'taiwanpay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 9. 玉山 Wallet */}
                      <label 
                        onClick={() => setPaymentGateway('esunwallet')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'esunwallet'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#008d7d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            玉山
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>玉山 Wallet</span>
                              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                玉山特約
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援玉山銀行 App 與玉山 Wallet 信用卡或帳戶即時連線扣款，專屬特約即時回饋。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'esunwallet' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'esunwallet' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 10. Samsung Pay */}
                      <label 
                        onClick={() => setPaymentGateway('samsungpay')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'samsungpay'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            Pay
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>Samsung Pay 行動支付</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              支援 Samsung 三星智慧手機指紋或密碼快速感應完成安全付款，專屬 Knox 安全防護。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'samsungpay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'samsungpay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    </>
                  )}

                  {/* Category: ATM 轉帳 */}
                  {paymentCategory === 'atm' && (
                    <>
                      {/* 11. ATM 虛擬轉帳帳號 */}
                      <label 
                        onClick={() => setPaymentGateway('atm')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'atm'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>ATM 虛擬帳號轉帳</span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                轉帳手續費 NT$ 20
                              </span>
                              <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                自動對帳
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              產生專屬虛擬繳款帳號，各大銀行手機網銀 App 或實體 ATM 皆可轉帳 (加收手續費 NT$ 20)。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'atm' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'atm' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 12. WebATM 網路晶片讀卡機 */}
                      <label 
                        onClick={() => setPaymentGateway('webatm')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'webatm'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-cyan-700 text-white flex items-center justify-center shrink-0">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>WebATM 網路晶片讀卡機</span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                轉帳手續費 NT$ 20
                              </span>
                              <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                插卡即付
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              使用晶片金融卡透過讀卡機插卡驗證密碼扣款，免出門即時轉帳安全入帳 (加收手續費 NT$ 20)。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'webatm' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'webatm' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 13. 智慧 ATM 2.0 / SmartPay */}
                      <label 
                        onClick={() => setPaymentGateway('smartpay')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'smartpay'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            Smart
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>智慧 ATM 2.0 / SmartPay 晶片金融卡</span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                轉帳手續費 NT$ 20
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              財金資訊公司 SmartPay 提供之晶片金融卡安全直扣轉帳，保障交易零風險 (加收手續費 NT$ 20)。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'smartpay' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'smartpay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    </>
                  )}

                  {/* Category: 超商代收 */}
                  {paymentCategory === 'cvs' && (
                    <>
                      {/* 14. 超商代碼繳費 */}
                      <label 
                        onClick={() => setPaymentGateway('cvs')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'cvs'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>超商代碼繳費 (CVS)</span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                代碼手續費 NT$ 20
                              </span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                機台印單
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              取得專屬代碼後，至四大超商多媒體機台 (ibon/FamiPort) 列印繳費單至櫃台繳費 (手續費 NT$ 20)。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'cvs' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'cvs' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>

                      {/* 15. 超商條碼繳費 */}
                      <label 
                        onClick={() => setPaymentGateway('barcode')}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          paymentGateway === 'barcode'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                              <span>超商條碼繳費 (Barcode)</span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                                條碼手續費 NT$ 20
                              </span>
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                手機掃碼
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed text-justify break-words">
                              出示手機三段繳款條碼，全台超商門市櫃台店員直接掃碼繳費 (手續費 NT$ 20)。
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          paymentGateway === 'barcode' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentGateway === 'barcode' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Electronic Invoice */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  電子發票開立
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceType('mobile_barcode')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      invoiceType === 'mobile_barcode'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    手機條碼
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('cloud')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      invoiceType === 'cloud'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    會員載具
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('tax_id')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      invoiceType === 'tax_id'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    公司統編
                  </button>
                </div>

                {invoiceType === 'cloud' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-justify break-words">
                    發票將自動託管於會員帳號，開獎時系統自動為您對獎並發送中獎通知。
                  </p>
                )}

                {invoiceType === 'mobile_barcode' && (
                  <div>
                    <input
                      type="text"
                      placeholder="請輸入以 / 開頭的手機載具 (例：/AB8892.)"
                      value={invoiceCarrierValue}
                      onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                )}
                {invoiceType === 'tax_id' && (
                  <div>
                    <input
                      type="text"
                      placeholder="請輸入公司 8 碼統一編號 (例：88392014)"
                      value={invoiceCarrierValue}
                      onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Sleek Guarantee Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0 flex-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-justify leading-relaxed break-words">
                    全館商品享有 7 天猶豫鑑賞期與原廠品檢合格保障，購物安心有憑證。
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrustCertModal(true)}
                  className="self-end sm:self-auto text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer whitespace-nowrap"
                >
                  服務條款 ↗
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Button */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/70 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-fit">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.orderSummary}</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">共 {cartItems.reduce((acc, i) => acc + i.quantity, 0)} 件商品</span>
                </div>

                {/* Items preview list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 mb-4">
                  {cartItems.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.selectedColor.name}`}
                      className="flex items-center justify-between text-xs py-2 border-b border-slate-200/80 dark:border-slate-800/80 gap-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: item.selectedColor.hex }} 
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {translateProductName(item.product.name, item.product.brand, item.product.material, item.product.weight, lang)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          × {item.quantity}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 min-w-[68px] text-right tabular-nums">
                          {formatPrice(item.product.price * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mb-3">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    優惠折扣代碼 (Promo Code)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="輸入優惠碼 如: GODDOG"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      套用
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 text-justify leading-relaxed break-words">{couponError}</p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between font-medium">
                      <span className="truncate">✓ {appliedCoupon.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-rose-600 dark:hover:text-rose-400 underline text-[10px] shrink-0 ml-2 cursor-pointer"
                      >
                        移除
                      </button>
                    </div>
                  )}

                  {/* Coupon quick click pills */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0">快速套用：</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('GODDOG')}
                      className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      GODDOG (9折)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FREE99')}
                      className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      FREE99 (免運)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('MAKER100')}
                      className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      MAKER100 (-$100)
                    </button>
                  </div>
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>{t.subtotal}</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium tabular-nums">{formatPrice(subtotal, currency)}</span>
                  </div>
                  {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 font-bold">
                      <span>優惠代碼折抵 ({appliedCoupon.code})</span>
                      <span className="font-mono tabular-nums">-{formatPrice(appliedCoupon.discountAmount, currency)}</span>
                    </div>
                  )}
                  {pointsToUse > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>會員積分折抵</span>
                      <span className="font-mono tabular-nums">-{formatPrice(pointsToUse, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>物流運費</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                      {shippingFee === 0 ? 'NT$ 0 (滿額免運)' : 'NT$ 60'}
                    </span>
                  </div>
                  {paymentFee > 0 && (
                    <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 font-medium">
                      <span className="flex items-center gap-1">
                        <span>金流手續費</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {['cvs', 'barcode'].includes(paymentGateway) ? '(超商代收/條碼)' : '(ATM/虛擬轉帳)'}
                        </span>
                      </span>
                      <span className="font-mono font-bold tabular-nums">+{formatPrice(paymentFee, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>應付總額</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 text-xl font-black tabular-nums">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>

                {/* Loyalty Point Earn Notice */}
                <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
                  <span className="text-justify leading-relaxed">本次結帳將贈送會員點數：</span>
                  <span className="font-bold text-amber-800 dark:text-amber-300 font-mono shrink-0 tabular-nums">+{pointsEarned} pt</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span className="text-justify leading-relaxed break-words flex-1">{formError}</span>
                  </div>
                )}

                {/* Security Trust Badges Strip */}
                <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 py-0.5 flex-wrap">
                  <span className="flex items-center gap-1 font-medium shrink-0">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    256-bit SSL 加密
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="shrink-0">藍新金流安全代收</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="shrink-0">165反詐騙防護</span>
                </div>
                
                <button
                  id="start-payment-gateway-btn"
                  onClick={handleStartPayment}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    paymentGateway === 'applepay'
                      ? 'bg-black hover:bg-slate-900 text-white shadow-black/20 ring-2 ring-black/10'
                      : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-600 dark:via-indigo-700 dark:to-indigo-800 hover:from-indigo-600 hover:to-blue-600 text-white shadow-indigo-900/20'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>正在連線金流加密授權...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-emerald-400" />
                      {paymentGateway === 'applepay' && (
                        <span className="text-base font-semibold tracking-tight">Pay</span>
                      )}
                      <span>
                        {paymentGateway === 'applepay' ? '前往藍新金流 Apple Pay 安全授權' :
                         paymentGateway === 'linepay' ? 'LINE Pay 暫未開放 (請切換其他付款方式)' : 
                         paymentGateway === 'googlepay' ? '前往 Google Pay 安全付款' :
                         paymentGateway === 'samsungpay' ? '前往 Samsung Pay 安全付款' :
                         paymentGateway === 'taiwanpay' ? '前往 台灣 Pay / TWQR 掃碼付款' :
                         paymentGateway === 'esunwallet' ? '前往 玉山 Wallet 快速付款' :
                         paymentGateway === 'credit_inst' ? '前往藍新金流 信用卡分期付款' :
                         paymentGateway === 'credit_red' ? '前往藍新金流 信用卡紅利折抵' :
                         paymentGateway === 'unionpay' ? '前往 銀聯在線支付' :
                         paymentGateway === 'atm' ? '前往取得 ATM 專屬虛擬轉帳帳號' :
                         paymentGateway === 'webatm' ? '前往 WebATM 晶片讀卡機驗證付款' :
                         paymentGateway === 'smartpay' ? '前往 SmartPay 晶片金融卡扣款' :
                         paymentGateway === 'cvs' ? '前往取得超商繳費代碼 (CVS)' :
                         paymentGateway === 'barcode' ? '前往取得超商條碼 (Barcode)' :
                         '前往藍新金流 (NewebPay) 安全授權付款'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="space-y-1.5 text-center px-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed text-justify break-words [text-align-last:center]">
                    交易由第三方金流進行 3D 驗證，全站不留存任何信用卡卡號或機密帳戶資訊。
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-justify break-words [text-align-last:center]">
                    提供線上即時客服諮詢支援｜反詐騙專線請撥打：165
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Order Certificate Verification & Offline Backup Modal */}
      <OrderCertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        order={createdOrder}
      />

      {/* Official Merchant Business License, Bank Escrow & Anti-Fraud Trust Modal */}
      <TrustCertModal
        isOpen={showTrustCertModal}
        onClose={() => setShowTrustCertModal(false)}
      />

      {/* Interactive In-App CVS Store Selector Modal (Popup-Blocker Immune) */}
      <CvsStoreSelectorModal
        isOpen={isCvsModalOpen}
        onClose={() => setIsCvsModalOpen(false)}
        targetBrand={cvsModalBrand}
        initialMethod={shippingMethod}
        onSelectStore={({ fullFormatted, shippingMethod: chosenMethod }) => {
          setShippingAddress(fullFormatted);
          setShippingMethod(chosenMethod);
        }}
      />
    </div>
  );
};
