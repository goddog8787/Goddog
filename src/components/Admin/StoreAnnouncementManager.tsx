import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Save, 
  Store, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Receipt, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink,
  MessageCircle,
  Eye
} from 'lucide-react';
import { StoreAnnouncementConfig } from '../../types';
import { 
  getStoreAnnouncementConfig, 
  saveStoreAnnouncementConfig 
} from '../../utils/announcementManager';

export const StoreAnnouncementManager: React.FC = () => {
  const [config, setConfig] = useState<StoreAnnouncementConfig>(getStoreAnnouncementConfig());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getStoreAnnouncementConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    setConfig(updated);
    saveStoreAnnouncementConfig(updated);
    showToast('🎉 全館營運廣播與商店設定已即時更新！');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">全館營運公告與首頁跑馬燈廣播</h2>
            <p className="text-xs text-slate-500">
              即時控制前台頂部橫幅公告、出貨狀態提示、LINE 客服帳號與公司統一編號設定
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>儲存全部設定</span>
        </button>
      </div>

      {/* Real-Time Preview Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-400" />
            買家視角：前台頂部廣播條即時預覽
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {config.isEnabled ? '🟢 目前前台顯示中' : '⚪ 目前已關閉隱藏'}
          </span>
        </div>

        {config.isEnabled ? (
          <div className="rounded-xl overflow-hidden shadow-inner border border-slate-700">
            <div className="py-2.5 px-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  config.type === 'promotion'
                    ? 'bg-amber-400 text-slate-950'
                    : config.type === 'shipping'
                    ? 'bg-cyan-400 text-slate-950'
                    : config.type === 'holiday'
                    ? 'bg-rose-400 text-slate-950'
                    : 'bg-indigo-300 text-slate-950'
                }`}>
                  {config.type === 'promotion' ? '🔥 全館特惠' : config.type === 'shipping' ? '🚚 物流公告' : config.type === 'holiday' ? '🏮 連假出貨' : '📢 系統通知'}
                </span>
                <span className="truncate font-medium">{config.text}</span>
              </div>
              {config.linkUrl && (
                <span className="text-cyan-300 hover:text-cyan-200 text-[11px] flex items-center gap-1 underline shrink-0 cursor-pointer">
                  立即查看 <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-dashed border-slate-700 text-center text-xs text-slate-400">
            廣播條目前為「關閉」狀態，前台頂部將不會渲染此橫幅。
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Marquee Broadcast Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              頂部跑馬燈公告設定
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-700">啟用前台頂部廣播橫幅</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                公告內容 (建議 20-60 字，吸引創客目光)
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="例如：全家/7-11 超商滿 NT$999 免運，工作日 15:00 前下單當日急速出貨！"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">公告徽章類型</label>
              <select
                value={config.type}
                onChange={(e: any) => setConfig({ ...config, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="promotion">🔥 全館特惠 (金色)</option>
                <option value="shipping">🚚 物流出貨 (青色)</option>
                <option value="holiday">🏮 連假通知 (紅色)</option>
                <option value="maintenance">📢 系統維護 (紫色)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                點擊前往連結 (選填)
              </label>
              <input
                type="text"
                value={config.linkUrl || ''}
                onChange={(e) => setConfig({ ...config, linkUrl: e.target.value })}
                placeholder="例如：#storefront-product-grid 或 /guide 或 https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                商城營運當前狀態
              </label>
              <select
                value={config.storeStatus}
                onChange={(e: any) => setConfig({ ...config, storeStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="open">🟢 正常營運中 (當日排程快速出貨)</option>
                <option value="busy">🟡 訂單量較大 (出貨排程約需 1-2 工作天)</option>
                <option value="holiday_delay">🔴 國定連假 (物流暫停收件，連假後依序發貨)</option>
                <option value="stocktake">🟣 倉庫季度盤點中 (照常收單，出貨順延)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Storefront Contact & Operational Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              店鋪資訊與官方客服通道
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              以下聯絡資訊將同步展示於購物說明、頁尾 Footer 與訂單成立確認信件中
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                LINE 官方客服 ID
              </label>
              <input
                type="text"
                value={config.contactLineId}
                onChange={(e) => setConfig({ ...config, contactLineId: e.target.value })}
                placeholder="@printcore3d"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                客服信箱 (Email)
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                placeholder="support@goddog.space"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-500" />
                客服服務專線
              </label>
              <input
                type="text"
                value={config.contactPhone}
                onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                placeholder="02-2788-9918"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                工作室自取與退換貨收件地址
              </label>
              <input
                type="text"
                value={config.storeAddress}
                onChange={(e) => setConfig({ ...config, storeAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                客服與出貨營業時間
              </label>
              <input
                type="text"
                value={config.businessHours}
                onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Company Invoicing & Tax ID */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-600" />
              營利事業統一編號與發票設定
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              用於開立電子發票給企業/學校/創客採購單位
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                統一編號 (8 碼統編)
              </label>
              <input
                type="text"
                value={config.taxIdNumber}
                onChange={(e) => setConfig({ ...config, taxIdNumber: e.target.value })}
                placeholder="91823746"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                公司營業登記完整抬頭
              </label>
              <input
                type="text"
                value={config.taxCompanyName}
                onChange={(e) => setConfig({ ...config, taxCompanyName: e.target.value })}
                placeholder="神狗勾數位科技股份有限公司"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>確認儲存營運公告設定</span>
          </button>
        </div>
      </form>
    </div>
  );
};
