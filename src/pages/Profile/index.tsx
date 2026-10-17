import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, MapPin, Share2, CreditCard, Gift, 
  Settings, ChevronRight, Package, Clock, ShieldCheck, 
  HelpCircle, Bell, History, Printer, Medal, HeadphonesIcon,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, logOut, signInWithGoogle } from '../../lib/firebase';
import { isMockOrder, confirmOrderReceipt } from '../../lib/orderVerification';
import {  OrderModal, NotificationModal , PrinterModal, AddressModal, ReferralModal, AchievementModal, SettingsModal, HistoryModal, CouponModal, FAQModal  } from './ProfileModals';
import { getStoredRecentlyViewedSync } from '../../lib/customerPersistence';
import { LanguageCode } from '../../types';

export interface ProfilePageProps {
  onLoginClick?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  member: any;
  orders: any[];
  setOrders?: (orders: any[]) => void;
  setMember: (m: any) => void;
  onOpenSubscription?: () => void;
  onOpenTracking?: (trackingNumber: string) => void;
  onOpenProductDetail?: (product: any) => void;
  onAddToCart?: (product: any) => void;
  lang?: LanguageCode;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  member, 
  orders, 
  setOrders, 
  setMember, 
  onLoginClick,
  onLogout,
  isLoggedIn = false, 
  onOpenSubscription, 
  onOpenTracking,
  onOpenProductDetail,
  onAddToCart,
  lang = 'zh-TW',
}) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const genuineMemberOrders = React.useMemo(() => {
    const currentUid = member?.id || auth.currentUser?.uid;
    const currentEmail = (member?.email || auth.currentUser?.email || '').trim().toLowerCase();

    return safeOrders.filter((o: any) => {
      if (isMockOrder(o)) return false;
      const orderUid = (o as any).userId;
      const orderEmail = (o.customerEmail || '').trim().toLowerCase();

      if (currentUid && orderUid && orderUid === currentUid) return true;
      if (currentEmail && orderEmail && orderEmail === currentEmail) return true;
      if (!currentUid && orderUid === 'guest_maker') return true;
      return false;
    });
  }, [safeOrders, member?.id, member?.email]);

  const ordersCount = genuineMemberOrders.length;
  const totalSpent = genuineMemberOrders.reduce((sum, o) => sum + (Number(o.totalAmount || o.total) || 0), 0);

  const isVipActive = Boolean(
    member?.subscriptionPlan && 
    member.subscriptionPlan !== 'None' && 
    member.subscriptionExpiry && 
    new Date(member.subscriptionExpiry).getTime() > Date.now()
  );

  let makerTitle = lang === 'en' ? 'Novice Maker' : lang === 'ja' ? '新人メイカー' : '新手創客';
  let TitleIcon = User;
  let titleColorClass = 'bg-slate-500/10 border-slate-400/30 text-slate-300';
  let titleIconClass = 'text-slate-300';

  if (totalSpent >= 10000 || ordersCount >= 10) {
    makerTitle = lang === 'en' ? '3D Print Master' : lang === 'ja' ? '3Dプリント達人' : '列印大神';
    TitleIcon = Sparkles;
    titleColorClass = 'bg-amber-400/10 border-amber-400/30 text-amber-300';
    titleIconClass = 'text-amber-400';
  } else if (totalSpent >= 3000 || ordersCount >= 3) {
    makerTitle = lang === 'en' ? 'Advanced Maker' : lang === 'ja' ? '上級メイカー' : '進階玩家';
    TitleIcon = Medal;
    titleColorClass = 'bg-indigo-400/10 border-indigo-400/30 text-indigo-300';
    titleIconClass = 'text-indigo-300';
  } else {
    makerTitle = lang === 'en' ? 'Novice Maker' : lang === 'ja' ? '新人メイカー' : '新手創客';
    TitleIcon = User;
    titleColorClass = 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300';
    titleIconClass = 'text-emerald-300';
  }


  
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleReset = () => setActiveModal(null);
    window.addEventListener('resetProfileModal', handleReset);
    return () => window.removeEventListener('resetProfileModal', handleReset);
  }, []);

  const [orderTab, setOrderTab] = useState('all');
  const [historyCount, setHistoryCount] = useState<number>(() => {
    const currentUid = member?.id || auth.currentUser?.uid;
    return getStoredRecentlyViewedSync(currentUid).length;
  });

  useEffect(() => {
    const updateCount = () => {
      const currentUid = member?.id || auth.currentUser?.uid;
      const list = getStoredRecentlyViewedSync(currentUid);
      setHistoryCount(list.length);
    };
    updateCount();
    window.addEventListener('printcore_recently_viewed_updated', updateCount);
    window.addEventListener('printcore_recently_viewed_cleared', updateCount);
    return () => {
      window.removeEventListener('printcore_recently_viewed_updated', updateCount);
      window.removeEventListener('printcore_recently_viewed_cleared', updateCount);
    };
  }, [member?.id]);

  const openModal = (modal: string, tab?: string) => {
    if (tab) setOrderTab(tab);
    setActiveModal(modal);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const isUserLoggedIn = Boolean(
    isLoggedIn && 
    member && 
    member.id && 
    member.id.trim() !== '' && 
    !member.id.startsWith('guest_') && 
    member.name !== '創客訪客' && 
    member.name !== '訪客' && 
    member.name !== '訪客創客' && 
    member.name !== 'Guest' &&
    member.email && 
    member.email.trim() !== ''
  );

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const handleDirectGoogleLogin = async () => {
    setIsGoogleSigningIn(true);
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        if (onLoginClick) onLoginClick();
      } else if (user) {
        showToast(lang === 'en' ? 'Welcome back!' : lang === 'ja' ? 'おかえりなさい！' : '登入成功！已領取新人專屬好禮');
        if (setMember) {
          setMember((prev: any) => ({
            ...(prev || {}),
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || '創客夥伴',
            email: user.email || '',
          }));
        }
      }
    } catch {
      if (onLoginClick) onLoginClick();
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  if (!isUserLoggedIn) {
    return (
      <div className="max-w-xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-4 py-12 sm:px-6">
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm whitespace-nowrap">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-amber-400/20 to-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20 mb-5 rounded-3xl bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-indigo-500/20 border border-amber-400/30 flex items-center justify-center shadow-inner">
            <Gift className="w-10 h-10 text-amber-500 dark:text-amber-400 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'New Member Welcome Gift' : lang === 'ja' ? '新規会員ウェルカム特典' : '🎁 新會員迎新專屬禮遇'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {lang === 'en' ? 'Join GodDog 3D Store' : lang === 'ja' ? '神狗勾 3D 会員センター' : '歡迎來到神狗勾 3D'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
            {lang === 'en'
              ? 'Sign in or register now to instantly receive 100 G-Coins (NT$100 off) and first-order Free Shipping voucher!'
              : lang === 'ja'
              ? '今すぐログインまたは新規登録で、100 G-Coin（100円相当割引）＆初回送料無料クーポンをプレゼント！'
              : '立即登入或免費註冊會員，立享 100 點狗狗幣（現折 NT$100）與專屬首購超商免運券！'}
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 text-left border border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">🪙</span>
              <span><strong>100 點狗狗幣紅利：</strong>全館耗材無門檻折抵現金</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">📦</span>
              <span><strong>訂單隨時追蹤：</strong>即時查詢 7-11 / 全家超商物流進度</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">👑</span>
              <span><strong>專屬創客權益：</strong>解鎖專利切片參數下載與 VIP 折扣</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDirectGoogleLogin}
              disabled={isGoogleSigningIn}
              className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-md shadow-slate-200/50 dark:shadow-none active:scale-98 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleSigningIn ? '正在開啟 Google 登入...' : '使用 Google 帳號快速登入'}</span>
            </button>

            <button
              onClick={onLoginClick}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>使用電子信箱 登入 / 註冊</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-5">
            登入即表示您同意神狗勾商城的 <a href="/terms" className="underline hover:text-indigo-400">服務條款</a> 與 <a href="/privacy-policy" className="underline hover:text-indigo-400">隱私權政策</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-slate-50 pb-32">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm whitespace-nowrap">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header Profile Section */}
      <div className="bg-slate-900 px-6 pt-12 pb-24 rounded-b-[40px] text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-full p-1 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-full border-2 border-slate-900 flex items-center justify-center overflow-hidden">
              <User className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{member?.name || (lang === 'en' ? 'Guest' : lang === 'ja' ? 'ゲスト' : '訪客')}</h2>
            <p className="text-slate-400 text-sm mt-1">{member?.email || ""} </p>
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${titleColorClass}`}>
              <TitleIcon className={`w-3.5 h-3.5 ${titleIconClass}`} />
              <span className={makerTitle === '列印大神' || makerTitle === '3D Print Master' || makerTitle === '3Dプリント達人' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 animate-gold-shine drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : ''}>
                {makerTitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - overlaps the header */}
      <div className="px-4 -mt-14 relative z-20 space-y-5">
        
        {/* Subscription Upgrade Banner */}
        <div 
          onClick={() => navigate('/subscription')}
          className={`rounded-3xl p-5 sm:p-6 shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 text-white overflow-hidden relative ${
            member?.subscriptionPlan && member.subscriptionPlan !== 'None' 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-indigo-500/20 border border-indigo-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20'
          }`}
        >
          {/* Decorative background elements */}
          <div className="absolute -right-6 -top-10 opacity-10">
            <Package className="w-32 h-32" />
          </div>
          <div className="absolute right-20 -bottom-8 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
              {isVipActive 
                ? <Sparkles className="w-6 h-6 text-amber-300 drop-shadow" />
                : <Package className="w-6 h-6 text-white drop-shadow" />
              }
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl drop-shadow-sm flex items-center gap-2">
                {isVipActive 
                  ? (lang === 'en' ? `Elite ${member?.subscriptionPlan} Maker` : lang === 'ja' ? `VIP ${member?.subscriptionPlan} メイカー` : `尊榮 ${member?.subscriptionPlan} 創客`)
                  : (lang === 'en' ? 'Maker VIP Club' : lang === 'ja' ? 'メイカー VIP クラブ' : '創客 VIP 俱樂部')}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm ${
                  isVipActive 
                    ? 'bg-amber-400 text-amber-900' 
                    : 'bg-white text-amber-600'
                }`}>
                  {isVipActive ? (lang === 'en' ? 'Active' : lang === 'ja' ? '有効' : '已啟用') : (lang === 'en' ? 'Inactive' : lang === 'ja' ? '未加入' : '未開通')}
                </span>
              </h3>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5 font-medium drop-shadow-sm">
                {isVipActive && member?.subscriptionExpiry
                  ? (lang === 'en'
                      ? `VIP Perks Active! 5% Off storewide, ${Math.max(0, Math.ceil((new Date(member.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining`
                      : lang === 'ja'
                      ? `VIP特典適用中！全品5%OFF、残り ${Math.max(0, Math.ceil((new Date(member.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} 日`
                      : `VIP 權益生效中！全館 95 折，剩餘 ${Math.max(0, Math.ceil((new Date(member.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} 天`)
                  : (lang === 'en' ? 'Join VIP to enjoy 5% OFF storewide & exclusive privileges' : lang === 'ja' ? 'VIP加入で全品5%OFF＆限定特権を獲得' : '加入 VIP，立享全館 95 折優惠與專屬尊榮權益')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70 relative z-10" />
        </div>

        {/* Wallet / Points Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="text-center flex-1 border-r border-slate-100 py-2">
            <p className="text-[11px] font-bold text-slate-400 mb-1">{lang === 'en' ? 'G-Coins' : lang === 'ja' ? 'G-コイン' : '狗勾幣 (G-Coin)'}</p>
            <p className="text-2xl font-black text-slate-800">{member?.points || 0}</p>
          </div>
          <div onClick={() => openModal('coupons')} className="text-center flex-1 border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors py-2 rounded-xl">
            <p className="text-[11px] font-bold text-slate-400 mb-1">{lang === 'en' ? 'Coupons' : lang === 'ja' ? 'クーポン' : '優惠券'}</p>
            <p className="text-2xl font-black text-slate-800">{member?.coupons?.length || 0}<span className="text-xs text-slate-500 ml-1">{lang === 'en' ? ' pcs' : lang === 'ja' ? ' 枚' : '張'}</span></p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[11px] font-bold text-slate-400 mb-1">{lang === 'en' ? 'Credit Rebate' : lang === 'ja' ? 'ポイント還元' : '紅利折抵金'}</p>
            <p className="text-2xl font-black text-indigo-600">NT$ {Math.floor((member?.points || 0) * 0.1)}</p>
          </div>
        </div>

        {/* Order Management Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-900 text-lg">{lang === 'en' ? 'My Orders' : lang === 'ja' ? 'マイ注文' : '我的訂單'}</h3>
            <button onClick={() => openModal("orders")} className="text-xs font-bold text-slate-400 flex items-center hover:text-indigo-600 transition-colors cursor-pointer">
              {lang === 'en' ? 'View All' : lang === 'ja' ? 'すべて見る' : '查看全部'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-start px-2">
            {[
              { icon: CreditCard, label: lang === 'en' ? 'Unpaid' : lang === 'ja' ? '未払い' : '待付款', count: genuineMemberOrders.filter((o:any) => o.status === 'unpaid' || o.orderStatus === 'unpaid').length, tabId: 'unpaid' },
              { icon: Package, label: lang === 'en' ? 'Processing' : lang === 'ja' ? '発送準備中' : '待出貨', count: genuineMemberOrders.filter((o:any) => o.status === 'processing' || o.orderStatus === 'processing' || o.orderStatus === 'paid' || o.orderStatus === 'picking').length, tabId: 'processing' },
              { icon: Clock, label: lang === 'en' ? 'Shipping' : lang === 'ja' ? '配送中' : '運送中', count: genuineMemberOrders.filter((o:any) => o.status === 'shipping' || o.orderStatus === 'shipping' || o.orderStatus === 'shipped').length, tabId: 'shipping' },
              { icon: ShieldCheck, label: lang === 'en' ? 'Returns' : lang === 'ja' ? '返品・交換' : '退換貨', count: genuineMemberOrders.filter((o:any) => o.status === 'returning' || o.orderStatus === 'returning').length, tabId: 'returning' },
            ].map((item, i) => (
              <button key={i} onClick={() => openModal('orders', item.tabId)} className="flex flex-col items-center gap-2.5 relative group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300 group-hover:-translate-y-1">
                  <item.icon className="w-5 h-5" />
                  {item.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {item.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Printer Garage (Special Feature) */}
        <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-900/10 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
            <Printer className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg mb-1 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-300" />
                {lang === 'en' ? 'My Printer Garage' : lang === 'ja' ? 'マイプリンターガレージ' : '我的列印機車庫'}
              </h3>
              <p className="text-indigo-200 text-xs leading-relaxed">
                {lang === 'en' ? 'Configure your 3D printer for optimal filament tuning profiles!' : lang === 'ja' ? 'プリンター機種を設定して最適なフィラメント設定を取得！' : '設定您的 3D 列印機型號，獲取最精準的耗材參數建議！'}
              </p>
            </div>
            <button onClick={() => openModal("printers")} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors cursor-pointer">
              {lang === 'en' ? 'Manage' : lang === 'ja' ? '管理' : '管理機台'}
            </button>
          </div>
        </div>

        {/* Services Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-lg">{lang === 'en' ? 'Exclusive Services' : lang === 'ja' ? '専有サービス' : '專屬服務'}</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { icon: Sparkles, label: lang === 'en' ? 'My Subscriptions' : lang === 'ja' ? 'サブスク管理' : '我的訂閱管理', desc: lang === 'en' ? 'Billing cycle, points, plan changes' : lang === 'ja' ? '契約期間、ポイント残高、プラン変更' : '查看週期、剩餘點數、變更或取消方案', color: 'text-indigo-600', bg: 'bg-indigo-50', action: () => navigate('/subscription') },
              { icon: Medal, label: lang === 'en' ? 'Maker Achievements' : lang === 'ja' ? 'メイカーアチーブメント' : '創客成就', desc: lang === 'en' ? 'Unlock badges and secret discounts' : lang === 'ja' ? '限定バッジと特別割引を獲得' : '解鎖專屬徽章與隱藏折扣', color: 'text-amber-500', bg: 'bg-amber-50', action: () => openModal('achievements') },
              { icon: MapPin, label: lang === 'en' ? 'Saved Addresses' : lang === 'ja' ? '配送先住所' : '地址資訊', desc: lang === 'en' ? 'Manage shipping and billing addresses' : lang === 'ja' ? '配送先とお届け先住所の管理' : '管理您的常用收件與發票地址', color: 'text-sky-500', bg: 'bg-sky-50', action: () => openModal('address') },
              { icon: Share2, label: lang === 'en' ? 'Refer & Earn' : lang === 'ja' ? '友達紹介' : '推廣賺現金', desc: lang === 'en' ? 'Invite friends, earn $300 reward each' : lang === 'ja' ? '友達招待で両方に$300プレゼント' : '邀請好友下單，雙方各得 $300', color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => openModal('referral') },
              { 
                icon: History, 
                label: lang === 'en' ? 'Recently Viewed' : lang === 'ja' ? '最近閲覧した商品' : '最近瀏覽', 
                desc: historyCount > 0 
                  ? (lang === 'en' ? `${historyCount} items saved • Cloud Synced` : lang === 'ja' ? `${historyCount} 件保存済み • クラウド同期` : `已儲存 ${historyCount} 筆看過的耗材 • 雲端永久同步`) 
                  : (lang === 'en' ? 'Revisit High-Speed filaments you browsed' : lang === 'ja' ? '閲覧した高速PLAフィラメントを確認' : '找回您看過的高速 PLA 耗材（支援單筆刪除）'), 
                badge: historyCount > 0 ? `${historyCount}` : undefined,
                color: 'text-purple-500', 
                bg: 'bg-purple-50', 
                action: () => openModal('history') 
              },
            ].map((item, i) => (
              <button key={i} onClick={item.action || (() => showToast(lang === 'en' ? `${item.label} coming soon!` : lang === 'ja' ? `${item.label} は近日公開！` : `${item.label} 即將開放！`))} className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors text-left group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {[
              { icon: HeadphonesIcon, label: lang === 'en' ? 'Contact Support' : lang === 'ja' ? 'お問い合わせ' : '聯絡客服中心', action: () => navigate('/contact') },
              { icon: Bell, label: lang === 'en' ? 'Notifications' : lang === 'ja' ? '通知設定' : '通知設定', action: () => openModal('notifications') },
              { icon: HelpCircle, label: lang === 'en' ? 'Frequently Asked Questions (FAQ)' : lang === 'ja' ? 'よくある質問 (FAQ)' : '常見問題 (FAQ)', action: () => openModal('faq') },
              { icon: Settings, label: lang === 'en' ? 'Account & Security' : lang === 'ja' ? 'アカウントとセキュリティ' : '帳號與安全', action: () => openModal('settings') },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={item.action || (() => showToast(lang === 'en' ? `${item.label} coming soon!` : lang === 'ja' ? `${item.label} は近日公開！` : `${item.label} 即將開放！`))}
                className="w-full flex items-center p-4 hover:bg-slate-50 transition-colors text-left group cursor-pointer"
              >
                <item.icon className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="ml-4 flex-1 font-bold text-slate-700 text-sm">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-6 pb-4">
          <button onClick={async () => {
            if (onLogout) {
              await onLogout();
            } else {
              await logOut();
              setMember(null);
            }
            showToast(lang === 'en' ? 'Signed out successfully!' : lang === 'ja' ? '正常にログアウトしました！' : '已經安全登出您的帳號！');
          }} className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
            {lang === 'en' ? 'Sign Out' : lang === 'ja' ? 'ログアウト' : '登出帳號'}
          </button>
          <p className="text-center text-[10px] font-bold text-slate-300 mt-6 tracking-wider uppercase">
            PrintCore 3D v2.4.1 (2026.09)
          </p>
        </div>

      
        {/* Render Active Modal */}
        <OrderModal
          isOpen={activeModal === 'orders'}
          onClose={() => setActiveModal(null)}
          initialTab={orderTab}
          orders={genuineMemberOrders}
          member={member}
          onOpenTracking={onOpenTracking}
          onConfirmReceipt={async (orderId) => {
            if (setOrders) {
              await confirmOrderReceipt(orderId, orders, setOrders);
              showToast('🎉 已確認收貨！商品真實評價資格已成功解鎖');
            }
          }}
          onGoReview={(productId) => {
            navigate(`/?product=${productId}`);
          }}
        />
        <PrinterModal isOpen={activeModal === 'printers'} onClose={() => setActiveModal(null)} member={member} />
        <AddressModal isOpen={activeModal === 'address'} onClose={() => setActiveModal(null)} member={member} />
        <ReferralModal isOpen={activeModal === 'referral'} onClose={() => setActiveModal(null)} member={member} setMember={setMember} />
        <AchievementModal isOpen={activeModal === 'achievements'} onClose={() => setActiveModal(null)} member={member} orders={orders} />
        <SettingsModal isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} member={member} setMember={setMember} />
        <FAQModal isOpen={activeModal === 'faq'} onClose={() => setActiveModal(null)} />
        <HistoryModal 
          isOpen={activeModal === 'history'} 
          onClose={() => setActiveModal(null)} 
          member={member} 
          onOpenProductDetail={onOpenProductDetail}
          onAddToCart={onAddToCart}
        />

        <CouponModal isOpen={activeModal === 'coupons'} onClose={() => setActiveModal(null)} member={member} setMember={setMember} />


      </div>
    </div>
  );
};
