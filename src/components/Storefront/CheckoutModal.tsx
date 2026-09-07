import React, { useState } from 'react';
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
  Check
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
import { formatPrice, translations } from '../../utils/i18n';

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
  if (!isOpen || cartItems.length === 0) return null;
  const t = translations[lang];

  // Shipping & customer form
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('7-11');
  const [customerName, setCustomerName] = useState(member.name);
  const [customerEmail, setCustomerEmail] = useState(member.email);
  const [customerPhone, setCustomerPhone] = useState(member.phone);
  const [shippingAddress, setShippingAddress] = useState(
    '7-ELEVEN 科技門市 (店號: 991823 / 台北市南港區重陽路120號)'
  );

  // Invoice
  const [invoiceType, setInvoiceType] = useState<'cloud' | 'mobile_barcode' | 'tax_id'>('mobile_barcode');
  const [invoiceCarrierValue, setInvoiceCarrierValue] = useState('/AB8892.');

  // Payment gateway
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('linepay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeGatewayModal, setActiveGatewayModal] = useState<'none' | 'ecpay_credit' | 'ecpay_atm' | 'ecpay_cvs' | 'linepay'>('none');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // ECPay simulated card state
  const [ecpayCardNum, setEcpayCardNum] = useState('4000 2211 4488 9922');
  const [ecpayCardExp, setEcpayCardExp] = useState('08/29');
  const [ecpayCardCvv, setEcpayCardCvv] = useState('888');
  const [ecpayOtp, setEcpayOtp] = useState('');
  const [ecpayStep, setEcpayStep] = useState<'card_input' | 'otp_verify'>('card_input');

  // LINE Pay simulated state
  const [linePointsDeduct, setLinePointsDeduct] = useState(50);

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 999 ? 0 : 60;
  const discount = 0;
  const total = Math.max(0, subtotal + shippingFee - pointsToUse - discount);
  const pointsEarned = Math.floor(total / 10);

  // Update default address preview when shipping method changes
  const handleShippingMethodChange = (m: ShippingMethod) => {
    setShippingMethod(m);
    if (m === '7-11') {
      setShippingAddress('7-ELEVEN 科技門市 (店號: 991823 / 台北市南港區重陽路120號)');
    } else if (m === 'familymart') {
      setShippingAddress('全家便利商店 鑫德門市 (店號: 014299 / 新北市板橋區縣民大道二段)');
    } else if (m === 'blackcat') {
      setShippingAddress('台北市南港區園區街3號12樓 (國泰金融大樓 3D印研處)');
    }
  };

  // Launch simulated payment gateway
  const handleStartPayment = async () => {
    setIsProcessing(true);
    // Call server to generate simulated payment payload
    try {
      if (paymentGateway.startsWith('ecpay')) {
        await fetch('/api/payments/ecpay/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            paymentMethod: paymentGateway === 'ecpay_atm' ? 'atm' : paymentGateway === 'ecpay_cvs' ? 'cvs' : 'credit',
            itemName: cartItems[0]?.product.name || '3D 列印耗材'
          })
        });

        if (paymentGateway === 'ecpay_credit') {
          setActiveGatewayModal('ecpay_credit');
          setEcpayStep('card_input');
        } else if (paymentGateway === 'ecpay_atm') {
          setActiveGatewayModal('ecpay_atm');
        } else if (paymentGateway === 'ecpay_cvs') {
          setActiveGatewayModal('ecpay_cvs');
        }
      } else if (paymentGateway === 'linepay') {
        await fetch('/api/payments/linepay/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            linePointsUsed: linePointsDeduct,
            currency: 'TWD'
          })
        });
        setActiveGatewayModal('linepay');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete Order
  const finalizeOrder = () => {
    const randomTrack = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const orderNum = `TW${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNum = `TW-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toLocaleString('zh-TW', { hour12: false }).slice(0, 16),
      customerName,
      customerEmail,
      customerPhone,
      shippingMethod,
      storeOrAddress: shippingAddress,
      items: cartItems.map((c) => ({
        productId: c.product.id,
        name: c.product.name,
        colorName: c.selectedColor.name,
        colorHex: c.selectedColor.hex,
        price: c.product.price,
        quantity: c.quantity,
      })),
      subtotal,
      shippingFee,
      discount,
      pointsDeduction: pointsToUse,
      pointsEarned,
      total,
      paymentGateway,
      paymentStatus: 'paid',
      orderStatus: 'picking',
      trackingNumber: randomTrack,
      invoiceNumber: invoiceNum,
      invoiceType,
      invoiceCarrierValue,
    };

    setCreatedOrder(newOrder);
    setActiveGatewayModal('none');
    onOrderCompleted(newOrder);

    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                {createdOrder ? '🎉 訂單支付成功與電子憑證' : t.checkoutTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">綠界科技金流 ECPay & LINE Pay 官方特店連線加密</p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order is Created Success View */}
        {createdOrder ? (
          <div className="p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                綠界 / LINE Pay 交易授權成功 (交易序號: LP-{createdOrder.id.slice(-8)})
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                感謝您的訂購，包裹準備出貨中！
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                訂單編號：<span className="font-mono font-bold text-slate-800">{createdOrder.orderNumber}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full max-w-lg bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">配送方式</span>
                <span className="font-bold text-slate-800">
                  {createdOrder.shippingMethod === '7-11' ? '7-ELEVEN 交貨便' : createdOrder.shippingMethod === 'familymart' ? '全家店到店' : '黑貓宅急便'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">收件門市 / 地址</span>
                <span className="font-medium text-slate-800 text-right max-w-[280px] truncate">
                  {createdOrder.storeOrAddress}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">即時物流託運號</span>
                <span className="font-mono font-bold text-indigo-600">
                  {createdOrder.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">雲端發票號碼</span>
                <span className="font-mono text-slate-800">{createdOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>實付金額</span>
                <span className="font-mono text-indigo-600 text-base">
                  {formatPrice(createdOrder.total, currency)}
                </span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/70 text-amber-800 text-[11px] flex items-center justify-between">
                <span>本次消費獲得會員積分回饋：</span>
                <span className="font-bold font-mono text-amber-900">+{createdOrder.pointsEarned} pt</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
              <button
                id="track-order-live-btn"
                onClick={() => {
                  onClose();
                  onOpenTracking(createdOrder.trackingNumber);
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>立即查看即時物流追蹤進度</span>
              </button>
              <button
                onClick={onClose}
                className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                繼續選購
              </button>
            </div>
          </div>
        ) : (
          /* Normal Checkout Form */
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Shipping Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  選擇物流取件方式
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('7-11')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === '7-11'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700">7-ELEVEN</span>
                      {shippingMethod === '7-11' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">交貨便 (免運滿額)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('familymart')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'familymart'
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700">全家店到店</span>
                      {shippingMethod === 'familymart' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">FamiPort 取件</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShippingMethodChange('blackcat')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      shippingMethod === 'blackcat'
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-800">黑貓宅急便</span>
                      {shippingMethod === 'blackcat' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">宅配專車到府</span>
                  </button>
                </div>

                {/* Recipient & Address Fields */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">收件人姓名</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">手機號碼 (接收取件簡訊)</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">電子信箱 (寄送訂單與電子發票)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      {shippingMethod === 'blackcat' ? '宅配收件地址' : '超商取件門市名稱與代號'}
                    </label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Gateway Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  選擇金流支付方式 (綠界科技 ECPay & LINE Pay)
                </h3>

                <div className="space-y-2">
                  {/* LINE Pay */}
                  <label 
                    onClick={() => setPaymentGateway('linepay')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentGateway === 'linepay'
                        ? 'border-[#06C755] bg-[#06C755]/5 ring-2 ring-[#06C755]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#06C755] text-white flex items-center justify-center font-black text-sm">
                        LINE
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>LINE Pay 一鍵快速支付</span>
                          <span className="bg-[#06C755]/10 text-[#06C755] text-[10px] font-bold px-2 py-0.5 rounded">
                            支援 LINE Points 折抵
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">手機一鍵開啟 App 授權 / 電腦掃描 QR Code 付款</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentGateway === 'linepay' ? 'border-[#06C755] bg-[#06C755]' : 'border-slate-300'
                    }`}>
                      {paymentGateway === 'linepay' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* ECPay Credit Card */}
                  <label 
                    onClick={() => setPaymentGateway('ecpay_credit')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentGateway === 'ecpay_credit'
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>綠界科技 ECPay 信用卡線上刷卡</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            3D OTP 驗證
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">支援 Visa / MasterCard / JCB / 銀聯卡</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentGateway === 'ecpay_credit' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentGateway === 'ecpay_credit' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* ECPay ATM */}
                  <label 
                    onClick={() => setPaymentGateway('ecpay_atm')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentGateway === 'ecpay_atm'
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          綠界 ATM 虛擬轉帳帳號 (自動對帳銷帳)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">取得專屬台灣銀行/國泰世華虛擬帳號，手機網銀轉帳即時入帳</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentGateway === 'ecpay_atm' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentGateway === 'ecpay_atm' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>

                  {/* ECPay CVS Code */}
                  <label 
                    onClick={() => setPaymentGateway('ecpay_cvs')}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentGateway === 'ecpay_cvs'
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          綠界超商代碼繳費 (7-11 ibon / 全家 FamiPort)
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">取得超商繳費代碼與手機條碼，超商櫃台直接現金結帳</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentGateway === 'ecpay_cvs' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {paymentGateway === 'ecpay_cvs' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </label>
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
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      invoiceType === 'mobile_barcode'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    手機條碼載具
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('cloud')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      invoiceType === 'cloud'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    會員載具 (自動對獎)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('tax_id')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      invoiceType === 'tax_id'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    公司三聯式統編
                  </button>
                </div>

                {invoiceType === 'mobile_barcode' && (
                  <input
                    type="text"
                    placeholder="/AB8892."
                    value={invoiceCarrierValue}
                    onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                )}
                {invoiceType === 'tax_id' && (
                  <input
                    type="text"
                    placeholder="輸入 8 碼統一編號 (例如: 88392014)"
                    value={invoiceCarrierValue}
                    onChange={(e) => setInvoiceCarrierValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Button */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col justify-between h-fit">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">{t.orderSummary}</h3>

                {/* Items preview list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 mb-4">
                  {cartItems.map((item) => (
                    <div 
                      key={`${item.product.id}-${item.selectedColor.name}`}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">
                          {item.product.name}
                        </span>
                        <span className="text-slate-400 font-mono">x{item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-slate-500">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{formatPrice(subtotal, currency)}</span>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>會員積分折抵</span>
                      <span className="font-mono">-{formatPrice(pointsToUse, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>物流運費</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      {shippingFee === 0 ? '超商/宅配免運 (滿額)' : 'NT$60'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>應付總額</span>
                    <span className="font-mono text-indigo-600 text-xl">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>

                {/* Loyalty Point Earn Notice */}
                <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs flex items-center justify-between">
                  <span>本次結帳將贈送：</span>
                  <span className="font-bold text-amber-800 font-mono">+{pointsEarned} pt 會員點數</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  id="start-payment-gateway-btn"
                  onClick={handleStartPayment}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-600 hover:to-blue-600 text-white font-bold text-sm shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>正在連線金流特店授權...</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {paymentGateway === 'linepay' ? '前往 LINE Pay 付款' : '前往綠界 ECPay 授權付款'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="text-[10px] text-center text-slate-400 mt-2">
                  點擊即同意神狗勾耗材商城條款與 ECPay 綠界特店安全防護規則
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* INTERACTIVE PAYMENT GATEWAY SIMULATORS                              */}
        {/* ------------------------------------------------------------------- */}

        {/* 1. ECPay Credit Card Modal */}
        {activeGatewayModal === 'ecpay_credit' && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-300 relative animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    綠界
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">綠界科技 ECPay 信用卡收單</h4>
                    <span className="text-[10px] text-slate-400">MerchantID: 3002607 (神狗勾 3D)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveGatewayModal('none')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {ecpayStep === 'card_input' ? (
                <div className="space-y-4 my-4">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex justify-between items-center">
                    <span>交易金額</span>
                    <span className="font-mono font-black text-base text-emerald-700">NT$ {total}</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">信用卡卡號</label>
                    <input
                      type="text"
                      value={ecpayCardNum}
                      onChange={(e) => setEcpayCardNum(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">有效期限 (MM/YY)</label>
                      <input
                        type="text"
                        value={ecpayCardExp}
                        onChange={(e) => setEcpayCardExp(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV 安全驗證碼</label>
                      <input
                        type="text"
                        value={ecpayCardCvv}
                        onChange={(e) => setEcpayCardCvv(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setEcpayStep('otp_verify')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                  >
                    送出並進行 3D Secure 簡訊驗證碼
                  </button>
                </div>
              ) : (
                <div className="space-y-4 my-4 text-center">
                  <p className="text-xs text-slate-600">
                    發卡銀行已發送 6 位數 3D 驗證碼至手機 <span className="font-mono font-bold text-slate-800">0988***456</span>
                  </p>
                  <input
                    type="text"
                    placeholder="請輸入 OTP 簡訊碼 (測試環境任填)"
                    value={ecpayOtp}
                    onChange={(e) => setEcpayOtp(e.target.value)}
                    className="w-full text-center tracking-widest px-4 py-2.5 border-2 border-emerald-500 rounded-xl font-mono text-base font-bold outline-none"
                  />
                  <button
                    onClick={finalizeOrder}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    確認付款 NT$ {total}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ECPay ATM Modal */}
        {activeGatewayModal === 'ecpay_atm' && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">綠界 ECPay 虛擬帳號 (ATM)</h4>
                <button onClick={() => setActiveGatewayModal('none')}>✕</button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">收款銀行</span>
                  <span className="font-bold text-slate-800">004 臺灣銀行 (營業部)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">繳費虛擬帳號</span>
                  <span className="font-mono font-black text-indigo-600 text-sm">9928-1002-8812-4019</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">應繳金額</span>
                  <span className="font-mono font-bold text-slate-900">NT$ {total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">繳費期限</span>
                  <span className="font-mono text-rose-500 font-bold">2026-09-09 23:59 前</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                提示：完成網銀轉帳後，綠界系統將即時通知倉庫開始備貨。
              </div>

              <button
                onClick={finalizeOrder}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                模擬已完成網銀轉帳，建立訂單
              </button>
            </div>
          </div>
        )}

        {/* 3. ECPay CVS Barcode Modal */}
        {activeGatewayModal === 'ecpay_cvs' && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300 relative animate-scale-up space-y-4 text-center">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-900">綠界超商代碼繳費單</h4>
                <button onClick={() => setActiveGatewayModal('none')}>✕</button>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs text-amber-800 font-bold">超商繳費代碼 (7-11 / 全家 / 萊爾富)</span>
                <div className="text-2xl font-mono font-black text-slate-900 tracking-wider">
                  CVS88291048
                </div>
                <p className="text-[11px] text-slate-500">請至超商多媒體機台 (ibon / FamiPort) 列印繳費小白單至櫃台結帳</p>
              </div>

              <button
                onClick={finalizeOrder}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                模擬已在超商門市繳納成功，建立訂單
              </button>
            </div>
          </div>
        )}

        {/* 4. LINE Pay Modal */}
        {activeGatewayModal === 'linepay' && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#06C755] relative animate-scale-up space-y-4 text-center">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#06C755] text-white flex items-center justify-center font-bold text-xs">
                    LINE
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">LINE Pay 行動支付授權</span>
                </div>
                <button onClick={() => setActiveGatewayModal('none')}>✕</button>
              </div>

              <div className="p-4 bg-[#06C755]/5 rounded-2xl border border-[#06C755]/20 flex flex-col items-center">
                <div className="w-36 h-36 bg-white p-2 rounded-2xl border-2 border-[#06C755] shadow-xs flex items-center justify-center my-2">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <span className="text-xs text-slate-600 font-medium mt-1">使用手機 LINE 掃描 QR Code 授權結帳</span>
              </div>

              <div className="space-y-2 text-xs text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">交易特店</span>
                  <span className="font-bold text-slate-800">神狗勾 3D 列印官方旗艦館</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">訂單金額</span>
                  <span className="font-mono">NT$ {total}</span>
                </div>
                <div className="flex justify-between text-[#06C755] font-bold">
                  <span>LINE Points 點數回饋 (週末 10%)</span>
                  <span>+{Math.floor(total * 0.1)} 點</span>
                </div>
              </div>

              <button
                id="line-pay-confirm-btn"
                onClick={finalizeOrder}
                className="w-full py-3.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold shadow-lg shadow-[#06C755]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>確認在 LINE Pay 授權付款 NT$ {total}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
