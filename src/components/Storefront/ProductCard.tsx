import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Check, Eye, Heart, Scale, Package, X, Plus, Minus } from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode, ProductReview } from '../../types';
import { formatPrice, translations, translateProduct, translateColorName } from '../../utils/i18n';
import { WriteReviewModal } from './WriteReviewModal';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { saveCustomerRecentlyViewed } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';

interface ProductCardProps {
  product: FilamentProduct;
  currency: CurrencyCode;
  lang: LanguageCode;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity?: number) => void;
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

  const availableColors: ColorOption[] = useMemo(() => {
    return liveProduct.colors && liveProduct.colors.length > 0
      ? liveProduct.colors
      : [{ name: '標準規格', hex: '#1e293b', stock: 10 }];
  }, [liveProduct.colors]);

  const [pickedColor, setPickedColor] = useState<ColorOption>(availableColors[0]);
  const [pickedQty, setPickedQty] = useState<number>(1);
  const [isColorSheetOpen, setIsColorSheetOpen] = useState(false);
  const [selectedDiameter] = useState<'1.75mm' | '2.85mm'>(liveProduct.diameter);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // 清理品牌顯示：完整且精煉的品牌名稱，絕不出現「...」截斷
  const cleanBrand = useMemo(() => {
    const b = (liveProduct.brand || '').trim();
    if (!b || b === '神狗勾' || b.includes('神狗勾')) {
      return liveProduct.material ? `${liveProduct.material}` : '專業耗材';
    }
    const normalized = b
      .replace(/\s*(pro|官方驗證|工業級|\/\s*嚴選|規格)/gi, '')
      .replace('Bambu / Polymaker', 'Bambu Lab')
      .replace('Bambu / eSUN', 'eSUN 易生')
      .replace('Polymaker / eSUN', 'Polymaker')
      .trim();

    if (/bambu\s*lab\s*拓竹/i.test(normalized)) {
      return lang === 'en' ? 'Bambu Lab' : 'Bambu 拓竹';
    }
    if (/esun\s*易生/i.test(normalized)) {
      return lang === 'en' ? 'eSUN' : 'eSUN 易生';
    }
    if (/sunlu\s*三綠/i.test(normalized)) {
      return lang === 'en' ? 'SUNLU' : 'SUNLU 三綠';
    }
    return normalized;
  }, [liveProduct.brand, liveProduct.material, lang]);

  // 清理商品名稱：移除與上方品牌標籤重複的前綴詞、顏色形容詞（如莫蘭迪）及尾端括號補充，確保卡片標題精煉不超過兩行
  const cleanTitle = useMemo(() => {
    let title = (liveProduct.name || '')
      .replace(/神狗勾\s*/g, '')
      .replace(/^(Bambu\s*Lab\s*拓竹|Bambu\s*Lab|拓竹|eSUN\s*易生|eSUN|SUNLU\s*三綠|SUNLU|Anycubic)\s*/i, '')
      .replace(/莫蘭迪\s*/g, '')
      .replace(/雙面金色紋理/g, '雙面紋理')
      .replace(/\s*[\(（][^\)）]*[\)）]\s*$/g, '')
      .trim();

    // 避免空字串 fallback
    if (!title) {
      title = (liveProduct.name || '').replace(/神狗勾\s*/g, '').replace(/莫蘭迪\s*/g, '').trim();
    }
    return title;
  }, [liveProduct.name]);

  const showDiameter = useMemo(() => {
    const mat = (liveProduct.material || '').toLowerCase();
    return Boolean(liveProduct.diameter) && mat !== 'accessories' && mat !== 'resin';
  }, [liveProduct.diameter, liveProduct.material]);

  // 點擊購物車按鈕：開啟下半部從下往上彈出的顏色與數量選擇小彈窗
  const handleOpenColorSheet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickedColor(availableColors[0]);
    setPickedQty(1);
    setIsColorSheetOpen(true);
  };

  const handleConfirmAddFromSheet = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveCustomerRecentlyViewed(auth.currentUser?.uid, liveProduct).catch(() => {});
    onAddToCart(liveProduct, pickedColor, selectedDiameter, pickedQty);
    setIsColorSheetOpen(false);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

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
      {/* 純淨無遮擋商品圖片區（1:1 比例完整呈現線盤與盒裝，不裁切上下資訊） */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden flex items-center justify-center cursor-pointer">
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
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(e) => handleProductImageError(e, liveProduct.material, liveProduct.name)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* 簡潔有力的商品資訊內容（完整顯示品牌不截斷、標題不重複品牌名稱） */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* 第 1 列：品牌標籤（絕不截斷成 ...）與 線徑規格 */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                {cleanBrand}
              </span>
              {showDiameter && (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] shrink-0 whitespace-nowrap">
                  {liveProduct.diameter}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0 font-semibold whitespace-nowrap">
              {liveProduct.stock > 0 ? (liveProduct.stock < 15 ? '少量' : '現貨') : '補貨中'}
            </span>
          </div>

          {/* 第 2 列：商品標題（去重品牌前綴、穩定雙行高度、不留第三行殘字） */}
          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {cleanTitle}
          </h3>

          {/* 第 3 列：商品核心特色特點（俐落單行標籤） */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded leading-tight truncate max-w-full">
              ✦ {featureHighlights.primary}
            </span>
            {featureHighlights.secondary && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 rounded leading-tight whitespace-nowrap">
                {featureHighlights.secondary}
              </span>
            )}
          </div>
        </div>

        {/* 第 4 列：價格與快速加入購物車（點擊彈出底部選色小視窗） */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 mt-auto">
          <div className="flex items-baseline gap-1 min-w-0 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatPrice(liveProduct.price, currency)}
            </span>
          </div>

          <button
            id={`add-to-cart-btn-${liveProduct.id}`}
            type="button"
            onClick={handleOpenColorSheet}
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

      {/* 底部向上彈出：加入購物車前選擇顏色與數量的小彈窗 (Bottom Sheet) */}
      {isColorSheetOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] bg-slate-900/55 backdrop-blur-xs flex items-end justify-center animate-fade-in select-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsColorSheetOpen(false);
            }}
          >
            <div
              className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl sm:mb-4 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 max-h-[65vh] flex flex-col overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 頂部指示橫條 */}
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 shrink-0" />

              {/* 商品摘要頭部 */}
              <div className="px-4 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {activeImageUrl ? (
                    <img
                      src={activeImageUrl}
                      alt={cleanTitle}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50"
                      onError={(e) => handleProductImageError(e, liveProduct.material, liveProduct.name)}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {cleanBrand}
                      </span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono whitespace-nowrap">
                        {formatPrice(liveProduct.price, currency)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                      {cleanTitle}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>已選：</span>
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: pickedColor.hex }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {translateColorName(pickedColor.name, lang)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsColorSheetOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 顏色選擇列表 */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    選擇顏色規格 ({availableColors.length} 款可選)
                  </span>
                  {showDiameter && (
                    <span className="text-[11px] font-mono text-slate-500">
                      線徑 {selectedDiameter}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map((color) => {
                    const isSelected = pickedColor.name === color.name;
                    const displayColorName = translateColorName(color.name, lang).replace(/\s+[A-Za-z\s-]+$/, '').trim() || translateColorName(color.name, lang);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setPickedColor(color)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-bold truncate flex-1">
                          {displayColorName}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 底部數量與確認加入購物車按鈕 */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center gap-3 shrink-0">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setPickedQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {pickedQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickedQty((q) => q + 1)}
                    className="w-9 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAddFromSheet}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>
                    確認加入購物車 · {formatPrice(liveProduct.price * pickedQty, currency)}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

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
