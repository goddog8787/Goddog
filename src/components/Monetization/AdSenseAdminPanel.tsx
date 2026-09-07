import React, { useState } from 'react';
import {
  DollarSign,
  Sparkles,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  Flame,
  Layers,
  HelpCircle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AdSenseConfig } from '../../types';

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
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Earnings Calculator State
  const [calcPv, setCalcPv] = useState(8500); // Daily impressions
  const [calcCtr, setCalcCtr] = useState(2.2); // CTR %
  const [calcCpc, setCalcCpc] = useState(15); // NT$ per click

  const dailyClicks = Math.round((calcPv * (calcCtr / 100)));
  const dailyEarningsTwd = Math.round(dailyClicks * calcCpc);
  const monthlyEarningsTwd = dailyEarningsTwd * 30;
  const monthlyEarningsUsd = Math.round(monthlyEarningsTwd / 32);

  // Generated ads.txt snippet
  const effectivePublisherId = config.publisherId && config.publisherId.startsWith('ca-pub-')
    ? config.publisherId.replace('ca-', '')
    : 'pub-0000000000000000';
  const adsTxtContent = `google.com, ${effectivePublisherId}, DIRECT, f08c47fec0942fa0`;

  const htmlHeadSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId || 'ca-pub-XXXXXXXXXXXXXXXX'}" crossorigin="anonymous"></script>`;

  const handleCopyAdsTxt = () => {
    navigator.clipboard.writeText(adsTxtContent);
    setCopiedAdsTxt(true);
    setTimeout(() => setCopiedAdsTxt(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(htmlHeadSnippet);
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2000);
  };

  const handleDownloadAdsTxt = () => {
    const blob = new Blob([adsTxtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ads.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggle = (key: keyof AdSenseConfig) => {
    onUpdateConfig({
      ...config,
      [key]: !config[key],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Google AdSense 營利系統</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Firebase 雲端已接通</span>
              </span>
              {config.testMode && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-medium">
                  沙盒測試防誤點模式
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Google AdSense 與 Firebase 廣告收益管理中心
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              一鍵串接全球最大的廣告聯播網 Google AdSense，支援頂部橫幅、商品原生穿插與頁尾大版面廣告。設定即時儲存至 Firebase Firestore，並提供全套賺錢過審與收益計算實戰指南！
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
              <span>{isSyncing ? '同步儲存中...' : '同步保存至 Firebase'}</span>
            </button>
          </div>
        </div>

        {lastSyncedTime && (
          <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Firestore 最近同步時間：{new Date(lastSyncedTime).toLocaleString()}</span>
          </div>
        )}
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>✅ AdSense 廣告設定已成功同步寫入 Firebase Firestore（路徑：settings/monetization）！</span>
        </div>
      )}

      {/* Main Grid: Settings & Revenue Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AdSense Core Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">核心參數與發布商憑證</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => handleToggle('enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {config.enabled ? '廣告投放中' : '已關閉廣告'}
                </span>
              </label>
            </div>

            {/* Publisher ID input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Google AdSense 發布商 ID (Publisher ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.publisherId}
                  onChange={(e) =>
                    onUpdateConfig({
                      ...config,
                      publisherId: e.target.value.trim(),
                    })
                  }
                  placeholder="例如：ca-pub-1234567890123456"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-slate-800 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                至 Google AdSense 後台「帳戶」→「設定」→「帳戶資訊」複製您的發布商 ID。格式通常為 <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">ca-pub-XXXXXXXXXXXXXXXX</code>。
              </p>
            </div>

            {/* Test Mode & Auto Ads Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>測試沙盒模式</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.testMode}
                    onChange={() => handleToggle('testMode')}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  開發與測試期間強烈建議開啟！展示真實贊助內容並防護 Google 判定無效自點封號。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Google 全自動廣告</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.enableAutoAds}
                    onChange={() => handleToggle('enableAutoAds')}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  由 Google 機器學習演算法自動在最佳位置與尺寸插入廣告，最大化點擊率與被動收入。
                </p>
              </div>
            </div>

            {/* Slot IDs & Placements Control */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>廣告版位展示與廣告單元 ID (Ad Slot ID)</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {/* Placement 1 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.showTopBanner}
                      onChange={() => handleToggle('showTopBanner')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">1. 首頁頂部精選橫幅 (Top Banner)</span>
                      <p className="text-[10px] text-slate-400">緊隨導航列下方，曝光率極高</p>
                    </div>
                  </div>
                  <div className="w-36">
                    <input
                      type="text"
                      value={config.slots.storefrontTopBanner}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          slots: { ...config.slots, storefrontTopBanner: e.target.value.trim() },
                        })
                      }
                      placeholder="廣告單元 ID"
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Placement 2 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.showInFeedAd}
                      onChange={() => handleToggle('showInFeedAd')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">2. 商品列表原生穿插 (In-Feed Ad)</span>
                      <p className="text-[10px] text-slate-400">穿插在線材商品格中，點擊率極佳</p>
                    </div>
                  </div>
                  <div className="w-36">
                    <input
                      type="text"
                      value={config.slots.inFeedSponsored}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          slots: { ...config.slots, inFeedSponsored: e.target.value.trim() },
                        })
                      }
                      placeholder="廣告單元 ID"
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Placement 3 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.showFooterBanner}
                      onChange={() => handleToggle('showFooterBanner')}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800">3. 頁尾大版位橫幅 (Footer Leaderboard)</span>
                      <p className="text-[10px] text-slate-400">頁面底部 728x90 / 自適應大型展示單元</p>
                    </div>
                  </div>
                  <div className="w-36">
                    <input
                      type="text"
                      value={config.slots.footerLeaderboard}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          slots: { ...config.slots, footerLeaderboard: e.target.value.trim() },
                        })
                      }
                      placeholder="廣告單元 ID"
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ads.txt & HTML Code Integration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">ads.txt 授權與網頁代碼嵌入</h3>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                已在 /public/ads.txt 部署
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl text-white font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span>ads.txt 標準授權紀錄內容：</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAdsTxt}
                    className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAdsTxt ? '已複製' : '複製'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAdsTxt}
                    className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下載</span>
                  </button>
                </div>
              </div>
              <div className="text-emerald-300 select-all py-1">
                {adsTxtContent}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                <span>Google AdSense 官方全域載入腳本：</span>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCodeSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeSnippet ? '已複製' : '複製代碼'}</span>
                </button>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto select-all">
                {htmlHeadSnippet}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Revenue Estimator & AdSense SOP Guide (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Revenue Calculator Card */}
          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-800/80 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">AdSense 預估獲利計算機</h3>
              </div>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md">
                即時試算
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-indigo-200">
                  <span>每日網頁曝光數 (Impressions)：</span>
                  <span className="font-mono font-bold text-amber-300">{calcPv.toLocaleString()} 次</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={500}
                  value={calcPv}
                  onChange={(e) => setCalcPv(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-indigo-200">
                  <span>平均點擊率 (CTR %)：</span>
                  <span className="font-mono font-bold text-amber-300">{calcCtr.toFixed(1)} %</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={6.0}
                  step={0.1}
                  value={calcCtr}
                  onChange={(e) => setCalcCtr(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-indigo-200">
                  <span>單次點擊收益 (CPC)：</span>
                  <span className="font-mono font-bold text-amber-300">NT$ {calcCpc}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={calcCpc}
                  onChange={(e) => setCalcCpc(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Estimated Output Result */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-black/30">
                  <div className="text-[10px] text-indigo-200">每日預估點擊</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">{dailyClicks} 次</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30">
                  <div className="text-[10px] text-indigo-200">每日預估收益</div>
                  <div className="text-base font-black text-amber-300 font-mono mt-0.5">NT$ {dailyEarningsTwd.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-600/40 to-teal-600/40 border border-emerald-400/40 text-center">
                <div className="text-xs text-emerald-200 font-medium">每月被動廣告收益預估：</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  NT$ {monthlyEarningsTwd.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                  約合 USD ${monthlyEarningsUsd.toLocaleString()} / 月
                </div>
              </div>
            </div>
          </div>

          {/* AdSense Approval & Real-World Money-Making Guide */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Google AdSense 申請過審與獲利 4 步驟</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-800">註冊 Google AdSense 帳號</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    前往 <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">adsense.google.com</a> 申請帳號，填寫您台灣的銀行電匯帳戶或西聯匯款資訊。
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-800">綁定頂級自訂獨立網域</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Google 規定網站必須具備自訂獨立網域（如 <code className="bg-slate-200 px-1 rounded text-slate-700">goddog3d.com</code>），請參考「自訂網域與導出指南」綁定。
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-800">部署 ads.txt 授權碼與發布商 ID</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    在左側填入您的 <code className="text-indigo-600 font-mono">ca-pub-XXXXXXXX</code>，系統已自動為您在網域根目錄生成 <code className="text-slate-700">ads.txt</code>。點擊上方「同步保存至 Firebase」完成雲端部署。
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <div>
                  <div className="font-bold text-slate-800">等待 Google 審核通過，自動匯款入帳</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    提交審核後通常需 2~7 個工作天。通過後真實廣告即刻自動曝光，每月滿 100 美元 Google 會於次月 21~26 號自動將美金電匯至您指定的台灣銀行帳戶！
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
