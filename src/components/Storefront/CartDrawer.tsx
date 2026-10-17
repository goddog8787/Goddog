import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  Tag, 
  Coins, 
  Package, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CartItem, CurrencyCode, LanguageCode, MemberProfile } from '../../types';
import { formatPrice, translations, translateProductName, translateColorName } from '../../utils/i18n';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedCheckout: (pointsUsed: number) => void;
  onClearCart?: () => void;
  onAddQuickItem?: (product: any, color: any, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  currency: CurrencyCode;
  lang: LanguageCode;
  member: MemberProfile;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  onClearCart,
  onAddQuickItem,
  currency,
  lang,
  member,
}) => {
  const t = translations[lang];

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isVip = member?.subscriptionPlan && member.subscriptionPlan !== 'None';
  const vipDiscount = isVip ? Math.floor(rawSubtotal * 0.05) : 0;
  const subtotal = rawSubtotal - vipDiscount; // actual subtotal after VIP discount
  const freeShippingThreshold = 999;

  const hasFreeShippingItem = cartItems.length > 0 && cartItems.every(i => i.product.customShippingFee === 0);
  const isFreeShipping = subtotal >= freeShippingThreshold || hasFreeShippingItem;
  const needForFreeShipping = isFreeShipping ? 0 : Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = isFreeShipping ? 100 : Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Points redemption logic: 1 point = NT$1 off, up to member's points or 20% of subtotal
  const maxRedeemablePoints = Math.min((member?.points || 0), Math.floor(subtotal * 0.2));
  const [usePoints, setUsePoints] = useState(false);
  const pointsUsed = usePoints ? maxRedeemablePoints : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = isFreeShipping || (appliedCoupon && appliedCoupon.code === 'FREE99') ? 0 : 60;
  const finalTotal = Math.max(0, subtotal - pointsUsed - couponDiscount) + shippingFee;
  const totalSavings = vipDiscount + pointsUsed + couponDiscount;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    if (code === 'GODDOG') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount: disc, label: '神狗勾 9 折專屬優惠' });
      setCouponMsg('已套用 9 折！');
    } else if (code === 'MAKER100') {
      setAppliedCoupon({ code, discount: 100, label: '創客折抵 NT$100' });
      setCouponMsg('已折抵 NT$100！');
    } else if (code === 'FREE99') {
      setAppliedCoupon({ code, discount: 0, label: '全館超商免運優惠' });
      setCouponMsg('已套用超商免運！');
    } else {
      setCouponMsg('此折扣碼無效或已過期');
    }
  };

  // Quick booster sample accessories for free shipping threshold
  const quickAddOns = [
    {
      id: 'quick-sample-pla',
      name: 'High-Speed PLA 隨機試色體驗包 (50g)',
      price: 69,
      color: { name: '隨機精選', hex: '#6366f1' },
      diameter: '1.75mm' as const,
    },
    {
      id: 'quick-desiccant-5',
      name: '長效變色矽膠除濕防潮包 (50g x 5入)',
      price: 89,
      color: { name: '深藍變粉', hex: '#3b82f6' },
      diameter: '1.75mm' as const,
    },
    {
      id: 'quick-nozzle-set',
      name: '抗磨耐熱硬化鋼噴嘴 (0.4mm 備用)',
      price: 149,
      color: { name: '硬化鋼金屬', hex: '#64748b' },
      diameter: '1.75mm' as const,
    }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可關閉購物車"
    >
      <div 
        className="w-full max-w-md bg-white h-[100dvh] max-h-screen shadow-2xl flex flex-col justify-between animate-slide-in-right cursor-default select-text overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Slim & Crisp) */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{t.cart}</h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'en' ? `Total ${cartItems.reduce((acc, i) => acc + i.quantity, 0)} items` : lang === 'ja' ? `合計 ${cartItems.reduce((acc, i) => acc + i.quantity, 0)} 点` : `共 ${cartItems.reduce((acc, i) => acc + i.quantity, 0)} 件商品`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {cartItems.length > 0 && onClearCart && (
              showClearConfirm ? (
                <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-1.5 py-0.5">
                  <span className="text-[10px] text-rose-600 font-bold">
                    {lang === 'en' ? 'Clear?' : lang === 'ja' ? '空にする?' : '清空?'}
                  </span>
                  <button
                    onClick={() => {
                      onClearCart();
                      setShowClearConfirm(false);
                    }}
                    className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    {lang === 'en' ? 'Yes' : lang === 'ja' ? 'はい' : '是'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-1 py-0.5 text-slate-500 text-[10px] hover:text-slate-700 cursor-pointer"
                  >
                    {lang === 'en' ? 'No' : lang === 'ja' ? 'いいえ' : '否'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title={lang === 'en' ? 'Clear cart' : lang === 'ja' ? 'カートを空にする' : '一鍵清空購物車所有商品'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Clear' : lang === 'ja' ? '空にする' : '清空'}</span>
                </button>
              )
            )}
            <button
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title={lang === 'en' ? 'Close' : lang === 'ja' ? '閉じる' : '關閉'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator (Compact bar) */}
        <div className="px-3.5 py-2 bg-indigo-50/60 border-b border-indigo-100 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <div className="flex items-center gap-1.5 text-indigo-950 truncate">
              <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">
                {needForFreeShipping === 0
                  ? (lang === 'en' ? '🎉 Congratulations! You qualify for Free Shipping!' : lang === 'ja' ? '🎉 送料無料対象です！' : '🎉 恭喜！您已達超商/宅配免運門檻！')
                  : (lang === 'en' ? `Add ${formatPrice(needForFreeShipping, currency)} for Free Shipping` : lang === 'ja' ? `あと ${formatPrice(needForFreeShipping, currency)} で送料無料` : `再加購 ${formatPrice(needForFreeShipping, currency)} 享全台免運`)}
              </span>
            </div>
            <span className="text-indigo-600 font-mono font-bold shrink-0">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-indigo-200/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Scrollable Body: Contains Cart Items + Booster Accessories + Coupons/Discounts */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3.5 touch-pan-y">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-700 text-sm">
                {lang === 'en' ? 'Your cart is currently empty' : lang === 'ja' ? 'カートに商品がありません' : '購物車目前是空的'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                {lang === 'en' ? 'Explore high-speed filaments and maker accessories!' : lang === 'ja' ? 'お気に入りの高速フィラメントやパーツを探してみましょう！' : '快去挑選喜愛的 High-Speed 高速耗材或配件吧！'}
              </p>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className="space-y-2.5">
                {cartItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor.name}-${item.selectedDiameter}`}
                    className="p-3 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/90 shadow-2xs flex gap-3 transition-colors"
                  >
                    {item.product.imageUrl && item.product.imageUrl.trim() !== '' ? (
                      <img
                        src={getSafeProductImageUrl(item.product.imageUrl, item.product.material, item.product.name)}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200/80 shrink-0 bg-white"
                        onError={(e) => handleProductImageError(e, item.product.material, item.product.name)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-7 h-7" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs truncate leading-snug">
                          {translateProductName(item.product.name, lang, item.product.brand, item.product.material, item.product.weight)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" 
                            style={{ backgroundColor: item.selectedColor.hex }} 
                          />
                          <span className="text-[11px] text-slate-500 truncate">
                            {translateColorName(item.selectedColor.name, lang)} · {item.selectedDiameter}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {formatPrice(item.product.price * item.quantity, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            className="w-6 h-6 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                            title={lang === 'en' ? 'Remove item' : lang === 'ja' ? '商品を削除' : '移除商品'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Free Shipping Add-on Recommendation */}
              {needForFreeShipping > 0 && onAddQuickItem && (
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {lang === 'en' ? 'Booster Add-ons for Free Shipping:' : lang === 'ja' ? '送料無料あわせ買いおすすめ品：' : '快速湊免運推薦小品：'}
                    </span>
                    <span className="text-indigo-600 font-mono">
                      {lang === 'en' ? `${formatPrice(needForFreeShipping, currency)} away` : lang === 'ja' ? `あと ${formatPrice(needForFreeShipping, currency)}` : `差 ${formatPrice(needForFreeShipping, currency)}`}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {quickAddOns.map(addon => (
                      <div 
                        key={addon.id}
                        className="p-2 bg-white rounded-xl border border-indigo-100 flex items-center justify-between gap-2 text-xs shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{addon.name}</p>
                          <span className="text-[10px] font-mono font-bold text-indigo-600">
                            {formatPrice(addon.price, currency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const addonProduct = {
                              id: addon.id,
                              name: addon.name,
                              price: addon.price,
                              originalPrice: addon.price + 50,
                              material: 'Accessories',
                              inStock: true,
                              stockQuantity: 99,
                              imageUrl: '',
                              colors: [addon.color],
                              diameters: [addon.diameter],
                              spoolWeight: '50g',
                              netWeight: '50g',
                              rating: 5.0,
                              reviewCount: 0,
                              features: ['便攜防潮', '即開即印'],
                              customShippingFee: 0,
                              description: '快速湊單高 CP 值優質周邊',
                            };
                            onAddQuickItem(addonProduct, addon.color, addon.diameter, 1);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-0.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{lang === 'en' ? 'Add' : lang === 'ja' ? '追加' : '加入湊單'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discounts & Perks Section (Inside scroll area so it doesn't block the screen) */}
              <div className="pt-2 space-y-2.5 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Coupons & Membership Discounts' : lang === 'ja' ? 'クーポン・会員割引' : '優惠與會員折扣'}
                </span>

                {/* Promo Code Quick Apply */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'Enter promo code (e.g. GODDOG)' : lang === 'ja' ? 'クーポンコードを入力 (例: GODDOG)' : '輸入折扣碼 (例 GODDOG / MAKER100)'}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none font-mono uppercase focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'en' ? 'Apply' : lang === 'ja' ? '適用' : '套用'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>{lang === 'en' ? 'Popular: ' : lang === 'ja' ? '人気コード：' : '常用碼：'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode('GODDOG');
                        handleApplyCoupon('GODDOG');
                      }}
                      className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded font-mono font-bold cursor-pointer transition-colors"
                    >
                      GODDOG ({lang === 'en' ? '10% OFF' : lang === 'ja' ? '10% OFF' : '9折'})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode('MAKER100');
                        handleApplyCoupon('MAKER100');
                      }}
                      className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded font-mono font-bold cursor-pointer transition-colors"
                    >
                      MAKER100 (-$100)
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-[10px] font-medium ${appliedCoupon ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                {/* VIP Discount Banner */}
                {isVip && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {lang === 'en' ? 'VIP Member 5% Off' : lang === 'ja' ? 'VIP会員 5% OFF' : 'VIP 訂閱會員專屬 95 折'}
                    </span>
                    <span className="font-mono font-bold text-indigo-600">
                      -{formatPrice(vipDiscount, currency)}
                    </span>
                  </div>
                )}

                {/* Points Redemption Option */}
                {member && (member.points || 0) > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-900">
                          {lang === 'en' ? 'Redeem Points' : lang === 'ja' ? 'ポイント利用' : '折抵會員積分'}
                        </span>
                        <div className="text-[10px] text-amber-700">
                          {lang === 'en' ? `Available: ${member?.points || 0} pts (Up to NT$${maxRedeemablePoints})` : lang === 'ja' ? `保有: ${member?.points || 0} pt (最大 NT$${maxRedeemablePoints})` : `現有 ${member?.points || 0} 點 (最高可折 NT$${maxRedeemablePoints})`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsePoints(!usePoints)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        usePoints
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-200/60 text-amber-900 hover:bg-amber-300/60'
                      }`}
                    >
                      {usePoints ? (lang === 'en' ? 'Applied' : lang === 'ja' ? '適用中' : '已套用') : (lang === 'en' ? 'Apply' : lang === 'ja' ? '利用する' : '使用折抵')}
                    </button>
                  </div>
                )}

                {/* Detailed Breakdown Card inside scrollable area */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{formatPrice(rawSubtotal, currency)}</span>
                  </div>
                  {vipDiscount > 0 && (
                    <div className="flex justify-between text-indigo-600">
                      <span>{lang === 'en' ? 'VIP 5% Discount' : lang === 'ja' ? 'VIP 5% 割引' : 'VIP 95 折優惠'}</span>
                      <span className="font-mono">-{formatPrice(vipDiscount, currency)}</span>
                    </div>
                  )}
                  {appliedCoupon && appliedCoupon.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>{lang === 'en' ? `Coupon (${appliedCoupon.code})` : lang === 'ja' ? `クーポン (${appliedCoupon.code})` : `優惠代碼 (${appliedCoupon.code})`}</span>
                      <span className="font-mono">-{formatPrice(appliedCoupon.discount, currency)}</span>
                    </div>
                  )}
                  {usePoints && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{lang === 'en' ? `Points Redeemed (${pointsUsed} pts)` : lang === 'ja' ? `ポイント利用 (${pointsUsed} pt)` : `會員積分 (${pointsUsed} 點)`}</span>
                      <span className="font-mono">-{formatPrice(pointsUsed, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'en' ? 'Shipping' : lang === 'ja' ? '送料' : '物流運費'}</span>
                    <span className="font-mono font-medium text-emerald-600">
                      {shippingFee === 0 ? (lang === 'en' ? 'Free Shipping $0' : lang === 'ja' ? '送料無料 $0' : '全館免運 NT$0') : 'NT$60'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom spacing buffer so last element isn't touching edge */}
              <div className="h-4" />
            </>
          )}
        </div>

        {/* Compact Sticky Dock at Bottom (Takes < 95px on mobile, never blocking items!) */}
        {cartItems.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">
                    {lang === 'en' ? 'Total Payable:' : lang === 'ja' ? 'お支払い合計:' : '實付金額:'}
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-indigo-600 tracking-tight">
                    {formatPrice(finalTotal, currency)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {totalSavings > 0 && (
                    <span className="text-rose-500 font-medium mr-1.5">
                      {lang === 'en' ? `Saved ${formatPrice(totalSavings, currency)}` : lang === 'ja' ? `${formatPrice(totalSavings, currency)} お得` : `已省 ${formatPrice(totalSavings, currency)}`}
                    </span>
                  )}
                  <span>
                    {shippingFee === 0 ? (lang === 'en' ? 'Free Shipping' : lang === 'ja' ? '送料無料' : '免運費') : (lang === 'en' ? 'Incl. Shipping $60' : lang === 'ja' ? '送料込 $60' : '含運 NT$60')}
                  </span>
                </div>
              </div>

              <button
                id="proceed-to-checkout-btn"
                onClick={() => {
                  onClose();
                  onProceedCheckout(pointsUsed);
                }}
                className="flex-1 max-w-[210px] py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? 'Checkout' : lang === 'ja' ? 'ご購入手続き' : '前往結帳'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Minimal trust badge line */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span>NewebPay 藍新 256-bit</span>
              <span>•</span>
              <span>LINE Pay 直連</span>
              <span>•</span>
              <span>{lang === 'en' ? 'E-Invoice' : lang === 'ja' ? '電子領収書' : '電子發票'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
