import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Power, 
  Sparkles, 
  Percent, 
  DollarSign, 
  Truck, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Calculator,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { StoreCoupon } from '../../types';
import { 
  getStoreCoupons, 
  saveStoreCoupons, 
  validateCoupon, 
  CouponApplyResult 
} from '../../utils/couponManager';

export const CouponPromotionManager: React.FC = () => {
  const [coupons, setCoupons] = useState<StoreCoupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<StoreCoupon | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage');
  const [formValue, setFormValue] = useState<number>(10);
  const [formMinSpend, setFormMinSpend] = useState<number>(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number>(0);
  const [formUsageLimit, setFormUsageLimit] = useState<number>(0);
  const [formExpiryDate, setFormExpiryDate] = useState<string>('');
  const [formTargetTier, setFormTargetTier] = useState<'all' | 'vip'>('all');
  const [formIsActive, setFormIsActive] = useState(true);

  // Interactive Test Simulator
  const [simCode, setSimCode] = useState('GODDOG');
  const [simAmount, setSimAmount] = useState(1200);
  const [simIsVip, setSimIsVip] = useState(false);
  const [simResult, setSimResult] = useState<CouponApplyResult | null>(null);

  useEffect(() => {
    setCoupons(getStoreCoupons());
    const handleUpdate = () => setCoupons(getStoreCoupons());
    window.addEventListener('printcore_coupons_updated', handleUpdate);
    return () => window.removeEventListener('printcore_coupons_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`✅ 已複製折扣碼：${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    const updated = coupons.map((c) => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setCoupons(updated);
    saveStoreCoupons(updated);
    showToast('狀態已成功更新！');
  };

  const handleDeleteCoupon = (id: string) => {
    if (!window.confirm('確定要刪除這張優惠券嗎？此動作無法復原。')) return;
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    saveStoreCoupons(updated);
    showToast('優惠券已刪除');
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormTitle('');
    setFormType('percentage');
    setFormValue(10);
    setFormMinSpend(0);
    setFormMaxDiscount(0);
    setFormUsageLimit(0);
    setFormExpiryDate('');
    setFormTargetTier('all');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: StoreCoupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormTitle(coupon.title);
    setFormType(coupon.discountType);
    setFormValue(coupon.discountValue);
    setFormMinSpend(coupon.minSpend || 0);
    setFormMaxDiscount(coupon.maxDiscount || 0);
    setFormUsageLimit(coupon.usageLimit || 0);
    setFormExpiryDate(coupon.expiryDate || '');
    setFormTargetTier(coupon.targetTier === 'vip' ? 'vip' : 'all');
    setFormIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const applyPreset = (preset: 'welcome10' | 'spend1000' | 'freeship' | 'vip200') => {
    if (preset === 'welcome10') {
      setFormCode('NEWMAKER10');
      setFormTitle('新創客首購 9 折優惠');
      setFormType('percentage');
      setFormValue(10);
      setFormMinSpend(0);
      setFormMaxDiscount(300);
    } else if (preset === 'spend1000') {
      setFormCode('SAVE100');
      setFormTitle('滿千現折 NT$ 100');
      setFormType('fixed');
      setFormValue(100);
      setFormMinSpend(1000);
    } else if (preset === 'freeship') {
      setFormCode('FREEGO');
      setFormTitle('全館超商取貨免運券');
      setFormType('free_shipping');
      setFormValue(0);
      setFormMinSpend(600);
    } else if (preset === 'vip200') {
      setFormCode('VIPPRO200');
      setFormTitle('VIP 尊榮創客回饋折抵 NT$ 200');
      setFormType('fixed');
      setFormValue(200);
      setFormMinSpend(1500);
      setFormTargetTier('vip');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      alert('請填寫優惠代碼');
      return;
    }

    if (editingCoupon) {
      const updated = coupons.map((c) => {
        if (c.id === editingCoupon.id) {
          return {
            ...c,
            code: cleanCode,
            title: formTitle.trim() || `${cleanCode} 優惠`,
            discountType: formType,
            discountValue: Number(formValue),
            minSpend: Number(formMinSpend),
            maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
            usageLimit: formUsageLimit ? Number(formUsageLimit) : undefined,
            expiryDate: formExpiryDate || undefined,
            targetTier: formTargetTier,
            isActive: formIsActive,
          };
        }
        return c;
      });
      setCoupons(updated);
      saveStoreCoupons(updated);
      showToast('✅ 優惠券已成功儲存！');
    } else {
      if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
        alert(`代碼「${cleanCode}」已存在，請使用不同的代碼。`);
        return;
      }
      const newCoupon: StoreCoupon = {
        id: `c-${Date.now()}`,
        code: cleanCode,
        title: formTitle.trim() || `${cleanCode} 優惠券`,
        discountType: formType,
        discountValue: Number(formValue),
        minSpend: Number(formMinSpend),
        maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        usageLimit: formUsageLimit ? Number(formUsageLimit) : undefined,
        usedCount: 0,
        expiryDate: formExpiryDate || undefined,
        targetTier: formTargetTier,
        isActive: formIsActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newCoupon, ...coupons];
      setCoupons(updated);
      saveStoreCoupons(updated);
      showToast('🎉 新優惠券建立成功！已即時支援購物車與結帳套用。');
    }
    setIsModalOpen(false);
  };

  const handleTestSim = () => {
    const res = validateCoupon(simCode, Number(simAmount), simIsVip);
    setSimResult(res);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'active') return matchesSearch && c.isActive;
    if (filterType === 'inactive') return matchesSearch && !c.isActive;
    if (filterType === 'percent') return matchesSearch && c.discountType === 'percentage';
    if (filterType === 'fixed') return matchesSearch && c.discountType === 'fixed';
    if (filterType === 'free') return matchesSearch && c.discountType === 'free_shipping';
    return matchesSearch;
  });

  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter((c) => c.isActive).length;
  const totalTimesUsed = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">促銷與全館優惠券引擎</h2>
              <p className="text-xs text-slate-500">
                管理前台結帳折扣代碼、全館免運門檻、VIP 專屬券，即時同步至購物車計算引擎
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>新增優惠券</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">有效流通優惠券</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeCouponsCount}</span>
            <span className="text-xs text-slate-500">/ 總計 {totalCouponsCount} 張</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">累計折抵使用次數</span>
            <Ticket className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{totalTimesUsed}</span>
            <span className="text-xs text-slate-500">次顧客結帳</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">前台即時驗證機制</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              即刻生效 (無延遲)
            </span>
            <p className="text-[11px] text-slate-400 mt-1">結帳頁面與購物車側欄即時聯動</p>
          </div>
        </div>
      </div>

      {/* Rule Verification Card: Interactive Coupon Validation */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold">優惠代碼規則檢驗器 (即時核驗)</h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          輸入優惠代碼與結帳金額，即時檢驗其啟用狀態、折抵金額與消費門檻規則。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">優惠券代碼 (Code)</label>
            <input
              type="text"
              value={simCode}
              onChange={(e) => setSimCode(e.target.value.toUpperCase())}
              placeholder="例：GODDOG"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">訂單小計金額 (NT$)</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="sim-vip-check"
              checked={simIsVip}
              onChange={(e) => setSimIsVip(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="sim-vip-check" className="text-xs text-slate-300 cursor-pointer">
              買家具備 VIP 資格
            </label>
          </div>
          <button
            onClick={handleTestSim}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
          >
            檢驗代碼
          </button>
        </div>

        {simResult && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center justify-between ${
            simResult.isValid ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-200' : 'bg-rose-900/40 border border-rose-500/40 text-rose-200'
          }`}>
            <div>
              <span className="font-bold">{simResult.isValid ? '✅ 套用成功：' : '❌ 套用失敗：'}</span>
              <span>{simResult.isValid ? simResult.label : simResult.errorMessage}</span>
            </div>
            {simResult.isValid && (
              <div className="flex items-center gap-3 font-mono font-bold">
                {simResult.discountAmount > 0 && <span>現折 -NT$ {simResult.discountAmount}</span>}
                {simResult.freeShipping && <span className="text-cyan-300">免運費！</span>}
                <span className="text-slate-300">
                  實付估計: NT$ {Math.max(0, simAmount - simResult.discountAmount)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋代碼、名稱..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: '全部' },
            { id: 'active', label: '啟用中' },
            { id: 'inactive', label: '已暫停' },
            { id: 'percent', label: '％ 折扣' },
            { id: 'fixed', label: '固定折抵' },
            { id: 'free', label: '免運券' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">優惠代碼 / 標題</th>
                <th className="py-3 px-4">折扣類型</th>
                <th className="py-3 px-4">使用門檻</th>
                <th className="py-3 px-4">有效期限</th>
                <th className="py-3 px-4">已使用</th>
                <th className="py-3 px-4">狀態</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCoupons.map((coupon) => {
                const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-200 flex items-center gap-1">
                          {coupon.code}
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="複製優惠代碼"
                            className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{coupon.title}</p>
                          {coupon.targetTier === 'vip' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              VIP 專屬限定
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {coupon.discountType === 'percentage' && (
                        <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                          <Percent className="w-3.5 h-3.5" />
                          折抵 {coupon.discountValue}%
                          {coupon.maxDiscount ? ` (上限 $${coupon.maxDiscount})` : ''}
                        </span>
                      )}
                      {coupon.discountType === 'fixed' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          現折 NT$ {coupon.discountValue}
                        </span>
                      )}
                      {coupon.discountType === 'free_shipping' && (
                        <span className="inline-flex items-center gap-1 text-cyan-600 font-bold">
                          <Truck className="w-3.5 h-3.5" />
                          全館超商免運
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {coupon.minSpend > 0 ? (
                        <span>滿 NT$ {coupon.minSpend.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">無消費門檻</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {coupon.expiryDate ? (
                        <span className={`flex items-center gap-1 ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          <Calendar className="w-3 h-3" />
                          {coupon.expiryDate}
                          {isExpired && ' (已過期)'}
                        </span>
                      ) : (
                        <span className="text-slate-400">長期有效</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-700">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' 次'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(coupon.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{coupon.isActive ? '啟用中' : '已停用'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="編輯優惠券"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="刪除優惠券"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCoupon ? '編輯優惠券' : '新增全館優惠券'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            {!editingCoupon && (
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-slate-500">快速填入促銷範本：</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('welcome10')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    新客首購 9 折
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('spend1000')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    滿千折百
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('freeship')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    滿 $600 免運
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('vip200')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    VIP 現折 $200
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    優惠代碼 (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="例如：PRINT10"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    優惠券標題 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例如：夏日創客全館 9 折"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  折抵模式
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('percentage')}
                    className={`py-2 px-2 text-xs rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      formType === 'percentage'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>百分比折扣 (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('fixed')}
                    className={`py-2 px-2 text-xs rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      formType === 'fixed'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>固定折抵 (NT$)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('free_shipping')}
                    className={`py-2 px-2 text-xs rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      formType === 'free_shipping'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>超商免運費</span>
                  </button>
                </div>
              </div>

              {formType !== 'free_shipping' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {formType === 'percentage' ? '折抵百分比 (例如 15 代表 85 折)' : '折抵金額 (NT$)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formType === 'percentage' ? 99 : 5000}
                      value={formValue}
                      onChange={(e) => setFormValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {formType === 'percentage' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        最多折抵上限 (0 為不限)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formMaxDiscount}
                        onChange={(e) => setFormMaxDiscount(Number(e.target.value))}
                        placeholder="選填"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    最低消費門檻 (NT$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(Number(e.target.value))}
                    placeholder="0 代表不限金額"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    發放使用上限次數
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    placeholder="0 代表無限次使用"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    有效截止日期
                  </label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    適用會員對象
                  </label>
                  <select
                    value={formTargetTier}
                    onChange={(e: any) => setFormTargetTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">全體創客皆可使用</option>
                    <option value="vip">限 VIP 訂閱會員專屬</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="form-active-check"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="form-active-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  立即啟用此優惠券（顧客結帳時可立即生效）
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  {editingCoupon ? '儲存修改' : '立即發布優惠券'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
