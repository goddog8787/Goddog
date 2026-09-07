import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Layers, 
  Tag, 
  Flame, 
  TrendingUp, 
  ArrowUpRight,
  Package,
  Sparkles
} from 'lucide-react';
import { FilamentProduct } from '../../types';
import { INITIAL_PRODUCTS } from '../../data/mockData';

export interface SearchAutocompleteProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products?: FilamentProduct[];
  placeholder?: string;
  onSelectProduct?: (product: FilamentProduct) => void;
  onSelectMaterial?: (material: string) => void;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface MaterialMeta {
  key: string;
  name: string;
  chineseName: string;
  aliases: string[];
  badge: string;
  description: string;
}

const MATERIAL_METAS: MaterialMeta[] = [
  {
    key: 'High-Speed PLA',
    name: 'High-Speed PLA',
    chineseName: '高速 PLA+ / 500mm/s',
    aliases: ['pla', 'pla+', '高速', 'hyper', '高速pla', '500', '500mm/s', '極速'],
    badge: '熱銷爆款 🔥',
    description: '低阻力高流動性，專配 Bambu / K1 / Prusa 高速機'
  },
  {
    key: 'Carbon Fiber',
    name: 'Carbon Fiber (PLA-CF)',
    chineseName: 'PLA-CF 航太級碳纖維',
    aliases: ['cf', '碳纖', '碳纖維', 'pla-cf', '碳素', '黑', '消光黑', '剛性', '結構'],
    badge: '高剛性結構 ⚡',
    description: '消光碳纖微粒表面，近乎零層紋，剛性抗拉提升 45%'
  },
  {
    key: 'PETG',
    name: 'PETG-HF',
    chineseName: 'PETG-HF 高衝擊耐候',
    aliases: ['petg', 'petg-hf', '耐溫', '耐候', '戶外', '抗衝擊', '透明'],
    badge: '戶外耐候 🛡️',
    description: '耐熱 75°C、抗 UV 紫外線與防水，適合工程日曬件'
  },
  {
    key: 'TPU',
    name: 'TPU 95A',
    chineseName: 'TPU 95A 高回彈軟膠',
    aliases: ['tpu', '95a', '軟膠', '彈性', '柔性', '橡膠', '防摔', '緩震'],
    badge: '柔韌緩震 🤸',
    description: '蕭氏硬度 95A，伸長率 550%，適合手機殼與無人機防撞'
  },
  {
    key: 'ABS',
    name: 'ABS-GF',
    chineseName: 'ABS-GF 玻璃纖維高耐溫',
    aliases: ['abs', 'abs-gf', '玻纖', '玻璃纖維', '耐熱100', '汽車', '耐溫100'],
    badge: '耐熱 100°C 🔥',
    description: '高韌性抗熱變形，汽車改裝件與封閉型機器首選'
  },
  {
    key: 'Resin',
    name: '8K Resin',
    chineseName: '8K 高精度光固化樹脂',
    aliases: ['resin', '光固化', '光敏', '樹脂', '8k', '公仔', '手辦', '模型'],
    badge: '公仔手辦首選 💎',
    description: '8K 超細微雕毛髮刻劃，清洗固化後如陶瓷細膩'
  },
  {
    key: 'Accessories',
    name: 'Accessories',
    chineseName: '3D 列印周邊配件 / 乾燥盒',
    aliases: ['配件', '乾燥', '烘乾', '乾燥盒', 'dry', 'pei', '鋼板', '彈簧鋼板'],
    badge: '防潮必備 ⚙️',
    description: '智慧恆溫乾燥防受潮盒、雙面金剛砂 PEI 彈簧鋼板'
  }
];

// Popular Brands in 3D Printing & Store
interface BrandMeta {
  name: string;
  aliases: string[];
  badge: string;
  description: string;
}

const BRAND_METAS: BrandMeta[] = [
  {
    name: '神狗勾 Pro',
    aliases: ['神狗勾', 'goddog', 'pro', '神狗勾 pro', '旗艦'],
    badge: '自研旗艦 👑',
    description: '台灣在地調校高速耗材，極速流動 ±0.02mm 公差'
  },
  {
    name: '神狗勾 Lab',
    aliases: ['lab', '實驗室', '乾燥盒', 'pei'],
    badge: '周邊配件 🛠️',
    description: '智慧烘乾乾燥盒、 Textured PEI 彈簧鋼板設備'
  },
  {
    name: 'FlexMaker',
    aliases: ['flex', 'flexmaker', '彈性'],
    badge: '軟膠專家 🤸',
    description: '專研 95A 高延展高彈性 TPU 與工業工程膠料'
  },
  {
    name: 'OptiCure',
    aliases: ['opticure', '光敏', '光固化'],
    badge: '高精光敏 💎',
    description: '8K / 12K LCD 光固化列印專用低收縮樹脂'
  },
  {
    name: 'Bambu Lab 拓竹',
    aliases: ['bambu', 'bambulab', '拓竹', 'ams', 'x1c', 'p1s', 'a1', 'a1 mini'],
    badge: 'AMS 相容 🚀',
    description: '完美相容 Bambu Lab AMS 多色供料系統與防卡線捲盤'
  }
];

// Trending quick search tags
const TRENDING_SEARCH_TAGS = [
  { label: '高速 PLA+', query: 'High-Speed PLA', icon: '🚀' },
  { label: 'PLA-CF 碳纖維', query: 'Carbon Fiber', icon: '⚡' },
  { label: 'Bambu AMS 相容', query: 'Bambu', icon: '📦' },
  { label: 'PETG 耐候', query: 'PETG', icon: '🛡️' },
  { label: 'TPU 95A 軟膠', query: 'TPU', icon: '🤸' },
  { label: 'S2 智慧乾燥盒', query: '乾燥盒', icon: '🔥' },
  { label: '神狗勾 Pro', query: '神狗勾 Pro', icon: '👑' },
  { label: '8K 光固化樹脂', query: 'Resin', icon: '💎' },
];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  searchQuery,
  setSearchQuery,
  products = INITIAL_PRODUCTS,
  placeholder = '搜尋商品材質、品牌或規格 (例如: PLA+, 碳纖維, Bambu, PETG, TPU)...',
  onSelectProduct,
  onSelectMaterial,
  className = '',
  autoFocus = false,
  id = 'input-store-search',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Compute Matched Materials
  const matchedMaterials = useMemo(() => {
    if (!trimmedQuery) return [];
    return MATERIAL_METAS.filter((mat) => {
      const matchKey = mat.key.toLowerCase().includes(trimmedQuery);
      const matchName = mat.name.toLowerCase().includes(trimmedQuery);
      const matchChinese = mat.chineseName.toLowerCase().includes(trimmedQuery);
      const matchAlias = mat.aliases.some((a) => a.includes(trimmedQuery));
      return matchKey || matchName || matchChinese || matchAlias;
    }).map((mat) => {
      const count = products.filter((p) => p.material === mat.key).length;
      return { ...mat, count };
    });
  }, [trimmedQuery, products]);

  // Compute Matched Brands
  const matchedBrands = useMemo(() => {
    if (!trimmedQuery) return [];
    return BRAND_METAS.filter((b) => {
      const matchName = b.name.toLowerCase().includes(trimmedQuery);
      const matchAlias = b.aliases.some((a) => a.includes(trimmedQuery));
      return matchName || matchAlias;
    }).map((b) => {
      // Check count of products that have this brand or mention it
      const count = products.filter((p) => 
        p.brand.toLowerCase().includes(b.name.toLowerCase()) ||
        p.name.toLowerCase().includes(b.name.toLowerCase()) ||
        b.aliases.some(a => p.name.toLowerCase().includes(a) || p.description.toLowerCase().includes(a))
      ).length;
      return { ...b, count };
    });
  }, [trimmedQuery, products]);

  // Compute Matched Products (Top 4)
  const matchedProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.material.toLowerCase().includes(trimmedQuery) ||
        p.brand.toLowerCase().includes(trimmedQuery) ||
        p.description.toLowerCase().includes(trimmedQuery) ||
        p.features.some((f) => f.toLowerCase().includes(trimmedQuery))
      );
    }).slice(0, 4);
  }, [trimmedQuery, products]);

  // Combine suggestions for keyboard navigation
  const allSuggestions = useMemo(() => {
    const list: Array<{
      type: 'material' | 'brand' | 'product' | 'tag';
      key: string;
      item: any;
    }> = [];

    matchedMaterials.forEach((m) => list.push({ type: 'material', key: `mat-${m.key}`, item: m }));
    matchedBrands.forEach((b) => list.push({ type: 'brand', key: `brand-${b.name}`, item: b }));
    matchedProducts.forEach((p) => list.push({ type: 'product', key: `prod-${p.id}`, item: p }));

    return list;
  }, [matchedMaterials, matchedBrands, matchedProducts]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [trimmedQuery]);

  const handleSelectMaterial = (mat: MaterialMeta) => {
    setSearchQuery(mat.key);
    onSelectMaterial?.(mat.key);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectBrand = (brand: BrandMeta) => {
    setSearchQuery(brand.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectProduct = (prod: FilamentProduct) => {
    setSearchQuery(prod.name);
    onSelectProduct?.(prod);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectTag = (query: string) => {
    setSearchQuery(query);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
        const item = allSuggestions[selectedIndex];
        if (item.type === 'material') handleSelectMaterial(item.item);
        else if (item.type === 'brand') handleSelectBrand(item.item);
        else if (item.type === 'product') handleSelectProduct(item.item);
      } else {
        // Just submit current query
        setIsOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper function to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-indigo-100 text-indigo-900 font-bold px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const hasMatches = matchedMaterials.length > 0 || matchedBrands.length > 0 || matchedProducts.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Search className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={searchQuery}
          autoFocus={autoFocus}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border border-slate-200 focus:border-indigo-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 ${
            size === 'sm' ? 'pl-9 pr-8 py-1.5 text-xs' : 'pl-10 pr-9 py-2.5 text-xs sm:text-sm'
          }`}
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            title="清除搜尋內容"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown Panel */}
      {isOpen && (
        <div 
          id={`${id}-autocomplete-dropdown`}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-98 duration-150 max-h-[80vh] sm:max-h-[500px] overflow-y-auto"
        >
          {/* STATE 1: Empty Query - Show Hot Trending Searches */}
          {!trimmedQuery && (
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>熱門搜尋關鍵字</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-auto">點擊快速篩選</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleSelectTag(tag.query)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer group"
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Material Category Suggestions */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>常見 3D 耗材材質系列</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {MATERIAL_METAS.slice(0, 6).map((mat) => {
                    const count = products.filter((p) => p.material === mat.key).length;
                    return (
                      <button
                        key={mat.key}
                        type="button"
                        onClick={() => handleSelectMaterial(mat)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                            <span>{mat.chineseName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {mat.description}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-700">
                          {count} 款現貨
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Has Query & Has Matches */}
          {trimmedQuery && hasMatches && (
            <div className="p-2 divide-y divide-slate-100 space-y-2">
              {/* SECTION A: Material Suggestions (商品材質建議) */}
              {matchedMaterials.length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span>耗材材質建議 (Material Recommendations)</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedMaterials.map((mat) => {
                      const globalIdx = allSuggestions.findIndex((s) => s.key === `mat-${mat.key}`);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={mat.key}
                          type="button"
                          onClick={() => handleSelectMaterial(mat)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{highlightMatch(mat.chineseName, trimmedQuery)}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                  {mat.key}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {mat.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {mat.count} 款現貨
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: Brand Suggestions (品牌建議) */}
              {matchedBrands.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>品牌專區推薦 (Brand Recommendations)</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedBrands.map((b) => {
                      const globalIdx = allSuggestions.findIndex((s) => s.key === `brand-${b.name}`);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => handleSelectBrand(b)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                              <Tag className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{highlightMatch(b.name, trimmedQuery)}</span>
                                <span className="text-[10px] text-indigo-600 font-semibold">
                                  {b.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {b.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {b.count > 0 ? `${b.count} 款相關` : '熱銷品牌'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION C: Matching Product Cards (熱門相關商品) */}
              {matchedProducts.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-500" />
                    <span>相關熱門商品 (Matching Products)</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedProducts.map((p) => {
                      const globalIdx = allSuggestions.findIndex((s) => s.key === `prod-${p.id}`);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300' : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                                {highlightMatch(p.name, trimmedQuery)}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                <span className="font-semibold text-indigo-600">{p.material}</span>
                                <span>•</span>
                                <span>{p.brand}</span>
                                <span>•</span>
                                <span>現貨 {p.stock} 卷</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs font-mono font-bold text-slate-900">
                              NT$ {p.price.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Quick Action: Search for exact query */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    inputRef.current?.blur();
                  }}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span>查看所有包含「<strong className="text-indigo-600">{searchQuery}</strong>」的耗材商品</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Enter 鍵確認</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: Has Query but NO Matches */}
          {trimmedQuery && !hasMatches && (
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  找不到符合「{searchQuery}」的材質或品牌
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  建議嘗試以下熱門規格關鍵字：
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {['High-Speed PLA', 'Carbon Fiber', 'PETG', 'TPU', 'Bambu', '神狗勾'].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleSelectTag(kw)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
