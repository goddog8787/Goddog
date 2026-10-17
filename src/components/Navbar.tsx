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
import { LanguageCode, CurrencyCode, MemberProfile, FilamentProduct } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';
import { SearchAutocomplete } from './Storefront/SearchAutocomplete';

interface NavbarProps {
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  currentTab?: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'member' | 'admin';
  setCurrentTab?: (tab: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'member' | 'admin') => void;
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
  onOpenLoyalty?: () => void;
  onOpenSubscription?: () => void;
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
  currentTab,
  setCurrentTab,
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
  onOpenLoyalty,
  onOpenSubscription,
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const effectiveCartOpen = onOpenCart || openCart || (() => {});
  const effectiveMemberOpen = onOpenLoyalty || openMemberModal || (() => {});
  const effectiveActiveTab = activeTab || currentTab || 'store';

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (id: string) => {
    if (id === 'store') {
      if (location.pathname !== '/') navigate('/');
      setActiveTab?.('store');
      setCurrentTab?.('store');
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
      setActiveTab?.('admin');
      setCurrentTab?.('admin');
    } else if (id === 'subscription') {
      navigate('/subscription');
    } else if (id === 'ai-advisor') {
      if (onOpenAIAdvisor) onOpenAIAdvisor();
      else setCurrentTab?.('ai-advisor');
    } else if (id === 'logistics') {
      if (onOpenTracking) onOpenTracking();
      else setCurrentTab?.('logistics');
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
    { id: 'blog', label: t.bottomBlog || '創客專欄', icon: BookOpen, badge: 'HOT' },
    { id: 'guide', label: t.bottomGuide || '材質指南', icon: Compass },
    { id: 'faq', label: t.navFaq || '常見問題', icon: HelpCircle },
    { id: 'filament-lab', label: t.makerTools || '創客工具', icon: Wrench },
    { id: 'ai-advisor', label: t.navAiAdvisor, icon: Sparkles, badge: 'AI' },
    { id: 'about', label: t.navAbout || '關於我們', icon: Info },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-xl shadow-md shadow-slate-900/8 border-b border-slate-200' 
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200'
    }`}>
      {/* Top Announcement Bar - Collapses smoothly on mobile when scrolled to let the main nav row pop right to the top */}
      <div className={`bg-slate-900 text-white text-xs font-medium flex items-center transition-all duration-300 relative ${
        isScrolled ? 'max-h-0 py-0 opacity-0 sm:max-h-9 sm:py-1.5 sm:opacity-100' : 'max-h-12 py-1.5 opacity-100'
      }`}>
        
        {/* Marquee Container (Takes up remaining space) */}
        <div className="flex-1 overflow-hidden flex items-center relative h-full max-w-[calc(100vw-120px)] sm:max-w-[calc(100vw-280px)] mx-auto sm:mx-0 sm:pl-4 pointer-events-none">
          <div className="flex items-center gap-4 animate-marquee whitespace-nowrap min-w-max pr-8">
            {/* First Set */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase shrink-0">
                {t.promoBadge || 'Promo'}
              </span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText1}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs font-bold text-amber-300">
                {t.promoText2}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText3}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs text-emerald-300">
                {t.promoText4}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
            </div>
            
            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex items-center gap-4 shrink-0">
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase shrink-0">
                {t.promoBadge || 'Promo'}
              </span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText1}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs font-bold text-amber-300">
                {t.promoText2}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                {t.promoText3}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
              <span className="text-slate-200 text-[11px] sm:text-xs text-emerald-300">
                {t.promoText4}
              </span>
              <span className="text-indigo-400 font-black px-4">•</span>
            </div>
          </div>
          
          {/* Fade gradients at edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>
        </div>

        {/* Right Status Actions (Fixed) */}
        <div className="hidden sm:flex items-center space-x-3 text-slate-300 text-xs shrink-0 whitespace-nowrap px-4 bg-slate-900 relative z-10">
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
          <span>|</span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.sslEncrypted || '藍新 SSL 安全加密'}
          </span>
          <span>|</span>
          <button 
            id="nav-quick-member-link"
            onClick={effectiveMemberOpen}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{(member?.points || 0)} {t.navPointsSuffix || '積分'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar - Proportioned and mobile-optimized */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer shrink-0" 
            onClick={() => handleNavClick('store')}
            title={lang === 'en' ? 'Back to Home' : lang === 'ja' ? 'ホームに戻る' : '返回首頁'}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0 shadow-md shadow-sky-500/20 bg-slate-900 flex items-center justify-center">
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
            <div className="shrink-0">
              <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                  {t.brandName || '神狗勾耗材'}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded whitespace-nowrap shrink-0 hidden md:inline-block">
                  {t.flagshipStore || '旗艦館'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden lg:block font-medium whitespace-nowrap">
                {t.brandSub || '高速 3D 列印線材專營'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
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
                  className={`relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight whitespace-nowrap shrink-0 ${
                      isActive ? 'bg-sky-400 text-slate-900' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Header Search Autocomplete */}
          {setSearchQuery && (
            <div className="hidden xl:block flex-1 max-w-xs 2xl:max-w-sm mx-2 shrink">
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

          {/* Right Action Area - Fully Proportioned for Mobile & Desktop */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Language & Currency Switcher (Compact on mobile, full on desktop) */}
            <div className="relative shrink-0">
              <button
                id="btn-lang-dropdown"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-1.5 sm:px-2 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-slate-200/60"
                title={t.langCurrency || "切換語言與幣別"}
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{lang === 'zh-TW' ? '繁中' : lang === 'en' ? 'EN' : '日'}</span>
                <span className="hidden sm:inline text-slate-400 font-normal">/</span>
                <span className="text-slate-900 font-mono font-bold text-[11px] sm:text-xs">{currency}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
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
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'zh-TW' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
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
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'en' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
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
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'ja' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>日本語 (JP)</span>
                    {lang === 'ja' && <span>✓</span>}
                  </button>

                  <div className="border-t border-slate-100 my-1.5"></div>
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
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Management Quick Link (Discreet) */}
            <button
              id="btn-nav-admin"
              onClick={() => handleNavClick('admin')}
              className={`hidden md:flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                effectiveActiveTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70'
              }`}
              title={lang === 'en' ? 'Admin Portal' : lang === 'ja' ? '管理パネル' : '進入後台管理：訂單、庫存、廣告與營運報表'}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>{t.navAdmin || '管理後台'}</span>
            </button>

            {/* Member Points / Login Button */}
            {isLoggedIn ? (
              <button
                id="btn-member-profile"
                onClick={effectiveMemberOpen}
                className="hidden md:flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title={lang === 'en' ? 'View Perks & Points' : lang === 'ja' ? '会員ランク・ポイント確認' : '查看會員等級與積分明細'}
              >
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="bg-amber-500 text-white text-[10px] px-1 py-0.2 rounded font-bold">
                  {(member?.tier || "Silver")}
                </span>
                <span className="font-mono">{(member?.points || 0)}{t.navPointsSuffix || 'pt'}</span>
              </button>
            ) : (
              <button
                id="btn-open-auth-modal"
                onClick={onOpenAuth}
                className="hidden md:flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
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

            {/* AI Advisor Button (Desktop Prominent) */}
            {onOpenAIAdvisor && (
              <button
                id="btn-nav-ai-advisor"
                onClick={onOpenAIAdvisor}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-98"
                title={t.aiAdvisorSubtitle || "開啟 AI 耗材顧問：依 3D 機型精準配對推薦"}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{t.aiAdvisor || 'AI 顧問'}</span>
              </button>
            )}

            {/* AI Technical Advisor / Chat Button (Desktop Prominent) */}
            {onOpenSupport && (
              <button
                id="btn-nav-ai-chat"
                onClick={onOpenSupport}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-98"
                title={t.supportTitle || "開啟 AI 智能客服與 3D 技術排查視窗"}
              >
                <Bot className="w-4 h-4 text-sky-200 shrink-0 animate-pulse" />
                <span>{t.aiSupport || 'AI 智能客服'}</span>
                <span className="bg-sky-400 text-slate-950 text-[10px] px-1 py-0.2 rounded font-extrabold ml-0.5">
                  LIVE
                </span>
              </button>
            )}

            {/* Compare Bar Launch Button (Desktop) */}
            {onOpenCompare && (
              <button
                id="btn-open-compare"
                onClick={onOpenCompare}
                className="relative hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                title={t.specCompare || "耗材規格橫向對比"}
              >
                <Scale className="w-4 h-4" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist Launch Button */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title={lang === 'en' ? 'Toggle Dark Mode' : lang === 'ja' ? 'ダークモード切替' : '切換日夜間模式'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {onOpenWishlist && (
              <button
                id="btn-open-wishlist"
                onClick={onOpenWishlist}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                title={t.wishlist || "我的願望清單 / 收藏庫"}
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Recently Viewed Launch Button */}
            {onOpenHistory && (
              <button
                id="btn-open-history"
                onClick={onOpenHistory}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer shrink-0"
                title={t.navHistory || (lang === 'en' ? 'Recently Viewed' : '最近瀏覽記錄')}
              >
                <Clock className="w-4 h-4" />
                {historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart"
              onClick={effectiveCartOpen}
              className="relative flex items-center justify-center h-8 px-2 sm:h-9 sm:px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-2xs cursor-pointer shrink-0 gap-1.5"
              aria-label={t.cart || "購物車"}
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="text-xs font-bold hidden sm:inline">{t.cart || "購物車"}</span>
              {cartCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold h-4 min-w-4 sm:h-4.5 sm:min-w-4.5 px-1 sm:px-1.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

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

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
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
                placeholder={t.searchPlaceholderInput || "搜尋耗材材質、品牌 (如 PLA, Bambu)..."}
              />
            </div>
          )}

          {/* Mobile Language & Currency Selector Row */}
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">{t.langCurrency || "語系 / 幣別"}</span>
            </div>
            <div className="flex items-center gap-1">
              {(['zh-TW', 'en', 'ja'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    try { localStorage.setItem('printcore_lang', l); } catch(e){}
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    lang === l ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {l === 'zh-TW' ? '繁中' : l === 'en' ? 'EN' : '日'}
                </button>
              ))}
              <span className="text-slate-300 mx-0.5">|</span>
              {(['TWD', 'USD', 'JPY'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    try { localStorage.setItem('printcore_currency', c); } catch(e){}
                  }}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold transition-colors cursor-pointer ${
                    currency === c ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Top Expanded Menu: Featured AI 顧問 (機型配對與耗材推薦) */}
          {onOpenAIAdvisor && (
            <button
              id="mobile-nav-featured-ai-advisor"
              onClick={() => {
                onOpenAIAdvisor();
                setMobileMenuOpen(false);
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-between shadow-md shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wide">{t.aiAdvisorHeroTitle || "AI 耗材顧問"}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded-full">
                      {t.aiAdvisorHeroTag || "機型配對"}
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-100 mt-0.5">
                    {t.aiAdvisorHeroDesc || "輸入 3D 印表機型號，自動精準適配最佳線材與切片參數"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80 shrink-0 ml-2" />
            </button>
          )}

          {/* Mobile Quick Action Buttons Row (Features not in bottom bar) */}
          <div className="grid grid-cols-5 gap-1.5 py-1">
            {onOpenAIAdvisor && (
              <button
                id="mobile-nav-ai-advisor"
                onClick={() => {
                  onOpenAIAdvisor();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 text-white text-[10px] sm:text-[11px] font-bold cursor-pointer shadow-xs hover:opacity-95 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 mb-1 text-amber-300 animate-pulse" />
                <span className="truncate">{t.aiAdvisor || 'AI 顧問'}</span>
              </button>
            )}
            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] sm:text-[11px] font-bold cursor-pointer relative hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              >
                <Scale className="w-4 h-4 mb-1 text-slate-600 dark:text-slate-300" />
                <span className="truncate">{t.specCompare || '規格對比'}</span>
                {compareCount > 0 && (
                  <span className="absolute top-1 right-2 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded-full">
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
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px] sm:text-[11px] font-bold cursor-pointer relative hover:bg-rose-100 dark:hover:bg-rose-900/50 active:scale-95 transition-all"
              >
                <Heart className={`w-4 h-4 mb-1 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                <span className="truncate">{t.wishlist || '願望清單'}</span>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
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
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition-all"
              >
                <Recycle className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{t.spoolRecycle || '空盤回收'}</span>
              </button>
            )}
            {onOpenFilamentLab && (
              <button
                onClick={() => {
                  onOpenFilamentLab();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-[11px] font-bold cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 active:scale-95 transition-all"
              >
                <Wrench className="w-4 h-4 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="truncate">{t.makerTools || '創客工具'}</span>
              </button>
            )}
          </div>

          {/* Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            <button
              id="mobile-nav-blog"
              onClick={() => {
                handleNavClick('blog');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-indigo-500" />
              <span className="truncate">{t.navArticlesCount || "創客專欄 (18篇)"}</span>
            </button>

            <button
              id="mobile-nav-faq"
              onClick={() => {
                handleNavClick('faq');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="truncate">{t.navFaq || "常見問題百科"}</span>
            </button>

            <button
              id="mobile-nav-guide"
              onClick={() => {
                handleNavClick('guide');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 shrink-0 text-cyan-500" />
              <span className="truncate">{t.navGuideShort || "3D選材指南"}</span>
            </button>

            <button
              id="mobile-nav-about"
              onClick={() => {
                handleNavClick('about');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="truncate">{t.navAbout || "關於神狗勾"}</span>
            </button>

            <button
              id="mobile-nav-subscription"
              onClick={() => {
                handleNavClick('subscription');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="truncate">{t.subscriptionClub || t.navSubscription || '創客月配盒'}</span>
            </button>

            <button
              id="mobile-nav-logistics"
              onClick={() => {
                handleNavClick('logistics');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 shrink-0 text-sky-500" />
              <span className="truncate">{t.navLogistics || '即時物流追蹤'}</span>
            </button>

            {onOpenHistory && (
              <button
                id="mobile-nav-history"
                onClick={() => {
                  onOpenHistory();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="truncate">{t.navHistory || "最近瀏覽記錄"}</span>
                {historyCount > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                    {historyCount}
                  </span>
                )}
              </button>
            )}

            <button
              id="mobile-nav-admin"
              onClick={() => {
                handleNavClick('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="truncate">{t.navAdmin || '管理後台'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isLoggedIn ? (
              <>
                <span className="text-slate-600 font-medium">{t.memberLabel || "會員"}: {member?.name || (t.memberLabel || "會員")} ({(member?.tier || "Silver")} · {(member?.points || 0)}{t.navPointsSuffix || 'pt'})</span>
                <button
                  onClick={() => {
                    effectiveMemberOpen();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  {t.viewPerks || "查看積分與特權 →"}
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
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{t.navLoginPrompt || t.loginWithGoogle || "登入會員 / 連結 Google 帳號"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
