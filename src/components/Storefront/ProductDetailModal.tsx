import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Package,
  Bot,
  Calculator,
  Copy,
  CheckCheck
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
  onAskAI?: (product: FilamentProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  lang,
  onClose,
  onAddToCart,
  onQuickCheckout,
  onAskAI,
}) => {
  const t = translations[lang];

  const defaultColor: ColorOption = { name: '經典黑', hex: '#111827', stock: 10 };
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product?.colors?.[0] || defaultColor);
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(product?.diameter || '1.75mm');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'slicer' | 'calculator' | 'reviews'>('specs');
  const [isAdded, setIsAdded] = useState(false);
  const [partWeightGrams, setPartWeightGrams] = useState<number>(45);
  const [copiedParams, setCopiedParams] = useState(false);

  // Sync color & diameter when product prop changes
  useEffect(() => {
    if (product) {
      if (product.colors?.[0]) setSelectedColor(product.colors[0]);
      if (product.diameter) setSelectedDiameter(product.diameter);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Approximate material densities in g/cm³
  const materialDensities: Record<string, number> = {
    'High-Speed PLA': 1.24,
    'PETG': 1.27,
    'ABS': 1.04,
    'TPU': 1.21,
    'Carbon Fiber': 1.25,
    'Resin': 1.15,
  };
  const density = materialDensities[product.material] || 1.24;
  // Spool weight assumed 1000g net
  const spoolNetGrams = 1000;
  // Estimated total meters for 1.75mm
  const radiusCm = 0.175 / 2;
  const areaCm2 = Math.PI * radiusCm * radiusCm;
  const totalLengthMeters = Math.round((spoolNetGrams / (density * areaCm2)) / 100);
  const costPerGram = product.price / spoolNetGrams;
  const partCost = Math.round(costPerGram * partWeightGrams * 10) / 10;
  const partsPerSpool = Math.floor(spoolNetGrams / Math.max(1, partWeightGrams));

  const handleCopyParams = () => {
    const text = `【神狗勾 3D 耗材 - ${product.name} 切片建議】
材質: ${product.material}
噴嘴溫度: ${product.printTemp}
熱床溫度: ${product.bedTemp}
最大推薦速度: ${product.maxSpeed}
線徑: ${selectedDiameter}
近端回抽: 0.8mm (35mm/s)
遠端回抽: 4.5mm (45mm/s)
相容切片軟體: Bambu Studio / OrcaSlicer / PrusaSlicer / Cura`;
    navigator.clipboard?.writeText?.(text);
    setCopiedParams(true);
    setTimeout(() => setCopiedParams(false), 2000);
  };

  const handleAdd = () => {
    onAddToCart(product, selectedColor, selectedDiameter, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    onQuickCheckout(product, selectedColor, selectedDiameter, quantity);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl border-0 sm:border border-slate-200 flex flex-col relative cursor-default select-text"
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
              {product.imageUrl && product.imageUrl.trim() !== '' ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
              
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
                <span>{product.brand.replace(/\s*pro/gi, '')}</span>
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

              {/* Detail Tabs */}
              <div className="mt-5 border-t border-slate-100 pt-3">
                <div className="flex border-b border-slate-200 gap-2 mb-3 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    耗材特點與物性
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('slicer')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'slicer'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    切片參數推薦
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('calculator')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      activeTab === 'calculator'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>成本與件數估算</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    創客評價 ({product.reviewsCount})
                  </button>
                </div>

                {activeTab === 'specs' && (
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <p className="leading-relaxed">{product.description}</p>
                    <div className="space-y-1.5 pt-1">
                      {product.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'slicer' && (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">第一層熱床溫度：</span>
                        <span className="font-mono font-bold text-slate-800">{product.bedTemp}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">回抽距離 (近端)：</span>
                        <span className="font-mono font-bold text-slate-800">0.8 mm (速度 35mm/s)</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">風扇冷卻轉速：</span>
                        <span className="font-mono font-bold text-slate-800">100% (前 3 層關閉)</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">最大流速 (Volumetric)：</span>
                        <span className="font-mono font-bold text-indigo-600">22 - 26 mm³/s</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-400">
                        支援 Bambu Studio, OrcaSlicer, PrusaSlicer, Cura
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyParams}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copiedParams ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">已複製切片配置</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>一鍵複製切片參數</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'calculator' && (
                  <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">預估單件列印重量 (切片軟體估重)：</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={partWeightGrams}
                          onChange={(e) => setPartWeightGrams(Math.max(1, Number(e.target.value) || 1))}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900"
                        />
                        <span className="text-slate-500 font-medium">克 (g)</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="300"
                      step="5"
                      value={partWeightGrams}
                      onChange={(e) => setPartWeightGrams(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">單件線材成本</span>
                        <span className="text-sm font-bold text-emerald-600 font-mono">
                          NT$ {partCost}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">1卷可印件數</span>
                        <span className="text-sm font-bold text-indigo-600 font-mono">
                          約 {partsPerSpool} 件
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">整卷線材長度</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          約 {totalLengthMeters}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>林創客 (X1-Carbon)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal">已驗證購買</span>
                        </div>
                        <div className="flex text-amber-400"><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /></div>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px]">
                        「線徑公差非常精準！在拓竹 AMS 自動換色進退料完全不卡，300mm/s 速度下層紋依然細膩有光澤，強烈推薦！」
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>陳工程師 (Voron 2.4)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal">已驗證購買</span>
                        </div>
                        <div className="flex text-amber-400"><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /></div>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px]">
                        「真空防潮包裝非常扎實，拆封即印無氣泡無拉絲，比原廠線材還好印，回購好幾卷了。」
                      </p>
                    </div>
                  </div>
                )}
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

            {/* Quick Ask AI button */}
            {onAskAI && (
              <div className="mt-2.5">
                <button
                  id="modal-ask-ai-btn"
                  type="button"
                  onClick={() => onAskAI(product)}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="開啟 AI 客服小視窗詢問切片與最佳列印參數"
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>打開 AI 顧問小視窗詢問此款線材切片參數</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
