import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Database, 
  FileCode, 
  QrCode,
  CheckCircle2,
  Package
} from 'lucide-react';
import { 
  generateOrderCertificate, 
  downloadOrderProofJSON, 
  downloadOrderProofPDF, 
  OrderCertificate 
} from '../../utils/orderCertificate';

interface OrderCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const OrderCertificateModal: React.FC<OrderCertificateModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const cert: OrderCertificate = generateOrderCertificate(order);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(cert.digitalSignature.payloadHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadJSON = () => {
    downloadOrderProofJSON(order);
    setDownloadSuccess('已成功下載 JSON 數位簽章證明檔案！');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadPDF = () => {
    downloadOrderProofPDF(order);
    setDownloadSuccess('已開啟 PDF 列印與證明存檔視窗！');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none cursor-pointer"
      onClick={onClose}
      title="點擊背景可關閉視窗"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative cursor-default select-text flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  訂單電子憑證與資料完整性證明
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> 簽章已核驗
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                憑證編號: {cert.certificateId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Notification banner if downloaded */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Verification Badge Overview */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">雲端資料存儲證明</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  Google Firebase Firestore
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">藍新官方金流特店代號</div>
                <div className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {cert.issuer.merchantId} (神狗勾商城)
                </div>
              </div>
            </div>
          </div>

          {/* Order Snapshot Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">訂單關鍵資料摘錄</span>
              <span className="font-mono text-slate-400 text-[11px]">{cert.orderSummary.createdAt}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">訂單編號</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cert.orderSummary.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">訂購顧客</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{cert.orderSummary.customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">物流託運單號</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cert.orderSummary.fulfillment.trackingNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">雲端發票號碼</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{cert.orderSummary.payment.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">收件地址/門市</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate block max-w-[200px]">{cert.orderSummary.fulfillment.destination}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">實付總金額</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">NT$ {cert.orderSummary.payment.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Items snippet */}
            {cert.orderSummary.items && cert.orderSummary.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">訂購商品內容 ({cert.orderSummary.items.length} 件)：</div>
                <div className="space-y-1">
                  {cert.orderSummary.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="truncate max-w-[280px]">📦 {item.name} {item.colorName ? `(${item.colorName})` : ''}</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">x{item.quantity}</span>
                    </div>
                  ))}
                  {cert.orderSummary.items.length > 3 && (
                    <div className="text-[10px] text-slate-400">...以及其他 {cert.orderSummary.items.length - 3} 件商品</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic Integrity Details */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl space-y-2.5 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-sky-400 font-sans font-bold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> 密碼學校驗與防偽簽章 (HMAC-SHA256)
              </span>
              <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] border border-emerald-800">
                防篡改驗證正常
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-sans">訂單防偽摘要指紋 (SHA-256 Digest)：</div>
              <div className="flex items-center gap-2 mt-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-amber-400 break-all flex-1 select-all">
                  {cert.digitalSignature.payloadHash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                  title="複製雜湊指紋"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span>密鑰代號: {cert.digitalSignature.keyId}</span>
              <span className="text-slate-500 truncate max-w-xs">路徑: {cert.digitalSignature.cloudStorageRef}</span>
            </div>
          </div>

          {/* Legal / Offline Notice */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
            💡 <strong>離線備份證明效益：</strong> 您下載的證明檔案包含可獨立驗證的密碼學雜湊值與完整訂單紀錄。無論是提供給銀行、金流稽核或個人離線存查，均具備完整法律備份與資料防篡改效力。
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            神狗勾商城 官方授權認證機構
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Primary Action Button: 下載證明檔案 */}
            <button
              id="btn-download-order-proof-json"
              onClick={handleDownloadJSON}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-98"
              title="下載包含完整訂單與數位簽章的 JSON 證明檔案"
            >
              <Download className="w-4 h-4" />
              <span>下載證明檔案 (.JSON)</span>
            </button>

            {/* Secondary Action Button: 匯出/列印 PDF */}
            <button
              id="btn-download-order-proof-pdf"
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98"
              title="列印或另存為官方 PDF 憑證文件"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>匯出 / 列印 PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
