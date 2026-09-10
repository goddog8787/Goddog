export interface PrinterProfile {
  id: string;
  brand: string;
  name: string;
  series: string;
  type: 'CoreXY' | 'BedSlinger' | 'IDEX' | '3-in-1' | 'Resin';
  enclosure: 'full' | 'open' | 'optional';
  extruder: 'direct' | 'bowden' | 'dual-direct' | 'idex';
  maxSpeedMmS: number;
  maxNozzleTemp: number;
  maxBedTemp: number;
  multiColorSupport: string;
  recommendedRetraction: {
    pla: string;
    petg: string;
    abs: string;
    cf: string;
    tpu: string;
  };
  specialNotes: string;
}

export const PRINTER_BRANDS = [
  { id: 'bambu', name: '拓竹 (Bambu Lab)', icon: '🎋' },
  { id: 'creality', name: '創想三維 (Creality)', icon: '🚀' },
  { id: 'flashforge', name: '閃鑄科技 (Flashforge)', icon: '⚡' },
  { id: 'snapmaker', name: '快造科技 (Snapmaker)', icon: '🛠️' },
  { id: 'anycubic', name: '縱維立方 (Anycubic)', icon: '🧊' },
  { id: 'elegoo', name: '愛樂酷 (Elegoo)', icon: '🪐' },
  { id: 'prusa', name: 'Prusa Research', icon: '🟠' },
  { id: 'voron', name: 'Voron & 開源 DIY 高速機', icon: '⚙️' },
  { id: 'qidi', name: 'QIDI Tech (啟龐科技)', icon: '🔥' },
];

export const PRINTER_PROFILES: PrinterProfile[] = [
  // 拓竹 Bambu Lab
  {
    id: 'bambu-x1c',
    brand: 'Bambu Lab',
    series: 'X1 系列',
    name: 'Bambu Lab X1-Carbon / X1E',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: 'AMS 支援 (最多 16 色)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s',
      cf: '0.8mm @ 30mm/s',
      tpu: '0.6mm @ 25mm/s (不可入 AMS)',
    },
    specialNotes: '標配硬化鋼噴嘴與雙金屬喉管，印 CF/GF 無需改裝。印 PLA/PETG 建議上蓋開微縫防喉管熱爬升。'
  },
  {
    id: 'bambu-p1s',
    brand: 'Bambu Lab',
    series: 'P系列',
    name: 'Bambu Lab P1S',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'AMS 支援 (最多 16 色)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s',
      cf: '0.8mm @ 30mm/s (需升級硬化鋼噴嘴)',
      tpu: '0.6mm @ 25mm/s (外掛走料)',
    },
    specialNotes: '原廠標配不銹鋼噴嘴，若列印 PLA-CF 建議選購原廠 0.4mm 硬化鋼噴嘴齒輪組。'
  },
  {
    id: 'bambu-p1p',
    brand: 'Bambu Lab',
    series: 'P系列',
    name: 'Bambu Lab P1P',
    type: 'CoreXY',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'AMS 支援',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '不建議 (開放式易翹曲，需自行列印外殼封箱)',
      cf: '0.8mm @ 30mm/s (需硬化鋼噴嘴)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '開放式機身印 PLA/PETG/TPU 散熱極佳，若欲列印 ABS/ASA 需加裝官方或開源封箱 Mod。'
  },
  {
    id: 'bambu-a1',
    brand: 'Bambu Lab',
    series: 'A1 系列',
    name: 'Bambu Lab A1 (全尺寸床動)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'AMS lite 支援 (4 色)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '不推薦 (開放式床動機印 ABS 翹曲嚴重)',
      cf: '0.8mm @ 30mm/s (需快拆硬化鋼噴嘴)',
      tpu: '0.8mm @ 20mm/s (外掛直供)',
    },
    specialNotes: '快拆式熱端更換僅需數秒；全自動主動流量補償，第一層平整度極佳。'
  },
  {
    id: 'bambu-a1-mini',
    brand: 'Bambu Lab',
    series: 'A1 系列',
    name: 'Bambu Lab A1 mini (微型床動)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 80,
    multiColorSupport: 'AMS lite 支援 (4 色)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '不支援 (熱床上限 80°C 且無封箱)',
      cf: '0.8mm @ 30mm/s (需更換硬化鋼)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: '180x180x180mm 緊湊成型尺寸，桌面超靜音，印 PLA/PETG 極品神器。'
  },

  // 創想三維 Creality
  {
    id: 'creality-k1c-max',
    brand: 'Creality',
    series: 'K1 高速系列',
    name: 'Creality K1C / K1 Max',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'Creality CFS (K2 體系)',
    recommendedRetraction: {
      pla: '0.75mm @ 35mm/s',
      petg: '0.9mm @ 30mm/s',
      abs: '0.75mm @ 35mm/s',
      cf: '0.75mm @ 35mm/s (標配一體式獨角獸抗磨噴嘴)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: 'K1C 標配 Unicorn 鋼頭全金屬喉管，原廠即針對 PLA-CF/PETG-CF 抗磨耗耐熱優化。'
  },
  {
    id: 'creality-k1-se',
    brand: 'Creality',
    series: 'K1 高速系列',
    name: 'Creality K1 / K1 SE',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: '單色 / 外掛多色',
    recommendedRetraction: {
      pla: '0.75mm @ 35mm/s',
      petg: '0.9mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s',
      cf: '0.8mm @ 30mm/s (需換裝硬化鋼)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '雙齒輪近端直驅，列印速度高達 600mm/s，印 PLA 建議開啟側邊輔助強冷風扇。'
  },
  {
    id: 'creality-ender-3-v3',
    brand: 'Creality',
    series: 'Ender 系列',
    name: 'Creality Ender-3 V3 / V3 Plus (CoreXZ)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '不推薦 (需另購專用保溫罩)',
      cf: '0.8mm @ 35mm/s (需硬化噴嘴)',
      tpu: '0.8mm @ 25mm/s',
    },
    specialNotes: '全新 CoreXZ 結構，Z軸雙無刷伺服馬達驅動，床動機種 600mm/s 顛覆之作。'
  },
  {
    id: 'creality-ender-3-v3-ke',
    brand: 'Creality',
    series: 'Ender 系列',
    name: 'Creality Ender-3 V3 KE / SE',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.2mm @ 35mm/s',
      abs: '不推薦 (開放式易開裂)',
      cf: '0.8mm @ 30mm/s (需升級硬化鋼)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: 'KE 搭載 Creality OS (Klipper 底層)，自帶共振補償與壓頻傳感器，性價比極高。'
  },
  {
    id: 'creality-cr-10-se',
    brand: 'Creality',
    series: 'CR 系列',
    name: 'Creality CR-10 SE / CR-M4 (大尺寸)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '需大型保溫箱',
      cf: '0.8mm @ 35mm/s',
      tpu: '1.0mm @ 25mm/s',
    },
    specialNotes: '全金屬線軌導軌與精準自動調平，CR-M4 具備 450x450x470mm 巨大成型空間。'
  },

  // 閃鑄科技 Flashforge
  {
    id: 'flashforge-adv-5m-pro',
    brand: 'Flashforge',
    series: 'Adventurer 系列',
    name: 'Flashforge Adventurer 5M Pro (全封箱)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 280,
    maxBedTemp: 110,
    multiColorSupport: '單色 (外掛進料)',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '0.8mm @ 35mm/s (內循環濾清超強)',
      cf: '0.8mm @ 30mm/s (原廠選配 0.6mm 抗磨快拆噴嘴)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '內外雙重活性碳+HEPA濾網，室內列印 ABS 無異味；3秒快拆噴嘴，一鍵全自動水平。'
  },
  {
    id: 'flashforge-adv-5m',
    brand: 'Flashforge',
    series: 'Adventurer 系列',
    name: 'Flashforge Adventurer 5M (開放式)',
    type: 'CoreXY',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 280,
    maxBedTemp: 110,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '需官方 DIY 封箱外殼升級包',
      cf: '0.8mm @ 30mm/s (需選配耐磨噴嘴)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '高剛性 CoreXY 骨架，加速度高達 20,000mm/s²，列印高速 PLA/PETG 極致平整。'
  },
  {
    id: 'flashforge-guider-creator',
    brand: 'Flashforge',
    series: '工業系列',
    name: 'Flashforge Guider 3 Plus / Creator 4',
    type: 'IDEX',
    enclosure: 'full',
    extruder: 'idex',
    maxSpeedMmS: 250,
    maxNozzleTemp: 320,
    maxBedTemp: 130,
    multiColorSupport: 'IDEX 獨立雙噴頭 (雙色/水溶水解支撐/鏡像)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s (腔體主動保溫)',
      cf: '0.8mm @ 30mm/s',
      tpu: '0.6mm @ 20mm/s',
    },
    specialNotes: '工業級全封閉控溫艙，支援 PC、PA-CF、碳纖維複合料與 PVA 水溶支撐完美搭配。'
  },

  // 快造科技 Snapmaker
  {
    id: 'snapmaker-artisan',
    brand: 'Snapmaker',
    series: '三合一旗艦',
    name: 'Snapmaker Artisan (3-in-1 工業級三合一)',
    type: '3-in-1',
    enclosure: 'optional',
    extruder: 'dual-direct',
    maxSpeedMmS: 250,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: '雙噴頭雙材料 (Dual Extruder)',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s (需加裝原廠保溫罩 Enclosure)',
      cf: '0.8mm @ 30mm/s (選配硬化鋼模組)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: '工業級全鋼直線模組與分區加熱床，雙噴頭支援 PLA 主體 + Breakaway 支撐或可溶支撐。'
  },
  {
    id: 'snapmaker-j1',
    brand: 'Snapmaker',
    series: 'J1 系列',
    name: 'Snapmaker J1 / J1s (高速 IDEX 獨立雙頭)',
    type: 'IDEX',
    enclosure: 'full',
    extruder: 'idex',
    maxSpeedMmS: 350,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'IDEX 獨立雙噴頭 (雙色/鏡像/備援/支撐)',
    recommendedRetraction: {
      pla: '0.6mm @ 35mm/s',
      petg: '0.8mm @ 30mm/s',
      abs: '0.6mm @ 35mm/s (全封閉機身效果佳)',
      cf: '0.6mm @ 30mm/s (標配/選配耐磨頭)',
      tpu: '0.5mm @ 20mm/s',
    },
    specialNotes: '雙獨立噴頭無滲漏防刮傷；鏡像模式 (Mirror) 與複製模式可同時列印 2 件，生產力翻倍。'
  },
  {
    id: 'snapmaker-2-0',
    brand: 'Snapmaker',
    series: '2.0 系列',
    name: 'Snapmaker 2.0 A350T / A250T',
    type: '3-in-1',
    enclosure: 'optional',
    extruder: 'direct',
    maxSpeedMmS: 120,
    maxNozzleTemp: 275,
    maxBedTemp: 100,
    multiColorSupport: '單色 / 雙噴頭模組',
    recommendedRetraction: {
      pla: '0.8mm @ 30mm/s',
      petg: '1.2mm @ 25mm/s',
      abs: '需加裝壓克力保溫罩',
      cf: '0.8mm @ 25mm/s',
      tpu: '0.8mm @ 18mm/s',
    },
    specialNotes: '全鋁合金模組化機身，升級降噪靜音驅動晶片，列印穩定扎實。'
  },

  // 縱維立方 Anycubic
  {
    id: 'anycubic-kobra-3',
    brand: 'Anycubic',
    series: 'Kobra 系列',
    name: 'Anycubic Kobra 3 Combo (多色烘乾)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 100,
    multiColorSupport: 'Anycubic Color Engine Pro (ACE Pro 4色烘乾系統)',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '不推薦 (開放床動)',
      cf: '0.8mm @ 35mm/s',
      tpu: '0.8mm @ 25mm/s (外掛直供)',
    },
    specialNotes: 'ACE Pro 配備熱風循環主動烘乾功能，邊烘乾邊列印，徹底解決 PETG 與多色受潮拉絲痛點。'
  },
  {
    id: 'anycubic-kobra-2',
    brand: 'Anycubic',
    series: 'Kobra 系列',
    name: 'Anycubic Kobra 2 Pro / Plus / Max',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 260,
    maxBedTemp: 90,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '不推薦 (無封箱易開裂)',
      cf: '0.8mm @ 30mm/s (需更換硬化鋼)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: 'LeviQ 2.0 自動調平系統，雙金屬軸心雙軸心滾輪，500mm/s 狂暴推力。'
  },
  {
    id: 'anycubic-photon',
    brand: 'Anycubic',
    series: 'Photon 光固化',
    name: 'Anycubic Photon Mono M5s / M7 Pro (光固化 LCD)',
    type: 'Resin',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 0,
    maxNozzleTemp: 0,
    maxBedTemp: 0,
    multiColorSupport: '單色光敏樹脂',
    recommendedRetraction: {
      pla: 'N/A (光固化技術)',
      petg: 'N/A',
      abs: 'N/A (請選擇 ABS-like 類ABS高韌樹脂)',
      cf: 'N/A',
      tpu: 'N/A (請選擇彈性類橡膠樹脂)',
    },
    specialNotes: '10K / 14K 極致解析度，免手動調平與自動離型檢測，適合微縮模型手辦珠寶。'
  },

  // 愛樂酷 Elegoo
  {
    id: 'elegoo-centauri',
    brand: 'Elegoo',
    series: 'Centauri 系列',
    name: 'Elegoo Centauri Carbon (高速封箱 CoreXY)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: '多色擴展支援',
    recommendedRetraction: {
      pla: '0.75mm @ 35mm/s',
      petg: '0.9mm @ 30mm/s',
      abs: '0.75mm @ 35mm/s (封閉控溫)',
      cf: '0.75mm @ 30mm/s (標配硬化鋼)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '全鋁合金一體壓鑄 CoreXY 機架，標配硬化鋼耐磨噴嘴與內部保溫，完美支援工程碳纖維材料。'
  },
  {
    id: 'elegoo-neptune-4',
    brand: 'Elegoo',
    series: 'Neptune 系列',
    name: 'Elegoo Neptune 4 Pro / Plus / Max (Klipper)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.8mm @ 40mm/s',
      petg: '1.0mm @ 35mm/s',
      abs: '需加裝防風保溫罩',
      cf: '0.8mm @ 30mm/s (需更換硬化鋼)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: '雙齒輪近端擠出機，背部搭載獨立橫流冷卻風扇組，分區智能加熱熱床，橋接能力出眾。'
  },

  // Prusa Research
  {
    id: 'prusa-mk4s',
    brand: 'Prusa',
    series: 'MK 系列',
    name: 'Prusa MK4S / MK4',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'direct',
    maxSpeedMmS: 250,
    maxNozzleTemp: 300,
    maxBedTemp: 120,
    multiColorSupport: 'MMU3 (最多 5 色切換)',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '需 Prusa Enclosure 保溫箱',
      cf: '0.8mm @ 30mm/s (需換裝 Prusa Nozzle Hardened)',
      tpu: '0.8mm @ 20mm/s',
    },
    specialNotes: 'Nextruder 壓力應變感應全自動絕對平整首層；MK4S 全新 360° 導風罩，細節公差無可挑剔。'
  },
  {
    id: 'prusa-core-one',
    brand: 'Prusa',
    series: 'Core 系列',
    name: 'Prusa Core One (全封閉主動腔溫 CoreXY)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 300,
    maxBedTemp: 120,
    multiColorSupport: '支援 MMU3 多色',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s (高達 60°C 主動腔體溫度控制)',
      cf: '0.8mm @ 30mm/s',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: 'Prusa 最新世代旗艦全封閉 CoreXY，配備主動腔溫加熱控制 (高達 60°C)，印 ABS/PC/PA 零翹邊。'
  },
  {
    id: 'prusa-xl',
    brand: 'Prusa',
    series: 'XL 系列',
    name: 'Prusa XL (獨立換刀 1~5 工具頭)',
    type: 'CoreXY',
    enclosure: 'optional',
    extruder: 'direct',
    maxSpeedMmS: 300,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: 'Toolchanger 獨立換刀 (零廢料多色多材料)',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '需加裝 Enclosure 上蓋封箱',
      cf: '0.8mm @ 30mm/s',
      tpu: '0.8mm @ 25mm/s',
    },
    specialNotes: '真・獨立工具頭換刀系統，多色/多材質切換無需吐廢料塔 (No Purge Tower)，大幅節省 90% 廢料。'
  },

  // Voron & 開源 DIY 高速機
  {
    id: 'voron-2-4',
    brand: 'Voron',
    series: 'Voron 系列',
    name: 'Voron 2.4 350 / 300 (四飛天 CoreXY)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 350,
    maxBedTemp: 120,
    multiColorSupport: 'ERCF / Happy Hare 兔兔多色',
    recommendedRetraction: {
      pla: '0.5mm @ 35mm/s',
      petg: '0.7mm @ 30mm/s',
      abs: '0.5mm @ 35mm/s (原生 ABS 設計，腔溫 50-60°C)',
      cf: '0.5mm @ 35mm/s',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '四點獨立 Z 軸自動調平 (QGL)，密封腔體吸熱後自然形成 50°C+ 恒溫，列印工程塑料的王者。'
  },
  {
    id: 'voron-trident',
    brand: 'Voron',
    series: 'Voron 系列',
    name: 'Voron Trident (三絲桿動床 CoreXY)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 500,
    maxNozzleTemp: 350,
    maxBedTemp: 120,
    multiColorSupport: 'ERCF 多色',
    recommendedRetraction: {
      pla: '0.5mm @ 35mm/s',
      petg: '0.7mm @ 30mm/s',
      abs: '0.5mm @ 35mm/s',
      cf: '0.5mm @ 35mm/s',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '三點絲桿動床結構，結構剛性超群，調平迅速，維護簡單。'
  },
  {
    id: 'voron-v0-2',
    brand: 'Voron',
    series: 'Voron 系列',
    name: 'Voron V0.2 (120mm 微型封閉小鋼砲)',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 300,
    maxBedTemp: 110,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '0.4mm @ 40mm/s',
      petg: '0.6mm @ 35mm/s',
      abs: '0.4mm @ 40mm/s',
      cf: '0.5mm @ 35mm/s',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '120x120x120mm 超小成型尺寸，輕量化極限工具頭，加速度高達 25,000 mm/s²。'
  },

  // QIDI Tech (啟龐科技)
  {
    id: 'qidi-x-max-3',
    brand: 'QIDI Tech',
    series: 'X-3 工業系列',
    name: 'QIDI Tech X-Max 3 / X-Plus 3',
    type: 'CoreXY',
    enclosure: 'full',
    extruder: 'direct',
    maxSpeedMmS: 600,
    maxNozzleTemp: 350,
    maxBedTemp: 120,
    multiColorSupport: '單色 / 外掛多色',
    recommendedRetraction: {
      pla: '0.8mm @ 35mm/s',
      petg: '1.0mm @ 30mm/s',
      abs: '0.8mm @ 35mm/s (主動 65°C 腔體加熱)',
      cf: '0.8mm @ 30mm/s (標配銅合金耐磨硬化噴嘴)',
      tpu: '0.6mm @ 25mm/s',
    },
    specialNotes: '內建 65°C 主動腔體加熱器與 350°C 高溫金屬熱端，完美征服超厚工程件與碳纖維材料。'
  },

  // 開源通用機種
  {
    id: 'generic-i3',
    brand: '通用機型',
    series: '傳統改裝',
    name: '標準開源 i3 架構 (Ender-3 傳統改裝 / 遠端擠出)',
    type: 'BedSlinger',
    enclosure: 'open',
    extruder: 'bowden',
    maxSpeedMmS: 100,
    maxNozzleTemp: 260,
    maxBedTemp: 85,
    multiColorSupport: '單色',
    recommendedRetraction: {
      pla: '4.5mm - 6.0mm @ 45mm/s (遠端特氟龍管)',
      petg: '5.0mm - 6.5mm @ 40mm/s',
      abs: '不推薦 (無保溫易脫層)',
      cf: '需加裝全金屬雙齒輪與硬化鋼噴嘴',
      tpu: '不推薦 (遠端軟管極易卡料擠彎)',
    },
    specialNotes: '經典遠端特氟龍進料機種，回抽需設定 4.5~6mm 以免嚴重牽絲；建議列印 PLA 與 PETG。'
  }
];

// Helper to get profile by ID or partial match
export function findPrinterProfile(queryOrId: string): PrinterProfile {
  const normalized = queryOrId.toLowerCase();
  const directMatch = PRINTER_PROFILES.find(p => p.id === queryOrId);
  if (directMatch) return directMatch;

  const nameMatch = PRINTER_PROFILES.find(p => 
    normalized.includes(p.name.toLowerCase()) || 
    p.name.toLowerCase().includes(normalized) ||
    normalized.includes(p.id.toLowerCase())
  );
  if (nameMatch) return nameMatch;

  // Defaults to Bambu X1C
  return PRINTER_PROFILES[0];
}
