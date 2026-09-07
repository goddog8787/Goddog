import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Coins, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Award, 
  Zap 
} from 'lucide-react';
import { MemberProfile, CurrencyCode } from '../../types';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  currency: CurrencyCode;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  member,
  currency,
}) => {
  if (!isOpen) return null;
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://printhub.3d/join?ref=${member.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextTierNeeded = 20000;
  const progressToNextTier = Math.min(100, Math.round((member.totalSpent / nextTierNeeded) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Crown className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold">{member.name}</h3>
                <span className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full text-xs">
                  {member.tier} 黃金創客
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">累積消費 NT$ {member.totalSpent.toLocaleString()} 元</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Points Balance Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800">現有可用會員積分</span>
              <div className="text-3xl font-black font-mono text-amber-900 mt-1 flex items-baseline gap-1">
                <span>{member.points}</span>
                <span className="text-sm font-normal text-amber-700">pt</span>
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">
                約可折抵現金 <strong className="font-mono">NT$ {member.points}</strong> 元 (無門檻折抵)
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-700 flex items-center justify-center">
              <Coins className="w-7 h-7" />
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">晉升至【Diamond 鑽石極客】等級進度</span>
              <span className="text-indigo-600 font-mono">{progressToNextTier}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToNextTier}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              再消費 NT$ {(nextTierNeeded - member.totalSpent).toLocaleString()} 即可解鎖「全館終身免運 + 3倍積分回饋」！
            </p>
          </div>

          {/* Member Privileges List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              當前黃金創客專屬禮遇
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">消費每滿 $10 贈 1 點</div>
                  <div className="text-[10px] text-slate-500">積分無使用期限</div>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">生日當月加贈 500 點</div>
                  <div className="text-[10px] text-slate-500">現折 NT$500 購物金</div>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">新限定色優先預購權</div>
                  <div className="text-[10px] text-slate-500">提早 48 小時鎖定</div>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">無限制 AI 切片顧問</div>
                  <div className="text-[10px] text-slate-500">工程師一對一排查</div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                推薦好友創客加入，雙方各得 100 點！
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://printhub.3d/join?ref=${member.referralCode}`}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
              />
              <button
                onClick={handleCopyReferral}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製' : '複製'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
