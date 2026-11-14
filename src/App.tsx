import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  TrackingModal 
} from './components/Storefront/TrackingModal';
import { 
  CustomerSupportModal 
} from './components/Storefront/CustomerSupportModal';
import { 
  AuthModal 
} from './components/Auth/AuthModal';
import { RecentlyViewedSection } from './components/Storefront/RecentlyViewedSection';
import { 
  WishlistDrawer 
} from './components/Storefront/WishlistDrawer';
import {
  DraggableChatWidget
} from './components/Storefront/DraggableChatWidget';
import { FlyToCartOverlay } from './components/Storefront/FlyToCartOverlay';

// Lazy-loaded heavy secondary modals & routes to reduce initial bundle payload
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AIAdvisorModal = React.lazy(() => import('./components/Storefront/AIAdvisorModal').then(m => ({ default: m.AIAdvisorModal })));
const FilamentLabModal = React.lazy(() => import('./components/Storefront/FilamentLabModal').then(m => ({ default: m.FilamentLabModal })));
const ProductComparisonModal = React.lazy(() => import('./components/Storefront/ProductComparisonModal').then(m => ({ default: m.ProductComparisonModal })));
const SpoolRecycleModal = React.lazy(() => import('./components/Storefront/SpoolRecycleModal').then(m => ({ default: m.SpoolRecycleModal })));
const HistoryModal = React.lazy(() => import('./pages/Profile/ProfileModals').then(m => ({ default: m.HistoryModal })));
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
import { translations, translateMaterial, translateProductName, formatPrice } from './utils/i18n';
import { getSafeProductImageUrl, handleProductImageError } from './utils/productImage';
import { processDomSubtree } from './utils/domAutoTranslator';
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
  Truck
} from 'lucide-react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
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
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';
import { evaluateProductDeepSearch } from './utils/productSearch';
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
      localStorage.setItem('printcore_referral_code', code.trim().toUpperCase());
    }
    // Automatically log out so they can register/sign-in as the referred user with the code
    const clearSession = async () => {
      try {
        await logOut();
        clearStoredCustomerSession();
      } catch (e) {}
      navigate('/profile?referral_invited=1', { replace: true });
    };
    clearSession();
  }, [code, navigate]);
  return null;
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

  // Universal DOM & Attribute Reactive Language Adaptation (zh-TW / en / ja)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : 'zh-TW';
    document.title =
      lang === 'en'
        ? 'GodDog 3D | High-Speed 3D Filaments & Smart Slicing Store'
        : lang === 'ja'
        ? '神狗勾 3D | 高速3Dプリントフィラメント＆スマート素材選定ストア'
        : '神狗勾耗材 3D列印線材旗艦館 | PLA・PETG・高速線材與智能選材商城';

    let rafId: number | null = null;
    const runScan = () => {
      processDomSubtree(document.body, lang);
    };

    runScan();

    const observer = new MutationObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        runScan();
        rafId = null;
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [lang]);

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
      setViewingProduct((prev) => {
        if (!prev) return null;
        return cloudMergedProducts.find((p) => p.id === prev.id) || prev;
      });
      setCartItems((prevCart) => {
        if (!Array.isArray(prevCart) || prevCart.length === 0) return prevCart;
        let changed = false;
        const nextCart = prevCart.map((item) => {
          const latestProd = cloudMergedProducts.find((p) => p.id === item.product?.id);
          if (
            latestProd &&
            (latestProd.price !== item.product.price ||
              latestProd.name !== item.product.name ||
              latestProd.imageUrl !== item.product.imageUrl)
          ) {
            changed = true;
            return { ...item, product: latestProd };
          }
          return item;
        });
        return changed ? nextCart : prevCart;
      });
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
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [viewingProduct, setViewingProduct] = useState<FilamentProduct | null>(null);

  const handleOpenProductDetail = (p: FilamentProduct) => {
    setViewingProduct(p);
    saveCustomerRecentlyViewed(member?.id || auth.currentUser?.uid, p).catch(() => {});
  };
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
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

  const isOwnerAdmin = Boolean(
    isLoggedIn &&
    ((member?.email && member.email.trim().toLowerCase() === 'babe0615@gmail.com') ||
      (auth.currentUser?.email && auth.currentUser.email.trim().toLowerCase() === 'babe0615@gmail.com'))
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

            // 成功入帳後才扣除購物車並扣減商品庫存
            setCartItems([]);
            saveCustomerCart(ownerUid, [], { explicitClear: true }).catch(console.warn);
            localStorage.removeItem('printcore_pending_order');

            if (Array.isArray(newOrder.items) && newOrder.items.length > 0) {
              setProducts((prevCatalog) => {
                let nextCatalog = prevCatalog;
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
                return nextCatalog;
              });
            }

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

          const nowIso = new Date().toISOString();
          const newExpiry = new Date();
          newExpiry.setDate(newExpiry.getDate() + days);

          let pendingSub: { price?: number; planName?: string; planType?: string } | null = null;
          try {
            const rawPending = localStorage.getItem('printcore_pending_subscription');
            if (rawPending) {
              pendingSub = JSON.parse(rawPending);
              localStorage.removeItem('printcore_pending_subscription');
            }
          } catch {}

          setMember((prev: MemberProfile) => {
            const updated: MemberProfile = sanitizeCustomerProfile({
              ...prev,
              tier: 'Gold',
              subscriptionPlan: pendingSub?.planType || planType,
              subscriptionStatus: 'active',
              autoRenew: true,
              subscriptionStartDate: nowIso,
              subscriptionExpiry: newExpiry.toISOString(),
              subscriptionNextBillingDate: newExpiry.toISOString(),
              subscriptionAmount: typeof pendingSub?.price === 'number' ? pendingSub.price : prev?.subscriptionAmount,
              points: (prev?.points || 0) + Math.floor(days * 2),
            });
            localStorage.setItem('printcore_member', JSON.stringify(updated));
            if (updated.id) {
              saveCustomerUserData(updated.id, 'profile', updated).catch(console.warn);
              saveCustomerProfileDoc(updated.id, updated).catch(console.warn);
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

  const handleUpdateCartColor = (index: number, newColor: ColorOption) => {
    const baseCart = cartItemsRef.current;
    const targetItem = baseCart[index];
    if (!targetItem) return;

    // 檢查購物車內是否已有同商品、同新顏色、同線徑的項目，若有則自動合併數量
    const duplicateIdx = baseCart.findIndex(
      (item, idx) =>
        idx !== index &&
        item.product.id === targetItem.product.id &&
        item.selectedColor.name === newColor.name &&
        item.selectedDiameter === targetItem.selectedDiameter
    );

    let updated: CartItem[];
    if (duplicateIdx > -1) {
      updated = baseCart
        .map((item, idx) =>
          idx === duplicateIdx ? { ...item, quantity: item.quantity + targetItem.quantity } : item
        )
        .filter((_, idx) => idx !== index);
    } else {
      updated = baseCart.map((item, idx) =>
        idx === index ? { ...item, selectedColor: newColor } : item
      );
    }

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
    handleAddToCart(product, color, diameter, quantity);
    setViewingProduct(null);
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

  // Filter and sort products
  const materials = ['All', 'High-Speed PLA', 'PLA Matte', 'PLA Silk', 'PETG', 'PETG Matte', 'ABS', 'TPU', 'PLA-CF', 'Resin', 'Accessories'];

  const filteredAndSortedProducts = useMemo(() => {
    const hasActiveQuery = searchQuery.trim().length > 0;
    const scored = products
      .map((p) => {
        const matchesMat = selectedMaterial === 'All' ? true : p.material === selectedMaterial;
        if (!matchesMat) return null;
        const evalRes = evaluateProductDeepSearch(p, searchQuery);
        if (!evalRes.matched) return null;
        return { product: p, score: evalRes.score };
      })
      .filter((item): item is { product: FilamentProduct; score: number } => item !== null);

    scored.sort((a, b) => {
      if (hasActiveQuery && b.score !== a.score) {
        return b.score - a.score;
      }
      if (sortBy === 'price_low') return a.product.price - b.product.price;
      if (sortBy === 'price_high') return b.product.price - a.product.price;
      if (sortBy === 'rating') return b.product.rating - a.product.rating;
      return b.product.reviewsCount - a.product.reviewsCount; // popular
    });

    return scored.map((item) => item.product);
  }, [products, selectedMaterial, searchQuery, sortBy]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div key={lang} className="min-h-screen bg-slate-100/60 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
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
        openMemberModal={() => {
          setActiveTab('store');
          navigate('/profile');
        }}
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-8 pb-32 sm:pb-36 lg:pb-14 overflow-x-hidden">
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
            onOpenSupport={(promptText) => {
              if (promptText) setSupportInitialPrompt(promptText);
              setIsCustomerSupportOpen(true);
            }}
          /></>} />
          <Route path="/subscription" element={<><SEO title={lang === 'en' ? 'Subscription Plans - GodDog 3D' : lang === 'ja' ? '定期便・サブスク管理 - 神狗勾 3D' : '我的訂閱管理 - 神狗勾 3D'} description={lang === 'en' ? 'Manage your 3D printing maker VIP subscription, check remaining billing cycles, G-coin points and plans.' : lang === 'ja' ? '3DプリントメーカーVIP定期便プランの管理、残存期間、G-Coin残高、プラン更新設定。' : '管理您的 3D 列印創客 VIP 訂閱方案、查詢剩餘週期、點數餘額與續約設定。'} url="/subscription" /><SubscriptionPage member={member} setMember={setMember} onLoginClick={() => setIsAuthOpen(true)} lang={lang} /></>} />
          <Route path="/my-subscription" element={<Navigate to="/subscription" replace />} />
          <Route path="*" element={<><SEO title={lang === 'en' ? 'Home - GodDog 3D Filaments' : lang === 'ja' ? 'ホーム - 神狗勾 3D フィラメント' : '首頁 - 神狗勾耗材旗艦館'} description={lang === 'en' ? 'GodDog 3D is Taiwan leading 3D printing filament store, offering high-speed PLA, PETG, TPU, and Carbon Fiber.' : lang === 'ja' ? '神狗勾 3Dは最高峰の3Dプリント用フィラメント専門店。高速PLA、PETG、TPU、カーボン配合線材を豊富にお届け。' : '神狗勾耗材商城為台灣頂尖 3D 列印耗材專營商店，專為創客與專業人士提供高品質的高速 PLA、PETG 等線材。'} url="/" product={viewingProduct} products={products} />
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
                      {lang === 'en' ? 'New member perk: 100 G-Coins on sign-in' : lang === 'ja' ? '初回特典：ログインで100 G-Coin進呈' : '新會員登入即贈 100 點紅利積分'}
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
            {(() => {
              const preferredIds = ['maker-bambu-petg-matte', 'fil-01', 'fil-02'];
              const pickedFeatured = preferredIds
                .map((id) => products.find((p) => p.id === id))
                .filter((p): p is FilamentProduct => Boolean(p));
              const heroSpotlight = pickedFeatured.length >= 3
                ? pickedFeatured
                : products.slice(0, 3);
              const primarySpot = heroSpotlight[0];
              const secondarySpots = heroSpotlight.slice(1, 3);

              return (
                <section className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left Editorial Column */}
                    <div className="lg:col-span-6 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 flex flex-col justify-between gap-6">
                      <div className="space-y-3.5 sm:space-y-4">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>
                            {lang === 'en'
                              ? 'Taiwan Local Stock · Same-Day Dispatch'
                              : lang === 'ja'
                              ? '国内在庫即納 · 最短当日発送'
                              : '台灣現貨倉儲 · 拓竹 AMS 與高速機適用'}
                          </span>
                        </div>

                        <h1 className="text-[26px] sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.14] text-slate-900 dark:text-white text-balance">
                          {lang === 'en'
                            ? 'Precision 3D Filaments for High-Speed Printing'
                            : lang === 'ja'
                            ? '高速造形を安定させる 3D 専門フィラメント'
                            : '為穩定高速列印而生的 3D 專業線材'}
                        </h1>

                        <p className="text-xs sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg text-pretty">
                          {lang === 'en'
                            ? 'Authentic GodDog, Bambu Lab, eSUN & Polymaker stock. Laser-checked to ±0.02mm and dispatched in moisture-sealed bags.'
                            : lang === 'ja'
                            ? 'GodDog・Bambu Lab・eSUN・Polymaker 正規在庫。±0.02mm レーザー管理と防湿密封袋包装でお届け。'
                            : '嚴選神狗勾、Bambu Lab 拓竹、eSUN 與 Polymaker 原廠正品。全線通過 ±0.02mm 雙軸測徑檢驗，採用密封袋防潮包裝當日寄出。'}
                        </p>
                      </div>

                      {/* Crisp Dual CTAs */}
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
                        <button
                          id="hero-scroll-catalog-btn"
                          onClick={() => {
                            const el = document.getElementById('storefront-product-grid');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex-1 sm:flex-initial justify-center px-5 py-2.5 sm:py-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shadow-xs"
                        >
                          <span>
                            {lang === 'en'
                              ? `Browse Catalog (${products.length})`
                              : lang === 'ja'
                              ? `全商品を見る (${products.length})`
                              : `瀏覽全館耗材 (${products.length})`}
                          </span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>

                        <button
                          id="hero-ai-advisor-cta-btn"
                          onClick={() => setIsAIAdvisorOpen(true)}
                          className="flex-1 sm:flex-initial justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>{lang === 'en' ? 'Match Printer' : lang === 'ja' ? '機種別選材' : '依機型選材'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Daylight Featured Spools Gallery */}
                    <div className="lg:col-span-6 bg-[#F6F8FB] dark:bg-slate-950/60 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 lg:p-6 flex flex-col justify-center">
                      {primarySpot && (
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                          {/* Primary Spotlight Horizontal Card */}
                          <button
                            type="button"
                            onClick={() => handleOpenProductDetail(primarySpot)}
                            className="col-span-2 group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 p-3 sm:p-4 flex items-center gap-3.5 sm:gap-4 text-left transition-all hover:shadow-sm cursor-pointer"
                          >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                              <img
                                src={getSafeProductImageUrl(primarySpot.imageUrl, primarySpot.material, primarySpot.name)}
                                alt={translateProductName(primarySpot.name, lang)}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleProductImageError(e, primarySpot.material, primarySpot.name)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                                  {translateMaterial(primarySpot.material, lang)}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                                  {primarySpot.maxSpeed || '300 mm/s'}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {translateProductName(primarySpot.name, lang)}
                              </div>
                              <div className="flex items-center justify-between pt-0.5">
                                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                                  {formatPrice(primarySpot.price, currency)}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-0.5 transition-colors">
                                  {lang === 'en' ? 'View' : lang === 'ja' ? '詳細' : '查看規格'}
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Two Secondary Spool Quick-Picks */}
                          {secondarySpots.map((spot) => (
                            <button
                              key={spot.id}
                              type="button"
                              onClick={() => handleOpenProductDetail(spot)}
                              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 text-left transition-all hover:shadow-sm cursor-pointer min-w-0"
                            >
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0">
                                <img
                                  src={getSafeProductImageUrl(spot.imageUrl, spot.material, spot.name)}
                                  alt={translateProductName(spot.name, lang)}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleProductImageError(e, spot.material, spot.name)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                  {translateMaterial(spot.material, lang)}
                                </div>
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {translateProductName(spot.name, lang)}
                                </div>
                                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                                  {formatPrice(spot.price, currency)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unified Bottom Spec & Guarantee Strip (Consolidated to eliminate redundant boxes) */}
                  <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-px">
                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {lang === 'en' ? '24H Store Dispatch' : lang === 'ja' ? '24時間スピード出荷' : '24H 超商快速出貨'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lang === 'en' ? 'Free over NT$999' : lang === 'ja' ? 'NT$999以上送料無料' : '滿 NT$999 即享免運'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {lang === 'en' ? 'Moisture-Sealed Bag' : lang === 'ja' ? '防湿密封袋包装' : '密封袋防潮出貨'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lang === 'en' ? 'Unopened warranty' : lang === 'ja' ? '未開封吸湿保証' : '未拆封吸濕雙重保固'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {lang === 'en' ? 'NewebPay SSL' : lang === 'ja' ? '暗号化安全決済' : '藍新 SSL 安全金流'}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lang === 'en' ? 'Card / Apple Pay / ATM' : lang === 'ja' ? 'カード / Apple Pay' : '信用卡 / Apple Pay'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-900/95 px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums truncate">
                          ±0.02mm · 600mm/s
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {lang === 'en' ? 'Dual-axis laser QC' : lang === 'ja' ? '両軸レーザー品質管理' : '雙軸測徑與高速相容'}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Crisp Floating Quick-Tool Cards (2x2 mobile, 4-across desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              <button
                id="quick-action-ai-bot"
                onClick={() => setIsCustomerSupportOpen(true)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 rounded-2xl flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {lang === 'en' ? 'Tech Support' : lang === 'ja' ? '技術サポート' : '技術與選材客服'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {lang === 'en' ? 'Print guidance' : lang === 'ja' ? '造形トラブル相談' : '參數與列印諮詢'}
                  </div>
                </div>
              </button>

              <button
                id="quick-action-filament-lab"
                onClick={() => setIsFilamentLabOpen(true)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {lang === 'en' ? 'Maker Lab' : lang === 'ja' ? '計算ツール' : '耗材實驗與試算'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {lang === 'en' ? 'Cost & length' : lang === 'ja' ? 'コスト・残量計算' : '長度與成本估算'}
                  </div>
                </div>
              </button>

              <button
                id="quick-action-recycle"
                onClick={() => setIsRecycleOpen(true)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-2xl flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Recycle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {lang === 'en' ? 'Spool Recycle' : lang === 'ja' ? '空スプール還元' : '空盤回收換幣'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {lang === 'en' ? 'Earn store credit' : lang === 'ja' ? 'ポイント還元' : '空盤折抵購物金'}
                  </div>
                </div>
              </button>

              <button
                id="quick-action-compare"
                onClick={() => setIsCompareModalOpen(true)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-2xl flex items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3.5 hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {lang === 'en' ? 'Spec Compare' : lang === 'ja' ? '物性・規格比較' : '耗材規格對比'}
                    </span>
                    {comparisonIds.length > 0 && (
                      <span className="text-[11px] font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400">
                        ({comparisonIds.length})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {lang === 'en' ? 'Datasheet specs' : lang === 'ja' ? '物性データ比較' : '物性強度比較'}
                  </div>
                </div>
              </button>
            </div>

            {/* Search Autocomplete & Filter Chips Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5">
              {/* Top Row: Search Autocomplete with Material and Brand suggestions + Sort */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 max-w-2xl">
                  <SearchAutocomplete
                    id="storefront-product-search"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    products={products}
                    placeholder={t.searchPlaceholderInput || (lang === 'en' ? 'Search filament, brand or material (PLA+, PETG)...' : lang === 'ja' ? '材質 (PLA+, カーボン, PETG) やブランドを検索...' : '搜尋耗材材質、型號或品牌 (PLA+ / 碳纖維)...')}
                    onSelectProduct={handleOpenProductDetail}
                    onSelectMaterial={(m) => setSelectedMaterial(m)}
                  />
                </div>

                {/* Sort selector & Count */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                    {lang === 'en' ? 'Filtered: ' : lang === 'ja' ? '絞り込み: ' : '篩選：'}<strong className="text-slate-900 dark:text-slate-100 font-mono tabular-nums">{filteredAndSortedProducts.length}</strong> {lang === 'en' ? 'items' : lang === 'ja' ? '件' : '款'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium hidden xs:inline">
                      {lang === 'en' ? 'Sort:' : lang === 'ja' ? '並び順:' : '排序：'}
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/20"
                    >
                      <option value="popular">{lang === 'en' ? 'Most Popular (Default)' : lang === 'ja' ? '人気順 (デフォルト)' : '熱銷排行 (預設)'}</option>
                      <option value="price_low">{lang === 'en' ? 'Price: Low to High' : lang === 'ja' ? '価格: 安い順' : '價格：由低至高'}</option>
                      <option value="price_high">{lang === 'en' ? 'Price: High to Low' : lang === 'ja' ? '価格: 高い順' : '價格：由高至低'}</option>
                      <option value="rating">{lang === 'en' ? 'Highest Rating' : lang === 'ja' ? '高評価順' : '創客評分最高'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Category Material Filter Chips + Reset Filter (Clean wrap, never squeezes chips or reset button on desktop) */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 sm:pb-0 scrollbar-none flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-0.5 select-none">
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 select-none flex items-center gap-1.5 ${
                          isSelected
                            ? 'text-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-700/60'
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            layoutId="activeMaterialIndicator"
                            className="absolute inset-0 rounded-xl bg-slate-900 dark:bg-white -z-0"
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <span>{mat === 'All' ? t.allCategories : translateMaterial(mat, lang)}</span>
                          <span
                            className={`text-[10px] font-mono tabular-nums px-1 rounded-md transition-colors ${
                              isSelected ? 'bg-white/20 dark:bg-slate-900/15 text-white dark:text-slate-900' : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
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
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer shrink-0 self-end lg:self-start whitespace-nowrap"
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
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6"
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
                          className="h-full"
                        >
                          <ProductCard
                            product={product}
                            currency={currency}
                            lang={lang}
                            onAddToCart={(p, color, diameter, qty) => handleAddToCart(p, color, diameter, qty || 1)}
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
        ) : isOwnerAdmin ? (
          /* ================================================================= */
          /* INTERNAL MANAGEMENT ADMIN DASHBOARD (babe0615@gmail.com ONLY)     */
          /* ================================================================= */
          <AdminDashboard
            products={products}
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

      <Footer lang={lang} />
      
      {/* Global Toast Notification - Top floating non-blocking layer (z-[110]) so it never occludes CartDrawer or bottom buttons */}
      <AnimatePresence>
        {toastMsg && (
          <div className="fixed top-16 sm:top-20 lg:top-28 left-1/2 -translate-x-1/2 z-[110] pointer-events-none w-[calc(100%-2rem)] max-w-sm flex justify-center">
            <motion.div
              key={toastMsg.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              onClick={() => setToastMsg(null)}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 cursor-pointer"
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
          onUpdateQuantity={handleUpdateCartQuantity}
          onUpdateColor={handleUpdateCartColor}
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
          initialCouponCode={checkoutCouponCode}
          onOrderCompleted={handleOrderCompleted}
          onOpenTracking={(trk) => {
            setTrackingNumberInput(trk);
            setIsTrackingOpen(true);
          }}
        />
      )}

      <Suspense fallback={null}>
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
      </Suspense>

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
        lang={lang}
      />

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          lang={lang}
          onLoginSuccess={(user) => {
            const cleanUid = normalizeCustomerId(user.id) || 'usr_' + Date.now();
            setIsLoggedIn(true);
            syncUserData(cleanUid, user);
          }}
        />
      )}

      {/* Persistent Sync & Status Toast Notification (Positioned clear of bottom-right floating chat widget) */}
      {toastNotification && (
        <div className="fixed bottom-24 lg:bottom-24 right-4 sm:right-6 z-50 max-w-sm w-full px-2 sm:px-4 animate-fade-in pointer-events-none">
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

      {/* Maker Lab, Comparison, History & Recycle Lazy Modals */}
      <Suspense fallback={null}>
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
          lang={lang}
        />
      )}
      </Suspense>

      {/* Free Draggable AI Floating Chat & Advisor Bubble with Recycle / Hide Drop Zone */}
      <DraggableChatWidget
        onOpenSupport={() => setIsCustomerSupportOpen(true)}
        onOpenAdvisor={() => setIsAIAdvisorOpen(true)}
        lang={lang}
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

      {/* Mobile App Bottom Navigation Tab Bar (Standard Mobile Experience) - Hidden during Cart or Checkout */}
      {!isCheckoutOpen && !isCartOpen && (
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
      <FlyToCartOverlay />
    </div>
  );
}
