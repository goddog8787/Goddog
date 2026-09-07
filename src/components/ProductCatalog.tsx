import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  Sparkles, 
  Flame, 
  Layers, 
  Info, 
  Plus, 
  Star, 
  ShieldCheck, 
  Gauge, 
  Thermometer, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { FilamentProduct, MaterialType, ColorOption, LanguageCode, CurrencyCode } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';
import { SearchAutocomplete } from './Storefront/SearchAutocomplete';

interface ProductCatalogProps {
  products: FilamentProduct[];
  lang: LanguageCode;
  currency: CurrencyCode;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onSelectProduct: (product: FilamentProduct) => void;
  onOpenAiAdvisor: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  lang,
  currency,
  onAddToCart,
  onSelectProduct,
  onOpenAiAdvisor,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Track selected color per product for instant visual preview
  const [selectedColors, setSelectedColors] = useState<Record<string, ColorOption>>({});

  const materials: { label: string; value: string }[] = [
    { label: '全部耗材', value: 'All' },
    { label: '🚀 高速 PLA+', value: 'High-Speed PLA' },
    { label: 'PLA 經典線材', value: 'PLA' },
    { label: '🛡️ PETG 耐溫耐候', value: 'PETG' },
    { label: '⚡ 碳纖維 PLA-CF', value: 'Carbon Fiber' },
    { label: '🤸 TPU 彈性軟膠', value: 'TPU' },
    { label: '🔥 ABS 工業級', value: 'ABS' },
    { label: '💎 8K 光固化樹脂', value: 'Resin' },
    { label: '⚙️ 噴嘴與配件', value: 'Accessories' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchMaterial = selectedMaterial === 'All' || item.material === selectedMaterial;
      const matchDiameter = selectedDiameter === 'All' || item.diameter === selectedDiameter;
      const matchSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.material.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMaterial && matchDiameter && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount;
    });
  }, [products, selectedMaterial, selectedDiameter, searchQuery, sortBy]);

  const handleColorChange = (productId: string, color: ColorOption) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <div className="py-6 space-y-6">
      {/* Hero Banner with Promotion & AI Entry */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 -top-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>2026 次世代高速 3D 列印耗材專賣 · Bambu / K1 / Prusa 相容</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            高精度、極速出料、不卡料的工程耗材首選
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            全系列通過嚴格公差檢驗 (±0.02mm)，真空乾燥包裝，支援多色 AMS 系統。結合綠界科技與 LINE Pay 快速金流，今日下單極速揀貨發送！
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              id="btn-hero-ai-advisor"
              onClick={onOpenAiAdvisor}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>啟動 AI 耗材與切片參數推薦顧問</span>
            </button>

            <a
              href="#product-grid"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all"
            >
              <span>瀏覽全部現貨庫存 ({products.length} 項)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Material Filter Tabs (Horizontal Scrollable) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {materials.map((mat) => {
          const isActive = selectedMaterial === mat.value;
          return (
            <button
              key={mat.value}
              id={`filter-mat-${mat.value}`}
              onClick={() => setSelectedMaterial(mat.value)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {mat.label}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input with Autocomplete */}
        <div className="w-full md:w-96">
          <SearchAutocomplete
            id="catalog-product-search"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            products={products}
            placeholder={t.searchPlaceholder}
            onSelectProduct={(p) => onSelectProduct?.(p)}
            onSelectMaterial={(m) => setSelectedMaterial(m as any)}
            size="sm"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
          {/* Diameter Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <span className="text-slate-400 px-1 text-[11px]">線徑:</span>
            {['All', '1.75mm', '2.85mm'].map((dia) => (
              <button
                key={dia}
                onClick={() => setSelectedDiameter(dia)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedDiameter === dia
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dia === 'All' ? '全部' : dia}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            id="select-product-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-medium"
          >
            <option value="popular">熱銷人氣排行</option>
            <option value="price-asc">價格由低到高</option>
            <option value="price-desc">價格由高到低</option>
            <option value="rating">顧客好評最高</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((product) => {
          const activeColor = selectedColors[product.id] || product.colors[0];
          const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

          return (
            <div
              key={product.id}
              id={`card-product-${product.id}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all flex flex-col"
            >
              {/* Image & Badge Area */}
              <div 
                className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {product.badge}
                  </span>
                )}

                {/* Discount Tag */}
                {discountPercent > 0 && (
                  <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    省 {discountPercent}%
                  </span>
                )}

                {/* Diameter & Weight pill */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-0.5 rounded-md shadow-xs">
                  <span>{product.diameter}</span>
                  <span>·</span>
                  <span>{product.weight}</span>
                </div>
              </div>

              {/* Product Info Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">
                      {product.brand}
                    </span>
                    <div className="flex items-center space-x-1 text-amber-500 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400">({product.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 
                    onClick={() => onSelectProduct(product)}
                    className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Color Swatches Selection */}
                {product.colors.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5">
                      <span className="font-medium">顏色: <span className="font-bold text-slate-900">{activeColor.name}</span></span>
                      <span className="text-slate-400">現貨 {activeColor.stock} 卷</span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {product.colors.map((color) => {
                        const isSelected = activeColor.name === color.name;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleColorChange(product.id, color)}
                            className={`w-5 h-5 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'ring-2 ring-sky-500 ring-offset-1 scale-110 border-white'
                                : 'border-slate-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name} (庫存: ${color.stock})`}
                          >
                            {isSelected && (
                              <Check 
                                className={`w-3 h-3 ${
                                  color.hex === '#ffffff' || color.hex === '#f8fafc' || color.hex === '#e0f2fe' 
                                    ? 'text-slate-900' 
                                    : 'text-white'
                                }`} 
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Slicer Quick Specs */}
                <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 grid grid-cols-2 gap-1 font-mono">
                  <div className="flex items-center space-x-1 truncate">
                    <Thermometer className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{product.nozzleTemp}</span>
                  </div>
                  <div className="flex items-center space-x-1 truncate">
                    <Gauge className="w-3 h-3 text-sky-500 shrink-0" />
                    <span>{product.maxSpeed}</span>
                  </div>
                </div>

                {/* Price & Action Button Area */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        {formatCurrency(product.price, currency)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through font-mono">
                          {formatCurrency(product.originalPrice, currency)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      綠界 / LINE Pay 一鍵扣款
                    </span>
                  </div>

                  <button
                    id={`btn-add-cart-${product.id}`}
                    onClick={() => onAddToCart(product, activeColor, product.diameter, 1)}
                    className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-sky-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>加入</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">找不到符合條件的耗材商品</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            建議調整搜尋關鍵字或清除篩選條件，或是啟動 AI 耗材顧問為您尋找最合適的替代材質。
          </p>
          <button
            onClick={() => {
              setSelectedMaterial('All');
              setSelectedDiameter('All');
              setSearchQuery('');
            }}
            className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重設所有篩選條件</span>
          </button>
        </div>
      )}
    </div>
  );
};
