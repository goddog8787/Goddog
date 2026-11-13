import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Package,
  CreditCard,
  Truck
} from 'lucide-react';
import { LanguageCode, CurrencyCode } from '../../types';
import { formatPrice } from '../../utils/i18n';
import { createClientNewebPayPeriodCheckout } from '../../lib/newebpayClient';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  setMember: (m: any) => void;
  lang?: LanguageCode;
  currency?: CurrencyCode;
}

const getVipPlans = (lang: LanguageCode = 'zh-TW') => {
  if (lang === 'en') {
    return [
      {
        id: 'vip-monthly',
        name: 'Monthly VIP',
        duration: '30 Days',
        price: 99,
        badge: 'Flexible',
        type: 'Monthly',
        days: 30,
        perMonthText: 'NT$ 99 / mo'
      },
      {
        id: 'vip-quarterly',
        name: 'Quarterly VIP',
        duration: '90 Days',
        price: 279,
        badge: 'Popular',
        type: 'Quarterly',
        days: 90,
        perMonthText: 'NT$ 93 / mo'
      },
      {
        id: 'vip-yearly',
        name: 'Annual VIP',
        duration: '365 Days',
        price: 990,
        badge: 'Best Value',
        type: 'Annual',
        days: 365,
        perMonthText: 'NT$ 82 / mo'
      }
    ];
  }
  if (lang === 'ja') {
    return [
      {
        id: 'vip-monthly',
        name: '月額 VIP',
        duration: '30日',
        price: 99,
        badge: '手軽',
        type: '月額',
        days: 30,
        perMonthText: '月あたり NT$ 99'
      },
      {
        id: 'vip-quarterly',
        name: '季額 VIP',
        duration: '90日',
        price: 279,
        badge: '人気',
        type: '季額',
        days: 90,
        perMonthText: '月あたり NT$ 93'
      },
      {
        id: 'vip-yearly',
        name: '年額 VIP',
        duration: '365日',
        price: 990,
        badge: '最得',
        type: '年額',
        days: 365,
        perMonthText: '月あたり NT$ 82'
      }
    ];
  }
  return [
    {
      id: 'vip-monthly',
      name: '月卡 VIP',
      duration: '30 天',
      price: 99,
      badge: '靈活體驗',
      type: '月卡',
      days: 30,
      perMonthText: '平均 NT$ 99 / 月'
    },
    {
      id: 'vip-quarterly',
      name: '季卡 VIP',
      duration: '90 天',
      price: 279,
      badge: '熱門首選',
      type: '季卡',
      days: 90,
      perMonthText: '平均 NT$ 93 / 月'
    },
    {
      id: 'vip-yearly',
      name: '年卡 VIP',
      duration: '365 天',
      price: 990,
      badge: '最超值',
      type: '年卡',
      days: 365,
      perMonthText: '平均 NT$ 82 / 月'
    }
  ];
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  member,
  lang = 'zh-TW' as LanguageCode,
  currency = 'TWD' as CurrencyCode,
}) => {
  const vipPlans = getVipPlans(lang);
  const [selectedPlan, setSelectedPlan] = useState(vipPlans[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const payload = {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        days: selectedPlan.days,
        email: member?.email || 'customer@gmail.com',
        type: selectedPlan.type
      };

      let checkoutData: { url: string; formParams: Record<string, string> } | null = null;

      try {
        const res = await fetch(window.location.origin + '/api/payment/vip-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url && data.formParams) {
            checkoutData = { url: data.url, formParams: data.formParams };
          } else if (data.success && data.formHtml) {
            const div = document.createElement('div');
            div.innerHTML = data.formHtml;
            document.body.appendChild(div);
            const form = div.querySelector('form');
            if (form) {
              if (window.self !== window.top) form.target = '_blank';
              form.submit();
              return;
            }
          }
        }
      } catch (networkErr) {
        console.warn('[VIP Checkout] 使用前端藍新加密模組:', networkErr);
      }

      if (!checkoutData) {
        checkoutData = createClientNewebPayPeriodCheckout({
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          price: selectedPlan.price,
          days: selectedPlan.days,
          email: member?.email || 'customer@gmail.com',
        });
      }

      if (checkoutData && checkoutData.formParams) {
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
        return;
      } else {
        throw new Error('藍新金流連線失敗，請稍後再試。');
      }
    } catch (e) {
      console.error('VIP Checkout error', e);
      setErrorMessage(e instanceof Error ? e.message : '連線藍新金流發生異常，請稍後重試。');
      setIsProcessing(false);
    }
  };

  const isSubscribed = member?.subscriptionPlan && member?.subscriptionPlan !== 'None';
  let expiryText = '';
  if (isSubscribed && member?.subscriptionExpiry) {
    const expDate = new Date(member.subscriptionExpiry);
    const today = new Date();
    const diffTime = Math.max(0, expDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    expiryText = lang === 'en'
      ? `${diffDays} days left`
      : lang === 'ja'
      ? `残り ${diffDays} 日`
      : `剩餘 ${diffDays} 天`;
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Compact Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-balance">
                {lang === 'en' ? 'Maker VIP Club' : lang === 'ja' ? 'メイカー VIP クラブ' : '創客 VIP 會員方案'}
              </h2>
              <p className="text-slate-300 text-xs mt-0.5 truncate">
                {lang === 'en' ? '5% OFF storewide • 2x Points • Priority Dispatch' : lang === 'ja' ? '全館95折・ポイント2倍・優先発送' : '全館 95 折 · 雙倍積分 · 專屬徽章'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 bg-slate-50 dark:bg-slate-950">
          {isSubscribed ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-900 rounded-2xl p-6 text-center border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-black text-amber-900 dark:text-amber-300 text-balance">
                您已是尊榮 {member.subscriptionPlan} 會員
              </h3>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 text-pretty">
                會員效期：{expiryText} · 結帳自動享 95 折與 2 倍積分
              </p>
            </div>
          ) : (
            <>
              {/* 4 Compact Benefit Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white text-balance line-clamp-1">全館 95 折</div>
                    <div className="text-[10px] text-slate-500 text-pretty line-clamp-1">結帳自動折抵</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white text-balance line-clamp-1">雙倍狗勾幣</div>
                    <div className="text-[10px] text-slate-500 text-pretty line-clamp-1">2x 點數回饋</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white text-balance line-clamp-1">金星徽章</div>
                    <div className="text-[10px] text-slate-500 text-pretty line-clamp-1">尊榮身份標識</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white text-balance line-clamp-1">優先揀貨</div>
                    <div className="text-[10px] text-slate-500 text-pretty line-clamp-1">專屬快速通道</div>
                  </div>
                </div>
              </div>

              {/* 3 Clean Plan Cards (Side-by-Side on Desktop, Compact Stack on Mobile) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {vipPlans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex sm:flex-col justify-between items-center sm:items-start gap-2 relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex sm:w-full items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-slate-900 dark:text-white text-balance">{plan.name}</span>
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">({plan.duration})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 text-pretty">{plan.perMonthText}</div>
                        </div>
                        {plan.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <div className="sm:mt-3 sm:pt-2.5 sm:border-t sm:border-slate-200/70 dark:sm:border-slate-800 sm:w-full flex items-baseline justify-between">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-xl font-mono">
                          {formatPrice(plan.price, currency)}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Checkout Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                {errorMessage && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">已選方案：{selectedPlan.name}</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {formatPrice(selectedPlan.price, currency)}
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>{isProcessing ? '連線藍新金流...' : '立即開通 VIP'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
