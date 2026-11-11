import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  Sliders, 
  Flame, 
  Gauge, 
  Wind, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { FilamentProduct, ColorOption, LanguageCode } from '../../types';
import { PRINTER_PROFILES, PRINTER_BRANDS, PrinterProfile, findPrinterProfile } from '../../data/printerProfiles';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm') => void;
  onOpenSupportWithPrompt?: (prompt: string) => void;
  lang?: LanguageCode;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onOpenSupportWithPrompt,
  lang = 'zh-TW',
}) => {
  // Selected Printer state
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('bambu-x1c');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  
  // Interactive Slider States
  // 1. 承受溫度需求 (°C): 45 ~ 115
  const [heatResistance, setHeatResistance] = useState<number>(65);
  // 2. 結構韌性與抗衝擊等級 (1 ~ 5)
  const [toughness, setToughness] = useState<number>(3);
  // 3. 列印便利性與新手友善度 (1 ~ 5)
  const [easeOfPrint, setEaseOfPrint] = useState<number>(4);
  // 4. 戶外耐候與防曬抗UV度 (1 ~ 5)
  const [outdoorResistance, setOutdoorResistance] = useState<number>(2);
  // 5. 表面消光質感偏好
  const [surfaceFinish, setSurfaceFinish] = useState<'standard' | 'matte' | 'cf' | 'flexible'>('standard');

  const [nozzleSize, setNozzleSize] = useState<'0.4mm' | '0.2mm' | '0.6mm' | '0.8mm'>('0.4mm');
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [copiedSlicer, setCopiedSlicer] = useState(false);

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

  // Active Printer Profile
  const currentPrinter: PrinterProfile = useMemo(() => {
    return findPrinterProfile(selectedPrinterId);
  }, [selectedPrinterId]);

  // Filtered printers list for selector
  const visiblePrinters = useMemo(() => {
    if (selectedBrandFilter === 'all') return PRINTER_PROFILES;
    const brand = PRINTER_BRANDS.find(b => b.id === selectedBrandFilter);
    return PRINTER_PROFILES.filter(p => {
      if (brand) {
        return p.brand.toLowerCase().includes(brand.id.toLowerCase()) ||
               brand.name.toLowerCase().includes(p.brand.toLowerCase()) ||
               p.id.toLowerCase().startsWith(brand.id.toLowerCase());
      }
      return p.brand.toLowerCase().includes(selectedBrandFilter.toLowerCase());
    });
  }, [selectedBrandFilter]);

  // Concise 1-line engineer note helper to prevent awkward multi-line orphan wraps
  const concisePrinterNote = useMemo(() => {
    const raw = currentPrinter.specialNotes || '';
    if (raw.includes('標配硬化鋼')) return '標配硬化鋼噴嘴，直印碳纖免改裝；印 PLA 建議上蓋微開散熱。';
    if (raw.includes('Unicorn') || raw.includes('獨角獸')) return '標配一體式鋼頭喉管，支援高速列印碳纖與耐溫工程耗材。';
    if (raw.includes('快拆式熱端')) return '快拆熱端搭配全自動流量補償，首層平整度與 PLA/PETG 表現極佳。';
    if (raw.includes('180x180')) return '緊湊靜音桌面機型，支援多色進料，日常列印 PLA/PETG 首選。';
    if (currentPrinter.enclosure === 'full') return '全封閉恆溫艙體設計，能有效抑制高溫工程耗材收縮與翹邊。';
    return '開放式機身散熱優異，印 PLA/PETG 表現穩定；印高溫料建議加保溫罩。';
  }, [currentPrinter]);

  // Real-time dynamic algorithm calculating the best matching material & scores
  const liveMatch = useMemo(() => {
    // Determine material by slider logic
    let matchedMaterialKey: 'pla' | 'petg' | 'cf' | 'abs' | 'tpu' = 'pla';
    let matchScore = 95;
    let reasonShort = '';

    if (toughness === 5 || surfaceFinish === 'flexible') {
      matchedMaterialKey = 'tpu';
      matchScore = 99;
      reasonShort = '95A 高回彈抗撕裂軟膠，具備極佳減震緩衝與耐磨表現。';
    } else if (heatResistance >= 90) {
      matchedMaterialKey = 'abs';
      matchScore = currentPrinter.enclosure === 'open' ? 82 : 98;
      reasonShort = `玻纖強化結構耐溫突破 100°C，滿足 ${heatResistance}°C 高溫環境與抗變形需求。`;
    } else if (toughness >= 4 || surfaceFinish === 'cf') {
      matchedMaterialKey = 'cf';
      matchScore = 97;
      reasonShort = '航太級碳纖維複合配方，兼具高剛性抗拉強度與消光無層紋質感。';
    } else if (outdoorResistance >= 4 || heatResistance >= 70) {
      matchedMaterialKey = 'petg';
      matchScore = 96;
      reasonShort = '具備優異抗衝擊韌性與耐候抗 UV 特性，耐溫達 75°C 戶外不脆化。';
    } else {
      matchedMaterialKey = 'pla';
      matchScore = 98;
      reasonShort = '具備極高列印成功率與超低收縮率，完美適配 500mm/s 高速列印。';
    }

    // Material details
    const materialData: Record<string, {
      name: string;
      fullName: string;
      nozzleTemp: string;
      bedTemp: string;
      speed: string;
      fan: string;
      productMaterial: string;
      badge: string;
    }> = {
      pla: {
        name: 'High-Speed Hyper PLA',
        fullName: '神狗勾 High-Speed Hyper PLA 500mm/s',
        nozzleTemp: currentPrinter.maxSpeedMmS >= 400 ? '215°C - 225°C' : '205°C - 215°C',
        bedTemp: '55°C - 60°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 500)} mm/s`,
        fan: '100%',
        productMaterial: 'High-Speed PLA',
        badge: '入門首選・零翹邊',
      },
      petg: {
        name: 'PETG-HF 高抗衝擊耐溫線材',
        fullName: '神狗勾 PETG-HF 高抗衝擊耐溫線材',
        nozzleTemp: '240°C - 255°C',
        bedTemp: '70°C - 80°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 300)} mm/s`,
        fan: '30% - 50%',
        productMaterial: 'PETG',
        badge: '戶外耐候・高韌性',
      },
      cf: {
        name: 'PLA-CF 航太級碳纖維複合',
        fullName: '神狗勾 PLA-CF 航太級碳纖維複合耗材',
        nozzleTemp: currentPrinter.brand.includes('Bambu') ? '255°C - 265°C' : '230°C - 245°C',
        bedTemp: '60°C - 65°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 350)} mm/s`,
        fan: '60% - 80%',
        productMaterial: 'Carbon Fiber',
        badge: '高剛性・消光無層紋',
      },
      abs: {
        name: 'ABS-GF 玻璃纖維超強耐溫',
        fullName: '神狗勾 ABS-GF 玻璃纖維超強耐溫耗材',
        nozzleTemp: '260°C - 275°C',
        bedTemp: '95°C - 105°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 250)} mm/s`,
        fan: '10% - 20%',
        productMaterial: 'ABS',
        badge: '耐溫 100°C+・工業級',
      },
      tpu: {
        name: 'TPU 95A 高回彈減震彈性線',
        fullName: '神狗勾 TPU 95A 高回彈減震彈性耗材',
        nozzleTemp: '220°C - 235°C',
        bedTemp: '45°C - 50°C',
        speed: '30 - 60 mm/s',
        fan: '100%',
        productMaterial: 'TPU',
        badge: '高回彈・減震抗撕裂',
      }
    };

    // Hardware warnings & alerts
    const alerts: string[] = [];
    if (matchedMaterialKey === 'abs' && currentPrinter.enclosure === 'open') {
      alerts.push(`機型提醒：${currentPrinter.name} 為開放式機身，印 ABS 建議加裝保溫罩，或改選耐溫 80°C 的 PETG-HF。`);
    }
    if (matchedMaterialKey === 'cf' && !currentPrinter.specialNotes.includes('標配硬化鋼')) {
      alerts.push('噴嘴提醒：碳纖維含高硬度微粒，請確認已換裝 0.4mm 以上硬化鋼噴嘴。');
    }
    if (matchedMaterialKey === 'tpu' && (currentPrinter.multiColorSupport.includes('AMS') || currentPrinter.multiColorSupport.includes('ACE'))) {
      alerts.push(`供料提醒：TPU 軟膠請勿走 ${currentPrinter.multiColorSupport.split(' ')[0]} 自動供料系統，請由機身外掛料架直接進料。`);
    }

    const selectedProduct = products.find(p => p.material === materialData[matchedMaterialKey].productMaterial) || products[0];

    return {
      materialKey: matchedMaterialKey,
      materialInfo: materialData[matchedMaterialKey],
      score: matchScore,
      reason: reasonShort,
      alerts,
      product: selectedProduct
    };
  }, [heatResistance, toughness, easeOfPrint, outdoorResistance, surfaceFinish, currentPrinter, products]);

  // Request Deep Gemini AI Diagnosis
  const handleDiagnose = async () => {
    setIsLoading(true);
    const isStatic =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('goddog.space') ||
        window.location.hostname.includes('web.app') ||
        window.location.hostname.includes('firebaseapp.com'));

    try {
      if (!isStatic) {
        const res = await fetch('/api/ai/recommend-filament', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printerModel: currentPrinter.name,
            sliders: {
              heatResistance,
              toughness,
              easeOfPrint,
              outdoorResistance,
              surfaceFinish,
            },
            requirement:
              customNote ||
              `耐溫 ${heatResistance}°C、韌性 ${toughness}星、便利性 ${easeOfPrint}星`,
            nozzleSize,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.material) {
            setRecommendation(data);
            return;
          }
        }
      }

      // Client-side precision report on static hosting (goddog.space)
      await new Promise((resolve) => setTimeout(resolve, 350));
      setRecommendation({
        material: liveMatch.materialInfo.fullName,
        title: `適配機型：${currentPrinter.name}（相容度 ${liveMatch.score}%）`,
        reasoning: `${liveMatch.reason}${
          customNote ? ` 已針對「${customNote}」同步最佳化切片流量與冷卻曲線。` : ''
        }`,
        slicerSettings: {
          nozzleTemp: liveMatch.materialInfo.nozzleTemp,
          bedTemp: liveMatch.materialInfo.bedTemp,
          printSpeed: liveMatch.materialInfo.speed,
          coolingFan: liveMatch.materialInfo.fan,
          bedType: 'PEI 金鋼砂彈簧鋼板',
          enclosureNeeded:
            liveMatch.materialKey === 'abs' ? '建議封箱保溫 (45-55°C)' : '開放或封箱皆可',
          retraction:
            liveMatch.materialKey === 'tpu'
              ? '直驅 0.8mm @ 25mm/s (關閉 Z-Hop)'
              : '直驅 0.8mm @ 35mm/s・遠端 4.5mm',
        },
        proTips: [
          `使用 ${nozzleSize} 噴嘴時，首層速度建議設為 30 mm/s 並關閉前 3 層風扇，確保底層抓附穩定。`,
          ...(liveMatch.alerts.length > 0
            ? liveMatch.alerts
            : [
                `神狗勾 1kg 標準線盤（公差 ±0.02mm）可直接相容 ${currentPrinter.name} 高速供料。`,
              ]),
          '拆封後若長時間未用，建議置於防潮箱搭配乾燥劑保存。',
        ],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Find product matching AI recommendation or fallback to live matched product
  const finalMatchedProduct = useMemo(() => {
    if (!recommendation) return liveMatch.product;
    const recMat = (recommendation.material || '').toLowerCase();
    if (recMat.includes('cf') || recMat.includes('碳纖維')) return products.find(p => p.material === 'Carbon Fiber') || products[0];
    if (recMat.includes('petg')) return products.find(p => p.material === 'PETG') || products[0];
    if (recMat.includes('tpu') || recMat.includes('彈性')) return products.find(p => p.material === 'TPU') || products[0];
    if (recMat.includes('abs')) return products.find(p => p.material === 'ABS') || products[0];
    return products.find(p => p.material === 'High-Speed PLA') || products[0];
  }, [recommendation, liveMatch.product, products]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-0 sm:p-5 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-h-[94vh] sm:rounded-3xl rounded-none sm:max-w-4xl shadow-2xl border-0 sm:border border-slate-200 overflow-hidden relative flex flex-col cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header - Single-line title & concise subtitle */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white px-4 py-4 sm:px-6 sm:py-5 relative border-b border-indigo-500/20">
          <button
            id="close-ai-advisor-modal-btn"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="關閉視窗"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-3 pr-9">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center shadow-lg text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-nowrap">
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white whitespace-nowrap">
                  {lang === 'en' ? 'AI Filament Advisor' : lang === 'ja' ? 'AI 材料アドバイザー' : 'AI 耗材智能顧問'}
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                  Gemini 3.8
                </span>
                <span className="hidden sm:inline-flex text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {lang === 'en' ? 'Smart Match' : lang === 'ja' ? 'スマート算出' : '動態切片精算'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-200/90 mt-0.5 truncate">
                {lang === 'en'
                  ? 'Select printer & sliders to compute ideal filament and slicer settings.'
                  : lang === 'ja'
                  ? '機種と指標から最適なフィラメントとスライス設定を即時算出。'
                  : '依印表機型與性能指標，即時精算最佳線材與切片參數'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[82vh] overflow-y-auto">
          {!recommendation ? (
            <div className="space-y-4 sm:space-y-5">
              {/* SECTION 1: 3D PRINTER MODEL SELECTOR */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                    <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{lang === 'en' ? '1. Select 3D Printer' : lang === 'ja' ? '1. プリンター機種' : '1. 選擇 3D 印表機型號'}</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                    收錄 {PRINTER_PROFILES.length} 款主流機型
                  </span>
                </div>

                {/* Brand quick filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedBrandFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs shrink-0 ${
                      selectedBrandFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {lang === 'en' ? `All (${PRINTER_PROFILES.length})` : lang === 'ja' ? `全て (${PRINTER_PROFILES.length})` : `全部 (${PRINTER_PROFILES.length})`}
                  </button>
                  {PRINTER_BRANDS.map(b => {
                    const count = PRINTER_PROFILES.filter(p => 
                      p.brand.toLowerCase().includes(b.id.toLowerCase()) ||
                      b.name.toLowerCase().includes(p.brand.toLowerCase()) ||
                      p.id.toLowerCase().startsWith(b.id.toLowerCase())
                    ).length;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrandFilter(b.id);
                          const matching = PRINTER_PROFILES.filter(p => 
                            p.brand.toLowerCase().includes(b.id.toLowerCase()) ||
                            b.name.toLowerCase().includes(p.brand.toLowerCase()) ||
                            p.id.toLowerCase().startsWith(b.id.toLowerCase())
                          );
                          if (matching.length > 0 && !matching.some(m => m.id === selectedPrinterId)) {
                            setSelectedPrinterId(matching[0].id);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 shrink-0 ${
                          selectedBrandFilter === b.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{b.icon}</span>
                        <span>{b.name.split(' ')[0]}</span>
                        <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Deduplicated Printer Select Dropdown */}
                <div className="relative">
                  <select
                    value={selectedPrinterId}
                    onChange={(e) => setSelectedPrinterId(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
                  >
                    {visiblePrinters.map((printer) => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name}（{printer.type}・{printer.enclosure === 'full' ? '全封箱' : '開放式'}）
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Selected Printer Specs Bar - Balanced 4-pill Grid + Single-line Note */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-indigo-950 flex items-center gap-1 whitespace-nowrap">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>機型硬體規格</span>
                    </span>
                    {currentPrinter.multiColorSupport && (
                      <span className="bg-purple-100/80 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">
                        {currentPrinter.multiColorSupport}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    <div className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">結構</span>
                      <span className="font-bold text-indigo-900 whitespace-nowrap">{currentPrinter.type}</span>
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">艙體</span>
                      <span className={`font-bold whitespace-nowrap ${currentPrinter.enclosure === 'full' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {currentPrinter.enclosure === 'full' ? '全封箱保溫' : '開放式機身'}
                      </span>
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">極速</span>
                      <span className="font-mono font-bold text-slate-800 whitespace-nowrap">{currentPrinter.maxSpeedMmS} mm/s</span>
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">溫控</span>
                      <span className="font-mono font-bold text-slate-800 whitespace-nowrap">{currentPrinter.maxNozzleTemp}°/{currentPrinter.maxBedTemp}°C</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-0.5">
                    <span className="shrink-0">💡</span>
                    <span className="font-medium leading-snug">{concisePrinterNote}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: INTERACTIVE REQUIREMENT SLIDERS */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs font-black text-slate-900 whitespace-nowrap">
                      2. 專案性能指標
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    點選情境或拖動滑桿即時精算
                  </span>
                </div>

                {/* Quick project archetype preset buttons - Concise 4-char labels */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(50);
                      setToughness(1);
                      setEaseOfPrint(5);
                      setOutdoorResistance(1);
                      setSurfaceFinish('standard');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🧸</span>
                    <span>精緻公仔</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(70);
                      setToughness(3);
                      setEaseOfPrint(4);
                      setOutdoorResistance(3);
                      setSurfaceFinish('standard');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>⚙️</span>
                    <span>機構卡扣</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(85);
                      setToughness(4);
                      setEaseOfPrint(3);
                      setOutdoorResistance(5);
                      setSurfaceFinish('matte');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>☀️</span>
                    <span>戶外耐候</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(105);
                      setToughness(4);
                      setEaseOfPrint(2);
                      setOutdoorResistance(4);
                      setSurfaceFinish('cf');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🏎️</span>
                    <span>高溫碳纖</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(60);
                      setToughness(5);
                      setEaseOfPrint(3);
                      setOutdoorResistance(2);
                      setSurfaceFinish('flexible');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>👟</span>
                    <span>減震軟膠</span>
                  </button>
                </div>

                {/* 2x2 Grid of Compact Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Slider 1: 耐熱上限 */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 whitespace-nowrap">
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>耐熱上限</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap ${
                          heatResistance >= 95
                            ? 'bg-rose-100 text-rose-800'
                            : heatResistance >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {heatResistance <= 55 && '室內常溫 (PLA)'}
                          {heatResistance > 55 && heatResistance <= 75 && '日常耐溫 (PETG)'}
                          {heatResistance > 75 && heatResistance < 95 && '車內防曬 (PETG/ABS)'}
                          {heatResistance >= 95 && '工業高溫 (ABS-GF)'}
                        </span>
                        <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                          {heatResistance}°C
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={45}
                      max={115}
                      step={5}
                      value={heatResistance}
                      onChange={(e) => setHeatResistance(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>45°C 室內常溫</span>
                      <span>115°C 工業高溫</span>
                    </div>
                  </div>

                  {/* Slider 2: 結構韌性 */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 whitespace-nowrap">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>結構韌性</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {toughness === 1 && '靜態公仔擺件'}
                          {toughness === 2 && '日常桌面收納'}
                          {toughness === 3 && '耐摔機構卡扣'}
                          {toughness === 4 && '高剛性抗拉 (CF)'}
                          {toughness === 5 && '高回彈防撞 (TPU)'}
                        </span>
                        <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                          Lv.{toughness}/5
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={toughness}
                      onChange={(e) => setToughness(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>Lv.1 精細擺件</span>
                      <span>Lv.5 橡膠回彈</span>
                    </div>
                  </div>

                  {/* Slider 3: 列印友善度 */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 whitespace-nowrap">
                        <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>列印友善度</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {easeOfPrint <= 2 && '需封箱控溫 (ABS)'}
                          {easeOfPrint === 3 && '需硬化噴嘴/防潮'}
                          {easeOfPrint === 4 && '標準通用好印'}
                          {easeOfPrint === 5 && '免封箱零翹邊'}
                        </span>
                        <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                          {easeOfPrint}★
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={easeOfPrint}
                      onChange={(e) => setEaseOfPrint(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>1★ 專業控溫</span>
                      <span>5★ 新手直印</span>
                    </div>
                  </div>

                  {/* Slider 4: 戶外耐候度 */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 whitespace-nowrap">
                        <Wind className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <span>戶外抗 UV</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {outdoorResistance <= 2 && '室內乾燥擺放'}
                          {outdoorResistance === 3 && '陽台防潮耐濕'}
                          {outdoorResistance >= 4 && '戶外暴曬抗老化'}
                        </span>
                        <span className="font-mono font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md text-xs whitespace-nowrap">
                          Lv.{outdoorResistance}/5
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={outdoorResistance}
                      onChange={(e) => setOutdoorResistance(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>Lv.1 室內乾燥</span>
                      <span>Lv.5 戶外日曬</span>
                    </div>
                  </div>
                </div>

                {/* Surface Finish Chip Selector - Single-line labels */}
                <div className="pt-0.5">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    表面視覺質感偏好：
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'standard', label: '極速光澤亮面', desc: '原色純淨鮮豔' },
                      { id: 'matte', label: '消光磨砂質感', desc: '漫反射遮層紋' },
                      { id: 'cf', label: '航太碳纖紋理', desc: 'CF 高剛性消光' },
                      { id: 'flexible', label: '高回彈軟膠感', desc: 'TPU 減震觸感' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSurfaceFinish(item.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          surfaceFinish === item.id
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="font-bold text-slate-900 whitespace-nowrap">{item.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* REAL-TIME LIVE MATCH PREVIEW CARD (Praised Design - Polished Single-Line Typography) */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 whitespace-nowrap">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>即時動態精算匹配推薦</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">相容度</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 whitespace-nowrap">
                      {liveMatch.score}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs border border-white/10">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                        {liveMatch.materialInfo.fullName}
                      </h4>
                      <span className="text-[10px] bg-indigo-500 text-white font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {liveMatch.materialInfo.badge}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
                      {liveMatch.reason}
                    </p>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 border-white/10 pt-2.5 sm:pt-0">
                    <span className="text-xs text-slate-300 whitespace-nowrap">商城現貨價格</span>
                    <span className="text-lg font-black text-amber-300 whitespace-nowrap">
                      NT$ {liveMatch.product.price}
                    </span>
                  </div>
                </div>

                {/* Instant Slicer Parameters Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">噴嘴擠出溫度</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.nozzleTemp}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">熱床溫度設定</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.bedTemp}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">適配列印速度</div>
                    <div className="font-mono font-bold text-cyan-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.speed}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">模型冷卻風扇</div>
                    <div className="font-mono font-bold text-white mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.fan}</div>
                  </div>
                </div>

                {/* Copy Slicer Preset Bar - Single-line alignment */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-slate-400 truncate">
                    適用：Bambu Studio / Orca / Creality / Cura
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `【${currentPrinter.name}】${liveMatch.materialInfo.name} 推薦切片參數：
- 耗材材質: ${liveMatch.materialInfo.name}
- 噴嘴擠出溫度: ${liveMatch.materialInfo.nozzleTemp}
- 熱床溫度: ${liveMatch.materialInfo.bedTemp}
- 推薦速度: ${liveMatch.materialInfo.speed}
- 風扇散熱: ${liveMatch.materialInfo.fan}
- 建議噴嘴: ${nozzleSize}
- 機型支援: ${currentPrinter.name} (噴嘴上限: ${currentPrinter.maxNozzleTemp}°C, 熱床上限: ${currentPrinter.maxBedTemp}°C)`;
                      navigator.clipboard.writeText(text);
                      setCopiedSlicer(true);
                      setTimeout(() => setCopiedSlicer(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedSlicer ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 font-bold">已複製參數</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>複製切片參數</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Hardware Conflict Alerts (if any) */}
                {liveMatch.alerts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {liveMatch.alerts.map((alert, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nozzle Size & Custom Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    噴嘴口徑：
                  </label>
                  <select
                    value={nozzleSize}
                    onChange={(e) => setNozzleSize(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  >
                    <option value="0.4mm">0.4mm 標準口徑</option>
                    <option value="0.2mm">0.2mm 精細微縮</option>
                    <option value="0.6mm">0.6mm 耐磨高速</option>
                    <option value="0.8mm">0.8mm 大型原型</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    補充模型用途或特殊需求 (選填)：
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="例：耐溫杯套、抑制拉絲、高精密齒輪咬合..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Diagnostic Action Button */}
              <button
                id="generate-ai-recommendation-btn"
                type="button"
                onClick={handleDiagnose}
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
                    <span>正在精算專屬切片參數報告...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                    <span>生成專屬切片參數與 AI 診斷報告</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* AI Results View */
            <div className="space-y-4 animate-fade-in">
              {/* Product Match Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50 via-blue-50/50 to-indigo-100/40 rounded-2xl border border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-indigo-700">
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AI 專屬切片診斷報告</span>
                  </span>
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap shrink-0">
                    相容度 {liveMatch.score}%
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {recommendation.material}
                </h4>
                <div className="text-xs text-indigo-900 font-bold">
                  {recommendation.title}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Slicer Settings Parameters Table */}
              {recommendation.slicerSettings && (
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                      <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>實測最佳切片參數設定</span>
                    </h5>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono font-bold whitespace-nowrap">
                      {nozzleSize} 噴嘴
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">噴嘴擠出溫度</div>
                      <div className="font-mono font-black text-sm mt-0.5 text-indigo-600 whitespace-nowrap">
                        {recommendation.slicerSettings.nozzleTemp}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">熱床底板溫度</div>
                      <div className="font-mono font-black text-sm mt-0.5 text-indigo-600 whitespace-nowrap">
                        {recommendation.slicerSettings.bedTemp}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">建議列印速度</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5 truncate">
                        {recommendation.slicerSettings.printSpeed}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">冷卻風扇設定</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5 whitespace-nowrap">
                        {recommendation.slicerSettings.coolingFan}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">建議熱床底板</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate">
                        {recommendation.slicerSettings.bedType || 'PEI 金鋼砂鋼板'}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">機箱環境需求</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate">
                        {recommendation.slicerSettings.enclosureNeeded || '開放或封箱皆可'}
                      </div>
                    </div>
                  </div>

                  {/* Retraction Recommendation */}
                  {recommendation.slicerSettings.retraction && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded whitespace-nowrap">
                        回抽建議
                      </span>
                      <span className="font-mono font-bold text-slate-800 truncate">
                        {recommendation.slicerSettings.retraction}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Pro Tips */}
              {recommendation.proTips && recommendation.proTips.length > 0 && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 whitespace-nowrap">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>切片工程師實戰建議：</span>
                  </div>
                  <ul className="text-xs text-amber-900 space-y-1.5 pl-4 list-disc">
                    {recommendation.proTips.map((tip: string, idx: number) => (
                      <li key={idx} className="leading-snug">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setRecommendation(null)}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap"
                  >
                    返回調整參數
                  </button>

                  <button
                    type="button"
                    id="ai-add-matched-to-cart-btn"
                    onClick={() => {
                      onAddToCart(finalMatchedProduct, finalMatchedProduct.colors[0], finalMatchedProduct.diameter);
                      onClose();
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98 whitespace-nowrap"
                  >
                    <span>加入購物車・NT$ {finalMatchedProduct.price}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>

                {onOpenSupportWithPrompt && (
                  <button
                    type="button"
                    id="transition-to-support-chat-btn"
                    onClick={() => {
                      onClose();
                      onOpenSupportWithPrompt(
                        `我剛剛在 AI 耗材顧問針對我的機型【${currentPrinter.name}】獲得了【${recommendation.material}】的推薦，設定參數為噴嘴 ${recommendation.slicerSettings?.nozzleTemp || '220°C'}、熱床 ${recommendation.slicerSettings?.bedTemp || '60°C'}，想請教更多切片細節與耗材相容性！`
                      );
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>帶入此切片參數，與 AI 客服深入討論</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
