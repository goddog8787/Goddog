import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, Eye, Heart, Scale, Package } from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode, ProductReview } from '../../types';
import { formatPrice, translations, translateProduct } from '../../utils/i18n';
import { WriteReviewModal } from './WriteReviewModal';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { saveCustomerRecentlyViewed } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';

interface ProductCardProps {
  product: FilamentProduct;
  currency: CurrencyCode;
  lang: LanguageCode;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm') => void;
  onViewDetail: (product: FilamentProduct) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  isCompared?: boolean;
  onToggleCompare?: (productId: string) => void;
  onReviewSubmitted?: (updatedProduct: FilamentProduct, review: ProductReview) => void;
}

// 提取商品核心功能特色特點（自動過濾掉任何跟顏色有關的字眼，聚焦純性能與工藝優勢）
function getProductFeatureHighlights(product: FilamentProduct): { primary: string; secondary?: string } {
  const isColorOrStoreWord = (text: string) => {
    return /色|莫蘭迪|黑|白|紅|藍|綠|灰|黃|橙|金|銀|紫|粉|透明|神狗勾|多色/i.test(text);
  };

  if (product.features && product.features.length > 0) {
    const cleanList = product.features
      .map((f) =>
        f
          .replace(/神狗勾\s*/g, '')
          .replace(/^[✓✔・-]\s*/, '')
          .replace(/，.*$/, '')
          .trim()
      )
      .filter((f) => f.length > 0 && !isColorOrStoreWord(f));

    if (cleanList.length > 0) {
      return {
        primary: cleanList[0],
        secondary: cleanList[1] && cleanList[1] !== cleanList[0] ? cleanList[1] : undefined,
      };
    }
  }

  // Fallback 核心性能參數（絕不顯示顏色）
  const primary = product.maxSpeed
    ? `列印速度 ${product.maxSpeed}`
    : product.nozzleTemp
    ? `噴嘴溫度 ${product.nozzleTemp}`
    : '高精度穩定出料';

  const secondary =
    product.spoolType && !product.spoolType.includes('色')
      ? product.spoolType
      : product.weight || '品質保證';

  return { primary, secondary };
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  lang,
  onAddToCart,
  onViewDetail,
  isWishlisted = false,
  onToggleWishlist,
  isCompared = false,
  onToggleCompare,
  onReviewSubmitted,
}) => {
  const t = translations[lang];
  const liveProduct = useMemo(() => translateProduct(product, lang), [product, lang]);

  // 預設使用第一個色號供快速加入購物車（首頁卡片不顯示顏色選擇器，進入詳情頁再選色）
  const defaultColor: ColorOption = liveProduct.colors?.[0] || { name: '標準規格', hex: '#1e293b', stock: 10 };
  const [selectedDiameter] = useState<'1.75mm' | '2.85mm'>(liveProduct.diameter);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 清理商品名稱：移除「神狗勾」冗餘字樣
  const cleanTitle = useMemo(() => {
    return (liveProduct.name || '').replace(/神狗勾\s*/g, '').trim();
  }, [liveProduct.name]);

  // 清理品牌顯示：若為神狗勾則改為顯示產品材質分類
  const cleanBrand = useMemo(() => {
    const b = (liveProduct.brand || '').trim();
    if (!b || b === '神狗勾' || b.includes('神狗勾')) {
      return liveProduct.material ? `${liveProduct.material} 系列` : '專業耗材';
    }
    return b.replace(/\s*(pro|官方驗證)/gi, '').trim();
  }, [liveProduct.brand, liveProduct.material]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveCustomerRecentlyViewed(auth.currentUser?.uid, liveProduct).catch(() => {});
    onAddToCart(liveProduct, defaultColor, selectedDiameter);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const discountPercent = Math.round(
    ((liveProduct.originalPrice - liveProduct.price) / liveProduct.originalPrice) * 100
  );
  const featureHighlights = useMemo(() => getProductFeatureHighlights(liveProduct), [liveProduct]);
  const activeImageUrl = useMemo(() => {
    return getSafeProductImageUrl(liveProduct.imageUrl, liveProduct.material, liveProduct.name);
  }, [liveProduct.imageUrl, liveProduct.material, liveProduct.name]);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail(liveProduct)}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* 純淨無遮擋商品圖片區（無蓋圖標籤、無滿版遮罩、完整呈現圖片） */}
      <div className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden flex items-center justify-center cursor-pointer">
        {/* 右上角懸浮小巧功能鈕（查看詳情、比較、收藏） */}
        <div
          className="absolute top-2 right-2 z-10 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(liveProduct);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:scale-105"
            title="查看詳情"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(product.id)}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                isCompared
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600'
              }`}
              title={isCompared ? '已在對比' : '加入對比'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleWishlist && (
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600'
                  : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-500 dark:text-slate-400 hover:text-rose-500'
              }`}
              title={isWishlisted ? '從收藏移除' : '收藏'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* 商品圖片本體 */}
        {activeImageUrl && activeImageUrl.trim() !== '' ? (
          <img
            src={activeImageUrl}
            alt={cleanTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => handleProductImageError(e, liveProduct.material, liveProduct.name)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* 簡潔有力的商品資訊內容（高度緊湊、不顯示顏色、無遮蔽） */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* 第 1 列：材質/品牌 與 線徑規格 */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded truncate">
                {cleanBrand}
              </span>
              {liveProduct.diameter && (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                  {liveProduct.diameter}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
              {liveProduct.stock > 0 ? (liveProduct.stock < 15 ? '少量現貨' : '現貨供應') : '補貨中'}
            </span>
          </div>

          {/* 第 2 列：商品標題 */}
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors min-h-[2rem] sm:min-h-[2.25rem]">
            {cleanTitle}
          </h3>

          {/* 第 3 列：商品核心特色特點（純性能亮點，不顯示顏色） */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded max-w-full truncate">
              ✦ {featureHighlights.primary}
            </span>
            {featureHighlights.secondary && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded max-w-full truncate">
                {featureHighlights.secondary}
              </span>
            )}
          </div>
        </div>

        {/* 第 4 列：價格與快速加入購物車 */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 mt-auto">
          <div className="flex items-baseline gap-1 min-w-0 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatPrice(liveProduct.price, currency)}
            </span>
            {liveProduct.originalPrice > liveProduct.price && (
              <>
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                  {formatPrice(liveProduct.originalPrice, currency)}
                </span>
                <span className="text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold px-1 py-0.2 rounded">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${liveProduct.id}`}
            type="button"
            onClick={handleAdd}
            disabled={liveProduct.stock <= 0}
            className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0 ${
              liveProduct.stock <= 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
            title={liveProduct.stock <= 0 ? t.outOfStock : t.addToCart}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">已加入</span>
              </>
            ) : liveProduct.stock <= 0 ? (
              <span>{t.outOfStock}</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">加入</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 評價填寫彈窗 */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={liveProduct}
        onReviewSubmitted={(updated, review) => {
          if (onReviewSubmitted) {
            onReviewSubmitted(updated, review);
          }
        }}
      />
    </div>
  );
};
