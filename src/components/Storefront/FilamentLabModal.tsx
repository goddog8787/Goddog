import React, { useState } from 'react';
import {
  X,
  Calculator,
  Scale,
  DollarSign,
  Gauge,
  Layers,
  Sparkles,
  Copy,
  Check,
  Info,
  HelpCircle,
  Flame,
  Zap,
  Box,
  Sliders,
  CheckCircle2,
  Cpu,
  Palette
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface FilamentLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  currency: CurrencyCode;
  lang: LanguageCode;
  onSelectProductToCart?: (product: FilamentProduct) => void;
}

// Material densities in g/cm3 (1.75mm cross-section: ~0.02405 cm3 per cm)
// Formula: Weight (g) / (Density (g/cm3) * pi * (0.175/2)^2) = Length in cm / 100 = Length in meters
const MATERIAL_DATA: Record<string, { density: number; name: string; hdt: number; tensile: number; amsOk: boolean; desc: string }> = {
  'PLA': { density: 1.24, name: 'PLA 標準/高速', hdt: 55, tensile: 50, amsOk: true, desc: '極易列印、無氣味、高剛性，最推薦日常與展示品' },
  'PETG': { density: 1.27, name: 'PETG 高韌抗候', hdt: 75, tensile: 45, amsOk: true, desc: '耐候防水、抗衝擊、耐化學腐蝕，適合戶外件與日常水杯支架' },
  'ABS': { density: 1.04, name: 'ABS/ASA 耐高溫工程', hdt: 95, tensile: 40, amsOk: true, desc: '耐熱耐磨、可丙酮熏光，需封箱環境列印' },
  'TPU': { density: 1.21, name: 'TPU 95A 高彈性', hdt: 50, tensile: 35, amsOk: false, desc: '耐磨吸震、柔韌不斷裂，不建議放入 AMS 擠出管中' },
  'Carbon Fiber': { density: 1.29, name: 'PETG-CF / PLA-CF 碳纖維', hdt: 85, tensile: 75, amsOk: true, desc: '高模量、啞光隱形層紋、超強抗彎曲，需硬化鋼噴嘴' },
};

// Standard empty spool tare weights
const SPOOL_TYPES = [
  { id: 'cardboard', name: '環保硬紙盤 (Cardboard)', tareWeight: 180, desc: '可生物分解回收，重量約 180g' },
  { id: 'plastic_standard', name: '通用塑膠盤 (Plastic)', tareWeight: 220, desc: '透明或黑塑膠盤，重量約 220g' },
  { id: 'bambu_pc', name: '拓竹可重複利用 PC 盤 (Bambu Spool)', tareWeight: 245, desc: '耐高溫烘烤，重量約 245g' },
  { id: 'refill', name: '裸裝補充包 (無盤重)', tareWeight: 0, desc: '純線料秤重，空盤重 0g' },
];

export const FilamentLabModal: React.FC<FilamentLabModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  lang,
  onSelectProductToCart,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'estimator' | 'cost' | 'ams' | 'slicer'>('estimator');

  // --- Calculator 1: Remaining Filament State ---
  const [selectedMaterial, setSelectedMaterial] = useState<string>('PLA');
  const [selectedSpoolType, setSelectedSpoolType] = useState<string>('cardboard');
  const [grossWeightInput, setGrossWeightInput] = useState<number>(450); // Total weight with spool in grams
  const [diameter, setDiameter] = useState<number>(1.75); // mm

  const tare = SPOOL_TYPES.find((s) => s.id === selectedSpoolType)?.tareWeight || 180;
  const netWeight = Math.max(0, grossWeightInput - tare);
  const density = MATERIAL_DATA[selectedMaterial]?.density || 1.24;

  // Cross-sectional area in cm^2: pi * (r_cm)^2
  const radiusCm = (diameter / 10) / 2;
  const crossSectionAreaCm2 = Math.PI * radiusCm * radiusCm;
  // Volume in cm3 = netWeight / density
  const volumeCm3 = netWeight / density;
  // Length in cm = volumeCm3 / crossSectionAreaCm2
  const lengthMeters = Math.round((volumeCm3 / crossSectionAreaCm2) / 100);
  const benchyCount = Math.floor(netWeight / 13); // A standard 3DBenchy is ~13 grams
  const phoneStandCount = Math.floor(netWeight / 38); // Standard phone stand ~38 grams

  // --- Calculator 2: Commercial Printing Cost State ---
  const [modelWeightGrams, setModelWeightGrams] = useState<number>(85);
  const [printHours, setPrintHours] = useState<number>(4.5);
  const [filamentCostPerKg, setFilamentCostPerKg] = useState<number>(550);
  const [printerWattage, setPrinterWattage] = useState<number>(180); // Watts (Bambu X1/P1 ~120-250W)
  const [electricityRate, setElectricityRate] = useState<number>(4.5); // NTD per kWh
  const [depreciationPerHour, setDepreciationPerHour] = useState<number>(20); // NTD/hr
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(45); // Margin %

  const materialCost = (modelWeightGrams / 1000) * filamentCostPerKg;
  const kwhUsed = (printerWattage * printHours) / 1000;
  const electricityCost = kwhUsed * electricityRate;
  const machineDepreciation = printHours * depreciationPerHour;
  const baseCost = materialCost + electricityCost + machineDepreciation;
  const recommendedQuotation = Math.round(baseCost / (1 - targetMarginPercent / 100));
  const grossProfit = recommendedQuotation - Math.round(baseCost);

  // Copy Quotation Summary
  const [copiedQuote, setCopiedQuote] = useState(false);
  const handleCopyQuote = () => {
    const text = `【3D 列印代工精算報價單】\n` +
      `▪ 模型耗材重量：${modelWeightGrams}g (耗材費 NT$ ${Math.round(materialCost)})\n` +
      `▪ 列印總耗時：${printHours} 小時 (設備與電力折舊 NT$ ${Math.round(electricityCost + machineDepreciation)})\n` +
      `▪ 專業基礎製造成本：NT$ ${Math.round(baseCost)}\n` +
      `▪ 建議正式代印報價：NT$ ${recommendedQuotation} (含技術維護與品質保證)\n` +
      `神狗勾耗材商城 • 頂級創客品質保證`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // --- Slicer Parameters Preset State ---
  const [slicerPrinter, setSlicerPrinter] = useState<'bambu' | 'creality' | 'prusa' | 'voron'>('bambu');
  const [slicerMaterial, setSlicerMaterial] = useState<'pla' | 'petg' | 'abs' | 'cf'>('pla');
  const [copiedPreset, setCopiedPreset] = useState(false);

  const SLICER_PRESETS: Record<string, Record<string, any>> = {
    bambu: {
      pla: { nozzle: '215 - 225°C', bed: '55 - 60°C', speed: '300 - 450 mm/s', fan: '100%', volFlow: '24 mm³/s', retraction: '0.8 mm (Direct)', note: 'Bambu Lab X1C / P1S / A1 專用高流速配置，第一層降至 50mm/s 確保附著。' },
      petg: { nozzle: '245 - 255°C', bed: '70 - 75°C', speed: '180 - 250 mm/s', fan: '40 - 60%', volFlow: '18 mm³/s', retraction: '1.0 mm (Direct)', note: '冷卻風扇勿開滿以防層間強度降低，熱床必須塗口紅膠或使用紋理 PEI 盤。' },
      abs: { nozzle: '260 - 270°C', bed: '90 - 100°C', speed: '150 - 200 mm/s', fan: '10 - 20%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: '必須封箱列印！關閉腔體通風風扇，列印完閉冷卻至 40°C 以下再開箱防翹曲。' },
      cf: { nozzle: '255 - 265°C', bed: '65 - 70°C', speed: '200 - 300 mm/s', fan: '50 - 70%', volFlow: '21 mm³/s', retraction: '0.8 mm', note: '必須使用硬化鋼噴嘴 (0.4mm 以上) 與硬化擠出輪，嚴防不銹鋼噴嘴磨損！' },
    },
    creality: {
      pla: { nozzle: '205 - 215°C', bed: '50 - 60°C', speed: '120 - 250 mm/s', fan: '100%', volFlow: '18 mm³/s', retraction: '0.8 mm (K1/Ender-3 V3)', note: '推薦開啟自動壓頻 (Input Shaping) 消除共振鬼影。' },
      petg: { nozzle: '235 - 245°C', bed: '70 - 75°C', speed: '80 - 150 mm/s', fan: '30 - 50%', volFlow: '14 mm³/s', retraction: '1.2 mm', note: '第一層厚度可稍微放寬至 0.24mm 避免過度擠壓造成拖料。' },
      abs: { nozzle: '250 - 260°C', bed: '90 - 95°C', speed: '60 - 120 mm/s', fan: '0 - 15%', volFlow: '12 mm³/s', retraction: '0.8 mm', note: '無箱體機種建議加裝隔熱罩 (Enclosure tent)。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '100 - 180 mm/s', fan: '40 - 60%', volFlow: '15 mm³/s', retraction: '0.8 mm', note: '更換雙金屬或硬化鋼噴嘴以防喉管磨穿。' },
    },
    prusa: {
      pla: { nozzle: '210 - 215°C', bed: '60°C', speed: '150 - 200 mm/s', fan: '100%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: 'Prusa MK4 / XL Nextruder 壓力傳感自動首層，精細度極高。' },
      petg: { nozzle: '240°C', bed: '85°C', speed: '120 - 160 mm/s', fan: '50%', volFlow: '15 mm³/s', retraction: '1.0 mm', note: '務必使用粉體 PEI 鋼板，避免光滑 PEI 盤被 PETG 黏破。' },
      abs: { nozzle: '255°C', bed: '100°C', speed: '80 - 120 mm/s', fan: '10%', volFlow: '13 mm³/s', retraction: '0.8 mm', note: '搭配 Prusa Enclosure 恒溫箱效果極佳。' },
      cf: { nozzle: '250°C', bed: '70°C', speed: '120 - 180 mm/s', fan: '50%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: '請換裝 Prusa Nozzle Hardened Steel。' },
    },
    voron: {
      pla: { nozzle: '220 - 230°C', bed: '60°C', speed: '250 - 500 mm/s', fan: '100%', volFlow: '26 mm³/s', retraction: '0.6 mm', note: 'Voron 2.4 / Trident StealthBurner 高速高冷卻設置。' },
      petg: { nozzle: '250°C', bed: '75°C', speed: '180 - 280 mm/s', fan: '40%', volFlow: '20 mm³/s', retraction: '0.8 mm', note: '高剛性機架可大幅提升加速至 10,000 mm/s²。' },
      abs: { nozzle: '265 - 275°C', bed: '105 - 110°C', speed: '200 - 300 mm/s', fan: '15%', volFlow: '18 mm³/s', retraction: '0.6 mm', note: 'Voron 經典原生材質！腔體溫度需達 50°C 以上再開始列印。' },
      cf: { nozzle: '260°C', bed: '80°C', speed: '200 - 300 mm/s', fan: '50%', volFlow: '22 mm³/s', retraction: '0.6 mm', note: '極致工裝治具與無人機機架首選。' },
    }
  };

  const currentPreset = SLICER_PRESETS[slicerPrinter]?.[slicerMaterial] || SLICER_PRESETS.bambu.pla;

  const handleCopyPreset = () => {
    const text = `【神狗勾 3D 切片參數推薦】\n` +
      `▪ 機種環境：${slicerPrinter.toUpperCase()} | 耗材：${slicerMaterial.toUpperCase()}\n` +
      `▪ 噴嘴溫度：${currentPreset.nozzle}\n` +
      `▪ 熱床溫度：${currentPreset.bed}\n` +
      `▪ 推薦速度：${currentPreset.speed}\n` +
      `▪ 風扇轉速：${currentPreset.fan}\n` +
      `▪ 最大體積流速：${currentPreset.volFlow}\n` +
      `▪ 回抽距離：${currentPreset.retraction}\n` +
      `▪ 專業備註：${currentPreset.note}`;
    navigator.clipboard.writeText(text);
    setCopiedPreset(true);
    setTimeout(() => setCopiedPreset(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 text-amber-300 flex items-center justify-center shadow-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  神狗勾 3D 創客計算實驗室
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                  Maker Pro
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                殘餘線材測量 • 商業代印成本精算 • Bambu AMS 多色矩陣 • 切片參數產生器
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'estimator'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>線盤剩餘米數測量</span>
          </button>

          <button
            onClick={() => setActiveTab('cost')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'cost'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>代印報價與成本精算</span>
          </button>

          <button
            onClick={() => setActiveTab('ams')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'ams'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>AMS 多色與支撐矩陣</span>
          </button>

          <button
            onClick={() => setActiveTab('slicer')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'slicer'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>切片參數一鍵生成</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7">
          {/* TAB 1: ESTIMATOR */}
          {activeTab === 'estimator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-950 leading-relaxed">
                  在進行大尺寸列印前，先用廚房秤量秤含盤總重。系統會自動扣除對應空盤重量，並結合材質精確比重，計算出<strong>剩餘公尺數</strong>與<strong>可印模型數量</strong>，徹底杜絕斷線斷印悲劇！
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Controls */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">1. 選擇耗材材質種類：</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(MATERIAL_DATA).map(([key, info]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedMaterial(key)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedMaterial === key
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="font-mono text-xs">{key}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{info.density} g/cm³</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">2. 空線盤規格 (自動扣盤重 Tare)：</label>
                    <div className="space-y-1.5">
                      {SPOOL_TYPES.map((spool) => (
                        <button
                          key={spool.id}
                          type="button"
                          onClick={() => setSelectedSpoolType(spool.id)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            selectedSpoolType === spool.id
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{spool.name}</div>
                            <div className="text-[10px] text-slate-400">{spool.desc}</div>
                          </div>
                          <span className="font-mono text-xs text-indigo-600 font-bold">-{spool.tareWeight}g</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1.5">
                      <span>3. 秤重含盤總重 (Gross Weight)：</span>
                      <span className="font-mono text-indigo-600 text-sm">{grossWeightInput} 克 (g)</span>
                    </div>
                    <input
                      type="range"
                      min={tare + 10}
                      max={1500}
                      step={10}
                      value={grossWeightInput}
                      onChange={(e) => setGrossWeightInput(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>空盤重 ({tare}g)</span>
                      <span>半卷 (~600g)</span>
                      <span>全新一卷 (~1240g)</span>
                    </div>
                  </div>
                </div>

                {/* Right Results Display */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-xl border border-slate-800">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" />
                        測量精算結果
                      </span>
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md font-mono">
                        Ø 1.75mm
                      </span>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-xs text-slate-400">線材實際剩餘淨重</div>
                        <div className="text-3xl font-black text-white font-mono mt-0.5">
                          {netWeight} <span className="text-lg font-normal text-slate-400">g</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30">
                        <div className="text-xs text-indigo-200">剩餘總線長度（公尺）</div>
                        <div className="text-4xl font-black text-amber-300 font-mono mt-1">
                          ≈ {lengthMeters} <span className="text-lg font-normal text-amber-200/70">公尺 (m)</span>
                        </div>
                        <p className="text-[11px] text-indigo-300/80 mt-1">
                          相當於 {Math.round(lengthMeters * 3.28)} 英尺，體積約 {Math.round(volumeCm3)} cm³
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-400">約可列印 3DBenchy</div>
                          <div className="text-xl font-black text-white font-mono mt-0.5">
                            {benchyCount} <span className="text-xs font-normal">隻</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">以 13g/隻 計算</div>
                        </div>

                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-[10px] text-slate-400">約可列印 手機立架</div>
                          <div className="text-xl font-black text-white font-mono mt-0.5">
                            {phoneStandCount} <span className="text-xs font-normal">座</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">以 38g/座 計算</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 border-t border-slate-800 pt-3">
                    {netWeight < 100 ? (
                      <div className="text-rose-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-500" />
                        <span>耗材即將告罄！建議提前備料神狗勾高速線材免斷料。</span>
                      </div>
                    ) : (
                      <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>存量充裕，足以完成中大型模型列印任務！</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COST & QUOTATION */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-950 leading-relaxed">
                  專為工作室與商業代印量身打造！綜合計算<strong>線材重量損耗</strong>、<strong>印表機電力瓦數</strong>、<strong>機台噴嘴損耗折舊</strong>與<strong>技術利潤率</strong>，自動生成專業報價單，接案更具說服力！
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>模型切片耗料克數：</span>
                      <span className="font-mono text-emerald-600 font-bold">{modelWeightGrams} g</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={800}
                      step={5}
                      value={modelWeightGrams}
                      onChange={(e) => setModelWeightGrams(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>切片預估列印時間 (小時)：</span>
                      <span className="font-mono text-emerald-600 font-bold">{printHours} 小時</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={36}
                      step={0.5}
                      value={printHours}
                      onChange={(e) => setPrintHours(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">耗材每公斤成本 (NT$)</label>
                      <input
                        type="number"
                        value={filamentCostPerKg}
                        onChange={(e) => setFilamentCostPerKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">機台功率 (瓦數 W)</label>
                      <input
                        type="number"
                        value={printerWattage}
                        onChange={(e) => setPrinterWattage(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">機台折舊每小時 (NT$)</label>
                      <input
                        type="number"
                        value={depreciationPerHour}
                        onChange={(e) => setDepreciationPerHour(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">期望毛利率 (%)</label>
                      <input
                        type="number"
                        min={10}
                        max={85}
                        value={targetMarginPercent}
                        onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Quotation Breakdown Card */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl border border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        代印成本明細分析
                      </span>
                      <span className="text-[10px] text-slate-400">毛利目標: {targetMarginPercent}%</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>耗材原材料成本：</span>
                        <span className="font-mono text-white">NT$ {Math.round(materialCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>用電成本 ({kwhUsed.toFixed(2)} 度)：</span>
                        <span className="font-mono text-white">NT$ {Math.round(electricityCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>設備耗損與折舊：</span>
                        <span className="font-mono text-white">NT$ {Math.round(machineDepreciation)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 font-bold">
                        <span>總基礎硬成本：</span>
                        <span className="font-mono text-amber-300">NT$ {Math.round(baseCost)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 text-center mt-3">
                      <div className="text-xs text-emerald-200">建議對外商業報價：</div>
                      <div className="text-3xl font-black text-white font-mono mt-1">
                        NT$ {recommendedQuotation.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-300 mt-1 font-mono">
                        預估淨毛利：NT$ {grossProfit.toLocaleString()} ({targetMarginPercent}%)
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      copiedQuote
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-900 shadow-md'
                    }`}
                  >
                    {copiedQuote ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>已複製代印報價單明細！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>一鍵複製對客報價單摘要</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMS & SUPPORT MATRIX */}
          {activeTab === 'ams' && (
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Palette className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 leading-relaxed">
                  Bambu Lab AMS / 多色供料系統專用秘笈！利用<strong>不同材質的表面張力不相融特性</strong>，可以用極低的成本印出光潔如鏡的支撐界面，再也不需要購買昂貴的專用水溶性 PVA 支撐料！
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>神狗勾創客秘技：PLA 主體 ＋ PETG 支撐界面</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    在切片軟體（Bambu Studio / OrcaSlicer）中，將「支撐界面層 (Support Interface)」設為 PETG，間距 (Z-Distance) 設為 <strong>0mm</strong>。兩者熔點相近但在化學鍵上完全不互黏，冷卻後可用鑷子直接輕輕一揭即落，懸垂面如鏡面平整！
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 font-mono text-slate-700">
                    <div>▪ 熱床設定：65°C（兼容兩者）</div>
                    <div>▪ 沖刷量 (Purge Volume)：450mm³（避免兩者混料弱化）</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>AMS 耗材安全禁忌清單</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕ TPU 軟膠：</span>
                      <span>極易在鐵氟龍送料管與齒輪中卡死，嚴禁放入 AMS（請使用機身外掛料架）。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">⚠ 軟邊硬紙盤：</span>
                      <span>部分副廠紙盤邊緣摩擦力不足或掉屑，推薦裝上「防磨護邊外框」再放入 AMS。</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓ 碳纖維 (CF/GF)：</span>
                      <span>可放入 AMS，但頻繁進退料會加速送料漏斗磨損，推薦選配不銹鋼耐磨漏斗嘴。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLICER PARAMETER GENERATOR */}
          {activeTab === 'slicer' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-start gap-3">
                <Cpu className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-950 leading-relaxed">
                  針對台灣主流機種實測調校的黃金切片參數！支援 Bambu Studio、OrcaSlicer、PrusaSlicer、Cura 與 Klipper 機型，複製即用免去反覆調參試錯成本。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">選擇印表機種體系：</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bambu', name: 'Bambu Lab (X1C/P1S/A1)' },
                        { id: 'creality', name: 'Creality (K1/Ender-3)' },
                        { id: 'prusa', name: 'Prusa (MK4 / XL)' },
                        { id: 'voron', name: 'Voron 2.4 / Klipper' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSlicerPrinter(p.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            slicerPrinter === p.id
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">選擇耗材材質：</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'pla', name: '高速 PLA (High-Speed)' },
                        { id: 'petg', name: '耐候韌性 PETG' },
                        { id: 'abs', name: '高耐熱工程 ABS' },
                        { id: 'cf', name: '碳纖維複合 (CF/GF)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSlicerMaterial(m.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            slicerMaterial === m.id
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-500/20'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preset Display Card */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl border border-slate-800">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-purple-400 font-bold flex items-center gap-1.5">
                        <Sliders className="w-4 h-4" />
                        實測調校最佳化切片參數
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-mono uppercase">
                        {slicerPrinter} • {slicerMaterial}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">噴嘴溫度 (Nozzle)</div>
                        <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{currentPreset.nozzle}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">熱床溫度 (Bed)</div>
                        <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{currentPreset.bed}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">列印速度極限</div>
                        <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{currentPreset.speed}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">最大體積流速</div>
                        <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">{currentPreset.volFlow}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">模型冷卻風扇</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">{currentPreset.fan}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">回抽距離 (Retract)</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">{currentPreset.retraction}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-indigo-200">
                      💡 <strong>實測心得：</strong>{currentPreset.note}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPreset}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      copiedPreset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                    }`}
                  >
                    {copiedPreset ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>已複製切片參數！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>複製此組切片參數</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
