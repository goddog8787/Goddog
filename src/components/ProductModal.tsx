import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Zap, 
  Thermometer, 
  Gauge, 
  ShieldCheck, 
  Wind, 
  Box, 
  Cpu, 
  Share2, 
  Star,
  Package 
} from 'lucide-react';
import { FilamentProduct, ColorOption, LanguageCode, CurrencyCode } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';

interface ProductModalProps {
  product: FilamentProduct | null;
  onClose: () => void;
  lang: LanguageCode;
  currency: CurrencyCode;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onBuyNow: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  lang,
  currency,
  onAddToCart,
  onBuyNow
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product?.colors?.[0] || { name: '', hex: '#000000', stock: 10 });
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(product?.diameter || '1.75mm');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image & Badges */}
          <div className="p-6 sm:p-8 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200 aspect-square">
              {product.imageUrl && product.imageUrl.trim() !== '' ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
              {product.badge && (
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-slate-700 font-medium">線徑公差 ±0.02mm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-2">
                <Box className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-700 font-medium">{product.spoolType}</span>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & Purchasing Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5 max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {product.brand} · {product.material}
                </span>
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? '已複製連結！' : '分享商品'}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center space-x-2 mt-1 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold ml-1 text-slate-800">{product.rating}</span>
                </div>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{product.reviewsCount} 則真實創客評價</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
              </div>

              {/* Price Row */}
              <div className="mt-4 flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatCurrency(product.price, currency)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {formatCurrency(product.originalPrice, currency)}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  現貨即出 · 支援綠界 & LINE Pay
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Feature Points */}
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Technical Slicer Parameters Table */}
              <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    切片軟體官方推薦參數 (Bambu Studio / Orca / Cura)
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">精準免翻車</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>噴頭: <strong className="text-slate-900">{product.nozzleTemp}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    <span>熱床: <strong className="text-slate-900">{product.bedTemp}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-3.5 h-3.5 text-sky-500" />
                    <span>速度: <strong className="text-slate-900">{product.maxSpeed}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-3.5 h-3.5 text-indigo-500" />
                    <span>冷卻: <strong className="text-slate-900">建議 60-100%</strong></span>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  選擇顏色：<span className="text-sky-600 font-semibold">{selectedColor.name}</span>
                  <span className="text-slate-400 font-normal ml-2">(現貨庫存: {selectedColor.stock} 卷)</span>
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diameter & Quantity */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">線徑規格</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['1.75mm', '2.85mm'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDiameter(d)}
                        className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                          selectedDiameter === d
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">購買數量</label>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-8">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-xs font-bold font-mono text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedColor.stock, quantity + 1))}
                      className="w-8 h-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button
                id="btn-modal-add-cart"
                onClick={() => {
                  onAddToCart(product, selectedColor, selectedDiameter, quantity);
                  onClose();
                }}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-slate-900 text-slate-900 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>加入購物車</span>
              </button>

              <button
                id="btn-modal-buy-now"
                onClick={() => {
                  onBuyNow(product, selectedColor, selectedDiameter, quantity);
                  onClose();
                }}
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>立即結帳</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
