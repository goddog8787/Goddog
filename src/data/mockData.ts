import { FilamentProduct, Order, SubscriptionPlan, MemberProfile, AnalyticsData } from '../types';
import { ALL_MARKET_PRODUCTS } from './allMarketProducts';

export const INITIAL_PRODUCTS: FilamentProduct[] = ALL_MARKET_PRODUCTS;

export const INITIAL_ORDERS: Order[] = [];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub-starter',
    name: '創客暢印箱 Maker Box',
    badge: '最受歡迎',
    pricePerMonth: 899,
    spoolsCount: 2,
    frequency: '每月',
    description: '每月固定配送 2 卷熱門 High-Speed PLA 或 PETG 耗材，享有 85 折優惠與免運禮遇。',
    perks: [
      '每月自選或盲盒驚喜 2 卷工程耗材 (1kg/卷)',
      '每卷固定享全站 85 折 (現省超過 NT$200)',
      '全台 7-11/全家/黑貓 每月配送完全免運費',
      '優先體驗次月即將上市之全新神秘限定色',
      '專屬 VIP 雙倍會員積分點數回饋'
    ],
    recommendedFor: '個人 3D 印表機愛好者、模型收藏家與學生創客',
  },
  {
    id: 'sub-pro',
    name: '工程旗艦箱 Pro Engineering Box',
    badge: '專業工作室',
    pricePerMonth: 2199,
    spoolsCount: 3,
    frequency: '每月',
    description: '包含航太級碳纖維 PLA-CF、耐溫 ABS-GF 或高彈性 TPU，適合高強度機械設計零件。',
    perks: [
      '每月配送 3 卷工程複合耗材 (CF/GF/TPU/耐熱)',
      '附贈硬化鋼噴嘴及專利防潮真空密封袋 x 3',
      '專屬 1 對 1 官方切片與材質工程師線上技術諮詢',
      '享全年度購物車配件 88 折無限次折價券',
      '隨時可暫停、更改出貨週期或更換耗材款式'
    ],
    recommendedFor: '3D 列印代工農場、建築/工業設計工作室、高校實驗室',
  },
  {
    id: 'sub-color',
    name: '色彩狂想季配箱 Color Drop',
    pricePerMonth: 1290,
    spoolsCount: 3,
    frequency: '每月',
    description: '每季精選漸層絲綢 (Silk Dual-Color)、夜光 (Glow-in-dark) 及大理石紋理限定耗材。',
    perks: [
      '限量版特調色系優先鎖定名額',
      '包含絲綢雙色、夜光蓄光、霧面馬卡龍系列',
      '內附專屬 3D 模型 STL 免費下載授權卡',
      '享會員生日當月加贈 500 點購物金'
    ],
    recommendedFor: '桌遊微縮模型、藝術手辦與文創禮品創作者',
  }
];

export const INITIAL_MEMBER: MemberProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  tier: 'Bronze',
  membershipTier: 'FREE',
  points: 0,
  totalSpent: 0,
  ordersCount: 0,
  referralCode: '',
  birthday: '',
  subscriptionPlan: 'None',
  subscriptionExpiry: undefined,
  subscriptionStatus: 'inactive',
  subscriptionStartDate: undefined,
  autoRenew: false,
  subscriptionFrequency: '',
  subscriptionHistory: []
};

export const INITIAL_SUBSCRIPTIONS: any[] = [];

export const INITIAL_ANALYTICS: AnalyticsData = {
  visitorsToday: 1,
  pageViewsToday: 1,
  addToCartCount: 0,
  checkoutStarts: 0,
  ordersCompleted: 0,
  conversionRate: 0,
  revenueToday: 0,
  bounceRate: 0,
  avgOrderValue: 0,
  googleAdsRoas: 0,
  googleAdsSpent: 0,
  googleAdsClicks: 0,
  monthlyRevenue: 0,
  overallConversionRate: '0.0%',
  dailySalesTrend: [],
  funnelSteps: [
    { stage: '1. 商城商品瀏覽 (Product View)', count: 1, percentage: '100%' },
    { stage: '2. 加入購物車 (Add to Cart)', count: 0, percentage: '0%' },
    { stage: '3. 開始結帳 (Checkout Start)', count: 0, percentage: '0%' },
    { stage: '4. 金流授權完成 (藍新金流 / LINE Pay)', count: 0, percentage: '0%' },
  ],
  hourlyVisits: [
    { hour: '00:00', visits: 0, orders: 0 },
    { hour: '02:00', visits: 0, orders: 0 },
    { hour: '04:00', visits: 0, orders: 0 },
    { hour: '06:00', visits: 0, orders: 0 },
    { hour: '08:00', visits: 0, orders: 0 },
    { hour: '10:00', visits: 0, orders: 0 },
    { hour: '12:00', visits: 0, orders: 0 },
    { hour: '14:00', visits: 0, orders: 0 },
    { hour: '16:00', visits: 0, orders: 0 },
    { hour: '18:00', visits: 0, orders: 0 },
    { hour: '20:00', visits: 0, orders: 0 },
    { hour: '22:00', visits: 0, orders: 0 },
  ],
  trafficSources: [
    { name: '自然搜尋與直接造訪 (Direct / Organic)', percentage: 100, color: '#4285F4', visits: 1, cvr: 0 },
    { name: 'LINE 官方好友與社群推廣', percentage: 0, color: '#06C755', visits: 0, cvr: 0 },
    { name: '社群討論與創客論壇 (Forum & Community)', percentage: 0, color: '#FBBC05', visits: 0, cvr: 0 },
  ],
  topCampaigns: []
};
