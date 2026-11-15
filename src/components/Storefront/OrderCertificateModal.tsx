import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Receipt,
  Download,
  FileText,
  CheckCircle2,
  Package,
} from 'lucide-react';
import {
  generateOrderCertificate,
  downloadOrderProofJSON,
  downloadOrderProofPDF,
  OrderCertificate,
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
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const cert: OrderCertificate = generateOrderCertificate(order);

  const rawStatus = String(order.orderStatus || order.status || '').toLowerCase();
  const rawPay = String(order.paymentStatus || '').toLowerCase();
  const statusDisplay =
    rawStatus === 'cancelled' || rawStatus === 'canceled'
      ? { label: '已取消', cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' }
      : rawPay === 'pending' || rawPay === 'unpaid' || rawStatus === 'new' || rawStatus === 'pending'
      ? { label: '待付款', cls: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' }
      : rawStatus === 'completed' || rawStatus === 'delivered'
      ? { label: '已完成', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' }
      : { label: '已付款', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' };

  const formattedDate = (() => {
    try {
      const d = new Date(cert.orderSummary.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {}
    return cert.orderSummary.createdAt;
  })();

  const rawInvoice = String(cert.orderSummary.payment.invoiceNumber || '');
  const displayInvoice =
    !rawInvoice || rawInvoice.startsWith('PENDING') ? '付款完成後自動開立' : rawInvoice;

  const handleDownloadJSON = () => {
    downloadOrderProofJSON(order);
    setDownloadSuccess('已下載訂單憑證檔案 (.JSON)');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadPDF = () => {
    downloadOrderProofPDF(order);
    setDownloadSuccess('已開啟列印 / 另存 PDF 視窗');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-5 select-none cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative cursor-default select-text flex flex-col max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white truncate">
                  訂單電子憑證
                </h2>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusDisplay.cls}`}>
                  {statusDisplay.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {cert.orderSummary.orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉憑證視窗"
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {downloadSuccess && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Clean Order Details */}
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3.5">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">訂單資訊</span>
              <span className="font-mono text-slate-400 text-[11px]">{formattedDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">訂單編號</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 break-all">
                  {cert.orderSummary.orderNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">訂購人</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {cert.orderSummary.customer.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">發票狀態</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {displayInvoice}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">實付總金額</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  NT$ {cert.orderSummary.payment.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">收件門市 / 地址</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 break-words">
                  {cert.orderSummary.fulfillment.destination}
                </span>
              </div>
              {cert.orderSummary.fulfillment.trackingNumber && (
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">物流託運單號</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {cert.orderSummary.fulfillment.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {cert.orderSummary.items && cert.orderSummary.items.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>商品明細 ({cert.orderSummary.items.length} 項)</span>
                </div>
                <div className="space-y-1.5">
                  {cert.orderSummary.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/50 px-2.5 py-2 rounded-xl"
                    >
                      <span className="truncate font-medium">
                        {item.name}
                        {item.colorName ? ` (${item.colorName})` : ''}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                        <span className="text-slate-400">x{item.quantity}</span>
                        {item.price > 0 && (
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            NT$ {(item.price * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2.5 shrink-0">
          <button
            id="btn-download-order-proof-json"
            type="button"
            onClick={handleDownloadJSON}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>下載明細 (.JSON)</span>
          </button>

          <button
            id="btn-download-order-proof-pdf"
            type="button"
            onClick={handleDownloadPDF}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>列印 / 匯出 PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
