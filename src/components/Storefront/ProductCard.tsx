import React, { useState } from 'react';
import { ShoppingCart, Check, Eye, Flame, Gauge, Layers, Info, Heart, Scale, Star, Package } from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice, translations } from '../../utils/i18n';

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
}) => {
  const t = translations[lang];
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(product.diameter);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, selectedDiameter);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail(product)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.badge && (
          <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs w-fit">
            省 {discountPercent}%
          </span>
        )}
      </div>

      {/* Top Right Action Buttons (Wishlist & Compare) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isCompared
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : 'bg-white/90 backdrop-blur-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            title={isCompared ? '已加入對比清單' : '加入規格橫向對比'}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}

        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                : 'bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title={isWishlisted ? '從收藏移除' : '加入願望收藏清單'}
          >
            <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Image Area with 3D Spool Glow */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-slate-100 to-slate-200/80 overflow-hidden flex items-center justify-center p-4">
        {product.imageUrl && product.imageUrl.trim() !== '' ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center rounded-xl group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="w-12 h-12" />
          </div>
        )}

        {/* Selected Color Visual Indicator Pill */}
        <div 
          className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-xs text-slate-800 font-medium pointer-events-none"
        >
          <span 
            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner" 
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className="truncate max-w-[110px]">{selectedColor.name}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Material tag */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600 tracking-wide truncate max-w-[90px] sm:max-w-none">{product.brand.replace(/\s*pro/gi, '')}</span>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[10px] sm:text-[11px] font-medium">
                {product.weight}
              </span>
              <span className="flex items-center gap-0.5 text-amber-500 font-bold font-mono text-[10px] sm:text-[11px]">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                {product.rating}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-900 text-xs sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[32px] sm:min-h-[40px]">
            {product.name}
          </h3>

          {/* Key 3D Printing Specs Pills */}
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5 my-2 sm:my-3 text-[10px] sm:text-[11px] text-slate-600">
            <div className="flex items-center gap-1 bg-slate-50 p-1 sm:p-1.5 rounded-lg border border-slate-100">
              <Gauge className="w-3 h-3 text-cyan-600 shrink-0" />
              <span className="truncate font-mono">{product.maxSpeed}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 sm:p-1.5 rounded-lg border border-slate-100">
              <Flame className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate font-mono">{product.nozzleTemp}</span>
            </div>
          </div>

          {/* Color Selection Swatches */}
          <div className="mt-1.5 mb-2.5 sm:mt-2 sm:mb-3">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mb-1 flex items-center justify-between">
              <span className="truncate">顏色：<span className="text-slate-800 font-semibold">{selectedColor.name.split(' ')[0]}</span></span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono shrink-0">
                {product.stock > 0 ? `${product.stock}盤` : t.outOfStock}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
              {product.colors.slice(0, 5).map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all relative flex items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 scale-110 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (庫存: ${color.stock})`}
                  >
                    {isSelected && (
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        color.hex === '#f8fafc' || color.hex === '#e2e8f0' || color.hex === '#fdf4dc'
                          ? 'bg-slate-900'
                          : 'bg-white'
                      }`} />
                    )}
                  </button>
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[9px] text-slate-400 font-mono font-bold">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div>
              <span className="text-sm sm:text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice > product.price && (
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            {/* Loyalty Points Earning Badge */}
            <span className="text-[9px] sm:text-[10px] text-amber-700 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded font-semibold border border-amber-200/60 hidden xs:inline-block">
              +{Math.floor(product.price / 10)}pt
            </span>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs ${
              product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-indigo-600 text-white active:scale-98'
            }`}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>已加入！</span>
              </>
            ) : product.stock <= 0 ? (
              <span>缺貨</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>加購物車</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
