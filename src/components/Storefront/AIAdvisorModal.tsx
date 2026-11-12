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
import { PRINTER_PROFILES, PRINTER_BRANDS, PrinterProfile, findPrinterProfile, getPrintersByBrand } from '../../data/printerProfiles';
import { computeFilamentMatchByFunction } from '../../utils/filamentFunctionEngine';

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
  // Selected Brand & Printer state (Brand-first workflow)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('bambu');
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('bambu-x1c');
  const [printerSearchQuery, setPrinterSearchQuery] = useState<string>('');
  
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

  const recordSlicerUsageForAchievement = () => {
    try {
      const prev = parseInt(localStorage.getItem('printcore_slicer_copies') || '0', 10) || 0;
      localStorage.setItem('printcore_slicer_copies', String(prev + 1));
      window.dispatchEvent(new CustomEvent('printcore:slicer-used', { detail: { count: prev + 1 } }));
    } catch {
      // ignore storage errors
    }
  };

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

  // Filtered printers list for 2-stage Brand -> Model selector + search
  const visiblePrinters = useMemo(() => {
    const q = printerSearchQuery.trim().toLowerCase();
    if (q) {
      const matches = PRINTER_PROFILES.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
      return matches.length > 0 ? matches : PRINTER_PROFILES;
    }
    return getPrintersByBrand(selectedBrandFilter);
  }, [selectedBrandFilter, printerSearchQuery]);

  // Concise 1-line engineer note helper to prevent awkward multi-line orphan wraps
  const concisePrinterNote = useMemo(() => {
    const raw = currentPrinter.specialNotes || '';
    if (lang === 'en') {
      if (raw.includes('標配硬化鋼')) return 'Includes hardened steel nozzle for direct carbon fiber printing; crack top glass slightly for PLA.';
      if (raw.includes('Unicorn') || raw.includes('獨角獸')) return 'Quick-swap Unicorn steel nozzle supports high-speed carbon fiber and engineering filaments.';
      if (raw.includes('快拆式熱端')) return 'Quick-swap hotend with auto flow calibration delivers ultra-clean first layers on PLA & PETG.';
      if (raw.includes('180x180')) return 'Compact, whisper-quiet desktop printer with multi-color support—ideal for everyday PLA & PETG.';
      if (currentPrinter.enclosure === 'full') return 'Fully enclosed heated chamber suppresses warping on ABS, ASA, and engineering filaments.';
      return 'Open-frame design excels at cooling PLA & PETG; use an enclosure tent if printing ABS.';
    }
    if (lang === 'ja') {
      if (raw.includes('標配硬化鋼')) return '硬化鋼ノズル標準装備で炭素繊維もそのまま造形可能。PLA造形時は天面を少し開けて放熱してください。';
      if (raw.includes('Unicorn') || raw.includes('獨角獸')) return '一体型ユニコーン鋼ノズル搭載、炭素繊維や高温エンプラの高速造形に対応。';
      if (raw.includes('快拆式熱端')) return 'クイック交換ホットエンド＆自動流量補正により、PLA/PETGの1層目が非常に綺麗に仕上がります。';
      if (raw.includes('180x180')) return '静音・省スペース設計でマルチカラー対応。日常のPLA/PETG造形に最適です。';
      if (currentPrinter.enclosure === 'full') return 'フル密閉チャンバー構造により、ABS等の高温エンジニアリング素材の反りや割れを抑えます。';
      return 'オープンフレーム構造で冷却効率が高くPLA/PETGに最適。高温素材は保温カバー推奨。';
    }
    if (raw.includes('標配硬化鋼')) return '標配硬化鋼噴嘴，直印碳纖免改裝；印 PLA 建議上蓋微開散熱。';
    if (raw.includes('Unicorn') || raw.includes('獨角獸')) return '標配一體式鋼頭喉管，支援高速列印碳纖與耐溫工程耗材。';
    if (raw.includes('快拆式熱端')) return '快拆熱端搭配全自動流量補償，首層平整度與 PLA/PETG 表現極佳。';
    if (raw.includes('180x180')) return '緊湊靜音桌面機型，支援多色進料，日常列印 PLA/PETG 首選。';
    if (currentPrinter.enclosure === 'full') return '全封閉恆溫艙體設計，能有效抑制高溫工程耗材收縮與翹邊。';
    return '開放式機身散熱優異，印 PLA/PETG 表現穩定；印高溫料建議加保溫罩。';
  }, [currentPrinter, lang]);

  // Real-time 21-material multi-variable mathematical response surface & thermodynamic slicer engine
  const liveMatch = useMemo(() => {
    return computeFilamentMatchByFunction({
      heatResistance,
      toughness,
      easeOfPrint,
      outdoorResistance,
      surfaceFinish,
      nozzleSize,
      customNote,
      printer: currentPrinter,
      products,
      lang,
    });
  }, [heatResistance, toughness, easeOfPrint, outdoorResistance, surfaceFinish, nozzleSize, customNote, currentPrinter, products, lang]);

  // Request Deep Gemini AI Diagnosis (via Server-Side Gemini Endpoint)
  const handleDiagnose = async () => {
    setIsLoading(true);
    recordSlicerUsageForAchievement();

    try {
      const res = await fetch('/api/ai/recommend-filament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerModel: currentPrinter.name,
          printerId: currentPrinter.id,
          sliders: {
            heatResistance,
            toughness,
            easeOfPrint,
            outdoorResistance,
            surfaceFinish,
          },
          requirement:
            customNote ||
            `耐溫 ${heatResistance}°C、韌性 ${toughness}星、便利性 ${easeOfPrint}星、抗UV ${outdoorResistance}星`,
          nozzleSize,
          lang,
          computedBaseline: {
            materialKey: liveMatch.materialKey,
            fullName: liveMatch.materialInfo.fullName,
            nozzleTemp: liveMatch.materialInfo.nozzleTemp,
            bedTemp: liveMatch.materialInfo.bedTemp,
            speed: liveMatch.materialInfo.speed,
            fan: liveMatch.materialInfo.fan,
            volumetricFlow: liveMatch.materialInfo.volumetricFlow,
            layerHeight: liveMatch.materialInfo.layerHeight,
            retraction: liveMatch.materialInfo.retraction,
            bedType: liveMatch.materialInfo.bedType,
            enclosureNeeded: liveMatch.materialInfo.enclosureNeeded,
            preferredProductId: liveMatch.materialInfo.preferredProductId,
            score: liveMatch.score,
          },
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.material) {
          // Ensure mathematical slicer parameters stay synchronized with liveMatch physics
          setRecommendation({
            ...data,
            material: liveMatch.materialInfo.fullName,
            preferredProductId: liveMatch.materialInfo.preferredProductId,
            slicerSettings: {
              ...data.slicerSettings,
              nozzleTemp: liveMatch.materialInfo.nozzleTemp,
              bedTemp: liveMatch.materialInfo.bedTemp,
              printSpeed: `${liveMatch.materialInfo.speed} (${liveMatch.materialInfo.volumetricFlow})`,
              coolingFan: liveMatch.materialInfo.fan,
              retraction: liveMatch.materialInfo.retraction,
              bedType: liveMatch.materialInfo.bedType,
              enclosureNeeded: liveMatch.materialInfo.enclosureNeeded,
            },
          });
          return;
        }
      }

      // Localized precision report (supports zh-TW, en, ja)
      await new Promise((resolve) => setTimeout(resolve, 250));
      setRecommendation({
        material: liveMatch.materialInfo.fullName,
        preferredProductId: liveMatch.materialInfo.preferredProductId,
        title:
          lang === 'en'
            ? `Matched for ${currentPrinter.name} (${liveMatch.score}% Compatibility)`
            : lang === 'ja'
            ? `適合機種：${currentPrinter.name}（適合度 ${liveMatch.score}%）`
            : `適配機型：${currentPrinter.name}（相容度 ${liveMatch.score}%）`,
        reasoning: `${liveMatch.reason}${
          customNote
            ? lang === 'en'
              ? ` Flow rate (${liveMatch.materialInfo.volumetricFlow}) and cooling curves have also been tuned for "${customNote}".`
              : lang === 'ja'
              ? ` 「${customNote}」に合わせて体積流量（${liveMatch.materialInfo.volumetricFlow}）と冷却カーブも最適化しています。`
              : ` 已針對「${customNote}」同步最佳化最大體積流量（${liveMatch.materialInfo.volumetricFlow}）與冷卻曲線。`
            : ''
        }`,
        slicerSettings: {
          nozzleTemp: liveMatch.materialInfo.nozzleTemp,
          bedTemp: liveMatch.materialInfo.bedTemp,
          printSpeed: `${liveMatch.materialInfo.speed} (${liveMatch.materialInfo.volumetricFlow})`,
          coolingFan: liveMatch.materialInfo.fan,
          bedType: liveMatch.materialInfo.bedType,
          enclosureNeeded: liveMatch.materialInfo.enclosureNeeded,
          retraction: liveMatch.materialInfo.retraction,
        },
        proTips:
          lang === 'en'
            ? [
                `With a ${nozzleSize} nozzle (${liveMatch.materialInfo.layerHeight}), max volumetric flow is calculated at ${liveMatch.materialInfo.volumetricFlow}; print the first layer at ${liveMatch.telemetry.firstLayerSpeedMmS} mm/s.`,
                ...(liveMatch.alerts.length > 0
                  ? liveMatch.alerts
                  : [`GodDog 1kg spools (±0.02mm laser tolerance) drop straight into ${currentPrinter.name} for smooth feeding.`]),
                'Store opened spools in a dry box or resealable foil bag with desiccant when not in use.',
              ]
            : lang === 'ja'
            ? [
                `${nozzleSize} ノズル（${liveMatch.materialInfo.layerHeight}）使用時の算出最大体積流量は ${liveMatch.materialInfo.volumetricFlow} です。1層目は ${liveMatch.telemetry.firstLayerSpeedMmS} mm/s を推奨します。`,
                ...(liveMatch.alerts.length > 0
                  ? liveMatch.alerts
                  : [`神狗勾 1kg 標準スプール（公差±0.02mm）は ${currentPrinter.name} の高速給紙にそのまま対応します。`]),
                '開封後は防湿ボックスや乾燥剤入り密封袋での保管をおすすめします。',
              ]
            : [
                `使用 ${nozzleSize} 噴嘴（${liveMatch.materialInfo.layerHeight}）時，函數精算最大體積流量為 ${liveMatch.materialInfo.volumetricFlow}；首層建議設為 ${liveMatch.telemetry.firstLayerSpeedMmS} mm/s。`,
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

  // Exact product matched by the 21-material function engine
  const finalMatchedProduct = useMemo(() => {
    if (recommendation?.preferredProductId) {
      const byId = products.find((p) => p.id === recommendation.preferredProductId);
      if (byId) return byId;
    }
    return liveMatch.product;
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
                  ? 'Select printer brand & model to compute ideal filament and slicer settings.'
                  : lang === 'ja'
                  ? 'メーカーと機種を選択し、最適なフィラメントとスライス設定を即時算出。'
                  : '先選品牌再選機型（含 SparkX i8 / H3C / K3 / Infimech 等全機型），即時精算切片參數'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[82vh] overflow-y-auto">
          {!recommendation ? (
            <div className="space-y-4 sm:space-y-5">
              {/* SECTION 1: TWO-STAGE 3D PRINTER SELECTOR (1. BRAND -> 2. MODEL) */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                    <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      {lang === 'en'
                        ? '1. Select Printer Brand & Model'
                        : lang === 'ja'
                        ? '1. メーカーと機種を選択'
                        : '1. 先選品牌・再選 3D 印表機型號'}
                    </span>
                  </label>
                  <span className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    完整收錄 {PRINTER_BRANDS.length} 大廠牌・{PRINTER_PROFILES.length} 款機型系譜
                  </span>
                </div>

                {/* Fast keyword search input for instant model lookup */}
                <div className="relative">
                  <input
                    type="text"
                    value={printerSearchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrinterSearchQuery(val);
                      if (val.trim()) {
                        const matched = findPrinterProfile(val);
                        if (matched) {
                          setSelectedPrinterId(matched.id);
                          setSelectedBrandFilter(matched.brandId);
                        }
                      }
                    }}
                    placeholder="🔍 快速搜尋機型關鍵字（例如：SparkX i8、H3C、K3、K2、Infimech MX Pro、Ender-3、Plus 4...）"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                  {printerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPrinterSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-bold cursor-pointer"
                    >
                      清除
                    </button>
                  )}
                </div>

                {/* Two-stage Brand -> Model Dropdowns + Brand Quick Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setPrinterSearchQuery('');
                      setSelectedBrandFilter('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs shrink-0 ${
                      selectedBrandFilter === 'all' && !printerSearchQuery
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    全部品牌 ({PRINTER_PROFILES.length})
                  </button>
                  {PRINTER_BRANDS.map((b) => {
                    const count = getPrintersByBrand(b.id).length;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setPrinterSearchQuery('');
                          setSelectedBrandFilter(b.id);
                          const matching = getPrintersByBrand(b.id);
                          if (matching.length > 0 && !matching.some((m) => m.id === selectedPrinterId)) {
                            setSelectedPrinterId(matching[0].id);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 shrink-0 ${
                          selectedBrandFilter === b.id && !printerSearchQuery
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{b.icon}</span>
                        <span>{b.shortName}</span>
                        <span className="opacity-70 text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Step 1 (Brand Dropdown) & Step 2 (Model Dropdown) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5 relative">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">步驟一：選擇廠牌</div>
                    <div className="relative">
                      <select
                        value={selectedBrandFilter}
                        onChange={(e) => {
                          const newBrand = e.target.value;
                          setPrinterSearchQuery('');
                          setSelectedBrandFilter(newBrand);
                          const matching = getPrintersByBrand(newBrand);
                          if (matching.length > 0) {
                            setSelectedPrinterId(matching[0].id);
                          }
                        }}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
                      >
                        <option value="all">🌐 顯示全部廠牌 ({PRINTER_PROFILES.length} 款)</option>
                        {PRINTER_BRANDS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.icon} {b.name} ({getPrintersByBrand(b.id).length} 款)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="sm:col-span-7 relative">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">
                      步驟二：選擇機型系列（共 {visiblePrinters.length} 款可選）
                    </div>
                    <div className="relative">
                      <select
                        value={selectedPrinterId}
                        onChange={(e) => {
                          const newId = e.target.value;
                          setSelectedPrinterId(newId);
                          const prof = findPrinterProfile(newId);
                          if (prof && selectedBrandFilter !== 'all') {
                            setSelectedBrandFilter(prof.brandId);
                          }
                        }}
                        className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-2xs truncate"
                      >
                        {visiblePrinters.map((printer) => (
                          <option key={printer.id} value={printer.id}>
                            {printer.name}（{printer.type}・{printer.enclosure === 'full' ? '全封箱' : printer.enclosure === 'optional' ? '可選封箱' : '開放式'}・{printer.maxSpeedMmS}mm/s）
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
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

                {/* Quick project archetype preset buttons - 8 Calibrated Regimes */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(50);
                      setToughness(1);
                      setEaseOfPrint(5);
                      setOutdoorResistance(1);
                      setSurfaceFinish('standard');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🧸</span>
                    <span>精緻公仔</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(55);
                      setToughness(2);
                      setEaseOfPrint(5);
                      setOutdoorResistance(1);
                      setSurfaceFinish('matte');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🎨</span>
                    <span>消光美學</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(55);
                      setToughness(3);
                      setEaseOfPrint(4);
                      setOutdoorResistance(1);
                      setSurfaceFinish('standard');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>⚙️</span>
                    <span>抗裂卡扣</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(75);
                      setToughness(3);
                      setEaseOfPrint(4);
                      setOutdoorResistance(3);
                      setSurfaceFinish('standard');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🛡️</span>
                    <span>耐候機構</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(90);
                      setToughness(3);
                      setEaseOfPrint(3);
                      setOutdoorResistance(5);
                      setSurfaceFinish('standard');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>☀️</span>
                    <span>戶外抗UV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(80);
                      setToughness(4);
                      setEaseOfPrint(3);
                      setOutdoorResistance(3);
                      setSurfaceFinish('cf');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-300 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🔩</span>
                    <span>航太碳纖</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(110);
                      setToughness(4);
                      setEaseOfPrint(2);
                      setOutdoorResistance(3);
                      setSurfaceFinish('cf');
                      setCustomNote('');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200 shrink-0 cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
                  >
                    <span>🔥</span>
                    <span>工業耐溫</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeatResistance(60);
                      setToughness(5);
                      setEaseOfPrint(3);
                      setOutdoorResistance(2);
                      setSurfaceFinish('flexible');
                      setCustomNote('');
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
                          heatResistance >= 100
                            ? 'bg-rose-100 text-rose-800'
                            : heatResistance >= 85
                            ? 'bg-orange-100 text-orange-800'
                            : heatResistance >= 70
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {heatResistance <= 55 && '室內常溫 (PLA/PLA+)'}
                          {heatResistance > 55 && heatResistance <= 70 && '溫熱耐受 (PLA-CF/PETG)'}
                          {heatResistance > 70 && heatResistance < 85 && '車內防曬 (PETG/PETG-CF)'}
                          {heatResistance >= 85 && heatResistance < 100 && '耐高溫 (ASA/ABS-GF)'}
                          {heatResistance >= 100 && '航太耐溫 (PC/PA-CF)'}
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
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHeatResistance(val);
                        if (val >= 75 && surfaceFinish === 'flexible') {
                          setSurfaceFinish('standard');
                        }
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>45°C 室內常溫</span>
                      <span>115°C 航太耐溫</span>
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
                          {toughness === 2 && '日常外殼收納'}
                          {toughness === 3 && '耐摔機構卡扣'}
                          {toughness === 4 && '高剛性承重 (CF/GF)'}
                          {toughness === 5 && (surfaceFinish === 'flexible' ? '高回彈防撞 (TPU)' : '極限抗衝擊 (PC/PA)')}
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
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setToughness(val);
                        if (val < 3 && surfaceFinish === 'cf') {
                          setSurfaceFinish('standard');
                        }
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>Lv.1 精細擺件</span>
                      <span>Lv.5 極限抗衝擊</span>
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
                          {easeOfPrint === 1 && '專業工程控溫 (PC/PA)'}
                          {easeOfPrint === 2 && '需封箱保溫 (ABS/ASA)'}
                          {easeOfPrint === 3 && '進階調參/硬化鋼嘴'}
                          {easeOfPrint === 4 && '標準穩定好印'}
                          {easeOfPrint === 5 && '免封箱零翹邊直印'}
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
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEaseOfPrint(val);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>1★ 工程高階</span>
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
                          {outdoorResistance <= 2 && '室內乾燥環境'}
                          {outdoorResistance === 3 && '半戶外防潮耐水'}
                          {outdoorResistance === 4 && '戶外耐候抗紫外線'}
                          {outdoorResistance === 5 && '全天候暴曬 (ASA/PETG)'}
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
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOutdoorResistance(val);
                      }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                    />

                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span>Lv.1 室內乾燥</span>
                      <span>Lv.5 全年日曬</span>
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
                        onClick={() => {
                          setSurfaceFinish(item.id as any);
                          if (item.id === 'flexible') {
                            if (toughness < 4) setToughness(5);
                            if (heatResistance > 70) setHeatResistance(60);
                          } else if (item.id === 'cf' && toughness < 3) {
                            setToughness(4);
                          }
                        }}
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

              {/* REAL-TIME LIVE MATCH PREVIEW CARD (6-Parameter Slicer Telemetry Grid) */}
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

                {/* Instant 6-Cell Slicer Parameters Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                      {currentPrinter.type === 'Resin' ? 'UV 曝光時間' : '噴嘴擠出溫度'}
                    </div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.nozzleTemp}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                      {currentPrinter.type === 'Resin' ? '底層曝光設定' : '熱床溫度設定'}
                    </div>
                    <div className="font-mono font-bold text-amber-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.bedTemp}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                      {currentPrinter.type === 'Resin' ? 'Z 軸抬升速度' : '適配列印速度'}
                    </div>
                    <div className="font-mono font-bold text-cyan-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.speed}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">
                      {currentPrinter.type === 'Resin' ? '樹脂槽環境溫' : '模型冷卻風扇'}
                    </div>
                    <div className="font-mono font-bold text-white mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.fan}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">最大體積流量 Q</div>
                    <div className="font-mono font-bold text-emerald-300 mt-0.5 whitespace-nowrap">{liveMatch.materialInfo.volumetricFlow}</div>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">建議層高 / 回抽</div>
                    <div className="font-mono font-bold text-indigo-200 mt-0.5 truncate" title={`${liveMatch.materialInfo.layerHeight} · ${liveMatch.materialInfo.retraction}`}>
                      {liveMatch.materialInfo.layerHeight}
                    </div>
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
                      const text = `【${currentPrinter.name}】${liveMatch.materialInfo.fullName} 推薦切片參數：
- 耗材材質: ${liveMatch.materialInfo.fullName}
- 噴嘴擠出溫度: ${liveMatch.materialInfo.nozzleTemp}
- 熱床溫度: ${liveMatch.materialInfo.bedTemp}
- 推薦速度: ${liveMatch.materialInfo.speed}
- 最大體積流量: ${liveMatch.materialInfo.volumetricFlow}
- 建議層高與線寬: ${liveMatch.materialInfo.layerHeight}
- 風扇散熱: ${liveMatch.materialInfo.fan}
- 回抽設定: ${liveMatch.materialInfo.retraction}
- 推薦熱床板: ${liveMatch.materialInfo.bedType}
- 機箱環境: ${liveMatch.materialInfo.enclosureNeeded}
- 建議噴嘴: ${nozzleSize}
- 機型支援: ${currentPrinter.name} (噴嘴上限: ${currentPrinter.maxNozzleTemp}°C, 熱床上限: ${currentPrinter.maxBedTemp}°C)`;
                      navigator.clipboard.writeText(text);
                      recordSlicerUsageForAchievement();
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
