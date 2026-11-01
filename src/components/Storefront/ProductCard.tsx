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

// 提取商品核心功能特色特點（不打顏色、不重複神狗勾，聚焦純性能與工藝優勢）
function getProductFeatureHighlights(product: FilamentProduct): { primary: string; secondary?: string } {
  // 過濾掉所有顏色相關關鍵字與冗餘字詞
  const isColorOrStoreWord = (text: string) => {
    return /色|莫蘭迪|黑|白|紅|藍|綠|灰|黃|橙|金|銀|紫|粉|透明|神狗勾|多色/i.test(text);
  };

  if (product.features && product.features.length > 0) {
    const cleanList = product.features
      .map((f) => 
        f.replace(/神狗勾\s*/g, '')
         .replace(/^[✓✔・-]\s*/, '')
         .replace(/，.*$/, '') // 取前段核心特點
         .trim()
      )
      .filter((f) => f.length > 0 && !isColorOrStoreWord(f));

    if (cleanList.length > 0) {
      return {
        primary: cleanList[0],
        secondary: cleanList[1] && cleanList[1] !== cleanList[0] ? cleanList[1] : undefined
      };
    }
  }

  // 若特點列表無純性能特點，使用客觀工藝與操作規格
  const primary = product.maxSpeed 
    ? `列印速度 ${product.maxSpeed}` 
    : product.nozzleTemp 
    ? `噴嘴溫度 ${product.nozzleTemp}` 
    : '高精度穩定出料';
    
  const secondary = product.spoolType && !product.spoolType.includes('色') 
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
  // 自動在地化翻譯
  const liveProduct = useMemo(() => translateProduct(product, lang), [product, lang]);

  const defaultColor = liveProduct.colors[0] || { name: '標準規格', hex: '#1e293b', stock: 10 };
  const [selectedDiameter] = useState<'1.75mm' | '2.85mm'>(liveProduct.diameter);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 清除商品名稱中過度重複的「神狗勾」
  const cleanTitle = useMemo(() => {
    return (liveProduct.name || '')
      .replace(/神狗勾\s*/g, '')
      .trim();
  }, [liveProduct.name]);

  // 清理品牌名稱：若為神狗勾則顯示真實材質分類，避免全版充斥重複字樣
  const cleanBrand = useMemo(() => {
    const b = (liveProduct.brand || '').trim();
    if (!b || b === '神狗勾' || b.includes('神狗勾')) {
      return liveProduct.material ? `${liveProduct.material}` : '3D 耗材';
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

  const discountPercent = Math.round(((liveProduct.originalPrice - liveProduct.price) / liveProduct.originalPrice) * 100);
  const featureHighlights = useMemo(() => getProductFeatureHighlights(liveProduct), [liveProduct]);

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail(liveProduct)}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* 乾淨、無遮擋的商品圖片區域（不放覆蓋圖片的任何色塊標籤或遮罩，保持全圖清晰可見） */}
      <div 
        className="relative aspect-[4/3] w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden flex items-center justify-center cursor-pointer"
      >
        {/* 右上角精簡半透明功能小按鈕（僅在角落，不遮擋主體） */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(liveProduct);
            }}
            className="w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700"
            title="查看詳情"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(product.id)}
              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isCompared
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={isCompared ? '已在對比' : '加入對比'}
            >
              <Scale className="w-3 h-3" />
            </button>
          )}

          {onToggleWishlist && (
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className={`w-6.5 h-6.5 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80'
                  : 'bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700'
              }`}
              title={isWishlisted ? '從收藏移除' : '收藏'}
            >
              <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* 完整的純淨商品照片：無任何標籤遮蓋 */}
        {liveProduct.imageUrl && liveProduct.imageUrl.trim() !== '' ? (
          <img
            src={getSafeProductImageUrl(liveProduct.imageUrl, liveProduct.material, liveProduct.name)}
            alt={cleanTitle}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
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
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1">
        <div>
          {/* 第 1 列：品牌/材質 與 庫存狀態 */}
          <div className="flex items-center justify-between text-[11px] mb-0.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate tracking-wide">
              {cleanBrand}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
              {liveProduct.stock > 0 ? (liveProduct.stock < 15 ? '庫存吃緊' : '現貨') : '補貨中'}
            </span>
          </div>

          {/* 第 2 列：商品品名（精簡兩行收整，移除重複店名） */}
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors min-h-[2rem]">
            {cleanTitle}
          </h3>

          {/* 第 3 列：商品特色特點（純功能性亮點，不打任何顏色） */}
          <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-2 my-1 min-h-[1.75rem]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1">✦ 特色</span>
            <span>{featureHighlights.primary}</span>
            {featureHighlights.secondary && (
              <>
                <span className="text-slate-300 dark:text-slate-600 mx-1">·</span>
                <span>{featureHighlights.secondary}</span>
              </>
            )}
          </div>
        </div>

        {/* 第 4 列：價格、折價比例與快速加入按鈕（單行緊湊整合） */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 mt-auto">
          {/* 價格與特價折數（以純文字安靜呈現，不擋圖） */}
          <div className="flex items-baseline gap-1 min-w-0 flex-wrap">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight tabular-nums">
              {formatPrice(liveProduct.price, currency)}
            </span>
            {liveProduct.originalPrice > liveProduct.price && (
              <>
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono tabular-nums">
                  {formatPrice(liveProduct.originalPrice, currency)}
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-mono">
                  (-{discountPercent}%)
                </span>
              </>
            )}
          </div>

          {/* 俐落加入購物車按鈕 */}
          <button
            id={`add-to-cart-btn-${liveProduct.id}`}
            type="button"
            onClick={handleAdd}
            disabled={liveProduct.stock <= 0}
            className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0 ${
              liveProduct.stock <= 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
            title={liveProduct.stock <= 0 ? t.outOfStock : t.addToCart}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>已加入</span>
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
