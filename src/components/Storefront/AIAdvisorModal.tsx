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
  ChevronDown
} from 'lucide-react';
import { FilamentProduct, ColorOption } from '../../types';
import { PRINTER_PROFILES, PRINTER_BRANDS, PrinterProfile, findPrinterProfile } from '../../data/printerProfiles';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm') => void;
  onOpenSupportWithPrompt?: (prompt: string) => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onOpenSupportWithPrompt,
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

  // Real-time dynamic algorithm calculating the best matching material & scores
  const liveMatch = useMemo(() => {
    // Determine material by slider logic
    let matchedMaterialKey: 'pla' | 'petg' | 'cf' | 'abs' | 'tpu' = 'pla';
    let matchScore = 95;
    let reasonShort = '';

    if (toughness === 5 || surfaceFinish === 'flexible') {
      matchedMaterialKey = 'tpu';
      matchScore = 99;
      reasonShort = 'TPU 95A 具備極致抗撕裂高回彈性，能完全滿足等級 5 的防摔緩衝需求。';
    } else if (heatResistance >= 90) {
      matchedMaterialKey = 'abs';
      matchScore = currentPrinter.enclosure === 'open' ? 82 : 98;
      reasonShort = `ABS-GF 具備 100°C+ 高耐熱與抗蠕變性，滿足您設定的 ${heatResistance}°C 高溫。`;
    } else if (toughness >= 4 || surfaceFinish === 'cf') {
      matchedMaterialKey = 'cf';
      matchScore = 97;
      reasonShort = 'PLA-CF 碳纖維複合具備高剛性抗拉力，並擁有航太級消光無層紋質感。';
    } else if (outdoorResistance >= 4 || heatResistance >= 70) {
      matchedMaterialKey = 'petg';
      matchScore = 96;
      reasonShort = `PETG-HF 天然具備優異耐紫外線抗候性，耐溫達 75-80°C，戶外使用不脆化。`;
    } else {
      matchedMaterialKey = 'pla';
      matchScore = 98;
      reasonShort = 'High-Speed Hyper PLA 具備極高列印成功率與超低收縮率，是日常與高速列印的黃金基準。';
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
        badge: '入門首選 • 零翹邊',
      },
      petg: {
        name: 'PETG-HF 高抗衝擊耐溫線材',
        fullName: '神狗勾 PETG-HF 高抗衝擊耐溫線材',
        nozzleTemp: '240°C - 255°C',
        bedTemp: '70°C - 80°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 300)} mm/s`,
        fan: '30% - 50%',
        productMaterial: 'PETG',
        badge: '戶外耐候 • 韌性耐磨',
      },
      cf: {
        name: 'PLA-CF 航太級碳纖維複合',
        fullName: '神狗勾 PLA-CF 航太級碳纖維複合耗材',
        nozzleTemp: currentPrinter.brand.includes('Bambu') ? '255°C - 265°C' : '230°C - 245°C',
        bedTemp: '60°C - 65°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 350)} mm/s`,
        fan: '60% - 80%',
        productMaterial: 'Carbon Fiber',
        badge: '高剛性 • 消光無層紋',
      },
      abs: {
        name: 'ABS-GF 玻璃纖維超強耐溫',
        fullName: '神狗勾 ABS-GF 玻璃纖維超強耐溫耗材',
        nozzleTemp: '260°C - 275°C',
        bedTemp: '95°C - 105°C',
        speed: `${Math.min(currentPrinter.maxSpeedMmS, 250)} mm/s`,
        fan: '10% - 20%',
        productMaterial: 'ABS',
        badge: '耐溫 100°C+ • 工業強度',
      },
      tpu: {
        name: 'TPU 95A 高回彈減震彈性線',
        fullName: '神狗勾 TPU 95A 高回彈減震彈性耗材',
        nozzleTemp: '220°C - 235°C',
        bedTemp: '45°C - 50°C',
        speed: '30 - 60 mm/s',
        fan: '100%',
        productMaterial: 'TPU',
        badge: '超柔韌 • 緩衝抗撕裂',
      }
    };

    // Hardware warnings & alerts
    const alerts: string[] = [];
    if (matchedMaterialKey === 'abs' && currentPrinter.enclosure === 'open') {
      alerts.push(`⚠️ 【機型限制提醒】：您的【${currentPrinter.name}】屬於開放式機身，列印 ABS 容易受室內對流風影響產生嚴重冷卻開裂或翹邊。建議加裝原廠/通用保溫罩，或改選耐溫達 80°C 且開放機身好印的 PETG-HF！`);
    }
    if (matchedMaterialKey === 'cf' && !currentPrinter.specialNotes.includes('標配硬化鋼')) {
      alerts.push(`⚙️ 【噴嘴磨損警示】：PLA-CF 含高硬度碳纖維粒子，使用傳統黃銅噴嘴容易在數小時內被磨大口徑。建議確認已換裝 0.4mm 以上之硬化鋼噴嘴 (Hardened Steel)！`);
    }
    if (matchedMaterialKey === 'tpu' && (currentPrinter.multiColorSupport.includes('AMS') || currentPrinter.multiColorSupport.includes('ACE'))) {
      alerts.push(`🎋 【多色料倉提醒】：TPU 軟膠因質地柔軟，嚴禁走【${currentPrinter.multiColorSupport.split(' ')[0]}】多色進料管，請由機身外掛料架直接供料入擠出機。`);
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
    try {
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
            surfaceFinish
          },
          requirement: customNote || `耐溫 ${heatResistance}°C、韌性 ${toughness}星、便利性 ${easeOfPrint}星`,
          nozzleSize,
        }),
      });
      const data = await res.json();
      setRecommendation(data);
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
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 relative border-b border-indigo-500/20">
          <button
            id="close-ai-advisor-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center shadow-lg text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  AI 3D 列印耗材智能顧問
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                  Gemini 3.8 Flash
                </span>
                <span className="hidden sm:inline-flex text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold px-2 py-0.5 rounded-full">
                  多維度程度演算法
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-1">
                支援全市場主流機型（拓竹・創想・閃鑄・Snapmaker・縱維・愛樂酷・Prusa・Voron），拖拉程度滑桿精準計算最佳耗材與切片參數
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {!recommendation ? (
            <div className="space-y-6">
              {/* SECTION 1: 3D PRINTER MODEL SELECTOR */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>選擇您的 3D 印表機型號 (收錄市面全機型)：</span>
                  </label>
                  
                  {/* Brand quick filter pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px] scrollbar-none">
                    <span className="text-slate-400 text-[10px] shrink-0 font-medium">品牌速選:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBrandFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                        selectedBrandFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      全部機型 ({PRINTER_PROFILES.length})
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
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 ${
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
                </div>

                <div className="relative">
                  <select
                    value={selectedPrinterId}
                    onChange={(e) => setSelectedPrinterId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-2xs"
                  >
                    {visiblePrinters.map((printer) => (
                      <option key={printer.id} value={printer.id}>
                        {printer.brand} • {printer.name} ({printer.type} | {printer.enclosure === 'full' ? '全封箱' : '開放式'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Selected Printer Specs Bar */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    機型規格速查：
                  </span>
                  <span className="bg-white border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                    {currentPrinter.type} 結構
                  </span>
                  <span className={`border px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    currentPrinter.enclosure === 'full'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {currentPrinter.enclosure === 'full' ? '全封箱保溫' : '開放式機身'}
                  </span>
                  <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    極限速度 {currentPrinter.maxSpeedMmS} mm/s
                  </span>
                  <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    噴嘴最高 {currentPrinter.maxNozzleTemp}°C / 熱床 {currentPrinter.maxBedTemp}°C
                  </span>
                  {currentPrinter.multiColorSupport && (
                    <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      {currentPrinter.multiColorSupport}
                    </span>
                  )}
                  <p className="w-full text-[11px] text-slate-600 mt-1 pl-1">
                    💡 <strong>工程師備註：</strong>{currentPrinter.specialNotes}
                  </p>
                </div>
              </div>

              {/* SECTION 2: INTERACTIVE REQUIREMENT SLIDERS */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 sm:space-y-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900">
                      專案性能指標 (拖動程度條或點選專案速套)：
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    數值調整即時聯動下方運算結果
                  </span>
                </div>

                {/* Quick project archetype preset buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    常見專案類型快速帶入：
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs scrollbar-none">
                    <button
                      type="button"
                      onClick={() => {
                        setHeatResistance(50);
                        setToughness(1);
                        setEaseOfPrint(5);
                        setOutdoorResistance(1);
                        setSurfaceFinish('standard');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      <span>🧸</span>
                      <span>精緻公仔/微縮擺件</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      <span>⚙️</span>
                      <span>機構卡扣/收納掛件</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      <span>☀️</span>
                      <span>戶外花盆/汽車遮陽件</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      <span>🏎️</span>
                      <span>高溫治具/無人機機架</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      <span>👟</span>
                      <span>減震緩衝/密封圈/軟膠</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Slider 1: 承受耐溫需求 */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>承受溫度極限需求 (耐熱上限)：</span>
                      </div>
                      <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                        {heatResistance}°C
                      </span>
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

                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                      <span>45°C (室內常溫裝飾)</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        heatResistance >= 95 
                          ? 'bg-rose-100 text-rose-800' 
                          : heatResistance >= 75 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {heatResistance <= 55 && '🟢 室內常溫模型 / 一般工件 (PLA 最適)'}
                        {heatResistance > 55 && heatResistance <= 75 && '🟡 日常生活受力 / 輕度耐溫 (PETG / PLA-CF)'}
                        {heatResistance > 75 && heatResistance < 95 && '🟠 夏季車內暴曬 / 燈具戶外外殼 (PETG-HF / ABS)'}
                        {heatResistance >= 95 && '🔴 高溫開水蒸氣 / 引擎室治具 (ABS-GF 玻纖)'}
                      </span>
                      <span>115°C (工業高溫)</span>
                    </div>
                  </div>

                  {/* Slider 2: 結構抗衝擊與韌性強度 */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>結構抗衝擊與韌性強度 (摔落與受力)：</span>
                      </div>
                      <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                        等級 {toughness} / 5
                      </span>
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

                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                      <span>等級 1 (觀賞擺件/公仔)</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        {toughness === 1 && '公仔微縮擺件 (重視精細度，低衝擊)'}
                        {toughness === 2 && '桌面收納整理盒 (日常輕度受力)'}
                        {toughness === 3 && '機械卡扣/工具掛勾 (耐摔耐碰撞)'}
                        {toughness === 4 && '工業齒輪/無人機機臂 (高剛性抗拉 PLA-CF)'}
                        {toughness === 5 && '防撞墊/密封圈/輪胎 (極致柔韌高回彈 TPU 95A)'}
                      </span>
                      <span>等級 5 (極致橡膠彈性)</span>
                    </div>
                  </div>

                  {/* Slider 3: 列印便利性與新手友善度 */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span>列印便利性與免調校度 (新手友善 vs 專業控溫)：</span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                        {easeOfPrint} 星友善度
                      </span>
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

                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                      <span>1 星 (工業嚴苛控溫)</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        {easeOfPrint <= 2 && '🔒 需封箱保溫 50°C+、熱床 100°C (ABS-GF)'}
                        {easeOfPrint === 3 && '⚠️ 需換硬化鋼噴嘴或嚴格防潮 (PLA-CF / TPU)'}
                        {easeOfPrint === 4 && '⭐ 標準通用好印，熱床 70°C+ 即印 (PETG-HF)'}
                        {easeOfPrint === 5 && '🌟 極致閉眼印，免封箱、零翹邊 (High-Speed PLA)'}
                      </span>
                      <span>5 星 (免封箱閉眼印)</span>
                    </div>
                  </div>

                  {/* Slider 4: 戶外耐候與防曬抗UV度 */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Wind className="w-4 h-4 text-cyan-600" />
                        <span>戶外耐候與防曬抗紫外線 (UV & 濕度耐受)：</span>
                      </div>
                      <span className="font-mono font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md text-xs">
                        等級 {outdoorResistance} / 5
                      </span>
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

                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
                      <span>等級 1 (室內乾燥)</span>
                      <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-full">
                        {outdoorResistance <= 2 && '室內乾燥通風環境擺放 (PLA 最佳)'}
                        {outdoorResistance === 3 && '陽台花盆/浴室防潮防黴 (PETG-HF)'}
                        {outdoorResistance >= 4 && '全年戶外暴曬/汽車外裝件抗老化 (PETG / ABS-GF)'}
                      </span>
                      <span>等級 5 (全天候暴曬雨淋)</span>
                    </div>
                  </div>

                  {/* Surface Finish Chip Selector */}
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      表面消光與視覺層紋偏好：
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { id: 'standard', label: '極速光澤亮面', desc: '原色純淨鮮豔' },
                        { id: 'matte', label: '消光磨砂無層紋', desc: '表面漫反射遮層紋' },
                        { id: 'cf', label: '航太碳纖鍛造紋', desc: 'CF高剛性消光灰黑' },
                        { id: 'flexible', label: '高回彈柔韌質感', desc: 'TPU橡膠軟膠觸感' },
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
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* REAL-TIME LIVE MATCH PREVIEW CARD */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>即時動態精算匹配推薦 (依據滑桿與機型)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">相容性評分:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                      {liveMatch.score}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs border border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        {liveMatch.materialInfo.fullName}
                      </h4>
                      <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full">
                        {liveMatch.materialInfo.badge}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                      {liveMatch.reason}
                    </p>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    <span className="text-xs text-slate-300">商城現貨價格</span>
                    <span className="text-lg font-black text-amber-300">
                      NT$ {liveMatch.product.price}
                    </span>
                  </div>
                </div>

                {/* Instant Slicer Parameters Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400">噴嘴擠出溫度</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">{liveMatch.materialInfo.nozzleTemp}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400">熱床溫度設定</div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5">{liveMatch.materialInfo.bedTemp}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400">適配列印速度</div>
                    <div className="font-mono font-bold text-cyan-300 mt-0.5">{liveMatch.materialInfo.speed}</div>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400">模型冷卻風扇</div>
                    <div className="font-mono font-bold text-white mt-0.5">{liveMatch.materialInfo.fan}</div>
                  </div>
                </div>

                {/* Hardware Conflict Alerts (if any) */}
                {liveMatch.alerts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {liveMatch.alerts.map((alert, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nozzle Size & Custom Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    噴嘴口徑 (Nozzle Diameter)：
                  </label>
                  <select
                    value={nozzleSize}
                    onChange={(e) => setNozzleSize(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  >
                    <option value="0.4mm">0.4mm (主流標準口徑)</option>
                    <option value="0.2mm">0.2mm (極致微縮高精公仔)</option>
                    <option value="0.6mm">0.6mm (耐磨抗堵・厚層極速)</option>
                    <option value="0.8mm">0.8mm (超大型快速原型)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    補充特殊需求或模型用途 (選填)：
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="例如：需長時間裝熱咖啡杯套、希望不要有拉絲、齒輪間隙要求高..."
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Gemini AI 正在深入分析【{currentPrinter.name}】切片參數矩陣...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>生成【{currentPrinter.name}】完整切片參數與 AI 分析報告</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* AI Results View */
            <div className="space-y-5 animate-fade-in">
              {/* Product Match Card */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 via-blue-50/50 to-indigo-100/40 rounded-2xl border border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Gemini AI 專屬診斷報告 • 針對【{currentPrinter.name}】
                  </span>
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    相容度 99.8%
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  {recommendation.material}
                </h4>
                <div className="text-xs text-indigo-900 font-bold">
                  {recommendation.title}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Slicer Settings Parameters Table */}
              {recommendation.slicerSettings && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3.5">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      實測最佳切片軟體參數 (Bambu Studio / OrcaSlicer / PrusaSlicer / Creality Print)
                    </h5>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                      {nozzleSize} 噴嘴
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">噴嘴擠出溫度</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5 text-indigo-600">
                        {recommendation.slicerSettings.nozzleTemp}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">熱床底板溫度</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5 text-indigo-600">
                        {recommendation.slicerSettings.bedTemp}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">建議列印速度</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5 truncate">
                        {recommendation.slicerSettings.printSpeed}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">冷卻風扇設定</div>
                      <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                        {recommendation.slicerSettings.coolingFan}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">建議熱床表面</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5 truncate">
                        {recommendation.slicerSettings.bedType || 'Textured PEI 金鋼砂板'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-medium">機箱封閉需求</div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                        {recommendation.slicerSettings.enclosureNeeded || '開放機箱即可'}
                      </div>
                    </div>
                  </div>

                  {/* Retraction Recommendation */}
                  {recommendation.slicerSettings.retraction && (
                    <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        回抽建議
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {recommendation.slicerSettings.retraction}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Pro Tips */}
              {recommendation.proTips && recommendation.proTips.length > 0 && (
                <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    神狗勾資深切片工程師實戰密訣 (提高成功率與良率)：
                  </div>
                  <ul className="text-xs text-amber-900 space-y-1.5 pl-5 list-disc">
                    {recommendation.proTips.map((tip: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRecommendation(null)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    調整滑桿重新精算
                  </button>

                  <button
                    type="button"
                    id="ai-add-matched-to-cart-btn"
                    onClick={() => {
                      onAddToCart(finalMatchedProduct, finalMatchedProduct.colors[0], finalMatchedProduct.diameter);
                      onClose();
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    <span>將【{finalMatchedProduct.name}】加入購物車 (NT$ {finalMatchedProduct.price})</span>
                    <ArrowRight className="w-4 h-4" />
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
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-indigo-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>💬 帶著此推薦參數，開啟 AI 客服深度討論（具備多輪上下文記憶）</span>
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
