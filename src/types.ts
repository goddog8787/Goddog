export type MaterialType = 'PLA' | 'High-Speed PLA' | 'PETG' | 'ABS' | 'TPU' | 'Carbon Fiber' | 'Resin' | 'Accessories';

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
