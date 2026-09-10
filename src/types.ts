export type MaterialType = 
  | 'High-Speed PLA'
  | 'PLA'
  | 'PLA Matte'
  | 'PLA Silk'
  | 'PLA-CF'
  | 'Carbon Fiber'
  | 'PLA Wood'
  | 'PLA Glow'
  | 'LW-PLA'
  | 'PETG'
  | 'PETG-CF'
  | 'PETG Translucent'
  | 'PETG-ESD'
  | 'ABS'
  | 'ABS-GF'
  | 'ASA'
  | 'PC-ABS'
  | 'TPU'
  | 'TPU 85A'
  | 'TPU 64D'
  | 'PA-CF'
  | 'PA12-CF'
  | 'PA-GF'
  | 'Nylon (PA)'
  | 'PC (Polycarbonate)'
  | 'PP (Polypropylene)'
  | 'Support (PVA/HIPS)'
  | 'PEEK/PEI (Ultem)'
  | 'Resin'
  | 'Accessories'
  | string;

export interface MaterialCategoryGroup {
  groupName: string;
  icon: string;
  materials: {
    value: MaterialType;
    label: string;
    description: string;
  }[];
}

export const ALL_MATERIAL_CATEGORIES: MaterialCategoryGroup[] = [
  {
    groupName: 'PLA 基礎與美學複材系列',
    icon: '🌱',
    materials: [
      { value: 'High-Speed PLA', label: 'High-Speed PLA (高速 600mm/s)', description: '高流速零卡料，Bambu / K1 / Voron 必備' },
      { value: 'PLA', label: '標準 PLA+ (日常通用高韌性)', description: '抗拉不易脆斷，公差極小，列印成功率最高' },
      { value: 'PLA Matte', label: 'PLA Matte (消光莫蘭迪)', description: '低漫反射霧面，極致隱藏層紋，免打磨' },
      { value: 'PLA Silk', label: 'PLA Silk (雙色/三色絲綢金屬炫光)', description: '高光澤金屬絲滑質感，旋轉漸變色澤' },
      { value: 'PLA-CF', label: 'PLA-CF (碳纖維高剛性消光)', description: '添加超短切碳纖微粒，抗拉抗彎曲，岩石般質感' },
      { value: 'PLA Wood', label: 'PLA Wood (天然木質木粉)', description: '含真木纖維，散發淡淡木香，可鑽孔打磨上蠟' },
      { value: 'PLA Glow', label: 'PLA Glow (夜光/感溫變色)', description: '吸光蓄能夜間長效發光，酷炫玩具模型首選' },
      { value: 'LW-PLA', label: 'LW-PLA (輕量主動微發泡航模級)', description: '主動發泡密度僅 0.54g/cm³，遙控固定翼飛機首選' },
    ]
  },
  {
    groupName: 'PETG 耐候抗溫抗衝擊系列',
    icon: '🛡️',
    materials: [
      { value: 'PETG', label: 'PETG-HF (高速耐候耐溫 80°C)', description: '結合 PLA 易印與 ABS 耐撞，戶外抗 UV' },
      { value: 'PETG Translucent', label: 'PETG Translucent (水晶高透光)', description: '如玻璃般晶瑩剔透，燈罩與透光導光件專用' },
      { value: 'PETG-CF', label: 'PETG-CF (碳纖維高剛性耐候)', description: '耐候耐化學性 + 碳纖維超高尺寸穩定度' },
      { value: 'PETG-ESD', label: 'PETG-ESD (工業防靜電級)', description: '表面電阻 10⁶~10⁹ Ω，半導體與精密電子載具' },
    ]
  },
  {
    groupName: 'ABS / ASA 工業戶外耐溫系列',
    icon: '🔥',
    materials: [
      { value: 'ABS-GF', label: 'ABS-GF (玻璃纖維超強耐溫 100°C+)', description: '微米玻纖抑制縮水，高溫汽車內裝與引擎治具' },
      { value: 'ASA', label: 'ASA (超強抗紫外線戶外耐候)', description: '抗紫外線暴曬 10 年不脆化，汽車外裝與戶外感測盒' },
      { value: 'ABS', label: 'ABS+ (低氣味抗開裂工程料)', description: '高耐磨抗衝擊，改性配方減少冷卻翹曲' },
      { value: 'PC-ABS', label: 'PC-ABS (合金超強抗衝擊)', description: '兼具 PC 強韌與 ABS 加工性，重型工具外殼' },
    ]
  },
  {
    groupName: 'TPU / TPE 柔性彈性體系列',
    icon: '🤸',
    materials: [
      { value: 'TPU', label: 'TPU 95A (高速高回彈耐磨)', description: '蕭氏 95A，直驅直進，耐油耐磨減震保護殼' },
      { value: 'TPU 85A', label: 'TPU 85A (超柔高彈性減震)', description: '軟膠手感極佳，抗撕裂，密封圈與無人機減震墊' },
      { value: 'TPU 64D', label: 'TPU 64D (高硬度耐磨聚氨酯)', description: '半剛性高耐磨彈性體，重載滾輪與傳動皮帶' },
    ]
  },
  {
    groupName: 'PA (Nylon 尼龍) 工業金屬替代系列',
    icon: '⚙️',
    materials: [
      { value: 'PA-CF', label: 'PA6-CF (超剛性碳纖維尼龍 150°C+)', description: '耐熱 150°C，高模量抗拉，直接替代鋁合金機構' },
      { value: 'PA12-CF', label: 'PA12-CF (超低吸水航太級碳纖尼龍)', description: '超低吸水率，長期尺寸極致穩定，耐溫 160°C+' },
      { value: 'PA-GF', label: 'PA-GF (高衝擊玻纖尼龍)', description: '高電絕緣性與抗剪切力，工業級齒輪與治具' },
      { value: 'Nylon (PA)', label: '純尼龍 PA6/PA12 (高韌性自潤滑耐磨)', description: '自潤滑低摩擦，機械傳動齒輪軸承必備' },
    ]
  },
  {
    groupName: 'PC / PP / 特種特級工程材料',
    icon: '💎',
    materials: [
      { value: 'PC (Polycarbonate)', label: 'PC (航太高透耐高溫抗衝擊 115°C+)', description: '耐溫高達 115°C，高衝擊強度，防彈級耐用' },
      { value: 'PP (Polypropylene)', label: 'PP (耐強酸強鹼高抗疲勞鉸鏈)', description: '密度浮於水，化學抗腐蝕，一體活頁鉸鏈百萬次不斷' },
      { value: 'PEEK/PEI (Ultem)', label: 'PEEK / PEI Ultem (特種航空超高溫 220°C+)', description: '航空航天與醫療級，極端化學與高溫環境' },
    ]
  },
  {
    groupName: '專用支撐材料 Support 系列',
    icon: '🏗️',
    materials: [
      { value: 'Support (PVA/HIPS)', label: 'Support PVA / HIPS (水溶性/易剝離支撐)', description: 'PVA 水溶無殘留，搭配 AMS 多色列印懸垂結構' },
    ]
  },
  {
    groupName: '光固化樹脂與工具配件系列',
    icon: '🧪',
    materials: [
      { value: 'Resin', label: '8K 高精度水洗光固化樹脂', description: '低氣味、超細微雕手辦，清水清洗免酒精' },
      { value: 'Accessories', label: '3D 列印工具配件 (烘乾盒/PEI板/硬化鋼噴嘴)', description: '原廠認證切片調校與列印周邊配件' },
    ]
  }
];

export type SpoolWeight = '0.5kg' | '1.0kg' | '2.5kg' | '5.0kg' | string;

export interface ColorOption {
  name: string;
  hex: string;
  stock: number;
}

export interface FilamentProduct {
  id: string;
  name: string;
  brand: string;
  material: MaterialType;
  diameter: '1.75mm' | '2.85mm';
  weight: SpoolWeight;
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
  spoolType: 'Cardboard 環保紙盤' | 'High-Temp Reusable 耐高溫線盤' | 'Refill 裸裝補充包' | string;
  nozzleTemp: string;
  bedTemp: string;
  maxSpeed: string;
  rating: number;
  reviewsCount: number;
  colors: ColorOption[];
  badge?: string;
  description: string;
  features: string[];
  imageUrl: string;
  isSubscriptionEligible?: boolean;
  // Logistics & shipping customizations
  shippingMethods?: ('7-11' | 'familymart' | 'blackcat')[];
  customShippingFee?: number;
  leadTime?: string;
  packagingNote?: string;
}

export interface LogisticsSettings {
  freeShippingThreshold: number;
  shippingFee711: number;
  shippingFeeFamilyMart: number;
  shippingFeeBlackCat: number;
  enableCOD: boolean;
  enablePrepaidCVS: boolean;
  enableHomeDelivery: boolean;
  dispatchLeadTime: string;
  packagingSpecs: string;
  ecpayLogisticsMerchantId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
}

export interface CartItem {
  product: FilamentProduct;
  selectedColor: ColorOption;
  selectedDiameter: '1.75mm' | '2.85mm';
  quantity: number;
}

export type PaymentGateway = 'ecpay_credit' | 'ecpay_atm' | 'ecpay_cvs' | 'linepay' | 'googlepay';

export type PaymentStatus = 'paid' | 'pending' | 'failed';

export type OrderStatus = 'new' | 'paid' | 'picking' | 'dispatched' | 'in_transit' | 'delivered' | 'completed';

export type ShippingMethod = '7-11' | 'familymart' | 'blackcat' | 'dhl';

export interface OrderItem {
  productId: string;
  name: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingMethod: ShippingMethod;
  storeOrAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  pointsDeduction: number;
  pointsEarned: number;
  total: number;
  paymentGateway: PaymentGateway;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber: string;
  invoiceNumber: string;
  invoiceType: 'cloud' | 'mobile_barcode' | 'tax_id';
  invoiceCarrierValue?: string;
  notes?: string;
}

export interface SubscriptionRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  frequency: string;
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  monthlyAmount: number;
  filamentPreference: string;
  paymentGateway: PaymentGateway;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  pricePerMonth: number;
  spoolsCount: number;
  frequency: '每月' | '雙月';
  description: string;
  perks: string[];
  recommendedFor: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  points: number;
  totalSpent: number;
  ordersCount: number;
  referralCode: string;
  birthday: string;
}

export interface AnalyticsData {
  visitorsToday: number;
  pageViewsToday: number;
  addToCartCount: number;
  checkoutStarts: number;
  ordersCompleted: number;
  conversionRate: number;
  revenueToday: number;
  bounceRate: number;
  avgOrderValue: number;
  googleAdsRoas: number;
  googleAdsSpent: number;
  googleAdsClicks: number;
  hourlyVisits: { hour: string; visits: number; orders: number }[];
  trafficSources: { name: string; percentage: number; color: string; visits: number; cvr: number }[];
  topCampaigns: {
    id?: string;
    campaignName: string;
    channel: 'Google Search' | 'Google Shopping' | 'Meta Dynamic' | 'LINE Official' | 'YouTube Shorts';
    spent: number;
    revenue: number;
    roas: number;
    cvr: number;
    status?: 'active' | 'paused' | 'optimizing';
    dailyBudget?: number;
    impressions?: number;
    clicks?: number;
    cpc?: number;
    headline?: string;
    description?: string;
    targetKeywords?: string[];
    biddingStrategy?: string;
    launchedAt?: string;
    aiOptimizedNote?: string;
  }[];
  monthlyRevenue?: number;
  dailySalesTrend?: { date: string; sales: number }[];
  overallConversionRate?: string;
  funnelSteps?: { stage: string; count: number; percentage: string }[];
  googleAds?: {
    spend: number;
    roas: number;
    ctr: string;
    campaigns: {
      name: string;
      impressions: number;
      clicks: number;
      ctr: string;
      cpc: number;
      conversions: number;
      roas: number;
    }[];
  };
}

export interface AutoAdLaunchRequest {
  targetGoal: 'bestseller_scale' | 'high_margin_engineering' | 'cart_recovery' | 'subscription_grow';
  dailyBudget: number;
  channel: 'Google Search' | 'Google Shopping' | 'Meta Dynamic' | 'LINE Official';
  targetRoas: number;
  featuredProductId?: string;
}

export interface AutoAdLaunchResponse {
  success: boolean;
  campaign: {
    id: string;
    campaignName: string;
    channel: 'Google Search' | 'Google Shopping' | 'Meta Dynamic' | 'LINE Official' | 'YouTube Shorts';
    spent: number;
    revenue: number;
    roas: number;
    cvr: number;
    status: 'active' | 'paused' | 'optimizing';
    dailyBudget: number;
    impressions: number;
    clicks: number;
    cpc: number;
    headline: string;
    description: string;
    targetKeywords: string[];
    biddingStrategy: string;
    launchedAt: string;
    aiOptimizedNote: string;
  };
  adCreativePreview: {
    displayUrl: string;
    headlines: string[];
    descriptions: string[];
    callouts: string[];
    sitelinks: { title: string; desc: string }[];
  };
  actionLog: string[];
  message: string;
}

export type LanguageCode = 'zh-TW' | 'en' | 'ja';
export type CurrencyCode = 'TWD' | 'USD' | 'JPY';

export interface AdSenseConfig {
  enabled: boolean;
  publisherId: string; // e.g. "ca-pub-1234567890123456"
  enableAutoAds: boolean;
  testMode: boolean; // safe test / sandbox mode
  slots: {
    storefrontTopBanner: string; // Slot ID e.g. "1234567890"
    inFeedSponsored: string;     // Slot ID e.g. "2345678901"
    footerLeaderboard: string;   // Slot ID e.g. "3456789012"
  };
  showTopBanner: boolean;
  showInFeedAd: boolean;
  showFooterBanner: boolean;
  estimatedStats?: {
    dailyImpressions: number;
    dailyClicks: number;
    avgCpcTwd: number;
    monthlyEarningsTwd: number;
  };
  lastSyncedAt?: string;
}

export interface AIModelOption {
  id: string;
  name: string;
  badge: string;
  speed: string;
  description: string;
  icon?: string;
  category?: 'gemini' | 'local';
}

export const SUPPORTED_AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (推薦首選)',
    badge: '旗艦推薦',
    speed: '極快 (~0.8s)',
    description: 'Google 最新次世代 Flash 模型，具備強大材料科學推理與低延遲繁體中文對話能力。',
    category: 'gemini',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    badge: '瞬間秒回',
    speed: '毫秒級 (~0.4s)',
    description: '極低延遲超輕量模型，快速回答出貨、優惠券、物流與一般耗材諮詢。',
    category: 'gemini',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (自動高負載分流)',
    badge: '經典 Flash',
    speed: '超快 (~1.0s)',
    description: 'Google Flash 系列模型，具備智慧多模型自動容錯與無縫切換。',
    category: 'gemini',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: '深度推理',
    speed: '思考型 (~2.2s)',
    description: '高階工程推理旗艦，擅長高溫箱溫熱傳導分析、碳纖耐磨與微觀物理探討。',
    category: 'gemini',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: '穩定旗艦',
    speed: '穩定 (~1.2s)',
    description: '經典穩定版本，適合多輪複雜對話與情境式推薦。',
    category: 'gemini',
  },
  {
    id: 'local-expert',
    name: '神狗勾 3D 專家工程模式',
    badge: '離線雙軌',
    speed: '即時 (<0.05s)',
    description: '神狗勾官方內建 3D 列印黃金切片規則引擎，離線秒回無延遲。',
    category: 'local',
  },
];
