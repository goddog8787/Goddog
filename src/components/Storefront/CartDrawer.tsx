import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Coins, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { CartItem, CurrencyCode, LanguageCode, MemberProfile } from '../../types';
import { formatPrice, translations } from '../../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedCheckout: (pointsUsed: number) => void;
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
  currency,
  lang,
  member,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const needForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Points redemption logic: 1 point = NT$1 off, up to member's points or 20% of subtotal
  const maxRedeemablePoints = Math.min(member.points, Math.floor(subtotal * 0.2));
  const [usePoints, setUsePoints] = useState(false);
  const pointsUsed = usePoints ? maxRedeemablePoints : 0;
  const total = Math.max(0, subtotal - pointsUsed);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">{t.cart}</h2>
              <p className="text-xs text-slate-500">共 {cartItems.reduce((acc, i) => acc + i.quantity, 0)} 件商品</p>
            </div>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <div className="flex items-center gap-1.5 text-indigo-900">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {needForFreeShipping === 0
                  ? '🎉 恭喜！您已達到超商/宅配免運門檻！'
                  : `再加購 ${formatPrice(needForFreeShipping, currency)} 即享全台免運！`}
              </span>
            </div>
            <span className="text-indigo-600 font-mono">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-indigo-200/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-600 text-sm">購物車目前是空的</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">快去挑選喜愛的 High-Speed 高速耗材或配件吧！</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedColor.name}-${item.selectedDiameter}`}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex gap-3 transition-colors"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs text-slate-900 truncate max-w-[170px]">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="移除商品"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Options tags */}
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block shrink-0" 
                      style={{ backgroundColor: item.selectedColor.hex }}
                    />
                    <span className="truncate max-w-[90px]">{item.selectedColor.name.split(' ')[0]}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600 font-semibold">{item.selectedDiameter}</span>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono font-extrabold text-sm text-slate-900">
                      {formatPrice(item.product.price * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Loyalty Points Redemption & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
            {/* Member Points Redemption Switch */}
            {member.points > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900">折抵會員積分</span>
                    <div className="text-[11px] text-amber-700">
                      現有 {member.points} 點 (最高可折 NT${maxRedeemablePoints})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUsePoints(!usePoints)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    usePoints
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-200/60 text-amber-900 hover:bg-amber-300/60'
                  }`}
                >
                  {usePoints ? '已套用折抵' : '使用折抵'}
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t.subtotal}</span>
                <span className="font-mono">{formatPrice(subtotal, currency)}</span>
              </div>
              {usePoints && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{t.pointsRedeem} ({pointsUsed} pt)</span>
                  <span className="font-mono">-{formatPrice(pointsUsed, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>{t.shipping}</span>
                <span className="font-mono text-emerald-600 font-semibold">
                  {subtotal >= freeShippingThreshold ? '免運費 NT$0' : 'NT$60'}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t.totalPay}</span>
                <span className="font-mono text-indigo-600 text-lg">
                  {formatPrice(total + (subtotal >= freeShippingThreshold ? 0 : 60), currency)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => {
                onClose();
                onProceedCheckout(pointsUsed);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 hover:from-indigo-600 hover:to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>前往綠界 / LINE Pay 結帳</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Payment Trust Badges */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
              <span>ECPay 綠界 256-bit SSL</span>
              <span>•</span>
              <span>LINE Pay 直連</span>
              <span>•</span>
              <span>開立電子發票</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
