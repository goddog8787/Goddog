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
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { normalizeProductSearch, prepareProductSearch, evaluateProductDeepSearch, expandAssociativeKeywords } from '../../utils/productSearch';

export interface SearchAutocompleteProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products?: FilamentProduct[];
  placeholder?: string;
  onSubmitQuery?: (query: string) => void;
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
    name: '神狗勾',
    aliases: ['神狗勾', 'goddog', '自研', '旗艦'],
    badge: '自研品牌 👑',
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
  { label: '神狗勾自研耗材', query: '神狗勾', icon: '👑' },
  { label: '8K 光固化樹脂', query: 'Resin', icon: '💎' },
];

const FALLBACK_SEARCH_TAGS = ['High-Speed PLA', 'Carbon Fiber', 'PETG', 'TPU', 'Bambu', '神狗勾'];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  searchQuery,
  setSearchQuery,
  products = INITIAL_PRODUCTS,
  placeholder = '搜尋 PLA+、碳纖維、PETG 或品牌型號',
  onSubmitQuery,
  onSelectProduct,
  onSelectMaterial,
  className = '',
  autoFocus = false,
  id = 'input-store-search',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveKey(null);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global '/' keyboard shortcut to focus the main storefront search bar
  useEffect(() => {
    if (id !== 'storefront-product-search') return;
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;
      if (inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, [id]);

  const trimmedQuery = isOpen ? normalizeProductSearch(searchQuery) : '';
  const expandedTokens = useMemo(() => expandAssociativeKeywords(trimmedQuery), [trimmedQuery]);

  // Compute Matched Materials (including deep associative keywords)
  const matchedMaterials = useMemo(() => {
    if (!trimmedQuery) return [];
    return MATERIAL_METAS.filter((mat) => {
      const matchKey = mat.key.toLowerCase().includes(trimmedQuery);
      const matchName = mat.name.toLowerCase().includes(trimmedQuery);
      const matchChinese = mat.chineseName.toLowerCase().includes(trimmedQuery);
      const matchDesc = mat.description.toLowerCase().includes(trimmedQuery);
      const matchAlias = mat.aliases.some(
        (a) => a.includes(trimmedQuery) || expandedTokens.includes(a.toLowerCase())
      );
      const matchExpanded = expandedTokens.some(
        (t) =>
          mat.key.toLowerCase().includes(t) ||
          mat.chineseName.toLowerCase().includes(t) ||
          mat.description.toLowerCase().includes(t)
      );
      return matchKey || matchName || matchChinese || matchDesc || matchAlias || matchExpanded;
    }).map((mat) => {
      const count = products.filter((p) => p.material === mat.key).length;
      return { ...mat, count };
    });
  }, [trimmedQuery, products, expandedTokens]);

  // Compute Matched Brands (including deep associative keywords)
  const matchedBrands = useMemo(() => {
    if (!trimmedQuery) return [];
    return BRAND_METAS.filter((b) => {
      const matchName = b.name.toLowerCase().includes(trimmedQuery);
      const matchAlias = b.aliases.some(
        (a) => a.includes(trimmedQuery) || expandedTokens.includes(a.toLowerCase())
      );
      return matchName || matchAlias;
    }).map((b) => {
      const count = products.filter(
        (p) =>
          p.brand.toLowerCase().includes(b.name.toLowerCase()) ||
          p.name.toLowerCase().includes(b.name.toLowerCase()) ||
          b.aliases.some(
            (a) =>
              p.name.toLowerCase().includes(a) ||
              p.description.toLowerCase().includes(a) ||
              (p.features || []).some((f) => f.toLowerCase().includes(a))
          )
      ).length;
      return { ...b, count };
    });
  }, [trimmedQuery, products, expandedTokens]);

  // Compute Matched Products (Top 6) using Deep Features & Associative Keyword Search
  const matchedProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    const query = prepareProductSearch(trimmedQuery);
    return products
      .map((p) => {
        const evalRes = evaluateProductDeepSearch(p, query);
        if (!evalRes.matched) return null;
        return {
          product: p,
          score: evalRes.score,
          matchedFeatures: evalRes.matchedFeatures,
        };
      })
      .filter(
        (
          item
        ): item is {
          product: FilamentProduct;
          score: number;
          matchedFeatures: string[];
        } => item !== null
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [trimmedQuery, products]);

  const dropdownId = `${id}-autocomplete-dropdown`;
  const finishSelection = () => {
    setActiveKey(null);
    setIsOpen(false);
  };

  const submitQuery = (query: string) => {
    const trimmed = query.trim();
    finishSelection();
    if (trimmed) onSubmitQuery?.(trimmed);
  };

  const handleSelectMaterial = (mat: MaterialMeta) => {
    setSearchQuery(mat.key);
    onSelectMaterial?.(mat.key);
    submitQuery(mat.key);
  };

  const handleSelectBrand = (brand: BrandMeta) => {
    setSearchQuery(brand.name);
    submitQuery(brand.name);
  };

  const handleSelectProduct = (prod: FilamentProduct) => {
    setSearchQuery(prod.name);
    if (onSelectProduct) {
      onSelectProduct(prod);
      finishSelection();
    } else {
      submitQuery(prod.name);
    }
  };

  const handleSelectTag = (query: string) => {
    setSearchQuery(query);
    submitQuery(query);
  };

  const hasMatches = matchedMaterials.length > 0 || matchedBrands.length > 0 || matchedProducts.length > 0;
  const suggestions = !trimmedQuery ? [
    ...TRENDING_SEARCH_TAGS.map(tag => ({ key: `tag-${tag.query}`, select: () => handleSelectTag(tag.query) })),
    ...MATERIAL_METAS.slice(0, 6).map(mat => ({ key: `popular-${mat.key}`, select: () => handleSelectMaterial(mat) })),
  ] : hasMatches ? [
    ...matchedMaterials.map(mat => ({ key: `mat-${mat.key}`, select: () => handleSelectMaterial(mat) })),
    ...matchedBrands.map(brand => ({ key: `brand-${brand.name}`, select: () => handleSelectBrand(brand) })),
    ...matchedProducts.map(({ product }) => ({ key: `prod-${product.id}`, select: () => handleSelectProduct(product) })),
    { key: 'all', select: () => submitQuery(searchQuery) },
  ] : FALLBACK_SEARCH_TAGS.map(query => ({ key: `fallback-${query}`, select: () => handleSelectTag(query) }));
  const selectedIndex = suggestions.findIndex(option => option.key === activeKey);
  const activeId = isOpen && selectedIndex >= 0 ? `${dropdownId}-option-${selectedIndex}` : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const optionProps = (key: string) => {
    const index = suggestions.findIndex(option => option.key === key);
    return {
      id: `${dropdownId}-option-${index}`,
      role: 'option',
      tabIndex: -1,
      'aria-selected': index === selectedIndex,
      onMouseDown: (event: React.MouseEvent) => event.preventDefault(),
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      finishSelection();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const last = suggestions.length - 1;
      const nextIndex = e.key === 'ArrowDown'
        ? (selectedIndex === last ? 0 : selectedIndex + 1)
        : (selectedIndex <= 0 ? last : selectedIndex - 1);
      setActiveKey(suggestions[nextIndex]?.key ?? null);
    } else if (e.key === 'Enter' && (isOpen || onSubmitQuery)) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      if (selected) selected.select();
      else submitQuery(searchQuery);
    }
  };

  // Helper function to highlight matching text robustly without RegExp
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: { text: string; isMatch: boolean }[] = [];
    
    let start = 0;
    let idx = lowerText.indexOf(lowerQuery, start);
    
    while (idx !== -1) {
      if (idx > start) {
        parts.push({ text: text.substring(start, idx), isMatch: false });
      }
      parts.push({ text: text.substring(idx, idx + query.length), isMatch: true });
      start = idx + query.length;
      idx = lowerText.indexOf(lowerQuery, start);
    }
    
    if (start < text.length) {
      parts.push({ text: text.substring(start), isMatch: false });
    }

    return (
      <>
        {parts.map((part, i) =>
          part.isMatch ? (
            <mark key={i} className="bg-indigo-100 dark:bg-indigo-500/30 text-indigo-900 dark:text-indigo-200 font-bold px-0.5 rounded-sm">
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </>
    );
  };



  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-indigo-400 transition-colors">
          <Search className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? dropdownId : undefined}
          aria-activedescendant={activeId}
          autoComplete="off"
          value={searchQuery}
          autoFocus={autoFocus}
          onChange={(e) => {
            setActiveKey(null);
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={finishSelection}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-slate-100/75 dark:bg-slate-800/75 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 focus:border-slate-900 dark:focus:border-indigo-400 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-indigo-500/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-ellipsis ${
            size === 'sm' ? 'pl-9 pr-8 py-2 text-xs' : 'pl-10 pr-9 sm:pr-11 h-11 text-[13px] sm:text-sm'
          }`}
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveKey(null);
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="清除搜尋內容"
            aria-label="清除搜尋內容"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : id === 'storefront-product-search' ? (
          <kbd
            className="hidden sm:inline-flex items-center justify-center w-6 h-6 text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-md absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none shadow-2xs"
            title="按 / 鍵快速搜尋"
          >
            /
          </kbd>
        ) : null}
      </div>

      {/* Autocomplete Suggestions Dropdown Panel */}
      {isOpen && (
        <div 
          id={dropdownId}
          role="listbox"
          aria-label={placeholder}
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/90 z-50 overflow-hidden store-search-panel max-h-[75vh] sm:max-h-[480px] overflow-y-auto [&_[aria-selected=true]]:outline-2 [&_[aria-selected=true]]:outline-offset-[-2px] [&_[aria-selected=true]]:outline-indigo-500"
        >
          {/* STATE 1: Empty Query - Show Hot Trending Searches */}
          {!trimmedQuery && (
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>熱門搜尋關鍵字</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-auto">點擊快速篩選</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      {...optionProps(`tag-${tag.query}`)}
                      type="button"
                      onClick={() => handleSelectTag(tag.query)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/70 dark:border-slate-700/70 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Material Category Suggestions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>常見 3D 耗材材質系列</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {MATERIAL_METAS.slice(0, 6).map((mat) => {
                    const count = products.filter((p) => p.material === mat.key).length;
                    return (
                      <button
                        key={mat.key}
                        {...optionProps(`popular-${mat.key}`)}
                        type="button"
                        onClick={() => handleSelectMaterial(mat)}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {mat.chineseName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {mat.description}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono tabular-nums font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 shrink-0">
                          {count} 款
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
            <div className="p-2 divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
              {/* SECTION A: Material Suggestions */}
              {matchedMaterials.length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span>耗材材質建議</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedMaterials.map((mat) => {
                      const globalIdx = suggestions.findIndex((s) => s.key === `mat-${mat.key}`);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={mat.key}
                          {...optionProps(`mat-${mat.key}`)}
                          type="button"
                          onClick={() => handleSelectMaterial(mat)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-300 dark:ring-indigo-700'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/60">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                                <span>{highlightMatch(mat.chineseName, trimmedQuery)}</span>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">
                                  {mat.key}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {mat.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                              {mat.count} 款
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: Brand Suggestions */}
              {matchedBrands.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>品牌專區推薦</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedBrands.map((b) => {
                      const globalIdx = suggestions.findIndex((s) => s.key === `brand-${b.name}`);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={b.name}
                          {...optionProps(`brand-${b.name}`)}
                          type="button"
                          onClick={() => handleSelectBrand(b)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-300 dark:ring-indigo-700'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
                              <Tag className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{highlightMatch(b.name, trimmedQuery)}</span>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                  {b.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {b.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-mono tabular-nums font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {b.count > 0 ? `${b.count} 款` : '熱銷品牌'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION C: Matching Product Cards */}
              {matchedProducts.length > 0 && (
                <div className="pt-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-500" />
                    <span>相關熱門商品</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {matchedProducts.map(({ product: p, matchedFeatures }) => {
                      const globalIdx = suggestions.findIndex((s) => s.key === `prod-${p.id}`);
                      const isSelected = globalIdx === selectedIndex;
                      const primaryFeature =
                        matchedFeatures[0] || (Array.isArray(p.features) && p.features[0]) || '';
                      return (
                        <button
                          key={p.id}
                          {...optionProps(`prod-${p.id}`)}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-300 dark:ring-indigo-700'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {p.imageUrl && p.imageUrl.trim() !== '' ? (
                              <img
                                src={getSafeProductImageUrl(p.imageUrl, p.material, p.name)}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                                onError={(e) => handleProductImageError(e, p.material, p.name)}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[210px] sm:max-w-md">
                                {highlightMatch(p.name, trimmedQuery)}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{p.material}</span>
                                <span>·</span>
                                <span>{p.brand}</span>
                                <span>·</span>
                                <span className="font-mono tabular-nums">庫存 {p.stock}</span>
                              </div>
                              {primaryFeature && (
                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-md w-fit max-w-[210px] sm:max-w-md truncate">
                                  <Sparkles className="w-2.5 h-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  <span className="truncate">
                                    {highlightMatch(primaryFeature, trimmedQuery)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
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
                  {...optionProps('all')}
                  onClick={() => submitQuery(searchQuery)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">查看所有「<strong className="text-indigo-600 dark:text-indigo-400">{searchQuery}</strong>」相關耗材</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-2">Enter</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: Has Query but NO Matches */}
          {trimmedQuery && !hasMatches && (
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  找不到符合「{searchQuery}」的材質或品牌
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  建議嘗試以下熱門規格關鍵字：
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {FALLBACK_SEARCH_TAGS.map((kw) => (
                  <button
                    key={kw}
                    {...optionProps(`fallback-${kw}`)}
                    type="button"
                    onClick={() => handleSelectTag(kw)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
