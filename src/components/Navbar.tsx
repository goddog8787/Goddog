import React, { useState } from 'react';
import { 
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
  Code2,
  UserCheck,
  LogIn,
  Scale,
  Heart,
  Recycle,
  Wrench
} from 'lucide-react';
import { LanguageCode, CurrencyCode, MemberProfile, FilamentProduct } from '../types';
import { TRANSLATIONS, formatCurrency } from '../i18n';
import { SearchAutocomplete } from './Storefront/SearchAutocomplete';

interface NavbarProps {
  currentTab?: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'member' | 'admin' | 'tech-guide';
  setCurrentTab?: (tab: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'member' | 'admin' | 'tech-guide') => void;
  activeTab?: 'store' | 'admin' | 'tech-guide';
  setActiveTab?: (tab: 'store' | 'admin' | 'tech-guide') => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  cartCount: number;
  openCart?: () => void;
  onOpenCart?: () => void;
  onOpenAIAdvisor?: () => void;
  onOpenTracking?: () => void;
  onOpenLoyalty?: () => void;
  onOpenSubscription?: () => void;
  onOpenAuth?: () => void;
  onOpenFilamentLab?: () => void;
  onOpenCompare?: () => void;
  compareCount?: number;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
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
  onOpenTracking,
  onOpenLoyalty,
  onOpenSubscription,
  onOpenAuth,
  onOpenFilamentLab,
  onOpenCompare,
  compareCount = 0,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenRecycle,
  isLoggedIn = false,
  member,
  openMemberModal,
  searchQuery,
  setSearchQuery,
  products
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const effectiveCartOpen = onOpenCart || openCart || (() => {});
  const effectiveMemberOpen = onOpenLoyalty || openMemberModal || (() => {});
  const effectiveActiveTab = activeTab || currentTab || 'store';

  const handleNavClick = (id: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'member' | 'admin' | 'tech-guide') => {
    if (id === 'store') {
      setActiveTab?.('store');
      setCurrentTab?.('store');
    } else if (id === 'admin') {
      setActiveTab?.('admin');
      setCurrentTab?.('admin');
    } else if (id === 'tech-guide') {
      setActiveTab?.('tech-guide');
      setCurrentTab?.('tech-guide');
    } else if (id === 'subscription') {
      if (onOpenSubscription) onOpenSubscription();
      else setCurrentTab?.('subscription');
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
    id: 'store' | 'subscription' | 'ai-advisor' | 'logistics' | 'filament-lab';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'store', label: t.navCatalog, icon: Layers },
    { id: 'filament-lab', label: '創客工具', icon: Wrench },
    { id: 'ai-advisor', label: t.navAiAdvisor, icon: Sparkles, badge: 'AI' },
    { id: 'subscription', label: '訂閱 85折', icon: Package },
    { id: 'logistics', label: t.navLogistics, icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase whitespace-nowrap shrink-0">
            Promo
          </span>
          <span className="truncate text-slate-200">
            {lang === 'zh-TW' && '⚡ 慶祝高速耗材登陸！全館滿 NT$999 享超商免運 ＋ 結帳支援 綠界 ECPay、LINE Pay 一鍵秒付！'}
            {lang === 'en' && '⚡ Free shipping on orders over NT$999 (7-11 / FamilyMart) | ECPay & LINE Pay Supported!'}
            {lang === 'ja' && '⚡ NT$999以上で送料無料！ECPay・LINE Pay対応・AIフィラメント相談窓口開設中！'}
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-slate-300 text-xs shrink-0 whitespace-nowrap">
          {onOpenRecycle && (
            <button
              onClick={onOpenRecycle}
              className="text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1 cursor-pointer font-bold whitespace-nowrap"
              title="空盤回收領取創客積分"
            >
              <Recycle className="w-3.5 h-3.5" />
              <span>空盤換幣</span>
            </button>
          )}
          <span>|</span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            綠界 SSL 安全加密
          </span>
          <span>|</span>
          <button 
            id="nav-quick-member-link"
            onClick={effectiveMemberOpen}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{member.points} 積分</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer shrink-0" 
            onClick={() => handleNavClick('store')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-sky-500/20 shrink-0">
              3D
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
                  神狗勾耗材
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded whitespace-nowrap shrink-0 hidden sm:inline-block">
                  旗艦館
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium whitespace-nowrap">
                高速 3D 列印線材專營
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'store' && effectiveActiveTab === 'store';
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
                products={products}
                size="sm"
                placeholder="搜尋線材 (PLA, PETG, TPU)..."
              />
            </div>
          )}

          {/* Right Action Area */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language & Currency Switcher */}
            <div className="relative shrink-0">
              <button
                id="btn-lang-dropdown"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">{lang === 'zh-TW' ? '繁中' : lang === 'en' ? 'EN' : '日'}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-slate-900 font-mono">{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    語言 / Language
                  </div>
                  <button
                    onClick={() => setLang('zh-TW')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'zh-TW' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>繁體中文 (台灣)</span>
                    {lang === 'zh-TW' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'en' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English (US)</span>
                    {lang === 'en' && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => setLang('ja')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      lang === 'ja' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>日本語 (JP)</span>
                    {lang === 'ja' && <span>✓</span>}
                  </button>

                  <div className="border-t border-slate-100 my-1.5"></div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    幣別 / Currency
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-2 pt-1">
                    {(['TWD', 'USD', 'JPY'] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
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
              className={`hidden sm:flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                effectiveActiveTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70'
              }`}
              title="進入後台管理：訂單、庫存、廣告與營運報表"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>管理後台</span>
            </button>

            {/* Member Points / Login Button */}
            {isLoggedIn ? (
              <button
                id="btn-member-profile"
                onClick={effectiveMemberOpen}
                className="hidden sm:flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="查看會員等級與積分明細"
              >
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="bg-amber-500 text-white text-[10px] px-1 py-0.2 rounded font-bold">
                  {member.tier}
                </span>
                <span className="font-mono">{member.points}pt</span>
              </button>
            ) : (
              <button
                id="btn-open-auth-modal"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="登入會員 / Google 連結"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>登入</span>
              </button>
            )}

            {/* Compare Bar Launch Button */}
            {onOpenCompare && (
              <button
                id="btn-open-compare"
                onClick={onOpenCompare}
                className="relative hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                title="耗材規格橫向對比"
              >
                <Scale className="w-4 h-4" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Wishlist Launch Button */}
            {onOpenWishlist && (
              <button
                id="btn-open-wishlist"
                onClick={onOpenWishlist}
                className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                title="我的願望清單 / 收藏庫"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              id="btn-open-cart"
              onClick={effectiveCartOpen}
              className="relative flex items-center justify-center px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer shrink-0 gap-1.5"
              aria-label="購物車"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="text-xs font-bold hidden sm:inline">購物車</span>
              {cartCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold h-4.5 min-w-4.5 px-1.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3 shadow-lg">
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
                products={products}
                size="sm"
                placeholder="搜尋耗材材質、品牌 (如 PLA, Bambu)..."
              />
            </div>
          )}

          {/* Mobile Quick Action Buttons Row */}
          <div className="grid grid-cols-4 gap-1.5 py-1">
            {onOpenFilamentLab && (
              <button
                onClick={() => {
                  onOpenFilamentLab();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-50 text-indigo-700 text-[10px] font-bold cursor-pointer"
              >
                <Wrench className="w-4 h-4 mb-0.5 text-indigo-600" />
                <span>創客工具</span>
              </button>
            )}
            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare();
                  setMobileMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold cursor-pointer relative"
              >
                <Scale className="w-4 h-4 mb-0.5 text-slate-600" />
                <span>規格對比</span>
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
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 text-rose-700 text-[10px] font-bold cursor-pointer relative"
              >
                <Heart className={`w-4 h-4 mb-0.5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                <span>願望清單</span>
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
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-bold cursor-pointer"
              >
                <Recycle className="w-4 h-4 mb-0.5 text-emerald-600" />
                <span>空盤回收</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'store' && effectiveActiveTab === 'store';
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    if (item.id === 'filament-lab') {
                      onOpenFilamentLab?.();
                    } else {
                      handleNavClick(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
            {/* Mobile Admin Link */}
            <button
              id="mobile-nav-admin"
              onClick={() => {
                handleNavClick('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 shrink-0 text-indigo-600" />
              <span className="truncate">管理後台</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {isLoggedIn ? (
              <>
                <span className="text-slate-600 font-medium">會員: {member.name} ({member.tier} · {member.points}pt)</span>
                <button
                  onClick={() => {
                    effectiveMemberOpen();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  查看積分與特權 →
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
                <span>登入會員 / 連結 Google 帳號</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
