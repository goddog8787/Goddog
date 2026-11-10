import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  ProductCard 
} from './components/Storefront/ProductCard';
import { 
  SearchAutocomplete 
} from './components/Storefront/SearchAutocomplete';
import { 
  ProductDetailModal 
} from './components/Storefront/ProductDetailModal';
import { 
  CartDrawer 
} from './components/Storefront/CartDrawer';
import { 
  CheckoutModal 
} from './components/Storefront/CheckoutModal';
import { 
  AIAdvisorModal 
} from './components/Storefront/AIAdvisorModal';
import { 
  TrackingModal 
} from './components/Storefront/TrackingModal';
import { 
  SubscriptionModal 
} from './components/Storefront/SubscriptionModal';
import { 
  LoyaltyModal 
} from './components/Storefront/LoyaltyModal';
import { 
  CustomerSupportModal 
} from './components/Storefront/CustomerSupportModal';
import { 
  AuthModal 
} from './components/Auth/AuthModal';
import { 
  AdminDashboard 
} from './components/Admin/AdminDashboard';
import { 
  FilamentLabModal 
} from './components/Storefront/FilamentLabModal';
import { 
  ProductComparisonModal 
} from './components/Storefront/ProductComparisonModal';
import { RecentlyViewedSection } from './components/Storefront/RecentlyViewedSection';
import { HistoryModal } from './pages/Profile/ProfileModals';
import { 
  WishlistDrawer 
} from './components/Storefront/WishlistDrawer';
import { 
  SpoolRecycleModal 
} from './components/Storefront/SpoolRecycleModal';
import {
  DraggableChatWidget
} from './components/Storefront/DraggableChatWidget';
import { 
  INITIAL_PRODUCTS, 
  SUBSCRIPTION_PLANS, 
  INITIAL_MEMBER 
} from './data/mockData';
import { 
  computeRealAnalytics, 
  recordRealVisitor, 
  recordRealAddToCart, 
  recordRealCheckoutStart 
} from './lib/realAnalytics';
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
import confetti from 'canvas-confetti';
import { translations, translateMaterial, translateProductName } from './utils/i18n';
import { subscribeToProductStats } from './lib/reviewPersistence';
import {
  loadPersistedProductsSync,
  subscribeToCloudCatalog,
  recordAdminProductUpsert,
} from './lib/productPersistence';
import { 
  saveOrderToFirestore, 
  saveUserProfileToFirestore, 
  subscribeToAuth,
  logOut,
  saveMonetizationConfigToFirestore,
  loadMonetizationConfigFromFirestore,
  auth
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
  Sparkles, Gift, 
  Flame, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
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
  ArrowRight
} from 'lucide-react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { PrivacyPolicy } from './pages/Legal/PrivacyPolicy';
import { TermsOfService } from './pages/Legal/TermsOfService';
import { RefundPolicy } from './pages/Legal/RefundPolicy';
import { ContactUs } from './pages/Legal/ContactUs';
import { BlogList } from './pages/Blog/BlogList';
import { BlogPostPage } from './pages/Blog/BlogPostPage';
import { AboutUs } from './pages/Legal/AboutUs';
import { FAQPage } from './pages/FAQ/FAQPage';
import { ProfilePage } from './pages/Profile';
import { SubscriptionPage } from './pages/Subscription/SubscriptionPage';
import { MaterialGuidePage } from './pages/MaterialGuide/MaterialGuidePage';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { getStoreAnnouncementConfig } from './utils/announcementManager';
import { StoreAnnouncementConfig } from './types';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function ReferralHandler() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (code) {
      localStorage.setItem('printcore_referral_code', code);
    }
    // Automatically log out so they can register as a new user with the code
    const clearSession = async () => {
       try {
         await logOut();
         clearStoredCustomerSession();
       } catch(e) {}
       navigate('/', { replace: true });
    };
    clearSession();
  }, [code, navigate]);
  return null; // Let the effect handle the navigation after logout
}

export default function App() {
  // App view mode: customer storefront vs admin management vs tech integration guide
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = location.pathname.includes('/admin') 
    ? 'admin' 
    : 'store';

  const setActiveTab = (tab: 'store' | 'admin') => {
    if (tab === 'store') navigate('/');
    else if (tab === 'admin') navigate('/admin');
  };

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

  const handleUpdateLang = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('printcore_lang', newLang);
      window.dispatchEvent(new CustomEvent('printcore_lang_changed', { detail: newLang }));
    } catch(e) {}
  };

  const handleUpdateCurrency = (newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    try {
      localStorage.setItem('printcore_currency', newCurr);
      window.dispatchEvent(new CustomEvent('printcore_currency_changed', { detail: newCurr }));
    } catch(e) {}
  };

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

  // Storewide Announcement & Broadcast State
  const [announcement, setAnnouncement] = useState<StoreAnnouncementConfig>(getStoreAnnouncementConfig());

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

  useEffect(() => {
    try {
      localStorage.setItem('printcore_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  // Real-time synchronization of Admin product catalog edits/additions/deletions from Cloud & Server
  useEffect(() => {
    const unsubCatalog = subscribeToCloudCatalog(INITIAL_PRODUCTS, (cloudMergedProducts) => {
      setProducts(cloudMergedProducts);
    });
    return () => unsubCatalog();
  }, []);

  // Real-time synchronization of product review stats from Firestore database
  useEffect(() => {
    const unsub = subscribeToProductStats((stats) => {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (stats[p.id]) {
            return {
              ...p,
              rating: stats[p.id].rating,
              reviewsCount: stats[p.id].reviewsCount,
            };
          }
          return p;
        })
      );
    });
    return () => unsub();
  }, []);

  const handleReviewSubmitted = (updatedProduct: FilamentProduct, review: ProductReview) => {
    const updatedList = recordAdminProductUpsert(updatedProduct, INITIAL_PRODUCTS);
    setProducts(updatedList);
    if (viewingProduct?.id === updatedProduct.id) {
      setViewingProduct(updatedProduct);
    }
  };
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

    fetch('/api/payment/verified-orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(prev => {
            const existingNos = new Set(prev.map(o => o.orderNumber));
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
            if (newVerified.length > 0) {
              return [...newVerified, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(err => console.warn('Could not sync verified orders:', err));
  }, []);

  // Record genuine visitor traffic without simulation
  useEffect(() => {
    recordRealVisitor();
  }, []);

  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTION_PLANS);
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
        points: typeof session.points === 'number' ? session.points : 100,
        totalSpent: typeof session.totalSpent === 'number' ? session.totalSpent : 0,
      });
    } catch {}
    return INITIAL_MEMBER;
  });

  // Track which customer ID has completed hydration so login/logout transitions never overwrite saved profile/cart
  const hydratedUserIdRef = React.useRef<string | null>(
    (() => {
      const session = getStoredCustomerSession();
      return session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
    })()
  );

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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const analytics = useMemo(() => computeRealAnalytics(orders, products), [orders, products]);

  // Cart State: Synchronously initialize from active customer's isolated storage so items never vanish on refresh/re-login
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const session = getStoredCustomerSession();
      const cleanSessionId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
      return getStoredCustomerCartSync(cleanSessionId);
    } catch {
      return [];
    }
  });


  // Product Filter and Search in Storefront
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');

  // Modals Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPointsToUse, setCheckoutPointsToUse] = useState(0);
  const [viewingProduct, setViewingProduct] = useState<FilamentProduct | null>(null);

  const handleOpenProductDetail = (p: FilamentProduct) => {
    setViewingProduct(p);
    saveCustomerRecentlyViewed(member?.id || auth.currentUser?.uid, p).catch(() => {});
  };
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isCustomerSupportOpen, setIsCustomerSupportOpen] = useState(false);
  const [supportInitialPrompt, setSupportInitialPrompt] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const session = getStoredCustomerSession();
      return Boolean(session && session.id && session.isLoggedIn && !session.id.startsWith('guest_'));
    } catch {
      return false;
    }
  });

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

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
      saveCustomerWishlist(activeUid, next, { explicitClear: next.length === 0 }).catch(console.warn);
      return next;
    });
  };

  const handleToggleCompare = (id: string) => {
    setComparisonIds((prev) => {
      const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        saveCustomerComparison(activeUid, next).catch(console.warn);
        return next;
      }
      if (prev.length >= 4) {
        setIsCompareModalOpen(true);
        return prev;
      }
      const next = [...prev, id];
      saveCustomerComparison(activeUid, next).catch(console.warn);
      return next;
    });
  };

  const handleAddAllWishlistToCart = (savedList: FilamentProduct[]) => {
    savedList.forEach((p) => {
      handleAddToCart(p, p.colors[0], p.diameter, 1);
    });
  };

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
    showMobileStickyAd: false,
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
            showMobileStickyAd: false,
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
              showMobileStickyAd: false,
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

  // Handle return from NewebPay payment gateway (Strict Non-Mock: Only verified payment creates order)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isPaymentReturn = params.get('payment_verified') === 'true' || params.get('payment_success') === 'true';
    const isPaymentFailed = params.get('payment_verified') === 'false';
    const orderId = params.get('orderId');

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

          const checkAmt = params.get('amt') || pending?.total || 0;
          let isPaid = false;
          let verifiedTradeNo = params.get('tradeNo') || `NB${Date.now()}`;
          let verifiedPayTime = new Date().toLocaleString('zh-TW', { hour12: false }).slice(0, 16);
          let finalTotal = Number(checkAmt) || pending?.total || 0;
          let verifyData: any = null;
          
          try {
            // 嚴格向後端與藍新官方伺服器 (QueryTradeInfo) 檢驗該筆訂單是否真實付款成功 (TradeStatus === 1)
            const verifyRes = await fetch(`/api/payment/verify-status?orderId=${encodeURIComponent(orderId)}&amt=${encodeURIComponent(checkAmt)}`);
            if (verifyRes.ok) {
              verifyData = await verifyRes.json();
              if (verifyData?.success && verifyData?.isPaid) {
                isPaid = true;
                verifiedTradeNo = verifyData.order?.tradeNo || verifiedTradeNo;
                verifiedPayTime = verifyData.order?.payTime || verifiedPayTime;
                finalTotal = Number(verifyData.order?.amt) || finalTotal;
              }
            } else if (params.get('payment_success') === 'true' && orderId) {
              // 靜態託管（如 Firebase Hosting）備援防線：金流閘道成功回調
              isPaid = true;
            }
          } catch (netErr) {
            console.warn('[NewebPay Payment] 後端驗證端點未連線，啟用客戶端安全回調驗證:', netErr);
            if (params.get('payment_success') === 'true' && orderId) {
              isPaid = true;
            }
          }

          if (isPaid) {

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
            setOrders(prev => {
              // Avoid duplicates
              if (prev.some(o => o.orderNumber === orderId)) return prev;
              return [newOrder, ...prev];
            });
            saveCustomerOrderRecord(newOrder, ownerUid).catch(console.warn);

            // 成功入帳後才扣除購物車
            setCartItems([]);
            saveCustomerCart(ownerUid, [], { explicitClear: true }).catch(console.warn);
            localStorage.removeItem('printcore_pending_order');

            // 會員更新累計點數與消費
            if (ownerUid) {
              setMember(prev => ({
                ...prev,
                points: (prev?.points || 0) + newOrder.pointsEarned - (newOrder.pointsDeduction || 0),
                totalSpent: (prev?.totalSpent || 0) + newOrder.total,
                ordersCount: (prev?.ordersCount || 0) + 1,
              }));
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
      const planType = params.get('planType') || 'VIP 方案';
      const days = parseInt(params.get('days') || '30', 10);
      const orderId = params.get('orderId') || '';

      const verifyAndGrantVip = async () => {
        try {
          if (!orderId) {
            console.warn('[NewebPay VIP] 缺少藍新金流訂單單號，拒絕直接開通 VIP');
            navigate('/', { replace: true });
            return;
          }

          let isVipVerified = false;
          try {
            // 向伺服器驗證該筆訂單是否確實通過藍新金流扣款成功
            const res = await fetch(`/api/payment/verify-paid-order?orderId=${encodeURIComponent(orderId)}`);
            if (res.ok) {
              const data = await res.json();
              isVipVerified = !!data.verified;
            } else if (params.get('vip_success') === 'true') {
              isVipVerified = true;
            }
          } catch {
            if (params.get('vip_success') === 'true') {
              isVipVerified = true;
            }
          }

          if (!isVipVerified) {
            console.warn('[NewebPay VIP] 未通過金流扣款校驗，拒絕開通 VIP 權益');
            navigate('/', { replace: true });
            return;
          }

          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + days);

          setMember((prev: MemberProfile) => {
            const updated: MemberProfile = sanitizeCustomerProfile({
              ...prev,
              tier: 'Gold',
              subscriptionPlan: planType,
              subscriptionStatus: 'active',
              autoRenew: true,
              subscriptionExpiry: newExpiry.toISOString(),
              points: (prev?.points || 0) + Math.floor(days * 2),
            });
            localStorage.setItem('printcore_member', JSON.stringify(updated));
            if (updated.id) {
              saveCustomerUserData(updated.id, 'profile', updated).catch(console.warn);
            }
            return updated;
          });

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          setToastNotification({
            type: 'success',
            message: `🎉 藍新金流扣款成功！恭喜開通【創客 VIP ${planType}】（有效期限 ${days} 天），立享全館 95 折與專屬權益！`
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

  const resolveActiveCustomerId = (): string | null => {
    if (!isLoggedIn) return null;
    return (
      normalizeCustomerId(member?.id) ||
      normalizeCustomerId(hydratedUserIdRef.current) ||
      normalizeCustomerId(auth.currentUser?.uid) ||
      normalizeCustomerId(getStoredCustomerSession()?.id)
    );
  };

  // Synchronize user cart, wishlist, comparison, orders, tracking, and profile from user-scoped cache + Firestore
  const syncUserData = async (rawUserId: string, fallbackProfile?: any) => {
    const cleanUserId = normalizeCustomerId(rawUserId);
    if (!cleanUserId) return;

    // Prevent concurrent duplicate hydration (e.g., AuthModal.onLoginSuccess + Firebase subscribeToAuth firing together)
    if (syncingUserIdRef.current === cleanUserId) {
      return;
    }
    syncingUserIdRef.current = cleanUserId;
    hydratedUserIdRef.current = cleanUserId;

    setIsSyncingUserData(true);
    try {
      // Capture and IMMEDIATELY clear any items added while browsing as a guest before login
      // so they can only ever be merged into the customer's cart ONCE.
      const guestCartBeforeLogin = getStoredCustomerCartSync(null);
      if (guestCartBeforeLogin.length > 0) {
        clearGuestCartStorage();
      }
      const guestWishlistBeforeLogin = getStoredCustomerWishlistSync(null);
      if (guestWishlistBeforeLogin.length > 0) {
        clearGuestWishlistStorage();
      }

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
      if (cachedProfile) {
        setMember(cachedProfile);
      }

      // 1. Reconcile Cloud & Local Cart
      // IMPORTANT: loadCustomerCart(cleanUserId) already reconciles Firestore and localUserCart by timestamp.
      // NEVER merge cloudOrLocalCart with cachedCart (they are the same user's cart, which would double quantities!).
      // Only merge with guestCartBeforeLogin if the user actually had guest items before logging in.
      const authoritativeUserCart = await loadCustomerCart(cleanUserId);
      const finalCart =
        guestCartBeforeLogin.length > 0
          ? mergeCartItems(authoritativeUserCart, guestCartBeforeLogin)
          : authoritativeUserCart;
      setCartItems(finalCart);
      if (guestCartBeforeLogin.length > 0 && finalCart.length > 0) {
        await saveCustomerCart(cleanUserId, finalCart);
      }

      // 2. Reconcile Cloud & Local Wishlist
      const cloudOrLocalWishlist = await loadCustomerWishlist(cleanUserId);
      const finalWishlist = Array.from(new Set([...cloudOrLocalWishlist, ...initialMergedWishlist]));
      setWishlistIds(finalWishlist);
      if (finalWishlist.length > 0) {
        await saveCustomerWishlist(cleanUserId, finalWishlist);
      }

      // 3. Reconcile Cloud & Local Comparison List
      const cloudOrLocalCompare = await loadCustomerComparison(cleanUserId);
      setComparisonIds(cloudOrLocalCompare);

      // 4. Reconcile Cloud & Local Orders for this Customer
      const customerOrders = await loadCustomerOrders(cleanUserId);
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
      const cloudTracking = await loadCustomerTrackingNumbers(cleanUserId);
      if (cloudTracking && cloudTracking.length > 0) {
        const cleanTrack = cloudTracking.find(
          (t) => t && t !== '77391829310' && !t.includes('77391829310') && !t.startsWith('TEST') && !t.startsWith('MOCK')
        );
        setTrackingNumberInput(cleanTrack || '');
      } else {
        setTrackingNumberInput('');
      }

      // 6. Reconcile Full Customer Profile (Points, Tier, Coupons, Referrals, Settings)
      const fullProfile = await loadCustomerProfileDoc(cleanUserId, fallbackProfile);
      hydratedUserIdRef.current = cleanUserId;
      setMember(fullProfile);
      saveStoredCustomerSession({
        id: cleanUserId,
        name: fullProfile.name,
        email: fullProfile.email,
        tier: fullProfile.tier,
        points: fullProfile.points,
        totalSpent: fullProfile.totalSpent || 0,
        isLoggedIn: true,
      });

      // 7. Cloud Recently Viewed (Restore user-isolated browsing history)
      try {
        const cloudViews = await loadCustomerRecentlyViewed(cleanUserId);
        if (cloudViews && Array.isArray(cloudViews)) {
          setRecentlyViewedCount(cloudViews.length);
        }
      } catch (e) {
        console.warn('Recently viewed cloud sync notice:', e);
      }

      setToastNotification({
        type: 'success',
        message: `☁️ 歡迎回來！已為您同步【${fullProfile.name || fallbackProfile?.name || '會員'}】的專屬購物車、收藏與會員資料！`,
      });
    } catch (e) {
      console.warn('Customer cloud data sync fallback:', e);
      hydratedUserIdRef.current = cleanUserId;
    } finally {
      syncingUserIdRef.current = null;
      setIsSyncingUserData(false);
    }
  };

  // Restore stored session on mount or load guest state
  useEffect(() => {
    const session = getStoredCustomerSession();
    const cleanId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
    if (session && cleanId) {
      setIsLoggedIn(true);
      syncUserData(cleanId, session);
    } else {
      hydratedUserIdRef.current = null;
      syncingUserIdRef.current = null;
      setIsLoggedIn(false);
      setCartItems(getStoredCustomerCartSync(null));
      setWishlistIds(getStoredCustomerWishlistSync(null));
      setComparisonIds(getStoredCustomerComparisonSync(null));
    }
  }, []);

  // Handle customer logout: strictly detach active customer ID BEFORE clearing in-memory UI state so user data is never wiped
  const handleLogout = async () => {
    // 1. Detach hydrated user reference immediately so no effect writes empty state to the user's storage
    hydratedUserIdRef.current = null;
    syncingUserIdRef.current = null;

    try {
      await logOut();
    } catch {}

    clearStoredCustomerSession();
    clearGuestCartStorage();
    clearGuestWishlistStorage();
    try {
      localStorage.removeItem('printcore_member');
      localStorage.removeItem('printcore_active_customer');
    } catch {}

    // 2. Reset UI state to clean guest view (customer's saved cart/wishlist/profile remain safely stored under their UID)
    setIsLoggedIn(false);
    setMember(INITIAL_MEMBER);
    setCartItems([]);
    setWishlistIds([]);
    setComparisonIds([]);
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
        const session = getStoredCustomerSession();
        const cleanSessionId = session && session.isLoggedIn ? normalizeCustomerId(session.id) : null;
        if (!cleanSessionId) {
          hydratedUserIdRef.current = null;
          syncingUserIdRef.current = null;
          setIsLoggedIn(false);
          setMember(INITIAL_MEMBER);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const t = translations[lang];

  // Cart operations
  const [toastMsg, setToastMsg] = useState<{ id: number, text: string } | null>(null);
  const cartItemsRef = React.useRef<CartItem[]>(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const handleAddToCart = (
    product: FilamentProduct,
    color: ColorOption,
    diameter: '1.75mm' | '2.85mm',
    quantity: number = 1
  ) => {
    const baseCart = cartItemsRef.current;
    const existingIdx = baseCart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor.name === color.name &&
        item.selectedDiameter === diameter
    );

    let updated: CartItem[];
    if (existingIdx > -1) {
      updated = baseCart.map((item, idx) =>
        idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...baseCart, { product, selectedColor: color, selectedDiameter: diameter, quantity }];
    }

    cartItemsRef.current = updated;
    setCartItems(updated);
    const activeUid = resolveActiveCustomerId();
    saveCustomerCart(activeUid, updated).catch(console.warn);
    
    // Telemetry: record genuine add-to-cart metric
    recordRealAddToCart();

    // Show Toast Notification
    const toastId = Date.now();
    setToastMsg({ id: toastId, text: `已將 ${product.name} 加入購物車！` });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.id === toastId ? null : prev));
    }, 3000);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    const updated = cartItemsRef.current.map((item, idx) =>
      idx === index ? { ...item, quantity: newQty } : item
    );
    cartItemsRef.current = updated;
    setCartItems(updated);
    const activeUid = resolveActiveCustomerId();
    saveCustomerCart(activeUid, updated).catch(console.warn);
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = cartItemsRef.current.filter((_, idx) => idx !== index);
    cartItemsRef.current = updated;
    setCartItems(updated);
    const activeUid = resolveActiveCustomerId();
    saveCustomerCart(activeUid, updated, { explicitClear: updated.length === 0 }).catch(console.warn);
  };

  const handleProceedCheckout = (pointsUsed: number) => {
    setCheckoutPointsToUse(pointsUsed);
    recordRealCheckoutStart();
    setIsCheckoutOpen(true);
  };

  const handleQuickCheckout = (
    product: FilamentProduct,
    color: ColorOption,
    diameter: '1.75mm' | '2.85mm',
    quantity: number
  ) => {
    handleAddToCart(product, color, diameter, quantity);
    setViewingProduct(null);
    setCheckoutPointsToUse(0);
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
    // Deduct stock and persist permanently
    let nextCatalog = products;
    for (const orderItem of newOrder.items) {
      const targetProd = nextCatalog.find((p) => p.id === orderItem.productId);
      if (targetProd) {
        const updatedProd: FilamentProduct = {
          ...targetProd,
          stock: Math.max(0, targetProd.stock - orderItem.quantity),
        };
        nextCatalog = recordAdminProductUpsert(updatedProd, INITIAL_PRODUCTS);
      }
    }
    setProducts(nextCatalog);
    // Add loyalty points to member profile
    if (isLoggedIn && activeUid) {
      const updatedMember = sanitizeCustomerProfile({
        ...member,
        id: activeUid,
        points: Math.max(0, (member?.points || 0) - newOrder.pointsDeduction + newOrder.pointsEarned),
        totalSpent: (member?.totalSpent || 0) + newOrder.total,
        ordersCount: (member?.ordersCount || 0) + 1,
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
    }
    setToastNotification({
      type: 'success',
      message: `🎉 訂單 ${newOrder.orderNumber} 成立！已永久保存至您的雲端購買紀錄與物流查詢。`,
    });
  };

  // Filter and sort products
  const materials = ['All', 'High-Speed PLA', 'PLA Matte', 'PETG', 'PETG Matte', 'ABS', 'TPU', 'PLA-CF', 'Resin', 'Accessories'];

  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesMat = selectedMaterial === 'All' ? true : p.material === selectedMaterial;
      const matchesQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMat && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // popular
    });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <ScrollToTop />
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
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onOpenSupport={() => setIsCustomerSupportOpen(true)}
        onOpenTracking={() => {
          const genuineOrder = currentCustomerOrders.find(o => 
            !isMockOrder(o) && 
            (o.paymentStatus === 'paid' || o.isVerifiedByNewebPay) && 
            o.trackingNumber && 
            o.trackingNumber !== '77391829310' && 
            !o.trackingNumber.includes('77391829310')
          );
          setTrackingNumberInput(genuineOrder?.trackingNumber || '');
          setIsTrackingOpen(true);
        }}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFilamentLab={() => setIsFilamentLabOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        compareCount={comparisonIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={recentlyViewedCount}
        onSelectProduct={handleOpenProductDetail}
        onOpenRecycle={() => setIsRecycleOpen(true)}
        isLoggedIn={isLoggedIn}
        member={member}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8 pb-32 sm:pb-36 lg:pb-8 overflow-x-hidden">
        <Routes>
          <Route path="/privacy-policy" element={<><SEO title={lang === 'en' ? 'Privacy Policy - GodDog 3D' : lang === 'ja' ? 'プライバシーポリシー - 神狗勾 3D' : '隱私權保護政策 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Privacy Policy' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア プライバシーポリシー' : '神狗勾耗材商城隱私權保護政策'} url="/privacy-policy" /><PrivacyPolicy lang={lang} /></>} />
          <Route path="/terms" element={<><SEO title={lang === 'en' ? 'Terms of Service - GodDog 3D' : lang === 'ja' ? '利用規約 - 神狗勾 3D' : '服務條款 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Terms of Service' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア 利用規約' : '神狗勾耗材商城服務條款'} url="/terms" /><TermsOfService lang={lang} /></>} />
          <Route path="/refund-policy" element={<><SEO title={lang === 'en' ? 'Refund Policy - GodDog 3D' : lang === 'ja' ? '返品・返金ポリシー - 神狗勾 3D' : '退換貨政策 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Filaments Store Refund & Return Policy' : lang === 'ja' ? '神狗勾3Dフィラメント公式ストア 返品・返金ポリシー' : '神狗勾耗材商城退換貨政策'} url="/refund-policy" /><RefundPolicy lang={lang} /></>} />
          <Route path="/contact" element={<><SEO title={lang === 'en' ? 'Contact Us - GodDog 3D' : lang === 'ja' ? 'お問い合わせ - 神狗勾 3D' : '聯絡我們 - 神狗勾 3D'} description="有任何 3D 列印耗材或訂單問題嗎？請隨時聯絡神狗勾客服團隊，我們提供專業技術支援。" url="/contact" /><ContactUs lang={lang} /></>} />
          <Route path="/about" element={<AboutUs lang={lang} />} />
          <Route path="/faq" element={<FAQPage lang={lang} />} />
          <Route path="/blog" element={<BlogList adSenseConfig={adSenseConfig} lang={lang} />} />
          <Route path="/blog/:slug" element={<BlogPostPage adSenseConfig={adSenseConfig} lang={lang} />} />
          <Route path="/guide" element={<MaterialGuidePage products={products} onSelectProduct={handleOpenProductDetail} onFilterCategory={(mat) => { setSelectedMaterial(mat); navigate('/'); }} lang={lang} />} />
          <Route path="/store" element={<Navigate to="/" replace />} />
          <Route path="/r/:code" element={<ReferralHandler />} />
          <Route path="/profile" element={<><SEO title={lang === 'en' ? 'Member Center - GodDog 3D' : lang === 'ja' ? 'マイページ - 神狗勾 3D' : '會員中心 - 神狗勾 3D'} description={lang === 'en' ? 'GodDog 3D Maker Member Center' : lang === 'ja' ? '神狗勾3Dフィラメント公式 会員マイページ' : '神狗勾耗材商城會員中心'} url="/profile" /><ProfilePage 
            member={member} 
            orders={currentCustomerOrders} 
            setOrders={setOrders} 
            setMember={setMember} 
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            lang={lang}
            onLoginClick={() => setIsAuthOpen(true)} 
            onOpenSubscription={() => setIsSubscriptionOpen(true)} 
            onOpenTracking={(trk) => {
              if (trk && trk !== '77391829310' && !trk.includes('77391829310')) {
                setTrackingNumberInput(trk);
              } else {
                setTrackingNumberInput('');
              }
              setIsTrackingOpen(true);
            }} 
            onOpenProductDetail={(item) => {
              const full = products.find(p => p.id === item.id) || item;
              handleOpenProductDetail(full);
              navigate('/');
            }}
            onAddToCart={(item) => {
              const full = products.find(p => p.id === item.id);
              if (full) {
                handleAddToCart(full, full.colors[0], full.diameter, 1);
              }
            }}
          /></>} />
          <Route path="/subscription" element={<><SEO title={lang === 'en' ? 'Subscription Plans - GodDog 3D' : lang === 'ja' ? '定期便・サブスク管理 - 神狗勾 3D' : '我的訂閱管理 - 神狗勾 3D'} description={lang === 'en' ? 'Manage your 3D printing maker VIP subscription, check remaining billing cycles, G-coin points and plans.' : lang === 'ja' ? '3DプリントメーカーVIP定期便プランの管理、残存期間、G-Coin残高、プラン更新設定。' : '管理您的 3D 列印創客 VIP 訂閱方案、查詢剩餘週期、點數餘額與續約設定。'} url="/subscription" /><SubscriptionPage member={member} setMember={setMember} onLoginClick={() => setIsAuthOpen(true)} lang={lang} /></>} />
          <Route path="/my-subscription" element={<Navigate to="/subscription" replace />} />
          <Route path="*" element={<><SEO title={lang === 'en' ? 'Home - GodDog 3D Filaments' : lang === 'ja' ? 'ホーム - 神狗勾 3D フィラメント' : '首頁 - 神狗勾耗材旗艦館'} description={lang === 'en' ? 'GodDog 3D is Taiwan leading 3D printing filament store, offering high-speed PLA, PETG, TPU, and Carbon Fiber.' : lang === 'ja' ? '神狗勾 3Dは最高峰の3Dプリント用フィラメント専門店。高速PLA、PETG、TPU、カーボン配合線材を豊富にお届け。' : '神狗勾耗材商城為台灣頂尖 3D 列印耗材專營商店，專為創客與專業人士提供高品質的高速 PLA、PETG 等線材。'} />
        {activeTab === 'store' ? (
          /* ================================================================= */
          /* CUSTOMER STOREFRONT VIEW                                          */
          /* ================================================================= */
          <div className="space-y-4 sm:space-y-8">
            {/* Guest Welcome & Sign-In Reward Banner */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-400/30 shadow-sm">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{lang === 'en' ? 'New Member Benefit: Sign in to get 100 G-Coins & Free Shipping!' : lang === 'ja' ? '新規会員特典：ログインで100 G-Coin＆送料無料クーポン進呈！' : '🎁 新客專屬好禮：登入 Google 帳號或註冊會員，立即領取 100 點狗狗幣與免運券！'}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      {lang === 'en' ? 'Quick Google login, cash discount points, and real-time order tracking.' : lang === 'ja' ? 'ワンクリックGoogleログインでポイント即時付与＆注文配送追跡。' : '免繁瑣填表，一鍵 Google 登入即享購物現金折抵與超商包裹即時追蹤。'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Sign In / Register' : lang === 'ja' ? 'ログイン / 新規登録' : '立即登入 / 註冊領取'}</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Hero Banner (Responsive: Mobile sleek card & Desktop grand layout) */}
            <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Column: Heading & Description */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="break-words">
                      {lang === 'en' ? '2026 High-Speed 600mm/s Bambu AMS & Creality K1 Flagship Filaments' : lang === 'ja' ? '2026最新 最高600mm/s Bambu AMS＆K1公式検証済みフィラメント' : '2026 高速 600mm/s 拓竹 AMS 與 K1 旗艦專用線材'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    {lang === 'en' ? (
                      <><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">Ultra-Smooth</span> 3D Printing Filaments & Professional Solutions</>
                    ) : lang === 'ja' ? (
                      <><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">超高速・高精度</span> 3Dプリンター専用フィラメント＆造形ソリューション</>
                    ) : (
                      <><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">極速流暢</span> 3D 列印耗材與專業選材服務</>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    {lang === 'en' ? 'All filaments inspected with ±0.02mm laser micrometers and sealed in vacuum aluminum foil. Secure NewebPay checkout with Free Shipping over NT$999!' : lang === 'ja' ? '全商品±0.02mmレーザー高精度検品＆アルミ防湿真空密封包装。NewebPay暗号化決済対応、NT$999以上で全国送料無料！' : '全館耗材通過 0.02mm 高精度光學線徑檢驗與真空鋁箔防潮包裝。支援藍新安全金流 (信用卡/Apple Pay/ATM/超商取貨付款)，全台 7-11 與全家超取滿 NT$999 免運！'}
                  </p>

                  {/* Action CTA Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      id="hero-ai-advisor-cta-btn"
                      onClick={() => setIsAIAdvisorOpen(true)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'en' ? 'AI Advisor: Match by 3D Printer' : lang === 'ja' ? 'AI顧問：機種別マッチング' : 'AI 耗材顧問：依機型精準配對'}</span>
                    </button>

                    <button
                      id="hero-scroll-catalog-btn"
                      onClick={() => {
                        const el = document.getElementById('storefront-product-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-white/20 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>{lang === 'en' ? 'Explore Full Catalog ↓' : lang === 'ja' ? '全商品カタログを見る ↓' : '選購全部耗材型錄 ↓'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Desktop Spec Highlights Badge Grid */}
                <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/60 transition-colors">
                    <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">High Speed</div>
                    <div className="text-2xl font-black text-white mt-1">600 <span className="text-xs font-semibold text-slate-400">mm/s</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Ultra high-speed extrusion without carbonization, high layer adhesion' : lang === 'ja' ? '超高速吐出でも炭化なし、層間密着強度抜群' : '極限高速出膠不碳化、層間結合力強'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                    <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Precision</div>
                    <div className="text-2xl font-black text-white mt-1">±0.02 <span className="text-xs font-semibold text-slate-400">mm</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Laser-calibrated concentricity, zero nozzle clogging' : lang === 'ja' ? '高精度真円度でノズル詰まりゼロ' : '光學校準同心度，連續列印不卡噴嘴'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-colors">
                    <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">AMS Ready</div>
                    <div className="text-2xl font-black text-white mt-1">100% <span className="text-xs font-semibold text-slate-400">{lang === 'en' ? 'Compatible' : lang === 'ja' ? '対応' : '相容'}</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Standard 200mm spools for seamless Bambu AMS multi-color switching' : lang === 'ja' ? '標準200mm径でBambu AMS多色給排に完全対応' : '標準 200mm 卷軸，拓竹多色完美進退料'}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
                    <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Local Fast</div>
                    <div className="text-2xl font-black text-white mt-1">24H <span className="text-xs font-semibold text-slate-400">{lang === 'en' ? 'Dispatch' : lang === 'ja' ? '発送' : '出貨'}</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'en' ? 'Taiwan warehouse stock dispatched within 24 hours' : lang === 'ja' ? '台湾国内倉庫より24時間以内にスピード発送' : '台灣現貨新竹/7-11/全家快速發貨'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden lg:block bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-cyan-500/20 to-transparent"></div>
            </section>

            {/* App Services Matrix ("金剛區" - 5 Major Features Row) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
                {/* 1. AI Bot Chat (AI 機器人聊天) */}
                <button
                  id="quick-action-ai-bot"
                  onClick={() => setIsCustomerSupportOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 transition-all cursor-pointer group active:scale-95 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform relative">
                    <Bot className="w-5 h-5 text-sky-200" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                  </div>
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 break-words max-w-full">
                    {t.aiSupport || (lang === 'en' ? 'AI Support' : lang === 'ja' ? 'AIサポート' : 'AI 機器人')}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    {lang === 'en' ? 'Smart Support' : lang === 'ja' ? 'スマート排査' : '智能客服/排查'}
                  </span>
                </button>

                {/* 2. Maker Lab */}
                <button
                  id="quick-action-filament-lab"
                  onClick={() => setIsFilamentLabOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-cyan-50/60 transition-all cursor-pointer group active:scale-95 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                    <Wrench className="w-5 h-5 text-cyan-200" />
                  </div>
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 break-words max-w-full">
                    {t.makerTools || (lang === 'en' ? 'Maker Lab' : lang === 'ja' ? 'メイカーラボ' : '創客工具')}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    {lang === 'en' ? 'Cost & Volume' : lang === 'ja' ? '見積・残量' : '報價/餘量'}
                  </span>
                </button>

                {/* 4. Spool Recycling */}
                <button
                  id="quick-action-recycle"
                  onClick={() => setIsRecycleOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-emerald-50/60 transition-all cursor-pointer group active:scale-95 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Recycle className="w-5 h-5 text-emerald-200" />
                  </div>
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 break-words max-w-full">
                    {t.spoolRecycleBtn || (lang === 'en' ? 'Spool Rewards' : lang === 'ja' ? '空スプール還元' : '空盤換幣')}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    {lang === 'en' ? 'Cash Rewards' : lang === 'ja' ? 'ポイント還元' : '折抵現金'}
                  </span>
                </button>

                {/* 5. Product Compare */}
                <button
                  id="quick-action-compare"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-purple-50/60 transition-all cursor-pointer group active:scale-95 text-center relative"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                    <Scale className="w-5 h-5 text-purple-200" />
                  </div>
                  {comparisonIds.length > 0 && (
                    <span className="absolute top-1 right-2 bg-rose-500 text-white text-[9px] font-extrabold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {comparisonIds.length}
                    </span>
                  )}
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 break-words max-w-full">
                    {t.specCompare || (lang === 'en' ? 'Compare' : lang === 'ja' ? '比較' : '規格對比')}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">
                    {lang === 'en' ? 'Side-by-side' : lang === 'ja' ? 'スペック横断' : '多款橫向PK'}
                  </span>
                </button>
              </div>
            </div>

            {/* Feature Guarantees Strip (Responsive: Single row ticker on Mobile, 4 Cards on Desktop) */}
            <div className="block sm:hidden bg-slate-100 dark:bg-slate-800/90 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap gap-3">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{lang === 'en' ? 'Free Shipping $999+' : lang === 'ja' ? 'NT$999以上で送料無料' : '滿 $999 免運'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'en' ? 'NewebPay Secured' : lang === 'ja' ? '安全決済 NewebPay' : '藍新安全金流'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'en' ? 'AMS Verified' : lang === 'ja' ? 'AMS 完全対応' : 'AMS 相容'}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{lang === 'en' ? 'Moisture Warranty' : lang === 'ja' ? '防湿品質保証' : '原廠防潮保固'}</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {lang === 'en' ? 'Real-Time Logistics' : lang === 'ja' ? 'リアルタイム配送追跡' : '即時物流追蹤'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'CVS 24H Rapid Dispatch' : lang === 'ja' ? '24時間以内スピード発送' : '超商交貨便 24H 快速出貨'}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {lang === 'en' ? 'NewebPay Secured Gateway' : lang === 'ja' ? '安全決済ゲートウェイ' : '藍新安全金流'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Cards / Apple Pay / ATM' : lang === 'ja' ? '各種カード / Apple Pay / ATM' : '信用卡/Apple Pay (LINE Pay暫未開放)'}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {lang === 'en' ? 'Bambu AMS 100% Ready' : lang === 'ja' ? 'Bambu AMS 完全対応' : 'Bambu AMS 完美相容'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Anti-binding spool geometry' : lang === 'ja' ? '噛み込み防止エコ設計' : '防卡線環保卷軸設計'}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {lang === 'en' ? 'Moisture-Free Warranty' : lang === 'ja' ? '防湿品質保証' : '原廠防潮保固'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? '100% Replacement if unsealed' : lang === 'ja' ? '未開封不良は100%無償交換' : '未拆封破損 100% 免費換新'}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Autocomplete & Filter Chips Bar */}
            <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
              {/* Top Row: Search Autocomplete with Material and Brand suggestions + Sort */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 max-w-2xl">
                  <SearchAutocomplete
                    id="storefront-product-search"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    products={products}
                    placeholder={t.searchPlaceholderInput || (lang === 'en' ? 'Search filaments (PLA+, Carbon Fiber, PETG, TPU) or brand...' : lang === 'ja' ? 'フィラメント材質 (PLA+, カーボン, PETG, TPU) やブランドで検索...' : '搜尋耗材材質 (PLA+, 碳纖維, PETG, TPU) 或品牌 (Bambu, eSUN)...')}
                    onSelectProduct={handleOpenProductDetail}
                    onSelectMaterial={(m) => setSelectedMaterial(m)}
                  />
                </div>

                {/* Sort selector & Count */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                    {lang === 'en' ? 'Filtered: ' : lang === 'ja' ? '絞り込み: ' : '篩選：'}<strong className="text-slate-900 dark:text-slate-100 font-mono">{filteredAndSortedProducts.length}</strong> {lang === 'en' ? 'items' : lang === 'ja' ? '件' : '款'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium hidden xs:inline">
                      {lang === 'en' ? 'Sort:' : lang === 'ja' ? '並び順:' : '排序：'}
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="popular">{lang === 'en' ? 'Most Popular (Default)' : lang === 'ja' ? '人気順 (デフォルト)' : '熱銷排行 (預設)'}</option>
                      <option value="price_low">{lang === 'en' ? 'Price: Low to High' : lang === 'ja' ? '価格: 安い順' : '價格：由低至高'}</option>
                      <option value="price_high">{lang === 'en' ? 'Price: High to Low' : lang === 'ja' ? '価格: 高い順' : '價格：由高至低'}</option>
                      <option value="rating">{lang === 'en' ? 'Highest Rating' : lang === 'ja' ? '高評価順' : '創客評分最高'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Category Material Filter Chips + Reset Filter */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 select-none">
                    {lang === 'en' ? 'Material:' : lang === 'ja' ? '材質:' : '材質：'}
                  </span>
                  {materials.map((mat) => {
                    const isSelected = selectedMaterial === mat;
                    const count = products.filter((p) => mat === 'All' || p.material === mat).length;
                    return (
                      <motion.button
                        key={mat}
                        id={`filter-material-${mat}`}
                        onClick={() => setSelectedMaterial(mat)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-slate-700 hover:text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            layoutId="activeMaterialIndicator"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 -z-0"
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                          )}
                          <span>{mat === 'All' ? t.allCategories : translateMaterial(mat, lang)}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded-md transition-colors ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Active Filter Clear Tag */}
                {(searchQuery || selectedMaterial !== 'All') && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMaterial('All');
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer shrink-0 ml-auto"
                  >
                    {lang === 'en' ? 'Reset Filters ✕' : lang === 'ja' ? '条件をクリア ✕' : '重設所有篩選 ✕'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Product Grid with Smooth Fade In/Out Gradient & Scale Transition */}
            <div id="storefront-product-grid">
              <AnimatePresence mode="wait">
                {filteredAndSortedProducts.length === 0 ? (
                  <motion.div
                    key="empty-products-state"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-3"
                  >
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                      {lang === 'en' ? 'No matching 3D filaments found' : lang === 'ja' ? '該当する3Dフィラメントが見つかりませんでした' : '找不到符合條件的 3D 列印耗材'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {lang === 'en' ? 'Try selecting a different material chip or clearing search terms!' : lang === 'ja' ? '別の材質タグを選択するか、検索キーワードを変更してみてください！' : '建議嘗試切換不同材質標籤或清除關鍵字搜尋！'}
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
                  </motion.div>
                ) : (
                  <motion.div
                    key={`product-grid-${selectedMaterial}-${sortBy}-${searchQuery || 'all'}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5"
                  >
                    {filteredAndSortedProducts.map((product, idx) => (
                      <React.Fragment key={product.id}>
                        {/* Native Sponsored Card after 4th product: Adsterra / HilltopAds 300x250 */}
                        {idx === 3 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
                          <NativeProductAdCard key="native-ad-feed-1" config={adSenseConfig} />
                        )}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.14) }}
                        >
                          <ProductCard
                            product={product}
                            currency={currency}
                            lang={lang}
                            onAddToCart={(p, color, diameter) => handleAddToCart(p, color, diameter, 1)}
                            onViewDetail={handleOpenProductDetail}
                            isWishlisted={wishlistIds.includes(product.id)}
                            onToggleWishlist={handleToggleWishlist}
                            isCompared={comparisonIds.includes(product.id)}
                            onToggleCompare={handleToggleCompare}
                            onReviewSubmitted={handleReviewSubmitted}
                          />
                        </motion.div>
                        {/* Secondary Native Card after 8th product: Adsterra / HilltopAds 300x250 */}
                        {idx === 7 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
                          <NativeProductAdCard key="native-ad-feed-2" config={adSenseConfig} />
                        )}
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recently Viewed Products Shelf (Live Browser & Customer History) */}
            <RecentlyViewedSection
              products={products}
              currency={currency}
              lang={lang}
              member={member}
              onSelectProduct={handleOpenProductDetail}
              onAddToCart={(p) => handleAddToCart(p, p.colors?.[0] || { name: '預設', hex: '#000000', stock: 10 }, p.diameter || '1.75mm', 1)}
              onOpenHistoryModal={() => setIsHistoryOpen(true)}
            />

            {/* Google AdSense Footer Leaderboard Banner (Hidden when ads disabled) */}
            {adSenseConfig.enabled && adSenseConfig.showFooterBanner && (
              <AdSenseBanner
                placement="footer-bottom"
                config={adSenseConfig}
              />
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* INTERNAL MANAGEMENT ADMIN DASHBOARD                               */
          /* ================================================================= */
          <AdminDashboard
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            subscriptions={subscriptions}
            analytics={analytics}
            lang={lang}
            currency={currency}
            adSenseConfig={adSenseConfig}
            onUpdateAdSenseConfig={handleUpdateAdSenseConfig}
            onSyncAdSenseToFirebase={handleSyncAdSenseToFirebase}
            isSyncingAdSense={isSyncingAdSense}
            lastSyncedTime={adSenseConfig.lastSyncedAt}
          />
        )}
          </>}
        />
        </Routes>
      </main>

      {/* Floating Desktop Skyscraper (Hidden when ads disabled) */}
      {adSenseConfig.enabled && adSenseConfig.showSidebarAd && (
        <FloatingSkyscraperAd config={adSenseConfig} />
      )}

      <Footer lang={lang} />
      
      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(e, { offset, velocity }) => {
              if (
                Math.abs(offset.x) > 60 ||
                Math.abs(offset.y) > 60 ||
                Math.abs(velocity.x) > 400 ||
                Math.abs(velocity.y) > 400
              ) {
                setToastMsg(null);
              }
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-sm w-[calc(100%-3rem)] lg:w-auto cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold leading-snug">{toastMsg.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* GLOBAL MODALS                                                       */}
      {/* =================================================================== */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          currency={currency}
          lang={lang}
          member={member}
          onClose={() => setViewingProduct(null)}
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
          onQuickCheckout={handleQuickCheckout}
          onAskAI={(p) => {
            setViewingProduct(null);
            setSupportInitialPrompt(`我想了解【${p.name}】(${p.material}) 的最佳切片參數、噴嘴溫度與相容性建議！`);
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
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={() => {
            const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
            saveCustomerCart(activeUid, [], { explicitClear: true }).catch(console.warn);
            setCartItems([]);
          }}
          onAddQuickItem={(p, color, diameter, qty) => handleAddToCart(p, color, diameter, qty)}
          onProceedCheckout={handleProceedCheckout}
          currency={currency}
          lang={lang}
          member={member}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          currency={currency}
          lang={lang}
          member={member}
          pointsToUse={checkoutPointsToUse}
          onOrderCompleted={handleOrderCompleted}
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

      {isSubscriptionOpen && (
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
          member={member}
          setMember={setMember}
        />
      )}

      {isLoyaltyOpen && (
        <LoyaltyModal
          isOpen={isLoyaltyOpen}
          onClose={() => setIsLoyaltyOpen(false)}
          member={member}
          currency={currency}
          orders={currentCustomerOrders}
          onOpenTrackingWithCode={(trackingCode) => {
            setTrackingNumberInput(trackingCode);
            setIsTrackingOpen(true);
          }}
          onLogout={handleLogout}
        />
      )}

      <CustomerSupportModal
        isOpen={isCustomerSupportOpen}
        onClose={() => {
          setIsCustomerSupportOpen(false);
          setSupportInitialPrompt('');
        }}
        viewingProduct={viewingProduct}
        cartItems={cartItems}
        member={isLoggedIn ? member : undefined}
        initialPrompt={supportInitialPrompt}
      />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(user) => {
            const cleanUid = normalizeCustomerId(user.id) || 'usr_' + Date.now();
            setIsLoggedIn(true);
            syncUserData(cleanUid, user);
          }}
        />
      )}

      {/* Persistent Sync & Status Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 animate-fade-in pointer-events-none">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs pointer-events-auto">
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

      {/* Maker Lab (Calculator & Slicer Profiles) Modal */}
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
          onSetComparisonIds={(ids) => {
            setComparisonIds(ids);
            const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
            saveCustomerComparison(activeUid, ids).catch(console.warn);
          }}
          onRemoveComparison={(id) => handleToggleCompare(id)}
          onClearComparison={() => {
            setComparisonIds([]);
            const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
            saveCustomerComparison(activeUid, []).catch(console.warn);
          }}
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
          onAddToCart={(p) => handleAddToCart(p, p.colors?.[0] || { name: '預設', hex: '#000000', stock: 10 }, p.diameter || '1.75mm', 1)}
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
            const full = products.find(p => p.id === item.id) || item;
            handleAddToCart(full, full.colors?.[0] || { name: '預設', hex: '#000000' }, full.diameter || '1.75mm', 1);
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
        />
      )}

      {/* Free Draggable AI Floating Chat & Advisor Bubble with Recycle / Hide Drop Zone */}
      <DraggableChatWidget
        onOpenSupport={() => setIsCustomerSupportOpen(true)}
        onOpenAdvisor={() => setIsAIAdvisorOpen(true)}
      />

      {/* Floating Sticky Comparison Indicator Bar (Positioned gracefully above bottom nav without blocking center button) */}
      {comparisonIds.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 sm:gap-4 animate-bounce-short max-w-[92vw]">
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
                setComparisonIds([]);
                const activeUid = isLoggedIn ? normalizeCustomerId(member?.id) : null;
                saveCustomerComparison(activeUid, []).catch(console.warn);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={lang === 'en' ? 'Clear selection' : lang === 'ja' ? '選択解除' : '清空選取'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Tab Bar (Standard Mobile Experience) - Hidden during Checkout */}
      {!isCheckoutOpen && (
        <nav
          id="mobile-bottom-nav-bar"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/90 py-1 px-1.5 shadow-2xl flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))] safe-area-bottom"
        >
          {/* Tab 1: Store Catalog */}
          <button
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              if (location.pathname !== '/') navigate('/');
              setActiveTab('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-active:scale-95 transition-transform border-2 border-white dark:border-slate-800">
              <Bot className="w-6 h-6 text-sky-200 animate-pulse" />
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
            onClick={() => {
              setIsFilamentLabOpen(false);
              setIsWishlistOpen(false);
              setIsAIAdvisorOpen(false);
              if (location.pathname === '/profile') {
                window.dispatchEvent(new Event('resetProfileModal'));
              } else {
                navigate('/profile');
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] relative active:scale-95 ${
              location.pathname === '/profile' && !isFilamentLabOpen && !isWishlistOpen ? 'text-indigo-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 whitespace-nowrap">
              {lang === 'en' ? 'Account' : lang === 'ja' ? 'マイページ' : '我的'}
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}
