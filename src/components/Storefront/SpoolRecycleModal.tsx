import React, { useState } from 'react';
import {
  X,
  Recycle,
  Coins,
  Truck,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Package,
  Award,
  Leaf
} from 'lucide-react';
import { MemberProfile } from '../../types';

interface SpoolRecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  onRewardPoints: (points: number) => void;
}

export const SpoolRecycleModal: React.FC<SpoolRecycleModalProps> = ({
  isOpen,
  onClose,
  member,
  onRewardPoints,
}) => {
  if (!isOpen) return null;

  const [spoolCount, setSpoolCount] = useState<number>(4);
  const [spoolMaterial, setSpoolMaterial] = useState<'cardboard' | 'plastic' | 'mixed'>('mixed');
  const [returnMethod, setReturnMethod] = useState<'7-11_ibon' | 'post_office'>('7-11_ibon');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recycleTrackingCode, setRecycleTrackingCode] = useState('');

  // 50 points per spool returned!
  const earnedPoints = spoolCount * 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `ECO-${Math.floor(100000 + Math.random() * 900000)}`;
    setRecycleTrackingCode(code);
    onRewardPoints(earnedPoints);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/80 border border-emerald-400/40 text-emerald-200 flex items-center justify-center shadow-lg">
              <Recycle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  神狗勾創客空盤綠色回收計畫
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-0.5">
                  <Leaf className="w-2.5 h-2.5" /> 永續 ESG
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                每回收 1 盤回饋 50 點創客積分 • 滿 3 盤超商寄件免運
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">空線盤回收登記成功！</h3>
                <p className="text-xs text-slate-500 mt-1">
                  已成功撥款 <span className="font-bold text-amber-600 font-mono">+{earnedPoints} 點創客積分</span> 至您的帳戶！
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">超商寄件專屬代碼：</span>
                  <span className="font-mono font-bold text-indigo-600">{recycleTrackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">預計回收盤數：</span>
                  <span className="font-bold text-slate-800">{spoolCount} 卷空線盤</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">寄送方式：</span>
                  <span className="font-medium text-slate-800">
                    {returnMethod === '7-11_ibon' ? '7-ELEVEN ibon 免費列印託運單' : '中華郵政便利包回郵'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                請將空盤裝箱後前往全台 7-11 門市 ibon 輸入此代碼列印寄件單，交給店員即可寄送！
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                完成並返回商城
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-emerald-950 leading-relaxed">
                  感謝您參與綠色 3D 列印循環經濟！我們將空盤經過高溫殺菌、質檢與重新捲繞使用，減少塑膠與紙漿浪費。
                </p>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                  <span>本次預計回收空盤數量：</span>
                  <span className="font-mono text-emerald-600 font-bold text-sm">{spoolCount} 盤</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={spoolCount}
                  onChange={(e) => setSpoolCount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>最少 3 盤 (起寄門檻)</span>
                  <span>10 盤</span>
                  <span>20 盤</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">空盤材質類型：</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cardboard', name: '環保硬紙盤' },
                    { id: 'plastic', name: '工程塑膠盤' },
                    { id: 'mixed', name: '綜合混合盤' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSpoolMaterial(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        spoolMaterial === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">寄回方式：</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnMethod('7-11_ibon')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnMethod === '7-11_ibon'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">7-ELEVEN ibon 代碼</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">全台門市機台印單 (神狗勾負擔運費)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnMethod('post_office')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnMethod === 'post_office'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">中華郵政到府收件</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">適合滿 10 盤以上大量回收</div>
                  </button>
                </div>
              </div>

              {/* Point Reward Calculation Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-600 font-medium">預計入帳會員積分：</div>
                  <div className="text-[11px] text-slate-400">相當於 NT$ {earnedPoints} 購物金折抵</div>
                </div>
                <div className="text-2xl font-black font-mono text-amber-700">
                  +{earnedPoints} <span className="text-xs font-normal">pt</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>立即提交回收申請並領取積分</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
