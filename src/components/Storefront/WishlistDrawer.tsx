import React from 'react';
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  Package
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice, translateProductName, translateMaterial } from '../../utils/i18n';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';

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
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between relative animate-slide-in-right cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {lang === 'en' ? 'My Wishlist / Saved Filaments' : lang === 'ja' ? 'お気に入り・保存済み' : '我的願望清單 / 收藏庫'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'en' 
                  ? `${savedProducts.length} items saved` 
                  : lang === 'ja' 
                  ? `${savedProducts.length} 件を保存中` 
                  : `已收藏 ${savedProducts.length} 款耗材備選`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {lang === 'en' ? 'No items in wishlist yet' : lang === 'ja' ? 'お気に入りはまだありません' : '尚未加入任何收藏'}
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {lang === 'en' 
                  ? 'Click the heart icon on any filament card to save items for quick one-click ordering later!' 
                  : lang === 'ja' 
                  ? '気になる商品のハートアイコンをクリックすると、ここにお気に入りを保存できます！' 
                  : '在商城中點擊商品卡片右上角的愛心圖示，即可將想買的線材收藏起來，方便下次一鍵下單！'}
              </p>
            </div>
          ) : (
            savedProducts.map((p) => {
              const displayName = translateProductName(p.name, p.brand, p.material, p.weight, lang);
              const displayMat = translateMaterial(p.material, lang);
              return (
                <div
                  key={p.id}
                  className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 transition-all flex gap-3 group shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                    {p.imageUrl && p.imageUrl.trim() !== '' ? (
                      <img 
                        src={getSafeProductImageUrl(p.imageUrl, p.material, p.name)} 
                        alt={displayName} 
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => handleProductImageError(e, p.material, p.name)}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                          {p.brand}
                        </span>
                        <button
                          onClick={() => onRemoveFromWishlist(p.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title={lang === 'en' ? 'Remove from wishlist' : lang === 'ja' ? 'お気に入り解除' : '取消收藏'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.weight} • {displayMat}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-100">
                        {formatPrice(p.price, currency)}
                      </span>

                      <button
                        onClick={() => {
                          onAddToCart(p);
                          onRemoveFromWishlist(p.id);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Move to Cart' : lang === 'ja' ? 'カートへ移動' : '移至購物車'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {savedProducts.length > 0 && (
          <div className="p-5 pb-24 lg:pb-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2">
            <button
              onClick={() => {
                onAddAllToCart(savedProducts);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {lang === 'en' 
                  ? `Add All to Cart (${savedProducts.length} items)` 
                  : lang === 'ja' 
                  ? `すべてカートに追加 (${savedProducts.length} 件)` 
                  : `將全部收藏加入購物車 (${savedProducts.length} 款)`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
