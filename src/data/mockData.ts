import { FilamentProduct, MemberProfile, AnalyticsData } from '../types';
import { ALL_MARKET_PRODUCTS } from './allMarketProducts';

export const INITIAL_PRODUCTS: FilamentProduct[] = ALL_MARKET_PRODUCTS;

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
