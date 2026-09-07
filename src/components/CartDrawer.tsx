import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { CartItem, LanguageCode, CurrencyCode, MemberProfile } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  lang: LanguageCode;
  currency: CurrencyCode;
  member: MemberProfile;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  lang,
  currency,
  member,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const FREE_SHIPPING_THRESHOLD = 999;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const diffToFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-slate-800" />
            <h2 className="font-extrabold text-base text-slate-900">
              {t.navCart} ({items.reduce((acc, i) => acc + i.quantity, 0)} 件)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-4 py-3 bg-sky-50/80 border-b border-sky-100 text-xs">
          <div className="flex items-center justify-between font-semibold mb-1.5">
            <span className="flex items-center gap-1 text-sky-800">
              <Truck className="w-4 h-4 text-sky-600" />
              {diffToFree === 0 ? '🎉 恭喜！您已享 7-11 / 全家 超商免運！' : `還差 NT$ ${diffToFree} 即享超商免運優惠`}
            </span>
            <span className="font-mono text-sky-700">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-sky-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-700">{t.emptyCart}</p>
              <p className="text-xs text-slate-400 mt-1">選購最熱門的 High-Speed PLA+ 與碳纖維耗材</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors cursor-pointer"
              >
                前往選購
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedColor.name}-${item.selectedDiameter}-${idx}`}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>

                  <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center space-x-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                      <span>{item.selectedColor.name.split(' ')[0]}</span>
                    </span>
                    <span>·</span>
                    <span>{item.selectedDiameter}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-black font-mono text-slate-900">
                      {formatCurrency(item.product.price * item.quantity, currency)}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-md overflow-hidden h-6 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="px-1.5 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-mono font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="px-1.5 h-full bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(idx)}
                  className="text-slate-300 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  title="移除品項"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Member Points Reminder */}
            <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-900">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>創客會員現有 <strong>{member.points} 點</strong> 積分</span>
              </div>
              <span className="font-semibold text-amber-800">結帳可直接折抵 NT${Math.min(member.points, subtotal)}</span>
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.shippingFee}</span>
                <span className="font-mono">
                  {diffToFree === 0 ? (
                    <span className="text-emerald-600 font-bold">免運費 NT$0</span>
                  ) : (
                    'NT$ 60'
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900">{t.totalAmount}</span>
                <span className="font-black text-xl text-slate-900 font-mono">
                  {formatCurrency(subtotal + (diffToFree === 0 ? 0 : 60), currency)}
                </span>
              </div>
            </div>

            <button
              id="btn-drawer-checkout"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-slate-900 hover:bg-sky-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                綠界科技 ECPay 官方安全連線
              </span>
              <span>·</span>
              <span>LINE Pay 行動支付</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
