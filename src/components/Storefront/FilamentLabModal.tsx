import React, { useState, useEffect } from 'react';
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
  Palette,
  Wind,
  Droplets,
  Thermometer,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface FilamentLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  currency?: CurrencyCode;
  lang?: LanguageCode;
  onAddToCart?: (product: FilamentProduct, color: any, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
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

// Drying Guide Constants
const DRYING_GUIDELINES: Array<{
  material: string;
  badge: string;
  temp: string;
  time: string;
  storageRh: string;
  spoolLimit: string;
  symptoms: string[];
  tips: string;
}> = [
  {
    material: 'High-Speed PLA / PLA+',
    badge: '日常主力',
    temp: '45°C - 50°C',
    time: '4 - 6 小時',
    storageRh: '< 25% RH',
    spoolLimit: '紙盤勿超過 50°C 以防軟化變形',
    symptoms: ['微量細絲蜘蛛網', '表面微小氣泡爆音', '線材變脆折斷'],
    tips: '烘烤溫度切勿超過 53°C，否則 PLA 結晶軟化會黏結整盤卡死！'
  },
  {
    material: 'PETG / PETG-HF 高速耐候',
    badge: '中度吸濕',
    temp: '60°C - 65°C',
    time: '6 - 8 小時',
    storageRh: '< 20% RH',
    spoolLimit: '適用標準塑膠盤或耐溫盤',
    symptoms: ['嚴重粗拉絲、牽絲成網', '噴嘴處持續爆裂聲音', '表面粗糙多斑點'],
    tips: 'PETG 吸水速度是 PLA 的 3 倍，拆封 48 小時後建議烘乾後再列印。'
  },
  {
    material: 'TPU 95A / 85A 彈性軟膠',
    badge: '極度吸濕',
    temp: '50°C - 55°C',
    time: '8 - 12 小時',
    storageRh: '< 15% RH',
    spoolLimit: '需使用乾燥盒直供邊烘邊印',
    symptoms: ['劇烈滲料流涎', '內部空隙與結構發泡', '擠出機齒輪打滑卡死'],
    tips: 'TPU 列印前務必強制烘乾，強烈推薦直接從加熱乾燥盒中穿管出料列印！'
  },
  {
    material: 'PLA-CF / PETG-CF 碳纖維',
    badge: '高剛性複合',
    temp: '60°C - 70°C',
    time: '6 - 8 小時',
    storageRh: '< 20% RH',
    spoolLimit: '碳纖維易吸附環境濕氣',
    symptoms: ['消光表面失真發亮', '層間結合強度大幅降低', '噴嘴微堵出料不均'],
    tips: '碳纖維多孔結構比純樹脂更容易鎖住水氣，徹底乾燥可保證消光無層紋質感。'
  },
  {
    material: 'ABS+ / ASA / PA-CF 尼龍工程',
    badge: '高溫工程',
    temp: '70°C - 80°C',
    time: '8 - 12 小時',
    storageRh: '< 10% RH',
    spoolLimit: '嚴禁使用一般低熔點紙盤直接 80°C 烘烤',
    symptoms: ['層間完全不黏開裂', '列印時發出劈啪水氣聲', '模型劇烈收縮翹邊'],
    tips: 'PA/尼龍極易飽和吸水，請使用專業防潮烘乾箱並搭配分子篩變色乾燥劑。'
  }
];

export const FilamentLabModal: React.FC<FilamentLabModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  lang,
  onSelectProductToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'estimator' | 'cost' | 'ams' | 'slicer' | 'drying'>('estimator');

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
  const [slicerPrinter, setSlicerPrinter] = useState<'bambu' | 'creality' | 'flashforge' | 'snapmaker' | 'anycubic' | 'elegoo' | 'prusa' | 'voron' | 'qidi'>('bambu');
  const [slicerMaterial, setSlicerMaterial] = useState<'pla' | 'petg' | 'abs' | 'cf' | 'tpu'>('pla');
  const [copiedPreset, setCopiedPreset] = useState(false);

  const SLICER_PRESETS: Record<string, Record<string, any>> = {
    bambu: {
      pla: { nozzle: '215 - 225°C', bed: '55 - 60°C', speed: '300 - 450 mm/s', fan: '100%', volFlow: '24 mm³/s', retraction: '0.8 mm (Direct)', note: 'Bambu Lab X1C / P1S / A1 專用高流速配置，第一層降至 45mm/s 確保抓地力。' },
      petg: { nozzle: '245 - 255°C', bed: '70 - 75°C', speed: '200 - 280 mm/s', fan: '40 - 60%', volFlow: '19 mm³/s', retraction: '1.0 mm (Direct)', note: '冷卻風扇勿開滿以防層間弱化，紋理粉體 PEI 鋼板免塗膠。' },
      abs: { nozzle: '260 - 275°C', bed: '95 - 105°C', speed: '150 - 250 mm/s', fan: '10 - 20%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: 'X1C/P1S 全封閉保溫，A1 開放機種需外加保溫帳篷避免收縮翹邊。' },
      cf: { nozzle: '255 - 265°C', bed: '60 - 65°C', speed: '200 - 300 mm/s', fan: '60 - 80%', volFlow: '22 mm³/s', retraction: '0.8 mm', note: '必須使用原廠 0.4mm 以上硬化鋼噴嘴與硬化鋼擠出輪！' },
      tpu: { nozzle: '220 - 235°C', bed: '45 - 50°C', speed: '35 - 50 mm/s', fan: '100%', volFlow: '6 mm³/s', retraction: '0.5 mm @ 20mm/s', note: '嚴禁放入 AMS！必須從機身後方外掛料架直接供料入擠出機。' },
    },
    creality: {
      pla: { nozzle: '205 - 220°C', bed: '55 - 60°C', speed: '250 - 400 mm/s (K1/V3)', fan: '100%', volFlow: '22 mm³/s', retraction: '0.8 mm', note: 'K1C / Ender-3 V3 支援自動壓頻共振補償，高速平整度絕佳。' },
      petg: { nozzle: '240 - 250°C', bed: '70 - 80°C', speed: '150 - 220 mm/s', fan: '30 - 50%', volFlow: '16 mm³/s', retraction: '1.0 mm', note: '第一層厚度建議 0.24mm，適度加寬首層擠出寬度。' },
      abs: { nozzle: '260 - 270°C', bed: '95 - 100°C', speed: '120 - 200 mm/s', fan: '10 - 15%', volFlow: '15 mm³/s', retraction: '0.8 mm', note: 'K1C / K1 封閉機型請保持艙門緊閉；Ender-3 開放型建議搭配保溫罩。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '150 - 250 mm/s', fan: '50 - 70%', volFlow: '18 mm³/s', retraction: '0.8 mm', note: 'K1C 標配獨角獸一體式硬化鋼噴嘴可直上；傳統黃銅需升級硬化鋼。' },
      tpu: { nozzle: '220 - 230°C', bed: '45 - 50°C', speed: '30 - 50 mm/s', fan: '100%', volFlow: '5 mm³/s', retraction: '0.5 mm', note: '近端擠出機微調進料齒輪張力避免咬料變形。' },
    },
    flashforge: {
      pla: { nozzle: '210 - 220°C', bed: '50 - 60°C', speed: '250 - 400 mm/s', fan: '100%', volFlow: '22 mm³/s', retraction: '0.8 mm', note: '5M Pro 快拆噴嘴加熱迅速，雙重空氣濾清提供無味列印。' },
      petg: { nozzle: '240 - 250°C', bed: '75 - 80°C', speed: '150 - 220 mm/s', fan: '40%', volFlow: '16 mm³/s', retraction: '1.0 mm', note: '紋理 PEI 彈簧鋼板附著優異，冷卻至室溫後自動彈脫。' },
      abs: { nozzle: '260 - 270°C', bed: '100°C', speed: '120 - 180 mm/s', fan: '10 - 20%', volFlow: '15 mm³/s', retraction: '0.8 mm', note: '5M Pro 內循環濾清 + 全封箱，列印 ABS 零翹邊、無刺鼻塑膠氣味。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '150 - 250 mm/s', fan: '60%', volFlow: '18 mm³/s', retraction: '0.8 mm', note: '需使用閃鑄 0.4mm / 0.6mm 高強度耐磨噴嘴組件。' },
      tpu: { nozzle: '220 - 230°C', bed: '45°C', speed: '30 - 45 mm/s', fan: '100%', volFlow: '5 mm³/s', retraction: '0.5 mm', note: '關閉機箱頂蓋風扇，外掛料架低阻力進料。' },
    },
    snapmaker: {
      pla: { nozzle: '210 - 220°C', bed: '55 - 60°C', speed: '150 - 250 mm/s (J1s 350mm/s)', fan: '100%', volFlow: '18 mm³/s', retraction: '0.6 mm', note: 'J1 / J1s 具備 IDEX 獨立雙頭，可雙色或複製/鏡像模式同時列印兩組！' },
      petg: { nozzle: '240 - 250°C', bed: '75 - 80°C', speed: '120 - 180 mm/s', fan: '40%', volFlow: '15 mm³/s', retraction: '0.8 mm', note: 'IDEX 獨立雙頭最佳搭檔：可用 PLA 印主體，PETG 印支撐接觸面，零間隙鏡面剝離！' },
      abs: { nozzle: '260 - 270°C', bed: '95 - 100°C', speed: '100 - 150 mm/s', fan: '10%', volFlow: '14 mm³/s', retraction: '0.6 mm', note: 'J1/Artisan 全封箱具備優良熱保溫性能，建議熱床預熱 15 分鐘後啟印。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '120 - 200 mm/s', fan: '50%', volFlow: '17 mm³/s', retraction: '0.6 mm', note: '更換耐磨硬化噴嘴模組，航模零件與剛性卡扣首選。' },
      tpu: { nozzle: '220 - 235°C', bed: '45°C', speed: '30 - 45 mm/s', fan: '100%', volFlow: '5 mm³/s', retraction: '0.4 mm', note: 'J1 近端直驅雙齒輪進料順暢，雙噴頭可同時印出硬質主體 + 軟膠緩衝墊圈！' },
    },
    anycubic: {
      pla: { nozzle: '210 - 220°C', bed: '55 - 60°C', speed: '250 - 400 mm/s', fan: '100%', volFlow: '22 mm³/s', retraction: '0.8 mm', note: 'Kobra 3 搭配 ACE Pro 主動烘乾多色箱，在線乾燥防潮列印。' },
      petg: { nozzle: '240 - 250°C', bed: '75 - 80°C', speed: '150 - 220 mm/s', fan: '40 - 50%', volFlow: '17 mm³/s', retraction: '1.0 mm', note: 'ACE Pro 可將 PETG 維持在 55°C 乾燥環境，徹底告別拉絲。' },
      abs: { nozzle: '255 - 265°C', bed: '95 - 100°C', speed: '100 - 160 mm/s', fan: '10%', volFlow: '14 mm³/s', retraction: '0.8 mm', note: '開放式機型強烈建議加裝簡易保溫罩以防開裂。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '150 - 220 mm/s', fan: '60%', volFlow: '18 mm³/s', retraction: '0.8 mm', note: '換裝硬化鋼噴嘴，避免原廠黃銅噴嘴快速被碳纖維磨損。' },
      tpu: { nozzle: '220 - 230°C', bed: '45°C', speed: '30 - 45 mm/s', fan: '100%', volFlow: '5 mm³/s', retraction: '0.5 mm', note: '嚴禁放入 ACE Pro 多色進料盒！必須使用機身外掛料架直接進料。' },
    },
    elegoo: {
      pla: { nozzle: '210 - 220°C', bed: '55 - 60°C', speed: '200 - 350 mm/s', fan: '100%', volFlow: '20 mm³/s', retraction: '0.8 mm', note: 'Neptune 4 具備後置大散熱橫流風扇，高速懸垂冷卻極其強悍。' },
      petg: { nozzle: '240 - 250°C', bed: '75 - 80°C', speed: '140 - 200 mm/s', fan: '35 - 50%', volFlow: '16 mm³/s', retraction: '1.0 mm', note: '橫流風扇轉速建議降至 30-40%，過大風速會導致 PETG 層裂。' },
      abs: { nozzle: '255 - 265°C', bed: '95 - 100°C', speed: '100 - 150 mm/s', fan: '10%', volFlow: '14 mm³/s', retraction: '0.8 mm', note: 'Centauri Carbon 封箱機型可直接印；Neptune 4 需外掛保溫帳篷。' },
      cf: { nozzle: '245 - 255°C', bed: '60 - 65°C', speed: '140 - 220 mm/s', fan: '50%', volFlow: '18 mm³/s', retraction: '0.8 mm', note: '標配或更換耐磨硬化鋼噴嘴，確保高精度尺寸穩定度。' },
      tpu: { nozzle: '220 - 230°C', bed: '45°C', speed: '30 - 45 mm/s', fan: '80%', volFlow: '5 mm³/s', retraction: '0.5 mm', note: 'Neptune 近端雙齒輪擠出機推料穩定，平穩慢速輸出。' },
    },
    prusa: {
      pla: { nozzle: '210 - 215°C', bed: '60°C', speed: '150 - 200 mm/s', fan: '100%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: 'Prusa MK4S / XL Nextruder 壓力傳感自動首層，精細度極高。' },
      petg: { nozzle: '240°C', bed: '85°C', speed: '120 - 160 mm/s', fan: '50%', volFlow: '15 mm³/s', retraction: '1.0 mm', note: '務必使用粉體 PEI 鋼板，避免光滑 PEI 盤被 PETG 黏破。' },
      abs: { nozzle: '255°C', bed: '100°C', speed: '80 - 120 mm/s', fan: '10%', volFlow: '13 mm³/s', retraction: '0.8 mm', note: 'Prusa Core One 具備 60°C 主動腔溫控制，列印高溫材料零翹邊。' },
      cf: { nozzle: '250°C', bed: '70°C', speed: '120 - 180 mm/s', fan: '50%', volFlow: '16 mm³/s', retraction: '0.8 mm', note: '請換裝 Prusa Nozzle Hardened Steel。' },
      tpu: { nozzle: '225 - 235°C', bed: '50°C', speed: '30 - 45 mm/s', fan: '100%', volFlow: '5 mm³/s', retraction: '0.4 mm', note: 'Nextruder 內部導料管間隙極小，列印 TPU 表現極為可靠。' },
    },
    voron: {
      pla: { nozzle: '220 - 230°C', bed: '60°C', speed: '250 - 500 mm/s', fan: '100%', volFlow: '26 mm³/s', retraction: '0.6 mm', note: 'Voron 2.4 / Trident StealthBurner 高速高冷卻設置。' },
      petg: { nozzle: '250°C', bed: '75°C', speed: '180 - 280 mm/s', fan: '40%', volFlow: '20 mm³/s', retraction: '0.8 mm', note: '高剛性機架可大幅提升加速至 10,000 mm/s²。' },
      abs: { nozzle: '265 - 275°C', bed: '105 - 110°C', speed: '200 - 300 mm/s', fan: '15%', volFlow: '18 mm³/s', retraction: '0.6 mm', note: 'Voron 經典原生材質！腔體溫度需達 50°C 以上再開始列印。' },
      cf: { nozzle: '260°C', bed: '80°C', speed: '200 - 300 mm/s', fan: '50%', volFlow: '22 mm³/s', retraction: '0.6 mm', note: '極致工裝治具與無人機機架首選。' },
      tpu: { nozzle: '225 - 235°C', bed: '45°C', speed: '35 - 55 mm/s', fan: '100%', volFlow: '6 mm³/s', retraction: '0.5 mm', note: 'Clockwork 2 齒輪微調壓力，避免過度壓陷。' },
    },
    qidi: {
      pla: { nozzle: '215 - 225°C', bed: '55 - 60°C', speed: '300 - 450 mm/s', fan: '100%', volFlow: '24 mm³/s', retraction: '0.8 mm', note: '標配高流速熱端，支援超高速穩定輸出。' },
      petg: { nozzle: '245 - 255°C', bed: '75 - 80°C', speed: '180 - 260 mm/s', fan: '40%', volFlow: '18 mm³/s', retraction: '1.0 mm', note: '高抗衝擊防潮耐溫，表面無拉絲。' },
      abs: { nozzle: '265 - 275°C', bed: '100 - 105°C', speed: '180 - 250 mm/s', fan: '10%', volFlow: '18 mm³/s', retraction: '0.8 mm', note: '開啟 X-Max 3 主動 65°C 腔體加熱！工業大尺寸無內應力、零翹邊！' },
      cf: { nozzle: '260 - 270°C', bed: '70 - 75°C', speed: '200 - 300 mm/s', fan: '50%', volFlow: '20 mm³/s', retraction: '0.8 mm', note: '標配硬化鋼耐磨噴嘴，耐溫可達 350°C。' },
      tpu: { nozzle: '225 - 235°C', bed: '45°C', speed: '35 - 50 mm/s', fan: '100%', volFlow: '6 mm³/s', retraction: '0.5 mm', note: '關閉腔溫加熱，頂部透氣窗微開，軟膠成型回彈極佳。' },
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl border-0 sm:border border-slate-200 flex flex-col relative cursor-default select-text"
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

          <button
            onClick={() => setActiveTab('drying')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'drying'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-4 h-4 text-amber-500" />
            <span>耗材防潮與烘烤指南</span>
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
                    <label className="font-bold text-slate-800 block mb-1.5">選擇印表機種體系 (收錄市售全機型)：</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'bambu', name: '拓竹 Bambu Lab' },
                        { id: 'creality', name: '創想 Creality' },
                        { id: 'flashforge', name: '閃鑄 Flashforge' },
                        { id: 'snapmaker', name: '快造 Snapmaker' },
                        { id: 'anycubic', name: '縱維 Anycubic' },
                        { id: 'elegoo', name: '愛樂酷 Elegoo' },
                        { id: 'prusa', name: 'Prusa Research' },
                        { id: 'voron', name: 'Voron / Klipper' },
                        { id: 'qidi', name: '啟龐 QIDI Tech' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSlicerPrinter(p.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'pla', name: '高速 Hyper PLA' },
                        { id: 'petg', name: '耐候韌性 PETG-HF' },
                        { id: 'abs', name: '玻纖耐熱 ABS-GF' },
                        { id: 'cf', name: '航太碳纖 PLA-CF' },
                        { id: 'tpu', name: '高回彈減震 TPU 95A' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSlicerMaterial(m.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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
          {/* TAB 5: DRYING & STORAGE MASTER GUIDE */}
          {activeTab === 'drying' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Wind className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">3D 列印專業烘烤與防潮保存金科玉律</h3>
                  <p className="text-xs text-amber-950/90 leading-relaxed mt-1">
                    90% 的列印瑕疵（如劇烈拉絲、氣泡爆裂聲、層間脆化）皆源於線材受潮！請依材質設定對應烘乾溫度與時間，避免溫度過高導致線材熔結軟化。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DRYING_GUIDELINES.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="font-black text-slate-900 text-sm tracking-tight">{item.material}</div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="p-2 rounded-xl bg-orange-50/80 border border-orange-100">
                          <div className="text-[10px] text-orange-700 flex items-center justify-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            <span>推薦溫度</span>
                          </div>
                          <div className="text-xs font-black font-mono text-orange-950 mt-0.5">{item.temp}</div>
                        </div>

                        <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100">
                          <div className="text-[10px] text-blue-700 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>烘烤時間</span>
                          </div>
                          <div className="text-xs font-black font-mono text-blue-950 mt-0.5">{item.time}</div>
                        </div>

                        <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-100">
                          <div className="text-[10px] text-emerald-700 flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3" />
                            <span>儲存濕度</span>
                          </div>
                          <div className="text-xs font-black font-mono text-emerald-950 mt-0.5">{item.storageRh}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="font-bold text-slate-800 text-[11px] mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>受潮典型症狀：</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.symptoms.map((sym, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10.5px]">
                                {sym}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80 text-[11px] text-amber-900 leading-relaxed">
                          💡 <strong>溫馨提醒：</strong>{item.tips}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pro Storage Advice Banner */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">神狗勾 3D 原裝真空密封承諾</h4>
                    <p className="text-[11px] text-slate-300">
                      全系列線材出廠前均經 12 小時深層除濕，內附高吸水量指示型矽膠乾燥劑，拆封即用、品質如新！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
