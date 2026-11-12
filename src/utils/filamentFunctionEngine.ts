import { FilamentProduct, LanguageCode } from '../types';
import { PrinterProfile } from '../data/printerProfiles';

export type FilamentFormulaKey =
  | 'hyper_pla'
  | 'bambu_pla'
  | 'pla_plus'
  | 'pla_matte'
  | 'pla_silk'
  | 'pla_cf'
  | 'petg_hf'
  | 'petg_matte'
  | 'petg_cf'
  | 'asa'
  | 'abs_gf'
  | 'pc_abs'
  | 'poly_pc'
  | 'pa6_cf'
  | 'pa12_cf'
  | 'copa_nylon'
  | 'tpu_95a'
  | 'tpu_85a'
  | 'tpu_64d'
  | 'resin_8k'
  | 'resin_tough';

export interface FilamentFunctionInput {
  heatResistance: number;      // 45 ~ 115 °C
  toughness: number;           // 1 ~ 5
  easeOfPrint: number;         // 1 ~ 5
  outdoorResistance: number;   // 1 ~ 5
  surfaceFinish: 'standard' | 'matte' | 'cf' | 'flexible';
  nozzleSize: '0.2mm' | '0.4mm' | '0.6mm' | '0.8mm';
  customNote?: string;
  printer: PrinterProfile;
  products: FilamentProduct[];
  lang: LanguageCode;
}

export interface ComputedFilamentMatch {
  materialKey: FilamentFormulaKey;
  materialInfo: {
    name: string;
    fullName: string;
    nozzleTemp: string;
    bedTemp: string;
    speed: string;
    fan: string;
    volumetricFlow: string;
    layerHeight: string;
    retraction: string;
    bedType: string;
    enclosureNeeded: string;
    productMaterial: string;
    preferredProductId: string;
    badge: string;
  };
  score: number;
  reason: string;
  alerts: string[];
  product: FilamentProduct;
  telemetry: {
    volumetricFlowMm3S: number;
    layerHeightMm: number;
    lineWidthMm: number;
    firstLayerSpeedMmS: number;
    chamberTargetC: number;
  };
}

interface PolymerPhysicalSpec {
  key: FilamentFormulaKey;
  preferredProductId: string;
  fallbackMaterialTag: string;
  nameZh: string;
  nameEn: string;
  nameJa: string;
  fullNameZh: string;
  fullNameEn: string;
  fullNameJa: string;
  badgeZh: string;
  badgeEn: string;
  badgeJa: string;
  // Physical & rheological constants
  hdtC: number;               // Heat deflection temperature (°C)
  optimalHeatCenterC: number; // Ideal slider center (°C)
  optimalHeatWidthC: number;  // Thermal Gaussian width (°C)
  baseNozzleC: number;        // Baseline melt temperature at 0.4mm, 120mm/s (°C)
  maxSafeNozzleC: number;     // Polymer thermal degradation ceiling (°C)
  baseBedC: number;           // Baseline bed temperature (°C)
  maxSafeBedC: number;        // Upper bed temperature (°C)
  maxVolumetricFlowMm3S: number; // Hotend melt flow rate ceiling on high-flow direct drive (mm³/s)
  maxLinearSpeedMmS: number;  // Polymer kinematics ceiling (mm/s)
  baseFanPct: number;         // Baseline cooling fan (%)
  minFanPct: number;
  maxFanPct: number;
  toughnessIdeal: number;     // 1 ~ 5
  easeIdeal: number;          // 1 ~ 5
  outdoorIdeal: number;       // 1 ~ 5
  isFiberAbrasive: boolean;
  isElastomer: boolean;
  requiresEnclosure: boolean;
}

const POLYMER_SPECS: Record<FilamentFormulaKey, PolymerPhysicalSpec> = {
  hyper_pla: {
    key: 'hyper_pla',
    preferredProductId: 'fil-01',
    fallbackMaterialTag: 'High-Speed PLA',
    nameZh: 'High-Speed Hyper PLA+',
    nameEn: 'High-Speed Hyper PLA+',
    nameJa: 'High-Speed Hyper PLA+',
    fullNameZh: 'High-Speed Hyper PLA+ 高速流暢列印線材 (支援 500mm/s)',
    fullNameEn: 'High-Speed Hyper PLA+ 500mm/s Filament',
    fullNameJa: 'High-Speed Hyper PLA+ 500mm/s 高速フィラメント',
    badgeZh: '極速流暢・零翹邊',
    badgeEn: '500mm/s · Zero Warp',
    badgeJa: '500mm/s対応・反りゼロ',
    hdtC: 56,
    optimalHeatCenterC: 50,
    optimalHeatWidthC: 12,
    baseNozzleC: 202,
    maxSafeNozzleC: 232,
    baseBedC: 50,
    maxSafeBedC: 60,
    maxVolumetricFlowMm3S: 24.0,
    maxLinearSpeedMmS: 500,
    baseFanPct: 96,
    minFanPct: 85,
    maxFanPct: 100,
    toughnessIdeal: 2.0,
    easeIdeal: 5.0,
    outdoorIdeal: 1.5,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  bambu_pla: {
    key: 'bambu_pla',
    preferredProductId: 'maker-bambu-pla',
    fallbackMaterialTag: 'High-Speed PLA',
    nameZh: 'Bambu 原廠 PLA Basic (RFID)',
    nameEn: 'Bambu Lab PLA Basic (RFID)',
    nameJa: 'Bambu純正 PLA Basic (RFID)',
    fullNameZh: 'Bambu Lab 拓竹 原廠 PLA Basic 高速耗材 (RFID 智慧供料)',
    fullNameEn: 'Bambu Lab Official PLA Basic High-Speed (RFID)',
    fullNameJa: 'Bambu Lab 拓竹 純正 PLA Basic 高速フィラメント (RFID対応)',
    badgeZh: '拓竹原廠晶片・AMS直上',
    badgeEn: 'Official RFID · AMS Ready',
    badgeJa: '純正RFID・AMS自動認識',
    hdtC: 56,
    optimalHeatCenterC: 50,
    optimalHeatWidthC: 11,
    baseNozzleC: 204,
    maxSafeNozzleC: 230,
    baseBedC: 48,
    maxSafeBedC: 58,
    maxVolumetricFlowMm3S: 22.0,
    maxLinearSpeedMmS: 350,
    baseFanPct: 98,
    minFanPct: 90,
    maxFanPct: 100,
    toughnessIdeal: 1.8,
    easeIdeal: 5.0,
    outdoorIdeal: 1.5,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  pla_plus: {
    key: 'pla_plus',
    preferredProductId: 'fil-01b',
    fallbackMaterialTag: 'PLA',
    nameZh: '高韌性 PLA+ 抗脆裂線材',
    nameEn: 'Tough PLA+ Anti-Brittle',
    nameJa: '高靭性 PLA+ 耐衝撃フィラメント',
    fullNameZh: '標準通用高韌性 PLA+ 3D 列印耗材 (抗脆裂配方)',
    fullNameEn: 'eSUN Tough PLA+ Impact-Resistant Filament',
    fullNameJa: 'eSUN 高靭性 PLA+ 耐衝撃・割れ防止フィラメント',
    badgeZh: '高韌性卡扣・新手友善',
    badgeEn: 'Tough Snap-Fit · Easy Print',
    badgeJa: '高靭性スナップ・造形容易',
    hdtC: 58,
    optimalHeatCenterC: 55,
    optimalHeatWidthC: 12,
    baseNozzleC: 204,
    maxSafeNozzleC: 225,
    baseBedC: 50,
    maxSafeBedC: 60,
    maxVolumetricFlowMm3S: 19.5,
    maxLinearSpeedMmS: 300,
    baseFanPct: 92,
    minFanPct: 80,
    maxFanPct: 100,
    toughnessIdeal: 3.0,
    easeIdeal: 4.8,
    outdoorIdeal: 2.0,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  pla_matte: {
    key: 'pla_matte',
    preferredProductId: 'fil-07',
    fallbackMaterialTag: 'PLA Matte',
    nameZh: 'PolyTerra PLA Matte 莫蘭迪消光',
    nameEn: 'PolyTerra PLA Matte Aesthetic',
    nameJa: 'PolyTerra PLA Matte マット美学',
    fullNameZh: 'PolyTerra PLA Matte 莫蘭迪消光霧面美學耗材',
    fullNameEn: 'Polymaker PolyTerra PLA Matte Low-Sheen Filament',
    fullNameJa: 'Polymaker PolyTerra PLA Matte モランディマットフィラメント',
    badgeZh: '消光隱藏層紋・好拆支撐',
    badgeEn: 'Stealth Matte · Easy Support',
    badgeJa: 'マット質感・サポート除去容易',
    hdtC: 56,
    optimalHeatCenterC: 52,
    optimalHeatWidthC: 13,
    baseNozzleC: 202,
    maxSafeNozzleC: 225,
    baseBedC: 50,
    maxSafeBedC: 60,
    maxVolumetricFlowMm3S: 18.5,
    maxLinearSpeedMmS: 300,
    baseFanPct: 95,
    minFanPct: 85,
    maxFanPct: 100,
    toughnessIdeal: 2.0,
    easeIdeal: 4.8,
    outdoorIdeal: 1.8,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  pla_silk: {
    key: 'pla_silk',
    preferredProductId: 'fil-08',
    fallbackMaterialTag: 'PLA Silk',
    nameZh: 'PLA Silk 雙色絲綢金屬炫光',
    nameEn: 'PLA Silk Dual-Color Metallic',
    nameJa: 'PLA Silk 2色シルクメタリック',
    fullNameZh: 'PLA Silk 雙色共擠絲綢金屬炫光線材',
    fullNameEn: 'Polymaker PLA Silk Dual-Color Co-Extrusion Filament',
    fullNameJa: 'Polymaker PLA Silk 2色共押出シルク光沢フィラメント',
    badgeZh: '絲綢鏡面光澤・文創首選',
    badgeEn: 'Silk Metallic Shine · Art',
    badgeJa: 'シルク金属光沢・アート向け',
    hdtC: 54,
    optimalHeatCenterC: 50,
    optimalHeatWidthC: 10,
    baseNozzleC: 212,
    maxSafeNozzleC: 230,
    baseBedC: 52,
    maxSafeBedC: 60,
    maxVolumetricFlowMm3S: 14.5,
    maxLinearSpeedMmS: 220,
    baseFanPct: 95,
    minFanPct: 85,
    maxFanPct: 100,
    toughnessIdeal: 1.2,
    easeIdeal: 4.6,
    outdoorIdeal: 1.2,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  pla_cf: {
    key: 'pla_cf',
    preferredProductId: 'fil-02',
    fallbackMaterialTag: 'PLA-CF',
    nameZh: 'PLA-CF 航太碳纖維高剛性耗材',
    nameEn: 'PLA-CF Carbon Fiber Stiff',
    nameJa: 'PLA-CF 炭素繊維強化高剛性',
    fullNameZh: 'PLA-CF 碳纖維強化高剛性消光耗材 (低收縮零層紋)',
    fullNameEn: 'Bambu Lab PLA-CF Carbon Fiber Reinforced Stealth Matte',
    fullNameJa: 'Bambu Lab PLA-CF 炭素繊維強化マットフィラメント',
    badgeZh: '碳纖消光零層紋・免封箱',
    badgeEn: 'Carbon Stiffness · Zero Warp',
    badgeJa: '炭素繊維高剛性・反り防止',
    hdtC: 64,
    optimalHeatCenterC: 60,
    optimalHeatWidthC: 14,
    baseNozzleC: 220,
    maxSafeNozzleC: 245,
    baseBedC: 54,
    maxSafeBedC: 65,
    maxVolumetricFlowMm3S: 18.0,
    maxLinearSpeedMmS: 300,
    baseFanPct: 75,
    minFanPct: 55,
    maxFanPct: 90,
    toughnessIdeal: 4.0,
    easeIdeal: 3.8,
    outdoorIdeal: 2.5,
    isFiberAbrasive: true,
    isElastomer: false,
    requiresEnclosure: false,
  },
  petg_hf: {
    key: 'petg_hf',
    preferredProductId: 'fil-03',
    fallbackMaterialTag: 'PETG',
    nameZh: 'PETG-HF 高速耐候抗衝擊線材',
    nameEn: 'PETG-HF High-Flow Weatherproof',
    nameJa: 'PETG-HF 高速・高耐候耐衝撃',
    fullNameZh: 'PETG-HF 高速耐候抗衝擊工程線材 (防拉絲配方)',
    fullNameEn: 'Bambu Lab PETG-HF High-Flow Tough Weatherproof Filament',
    fullNameJa: 'Bambu Lab PETG-HF 高速・高耐候エンジニアリングフィラメント',
    badgeZh: '防水耐候・抗衝擊不脆化',
    badgeEn: 'Waterproof · High Impact',
    badgeJa: '防水耐候・耐衝撃タフネス',
    hdtC: 76,
    optimalHeatCenterC: 72,
    optimalHeatWidthC: 13,
    baseNozzleC: 234,
    maxSafeNozzleC: 256,
    baseBedC: 70,
    maxSafeBedC: 84,
    maxVolumetricFlowMm3S: 18.5,
    maxLinearSpeedMmS: 300,
    baseFanPct: 40,
    minFanPct: 25,
    maxFanPct: 55,
    toughnessIdeal: 3.4,
    easeIdeal: 4.0,
    outdoorIdeal: 4.0,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  petg_matte: {
    key: 'petg_matte',
    preferredProductId: 'maker-bambu-petg-matte',
    fallbackMaterialTag: 'PETG Matte',
    nameZh: 'Bambu 原廠 PETG Matte 消光耐候',
    nameEn: 'Bambu Lab PETG Matte (RFID)',
    nameJa: 'Bambu純正 PETG Matte 消光耐候',
    fullNameZh: 'Bambu Lab 拓竹 原廠 PETG Matte 消光耐候耗材 (RFID 智慧供料)',
    fullNameEn: 'Bambu Lab Official PETG Matte Weatherproof (RFID)',
    fullNameJa: 'Bambu Lab 拓竹 純正 PETG Matte マット耐候フィラメント (RFID)',
    badgeZh: '消光無油亮感・戶外抗UV',
    badgeEn: 'Matte Finish · Outdoor UV',
    badgeJa: 'マット耐候・純正RFID搭載',
    hdtC: 76,
    optimalHeatCenterC: 74,
    optimalHeatWidthC: 13,
    baseNozzleC: 236,
    maxSafeNozzleC: 258,
    baseBedC: 72,
    maxSafeBedC: 82,
    maxVolumetricFlowMm3S: 17.5,
    maxLinearSpeedMmS: 280,
    baseFanPct: 42,
    minFanPct: 25,
    maxFanPct: 55,
    toughnessIdeal: 3.4,
    easeIdeal: 4.0,
    outdoorIdeal: 4.3,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  petg_cf: {
    key: 'petg_cf',
    preferredProductId: 'fil-13',
    fallbackMaterialTag: 'PETG-CF',
    nameZh: 'PETG-CF 碳纖維強化耐候工程線',
    nameEn: 'PETG-CF Carbon Weatherproof',
    nameJa: 'PETG-CF 炭素繊維強化高耐候',
    fullNameZh: 'PETG-CF 碳纖維強化耐候高剛性工程線材',
    fullNameEn: 'Bambu Lab PETG-CF Carbon Fiber Reinforced Structural Filament',
    fullNameJa: 'Bambu Lab PETG-CF 炭素繊維強化・耐候構造用フィラメント',
    badgeZh: '耐溫80°C+・抗濕氣高剛性',
    badgeEn: '80°C+ HDT · Zero Stringing',
    badgeJa: '耐熱80°C+・糸引きゼロ高剛性',
    hdtC: 84,
    optimalHeatCenterC: 78,
    optimalHeatWidthC: 14,
    baseNozzleC: 246,
    maxSafeNozzleC: 266,
    baseBedC: 72,
    maxSafeBedC: 85,
    maxVolumetricFlowMm3S: 16.5,
    maxLinearSpeedMmS: 250,
    baseFanPct: 35,
    minFanPct: 20,
    maxFanPct: 50,
    toughnessIdeal: 4.2,
    easeIdeal: 3.3,
    outdoorIdeal: 4.4,
    isFiberAbrasive: true,
    isElastomer: false,
    requiresEnclosure: false,
  },
  asa: {
    key: 'asa',
    preferredProductId: 'fil-15',
    fallbackMaterialTag: 'ASA',
    nameZh: 'PolyLite ASA 頂級抗UV戶外工程料',
    nameEn: 'PolyLite ASA Extreme UV Outdoor',
    nameJa: 'PolyLite ASA 超耐候・抗UVエンプラ',
    fullNameZh: 'PolyLite ASA 超強抗紫外線戶外耐候工程耗材',
    fullNameEn: 'Polymaker PolyLite ASA All-Weather UV Engineering Filament',
    fullNameJa: 'Polymaker PolyLite ASA 屋外紫外線・耐候エンジニアリング材',
    badgeZh: '10倍抗UV・戶外日曬不脆裂',
    badgeEn: '10x UV Resistance · 98°C HDT',
    badgeJa: '10倍UV耐性・屋外長期曝露対応',
    hdtC: 98,
    optimalHeatCenterC: 92,
    optimalHeatWidthC: 14,
    baseNozzleC: 248,
    maxSafeNozzleC: 266,
    baseBedC: 92,
    maxSafeBedC: 105,
    maxVolumetricFlowMm3S: 15.5,
    maxLinearSpeedMmS: 220,
    baseFanPct: 18,
    minFanPct: 5,
    maxFanPct: 30,
    toughnessIdeal: 3.8,
    easeIdeal: 2.3,
    outdoorIdeal: 5.0,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: true,
  },
  abs_gf: {
    key: 'abs_gf',
    preferredProductId: 'fil-05',
    fallbackMaterialTag: 'ABS-GF',
    nameZh: 'ABS-GF 玻璃纖維強化耐高溫耗材',
    nameEn: 'ABS-GF Glass Fiber High-Temp',
    nameJa: 'ABS-GF ガラス繊維強化高耐熱',
    fullNameZh: 'ABS-GF 玻璃纖維強化耐高溫工程耗材 (抗翹曲配方)',
    fullNameEn: 'Bambu Lab ABS-GF Glass Fiber Reinforced Low-Warp Filament',
    fullNameJa: 'Bambu Lab ABS-GF ガラス繊維強化・低反り耐熱フィラメント',
    badgeZh: '耐溫100°C+・玻纖抑制翹邊',
    badgeEn: '100°C+ HDT · Anti-Warp GF',
    badgeJa: '耐熱100°C+・反り抑制ガラス繊維',
    hdtC: 102,
    optimalHeatCenterC: 96,
    optimalHeatWidthC: 14,
    baseNozzleC: 254,
    maxSafeNozzleC: 275,
    baseBedC: 94,
    maxSafeBedC: 106,
    maxVolumetricFlowMm3S: 15.0,
    maxLinearSpeedMmS: 210,
    baseFanPct: 15,
    minFanPct: 5,
    maxFanPct: 25,
    toughnessIdeal: 3.9,
    easeIdeal: 2.2,
    outdoorIdeal: 3.2,
    isFiberAbrasive: true,
    isElastomer: false,
    requiresEnclosure: true,
  },
  pc_abs: {
    key: 'pc_abs',
    preferredProductId: 'fil-16',
    fallbackMaterialTag: 'PC-ABS',
    nameZh: 'PC-ABS 工業合金超強抗衝擊耐溫',
    nameEn: 'PC-ABS Industrial Impact Alloy',
    nameJa: 'PC-ABS 工業用高耐衝撃アロイ',
    fullNameZh: 'PC-ABS 工業合金超強抗衝擊耐溫工程耗材',
    fullNameEn: 'Polymaker PC-ABS High-Impact Industrial Engineering Alloy',
    fullNameJa: 'Polymaker PC-ABS 工業グレード高耐衝撃・耐熱アロイ',
    badgeZh: '耐溫105°C・重擊不碎裂',
    badgeEn: '105°C HDT · Heavy Impact',
    badgeJa: '耐熱105°C・重衝撃耐久',
    hdtC: 106,
    optimalHeatCenterC: 105,
    optimalHeatWidthC: 12,
    baseNozzleC: 262,
    maxSafeNozzleC: 280,
    baseBedC: 96,
    maxSafeBedC: 110,
    maxVolumetricFlowMm3S: 13.5,
    maxLinearSpeedMmS: 180,
    baseFanPct: 12,
    minFanPct: 0,
    maxFanPct: 20,
    toughnessIdeal: 4.6,
    easeIdeal: 1.8,
    outdoorIdeal: 3.8,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: true,
  },
  poly_pc: {
    key: 'poly_pc',
    preferredProductId: 'fil-23',
    fallbackMaterialTag: 'PC (Polycarbonate)',
    nameZh: 'PolyMax PC 航太防彈級聚碳酸酯',
    nameEn: 'PolyMax PC 115°C High-Heat',
    nameJa: 'PolyMax PC 115°C耐熱ポリカ',
    fullNameZh: 'PolyMax PC 航太級聚碳酸酯耐高溫抗衝擊耗材 (耐溫 115°C)',
    fullNameEn: 'Polymaker PolyMax PC Toughened Polycarbonate (115°C HDT)',
    fullNameJa: 'Polymaker PolyMax PC 高靭性ポリカーボネート (耐熱115°C)',
    badgeZh: '耐溫115°C・防彈級抗衝擊',
    badgeEn: '115°C HDT · Ballistic Tough',
    badgeJa: '耐熱115°C・最高峰の耐衝撃性',
    hdtC: 115,
    optimalHeatCenterC: 112,
    optimalHeatWidthC: 12,
    baseNozzleC: 258,
    maxSafeNozzleC: 278,
    baseBedC: 96,
    maxSafeBedC: 110,
    maxVolumetricFlowMm3S: 13.5,
    maxLinearSpeedMmS: 180,
    baseFanPct: 10,
    minFanPct: 0,
    maxFanPct: 20,
    toughnessIdeal: 4.8,
    easeIdeal: 1.5,
    outdoorIdeal: 4.0,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: true,
  },
  pa6_cf: {
    key: 'pa6_cf',
    preferredProductId: 'fil-19',
    fallbackMaterialTag: 'PA-CF',
    nameZh: 'PolyMide PA6-CF 碳纖尼龍 (150°C+)',
    nameEn: 'PolyMide PA6-CF Carbon Nylon',
    nameJa: 'PolyMide PA6-CF 炭素繊維ナイロン',
    fullNameZh: 'PolyMide PA6-CF 碳纖維強化尼龍工程耗材 (耐溫 150°C+)',
    fullNameEn: 'Polymaker PolyMide PA6-CF Carbon Fiber Reinforced Nylon',
    fullNameJa: 'Polymaker PolyMide PA6-CF 炭素繊維強化ナイロン (耐熱150°C+)',
    badgeZh: '準金屬剛性・耐溫150°C+',
    badgeEn: 'Metal Replacement · 150°C+',
    badgeJa: '金属代替剛性・耐熱150°C+',
    hdtC: 180,
    optimalHeatCenterC: 108,
    optimalHeatWidthC: 16,
    baseNozzleC: 280,
    maxSafeNozzleC: 300,
    baseBedC: 55,
    maxSafeBedC: 75,
    maxVolumetricFlowMm3S: 14.0,
    maxLinearSpeedMmS: 200,
    baseFanPct: 10,
    minFanPct: 0,
    maxFanPct: 20,
    toughnessIdeal: 4.6,
    easeIdeal: 2.0,
    outdoorIdeal: 3.6,
    isFiberAbrasive: true,
    isElastomer: false,
    requiresEnclosure: true,
  },
  pa12_cf: {
    key: 'pa12_cf',
    preferredProductId: 'fil-20',
    fallbackMaterialTag: 'PA12-CF',
    nameZh: 'PolyMide PA12-CF 超低吸水碳纖尼龍',
    nameEn: 'PolyMide PA12-CF Low-Moisture',
    nameJa: 'PolyMide PA12-CF 超低吸水カーボン',
    fullNameZh: 'PolyMide PA12-CF 超低吸水航太級碳纖尼龍線材',
    fullNameEn: 'Polymaker PolyMide PA12-CF Ultra-Low Moisture Carbon Nylon',
    fullNameJa: 'Polymaker PolyMide PA12-CF 超低吸水・航空級炭素繊維ナイロン',
    badgeZh: '超低吸水率・無人機機臂首選',
    badgeEn: 'Ultra-Low Moisture · Aerospace',
    badgeJa: '超低吸水・ドローン構造材',
    hdtC: 160,
    optimalHeatCenterC: 102,
    optimalHeatWidthC: 16,
    baseNozzleC: 272,
    maxSafeNozzleC: 292,
    baseBedC: 55,
    maxSafeBedC: 75,
    maxVolumetricFlowMm3S: 13.5,
    maxLinearSpeedMmS: 180,
    baseFanPct: 10,
    minFanPct: 0,
    maxFanPct: 20,
    toughnessIdeal: 4.6,
    easeIdeal: 2.3,
    outdoorIdeal: 4.8,
    isFiberAbrasive: true,
    isElastomer: false,
    requiresEnclosure: true,
  },
  copa_nylon: {
    key: 'copa_nylon',
    preferredProductId: 'fil-22',
    fallbackMaterialTag: 'Nylon (PA)',
    nameZh: 'PolyMide CoPA 純尼龍自潤滑耐磨線',
    nameEn: 'PolyMide CoPA Pure Nylon Gear',
    nameJa: 'PolyMide CoPA 純ナイロン耐摩耗ギア',
    fullNameZh: 'PolyMide CoPA 純尼龍 PA6/66 高韌性自潤滑耐磨耗材',
    fullNameEn: 'Polymaker PolyMide CoPA Self-Lubricating High-Toughness Nylon',
    fullNameJa: 'Polymaker PolyMide CoPA 自己潤滑・高靭性純ナイロン',
    badgeZh: '自潤滑耐磨・精密齒輪首選',
    badgeEn: 'Self-Lubricating · Gear Grade',
    badgeJa: '自己潤滑・精密ギア最適',
    hdtC: 120,
    optimalHeatCenterC: 90,
    optimalHeatWidthC: 16,
    baseNozzleC: 254,
    maxSafeNozzleC: 270,
    baseBedC: 55,
    maxSafeBedC: 70,
    maxVolumetricFlowMm3S: 11.5,
    maxLinearSpeedMmS: 150,
    baseFanPct: 10,
    minFanPct: 0,
    maxFanPct: 20,
    toughnessIdeal: 4.8,
    easeIdeal: 2.2,
    outdoorIdeal: 3.2,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: false,
  },
  tpu_95a: {
    key: 'tpu_95a',
    preferredProductId: 'fil-04',
    fallbackMaterialTag: 'TPU',
    nameZh: 'PolyFlex TPU 95A 高回彈減震軟料',
    nameEn: 'PolyFlex TPU 95A High-Rebound',
    nameJa: 'PolyFlex TPU 95A 高反発エラストマー',
    fullNameZh: 'PolyFlex TPU 95A 高速高回彈耐磨柔性軟料',
    fullNameEn: 'Polymaker PolyFlex TPU 95A High-Speed Flexible Elastomer',
    fullNameJa: 'Polymaker PolyFlex TPU 95A 高反発・耐摩耗フレキシブル材',
    badgeZh: '95A高回彈・防摔保護殼減震',
    badgeEn: '95A Flexible · Tear-Resistant',
    badgeJa: '95A高反発・耐摩耗衝撃吸収',
    hdtC: 62,
    optimalHeatCenterC: 56,
    optimalHeatWidthC: 12,
    baseNozzleC: 214,
    maxSafeNozzleC: 232,
    baseBedC: 38,
    maxSafeBedC: 50,
    maxVolumetricFlowMm3S: 6.2,
    maxLinearSpeedMmS: 105,
    baseFanPct: 82,
    minFanPct: 65,
    maxFanPct: 100,
    toughnessIdeal: 5.0,
    easeIdeal: 3.2,
    outdoorIdeal: 3.0,
    isFiberAbrasive: false,
    isElastomer: true,
    requiresEnclosure: false,
  },
  tpu_85a: {
    key: 'tpu_85a',
    preferredProductId: 'fil-17',
    fallbackMaterialTag: 'TPU 85A',
    nameZh: 'TPU 85A 超柔軟矽膠級緩衝軟料',
    nameEn: 'TPU 85A Ultra-Soft Elastomer',
    nameJa: 'TPU 85A 超軟質ショック吸収ゴム',
    fullNameZh: 'TPU 85A 超柔高彈性減震緩衝橡膠軟料',
    fullNameEn: 'Polymaker TPU 85A Ultra-Soft Shock-Absorbing Elastomer',
    fullNameJa: 'Polymaker TPU 85A 超軟質・高弾性ラバーフィラメント',
    badgeZh: '85A極致柔軟・氣密墊圈護具',
    badgeEn: '85A Ultra-Soft · Silicone Feel',
    badgeJa: '85A超軟質・高気密ガスケット',
    hdtC: 58,
    optimalHeatCenterC: 54,
    optimalHeatWidthC: 11,
    baseNozzleC: 218,
    maxSafeNozzleC: 235,
    baseBedC: 36,
    maxSafeBedC: 48,
    maxVolumetricFlowMm3S: 3.2,
    maxLinearSpeedMmS: 50,
    baseFanPct: 88,
    minFanPct: 75,
    maxFanPct: 100,
    toughnessIdeal: 5.0,
    easeIdeal: 1.8,
    outdoorIdeal: 2.8,
    isFiberAbrasive: false,
    isElastomer: true,
    requiresEnclosure: false,
  },
  tpu_64d: {
    key: 'tpu_64d',
    preferredProductId: 'fil-18',
    fallbackMaterialTag: 'TPU 64D',
    nameZh: 'TPU 64D 半剛性高耐磨聚氨酯線材',
    nameEn: 'TPU 64D Semi-Rigid Industrial',
    nameJa: 'TPU 64D 半剛性・高耐摩耗ウレタン',
    fullNameZh: 'TPU 64D 半剛性高硬度耐磨聚氨酯傳動線材',
    fullNameEn: 'Polymaker TPU 64D Semi-Rigid High-Wear Polyurethane',
    fullNameJa: 'Polymaker TPU 64D 半剛性・重荷重ローラー用ウレタン',
    badgeZh: '64D半剛性・高耐磨滾輪襯套',
    badgeEn: '64D Semi-Rigid · Heavy Wear',
    badgeJa: '64D半剛性・耐摩耗ローラー',
    hdtC: 75,
    optimalHeatCenterC: 70,
    optimalHeatWidthC: 13,
    baseNozzleC: 232,
    maxSafeNozzleC: 250,
    baseBedC: 52,
    maxSafeBedC: 65,
    maxVolumetricFlowMm3S: 8.5,
    maxLinearSpeedMmS: 120,
    baseFanPct: 72,
    minFanPct: 55,
    maxFanPct: 90,
    toughnessIdeal: 4.5,
    easeIdeal: 3.4,
    outdoorIdeal: 3.6,
    isFiberAbrasive: false,
    isElastomer: true,
    requiresEnclosure: false,
  },
  resin_8k: {
    key: 'resin_8k',
    preferredProductId: 'fil-06',
    fallbackMaterialTag: 'Resin',
    nameZh: 'Anycubic 8K 高精度水洗光敏樹脂',
    nameEn: 'Anycubic 8K Precision Resin',
    nameJa: 'Anycubic 8K 高精細水洗いレジン',
    fullNameZh: 'Anycubic 8K 高精度低氣味光固化水洗光敏樹脂 (1000g)',
    fullNameEn: 'Anycubic 8K High-Precision Water-Washable UV Resin (1000g)',
    fullNameJa: 'Anycubic 8K 高精細・低臭気水洗い光造形レジン (1000g)',
    badgeZh: '8K微米細節・光固化專用',
    badgeEn: '8K Micro Detail · SLA/LCD',
    badgeJa: '8K極細ディテール・光造形用',
    hdtC: 55,
    optimalHeatCenterC: 50,
    optimalHeatWidthC: 20,
    baseNozzleC: 25,
    maxSafeNozzleC: 30,
    baseBedC: 25,
    maxSafeBedC: 30,
    maxVolumetricFlowMm3S: 10,
    maxLinearSpeedMmS: 60,
    baseFanPct: 0,
    minFanPct: 0,
    maxFanPct: 0,
    toughnessIdeal: 1.5,
    easeIdeal: 4.5,
    outdoorIdeal: 1.5,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: true,
  },
  resin_tough: {
    key: 'resin_tough',
    preferredProductId: 'fil-27',
    fallbackMaterialTag: 'Resin',
    nameZh: 'Anycubic Tough 類ABS抗摔工程樹脂',
    nameEn: 'Anycubic Tough ABS-Like Resin',
    nameJa: 'Anycubic Tough ABSライク高靭性レジン',
    fullNameZh: 'Anycubic Tough 類 ABS 高韌性抗摔工程光敏樹脂 (1000g)',
    fullNameEn: 'Anycubic Tough ABS-Like Impact-Resistant Engineering Resin (1000g)',
    fullNameJa: 'Anycubic Tough ABSライク耐衝撃・穴あけ対応レジン (1000g)',
    badgeZh: '耐摔可攻牙・機構光固化',
    badgeEn: 'Drillable · ABS-Like Tough',
    badgeJa: '耐衝撃・タップ加工対応レジン',
    hdtC: 68,
    optimalHeatCenterC: 65,
    optimalHeatWidthC: 25,
    baseNozzleC: 25,
    maxSafeNozzleC: 30,
    baseBedC: 25,
    maxSafeBedC: 30,
    maxVolumetricFlowMm3S: 10,
    maxLinearSpeedMmS: 60,
    baseFanPct: 0,
    minFanPct: 0,
    maxFanPct: 0,
    toughnessIdeal: 4.0,
    easeIdeal: 4.0,
    outdoorIdeal: 2.5,
    isFiberAbrasive: false,
    isElastomer: false,
    requiresEnclosure: true,
  },
};

function findBestCatalogProduct(
  products: FilamentProduct[],
  spec: PolymerPhysicalSpec
): FilamentProduct {
  const byExactId = products.find((p) => p.id === spec.preferredProductId);
  if (byExactId) return byExactId;

  const byExactMat = products.find(
    (p) => p.material.toLowerCase() === spec.fallbackMaterialTag.toLowerCase()
  );
  if (byExactMat) return byExactMat;

  const byPartialMat = products.find((p) =>
    p.material.toLowerCase().includes(spec.fallbackMaterialTag.toLowerCase())
  );
  if (byPartialMat) return byPartialMat;

  return products.find((p) => p.material !== 'Accessories') || products[0];
}

/**
 * Continuous Multi-Variable Response-Surface & Thermodynamic Slicer Calculation Engine
 * Evaluates all 19 FDM polymers + 2 SLA resins against user sliders, nozzle geometry, and printer hardware envelope.
 */
export function computeFilamentMatchByFunction(
  input: FilamentFunctionInput
): ComputedFilamentMatch {
  const {
    heatResistance,
    toughness,
    easeOfPrint,
    outdoorResistance,
    surfaceFinish,
    nozzleSize,
    customNote = '',
    printer,
    products,
    lang,
  } = input;

  const H = Math.max(45, Math.min(115, Number(heatResistance) || 55));
  const T = Math.max(1, Math.min(5, Number(toughness) || 2));
  const E = Math.max(1, Math.min(5, Number(easeOfPrint) || 4));
  const U = Math.max(1, Math.min(5, Number(outdoorResistance) || 1));
  const nozzleMm = parseFloat(nozzleSize.replace('mm', '')) || 0.4;
  const noteLower = customNote.toLowerCase();

  // Special Case: SLA / LCD Resin Printer
  if (printer.type === 'Resin') {
    const resinKey: FilamentFormulaKey = T >= 3 || H >= 65 ? 'resin_tough' : 'resin_8k';
    const spec = POLYMER_SPECS[resinKey];
    const matchedProd = findBestCatalogProduct(products, spec);
    const baseExp = resinKey === 'resin_tough' ? 2.2 : 1.9;
    const maxExp = Math.round((baseExp + (T - 1) * 0.15) * 10) / 10;
    const liftSpeed = Math.max(60, 120 - T * 10);

    return {
      materialKey: resinKey,
      materialInfo: {
        name: lang === 'en' ? spec.nameEn : lang === 'ja' ? spec.nameJa : spec.nameZh,
        fullName: lang === 'en' ? spec.fullNameEn : lang === 'ja' ? spec.fullNameJa : spec.fullNameZh,
        nozzleTemp: lang === 'en' ? 'Resin Vat 23°C - 28°C' : lang === 'ja' ? 'レジン液温 23°C - 28°C' : '樹脂槽恆溫 23°C - 28°C',
        bedTemp: `405nm UV · 底層曝光 ${Math.round(baseExp * 12)}s`,
        speed: `層曝光 ${baseExp}s - ${maxExp}s (抬升 ${liftSpeed} mm/m)`,
        fan: lang === 'en' ? 'Activated Carbon Filter' : lang === 'ja' ? '活性炭フィルター稼働' : '開啟機艙活性碳淨化',
        volumetricFlow: '0.05mm 層厚微米曝光',
        layerHeight: '0.05 mm',
        retraction: `Z軸抬升高度 6mm @ ${liftSpeed} mm/min`,
        bedType: '鐳雕高抓附成型平台',
        enclosureNeeded: '防紫外線遮光罩必備',
        productMaterial: spec.fallbackMaterialTag,
        preferredProductId: spec.preferredProductId,
        badge: lang === 'en' ? spec.badgeEn : lang === 'ja' ? spec.badgeJa : spec.badgeZh,
      },
      score: 98,
      reason:
        lang === 'en'
          ? `Detected SLA/LCD resin printer (${printer.name}). Computed 405nm exposure curve (${baseExp}–${maxExp}s/layer) for Lv.${T} toughness.`
          : lang === 'ja'
          ? `光造形機（${printer.name}）を検出し、靭性Lv.${T}に最適な405nm露光時間（${baseExp}〜${maxExp}秒/層）を算出しました。`
          : `偵測到光固化機型（${printer.name}），已依韌性 Lv.${T} 與耐溫 ${H}°C 函數推算最佳層曝光時間 ${baseExp}s - ${maxExp}s。`,
      alerts: [],
      product: matchedProd,
      telemetry: {
        volumetricFlowMm3S: 10,
        layerHeightMm: 0.05,
        lineWidthMm: 0.05,
        firstLayerSpeedMmS: 25,
        chamberTargetC: 25,
      },
    };
  }

  // Hardware capabilities
  const printerSpeedCap = Math.max(80, Number(printer.maxSpeedMmS) || 300);
  const printerNozzleCap = Math.max(240, Number(printer.maxNozzleTemp) || 260);
  const printerBedCap = Math.max(70, Number(printer.maxBedTemp) || 100);
  const isEnclosed = printer.enclosure === 'full';
  const isBowden = printer.extruder === 'bowden';
  const isBambuWithAms =
    printer.brand.toLowerCase().includes('bambu') &&
    printer.multiColorSupport.toLowerCase().includes('ams');
  const hasHardenedNozzle =
    printer.specialNotes.includes('硬化鋼') ||
    printer.specialNotes.includes('Unicorn') ||
    printer.specialNotes.includes('鋼') ||
    printer.specialNotes.includes('耐磨') ||
    printer.id.includes('x1c') ||
    printer.id.includes('k1c') ||
    printer.id.includes('centauri') ||
    printer.id.includes('qidi') ||
    printer.id.includes('voron');

  // Evaluate Multi-Variable Utility Function U(m | H, T, E, U, F, nozzle, printer, note)
  const fdmKeys: FilamentFormulaKey[] = [
    'hyper_pla',
    'bambu_pla',
    'pla_plus',
    'pla_matte',
    'pla_silk',
    'pla_cf',
    'petg_hf',
    'petg_matte',
    'petg_cf',
    'asa',
    'abs_gf',
    'pc_abs',
    'poly_pc',
    'pa6_cf',
    'pa12_cf',
    'copa_nylon',
    'tpu_95a',
    'tpu_85a',
    'tpu_64d',
  ];

  const scoredCandidates = fdmKeys.map((key) => {
    const spec = POLYMER_SPECS[key];

    // 1. Thermal Response Curve: asymmetric Gaussian + penalty if H exceeds polymer HDT
    const heatDiff = H - spec.optimalHeatCenterC;
    const thermalGaussian = Math.exp(-Math.pow(heatDiff / spec.optimalHeatWidthC, 2));
    // Severe thermal softening penalty when user's required heat resistance H exceeds polymer HDT
    const softeningDeficit = Math.max(0, H - (spec.hdtC + 4));
    const thermalScore = 36 * thermalGaussian - Math.pow(softeningDeficit, 1.35) * 1.4;

    // 2. Structural Toughness & Stiffness Curve (1~5)
    const toughDiff = Math.abs(T - spec.toughnessIdeal);
    let toughnessScore = 24 * Math.max(0, 1 - toughDiff / 2.6);

    // 3. Printability / Ease of Print Curve (1~5)
    const easeDiff = Math.abs(E - spec.easeIdeal);
    let easeScore = 18 * Math.max(0, 1 - easeDiff / 3.0);
    // If user explicitly wants 5-star beginner zero-warp printing, penalize high-warp materials
    if (E >= 4 && spec.requiresEnclosure) {
      easeScore -= (E - 3) * 14;
    }

    // 4. Outdoor UV & Moisture Weatherability Curve (1~5)
    const outdoorDiff = Math.abs(U - spec.outdoorIdeal);
    let outdoorScore = 20 * Math.max(0, 1 - outdoorDiff / 2.8);
    // Hydrolysis & UV penalty for unprotected PLA in high-UV outdoor settings (U >= 4)
    if (U >= 4 && spec.hdtC <= 65 && !spec.isElastomer) {
      outdoorScore -= (U - 3) * 13;
    }
    // ASA bonus when outdoor UV is Lv.4~5 and H >= 80°C
    if (key === 'asa' && U >= 4 && H >= 75) {
      outdoorScore += 16;
    }

    // 5. Surface Finish Affinity Matrix
    let finishScore = 0;
    if (surfaceFinish === 'standard') {
      if (
        key === 'hyper_pla' ||
        key === 'bambu_pla' ||
        key === 'pla_plus' ||
        key === 'petg_hf' ||
        key === 'asa' ||
        key === 'pc_abs' ||
        key === 'poly_pc' ||
        key === 'copa_nylon'
      ) {
        finishScore = 18;
      } else if (spec.isElastomer) {
        finishScore = T === 5 && H <= 60 && U <= 2 && E <= 3 ? 10 : -22;
      } else if (key.includes('cf')) {
        finishScore = -6;
      }
    } else if (surfaceFinish === 'matte') {
      if (key === 'pla_matte' || key === 'petg_matte') {
        finishScore = 28;
      } else if (key === 'abs_gf' || key === 'asa') {
        finishScore = 16;
      } else if (key.includes('cf')) {
        finishScore = 10;
      } else if (spec.isElastomer) {
        finishScore = -24;
      }
    } else if (surfaceFinish === 'cf') {
      if (key === 'pla_cf' || key === 'petg_cf' || key === 'pa6_cf' || key === 'pa12_cf') {
        finishScore = 34;
      } else if (key === 'abs_gf') {
        finishScore = 12;
      } else {
        finishScore = -18;
      }
    } else if (surfaceFinish === 'flexible') {
      if (spec.isElastomer) {
        finishScore = 38;
      } else {
        finishScore = -25;
      }
    }

    // 6. Hardware Envelope & Nozzle Orifice Compatibility
    let hardwareScore = 0;
    if (spec.baseNozzleC > printerNozzleCap - 10) {
      hardwareScore -= 45; // Printer cannot reach required extrusion temperature
    }
    if (spec.baseBedC > printerBedCap) {
      hardwareScore -= 35; // Printer bed cannot reach required temperature (e.g., A1 mini 80°C bed with ABS/PC)
    }
    if (spec.requiresEnclosure && !isEnclosed) {
      hardwareScore -= 16; // Open-frame warping penalty for ABS/ASA/PC/PA
    }
    if (spec.isFiberAbrasive && nozzleMm <= 0.25) {
      hardwareScore -= 30; // 0.2mm nozzle clogs with carbon/glass fibers
    }
    if (spec.isFiberAbrasive && hasHardenedNozzle) {
      hardwareScore += 5;
    }
    if (isBowden && key === 'tpu_85a') {
      hardwareScore -= 35; // Bowden tube cannot reliably push ultra-soft 85A TPU
    }
    if (key === 'bambu_pla' && isBambuWithAms && E === 5 && T === 1 && H <= 55) {
      hardwareScore += 8;
    }
    if (key === 'hyper_pla' && printerSpeedCap >= 500 && H <= 55 && T <= 2 && surfaceFinish === 'standard') {
      hardwareScore += 9;
    }

    // 7. Semantic Keyword Boost from Custom Note
    let keywordScore = 0;
    if (noteLower) {
      if ((noteLower.includes('絲綢') || noteLower.includes('金屬') || noteLower.includes('光澤') || noteLower.includes('silk')) && key === 'pla_silk') {
        keywordScore += 45;
      }
      if ((noteLower.includes('齒輪') || noteLower.includes('軸承') || noteLower.includes('耐磨') || noteLower.includes('尼龍') || noteLower.includes('gear')) && (key === 'copa_nylon' || key === 'pa6_cf' || key === 'pa12_cf')) {
        keywordScore += 32;
      }
      if ((noteLower.includes('無人機') || noteLower.includes('機臂') || noteLower.includes('航太') || noteLower.includes('drone')) && (key === 'pa12_cf' || key === 'pa6_cf' || key === 'petg_cf')) {
        keywordScore += 28;
      }
      if ((noteLower.includes('手機殼') || noteLower.includes('減震') || noteLower.includes('腳墊') || noteLower.includes('密封') || noteLower.includes('軟')) && spec.isElastomer) {
        keywordScore += 30;
      }
      if ((noteLower.includes('車內') || noteLower.includes('汽車') || noteLower.includes('引擎') || noteLower.includes('高溫')) && (key === 'abs_gf' || key === 'asa' || key === 'pc_abs' || key === 'pa6_cf')) {
        keywordScore += 24;
      }
    }

    const totalUtility =
      thermalScore +
      toughnessScore +
      easeScore +
      outdoorScore +
      finishScore +
      hardwareScore +
      keywordScore;

    return {
      key,
      spec,
      totalUtility,
    };
  });

  scoredCandidates.sort((a, b) => b.totalUtility - a.totalUtility);
  const winner = scoredCandidates[0];
  const runnerUp = scoredCandidates[1];
  const spec = winner.spec;

  // Compute Compatibility Score (83% ~ 99%) as a continuous function of utility & margin
  const utilityMargin = Math.max(0, winner.totalUtility - runnerUp.totalUtility);
  let compatibilityScore = Math.round(
    Math.min(99, Math.max(83, 87 + Math.min(8, utilityMargin * 0.45) + (winner.totalUtility > 75 ? 4 : 1)))
  );
  if (spec.requiresEnclosure && !isEnclosed) {
    compatibilityScore = Math.min(compatibilityScore, 85);
  }
  if (spec.isFiberAbrasive && nozzleMm <= 0.25) {
    compatibilityScore = Math.min(compatibilityScore, 82);
  }

  // ============================================================================
  // THERMODYNAMIC & RHEOLOGICAL SLICER EQUATIONS
  // ============================================================================
  // 1. Nozzle Orifice Cross-Section Geometry (d = 0.2, 0.4, 0.6, 0.8 mm)
  const layerHeightMm =
    nozzleMm <= 0.25 ? 0.10 : nozzleMm <= 0.45 ? 0.20 : nozzleMm <= 0.65 ? 0.30 : 0.40;
  const lineWidthMm =
    nozzleMm <= 0.25 ? 0.22 : nozzleMm <= 0.45 ? 0.42 : nozzleMm <= 0.65 ? 0.62 : 0.82;
  const crossSectionAreaMm2 = lineWidthMm * layerHeightMm; // e.g., 0.4mm -> 0.084 mm², 0.6mm -> 0.186 mm²

  // Hotend effective volumetric capacity scales slightly up with wider nozzle orifice (lower back-pressure),
  // except on 0.2mm where orifice shear restricts flow to ~35%
  const nozzleFlowEfficiency =
    nozzleMm <= 0.25
      ? 0.34
      : nozzleMm <= 0.45
      ? 1.0
      : nozzleMm <= 0.65
      ? 1.18
      : 1.30;

  // Printer hotend class multiplier (CoreXY high-flow vs standard vs Bowden)
  const printerHotendFactor =
    isBowden ? 0.52 : printerSpeedCap >= 500 ? 1.0 : printerSpeedCap >= 350 ? 0.88 : 0.72;

  // Quality & Structural Weld Damping:
  // Higher toughness T slows down extrusion slightly to maximize polymer chain entanglement across layers;
  // Higher easeOfPrint E keeps flow within a conservative anti-skip safety margin
  const weldFlowDamping =
    1.0 -
    0.04 * Math.max(0, T - 2) -
    0.025 * Math.max(0, 5 - E) -
    0.0015 * Math.max(0, H - spec.optimalHeatCenterC);

  const effectiveVolumetricFlowMm3S = Math.max(
    1.8,
    Math.round(
      spec.maxVolumetricFlowMm3S *
        nozzleFlowEfficiency *
        printerHotendFactor *
        Math.max(0.68, Math.min(1.06, weldFlowDamping)) *
        10
    ) / 10
  );

  // 2. Linear Print Speed Window [minSpeed, maxSpeed] mm/s
  // Governed simultaneously by Volumetric Flow Limit (Q / Area) and Kinematics Limit
  const volumetricSpeedLimitMmS = effectiveVolumetricFlowMm3S / (crossSectionAreaMm2 * 0.88);
  const nozzleKinematicsCap =
    nozzleMm <= 0.25
      ? Math.min(120, spec.maxLinearSpeedMmS * 0.42)
      : nozzleMm <= 0.45
      ? spec.maxLinearSpeedMmS
      : nozzleMm <= 0.65
      ? spec.maxLinearSpeedMmS * 0.76
      : spec.maxLinearSpeedMmS * 0.58;

  const rawMaxSpeed = Math.min(
    printerSpeedCap * (0.76 + 0.045 * E),
    nozzleKinematicsCap,
    volumetricSpeedLimitMmS * 1.18
  );

  const computedMaxSpeed = Math.max(
    25,
    Math.round(rawMaxSpeed / 5) * 5
  );
  const computedMinSpeed = Math.max(
    15,
    Math.round((computedMaxSpeed * (spec.isElastomer ? 0.55 : 0.60)) / 5) * 5
  );
  const firstLayerSpeedMmS = spec.isElastomer
    ? 20
    : nozzleMm <= 0.25
    ? 25
    : Math.min(45, Math.max(30, Math.round((computedMinSpeed * 0.22) / 5) * 5));

  // 3. Nozzle Extrusion Temperature Equation T_nozzle(m, Q, v, T, H, d, Steel)
  // - Shear-heating & melt residence time compensation: +1°C per 2.2 mm³/s above 8 mm³/s
  const volumetricThermalBoost = Math.round(Math.max(0, effectiveVolumetricFlowMm3S - 8) / 2.2);
  // - Inter-layer polymer diffusion boost for higher structural toughness T
  const toughnessWeldBoost = Math.round((T - 2) * 2.2);
  // - Crystallinity & heat resistance boost from slider H relative to polymer center
  const heatSliderBoost = Math.round((H - spec.optimalHeatCenterC) / 9);
  // - Nozzle diameter thermal mass offset (0.2mm needs lower temp to prevent heat creep; 0.6/0.8mm needs higher core heat)
  const nozzleOrificeTempDelta =
    nozzleMm <= 0.25 ? -5 : nozzleMm <= 0.45 ? 0 : nozzleMm <= 0.65 ? +5 : +9;
  // - Hardened steel nozzle lower thermal conductivity compensation (+4°C vs brass)
  const hardenedSteelDelta = hasHardenedNozzle || spec.isFiberAbrasive ? 4 : 0;

  const rawNozzleMin =
    spec.baseNozzleC +
    volumetricThermalBoost +
    toughnessWeldBoost +
    heatSliderBoost +
    nozzleOrificeTempDelta +
    hardenedSteelDelta;

  const clampedNozzleMin = Math.max(
    spec.baseNozzleC - 6,
    Math.min(Math.min(printerNozzleCap - 8, spec.maxSafeNozzleC - 8), rawNozzleMin)
  );
  const nozzleSpan = spec.isElastomer ? 8 : 10;
  const clampedNozzleMax = Math.min(
    printerNozzleCap,
    spec.maxSafeNozzleC,
    clampedNozzleMin + nozzleSpan
  );

  // 4. Heated Bed Temperature Equation T_bed(m, H, E, U, Enclosure, Nozzle)
  // - Open-frame printers lose heat via ambient convection -> +5°C bed compensation
  const openChamberBedDelta = isEnclosed ? 0 : 5;
  // - Larger nozzles (0.6/0.8mm) lay thicker extrusions with higher shrinkage stress -> +3~5°C bed
  const thickLayerBedDelta = nozzleMm >= 0.6 ? 4 : 0;
  // - Slider thermal & outdoor stress adjustment
  const sliderBedDelta = Math.round((H - spec.optimalHeatCenterC) / 12) + Math.max(0, 3 - E) * 2 + Math.floor(U / 2);

  const rawBedMin = spec.baseBedC + openChamberBedDelta + thickLayerBedDelta + sliderBedDelta;
  const clampedBedMin = Math.max(
    spec.baseBedC - 5,
    Math.min(Math.min(printerBedCap - 5, spec.maxSafeBedC - 5), rawBedMin)
  );
  const clampedBedMax = Math.min(printerBedCap, spec.maxSafeBedC, clampedBedMin + 5);

  // 5. Part Cooling Fan Speed Equation F_fan(m, v_max, T, H, Enclosure, d)
  // - Faster print speed requires stronger cooling to solidify overhangs
  const speedFanDelta = Math.round((computedMaxSpeed - 150) / 25);
  // - Higher structural toughness T reduces fan cooling so extruded lines fuse deeper into the previous layer
  const toughnessFanDelta = -Math.round(Math.max(0, T - 2) * 5.5);
  // - Higher heat resistance H reduces fan slightly to reduce internal residual stress
  const heatFanDelta = -Math.round(Math.max(0, H - spec.optimalHeatCenterC) / 8);
  // - Enclosed chamber traps warm air -> +6% fan; Open frame has natural convection -> -4% fan
  const enclosureFanDelta = isEnclosed ? +5 : -4;
  // - Fine 0.2mm nozzle needs extra cooling for micro-overhangs
  const nozzleFanDelta = nozzleMm <= 0.25 ? +6 : nozzleMm >= 0.6 ? -5 : 0;

  const fanCenter = Math.max(
    spec.minFanPct,
    Math.min(
      spec.maxFanPct,
      spec.baseFanPct + speedFanDelta + toughnessFanDelta + heatFanDelta + enclosureFanDelta + nozzleFanDelta
    )
  );
  const fanMin = Math.max(spec.minFanPct, Math.min(95, Math.round((fanCenter - 6) / 5) * 5));
  const fanMax = Math.max(fanMin + 5, Math.min(spec.maxFanPct, Math.round((fanCenter + 6) / 5) * 5));
  const fanDisplay = fanMin >= 90 && fanMax === 100 ? `${fanMin}% - 100%` : `${fanMin}% - ${fanMax}%`;

  // 6. Retraction Distance & Speed Function (Direct Drive vs Bowden, Nozzle d, Polymer elasticity)
  const baseRetractLength = isBowden
    ? spec.isElastomer
      ? 2.8
      : 4.6
    : spec.isElastomer
    ? 0.6
    : printer.id.includes('voron')
    ? 0.5
    : 0.8;
  const nozzleRetractAdjust = nozzleMm >= 0.6 ? +0.2 : nozzleMm <= 0.25 ? -0.15 : 0;
  const retractLengthMm = Math.round((baseRetractLength + nozzleRetractAdjust) * 10) / 10;
  const retractSpeedMmS = spec.isElastomer ? 22 : isBowden ? 42 : 35;

  const retractionDisplay =
    lang === 'en'
      ? `${isBowden ? 'Bowden' : 'Direct Drive'} ${retractLengthMm}mm @ ${retractSpeedMmS}mm/s${spec.isElastomer ? ' (Z-Hop Off)' : ''}`
      : lang === 'ja'
      ? `${isBowden ? 'ボーデン' : 'ダイレクト'} ${retractLengthMm}mm @ ${retractSpeedMmS}mm/s${spec.isElastomer ? ' (ZホップOFF)' : ''}`
      : `${isBowden ? '遠端管' : '近端直驅'} ${retractLengthMm}mm @ ${retractSpeedMmS}mm/s${spec.isElastomer ? ' (關閉 Z-Hop)' : ''}`;

  // 7. Recommended Build Plate & Chamber Target
  const chamberTargetC = spec.requiresEnclosure ? Math.min(60, Math.round(42 + (H - 80) * 0.45)) : 28;
  const bedTypeDisplay =
    spec.key === 'pa6_cf' || spec.key === 'pa12_cf' || spec.key === 'copa_nylon' || spec.key === 'abs_gf' || spec.key === 'poly_pc'
      ? lang === 'en'
        ? 'Textured PEI / Engineering Plate + PVP Glue Stick'
        : lang === 'ja'
        ? 'テクスチャードPEI / エンジニアリングプレート＋スティックのり'
        : '高溫 PEI 彈簧鋼板 + 薄層 PVP 固體膠'
      : spec.isElastomer
      ? lang === 'en'
        ? 'Textured PEI Plate (Apply glue release agent on smooth PEI)'
        : lang === 'ja'
        ? 'テクスチャードPEI（平滑PEIの場合は離型用のり塗布）'
        : 'Textured PEI 金鋼砂板 (光面需塗膠防黏死)'
      : lang === 'en'
      ? 'Textured PEI Spring Steel Plate (Glue-Free)'
      : lang === 'ja'
      ? 'テクスチャード PEI バネ鋼プレート（のり不要）'
      : '雙面紋理 PEI 金鋼砂彈簧鋼板 (免塗膠)';

  const enclosureDisplay = spec.requiresEnclosure
    ? lang === 'en'
      ? `Enclosed Chamber Required (${chamberTargetC}–${chamberTargetC + 8}°C)`
      : lang === 'ja'
      ? `密閉チャンバー保温必須 (腔温 ${chamberTargetC}〜${chamberTargetC + 8}°C)`
      : `建議封箱恆溫列印 (目標腔溫 ${chamberTargetC}-${chamberTargetC + 8}°C)`
    : spec.hdtC <= 62 && isEnclosed
    ? lang === 'en'
      ? 'Open Top Glass / Door Slightly to Prevent Heat Creep'
      : lang === 'ja'
      ? '天面ガラスまたはドアを少し開けて放熱推奨'
      : '全封箱機型印製時建議上蓋開微縫散熱'
    : lang === 'en'
    ? 'Open or Enclosed Chamber Ready'
    : lang === 'ja'
    ? 'オープン・密閉どちらも対応'
    : '開放或封閉機箱皆可穩定列印';

  // 8. Hardware Conflict & Slicer Engineering Alerts
  const alerts: string[] = [];
  if (spec.requiresEnclosure && !isEnclosed) {
    alerts.push(
      lang === 'en'
        ? `Chamber Alert: ${printer.name} is open-frame. Use a thermal tent for ${spec.nameEn} or lower Heat Resistance to 75°C for PETG-HF.`
        : lang === 'ja'
        ? `チャンバー注意：${printer.name}はオープン構造のため、${spec.nameJa}造形時は保温カバーを使用するかPETG-HFをご検討ください。`
        : `腔溫提醒：${printer.name} 為開放式機身，列印 ${spec.nameZh} 建議加裝保溫罩，或將耐溫調至 75°C 改用 PETG-HF。`
    );
  }
  if (spec.baseBedC > printerBedCap) {
    alerts.push(
      lang === 'en'
        ? `Bed Temp Limit: ${printer.name} max bed temp is ${printerBedCap}°C, while ${spec.nameEn} prefers ${spec.baseBedC}°C+. Use a brim and glue stick.`
        : lang === 'ja'
        ? `ベッド温度上限：${printer.name}の最大ベッド温度は${printerBedCap}°Cです。ブリム（Brim）とのり付けを併用してください。`
        : `熱床上限提醒：${printer.name} 熱床上限為 ${printerBedCap}°C，建議開啟 8mm Brim 裙邊並塗抹固體膠輔助抓底。`
    );
  }
  if (spec.isFiberAbrasive && nozzleMm <= 0.25) {
    alerts.push(
      lang === 'en'
        ? `Clog Warning: 0.2mm nozzle will clog with fiber-reinforced filament! Please switch nozzle diameter to 0.4mm or 0.6mm.`
        : lang === 'ja'
        ? `ノズル詰まり警告：0.2mmノズルは繊維強化材が詰まりやすいため、0.4mmまたは0.6mmへ変更してください。`
        : `堵頭警告：0.2mm 微縮噴嘴極易因碳纖/玻纖架橋堵頭！請於下方將噴嘴口徑改為 0.4mm 或 0.6mm。`
    );
  } else if (spec.isFiberAbrasive && !hasHardenedNozzle) {
    alerts.push(
      lang === 'en'
        ? `Abrasive Alert: ${spec.nameEn} contains rigid fibers—install a 0.4mm+ Hardened Steel Nozzle before printing.`
        : lang === 'ja'
        ? `摩耗注意：${spec.nameJa}は高硬度繊維を含むため、0.4mm以上の硬化鋼ノズルへの交換を推奨します。`
        : `耐磨提醒：${spec.nameZh} 含高強度纖維微粒，請確認已換裝 0.4mm 以上硬化鋼噴嘴以免擴孔。`
    );
  }
  if (spec.isElastomer && (printer.multiColorSupport.includes('AMS') || printer.multiColorSupport.includes('ACE') || printer.multiColorSupport.includes('MMU'))) {
    const feederName = printer.multiColorSupport.split(' ')[0];
    alerts.push(
      lang === 'en'
        ? `Feeder Note: Do not load flexible ${spec.nameEn} into ${feederName}—feed directly from the external spool holder.`
        : lang === 'ja'
        ? `給紙注意：軟質フィラメントは${feederName}に通さず、外部スプールホルダーから直接給紙してください。`
        : `供料提醒：軟質彈性線材請勿裝入 ${feederName} 多色進料器，請改由機身外掛料架直接進料。`
    );
  }

  // 9. Concise, transparent explanation showing the exact mathematical inputs & outputs
  const reasonText =
    lang === 'en'
      ? `Calibrated for [Heat ${H}°C · Toughness Lv.${T} · Printability ${E}★ · UV Lv.${U} · ${nozzleSize}]: Max Volumetric Flow Q = ${effectiveVolumetricFlowMm3S} mm³/s, Layer ${layerHeightMm}mm, First Layer ${firstLayerSpeedMmS} mm/s.`
      : lang === 'ja'
      ? `関数算出［耐熱${H}°C・靭性Lv.${T}・造形性${E}★・抗UV Lv.${U}・${nozzleSize}］：最大体積流量 Q = ${effectiveVolumetricFlowMm3S} mm³/s、積層ピッチ ${layerHeightMm}mm、1層目速度 ${firstLayerSpeedMmS} mm/s。`
      : `依函數模型精算［耐溫 ${H}°C・韌性 Lv.${T}・友善度 ${E}★・抗UV Lv.${U}・${nozzleSize} 噴嘴］：最大體積流量 Q = ${effectiveVolumetricFlowMm3S} mm³/s、最佳層高 ${layerHeightMm}mm、首層速度 ${firstLayerSpeedMmS} mm/s。`;

  const matchedProduct = findBestCatalogProduct(products, spec);

  return {
    materialKey: spec.key,
    materialInfo: {
      name: lang === 'en' ? spec.nameEn : lang === 'ja' ? spec.nameJa : spec.nameZh,
      fullName: lang === 'en' ? spec.fullNameEn : lang === 'ja' ? spec.fullNameJa : spec.fullNameZh,
      nozzleTemp: `${clampedNozzleMin}°C - ${clampedNozzleMax}°C`,
      bedTemp: `${clampedBedMin}°C - ${clampedBedMax}°C`,
      speed: `${computedMinSpeed} - ${computedMaxSpeed} mm/s`,
      fan: fanDisplay,
      volumetricFlow: `${effectiveVolumetricFlowMm3S} mm³/s`,
      layerHeight: `${layerHeightMm} mm`,
      retraction: retractionDisplay,
      bedType: bedTypeDisplay,
      enclosureNeeded: enclosureDisplay,
      productMaterial: spec.fallbackMaterialTag,
      preferredProductId: spec.preferredProductId,
      badge: lang === 'en' ? spec.badgeEn : lang === 'ja' ? spec.badgeJa : spec.badgeZh,
    },
    score: compatibilityScore,
    reason: reasonText,
    alerts,
    product: matchedProduct,
    telemetry: {
      volumetricFlowMm3S: effectiveVolumetricFlowMm3S,
      layerHeightMm,
      lineWidthMm,
      firstLayerSpeedMmS,
      chamberTargetC,
    },
  };
}
