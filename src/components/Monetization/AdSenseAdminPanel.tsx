import React, { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sliders,
  Eye,
} from 'lucide-react';
import { AdSenseConfig } from '../../types';
import { ADSTERRA_PRESETS, ScriptAdFrame } from './AdSenseBanner';

interface AdSenseAdminPanelProps {
  config: AdSenseConfig;
  onUpdateConfig: (newConfig: AdSenseConfig) => void;
  onSyncToFirebase: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedTime?: string;
}

export const AdSenseAdminPanel: React.FC<AdSenseAdminPanelProps> = ({
  config,
  onUpdateConfig,
  onSyncToFirebase,
  isSyncing,
  lastSyncedTime,
}) => {
  const [activeTab, setActiveTab] = useState<'adsterra' | 'hilltopads' | 'placements'>('adsterra');
  const [saveToast, setSaveToast] = useState(false);
  const [previewSlotKey, setPreviewSlotKey] = useState<string>('rectangle300x250');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggle = (field: keyof AdSenseConfig) => {
    onUpdateConfig({
      ...config,
      [field]: !config[field],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-medium">
                Adsterra & HilltopAds
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Firebase 已連接</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              廣告管理設定
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              管理全站 Adsterra 官方版位與 HilltopAds 廣告代碼投放設定。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={async () => {
                await onSyncToFirebase();
                setSaveToast(true);
                setTimeout(() => setSaveToast(false), 2500);
              }}
              disabled={isSyncing}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '同步保存至 Firebase'}</span>
            </button>
          </div>
        </div>

        {lastSyncedTime && (
          <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>最後同步時間：{new Date(lastSyncedTime).toLocaleString()}</span>
          </div>
        )}
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>廣告設定已成功同步寫入 Firebase！</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('adsterra')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'adsterra'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          <span>⚡ Adsterra</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hilltopads')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'hilltopads'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          <span>🏔️ HilltopAds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('placements')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'placements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>🎯 版位顯示開關</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: ADSTERRA ADS                                                   */}
      {/* ===================================================================== */}
      {activeTab === 'adsterra' && (
        <div className="space-y-6">
          {/* Active Adsterra Keys Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>已配置的 Adsterra 官方廣告版位代碼</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  全站已採用安全沙盒 iframe 隔離渲染，不會阻擋網頁主要內容，相容桌機與行動裝置。
                </p>
              </div>

              {/* Primary Network Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">全站主要廣告網：</span>
                <select
                  value={config.networkType || 'adsterra'}
                  onChange={(e) => {
                    const net = e.target.value as 'adsterra' | 'hilltopads';
                    onUpdateConfig({
                      ...config,
                      networkType: net,
                      blogAdNetwork: net,
                      storeAdNetwork: net,
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="adsterra">⚡ Adsterra</option>
                  <option value="hilltopads">🏔️ HilltopAds</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(ADSTERRA_PRESETS).map(([key, slot]) => (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    previewSlotKey === key
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {slot.label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                        {slot.width} x {slot.height}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all select-all">
                      key: {slot.key}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setPreviewSlotKey(key)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                        previewSlotKey === key
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      即時預覽
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(slot.key, key)}
                      className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-purple-600 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>複製代碼</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adsterra Live Preview Frame */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Adsterra 廣告版位即時沙盒預覽（{ADSTERRA_PRESETS[previewSlotKey]?.label}）
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                Live Iframe
              </span>
            </div>

            <div className="w-full min-h-[300px] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 overflow-x-auto">
              {ADSTERRA_PRESETS[previewSlotKey] && (
                <ScriptAdFrame slot={ADSTERRA_PRESETS[previewSlotKey]} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: HILLTOPADS ADS                                                 */}
      {/* ===================================================================== */}
      {activeTab === 'hilltopads' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  HilltopAds 網域擁有權與版位設定
                </h3>
              </div>
              <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Meta 標記已內嵌於 index.html</span>
              </span>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-2xl text-xs text-sky-900 dark:text-sky-200 space-y-2">
              <p className="font-bold">
                ✅ HilltopAds 驗證標記已固定配置於全站原始碼中：
              </p>
              <code className="block p-2 rounded-xl bg-white dark:bg-slate-950 font-mono text-[11px] text-slate-800 dark:text-slate-300 border border-sky-100 dark:border-sky-900 select-all">
                &lt;meta name="01cbacb252bfbf5662b80265d72c30d5b946cc3e" content="01cbacb252bfbf5662b80265d72c30d5b946cc3e" /&gt;
              </code>
            </div>

            {/* HilltopAds Banner HTML Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                貼上 HilltopAds 版位 HTML / Script 標籤（可自訂各尺寸橫幅）：
              </label>
              <textarea
                rows={6}
                value={config.hilltopadsBannerHtml || ''}
                onChange={(e) =>
                  onUpdateConfig({
                    ...config,
                    hilltopadsBannerHtml: e.target.value,
                  })
                }
                placeholder="貼上從 HilltopAds 後台取得的 Banner / Native 廣告代碼（例如：<script src='https://...'></script>）"
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                若選擇使用 HilltopAds，全站廣告版位將自動切換為渲染此代碼。
              </p>
            </div>

            {config.hilltopadsBannerHtml && (
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  HilltopAds 廣告即時預覽：
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 flex justify-center items-center">
                  <ScriptAdFrame html={config.hilltopadsBannerHtml} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PLACEMENT TOGGLES                                              */}
      {/* ===================================================================== */}
      {activeTab === 'placements' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                全站廣告版位顯示與投放開關
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              即時儲存生效
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'enabled' as keyof AdSenseConfig,
                title: '總開關：全站廣告展示',
                desc: '關閉時全站所有 Adsterra 與 HilltopAds 廣告版位將立即完全隱藏',
                value: config.enabled ?? false,
              },
              {
                id: 'showInFeedAd' as keyof AdSenseConfig,
                title: '商城首頁商品列表中穿插原生廣告卡片 (In-Feed 300x250)',
                desc: '在商品第 4 個與第 8 個位置穿插原生廣告單元',
                value: config.showInFeedAd ?? false,
              },
              {
                id: 'showFooterBanner' as keyof AdSenseConfig,
                title: '商城頁尾橫幅廣告 (Footer Leaderboard 468x60 / 320x50)',
                desc: '在商城底部展示自適應寬橫幅廣告',
                value: config.showFooterBanner ?? false,
              },
              {
                id: 'showArticleAd' as keyof AdSenseConfig,
                title: '創客專欄文章內廣告 (Article Mid 300x250 & Bottom Banner)',
                desc: '在部落格文章中段與結尾展示廣告單元',
                value: config.showArticleAd ?? false,
              },
              {
                id: 'showSidebarAd' as keyof AdSenseConfig,
                title: '桌機大螢幕側邊懸浮摩天樓廣告 (Desktop Skyscraper 160x600)',
                desc: '僅在桌機大螢幕側邊空白處浮動，手機端自動隱藏不擋視野',
                value: config.showSidebarAd ?? false,
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    item.value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                      item.value ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
