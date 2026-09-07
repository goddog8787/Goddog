import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  ShieldCheck, 
  Flame, 
  Gauge, 
  Layers, 
  Wind, 
  Box, 
  Star, 
  Check, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice, translations } from '../../utils/i18n';

interface ProductDetailModalProps {
  product: FilamentProduct | null;
  currency: CurrencyCode;
  lang: LanguageCode;
  onClose: () => void;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onQuickCheckout: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  lang,
  onClose,
  onAddToCart,
  onQuickCheckout,
}) => {
  if (!product) return null;
  const t = translations[lang];

  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(product.diameter);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'slicer' | 'reviews'>('specs');
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedColor, selectedDiameter, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    onQuickCheckout(product, selectedColor, selectedDiameter, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image & Spool preview */}
          <div className="bg-slate-50 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner flex items-center justify-center p-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
              
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {product.badge}
                  </span>
                )}
                <span className="bg-slate-900 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {product.spoolType}
                </span>
              </div>
            </div>

            {/* Quick Slicer Spec Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-[10px] text-slate-400">噴嘴溫度</div>
                  <div className="font-mono font-bold text-slate-800">{product.nozzleTemp}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-[10px] text-slate-400">熱床溫度</div>
                  <div className="font-mono font-bold text-slate-800">{product.bedTemp}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-600" />
                <div>
                  <div className="text-[10px] text-slate-400">推薦最高速</div>
                  <div className="font-mono font-bold text-slate-800">{product.maxSpeed}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="text-[10px] text-slate-400">耗材淨重</div>
                  <div className="font-mono font-bold text-slate-800">{product.weight}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Configurations & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
                <span>{product.brand}</span>
                <span>•</span>
                <span className="text-slate-500 font-mono">SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h2>

              {/* Rating & reviews */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold ml-1 text-slate-900">{product.rating}</span>
                </div>
                <span>({product.reviewsCount} 則專業創客真實評價)</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 原廠正品防潮
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {formatPrice(product.price, currency)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="ml-3 text-sm text-slate-400 line-through font-mono">
                      {formatPrice(product.originalPrice, currency)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    贈 {Math.floor(product.price / 10)} 點積分
                  </span>
                </div>
              </div>

              {/* Color Picker */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  1. 顏色選擇：
                  <span className="text-indigo-600 font-semibold ml-1">
                    {selectedColor.name}
                  </span>
                  <span className="text-slate-400 font-normal ml-2">
                    (現貨庫存: {selectedColor.stock} 卷)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        selectedColor.name === c.name
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diameter Picker */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  2. 線徑規格：
                </label>
                <div className="flex gap-2">
                  {(['1.75mm', '2.85mm'] as const).map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setSelectedDiameter(dia)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedDiameter === dia
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {dia} {dia === '1.75mm' && '(主流通用)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">3. 購買數量 (卷)：</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Description & Features summary */}
              <div className="mt-5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <p className="line-clamp-2 leading-relaxed mb-2">{product.description}</p>
                <div className="space-y-1">
                  {product.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
              <button
                id="modal-add-to-cart-btn"
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.addedToCart}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    {t.addToCart}
                  </>
                )}
              </button>

              <button
                id="modal-buy-now-btn"
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <span>{lang === 'zh-TW' ? '立即結帳付款 (綠界 / LINE Pay)' : lang === 'ja' ? '今すぐ購入 (ECPay / LINE Pay)' : 'Checkout (ECPay / LINE Pay)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
