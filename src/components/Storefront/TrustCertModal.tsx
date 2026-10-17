import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  FileCheck, 
  Landmark,
  PackageCheck
} from 'lucide-react';

interface TrustCertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustCertModal: React.FC<TrustCertModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'payment' | 'consumer' | 'antifraud'>('payment');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none cursor-pointer"
      onClick={onClose}
      title="點擊背景空白處關閉"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative cursor-default select-text flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">買家交易安全與購物保障說明</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                  ✓ 全站安全加密
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                藍新金流安全代收・7 天猶豫鑑賞期・警政署 165 防詐欺保護
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-1.5 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>金流資安防護</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('consumer')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'consumer'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>7 天鑑賞期與退款</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('antifraud')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'antifraud'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-300 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>165 全民防詐提醒</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-emerald-950 dark:text-emerald-200 text-sm">
                    第三方專業金流代收代付・交易安全保障
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300 mt-1 leading-relaxed">
                    本網站全數線上金流委託第三方金流平台代收，支援各大銀行信用卡、LINE Pay、Apple Pay 等多元付款方式。款項由第三方金流安全保管，給買賣雙方最安心的交易保障。
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">PCI-DSS Level 1 國際支付卡最高等級資安</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      採用 TLS 1.3 256-bit 高規格強固加密傳輸，確保任何付款過程資料不被攔截或外洩。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">3D-Secure 2.0 動態簡訊 OTP 驗證防盜刷</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      刷卡時由發卡銀行發送簡訊動態密碼，只有持卡人本人輸入正確驗證碼才能完成交易，杜絕冒用盜刷。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">零卡號儲存承諾 (Zero Card Data Storage)</h5>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      本網站之資料庫不儲存任何信用卡卡號與安全碼（CVV）。所有付款授權均在金流端安全完成 Token 代碼交換。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consumer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-amber-950 dark:text-amber-200 text-sm">
                    依法保障 7 天猶豫鑑賞期・新品瑕疵保證換新
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300 mt-1 leading-relaxed">
                    依消費者保護法規定，您於本商城購買之商品享有到貨次日起算 7 天猶豫鑑賞期。收到商品若有任何疑問，歡迎隨時聯繫客服。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    耗材全新密封・破損瑕疵補寄
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    若收件時發現線材真空包裝受損漏氣或品質瑕疵，拍照聯繫客服，我們將免費補寄新品。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    7 天鑑賞退貨退款承諾
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    於 7 天鑑賞期內未拆封商品申請退貨，雙方確認退件後，將儘速為您辦理原路刷退或退款。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 sm:col-span-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    完整訂單收據與雲端發票 / 載具開立
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    每筆訂單均可下載專屬電子收據憑證，支援手機條碼載具與統編填寫，購買明細清楚透明。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'antifraud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-rose-950 dark:text-rose-200 text-sm">
                    警政署 165 全民防騙網・反詐騙安全提醒
                  </h4>
                  <p className="text-xs text-rose-800/80 dark:text-rose-300 mt-1 leading-relaxed">
                    常見詐騙手法常假冒電商客服或銀行人員進行電話詐騙。請謹記以下防詐騙「三不原則」，保障您的資產安全：
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-extrabold shrink-0">
                    絕不
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    我們絕不會打電話通知您「誤設為批發商 / 分期重複扣款」並要求至 ATM 操作解除。
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-extrabold shrink-0">
                    絕不
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    我們絕不會要求您操作網路銀行 App、提供網銀帳號密碼、或簡訊 OTP 驗證碼。
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-extrabold shrink-0">
                    絕不
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    我們絕不會要求您購買遊戲點數、App Store 禮品卡或轉移虛擬貨幣。
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    接獲任何疑義電話，請保持冷靜，立即掛斷並撥打：
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-mono font-black text-sm shadow-xs">
                    165 反詐騙專線
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>全站交易受第三方金流加密系統保護</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
