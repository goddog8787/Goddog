export interface PrinterBrandInfo {
  id: string;
  name: string;
  shortName: string;
}

export interface PrinterProfile {
  id: string;
  brandId: string;
  brand: string;
  name: string;
  series: string;
  extruder: 'direct' | 'bowden';
  enclosure: 'open' | 'enclosed' | 'heated_chamber';
  kinematics: 'corexy' | 'bedslinger' | 'delta' | 'cartesian';
  maxPrintSpeed: number; // mm/s
  maxTempNozzle: number; // °C
  maxTempBed: number; // °C
  maxVolumetricFlowMultiplier: number; // relative to standard 1.0x
  speedFactor: number; // multiplier for print speed recommendations
  nozzleTempOffset: number; // °C offset needed due to high-speed flow or hotend geometry
  coolingEfficiency: 'standard' | 'high' | 'aux_blower';
  retractionDistanceBase: {
    rigid: number; // PLA, ABS, ASA, PC, PA
    petg: number;
    tpu: number;
  };
  retractionSpeedBase: {
    rigid: number;
    petg: number;
    tpu: number;
  };
  amsCompatible: boolean;
  defaultNozzle?: string;
  defaultMaterial?: string;
  specialNotes: string;
}

export const PRINTER_BRANDS: PrinterBrandInfo[] = [
  { id: 'bambu', name: 'Bambu Lab 拓竹', shortName: 'Bambu Lab' },
  { id: 'creality', name: 'Creality 創想三維', shortName: 'Creality' },
  { id: 'snapmaker', name: 'Snapmaker 快造科技', shortName: 'Snapmaker' },
  { id: 'anycubic', name: 'Anycubic 縱維立方', shortName: 'Anycubic' },
  { id: 'qidi', name: 'QIDI 啟龐', shortName: 'QIDI' },
  { id: 'elegoo', name: 'Elegoo 愛樂酷', shortName: 'Elegoo' },
  { id: 'infimech', name: 'Infimech 無限機甲', shortName: 'Infimech' },
  { id: 'prusa', name: 'Prusa Research', shortName: 'Prusa' },
  { id: 'flashforge', name: 'Flashforge 閃鑄', shortName: 'Flashforge' },
  { id: 'sovol', name: 'Sovol', shortName: 'Sovol' },
  { id: 'flsun', name: 'Flsun 菲爾森', shortName: 'Flsun' },
  { id: 'voron', name: 'Voron Design', shortName: 'Voron' },
  { id: 'ratrig_annex', name: 'RatRig / Annex / VzBot', shortName: 'RatRig / Annex' },
  { id: 'phrozen', name: 'Phrozen 普羅森', shortName: 'Phrozen' },
  { id: 'ankermake', name: 'AnkerMake 安克', shortName: 'AnkerMake' },
  { id: 'artillery', name: 'Artillery 砲兵', shortName: 'Artillery' },
  { id: 'kingroon', name: 'Kingroon 金格龍', shortName: 'Kingroon' },
  { id: 'twotrees', name: 'TwoTrees 兩棵樹', shortName: 'TwoTrees' },
  { id: 'flyingbear', name: 'FlyingBear 飛熊', shortName: 'FlyingBear' },
  { id: 'biqu_mingda', name: 'BIQU 必趣 / Mingda 銘達 / Geeetech / Tronxy', shortName: 'BIQU / Mingda' },
  { id: 'industrial_custom', name: 'Raise3D / UltiMaker / BCN3D / 自組機', shortName: '工業級 / 自組機' },
];

type ProfileSeed = {
  id: string;
  brandId: string;
  brand: string;
  name: string;
  series: string;
  tier:
    | 'flagship_heated_corexy'
    | 'enclosed_corexy_hs'
    | 'open_corexy_hs'
    | 'bedslinger_hs'
    | 'bedslinger_direct_std'
    | 'bedslinger_bowden'
    | 'delta_ultra'
    | 'delta_hs'
    | 'awd_extreme'
    | 'idex_toolchanger'
    | 'industrial_heated';
  ams?: boolean;
  maxSpeed?: number;
  maxNozzle?: number;
  maxBed?: number;
  notes?: string;
};

function buildProfile(seed: ProfileSeed): PrinterProfile {
  switch (seed.tier) {
    case 'awd_extreme':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'heated_chamber',
        kinematics: 'corexy',
        maxPrintSpeed: seed.maxSpeed ?? 800,
        maxTempNozzle: seed.maxNozzle ?? 350,
        maxTempBed: seed.maxBed ?? 120,
        maxVolumetricFlowMultiplier: 1.65,
        speedFactor: 1.5,
        nozzleTempOffset: 12,
        coolingEfficiency: 'aux_blower',
        retractionDistanceBase: { rigid: 0.4, petg: 0.6, tpu: 0.3 },
        retractionSpeedBase: { rigid: 50, petg: 40, tpu: 25 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 硬化鋼高流量噴嘴',
        defaultMaterial: 'ABS / ASA / PA-CF / PC / PLA',
        specialNotes: seed.notes ?? '超高速高剛性架構，需搭配高流量熱端與提高噴嘴溫度。',
      };
    case 'delta_ultra':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'enclosed',
        kinematics: 'delta',
        maxPrintSpeed: seed.maxSpeed ?? 1000,
        maxTempNozzle: seed.maxNozzle ?? 350,
        maxTempBed: seed.maxBed ?? 120,
        maxVolumetricFlowMultiplier: 1.6,
        speedFactor: 1.5,
        nozzleTempOffset: 12,
        coolingEfficiency: 'aux_blower',
        retractionDistanceBase: { rigid: 0.7, petg: 0.9, tpu: 0.5 },
        retractionSpeedBase: { rigid: 50, petg: 40, tpu: 25 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 高流量硬化鋼噴嘴',
        defaultMaterial: 'High-Speed PLA / PETG / ABS / ASA',
        specialNotes: seed.notes ?? '超高速封箱三角洲搭配 CPAP 高壓渦輪風扇，建議提高噴嘴溫度。',
      };
    case 'delta_hs':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'open',
        kinematics: 'delta',
        maxPrintSpeed: seed.maxSpeed ?? 600,
        maxTempNozzle: seed.maxNozzle ?? 300,
        maxTempBed: seed.maxBed ?? 110,
        maxVolumetricFlowMultiplier: 1.3,
        speedFactor: 1.25,
        nozzleTempOffset: 7,
        coolingEfficiency: 'high',
        retractionDistanceBase: { rigid: 0.8, petg: 1.0, tpu: 0.6 },
        retractionSpeedBase: { rigid: 45, petg: 35, tpu: 22 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 火山加長噴嘴',
        defaultMaterial: 'High-Speed PLA / Silk PLA / PETG',
        specialNotes: seed.notes ?? '高速三角洲結構，適合曲面與高塔模型。',
      };
    case 'flagship_heated_corexy':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'heated_chamber',
        kinematics: 'corexy',
        maxPrintSpeed: seed.maxSpeed ?? 600,
        maxTempNozzle: seed.maxNozzle ?? 350,
        maxTempBed: seed.maxBed ?? 120,
        maxVolumetricFlowMultiplier: 1.5,
        speedFactor: 1.4,
        nozzleTempOffset: 10,
        coolingEfficiency: 'aux_blower',
        retractionDistanceBase: { rigid: 0.6, petg: 0.8, tpu: 0.4 },
        retractionSpeedBase: { rigid: 42, petg: 35, tpu: 20 },
        amsCompatible: seed.ams ?? true,
        defaultNozzle: '0.4mm 硬化鋼噴嘴',
        defaultMaterial: 'PLA / PETG / ABS / ASA / PA-CF / PC',
        specialNotes: seed.notes ?? '具備主動恆溫腔室與高溫噴頭，支援工程碳纖與高速多色列印。',
      };
    case 'idex_toolchanger':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'enclosed',
        kinematics: 'corexy',
        maxPrintSpeed: seed.maxSpeed ?? 500,
        maxTempNozzle: seed.maxNozzle ?? 300,
        maxTempBed: seed.maxBed ?? 110,
        maxVolumetricFlowMultiplier: 1.35,
        speedFactor: 1.25,
        nozzleTempOffset: 7,
        coolingEfficiency: 'aux_blower',
        retractionDistanceBase: { rigid: 0.6, petg: 0.8, tpu: 0.4 },
        retractionSpeedBase: { rigid: 40, petg: 32, tpu: 20 },
        amsCompatible: true,
        defaultNozzle: '0.4mm 多噴頭換刀噴嘴',
        defaultMaterial: 'PLA / PETG / TPU / ABS / ASA / PVA',
        specialNotes: seed.notes ?? '獨立多噴頭換刀系統，支援軟硬異質材料結合與低廢料多色列印。',
      };
    case 'enclosed_corexy_hs':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'enclosed',
        kinematics: 'corexy',
        maxPrintSpeed: seed.maxSpeed ?? 600,
        maxTempNozzle: seed.maxNozzle ?? 300,
        maxTempBed: seed.maxBed ?? 110,
        maxVolumetricFlowMultiplier: 1.35,
        speedFactor: 1.3,
        nozzleTempOffset: 8,
        coolingEfficiency: 'aux_blower',
        retractionDistanceBase: { rigid: 0.7, petg: 0.9, tpu: 0.4 },
        retractionSpeedBase: { rigid: 40, petg: 30, tpu: 20 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 硬化鋼噴嘴',
        defaultMaterial: 'PLA / PETG / ABS / ASA',
        specialNotes: seed.notes ?? '全封箱高速 CoreXY，列印 PLA 建議加強排風或開門散熱。',
      };
    case 'open_corexy_hs':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'open',
        kinematics: 'corexy',
        maxPrintSpeed: seed.maxSpeed ?? 500,
        maxTempNozzle: seed.maxNozzle ?? 300,
        maxTempBed: seed.maxBed ?? 100,
        maxVolumetricFlowMultiplier: 1.25,
        speedFactor: 1.2,
        nozzleTempOffset: 6,
        coolingEfficiency: 'high',
        retractionDistanceBase: { rigid: 0.8, petg: 1.0, tpu: 0.5 },
        retractionSpeedBase: { rigid: 38, petg: 30, tpu: 20 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 高流量噴嘴',
        defaultMaterial: 'PLA / Matte PLA / PETG / TPU',
        specialNotes: seed.notes ?? '開放式高速 CoreXY，散熱極佳，適合 PLA、PETG 與 TPU。',
      };
    case 'bedslinger_hs':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'open',
        kinematics: 'bedslinger',
        maxPrintSpeed: seed.maxSpeed ?? 500,
        maxTempNozzle: seed.maxNozzle ?? 300,
        maxTempBed: seed.maxBed ?? 100,
        maxVolumetricFlowMultiplier: 1.18,
        speedFactor: 1.1,
        nozzleTempOffset: 5,
        coolingEfficiency: 'high',
        retractionDistanceBase: { rigid: 0.8, petg: 1.0, tpu: 0.5 },
        retractionSpeedBase: { rigid: 35, petg: 28, tpu: 18 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 直驅噴嘴',
        defaultMaterial: 'PLA / Matte PLA / Silk PLA / PETG',
        specialNotes: seed.notes ?? '高速直驅龍門機型，高聳模型建議適度降低末段速度防晃動。',
      };
    case 'bedslinger_direct_std':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'open',
        kinematics: 'bedslinger',
        maxPrintSpeed: seed.maxSpeed ?? 180,
        maxTempNozzle: seed.maxNozzle ?? 260,
        maxTempBed: seed.maxBed ?? 100,
        maxVolumetricFlowMultiplier: 0.78,
        speedFactor: 0.65,
        nozzleTempOffset: 0,
        coolingEfficiency: 'standard',
        retractionDistanceBase: { rigid: 0.9, petg: 1.2, tpu: 0.6 },
        retractionSpeedBase: { rigid: 35, petg: 28, tpu: 18 },
        amsCompatible: seed.ams ?? false,
        defaultNozzle: '0.4mm 黃銅噴嘴',
        defaultMaterial: 'PLA / PETG / TPU',
        specialNotes: seed.notes ?? '穩定近程直驅架構，適合標準 PLA、PETG 與 TPU 軟料。',
      };
    case 'bedslinger_bowden':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'bowden',
        enclosure: 'open',
        kinematics: 'bedslinger',
        maxPrintSpeed: seed.maxSpeed ?? 120,
        maxTempNozzle: seed.maxNozzle ?? 260,
        maxTempBed: seed.maxBed ?? 100,
        maxVolumetricFlowMultiplier: 0.58,
        speedFactor: 0.48,
        nozzleTempOffset: -3,
        coolingEfficiency: 'standard',
        retractionDistanceBase: { rigid: 5.0, petg: 6.0, tpu: 3.5 },
        retractionSpeedBase: { rigid: 45, petg: 35, tpu: 20 },
        amsCompatible: false,
        defaultNozzle: '0.4mm MK8 黃銅噴嘴',
        defaultMaterial: 'PLA / Matte PLA / PETG',
        specialNotes: seed.notes ?? '遠程 Bowden 導管結構，需設定 5.0~6.0mm 回抽距離抑制拉絲。',
      };
    case 'industrial_heated':
      return {
        id: seed.id,
        brandId: seed.brandId,
        brand: seed.brand,
        name: seed.name,
        series: seed.series,
        extruder: 'direct',
        enclosure: 'heated_chamber',
        kinematics: 'cartesian',
        maxPrintSpeed: seed.maxSpeed ?? 350,
        maxTempNozzle: seed.maxNozzle ?? 320,
        maxTempBed: seed.maxBed ?? 120,
        maxVolumetricFlowMultiplier: 1.2,
        speedFactor: 1.0,
        nozzleTempOffset: 5,
        coolingEfficiency: 'high',
        retractionDistanceBase: { rigid: 0.8, petg: 1.0, tpu: 0.5 },
        retractionSpeedBase: { rigid: 35, petg: 28, tpu: 18 },
        amsCompatible: seed.ams ?? true,
        defaultNozzle: '0.4mm 硬化鋼噴嘴',
        defaultMaterial: 'PA-CF / PC / ABS / ASA / PLA / PETG',
        specialNotes: seed.notes ?? '工業級恆溫封箱系統，重視高尺寸精度與層間結合強度。',
      };
  }
}

const SEEDS: ProfileSeed[] = [
  // ==========================================================================
  // 1. Bambu Lab 拓竹 (全系列含最新 H2D / H2C / H2S / H3C / P2S / A1L)
  // ==========================================================================
  { id: 'bambu-h2d', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab H2D', series: 'H 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: '雙噴頭主動腔溫旗艦，支援 AMS 2 Pro 與多材質混印。' },
  { id: 'bambu-h2c', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab H2C', series: 'H 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: 'Vortek 自動換噴頭多色旗艦，大幅減少換色廢料。' },
  { id: 'bambu-h2s', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab H2S', series: 'H 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: '大尺寸單噴頭主動腔溫工程旗艦機。' },
  { id: 'bambu-h3c', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab H3C', series: 'H 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: '高速多色封箱 CoreXY，支援高溫碳纖工程耗材。' },
  { id: 'bambu-x1e', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab X1E', series: 'X 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 500, maxNozzle: 320, maxBed: 120, notes: '60°C 主動腔溫控制與 320°C 噴頭，專精 PPA-CF / PPS-CF / PC。' },
  { id: 'bambu-x1c', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab X1C', series: 'X 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 110, notes: '標配硬化鋼噴嘴與輔助風扇，列印 PLA 建議開前門散熱。' },
  { id: 'bambu-x1', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab X1', series: 'X 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'bambu-p2s', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab P2S', series: 'P 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 110, notes: '新一代 P2S 升級溫控腔室與強化擠出機，原生支援 AMS 2 Pro。' },
  { id: 'bambu-p1s', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab P1S', series: 'P 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'bambu-p1p', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab P1P', series: 'P 系列', tier: 'open_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'bambu-a1l', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab A1L / A2L', series: 'A 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100, notes: '大尺寸開放式高速機型，支援 AMS lite 四色列印。' },
  { id: 'bambu-a1', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab A1', series: 'A 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'bambu-a1-mini', brandId: 'bambu', brand: 'Bambu Lab', name: 'Bambu Lab A1 mini', series: 'A 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 80, notes: '熱床上限 80°C，專精 PLA、Silk PLA、PETG 與 TPU。' },

  // ==========================================================================
  // 2. Creality 創想三維 (SparkX / K3 / K2 / K1 / Hi / Ender 全系列 / CR / Sermoon)
  // ==========================================================================
  { id: 'creality-sparkx-i8-pro', brandId: 'creality', brand: 'Creality', name: 'SparkX i8 Pro', series: 'SparkX 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-sparkx-i8', brandId: 'creality', brand: 'Creality', name: 'SparkX i8', series: 'SparkX 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-sparkx-i7', brandId: 'creality', brand: 'Creality', name: 'SparkX i7', series: 'SparkX 系列', tier: 'open_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-k3-max', brandId: 'creality', brand: 'Creality', name: 'Creality K3 Max', series: 'K 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-k3-pro', brandId: 'creality', brand: 'Creality', name: 'Creality K3 Pro', series: 'K 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-k3', brandId: 'creality', brand: 'Creality', name: 'Creality K3', series: 'K 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-k2-plus', brandId: 'creality', brand: 'Creality', name: 'Creality K2 Plus', series: 'K 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: '350mm 大尺寸主動腔溫 CoreXY，支援 CFS 四色多機串聯。' },
  { id: 'creality-k2-pro', brandId: 'creality', brand: 'Creality', name: 'Creality K2 Pro', series: 'K 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'creality-k2', brandId: 'creality', brand: 'Creality', name: 'Creality K2', series: 'K 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 110 },
  { id: 'creality-k1-max', brandId: 'creality', brand: 'Creality', name: 'Creality K1 Max', series: 'K 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-k1c', brandId: 'creality', brand: 'Creality', name: 'Creality K1C', series: 'K 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-k1', brandId: 'creality', brand: 'Creality', name: 'Creality K1', series: 'K 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-k1-se', brandId: 'creality', brand: 'Creality', name: 'Creality K1 SE', series: 'K 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-hi', brandId: 'creality', brand: 'Creality', name: 'Creality Hi / Hi Combo', series: 'Hi 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender3-v4', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V4', series: 'Ender-3 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender3-v3-plus', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V3 Plus', series: 'Ender-3 V3 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender3-v3', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V3', series: 'Ender-3 V3 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender3-v3-ke', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V3 KE', series: 'Ender-3 V3 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender3-v3-se', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V3 SE', series: 'Ender-3 V3 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 250, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-s1-pro', brandId: 'creality', brand: 'Creality', name: 'Ender-3 S1 Pro', series: 'Ender-3 S1 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 160, maxNozzle: 300, maxBed: 110 },
  { id: 'creality-ender3-s1-plus', brandId: 'creality', brand: 'Creality', name: 'Ender-3 S1 Plus', series: 'Ender-3 S1 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 160, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-s1', brandId: 'creality', brand: 'Creality', name: 'Ender-3 S1', series: 'Ender-3 S1 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 160, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-v2-neo', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V2 Neo', series: 'Ender-3 V2 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-v2', brandId: 'creality', brand: 'Creality', name: 'Ender-3 V2', series: 'Ender-3 V2 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-max-neo', brandId: 'creality', brand: 'Creality', name: 'Ender-3 Max Neo', series: 'Ender-3 Neo 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-neo', brandId: 'creality', brand: 'Creality', name: 'Ender-3 Neo', series: 'Ender-3 Neo 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender3-pro', brandId: 'creality', brand: 'Creality', name: 'Ender-3 Pro', series: 'Ender-3 經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 255, maxBed: 100 },
  { id: 'creality-ender3-max', brandId: 'creality', brand: 'Creality', name: 'Ender-3 Max', series: 'Ender-3 經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 255, maxBed: 100 },
  { id: 'creality-ender3-classic', brandId: 'creality', brand: 'Creality', name: 'Ender-3', series: 'Ender-3 經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 255, maxBed: 100 },
  { id: 'creality-ender5-max', brandId: 'creality', brand: 'Creality', name: 'Ender-5 Max', series: 'Ender-5 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 700, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-ender5-s1', brandId: 'creality', brand: 'Creality', name: 'Ender-5 S1', series: 'Ender-5 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 250, maxNozzle: 300, maxBed: 110 },
  { id: 'creality-ender5-plus', brandId: 'creality', brand: 'Creality', name: 'Ender-5 Plus', series: 'Ender-5 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-ender5-pro', brandId: 'creality', brand: 'Creality', name: 'Ender-5 Pro / Ender-5', series: 'Ender-5 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-cr10-se', brandId: 'creality', brand: 'Creality', name: 'CR-10 SE', series: 'CR 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'creality-crm4', brandId: 'creality', brand: 'Creality', name: 'CR-M4', series: 'CR 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 160, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-cr10-smart-pro', brandId: 'creality', brand: 'Creality', name: 'CR-10 Smart Pro / Smart', series: 'CR 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 160, maxNozzle: 300, maxBed: 100 },
  { id: 'creality-cr10-pro', brandId: 'creality', brand: 'Creality', name: 'CR-10S Pro V2 / CR-10 V3 / CR-10', series: 'CR 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-cr6-se', brandId: 'creality', brand: 'Creality', name: 'CR-6 SE / CR-6 Max', series: 'CR 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'creality-cr30', brandId: 'creality', brand: 'Creality', name: 'CR-30 (3DPrintMill)', series: 'CR 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 240, maxBed: 100 },
  { id: 'creality-sermoon-d3-pro', brandId: 'creality', brand: 'Creality', name: 'Sermoon D3 Pro', series: 'Sermoon 系列', tier: 'industrial_heated', ams: false, maxSpeed: 300, maxNozzle: 300, maxBed: 110 },
  { id: 'creality-sermoon-d3', brandId: 'creality', brand: 'Creality', name: 'Sermoon D3', series: 'Sermoon 系列', tier: 'industrial_heated', ams: false, maxSpeed: 250, maxNozzle: 300, maxBed: 110 },
  { id: 'creality-sermoon-v1', brandId: 'creality', brand: 'Creality', name: 'Sermoon V1 Pro / V1', series: 'Sermoon 系列', tier: 'industrial_heated', ams: false, maxSpeed: 150, maxNozzle: 250, maxBed: 80 },

  // ==========================================================================
  // 3. Snapmaker 快造科技 (含最新 U1 四頭換刀機 / J1s / Artisan / 2.0)
  // ==========================================================================
  { id: 'snapmaker-u1', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker U1', series: 'U 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 110, notes: '四噴頭自動換刀 CoreXY，零沖刷塔浪費，完美支援多色與軟硬異質材料。' },
  { id: 'snapmaker-j1s', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker J1s', series: 'J 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 350, maxNozzle: 300, maxBed: 100, notes: 'IDEX 獨立雙噴頭高速機，支援鏡像、複製與雙料支撐列印。' },
  { id: 'snapmaker-j1', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker J1', series: 'J 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 350, maxNozzle: 300, maxBed: 100 },
  { id: 'snapmaker-artisan', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker Artisan', series: 'Artisan 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 250, maxNozzle: 300, maxBed: 110 },
  { id: 'snapmaker-2-a350t', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker 2.0 A350T / A250T / A150', series: '2.0 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 150, maxNozzle: 275, maxBed: 100 },
  { id: 'snapmaker-2-f350', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker 2.0 F350 / F250', series: '2.0 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 150, maxNozzle: 275, maxBed: 100 },
  { id: 'snapmaker-original', brandId: 'snapmaker', brand: 'Snapmaker', name: 'Snapmaker Original', series: '初代系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 100, maxNozzle: 250, maxBed: 80 },

  // ==========================================================================
  // 4. Anycubic 縱維立方 (Kobra S1 Max / S1 / X / 4 / 3 Max / 3 / 2 全系列)
  // ==========================================================================
  { id: 'anycubic-kobra-s1-max', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra S1 Max', series: 'Kobra S1 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120, notes: '350mm 大尺寸主動腔溫 CoreXY，支援 ACE 2 Pro 多色烘乾系統。' },
  { id: 'anycubic-kobra-s1', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra S1 / Kobra S1 Combo', series: 'Kobra S1 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'anycubic-kobra-x', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra X', series: 'Kobra X 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 110 },
  { id: 'anycubic-kobra-4', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 4', series: 'Kobra 4 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'anycubic-kobra-3-max', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 3 Max', series: 'Kobra 3 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'anycubic-kobra-3-v2', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 3 V2', series: 'Kobra 3 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'anycubic-kobra-3', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 3 (K3) / Kobra 3 Combo', series: 'Kobra 3 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'anycubic-kobra-2-max', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 2 Max', series: 'Kobra 2 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 260, maxBed: 110 },
  { id: 'anycubic-kobra-2-plus', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 2 Plus', series: 'Kobra 2 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 260, maxBed: 110 },
  { id: 'anycubic-kobra-2-pro', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 2 Pro', series: 'Kobra 2 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 260, maxBed: 110 },
  { id: 'anycubic-kobra-2', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 2', series: 'Kobra 2 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 300, maxNozzle: 260, maxBed: 110 },
  { id: 'anycubic-kobra-2-neo', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra 2 Neo', series: 'Kobra 2 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 250, maxNozzle: 260, maxBed: 110 },
  { id: 'anycubic-kobra-max-plus', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra Max / Kobra Plus', series: 'Kobra 初代系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },
  { id: 'anycubic-kobra-std', brandId: 'anycubic', brand: 'Anycubic', name: 'Kobra / Kobra Go / Kobra Neo', series: 'Kobra 初代系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },
  { id: 'anycubic-vyper', brandId: 'anycubic', brand: 'Anycubic', name: 'Anycubic Vyper', series: '經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },
  { id: 'anycubic-chiron', brandId: 'anycubic', brand: 'Anycubic', name: 'Anycubic Chiron', series: '經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 260, maxBed: 100 },
  { id: 'anycubic-vyper-mega', brandId: 'anycubic', brand: 'Anycubic', name: 'i3 Mega S / Mega X / Mega Pro / Zero', series: '經典系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 260, maxBed: 100 },
  { id: 'anycubic-predator', brandId: 'anycubic', brand: 'Anycubic', name: 'Anycubic Predator', series: 'Delta 系列', tier: 'delta_hs', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 5. QIDI 啟龐 (Plus 5 / Max 4 / Plus 4 / Q2 / Q2C / Q1 Pro / X-3 全系列)
  // ==========================================================================
  { id: 'qidi-plus-5', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Plus 5', series: 'Plus 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 370, maxBed: 120, notes: '370°C 噴頭搭配 65°C 主動恆溫腔體，支援多色與超高溫碳纖線材。' },
  { id: 'qidi-max-4', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Max 4', series: 'Max 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 800, maxNozzle: 370, maxBed: 120, notes: '390mm 超大尺寸主動腔溫旗艦 CoreXY。' },
  { id: 'qidi-plus-4', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Plus 4', series: 'Plus 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 370, maxBed: 120 },
  { id: 'qidi-q2', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Q2', series: 'Q 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'qidi-q2c', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Q2C', series: 'Q 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'qidi-q1-pro', brandId: 'qidi', brand: 'QIDI', name: 'QIDI Q1 Pro', series: 'Q 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'qidi-xmax-3', brandId: 'qidi', brand: 'QIDI', name: 'QIDI X-Max 3', series: 'X-3 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'qidi-xplus-3', brandId: 'qidi', brand: 'QIDI', name: 'QIDI X-Plus 3', series: 'X-3 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'qidi-xsmart-3', brandId: 'qidi', brand: 'QIDI', name: 'QIDI X-Smart 3', series: 'X-3 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 120 },
  { id: 'qidi-xcf-pro', brandId: 'qidi', brand: 'QIDI', name: 'QIDI X-CF Pro / i-Fast', series: '工程系列', tier: 'industrial_heated', ams: false, maxSpeed: 200, maxNozzle: 300, maxBed: 120 },
  { id: 'qidi-xmax-classic', brandId: 'qidi', brand: 'QIDI', name: 'QIDI X-Max / X-Plus / X-Pro', series: '經典系列', tier: 'industrial_heated', ams: false, maxSpeed: 150, maxNozzle: 300, maxBed: 110 },

  // ==========================================================================
  // 6. Elegoo 愛樂酷 (Centauri Carbon 2 / Centauri / OrangeStorm / Neptune 全系列)
  // ==========================================================================
  { id: 'elegoo-centauri-carbon-2', brandId: 'elegoo', brand: 'Elegoo', name: 'Centauri Carbon 2', series: 'Centauri 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 350, maxBed: 110, notes: '350°C 硬化鋼噴頭全封箱 CoreXY，支援 CANVAS 多色烘乾系統。' },
  { id: 'elegoo-centauri-carbon', brandId: 'elegoo', brand: 'Elegoo', name: 'Centauri Carbon', series: 'Centauri 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 320, maxBed: 110 },
  { id: 'elegoo-centauri', brandId: 'elegoo', brand: 'Elegoo', name: 'Centauri', series: 'Centauri 系列', tier: 'open_corexy_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'elegoo-orangestorm-giga', brandId: 'elegoo', brand: 'Elegoo', name: 'OrangeStorm Giga', series: '工業巨型系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 300, maxNozzle: 300, maxBed: 100 },
  { id: 'elegoo-neptune4-max', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 4 Max', series: 'Neptune 4 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'elegoo-neptune4-plus', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 4 Plus', series: 'Neptune 4 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'elegoo-neptune4-pro', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 4 Pro', series: 'Neptune 4 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'elegoo-neptune4', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 4', series: 'Neptune 4 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'elegoo-neptune3-max', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 3 Max', series: 'Neptune 3 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'elegoo-neptune3-plus', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 3 Plus', series: 'Neptune 3 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'elegoo-neptune3', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 3 Pro / Neptune 3', series: 'Neptune 3 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'elegoo-neptune2', brandId: 'elegoo', brand: 'Elegoo', name: 'Neptune 2S / Neptune 2 / Neptune X', series: 'Neptune 2 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 7. Infimech 無限機甲
  // ==========================================================================
  { id: 'infimech-mx-pro', brandId: 'infimech', brand: 'Infimech', name: 'Infimech MX Pro', series: 'MX 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 350, maxBed: 120 },
  { id: 'infimech-mx', brandId: 'infimech', brand: 'Infimech', name: 'Infimech MX', series: 'MX 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'infimech-tx-pro', brandId: 'infimech', brand: 'Infimech', name: 'Infimech TX Pro', series: 'TX 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 500, maxNozzle: 320, maxBed: 110 },
  { id: 'infimech-tx', brandId: 'infimech', brand: 'Infimech', name: 'Infimech TX', series: 'TX 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },

  // ==========================================================================
  // 8. Prusa Research
  // ==========================================================================
  { id: 'prusa-core-one-plus', brandId: 'prusa', brand: 'Prusa', name: 'Prusa CORE One+ / CORE One L+', series: 'CORE 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 120 },
  { id: 'prusa-core-one', brandId: 'prusa', brand: 'Prusa', name: 'Prusa CORE One', series: 'CORE 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 500, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-xl-multi', brandId: 'prusa', brand: 'Prusa', name: 'Original Prusa XL (多頭換刀)', series: 'XL 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 400, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-xl', brandId: 'prusa', brand: 'Prusa', name: 'Original Prusa XL (單頭)', series: 'XL 系列', tier: 'open_corexy_hs', ams: true, maxSpeed: 400, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-mk4s', brandId: 'prusa', brand: 'Prusa', name: 'Prusa MK4S', series: 'MK4 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 400, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-mk4', brandId: 'prusa', brand: 'Prusa', name: 'Prusa MK4', series: 'MK4 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 300, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-mk39', brandId: 'prusa', brand: 'Prusa', name: 'Prusa MK3.9 / MK3.5', series: 'MK3 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 280, maxNozzle: 290, maxBed: 120 },
  { id: 'prusa-mk3s', brandId: 'prusa', brand: 'Prusa', name: 'Prusa i3 MK3S+ / MK3S', series: 'MK3 系列', tier: 'bedslinger_direct_std', ams: true, maxSpeed: 160, maxNozzle: 280, maxBed: 100 },
  { id: 'prusa-mini', brandId: 'prusa', brand: 'Prusa', name: 'Prusa MINI+ / MINI', series: 'MINI 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 160, maxNozzle: 280, maxBed: 100 },
  { id: 'prusa-ht90', brandId: 'prusa', brand: 'Prusa', name: 'Prusa Pro HT90', series: 'Pro 系列', tier: 'delta_ultra', ams: false, maxSpeed: 600, maxNozzle: 500, maxBed: 150 },

  // ==========================================================================
  // 9. Flashforge 閃鑄
  // ==========================================================================
  { id: 'flashforge-ad5x', brandId: 'flashforge', brand: 'Flashforge', name: 'Flashforge AD5X', series: 'Adventurer 5M 系列', tier: 'open_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 300, maxBed: 110, notes: '支援智慧四色供料之高速 CoreXY。' },
  { id: 'flashforge-5m-pro', brandId: 'flashforge', brand: 'Flashforge', name: 'Adventurer 5M Pro', series: 'Adventurer 5M 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 280, maxBed: 110 },
  { id: 'flashforge-5m', brandId: 'flashforge', brand: 'Flashforge', name: 'Adventurer 5M', series: 'Adventurer 5M 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 280, maxBed: 110 },
  { id: 'flashforge-guider4', brandId: 'flashforge', brand: 'Flashforge', name: 'Guider 4 Pro / Guider 4', series: 'Guider 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 500, maxNozzle: 350, maxBed: 120 },
  { id: 'flashforge-guider3-ultra', brandId: 'flashforge', brand: 'Flashforge', name: 'Guider 3 Ultra', series: 'Guider 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 500, maxNozzle: 350, maxBed: 120 },
  { id: 'flashforge-guider3', brandId: 'flashforge', brand: 'Flashforge', name: 'Guider 3 Plus / Guider 3 / Guider 2S', series: 'Guider 系列', tier: 'industrial_heated', ams: false, maxSpeed: 300, maxNozzle: 320, maxBed: 120 },
  { id: 'flashforge-creator4', brandId: 'flashforge', brand: 'Flashforge', name: 'Creator 4', series: 'Creator 系列', tier: 'industrial_heated', ams: true, maxSpeed: 250, maxNozzle: 360, maxBed: 130 },
  { id: 'flashforge-creator-pro2', brandId: 'flashforge', brand: 'Flashforge', name: 'Creator Pro 2 / Creator 3 Pro', series: 'Creator 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 200, maxNozzle: 300, maxBed: 120 },
  { id: 'flashforge-adventurer4', brandId: 'flashforge', brand: 'Flashforge', name: 'Adventurer 4 Pro / Adventurer 4', series: 'Adventurer 系列', tier: 'industrial_heated', ams: false, maxSpeed: 250, maxNozzle: 265, maxBed: 110 },
  { id: 'flashforge-adventurer3', brandId: 'flashforge', brand: 'Flashforge', name: 'Adventurer 3 / Finder', series: 'Adventurer 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 100, maxNozzle: 240, maxBed: 100 },

  // ==========================================================================
  // 10. Sovol
  // ==========================================================================
  { id: 'sovol-sv08-max', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV08 Max', series: 'CoreXY 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 700, maxNozzle: 300, maxBed: 100, notes: '500mm 超大尺寸開源 CoreXY 高速機。' },
  { id: 'sovol-sv08', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV08', series: 'CoreXY 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 700, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-zero', brandId: 'sovol', brand: 'Sovol', name: 'Sovol Zero', series: 'CoreXY 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'sovol-m1d', brandId: 'sovol', brand: 'Sovol', name: 'Sovol M1D', series: 'CoreXY 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 110 },
  { id: 'sovol-sv06-plus-ace', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV06 Plus ACE', series: 'SV06 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv06-ace', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV06 ACE', series: 'SV06 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv07-plus', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV07 Plus', series: 'SV07 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv07', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV07', series: 'SV07 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv06-plus', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV06 Plus', series: 'SV06 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 200, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv06-sv07', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV06', series: 'SV06 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 200, maxNozzle: 300, maxBed: 100 },
  { id: 'sovol-sv04', brandId: 'sovol', brand: 'Sovol', name: 'Sovol SV04 (IDEX)', series: 'IDEX 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'sovol-t500', brandId: 'sovol', brand: 'Sovol', name: 'Sovol Comgrow T500', series: 'T 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 80 },
  { id: 'sovol-t300', brandId: 'sovol', brand: 'Sovol', name: 'Sovol Comgrow T300', series: 'T 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },

  // ==========================================================================
  // 11. Flsun 菲爾森
  // ==========================================================================
  { id: 'flsun-s1-pro', brandId: 'flsun', brand: 'Flsun', name: 'Flsun S1 Pro', series: 'S1 系列', tier: 'delta_ultra', ams: false, maxSpeed: 1200, maxNozzle: 350, maxBed: 120 },
  { id: 'flsun-s1-t1', brandId: 'flsun', brand: 'Flsun', name: 'Flsun S1', series: 'S1 系列', tier: 'delta_ultra', ams: false, maxSpeed: 1200, maxNozzle: 350, maxBed: 120 },
  { id: 'flsun-t1-max', brandId: 'flsun', brand: 'Flsun', name: 'Flsun T1 Max', series: 'T1 系列', tier: 'delta_ultra', ams: false, maxSpeed: 1000, maxNozzle: 300, maxBed: 110 },
  { id: 'flsun-t1-pro', brandId: 'flsun', brand: 'Flsun', name: 'Flsun T1 Pro', series: 'T1 系列', tier: 'delta_ultra', ams: false, maxSpeed: 1000, maxNozzle: 300, maxBed: 110 },
  { id: 'flsun-t1', brandId: 'flsun', brand: 'Flsun', name: 'Flsun T1', series: 'T1 系列', tier: 'delta_ultra', ams: false, maxSpeed: 1000, maxNozzle: 300, maxBed: 110 },
  { id: 'flsun-v400-sr', brandId: 'flsun', brand: 'Flsun', name: 'Flsun V400', series: 'V 系列', tier: 'delta_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'flsun-sr', brandId: 'flsun', brand: 'Flsun', name: 'Flsun Super Racer (SR)', series: 'SR 系列', tier: 'delta_hs', ams: false, maxSpeed: 200, maxNozzle: 260, maxBed: 100 },
  { id: 'flsun-qqs-pro', brandId: 'flsun', brand: 'Flsun', name: 'Flsun QQ-S Pro', series: 'Q 系列', tier: 'delta_hs', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },
  { id: 'flsun-q5', brandId: 'flsun', brand: 'Flsun', name: 'Flsun Q5', series: 'Q 系列', tier: 'delta_hs', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 12. Voron Design
  // ==========================================================================
  { id: 'voron-24', brandId: 'voron', brand: 'Voron', name: 'Voron 2.4 R2', series: 'Voron 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'voron-trident', brandId: 'voron', brand: 'Voron', name: 'Voron Trident', series: 'Voron 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'voron-v02', brandId: 'voron', brand: 'Voron', name: 'Voron V0.2 R1', series: 'Voron 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 120 },
  { id: 'voron-switchwire', brandId: 'voron', brand: 'Voron', name: 'Voron Switchwire', series: 'Voron 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 400, maxNozzle: 300, maxBed: 110 },
  { id: 'voron-micron', brandId: 'voron', brand: 'Voron', name: 'Voron Micron+', series: 'Voron 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'voron-legacy', brandId: 'voron', brand: 'Voron', name: 'Voron Legacy', series: 'Voron 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 350, maxNozzle: 300, maxBed: 110 },

  // ==========================================================================
  // 13. RatRig / Annex / VzBot
  // ==========================================================================
  { id: 'ratrig-vcore-4', brandId: 'ratrig_annex', brand: 'RatRig', name: 'RatRig V-Core 4 (CoreXY / IDEX)', series: 'V-Core 系列', tier: 'awd_extreme', ams: true, maxSpeed: 800, maxNozzle: 350, maxBed: 120 },
  { id: 'ratrig-vcore-31', brandId: 'ratrig_annex', brand: 'RatRig', name: 'RatRig V-Core 3.1', series: 'V-Core 系列', tier: 'flagship_heated_corexy', ams: false, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'ratrig-vminion', brandId: 'ratrig_annex', brand: 'RatRig', name: 'RatRig V-Minion', series: 'V-Minion 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 400, maxNozzle: 300, maxBed: 110 },
  { id: 'annex-k3-ratrig', brandId: 'ratrig_annex', brand: 'Annex', name: 'Annex K3', series: 'Annex 系列', tier: 'awd_extreme', ams: false, maxSpeed: 800, maxNozzle: 350, maxBed: 120 },
  { id: 'annex-k2', brandId: 'ratrig_annex', brand: 'Annex', name: 'Annex K2', series: 'Annex 系列', tier: 'awd_extreme', ams: false, maxSpeed: 700, maxNozzle: 350, maxBed: 120 },
  { id: 'vzbot-330', brandId: 'ratrig_annex', brand: 'VzBot', name: 'VzBot 330 AWD', series: 'VzBot 系列', tier: 'awd_extreme', ams: false, maxSpeed: 1000, maxNozzle: 350, maxBed: 120 },
  { id: 'vzbot-235', brandId: 'ratrig_annex', brand: 'VzBot', name: 'VzBot 235 AWD', series: 'VzBot 系列', tier: 'awd_extreme', ams: false, maxSpeed: 1000, maxNozzle: 350, maxBed: 120 },
  { id: 'hevort-custom', brandId: 'ratrig_annex', brand: 'HevORT', name: 'HevORT CoreXY', series: 'HevORT 系列', tier: 'awd_extreme', ams: false, maxSpeed: 800, maxNozzle: 350, maxBed: 120 },

  // ==========================================================================
  // 14. Phrozen 普羅森
  // ==========================================================================
  { id: 'phrozen-arco', brandId: 'phrozen', brand: 'Phrozen', name: 'Phrozen Arco', series: 'Arco 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },
  { id: 'phrozen-arco-chroma', brandId: 'phrozen', brand: 'Phrozen', name: 'Phrozen Arco (Chroma Kit)', series: 'Arco 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 120 },

  // ==========================================================================
  // 15. AnkerMake 安克
  // ==========================================================================
  { id: 'ankermake-m5', brandId: 'ankermake', brand: 'AnkerMake', name: 'AnkerMake M5', series: 'M5 系列', tier: 'bedslinger_hs', ams: true, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'ankermake-m5c', brandId: 'ankermake', brand: 'AnkerMake', name: 'AnkerMake M5C', series: 'M5 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },

  // ==========================================================================
  // 16. Artillery 砲兵
  // ==========================================================================
  { id: 'artillery-m1-pro', brandId: 'artillery', brand: 'Artillery', name: 'Artillery M1 Pro', series: 'M 系列', tier: 'enclosed_corexy_hs', ams: true, maxSpeed: 600, maxNozzle: 320, maxBed: 110 },
  { id: 'artillery-sw-x4-plus', brandId: 'artillery', brand: 'Artillery', name: 'Sidewinder X4 Plus', series: 'Sidewinder 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'artillery-sw-x4', brandId: 'artillery', brand: 'Artillery', name: 'Sidewinder X4 Pro', series: 'Sidewinder 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'artillery-sw-x3', brandId: 'artillery', brand: 'Artillery', name: 'Sidewinder X3 Plus / X3 Pro', series: 'Sidewinder 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 300, maxNozzle: 300, maxBed: 100 },
  { id: 'artillery-sw-x2', brandId: 'artillery', brand: 'Artillery', name: 'Sidewinder X2 / X1', series: 'Sidewinder 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 150, maxNozzle: 240, maxBed: 100 },
  { id: 'artillery-genius', brandId: 'artillery', brand: 'Artillery', name: 'Artillery Genius Pro / Hornet', series: 'Genius 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 150, maxNozzle: 240, maxBed: 100 },

  // ==========================================================================
  // 17. Kingroon 金格龍
  // ==========================================================================
  { id: 'kingroon-klp1', brandId: 'kingroon', brand: 'Kingroon', name: 'Kingroon KLP1', series: 'KLP 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'kingroon-kp3s-pro-v2', brandId: 'kingroon', brand: 'Kingroon', name: 'Kingroon KP3S Pro V2', series: 'KP3S 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 100 },
  { id: 'kingroon-kp3s', brandId: 'kingroon', brand: 'Kingroon', name: 'Kingroon KP3S Pro / KP3S', series: 'KP3S 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'kingroon-kp5l', brandId: 'kingroon', brand: 'Kingroon', name: 'Kingroon KP5L / KP5M', series: 'KP5 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 18. TwoTrees 兩棵樹
  // ==========================================================================
  { id: 'twotrees-sk1', brandId: 'twotrees', brand: 'TwoTrees', name: 'TwoTrees SK1', series: 'SK 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 700, maxNozzle: 300, maxBed: 100 },
  { id: 'twotrees-sp5-v3', brandId: 'twotrees', brand: 'TwoTrees', name: 'TwoTrees SP-5 V3 / SP-5', series: 'SP 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 350, maxNozzle: 300, maxBed: 100 },
  { id: 'twotrees-sapphire', brandId: 'twotrees', brand: 'TwoTrees', name: 'Sapphire Plus / Sapphire Pro', series: 'Sapphire 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 250, maxNozzle: 260, maxBed: 100 },
  { id: 'twotrees-bluer', brandId: 'twotrees', brand: 'TwoTrees', name: 'TwoTrees Bluer Plus / Bluer', series: 'Bluer 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 120, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 19. FlyingBear 飛熊
  // ==========================================================================
  { id: 'flyingbear-s1', brandId: 'flyingbear', brand: 'FlyingBear', name: 'FlyingBear S1', series: 'S1 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 600, maxNozzle: 300, maxBed: 110 },
  { id: 'flyingbear-ghost6', brandId: 'flyingbear', brand: 'FlyingBear', name: 'FlyingBear Ghost 6', series: 'Ghost 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 250, maxNozzle: 260, maxBed: 110 },
  { id: 'flyingbear-ghost5', brandId: 'flyingbear', brand: 'FlyingBear', name: 'FlyingBear Ghost 5', series: 'Ghost 系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },
  { id: 'flyingbear-reborn2', brandId: 'flyingbear', brand: 'FlyingBear', name: 'FlyingBear Reborn 2 / Reborn', series: 'Reborn 系列', tier: 'enclosed_corexy_hs', ams: false, maxSpeed: 300, maxNozzle: 260, maxBed: 110 },

  // ==========================================================================
  // 20. BIQU 必趣 / Mingda 銘達 / Geeetech / Tronxy
  // ==========================================================================
  { id: 'biqu-hurakan', brandId: 'biqu_mingda', brand: 'BIQU', name: 'BIQU Hurakan', series: 'BIQU 系列', tier: 'bedslinger_hs', ams: false, maxSpeed: 400, maxNozzle: 260, maxBed: 100 },
  { id: 'biqu-bx', brandId: 'biqu_mingda', brand: 'BIQU', name: 'BIQU BX / B1', series: 'BIQU 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },
  { id: 'mingda-magician-x2', brandId: 'biqu_mingda', brand: 'Mingda', name: 'Mingda Magician X2 / Max / Pro', series: 'Magician 系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 200, maxNozzle: 260, maxBed: 110 },
  { id: 'mingda-md400d', brandId: 'biqu_mingda', brand: 'Mingda', name: 'Mingda MD-400D / MD-600D', series: '工業 IDEX 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 300, maxNozzle: 350, maxBed: 110 },
  { id: 'geeetech-thunder', brandId: 'biqu_mingda', brand: 'Geeetech', name: 'Geeetech Thunder / Mizar S / A10M / A20M', series: 'Geeetech 系列', tier: 'bedslinger_bowden', ams: true, maxSpeed: 250, maxNozzle: 250, maxBed: 100 },
  { id: 'tronxy-x5sa', brandId: 'biqu_mingda', brand: 'Tronxy', name: 'Tronxy X5SA Pro / X5SA 400 / Veho 600', series: 'Tronxy 系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 300, maxNozzle: 275, maxBed: 100 },
  { id: 'kywoo-longer', brandId: 'biqu_mingda', brand: 'Kywoo / Longer', name: 'Kywoo Tycoon / Longer LK5 Pro / LK4 Pro', series: '其他品牌系列', tier: 'bedslinger_direct_std', ams: false, maxSpeed: 180, maxNozzle: 260, maxBed: 100 },

  // ==========================================================================
  // 21. Raise3D / UltiMaker / BCN3D / 自組機
  // ==========================================================================
  { id: 'raise3d-pro3', brandId: 'industrial_custom', brand: 'Raise3D', name: 'Raise3D Pro3 HS / Pro3 / Pro3 Plus', series: 'Pro 系列', tier: 'industrial_heated', ams: true, maxSpeed: 350, maxNozzle: 300, maxBed: 120 },
  { id: 'raise3d-e2cf', brandId: 'industrial_custom', brand: 'Raise3D', name: 'Raise3D E2CF / E2', series: 'E 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 250, maxNozzle: 300, maxBed: 110 },
  { id: 'ultimaker-factor4', brandId: 'industrial_custom', brand: 'UltiMaker', name: 'UltiMaker Factor 4', series: 'Factor 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 350, maxNozzle: 340, maxBed: 120 },
  { id: 'raise3d-ultimaker', brandId: 'industrial_custom', brand: 'UltiMaker', name: 'UltiMaker S7 / S5 / S3', series: 'S 系列', tier: 'industrial_heated', ams: true, maxSpeed: 300, maxNozzle: 280, maxBed: 140 },
  { id: 'ultimaker-method-xl', brandId: 'industrial_custom', brand: 'UltiMaker', name: 'UltiMaker Method XL / Method X', series: 'Method 系列', tier: 'flagship_heated_corexy', ams: true, maxSpeed: 300, maxNozzle: 300, maxBed: 110 },
  { id: 'bcn3d-epsilon', brandId: 'industrial_custom', brand: 'BCN3D', name: 'BCN3D Epsilon W50 / W27 / Sigma D25', series: 'IDEX 系列', tier: 'idex_toolchanger', ams: true, maxSpeed: 250, maxNozzle: 300, maxBed: 120 },
  { id: 'zortrax-m300', brandId: 'industrial_custom', brand: 'Zortrax', name: 'Zortrax M300 Dual / M200 Plus', series: 'M 系列', tier: 'industrial_heated', ams: false, maxSpeed: 200, maxNozzle: 290, maxBed: 105 },
  { id: 'generic-klipper-direct', brandId: 'industrial_custom', brand: '自組機', name: '自組 Klipper 近程直驅機', series: '自組系列', tier: 'open_corexy_hs', ams: false, maxSpeed: 500, maxNozzle: 300, maxBed: 110 },
  { id: 'generic-direct-i3', brandId: 'industrial_custom', brand: '自組機', name: '自組 Marlin 遠程 Bowden / 標準機', series: '自組系列', tier: 'bedslinger_bowden', ams: false, maxSpeed: 150, maxNozzle: 260, maxBed: 100 },
];

export const PRINTER_PROFILES: PrinterProfile[] = SEEDS.map(buildProfile);

export function getPrintersByBrand(brandId: string): PrinterProfile[] {
  if (!brandId || brandId === 'all') return PRINTER_PROFILES;
  return PRINTER_PROFILES.filter((p) => p.brandId === brandId);
}

export function findPrinterProfile(queryOrId?: string): PrinterProfile {
  const defaultPrinter = PRINTER_PROFILES.find((p) => p.id === 'bambu-x1c') || PRINTER_PROFILES[0];
  if (!queryOrId) return defaultPrinter;
  const q = queryOrId.toLowerCase().trim();

  const byId = PRINTER_PROFILES.find((p) => p.id.toLowerCase() === q);
  if (byId) return byId;

  const byExactName = PRINTER_PROFILES.find((p) => p.name.toLowerCase() === q);
  if (byExactName) return byExactName;

  const byName = PRINTER_PROFILES.find(
    (p) => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase())
  );
  if (byName) return byName;

  if (q.includes('u1')) return PRINTER_PROFILES.find((p) => p.id === 'snapmaker-u1') || defaultPrinter;
  if (q.includes('h2c')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-h2c') || defaultPrinter;
  if (q.includes('h2s')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-h2s') || defaultPrinter;
  if (q.includes('h2d')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-h2d') || defaultPrinter;
  if (q.includes('h3c')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-h3c') || defaultPrinter;
  if (q.includes('p2s')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-p2s') || defaultPrinter;
  if (q.includes('a1l') || q.includes('a2l')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-a1l') || defaultPrinter;
  if (q.includes('sparkx') || q.includes('i8')) return PRINTER_PROFILES.find((p) => p.id === 'creality-sparkx-i8') || defaultPrinter;
  if (q.includes('i7')) return PRINTER_PROFILES.find((p) => p.id === 'creality-sparkx-i7') || defaultPrinter;
  if (q.includes('infimech') || q.includes('mx pro')) return PRINTER_PROFILES.find((p) => p.id === 'infimech-mx-pro') || defaultPrinter;
  if (q.includes('x1e')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-x1e') || defaultPrinter;
  if (q.includes('x1')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-x1c') || defaultPrinter;
  if (q.includes('p1s')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-p1s') || defaultPrinter;
  if (q.includes('p1p')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-p1p') || defaultPrinter;
  if (q.includes('a1 mini')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-a1-mini') || defaultPrinter;
  if (q.includes('a1')) return PRINTER_PROFILES.find((p) => p.id === 'bambu-a1') || defaultPrinter;
  if (q.includes('kobra 3') || q.includes('kobra k3')) return PRINTER_PROFILES.find((p) => p.id === 'anycubic-kobra-3') || defaultPrinter;
  if (q.includes('kobra s1')) return PRINTER_PROFILES.find((p) => p.id === 'anycubic-kobra-s1') || defaultPrinter;
  if (q.includes('annex')) return PRINTER_PROFILES.find((p) => p.id === 'annex-k3-ratrig') || defaultPrinter;
  if (q.includes('k3')) return PRINTER_PROFILES.find((p) => p.id === 'creality-k3') || defaultPrinter;
  if (q.includes('k2')) return PRINTER_PROFILES.find((p) => p.id === 'creality-k2-plus') || defaultPrinter;
  if (q.includes('k1c')) return PRINTER_PROFILES.find((p) => p.id === 'creality-k1c') || defaultPrinter;
  if (q.includes('k1 max')) return PRINTER_PROFILES.find((p) => p.id === 'creality-k1-max') || defaultPrinter;
  if (q.includes('k1')) return PRINTER_PROFILES.find((p) => p.id === 'creality-k1') || defaultPrinter;
  if (q.includes('plus 5') || q.includes('plus5')) return PRINTER_PROFILES.find((p) => p.id === 'qidi-plus-5') || defaultPrinter;
  if (q.includes('max 4') || q.includes('max4')) return PRINTER_PROFILES.find((p) => p.id === 'qidi-max-4') || defaultPrinter;
  if (q.includes('plus 4') || q.includes('plus4')) return PRINTER_PROFILES.find((p) => p.id === 'qidi-plus-4') || defaultPrinter;
  if (q.includes('q1')) return PRINTER_PROFILES.find((p) => p.id === 'qidi-q1-pro') || defaultPrinter;
  if (q.includes('voron')) return PRINTER_PROFILES.find((p) => p.id === 'voron-24') || defaultPrinter;
  if (q.includes('sv08')) return PRINTER_PROFILES.find((p) => p.id === 'sovol-sv08') || defaultPrinter;
  if (q.includes('5m')) return PRINTER_PROFILES.find((p) => p.id === 'flashforge-5m-pro') || defaultPrinter;
  if (q.includes('centauri')) return PRINTER_PROFILES.find((p) => p.id === 'elegoo-centauri-carbon') || defaultPrinter;
  if (q.includes('neptune 4')) return PRINTER_PROFILES.find((p) => p.id === 'elegoo-neptune4-pro') || defaultPrinter;
  if (q.includes('ender-3 v2') || q.includes('ender 3 v2')) return PRINTER_PROFILES.find((p) => p.id === 'creality-ender3-v2') || defaultPrinter;
  if (q.includes('ender-3 s1') || q.includes('ender 3 s1')) return PRINTER_PROFILES.find((p) => p.id === 'creality-ender3-s1') || defaultPrinter;
  if (q.includes('ender-3 v3') || q.includes('ender 3 v3')) return PRINTER_PROFILES.find((p) => p.id === 'creality-ender3-v3') || defaultPrinter;
  if (q.includes('ender')) return PRINTER_PROFILES.find((p) => p.id === 'creality-ender3-classic') || defaultPrinter;

  return defaultPrinter;
}
