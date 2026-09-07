import React, { useState } from 'react';
import { ShoppingCart, Check, Eye, Flame, Gauge, Layers, Info } from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice, translations } from '../../utils/i18n';

interface ProductCardProps {
  product: FilamentProduct;
  currency: CurrencyCode;
  lang: LanguageCode;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm') => void;
  onViewDetail: (product: FilamentProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  lang,
  onAddToCart,
  onViewDetail,
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
      {/* Top Badges */}
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

      {/* Image Area with 3D Spool Glow */}
      <div className="relative aspect-square w-full bg-gradient-to-b from-slate-100 to-slate-200/80 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center rounded-xl group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

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

        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md hover:bg-indigo-600 hover:text-white"
          title="查看詳細切片與規格"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Material tag */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-indigo-600 tracking-wide">{product.brand}</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px] font-medium">
              {product.weight}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Key 3D Printing Specs Pills */}
          <div className="grid grid-cols-2 gap-1.5 my-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Gauge className="w-3 h-3 text-cyan-600 shrink-0" />
              <span className="truncate font-mono">{product.maxSpeed}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Flame className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate font-mono">{product.nozzleTemp}</span>
            </div>
          </div>

          {/* Color Selection Swatches */}
          <div className="mt-2 mb-3">
            <div className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center justify-between">
              <span>{t.colorSwatches}：<span className="text-slate-800 font-semibold">{selectedColor.name.split(' ')[0]}</span></span>
              <span className="text-[10px] text-slate-400 font-mono">
                {product.stock > 0 ? `${product.stock} ${t.stockLeft}` : t.outOfStock}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
              {product.colors.map((color) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all relative flex items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 scale-110 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (庫存: ${color.stock})`}
                  >
                    {isSelected && (
                      <span className={`w-2 h-2 rounded-full ${
                        color.hex === '#f8fafc' || color.hex === '#e2e8f0' || color.hex === '#fdf4dc'
                          ? 'bg-slate-900'
                          : 'bg-white'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice > product.price && (
                <span className="ml-2 text-xs text-slate-400 line-through font-mono">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            {/* Loyalty Points Earning Badge */}
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200/60">
              +{Math.floor(product.price / 10)} pt
            </span>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAddedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-indigo-600 text-white active:scale-98'
            }`}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>已加入購物車！</span>
              </>
            ) : product.stock <= 0 ? (
              <span>{t.outOfStock}</span>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
