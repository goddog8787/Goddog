import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  RotateCw, 
  Package, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { LanguageCode } from '../../types';

export interface LogisticsTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any;
  trackingNumber?: string;
  lang?: LanguageCode;
}

export const LogisticsTimelineModal: React.FC<LogisticsTimelineModalProps> = ({
  isOpen,
  onClose,
  order,
  trackingNumber: propTrackingNumber,
  lang = 'zh-TW',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchTracking = useCallback(async () => {
    if (!order && !propTrackingNumber) return;

    setIsLoading(true);
    setErrorMsg(null);

    const effectiveOrderNumber = order?.orderNumber || order?.id || '';
    const effectiveTracking = order?.trackingNumber || propTrackingNumber || '';

    try {
      const response = await fetch('/api/logistics/track-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order?.id || effectiveOrderNumber,
          orderNumber: effectiveOrderNumber,
          trackingNumber: effectiveTracking,
          shippingMethod: order?.shippingMethod,
          storeOrAddress: order?.storeOrAddress,
          orderStatus: order?.orderStatus || order?.status,
          createdAt: order?.createdAt,
          customerName: order?.customerName,
          tradeNo: order?.tradeNo,
          amt: order?.totalAmount || order?.total || order?.subtotal,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.tracking) {
        setTrackingData(data.tracking);
      } else {
        // Fallback to GET tracking route if POST fails
        const fallbackRes = await fetch(`/api/logistics/track/${encodeURIComponent(effectiveTracking || effectiveOrderNumber)}`);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success && fallbackData.tracking) {
          setTrackingData(fallbackData.tracking);
        } else {
          setErrorMsg(data.message || fallbackData.message || '無法取得該筆訂單之物流狀態，請稍候重試。');
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch logistics timeline:', err);
      setErrorMsg('連線物流查詢伺服器異常，請確認網路連線或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  }, [order, propTrackingNumber]);

  useEffect(() => {
    if (isOpen) {
      fetchTracking();
    } else {
      setTrackingData(null);
      setErrorMsg(null);
    }
  }, [isOpen, fetchTracking]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl transform overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white text-left align-middle shadow-2xl border border-slate-100 transition-all flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sky-400 shadow-inner">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                    <span>即時物流配送軌跡</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Live Tracking
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium">
                    台灣超商 / 宅配物流全流程數位時間軸追蹤
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                <button
                  onClick={fetchTracking}
                  disabled={isLoading}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="重新整理物流狀態"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/60">
              {isLoading && !trackingData ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <RotateCw className="w-7 h-7 animate-spin" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">正在連線台灣物流系統查詢最新軌跡...</h4>
                  <p className="text-xs text-slate-400">核對藍新金流電子託運單與超商大宗集散中心數據</p>
                </div>
              ) : errorMsg ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-amber-900">物流檢索提醒</h4>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">{errorMsg}</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchTracking}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>重新連線查詢</span>
                  </button>
                </div>
              ) : trackingData ? (
                <>
                  {/* Summary Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {trackingData.carrierName}
                        </span>
                        {trackingData.isVerifiedByNewebPay && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>藍新金流已核銷</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {trackingData.currentStatus?.split(' ')[0] || '配送中'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">訂單編號</div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono text-xs font-bold text-slate-800 truncate">
                            {trackingData.orderNumber || order?.orderNumber || order?.id}
                          </span>
                          <button
                            onClick={() => handleCopy(trackingData.orderNumber || order?.orderNumber || order?.id, 'order')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
                            title="複製訂單編號"
                          >
                            {copiedKey === 'order' ? (
                              <span className="text-[9px] text-emerald-600 font-bold">已複製</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">包裹託運單號</div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono text-xs font-black text-indigo-600 truncate">
                            {trackingData.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(trackingData.trackingNumber, 'tracking')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
                            title="複製託運單號"
                          >
                            {copiedKey === 'tracking' ? (
                              <span className="text-[9px] text-emerald-600 font-bold">已複製</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Destination Store / Address */}
                    <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-slate-400 text-[11px]">取件門市 / 地址：</span>
                        <strong className="text-slate-800 ml-1">{trackingData.storeOrAddress || order?.storeOrAddress || '指定超商門市'}</strong>
                      </div>
                    </div>

                    {/* Estimated Arrival Banner */}
                    <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-bold text-[11px]">{trackingData.estimatedArrival}</span>
                      </div>
                      {trackingData.officialInquiryUrl && (
                        <a
                          href={trackingData.officialInquiryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 ml-2"
                        >
                          <span>官網系統查詢</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>配送軌跡時間軸</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        按時間倒序排序
                      </span>
                    </div>

                    {/* Vertical Timeline */}
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {trackingData.timeline?.map((step: any, idx: number) => {
                        const isDone = step.status === 'done';
                        const isCurrent = step.status === 'current';

                        return (
                          <div key={idx} className="relative group">
                            {/* Marker Node */}
                            <div className="absolute -left-6 top-0.5 flex items-center justify-center">
                              {isDone ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : isCurrent ? (
                                <div className="relative flex items-center justify-center">
                                  <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-indigo-400 opacity-75"></span>
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md relative z-10">
                                    <Truck className="w-2.5 h-2.5" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                </div>
                              )}
                            </div>

                            {/* Content Block */}
                            <div className={`space-y-1 transition-all ${isCurrent ? 'bg-indigo-50/50 p-3 rounded-xl border border-indigo-100' : ''}`}>
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <h5 className={`font-black text-xs sm:text-sm ${
                                  isCurrent ? 'text-indigo-900' : isDone ? 'text-slate-800' : 'text-slate-400'
                                }`}>
                                  {step.title}
                                </h5>
                                <span className={`text-[11px] font-mono ${
                                  isCurrent ? 'text-indigo-600 font-bold' : 'text-slate-400'
                                }`}>
                                  {step.time}
                                </span>
                              </div>

                              <p className={`text-xs leading-relaxed ${
                                isCurrent ? 'text-indigo-950 font-medium' : isDone ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                                {step.desc}
                              </p>

                              {step.location && (
                                <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{step.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Friendly Pickup Notice */}
                  <div className="bg-slate-100/80 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>取件重要提醒：</span>
                    </p>
                    <p className="leading-relaxed">
                      包裹配達取件超商門市時，系統將自動向收件人手機發送取件簡訊。請於到店日起 7 日內攜帶與訂單收件人姓名完全一致之有效身分證件正本（身分證、駕照或健保卡）前往取件。
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                PrintCore Logistics Network • SSL Protected
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
              >
                關閉視窗
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
