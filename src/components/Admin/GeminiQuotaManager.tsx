import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  Send, 
  Sparkles, 
  Cpu, 
  Users, 
  Trash2, 
  HelpCircle,
  Clock,
  Activity
} from 'lucide-react';

interface AIAdminConfig {
  success: boolean;
  ownerAccount: string;
  hasActiveKey: boolean;
  keySource: 'server_env' | 'stored_owner_key' | 'unconfigured';
  maskedKey: string;
  activeModel: string;
  supportedModels: string[];
  totalQueriesServed: number;
}

export const GeminiQuotaManager: React.FC = () => {
  const [config, setConfig] = useState<AIAdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Test prompt runner state
  const [testModel, setTestModel] = useState('gemini-3.8-flash');
  const [testPrompt, setTestPrompt] = useState('你好！請用兩句話推薦適合拓竹 AMS 的日常高速打樣線材。');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    reply?: string;
    latencyMs?: number;
    modelUsed?: string;
    message?: string;
  } | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/admin-config');
      const data = await res.json();
      if (data && data.success) {
        setConfig(data);
      }
    } catch (e) {
      console.warn('Failed to fetch AI admin config:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveKey = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setSaveStatus({ type: 'error', message: '請輸入有效的 Google Gemini API 金鑰' });
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/ai/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();
      if (data && data.success) {
        setSaveStatus({ type: 'success', message: data.message || '金鑰驗證通過，已成功綁定店長 Google 額度！' });
        setInputKey('');
        fetchConfig();
      } else {
        setSaveStatus({ type: 'error', message: data?.message || '驗證失敗，請確認該金鑰是否支援 Gemini API' });
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: `儲存異常：${err.message || '連線逾時'}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!window.confirm('確定要清除已儲存的店長金鑰嗎？清除後系統將使用平台環境變數或備援模式回覆顧客。')) {
      return;
    }
    try {
      await fetch('/api/ai/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: '' }),
      });
      fetchConfig();
      setSaveStatus({ type: 'success', message: '已成功清除自訂金鑰' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-owner-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt, model: testModel }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `連線失敗: ${err.message || '伺服器未回應'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>神狗勾 3D 官方 AI 雲端推論引擎中心</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                    全站統一節點
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  全體顧客發問自動調用官方高階模型推論，顧客免登入、免額外配置即可享有頂尖 AI 諮詢
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchConfig}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>重新整理狀態</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mechanism Architecture Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>運作架構說明：官方集中運算節點模式</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          在現代電商中，顧客無須自行申請 API Key 或登入付費模型。神狗勾系統採用<strong>「官方集中運算節點」</strong>架構：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 block">1. 顧客進站直接提問</span>
            <p className="text-[11px] text-slate-600 leading-normal">
              任何訪客打開右下角智能客服，無須輸入金鑰，直接打字詢問切片或材料。
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 block">2. 官方伺服器即時推論</span>
            <p className="text-[11px] text-slate-600 leading-normal">
              後端即時調用官方 Google Gemini 旗艦大模型 API 進行深度推理與專業解答。
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-indigo-600 block">3. 秒速回饋專業解答</span>
            <p className="text-[11px] text-slate-600 leading-normal">
              即時提供 3D 列印精確噴嘴溫度、拓竹 AMS 供料設定與排查清單，大幅提升商城轉單率。
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Account Bind */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400">官方 AI 運算節點</span>
          <div className="font-bold text-slate-900 text-sm truncate font-mono">
            {config?.ownerAccount && !config.ownerAccount.includes('@') ? config.ownerAccount : 'GodDog-AI-Cluster (主節點)'}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            官方認證授權通道已連線
          </span>
        </div>

        {/* Connection Status */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Gemini 官方模型狀態</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config?.hasActiveKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="font-bold text-slate-900 text-sm">
              {config?.hasActiveKey ? '官方大模型運作中' : '工程知識庫就緒'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            {config?.keySource === 'stored_owner_key'
              ? '來源：後台持久化金鑰'
              : config?.keySource === 'server_env'
              ? '來源：AI Studio 平台 Secrets'
              : '可填入 API Key 開啟雲端大模型'}
          </span>
        </div>

        {/* Model ID */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400">當前調用旗艦模型</span>
          <div className="font-bold text-slate-900 text-sm font-mono flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>{config?.activeModel || 'gemini-3.8-flash'}</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Google 官方最新極速推理</span>
        </div>

        {/* Served Requests */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-400">已服務顧客諮詢數</span>
          <div className="font-black text-slate-900 text-xl font-mono">
            {config?.totalQueriesServed || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">次發問</span>
          </div>
          <span className="text-[10px] text-slate-400">全自動雲端服務</span>
        </div>
      </div>

      {/* Key Configuration Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>官方 Google Gemini API Key 設定</span>
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            強烈建議：若您希望永久保存金鑰，請使用 Google AI Studio 介面右上角選單進入 <strong>「Settings &gt; Secrets」</strong>，並新增名為 <code>GEMINI_API_KEY</code> 的變數。
            <br/>在此介面儲存的金鑰為測試用，僅保存在伺服器本機 <code>.server_ai_config.json</code>，當環境重新部署或睡眠喚醒時將會自動清空。
          </p>
        </div>

        {config?.maskedKey && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">目前生效中金鑰：</span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {config.maskedKey}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearKey}
              className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清除重設</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>輸入或更新官方 Gemini API 金鑰：</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1 font-medium"
            >
              <span>前往 Google AI Studio 免費申請/複製金鑰</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="貼上 AIzaSy 開頭的 Google Gemini API 金鑰..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              disabled={!inputKey.trim() || isSaving}
              onClick={handleSaveKey}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>驗證並綁定中...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>立即儲存並套用全店</span>
                </>
              )}
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
            saveStatus.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {saveStatus.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1.5 text-xs">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>常見疑問：這樣顧客發問會扣到費用嗎？</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            Google AI Studio 提供慷慨的<strong>免費級別額度（Free Tier）</strong>，每分鐘可支援多次發問，一般中小型 3D 列印耗材商城的顧客諮詢幾乎不會產生費用。若您日後升級為 Google Cloud 付費專案，系統也會全自動享有無上限並行處理的高速響應。
          </p>
        </div>
      </div>

      {/* Live Quota Simulation / Diagnostic Test */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>官方推論節點即時連線測試</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            在此輸入任何測試問題，系統將直接以官方 Gemini 節點發送請求，驗證模型運作與回傳速度。
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">測試調度模型：</span>
            <select
              value={testModel}
              onChange={(e) => setTestModel(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (推薦首選)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite</option>
              <option value="gemini-flash-latest">Gemini Flash (最新版)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (深度推理)</option>
            </select>
          </div>

          <textarea
            rows={2}
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="請輸入欲測試的顧客提問..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isTesting || !testPrompt.trim()}
              onClick={handleRunTest}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Google AI 推理中...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>發送推論連線測試</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            testResult.success 
              ? 'bg-indigo-50/50 border-indigo-200 text-slate-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold">
                {testResult.success ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>測試成功！{testResult.modelUsed || 'Gemini'} 已即時生成回覆</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>連線失敗</span>
                  </>
                )}
              </div>
              {testResult.latencyMs && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {testResult.latencyMs} ms
                </span>
              )}
            </div>

            {testResult.reply && (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                {testResult.reply}
              </p>
            )}

            {testResult.message && (
              <p className="text-xs text-rose-700 font-medium">
                {testResult.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
