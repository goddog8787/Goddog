import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Package, 
  Calendar, 
  Clock, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  Zap, 
  Award,
  HelpCircle,
  Percent,
  Lock,
  History,
  Receipt
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MemberProfile, LanguageCode } from '../../types';
import { SEO } from '../../components/SEO';
import { saveCustomerUserData, saveCustomerProfileDoc } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';
import { createClientNewebPayPeriodCheckout } from '../../lib/newebpayClient';

interface SubscriptionPageProps {
  member: MemberProfile | null;
  setMember: React.Dispatch<React.SetStateAction<MemberProfile>>;
  onLoginClick?: () => void;
  lang?: LanguageCode;
}

interface PlanOption {
  id: string;
  name: string;
  category: 'vip' | 'box';
  duration: string;
  durationDays: number;
  price: number;
  originalPrice: number;
  badge?: string;
  tagline: string;
  frequencyLabel: string;
  perks: string[];
}

export function getAvailablePlans(lang: LanguageCode = 'zh-TW'): PlanOption[] {
  if (lang === 'en') {
    return [
      {
        id: 'vip-monthly',
        name: 'Monthly VIP',
        category: 'vip',
        duration: '30 Days',
        durationDays: 30,
        price: 99,
        originalPrice: 99,
        badge: 'Flexible',
        tagline: 'NT$ 99 / month',
        frequencyLabel: 'Auto-billed monthly',
        perks: ['5% OFF storewide', '2x G-Coin points', 'VIP Gold badge']
      },
      {
        id: 'vip-quarterly',
        name: 'Quarterly VIP',
        category: 'vip',
        duration: '90 Days',
        durationDays: 90,
        price: 279,
        originalPrice: 279,
        badge: 'Popular',
        tagline: 'Avg. NT$ 93 / month',
        frequencyLabel: 'Auto-billed every 90 days',
        perks: ['5% OFF storewide', '2x G-Coin points', 'VIP Gold badge', 'Priority dispatch']
      },
      {
        id: 'vip-yearly',
        name: 'Annual VIP',
        category: 'vip',
        duration: '365 Days',
        durationDays: 365,
        price: 990,
        originalPrice: 990,
        badge: 'Best Value',
        tagline: 'Avg. NT$ 82 / month',
        frequencyLabel: 'Auto-billed annually',
        perks: ['5% OFF storewide', '2x G-Coin points', 'Diamond VIP badge', 'Priority dispatch & support']
      }
    ];
  } else if (lang === 'ja') {
    return [
      {
        id: 'vip-monthly',
        name: '月額 VIP',
        category: 'vip',
        duration: '30日間',
        durationDays: 30,
        price: 99,
        originalPrice: 99,
        badge: '手軽',
        tagline: '月あたり NT$ 99',
        frequencyLabel: '毎月自動引き落とし',
        perks: ['全品 5% OFF', 'G-Coin 2倍還元', 'ゴールドバッジ']
      },
      {
        id: 'vip-quarterly',
        name: '季額 VIP',
        category: 'vip',
        duration: '90日間',
        durationDays: 90,
        price: 279,
        originalPrice: 279,
        badge: '人気',
        tagline: '月あたり NT$ 93',
        frequencyLabel: '90日ごとに自動引き落とし',
        perks: ['全品 5% OFF', 'G-Coin 2倍還元', 'ゴールドバッジ', '優先発送対応']
      },
      {
        id: 'vip-yearly',
        name: '年額 VIP',
        category: 'vip',
        duration: '365日間',
        durationDays: 365,
        price: 990,
        originalPrice: 990,
        badge: '最得',
        tagline: '月あたり NT$ 82',
        frequencyLabel: '毎年自動引き落とし',
        perks: ['全品 5% OFF', 'G-Coin 2倍還元', 'ダイヤモンドバッジ', '優先発送＆専任サポート']
      }
    ];
  }
  return [
    {
      id: 'vip-monthly',
      name: '月卡 VIP',
      category: 'vip',
      duration: '30 天',
      durationDays: 30,
      price: 99,
      originalPrice: 99,
      badge: '靈活體驗',
      tagline: '平均 NT$ 99 / 月',
      frequencyLabel: '每月自動扣款',
      perks: ['全館耗材 95 折', '雙倍 G-Coin 點數回饋', '創客金星徽章']
    },
    {
      id: 'vip-quarterly',
      name: '季卡 VIP',
      category: 'vip',
      duration: '90 天',
      durationDays: 90,
      price: 279,
      originalPrice: 279,
      badge: '熱門首選',
      tagline: '平均 NT$ 93 / 月',
      frequencyLabel: '每季 (90天) 自動扣款',
      perks: ['全館耗材 95 折', '雙倍 G-Coin 點數回饋', '創客金星徽章', '訂單優先揀貨出貨']
    },
    {
      id: 'vip-yearly',
      name: '年卡 VIP',
      category: 'vip',
      duration: '365 天',
      durationDays: 365,
      price: 990,
      originalPrice: 990,
      badge: '最超值',
      tagline: '平均 NT$ 82 / 月',
      frequencyLabel: '每年 (365天) 自動扣款',
      perks: ['全館耗材 95 折', '雙倍 G-Coin 點數回饋', '鑽石創客金星徽章', '全年優先出貨與專屬客服']
    }
  ];
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  member,
  setMember,
  onLoginClick,
  lang: propLang = 'zh-TW',
}) => {
  const lang: LanguageCode = (propLang as LanguageCode) || 'zh-TW';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const AVAILABLE_PLANS = useMemo(() => getAvailablePlans(lang), [lang]);

  const [selectedChangePlan, setSelectedChangePlan] = useState<PlanOption | null>(AVAILABLE_PLANS[1]);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [cancelReason, setCancelReason] = useState('耗材目前充足，暫不需使用');
  const [otherReasonText, setOtherReasonText] = useState('');
  
  const [inPageNotification, setInPageNotification] = useState<{
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const hasPlan = Boolean(member?.subscriptionPlan && member.subscriptionPlan !== 'None' && member?.subscriptionStatus === 'active');
  const isCancelled = hasPlan && (member?.subscriptionStatus === 'cancelled' || member?.autoRenew === false);
  
  const now = new Date();
  const expiryDate = member?.subscriptionExpiry ? new Date(member.subscriptionExpiry) : now;
  const startDate = member?.subscriptionStartDate ? new Date(member.subscriptionStartDate) : now;
  
  const totalCycleDays = Math.max(1, Math.ceil((expiryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = hasPlan ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const daysPassed = hasPlan ? Math.max(0, totalCycleDays - daysRemaining) : 0;
  const progressPercent = hasPlan ? Math.min(100, Math.max(5, Math.round((daysPassed / totalCycleDays) * 100))) : 0;

  const currentPlanName = hasPlan ? (member?.subscriptionPlan || 'VIP 會員') : '未訂閱';
  const currentPlanObj = AVAILABLE_PLANS.find(p => p.name.includes(currentPlanName) || currentPlanName.includes(p.name)) || AVAILABLE_PLANS[0];

  const updateMemberProfile = (updated: MemberProfile, notification: { type: 'success' | 'info' | 'warning'; title: string; message: string }) => {
    setMember(updated);
    localStorage.setItem('printcore_member', JSON.stringify(updated));
    if (updated.id) {
      saveCustomerProfileDoc(updated.id, updated).catch(console.warn);
      saveCustomerUserData(updated.id, 'profile', updated).catch(console.warn);
    }
    setInPageNotification(notification);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const isPlanOption = (p: any): p is PlanOption => {
    return Boolean(p && typeof p === 'object' && typeof p.id === 'string' && typeof p.price === 'number' && p.price > 0);
  };

  const applySubscriptionSuccess = (params: {
    orderId: string;
    periodNo: string;
    authCode: string;
    card4: string;
    periodAmt: number;
    nextAuthDate: string;
    userId?: string;
  }) => {
    if (!params.periodNo || !params.authCode) {
      return;
    }

    let pendingPlan: any = null;
    try {
      const saved = localStorage.getItem('printcore_pending_subscription');
      if (saved) pendingPlan = JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }

    const planName = pendingPlan?.planName || 'VIP 會員方案';
    const planDays = pendingPlan?.days || 30;
    const frequencyLabel = pendingPlan?.frequencyLabel || '每月自動扣款';

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + planDays);

    const calculatedNextBilling = params.nextAuthDate || newExpiry.toISOString().slice(0, 10);
    const pointsBonus = Math.floor(params.periodAmt * 1.5);

    const historyEntry = {
      id: `cycle-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount: params.periodAmt,
      planName: planName,
      periodNo: params.periodNo,
      authCode: params.authCode,
      invoiceNumber: `TW-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${params.periodNo.slice(-8)}`,
      status: 'success' as const,
      type: 'initial' as const,
      pointsAwarded: pointsBonus
    };

    const targetUid = member?.id || params.userId || auth.currentUser?.uid || 'guest';
    const existingHistory = member?.subscriptionHistory || [];

    const updated: MemberProfile = {
      ...(member || {
        id: targetUid,
        name: auth.currentUser?.displayName || '創客會員',
        email: auth.currentUser?.email || 'customer@gmail.com',
        phone: '',
        tier: 'Gold',
        points: 0,
        totalSpent: 0,
        ordersCount: 0,
      }),
      id: targetUid,
      tier: 'Gold',
      subscriptionPlan: planName,
      subscriptionStatus: 'active',
      autoRenew: true,
      subscriptionStartDate: new Date().toISOString().slice(0, 10),
      subscriptionExpiry: newExpiry.toISOString().slice(0, 10),
      subscriptionFrequency: frequencyLabel,
      subscriptionPeriodNo: params.periodNo,
      subscriptionCardLast4: params.card4,
      subscriptionNextBillingDate: calculatedNextBilling,
      subscriptionAmount: params.periodAmt,
      subscriptionHistory: [historyEntry, ...existingHistory],
      points: (member?.points || 0) + pointsBonus
    };

    updateMemberProfile(updated, {
      type: 'success',
      title: '🎉 VIP 會員開通成功！',
      message: `委託單號：【${params.periodNo}】已生效，扣款 NT$ ${params.periodAmt}，加贈 +${pointsBonus} 點 G-Coin！`
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    localStorage.removeItem('printcore_pending_subscription');
    setSelectedChangePlan(null);
  };

  useEffect(() => {
    const periodSuccess = searchParams.get('period_success') === 'true';
    if (periodSuccess) {
      const orderId = searchParams.get('orderId') || '';
      let periodNo = searchParams.get('periodNo') || '';
      let authCode = searchParams.get('authCode') || '';
      let card4 = searchParams.get('card4') || '';
      let periodAmt = Number(searchParams.get('periodAmt')) || 0;
      let nextAuthDate = searchParams.get('nextAuthDate') || '';
      let returnUserId = searchParams.get('userId') || '';

      const pendingRaw = localStorage.getItem('printcore_pending_subscription');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          if (!periodAmt && pending.price) periodAmt = Number(pending.price);
          if (!returnUserId && pending.userId) returnUserId = pending.userId;
          if (!periodNo) periodNo = `PER_${orderId || Date.now()}`;
          if (!authCode) authCode = `AUTH_${Date.now().toString().slice(-6)}`;
          if (!card4) card4 = '••••';
        } catch {}
      }

      if (periodNo && authCode && periodAmt > 0) {
        applySubscriptionSuccess({
          orderId,
          periodNo,
          authCode,
          card4,
          periodAmt,
          nextAuthDate,
          userId: returnUserId
        });
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NEWEBPAY_PERIOD_SUCCESS' && event.data?.data) {
        const d = event.data.data;
        if (d.periodNo && d.authCode && Number(d.periodAmt) > 0) {
          applySubscriptionSuccess({
            orderId: d.orderId || '',
            periodNo: d.periodNo,
            authCode: d.authCode,
            card4: d.card4No || '',
            periodAmt: Number(d.periodAmt) || 0,
            nextAuthDate: d.nextAuthDate || ''
          });
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [searchParams]);

  const handleConfirmPlanChange = async (targetPlan?: PlanOption) => {
    const plan = isPlanOption(targetPlan) ? targetPlan : selectedChangePlan;
    if (!plan || !isPlanOption(plan)) {
      setInPageNotification({
        type: 'warning',
        title: '請先選擇訂閱方案',
        message: '請點選您要開通的 VIP 方案後再前往付款。'
      });
      return;
    }

    if (!member?.id && !auth.currentUser) {
      if (onLoginClick) {
        onLoginClick();
        return;
      }
    }

    setIsChangingPlan(true);
    setInPageNotification(null);

    try {
      const email = member?.email || auth.currentUser?.email || 'customer@gmail.com';
      const uid = member?.id || auth.currentUser?.uid || '';
      const priceVal = Number(plan.price);
      let checkoutData: { url: string; formParams: Record<string, string> } | null = null;

      try {
        const res = await fetch('/api/payment/period-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            planName: plan.name,
            price: priceVal,
            days: Number(plan.durationDays) || 30,
            email: email,
            frequencyLabel: plan.frequencyLabel,
            userId: uid,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.formParams) {
            checkoutData = data;
          }
        }
      } catch (networkErr) {
        console.warn('[Period Checkout] 切換至前端藍新加密模組:', networkErr);
      }

      if (!checkoutData) {
        checkoutData = createClientNewebPayPeriodCheckout({
          planId: plan.id,
          planName: plan.name,
          price: priceVal,
          days: Number(plan.durationDays) || 30,
          email: email,
          frequencyLabel: plan.frequencyLabel,
          userId: uid,
        });
      }

      if (!checkoutData || !checkoutData.formParams) {
        throw new Error('無法啟動藍新金流系統，請稍候重試');
      }

      localStorage.setItem('printcore_pending_subscription', JSON.stringify({
        planId: plan.id,
        planName: plan.name,
        price: priceVal,
        days: plan.durationDays,
        frequencyLabel: plan.frequencyLabel,
        userId: uid,
        timestamp: Date.now(),
      }));

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutData.url;
      if (window.self !== window.top) {
        form.target = '_blank';
      }
      Object.keys(checkoutData.formParams).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = checkoutData!.formParams[key];
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setInPageNotification({
        type: 'info',
        title: '已開啟藍新金流授權頁面',
        message: '請於新視窗完成信用卡授權，完成後系統將自動開通您的 VIP 權益。'
      });
    } catch (err: any) {
      console.error(err);
      setInPageNotification({
        type: 'warning',
        title: '金流連線失敗',
        message: err.message || '無法發起藍新金流授權，請稍後再試。'
      });
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleConfirmCancellation = () => {
    if (!member) return;
    const updated: MemberProfile = {
      ...member,
      subscriptionStatus: 'cancelled',
      autoRenew: false
    };

    updateMemberProfile(updated, {
      type: 'warning',
      title: '已停止下期自動扣款',
      message: `您的【${currentPlanName}】下期自動續約已停止，本期權益仍可使用至 ${expiryDate.toISOString().slice(0, 10)}（剩餘 ${daysRemaining} 天）。`
    });

    setShowCancelSection(false);
  };

  const handleResumeSubscription = () => {
    if (!member) return;
    const updated: MemberProfile = {
      ...member,
      subscriptionStatus: 'active',
      autoRenew: true
    };

    updateMemberProfile(updated, {
      type: 'success',
      title: '已恢復自動續約',
      message: `【${currentPlanName}】已重新開啟自動續約，將於 ${expiryDate.toISOString().slice(0, 10)} 自動延展會員權益。`
    });
  };

  if (!member && !onLoginClick) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">請先登入會員</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">登入後即可查看或開通 VIP 會員方案。</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            返回商城首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16">
      <SEO 
        title="VIP 會員方案與訂閱管理" 
        description="開通或管理神狗勾 3D 創客 VIP 會員方案，享全館 95 折、雙倍點數與優先出貨。" 
        url="/subscription" 
      />

      {/* Compact Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            商城首頁
          </Link>
          <span>/</span>
          <Link to="/profile" className="hover:text-indigo-600 transition-colors">
            會員中心
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">VIP 會員方案</span>
        </div>

        <Link to="/profile" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          會員中心
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Compact Hero Status Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>VIP 創客俱樂部</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              全館耗材 95 折 · 雙倍狗勾幣回饋
            </h1>
            <p className="text-slate-300 text-xs">
              支援藍新金流安全授權，隨時可線上切換或停止次期續約。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-300">目前狀態</p>
                <p className="text-xs sm:text-sm font-black text-white">
                  {hasPlan ? `${currentPlanName} (剩 ${daysRemaining} 天)` : '一般會員'}
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-300">狗勾幣</p>
                <p className="text-xs sm:text-sm font-black text-white font-mono">
                  {member?.points || 0} 點
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-page Notification Banner */}
      <AnimatePresence>
        {inPageNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
              inPageNotification.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' 
                : inPageNotification.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            {inPageNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {inPageNotification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {inPageNotification.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">{inPageNotification.title}</p>
              <p className="opacity-90 mt-0.5">{inPageNotification.message}</p>
            </div>
            <button
              onClick={() => setInPageNotification(null)}
              className="text-xs font-semibold underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              關閉
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Compact VIP Perks Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">全館 95 折</h4>
            <p className="text-[11px] text-slate-500">結帳自動折抵</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">雙倍狗勾幣</h4>
            <p className="text-[11px] text-slate-500">2x 點數回饋</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">優先出貨</h4>
            <p className="text-[11px] text-slate-500">專屬快速揀貨</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">金星徽章</h4>
            <p className="text-[11px] text-slate-500">尊榮身份標記</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: 選擇 VIP 方案 (Clean 3-Column Cards + Direct Checkout) */}
      <div id="change-plan-section" className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {hasPlan ? '變更或升級 VIP 方案' : '選擇 VIP 訂閱方案'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              點選方案即可透過藍新金流安全開通，隨時可取消次期續約
            </p>
          </div>
        </div>

        {/* 3 Clean Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_PLANS.filter(p => p.category === 'vip').map((plan) => {
            const isCurrent = hasPlan && (currentPlanName.includes(plan.name) || plan.name.includes(currentPlanName));
            const isSelected = selectedChangePlan?.id === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => {
                  if (!isCurrent) setSelectedChangePlan(plan);
                }}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 hover:border-indigo-300 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {plan.duration}
                    </span>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        使用中
                      </span>
                    ) : plan.badge ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-2 mb-1">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      NT$ {plan.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">{plan.tagline}</p>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-5 border-t border-slate-200/60 dark:border-slate-800 pt-3">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl">
                    目前使用方案
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isChangingPlan}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChangePlan(plan);
                      handleConfirmPlanChange(plan);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isChangingPlan && isSelected ? '連線金流中...' : (hasPlan ? '切換此方案' : '立即開通')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 訂閱狀態與扣款紀錄 (Compact & Clean) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                訂閱週期與扣款紀錄
              </h2>
              <p className="text-xs text-slate-500">
                藍新金流 (NewebPay) 定期定額安全託管
              </p>
            </div>
          </div>

          {hasPlan && (
            isCancelled ? (
              <button
                type="button"
                onClick={handleResumeSubscription}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>恢復自動續約</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowCancelSection(!showCancelSection)}
                className="px-3.5 py-2 text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                {showCancelSection ? '收合取消設定' : '取消下期續約'}
              </button>
            )
          )}
        </div>

        {hasPlan && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">生效起始日</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {startDate.toISOString().slice(0, 10)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">{isCancelled ? '權益截止日' : '下次扣款日'}</span>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {expiryDate.toISOString().slice(0, 10)}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">剩餘天數</span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {daysRemaining} 天 ({progressPercent}%)
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">委託單號</span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                {member?.subscriptionPeriodNo || '生效中'}
              </p>
            </div>
          </div>
        )}

        {/* Inline Cancel Flow */}
        <AnimatePresence>
          {showCancelSection && hasPlan && !isCancelled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-sm">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>確認停止下期自動續約？（本期權益仍保留至 {expiryDate.toISOString().slice(0, 10)}）</span>
                </div>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="耗材目前充足，暫不需使用">耗材目前庫存充足，暫無列印需求</option>
                  <option value="想改買其他規格線材">想改買其他規格線材或單卷購買</option>
                  <option value="設備維修或升級中">3D 列印機正在維修或升級中</option>
                  <option value="預算或個人考量">個人預算考量</option>
                  <option value="其他">其他原因</option>
                </select>
                {cancelReason === '其他' && (
                  <input
                    type="text"
                    placeholder="請輸入原因..."
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                )}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={handleConfirmCancellation}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    確認停止續訂
                  </button>
                  <button
                    onClick={() => setShowCancelSection(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    保留訂閱
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Billing History Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              扣款歷史紀錄
            </h3>
          </div>

          {hasPlan && member?.subscriptionHistory && member.subscriptionHistory.filter(r => r && r.periodNo !== 'P2609160012' && r.periodNo !== 'P8839201948').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <th className="pb-2 font-semibold">日期</th>
                    <th className="pb-2 font-semibold">方案</th>
                    <th className="pb-2 font-semibold">委託單號</th>
                    <th className="pb-2 font-semibold">金額</th>
                    <th className="pb-2 font-semibold text-right">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {member.subscriptionHistory
                    .filter(r => r && r.periodNo !== 'P2609160012' && r.periodNo !== 'P8839201948')
                    .map((record, idx) => (
                    <tr key={record.id || idx}>
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{record.date}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{record.planName || currentPlanName}</td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-500">{record.periodNo || '-'}</td>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">NT$ {record.amount}</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">✓ 成功</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              尚無扣款紀錄，開通 VIP 後將自動記錄於此。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
