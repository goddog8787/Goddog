import React from 'react';
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  Check,
  Package
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: FilamentProduct[];
  onRemoveFromWishlist: (id: string) => void;
  onAddToCart: (product: FilamentProduct) => void;
  onAddAllToCart: (products: FilamentProduct[]) => void;
  currency: CurrencyCode;
  lang: LanguageCode;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onRemoveFromWishlist,
  onAddToCart,
  onAddAllToCart,
  currency,
  lang,
}) => {
  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between relative animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">我的願望清單 / 收藏庫</h2>
              <p className="text-[11px] text-slate-500">已收藏 {savedProducts.length} 款耗材備選</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-800">尚未加入任何收藏</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                在商城中點擊商品卡片右上角的愛心圖示，即可將想買的線材收藏起來，方便下次一鍵下單！
              </p>
            </div>
          ) : (
            savedProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all flex gap-3 group shadow-xs"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0 border border-slate-100">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-indigo-600 font-mono">{p.brand}</span>
                      <button
                        onClick={() => onRemoveFromWishlist(p.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="取消收藏"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.name}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.weight} • {p.material}</div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="text-xs font-black font-mono text-slate-900">
                      {formatPrice(p.price, currency)}
                    </span>

                    <button
                      onClick={() => {
                        onAddToCart(p);
                        onRemoveFromWishlist(p.id);
                      }}
                      className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>移至購物車</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {savedProducts.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-2">
            <button
              onClick={() => {
                onAddAllToCart(savedProducts);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>將全部收藏加入購物車 ({savedProducts.length} 款)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
