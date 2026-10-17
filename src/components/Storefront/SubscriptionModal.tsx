import React, { useState } from 'react';
import { 
  X, 
  CalendarCheck, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Gift, 
  ArrowRight,
  Package,
  Layers,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode, CurrencyCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

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
        duration: '1 Month',
        price: 99,
        originalPrice: 150,
        badge: '',
        type: 'Monthly',
        days: 30
      },
      {
        id: 'vip-quarterly',
        name: 'Quarterly VIP',
        duration: '3 Months',
        price: 279,
        originalPrice: 450,
        badge: 'Popular $93/mo',
        type: 'Quarterly',
        days: 90
      },
      {
        id: 'vip-yearly',
        name: 'Annual VIP',
        duration: '12 Months',
        price: 990,
        originalPrice: 1800,
        badge: 'Best Value $82/mo',
        type: 'Annual',
        days: 365
      }
    ];
  }
  if (lang === 'ja') {
    return [
      {
        id: 'vip-monthly',
        name: '月額 VIP',
        duration: '1ヶ月',
        price: 99,
        originalPrice: 150,
        badge: '',
        type: '月額',
        days: 30
      },
      {
        id: 'vip-quarterly',
        name: '季額 VIP',
        duration: '3ヶ月',
        price: 279,
        originalPrice: 450,
        badge: '人気 $93/月',
        type: '季額',
        days: 90
      },
      {
        id: 'vip-yearly',
        name: '年額 VIP',
        duration: '12ヶ月',
        price: 990,
        originalPrice: 1800,
        badge: '最得 $82/月',
        type: '年額',
        days: 365
      }
    ];
  }
  return [
    {
      id: 'vip-monthly',
      name: '月卡 VIP',
      duration: '1 個月',
      price: 99,
      originalPrice: 150,
      badge: '',
      type: '月卡',
      days: 30
    },
    {
      id: 'vip-quarterly',
      name: '季卡 VIP',
      duration: '3 個月',
      price: 279,
      originalPrice: 450,
      badge: '熱銷 93/月',
      type: '季卡',
      days: 90
    },
    {
      id: 'vip-yearly',
      name: '年卡 VIP',
      duration: '12 個月',
      price: 990,
      originalPrice: 1800,
      badge: '最划算 82/月',
      type: '年卡',
      days: 365
    }
  ];
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  member,
  setMember,
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
      // Create a payload for NewebPay
      const payload = {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.price,
        days: selectedPlan.days,
        email: member?.email || 'customer@gmail.com',
        type: selectedPlan.type
      };

      const res = await fetch(window.location.origin + '/api/payment/vip-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success && (data.formParams || data.formHtml)) {
        if (data.url && data.formParams) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.url;
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
          return;
        } else if (data.formHtml) {
          const div = document.createElement('div');
          div.innerHTML = data.formHtml;
          document.body.appendChild(div);
          const form = div.querySelector('form');
          if (form) {
            if (window.self !== window.top) {
              form.target = '_blank';
            }
            form.submit();
            return;
          }
        }
      } else {
        throw new Error(data.message || (lang === 'en' ? 'Payment gateway connection failed, please try again.' : lang === 'ja' ? '決済ゲートウェイの接続に失敗しました。後ほど再試行してください。' : '藍新金流連線失敗，請稍後再試。'));
      }

    } catch (e) {
       console.error("VIP Checkout error", e);
       setErrorMessage(e instanceof Error ? e.message : (lang === 'en' ? 'Error connecting to payment gateway, please retry.' : lang === 'ja' ? '決済ゲートウェイ接続中に異常が発生しました。' : '連線藍新金流發生異常，請稍後重試。'));
       setIsProcessing(false);
    }
  };

  const isSubscribed = member?.subscriptionPlan && member?.subscriptionPlan !== 'None';
  let expiryText = '';
  if (isSubscribed && member?.subscriptionExpiry) {
      const expDate = new Date(member.subscriptionExpiry);
      const today = new Date();
      const diffTime = Math.abs(expDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expiryText = lang === 'en'
        ? `${diffDays} days remaining (${expDate.toLocaleDateString()})`
        : lang === 'ja'
        ? `残り ${diffDays} 日 (${expDate.toLocaleDateString()})`
        : `剩餘 ${diffDays} 天 (${expDate.toLocaleDateString()})`;
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white pt-10 pb-5 px-5 sm:p-8 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg border border-amber-300/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                {lang === 'en' ? 'Maker VIP Club' : lang === 'ja' ? 'メイカー VIP クラブ' : '創客 VIP 俱樂部'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
                {lang === 'en' ? 'Join VIP for 5% off storewide and exclusive member privileges' : lang === 'ja' ? 'VIP加入で全品5%OFF＆限定プレミアム特典を即時適用' : '加入 VIP，立享全館 95折優惠與專屬尊榮權益'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 flex-1 bg-slate-50">
          {isSubscribed ? (
             <div className="bg-gradient-to-br from-amber-100 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                   <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-amber-900 mb-2">
                  {lang === 'en' ? `You are a VIP Member (${member.subscriptionPlan})` : lang === 'ja' ? `あなたはVIP会員です (${member.subscriptionPlan})` : `您已是尊榮 ${member.subscriptionPlan} 會員`}
                </h3>
                <p className="text-amber-700 font-bold mb-4">
                   {lang === 'en' ? `Benefits Active, Expiry: ${expiryText}` : lang === 'ja' ? `会員特典有効中、有効期限：${expiryText}` : `會員權益已啟用，到期日：${expiryText}`}
                </p>
                <div className="text-sm text-amber-800/80 max-w-md mx-auto">
                   {lang === 'en' ? 'Enjoy 5% storewide discount automatically and earn double G-Coin reward points on all purchases.' : lang === 'ja' ? '全品5%OFFが自動適用され、お買い物ごとに2倍のG-Coinポイントを獲得できます。' : '現在購買全館耗材皆可自動享有 95 折優惠，並於結帳時賺取雙倍狗勾幣。'}
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Benefits */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-500" />
                    {lang === 'en' ? 'VIP Exclusive Privileges' : lang === 'ja' ? 'VIP限定特典' : 'VIP 專屬權益 (不過度補貼)'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {lang === 'en' ? '5% OFF Storewide' : lang === 'ja' ? '全フィラメント 5% OFF' : '全館耗材 95 折'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lang === 'en' ? 'Automatic 5% member discount on every order for worry-free printing.' : lang === 'ja' ? '毎回の注文で自動的に5%割引が適用され、コストを気にせず造形を楽しめます。' : '每筆訂單自動享有 5% 的專屬折扣，讓您安心列印不虧錢。'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {lang === 'en' ? '2x Reward Points' : lang === 'ja' ? 'ポイント2倍還元' : '點數雙倍回饋'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lang === 'en' ? 'Earn 2x G-Coin points on every purchase to redeem on future orders.' : lang === 'ja' ? '注文ごとに2倍のG-Coinポイントを獲得し、次回の決済でお得に割引。' : '每筆訂單賺取 2 倍 G-Coin 點數，下次結帳折抵更有感。'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {lang === 'en' ? 'VIP Gold Badge' : lang === 'ja' ? 'VIPゴールドバッジ' : '尊爵金星徽章'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lang === 'en' ? 'Exclusive golden badge animation on profile, showcasing your elite maker status.' : lang === 'ja' ? 'プロフィールに光る限定ゴールドバッジで特別なメイカーの証。' : '專屬個人頁面金星動畫徽章，展現與眾不同的創客身份。'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Plans */}
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-4">
                  {lang === 'en' ? 'Choose Plan' : lang === 'ja' ? 'プランを選択' : '選擇訂閱方案'}
                </h3>
                <div className="space-y-3">
                  {vipPlans.map(plan => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedPlan.id === plan.id 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan.id === plan.id ? 'border-indigo-600' : 'border-slate-300'
                        }`}>
                          {selectedPlan.id === plan.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-bold text-slate-800">{plan.name} ({plan.duration})</h4>
                             {plan.badge && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm">
                                  {plan.badge}
                                </span>
                             )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs text-slate-400 line-through">{formatPrice(plan.originalPrice, currency)}</span>
                             <span className="font-black text-indigo-600 text-lg">{formatPrice(plan.price, currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-slate-100 rounded-xl p-4">
                   {errorMessage && (
                     <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                       {errorMessage}
                     </div>
                   )}
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-600 text-sm font-medium">
                        {lang === 'en' ? 'Total Amount' : lang === 'ja' ? '合計金額' : '應付總額'}
                      </span>
                      <span className="text-2xl font-black text-slate-800">{formatPrice(selectedPlan.price, currency)}</span>
                   </div>
                   <button
                     onClick={handleCheckout}
                     disabled={isProcessing}
                     className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isProcessing ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <CreditCard className="w-5 h-5" />
                     )}
                     <span>
                       {isProcessing 
                         ? (lang === 'en' ? 'Connecting to payment gateway...' : lang === 'ja' ? '決済ゲートウェイ接続中...' : '連線藍新金流...')
                         : (lang === 'en' ? 'Proceed to Secure Checkout' : lang === 'ja' ? '安全な決済ページへ進む' : '前往藍新金流結帳')}
                     </span>
                   </button>
                   <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                     {lang === 'en' 
                       ? 'You will be redirected to NewebPay encrypted checkout page' 
                       : lang === 'ja' 
                       ? '暗号化された安全なNewebPay決済ページへ遷移します' 
                       : '點擊將導向第三方藍新金流 (NewebPay) 加密支付頁面'}
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
