import { CHECKOUT_CVS_FREE_THRESHOLD, checkoutPointLimit, checkoutShippingFee } from '../../utils/checkoutDetails';
import { cartStockRemaining } from '../../utils/cartStock';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Heart,
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
  ChevronUp,
  Check
} from 'lucide-react';
import { CartItem, ColorOption, CurrencyCode, LanguageCode, MemberProfile, FilamentProduct } from '../../types';
import { formatPrice, translations, translateProduct, translateColorName } from '../../utils/i18n';
import { ProductPhoto } from './ProductPhoto';
import { validateCoupon } from '../../utils/couponManager';
import { isMemberVipActive } from '../../lib/customerPersistence';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  catalog: Map<string, FilamentProduct>;
  unavailableLines: boolean[];
  onUpdateColor?: (index: number, newColor: ColorOption) => boolean;
  onRemoveItem: (index: number) => void;
  wishlistedIds: ReadonlySet<string>;
  onSaveToWishlist: (id: string) => void;
  onProceedCheckout: (pointsUsed: number, couponCode?: string) => void;
  onClearCart?: () => void;
  onAddQuickItem?: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  currency: CurrencyCode;
  lang: LanguageCode;
  member: MemberProfile;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateColor,
  catalog,
  unavailableLines,
  onRemoveItem,
  wishlistedIds,
  onSaveToWishlist,
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; freeShipping: boolean; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [editingColorItemIdx, setEditingColorItemIdx] = useState<number | null>(null);

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isVip = isMemberVipActive(member);
  const hasUnavailableItems = unavailableLines.some(Boolean);
  const vipDiscount = isVip ? Math.floor(rawSubtotal * 0.03) : 0;
  const subtotal = rawSubtotal - vipDiscount; // actual subtotal after VIP discount

  const hasFreeShippingItem = cartItems.length > 0 && cartItems.every(i => i.product.customShippingFee === 0);
  const shippingFee = checkoutShippingFee('UNIMARTC2C', subtotal, hasFreeShippingItem || Boolean(appliedCoupon?.freeShipping));
  const needForFreeShipping = shippingFee === 0 ? 0 : Math.max(0, CHECKOUT_CVS_FREE_THRESHOLD - subtotal);
  const freeShippingProgress = shippingFee === 0 ? 100 : Math.min(99, Math.floor(subtotal / CHECKOUT_CVS_FREE_THRESHOLD * 100));
  const shippingProgressLabel = lang === 'en' ? 'Free pickup shipping progress' : lang === 'ja' ? 'コンビニ受取の送料無料まで' : '超商取貨免運進度';

  // Points redemption logic: 1 point = NT$1 off, up to member's points or 10% of subtotal
  const maxRedeemablePoints = checkoutPointLimit(member?.points, subtotal);
  const [usePoints, setUsePoints] = useState(false);
  const pointsUsed = usePoints ? maxRedeemablePoints : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - pointsUsed - couponDiscount);
  const totalSavings = vipDiscount + pointsUsed + couponDiscount;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    const res = validateCoupon(code, subtotal, isVip, member?.coupons || []);
    if (res.isValid && res.coupon) {
      setAppliedCoupon({
        code,
        discount: res.discountAmount,
        freeShipping: res.freeShipping,
        label: res.label,
      });
      setCouponCode(code);
      const parts: string[] = [];
      if (res.discountAmount > 0) parts.push(`折抵 NT$${res.discountAmount}`);
      if (res.freeShipping) parts.push('免運費');
      setCouponMsg(`已套用「${code}」${parts.length > 0 ? `（${parts.join(' + ')}）` : ''}`);
    } else {
      setAppliedCoupon(null);
      setCouponMsg(res.errorMessage || '此折扣碼無效或尚未達使用門檻');
    }
  };

  // Re-validate applied coupon whenever cart subtotal, VIP status, or item count changes
  useEffect(() => {
    if (!appliedCoupon) return;
    if (cartItems.length === 0) {
      setAppliedCoupon(null);
      setCouponMsg('');
      return;
    }
    const res = validateCoupon(appliedCoupon.code, subtotal, isVip, member?.coupons || []);
    if (!res.isValid || !res.coupon) {
      setAppliedCoupon(null);
      setCouponMsg(res.errorMessage || `商品金額變動，已自動取消「${appliedCoupon.code}」（未達使用門檻）`);
    } else if (
      res.discountAmount !== appliedCoupon.discount ||
      res.freeShipping !== appliedCoupon.freeShipping
    ) {
      setAppliedCoupon({
        code: appliedCoupon.code,
        discount: res.discountAmount,
        freeShipping: res.freeShipping,
        label: res.label,
      });
      const parts: string[] = [];
      if (res.discountAmount > 0) parts.push(`折抵 NT$${res.discountAmount}`);
      if (res.freeShipping) parts.push('免運費');
      setCouponMsg(`已套用「${appliedCoupon.code}」${parts.length > 0 ? `（${parts.join(' + ')}）` : ''}`);
    }
  }, [subtotal, isVip, cartItems.length, member?.coupons, appliedCoupon]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const colorCloseButtonRef = useRef<HTMLButtonElement>(null);
  const colorTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected && document.activeElement === document.body) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  const closeColorPicker = () => {
    setEditingColorItemIdx(null);
    if (colorTriggerRef.current?.isConnected) colorTriggerRef.current.focus({ preventScroll: true });
    else closeButtonRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (editingColorItemIdx !== null) colorCloseButtonRef.current?.focus({ preventScroll: true });
  }, [editingColorItemIdx]);

  const quickAddOns = useMemo(() => {
    if (!isOpen || !onAddQuickItem || needForFreeShipping === 0 || cartItems.length === 0) return [];
    return Array.from(catalog.values())
      .filter(product => product.material === 'Accessories' && product.price > 0)
      .flatMap(product => {
        const color = product.colors?.find(option => cartStockRemaining(cartItems, product, option) > 0);
        return color ? [{ product, color }] : [];
      })
      .sort((a, b) => Math.abs(a.product.price - needForFreeShipping) - Math.abs(b.product.price - needForFreeShipping))
      .slice(0, 3);
  }, [isOpen, onAddQuickItem, needForFreeShipping, catalog, cartItems]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[85] store-panel-backdrop overflow-hidden bg-slate-950/65 flex justify-end cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可關閉購物車"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-cart-heading"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            if (editingColorItemIdx !== null) closeColorPicker();
            else onClose();
          }
          if (event.key === 'Tab') {
            const panel = event.currentTarget.querySelector('[data-cart-color-picker]') ?? event.currentTarget;
            const buttons = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), a[href]')]
              .filter(control => control.getClientRects().length > 0);
            const first = buttons[0];
            const last = buttons.at(-1);
            if (event.shiftKey && event.target === first && last) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && event.target === last && first) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
        className="relative w-full max-w-md bg-white h-[100dvh] max-h-screen shadow-2xl flex flex-col justify-between store-cart-panel cursor-default select-text overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Slim & Crisp) */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="store-cart-heading" className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{t.cart}</h2>
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
              ref={closeButtonRef}
              id="close-cart-drawer-btn"
              onClick={onClose}
              className="w-11 h-11 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={lang === 'en' ? 'Close' : lang === 'ja' ? '閉じる' : '關閉'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator (Compact bar) */}
        {cartItems.length > 0 && <div className="px-3.5 py-2 bg-indigo-50/60 border-b border-indigo-100 shrink-0">
          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold mb-1">
            <div className="flex items-center gap-1.5 text-indigo-950">
              <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                {needForFreeShipping === 0
                  ? (lang === 'en' ? 'Free shipping for store pickup' : lang === 'ja' ? 'コンビニ受取は送料無料' : '超商取貨已享免運')
                  : (lang === 'en' ? `Add ${formatPrice(needForFreeShipping, currency)} for free store pickup shipping` : lang === 'ja' ? `あと ${formatPrice(needForFreeShipping, currency)} でコンビニ受取送料無料` : `再加購 ${formatPrice(needForFreeShipping, currency)} 享超商取貨免運`)}
              </span>
            </div>
            <span className="text-indigo-600 font-mono font-bold shrink-0">{freeShippingProgress}%</span>
          </div>
          <div role="progressbar" aria-label={shippingProgressLabel} aria-valuenow={freeShippingProgress} className="w-full bg-indigo-200/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>}

        {/* Scrollable Body: Contains Cart Items + Booster Accessories + Coupons/Discounts */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5 touch-pan-y">
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
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 overflow-hidden shrink-0">
                      <ProductPhoto url={item.product.imageUrl} name={item.product.name} material={item.product.material} alt={item.product.name} className="h-full w-full" imageClassName="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs text-balance line-clamp-2 leading-snug">
                          {translateProduct(item.product, lang).name.replace(/莫蘭迪\s*/g, '')}
                        </h4>
                        {unavailableLines[idx] && (
                          <p className="mt-1 text-[11px] font-medium text-rose-700">
                            {lang === 'en' ? 'Adjust the quantity or choose another color.' : lang === 'ja' ? '数量またはカラーを変更してください。' : '請調整數量或顏色，已下架商品可移除。'}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                          {item.product.colors && item.product.colors.length > 1 && onUpdateColor ? (
                            <button
                              type="button"
                              onClick={event => {
                                colorTriggerRef.current = event.currentTarget;
                                setEditingColorItemIdx(idx);
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer"
                              title={lang === 'en' ? 'Click to change color' : lang === 'ja' ? 'クリックして色を変更' : '點擊更換此商品顏色'}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <span className="truncate max-w-[120px]">
                                {translateColorName(item.selectedColor.name, lang)}
                              </span>
                              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] text-slate-600">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <span className="truncate max-w-[130px]">
                                {translateColorName(item.selectedColor.name, lang)}
                              </span>
                            </div>
                          )}
                          {item.product.material !== 'Accessories' && item.product.material !== 'Resin' && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.selectedDiameter}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1 mt-2">
                        {(() => {
                          const maxStock = unavailableLines[idx] ? item.quantity : cartStockRemaining(cartItems, item.product, item.selectedColor, idx);
                          const atStockCap = item.quantity >= maxStock;
                          return (
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                aria-label={lang === 'zh-TW' ? '減少數量' : lang === 'ja' ? '数量を減らす' : 'Decrease quantity'}
                                disabled={item.quantity <= 1}
                                onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                                className="min-w-9 min-h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={atStockCap}
                                onClick={() => onUpdateQuantity(idx, Math.min(maxStock, item.quantity + 1))}
                                aria-label={lang === 'zh-TW' ? '增加數量' : lang === 'ja' ? '数量を増やす' : 'Increase quantity'}
                                title={atStockCap ? `已達現貨上限 (${maxStock})` : '增加數量'}
                                className="min-w-9 min-h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {formatPrice(item.product.price * item.quantity, currency)}
                          </span>
                          <button
                            type="button"
                            disabled={wishlistedIds.has(item.product.id)}
                            onClick={() => onSaveToWishlist(item.product.id)}
                            aria-label={lang === 'en' ? 'Save to wishlist' : lang === 'ja' ? 'お気に入りに追加' : '加入收藏'}
                            title={wishlistedIds.has(item.product.id) ? (lang === 'en' ? 'Saved' : lang === 'ja' ? '登録済み' : '已收藏') : (lang === 'en' ? 'Save to wishlist' : lang === 'ja' ? 'お気に入りに追加' : '加入收藏')}
                            className="flex h-10 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:text-rose-600"
                          >
                            <Heart className={`size-4 ${wishlistedIds.has(item.product.id) ? 'fill-current' : ''}`} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            className="w-9 h-10 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
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
              {needForFreeShipping > 0 && quickAddOns.length > 0 && onAddQuickItem && (
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
                    {quickAddOns.map(({ product, color }) => (
                      <div 
                        key={product.id}
                        className="p-2 bg-white rounded-xl border border-indigo-100 flex items-center justify-between gap-2 text-xs shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] break-words">{translateProduct(product, lang).name}</p>
                          <span className="text-[10px] font-mono font-bold text-indigo-600">
                            {formatPrice(product.price, currency)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddQuickItem(product, color, product.diameter, 1)}
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
                      onChange={event => setCouponCode(event.target.value)}
                      onKeyDown={event => {
                        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="min-w-0 flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none font-mono uppercase focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'en' ? 'Apply' : lang === 'ja' ? '適用' : '套用'}
                    </button>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-slate-500">
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
                    {Array.isArray(member?.coupons) && member.coupons.filter((mc: any) => mc?.code).map((mc: any) => (
                      <button
                        key={mc.id || mc.code}
                        type="button"
                        onClick={() => {
                          setCouponCode(mc.code);
                          handleApplyCoupon(mc.code);
                        }}
                        className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded font-mono font-bold cursor-pointer transition-colors"
                      >
                        {mc.code}
                      </button>
                    ))}
                  </div>
                  {couponMsg && (
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[10px] font-medium ${appliedCoupon ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {couponMsg}
                      </p>
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode('');
                            setCouponMsg('');
                          }}
                          className="text-[10px] text-slate-400 hover:text-rose-600 underline cursor-pointer shrink-0"
                        >
                          移除
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* VIP Discount Banner */}
                {isVip && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {lang === 'en' ? 'VIP Member 3% Off' : lang === 'ja' ? 'VIP会員 3% OFF' : 'VIP 訂閱會員專屬 97 折'}
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
                      <span>{lang === 'en' ? 'VIP 3% Discount' : lang === 'ja' ? 'VIP 3% 割引' : 'VIP 97 折優惠'}</span>
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
                      {shippingFee === 0 ? (lang === 'en' ? 'Free Shipping $0' : lang === 'ja' ? '送料無料 $0' : '全館免運 NT$0') : formatPrice(shippingFee, currency)}
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
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-slate-200 bg-white shadow-lg shrink-0 space-y-2">
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
                    {shippingFee === 0 ? (lang === 'en' ? 'Free Shipping' : lang === 'ja' ? '送料無料' : '免運費') : (lang === 'en' ? `Incl. pickup shipping ${formatPrice(shippingFee, currency)}` : lang === 'ja' ? `コンビニ送料込 ${formatPrice(shippingFee, currency)}` : `含超商取貨運費 ${formatPrice(shippingFee, currency)}`)}
                  </span>
                </div>
              </div>

              <button
                id="proceed-to-checkout-btn"
                disabled={hasUnavailableItems}
                onClick={() => {
                  onClose();
                  onProceedCheckout(pointsUsed, appliedCoupon?.code);
                }}
                className="btn-tactile-primary store-action flex-1 max-w-[210px] py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{lang === 'en' ? 'Checkout' : lang === 'ja' ? 'ご購入手続き' : '前往結帳'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Minimal trust badge line */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span>NewebPay 藍新 256-bit</span>
              <span>•</span>
              <span>{lang === 'en' ? 'Cards / Apple Pay / ATM' : lang === 'ja' ? 'カード・Apple Pay・ATM' : '信用卡 / Apple Pay / ATM'}</span>
              <span>•</span>
              <span>{lang === 'en' ? 'E-Invoice' : lang === 'ja' ? '電子領収書' : '電子發票'}</span>
            </div>
          </div>
        )}

        {/* 購物車內：從下往上彈出的更換顏色小視窗 (Bottom Sheet) */}
        {editingColorItemIdx !== null && cartItems[editingColorItemIdx] && (
          <div
            className="absolute inset-0 z-[90] bg-slate-950/60 flex items-end justify-center animate-fade-in"
            onClick={closeColorPicker}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-color-heading"
              data-cart-color-picker
              className="w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[65%] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 shrink-0" />
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div id="cart-color-heading" className="text-xs font-black text-slate-900">
                    {lang === 'en' ? 'Switch Color Option' : lang === 'ja' ? '商品のカラー変更' : '更換商品顏色規格'}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {translateProduct(cartItems[editingColorItemIdx].product, lang).name.replace(/莫蘭迪\s*/g, '')}
                  </p>
                </div>
                <button
                  ref={colorCloseButtonRef}
                  type="button"
                  aria-label={lang === 'en' ? 'Close color picker' : lang === 'ja' ? 'カラー選択を閉じる' : '關閉顏色選擇'}
                  onClick={closeColorPicker}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2">
                {(cartItems[editingColorItemIdx].product.colors || []).map((colorOption) => {
                  const isCurrent = cartItems[editingColorItemIdx].selectedColor.name === colorOption.name;
                  const item = cartItems[editingColorItemIdx];
                  const available = item.quantity <= cartStockRemaining(cartItems, item.product, colorOption, editingColorItemIdx);
                  const cleanColorLabel = translateColorName(colorOption.name, lang);
                  return (
                    <button
                      key={colorOption.name}
                      type="button"
                      aria-pressed={isCurrent}
                      disabled={!available && !isCurrent}
                      onClick={() => {
                        if (isCurrent || onUpdateColor?.(editingColorItemIdx, colorOption)) closeColorPicker();
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: colorOption.hex }}
                      />
                      <span className="text-xs font-bold min-w-0 flex-1 break-words">
                        {cleanColorLabel}
                        {!available && !isCurrent && (
                          <small className="block font-medium">
                            {lang === 'en' ? 'Not enough stock' : lang === 'ja' ? '在庫不足' : '庫存不足'}
                          </small>
                        )}
                      </span>
                      {isCurrent && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
