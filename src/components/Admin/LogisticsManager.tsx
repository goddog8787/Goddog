import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Save, 
  RotateCcw, 
  Store, 
  PackageCheck,
  AlertTriangle,
  Barcode
} from 'lucide-react';
import { LogisticsSettings } from '../../types';

interface LogisticsManagerProps {
  settings: LogisticsSettings;
  onSaveSettings: (newSettings: LogisticsSettings) => void;
}

export const LogisticsManager: React.FC<LogisticsManagerProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<LogisticsSettings>({ ...settings });
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: LogisticsSettings = {
      freeShippingThreshold: 999,
      shippingFee711: 60,
      shippingFeeFamilyMart: 60,
      shippingFeeBlackCat: 100,
      enableCOD: true,
      enablePrepaidCVS: true,
      enableHomeDelivery: true,
      dispatchLeadTime: '24H 現貨快速出貨 (工作日 15:00 前完成付款當日發貨)',
      packagingSpecs: '雙層鋁箔真空包裝 + 變色矽膠乾燥劑 + 防震氣柱加固',
      ecpayLogisticsMerchantId: '3002607',
      senderName: '神狗勾 3D 台灣官方物流倉',
      senderPhone: '02-2345-6789',
      senderAddress: '新北市五股區五工路 3D 耗材智能倉儲中心 A 棟',
    };
    setFormData(defaults);
    onSaveSettings(defaults);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">物流運費與配送設定已成功儲存並即時生效！</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">物流配送與運費費率管理</h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                綠界物流 C2C / B2C 介接中
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              設定全館免運費門檻、各大超商門市取貨運費、黑貓宅急便宅配費率與出貨時效承諾
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLabelModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            <span>模擬列印電子託運單</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重設預設值</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Free Shipping & Core Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free Shipping Settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <span>全館免運費門檻與促銷</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  全館免運門檻金額 (NT$)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.freeShippingThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-40 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-base font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    目前設定：單筆滿 NT$ {formData.freeShippingThreshold.toLocaleString()} 即享全館免運
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  前台連動效果：
                </div>
                顧客購物車右側抽屜將自動顯示即時「差額免運進度條 (Progress Bar)」，刺激顧客加購耗材湊免運！
              </div>
            </div>
          </div>

          {/* Core Channels & Rates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Store className="w-4 h-4" />
              </div>
              <span>各物流管道運費定價 (未達免運門檻時)</span>
            </div>

            <div className="space-y-3">
              {/* 7-11 */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#008000]/10 text-[#008000] font-black text-xs flex items-center justify-center border border-[#008000]/20">
                    7-11
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">7-ELEVEN 超商交貨便</div>
                    <div className="text-[10px] text-slate-500">本島門市取件 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFee711}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFee711: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* FamilyMart */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00A1E9]/10 text-[#00A1E9] font-black text-xs flex items-center justify-center border border-[#00A1E9]/20">
                    全家
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">全家 FamilyMart 店到店</div>
                    <div className="text-[10px] text-slate-500">本島門市取件 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeFamilyMart}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeFamilyMart: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* BlackCat */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 font-black text-xs flex items-center justify-center border border-amber-500/20">
                    黑貓
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">黑貓宅急便 專車直達</div>
                    <div className="text-[10px] text-slate-500">本島宅配到府 (最快隔日送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeBlackCat}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeBlackCat: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Payment & Delivery Options & Lead Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Delivery Method Toggles */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <PackageCheck className="w-4 h-4" />
              </div>
              <span>配送取件服務開關</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">超商取貨付款 (COD)</div>
                  <div className="text-[11px] text-slate-500">
                    顧客前往 7-11 / 全家門市取貨時，現場付現或刷卡結帳
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableCOD}
                  onChange={(e) => setFormData({ ...formData, enableCOD: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">超商純取件 (線上先付款)</div>
                  <div className="text-[11px] text-slate-500">
                    透過綠界線上信用卡 / LINE Pay 先行結帳，憑身分證件門市領貨
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enablePrepaidCVS}
                  onChange={(e) => setFormData({ ...formData, enablePrepaidCVS: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">黑貓宅急便 宅配到府</div>
                  <div className="text-[11px] text-slate-500">
                    適合量產創客、大宗 2.5kg/5kg 耗材箱裝快速直送
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableHomeDelivery}
                  onChange={(e) => setFormData({ ...formData, enableHomeDelivery: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Dispatch Policy & Packaging Protection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>出貨時效與防潮包裝承諾</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  物流出貨時效政策
                </label>
                <input
                  type="text"
                  value={formData.dispatchLeadTime}
                  onChange={(e) => setFormData({ ...formData, dispatchLeadTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  官方耗材防潮包裝規格
                </label>
                <input
                  type="text"
                  value={formData.packagingSpecs}
                  onChange={(e) => setFormData({ ...formData, packagingSpecs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong>3D 列印耗材品質守護：</strong>
                  所有出庫耗材均通過嚴格氣密鋁箔封裝檢測。若買家收到商品有受潮脆化或真空漏氣，提供 100% 免費補寄新品服務。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Warehouse & Sender Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <MapPin className="w-4 h-4" />
            </div>
            <span>出貨倉儲與超商逆物流退換貨地址</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">寄件人 / 倉儲名稱</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">倉管聯絡電話</label>
              <input
                type="text"
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">綠界物流特店代碼 (Merchant ID)</label>
              <input
                type="text"
                value={formData.ecpayLogisticsMerchantId}
                onChange={(e) =>
                  setFormData({ ...formData, ecpayLogisticsMerchantId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-600 outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-slate-800 block mb-1">
                發貨倉庫完整地址 / 逆物流退貨點
              </label>
              <input
                type="text"
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <span className="text-xs text-slate-500">
            變更將同步更新全店購物車免運判定與結帳運費計算公式
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>儲存物流與運費配置</span>
          </button>
        </div>
      </form>

      {/* Simulated Shipping Label Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600" />
                <span className="font-black text-slate-900 text-sm">電子託運單與超商寄件單 (範例)</span>
              </div>
              <button
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                關閉
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 font-mono text-[11px] space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">7-ELEVEN 交貨便 C2C</span>
                <span className="bg-slate-200 px-2 py-0.5 rounded font-bold">常溫耗材</span>
              </div>
              <div>
                <div className="text-slate-400">物流託運號：</div>
                <div className="text-base font-black tracking-wider text-slate-900">
                  771 9023 8810 42
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400">寄件人：</span>
                  <div className="font-bold">{formData.senderName}</div>
                </div>
                <div>
                  <span className="text-slate-400">特店編號：</span>
                  <div className="font-bold">{formData.ecpayLogisticsMerchantId}</div>
                </div>
              </div>
              <div className="py-2 border-y border-slate-200 text-center font-bold text-slate-700">
                |||||| | |||||||| |||| |||||| |||||||
              </div>
              <div className="text-[10px] text-slate-500">
                到店簡訊通知取件，請攜帶有相片之證件領取。
              </div>
            </div>

            <button
              onClick={() => {
                alert('已發送列印指令至標籤機！');
                setShowLabelModal(false);
              }}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              模擬輸出熱感應標籤 (A6/4x6)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
