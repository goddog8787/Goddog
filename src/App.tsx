import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  ProductCard 
} from './components/Storefront/ProductCard';
import { 
  SearchAutocomplete 
} from './components/Storefront/SearchAutocomplete';
import { FlyToCartOverlay } from './components/Storefront/FlyToCartOverlay';
const DraggableChatWidget = React.lazy(() => import('./components/Storefront/DraggableChatWidget').then(m => ({ default: m.DraggableChatWidget })));


const ProductDetailModal = React.lazy(() => import('./components/Storefront/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
const CartDrawer = React.lazy(() => import('./components/Storefront/CartDrawer').then(m => ({ default: m.CartDrawer })));
const CheckoutModal = React.lazy(() => import('./components/Storefront/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const TrackingModal = React.lazy(() => import('./components/Storefront/TrackingModal').then(m => ({ default: m.TrackingModal })));
const CustomerSupportModal = React.lazy(() => import('./components/Storefront/CustomerSupportModal').then(m => ({ default: m.CustomerSupportModal })));
const AuthModal = React.lazy(() => import('./components/Auth/AuthModal').then(m => ({ default: m.AuthModal })));
const WishlistDrawer = React.lazy(() => import('./components/Storefront/WishlistDrawer').then(m => ({ default: m.WishlistDrawer })));
const RecentlyViewedSection = React.lazy(() => import('./components/Storefront/RecentlyViewedSection').then(m => ({ default: m.RecentlyViewedSection })));
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AIAdvisorModal = React.lazy(() => import('./components/Storefront/AIAdvisorModal').then(m => ({ default: m.AIAdvisorModal })));
const FilamentLabModal = React.lazy(() => import('./components/Storefront/FilamentLabModal').then(m => ({ default: m.FilamentLabModal })));
const ProductComparisonModal = React.lazy(() => import('./components/Storefront/ProductComparisonModal').then(m => ({ default: m.ProductComparisonModal })));
const SpoolRecycleModal = React.lazy(() => import('./components/Storefront/SpoolRecycleModal').then(m => ({ default: m.SpoolRecycleModal })));
const HistoryModal = React.lazy(() => import('./pages/Profile/ProfileModals').then(m => ({ default: m.HistoryModal })));

function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/45 flex items-center justify-center pointer-events-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="w-7 h-7 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    </div>
  );
}
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MEMBER 
} from './data/mockData';
import { 
  computeRealAnalytics, 
  recordRealVisitor, 
  recordRealAddToCart, 
  recordRealCheckoutStart 
} from './lib/realAnalytics';
import { cartStockRemaining, isCartLineAvailable, isProductInStock, refreshCartItems, resolveCartColor } from './utils/cartStock';
import { getStoreApiBase } from './lib/backendUrl';
import { isMockOrder } from './lib/orderVerification';
import { 
  FilamentProduct, 
  ColorOption, 
  CartItem, 
  Order, 
  MemberProfile,
  LanguageCode, 
  CurrencyCode,
  AdSenseConfig,
  ProductReview
} from './types';
import { translations, preloadCatalogI18n } from './utils/i18n';
import { subscribeToProductStats } from './lib/reviewPersistence';
import {
  loadPersistedProductsSync,
  subscribeToCloudCatalog,
  recordAdminProductUpsert,
} from './lib/productPersistence';
import { 
  saveOrderToFirestore, 
  saveUserProfileToFirestore, 
  processReferralOrderReward,
  subscribeToAuth,
  finishGoogleRedirect,
  logOut,
  saveMonetizationConfigToFirestore,
  loadMonetizationConfigFromFirestore,
  auth,
  authenticatedStoreFetch
} from './lib/firebase';
import {
  normalizeCustomerId,
  getStoredCustomerSession,
  saveStoredCustomerSession,
  clearStoredCustomerSession,
  getStoredCustomerCartSync,
  getStoredCustomerWishlistSync,
  getStoredCustomerComparisonSync,
  getStoredCustomerProfileSync,
  getStoredCustomerOrdersSync,
  mergeCartItems,
  clearGuestCartStorage,
  clearGuestWishlistStorage,
  saveCustomerCart,
  loadCustomerCart,
  saveCustomerWishlist,
  loadCustomerWishlist,
  saveCustomerComparison,
  loadCustomerComparison,
  saveCustomerOrderRecord,
  loadCustomerOrders,
  saveCustomerTrackingNumbers,
  loadCustomerTrackingNumbers,
  saveCustomerUserData,
  loadCustomerUserData,
  loadCustomerProfileDoc,
  saveCustomerProfileDoc,
  sanitizeCustomerProfile,
  saveCustomerRecentlyViewed,
  loadCustomerRecentlyViewed,
  deleteSingleCustomerRecentlyViewed,
  getStoredRecentlyViewedSync,
} from './lib/customerPersistence';
import { AdSenseBanner, FloatingSkyscraperAd, NativeProductAdCard, HILLTOPADS_DEFAULT_SCRIPT } from './components/Monetization/AdSenseBanner';
import { 
  Gift, 
  ShieldCheck, 
  MessageSquare, 
  Filter, 
  Check,
  ChevronDown,
  Scale,
  Heart,
  Wrench,
  Recycle,
  X,
  Home,
  Package,
  ShoppingCart,
  Bot,
  User,
  Compass,
  BookOpen,
  Settings,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  Truck
} from 'lucide-react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
const PrivacyPolicy = React.lazy(() => import('./pages/Legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./pages/Legal/TermsOfService').then(m => ({ default: m.TermsOfService })));
const RefundPolicy = React.lazy(() => import('./pages/Legal/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const ContactUs = React.lazy(() => import('./pages/Legal/ContactUs').then(m => ({ default: m.ContactUs })));
const BlogList = React.lazy(() => import('./pages/Blog/BlogList').then(m => ({ default: m.BlogList })));
const BlogPostPage = React.lazy(() => import('./pages/Blog/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AboutUs = React.lazy(() => import('./pages/Legal/AboutUs').then(m => ({ default: m.AboutUs })));
const FAQPage = React.lazy(() => import('./pages/FAQ/FAQPage').then(m => ({ default: m.FAQPage })));
const ProfilePage = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const SubscriptionPage = React.lazy(() => import('./pages/Subscription/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));
const MaterialGuidePage = React.lazy(() => import('./pages/MaterialGuide/MaterialGuidePage').then(m => ({ default: m.MaterialGuidePage })));
const Footer = React.lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
import { SEO } from './components/SEO';
import { useClipboardFeedback } from './hooks/useClipboardFeedback';
import { clearCatalogFilterParams, extractCatalogFilterParams, readCatalogFilters, writeCatalogFilters, type CatalogFilters } from './utils/catalogFilters';
import { subscribeToCatalogOrder } from './lib/catalogOrderPersistence';
import { orderCatalog, type CatalogOrder } from './utils/catalogOrder';
import { prepareProductSearch, evaluateProductDeepSearch, normalizeProductSearch } from './utils/productSearch';
import { getStoreAnnouncementConfig } from './utils/announcementManager';
import { StoreAnnouncementConfig } from './types';

interface StorefrontMaterialFamily {
  id: string;
  labels: Record<LanguageCode, string>;
  match: (material: string) => boolean;
}

const STOREFRONT_MATERIAL_FAMILIES: readonly StorefrontMaterialFamily[] = [
  {
    id: 'All',
    labels: { 'zh-TW': '全部耗材', en: 'All Filaments', ja: '全フィラメント' },
    match: () => true,
  },
  {
    id: 'PLA',
    labels: { 'zh-TW': 'PLA', en: 'PLA', ja: 'PLA' },
    match: (m: string) => m.toUpperCase().includes('PLA'),
  },
  {
    id: 'PETG',
    labels: { 'zh-TW': 'PETG', en: 'PETG', ja: 'PETG' },
    match: (m: string) => m.toUpperCase().includes('PETG'),
  },
  {
    id: 'PA',
    labels: { 'zh-TW': 'PA6-CF / 尼龍', en: 'PA6-CF / Nylon', ja: 'PA6-CF / ナイロン' },
    match: (m: string) => {
      const upper = m.toUpperCase();
      return upper.startsWith('PA') || upper.includes('NYLON');
    },
  },
  {
    id: 'ABS',
    labels: { 'zh-TW': 'ABS / ASA', en: 'ABS / ASA', ja: 'ABS / ASA' },
    match: (m: string) => {
      const upper = m.toUpperCase();
      return upper.includes('ABS') || upper === 'ASA';
    },
  },
  {
    id: 'TPU',
    labels: { 'zh-TW': 'TPU 彈性', en: 'TPU Flex', ja: 'TPU 軟質' },
    match: (m: string) => m.toUpperCase().includes('TPU'),
  },
  {
    id: 'Engineering',
    labels: { 'zh-TW': 'PC / PEEK 工程', en: 'PC / PEEK / Spec', ja: 'PC / PEEK 特殊' },
    match: (m: string) => {
      const upper = m.toUpperCase();
      return (
        upper.startsWith('PC ') ||
        upper === 'PC' ||
        upper.includes('PP') ||
        upper.includes('PEEK') ||
        upper.includes('ULTEM') ||
        upper.includes('SUPPORT')
      );
    },
  },
  {
    id: 'Resin',
    labels: { 'zh-TW': '光固化樹脂', en: 'Resin', ja: 'UVレジン' },
    match: (m: string) => m.toUpperCase().includes('RESIN'),
  },
  {
    id: 'Accessories',
    labels: { 'zh-TW': '周邊配件', en: 'Accessories', ja: 'アクセサリ' },
    match: (m: string) => m.toUpperCase() === 'ACCESSORIES',
  },
];

const catalogMaterialIds = STOREFRONT_MATERIAL_FAMILIES.map(family => family.id);

function resolveMaterialFamilyId(rawMaterial: string): string {
  if (!rawMaterial || rawMaterial === 'All') return 'All';
  const upper = rawMaterial.toUpperCase();
  if (upper.includes('CARBON FIBER') && !upper.includes('PA')) return 'PLA';
  for (const fam of STOREFRONT_MATERIAL_FAMILIES) {
    if (fam.id !== 'All' && (fam.id === rawMaterial || fam.match(rawMaterial))) {
      return fam.id;
    }
  }
  return 'All';
}

function RouteScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const anchor = document.getElementById(hash.slice(1));
      if (anchor) {
        anchor.scrollIntoView({ block: 'start', behavior: 'instant' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}

function ReferralHandler() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    void (async () => {
      let validInvite = false;
      try {
        await auth.authStateReady();
        if (!active) return;
        const normalized = code?.trim();
        if (!auth.currentUser && normalized && /^[A-Za-z0-9_-]{1,128}$/.test(normalized)) {
          localStorage.setItem('printcore_referral_code', normalized.toUpperCase());
          validInvite = true;
        }
      } catch {
        // The profile page remains reachable when browser storage or auth is unavailable.
      }
      if (active) navigate(validInvite ? '/profile?referral_invited=1' : '/profile', { replace: true });
    })();
    return () => { active = false; };
  }, [code, navigate]);
  return null;
}

export default function App() {
  // App view mode: customer storefront vs admin management vs tech integration guide
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = (location.pathname === '/admin' || location.pathname.startsWith('/admin/'))
    ? 'admin' 
    : 'store';

  const setActiveTab = useCallback((tab: 'store' | 'admin') => {
    if (tab === 'store') navigate('/');
    else if (tab === 'admin') navigate('/admin');
  }, [navigate]);

  // i18n & currency with localStorage persistence
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('printcore_lang') as LanguageCode;
      if (saved && (saved === 'zh-TW' || saved === 'en' || saved === 'ja')) return saved;
    } catch(e) {}
    return 'zh-TW';
  });
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('printcore_currency') as CurrencyCode;
      if (saved && (saved === 'TWD' || saved === 'USD' || saved === 'JPY')) return saved;
    } catch(e) {}
    return 'TWD';
  });

  const handleUpdateLang = useCallback((newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('printcore_lang', newLang);
      window.dispatchEvent(new CustomEvent('printcore_lang_changed', { detail: newLang }));
    } catch(e) {}
  }, []);

  const handleUpdateCurrency = useCallback((newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    try {
      localStorage.setItem('printcore_currency', newCurr);
      window.dispatchEvent(new CustomEvent('printcore_currency_changed', { detail: newCurr }));
    } catch(e) {}
  }, []);

  useEffect(() => {
    const handleLangSync = (e: any) => {
      if (e?.detail) setLang(e.detail);
      else {
        try {
          const saved = localStorage.getItem('printcore_lang') as LanguageCode;
          if (saved && (saved === 'zh-TW' || saved === 'en' || saved === 'ja')) setLang(saved);
        } catch(e) {}
      }
    };
    window.addEventListener('printcore_lang_changed', handleLangSync);
    window.addEventListener('storage', handleLangSync);
    return () => {
      window.removeEventListener('printcore_lang_changed', handleLangSync);
      window.removeEventListener('storage', handleLangSync);
    };
  }, []);

  // Track whether non-zh-TW DOM translation has been activated so default zh-TW pays zero MutationObserver overhead
  const hasAutoTranslatedDomRef = useRef(false);

  // Universal DOM & Attribute Reactive Language Adaptation (lazy-loaded only when switching away from zh-TW)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : 'zh-TW';
    document.title =
      lang === 'en'
        ? 'GodDog 3D | High-Speed 3D Filaments & Smart Slicing Store'
        : lang === 'ja'
        ? '神狗勾 3D | 高速3Dプリントフィラメント＆スマート素材選定ストア'
        : '神狗勾耗材 3D列印線材旗艦館 | PLA・PETG・高速線材與智能選材商城';

    if (lang !== 'zh-TW') {
      void preloadCatalogI18n(lang);
    }

    if (lang === 'zh-TW' && !hasAutoTranslatedDomRef.current) {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let timerId: number | null = null;

    import('./utils/domAutoTranslator').then(({ processDomSubtree }) => {
      if (cancelled) return;
      hasAutoTranslatedDomRef.current = lang !== 'zh-TW';
      processDomSubtree(document.body, lang);

      if (lang === 'zh-TW') {
        return;
      }

      observer = new MutationObserver((mutations) => {
        if (timerId !== null) window.clearTimeout(timerId);
        timerId = window.setTimeout(() => {
          timerId = null;
          for (const m of mutations) {
            if (m.target instanceof HTMLElement) {
              processDomSubtree(m.target, lang);
            }
          }
        }, 60);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
      observer?.disconnect();
    };
  }, [lang]);

  // Storewide Announcement & Broadcast State
  const [announcement, setAnnouncement] = useState<StoreAnnouncementConfig>(getStoreAnnouncementConfig);

  useEffect(() => {
    const handleAnnouncementUpdate = () => {
      setAnnouncement(getStoreAnnouncementConfig());
    };
    window.addEventListener('printcore_announcement_updated', handleAnnouncementUpdate);
    return () => window.removeEventListener('printcore_announcement_updated', handleAnnouncementUpdate);
  }, []);

  // Core Data States (Preserves all Admin edits, additions, stock changes, and deletions across refreshes & cloud)
  const [products, setProducts] = useState<FilamentProduct[]>(() =>
    loadPersistedProductsSync(INITIAL_PRODUCTS)
  );

  const [catalogOrder, setCatalogOrder] = useState<CatalogOrder | null>(null);
  const [catalogOrderConnectionFailed, setCatalogOrderConnectionFailed] = useState(false);
  useEffect(() => subscribeToCatalogOrder(
    order => setCatalogOrder(order),
    () => setCatalogOrderConnectionFailed(true),
  ), []);

  const hasMountedProductsRef = useRef(false);
  useEffect(() => {
    if (!hasMountedProductsRef.current) {
      hasMountedProductsRef.current = true;
      return;
    }
    const timerId = window.setTimeout(() => {
      try {
        localStorage.setItem('printcore_products', JSON.stringify(products));
      } catch {}
    }, 120);
    return () => window.clearTimeout(timerId);
  }, [products]);

  // Real-time synchronization of Admin product catalog edits/additions/deletions from Cloud & Server
  useEffect(() => {
    const unsubCatalog = subscribeToCloudCatalog(INITIAL_PRODUCTS, (cloudMergedProducts) => {
      const productsById = new Map(cloudMergedProducts.map(product => [product.id, product]));
      setProducts(cloudMergedProducts);
      setViewingProduct((prev) => {
        if (!prev) return null;
        return productsById.get(prev.id) || prev;
      });
    });
    return () => unsubCatalog();
  }, []);

  // Real-time synchronization of product review stats from Firestore database
  useEffect(() => {
    const unsub = subscribeToProductStats((stats) => {
      setProducts((prevProducts) => {
        let changed = false;
        const next = prevProducts.map((p) => {
          const stat = stats[p.id];
          if (stat && (stat.rating !== p.rating || stat.reviewsCount !== p.reviewsCount)) {
            changed = true;
            return {
              ...p,
              rating: stat.rating,
              reviewsCount: stat.reviewsCount,
            };
          }
          return p;
        });
        return changed ? next : prevProducts;
      });
    });
    return () => unsub();
  }, []);

  const handleReviewSubmitted = useCallback((updatedProduct: FilamentProduct, _review: ProductReview) => {
    const updatedList = recordAdminProductUpsert(updatedProduct, INITIAL_PRODUCTS);
    setProducts(updatedList);
    setViewingProduct((prev) => (prev?.id === updatedProduct.id ? updatedProduct : prev));
  }, []);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('printcore_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly exclude any legacy mock/simulated orders
          return parsed.filter(o => !isMockOrder(o));
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('printcore_orders', JSON.stringify(orders.filter(o => !isMockOrder(o))));
  }, [orders]);

  // Sync with verified NewebPay orders from backend
  useEffect(() => {
    // Immediate sanitization of localStorage
    try {
      const savedTracking = localStorage.getItem('printcore_saved_tracking_numbers');
      if (savedTracking) {
        const parsed = JSON.parse(savedTracking);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(n => n && n !== '77391829310' && !n.includes('77391829310') && !n.startsWith('TEST') && !n.startsWith('MOCK'));
          localStorage.setItem('printcore_saved_tracking_numbers', JSON.stringify(cleaned));
        }
      }
      const savedOrders = localStorage.getItem('printcore_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(o => !isMockOrder(o));
          localStorage.setItem('printcore_orders', JSON.stringify(cleaned));
          setOrders(cleaned);
        }
      }
    } catch {}

  }, []);

  useEffect(() => {
    if (activeTab !== 'admin') return;
    const controller = new AbortController();
    const unsubscribe = subscribeToAuth(user => {
      if (!user?.emailVerified || user.email !== 'babe0615@gmail.com') return;
        authenticatedStoreFetch('/api/payment/verified-orders', { signal: controller.signal })
          .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
          .then(data => {
            if (!controller.signal.aborted && data?.success && Array.isArray(data.orders) && data.orders.length > 0) {
              setOrders(prev => {
                const verifiedById = new Map<string, any>();
                data.orders.forEach((vo: any) => {
                  if (vo.orderId) verifiedById.set(vo.orderId, vo);
                });

                let changed = false;
                const updatedPrev = prev.map((o) => {
                  const vo = verifiedById.get(o.orderNumber);
                  if (vo && o.paymentStatus === 'pending') {
                    changed = true;
                    return {
                      ...o,
                      paymentStatus: 'paid' as const,
                      orderStatus: (o.orderStatus === 'new' ? 'picking' : o.orderStatus) as Order['orderStatus'],
                      isVerifiedByNewebPay: true,
                      tradeNo: vo.tradeNo || o.tradeNo,
                      payTime: vo.payTime || o.payTime,
                    };
                  }
                  return o;
                });

                const existingNos = new Set(updatedPrev.map(o => o.orderNumber));
                const newVerified: Order[] = [];
                data.orders.forEach((vo: any) => {
                  if (vo.orderId && !existingNos.has(vo.orderId)) {
                    newVerified.push({
                      id: `ord-${Date.now()}-${vo.orderId}`,
                      orderNumber: vo.orderId,
                      createdAt: vo.payTime || new Date().toISOString(),
                      customerName: '線上買家',
                      customerEmail: '',
                      customerPhone: '',
                      shippingMethod: 'UNIMARTC2C',
                      storeOrAddress: '7-11 門市',
                      items: [],
                      subtotal: vo.amt || 0,
                      shippingFee: 0,
                      discount: 0,
                      pointsDeduction: 0,
                      pointsEarned: Math.floor((vo.amt || 0) * 0.01),
                      total: vo.amt || 0,
                      paymentGateway: 'credit_card',
                      paymentStatus: 'paid',
                      orderStatus: 'picking',
                      trackingNumber: vo.tradeNo || '',
                      invoiceNumber: `TW-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${String(vo.orderId || '').replace(/\D/g, '').slice(-8) || '00000001'}`,
                      invoiceType: 'cloud',
                      isVerifiedByNewebPay: true,
                      tradeNo: vo.tradeNo,
                      payTime: vo.payTime,
                    });
                  }
                });
                if (newVerified.length > 0 || changed) {
                  return [...newVerified, ...updatedPrev];
                }
                return prev;
              });
            }
          })
          .catch(() => {});
    });
    return () => {
      controller.abort();
      unsubscribe();
    };
  }, [activeTab]);

  // Defer genuine visitor analytics until browser is idle so first interaction stays instant
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(() => recordRealVisitor(), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(idleId);
    }
    const timer = window.setTimeout(() => recordRealVisitor(), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  const [member, setMember] = useState<MemberProfile>(() => {
    try {
      const session = getStoredCustomerSession();
      const cleanSessionId = normalizeCustomerId(session?.id);
      if (!session || !session.isLoggedIn || !cleanSessionId) {
        return INITIAL_MEMBER;
      }
      const userScopedProfile = getStoredCustomerProfileSync(cleanSessionId);
      if (userScopedProfile && userScopedProfile.id === cleanSessionId) {
        return userScopedProfile;
      }
      return sanitizeCustomerProfile({
        ...INITIAL_MEMBER,
        id: cleanSessionId,
        name: session.name || '',
        email: session.email || '',
        tier: session.tier || 'Silver',
        points: typeof session.points === 'number' ? session.points : 50,
        totalSpent: typeof session.totalSpent === 'number' ? session.totalSpent : 0,
      });
    } catch {}
    return INITIAL_MEMBER;
  });

  // Track which customer ID has completed hydration so login/logout transitions never overwrite saved profile/cart
  const hydratedUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const cleanId = normalizeCustomerId(member?.id);
    if (!cleanId) return;
    // Only persist member profile changes when this exact user is the active hydrated user
    if (hydratedUserIdRef.current !== cleanId) return;

    const sanitized = sanitizeCustomerProfile(member);
    try {
      localStorage.setItem('printcore_member', JSON.stringify(sanitized));
      localStorage.setItem(`printcore_user_profile_${cleanId}`, JSON.stringify(sanitized));
    } catch {}
    saveStoredCustomerSession({
      id: cleanId,
      name: sanitized.name,
      email: sanitized.email,
      tier: sanitized.tier,
      points: sanitized.points,
      totalSpent: sanitized.totalSpent || 0,
      isLoggedIn: true,
    });
    saveCustomerProfileDoc(cleanId, sanitized).catch(console.warn);
  }, [member]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('printcore_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('printcore_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('printcore_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  // Cart State: Synchronously initialize from active customer's isolated storage so items never vanish on refresh/re-login
  const [savedCartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const session = getStoredCustomerSession();
      const cleanSessionId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
      return getStoredCustomerCartSync(cleanSessionId);
    } catch {
      return [];
    }
  });


  const catalogById = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);
  const cartItems = useMemo(() => refreshCartItems(savedCartItems, catalogById), [savedCartItems, catalogById]);
  const unavailableCartLines = useMemo(() => cartItems.map((_, index) =>
    !isCartLineAvailable(cartItems, index, catalogById)
  ), [cartItems, catalogById]);

  // A shared URL supplies the initial catalog filters. Product and tracking parameters are independent.
  const sharedCatalogParams = location.pathname === '/' ? extractCatalogFilterParams(location.search) : '';
  const initialCatalogFilters = useMemo(() => readCatalogFilters(new URLSearchParams(sharedCatalogParams), catalogMaterialIds), [sharedCatalogParams]);
  const [searchQuery, setSearchQuery] = useState(initialCatalogFilters.query);
  const [selectedMaterial, setSelectedMaterial] = useState(initialCatalogFilters.material);
  const [inStockOnly, setInStockOnly] = useState(initialCatalogFilters.inStockOnly);
  const [sortBy, setSortBy] = useState<CatalogFilters['sort']>(initialCatalogFilters.sort);
  const previousSharedParams = useRef(sharedCatalogParams);
  const { copy: copyCatalogLink, copiedKey: catalogCopied, failedKey: catalogCopyFailed } = useClipboardFeedback(lang);

  useEffect(() => {
    if (location.pathname !== '/' || (previousSharedParams.current === sharedCatalogParams && !sharedCatalogParams)) return;
    previousSharedParams.current = sharedCatalogParams;
    setSearchQuery(initialCatalogFilters.query);
    setSelectedMaterial(initialCatalogFilters.material);
    setInStockOnly(initialCatalogFilters.inStockOnly);
    setSortBy(initialCatalogFilters.sort);
  }, [location.pathname, sharedCatalogParams, initialCatalogFilters]);

  const resetCatalogFilters = () => {
    setSearchQuery('');
    setSelectedMaterial('All');
    setInStockOnly(false);
    setSortBy('relevance');
    if (sharedCatalogParams) navigate({
      pathname: '/', search: clearCatalogFilterParams(location.search).toString(), hash: location.hash,
    }, { replace: true, preventScrollReset: true, state: location.state });
  };

  const activeCatalogParams = writeCatalogFilters({ query: searchQuery, material: selectedMaterial, inStockOnly, sort: sortBy });
  const shareCatalogFilters = () => {
    const url = new URL('/', window.location.origin);
    url.search = activeCatalogParams.toString();
    url.hash = 'storefront-catalog-heading';
    void copyCatalogLink(url.href, 'catalog');
  };

  // Modals Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPointsToUse, setCheckoutPointsToUse] = useState(0);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [overlayProduct, setViewingProduct] = useState<FilamentProduct | null>(null);
  const linkedId = location.pathname === '/' ? new URLSearchParams(location.search).get('product') : null;
  const viewingProduct = location.pathname === '/'
    ? (linkedId ? products.find(product => product.id === linkedId) ?? null : null)
    : overlayProduct;


  const relatedProducts = useMemo(() => {
    if (!viewingProduct) return [];
    const material = viewingProduct.material;
    const family = resolveMaterialFamilyId(material);
    return products
      .filter(item => item.id !== viewingProduct.id && isProductInStock(item) &&
        (item.material === material || (family !== 'All' && resolveMaterialFamilyId(item.material) === family)))
      .sort((a, b) => Number(b.material === material) - Number(a.material === material) || b.reviewsCount - a.reviewsCount)
      .slice(0, 3);
  }, [products, viewingProduct]);

  const memberIdRef = useRef(member?.id);
  memberIdRef.current = member?.id;

  const handleOpenProductDetail = useCallback((p: FilamentProduct) => {
    if (location.pathname === '/') {
      const params = new URLSearchParams(location.search);
      if (params.get('product') !== p.id) {
        params.set('product', p.id);
        navigate({ pathname: '/', search: params.toString(), hash: location.hash }, {
          state: { ...location.state, openedProduct: true },
          replace: Boolean(linkedId && location.state?.openedProduct),
          preventScrollReset: true,
        });
      }
    } else {
      setViewingProduct(p);
    }
    saveCustomerRecentlyViewed(memberIdRef.current || auth.currentUser?.uid, p).catch(() => {});
  }, [location, linkedId, navigate]);

  const closeProductDetail = () => {
    setViewingProduct(null);
    if (!linkedId) return;
    if (location.state?.openedProduct) {
      navigate(-1);
      return;
    }
    const params = new URLSearchParams(location.search);
    params.delete('product');
    navigate({ pathname: '/', search: params.toString(), hash: location.hash }, { replace: true, preventScrollReset: true });
  };
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isCustomerSupportOpen, setIsCustomerSupportOpen] = useState(false);
  const [supportInitialPrompt, setSupportInitialPrompt] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isOwnerAdmin = Boolean(isLoggedIn && auth.currentUser?.emailVerified &&
    auth.currentUser.email?.toLowerCase() === 'babe0615@gmail.com');

  const analytics = useMemo(
    () => (activeTab === 'admin' && isOwnerAdmin ? computeRealAnalytics(orders, products) : ({} as any)),
    [activeTab, isOwnerAdmin, orders, products]
  );

  // Maker & Storefront Enhancement States
  const [isFilamentLabOpen, setIsFilamentLabOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recentlyViewedCount, setRecentlyViewedCount] = useState<number>(() => {
    return getStoredRecentlyViewedSync(member?.id || auth.currentUser?.uid).length;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const list = getStoredRecentlyViewedSync(member?.id || auth.currentUser?.uid);
      setRecentlyViewedCount(list.length);
    };
    window.addEventListener('printcore_recently_viewed_updated', handleUpdate);
    window.addEventListener('printcore_recently_viewed_cleared', handleUpdate);
    return () => {
      window.removeEventListener('printcore_recently_viewed_updated', handleUpdate);
      window.removeEventListener('printcore_recently_viewed_cleared', handleUpdate);
    };
  }, [member?.id]);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>(() => {
    try {
      const session = getStoredCustomerSession();
      const cleanSessionId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
      return getStoredCustomerComparisonSync(cleanSessionId);
    } catch {
      return [];
    }
  });
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const session = getStoredCustomerSession();
      const cleanSessionId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
      return getStoredCustomerWishlistSync(cleanSessionId);
    } catch {
      return [];
    }
  });

  const wishlistItemsRef = useRef(wishlistIds);
  useEffect(() => { wishlistItemsRef.current = wishlistIds; }, [wishlistIds]);

  const handleToggleWishlist = useCallback((id: string) => {
    const previous = wishlistItemsRef.current;
    const next = previous.includes(id) ? previous.filter(itemId => itemId !== id) : [...previous, id];
    wishlistEdits.current++;
    wishlistItemsRef.current = next;
    setWishlistIds(next);
    const activeUid = normalizeCustomerId(auth.currentUser?.uid);
    void saveCustomerWishlist(activeUid, next, { explicitClear: next.length === 0 });
    if (activeUid && JSON.stringify(getStoredCustomerWishlistSync(activeUid)) === JSON.stringify(next)) clearGuestWishlistStorage();
  }, []);

  const comparisonItemsRef = useRef(comparisonIds);
  useEffect(() => { comparisonItemsRef.current = comparisonIds; }, [comparisonIds]);

  const persistComparisonEdit = useCallback((ids: string[]) => {
    comparisonEdits.current++;
    comparisonItemsRef.current = ids;
    setComparisonIds(ids);
    void saveCustomerComparison(auth.currentUser?.uid, ids);
  }, []);

  const handleToggleCompare = useCallback((id: string) => {
    const previous = comparisonItemsRef.current;
    if (previous.includes(id)) {
      persistComparisonEdit(previous.filter(itemId => itemId !== id));
    } else if (previous.length >= 4) {
      setIsCompareModalOpen(true);
    } else {
      persistComparisonEdit([...previous, id]);
    }
  }, [persistComparisonEdit]);

  function addAvailableProductToCart(product: FilamentProduct) {
    const color = product.colors?.find(option => cartStockRemaining(cartItemsRef.current, product, option) > 0);
    return color ? handleAddToCart(product, color, product.diameter, 1) : false;
  }

  const handleAddAllWishlistToCart = (savedList: FilamentProduct[]) => savedList.filter(addAvailableProductToCart);

  const handleRewardPoints = (points: number) => {
    setMember((prev) => {
      const updated: MemberProfile = {
        ...prev,
        points: (prev?.points || 0) + points,
      };
      saveUserProfileToFirestore(updated);
      return updated;
    });
  };

  // AdSense & Monetization State (Active for Maker Column Blog per User Request)
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
    enabled: true, // Blog ads active
    publisherId: 'ca-pub-7053299616784703',
    enableAutoAds: false,
    testMode: false,
    networkType: 'adsterra',
    blogAdNetwork: 'adsterra',
    storeAdNetwork: 'adsterra',
    hilltopadsVerificationCode: '01cbacb252bfbf5662b80265d72c30d5b946cc3e',
    hilltopadsVerified: true,
    hilltopadsBannerHtml: HILLTOPADS_DEFAULT_SCRIPT,
    customBannerHtml: '',
    slots: {
      storefrontTopBanner: '7728192031',
      inFeedSponsored: '5538192042',
      footerLeaderboard: '9928192053',
      articleMid: '4829103851',
      articleBottom: '6192840192',
    },
    showTopBanner: false,
    showInFeedAd: false,
    showFooterBanner: false,
    showArticleAd: true,
    showSidebarAd: false,
    estimatedStats: {
      dailyImpressions: 120,
      dailyClicks: 8,
      avgCpcTwd: 12,
      monthlyEarningsTwd: 2880,
    },
  });
  const [isSyncingAdSense, setIsSyncingAdSense] = useState(false);

  // Sync monetization config: strictly restrict ads to Maker Column (創客專欄) only
  useEffect(() => {
    async function loadMonetization() {
      try {
        const savedFirestore = await loadMonetizationConfigFromFirestore();
        if (savedFirestore && savedFirestore.publisherId) {
          const blogOnlyConfig = {
            ...savedFirestore,
            enabled: true,
            networkType: 'adsterra' as const,
            blogAdNetwork: 'adsterra' as const,
            showTopBanner: false,
            showInFeedAd: false, // Strict: Ads only on 創客專欄
            showFooterBanner: false,
            showArticleAd: true,
            showSidebarAd: false,
          };
          setAdSenseConfig((prev) => ({
            ...prev,
            ...blogOnlyConfig,
          }));
          localStorage.setItem('printcore_adsense_config', JSON.stringify(blogOnlyConfig));
          return;
        }
      } catch (e) {
        console.warn('Fallback loading monetization:', e);
      }
      const local = localStorage.getItem('printcore_adsense_config');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed) {
            const blogOnlyConfig = {
              ...parsed,
              enabled: true,
              networkType: 'adsterra' as const,
              blogAdNetwork: 'adsterra' as const,
              showTopBanner: false,
              showInFeedAd: false, // Strict: Ads only on 創客專欄
              showFooterBanner: false,
              showArticleAd: true,
              showSidebarAd: false,
            };
            setAdSenseConfig((prev) => ({
              ...prev,
              ...blogOnlyConfig,
            }));
            localStorage.setItem('printcore_adsense_config', JSON.stringify(blogOnlyConfig));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadMonetization();
  }, []);

  const handleSyncAdSenseToFirebase = async () => {
    setIsSyncingAdSense(true);
    try {
      await saveMonetizationConfigToFirestore(adSenseConfig);
      localStorage.setItem('printcore_adsense_config', JSON.stringify(adSenseConfig));
      setAdSenseConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
    } finally {
      setIsSyncingAdSense(false);
    }
  };

  const handleUpdateAdSenseConfig = (newConfig: AdSenseConfig) => {
    setAdSenseConfig(newConfig);
    localStorage.setItem('printcore_adsense_config', JSON.stringify(newConfig));
  };

  // Customer Data Persistence & Cloud Sync State
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [isSyncingUserData, setIsSyncingUserData] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  useEffect(() => {
    let active = true;
    void finishGoogleRedirect().then(error => {
      if (active && error) {
        setToastNotification({ type: 'error', message: error });
        setIsAuthOpen(true);
      }
    });
    return () => { active = false; };
  }, []);

  // Handle return from NewebPay payment gateway (Strict Non-Mock: Only verified payment creates order)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isClientBack = params.get('client_back') === '1';
    const isPaymentReturn = params.get('payment_verified') === 'true' || params.get('payment_success') === 'true';
    const isPaymentFailed = params.get('payment_verified') === 'false';
    const orderId = params.get('orderId');
    const returnFrom = params.get('from');

    if (isClientBack) {
      setToastNotification({
        type: 'info',
        message: '已返回神狗勾商城，您可至「我的訂單 > 待付款」核對入帳或重新付款。',
      });
      navigate(returnFrom === 'profile' ? '/profile' : '/', { replace: true });
      return;
    }

    if (isPaymentFailed) {
      const reason = params.get('reason') || '消費者取消或授權未通過';
      setToastNotification({
        type: 'error',
        message: `⚠️ 藍新金流付款未完成：${reason}。購物車內容已為您保留。`
      });
      navigate('/', { replace: true });
      return;
    }

    if (isPaymentReturn && orderId) {
      const verifyAndFinalizeOrder = async () => {
        try {
          const savedPending = localStorage.getItem('printcore_pending_order');
          let pending: any = null;
          if (savedPending) {
            try {
              pending = JSON.parse(savedPending);
            } catch {}
          }

          if (!pending || pending.orderId !== orderId) {
            setToastNotification({ type: 'info', message: '請至訂單記錄查看這筆付款的最新狀態。' });
            navigate(returnFrom === 'profile' ? '/profile' : '/', { replace: true });
            return;
          }
          const checkAmt = pending.total;
          let isPaid = false;
          let verifiedTradeNo = '';
          let verifiedPayTime = new Date().toLocaleString('zh-TW', { hour12: false }).slice(0, 16);
          let finalTotal = Number(checkAmt) || pending?.total || 0;
          let verifyData: any = null;
          
          try {
            // 嚴格向後端與藍新官方伺服器 (QueryTradeInfo) 檢驗該筆訂單是否真實付款成功 (TradeStatus === 1)
            const verifyRes = await fetch(`${getStoreApiBase()}/api/payment/verify-status?orderId=${encodeURIComponent(orderId)}&amt=${encodeURIComponent(checkAmt)}`);
            if (verifyRes.ok) {
              verifyData = await verifyRes.json();
              if (verifyData?.success && verifyData.isPaid && verifyData.order?.orderId === orderId &&
                  verifyData.order.tradeNo && Number(verifyData.order.amt) === Number(checkAmt)) {
                isPaid = true;
                verifiedTradeNo = verifyData.order?.tradeNo || verifiedTradeNo;
                verifiedPayTime = verifyData.order?.payTime || verifiedPayTime;
                finalTotal = Number(verifyData.order?.amt) || finalTotal;
              }
            }
          } catch (error) {
            console.warn('[NewebPay] Payment verification unavailable', error);
          }

          if (isPaid) {
            // A second return or a later checkout may have replaced this pending order while verifying.
            if (localStorage.getItem('printcore_pending_order') !== savedPending) return;
            localStorage.removeItem('printcore_pending_order');

            const newOrder: Order = {
              id: `ord-${Date.now()}`,
              orderNumber: orderId,
              createdAt: verifiedPayTime,
              customerName: pending?.customerName || '顧客',
              customerEmail: pending?.customerEmail || '',
              customerPhone: pending?.customerPhone || '',
              shippingMethod: pending?.shippingMethod || 'UNIMARTC2C',
              storeOrAddress: pending?.shippingAddress || '',
              items: pending?.cartItems?.map((c: CartItem) => ({
                productId: c.product.id,
                name: c.product.name,
                colorName: c.selectedColor.name,
                colorHex: c.selectedColor.hex,
                price: c.product.price,
                quantity: c.quantity,
              })) || [],
              subtotal: pending?.subtotal || 0,
              shippingFee: pending?.shippingFee || 0,
              discount: pending?.discount || 0,
              couponCode: pending?.couponCode || '',
              pointsDeduction: pending?.pointsToUse || 0,
              pointsEarned: Math.floor((pending?.total || 0) * 0.01),
              paymentFee: pending?.paymentFee || 0,
              total: finalTotal,
              paymentGateway: pending?.paymentGateway || 'credit_card',
              paymentStatus: 'paid',
              orderStatus: 'picking',
              trackingNumber: verifiedTradeNo || '',
              invoiceNumber: `TW-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${String(orderId).replace(/\D/g, '').slice(-8) || '00000001'}`,
              invoiceType: pending?.invoiceType || 'cloud',
              invoiceCarrierValue: pending?.invoiceCarrierValue || '',
              userId: pending?.userId || normalizeCustomerId(member?.id) || 'guest',
              isVerifiedByNewebPay: true,
              tradeNo: verifiedTradeNo,
              payTime: verifiedPayTime,
            };

            const ownerUid = normalizeCustomerId(newOrder.userId);
            const targetMatch = (o: Order) =>
              o.orderNumber === orderId ||
              (pending?.replacesOrderNumber && o.orderNumber === pending.replacesOrderNumber) ||
              (pending?.replacesOrderId && o.id === pending.replacesOrderId);

            let finalizedOrderToPersist: Order = { ...newOrder, id: pending?.replacesOrderId || `ord-${orderId}` };
            setOrders(prev => {
              const existingIdx = prev.findIndex(targetMatch);
              if (existingIdx >= 0) {
                const existing = prev[existingIdx];
                finalizedOrderToPersist = {
                  ...existing,
                  ...newOrder,
                  id: existing.id || newOrder.id,
                  orderNumber: orderId,
                  paymentStatus: 'paid',
                  orderStatus: 'picking',
                  isVerifiedByNewebPay: true,
                  tradeNo: verifiedTradeNo,
                  payTime: verifiedPayTime,
                };
                return prev.map((o, idx) => (idx === existingIdx ? finalizedOrderToPersist : o));
              }
              return [finalizedOrderToPersist, ...prev];
            });
            saveCustomerOrderRecord(finalizedOrderToPersist, ownerUid).catch(console.warn);

            // 成功入帳後才扣除購物車並扣減商品庫存
            setCartItems([]);
            saveCustomerCart(ownerUid, [], { explicitClear: true }).catch(console.warn);

            // 會員更新累計點數、消費紀錄、核銷一次性會員券並完整持久化
            if (ownerUid) {
              const usedCouponUpper = (newOrder.couponCode || '').trim().toUpperCase();
              setMember((prev) => {
                const remainingCoupons = usedCouponUpper && Array.isArray(prev?.coupons)
                  ? prev.coupons.filter((c: any) => String(c?.code || '').trim().toUpperCase() !== usedCouponUpper)
                  : prev?.coupons;
                const updatedMember = sanitizeCustomerProfile({
                  ...prev,
                  id: ownerUid,
                  points: Math.max(0, (prev?.points || 0) + newOrder.pointsEarned - (newOrder.pointsDeduction || 0)),
                  totalSpent: (prev?.totalSpent || 0) + newOrder.total,
                  ordersCount: (prev?.ordersCount || 0) + 1,
                  ...(remainingCoupons ? { coupons: remainingCoupons } : {}),
                });
                try {
                  localStorage.setItem('printcore_member', JSON.stringify(updatedMember));
                } catch {}
                saveUserProfileToFirestore(updatedMember);
                saveCustomerUserData(ownerUid, 'profile', updatedMember).catch(console.warn);
                saveCustomerProfileDoc(ownerUid, updatedMember).catch(console.warn);
                saveStoredCustomerSession({
                  id: updatedMember.id,
                  name: updatedMember.name,
                  email: updatedMember.email,
                  tier: updatedMember.tier,
                  points: updatedMember.points,
                  totalSpent: updatedMember.totalSpent || 0,
                  isLoggedIn: true,
                });
                processReferralOrderReward(updatedMember, newOrder).catch(console.warn);
                return updatedMember;
              });
            }
            if (newOrder.couponCode && typeof window !== 'undefined') {
              window.dispatchEvent(new Event('printcore_coupons_updated'));
            }

            setToastNotification({
              type: 'success',
              message: `🎉 藍新金流款項檢測入帳確認！交易序號 ${verifiedTradeNo}，訂單 (${orderId}) 已正式成立！`
            });
          } else {
            console.warn('[NewebPay Verification Failed]:', verifyData);
            setToastNotification({
              type: 'error',
              message: `⚠️ 藍新金流系統未檢測到有效付款入帳紀錄 (${verifyData?.message || '款項尚未到帳'})，訂單未成立。`
            });
          }
        } catch (err) {
          console.error('Error during NewebPay payment verification:', err);
          setToastNotification({
            type: 'error',
            message: '⚠️ 金流驗證服務連線異常，請稍後至訂單查詢或洽詢客服。'
          });
        } finally {
          navigate('/', { replace: true });
        }
      };

      verifyAndFinalizeOrder();
    }

    if (params.get('vip_success') === 'true') {
      const orderId = params.get('orderId') || '';

      const verifyAndGrantVip = async () => {
        try {
          if (!orderId) {
            console.warn('[NewebPay VIP] 缺少藍新金流訂單單號，拒絕直接開通 VIP');
            navigate('/', { replace: true });
            return;
          }

          const response = await authenticatedStoreFetch(`/api/payment/verify-paid-order?orderId=${encodeURIComponent(orderId)}`);
          const receipt = response.ok ? await response.json() : null;
          if (!receipt?.verified || receipt.orderId !== orderId || !receipt.days || !receipt.verifiedAt) {
            console.warn('[NewebPay VIP] 未通過金流扣款校驗，拒絕開通 VIP 權益');
            navigate('/', { replace: true });
            return;
          }

          const nowIso = receipt.verifiedAt;
          const days = Number(receipt.days);
          const newExpiry = new Date(nowIso);
          newExpiry.setDate(newExpiry.getDate() + days);
          setMember((prev: MemberProfile) => {
            if (prev.subscriptionHistory?.some(entry => entry.id === orderId)) return prev;
            const updated: MemberProfile = sanitizeCustomerProfile({
              ...prev,
              tier: 'Gold',
              subscriptionPlan: receipt.planName,
              subscriptionStatus: 'active',
              autoRenew: true,
              subscriptionStartDate: nowIso,
              subscriptionExpiry: newExpiry.toISOString(),
              subscriptionNextBillingDate: newExpiry.toISOString(),
              subscriptionAmount: receipt.amt,
              subscriptionHistory: [{
                id: orderId, date: nowIso.slice(0, 10), amount: receipt.amt, planName: receipt.planName,
                periodNo: '', authCode: '', invoiceNumber: '', status: 'success', type: 'initial',
              }, ...(prev.subscriptionHistory || [])],
              points: (prev?.points || 0) + Math.floor(days * 1),
            });
            localStorage.setItem('printcore_member', JSON.stringify(updated));
            if (updated.id) {
              saveCustomerUserData(updated.id, 'profile', updated).catch(console.warn);
              saveCustomerProfileDoc(updated.id, updated).catch(console.warn);
            }
            return updated;
          });

          import('canvas-confetti')
            .then((mod) => {
              mod.default({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            })
            .catch(() => {});

          setToastNotification({
            type: 'success',
            message: `🎉 藍新金流扣款成功！恭喜開通【創客 VIP ${receipt.planName}】（有效期限 ${days} 天），立享全館 97 折與專屬權益！`
          });
        } catch (e) {
          console.error('VIP verification error:', e);
        } finally {
          navigate('/', { replace: true });
        }
      };

      verifyAndGrantVip();
    }
  }, [location.search, navigate, member?.id]);

  // Guard against concurrent/duplicate syncUserData invocations for the same customer
  const syncingUserIdRef = React.useRef<string | null>(null);
  const userSyncRevision = useRef(0);
  const cartEdits = useRef(0);
  const wishlistEdits = useRef(0);
  const comparisonEdits = useRef(0);

  const resolveActiveCustomerId = useCallback((): string | null => {
    return normalizeCustomerId(auth.currentUser?.uid);
  }, []);

  // Synchronize user cart, wishlist, comparison, orders, tracking, and profile from user-scoped cache + Firestore
  const syncUserData = async (rawUserId: string, fallbackProfile?: any) => {
    const cleanUserId = normalizeCustomerId(rawUserId);
    if (!cleanUserId) return;

    // Prevent concurrent duplicate hydration (e.g., AuthModal.onLoginSuccess + Firebase subscribeToAuth firing together)
    if (syncingUserIdRef.current === cleanUserId) {
      return;
    }
    if (auth.currentUser?.uid !== cleanUserId) return;
    syncingUserIdRef.current = cleanUserId;
    hydratedUserIdRef.current = null;
    const revision = ++userSyncRevision.current;
    const isCurrent = () => userSyncRevision.current === revision && auth.currentUser?.uid === cleanUserId;

    setIsSyncingUserData(true);
    try {
      const guestCartBeforeLogin = getStoredCustomerCartSync(null);
      const guestWishlistBeforeLogin = getStoredCustomerWishlistSync(null);
      const cartVersion = cartEdits.current;
      const wishlistVersion = wishlistEdits.current;
      const comparisonVersion = comparisonEdits.current;

      // Instant synchronous hydration from user-scoped localStorage so UI updates in 0ms
      const cachedCart = getStoredCustomerCartSync(cleanUserId);
      const previewCart =
        guestCartBeforeLogin.length > 0 ? mergeCartItems(cachedCart, guestCartBeforeLogin) : cachedCart;
      setCartItems(previewCart);

      const cachedWishlist = getStoredCustomerWishlistSync(cleanUserId);
      const initialMergedWishlist = Array.from(new Set([...cachedWishlist, ...guestWishlistBeforeLogin]));
      setWishlistIds(initialMergedWishlist);

      const cachedComparison = getStoredCustomerComparisonSync(cleanUserId);
      setComparisonIds(cachedComparison);

      const cachedProfile = getStoredCustomerProfileSync(cleanUserId);
      setMember(cachedProfile || sanitizeCustomerProfile({
        ...INITIAL_MEMBER, ...fallbackProfile, id: cleanUserId,
      }));

      // 1. Reconcile Cloud & Local Cart
      // IMPORTANT: loadCustomerCart(cleanUserId) already reconciles Firestore and localUserCart by timestamp.
      // NEVER merge cloudOrLocalCart with cachedCart (they are the same user's cart, which would double quantities!).
      // Only merge with guestCartBeforeLogin if the user actually had guest items before logging in.
      const pendingCart = loadCustomerCart(cleanUserId);
      const pendingWishlist = loadCustomerWishlist(cleanUserId);
      const pendingComparison = loadCustomerComparison(cleanUserId);
      const pendingOrders = loadCustomerOrders(cleanUserId);
      const pendingTracking = loadCustomerTrackingNumbers(cleanUserId);
      const pendingProfile = loadCustomerProfileDoc(cleanUserId, fallbackProfile);
      const pendingViews = loadCustomerRecentlyViewed(cleanUserId);

      const authoritativeUserCart = await pendingCart;
      if (!isCurrent()) return;
      if (cartVersion === cartEdits.current) {
        const finalCart = mergeCartItems(authoritativeUserCart, guestCartBeforeLogin);
        setCartItems(finalCart);
        if (guestCartBeforeLogin.length > 0) {
          void saveCustomerCart(cleanUserId, finalCart);
          if (JSON.stringify(getStoredCustomerCartSync(cleanUserId)) === JSON.stringify(finalCart)) clearGuestCartStorage();
        }
      }

      const cloudOrLocalWishlist = await pendingWishlist;
      if (!isCurrent()) return;
      if (wishlistVersion === wishlistEdits.current) {
        const finalWishlist = Array.from(new Set([...cloudOrLocalWishlist, ...guestWishlistBeforeLogin]));
        setWishlistIds(finalWishlist);
        if (guestWishlistBeforeLogin.length > 0) {
          void saveCustomerWishlist(cleanUserId, finalWishlist);
          if (JSON.stringify(getStoredCustomerWishlistSync(cleanUserId)) === JSON.stringify(finalWishlist)) clearGuestWishlistStorage();
        }
      }

      const cloudOrLocalCompare = await pendingComparison;
      if (!isCurrent()) return;
      if (comparisonVersion === comparisonEdits.current) setComparisonIds(cloudOrLocalCompare);

      // 4. Reconcile Cloud & Local Orders for this Customer
      const customerOrders = await pendingOrders;
      if (!isCurrent()) return;
      if (customerOrders && customerOrders.length > 0) {
        setOrders((prev) => {
          const map = new Map<string, Order>();
          customerOrders.forEach((o) => map.set(o.orderNumber || o.id, o));
          prev.forEach((o) => {
            const key = o.orderNumber || o.id;
            if (!map.has(key)) map.set(key, o);
          });
          return Array.from(map.values());
        });
      }

      // 5. Logistics tracking numbers for this Customer
      const cloudTracking = await pendingTracking;
      if (!isCurrent()) return;
      if (cloudTracking && cloudTracking.length > 0) {
        const cleanTrack = cloudTracking.find(
          (t) => t && t !== '77391829310' && !t.includes('77391829310') && !t.startsWith('TEST') && !t.startsWith('MOCK')
        );
        setTrackingNumberInput(cleanTrack || '');
      } else {
        setTrackingNumberInput('');
      }

      // 6. Reconcile Full Customer Profile (Points, Tier, Coupons, Referrals, Settings)
      const fullProfile = await pendingProfile;
      if (!isCurrent()) return;
      const safeProfile = fullProfile || sanitizeCustomerProfile({
        ...INITIAL_MEMBER,
        ...(fallbackProfile || {}),
        id: cleanUserId,
        name: fallbackProfile?.name || fallbackProfile?.email?.split('@')[0] || '創客會員',
        email: fallbackProfile?.email || '',
      });
      hydratedUserIdRef.current = cleanUserId;
      setMember(safeProfile);
      saveStoredCustomerSession({
        id: cleanUserId,
        name: safeProfile.name,
        email: safeProfile.email,
        tier: safeProfile.tier,
        points: safeProfile.points,
        totalSpent: safeProfile.totalSpent || 0,
        isLoggedIn: true,
      });

      // 7. Cloud Recently Viewed (Restore user-isolated browsing history)
      try {
        const cloudViews = await pendingViews;
        if (!isCurrent()) return;
        if (cloudViews && Array.isArray(cloudViews)) {
          setRecentlyViewedCount(cloudViews.length);
        }
      } catch (e) {
        console.warn('Recently viewed cloud sync notice:', e);
      }

      if (!isCurrent()) return;
      setToastNotification({
        type: 'success',
        message: `歡迎回來，${safeProfile.name || fallbackProfile?.name || '會員'}！已載入您的購物車、收藏與會員資料。`,
      });
    } catch (e) {
      console.warn('Customer cloud data sync fallback:', e);
      if (isCurrent()) hydratedUserIdRef.current = cleanUserId;
    } finally {
      if (isCurrent()) {
        syncingUserIdRef.current = null;
        setIsSyncingUserData(false);
      }
    }
  };

  // Handle customer logout: strictly detach active customer ID BEFORE clearing in-memory UI state so user data is never wiped
  const handleLogout = async () => {
    // 1. Detach hydrated user reference immediately so no effect writes empty state to the user's storage
    userSyncRevision.current++;
    hydratedUserIdRef.current = null;
    syncingUserIdRef.current = null;
    setIsSyncingUserData(false);

    try {
      await logOut();
    } catch {}

    clearStoredCustomerSession();
    try {
      localStorage.removeItem('printcore_member');
      localStorage.removeItem('printcore_active_customer');
    } catch {}

    // 2. Reset UI state to clean guest view (customer's saved cart/wishlist/profile remain safely stored under their UID)
    setIsLoggedIn(false);
    setMember(INITIAL_MEMBER);
    setCartItems(getStoredCustomerCartSync(null));
    setWishlistIds(getStoredCustomerWishlistSync(null));
    setComparisonIds(getStoredCustomerComparisonSync(null));
    setTrackingNumberInput('');

    const guestViews = getStoredRecentlyViewedSync(null);
    setRecentlyViewedCount(guestViews.length);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('printcore_recently_viewed_updated', {
        detail: { list: guestViews, userId: null }
      }));
    }
    setToastNotification({
      type: 'info',
      message: '您已安全登出會員帳號，您的購物車與個人資料已安全保存，下次登入將自動恢復。',
    });
  };

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      const cleanUid = normalizeCustomerId(firebaseUser?.uid);
      if (firebaseUser && cleanUid) {
        setIsLoggedIn(true);
        const existingProfile = getStoredCustomerProfileSync(cleanUid);
        const fallbackProfile = {
          ...(existingProfile || {}),
          id: cleanUid,
          name: firebaseUser.displayName || existingProfile?.name || firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || existingProfile?.email || '',
        };
        if (hydratedUserIdRef.current !== cleanUid && syncingUserIdRef.current !== cleanUid) {
          syncUserData(cleanUid, fallbackProfile);
        }
      } else {
        userSyncRevision.current++;
        hydratedUserIdRef.current = null;
        syncingUserIdRef.current = null;
        setIsSyncingUserData(false);
        clearStoredCustomerSession();
        setIsLoggedIn(false);
        setMember(INITIAL_MEMBER);
        setCartItems(getStoredCustomerCartSync(null));
        setWishlistIds(getStoredCustomerWishlistSync(null));
        setComparisonIds(getStoredCustomerComparisonSync(null));
      }
    });
    return () => unsubscribe();
  }, []);

  const t = translations[lang];

  // Cart operations
  const reduceStoreMotion = useReducedMotion();
  const [toastMsg, setToastMsg] = useState<{ id: number, text: string } | null>(null);
  const cartItemsRef = React.useRef<CartItem[]>(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const showCartNotice = useCallback((text: string) => {
    const id = performance.now();
    setToastMsg({ id, text });
    setTimeout(() => setToastMsg(prev => prev?.id === id ? null : prev), 3000);
  }, []);
  const stockNotice = lang === 'en' ? 'Please check the available stock in your cart.'
    : lang === 'ja' ? 'カートの数量と在庫をご確認ください。' : '庫存不足或規格已變更，請確認購物車內的數量。';

  const persistCartEdit = useCallback((items: CartItem[]) => {
    cartEdits.current++;
    const activeUid = normalizeCustomerId(auth.currentUser?.uid);
    void saveCustomerCart(activeUid, items, { explicitClear: items.length === 0 });
    if (activeUid && JSON.stringify(getStoredCustomerCartSync(activeUid)) === JSON.stringify(items)) clearGuestCartStorage();
  }, []);

  const handleAddToCart = useCallback((
    product: FilamentProduct,
    color: ColorOption,
    diameter: '1.75mm' | '2.85mm',
    quantity: number = 1
  ) => {
    const baseCart = cartItemsRef.current;
    const latest = catalogById.get(product.id);
    const selectedColor = latest && resolveCartColor(latest, color.name);
    if (!latest || !selectedColor || !Number.isSafeInteger(quantity) || quantity < 1 ||
        quantity > cartStockRemaining(baseCart, latest, selectedColor)) {
      showCartNotice(stockNotice);
      return false;
    }
    const existingIdx = baseCart.findIndex(item =>
      item.product.id === latest.id && item.selectedColor.name === selectedColor.name && item.selectedDiameter === diameter
    );
    const updated = existingIdx < 0
      ? [...baseCart, { product: latest, selectedColor, selectedDiameter: diameter, quantity }]
      : baseCart.map((item, idx) => idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item);
    cartItemsRef.current = updated;
    setCartItems(updated);
    persistCartEdit(updated);
    recordRealAddToCart();
    showCartNotice(lang === 'en' ? 'Added to your cart' : lang === 'ja' ? 'カートに追加しました' : `已將 ${latest.name} 加入購物車！`);
    return true;
  }, [catalogById, lang, persistCartEdit, showCartNotice, stockNotice]);

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    const baseCart = cartItemsRef.current;
    const item = baseCart[index];
    if (!item || !Number.isSafeInteger(newQty)) return;
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    if (newQty > item.quantity && !isCartLineAvailable(
      baseCart.map((entry, idx) => idx === index ? { ...entry, quantity: newQty } : entry), index, catalogById
    )) {
      showCartNotice(stockNotice);
      return;
    }
    const updated = baseCart.map((entry, idx) => idx === index ? { ...entry, quantity: newQty } : entry);
    cartItemsRef.current = updated;
    setCartItems(updated);
    persistCartEdit(updated);
  };

  const handleUpdateCartColor = (index: number, newColor: ColorOption) => {
    const baseCart = cartItemsRef.current;
    const item = baseCart[index];
    const product = item && catalogById.get(item.product.id);
    const color = product && resolveCartColor(product, newColor.name);
    if (!item || !product || !color || item.quantity > cartStockRemaining(baseCart, product, color, index)) {
      showCartNotice(stockNotice);
      return false;
    }
    if (item.selectedColor.name === color.name) return true;
    const duplicateIdx = baseCart.findIndex((entry, idx) =>
      idx !== index && entry.product.id === product.id && entry.selectedColor.name === color.name &&
      entry.selectedDiameter === item.selectedDiameter
    );
    const updated = duplicateIdx === -1
      ? baseCart.map((entry, idx) => idx === index ? { ...entry, selectedColor: color } : entry)
      : baseCart.map((entry, idx) => idx === duplicateIdx ? { ...entry, quantity: entry.quantity + item.quantity } : entry)
          .filter((_, idx) => idx !== index);
    cartItemsRef.current = updated;
    setCartItems(updated);
    persistCartEdit(updated);
    return true;
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = cartItemsRef.current.filter((_, idx) => idx !== index);
    cartItemsRef.current = updated;
    setCartItems(updated);
    persistCartEdit(updated);
  };

  const handleProceedCheckout = (pointsUsed: number, couponCode?: string) => {
    setCheckoutPointsToUse(pointsUsed);
    setCheckoutCouponCode(couponCode || '');
    recordRealCheckoutStart();
    setIsCheckoutOpen(true);
  };

  const handleQuickCheckout = (
    product: FilamentProduct,
    color: ColorOption,
    diameter: '1.75mm' | '2.85mm',
    quantity: number
  ) => {
    if (!handleAddToCart(product, color, diameter, quantity)) return;
    if (cartItemsRef.current.some((_, index) => !isCartLineAvailable(cartItemsRef.current, index, catalogById))) {
      closeProductDetail();
      setIsCartOpen(true);
      return;
    }
    closeProductDetail();
    setCheckoutPointsToUse(0);
    setCheckoutCouponCode('');
    recordRealCheckoutStart();
    setIsCheckoutOpen(true);
  };

  // Strictly isolated orders belonging ONLY to the currently logged-in customer
  const currentCustomerOrders = useMemo(() => {
    if (!isLoggedIn) return [];
    const cleanUid = normalizeCustomerId(member?.id);
    const cleanEmail = (member?.email || '').trim().toLowerCase();
    if (!cleanUid && !cleanEmail) return [];

    return orders.filter((o) => {
      if (isMockOrder(o)) return false;
      const orderUid = normalizeCustomerId((o as any).userId);
      const orderEmail = (o.customerEmail || '').trim().toLowerCase();
      if (cleanUid && orderUid && orderUid === cleanUid) return true;
      if (cleanEmail && orderEmail && orderEmail === cleanEmail) return true;
      return false;
    });
  }, [orders, isLoggedIn, member?.id, member?.email]);

  // Persist a newly created unpaid/pending order before redirecting to NewebPay gateway
  const handlePendingOrderCreated = async (pendingOrder: Order) => {
    const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : normalizeCustomerId(pendingOrder.userId);
    const orderWithOwner: Order = {
      ...pendingOrder,
      userId: activeUid || 'guest',
    };
    setOrders((prev) => {
      const filtered = prev.filter(
        (o) => o.orderNumber !== orderWithOwner.orderNumber && o.id !== orderWithOwner.id
      );
      return [orderWithOwner, ...filtered];
    });
    await saveCustomerOrderRecord(orderWithOwner, activeUid);
  };

  // When an order is completed:
  const handleOrderCompleted = (newOrder: Order) => {
    const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
    const orderWithOwner: Order = {
      ...newOrder,
      userId: activeUid || 'guest',
    };
    const updatedOrders = [orderWithOwner, ...orders];
    setOrders(updatedOrders);
    saveCustomerOrderRecord(orderWithOwner, activeUid);
    saveCustomerCart(activeUid, [], { explicitClear: true });
    setCartItems([]);
    // Add loyalty points to member profile, consume single-use coupon & verify Stage 2 Referral Reward
    if (isLoggedIn && activeUid) {
      const usedCouponUpper = (newOrder.couponCode || '').trim().toUpperCase();
      const remainingCoupons = usedCouponUpper && Array.isArray(member?.coupons)
        ? member.coupons.filter((c: any) => String(c?.code || '').trim().toUpperCase() !== usedCouponUpper)
        : member?.coupons;
      const updatedMember = sanitizeCustomerProfile({
        ...member,
        id: activeUid,
        points: Math.max(0, (member?.points || 0) - newOrder.pointsDeduction + newOrder.pointsEarned),
        totalSpent: (member?.totalSpent || 0) + newOrder.total,
        ordersCount: (member?.ordersCount || 0) + 1,
        ...(remainingCoupons ? { coupons: remainingCoupons } : {}),
      });
      setMember(updatedMember);
      saveUserProfileToFirestore(updatedMember);
      saveCustomerProfileDoc(activeUid, updatedMember).catch(console.warn);
      saveStoredCustomerSession({
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        tier: updatedMember.tier,
        points: updatedMember.points,
        totalSpent: updatedMember.totalSpent || 0,
        isLoggedIn: true,
      });

      // Stage 2 Referral Verification: Only when a referred registered user completes a real order
      processReferralOrderReward(updatedMember, orderWithOwner)
        .then((refRes) => {
          if (refRes?.rewarded && refRes.updatedBuyerProfile) {
            const rewardedMember = sanitizeCustomerProfile(refRes.updatedBuyerProfile);
            setMember(rewardedMember);
            saveStoredCustomerSession({
              id: rewardedMember.id,
              name: rewardedMember.name,
              email: rewardedMember.email,
              tier: rewardedMember.tier,
              points: rewardedMember.points,
              totalSpent: rewardedMember.totalSpent || 0,
              isLoggedIn: true,
            });
            setToastNotification({
              type: 'success',
              message: `首購推薦達標！您與推薦人「${refRes.referrerName || '好友'}」已各獲得 50 狗勾幣獎勵`,
            });
          }
        })
        .catch(console.warn);
    }
    setToastNotification({
      type: 'success',
      message:
        lang === 'en'
          ? `🎉 Order ${newOrder.orderNumber} placed! Saved to your order history & live tracking.`
          : lang === 'ja'
          ? `🎉 ご注文 ${newOrder.orderNumber} が確定しました！購入履歴と配送追跡に保存されました。`
          : `🎉 訂單 ${newOrder.orderNumber} 成立！已永久保存至您的雲端購買紀錄與物流查詢。`,
    });
  };

  const wishlistSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);
  const comparisonSet = useMemo(() => new Set(comparisonIds), [comparisonIds]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const searchableProducts = useMemo(
    () => inStockOnly ? products.filter(isProductInStock) : products,
    [products, inStockOnly],
  );

  const matchingProducts = useMemo(() => {
    const query = prepareProductSearch(deferredSearchQuery);
    return searchableProducts.flatMap(product => {
      const { matched, score } = evaluateProductDeepSearch(product, query);
      return matched ? [{ product, score, family: resolveMaterialFamilyId(product.material || '') }] : [];
    });
  }, [searchableProducts, deferredSearchQuery]);

  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = { All: matchingProducts.length };
    for (const { family } of matchingProducts) {
      if (family !== 'All') counts[family] = (counts[family] ?? 0) + 1;
    }
    return counts;
  }, [matchingProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = matchingProducts.filter(({ family }) => selectedMaterial === 'All' || family === selectedMaterial);
    if (sortBy === 'relevance' && !normalizeProductSearch(deferredSearchQuery)) {
      return orderCatalog(filtered.map(({ product }) => product), catalogOrder?.productIds ?? []);
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'price_low') return a.product.price - b.product.price;
      if (sortBy === 'price_high') return b.product.price - a.product.price;
      if (sortBy === 'rating') return b.product.rating - a.product.rating || b.product.reviewsCount - a.product.reviewsCount;
      if (sortBy === 'relevance' && b.score !== a.score) return b.score - a.score;
      return b.product.reviewsCount - a.product.reviewsCount;
    }).map(({ product }) => product);
  }, [matchingProducts, selectedMaterial, sortBy, deferredSearchQuery, catalogOrder]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleOpenAIAdvisor = useCallback(() => setIsAIAdvisorOpen(true), []);
  const handleOpenSupport = useCallback(() => setIsCustomerSupportOpen(true), []);
  const handleOpenTracking = useCallback(() => {
    const genuineOrder = currentCustomerOrders.find(o => 
      !isMockOrder(o) && 
      (o.paymentStatus === 'paid' || o.isVerifiedByNewebPay) && 
      o.trackingNumber && 
      o.trackingNumber !== '77391829310' && 
      !o.trackingNumber.includes('77391829310')
    );
    setTrackingNumberInput(genuineOrder?.trackingNumber || '');
    setIsTrackingOpen(true);
  }, [currentCustomerOrders]);
  const handleOpenMember = useCallback(() => {
    if (location.pathname === '/profile') window.dispatchEvent(new Event('resetProfileModal'));
    else navigate('/profile');
  }, [location.pathname, navigate]);
  const handleSearchCatalog = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedMaterial('All');
    previousSharedParams.current = '';
    const hash = '#storefront-product-grid';
    if (location.pathname === '/' && location.hash === hash && !sharedCatalogParams) {
      document.getElementById('storefront-product-grid')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else {
      navigate({ pathname: '/', hash });
    }
  }, [location.pathname, location.hash, navigate, sharedCatalogParams]);
  const handleHeaderProduct = useCallback((product: FilamentProduct) => {
    if (location.pathname === '/') handleOpenProductDetail(product);
    else navigate({ pathname: '/', search: new URLSearchParams({ product: product.id }).toString() }, {
      state: { openedProduct: true },
    });
  }, [location.pathname, handleOpenProductDetail, navigate]);
  const handleOpenAuth = useCallback(() => setIsAuthOpen(true), []);
  const handleOpenFilamentLab = useCallback(() => setIsFilamentLabOpen(true), []);
  const handleOpenCompare = useCallback(() => setIsCompareModalOpen(true), []);
  const handleOpenWishlist = useCallback(() => setIsWishlistOpen(true), []);
  const handleOpenHistory = useCallback(() => setIsHistoryOpen(true), []);
  const handleOpenRecycle = useCallback(() => setIsRecycleOpen(true), []);

  return (
    <div key={lang} className="min-h-screen bg-slate-100/60 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <RouteScroll />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[150] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900">
        {lang === 'en' ? 'Skip to content' : lang === 'ja' ? 'メインコンテンツへ移動' : '跳到主要內容'}
      </a>
      {/* Universal Top Navigation with Unified Real-time Marquee */}
      <Navbar
        announcement={announcement}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={handleUpdateLang}
        currency={currency}
        setCurrency={handleUpdateCurrency}
        cartCount={cartCount}
        onOpenCart={handleOpenCart}
        onOpenAIAdvisor={handleOpenAIAdvisor}
        onOpenSupport={handleOpenSupport}
        onOpenTracking={handleOpenTracking}
        openMemberModal={handleOpenMember}
        isOwnerAdmin={isOwnerAdmin}
        onSearchCatalog={handleSearchCatalog}
        onOpenAuth={handleOpenAuth}
        onOpenFilamentLab={handleOpenFilamentLab}
        onOpenCompare={handleOpenCompare}
        compareCount={comparisonIds.length}
        onOpenWishlist={handleOpenWishlist}
        wishlistCount={wishlistIds.length}
        onOpenHistory={handleOpenHistory}
        historyCount={recentlyViewedCount}
        onSelectProduct={handleHeaderProduct}
        onOpenRecycle={handleOpenRecycle}
        isLoggedIn={isLoggedIn}
        member={member}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-8 overflow-x-hidden">
        <Suspense
          fallback={
            <div className="py-24 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
            </div>
          }
        >
        <Routes>
          <Route path="/privacy-policy" element={<><SEO title={lang === 'en' ? 'Privacy Policy - GodDog 3D' : lang === 'ja' ? 'プライバシーポリシー - 神狗勾 3D' : '隱私權保護政策 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Privacy Policy' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア プライバシーポリシー' : '神狗勾耗材商城隱私權保護政策'} url="/privacy-policy" /><PrivacyPolicy lang={lang} /></>} />
          <Route path="/terms" element={<><SEO title={lang === 'en' ? 'Terms of Service - GodDog 3D' : lang === 'ja' ? '利用規約 - 神狗勾 3D' : '服務條款 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Terms of Service' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア 利用規約' : '神狗勾耗材商城服務條款'} url="/terms" /><TermsOfService lang={lang} /></>} />
          <Route path="/refund-policy" element={<><SEO title={lang === 'en' ? 'Refund Policy - GodDog 3D' : lang === 'ja' ? '返品・返金ポリシー - 神狗勾 3D' : '退換貨政策 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Refund & Return Policy' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア 返品・返金ポリシー' : '神狗勾耗材商城退換貨政策'} url="/refund-policy" /><RefundPolicy lang={lang} /></>} />
          <Route path="/contact" element={<><SEO title={lang === 'en' ? 'Contact Us - GodDog 3D' : lang === 'ja' ? 'お問い合わせ - 神狗勾 3D' : '聯絡我們 - 神狗勾 3D'} description="有任何 3D 列印耗材或訂單問題嗎？請隨時聯絡神狗勾客服團隊，我們提供專業技術支援。" url="/contact" /><ContactUs lang={lang} /></>} />
          <Route path="/about" element={<AboutUs lang={lang} />} />
          <Route path="/faq" element={<FAQPage lang={lang} />} />
          <Route path="/blog" element={<BlogList adSenseConfig={adSenseConfig} lang={lang} />} />
          <Route path="/blog/:slug" element={<BlogPostPage adSenseConfig={adSenseConfig} lang={lang} />} />
          <Route path="/guide" element={<MaterialGuidePage products={products} onSelectProduct={handleOpenProductDetail} onFilterCategory={(mat) => { previousSharedParams.current = ''; setSearchQuery(''); setSelectedMaterial(resolveMaterialFamilyId(mat)); navigate({ pathname: '/', hash: '#storefront-product-grid' }); }} lang={lang} />} />
          <Route path="/store" element={<Navigate to="/" replace />} />
          <Route path="/r/:code" element={<ReferralHandler />} />
          <Route path="/profile" element={<><SEO title={t.personalProfile} noIndex description={lang === 'en' ? 'GodDog 3D Maker Member Center' : lang === 'ja' ? '神狗勾3Dフィラメント公式 会員マイページ' : '神狗勾耗材商城會員中心'} url="/profile" /><ProfilePage
            member={member} 
            orders={currentCustomerOrders} 
            setOrders={setOrders} 
            setMember={setMember} 
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            lang={lang}
            onChangeLang={handleUpdateLang}
            currency={currency}
            onChangeCurrency={handleUpdateCurrency}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onLoginClick={() => setIsAuthOpen(true)} 
            onOpenTracking={(trk) => {
              if (trk && trk !== '77391829310' && !trk.includes('77391829310')) {
                setTrackingNumberInput(trk);
              } else {
                setTrackingNumberInput('');
              }
              setIsTrackingOpen(true);
            }} 
            onOpenProductDetail={(item) => {
              const full = products.find(p => p.id === item.id);
              if (full) {
                saveCustomerRecentlyViewed(memberIdRef.current || auth.currentUser?.uid, full).catch(() => {});
                navigate(`/?product=${encodeURIComponent(full.id)}`);
              }
            }}
            onAddToCart={(item) => {
              const full = products.find(p => p.id === item.id);
              return full ? addAvailableProductToCart(full) : false;
            }}
            onOpenWishlist={handleOpenWishlist}
            onOpenSupport={(promptText) => {
              if (promptText) setSupportInitialPrompt(promptText);
              setIsCustomerSupportOpen(true);
            }}
          /></>} />
          <Route path="/subscription" element={<><SEO title={lang === 'en' ? 'Subscription Plans - GodDog 3D' : lang === 'ja' ? '定期便・サブスク管理 - 神狗勾 3D' : '我的訂閱管理 - 神狗勾 3D'} description={lang === 'en' ? 'Manage your 3D printing maker VIP subscription, check remaining billing cycles, G-coin points and plans.' : lang === 'ja' ? '3DプリントメーカーVIP定期便プランの管理、残存期間、G-Coin残高、プラン更新設定。' : '管理您的 3D 列印創客 VIP 訂閱方案、查詢剩餘週期、點數餘額與續約設定。'} url="/subscription" /><SubscriptionPage member={member} setMember={setMember} onLoginClick={() => setIsAuthOpen(true)} lang={lang} /></>} />
          <Route path="/my-subscription" element={<Navigate to="/subscription" replace />} />
          <Route path="*" element={location.pathname !== '/' && activeTab !== 'admin' ? (
            <section className="mx-auto my-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 sm:my-16 sm:p-10">
              <SEO title={lang === 'en' ? 'Page not found' : lang === 'ja' ? 'ページが見つかりません' : '找不到這個頁面'} noIndex />
              <h1 className="text-xl font-bold">{lang === 'en' ? 'Page not found' : lang === 'ja' ? 'ページが見つかりません' : '找不到這個頁面'}</h1>
              <Link to="/" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                {lang === 'en' ? 'Back to store' : lang === 'ja' ? 'ストアに戻る' : '返回商城'}
              </Link>
            </section>
          ) : <><SEO title={lang === 'en' ? 'Home - GodDog 3D Filaments' : lang === 'ja' ? 'ホーム - 神狗勾 3D フィラメント' : '首頁 - 神狗勾耗材旗艦館'} description={lang === 'en' ? 'GodDog 3D is Taiwan leading 3D printing filament store, offering high-speed PLA, PETG, TPU, and Carbon Fiber.' : lang === 'ja' ? '神狗勾 3Dは最高峰の3Dプリント用フィラメント専門店。高速PLA、PETG、TPU、カーボン配合線材を豊富にお届け。' : '神狗勾耗材商城為台灣頂尖 3D 列印耗材專營商店，專為創客與專業人士提供高品質的高速 PLA、PETG 等線材。'} url="/" noIndex={activeTab === 'admin'} product={viewingProduct} products={products} />
        {activeTab === 'store' ? (
          /* ================================================================= */
          /* CUSTOMER STOREFRONT VIEW                                          */
          /* ================================================================= */
          <div className="space-y-3.5 sm:space-y-4 lg:space-y-5">
            {/* Compact Member Sign-in Strip */}
            {!isLoggedIn && (
              <div className="bg-amber-50/75 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {lang === 'en' ? 'New member perk: 50 G-Coins on sign-in' : lang === 'ja' ? '初回特典：ログインで50 G-Coin進呈' : '新會員登入即贈 50 點紅利積分'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline truncate">
                      {lang === 'en' ? '· Redeem at checkout & track shipments live' : lang === 'ja' ? '· 決済利用・配送リアルタイム追跡に対応' : '· 結帳直接折抵現金，支援超商物流即時追蹤'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  {lang === 'en' ? 'Sign In' : lang === 'ja' ? 'ログイン' : '登入領取'}
                </button>
              </div>
            )}

            {/* Daylight Flagship Storefront Cover */}
            <section className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="grid md:grid-cols-[1.25fr_1fr] items-stretch">
                <div className="p-5 sm:p-7 lg:p-9 space-y-3 self-center min-w-0">
                  <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                    {lang === 'en'
                      ? 'Taiwan Local Stock · Same-Day Dispatch'
                      : lang === 'ja'
                      ? '国内在庫即納 · 最短当日発送'
                      : '台灣現貨倉儲 · 拓竹 AMS 與高速機適用'}
                  </div>

                  <h1 className="text-[26px] sm:text-4xl lg:text-[38px] font-extrabold tracking-tight leading-[1.16] text-slate-900 dark:text-white text-balance">
                    {lang === 'en'
                      ? 'Precision 3D Filaments for High-Speed Printing'
                      : lang === 'ja'
                      ? '高速造形を安定させる 3D 専門フィラメント'
                      : '為穩定高速列印而生的 3D 專業線材'}
                  </h1>

                  <p className="text-xs sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                    {lang === 'en'
                      ? 'Authentic GodDog, Bambu Lab, eSUN & Polymaker stock. Laser-checked to ±0.02mm and dispatched in moisture-sealed bags.'
                      : lang === 'ja'
                      ? 'GodDog・Bambu Lab・eSUN・Polymaker 正規在庫。±0.02mm レーザー管理と防湿密封袋包装でお届け。'
                      : '嚴選神狗勾、Bambu Lab 拓竹、eSUN 與 Polymaker 原廠正品。全線通過 ±0.02mm 雙軸測徑檢驗，採用密封袋防潮包裝當日寄出。'}
                  </p>

                {/* Crisp Dual CTAs */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    id="hero-scroll-catalog-btn"
                    onClick={() => {
                      const el = document.getElementById('storefront-catalog-heading');
                      el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
                    }}
                    className="btn-tactile-primary group flex-1 sm:flex-initial justify-center px-5 py-2.5 sm:py-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <span>
                      {lang === 'en'
                        ? `Browse Catalog (${products.length})`
                        : lang === 'ja'
                        ? `全商品を見る (${products.length})`
                        : `瀏覽全館耗材 (${products.length})`}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>

                  <button
                    id="hero-ai-advisor-cta-btn"
                    onClick={() => setIsAIAdvisorOpen(true)}
                    className="group flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/85 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-all duration-150 hover:shadow-xs active:scale-97 whitespace-nowrap"
                  >
                    <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
                    <span>{lang === 'en' ? 'Match Printer' : lang === 'ja' ? '機種別選材' : '依機型選材'}</span>
                  </button>
                </div>
                </div>
                <img src="/images/filament-studio.webp" width={840} height={469} alt="" fetchPriority="high" className="w-full h-28 sm:h-40 md:h-full md:min-h-48 object-cover object-center" />
              </div>

                  {/* Unified Bottom Spec & Guarantee Strip (Consolidated, responsive spacing so mobile never truncates) */}
                  <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-px">
                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-2.5">
                      <Truck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {lang === 'en' ? '24H Store Dispatch' : lang === 'ja' ? '24時間スピード出荷' : '24H 超商快速出貨'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {lang === 'en' ? 'Free over NT$999' : lang === 'ja' ? 'NT$999以上送料無料' : '滿 NT$999 即享免運'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-2.5">
                      <Package className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {lang === 'en' ? 'Moisture-Sealed Bag' : lang === 'ja' ? '防湿密封袋包装' : '密封袋防潮出貨'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {lang === 'en' ? 'Unopened warranty' : lang === 'ja' ? '未開封吸湿保証' : '未拆封吸濕雙重保固'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {lang === 'en' ? 'NewebPay SSL' : lang === 'ja' ? '暗号化安全決済' : '藍新 SSL 安全金流'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          {lang === 'en' ? 'Card / Apple Pay' : lang === 'ja' ? 'カード / Apple Pay' : '信用卡 / Apple Pay'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 sm:gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight tabular-nums">
                          {lang === 'en' ? '±0.02mm Precision' : lang === 'ja' ? '±0.02mm 高精度' : '±0.02mm 雙軸測徑'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 tabular-nums">
                          {lang === 'en' ? '600mm/s high-speed' : lang === 'ja' ? '600mm/s 高速対応' : '600mm/s 高速相容'}
                        </div>
                      </div>
                    </div>
              </div>
            </section>

            {/* Studio Precision Utility Strip (2x2 mobile, 4-across desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {[
                {
                  id: 'quick-action-ai-bot',
                  onClick: () => setIsCustomerSupportOpen(true),
                  icon: MessageSquare,
                  title: lang === 'en' ? 'Tech Support' : lang === 'ja' ? '技術サポート' : '技術與選材客服',
                  subtitle: lang === 'en' ? 'Slicing & print QA' : lang === 'ja' ? '造形トラブル相談' : '參數與列印諮詢',
                  iconTone: 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/15 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
                  hoverBorder: 'hover:border-sky-300/80 dark:hover:border-sky-700/70',
                  badgeCount: 0,
                },
                {
                  id: 'quick-action-filament-lab',
                  onClick: () => setIsFilamentLabOpen(true),
                  icon: Wrench,
                  title: lang === 'en' ? 'Maker Lab' : lang === 'ja' ? '計算ツール' : '耗材實驗與試算',
                  subtitle: lang === 'en' ? 'Length & cost math' : lang === 'ja' ? 'コスト・残量計算' : '長度與成本估算',
                  iconTone: 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/15 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
                  hoverBorder: 'hover:border-indigo-300/80 dark:hover:border-indigo-700/70',
                  badgeCount: 0,
                },
                {
                  id: 'quick-action-recycle',
                  onClick: () => setIsRecycleOpen(true),
                  icon: Recycle,
                  title: lang === 'en' ? 'Spool Recycle' : lang === 'ja' ? '空スプール還元' : '空盤回收換幣',
                  subtitle: lang === 'en' ? 'Earn store credit' : lang === 'ja' ? 'ポイント還元' : '空盤折抵購物金',
                  iconTone: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/15 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
                  hoverBorder: 'hover:border-emerald-300/80 dark:hover:border-emerald-700/70',
                  badgeCount: 0,
                },
                {
                  id: 'quick-action-compare',
                  onClick: () => setIsCompareModalOpen(true),
                  icon: Scale,
                  title: lang === 'en' ? 'Spec Compare' : lang === 'ja' ? '物性・規格比較' : '耗材規格對比',
                  subtitle: lang === 'en' ? 'Mechanical datasheets' : lang === 'ja' ? '物性データ比較' : '物性強度比較',
                  iconTone: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/15 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
                  hoverBorder: 'hover:border-amber-300/80 dark:hover:border-amber-700/70',
                  badgeCount: comparisonIds.length,
                },
              ].map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.button
                    key={tool.id}
                    id={tool.id}
                    onClick={tool.onClick}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.035, ease: 'easeOut' }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.965 }}
                    className={`group relative bg-white dark:bg-slate-900/95 border border-slate-200/85 dark:border-slate-800 ${tool.hoverBorder} rounded-2xl flex items-center gap-2.5 sm:gap-3.5 p-3 sm:px-4 sm:py-3.5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_24px_-12px_rgba(15,23,42,0.12)] dark:shadow-none transition-all duration-200 cursor-pointer text-left`}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border ${tool.iconTone} flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105`}>
                      <Icon className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] sm:text-[13.5px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
                          {tool.title}
                        </span>
                        {tool.badgeCount > 0 && (
                          <span className="text-[10px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                            {tool.badgeCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        {tool.subtitle}
                      </div>
                    </div>

                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 hidden sm:block" />
                  </motion.button>
                );
              })}
            </div>

            {/* Unified Storefront Search & Material Filter Console */}
            <div className="relative bg-white dark:bg-slate-900/95 rounded-2xl border border-slate-200/85 dark:border-slate-800 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.08)] dark:shadow-none">
              <h2 id="storefront-catalog-heading" className="scroll-mt-24 lg:scroll-mt-36 px-3.5 sm:px-5 pt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {lang === 'en' ? 'Shop filaments & accessories' : lang === 'ja' ? 'フィラメント・周辺機器' : '選購線材與配件'}
              </h2>
              {/* Upper Toolbar: Search Bar + Quiet Count & Integrated Sort */}
              <div className="p-3.5 sm:px-5 sm:pt-4 sm:pb-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
                <div className="flex-1 md:max-w-xl">
                  <SearchAutocomplete
                    id="storefront-product-search"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    products={searchableProducts}
                    keepQueryOnProductSelect
                    placeholder={t.searchPlaceholderInput || (lang === 'en' ? 'Search PLA+, CF, PETG or brand...' : lang === 'ja' ? 'PLA+・カーボン・PETG 等を検索' : '搜尋 PLA+、碳纖維、PETG 或品牌型號')}
                    onSelectProduct={handleOpenProductDetail}
                    onSelectMaterial={(m) => setSelectedMaterial(resolveMaterialFamilyId(m))}
                  />
                </div>

                {/* Utility Bar: Unboxed Tabular Result Count + Custom Sort Select */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 shrink-0 px-0.5 md:px-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span role="status" aria-atomic="true">
                      {lang === 'en' ? 'Showing' : lang === 'ja' ? '該当' : '共'}{' '}
                      <strong className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {filteredAndSortedProducts.length}
                      </strong>{' '}
                      {lang === 'en' ? 'items' : lang === 'ja' ? '件' : '款'}
                    </span>
                    {Boolean(activeCatalogParams.size) && (
                      <button
                        type="button"
                        onClick={resetCatalogFilters}
                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline underline-offset-2 cursor-pointer ml-1"
                      >
                        <span>{lang === 'en' ? 'Reset' : lang === 'ja' ? 'クリア' : '清除條件'}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative inline-flex items-center">
                    <select
                      aria-label={lang === 'en' ? 'Sort products' : lang === 'ja' ? '並び替え' : '商品排序方式'}
                      value={sortBy}
                      onChange={event => setSortBy(readCatalogFilters(new URLSearchParams({ sort: event.target.value }), catalogMaterialIds).sort)}
                      className="appearance-none bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl pl-3 pr-8 py-1.5 min-h-11 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer outline-hidden focus:border-slate-900 dark:focus:border-indigo-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-indigo-500/20 transition-colors"
                    >
                      <option value="relevance">{lang === 'en' ? 'Recommended' : lang === 'ja' ? 'おすすめ順' : '推薦排序'}</option>
                      <option value="popular">{lang === 'en' ? 'Most Popular' : lang === 'ja' ? '人気順' : '熱銷排行'}</option>
                      <option value="price_low">{lang === 'en' ? 'Price: Low → High' : lang === 'ja' ? '価格が安い順' : '價格：低至高'}</option>
                      <option value="price_high">{lang === 'en' ? 'Price: High → Low' : lang === 'ja' ? '価格が高い順' : '價格：高至低'}</option>
                      <option value="rating">{lang === 'en' ? 'Top Rated' : lang === 'ja' ? '高評価順' : '創客好評最高'}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {activeCatalogParams.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-3.5 pb-2 sm:px-5">
                  <button type="button" onClick={shareCatalogFilters}
                    className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-300 dark:hover:bg-slate-800">
                    {lang === 'en' ? 'Copy filtered link' : lang === 'ja' ? '絞り込みリンクをコピー' : '複製篩選連結'}
                  </button>
                  <span role="status" className="text-xs text-slate-600 dark:text-slate-300">
                    {catalogCopied === 'catalog' ? (lang === 'en' ? 'Link copied' : lang === 'ja' ? 'コピーしました' : '已複製篩選連結')
                      : catalogCopyFailed === 'catalog' ? (lang === 'en' ? 'Copy failed' : lang === 'ja' ? 'コピー失敗' : '複製失敗') : ''}
                  </span>
                </div>
              )}

              {/* Lower Rail: Architectural Segmented Base-Material Family Tabs */}
              <div className="relative border-t border-slate-100 dark:border-slate-800/80 px-3.5 py-2.5 sm:px-5 sm:py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={inStockOnly} onChange={event => setInStockOnly(event.target.checked)} className="size-4 accent-indigo-600" />
                    {lang === 'en' ? 'In stock only' : lang === 'ja' ? '在庫ありのみ' : '只看有庫存'}
                  </label>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 shrink-0 mr-1 select-none">
                    {lang === 'en' ? 'Material' : lang === 'ja' ? '材質' : '材質'}
                  </span>
                  {STOREFRONT_MATERIAL_FAMILIES.map((fam) => {
                    const isSelected = selectedMaterial === fam.id;
                    const count = materialCounts[fam.id] ?? 0;
                    const label = fam.id === 'All' ? t.allCategories : (fam.labels[lang] || fam.labels['zh-TW']);
                    return (
                      <button
                        key={fam.id}
                        id={`filter-material-${fam.id}`}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedMaterial(fam.id)}
                        className={`relative px-2.5 sm:px-3 py-1.5 min-h-11 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 select-none flex items-center gap-1.5 active:scale-[0.97] ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        <span>{label}</span>
                        <span
                          className={`text-[10px] font-mono tabular-nums transition-colors ${
                            isSelected ? 'text-slate-300 dark:text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Product Grid (Instant reconciliation without AnimatePresence exit-block or per-card motion wrappers) */}
            <div id="storefront-product-grid" className="scroll-mt-20 lg:scroll-mt-32">
              {filteredAndSortedProducts.length === 0 ? (
                <div
                  key="empty-products-state"
                  className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-3"
                >
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                    {lang === 'en' ? 'No matching 3D filaments found' : lang === 'ja' ? '該当する3Dフィラメントが見つかりませんでした' : '找不到符合條件的 3D 列印耗材'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Try adjusting the filters or clearing your search.' : lang === 'ja' ? 'フィルターや検索キーワードを変更してください。' : '試著調整篩選條件，或清除搜尋關鍵字。'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedMaterial('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    {lang === 'en' ? 'Reset Search Criteria' : lang === 'ja' ? '検索条件をリセット' : '重設搜尋條件'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                  {filteredAndSortedProducts.map((product, idx) => (
                    <React.Fragment key={product.id}>
                      {idx === 3 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
                        <NativeProductAdCard key="native-ad-feed-1" config={adSenseConfig} />
                      )}
                      <div className="product-grid-card h-full">
                        <ProductCard
                          product={product}
                          currency={currency}
                          lang={lang}
                          onAddToCart={handleAddToCart}
                          onViewDetail={handleOpenProductDetail}
                          isWishlisted={wishlistSet.has(product.id)}
                          onToggleWishlist={handleToggleWishlist}
                          isCompared={comparisonSet.has(product.id)}
                          onToggleCompare={handleToggleCompare}
                          onReviewSubmitted={handleReviewSubmitted}
                          priority={idx < 6}
                        />
                      </div>
                      {idx === 7 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
                        <NativeProductAdCard key="native-ad-feed-2" config={adSenseConfig} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Viewed Products Shelf (Lazy-loaded below-the-fold) */}
            <Suspense fallback={null}>
              <RecentlyViewedSection
                products={products}
                currency={currency}
                lang={lang}
                member={member}
                onSelectProduct={handleOpenProductDetail}
                onAddToCart={addAvailableProductToCart}
                onOpenHistoryModal={() => setIsHistoryOpen(true)}
              />
            </Suspense>

            {/* Google AdSense Footer Leaderboard Banner (Hidden when ads disabled) */}
            {adSenseConfig.enabled && adSenseConfig.showFooterBanner && (
              <AdSenseBanner
                placement="footer-bottom"
                config={adSenseConfig}
              />
            )}
          </div>
        ) : isOwnerAdmin ? (
          /* ================================================================= */
          /* INTERNAL MANAGEMENT ADMIN DASHBOARD (babe0615@gmail.com ONLY)     */
          /* ================================================================= */
          <AdminDashboard
            products={products}
            catalogOrder={catalogOrder}
            catalogOrderConnectionFailed={catalogOrderConnectionFailed}
            onCatalogOrderSaved={setCatalogOrder}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            analytics={analytics}
            lang={lang}
            currency={currency}
            adSenseConfig={adSenseConfig}
            onUpdateAdSenseConfig={handleUpdateAdSenseConfig}
            onSyncAdSenseToFirebase={handleSyncAdSenseToFirebase}
            isSyncingAdSense={isSyncingAdSense}
            lastSyncedTime={adSenseConfig.lastSyncedAt}
          />
        ) : (
          <div className="max-w-lg mx-auto my-16 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'en'
                  ? 'Administrator Access Restricted'
                  : lang === 'ja'
                  ? '管理者アクセス制限'
                  : '後台管理權限受限'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'en'
                  ? 'This management portal is strictly restricted to the authorized Google owner account. Please sign in with the designated administrator account or return to the store.'
                  : lang === 'ja'
                  ? '管理パネルは指定されたGoogleオーナーアカウント専用です。認証された管理者アカウントでログインするか、ストアへお戻りください。'
                  : '此營運管理後台僅限官方指定管理員 Google 帳號登入存取，一般訪客與其他帳號無法進入。'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  {lang === 'en' ? 'Return to Store' : lang === 'ja' ? 'ストアに戻る' : '返回商城首頁'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                >
                  {lang === 'en' ? 'Admin Google Sign-In' : lang === 'ja' ? '管理者Googleログイン' : '使用管理員 Google 帳號登入'}
                </button>
              </div>
            </div>
          </div>
        )}
          </>}
        />
        </Routes>
        </Suspense>
      </main>

      {/* Floating Desktop Skyscraper (Hidden when ads disabled) */}
      {adSenseConfig.enabled && adSenseConfig.showSidebarAd && (
        <FloatingSkyscraperAd config={adSenseConfig} />
      )}

      <Suspense fallback={null}>
        <Footer lang={lang} />
      </Suspense>
      
      {/* Global Toast Notification - Top floating non-blocking layer (z-[110]) so it never occludes CartDrawer or bottom buttons */}
      <AnimatePresence>
        {toastMsg && (
          <div className="fixed top-16 sm:top-20 lg:top-28 left-1/2 -translate-x-1/2 z-[110] pointer-events-none w-[calc(100%-2rem)] max-w-sm flex justify-center">
            <motion.div
              key={toastMsg.id}
              initial={reduceStoreMotion ? false : { opacity: 0, y: -8, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceStoreMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -5, transition: { duration: .12 } }}
              transition={{ duration: reduceStoreMotion ? 0 : .16, ease: [.2, .78, .26, 1] }}
              role="status"
              onClick={() => setToastMsg(null)}
              className="pointer-events-auto bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs sm:text-sm font-semibold leading-snug truncate max-w-[260px]">
                {toastMsg.text.replace(/神狗勾\s*/g, '').replace(/莫蘭迪\s*/g, '')}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* GLOBAL LAZY MODALS & DRAWERS (Loaded on-demand + idle prefetched)   */}
      {/* =================================================================== */}
      <Suspense fallback={<ModalLoadingFallback />}>
        {viewingProduct && (
          <ProductDetailModal
            key={viewingProduct.id}
            product={viewingProduct}
            relatedProducts={relatedProducts}
            cartItems={cartItems}
            onSelectRelated={handleOpenProductDetail}
            isWishlisted={wishlistSet.has(viewingProduct.id)}
            onToggleWishlist={() => handleToggleWishlist(viewingProduct.id)}
            isCompared={comparisonSet.has(viewingProduct.id)}
            compareCount={comparisonIds.length}
            onToggleCompare={() => {
              if (!comparisonSet.has(viewingProduct.id) && comparisonIds.length >= 4) closeProductDetail();
              handleToggleCompare(viewingProduct.id);
            }}
            onOpenCompare={() => {
              closeProductDetail();
              setIsCompareModalOpen(true);
            }}
            currency={currency}
            lang={lang}
            member={member}
            onClose={closeProductDetail}
            onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
            onQuickCheckout={handleQuickCheckout}
            onAskAI={(p) => {
              closeProductDetail();
              const promptText =
                lang === 'en'
                  ? `What are the best slicer settings, nozzle/bed temps, and printer compatibility tips for ${p.name} (${p.material})?`
                  : lang === 'ja'
                  ? `【${p.name}】(${p.material}) の最適なスライサー設定、ノズル・ベッド温度、対応機種のポイントを教えてください！`
                  : `我想了解【${p.name}】(${p.material}) 的最佳切片參數、噴嘴溫度與相容性建議！`;
              setSupportInitialPrompt(promptText);
              setIsCustomerSupportOpen(true);
            }}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            catalog={catalogById}
            unavailableLines={unavailableCartLines}
            onUpdateQuantity={handleUpdateCartQuantity}
            onUpdateColor={handleUpdateCartColor}
            onRemoveItem={handleRemoveCartItem}
            wishlistedIds={wishlistSet}
            onSaveToWishlist={productId => {
              if (!wishlistItemsRef.current.includes(productId)) handleToggleWishlist(productId);
            }}
            onClearCart={() => {
              cartItemsRef.current = [];
              persistCartEdit([]);
              setCartItems([]);
            }}
            onAddQuickItem={handleAddToCart}
            onProceedCheckout={handleProceedCheckout}
            currency={currency}
            lang={lang}
            member={member}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            hasUnavailableItems={unavailableCartLines.some(Boolean)}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            currency={currency}
            lang={lang}
            member={member}
            pointsToUse={checkoutPointsToUse}
            initialCouponCode={checkoutCouponCode}
            onOrderCompleted={handleOrderCompleted}
            onPendingOrderCreated={handlePendingOrderCreated}
            onOpenTracking={(trk) => {
              setTrackingNumberInput(trk);
              setIsTrackingOpen(true);
            }}
          />
        )}

        {isAIAdvisorOpen && (
          <AIAdvisorModal
            isOpen={isAIAdvisorOpen}
            onClose={() => setIsAIAdvisorOpen(false)}
            products={products}
            lang={lang}
            onAddToCart={(p, c, d) => handleAddToCart(p, c, d, 1)}
            onOpenSupportWithPrompt={(prompt) => {
              setSupportInitialPrompt(prompt);
              setIsCustomerSupportOpen(true);
            }}
          />
        )}

        {isTrackingOpen && (
          <TrackingModal
            isOpen={isTrackingOpen}
            onClose={() => setIsTrackingOpen(false)}
            defaultTrackingNumber={trackingNumberInput}
            orders={currentCustomerOrders}
            userId={isLoggedIn ? member?.id : undefined}
            lang={lang}
          />
        )}

        {isCustomerSupportOpen && (
          <CustomerSupportModal
            key={isLoggedIn ? member?.id ?? 'guest' : 'guest'}
            isOpen={isCustomerSupportOpen}
            onClose={() => {
              setIsCustomerSupportOpen(false);
              setSupportInitialPrompt('');
            }}
            viewingProduct={viewingProduct}
            cartItems={cartItems}
            member={isLoggedIn ? member : undefined}
            initialPrompt={supportInitialPrompt}
            lang={lang}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            lang={lang}
            onLoginSuccess={(user) => {
              const cleanUid = normalizeCustomerId(user.id);
              if (!cleanUid || auth.currentUser?.uid !== cleanUid) return;
              setIsLoggedIn(true);
              syncUserData(cleanUid, user);
            }}
          />
        )}
      </Suspense>

      {/* Persistent Sync & Status Toast Notification (Positioned clear of bottom-right floating chat widget) */}
      {toastNotification && (
        <div className="fixed bottom-24 lg:bottom-24 right-4 sm:right-6 z-50 max-w-sm w-full px-2 sm:px-4 animate-fade-in pointer-events-none">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                toastNotification.type === 'success' ? 'bg-emerald-400 animate-pulse' :
                toastNotification.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
              }`} />
              <span className="font-medium text-slate-100">{toastNotification.message}</span>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-white cursor-pointer shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Maker Lab, Comparison, History & Recycle Lazy Modals */}
      <Suspense fallback={<ModalLoadingFallback />}>
      {isFilamentLabOpen && (
        <FilamentLabModal
          isOpen={isFilamentLabOpen}
          onClose={() => setIsFilamentLabOpen(false)}
          products={products}
          currency={currency}
          lang={lang}
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
        />
      )}

      {/* Side-by-Side Product Comparison Modal */}
      {isCompareModalOpen && (
        <ProductComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          products={products}
          comparisonIds={comparisonIds}
          onToggleCompare={handleToggleCompare}
          onSetComparisonIds={persistComparisonEdit}
          onRemoveComparison={(id) => handleToggleCompare(id)}
          onClearComparison={() => persistComparisonEdit([])}
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
          currency={currency}
          lang={lang}
        />
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistIds={wishlistIds}
          products={products}
          onRemoveFromWishlist={handleToggleWishlist}
          onAddToCart={addAvailableProductToCart}
          onAddAllToCart={handleAddAllWishlistToCart}
          currency={currency}
          lang={lang}
        />
      )}

      {/* Global Browsing History Modal */}
      {isHistoryOpen && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          member={member}
          lang={lang}
          currency={currency}
          onOpenProductDetail={handleOpenProductDetail}
          onAddToCart={(item) => {
            const full = products.find(p => p.id === item.id);
            return full ? addAvailableProductToCart(full) : false;
          }}
        />
      )}

      {/* Spool Recycle Modal */}
      {isRecycleOpen && (
        <SpoolRecycleModal
          isOpen={isRecycleOpen}
          onClose={() => setIsRecycleOpen(false)}
          member={member}
          onRewardPoints={handleRewardPoints}
          lang={lang}
        />
      )}
      </Suspense>

      {/* Free Draggable AI Floating Chat & Advisor Bubble with Recycle / Hide Drop Zone */}
      <Suspense fallback={null}>
        <DraggableChatWidget
          onOpenSupport={() => setIsCustomerSupportOpen(true)}
          onOpenAdvisor={() => setIsAIAdvisorOpen(true)}
          lang={lang}
        />
      </Suspense>

      {/* Floating Sticky Comparison Indicator Bar (Positioned gracefully above bottom nav without blocking center button) */}
      {comparisonIds.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 sm:gap-4 animate-bounce-short max-w-[92vw]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'en' ? 'Selected ' : lang === 'ja' ? '選択中 ' : '已選 '}
              <span className="font-mono text-amber-400 text-sm">{comparisonIds.length}</span>
              {lang === 'en' ? ' / 4 items' : lang === 'ja' ? ' / 4 件' : ' / 4 款'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              {lang === 'en' ? 'Compare Specs' : lang === 'ja' ? 'スペック比較' : '橫向規格對比'}
            </button>
            <button
              onClick={() => {
                persistComparisonEdit([]);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={lang === 'en' ? 'Clear selection' : lang === 'ja' ? '選択解除' : '清空選取'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Tab Bar (Standard Mobile Experience) - Hidden during Cart or Checkout */}
      {!isCheckoutOpen && !isCartOpen && (
        <nav
          id="mobile-bottom-nav-bar"
          aria-label={lang === 'en' ? 'Main navigation' : lang === 'ja' ? 'メインナビゲーション' : '主導覽'}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/90 py-1 px-1.5 shadow-2xl flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))] safe-area-bottom"
        >
          {/* Tab 1: Store Catalog */}
          <button
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              if (location.pathname !== '/' || location.search || location.hash) navigate('/');
              else window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] active:scale-95 ${
              location.pathname === '/' && !isFilamentLabOpen && !isWishlistOpen ? 'text-indigo-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">
              {lang === 'en' ? 'Store' : lang === 'ja' ? 'ショップ' : '商城'}
            </span>
          </button>

          {/* Tab 2: Material Guide (選材指南 - Full Page) */}
          <button
            onClick={() => {
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              setIsFilamentLabOpen(false);
              navigate('/guide');
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] active:scale-95 ${
              location.pathname === '/guide' ? 'text-indigo-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">
              {lang === 'en' ? 'Guide' : lang === 'ja' ? '選材ガイド' : '選材指南'}
            </span>
          </button>

          {/* Tab 3: AI Chatbot (AI 機器人 / AI 客服 - Highlighted Center Orb) */}
          <button
            id="mobile-bottom-nav-ai-chat"
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              setIsCustomerSupportOpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-4 cursor-pointer group min-w-[54px] active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-active:scale-90 transition-transform duration-150 border-2 border-white dark:border-slate-800">
              <Bot className="w-6 h-6 text-sky-100" />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              {t.bottomAiBot || (lang === 'en' ? 'AI Chat' : lang === 'ja' ? 'AIロボット' : 'AI 機器人')}
            </span>
          </button>

          {/* Tab 4: Maker Blog (創客專欄 - Full Page) */}
          <button
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsAIAdvisorOpen(false);
              setIsWishlistOpen(false);
              navigate('/blog');
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] relative active:scale-95 ${
              location.pathname === '/blog' ? 'text-indigo-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">
              {lang === 'en' ? 'Articles' : lang === 'ja' ? 'コラム' : '創客專欄'}
            </span>
          </button>

          {/* Tab 5: Profile */}
          <button
            id="mobile-profile-entry"
            type="button"
            aria-current={location.pathname === '/profile' ? 'page' : undefined}
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              handleOpenMember();
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] relative active:scale-95 ${
              location.pathname === '/profile' && !isFilamentLabOpen && !isWishlistOpen ? 'text-indigo-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">
              {t.personalProfile}
            </span>
          </button>
        </nav>
      )}
      <FlyToCartOverlay />
    </div>
  );
}
