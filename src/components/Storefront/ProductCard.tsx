import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Check, Eye, Flame, Gauge, Layers, Info, Heart, Scale, Star, Package, MessageSquarePlus } from 'lucide-react';
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

// Clean auto-adapting speed formatter for any product type
function formatCompactSpeed(speed: any, lang: LanguageCode): string {
  if (!speed || typeof speed !== 'string') return lang === 'en' ? 'Standard' : lang === 'ja' ? '標準' : '標準速度';
  let formatted = String(speed)
    .replace(/≤\s*/g, '≤')
    .replace(/\s*mm\/s/gi, 'mm/s')
    .replace(/\s*\/\s*layer/gi, lang === 'en' ? '/lyr' : lang === 'ja' ? '/層' : '/層')
    .replace(/冷卻後自動脫模/g, lang === 'en' ? 'Auto-release' : lang === 'ja' ? '自動脱離' : '自動脫模')
    .replace(/高黏性無翹曲|熱床防翹曲/g, lang === 'en' ? 'No Warp' : lang === 'ja' ? '反り防止' : '防翹曲')
    .replace(/流速提升\s*20%/g, lang === 'en' ? 'Flow+20%' : lang === 'ja' ? '流速+20%' : '流速+20%')
    .replace(/支援邊烘邊印/g, lang === 'en' ? 'Dry&Print' : lang === 'ja' ? '乾燥印刷' : '烘印同步')
    .replace(/\s+/g, '');
  return formatted;
}

// Clean auto-adapting temperature/operating spec formatter
function formatCompactTemp(temp: any, lang: LanguageCode): string {
  if (!temp || typeof temp !== 'string') return lang === 'en' ? 'Ambient' : lang === 'ja' ? '常温' : '常溫免熱';
  let formatted = String(temp)
    .replace(/\(發泡區\)/g, '')
    .replace(/常溫\s*\(免加熱\)/g, lang === 'en' ? 'Ambient' : lang === 'ja' ? '常温免熱' : '常溫免熱')
    .replace(/°C\s*-\s*(\d+)°C/gi, '~$1°')
    .replace(/°C\s*-\s*(\d+)/gi, '~$1°')
    .replace(/°C/gi, '°')
    .replace(/室溫\s*(\d+)°?\s*-\s*(\d+)°?/g, lang === 'en' ? 'Room $1~$2°' : lang === 'ja' ? '室温$1~$2°' : '室溫$1~$2°')
    .replace(/加熱\s*(\d+)°?\s*-\s*(\d+)°?/g, lang === 'en' ? 'Heat $1~$2°' : lang === 'ja' ? '加熱$1~$2°' : '加熱$1~$2°')
    .replace(/耐溫高達\s*(\d+)°?/g, lang === 'en' ? 'Resist $1°' : lang === 'ja' ? '耐熱$1°' : '耐溫$1°')
    .replace(/最高耐溫\s*(\d+)°?/g, lang === 'en' ? 'Resist $1°' : lang === 'ja' ? '耐熱$1°' : '耐溫$1°')
    .replace(/\s+/g, '');
  return formatted;
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
  // Dynamically translate product specs, colors, brand, and title automatically
  const liveProduct = useMemo(() => translateProduct(product, lang), [product, lang]);

  const [selectedColor, setSelectedColor] = useState<ColorOption>(liveProduct.colors[0] || { name: 'Black', hex: '#1e293b' });
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(liveProduct.diameter);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    setSelectedColor((prev) => {
      const match = liveProduct.colors.find(c => c.hex === prev.hex) || liveProduct.colors[0];
      return match || liveProduct.colors[0];
    });
  }, [liveProduct]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveCustomerRecentlyViewed(auth.currentUser?.uid, liveProduct).catch(() => {});
    onAddToCart(liveProduct, selectedColor, selectedDiameter);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const discountPercent = Math.round(((liveProduct.originalPrice - liveProduct.price) / liveProduct.originalPrice) * 100);

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail(liveProduct)}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Right Action Buttons (Wishlist & Compare) */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isCompared
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600'
            }`}
            title={isCompared ? (lang === 'en' ? 'In comparison' : lang === 'ja' ? '比較中' : '已加入對比清單') : (lang === 'en' ? 'Add to compare' : lang === 'ja' ? 'スペック比較' : '加入規格橫向對比')}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isWishlisted
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 ring-2 ring-rose-200 dark:ring-rose-800'
                : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700'
            }`}
            title={isWishlisted ? (lang === 'en' ? 'Remove from wishlist' : lang === 'ja' ? 'お気に入り解除' : '從收藏移除') : (lang === 'en' ? 'Add to wishlist' : lang === 'ja' ? 'お気に入り追加' : '加入願望收藏清單')}
          >
            <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Clean Unobstructed Image Area with Floating Badge */}
      <div 
        className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      >
        {liveProduct.badge && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap bg-slate-900/80 backdrop-blur-xs text-white">
              {liveProduct.badge}
            </span>
          </div>
        )}

        {liveProduct.imageUrl && liveProduct.imageUrl.trim() !== '' ? (
          <img
            src={getSafeProductImageUrl(liveProduct.imageUrl, liveProduct.material, liveProduct.name)}
            alt={liveProduct.name}
            className="w-full h-full object-cover object-center rounded-xl group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={(e) => handleProductImageError(e, liveProduct.material, liveProduct.name)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Row 1: Brand & Weight */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wide text-xs sm:text-sm whitespace-nowrap">
              {(liveProduct.brand || '').replace(/\s*(pro|官方驗證)/gi, '').trim() || '神狗勾'}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ml-1">
              {liveProduct.weight}
            </span>
          </div>

          {/* Row 2: Product Title - Fluid line height & min-height without fixed pixel clipping */}
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-[15px] leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors min-h-[2.6rem] flex items-start">
            {liveProduct.name}
          </h3>

          {/* Row 3: Rating & Review Count */}
          <div className="flex items-center gap-1.5 min-h-[1.25rem]">
            {liveProduct.reviewsCount > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReviewModalOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-amber-500 font-bold hover:text-amber-600 transition-colors cursor-pointer group/rate shrink-0"
                title={t.viewReviews}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover/rate:scale-110 transition-transform" />
                <span className="text-amber-600 dark:text-amber-400 font-bold">{liveProduct.rating}</span>
                <span className="text-slate-400 font-normal">({liveProduct.reviewsCount})</span>
              </button>
            ) : (
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">{t.noReviewsYet}</span>
            )}
          </div>

          {/* Row 4: Key Specs - Responsive 2-column grid without truncation or overflow */}
          {(() => {
            const compactSpeed = formatCompactSpeed(liveProduct.maxSpeed, lang);
            const compactTemp = formatCompactTemp(liveProduct.nozzleTemp, lang);

            return (
              <div className="grid grid-cols-2 gap-1.5 my-2">
                <div 
                  className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-mono text-[11px] sm:text-xs font-semibold shadow-2xs"
                  title={`${t.speedMax}：${liveProduct.maxSpeed}`}
                >
                  <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">{compactSpeed}</span>
                </div>
                <div 
                  className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-mono text-[11px] sm:text-xs font-semibold shadow-2xs"
                  title={`${t.nozzleTemp}：${liveProduct.nozzleTemp}`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">{compactTemp}</span>
                </div>
              </div>
            );
          })()}

          {/* Row 5: Color Selection */}
          <div className="my-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                {liveProduct.colors.slice(0, 4).map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/40 scale-110 shadow-xs' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          color.hex === '#f8fafc' || color.hex === '#ffffff' || color.hex === '#e2e8f0'
                            ? 'bg-slate-900'
                            : 'bg-white'
                        }`} />
                      )}
                    </button>
                  );
                })}
                {liveProduct.colors.length > 4 && (
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono font-bold">
                    +{liveProduct.colors.length - 4}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 pl-1">
                {selectedColor.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                {formatPrice(liveProduct.price, currency)}
              </span>
              {liveProduct.originalPrice > liveProduct.price && (
                <>
                  <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through font-mono">
                    {formatPrice(liveProduct.originalPrice, currency)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md">
                    {lang === 'ja' ? `${discountPercent}% OFF` : lang === 'en' ? `Save ${discountPercent}%` : `省 ${discountPercent}%`}
                  </span>
                </>
              )}
            </div>

            {/* Loyalty Points Earning Badge */}
            <span className="text-[11px] sm:text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60 dark:border-amber-800 hidden xs:inline-block">
              +{Math.floor(liveProduct.price / 10)}pt
            </span>
          </div>

          {/* Full-width, single-line horizontal Action Button (Add to Cart / Out of Stock) */}
          <button
            id={`add-to-cart-btn-${liveProduct.id}`}
            type="button"
            onClick={handleAdd}
            disabled={liveProduct.stock <= 0}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-[0.98] ${
              liveProduct.stock <= 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{t.addedToCart}</span>
              </>
            ) : liveProduct.stock <= 0 ? (
              <span className="whitespace-nowrap">{t.outOfStock}</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
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
