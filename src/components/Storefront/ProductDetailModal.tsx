import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCheck,
  MessageSquarePlus,
  ExternalLink
} from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode, LanguageCode, ProductReview, MemberProfile } from '../../types';
import { formatPrice, translations, translateProduct } from '../../utils/i18n';
import { WriteReviewModal } from './WriteReviewModal';
import { subscribeToProductReviews } from '../../lib/reviewPersistence';
import { saveCustomerRecentlyViewed } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';

interface ProductDetailModalProps {
  product: FilamentProduct | null;
  currency: CurrencyCode;
  lang: LanguageCode;
  member?: MemberProfile;
  onClose: () => void;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onQuickCheckout: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onAskAI?: (product: FilamentProduct) => void;
  onReviewSubmitted?: (updatedProduct: FilamentProduct, review: ProductReview) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  lang,
  member,
  onClose,
  onAddToCart,
  onQuickCheckout,
  onAskAI,
  onReviewSubmitted,
}) => {
  const t = translations[lang];

  // Dynamic automatic translation of product details (supports newly added products seamlessly)
  const displayProduct = useMemo(() => product ? translateProduct(product, lang) : null, [product, lang]);

  const defaultColor: ColorOption = { name: lang === 'en' ? 'Classic Black' : lang === 'ja' ? 'クラシックブラック' : '經典黑', hex: '#111827', stock: 10 };
  const [selectedColor, setSelectedColor] = useState<ColorOption>(displayProduct?.colors?.[0] || defaultColor);
  const [selectedDiameter, setSelectedDiameter] = useState<'1.75mm' | '2.85mm'>(displayProduct?.diameter || '1.75mm');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'slicer' | 'calculator' | 'reviews'>('specs');
  const [isAdded, setIsAdded] = useState(false);
  const [partWeightGrams, setPartWeightGrams] = useState<number>(45);
  const [copiedParams, setCopiedParams] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [liveReviews, setLiveReviews] = useState<ProductReview[]>([]);
  const [localProduct, setLocalProduct] = useState<FilamentProduct | null>(displayProduct);

  useEffect(() => {
    setLocalProduct(displayProduct);
  }, [displayProduct]);

  // Subscribe to real-time reviews for this product
  useEffect(() => {
    if (!product?.id) {
      setLiveReviews([]);
      return;
    }
    const unsub = subscribeToProductReviews(product.id, (reviews) => {
      setLiveReviews(reviews);
    });
    return () => unsub();
  }, [product?.id]);

  // Sync color & diameter when displayProduct changes
  useEffect(() => {
    if (displayProduct) {
      if (displayProduct.colors?.[0]) setSelectedColor(displayProduct.colors[0]);
      if (displayProduct.diameter) setSelectedDiameter(displayProduct.diameter);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [displayProduct]);

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

  
  useEffect(() => {
    if (product) {
      const uid = member?.id || auth.currentUser?.uid;
      saveCustomerRecentlyViewed(uid, product).catch(() => {});
    }
  }, [product, member?.id]);

  if (!product || !displayProduct) return null;

  // Approximate material densities in g/cm³
  const materialDensities: Record<string, number> = {
    'High-Speed PLA': 1.24,
    'PETG': 1.27,
    'ABS': 1.04,
    'TPU': 1.21,
    'Carbon Fiber': 1.25,
    'Resin': 1.15,
  };
  const density = materialDensities[displayProduct.material] || 1.24;
  // Spool weight assumed 1000g net
  const spoolNetGrams = 1000;
  // Estimated total meters for 1.75mm
  const radiusCm = 0.175 / 2;
  const areaCm2 = Math.PI * radiusCm * radiusCm;
  const totalLengthMeters = Math.round((spoolNetGrams / (density * areaCm2)) / 100);
  const costPerGram = displayProduct.price / spoolNetGrams;
  const partCost = Math.round(costPerGram * partWeightGrams * 10) / 10;
  const partsPerSpool = Math.floor(spoolNetGrams / Math.max(1, partWeightGrams));

  const handleCopyParams = () => {
    const text = lang === 'en' 
      ? `【GodDog 3D Filament - ${displayProduct.name} Slicer Config】
Material: ${displayProduct.material}
Nozzle Temp: ${displayProduct.printTemp}
Bed Temp: ${displayProduct.bedTemp}
Max Speed: ${displayProduct.maxSpeed}
Diameter: ${selectedDiameter}
Direct Retraction: 0.8mm (35mm/s)
Bowden Retraction: 4.5mm (45mm/s)
Compatible: Bambu Studio / OrcaSlicer / PrusaSlicer / Cura`
      : lang === 'ja'
      ? `【GodDog 3Dフィラメント - ${displayProduct.name} スライス設定推奨】
材料: ${displayProduct.material}
ノズル温度: ${displayProduct.printTemp}
ベッド温度: ${displayProduct.bedTemp}
最大推奨速度: ${displayProduct.maxSpeed}
径: ${selectedDiameter}
ダイレクト引戻し: 0.8mm (35mm/s)
ボーデン引戻し: 4.5mm (45mm/s)
対応スライサー: Bambu Studio / OrcaSlicer / PrusaSlicer / Cura`
      : `【神狗勾 3D 耗材 - ${displayProduct.name} 切片建議】
材質: ${displayProduct.material}
噴嘴溫度: ${displayProduct.printTemp}
熱床溫度: ${displayProduct.bedTemp}
最大推薦速度: ${displayProduct.maxSpeed}
線徑: ${selectedDiameter}
近端回抽: 0.8mm (35mm/s)
遠端回抽: 4.5mm (45mm/s)
相容切片軟體: Bambu Studio / OrcaSlicer / PrusaSlicer / Cura`;
    navigator.clipboard?.writeText?.(text);
    setCopiedParams(true);
    setTimeout(() => setCopiedParams(false), 2000);
  };

  const handleAdd = () => {
    onAddToCart(displayProduct, selectedColor, selectedDiameter, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    onQuickCheckout(displayProduct, selectedColor, selectedDiameter, quantity);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
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
              {displayProduct.imageUrl && displayProduct.imageUrl.trim() !== '' ? (
                <img
                  src={getSafeProductImageUrl(displayProduct.imageUrl, displayProduct.material, displayProduct.name)}
                  alt={displayProduct.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => handleProductImageError(e, displayProduct.material, displayProduct.name)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {displayProduct.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {displayProduct.badge}
                  </span>
                )}
                <span className="bg-slate-900 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {displayProduct.spoolType}
                </span>
              </div>
            </div>

            {/* Quick Slicer Spec Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-[10px] text-slate-400">{t.nozzleTemp}</div>
                  <div className="font-mono font-bold text-slate-800">{displayProduct.nozzleTemp || displayProduct.printTemp}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="text-[10px] text-slate-400">{t.bedTemp}</div>
                  <div className="font-mono font-bold text-slate-800">{displayProduct.bedTemp}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-600" />
                <div>
                  <div className="text-[10px] text-slate-400">{t.speedMax}</div>
                  <div className="font-mono font-bold text-slate-800">{displayProduct.maxSpeed}</div>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Net Weight' : lang === 'ja' ? '正味重量' : '耗材淨重'}</div>
                  <div className="font-mono font-bold text-slate-800">{displayProduct.weight}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Configurations & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
                <span>{(displayProduct.brand || '').replace(/\s*pro/gi, '') || '神狗勾'}</span>
                <span>•</span>
                <span className="text-slate-500 font-mono">SKU: {displayProduct.sku}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {displayProduct.name}
              </h2>

              {/* Rating & reviews */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                {displayProduct.reviewsCount > 0 ? (
                  <>
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="ml-1 text-slate-900 dark:text-slate-100 font-mono">{displayProduct.rating}</span>
                    </div>
                    <span>({displayProduct.reviewsCount} {lang === 'en' ? 'Verified Reviews' : lang === 'ja' ? '件のカスタマー評価' : '則真實顧客評價'})</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {t.noReviewsYet}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {lang === 'en' ? 'Authentic & Sealed' : lang === 'ja' ? '正規品・真空防湿' : '原廠正品防潮'}
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {formatPrice(displayProduct.price, currency)}
                  </span>
                  {displayProduct.originalPrice > displayProduct.price && (
                    <span className="ml-3 text-sm text-slate-400 line-through font-mono">
                      {formatPrice(displayProduct.originalPrice, currency)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {lang === 'en' ? `+${Math.floor(displayProduct.price / 10)} pts` : lang === 'ja' ? `+${Math.floor(displayProduct.price / 10)} pt還元` : `贈 ${Math.floor(displayProduct.price / 10)} 點積分`}
                  </span>
                </div>
              </div>

              {/* Color Picker */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {lang === 'en' ? '1. Color:' : lang === 'ja' ? '1. カラー選択：' : '1. 顏色選擇：'}
                  <span className="text-indigo-600 font-semibold ml-1">
                    {selectedColor.name}
                  </span>
                  <span className="text-slate-400 font-normal ml-2">
                    ({lang === 'en' ? `In Stock: ${selectedColor.stock}` : lang === 'ja' ? `在庫: ${selectedColor.stock} 巻` : `現貨庫存: ${selectedColor.stock} 卷`})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayProduct.colors.map((c) => (
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
                  {lang === 'en' ? '2. Diameter:' : lang === 'ja' ? '2. フィラメント径：' : '2. 線徑規格：'}
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
                      {dia} {dia === '1.75mm' && (lang === 'en' ? '(Standard)' : lang === 'ja' ? '(標準規格)' : '(主流通用)')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {lang === 'en' ? '3. Quantity (Spools):' : lang === 'ja' ? '3. 数量 (巻)：' : '3. 購買數量 (卷)：'}
                </label>
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
                    {lang === 'en' ? 'Features & Specs' : lang === 'ja' ? '物性・製品特徴' : '耗材特點與物性'}
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
                    {lang === 'en' ? 'Slicer Profiles' : lang === 'ja' ? 'スライス設定推奨' : '切片參數推薦'}
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
                    <span>{lang === 'en' ? 'Cost Calculator' : lang === 'ja' ? 'コスト試算' : '成本與件數估算'}</span>
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
                    {lang === 'en' ? `Maker Reviews (${displayProduct.reviewsCount})` : lang === 'ja' ? `レビュー (${displayProduct.reviewsCount})` : `創客評價 (${displayProduct.reviewsCount})`}
                  </button>
                </div>

                {activeTab === 'specs' && (
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <p className="leading-relaxed">{displayProduct.description}</p>
                    <div className="space-y-1.5 pt-1">
                      {displayProduct.features.map((f, i) => (
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
                        <span className="text-slate-400 block">{lang === 'en' ? 'First Layer Bed Temp:' : lang === 'ja' ? '初期層ベッド温度：' : '第一層熱床溫度：'}</span>
                        <span className="font-mono font-bold text-slate-800">{displayProduct.bedTemp}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">{lang === 'en' ? 'Direct Retraction:' : lang === 'ja' ? 'ダイレクト引戻し：' : '回抽距離 (近端)：'}</span>
                        <span className="font-mono font-bold text-slate-800">0.8 mm (35mm/s)</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">{lang === 'en' ? 'Part Cooling Fan:' : lang === 'ja' ? '冷却ファン設定：' : '風扇冷卻轉速：'}</span>
                        <span className="font-mono font-bold text-slate-800">100% {lang === 'en' ? '(Off first 3 layers)' : lang === 'ja' ? '(最初の3層はOFF)' : '(前 3 層關閉)'}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block">{lang === 'en' ? 'Max Flow Rate (Volumetric):' : lang === 'ja' ? '最大流動レート：' : '最大流速 (Volumetric)：'}</span>
                        <span className="font-mono font-bold text-indigo-600">22 - 26 mm³/s</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-slate-400">
                        Bambu Studio, OrcaSlicer, PrusaSlicer, Cura
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyParams}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copiedParams ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">{lang === 'en' ? 'Profile Copied' : lang === 'ja' ? 'コピー完了' : '已複製切片配置'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Copy Slicer Settings' : lang === 'ja' ? '設定をコピー' : '一鍵複製切片參數'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'calculator' && (
                  <div className="space-y-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{lang === 'en' ? 'Part Weight Estimate:' : lang === 'ja' ? '造形物の想定重量：' : '預估單件列印重量 (切片軟體估重)：'}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={partWeightGrams}
                          onChange={(e) => setPartWeightGrams(Math.max(1, Number(e.target.value) || 1))}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900"
                        />
                        <span className="text-slate-500 font-medium">g</span>
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
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Cost / Part' : lang === 'ja' ? '1個あたりの材料費' : '單件線材成本'}</span>
                        <span className="text-sm font-bold text-emerald-600 font-mono">
                          {formatPrice(partCost, currency)}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Parts / Spool' : lang === 'ja' ? '1巻で印刷可能' : '1卷可印件數'}</span>
                        <span className="text-sm font-bold text-indigo-600 font-mono">
                          {lang === 'en' ? `~${partsPerSpool} pcs` : lang === 'ja' ? `約 ${partsPerSpool} 個` : `約 ${partsPerSpool} 件`}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Spool Length' : lang === 'ja' ? '総フィラメント長' : '整卷線材長度'}</span>
                        <span className="text-sm font-bold text-slate-800 font-mono">
                          ~{totalLengthMeters}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {/* Header Summary & Write Review CTA */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono text-sm">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{localProduct?.rating || 5.0}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          ({lang === 'en' ? `Total ${liveReviews.length || localProduct?.reviewsCount || 0} reviews` : lang === 'ja' ? `全 ${liveReviews.length || localProduct?.reviewsCount || 0} 件のレビュー` : `共 ${liveReviews.length || localProduct?.reviewsCount || 0} 則創客實測評價`})
                        </span>
                      </div>
                      <button
                        type="button"
                        id="detail-write-review-btn"
                        onClick={() => setIsWriteReviewOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>{lang === 'en' ? 'Write Review' : lang === 'ja' ? 'レビューを書く' : '撰寫評價'}</span>
                      </button>
                    </div>

                    {/* Review Items List */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                      {liveReviews.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-slate-500 text-xs">{lang === 'en' ? 'No reviews yet. Be the first maker to share your experience!' : lang === 'ja' ? 'まだレビューはありません。最初のレビューを投稿してみましょう！' : '目前尚無評價，歡迎成為首位留下實測心得的創客！'}</p>
                          <button
                            type="button"
                            onClick={() => setIsWriteReviewOpen(true)}
                            className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            {lang === 'en' ? 'Write the first review →' : lang === 'ja' ? '最初のレビューを投稿する →' : '立即撰寫第一則評價 →'}
                          </button>
                        </div>
                      ) : (
                        liveReviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                                  <span>{rev.userName}</span>
                                  {rev.printerModel && (
                                    <span className="text-[10px] text-slate-400 font-normal font-mono">
                                      [{rev.printerModel}]
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold border border-indigo-200/50">
                                    {lang === 'en' ? 'Maker' : lang === 'ja' ? 'メイカー' : '列印創客'}
                                  </span>
                                  {rev.verifiedPurchase && (
                                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-normal flex items-center gap-0.5 border border-emerald-200/50">
                                      <CheckCheck className="w-2.5 h-2.5 text-emerald-600"/> {lang === 'en' ? 'Verified Purchase' : lang === 'ja' ? '購入者確認済み' : '已驗證購買'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                              {rev.comment}
                            </p>
                            {rev.createdAt && (
                              <div className="text-[9px] text-slate-400 text-right">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))
                      )}
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
                <span>{lang === 'zh-TW' ? '立即結帳付款 (藍新 / LINE Pay)' : lang === 'ja' ? '今すぐ購入 (NewebPay / LINE Pay)' : 'Checkout (NewebPay / LINE Pay)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Ask AI button */}
            {onAskAI && (
              <div className="mt-2.5">
                <button
                  id="modal-ask-ai-btn"
                  type="button"
                  onClick={() => onAskAI(displayProduct)}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title={lang === 'en' ? 'Open AI Advisor to get optimal slicing settings' : lang === 'ja' ? 'AIアドバイザーに最適なスライス設定を質問' : '開啟 AI 客服小視窗詢問切片與最佳列印參數'}
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'en' ? 'Ask AI Advisor for optimal slicing parameters' : lang === 'ja' ? 'AIアドバイザーに最適なスライス設定を質問' : '打開 AI 顧問小視窗詢問此款線材切片參數'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {localProduct && (
        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          product={localProduct}
          lang={lang}
          onReviewSubmitted={(updated, review) => {
            setLocalProduct(updated);
            if (onReviewSubmitted) {
              onReviewSubmitted(updated, review);
            }
          }}
        />
      )}
    </div>
  );
};
