import React, { useState, useEffect } from 'react';
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
  ChevronDown
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

  // AdSense & Monetization State
  const [adSenseConfig, setAdSenseConfig] = useState<AdSenseConfig>({
    enabled: true,
    publisherId: 'ca-pub-7053299616784703',
    enableAutoAds: true,
    testMode: true,
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

  // Sync auth state with Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setMember((prev) => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || prev.name,
          email: firebaseUser.email || prev.email,
        }));
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
    setOrders([newOrder, ...orders]);
    saveOrderToFirestore(newOrder, member?.id);
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
    setMember((prev) => ({
      ...prev,
      points: prev.points - newOrder.pointsDeduction + newOrder.pointsEarned,
      totalSpent: prev.totalSpent + newOrder.total,
    }));
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
        onOpenTracking={() => {
          setTrackingNumberInput(orders[0]?.trackingNumber || '');
          setIsTrackingOpen(true);
        }}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={isLoggedIn}
        member={member}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'store' ? (
          /* ================================================================= */
          /* CUSTOMER STOREFRONT VIEW                                          */
          /* ================================================================= */
          <div className="space-y-8">
            {/* Hero Banner with High-Speed Filament Focus */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>2026 新世代 High-Speed 600mm/s 拓竹 AMS 與 K1 專用線材</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  神狗勾耗材商城，<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">極速流暢</span> 的 3D 列印線材專家
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  全館耗材通過 0.02mm 高精度光學線徑檢驗與真空鋁箔防潮包裝。支援綠界科技 (信用卡/ATM/超商代碼)、LINE Pay 直連，全台 7-11 與全家超取滿 NT$999 免運！
                </p>

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
                    id="hero-subscription-cta-btn"
                    onClick={() => setIsSubscriptionOpen(true)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-white/20 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>訂閱俱樂部 (每月 85 折直送)</span>
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none hidden lg:block bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/40 to-transparent"></div>
            </section>

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

            {/* Feature Guarantees Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

            {/* Search Autocomplete & Filter Chips Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
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
                  <span className="text-slate-500">
                    篩選結果：<strong className="text-slate-900 font-mono text-sm">{filteredAndSortedProducts.length}</strong> 款
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">排序：</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">材質系列：</span>
                  {materials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedMaterial === mat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {mat === 'All' ? t.allCategories : mat}
                    </button>
                  ))}
                </div>

                {/* Active Filter Clear Tag */}
                {(searchQuery || selectedMaterial !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMaterial('All');
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer shrink-0 ml-auto"
                  >
                    重設所有篩選 ✕
                  </button>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <p className="font-bold text-slate-700 text-base">找不到符合條件的 3D 列印耗材</p>
                <p className="text-xs text-slate-400">建議嘗試切換不同材質標籤或清除關鍵字搜尋！</p>
                <button
                  onClick={() => {
                    setSelectedMaterial('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  重設搜尋條件
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredAndSortedProducts.map((product, idx) => (
                  <React.Fragment key={product.id}>
                    <ProductCard
                      product={product}
                      currency={currency}
                      lang={lang}
                      onAddToCart={(p, color, diameter) => handleAddToCart(p, color, diameter, 1)}
                      onViewDetail={(p) => setViewingProduct(p)}
                    />
                    {idx === 1 && adSenseConfig.enabled && adSenseConfig.showInFeedAd && (
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
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

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

      {/* Floating Customer Support Button */}
      <button
        id="floating-support-btn"
        onClick={() => setIsCustomerSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-indigo-600 text-white p-3.5 rounded-full shadow-2xl border-2 border-white/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        aria-label="3D 列印技術工程師與客服"
      >
        <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:text-white" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">3D 技術客服</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3D
            </div>
            <span className="font-extrabold text-slate-900">神狗勾耗材商城 官方旗艦館</span>
            <span>• 綠界特店代碼 3002607 • LINE Pay 官方合作夥伴</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-600">
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
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* GLOBAL MODALS                                                       */}
      {/* =================================================================== */}
      <ProductDetailModal
        product={viewingProduct}
        currency={currency}
        lang={lang}
        onClose={() => setViewingProduct(null)}
        onAddToCart={(p, c, d, q) => handleAddToCart(p, c, d, q)}
        onQuickCheckout={handleQuickCheckout}
      />

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

      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        defaultTrackingNumber={trackingNumberInput}
        orders={orders}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currency={currency}
      />

      <LoyaltyModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        member={member}
        currency={currency}
      />

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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setMember((prev) => {
            const updated = {
              ...prev,
              id: user.id || prev.id,
              name: user.name || (user as any).displayName || user.email?.split('@')[0] || '神狗勾 會員',
              email: user.email || prev.email,
              points: (user.points !== undefined ? user.points : prev.points) + 120, // New member reward bonus points
            };
            saveUserProfileToFirestore(updated);
            return updated;
          });
        }}
      />
    </div>
  );
}
