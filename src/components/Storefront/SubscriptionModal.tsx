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
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SUBSCRIPTION_PLANS } from '../../data/mockData';
import { SubscriptionPlan, CurrencyCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [frequency, setFrequency] = useState<'monthly' | 'bimonthly'>('monthly');
  const [preferredMaterial, setPreferredMaterial] = useState('High-Speed PLA + PETG');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <CalendarCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">VIP 耗材月配訂閱俱樂部</h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2 py-0.5 rounded-full">
                  享 85 折 + 全免運
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                每個月或每雙月自動送達最新鮮的防潮真空耗材，創作永不斷線！
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isSubscribed ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-slate-900">恭喜成為 VIP 創客訂閱會員！</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                您的第一期【{selectedPlan.name}】已排程出貨，預計將於 3 個工作天內由黑貓專車直送到府。
                您可在個人中心隨時調整配送耗材顏色或暫停出貨。
              </p>
              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  確認並返回商城
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Plan Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{plan.name}</h4>
                        <div className="mt-2 mb-3">
                          <span className="text-xl font-black text-emerald-700 font-mono">
                            {formatPrice(plan.pricePerMonth, currency)}
                          </span>
                          <span className="text-xs text-slate-500"> /月 ({plan.spoolsCount} 卷)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{plan.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-[11px] text-slate-700">
                        {plan.perks.slice(0, 3).map((perk, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preferences Configuration */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  客製化您的首期配送喜好：
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      首選耗材配比組合
                    </label>
                    <select
                      value={preferredMaterial}
                      onChange={(e) => setPreferredMaterial(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="High-Speed PLA + PETG">經典雙霸：極速 PLA + 高抗衝擊 PETG</option>
                      <option value="All PLA High-Speed">極速狂飆：全 High-Speed PLA (黑/白/灰)</option>
                      <option value="Carbon Fiber Combo">硬派創客：PLA-CF 碳纖維複合 + 備用噴嘴</option>
                      <option value="Surprise Mystery Box">盲盒驚喜：由神狗勾官方工程師親選限定色</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      配送週期
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFrequency('monthly')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                          frequency === 'monthly'
                            ? 'border-emerald-600 bg-emerald-100/50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        每月固定配送 (最推薦)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrequency('bimonthly')}
                        className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                          frequency === 'bimonthly'
                            ? 'border-emerald-600 bg-emerald-100/50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        每雙月配送一次
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscribe CTA Button */}
              <div className="pt-2">
                <button
                  id="subscribe-confirm-btn"
                  type="button"
                  onClick={handleSubscribe}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <span>立即開啟訂閱【{selectedPlan.name}】 ({formatPrice(selectedPlan.pricePerMonth, currency)}/月)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  隨時可以在會員中心免費取消或更改配送週期，無任何違約金。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
