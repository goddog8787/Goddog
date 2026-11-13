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
  Leaf,
  MapPin,
  Store,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MemberProfile, LanguageCode } from '../../types';
import { CvsStoreSelectorModal } from './CvsStoreSelectorModal';
import { TaiwanAddressInput } from './TaiwanAddressInput';

interface SpoolRecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  onRewardPoints: (points: number) => void;
  lang?: LanguageCode;
}

export const SpoolRecycleModal: React.FC<SpoolRecycleModalProps> = ({
  isOpen,
  onClose,
  member,
  onRewardPoints,
  lang = 'zh-TW',
}) => {
  const [spoolCount, setSpoolCount] = useState<number>(4);
  const [spoolMaterial, setSpoolMaterial] = useState<'cardboard' | 'plastic' | 'mixed'>('mixed');
  const [returnMethod, setReturnMethod] = useState<'7-11_ibon' | 'post_office'>('7-11_ibon');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recycleTrackingCode, setRecycleTrackingCode] = useState('');

  // Address and contact info
  const [contactName, setContactName] = useState(() => (member?.name && !member.name.startsWith('guest') ? member.name : ''));
  const [contactPhone, setContactPhone] = useState(member?.phone || '');
  const [pickupAddress, setPickupAddress] = useState(member?.address || '');
  const [pickupTimeSlot, setPickupTimeSlot] = useState<'any' | 'morning' | 'afternoon'>('any');
  const [selected711Store, setSelected711Store] = useState('');
  const [isCvsModalOpen, setIsCvsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 20 points per spool returned!
  const earnedPoints = spoolCount * 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (returnMethod === 'post_office') {
      if (!pickupAddress.trim()) {
        setFormError('請填寫中華郵政專差到府收件地址 (包含縣市區街巷與門牌樓層)。');
        return;
      }
      if (!contactName.trim()) {
        setFormError('請填寫收件聯絡人真實中文姓名。');
        return;
      }
      if (!contactPhone.trim() || contactPhone.trim().length < 8) {
        setFormError('請填寫有效的手機號碼，以利郵局專差到府前電聯確認。');
        return;
      }
    } else {
      if (!selected711Store.trim()) {
        setFormError('請點選「選擇 7-ELEVEN 寄件門市地址」指定您預計前往寄件的 7-11 門市。');
        return;
      }
      if (!contactName.trim()) {
        setFormError('請填寫寄件人真實姓名 (超商寄件核對身分使用)。');
        return;
      }
      if (!contactPhone.trim() || contactPhone.trim().length < 8) {
        setFormError('請填寫手機號碼，以接收 7-11 ibon 寄件專屬 8 碼代碼簡訊。');
        return;
      }
    }

    const prefix = returnMethod === '7-11_ibon' ? '711' : 'POST';
    const code = `ECO-${prefix}-${Date.now().toString().slice(-6)}`;
    setRecycleTrackingCode(code);
    onRewardPoints(earnedPoints);
    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative cursor-default select-text my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-3 border-b border-emerald-500/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/80 border border-emerald-400/40 text-emerald-200 flex items-center justify-center shadow-lg shrink-0">
              <Recycle className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-nowrap">
                <h2 className="text-base font-black text-white tracking-tight whitespace-nowrap">
                  {lang === 'en' ? 'Spool Green Recycling' : lang === 'ja' ? '空スプール回収計画' : '空盤綠色回收計畫'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-0.5 whitespace-nowrap shrink-0">
                  <Leaf className="w-2.5 h-2.5" /> ESG
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 truncate">
                {lang === 'en' 
                  ? '20 pts per spool • Free shipping on 3+ spools' 
                  : lang === 'ja' 
                  ? '1巻20pt還元・3巻以上で送料無料' 
                  : '每盤回饋 20 點積分・滿 3 盤超商免運寄回'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {lang === 'en' ? 'Recycling Registration Complete!' : lang === 'ja' ? '空スプール回収登録が完了しました！' : '空線盤回收登記成功！'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'en' 
                    ? <>Awarded <span className="font-bold text-amber-600 font-mono">+{earnedPoints} Maker Points</span> to your account!</>
                    : lang === 'ja' 
                    ? <>アカウントに <span className="font-bold text-amber-600 font-mono">+{earnedPoints} pt</span> を付与しました！</>
                    : <>已成功撥款 <span className="font-bold text-amber-600 font-mono">+{earnedPoints} 點創客積分</span> 至您的帳戶！</>}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    {returnMethod === '7-11_ibon' ? '7-11 寄件專屬代碼：' : '郵局到府收件單號：'}
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{recycleTrackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">預計回收盤數：</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{spoolCount} 卷空線盤</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">寄送方式：</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {returnMethod === '7-11_ibon' ? '7-ELEVEN ibon 免費列印託運單' : '中華郵政專差到府收件'}
                  </span>
                </div>

                {returnMethod === 'post_office' ? (
                  <>
                    <div className="flex justify-between items-start gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0">到府收件地址：</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{pickupAddress}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500 dark:text-slate-400">收件聯絡人：</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {contactName} ({contactPhone}) · {pickupTimeSlot === 'morning' ? '平日上午' : pickupTimeSlot === 'afternoon' ? '平日下午' : '不限時段'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {selected711Store && (
                      <div className="flex justify-between items-start gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">指定寄件門市：</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{selected711Store}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500 dark:text-slate-400">寄件人聯絡資訊：</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{contactName} ({contactPhone})</span>
                    </div>
                  </>
                )}
              </div>

              {returnMethod === '7-11_ibon' ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-left">
                  已將 8 碼寄件代碼發送至您的手機簡訊。請將空盤裝箱封妥後，前往全台任一 7-11 門市 ibon 機台輸入此代碼列印寄件單，交給店員即可免費寄送（運費由神狗勾全額負擔）！
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-left">
                  中華郵政專差將於 1-2 個工作天內前往您指定的地址進行包裹收件，郵差到府前將以電話先行與您聯繫確認，請預先將空盤妥善裝箱。
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'en' ? 'Done & Return to Store' : lang === 'ja' ? '完了してストアに戻る' : '完成並返回商城'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {lang === 'en' 
                    ? 'Thank you for participating in the circular 3D printing economy! Returned spools undergo high-temperature sterilization, quality checks, and winding reuse.' 
                    : lang === 'ja' 
                    ? '3Dプリント循環型エコシステムにご参加いただきありがとうございます！回収された空スプールは高温殺菌・品質検査を経て再利用されます。' 
                    : '感謝您參與綠色 3D 列印循環經濟！我們將空盤經過高溫殺菌、質檢與重新捲繞使用，減少塑膠與紙漿浪費。'}
                </p>
              </div>

              {/* Spool count slider */}
              <div>
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  <span>{lang === 'en' ? 'Number of spools to return:' : lang === 'ja' ? '回収予定スプール数：' : '本次預計回收空盤數量：'}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">{spoolCount} {lang === 'en' ? 'spools' : lang === 'ja' ? '巻' : '盤'}</span>
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
                  <span>{lang === 'en' ? 'Min 3 (Threshold)' : lang === 'ja' ? '最低3巻 (受付基準)' : '最少 3 盤 (起寄門檻)'}</span>
                  <span>10 {lang === 'en' ? 'spools' : lang === 'ja' ? '巻' : '盤'}</span>
                  <span>20 {lang === 'en' ? 'spools' : lang === 'ja' ? '巻' : '盤'}</span>
                </div>
              </div>

              {/* Material Type */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {lang === 'en' ? 'Spool Material Type:' : lang === 'ja' ? 'スプール材質：' : '空盤材質類型：'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cardboard', name: lang === 'en' ? 'Cardboard' : lang === 'ja' ? '紙製スプール' : '環保硬紙盤' },
                    { id: 'plastic', name: lang === 'en' ? 'Plastic' : lang === 'ja' ? 'プラ製スプール' : '工程塑膠盤' },
                    { id: 'mixed', name: lang === 'en' ? 'Mixed' : lang === 'ja' ? '混合' : '綜合混合盤' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSpoolMaterial(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        spoolMaterial === m.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Method */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  {lang === 'en' ? 'Return Method:' : lang === 'ja' ? '返送方法：' : '寄回方式：'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnMethod('7-11_ibon');
                      setFormError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnMethod === '7-11_ibon'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">{lang === 'en' ? '7-11 ibon Code' : lang === 'ja' ? '7-11 ibon コード' : '7-ELEVEN ibon 代碼'}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'en' ? 'Print label at 7-11 (Free shipping)' : lang === 'ja' ? '全国7-11端末で印字 (送料無料)' : '全台門市機台印單 (神狗勾負擔運費)'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReturnMethod('post_office');
                      setFormError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnMethod === 'post_office'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">{lang === 'en' ? 'Post Office' : lang === 'ja' ? '郵便局集荷' : '中華郵政到府收件'}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'en' ? 'Best for bulk 10+ spools' : lang === 'ja' ? '10巻以上の大量回収向け' : '適合滿 10 盤以上大量回收'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Address & Sender Details Section (Dynamic per selected Return Method) */}
              {returnMethod === 'post_office' ? (
                /* Post Office Doorstep Pickup Address & Contact Fields */
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <TaiwanAddressInput
                    value={pickupAddress}
                    onChange={(addr) => {
                      setPickupAddress(addr);
                      if (formError) setFormError(null);
                    }}
                    memberAddress={member?.address}
                    label="中華郵政專差到府收件地址"
                    placeholder="請輸入路名街巷、門牌號碼與樓層 (例：和平東路二段100號3樓)"
                  />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        收件聯絡人姓名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="真實姓名 (例：陳大明)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        聯絡手機號碼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="郵差電聯手機 (例：0912345678)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      期望郵差收件時段
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      {[
                        { id: 'any', label: '不限時段 (最快排件)' },
                        { id: 'morning', label: '平日上午 (09-12)' },
                        { id: 'afternoon', label: '平日下午 (14-18)' },
                      ].map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setPickupTimeSlot(slot.id as any)}
                          className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            pickupTimeSlot === slot.id
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* 7-11 ibon Drop-off Store & Sender Information */
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      7-ELEVEN 寄件門市地址與寄件人資訊
                    </span>
                    <span className="text-[10px] text-rose-500 font-medium">* 必選門市</span>
                  </div>

                  {/* 7-11 Store Selection */}
                  {selected711Store ? (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-700 flex items-start justify-between gap-2 shadow-2xs">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{selected711Store}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">至此門市 ibon 機台輸入 8 碼代碼即可免費印單寄送</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCvsModalOpen(true)}
                        className="text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        變更門市
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-2.5">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        尚未指定 7-ELEVEN 寄件門市
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        可依縣市與行政區搜尋全台 7,000+ 間 7-11 門市：
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCvsModalOpen(true)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Store className="w-4 h-4 shrink-0" />
                        <span>選擇 7-ELEVEN 寄件門市</span>
                      </button>
                      <div className="pt-1">
                        <input
                          type="text"
                          value={selected711Store}
                          onChange={(e) => {
                            setSelected711Store(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          placeholder="或直接手動輸入 7-11 門市名稱/店號/地址..."
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        寄件人真實姓名 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="真實姓名 (需核對證件)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        寄件人手機號碼 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="接收代碼簡訊 (例：0912345678)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Validation Error Alert */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Point Reward Calculation Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between">
                <div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {lang === 'en' ? 'Points to be awarded:' : lang === 'ja' ? '獲得予定ポイント：' : '預計入帳會員積分：'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? `Equivalent to NT$ ${earnedPoints} discount` : lang === 'ja' ? `NT$ ${earnedPoints} 相当の割引適用` : `相當於 NT$ ${earnedPoints} 購物金折抵`}
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                  +{earnedPoints} <span className="text-xs font-normal">pt</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? 'Submit Request & Claim Points' : lang === 'ja' ? '回収申請を送信してポイント獲得' : '立即提交回收申請並領取積分'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 7-11 In-App Store Selector Modal for Easy Drop-off Location Picking */}
      <CvsStoreSelectorModal
        isOpen={isCvsModalOpen}
        onClose={() => setIsCvsModalOpen(false)}
        targetBrand="7-11"
        initialMethod="UNIMARTC2C"
        onSelectStore={({ fullFormatted }) => {
          setSelected711Store(fullFormatted);
          setIsCvsModalOpen(false);
        }}
      />
    </div>
  );
};
