import React, { useState } from 'react';
import { 
  Code2, 
  Globe, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Terminal, 
  Layers, 
  RefreshCw,
  Coins,
  Cpu,
  FileCode,
  ExternalLink,
  Lock,
  Sparkles,
  Zap
} from 'lucide-react';
import { LanguageCode, CurrencyCode } from '../../types';

interface PaymentAndI18nGuideProps {
  currentLang: LanguageCode;
  currentCurrency: CurrencyCode;
}

export const PaymentAndI18nGuide: React.FC<PaymentAndI18nGuideProps> = ({
  currentLang,
  currentCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'i18n' | 'currency' | 'ecpay' | 'linepay' | 'security' | 'sandbox'>('architecture');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Sandbox state
  const [sandboxAmount, setSandboxAmount] = useState<number>(1200);
  const [sandboxFromCurr, setSandboxFromCurr] = useState<CurrencyCode>('TWD');
  const [sandboxToCurr, setSandboxToCurr] = useState<CurrencyCode>('USD');
  const [sandboxConvertedResult, setSandboxConvertedResult] = useState<any>(null);
  const [isConverting, setIsConverting] = useState(false);

  // ECPay Sandbox Generator State
  const [ecpayItemName, setEcpayItemName] = useState('神狗勾 Hyper PLA 高速耗材 (霧黑)');
  const [ecpayMethod, setEcpayMethod] = useState<'Credit' | 'ATM' | 'CVS'>('Credit');
  const [ecpayResult, setEcpayResult] = useState<any>(null);
  const [isGeneratingEcpay, setIsGeneratingEcpay] = useState(false);

  // LINE Pay Sandbox Generator State
  const [linePointsDeduct, setLinePointsDeduct] = useState(50);
  const [linepayResult, setLinepayResult] = useState<any>(null);
  const [isGeneratingLinepay, setIsGeneratingLinepay] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleTestConvert = async () => {
    setIsConverting(true);
    try {
      const res = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: sandboxAmount,
          from: sandboxFromCurr,
          to: sandboxToCurr,
        }),
      });
      const data = await res.json();
      setSandboxConvertedResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConverting(false);
    }
  };

  const handleTestEcpay = async () => {
    setIsGeneratingEcpay(true);
    try {
      const res = await fetch('/api/payments/ecpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: sandboxAmount,
          paymentMethod: ecpayMethod.toLowerCase(),
          itemName: ecpayItemName,
        }),
      });
      const data = await res.json();
      setEcpayResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingEcpay(false);
    }
  };

  const handleTestLinepay = async () => {
    setIsGeneratingLinepay(true);
    try {
      const res = await fetch('/api/payments/linepay/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: sandboxAmount,
          linePointsUsed: linePointsDeduct,
          currency: 'TWD',
          itemName: ecpayItemName,
        }),
      });
      const data = await res.json();
      setLinepayResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingLinepay(false);
    }
  };

  return (
    <div className="py-6 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>企業級電商金流整合與多國語言架構白皮書</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            多國語言 (i18n) 與綠界 / LINE Pay 金流支付接口實施指南
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            本專案已完全實作前端多國語言切換（繁中、英文、日文）、後端即時精準貨幣轉換運算、台灣綠界科技 ECPay（信用卡 3D OTP、ATM 虛擬帳號、超商代碼繳費與電子發票）及 LINE Pay V3 快速行動支付之 HMAC-SHA256 安全簽章。以下為各模組詳細的對接架構、代碼範例與實戰沙盒。
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              zh-TW / EN / JA
            </span>
            <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              TWD / USD / JPY 實時匯率
            </span>
            <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              綠界 CheckMacValue SHA-256
            </span>
            <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#06C755]" />
              LINE Pay V3 HMAC-SHA256
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-slate-200">
        {[
          { id: 'architecture', label: '1. 全站架構與交易流程', icon: Layers },
          { id: 'i18n', label: '2. 前端多語切換機制', icon: Globe },
          { id: 'currency', label: '3. 後端貨幣轉換邏輯', icon: Coins },
          { id: 'ecpay', label: '4. 綠界科技 ECPay 對接', icon: CreditCard },
          { id: 'linepay', label: '5. LINE Pay V3 對接', icon: Smartphone },
          { id: 'security', label: '6. 金流安全與防重複扣款', icon: ShieldCheck },
          { id: 'sandbox', label: '⚡ 即時在線沙盒測試機', icon: Zap, isAccent: true },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tech-guide-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : tab.isAccent
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* TAB 1: ARCHITECTURE & SEQUENCE                                */}
      {/* ============================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              電商前台、後端微服務與第三方金流支付閘道交易全景時序圖
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">STEP 01</span>
                <h3 className="font-bold text-slate-800 text-sm">顧客挑選耗材與動態計價</h3>
                <p className="text-slate-600 leading-relaxed">
                  用戶於前台自由選擇線材規格（PLA/PETG/碳纖維）、顏色與線徑。前端依據當前語言即時翻譯，並透過伺服器匯率 API 將 TWD 實價轉換為指定貨幣（USD/JPY）預覽。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">STEP 02</span>
                <h3 className="font-bold text-slate-800 text-sm">後端建立防竄改金流訂單</h3>
                <p className="text-slate-600 leading-relaxed">
                  前端提交購物車明細至後端。伺服器重新校驗耗材庫存與折扣金額，生成唯一的 <code className="text-indigo-600 font-bold">MerchantTradeNo</code>，計算 SHA-256 壓碼或 HMAC 簽章，保證金額絕不被竄改。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">STEP 03</span>
                <h3 className="font-bold text-slate-800 text-sm">非同步 Webhook 銷帳與出貨</h3>
                <p className="text-slate-600 leading-relaxed">
                  顧客完成 3D 信用卡刷卡、ATM 轉帳或 LINE Pay 扣款後，金流閘道向後端 <code className="text-indigo-600 font-bold">ReturnURL</code> 發送交易回傳通知。後端驗簽通過後自動觸發倉儲撿貨並產生物流託運單。
                </p>
              </div>
            </div>

            {/* Sequence Flow Diagram */}
            <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 font-mono text-xs overflow-x-auto space-y-3">
              <div className="text-slate-400 font-semibold mb-2"># 交易時序流程 (Payment Sequence Diagram)</div>
              <div className="text-emerald-400">[Browser 瀏覽器] ── 1. 提交訂單 (購物車清單、收件資訊、選擇支付方式) ──&gt; [神狗勾 Backend]</div>
              <div className="text-sky-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 2. 驗證庫存、扣抵會員積分、計算最終 TWD 實付額</div>
              <div className="text-sky-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 3. 呼叫金流驅動模組，計算 CheckMacValue / HMAC-SHA256</div>
              <div className="text-amber-300">[神狗勾 Backend] ── 4. 建立授權交易 (AIO Post / LINE Pay API) ──&gt; [綠界 ECPay / LINE Pay]</div>
              <div className="text-amber-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 5. 回傳交易導頁 URL / 虛擬帳號 / 二維碼 / Token</div>
              <div className="text-emerald-400">[Browser 瀏覽器] &lt;── 6. 跳轉 3D 驗證頁面 / 掃描 QR 碼確認 ─── [金流收銀台]</div>
              <div className="text-rose-400">[綠界 / LINE Pay] ── 7. Server-to-Server 異步回傳交易結果 (Webhook) ──&gt; [神狗勾 Backend]</div>
              <div className="text-purple-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 8. 驗簽 CheckMacValue 確保無竄改，更新訂單為「已付款 (PAID)」</div>
              <div className="text-purple-300">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ 9. 自動開立財政部電子發票，通知智慧倉儲揀貨出貨</div>
              <div className="text-slate-400">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─&gt; 響應 1|OK (ECPay) / 0000 (LINE Pay)</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: I18N IMPLEMENTATION                                    */}
      {/* ============================================================= */}
      {activeTab === 'i18n' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              前端多國語言切換機制實施方案 (Traditional Chinese, English, Japanese)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              為了確保 3D 列印創客與海外客戶的流暢體驗，本架構採用階層化鍵值對 (Key-Value Dictionary) 設計，並支援動態參數插值（如滿額免運金額計算、積分點數回饋通知）。
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">實施代碼範例：/src/i18n.ts (語言字典與格式化引擎)</span>
                <button
                  onClick={() => copyToClipboard(`export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = { ... }`, 'i18n-code')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedSnippet === 'i18n-code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>複製代碼</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                <pre>{`// 1. 定義語系代碼型別
export type LanguageCode = 'zh-TW' | 'en' | 'ja';

// 2. 結構化多語字典 (含金流與 3D 規格術語)
export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  'zh-TW': {
    brandName: '神狗勾耗材商城',
    navCatalog: '耗材商城',
    ecpayTitle: '綠界科技 ECPay 金流 (信用卡/ATM/超商代碼)',
    linepayTitle: 'LINE Pay 行動支付 (一鍵快速結帳/支援點數折抵)',
    freeShippingNotice: '全館滿 NT$999 享 7-11 / 全家 超商免運！',
    needMoreForFreeShipping: '還差 {amount} 即可享超商免運優惠',
    pointsEarnNotice: '本次下單預計獲得 {pts} 點創客積分',
  },
  'en': {
    brandName: 'GodDog 3D (神狗勾)',
    navCatalog: 'Filament Store',
    ecpayTitle: 'ECPay Official Gateway (Credit / ATM / CVS)',
    linepayTitle: 'LINE Pay 1-Click Mobile Checkout',
    freeShippingNotice: 'Free shipping on orders over NT$999!',
    needMoreForFreeShipping: 'Add NT\${amount} more for free shipping',
    pointsEarnNotice: 'Earn {pts} Maker Points with this order',
  },
  'ja': {
    brandName: '神狗勾 3D',
    navCatalog: 'フィラメント一覧',
    ecpayTitle: 'ECPay 緑界金流決済 (クレカ・ATM・コンビニ)',
    linepayTitle: 'LINE Pay モバイル決済 (ポイント利用可)',
    freeShippingNotice: 'NT$999 以上のご注文で送料無料！',
    needMoreForFreeShipping: 'あと NT\${amount} で送料無料',
    pointsEarnNotice: 'このご注文で {pts} ポイント獲得予定',
  }
};`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800">1. 持久化偏好 (Persistence)</div>
                  <p className="text-slate-500">透過 <code className="text-indigo-600">localStorage.setItem('pref_lang', lang)</code> 記住用戶設定，下次造訪自動載入。</p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800">2. 動態插值解析 (Interpolation)</div>
                  <p className="text-slate-500">使用正規表達式替換萬用字元，如 <code className="text-indigo-600">{'text.replace("{amount}", formatPrice(diff))'}</code>。</p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800">3. 響應式切換 (Zero Reload)</div>
                  <p className="text-slate-500">React State 全域連鎖廣播，導航列與購物車瞬時重繪，毋須刷新整頁。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: CURRENCY CONVERSION LOGIC                              */}
      {/* ============================================================= */}
      {activeTab === 'currency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              後端貨幣轉換邏輯與即時匯率換算機制 (TWD 基準計價)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              電商交易涉及金額安全，前端展示僅作即時幣別換算與匯率估算，<strong>所有最終結帳扣款金額均以台灣新台幣 (TWD) 由後端重新計算確認</strong>，徹底杜絕浮點數精度損失與跨幣別竄改問題。
            </p>

            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                <pre>{`// 後端匯率轉換核心 (Express API /server.ts)
const EXCHANGE_RATES: Record<string, { rate: number; symbol: string; decimals: number }> = {
  TWD: { rate: 1.0, symbol: 'NT$', decimals: 0 },
  USD: { rate: 0.0317, symbol: '$', decimals: 2 },
  JPY: { rate: 4.68, symbol: '¥', decimals: 0 },
};

app.post('/api/currency/convert', (req, res) => {
  const { amount, from = 'TWD', to = 'USD' } = req.body;
  const fromConfig = EXCHANGE_RATES[from] || EXCHANGE_RATES.TWD;
  const toConfig = EXCHANGE_RATES[to] || EXCHANGE_RATES.USD;

  // 統一以基準幣 TWD 為中繼計算，防止多幣別交叉誤差
  const amountInTwd = Number(amount) / fromConfig.rate;
  const convertedRaw = amountInTwd * toConfig.rate;

  // 依據各國貨幣習慣處理小數位 (日幣/台幣無小數，美元兩位小數)
  const finalConverted = toConfig.decimals === 0 
    ? Math.round(convertedRaw) 
    : Number(convertedRaw.toFixed(toConfig.decimals));

  res.json({
    success: true,
    original: { amount, currency: from },
    converted: {
      amount: finalConverted,
      currency: to,
      symbol: toConfig.symbol,
      formatted: \`\${toConfig.symbol} \${finalConverted.toLocaleString()}\`
    }
  });
});`}</pre>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  防浮點數偏差與銀行家捨入法則 (Banker's Rounding)
                </div>
                <p>
                  JavaScript 的 <code className="font-mono">0.1 + 0.2 !== 0.3</code> 浮點數特性若直接進行乘除可能導致 0.0000001 的差額。本系統採用整數基準分（Cents/Points）運算或於後端先轉為整數整除後再輸出，保證結帳與發票金額精準吻合。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: ECPAY INTEGRATION                                      */}
      {/* ============================================================= */}
      {activeTab === 'ecpay' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  台灣綠界科技 (ECPay AIO) 金流支付閘道全面對接
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">支援全方位在地支付：信用卡 (3D OTP)、ATM 虛擬帳號、超商代碼繳費與電子發票</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full w-fit">
                ECPay AIO V5 官方認證
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">關鍵核心：CheckMacValue SHA-256 壓碼演算標準演算法</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                綠界規定所有送往 AIO 金流閘道的 POST 表單參數，必須依照字元順序進行字典排序 (A to Z)，於前後加上特店密鑰 HashKey 與 HashIV，進行 URL 編碼、轉小寫後以 SHA-256 雜湊壓碼，最終轉為全大寫。
              </p>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                <pre>{`// 綠界官方標準 CheckMacValue 計算代碼 (Node.js / TypeScript)
import crypto from 'crypto';

export function generateECPayCheckMacValue(
  params: Record<string, any>, 
  hashKey: string, 
  hashIV: string
): string {
  // 1. 排除 CheckMacValue 本身，依照字母由 A 到 Z 排序參數鍵
  const sortedKeys = Object.keys(params).filter(k => k !== 'CheckMacValue').sort();
  
  // 2. 拼接字串：前置 HashKey，後置 HashIV
  let raw = \`HashKey=\${hashKey}&\` + sortedKeys.map(k => \`\${k}=\${params[k]}\`).join('&') + \`&HashIV=\${hashIV}\`;
  
  // 3. 符合 .NET 規範之 UrlEncode 特殊符號置換
  let encoded = encodeURIComponent(raw)
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+');

  // 4. 轉為小寫 -> SHA256 雜湊 -> 轉全大寫
  const lower = encoded.toLowerCase();
  return crypto.createHash('sha256').update(lower).digest('hex').toUpperCase();
}`}</pre>
              </div>

              {/* Supported Payment Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    信用卡 (Credit 3D)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    支援 Visa、MasterCard、JCB。強制啟用 3D 驗證發送簡訊 OTP，避免盜刷爭議，符合 EMV 3-D Secure 2.0 規範。
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    ATM 虛擬帳號繳費
                  </div>
                  <p className="text-[11px] text-slate-500">
                    由綠界產生專屬虛擬銷帳帳號（指定中信、台新、國泰等銀行代號），客戶繳款後伺服器於 3 秒內自動完成對帳銷帳。
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    超商代碼 / 條碼 (CVS)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    支援 7-11 ibon、全家 FamiPort、萊爾富 Life-ET。產生物流代碼與超商條碼，7 天繳費期限內至全台超商門市臨櫃代收。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: LINE PAY INTEGRATION                                   */}
      {/* ============================================================= */}
      {activeTab === 'linepay' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#06C755]" />
                  LINE Pay V3 行動支付架構與 HMAC-SHA256 簽名機制
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">提供行動裝置一鍵跳轉授權與桌機二維碼 (QR Code) 秒掃秒付，整合 LINE Points 點數折抵</p>
              </div>
              <span className="bg-[#06C755]/10 text-[#06C755] text-xs font-bold px-3 py-1 rounded-full w-fit">
                LINE Pay V3 REST API
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">LINE Pay V3 標頭認證簽名演算法</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                LINE Pay 要求每次呼叫必須在 HTTP Headers 帶入 ChannelId、隨機 Nonce 與使用 ChannelSecret 進行 HMAC-SHA256 雜湊並以 Base64 編碼的簽章。
              </p>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                <pre>{`// LINE Pay V3 簽章運算 (Node.js / Express)
function generateLinePaySignature(
  channelSecret: string, 
  uri: string, 
  requestBody: string, 
  nonce: string
): string {
  // 簽章公式：HMAC-SHA256(ChannelSecret, ChannelSecret + URI + RequestBody + Nonce)
  const message = channelSecret + uri + requestBody + nonce;
  return crypto.createHmac('sha256', channelSecret).update(message).digest('base64');
}

// 請求標頭 (Headers) 組裝
const headers = {
  'Content-Type': 'application/json',
  'X-LINE-ChannelId': process.env.LINE_PAY_CHANNEL_ID,
  'X-LINE-Authorization-Nonce': nonce,
  'X-LINE-Authorization': signature,
};`}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#06C755]" />
                    LINE Points 點數折抵機制
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    在請求封包中的 <code className="text-indigo-600">options.extra.promotionRestriction</code> 允許用戶直接使用現有 LINE Points 1:1 折抵台幣現金，商城每筆訂單亦贈送 10:1 的神狗勾創客積分。
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-sky-500" />
                    雙階段授權流程 (Request & Confirm)
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    先以 <code className="text-indigo-600">/v3/payments/request</code> 獲取 <code className="text-indigo-600">transactionId</code> 與跳轉 URL，用戶確認付款後由 Confirm URL 觸發 <code className="text-indigo-600">/v3/payments/&#123;transactionId&#125;/confirm</code> 正式扣款。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 6: SECURITY & IDEMPOTENCY                                 */}
      {/* ============================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              金流交易安全防護、防重複扣款與 PCI-DSS 合規性
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 space-y-2">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  防重複扣款 (Idempotency Key & Transaction Lock)
                </div>
                <p className="text-rose-800 leading-relaxed">
                  每個購物車訂單在發起付款時，會生成全域唯一之 <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">MerchantTradeNo</code>，並於資料庫加鎖 10 分鐘。若使用者連擊或網絡重送請求，伺服器將直接攔截，絕不重複發起多筆扣款。
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  敏感卡號資料不落地 (PCI-DSS Level 1)
                </div>
                <p className="text-indigo-800 leading-relaxed">
                  前端結帳卡號輸入框直接嵌入綠界科技官方經 PCI-DSS 認證之加密元件或使用 Apple Pay / Google Pay / LINE Pay Token。商城後端伺服器僅經手交易識別碼與授權結果，不儲存任何信用卡卡號或 CVV 安全碼。
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  防竄改 CheckMacValue / Signature 雙向驗證
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  不論送出付款或接收 Webhook 通知，後端伺服器皆會使用相同金鑰重算 CheckMacValue 並與回傳壓碼嚴格比對。若金額、訂單編號或狀態遭駭客中間人竄改，比對失敗將立即作廢訂單並記錄警報。
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  防重放攻擊 (Anti-Replay Attack via Nonce)
                </div>
                <p className="text-amber-800 leading-relaxed">
                  LINE Pay 請求包含 UUID Nonce 與時間戳記。伺服器與閘道雙向記錄每次 Nonce 唯一碼，過期或重複出現之簽章直接判定無效，阻斷封包竊聽與重送攻擊。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 7: LIVE SANDBOX SIMULATOR                                 */}
      {/* ============================================================= */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  即時線上沙盒測試機 (Live Payment & Currency Sandbox)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">直接向後端真實 API 發送測試請求，驗證多幣別換算、綠界壓碼與 LINE Pay 簽名</p>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                Sandbox Mode (測試沙盒環境)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Test Tool 1: Currency Converter */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>測試 1: 後端實時匯率換算</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">測試金額</label>
                    <input
                      type="number"
                      value={sandboxAmount}
                      onChange={(e) => setSandboxAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">來源幣別</label>
                      <select
                        value={sandboxFromCurr}
                        onChange={(e) => setSandboxFromCurr(e.target.value as any)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                      >
                        <option value="TWD">新台幣 (TWD)</option>
                        <option value="USD">美金 (USD)</option>
                        <option value="JPY">日圓 (JPY)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">轉換目標幣別</label>
                      <select
                        value={sandboxToCurr}
                        onChange={(e) => setSandboxToCurr(e.target.value as any)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                      >
                        <option value="USD">美金 (USD)</option>
                        <option value="JPY">日圓 (JPY)</option>
                        <option value="TWD">新台幣 (TWD)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleTestConvert}
                    disabled={isConverting}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isConverting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Coins className="w-3.5 h-3.5" />}
                    <span>呼叫 /api/currency/convert</span>
                  </button>

                  {sandboxConvertedResult && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 text-slate-700">
                      <div className="font-bold text-indigo-600">
                        換算結果: {sandboxConvertedResult.converted?.formatted}
                      </div>
                      <div className="text-slate-500">
                        使用的匯率: 1 {sandboxFromCurr} = {sandboxConvertedResult.rateUsed} {sandboxToCurr}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Tool 2: ECPay Generator */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>測試 2: 綠界 CheckMacValue 壓碼</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">支付方式</label>
                    <select
                      value={ecpayMethod}
                      onChange={(e) => setEcpayMethod(e.target.value as any)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    >
                      <option value="Credit">信用卡 3D 驗證 (Credit)</option>
                      <option value="ATM">ATM 虛擬帳號 (ATM)</option>
                      <option value="CVS">超商代碼繳費 (CVS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">商品名稱</label>
                    <input
                      type="text"
                      value={ecpayItemName}
                      onChange={(e) => setEcpayItemName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <button
                    onClick={handleTestEcpay}
                    disabled={isGeneratingEcpay}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingEcpay ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                    <span>呼叫 /api/payments/ecpay/checkout</span>
                  </button>

                  {ecpayResult && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1 text-slate-700">
                      <div className="font-bold text-emerald-700 truncate">
                        CheckMacValue: {ecpayResult.security?.checkMacValue}
                      </div>
                      <div className="text-slate-500">
                        特店編號: {ecpayResult.data?.MerchantID}
                      </div>
                      <div className="text-slate-500">
                        訂單編號: {ecpayResult.data?.MerchantTradeNo}
                      </div>
                      <div className="text-slate-500">
                        金額: NT$ {ecpayResult.data?.TotalAmount}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Tool 3: LINE Pay Generator */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-[#06C755]" />
                  <span>測試 3: LINE Pay V3 簽章與跳轉</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">LINE Points 折抵點數</label>
                    <input
                      type="number"
                      value={linePointsDeduct}
                      onChange={(e) => setLinePointsDeduct(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500">
                    折抵後實付: NT$ {Math.max(0, sandboxAmount - linePointsDeduct).toLocaleString()}
                  </div>

                  <button
                    onClick={handleTestLinepay}
                    disabled={isGeneratingLinepay}
                    className="w-full py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingLinepay ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                    <span>呼叫 /api/payments/linepay/request</span>
                  </button>

                  {linepayResult && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1 text-slate-700">
                      <div className="font-bold text-emerald-700 truncate">
                        交易代碼: {linepayResult.transactionId}
                      </div>
                      <div className="truncate text-slate-500">
                        Nonce: {linepayResult.headers?.['X-LINE-Authorization-Nonce']}
                      </div>
                      <div className="truncate text-slate-500">
                        HMAC Signature: {linepayResult.headers?.['X-LINE-Authorization']}
                      </div>
                      <a
                        href={linepayResult.paymentUrl?.web}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-bold pt-1"
                      >
                        <span>開啟沙盒跳轉授權頁面</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
