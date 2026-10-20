import React, { useState } from 'react';
import { 
  Calculator, 
  Scale, 
  Flame, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  Info, 
  Cpu, 
  Box, 
  ArrowRight,
  Droplets,
  Thermometer,
  Wrench,
  ShoppingBag,
  Hash,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Link } from 'react-router-dom';
import { EcommerceCopyResult } from '../../types';
import { generateClientEcommerceCopy } from '../../lib/geminiClient';

// Material densities in g/cm3
const MATERIAL_SPECS: Record<string, { density: number; name: string; hdt: number; tensile: number; amsOk: boolean; desc: string }> = {
  'PLA': { density: 1.24, name: 'PLA / 高速 Hyper PLA', hdt: 55, tensile: 50, amsOk: true, desc: '極易列印、無刺鼻氣味、高剛性，最推薦日常與外觀展示模型' },
  'PETG': { density: 1.27, name: 'PETG / 高速 PETG', hdt: 75, tensile: 45, amsOk: true, desc: '耐候防水、抗衝擊、耐弱酸鹼，適合日常受力機構件與水杯架' },
  'ABS': { density: 1.04, name: 'ABS / ASA 耐高溫工程線材', hdt: 95, tensile: 40, amsOk: true, desc: '耐高溫、耐磨抗震，可丙酮熏光，強烈建議封箱機型印製' },
  'TPU': { density: 1.21, name: 'TPU 95A 高彈性橡膠', hdt: 50, tensile: 35, amsOk: false, desc: '柔韌耐磨、減震密封，軟料阻力大不建議放入 AMS 供料系統' },
  'CF': { density: 1.29, name: 'PLA-CF / PETG-CF 航太碳纖維', hdt: 85, tensile: 75, amsOk: true, desc: '極致高模量、啞光隱形層紋、超強抗彎曲，需搭配硬化鋼噴嘴' },
};

// Standard tare weights for empty spools
const SPOOL_TYPES = [
  { id: 'cardboard', name: '環保硬紙盤 (Cardboard)', tare: 180, desc: '拓竹/神狗勾常見環保紙卷軸，空盤重約 180g' },
  { id: 'plastic_standard', name: '通用黑/透明塑膠盤', tare: 220, desc: '市售常規 1kg 塑膠線盤，空盤重約 220g' },
  { id: 'bambu_pc', name: '拓竹可重複使用 PC 盤', tare: 245, desc: '高耐熱透明可拆式 PC 盤，空盤重約 245g' },
  { id: 'refill', name: '裸裝補充包 (無盤重)', tare: 0, desc: '純線卷直接秤重，空盤重量 0g' },
];

// Drying temperature & time charts
const DRYING_GUIDE = [
  { material: 'PLA / PLA-CF', temp: '45°C - 50°C', hours: '4 - 6 小時', moistureRate: '中等', symptoms: '脆化易斷、列印微小劈啪聲' },
  { material: 'PETG / PETG-CF', temp: '65°C - 70°C', hours: '6 - 8 小時', moistureRate: '高', symptoms: '嚴重牽絲、表面起泡粗糙、層間強度降低' },
  { material: 'ABS / ASA', temp: '70°C - 80°C', hours: '4 - 6 小時', moistureRate: '中等', symptoms: '層間裂開、外觀發白霧化、擠出孔微小氣泡' },
  { material: 'TPU 95A', temp: '55°C - 60°C', hours: '6 - 10 小時', moistureRate: '極高 (吸水快)', symptoms: '進料打滑、噴嘴漏料、牽絲嚴重如蛛網' },
  { material: 'PA / PA-CF (尼龍碳纖)', temp: '80°C - 90°C', hours: '8 - 12 小時', moistureRate: '超高', symptoms: '噴嘴劇烈爆裂噴霧、完全無層間附著力' },
];

export const MakerToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quote' | 'spool' | 'drying' | 'ams' | 'ecommerce' | 'shopee'>('quote');

  // --- Tool 1: Print Quoting Calculator States ---
  const [partWeight, setPartWeight] = useState<number>(85);
  const [printHours, setPrintHours] = useState<number>(3.5);
  const [filamentPricePerKg, setFilamentPricePerKg] = useState<number>(450);
  const [printerWatts, setPrinterWatts] = useState<number>(120);
  const [kwhRate, setKwhRate] = useState<number>(4.5);
  const [failureRate, setFailureRate] = useState<number>(5);
  const [depreciationPerHour, setDepreciationPerHour] = useState<number>(15);
  const [laborCost, setLaborCost] = useState<number>(50);
  const [profitMargin, setProfitMargin] = useState<number>(35);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // --- Tool 5: Ecommerce Vertical Column Tool States ---
  const [ecommerceProductName, setEcommerceProductName] = useState('神狗勾高速 Hyper PLA 3D列印線材');
  const [ecommerceMaterial, setEcommerceMaterial] = useState('PLA');
  const [ecommerceFeatures, setEcommerceFeatures] = useState('600mm/s 超高速出料、真圓度±0.02mm、雙層鋁箔真空包裝、Bambu AMS 相容');
  const [ecommerceAudience, setEcommerceAudience] = useState('拓竹創客、模型代印工作室、機構打樣工程師');
  const [ecommercePromotion, setEcommercePromotion] = useState('滿999免運費 / 台灣現貨當日發');
  const [isGeneratingEcommerce, setIsGeneratingEcommerce] = useState(false);
  const [ecommerceResult, setEcommerceResult] = useState<EcommerceCopyResult | null>(null);

  const [copiedEcommerceTitle, setCopiedEcommerceTitle] = useState(false);
  const [copiedEcommerceSpecs, setCopiedEcommerceSpecs] = useState(false);
  const [copiedEcommerceNotices, setCopiedEcommerceNotices] = useState(false);
  const [copiedEcommerceTags, setCopiedEcommerceTags] = useState(false);
  const [copiedEcommerceAll, setCopiedEcommerceAll] = useState(false);

  const handleGenerateEcommerceCopy = async () => {
    setIsGeneratingEcommerce(true);
    try {
      const res = await fetch('/api/ai/ecommerce-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: ecommerceProductName,
          material: ecommerceMaterial,
          features: ecommerceFeatures,
          targetAudience: ecommerceAudience,
          promotion: ecommercePromotion,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.data) {
          setEcommerceResult(data.data);
          return;
        }
      }
      // Resilient fallback to direct client-side Gemini generation
      const fallback = await generateClientEcommerceCopy({
        productName: ecommerceProductName,
        material: ecommerceMaterial,
        features: ecommerceFeatures,
        targetAudience: ecommerceAudience,
        promotion: ecommercePromotion,
      });
      setEcommerceResult(fallback);
    } catch (err) {
      console.warn('Ecommerce copy API network notice, running direct browser Gemini engine:', err);
      try {
        const fallback = await generateClientEcommerceCopy({
          productName: ecommerceProductName,
          material: ecommerceMaterial,
          features: ecommerceFeatures,
          targetAudience: ecommerceAudience,
          promotion: ecommercePromotion,
        });
        setEcommerceResult(fallback);
      } catch (clientErr) {
        console.error('Client copy generation failed:', clientErr);
      }
    } finally {
      setIsGeneratingEcommerce(false);
    }
  };

  // Quote Math
  const rawMaterialCost = (partWeight / 1000) * filamentPricePerKg * (1 + failureRate / 100);
  const electricityCost = (printerWatts / 1000) * printHours * kwhRate;
  const machineDepreciation = depreciationPerHour * printHours;
  const baseCost = rawMaterialCost + electricityCost + machineDepreciation + laborCost;
  const suggestedPrice = Math.round(baseCost / (1 - profitMargin / 100));

  const handleCopyQuote = () => {
    const text = `【3D 列印打樣報價單】
• 模型耗材重量：${partWeight} g
• 預估列印工時：${printHours} 小時
• 耗材基準成本：NT$ ${Math.round(rawMaterialCost)}
• 電費與機器耗損：NT$ ${Math.round(electricityCost + machineDepreciation)}
• 技術人工與後處理：NT$ ${laborCost}
--------------------------
★ 建議含稅報價：NT$ ${suggestedPrice}
(由神狗勾 3D 創客線上工程工具箱精算產出)`;
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  // --- Tool 2: Spool Weight Remaining States ---
  const [selectedSpoolType, setSelectedSpoolType] = useState<string>('cardboard');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('PLA');
  const [totalScaleWeight, setTotalScaleWeight] = useState<number>(430);

  const currentTare = SPOOL_TYPES.find(s => s.id === selectedSpoolType)?.tare || 180;
  const currentDensity = MATERIAL_SPECS[selectedMaterial]?.density || 1.24;
  const netFilamentWeight = Math.max(0, totalScaleWeight - currentTare);
  // Volume in cm3 = Weight / Density
  // 1.75mm cross-section area = pi * (0.175/2)^2 = 0.0240528 cm2
  // Length in cm = Volume / 0.0240528; Length in meters = cm / 100
  const estimatedMeters = Math.round((netFilamentWeight / currentDensity) / 2.40528);

  const toolsSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '神狗勾 3D 列印線上創客工具箱',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'All',
    description: '提供 3D 列印模型成品報價計算器、耗材線盤秤重推算剩餘米數、線材烘烤溫度時長指南與 AMS 相容性矩陣。',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 mt-2">
      <SEO 
        title="3D 列印創客工具箱 - 耗材成本報價計算器與線盤餘量換算" 
        description="免費線上 3D 列印創客實用工具：模型代印成品成本與報價計算器、線盤秤重剩餘克數推算總米數、各材質烘烤溫度指南與拓竹 AMS 相容性對照表。" 
        url="/tools" 
        schema={toolsSchema}
      />

      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <Wrench className="w-3.5 h-3.5 text-indigo-500" />
          <span>開源創客專業工程工具 · 完全免費使用</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          3D 列印線上創客工具箱
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          針對創客、工作室與代印工程師打造的實用輔助工具。精準推算耗材成本、快速產出專業報價單，並解決受潮與空盤計算難題。
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-2xl mx-auto mb-10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quote'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>代印報價計算</span>
        </button>

        <button
          onClick={() => setActiveTab('spool')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'spool'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>線盤餘量換算</span>
        </button>

        <button
          onClick={() => setActiveTab('drying')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'drying'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>烘烤溫度指南</span>
        </button>

        <button
          onClick={() => setActiveTab('ams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ams'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AMS 相容矩陣</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ecommerce');
            if (!ecommerceResult) {
              handleGenerateEcommerceCopy();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ecommerce' || activeTab === 'shopee'
              ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          <span>電商文案與主圖</span>
        </button>
      </div>

      {/* Tab 1: Quote Calculator */}
      {activeTab === 'quote' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">模型參數與工時設定</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  模型重量 (切片克數 g)
                </label>
                <input
                  type="number"
                  min="1"
                  value={partWeight}
                  onChange={(e) => setPartWeight(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  列印工時 (小時 hr)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={printHours}
                  onChange={(e) => setPrintHours(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  耗材成本 (NT$ / kg)
                </label>
                <input
                  type="number"
                  min="100"
                  value={filamentPricePerKg}
                  onChange={(e) => setFilamentPricePerKg(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  失敗與耗損預備金 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={failureRate}
                  onChange={(e) => setFailureRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  機器每小時折舊 (NT$/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  value={depreciationPerHour}
                  onChange={(e) => setDepreciationPerHour(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  人工拆支撐與包裝費 (NT$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                預期利潤率：<strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">{profitMargin}%</strong>
              </label>
              <input
                type="range"
                min="10"
                max="70"
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 space-y-6">
            <div>
              <span className="text-[11px] font-bold text-indigo-300 tracking-wider uppercase">
                代印報價試算結果
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-slate-300">建議報價</span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                  NT$ {suggestedPrice}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                相當於每克成品單價約 NT$ {(suggestedPrice / partWeight).toFixed(1)} / g
              </p>
            </div>

            <div className="space-y-2.5 py-4 border-y border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>材料原始成本 (含 {failureRate}% 損耗)：</span>
                <span className="font-mono font-bold">NT$ {Math.round(rawMaterialCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>電費開銷 (瓦數 {printerWatts}W / {printHours}hr)：</span>
                <span className="font-mono font-bold">NT$ {Math.round(electricityCost)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>機台噴嘴與皮帶折舊：</span>
                <span className="font-mono font-bold">NT$ {Math.round(machineDepreciation)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>技術人工與後處理：</span>
                <span className="font-mono font-bold">NT$ {laborCost}</span>
              </div>
              <div className="flex justify-between text-indigo-300 font-bold pt-2 border-t border-slate-800/80">
                <span>基礎總成本 (Base Cost)：</span>
                <span className="font-mono">NT$ {Math.round(baseCost)}</span>
              </div>
            </div>

            <button
              onClick={handleCopyQuote}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedQuote ? '已複製完整報價單！' : '一鍵複製客戶報價單'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Spool Weight Remaining */}
      {activeTab === 'spool' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">線盤規格與電子秤讀數</h2>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2 text-xs">
                1. 選擇空盤類型 (自動扣除皮重)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPOOL_TYPES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedSpoolType(st.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedSpoolType === st.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{st.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">空盤重: {st.tare}g</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2 text-xs">
                2. 選擇線材材質 (依不同密度精密推算)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(MATERIAL_SPECS).map(([key, spec]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMaterial(key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMaterial === key
                        ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{key}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{spec.density} g/cm³</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                3. 電子秤測量總重 (包含線材與卷軸，單位：克 g)
              </label>
              <input
                type="number"
                min="0"
                max="2500"
                value={totalScaleWeight}
                onChange={(e) => setTotalScaleWeight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-base font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Spool Output */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-center">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                推算剩餘淨線材重量
              </span>
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                {netFilamentWeight} <span className="text-base font-bold">g</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                (總重 {totalScaleWeight}g － 空盤扣重 {currentTare}g)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                換算 1.75mm 剩餘線長
              </span>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {estimatedMeters} <span className="text-base font-bold">米 (Meters)</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                足夠列印約 {Math.floor(netFilamentWeight / 50)} 個 50g 小型物件
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <strong>創客防斷料建議：</strong>若切片軟體顯示下一件模型需求為 120g，目前剩餘 {netFilamentWeight}g，
              {netFilamentWeight >= 120 ? (
                <span className="text-emerald-600 font-bold ml-1">庫存充足，可安心啟動列印！</span>
              ) : (
                <span className="text-rose-600 font-bold ml-1">線料不足！請提前換卷或準備 AMS 自動續料接力。</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Drying Guidelines */}
      {activeTab === 'drying' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">各類 3D 列印線材烘烤溫度與乾燥時間對照表</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                海島型氣候下，線材吸水是牽絲與噴嘴堵塞的頭號元兇。下表為各材質原廠安全烘烤參數。
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                  <th className="p-3 font-bold">材質種類</th>
                  <th className="p-3 font-bold text-amber-600 dark:text-amber-400">建議烘烤溫度</th>
                  <th className="p-3 font-bold text-indigo-600 dark:text-indigo-400">建議乾燥時長</th>
                  <th className="p-3 font-bold">吸濕敏銳度</th>
                  <th className="p-3 font-bold">受潮典型症狀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DRYING_GUIDE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{row.material}</td>
                    <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{row.temp}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.hours}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {row.moistureRate}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">{row.symptoms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            ⚠️ <strong>防軟化安全警告：</strong>烘烤溫度切勿超過該材質的玻璃轉移溫度（Tg，例如 PLA 不得超過 50°C），否則整卷線材會在卷軸上融接黏結成一坨，導致線盤報廢！
          </div>
        </div>
      )}

      {/* Tab 4: AMS Compatibility */}
      {activeTab === 'ams' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AMS 多色自動供料系統耗材相容規範</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bambu Lab AMS 與各廠多色自動換料機之進退料相容性與卷軸規格要求。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>完全相容材料 (Recommended)</span>
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
                <li><strong>神狗勾高速 Hyper PLA：</strong>真圓度 ±0.02mm，退料極度順暢。</li>
                <li><strong>高速 PETG：</strong>剛性足夠，換料切刀切面平整不卡料。</li>
                <li><strong>PLA-CF / PETG-CF 碳纖維：</strong>表面磨砂質調，進料輪抓力極佳。</li>
                <li><strong>ABS / ASA：</strong>需搭配專用 PC 盤耐受乾燥箱溫度。</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>不建議或禁止放入 AMS 材料</span>
              </h3>
              <ul className="text-xs text-rose-900/80 dark:text-rose-200/80 space-y-2 list-disc pl-5">
                <li><strong>TPU 軟料 (任何硬度)：</strong>軟膠極易在特氟龍管與擠出齒輪中被擠壓變形、打滑咬死。</li>
                <li><strong>濕度過高的脆化 PLA：</strong>進料彎曲時容易在內部管道中斷裂成數截。</li>
                <li><strong>直徑超過 202mm 之非標卷軸：</strong>會摩擦 AMS 上蓋造成進退料馬達過載報錯。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Ecommerce Copywriting & 800x800 Image Standards */}
      {(activeTab === 'ecommerce' || activeTab === 'shopee') && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 dark:from-orange-950/40 dark:to-slate-900 border border-orange-200 dark:border-orange-800/60 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      3D 列印商品文案與主圖生成器
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800">
                      電商高轉化 4 大合規標準
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    嚴格落實電商四大產出規範：60 字內高權重 SEO 標題、條列式規格、買家須知、10 個 #Hashtag，並支援 800×800 正方形主圖輸出！
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateEcommerceCopy}
                disabled={isGeneratingEcommerce}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap disabled:cursor-not-allowed"
              >
                {isGeneratingEcommerce ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
                    <span>AI 演算生成中...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-200" />
                    <span>一鍵智能生成文案</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Inputs */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">商品賣點與促銷設定</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    商品名稱 / 核心品類
                  </label>
                  <input
                    type="text"
                    value={ecommerceProductName}
                    onChange={(e) => setEcommerceProductName(e.target.value)}
                    placeholder="例：神狗勾高速 Hyper PLA 3D列印線材"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    主要材質種類
                  </label>
                  <select
                    value={ecommerceMaterial}
                    onChange={(e) => setEcommerceMaterial(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    <option value="PLA">PLA / 高速 Hyper PLA+ (日常展示、高剛性)</option>
                    <option value="PETG">PETG / 高速 PETG-HF (防水耐候、抗衝擊)</option>
                    <option value="ABS">ABS / ASA (耐高溫、耐磨抗震工程料)</option>
                    <option value="TPU">TPU 95A / 85A (高回彈柔性橡膠)</option>
                    <option value="PLA-CF">PLA-CF / PETG-CF 航太碳纖維 (高模量抗彎曲)</option>
                    <option value="PA-CF">PA6-CF / PA12-CF 尼龍碳纖 (耐溫150°C)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    核心特色與參數賣點
                  </label>
                  <textarea
                    rows={3}
                    value={ecommerceFeatures}
                    onChange={(e) => setEcommerceFeatures(e.target.value)}
                    placeholder="例：600mm/s 超高速出料、真圓度±0.02mm、雙層鋁箔真空包裝、Bambu AMS 相容"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    目標受眾族群
                  </label>
                  <input
                    type="text"
                    value={ecommerceAudience}
                    onChange={(e) => setEcommerceAudience(e.target.value)}
                    placeholder="例：拓竹創客、模型代印工作室、機構打樣工程師"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    促銷方針 / 賣場政策
                  </label>
                  <input
                    type="text"
                    value={ecommercePromotion}
                    onChange={(e) => setEcommercePromotion(e.target.value)}
                    placeholder="例：滿999免運費 / 台灣現貨當日發"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateEcommerceCopy}
                  disabled={isGeneratingEcommerce}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-orange-600 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isGeneratingEcommerce ? '生成中...' : '重新生成商品文案'}</span>
                </button>
              </div>

              {/* Product Main Image 800x800 Standard Card */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 space-y-2.5">
                <div className="flex items-center gap-2 text-orange-900 dark:text-orange-200 font-bold text-xs">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  <span>800×800 正方形電商主圖標準</span>
                </div>
                <ul className="text-[11px] text-orange-950/80 dark:text-orange-300/80 space-y-1 list-disc pl-4 leading-relaxed">
                  <li><strong>解析度規範：</strong>固定為 800×800 正方形像素 (1:1 比例)。</li>
                  <li><strong>視覺主體：</strong>商品主體占據畫面 70%~80%，無邊角裁切。</li>
                  <li><strong>背景色調：</strong>純白底 (#FFFFFF) 或淺灰攝影棚，提升點擊率。</li>
                  <li><strong>文字限制：</strong>避免大面積文字壓圖，以免影響商品曝光。</li>
                </ul>
              </div>
            </div>

            {/* Right Formatted Output */}
            <div className="lg:col-span-7 space-y-5">
              {ecommerceResult ? (
                <>
                  {/* 1. 60-char SEO Title Card */}
                  <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          電商 SEO 搜尋最佳化標題 (嚴格限制 60 字內)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ecommerceResult.seoTitle.length <= 60 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200'
                        }`}>
                          {ecommerceResult.seoTitle.length} / 60 字 {ecommerceResult.seoTitle.length <= 60 ? '✓ 合規' : '⚠️ 超出'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(ecommerceResult.seoTitle);
                            setCopiedEcommerceTitle(true);
                            setTimeout(() => setCopiedEcommerceTitle(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-orange-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {copiedEcommerceTitle ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedEcommerceTitle ? '已複製' : '複製標題'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm leading-relaxed">
                      {ecommerceResult.seoTitle}
                    </div>
                  </div>

                  {/* 2. Specs Bullet Points */}
                  <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          條列式產品特色與規格
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(ecommerceResult.specBulletPoints.join('\n'));
                          setCopiedEcommerceSpecs(true);
                          setTimeout(() => setCopiedEcommerceSpecs(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-indigo-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedEcommerceSpecs ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEcommerceSpecs ? '已複製' : '複製規格'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {ecommerceResult.specBulletPoints.map((item, idx) => (
                        <div key={idx} className="font-medium">{item}</div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Buyer Notices */}
                  <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          買家購買須知與出貨保障
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(ecommerceResult.buyerNotice.join('\n'));
                          setCopiedEcommerceNotices(true);
                          setTimeout(() => setCopiedEcommerceNotices(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedEcommerceNotices ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEcommerceNotices ? '已複製' : '複製須知'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {ecommerceResult.buyerNotice.map((item, idx) => (
                        <div key={idx} className="font-medium">{item}</div>
                      ))}
                    </div>
                  </div>

                  {/* 4. 10 Hashtags */}
                  <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-purple-500" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          10 個熱搜 #Hashtag (搜尋標籤權重)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(ecommerceResult.hashtags.join(' '));
                          setCopiedEcommerceTags(true);
                          setTimeout(() => setCopiedEcommerceTags(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-purple-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedEcommerceTags ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEcommerceTags ? '已複製' : '複製標籤'}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ecommerceResult.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Copy All */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(ecommerceResult.fullFormattedDescription);
                      setCopiedEcommerceAll(true);
                      setTimeout(() => setCopiedEcommerceAll(false), 2500);
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {copiedEcommerceAll ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-200" />
                        <span>已複製全部商品上架文案至剪貼簿！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>一鍵複製全部文案 (可直接貼入賣家後台)</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="p-12 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white">點擊按鈕立即生成高轉化商品文案</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      系統將依據您輸入的耗材賣點與繁體中文電商演算法標準，輸出 60 字內 SEO 標題、條列規格、須知與 10 個標籤。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateEcommerceCopy}
                    disabled={isGeneratingEcommerce}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-200" />
                    <span>立即生成</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cross link to Blog */}
      <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-sky-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">想了解更多切片參數與實戰技巧？</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            歡迎造訪神狗勾創客知識庫，收錄 18 篇針對牽絲、翹曲、層紋與多色調校的深入指南。
          </p>
        </div>
        <Link
          to="/blog"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span>瀏覽 18 篇技術專欄</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
