import React, { useState, useEffect } from 'react';
import { 
  Moon,
  Sun,
  ShoppingCart, 
  Sparkles, 
  Truck, 
  Layers, 
  Award, 
  Settings, 
  Globe, 
  Coins, 
  Menu, 
  X, 
  Package, 
  Flame, 
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Code2,
  UserCheck,
  LogIn,
  Scale,
  Heart,
  Recycle,
  Wrench,
  Bot,
  MessageSquare,
  FileText,
  BookOpen,
  HelpCircle,
  Compass,
  Info,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LanguageCode, CurrencyCode, MemberProfile, FilamentProduct, StoreAnnouncementConfig } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';
import { SearchAutocomplete } from './Storefront/SearchAutocomplete';
import { FLY_TO_CART_LANDED_EVENT } from './Storefront/FlyToCartOverlay';

interface NavbarProps {
  announcement?: StoreAnnouncementConfig;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  activeTab?: 'store' | 'admin';
  setActiveTab?: (tab: 'store' | 'admin') => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  cartCount: number;
  openCart?: () => void;
  onOpenCart?: () => void;
  onOpenAIAdvisor?: () => void;
  onOpenSupport?: () => void;
  onOpenTracking?: () => void;
  onOpenAuth?: () => void;
  onOpenFilamentLab?: () => void;
  onOpenCompare?: () => void;
  compareCount?: number;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenHistory?: () => void;
  historyCount?: number;
  onSelectProduct?: (product: FilamentProduct) => void;
  onOpenRecycle?: () => void;
  isLoggedIn?: boolean;
  member: MemberProfile;
  openMemberModal?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  products?: FilamentProduct[];
}

export const Navbar: React.FC<NavbarProps> = ({
  announcement,
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currency,
  setCurrency,
  cartCount,
  openCart,
  onOpenCart,
  onOpenAIAdvisor,
  onOpenSupport,
  onOpenTracking,
  onOpenAuth,
  onOpenFilamentLab,
  onOpenCompare,
  compareCount = 0,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenHistory,
  historyCount = 0,
  onSelectProduct,
  onOpenRecycle,
  isLoggedIn = false,
  member,
  openMemberModal,
  searchQuery,
  setSearchQuery,
  products,
  isDarkMode,
  toggleDarkMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => (y > 36 ? true : y < 12 ? false : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isCartPulsing, setIsCartPulsing] = useState(false);

  useEffect(() => {
    let pulseTimer: number | undefined;
    const handleLanded = () => {
      setIsCartPulsing(true);
      if (pulseTimer) window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => setIsCartPulsing(false), 320);
    };
    window.addEventListener(FLY_TO_CART_LANDED_EVENT, handleLanded);
    return () => {
      window.removeEventListener(FLY_TO_CART_LANDED_EVENT, handleLanded);
      if (pulseTimer) window.clearTimeout(pulseTimer);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const effectiveCartOpen = onOpenCart || openCart || (() => {});
  const effectiveMemberOpen =
    openMemberModal ||
    (() => {
      setActiveTab?.('store');
      navigate('/profile');
    });
  const effectiveActiveTab = activeTab || 'store';
  const isOwnerAdmin = Boolean(
    isLoggedIn &&
    member?.email &&
    member.email.trim().toLowerCase() === 'babe0615@gmail.com'
  );

  const handleNavClick = (id: string) => {
    if (id === 'store') {
      if (location.pathname !== '/') navigate('/');
      setActiveTab?.('store');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'blog') {
      navigate('/blog');
    } else if (id === 'guide') {
      navigate('/guide');
    } else if (id === 'faq') {
      navigate('/faq');
    } else if (id === 'about') {
      navigate('/about');
    } else if (id === 'filament-lab') {
      onOpenFilamentLab?.();
    } else if (id === 'admin') {
      if (!isOwnerAdmin) return;
      setActiveTab?.('admin');
    } else if (id === 'subscription') {
      navigate('/subscription');
    } else if (id === 'ai-advisor') {
      onOpenAIAdvisor?.();
    } else if (id === 'logistics') {
      onOpenTracking?.();
    } else if (id === 'member') {
      effectiveMemberOpen();
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'store', label: t.navCatalog, icon: Layers },
    { id: 'blog', label: t.bottomBlog || '創客專欄', icon: BookOpen },
    { id: 'guide', label: t.bottomGuide || '材質指南', icon: Compass },
    { id: 'faq', label: t.navFaq || '常見問題', icon: HelpCircle },
    { id: 'filament-lab', label: t.makerTools || '創客工具', icon: Wrench },
    { id: 'about', label: t.navAbout || '關於我們', icon: Info },
  ];

  return (
    <>
      {/* Top Announcement Bar - Lives naturally above the sticky header so it scrolls away cleanly without height-transition feedback jitter */}
      <div className="bg-slate-900 text-white text-xs font-medium flex items-center py-1.5 relative overflow-hidden border-b border-slate-800/80">
        
        {/* Full-width Marquee Container - Continuous edge-to-edge flow on all screens */}
        <div className="flex-1 w-full overflow-hidden flex items-center relative h-full">
          <div className="flex items-center gap-6 animate-marquee whitespace-nowrap min-w-max pr-6">
            {/* First Set */}
            <div className="flex items-center gap-4 shrink-0">
              {announcement?.isEnabled && announcement?.text && (
                <>
                  <div className="flex items-center gap-1.5 shrink-0 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    <span className="font-black text-[10px] text-amber-300">
                      {announcement.type === 'promotion'
                        ? lang === 'en' ? '🔥 Promo' : lang === 'ja' ? '🔥 特価セール' : '🔥 全館特惠'
                        : announcement.type === 'shipping'
                        ? lang === 'en' ? '🚚 Shipping' : lang === 'ja' ? '🚚 配送案内' : '🚚 出貨公告'
                        : announcement.type === 'holiday'
                        ? lang === 'en' ? '🏮 Holiday' : lang === 'ja' ? '🏮 休業案内' : '🏮 連假通知'
                        : lang === 'en' ? '📢 Notice' : lang === 'ja' ? '📢 お知らせ' : '📢 官方公告'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-white">
                      {lang === 'en' && /[\u4e00-\u9fff]/.test(announcement.text)
                        ? '🚀 Free Shipping over NT$999! Order before 15:00 on weekdays for same-day dispatch! Join now for 100 bonus points.'
                        : lang === 'ja' && !/[\u3040-\u30ff]/.test(announcement.text)
                        ? '🚀 NT$999以上で送料無料！平日15:00までのご注文で即日発送！新規会員登録で100ポイント進呈。'
                        : announcement.text}
                    </span>
                    {announcement.linkUrl && (
                      announcement.linkUrl.startsWith('/') ? (
                        <button
                          type="button"
                          onClick={() => navigate(announcement.linkUrl!)}
                          className="text-sky-300 hover:text-sky-200 underline font-bold text-[10px] ml-1 cursor-pointer"
                        >
                          {lang === 'en' ? 'View' : lang === 'ja' ? '詳細' : '前往查看'}
                        </button>
                      ) : (
                        <a
                          href={announcement.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-300 hover:text-sky-200 underline font-bold text-[10px] ml-1"
                        >
                          {lang === 'en' ? 'View' : lang === 'ja' ? '詳細' : '前往查看'}
                        </a>
                      )
                    )}
                  </div>
                  <span className="text-slate-600 font-black px-2">•</span>
                </>
              )}
              <span className="bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase shrink-0">
                {t.promoBadge || 'Promo'}
              </span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText1}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs font-bold text-amber-300">
                {t.promoText2}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText3}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs text-emerald-300">
                {t.promoText4}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
            </div>
            
            {/* Second Set (Identical duplicate for seamless continuous infinite loop) */}
            <div className="flex items-center gap-4 shrink-0">
              {announcement?.isEnabled && announcement?.text && (
                <>
                  <div className="flex items-center gap-1.5 shrink-0 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    <span className="font-black text-[10px] text-amber-300">
                      {announcement.type === 'promotion'
                        ? lang === 'en' ? '🔥 Promo' : lang === 'ja' ? '🔥 特価セール' : '🔥 全館特惠'
                        : announcement.type === 'shipping'
                        ? lang === 'en' ? '🚚 Shipping' : lang === 'ja' ? '🚚 配送案内' : '🚚 出貨公告'
                        : announcement.type === 'holiday'
                        ? lang === 'en' ? '🏮 Holiday' : lang === 'ja' ? '🏮 休業案内' : '🏮 連假通知'
                        : lang === 'en' ? '📢 Notice' : lang === 'ja' ? '📢 お知らせ' : '📢 官方公告'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-white">
                      {lang === 'en' && /[\u4e00-\u9fff]/.test(announcement.text)
                        ? '🚀 Free Shipping over NT$999! Order before 15:00 on weekdays for same-day dispatch! Join now for 100 bonus points.'
                        : lang === 'ja' && !/[\u3040-\u30ff]/.test(announcement.text)
                        ? '🚀 NT$999以上で送料無料！平日15:00までのご注文で即日発送！新規会員登録で100ポイント進呈。'
                        : announcement.text}
                    </span>
                    {announcement.linkUrl && (
                      announcement.linkUrl.startsWith('/') ? (
                        <button
                          type="button"
                          onClick={() => navigate(announcement.linkUrl!)}
                          className="text-sky-300 hover:text-sky-200 underline font-bold text-[10px] ml-1 cursor-pointer"
                        >
                          {lang === 'en' ? 'View' : lang === 'ja' ? '詳細' : '前往查看'}
                        </button>
                      ) : (
                        <a
                          href={announcement.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-300 hover:text-sky-200 underline font-bold text-[10px] ml-1"
                        >
                          {lang === 'en' ? 'View' : lang === 'ja' ? '詳細' : '前往查看'}
                        </a>
                      )
                    )}
                  </div>
                  <span className="text-slate-600 font-black px-2">•</span>
                </>
              )}
              <span className="bg-sky-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase shrink-0">
                {t.promoBadge || 'Promo'}
              </span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText1}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs font-bold text-amber-300">
                {t.promoText2}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText3}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs text-emerald-300">
                {t.promoText4}
              </span>
              <span className="text-slate-600 font-black px-2">•</span>
            </div>
          </div>
          
          {/* Subtle edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
          <div className="sm:hidden absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
        </div>

        {/* Right Status Actions (Fixed on desktop, shadowed separation) */}
        <div className="hidden sm:flex items-center space-x-3 text-slate-300 text-xs shrink-0 whitespace-nowrap pl-4 pr-4 bg-slate-900 relative z-20 shadow-[-14px_0_12px_#0f172a]">
          {onOpenRecycle && (
            <button
              onClick={onOpenRecycle}
              className="text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer font-bold whitespace-nowrap"
              title={t.spoolRecycle || "空盤回收領取創客積分"}
            >
              <Recycle className="w-3.5 h-3.5" />
              <span>{t.spoolRecycleBtn || "空盤換幣"}</span>
            </button>
          )}
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.sslEncrypted || '藍新 SSL 安全加密'}
          </span>
          <span className="text-slate-700">|</span>
          <button 
            id="nav-quick-member-link"
            onClick={effectiveMemberOpen}
            className="hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{(member?.points || 0)} {t.navPointsSuffix || '積分'}</span>
          </button>
        </div>
      </div>

      <header className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200 ${
        isScrolled 
          ? 'bg-white/98 dark:bg-slate-900/98 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-200/80 dark:border-slate-800' 
          : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
      }`}>
      {/* Main Header Bar - Proportioned for Mobile & Spacious Desktop (No crowded inline nav squeezing search) */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0 flex-1 lg:flex-initial shrink-0" 
            onClick={() => handleNavClick('store')}
            title={lang === 'en' ? 'Back to Home' : lang === 'ja' ? 'ホームに戻る' : '返回首頁'}
            data-no-auto-translate="true"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm shadow-sky-500/20 shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center">
              <img 
                src="/wolf-logo.jpg" 
                alt={t.brandName || "神狗勾耗材商城 Logo"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if user hasn't uploaded the image yet
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-white font-black text-sm sm:text-xl">3D</div>';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-[15px] sm:text-base xl:text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap truncate sm:hidden">
                  {lang === 'en' ? 'GodDog 3D' : lang === 'ja' ? '神狗勾 3D' : '神狗勾耗材'}
                </span>
                <span className="hidden sm:inline font-extrabold text-base xl:text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                  {lang === 'en' ? 'GodDog 3D' : lang === 'ja' ? '神狗勾 3D' : (t.brandName || '神狗勾耗材')}
                </span>
              </div>
            </div>
          </div>

          {/* Spacious Desktop Header Search Autocomplete (Centered with ample room, never squeezed) */}
          {setSearchQuery && (
            <div className="hidden lg:block flex-1 max-w-md xl:max-w-lg mx-2 xl:mx-6 min-w-[240px]">
              <SearchAutocomplete
                id="header-nav-search"
                searchQuery={searchQuery || ''}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  if (effectiveActiveTab !== 'store') {
                    handleNavClick('store');
                  }
                }}
                onSelectProduct={onSelectProduct}
                products={products}
                size="sm"
                placeholder={t.searchPlaceholderNav || "搜尋線材 (PLA, PETG, TPU)..."}
              />
            </div>
          )}

          {/* Right Action Area - Clean & Proportional for Mobile & Desktop */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Language & Currency Switcher */}
            <div className="relative shrink-0">
              <button
                id="btn-lang-dropdown"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 h-8.5 sm:h-9 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-slate-200/70 dark:border-slate-700"
                title={t.langCurrency || "切換語言與幣別"}
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">{lang === 'zh-TW' ? '繁中' : lang === 'en' ? 'EN' : '日'}</span>
                <span className="hidden xl:inline text-slate-400 dark:text-slate-500 font-normal">/</span>
                <span className="text-slate-900 dark:text-white font-mono font-bold text-[11px] sm:text-xs">{currency}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.language || '語言'} / Language
                  </div>
                  <button
                    onClick={() => {
                      setLang('zh-TW');
                      try { localStorage.setItem('printcore_lang', 'zh-TW'); } catch(e){}
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      lang === 'zh-TW' ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-sky-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>繁體中文 (台灣)</span>
                    {lang === 'zh-TW' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang('en');
                      try { localStorage.setItem('printcore_lang', 'en'); } catch(e){}
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      lang === 'en' ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-sky-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>English (US)</span>
                    {lang === 'en' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang('ja');
                      try { localStorage.setItem('printcore_lang', 'ja'); } catch(e){}
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      lang === 'ja' ? 'text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-sky-950/40' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>日本語 (JP)</span>
                    {lang === 'ja' && <span>✓</span>}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1.5"></div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.currency || '幣別'} / Currency
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-2 pt-1">
                    {(['TWD', 'USD', 'JPY'] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          try { localStorage.setItem('printcore_currency', curr); } catch(e){}
                        }}
                        className={`text-center py-1 text-xs rounded font-mono font-semibold transition-colors cursor-pointer ${
                          currency === curr
                            ? 'bg-slate-900 dark:bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Management Quick Link (Strictly restricted to babe0615@gmail.com) */}
            {isOwnerAdmin && (
              <button
                id="btn-nav-admin"
                onClick={() => handleNavClick('admin')}
                className={`hidden md:flex items-center gap-1 h-9 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  effectiveActiveTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800'
                }`}
                title={lang === 'en' ? 'Admin Portal' : lang === 'ja' ? '管理パネル' : '進入後台管理：訂單、庫存、廣告與營運報表'}
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>{t.navAdmin || '管理後台'}</span>
              </button>
            )}

            {/* Member Points / Login Button */}
            {isLoggedIn ? (
              <button
                id="btn-member-profile"
                onClick={effectiveMemberOpen}
                className="hidden md:flex items-center gap-1.5 h-9 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 px-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title={lang === 'en' ? 'Member Center' : lang === 'ja' ? 'マイページへ' : '前往會員中心'}
              >
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold leading-none">
                  {(member?.tier || "Silver")}
                </span>
                <span className="font-mono tabular-nums">{(member?.points || 0)}{t.navPointsSuffix || 'pt'}</span>
              </button>
            ) : (
              <button
                id="btn-open-auth-modal"
                onClick={onOpenAuth}
                className="hidden md:flex items-center gap-1.5 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                title={t.loginWithGoogle || "登入會員 / Google 連結"}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{t.login || "登入"}</span>
              </button>
            )}

            {/* Compare Bar Launch Button (Desktop) */}
            {onOpenCompare && (
              <button
                id="btn-open-compare"
                onClick={onOpenCompare}
                className="relative hidden sm:flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                title={t.specCompare || "耗材規格橫向對比"}
              >
                <Scale className="w-4 h-4" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 tabular-nums">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle Button */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="relative flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title={lang === 'en' ? 'Toggle Dark Mode' : lang === 'ja' ? 'ダークモード切替' : '切換日夜間模式'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {onOpenWishlist && (
              <button
                id="btn-open-wishlist"
                onClick={onOpenWishlist}
                className="relative hidden xs:flex items-center justify-center w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                title={t.wishlist || "我的願望清單 / 收藏庫"}
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Recently Viewed Launch Button (Desktop & Tablet only; mobile has it in drawer and bottom profile) */}
            {onOpenHistory && (
              <button
                id="btn-open-history"
                onClick={onOpenHistory}
                className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer shrink-0"
                title={t.navHistory || (lang === 'en' ? 'Recently Viewed' : '最近瀏覽記錄')}
              >
                <Clock className="w-4 h-4" />
                {historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 tabular-nums">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <motion.button
              id="btn-open-cart"
              onClick={effectiveCartOpen}
              animate={isCartPulsing ? { scale: [1, 1.13, 0.96, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center w-9 h-9 sm:w-[90px] sm:h-9 px-0 sm:px-3 rounded-xl bg-slate-900 dark:bg-sky-500 text-white hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors duration-200 shadow-xs cursor-pointer shrink-0 overflow-visible"
              aria-label={t.cart || "購物車"}
              title={t.cart || "購物車"}
            >
              <motion.span
                animate={isCartPulsing ? { rotate: [0, -12, 8, 0] } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center shrink-0"
              >
                <ShoppingCart className="w-4 h-4 text-white shrink-0" />
              </motion.span>
              <span className="text-xs font-bold hidden sm:inline ml-1.5 whitespace-nowrap">{t.cart || "購物車"}</span>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.78 }}
                  animate={{ scale: isCartPulsing ? 1.18 : 1 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm pointer-events-none tabular-nums leading-none"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle (三條橫線 - Always visible & prominent on the far right) */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border active:scale-95 ${
                mobileMenuOpen 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
              }`}
              aria-label={lang === 'en' ? 'Open Menu' : lang === 'ja' ? 'メニューを開く' : '開啟主選單'}
              title={lang === 'en' ? 'Menu' : lang === 'ja' ? 'メニュー' : '主選單'}
            >
              {mobileMenuOpen ? (
                <X className="w-4.5 h-4.5" />
              ) : (
                <Menu className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sub-Navigation Bar (lg: 1024px+): Zero crowding, ample breathing room for all nav tabs and AI/Logistics quick actions */}
      <div className="hidden lg:block border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-11 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.id === 'store' && location.pathname === '/' && effectiveActiveTab === 'store') ||
                (item.id === 'blog' && location.pathname.startsWith('/blog')) ||
                (item.id === 'guide' && location.pathname === '/guide') ||
                (item.id === 'faq' && location.pathname === '/faq') ||
                (item.id === 'about' && location.pathname === '/about');
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    if (item.id === 'filament-lab') {
                      onOpenFilamentLab?.();
                    } else {
                      handleNavClick(item.id);
                    }
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 dark:bg-sky-500 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Utility Links (Spaciously separated from main action cluster) */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenTracking && (
              <button
                id="btn-nav-tracking"
                onClick={onOpenTracking}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{lang === 'en' ? 'Track Order' : lang === 'ja' ? '配送追跡' : '物流追蹤'}</span>
              </button>
            )}
            {onOpenAIAdvisor && (
              <button
                id="btn-nav-ai-advisor"
                onClick={onOpenAIAdvisor}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200/70 dark:border-indigo-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{lang === 'en' ? 'Printer Match' : lang === 'ja' ? '機種別選材' : '依機型選材'}</span>
              </button>
            )}
            {onOpenSupport && (
              <button
                id="btn-nav-ai-chat"
                onClick={onOpenSupport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                title={t.supportTitle || "開啟 AI 智能客服與 3D 技術排查視窗"}
              >
                <Bot className="w-3.5 h-3.5 text-sky-200 shrink-0" />
                <span>{t.aiSupport || 'AI 客服'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Mobile Search Autocomplete */}
          {setSearchQuery && (
            <div>
              <SearchAutocomplete
                id="mobile-header-search"
                searchQuery={searchQuery || ''}
                setSearchQuery={(q) => {
                  setSearchQuery(q);
                  if (effectiveActiveTab !== 'store') {
                    handleNavClick('store');
                  }
                  setMobileMenuOpen(false);
                }}
                onSelectProduct={(p) => {
                  onSelectProduct?.(p);
                  setMobileMenuOpen(false);
                }}
                products={products}
                size="sm"
                placeholder={lang === 'en' ? 'Search filaments, brands, or models...' : lang === 'ja' ? 'フィラメント材質・ブランド・型番を検索...' : '搜尋線材材質、品牌或型號...'}
              />
            </div>
          )}

          {/* Mobile Language & Currency Selector Row */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs">{lang === 'en' ? 'Lang / Currency' : lang === 'ja' ? '言語 / 通貨' : '語系 / 幣別'}</span>
            </div>
            <div className="flex items-center gap-1">
              {(['zh-TW', 'en', 'ja'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    try { localStorage.setItem('printcore_lang', l); } catch(e){}
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    lang === l ? 'bg-slate-900 dark:bg-sky-500 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {l === 'zh-TW' ? '繁中' : l === 'en' ? 'EN' : '日'}
                </button>
              ))}
              <span className="text-slate-300 dark:text-slate-600 mx-0.5">|</span>
              {(['TWD', 'USD', 'JPY'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    try { localStorage.setItem('printcore_currency', c); } catch(e){}
                  }}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                    currency === c ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Featured AI 耗材顧問 (Concise 1-line subtitle, no duplicate button below) */}
          {onOpenAIAdvisor && (
            <button
              id="mobile-nav-featured-ai-advisor"
              onClick={() => {
                onOpenAIAdvisor();
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-between shadow-sm active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">
                      {lang === 'en' ? 'AI Filament Advisor' : lang === 'ja' ? 'AI フィラメント診断' : 'AI 耗材顧問'}
                    </span>
                    <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded-full">
                      {lang === 'en' ? 'Printer Match' : lang === 'ja' ? '機種別マッチング' : '機型配對'}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-100 mt-0.5 truncate">
                    {lang === 'en'
                      ? 'Optimal filaments & slicer settings for your 3D printer'
                      : lang === 'ja'
                      ? 'お使いの3Dプリンターに最適なフィラメントと設定を提案'
                      : '依 3D 印表機型號推薦最佳線材與切片參數'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 shrink-0 ml-2" />
            </button>
          )}

          {/* 4 Distinct Quick Tools Grid (Clean 4-column layout) */}
          <div className="grid grid-cols-4 gap-2">
            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer relative hover:bg-slate-200 transition-all"
              >
                <Scale className="w-4 h-4 mb-1 text-slate-600 dark:text-slate-300" />
                <span className="whitespace-nowrap truncate max-w-full">
                  {lang === 'en' ? 'Compare' : lang === 'ja' ? '比較' : '規格對比'}
                </span>
                {compareCount > 0 && (
                  <span className="absolute top-1 right-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1.5 rounded-full">
                    {compareCount}
                  </span>
                )}
              </button>
            )}
            {onOpenWishlist && (
              <button
                onClick={() => {
                  onOpenWishlist();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer relative hover:bg-rose-100 transition-all"
              >
                <Heart className={`w-4 h-4 mb-1 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                <span className="whitespace-nowrap truncate max-w-full">
                  {lang === 'en' ? 'Wishlist' : lang === 'ja' ? 'お気に入り' : '願望清單'}
                </span>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}
            {onOpenRecycle && (
              <button
                onClick={() => {
                  onOpenRecycle();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-all"
              >
                <Recycle className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="whitespace-nowrap truncate max-w-full">
                  {lang === 'en' ? 'Recycle' : lang === 'ja' ? '空スプール' : '空盤回收'}
                </span>
              </button>
            )}
            {onOpenFilamentLab && (
              <button
                onClick={() => {
                  onOpenFilamentLab();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold cursor-pointer hover:bg-indigo-100 transition-all"
              >
                <Wrench className="w-4 h-4 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="whitespace-nowrap truncate max-w-full">
                  {lang === 'en' ? 'Tools' : lang === 'ja' ? 'ツール箱' : '創客工具'}
                </span>
              </button>
            )}
          </div>

          {/* 2-Column Navigation Grid (Concise Labels, Zero Truncation) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id="mobile-nav-blog"
              onClick={() => {
                handleNavClick('blog');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <BookOpen className="w-4 h-4 shrink-0 text-indigo-500" />
                <span className="truncate">{lang === 'en' ? 'Maker Blog' : lang === 'ja' ? '技術コラム' : '創客專欄'}</span>
              </span>
              <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full shrink-0">
                {lang === 'en' ? '18' : lang === 'ja' ? '18記事' : '18篇'}
              </span>
            </button>

            <button
              id="mobile-nav-faq"
              onClick={() => {
                handleNavClick('faq');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="truncate">{lang === 'en' ? 'FAQ' : lang === 'ja' ? 'よくある質問' : '常見問題'}</span>
            </button>

            <button
              id="mobile-nav-guide"
              onClick={() => {
                handleNavClick('guide');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 shrink-0 text-cyan-500" />
              <span className="truncate">{lang === 'en' ? 'Material Guide' : lang === 'ja' ? '3D素材ガイド' : '3D 選材指南'}</span>
            </button>

            <button
              id="mobile-nav-about"
              onClick={() => {
                handleNavClick('about');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="truncate">{lang === 'en' ? 'About Us' : lang === 'ja' ? '神狗勾について' : '關於神狗勾'}</span>
            </button>

            <button
              id="mobile-nav-subscription"
              onClick={() => {
                handleNavClick('subscription');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Package className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="truncate">{lang === 'en' ? 'VIP Club' : lang === 'ja' ? 'VIP会員' : '創客 VIP 會員'}</span>
              </span>
              <span className="text-[10px] font-extrabold bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                {lang === 'en' ? '5% OFF' : lang === 'ja' ? '5%OFF' : '95折'}
              </span>
            </button>

            <button
              id="mobile-nav-logistics"
              onClick={() => {
                handleNavClick('logistics');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0 text-sky-500" />
              <span className="truncate">{lang === 'en' ? 'Order Tracking' : lang === 'ja' ? '配送状況追跡' : '即時物流追蹤'}</span>
            </button>

            {onOpenHistory && (
              <button
                id="mobile-nav-history"
                onClick={() => {
                  onOpenHistory();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-left bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 truncate">
                  <Clock className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                  <span className="truncate">{lang === 'en' ? 'History' : lang === 'ja' ? '閲覧履歴' : '最近瀏覽'}</span>
                </span>
                {historyCount > 0 && (
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            {isOwnerAdmin && (
              <button
                id="mobile-nav-admin"
                onClick={() => {
                  handleNavClick('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate">{lang === 'en' ? 'Admin' : lang === 'ja' ? '管理画面' : '管理後台'}</span>
              </button>
            )}
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            {isLoggedIn ? (
              <>
                <span className="text-slate-700 dark:text-slate-300 font-bold truncate">
                  {lang === 'en'
                    ? `Member: ${member?.name || 'Maker'} (${member?.tier || 'Silver'} · ${member?.points || 0} pts)`
                    : lang === 'ja'
                    ? `会員：${member?.name || 'メイカー'} (${member?.tier || 'Silver'} · ${member?.points || 0} pt)`
                    : `會員：${member?.name || '創客會員'} (${member?.tier || 'Silver'} · ${member?.points || 0} 點)`}
                </span>
                <button
                  onClick={() => {
                    effectiveMemberOpen();
                    setMobileMenuOpen(false);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer shrink-0 ml-2"
                >
                  {lang === 'en' ? 'Account →' : lang === 'ja' ? 'マイページ →' : '會員中心 →'}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{lang === 'en' ? 'Sign In / Register' : lang === 'ja' ? 'ログイン / 新規登録' : '登入 / 註冊會員'}</span>
              </button>
            )}
          </div>
        </div>
      )}
      </header>
    </>
  );
};
