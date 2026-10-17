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
  Flame, 
  Zap, 
  Award,
  Layers,
  HelpCircle,
  Percent,
  Lock,
  RefreshCw,
  FileText,
  ExternalLink,
  History,
  Receipt
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MemberProfile, LanguageCode } from '../../types';
import { SEO } from '../../components/SEO';
import { saveCustomerUserData, saveCustomerProfileDoc } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';

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
        duration: '1 Month',
        durationDays: 30,
        price: 99,
        originalPrice: 150,
        tagline: 'Flexible starter pass, ideal for personal makers beginning 3D printing',
        frequencyLabel: 'Auto-billed monthly',
        perks: ['5% OFF all filaments storewide', '2x G-Coin reward points', 'Gold Maker VIP badge', 'Priority support response']
      },
      {
        id: 'vip-quarterly',
        name: 'Quarterly VIP',
        category: 'vip',
        duration: '3 Months (90 days)',
        durationDays: 90,
        price: 279,
        originalPrice: 450,
        badge: 'Best Value • $93/mo equivalent',
        tagline: 'Most popular! Tailored for regular prototyping & active printing',
        frequencyLabel: 'Auto-billed every 90 days',
        perks: ['5% OFF all filaments storewide', '2x G-Coin reward points', 'Gold Maker VIP badge', 'Early access to new filaments', 'Monthly NT$50 accessory coupon']
      },
      {
        id: 'vip-yearly',
        name: 'Annual VIP',
        category: 'vip',
        duration: '12 Months (365 days)',
        durationDays: 365,
        price: 990,
        originalPrice: 1800,
        badge: 'Top Savings • $82/mo equivalent',
        tagline: 'Flagship tier! Effortless all-year printing with ultimate VIP benefits',
        frequencyLabel: 'Auto-billed annually',
        perks: ['5% OFF all filaments storewide', '2x G-Coin reward points', 'Diamond Maker badge', 'Free hardened steel nozzle bundle', '12% OFF accessories all year', '1-on-1 official slicing engineering support']
      },
      {
        id: 'box-maker',
        name: 'Maker Spool Box',
        category: 'box',
        duration: 'Monthly Regular Dispatch',
        durationDays: 30,
        price: 899,
        originalPrice: 1100,
        badge: 'Subscription Spool Box',
        tagline: '2 Spools of High-Speed PLA+/PETG delivered monthly automatically',
        frequencyLabel: 'Dispatched automatically on the 5th of each month',
        perks: ['2 Spools of curated filaments delivered monthly', 'Zero shipping fees for CVS or Home delivery', '10% OFF all accessories storewide', 'Includes patented vacuum moisture-proof storage bags']
      }
    ];
  } else if (lang === 'ja') {
    return [
      {
        id: 'vip-monthly',
        name: '月額 VIP',
        category: 'vip',
        duration: '1ヶ月',
        durationDays: 30,
        price: 99,
        originalPrice: 150,
        tagline: '手軽なライトプラン。3Dプリントを始めたばかりの個人メイカーに最適',
        frequencyLabel: '毎月自動引き落とし',
        perks: ['全フィラメント 5% OFF', 'G-Coin ポイント2倍還元', 'ゴールドVIP栄誉バッジ', '専任サポート優先返信']
      },
      {
        id: 'vip-quarterly',
        name: '季額 VIP',
        category: 'vip',
        duration: '3ヶ月 (90日間)',
        durationDays: 90,
        price: 279,
        originalPrice: 450,
        badge: '一番人気・実質 $93/月相当',
        tagline: '一番人気！定期的な試作や造形を楽しむアクティブメイカー向け',
        frequencyLabel: '90日ごとに自動引き落とし',
        perks: ['全フィラメント 5% OFF', 'G-Coin ポイント2倍還元', 'ゴールドVIP栄誉バッジ', '新商品フィラメント先行予約権', '毎月50元相当のパーツ割引券']
      },
      {
        id: 'vip-yearly',
        name: '年額 VIP',
        category: 'vip',
        duration: '12ヶ月 (365日間)',
        durationDays: 365,
        price: 990,
        originalPrice: 1800,
        badge: '最高にお得・実質 $82/月相当',
        tagline: '最上位フラッグシップ！年間を通して快適に造形、最高峰の専属特権',
        frequencyLabel: '毎年自動引き落とし',
        perks: ['全フィラメント 5% OFF', 'G-Coin ポイント2倍還元', 'ダイヤモンドVIPバッジ', '純正焼き入れ鋼ノズル贈呈セット', '年間通してパーツ類12% OFF', '公式スライサー技術エキスパート個別相談']
      },
      {
        id: 'box-maker',
        name: 'メイカー定期便 (Maker Box)',
        category: 'box',
        duration: '毎月定期お届け',
        durationDays: 30,
        price: 899,
        originalPrice: 1100,
        badge: '定期フィラメント便',
        tagline: '毎月高速PLA+/PETGを2巻自動発送。都度注文の手間不要',
        frequencyLabel: '毎月5日自動発送',
        perks: ['毎月厳選高速フィラメント2巻直送', 'コンビニ・宅配送料無料', '全パーツ類10%割引適用', '特許防湿アルミ密封パック付属']
      }
    ];
  }
  return [
    {
      id: 'vip-monthly',
      name: '月卡 VIP',
      category: 'vip',
      duration: '1 個月',
      durationDays: 30,
      price: 99,
      originalPrice: 150,
      tagline: '彈性輕量，適合剛開始入門列印的個人創客',
      frequencyLabel: '每月自動扣款',
      perks: ['全館耗材 95 折優惠', '雙倍 G-Coin 點數回饋', '創客金星尊榮徽章', '專屬客服優先回覆']
    },
    {
      id: 'vip-quarterly',
      name: '季卡 VIP',
      category: 'vip',
      duration: '3 個月 (90天)',
      durationDays: 90,
      price: 279,
      originalPrice: 450,
      badge: '熱銷首選・折合 $93/月',
      tagline: '最受歡迎！適合定期打樣與列印作品的狂熱創客',
      frequencyLabel: '每季 (90天) 自動扣款',
      perks: ['全館耗材 95 折優惠', '雙倍 G-Coin 點數回饋', '創客金星尊榮徽章', '新品線材搶先預購權', '每月贈送 50 元配件折價券']
    },
    {
      id: 'vip-yearly',
      name: '年卡 VIP',
      category: 'vip',
      duration: '12 個月 (365天)',
      durationDays: 365,
      price: 990,
      originalPrice: 1800,
      badge: '最划算・折合 $82/月',
      tagline: '頂級旗艦！全年列印無負擔，享受最極致的專屬尊爵待遇',
      frequencyLabel: '每年 (365天) 自動扣款',
      perks: ['全館耗材 95 折優惠', '雙倍 G-Coin 點數回饋', '鑽石創客金星徽章', '原廠硬化鋼噴嘴贈品包', '全年度配件 88 折特權', '1 對 1 官方切片技術專家支援']
    },
    {
      id: 'box-maker',
      name: '創客暢印箱 Maker Box',
      category: 'box',
      duration: '每月定期配送',
      durationDays: 30,
      price: 899,
      originalPrice: 1100,
      badge: '定期耗材箱',
      tagline: '每月固定配送 2 卷高速 PLA+/PETG 耗材，無需反覆下單',
      frequencyLabel: '每月 5 號自動配送出貨',
      perks: ['每月直送 2 卷精選高速耗材', '免收超商或宅配運費', '享有全館配件 9 折加購價', '附贈專利真空防潮密封袋']
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

  // Selected plan for inline change workflow
  const [selectedChangePlan, setSelectedChangePlan] = useState<PlanOption | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [cancelReason, setCancelReason] = useState('耗材目前充足，暫不需使用');
  const [otherReasonText, setOtherReasonText] = useState('');
  
  // In-page feedback message
  const [inPageNotification, setInPageNotification] = useState<{
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  // Subscription calculation
  const hasPlan = Boolean(member?.subscriptionPlan && member.subscriptionPlan !== 'None' && member?.subscriptionStatus === 'active');
  const isCancelled = hasPlan && (member?.subscriptionStatus === 'cancelled' || member?.autoRenew === false);
  
  // Expiry calculation
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
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // 輔助判斷是否為有效方案物件，防止 React 事件對象被傳入
  const isPlanOption = (p: any): p is PlanOption => {
    return Boolean(p && typeof p === 'object' && typeof p.id === 'string' && typeof p.price === 'number' && p.price > 0);
  };

  // 處理定期定額成功後之會員資料寫入與通知 (僅在藍新金流回傳真實授權結果時執行)
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
      console.warn('[Subscription] 缺少有效藍新金流定期定額授權單號或授權碼，拒絕寫入模擬數據');
      return;
    }

    // 讀取待處理訂閱暫存資料
    let pendingPlan: any = null;
    try {
      const saved = localStorage.getItem('printcore_pending_subscription');
      if (saved) pendingPlan = JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }

    const planName = pendingPlan?.planName || 'VIP 會員方案';
    const planDays = pendingPlan?.days || 30;
    const frequencyLabel = pendingPlan?.frequencyLabel || '每月自動扣款 (藍新金流定期定額)';

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
      title: '🎉 藍新金流信用卡定期定額授權成功！',
      message: `委託單號：【${params.periodNo}】已成立。第一期扣款 NT$ ${params.periodAmt} 已完成（授權碼：${params.authCode}），次期將於 ${calculatedNextBilling} 由藍新金流向發卡行發動自動扣款，會員權益持續生效！加贈 +${pointsBonus} 點 G-Coin！`
    });

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    localStorage.removeItem('printcore_pending_subscription');
    setSelectedChangePlan(null);
  };

  // 監聽藍新金流定期定額授權完成回傳參數 (ReturnURL 或子視窗 postMessage)
  useEffect(() => {
    const periodSuccess = searchParams.get('period_success') === 'true';
    if (periodSuccess) {
      const orderId = searchParams.get('orderId') || '';
      const periodNo = searchParams.get('periodNo') || '';
      const authCode = searchParams.get('authCode') || '';
      const card4 = searchParams.get('card4') || '';
      const periodAmt = Number(searchParams.get('periodAmt')) || 0;
      const nextAuthDate = searchParams.get('nextAuthDate') || '';
      const returnUserId = searchParams.get('userId') || '';

      // 嚴格非模擬校驗：僅當存在真實委託單號與授權碼時方可生效
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

    // 接收彈出授權視窗完成後透過 postMessage 傳回的通知
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

  // 1. 發起藍新金流定期定額真實扣款委託 (NewebPay Period API)
  const handleConfirmPlanChange = async (targetPlan?: PlanOption) => {
    // 嚴防 React 事件對象 (SyntheticBaseEvent) 或無效物件
    const plan = isPlanOption(targetPlan) ? targetPlan : selectedChangePlan;
    if (!plan || !isPlanOption(plan)) {
      setInPageNotification({
        type: 'warning',
        title: '請先選擇訂閱方案',
        message: '請先在上方點選您要開通的 VIP 方案，確認扣款金額後再前往扣款。'
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

      const data = await res.json();
      if (!data.success || !data.formParams) {
        throw new Error(data.message || '無法連線藍新金流定期定額系統');
      }

      // 將待訂閱資訊存於 localStorage 作為金流導回時驗證核對
      localStorage.setItem('printcore_pending_subscription', JSON.stringify({
        planId: plan.id,
        planName: plan.name,
        price: priceVal,
        days: plan.durationDays,
        frequencyLabel: plan.frequencyLabel,
        userId: uid,
        timestamp: Date.now(),
      }));

      // 動態建立 Form 表單提交至藍新定期定額閘道
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;
      // 若處於 iframe 內（如預覽環境），使用新分頁開啟以避免 X-Frame-Options 阻擋
      if (window.self !== window.top) {
        form.target = '_blank';
      }
      Object.keys(data.formParams).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data.formParams[key];
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setInPageNotification({
        type: 'info',
        title: '已跳轉至藍新金流定期定額授權閘道',
        message: '藍新信用卡授權頁面已開啟，請在該頁面輸入卡號並完成 3D 驗證。授權成功後將自動建立定期委託並扣除第一期款項，各期扣款將獨立記錄在您的帳號！'
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

  // 2. 取消定期定額自動續約 (取消下期自動扣款)
  const handleConfirmCancellation = () => {
    if (!member) return;
    const updated: MemberProfile = {
      ...member,
      subscriptionStatus: 'cancelled',
      autoRenew: false
    };

    updateMemberProfile(updated, {
      type: 'warning',
      title: '已停止藍新金流每期自動扣款',
      message: `您的【${currentPlanName}】下期自動扣款已成功停止。您目前享有的 VIP 95 折與雙倍點數仍可繼續使用至本期結束 (${expiryDate.toISOString().slice(0, 10)}，剩餘 ${daysRemaining} 天)，剩餘點數全數保留。`
    });

    setShowCancelSection(false);
  };

  // 3. 恢復定期定額自動扣款
  const handleResumeSubscription = () => {
    if (!member) return;
    const updated: MemberProfile = {
      ...member,
      subscriptionStatus: 'active',
      autoRenew: true
    };

    updateMemberProfile(updated, {
      type: 'success',
      title: '已恢復藍新金流自動扣款續約',
      message: `【${currentPlanName}】已重新開啟每期自動續約！於到期日 ${expiryDate.toISOString().slice(0, 10)} 將自動為您延展尊榮權益，享受無中斷的 3D 列印耗材優惠！`
    });
  };

  if (!member && !onLoginClick) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">請先登入創客帳號</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">登入後即可查看您個人的 VIP 訂閱方案、扣款週期與剩餘點數。</p>
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
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16">
      <SEO 
        title="我的訂閱管理" 
        description="查看與管理您的 3D 列印創客 VIP 訂閱方案、查詢扣款週期、剩餘點數，並提供線上即時變更方案與取消訂閱設定。" 
        url="/subscription" 
      />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'en' ? 'Store' : lang === 'ja' ? 'ショップ' : '商城首頁'}
          </Link>
          <span>/</span>
          <Link 
            to="/profile" 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {lang === 'en' ? 'Account' : lang === 'ja' ? 'マイページ' : '會員中心'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {lang === 'en' ? 'My Subscription' : lang === 'ja' ? 'VIP定期購読' : '我的訂閱管理'}
          </span>
        </div>

        <Link
          to="/profile"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          {lang === 'en' ? 'View Profile' : lang === 'ja' ? 'プロフィール' : '查看會員完整檔案'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        {/* Decorative Watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-indigo-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'GodDog 3D Maker Club' : lang === 'ja' ? '神狗勾 3D メイカーズクラブ' : '神狗勾 3D 創客俱樂部'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              {lang === 'en' ? 'My Subscription Portal' : lang === 'ja' ? 'VIP定期購読管理センター' : '『我的訂閱』管理中心'}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              {lang === 'en'
                ? 'Manage your billing cycles, point multipliers, and VIP perks online with instant tier switching.'
                : lang === 'ja'
                ? '定期引き落としサイクル、残存ポイント、VIP限定特典の確認やプラン変更・解約を管理できます。'
                : '直接在獨立專頁掌握您的訂閱週期、剩餘點數、VIP 專屬權益，並可線上即時變更或取消方案。'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {lang === 'en' ? 'Status' : lang === 'ja' ? '会員ステータス' : '訂閱身分'}
                </p>
                <p className="text-sm font-black text-white">
                  {hasPlan ? currentPlanName : (lang === 'en' ? 'Free Maker (No VIP)' : lang === 'ja' ? '一般会員 (未購読)' : '一般會員 (未啟用訂閱)')}
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
            className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-md ${
              inPageNotification.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' 
                : inPageNotification.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            {inPageNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {inPageNotification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
            {inPageNotification.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm">
              <p className="font-bold text-base mb-0.5">{inPageNotification.title}</p>
              <p className="leading-relaxed opacity-90">{inPageNotification.message}</p>
            </div>
            <button
              onClick={() => setInPageNotification(null)}
              className="text-xs font-semibold underline opacity-70 hover:opacity-100 p-1 cursor-pointer"
            >
              關閉
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Overview: 2 Core Cards (Cycle & Points) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: 訂閱週期與核心狀態 (7 Cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    {hasPlan ? '目前訂閱週期' : '創客會員狀態'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {hasPlan ? (member?.subscriptionFrequency || '每期自動續約') : '一般創客・尚未開通 VIP 定期定額'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {hasPlan ? (
                  isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5" />
                      到期後停止續約
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      自動續約中
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    未訂閱 VIP
                  </span>
                )}
              </div>
            </div>

            {hasPlan ? (
              /* Cycle Dates & Countdown Box */
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 mb-4">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">本期生效起始日</p>
                    <p className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">
                      {startDate.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {isCancelled ? '本期權益截止日' : '下次自動扣款日'}
                    </p>
                    <p className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {expiryDate.toISOString().slice(0, 10)}
                    </p>
                  </div>
                </div>

                {/* Progress & Remaining Days */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">週期已過 {daysPassed} 天</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      剩餘 <span className="text-base text-indigo-600 dark:text-indigo-400 font-black">{daysRemaining}</span> 天
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Non-subscribed CTA card */
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mb-4">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  開通 3D 創客 VIP，專屬權益立即生效
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                  透過藍新金流信用卡定期定額開通，每期固定自動扣款並自動順延天數。全館耗材享 95 折、雙倍積分回饋、免運券與優先備貨。隨時可線上停止次期續約，省心又便利！
                </p>
                <a
                  href="#change-plan-section"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  瀏覽方案並立即刷卡開通
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions in Cycle Card */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              扣款方式：藍新金流 (NewebPay) 定期定額信用卡授權
            </span>

            {hasPlan && (
              isCancelled ? (
                <button
                  onClick={handleResumeSubscription}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  恢復自動續約
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowCancelSection(true);
                    const el = document.getElementById('cancel-subscription-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  取消自動扣款
                </button>
              )
            )}
          </div>
        </div>

        {/* Card 2: 剩餘點數與 G-Coin 回饋 (5 Cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-slate-800 dark:to-slate-800 rounded-3xl p-6 shadow-sm border border-amber-200/80 dark:border-amber-800/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">剩餘創客積分</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">狗勾幣 (G-Coin)</p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                VIP 2x 雙倍累點
              </span>
            </div>

            {/* Points Huge Number */}
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {member?.points || 0}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">點 (G-Coin)</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold mt-1">
                ≈ 等值現金折抵 <span className="font-black text-sm">NT$ {member?.points || 0}</span> 元
              </p>
            </div>

            {/* Points Perks List */}
            <div className="space-y-2 py-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>結帳 1 點折抵 1 元，無折抵上限</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>VIP 享有全館每筆消費 2 倍積分回饋</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>空線盤回收每卷享額外 100 點獎勵</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              立即前往商城折抵耗材
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Active VIP Benefits Strip */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {hasPlan ? '當前享有之 VIP 專屬特權' : '開通 VIP 即可解鎖之專屬特權 (加入會員立即生效)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
              <Percent className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">全館耗材 95 折</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">購物車結帳自動套用 5% 折扣，不限金額次數。</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">點數 2 倍雙倍贈</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">每次消費獲得雙倍 G-Coin，累積更快折抵更省。</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">優先閃電出貨</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">倉儲優先揀貨打包，當日下單最快隔日配達超商。</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">尊榮創客徽章</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">在會員個人專頁與評價區點亮專屬尊榮金星標記。</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: 藍新金流定期定額扣款管理與歷史紀錄 (NewebPay Recurring Delegation) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  藍新金流定期定額扣款管理
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  官方 Period API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                每期週期到期自動由藍新金流安全發起扣款，即時延展尊榮會員天數並回饋點數。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasPlan ? (
              isCancelled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <XCircle className="w-3.5 h-3.5" />
                  已停止次期自動扣款
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  每期自動扣款生效中
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                尚未開通訂閱
              </span>
            )}
          </div>
        </div>

        {/* 4-Item Delegation Specs or Unsubscribed Guidance */}
        {!hasPlan && !member?.subscriptionPeriodNo ? (
          <div className="py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-4">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
              目前尚未開通定期定額信用卡自動扣款
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              您可於下方選擇適合的 VIP 方案，透過藍新金流官方安全授權開通每期定期定額扣款。扣款成功後將於此即時顯示委託單號、扣款歷程與次期自動扣款日。
            </p>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('change-plan-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              瀏覽並選擇 VIP 訂閱方案
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">藍新委託單號 (PeriodNo)</span>
                <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {member?.subscriptionPeriodNo || '未取得'}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">✓ 銀行委託授權生效</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">自動扣款信用卡</span>
                <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <span>•••• •••• •••• {member?.subscriptionCardLast4 || '****'}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">藍新 PCI-DSS Level 1 加密代碼</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {isCancelled ? '方案權益截止日' : '下次預計扣款日'}
                </span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {member?.subscriptionNextBillingDate || (hasPlan ? expiryDate.toISOString().slice(0, 10) : '-')}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isCancelled ? '期滿不再自動扣款' : '次期自動發動扣款續約'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">週期扣款金額</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                  NT$ {member?.subscriptionAmount || currentPlanObj.price} / 期
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {member?.subscriptionFrequency || '每月自動扣款'}
                </p>
              </div>
            </div>

            {/* Action Buttons for Recurring Control */}
            {hasPlan && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    委託扣款單號：<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{member?.subscriptionPeriodNo || '未取得'}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>
                    授權末四碼：<span className="font-mono font-bold text-slate-800 dark:text-slate-200">**** **** **** {member?.subscriptionCardLast4 || '****'}</span>
                  </span>
                </div>

                <div>
                  {isCancelled ? (
                    <button
                      type="button"
                      onClick={handleResumeSubscription}
                      className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>重新恢復每期自動續約</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelSection(true);
                        const el = document.getElementById('cancel-subscription-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3.5 py-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      停止下期自動扣款
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* 扣款週期歷史紀錄 (Billing Cycle History) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              定期定額扣款歷程紀錄 (Billing Cycle History)
            </h3>
            <span className="text-xs text-slate-400">
              共 {hasPlan ? (member?.subscriptionHistory?.filter(r => r && r.periodNo !== 'P2609160012' && r.periodNo !== 'P8839201948')?.length || 0) : 0} 筆扣款紀錄
            </span>
          </div>

          {hasPlan && member?.subscriptionHistory && member.subscriptionHistory.filter(r => r && r.periodNo !== 'P2609160012' && r.periodNo !== 'P8839201948').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                    <th className="pb-3 font-semibold">扣款日期</th>
                    <th className="pb-3 font-semibold">扣款項目 / 類型</th>
                    <th className="pb-3 font-semibold">委託單號 / 授權碼</th>
                    <th className="pb-3 font-semibold">電子發票號碼</th>
                    <th className="pb-3 font-semibold">金額</th>
                    <th className="pb-3 font-semibold">贈送點數</th>
                    <th className="pb-3 font-semibold text-right">狀態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {member.subscriptionHistory
                    .filter(r => r && r.periodNo !== 'P2609160012' && r.periodNo !== 'P8839201948')
                    .map((record, idx) => (
                    <tr key={record.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                        {record.date}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {record.planName || currentPlanName}
                          </span>
                          {record.type === 'initial' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              首期授權
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              次期自動扣款
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <div>{record.periodNo || member?.subscriptionPeriodNo || '-'}</div>
                        <div className="text-[10px] text-slate-400">授權: {record.authCode}</div>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {record.invoiceNumber}
                      </td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        NT$ {record.amount}
                      </td>
                      <td className="py-3 font-bold text-amber-600 dark:text-amber-400">
                        +{record.pointsAwarded || Math.floor(record.amount * 1.5)} 點
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          扣款成功
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">尚無定期定額扣款歷史紀錄</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                線上完成藍新金流定期定額開通後，各期自動扣款與電子發票將即時記錄在此處。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 變更方案 (Change Plan - INLINE ON PAGE, NO MODAL)              */}
      {/* ========================================================================= */}
      <div id="change-plan-section" className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              {hasPlan ? '變更或升級方案 (即時線上切換)' : '選擇 VIP 創客訂閱方案 (藍新金流信用卡定期定額)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {hasPlan
                ? '您可隨時升級或轉換方案，未用完天數將自動累加轉換，立即生效無需等待。'
                : '首期信用卡線上授權扣款成功後立即開通 VIP 尊榮權益，次期按週期自動扣款無中斷，隨時可停止！'}
            </p>
          </div>

          {selectedChangePlan && (
            <button
              onClick={() => setSelectedChangePlan(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer self-start sm:self-auto"
            >
              取消選取
            </button>
          )}
        </div>

        {/* Plan Cards Grid */}
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
                    ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                    : isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer'
                }`}
              >
                {/* Header Tag / Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {plan.duration}
                  </span>
                  {isCurrent ? (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      當前使用中
                    </span>
                  ) : plan.badge ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      NT$ {plan.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      NT$ {plan.originalPrice}
                    </span>
                  </div>

                  {/* Perks */}
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-5 border-t border-slate-200/60 dark:border-slate-800 pt-3">
                    {plan.perks.slice(0, 3).map((perk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Bottom CTA Button */}
                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 rounded-xl">
                    正在享受此方案
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSelected) {
                        handleConfirmPlanChange(plan);
                      } else {
                        setSelectedChangePlan(plan);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                        : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                    }`}
                  >
                    <span>{isSelected ? '前往藍新金流扣款' : (hasPlan ? '切換至此方案' : '立即選取方案')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* INLINE CONFIRMATION PANEL (NO MODAL!) */}
        <AnimatePresence>
          {selectedChangePlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-slate-900 dark:to-indigo-950/40 rounded-2xl p-5 sm:p-6 border border-indigo-200 dark:border-indigo-800 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      確認變更方案至：{selectedChangePlan.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      週期扣款金額 NT$ {selectedChangePlan.price} / {selectedChangePlan.duration}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/60 space-y-2 mb-4 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>當前方案：</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPlanName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>新方案週期：</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedChangePlan.frequencyLabel} (+{selectedChangePlan.durationDays} 天)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>額外加贈創客點數：</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">+{Math.floor(selectedChangePlan.durationDays * 1.5)} 點 G-Coin</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>應付金額：</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-base">NT$ {selectedChangePlan.price}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={isChangingPlan}
                    onClick={() => handleConfirmPlanChange(selectedChangePlan)}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPlan ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>連線藍新金流 Period 閘道中...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>前往藍新金流授權定期定額 (首期 NT$ {selectedChangePlan.price}，次期自動扣款)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChangePlan(null)}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  點擊將直接導向藍新金流 (NewebPay) 官方加密網頁完成信用卡 3D 授權。建立委託後由藍新週期發動扣款，無須手動重複繳費。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 取消訂閱管理 (Cancel Subscription - INLINE ON PAGE, NO MODAL)  */}
      {/* ========================================================================= */}
      {hasPlan && (
        <div id="cancel-subscription-section" className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              取消訂閱與自動續費設定
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              您可以隨時停止未來的自動扣款。取消後，您本期已付費的 VIP 權益與點數仍可完整使用至週期結束。
            </p>
          </div>

          {isCancelled ? (
            <button
              onClick={handleResumeSubscription}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              恢復自動續約
            </button>
          ) : (
            <button
              onClick={() => setShowCancelSection(!showCancelSection)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-colors border border-rose-200 dark:border-rose-800 shrink-0 cursor-pointer"
            >
              {showCancelSection ? '收合取消設定' : '取消下期自動訂閱'}
            </button>
          )}
        </div>

        {/* Current status display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">目前自動續約狀態：</span>
            {isCancelled ? (
              <span className="font-bold text-amber-600 dark:text-amber-400">已停止下期自動扣款（權益至 {expiryDate.toISOString().slice(0, 10)} 截止）</span>
            ) : (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">已啟用（將於 {expiryDate.toISOString().slice(0, 10)} 依方案自動續約）</span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            扣款管道：藍新金流 (NewebPay) 安全 SSL 加密扣款機制，隨時掌握訂單明細。
          </p>
        </div>

        {/* INLINE CANCELLATION FLOW (NO MODAL!) */}
        <AnimatePresence>
          {showCancelSection && !isCancelled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 overflow-hidden"
            >
              <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-rose-950 dark:text-rose-200">
                      確定要取消未來的自動續約嗎？
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-300">
                      我們非常重視每一位創客的體驗，請確認以下權益保留說明：
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-rose-100 dark:border-rose-900/50 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>權益不中斷</strong>：您的全館 95 折優惠將完整維持至 <strong>{expiryDate.toISOString().slice(0, 10)}</strong>，剩餘的 <strong>{daysRemaining} 天</strong> 內依然有效。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>點數永久保留</strong>：您現有的 <strong>{member?.points || 0} 點 G-Coin</strong> 不會失效，可隨時在商城全額折抵。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>期滿後調整</strong>：到期後系統將不再向您的藍新金流進行自動扣款，並恢復為一般創客會員。</span>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    請協助告訴我們取消的原因（有助於我們改進耗材服務）：
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                      placeholder="請輸入其他原因..."
                      value={otherReasonText}
                      onChange={(e) => setOtherReasonText(e.target.value)}
                      className="w-full mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleConfirmCancellation}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    確認停止下期自動續訂
                  </button>
                  <button
                    onClick={() => setShowCancelSection(false)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    保留我的訂閱 (返回)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* FAQ & Support section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          訂閱常見問答 (FAQ)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Q: 取消訂閱後，我剩下的天數會退費嗎？</h4>
            <p>訂閱費用一旦扣款即生效，取消時系統不會立即退費，但會保留您所有的 VIP 95 折與雙倍累點權益直到該週期結束，期間完全不受影響。</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Q: 如果我中途變更方案，時間會怎麼計算？</h4>
            <p>線上直接切換新方案時，系統會將新方案天數累加至您目前的剩餘天數之後，並立即享有新方案的全部特權與贈點。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
