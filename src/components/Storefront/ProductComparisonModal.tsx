import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  Scale,
  ShoppingCart,
  Check,
  Zap,
  Gauge,
  Flame,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  SlidersHorizontal,
  Thermometer,
  Wind,
  Package,
  CheckCircle2,
  Tag,
  Boxes,
  Compass,
  Activity,
  Search,
  Plus,
  Store,
  ChevronRight,
  Eye,
  CheckCheck
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  comparisonIds: string[];
  onToggleCompare?: (id: string) => void;
  onSetComparisonIds?: (ids: string[]) => void;
  onRemoveComparisonId?: (id: string) => void;
  onRemoveComparison?: (id: string) => void;
  onClearAll?: () => void;
  onClearComparison?: () => void;
  onAddToCart: (product: FilamentProduct, color?: any, diameter?: any, quantity?: number) => void;
  currency: CurrencyCode;
  lang?: LanguageCode;
}

export interface MaterialSpecInfo {
  tensile: string;
  hdt: string;
  impact: string;
  ams: string;
  amsCompatible: boolean;
  enclosure: string;
  odor: string;
  surfaceFinish: string;
  idealFor: string;
}

// Comprehensive material mechanical and physical specs
const SPEC_MAPPING: Record<string, MaterialSpecInfo> = {
  'High-Speed PLA': {
    tensile: '52 MPa (高剛性)',
    hdt: '55°C (常溫耐候)',
    impact: '16 kJ/m²',
    ams: '完全相容 (首選)',
    amsCompatible: true,
    enclosure: '不需要 (開放通風佳)',
    odor: '無氣味 (天然玉米澱粉)',
    surfaceFinish: '細緻微光澤',
    idealFor: '高速打樣、展示模型、公仔手辦',
  },
  'PLA': {
    tensile: '50 MPa (高剛性)',
    hdt: '55°C (常溫耐候)',
    impact: '15 kJ/m²',
    ams: '完全相容 (首選)',
    amsCompatible: true,
    enclosure: '不需要 (開放式)',
    odor: '極低無味 (環保無毒)',
    surfaceFinish: '光滑均勻',
    idealFor: '日常通用、機構原型、新手入門',
  },
  'PLA Matte': {
    tensile: '48 MPa (韌性改良)',
    hdt: '53°C',
    impact: '17 kJ/m²',
    ams: '完全相容',
    amsCompatible: true,
    enclosure: '不需要',
    odor: '極低無味',
    surfaceFinish: '莫蘭迪消光 (極致隱藏層紋)',
    idealFor: '藝術擺件、攝影道具、室內裝飾',
  },
  'PLA Silk': {
    tensile: '45 MPa',
    hdt: '52°C',
    impact: '14 kJ/m²',
    ams: '完全相容',
    amsCompatible: true,
    enclosure: '不需要',
    odor: '極低無味',
    surfaceFinish: '金屬絲綢光澤 (極高反光)',
    idealFor: '花瓶、獎盃、酷炫漸變金屬禮品',
  },
  'PLA-CF': {
    tensile: '78 MPa (碳纖極高剛性)',
    hdt: '62°C',
    impact: '18 kJ/m²',
    ams: '完全相容 (需耐磨噴嘴)',
    amsCompatible: true,
    enclosure: '不需要 (通風環境佳)',
    odor: '無氣味',
    surfaceFinish: '磨砂消光碳纖岩石質感',
    idealFor: '無人機機臂、工具卡扣、剛性夾具',
  },
  'Carbon Fiber': {
    tensile: '78 MPa (碳纖極高剛性)',
    hdt: '65°C',
    impact: '18 kJ/m²',
    ams: '完全相容 (需耐磨噴嘴)',
    amsCompatible: true,
    enclosure: '不需要 (通風佳)',
    odor: '極微弱',
    surfaceFinish: '啞光碳纖粗獷層紋',
    idealFor: '高強度工程治具、外骨骼框架',
  },
  'PLA Wood': {
    tensile: '38 MPa',
    hdt: '50°C',
    impact: '12 kJ/m²',
    ams: '建議手動進料 (含真木粉)',
    amsCompatible: false,
    enclosure: '不需要',
    odor: '天然木質清香',
    surfaceFinish: '原木觸感 (可打磨上蠟)',
    idealFor: '木藝模型、復古家具雕件、工藝品',
  },
  'PLA Glow': {
    tensile: '47 MPa',
    hdt: '52°C',
    impact: '14 kJ/m²',
    ams: '完全相容 (硬化鋼噴嘴佳)',
    amsCompatible: true,
    enclosure: '不需要',
    odor: '無氣味',
    surfaceFinish: '吸光蓄能夜光 / 感溫變色',
    idealFor: '夜間安全標記、酷炫玩具模型',
  },
  'LW-PLA': {
    tensile: '25 MPa (微發泡輕量)',
    hdt: '52°C',
    impact: '10 kJ/m²',
    ams: '手動進料',
    amsCompatible: false,
    enclosure: '不需要',
    odor: '無氣味',
    surfaceFinish: '主動發泡啞光 (密度0.54g/cm³)',
    idealFor: '遙控RC固定翼航模、輕量無人機',
  },
  'PETG': {
    tensile: '46 MPa (高韌性抗裂)',
    hdt: '75°C (抗溫水耐候)',
    impact: '22 kJ/m² (耐摔耐衝擊)',
    ams: '完全相容 (需注意乾燥)',
    amsCompatible: true,
    enclosure: '不需要 (微溫通風佳)',
    odor: '微弱無毒',
    surfaceFinish: '高光澤半透質感',
    idealFor: '戶外耐候件、水杯支架、車用結構件',
  },
  'PETG-CF': {
    tensile: '68 MPa (耐溫抗衝擊平衡)',
    hdt: '82°C',
    impact: '24 kJ/m²',
    ams: '完全相容 (需硬化鋼噴嘴)',
    amsCompatible: true,
    enclosure: '建議保溫 (防翹曲)',
    odor: '極微弱',
    surfaceFinish: '消光磨砂碳纖質感',
    idealFor: '戶外機器人外殼、受力結構支架',
  },
  'ABS': {
    tensile: '42 MPa (耐磨耗易加工)',
    hdt: '98°C (耐高溫熱風)',
    impact: '28 kJ/m² (極耐衝擊)',
    ams: '完全相容 (需先烘乾)',
    amsCompatible: true,
    enclosure: '必須封箱恒溫 (防止邊角開裂)',
    odor: '有塑膠味 (建議排風/活性碳)',
    surfaceFinish: '半消光 (可丙酮蒸氣拋光)',
    idealFor: '車用高溫配件、電器外殼、傳動齒輪',
  },
  'ASA': {
    tensile: '44 MPa (極致耐紫外線)',
    hdt: '100°C (耐烈日曬烤)',
    impact: '30 kJ/m²',
    ams: '完全相容',
    amsCompatible: true,
    enclosure: '必須封箱恒溫',
    odor: '微弱氣味',
    surfaceFinish: '消光抗紫外線保護層',
    idealFor: '汽機車外飾件、室外天線監控盒',
  },
  'TPU': {
    tensile: '35 MPa (彈性橡膠體)',
    hdt: '50°C',
    impact: '無破裂 (超耐撕裂 95A)',
    ams: '不建議 (軟膠易卡進料管)',
    amsCompatible: false,
    enclosure: '不需要 (直驅擠出佳)',
    odor: '無氣味',
    surfaceFinish: '橡膠防滑觸感',
    idealFor: '手機防摔殼、減震腳墊、密封墊圈',
  },
  'PA-CF': {
    tensile: '115 MPa (金屬替代級剛度)',
    hdt: '155°C (航太極限耐熱)',
    impact: '35 kJ/m²',
    ams: '完全相容 (需高溫烘烤)',
    amsCompatible: true,
    enclosure: '必須封箱恒溫 (高溫熱床)',
    odor: '極微弱',
    surfaceFinish: '消光碳纖粗礦金屬質感',
    idealFor: '取代鋁合金結構、引擎室治具、夾具',
  },
  'PC (Polycarbonate)': {
    tensile: '68 MPa (航太防彈級)',
    hdt: '118°C',
    impact: '40 kJ/m²',
    ams: '完全相容 (高溫熱床)',
    amsCompatible: true,
    enclosure: '必須封箱恒溫',
    odor: '極微弱',
    surfaceFinish: '高透明硬朗質感',
    idealFor: '高溫燈罩、受力防爆保護蓋、工業部件',
  },
};

// Fallback resolver for any custom or new materials
export function getMaterialSpecs(material: string): MaterialSpecInfo {
  if (SPEC_MAPPING[material]) {
    return SPEC_MAPPING[material];
  }

  const lower = (material || '').toLowerCase();
  if (lower.includes('cf') || lower.includes('碳纖')) {
    return {
      tensile: '75 MPa (碳纖維高剛性)',
      hdt: '70°C~150°C',
      impact: '20 kJ/m²',
      ams: '完全相容 (需硬化鋼噴嘴)',
      amsCompatible: true,
      enclosure: '建議保溫',
      odor: '微弱',
      surfaceFinish: '消光微砂岩紋理',
      idealFor: '無人機、工具夾具、耐受力機構件',
    };
  }
  if (lower.includes('tpu') || lower.includes('flex')) {
    return {
      tensile: '35 MPa (彈性橡膠體)',
      hdt: '50°C',
      impact: '無破裂 (超彈性韌度)',
      ams: '不建議 (軟質線材易卡料)',
      amsCompatible: false,
      enclosure: '不需要',
      odor: '無氣味',
      surfaceFinish: '橡膠消光彈性觸感',
      idealFor: '手機殼、減震腳墊、軟質緩衝件',
    };
  }
  if (lower.includes('petg')) {
    return SPEC_MAPPING['PETG'];
  }
  if (lower.includes('abs') || lower.includes('asa')) {
    return SPEC_MAPPING['ABS'];
  }
  if (lower.includes('nylon') || lower.includes('pa')) {
    return SPEC_MAPPING['PA-CF'];
  }
  if (lower.includes('pc')) {
    return SPEC_MAPPING['PC (Polycarbonate)'];
  }

  return SPEC_MAPPING['PLA'];
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  comparisonIds,
  onToggleCompare,
  onSetComparisonIds,
  onRemoveComparisonId,
  onRemoveComparison,
  onClearAll,
  onClearComparison,
  onAddToCart,
  currency,
  lang = 'zh-TW',
}) => {
  // Feature States: Highlight parameter differences & Only show differences filter
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [onlyShowDifferences, setOnlyShowDifferences] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [showPickerInTable, setShowPickerInTable] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleRemove = (id: string) => {
    if (onRemoveComparison) onRemoveComparison(id);
    if (onRemoveComparisonId) onRemoveComparisonId(id);
  };

  const handleClear = () => {
    if (onClearComparison) onClearComparison();
    if (onClearAll) onClearAll();
  };

  const handleToggleProduct = (id: string) => {
    if (onToggleCompare) {
      onToggleCompare(id);
    } else if (comparisonIds.includes(id)) {
      handleRemove(id);
    } else if (onSetComparisonIds && comparisonIds.length < 4) {
      onSetComparisonIds([...comparisonIds, id]);
    }
  };

  const handleApplyPreset = (presetProducts: FilamentProduct[]) => {
    const ids = presetProducts.map((p) => p.id);
    if (onSetComparisonIds) {
      onSetComparisonIds(ids);
    } else {
      if (onClearComparison) onClearComparison();
      ids.forEach((id) => onToggleCompare?.(id));
    }
    setShowPickerInTable(false);
  };

  const handleAdd = (p: FilamentProduct) => {
    onAddToCart(p, p.colors?.[0]?.name, p.diameter || '1.75mm', 1);
  };

  const comparedProducts = useMemo(() => {
    return products.filter((p) => comparisonIds.includes(p.id));
  }, [products, comparisonIds]);

  // Popular Presets for Instant 1-Click Comparison
  const popularPresets = useMemo(() => {
    const findProduct = (matcher: (p: FilamentProduct) => boolean) => products.find(matcher);
    const pla = findProduct((p) => p.material?.toLowerCase().includes('pla') && !p.material?.toLowerCase().includes('cf')) || products[0];
    const petg = findProduct((p) => p.material?.toLowerCase().includes('petg') && !p.material?.toLowerCase().includes('cf')) || products[2] || products[1];
    const cf = findProduct((p) => p.material?.toLowerCase().includes('cf') || p.material?.includes('碳纖')) || products[1];
    const abs = findProduct((p) => p.material?.toLowerCase().includes('abs')) || products[3] || products[0];
    const tpu = findProduct((p) => p.material?.toLowerCase().includes('tpu')) || products[4] || products[0];

    return [
      {
        id: 'preset-pla-petg',
        title: '⚡ 高速 PLA vs 全能 PETG',
        badge: '🔥 新手熱銷首選',
        description: '600mm/s 極速易印 vs 75°C 戶外耐候防水',
        items: [pla, petg].filter(Boolean) as FilamentProduct[],
        borderClass: 'border-sky-300 hover:border-sky-400 bg-sky-50/40 hover:bg-sky-50',
        badgeClass: 'bg-sky-100 text-sky-800',
      },
      {
        id: 'preset-petg-cf',
        title: '🛡️ PETG vs 碳纖複材 PETG-CF',
        badge: '🔬 工程剛性必比',
        description: '日常耐衝擊韌性 vs 75+ MPa 航太抗彎剛性消光紋',
        items: [petg, cf].filter(Boolean) as FilamentProduct[],
        borderClass: 'border-indigo-300 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50',
        badgeClass: 'bg-indigo-100 text-indigo-800',
      },
      {
        id: 'preset-pla-abs',
        title: '🚀 High-Speed PLA vs ABS 工程',
        badge: '🌡️ 常溫 vs 耐高溫',
        description: '常溫免封箱高速成型 vs 98°C 車載高溫耐熱抗變形',
        items: [pla, abs].filter(Boolean) as FilamentProduct[],
        borderClass: 'border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50',
        badgeClass: 'bg-amber-100 text-amber-800',
      },
      {
        id: 'preset-pla-tpu',
        title: '🤸 標準 PLA+ vs TPU 95A 軟膠',
        badge: '✨ 剛柔互補對比',
        description: '堅硬剛性結構件 vs 橡膠高回彈減震抗摔軟膠',
        items: [pla, tpu].filter(Boolean) as FilamentProduct[],
        borderClass: 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50',
        badgeClass: 'bg-emerald-100 text-emerald-800',
      },
    ];
  }, [products]);

  // Filtered products for quick picker
  const filteredPickerProducts = useMemo(() => {
    return products.filter((p) => {
      const s = pickerSearch.trim().toLowerCase();
      const matchSearch =
        s === '' ||
        p.name.toLowerCase().includes(s) ||
        p.material.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s);

      const mat = p.material.toLowerCase();
      const matchCat =
        pickerCategory === 'all' ||
        (pickerCategory === 'pla' && mat.includes('pla') && !mat.includes('cf')) ||
        (pickerCategory === 'petg' && mat.includes('petg') && !mat.includes('cf')) ||
        (pickerCategory === 'cf' && (mat.includes('cf') || mat.includes('碳纖'))) ||
        (pickerCategory === 'abs' && (mat.includes('abs') || mat.includes('asa'))) ||
        (pickerCategory === 'tpu' && mat.includes('tpu'));

      return matchSearch && matchCat;
    });
  }, [products, pickerSearch, pickerCategory]);

  // Specification Definitions for Side-by-Side Analysis
  interface SpecRow {
    id: string;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    getValue: (p: FilamentProduct) => string;
    renderCell: (p: FilamentProduct, isDiff: boolean) => React.ReactNode;
  }

  const specRows: SpecRow[] = useMemo(() => [
    {
      id: 'material',
      label: '材料種類分類',
      sublabel: '聚合物主類別與特性',
      icon: <Layers className="w-3.5 h-3.5" />,
      getValue: (p) => p.material || '',
      renderCell: (p, isDiff) => {
        const isPLA = p.material.toLowerCase().includes('pla');
        const isPETG = p.material.toLowerCase().includes('petg');
        const isABS = p.material.toLowerCase().includes('abs') || p.material.toLowerCase().includes('asa');
        const isCF = p.material.toLowerCase().includes('cf') || p.material.toLowerCase().includes('碳纖');
        const isTPU = p.material.toLowerCase().includes('tpu');

        return (
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black font-mono shadow-2xs w-fit ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}
            >
              {isCF ? '🔬 ' : isTPU ? '🤸 ' : isPETG ? '💧 ' : isABS ? '🛡️ ' : '🌱 '}
              {p.material}
            </span>
          </div>
        );
      },
    },
    {
      id: 'nozzleTemp',
      label: '推薦噴嘴溫度',
      sublabel: '熱端擠出溫度區間',
      icon: <Flame className="w-3.5 h-3.5" />,
      getValue: (p) => p.nozzleTemp || '',
      renderCell: (p, isDiff) => {
        const tempNum = parseInt(p.nozzleTemp) || 210;
        const isHighTemp = tempNum >= 250;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isHighTemp ? 'text-rose-500' : 'text-amber-500'}`} />
              <span>{p.nozzleTemp}</span>
            </span>
            {isHighTemp && isDiff && (
              <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                高溫耐磨喉管
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'bedTemp',
      label: '推薦熱床溫度',
      sublabel: '熱床加熱需求 (°C)',
      icon: <Thermometer className="w-3.5 h-3.5" />,
      getValue: (p) => p.bedTemp || '',
      renderCell: (p, isDiff) => {
        const bedNum = parseInt(p.bedTemp) || 50;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5 text-indigo-500" />
              <span>{p.bedTemp}</span>
            </span>
            {bedNum <= 55 && isDiff && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                省電可免保溫
              </span>
            )}
            {bedNum >= 80 && isDiff && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                需高溫底板
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'maxSpeed',
      label: '推薦列印極速',
      sublabel: '切片流速極限 (mm/s)',
      icon: <Gauge className="w-3.5 h-3.5" />,
      getValue: (p) => p.maxSpeed || '',
      renderCell: (p, isDiff) => {
        const isSuperFast = p.maxSpeed.includes('600') || p.maxSpeed.includes('500');
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-black ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-sky-50 text-sky-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-sky-500" />
              <span>{p.maxSpeed}</span>
            </span>
            {isSuperFast && (
              <span className="text-[10px] bg-cyan-500 text-white px-1.5 py-0.5 rounded font-black tracking-wider uppercase shadow-2xs">
                高速認證
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'hdt',
      label: '熱變形溫度 (HDT)',
      sublabel: '耐溫抗軟化極限 (°C)',
      icon: <Zap className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).hdt,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        const temp = parseInt(specs.hdt) || 55;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : temp >= 75
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-slate-800'
              }`}
            >
              {specs.hdt}
            </span>
            {temp >= 75 && isDiff && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                抗戶外溫水
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'tensile',
      label: '抗拉強度 (Tensile)',
      sublabel: 'Tensile Strength (MPa)',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).tensile,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-medium ${
              isDiff
                ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20 font-bold'
                : 'text-slate-800'
            }`}
          >
            {specs.tensile}
          </span>
        );
      },
    },
    {
      id: 'impact',
      label: '耐衝擊強度 (Izod)',
      sublabel: '抗摔落破裂韌性',
      icon: <Activity className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).impact,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-medium ${
              isDiff
                ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20 font-bold'
                : 'text-slate-800'
            }`}
          >
            {specs.impact}
          </span>
        );
      },
    },
    {
      id: 'ams',
      label: '拓竹 AMS 多色相容性',
      sublabel: '四色自動進退料支援',
      icon: <Boxes className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).ams,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                isDiff
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                  : specs.amsCompatible
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {specs.amsCompatible ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{specs.ams}</span>
            </span>
          </div>
        );
      },
    },
    {
      id: 'enclosure',
      label: '箱體保溫與氣味要求',
      sublabel: '是否需密閉封箱與排風',
      icon: <Wind className="w-3.5 h-3.5" />,
      getValue: (p) => `${getMaterialSpecs(p.material).enclosure} • ${getMaterialSpecs(p.material).odor}`,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <div
            className={`text-xs space-y-1 p-2 rounded-xl ${
              isDiff
                ? 'bg-amber-100/70 border border-amber-300 ring-2 ring-amber-400/20 text-amber-950'
                : 'text-slate-600'
            }`}
          >
            <div className="font-semibold">▪ 封箱需求：{specs.enclosure}</div>
            <div className="text-[11px] opacity-85">▪ 氣味表現：{specs.odor}</div>
          </div>
        );
      },
    },
    {
      id: 'surfaceFinish',
      label: '外觀光澤與表面質感',
      sublabel: '成型層紋與光學反射',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).surfaceFinish,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-xl text-xs ${
              isDiff
                ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20 font-bold'
                : 'text-slate-700 font-medium'
            }`}
          >
            {specs.surfaceFinish}
          </span>
        );
      },
    },
    {
      id: 'idealFor',
      label: '最佳應用場景建議',
      sublabel: '工程/外觀/日常選型',
      icon: <Compass className="w-3.5 h-3.5" />,
      getValue: (p) => getMaterialSpecs(p.material).idealFor,
      renderCell: (p, isDiff) => {
        const specs = getMaterialSpecs(p.material);
        return (
          <p
            className={`text-xs leading-relaxed p-2 rounded-xl ${
              isDiff
                ? 'bg-amber-100/70 border border-amber-300 ring-2 ring-amber-400/20 text-amber-950 font-medium'
                : 'text-slate-600'
            }`}
          >
            {specs.idealFor}
          </p>
        );
      },
    },
    {
      id: 'spoolType',
      label: '線盤結構型式',
      sublabel: '環保紙盤 / 補充包 / 耐高溫盤',
      icon: <Package className="w-3.5 h-3.5" />,
      getValue: (p) => p.spoolType || '標準線盤',
      renderCell: (p, isDiff) => {
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold ${
              isDiff
                ? 'bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {p.spoolType || '標準環保線盤'}
          </span>
        );
      },
    },
    {
      id: 'price',
      label: '售價與優惠折扣',
      sublabel: '單卷零售牌價',
      icon: <Tag className="w-3.5 h-3.5" />,
      getValue: (p) => `${p.price}`,
      renderCell: (p, isDiff) => {
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-base font-black font-mono ${
                  isDiff ? 'text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg' : 'text-slate-900'
                }`}
              >
                {formatPrice(p.price, currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatPrice(p.originalPrice, currency)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] text-rose-600 font-bold">
                現省 {formatPrice(p.originalPrice - p.price, currency)}
              </span>
            )}
          </div>
        );
      },
    },
  ], [currency]);

  // Determine if a spec row differs among all compared products
  const isRowDifferent = (row: SpecRow): boolean => {
    if (comparedProducts.length < 2) return false;
    const values = comparedProducts.map((p) => row.getValue(p).trim().toLowerCase());
    return new Set(values).size > 1;
  };

  // Difference counting
  const diffCount = useMemo(() => {
    if (comparedProducts.length < 2) return 0;
    return specRows.filter((r) => isRowDifferent(r)).length;
  }, [comparedProducts, specRows]);

  // Filtered rows depending on user's "Only Show Differences" toggle
  const visibleRows = useMemo(() => {
    if (!onlyShowDifferences || comparedProducts.length < 2) {
      return specRows;
    }
    return specRows.filter((r) => isRowDifferent(r));
  }, [specRows, onlyShowDifferences, comparedProducts]);

  // Quick automated decision takeaways based on the compared selection
  const decisionTips = useMemo(() => {
    if (comparedProducts.length < 2) return [];
    const tips: string[] = [];
    const mats = comparedProducts.map((p) => (p.material || '').toLowerCase());

    const hasPla = mats.some((m) => m.includes('pla'));
    const hasPetg = mats.some((m) => m.includes('petg'));
    const hasAbs = mats.some((m) => m.includes('abs') || m.includes('asa'));
    const hasTpu = mats.some((m) => m.includes('tpu'));
    const hasCf = mats.some((m) => m.includes('cf') || m.includes('碳纖'));

    if (hasPla && hasPetg) {
      tips.push('【PLA vs PETG】若用於室內手辦公仔與高速列印，PLA 最不易拉絲且免封箱；若需放車內曬太陽或抗熱水（HDT 75°C vs 55°C），建議選 PETG。');
    }
    if (hasCf) {
      tips.push('【碳纖強化】選取中包含碳纖複材，抗拉強度高達 75+ MPa 且具磨砂消光質感，請務必搭配硬化鋼或雙金屬耐磨噴嘴。');
    }
    if (hasTpu) {
      tips.push('【軟膠提醒】TPU 為 95A 高回彈彈性體，拓竹 AMS 自動供料系統不建議使用，請以掛架直驅進料。');
    }
    if (hasAbs) {
      tips.push('【高溫封箱】ABS 耐溫高達 98°C，但熱收縮率大，列印時機箱需密閉保溫並保持通風環境以防開裂。');
    }

    if (tips.length === 0) {
      tips.push(`已選取 ${comparedProducts.length} 款耗材，參數差異高亮處標註了各產品的關鍵物性與切片特性。全館滿 NT$999 享免運費！`);
    }

    return tips;
  }, [comparedProducts]);

  // Render Quick Product Picker inside the modal
  const renderQuickProductPicker = (isEmbeddedInTable = false) => (
    <div className={`p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 ${isEmbeddedInTable ? 'my-4 shadow-sm' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-600" />
            <span className="font-black text-sm text-slate-800">
              挑選耗材加入對比
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              已選 {comparedProducts.length} / 4 款
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            點擊卡片下方按鈕即可勾選加入或移除（建議選取 2 款以上啟動差異強調）
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="搜尋名稱、材質或品牌..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
        {[
          { id: 'all', label: '全部材質' },
          { id: 'pla', label: '🌱 PLA 系列' },
          { id: 'petg', label: '💧 PETG 系列' },
          { id: 'cf', label: '⚡ 碳纖複材 CF' },
          { id: 'abs', label: '🔥 ABS / ASA' },
          { id: 'tpu', label: '🤸 TPU 軟膠' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setPickerCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer touch-manipulation ${
              pickerCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto overscroll-contain pr-1">
        {filteredPickerProducts.map((product) => {
          const isSelected = comparisonIds.includes(product.id);
          const isDisabled = !isSelected && comparisonIds.length >= 4;

          return (
            <div
              key={product.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {product.material}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 font-mono">
                      {formatPrice(product.price, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleToggleProduct(product.id)}
                disabled={isDisabled}
                className={`w-full min-h-[38px] py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation ${
                  isSelected
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs active:scale-95'
                    : isDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs active:scale-95'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>已選中對比 (點擊取消)</span>
                  </>
                ) : isDisabled ? (
                  <span>已達 4 款上限</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>加入對比</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // If modal is not open, do not render into DOM (prevents blocking page interaction)
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 touch-manipulation animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[92vh] sm:rounded-3xl rounded-t-2xl sm:max-w-6xl flex flex-col shadow-2xl border-0 sm:border border-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-30 bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  耗材規格與機械物性橫向對比
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
                  {comparedProducts.length} / 4 款耗材
                </span>
                {comparedProducts.length >= 2 && highlightDifferences && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-2xs">
                    <Zap className="w-3 h-3 fill-current" />
                    差異強調模式中
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                深入比對材質特性、熱變形 (HDT)、噴嘴熱床溫度、AMS相容性與切片極速
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation active:scale-95"
              >
                清空對比
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
              title="關閉視窗 (Esc)"
              aria-label="關閉對比視窗"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Feature 1: Parameter Difference Highlighting Toolbar (Active when 2 or more products selected) */}
        {comparedProducts.length >= 2 && (
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/5 to-transparent border-b border-amber-200/90 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    參數差異智能強調
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300 font-bold font-mono text-[11px]">
                    {diffCount > 0 ? `已偵測到 ${diffCount} 項規格差異` : '選取耗材規格均相同'}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> 琥珀金標籤：存在差異
                    <span className="w-2 h-2 rounded-full bg-slate-300 ml-1"></span> 淺灰色：完全一致
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  系統自動比對材質特性、列印溫度與切片極速，高亮差異處助您精準選購
                </p>
              </div>
            </div>

            {/* Difference Highlighting Switches */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs touch-manipulation ${
                  highlightDifferences
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title="切換是否高亮顯示有差異的參數列"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{highlightDifferences ? '差異高亮：開啟' : '差異高亮：已關閉'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyShowDifferences(!onlyShowDifferences)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs touch-manipulation ${
                  onlyShowDifferences
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title="僅顯示存在差異的規格列，過濾完全相同的項目"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{onlyShowDifferences ? `只看差異 (${diffCount})` : '顯示全部規格'}</span>
              </button>

              {comparedProducts.length < 4 && (
                <button
                  type="button"
                  onClick={() => setShowPickerInTable(!showPickerInTable)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs touch-manipulation ${
                    showPickerInTable
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                  title="增選其他耗材加入對比"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showPickerInTable ? '收起商品庫' : `增選耗材 (${comparedProducts.length}/4)`}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 flex-1 flex flex-col">
          {/* Case 0: Empty Selection - Welcome & Presets & In-modal Picker */}
          {comparedProducts.length === 0 && (
            <div className="space-y-6">
              {/* Introduction Guide Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-white border border-indigo-100/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-indigo-950">
                      歡迎使用 3D 耗材規格橫向對比！
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      選取 2 ~ 4 款耗材，系統將自動比對噴嘴與熱床溫度、熱變形 (HDT)、拓竹 AMS 相容性與切片極速，並自動以<span className="font-bold text-amber-700 bg-amber-100/80 px-1 rounded mx-0.5">琥珀金高亮標記參數差異處</span>，助您秒懂最合適的線材！
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>返回商城瀏覽</span>
                  </button>
                </div>
              </div>

              {/* Popular Presets: 1-Click Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h4 className="font-black text-sm text-slate-900">
                      快速開始：點擊「一鍵載入」熱門對比範例（即刻體驗參數差異高亮）
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    點擊直接開啟橫向分析
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${preset.borderClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${preset.badgeClass}`}>
                            {preset.badge}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">2 款耗材</span>
                        </div>
                        <div className="font-black text-sm text-slate-900 mb-1">
                          {preset.title}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {preset.description}
                        </p>
                        
                        {/* Preview Pill Thumbnails */}
                        <div className="flex items-center gap-2 mb-3">
                          {preset.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 rounded-lg px-2 py-1 text-[11px] text-slate-700">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              <span className="font-medium truncate max-w-[120px]">{it.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset.items)}
                        className="w-full min-h-[42px] py-2 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer touch-manipulation active:scale-98"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>一鍵載入這兩款對比 (立即檢視差異)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Modal Product Selection Grid */}
              <div className="pt-2">
                {renderQuickProductPicker(false)}
              </div>

              {/* Bottom Large Return to Store Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer touch-manipulation"
                >
                  <Store className="w-4 h-4" />
                  <span>返回商城瀏覽全部商品</span>
                </button>
              </div>
            </div>
          )}

          {/* Case 1: Exactly 1 Product Selected */}
          {comparedProducts.length === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">
                      已選取 1 款耗材：「{comparedProducts[0].name}」
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      請在下方挑選清單<strong>再點擊加入 1 ~ 3 款耗材</strong>，系統將立刻產生橫向對比表格，並自動啟用【參數差異智能強調】！
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold self-start sm:self-auto cursor-pointer touch-manipulation"
                >
                  清除已選
                </button>
              </div>

              {/* Quick Picker directly underneath */}
              {renderQuickProductPicker(false)}
            </div>
          )}

          {/* Case 2: 2 or more products selected - Show Comparison Table */}
          {comparedProducts.length >= 2 && (
            <div className="space-y-4">
              {/* Optional Quick Picker Drawer in Table */}
              {showPickerInTable && (
                <div className="mb-4">
                  {renderQuickProductPicker(true)}
                </div>
              )}

              {/* Empty Diff Results (if onlyShowDifferences is true and diffCount is 0) */}
              {onlyShowDifferences && diffCount === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 my-4 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">
                    選取的 {comparedProducts.length} 款耗材主要機械規格與列印參數均完全相同
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    此幾款耗材在噴嘴熱床溫度、列印速度、AMS 相容性等項目完全一致，僅商品外觀顏色或即時庫存有所差別。
                  </p>
                  <button
                    type="button"
                    onClick={() => setOnlyShowDifferences(false)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer touch-manipulation"
                  >
                    切換顯示全部規格
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                    {/* Product Header Row */}
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="p-3.5 bg-slate-100/80 w-52 font-bold text-slate-500 uppercase tracking-wider text-[11px] rounded-tl-2xl">
                          耗材名稱與型號
                        </th>
                        {comparedProducts.map((p) => (
                          <th key={p.id} className="p-3.5 w-64 align-top relative group bg-white border-r border-slate-100 last:border-r-0">
                            <button
                              type="button"
                              onClick={() => handleRemove(p.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                              title="移除此項對比"
                              aria-label="移除此項對比"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 p-1.5 flex items-center justify-center">
                              {p.imageUrl && p.imageUrl.trim() !== '' ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Layers className="w-8 h-8 text-slate-400" />
                              )}
                            </div>

                            <div className="text-center">
                              <div className="font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</div>
                              <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                                {p.brand} • {p.weight}
                              </div>
                              <div className="text-base font-black text-slate-900 font-mono mt-1">
                                {formatPrice(p.price, currency)}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAdd(p)}
                                className="mt-2.5 w-full min-h-[36px] py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98 touch-manipulation"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>加入購物車</span>
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Specs Rows with Parameter Difference Highlighting */}
                    <tbody className="divide-y divide-slate-100">
                      {visibleRows.map((row) => {
                        const isDiff = isRowDifferent(row);
                        const shouldHighlight = isDiff && highlightDifferences && comparedProducts.length >= 2;

                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors duration-150 ${
                              shouldHighlight
                                ? 'bg-amber-50/70 hover:bg-amber-100/60 border-l-4 border-l-amber-500'
                                : 'hover:bg-slate-50/50 border-l-4 border-l-transparent'
                            }`}
                          >
                            {/* Row Header Cell */}
                            <td
                              className={`p-3.5 align-middle border-r ${
                                shouldHighlight
                                  ? 'bg-amber-100/50 border-amber-200/80 text-slate-900'
                                  : 'bg-slate-50 border-slate-200/70 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                  <span className={shouldHighlight ? 'text-amber-700' : 'text-slate-400'}>
                                    {row.icon}
                                  </span>
                                  <span className={shouldHighlight ? 'text-amber-950 font-black' : 'text-slate-800'}>
                                    {row.label}
                                  </span>
                                </div>

                                {/* Difference vs Identical Badge */}
                                {comparedProducts.length >= 2 && highlightDifferences && (
                                  <div>
                                    {isDiff ? (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] tracking-wide shadow-2xs">
                                        <Zap className="w-2.5 h-2.5 fill-current" />
                                        差異
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 font-semibold text-[10px]">
                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                        相同
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {row.sublabel && (
                                <div
                                  className={`text-[10px] mt-0.5 font-normal ${
                                    shouldHighlight ? 'text-amber-800/80' : 'text-slate-400'
                                  }`}
                                >
                                  {row.sublabel}
                                </div>
                              )}
                            </td>

                            {/* Product Spec Value Cells */}
                            {comparedProducts.map((p) => (
                              <td
                                key={p.id}
                                className={`p-3.5 align-middle border-r border-slate-100 last:border-r-0 ${
                                  shouldHighlight ? 'bg-amber-50/40' : ''
                                }`}
                              >
                                {row.renderCell(p, shouldHighlight)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Feature: Automated Quick Decision Takeaways */}
              {comparedProducts.length >= 2 && decisionTips.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-white border border-indigo-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      神狗勾 3D 快速選購決策指南
                    </h4>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {decisionTips.map((tip, idx) => (
                      <p key={idx} className="text-xs text-slate-700 leading-relaxed">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200 p-3 sm:p-4 px-4 sm:px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">神狗勾 3D 線徑公差 ±0.02mm，滿 NT$999 全館免運費！</span>
            <span className="sm:hidden">滿 NT$999 全館免運！</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer touch-manipulation shadow-md flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            <span>完成並返回商城</span>
          </button>
        </div>
      </div>
    </div>
  );
};
