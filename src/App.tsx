import React, { useState, useEffect } from 'react';
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
  PaymentAndI18nGuide 
} from './components/TechGuide/PaymentAndI18nGuide';
import { 
  FilamentLabModal 
} from './components/Storefront/FilamentLabModal';
import { 
  ProductComparisonModal 
} from './components/Storefront/ProductComparisonModal';
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
  INITIAL_ORDERS, 
  SUBSCRIPTION_PLANS, 
  INITIAL_ANALYTICS, 
  INITIAL_MEMBER 
} from './data/mockData';
import { 
  FilamentProduct, 
  ColorOption, 
  CartItem, 
  Order, 
  LanguageCode, 
  CurrencyCode,
  AdSenseConfig 
} from './types';
import { translations } from './utils/i18n';
import { 
  saveOrderToFirestore, 
  saveUserProfileToFirestore, 
  subscribeToAuth,
  saveMonetizationConfigToFirestore,
  loadMonetizationConfigFromFirestore
} from './lib/firebase';
import {
  getStoredCustomerSession,
  saveStoredCustomerSession,
  clearStoredCustomerSession,
  saveCustomerCart,
  loadCustomerCart,
  saveCustomerWishlist,
  loadCustomerWishlist,
  saveCustomerOrderRecord,
  loadCustomerOrders,
  saveCustomerTrackingNumbers,
  loadCustomerTrackingNumbers,
} from './lib/customerPersistence';
import { AdSenseBanner } from './components/Monetization/AdSenseBanner';
import { 
  Sparkles, 
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
  Bot
} from 'lucide-react';

export default function App() {
  // App view mode: customer storefront vs admin management vs tech integration guide
  const [activeTab, setActiveTab] = useState<'store' | 'admin' | 'tech-guide'>('store');

  // i18n & currency
  const [lang, setLang] = useState<LanguageCode>('zh-TW');
  const [currency, setCurrency] = useState<CurrencyCode>('TWD');

  // Core Data States
  const [products, setProducts] = useState<FilamentProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [subscriptions, setSubscriptions] = useState(SUBSCRIPTION_PLANS);
  const [member, setMember] = useState(INITIAL_MEMBER);
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      selectedColor: INITIAL_PRODUCTS[0].colors[0],
      selectedDiameter: '1.75mm',
      quantity: 2,
    },
    {
      product: INITIAL_PRODUCTS[1],
      selectedColor: INITIAL_PRODUCTS[1].colors[0],
      selectedDiameter: '1.75mm',
      quantity: 1,
    },
  ]);

  // Product Filter and Search in Storefront
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');

  // Modals Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPointsToUse, setCheckoutPointsToUse] = useState(0);
  const [viewingProduct, setViewingProduct] = useState<FilamentProduct | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isCustomerSupportOpen, setIsCustomerSupportOpen] = useState(false);
  const [supportInitialPrompt, setSupportInitialPrompt] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Maker & Storefront Enhancement States
  const [isFilamentLabOpen, setIsFilamentLabOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isRecycleOpen, setIsRecycleOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('printcore_comparison_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('printcore_wishlist_ids');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-3'];
    }
  });

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('printcore_wishlist_ids', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleCompare = (id: string) => {
    setComparisonIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        localStorage.setItem('printcore_comparison_ids', JSON.stringify(next));
        return next;
      }
      if (prev.length >= 4) {
        setIsCompareModalOpen(true);
        return prev;
      }
      const next = [...prev, id];
      localStorage.setItem('printcore_comparison_ids', JSON.stringify(next));
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
      const updated = {
        ...prev,
        points: prev.points + points,
      };
      saveUserProfileToFirestore(updated);
      return updated;
    });
  };

  // AdSense & Monetization State (Live Production Ready)
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
    enabled: true,
    publisherId: 'ca-pub-7053299616784703',
    enableAutoAds: true,
    testMode: true, // Default to true in development/preview so banners display immediately
    slots: {
      storefrontTopBanner: '7728192031',
      inFeedSponsored: '5538192042',
      footerLeaderboard: '9928192053',
    },
    showTopBanner: true,
    showInFeedAd: true,
    showFooterBanner: true,
    estimatedStats: {
      dailyImpressions: 8500,
      dailyClicks: 187,
      avgCpcTwd: 15,
      monthlyEarningsTwd: 84150,
    },
  });
  const [isSyncingAdSense, setIsSyncingAdSense] = useState(false);

  // Sync monetization config from Firestore or localStorage
  useEffect(() => {
    async function loadMonetization() {
      try {
        const savedFirestore = await loadMonetizationConfigFromFirestore();
        if (savedFirestore && savedFirestore.publisherId) {
          setAdSenseConfig((prev) => ({ ...prev, ...savedFirestore }));
          return;
        }
      } catch (e) {
        console.warn('Fallback loading monetization:', e);
      }
      const local = localStorage.getItem('printcore_adsense_config');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed && parsed.publisherId) {
            setAdSenseConfig((prev) => ({ ...prev, ...parsed }));
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

  // Synchronize user cart, wishlist, orders, and tracking from Firestore
  const syncUserData = async (userId: string, profile?: any) => {
    if (!userId) return;
    setIsSyncingUserData(true);
    try {
      // 1. Cloud Cart
      const cloudCart = await loadCustomerCart(userId);
      if (cloudCart && cloudCart.length > 0) {
        setCartItems(cloudCart);
      }
      // 2. Cloud Wishlist
      const cloudWishlist = await loadCustomerWishlist(userId);
      if (cloudWishlist && cloudWishlist.length > 0) {
        setWishlistIds(cloudWishlist);
      }
      // 3. Cloud Orders / Purchase records
      const cloudOrders = await loadCustomerOrders(userId);
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
      // 4. Logistics tracking
      const cloudTracking = await loadCustomerTrackingNumbers(userId);
      if (cloudTracking && cloudTracking.length > 0) {
        setTrackingNumberInput(cloudTracking[0]);
      }
      setToastNotification({
        type: 'success',
        message: `☁️ 歡迎回來！已為您同步【${profile?.name || '會員'}】的雲端購物車、收藏與訂單紀錄！`,
      });
    } catch (e) {
      console.warn('Customer cloud data sync fallback:', e);
    } finally {
      setIsSyncingUserData(false);
    }
  };

  // Restore stored session on mount or load guest state
  useEffect(() => {
    const session = getStoredCustomerSession();
    if (session && session.id && session.isLoggedIn) {
      setIsLoggedIn(true);
      setMember((prev) => ({
        ...prev,
        id: session.id,
        name: session.name || prev.name,
        email: session.email || prev.email,
        tier: session.tier || prev.tier,
        points: session.points !== undefined ? session.points : prev.points,
        totalSpent: session.totalSpent !== undefined ? session.totalSpent : prev.totalSpent,
      }));
      syncUserData(session.id, session);
    } else {
      // Load guest cart & wishlist
      loadCustomerCart(null).then((c) => {
        if (c && c.length > 0) setCartItems(c);
      });
      loadCustomerWishlist(null).then((w) => {
        if (w && w.length > 0) setWishlistIds(w);
      });
    }
  }, []);

  // Sync cart changes to Firestore & local storage
  useEffect(() => {
    saveCustomerCart(isLoggedIn ? member?.id : null, cartItems);
  }, [cartItems, isLoggedIn, member?.id]);

  // Sync wishlist changes to Firestore & local storage
  useEffect(() => {
    saveCustomerWishlist(isLoggedIn ? member?.id : null, wishlistIds);
  }, [wishlistIds, isLoggedIn, member?.id]);

  // Handle customer logout
  const handleLogout = () => {
    clearStoredCustomerSession();
    setIsLoggedIn(false);
    const guestUser = {
      ...INITIAL_MEMBER,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: '訪客創客',
      email: '',
      points: 0,
      totalSpent: 0,
      ordersCount: 0,
    };
    setMember(guestUser);
    loadCustomerCart(null).then((c) => setCartItems(c || []));
    loadCustomerWishlist(null).then((w) => setWishlistIds(w || ['prod-1', 'prod-3']));
    setToastNotification({
      type: 'info',
      message: '您已安全登出會員帳號，購物車與瀏覽紀錄已切換至訪客狀態。',
    });
  };

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        const updatedMember = {
          ...member,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || member.name,
          email: firebaseUser.email || member.email,
        };
        setMember(updatedMember);
        saveStoredCustomerSession({
          id: firebaseUser.uid,
          name: updatedMember.name,
          email: updatedMember.email,
          tier: updatedMember.tier,
          points: updatedMember.points,
          totalSpent: updatedMember.totalSpent,
          isLoggedIn: true,
        });
        syncUserData(firebaseUser.uid, updatedMember);
      }
    });
    return () => unsubscribe();
  }, []);

  const t = translations[lang];

  // Cart operations
  const handleAddToCart = (
    product: FilamentProduct,
    color: ColorOption,
    diameter: '1.75mm' | '2.85mm',
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor.name === color.name &&
          item.selectedDiameter === diameter
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedColor: color, selectedDiameter: diameter, quantity }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProceedCheckout = (pointsUsed: number) => {
    setCheckoutPointsToUse(pointsUsed);
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
    setIsCheckoutOpen(true);
  };

  // When an order is completed:
  const handleOrderCompleted = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveCustomerOrderRecord(newOrder, isLoggedIn ? member?.id : null);
    saveCustomerCart(isLoggedIn ? member?.id : null, []);
    setCartItems([]);
    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const orderItem = newOrder.items.find((i) => i.productId === p.id);
        if (orderItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - orderItem.quantity),
          };
        }
        return p;
      })
    );
    // Add loyalty points to member profile
    const updatedMember = {
      ...member,
      points: member.points - newOrder.pointsDeduction + newOrder.pointsEarned,
      totalSpent: member.totalSpent + newOrder.total,
      ordersCount: (member.ordersCount || 0) + 1,
    };
    setMember(updatedMember);
    if (isLoggedIn) {
      saveUserProfileToFirestore(updatedMember);
      saveStoredCustomerSession({
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        tier: updatedMember.tier,
        points: updatedMember.points,
        totalSpent: updatedMember.totalSpent,
        isLoggedIn: true,
      });
    }
    setToastNotification({
      type: 'success',
      message: `🎉 訂單 ${newOrder.orderNumber} 成立！已永久保存至您的雲端購買紀錄與物流查詢。`,
    });
  };

  // Filter and sort products
  const materials = ['All', 'High-Speed PLA', 'PETG', 'ABS', 'TPU', 'Carbon Fiber', 'Resin'];

  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesMat = selectedMaterial === 'All' || p.material === selectedMaterial;
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
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Universal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onOpenSupport={() => setIsCustomerSupportOpen(true)}
        onOpenTracking={() => {
          setTrackingNumberInput(orders[0]?.trackingNumber || '');
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
        onOpenRecycle={() => setIsRecycleOpen(true)}
        isLoggedIn={isLoggedIn}
        member={member}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8 pb-32 sm:pb-36 lg:pb-8 overflow-x-hidden">
        {activeTab === 'store' ? (
          /* ================================================================= */
          /* CUSTOMER STOREFRONT VIEW                                          */
          /* ================================================================= */
          <div className="space-y-4 sm:space-y-8">
            {/* Hero Banner (Responsive: Mobile sleek card & Desktop grand layout) */}
            <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Column: Heading & Description */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">2026 高速 600mm/s 拓竹 AMS 與 K1 旗艦專用線材</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    神狗勾耗材商城，<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">極速流暢</span> 的 3D 列印線材專家
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    全館耗材通過 0.02mm 高精度光學線徑檢驗與真空鋁箔防潮包裝。支援綠界科技 (信用卡/ATM/超商代碼)、LINE Pay 直連，全台 7-11 與全家超取滿 NT$999 免運！
                  </p>

                  {/* Action CTA Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      id="hero-ai-advisor-cta-btn"
                      onClick={() => setIsAIAdvisorOpen(true)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>AI 耗材顧問：依機型精準配對</span>
                    </button>

                    <button
                      id="hero-scroll-catalog-btn"
                      onClick={() => {
                        const el = document.getElementById('storefront-product-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-white/20 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>選購全部耗材型錄 ↓</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Desktop Spec Highlights Badge Grid */}
                <div className="hidden lg:grid lg:col-span-5 grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/60 transition-colors">
                    <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider">High Speed</div>
                    <div className="text-2xl font-black text-white mt-1">600 <span className="text-xs font-semibold text-slate-400">mm/s</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">極限高速出膠不碳化、層間結合力強</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                    <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Precision</div>
                    <div className="text-2xl font-black text-white mt-1">±0.02 <span className="text-xs font-semibold text-slate-400">mm</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">光學校準同心度，連續列印不卡噴嘴</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 transition-colors">
                    <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">AMS Ready</div>
                    <div className="text-2xl font-black text-white mt-1">100% <span className="text-xs font-semibold text-slate-400">相容</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">標準 200mm 卷軸，拓竹多色完美進退料</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
                    <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Local Fast</div>
                    <div className="text-2xl font-black text-white mt-1">24H <span className="text-xs font-semibold text-slate-400">出貨</span></div>
                    <p className="text-[11px] text-slate-400 mt-1">台灣現貨新竹/7-11/全家快速發貨</p>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden lg:block bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-cyan-500/20 to-transparent"></div>
            </section>

            {/* App Services Matrix ("金剛區" - 5 Major Features Row) */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-4">
                {/* 1. AI Advisor */}
                <button
                  id="quick-action-ai-advisor"
                  onClick={() => setIsAIAdvisorOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-indigo-50/60 transition-all cursor-pointer group active:scale-95 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate max-w-full">
                    AI 顧問
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">機型配對</span>
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
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-cyan-600 truncate max-w-full">
                    創客工具
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">報價/餘量</span>
                </button>

                {/* 3. Subscription Club */}
                <button
                  id="quick-action-subscription"
                  onClick={() => setIsSubscriptionOpen(true)}
                  className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl hover:bg-amber-50/60 transition-all cursor-pointer group active:scale-95 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5 text-amber-100" />
                  </div>
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-600 truncate max-w-full">
                    定期85折
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">每月直送</span>
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
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-emerald-600 truncate max-w-full">
                    空盤換幣
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">折抵現金</span>
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
                  <span className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-purple-600 truncate max-w-full">
                    規格對比
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block">多款橫向PK</span>
                </button>
              </div>
            </div>

            {/* Feature Guarantees Strip (Responsive: Single row ticker on Mobile, 4 Cards on Desktop) */}
            <div className="block sm:hidden bg-slate-100/90 py-2.5 px-3 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 whitespace-nowrap gap-3">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>滿 $999 免運</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>綠界/LINE Pay</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>AMS 相容</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                  <span>原廠防潮保固</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">即時物流追蹤</div>
                  <div className="text-[11px] text-slate-500">超商交貨便 24H 快速出貨</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">綠界科技 / LINE Pay</div>
                  <div className="text-[11px] text-slate-500">官方特店 256-bit SSL 安全付款</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Bambu AMS 完美相容</div>
                  <div className="text-[11px] text-slate-500">防卡線環保卷軸設計</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">原廠防潮保固</div>
                  <div className="text-[11px] text-slate-500">未拆封破損 100% 免費換新</div>
                </div>
              </div>
            </div>

            {/* Google AdSense Top Leaderboard Banner */}
            <AdSenseBanner
              placement="header-top"
              config={adSenseConfig}
              onSimulateClick={() => {
                setAdSenseConfig((prev) => ({
                  ...prev,
                  estimatedStats: {
                    dailyImpressions: (prev.estimatedStats?.dailyImpressions || 8500) + 1,
                    dailyClicks: (prev.estimatedStats?.dailyClicks || 187) + 1,
                    avgCpcTwd: prev.estimatedStats?.avgCpcTwd || 15,
                    monthlyEarningsTwd: (prev.estimatedStats?.monthlyEarningsTwd || 84150) + 15 * 30,
                  },
                }));
              }}
            />

            {/* Search Autocomplete & Filter Chips Bar */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              {/* Top Row: Search Autocomplete with Material and Brand suggestions + Sort */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 max-w-2xl">
                  <SearchAutocomplete
                    id="storefront-product-search"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    products={products}
                    placeholder="搜尋耗材材質 (PLA+, 碳纖維, PETG, TPU) 或品牌 (神狗勾, Bambu)..."
                    onSelectProduct={(p) => setViewingProduct(p)}
                    onSelectMaterial={(m) => setSelectedMaterial(m)}
                  />
                </div>

                {/* Sort selector & Count */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    篩選：<strong className="text-slate-900 font-mono">{filteredAndSortedProducts.length}</strong> 款
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium hidden xs:inline">排序：</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="popular">熱銷排行 (預設)</option>
                      <option value="price_low">價格：由低至高</option>
                      <option value="price_high">價格：由高至低</option>
                      <option value="rating">創客評分最高</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Category Material Filter Chips + Reset Filter */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 select-none">材質：</span>
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
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
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
                          <span>{mat === 'All' ? t.allCategories : mat}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded-md transition-colors ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-500'
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
                    重設所有篩選 ✕
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
                    className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3"
                  >
                    <p className="font-bold text-slate-700 text-base">找不到符合條件的 3D 列印耗材</p>
                    <p className="text-xs text-slate-400">建議嘗試切換不同材質標籤或清除關鍵字搜尋！</p>
                    <button
                      onClick={() => {
                        setSelectedMaterial('All');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      重設搜尋條件
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
                            onViewDetail={(p) => setViewingProduct(p)}
                            isWishlisted={wishlistIds.includes(product.id)}
                            onToggleWishlist={handleToggleWishlist}
                            isCompared={comparisonIds.includes(product.id)}
                            onToggleCompare={handleToggleCompare}
                          />
                        </motion.div>
                        {idx === 1 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
                          <div className="col-span-2 md:col-span-3 lg:col-span-4">
                            <AdSenseBanner
                              placement="in-feed"
                              config={adSenseConfig}
                              onSimulateClick={() => {
                                setAdSenseConfig((prev) => ({
                                  ...prev,
                                  estimatedStats: {
                                    dailyImpressions: (prev.estimatedStats?.dailyImpressions || 8500) + 1,
                                    dailyClicks: (prev.estimatedStats?.dailyClicks || 187) + 1,
                                    avgCpcTwd: prev.estimatedStats?.avgCpcTwd || 15,
                                    monthlyEarningsTwd: (prev.estimatedStats?.monthlyEarningsTwd || 84150) + 15 * 30,
                                  },
                                }));
                              }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Google AdSense Footer Leaderboard Banner */}
            <AdSenseBanner
              placement="footer-bottom"
              config={adSenseConfig}
              onSimulateClick={() => {
                setAdSenseConfig((prev) => ({
                  ...prev,
                  estimatedStats: {
                    dailyImpressions: (prev.estimatedStats?.dailyImpressions || 8500) + 1,
                    dailyClicks: (prev.estimatedStats?.dailyClicks || 187) + 1,
                    avgCpcTwd: prev.estimatedStats?.avgCpcTwd || 15,
                    monthlyEarningsTwd: (prev.estimatedStats?.monthlyEarningsTwd || 84150) + 15 * 30,
                  },
                }));
              }}
            />
          </div>
        ) : activeTab === 'tech-guide' ? (
          /* ================================================================= */
          /* PAYMENT & I18N TECHNICAL INTEGRATION & IMPLEMENTATION GUIDE       */
          /* ================================================================= */
          <PaymentAndI18nGuide
            currentLang={lang}
            currentCurrency={currency}
          />
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 pb-24 lg:pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3D
            </div>
            <span className="font-extrabold text-slate-900">神狗勾耗材商城 官方旗艦館</span>
            <span>• 綠界特店代碼 3002607 • LINE Pay 官方合作夥伴</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600">
            <button 
              onClick={() => setIsFilamentLabOpen(true)}
              className="hover:text-indigo-600 font-medium cursor-pointer"
            >
              🧪 創客工具實驗室
            </button>
            <button 
              onClick={() => setIsRecycleOpen(true)}
              className="hover:text-emerald-600 font-medium cursor-pointer"
            >
              ♻️ 空盤回收獎勵
            </button>
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="hover:text-rose-600 font-medium cursor-pointer"
            >
              💖 我的願望清單
            </button>
            <button 
              onClick={() => {
                setTrackingNumberInput(orders[0]?.trackingNumber || '');
                setIsTrackingOpen(true);
              }}
              className="hover:text-indigo-600 cursor-pointer"
            >
              物流進度查詢
            </button>
            <button 
              onClick={() => setIsLoyaltyOpen(true)}
              className="hover:text-indigo-600 cursor-pointer"
            >
              創客會員權益
            </button>
            <button 
              onClick={() => setIsSubscriptionOpen(true)}
              className="hover:text-indigo-600 cursor-pointer"
            >
              月配俱樂部
            </button>
            <button 
              onClick={() => setIsCustomerSupportOpen(true)}
              className="hover:text-indigo-600 cursor-pointer"
            >
              列印故障排查
            </button>
            <button 
              onClick={() => setActiveTab('tech-guide')}
              className="hover:text-indigo-600 text-slate-400 font-mono text-[11px] cursor-pointer"
            >
              技術實施規範
            </button>
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* GLOBAL MODALS                                                       */}
      {/* =================================================================== */}
      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          currency={currency}
          lang={lang}
          onClose={() => setViewingProduct(null)}
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
          onQuickCheckout={handleQuickCheckout}
          onAskAI={(p) => {
            setViewingProduct(null);
            setSupportInitialPrompt(`我想了解【${p.name}】(${p.material}) 的最佳切片參數、噴嘴溫度與相容性建議！`);
            setIsCustomerSupportOpen(true);
          }}
        />
      )}

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
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
          orders={orders}
          userId={isLoggedIn ? member?.id : undefined}
        />
      )}

      {isSubscriptionOpen && (
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
          currency={currency}
        />
      )}

      {isLoyaltyOpen && (
        <LoyaltyModal
          isOpen={isLoyaltyOpen}
          onClose={() => setIsLoyaltyOpen(false)}
          member={member}
          currency={currency}
          orders={orders}
          onOpenTrackingWithCode={(trackingCode) => {
            setTrackingNumberInput(trackingCode);
            setIsTrackingOpen(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {isCustomerSupportOpen && (
        <CustomerSupportModal
          isOpen={isCustomerSupportOpen}
          onClose={() => {
            setIsCustomerSupportOpen(false);
            setSupportInitialPrompt('');
          }}
          viewingProduct={viewingProduct}
          cartItems={cartItems}
          member={member}
          initialPrompt={supportInitialPrompt}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(user) => {
            setIsLoggedIn(true);
            const updated = {
              ...member,
              id: user.id || member.id,
              name: user.name || (user as any).displayName || user.email?.split('@')[0] || '神狗勾 會員',
              email: user.email || member.email,
              points: (user.points !== undefined ? user.points : member.points) + 120, // New member reward bonus points
            };
            setMember(updated);
            saveStoredCustomerSession({
              id: updated.id,
              name: updated.name,
              email: updated.email,
              tier: updated.tier,
              points: updated.points,
              totalSpent: updated.totalSpent,
              isLoggedIn: true,
            });
            saveUserProfileToFirestore(updated);
            syncUserData(updated.id, updated);
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
            localStorage.setItem('printcore_comparison_ids', JSON.stringify(ids));
          }}
          onRemoveComparison={(id) => handleToggleCompare(id)}
          onClearComparison={() => {
            setComparisonIds([]);
            localStorage.removeItem('printcore_comparison_ids');
          }}
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
          currency={currency}
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
          onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
          onAddAllToCart={handleAddAllWishlistToCart}
          currency={currency}
          lang={lang}
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
              已選 <span className="font-mono text-amber-400 text-sm">{comparisonIds.length}</span> / 4 款
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              橫向規格對比
            </button>
            <button
              onClick={() => {
                setComparisonIds([]);
                localStorage.removeItem('printcore_comparison_ids');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="清空選取"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Tab Bar (Standard Mobile Experience) */}
      <nav
        id="mobile-bottom-nav-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200/90 py-1 px-1.5 shadow-2xl flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {/* Tab 1: Store Catalog */}
        <button
          onClick={() => {
            setActiveTab('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer min-w-[48px] active:scale-95 ${
            activeTab === 'store' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">商城</span>
        </button>

        {/* Tab 2: Maker Lab */}
        <button
          onClick={() => setIsFilamentLabOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer min-w-[48px] active:scale-95"
        >
          <Wrench className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">創客工具</span>
        </button>

        {/* Tab 3: AI Advisor (Highlighted Center Orb) */}
        <button
          onClick={() => setIsAIAdvisorOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 cursor-pointer group min-w-[54px] active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-active:scale-95 transition-transform border-2 border-white">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-indigo-600 whitespace-nowrap">AI 顧問</span>
        </button>

        {/* Tab 4: Wishlist */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-rose-600 transition-colors cursor-pointer min-w-[48px] relative active:scale-95"
        >
          <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
          {wishlistIds.length > 0 && (
            <span className="absolute top-0 right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs">
              {wishlistIds.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">收藏</span>
        </button>

        {/* Tab 5: Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer min-w-[48px] relative active:scale-95"
        >
          <ShoppingCart className="w-5 h-5 text-slate-800" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">購物車</span>
        </button>
      </nav>
    </div>
  );
}
