import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Truck,
  Clock,
  MapPin,
  Copy,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { LanguageCode } from '../../types';

export interface LogisticsTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any;
  trackingNumber?: string;
  lang?: LanguageCode;
}

function formatOrderTime(raw?: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleString('zh-TW', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildClientFallbackTracking(order: any, fallbackTrackNo: string) {
  const status = String(order?.orderStatus || order?.status || 'pending').toLowerCase();
  const pay = String(order?.paymentStatus || '').toLowerCase();
  const gateway = String(order?.paymentGateway || order?.paymentMethod || '').toLowerCase();
  const isCod = gateway === 'cod';
  const method = String(order?.shippingMethod || '').toUpperCase();
  const carrierName = method.includes('FAMI')
    ? '全家便利商店店到店'
    : method.includes('HILIFE')
    ? '萊爾富超商取貨'
    : method.includes('OKMART')
    ? 'OK 超商取貨'
    : method.includes('HOME') || method.includes('TCAT')
    ? '黑貓宅急便 / 宅配到府'
    : '7-ELEVEN 交貨便';

  const rawTrack = String(order?.trackingNumber || fallbackTrackNo || '').trim();
  const isDummyTrack =
    !rawTrack ||
    rawTrack === '77391829310' ||
    rawTrack.includes('77391829310') ||
    rawTrack.startsWith('MOCK') ||
    rawTrack.startsWith('TEST');
  const effectiveTracking = isDummyTrack ? '' : rawTrack;

  const isCancelled = status === 'cancelled' || status === 'canceled' || status === '已取消';
  const isReturning =
    status === 'returning' ||
    status === 'returned' ||
    status === 'return_requested' ||
    status === 'refunded' ||
    status === '退換貨';
  const isPaidVerified =
    !isCancelled &&
    (Boolean(order?.isVerifiedByNewebPay) || (pay === 'paid' && !isCod) || Boolean(order?.tradeNo && pay !== 'pending' && pay !== 'failed'));
  const isUnpaid =
    !isCancelled &&
    !isReturning &&
    !isCod &&
    !isPaidVerified &&
    (pay === 'pending' ||
      pay === 'unpaid' ||
      pay === 'awaiting_payment' ||
      pay === 'failed' ||
      status === 'new' ||
      status === 'pending' ||
      status === 'pending_payment' ||
      status === 'unpaid' ||
      !pay);

  const isDone = !isCancelled && !isUnpaid && (status === 'delivered' || status === 'completed' || status === '已完成');
  const isArrived = !isCancelled && !isUnpaid && !isDone && (status === 'arrived' || status === '已抵達門市');
  const isShip = !isCancelled && !isUnpaid && !isDone && !isArrived && (status === 'shipped' || status === 'shipping' || status === 'in_transit' || status === '運送中');

  const statusCode = isCancelled
    ? 'CANCELLED'
    : isReturning
    ? 'RETURNING'
    : isUnpaid
    ? 'UNPAID'
    : isDone
    ? 'COLLECTED'
    : isArrived
    ? 'ARRIVED_STORE'
    : isShip
    ? 'IN_TRANSIT'
    : 'PICKING';

  const currentStatus = isCancelled
    ? '訂單已取消（未出貨）'
    : isReturning
    ? '售後／退換貨處理中'
    : isUnpaid
    ? '待付款（尚未核帳出貨）'
    : isDone
    ? '買家已完成確認收貨'
    : isArrived
    ? '包裹已抵達指定取件地點'
    : isShip
    ? '包裹運送中'
    : '倉庫揀貨備貨中';

  const paymentBadge = isCancelled
    ? '已取消'
    : isUnpaid
    ? '待付款 · 尚未核帳'
    : isPaidVerified
    ? '已核帳'
    : isCod
    ? '貨到付款'
    : '已完成結帳';

  const createdStr = formatOrderTime(order?.createdAt) || '已建檔';
  const paidStr = formatOrderTime(order?.payTime || order?.paidAt);

  const timeline: Array<{ title: string; desc: string; time: string; status: 'done' | 'current' | 'upcoming'; location?: string }> = [];

  if (Array.isArray(order?.trackingEvents) && order.trackingEvents.length > 0) {
    for (const ev of order.trackingEvents) {
      timeline.push({
        title: String(ev.title || ev.status || '物流狀態更新'),
        desc: String(ev.desc || ev.description || ''),
        time: formatOrderTime(ev.time || ev.timestamp) || '系統紀錄',
        status: ev.status === 'done' || ev.status === 'current' || ev.status === 'upcoming' ? ev.status : 'done',
        location: ev.location ? String(ev.location) : undefined,
      });
    }
  } else if (isCancelled) {
    timeline.push({
      title: '訂單已建立',
      desc: `訂單編號 ${order?.orderNumber || order?.id || ''} 已於系統建立。`,
      time: createdStr,
      status: 'done',
    });
    timeline.push({
      title: '訂單已取消（未出貨）',
      desc: '此訂單已取消，不會進行扣款或安排物流出貨。',
      time: formatOrderTime(order?.cancelledAt) || '已取消',
      status: 'current',
    });
  } else if (isUnpaid) {
    timeline.push({
      title: '訂單已建立（等待付款中）',
      desc: '系統已保留訂單，目前尚未收到付款入帳通知，倉庫尚未進行備貨或交付物流。',
      time: createdStr,
      status: 'current',
      location: '神狗勾 3D 訂單系統',
    });
  } else {
    timeline.push({
      title: isCod ? '訂單成立（貨到付款）' : isPaidVerified ? '訂單成立並完成款項核帳' : '訂單已成立',
      desc: order?.tradeNo
        ? `藍新交易序號：${order.tradeNo}，款項已確認。`
        : isCod
        ? '已選擇取貨／宅配貨到付款，待倉庫安排出貨。'
        : '訂單款項已確認，進入倉庫備貨排程。',
      time: paidStr || createdStr,
      status: isShip || isArrived || isDone || isReturning ? 'done' : 'current',
      location: '神狗勾 3D 訂單系統',
    });

    timeline.push({
      title: isShip || isArrived || isDone ? '倉庫備貨與防潮密封包裝完成' : '倉庫揀貨與防潮密封包裝中',
      desc:
        isShip || isArrived || isDone
          ? '已完成出庫品質檢驗與防潮密封包裝。'
          : '訂單正在排入台灣現貨倉備貨中，交寄後將更新託運單號。',
      time: isShip || isArrived || isDone ? '已完成備貨' : '待出貨處理中',
      status: isShip || isArrived || isDone || isReturning ? 'done' : 'current',
      location: '神狗勾台灣現貨倉',
    });

    if (isShip || isArrived || isDone) {
      timeline.push({
        title: `${carrierName} 配送中`,
        desc: effectiveTracking
          ? `包裹已交付物流運送中（單號：${effectiveTracking}），可前往物流官網查詢即時掃描紀錄。`
          : '包裹已標記為出貨配送中，正送往指定取件地點。',
        time: formatOrderTime(order?.shippedAt) || (effectiveTracking ? `單號：${effectiveTracking}` : '已出貨配送'),
        status: isArrived || isDone ? 'done' : 'current',
        location: order?.storeOrAddress || order?.shippingAddress || '指定取件地點',
      });
    }

    if (isArrived) {
      timeline.push({
        title: '包裹已抵達指定取件地點',
        desc: `包裹已抵達 ${order?.storeOrAddress || order?.shippingAddress || '指定取件地點'}，請留意取件通知並攜帶證件領取。`,
        time: formatOrderTime(order?.arrivedAt) || '待領取',
        status: 'current',
        location: order?.storeOrAddress || order?.shippingAddress,
      });
    }

    if (isDone) {
      timeline.push({
        title: '買家已完成取件／確認收貨',
        desc: '感謝您的訂購，本筆訂單已完成收貨確認。',
        time: formatOrderTime(order?.deliveredAt || order?.completedAt) || '已確認收貨',
        status: 'done',
        location: order?.storeOrAddress || order?.shippingAddress,
      });
    }

    if (isReturning) {
      timeline.push({
        title: '已提交售後／退換貨申請',
        desc: order?.afterSalesReason ? `申請原因：${order.afterSalesReason}` : '客服專員正在受理此訂單售後申請。',
        time: formatOrderTime(order?.afterSalesRequestedAt) || '受理中',
        status: 'current',
      });
    }
  }

  return {
    carrierName,
    statusCode,
    currentStatus,
    paymentBadge,
    orderNumber: order?.orderNumber || order?.id || '',
    trackingNumber: effectiveTracking,
    storeOrAddress: order?.storeOrAddress || order?.shippingAddress || '尚未填寫取件門市 / 地址',
    estimatedArrival: isCancelled
      ? '訂單已取消（未安排出貨）'
      : isReturning
      ? '售後申請受理中，客服專員將協助處理'
      : isUnpaid
      ? '尚未完成付款，完成結帳入帳後才會進入備貨並配發物流單號'
      : isDone
      ? order?.deliveredAt || order?.completedAt
        ? `確認收貨時間：${formatOrderTime(order.deliveredAt || order.completedAt)}`
        : '已完成確認收貨'
      : isShip || isArrived
      ? effectiveTracking
        ? '已交寄物流運送中，請可至物流官網查詢即時貨態'
        : '包裹已交寄配送中'
      : '付款完成後預計 1 - 2 個工作天內完成備貨寄出',
    isVerifiedByNewebPay: isPaidVerified,
    officialInquiryUrl: effectiveTracking
      ? method.includes('FAMI')
        ? 'https://www.famiport.com.tw/Web_Famiport/page/process.aspx'
        : method.includes('HOME') || method.includes('TCAT')
        ? 'https://www.t-cat.com.tw/Inquire/Trace.aspx'
        : method.includes('HILIFE')
        ? 'https://www.hilife.com.tw/serviceInfo_search.aspx'
        : method.includes('OKMART')
        ? 'https://www.okmart.com.tw/convenient_packet'
        : 'https://eservice.7-11.com.tw/E-Tracking/search.aspx'
      : '',
    timeline,
  };
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
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const response = await fetch('/api/logistics/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          orderId: order?.id || effectiveOrderNumber,
          orderNumber: effectiveOrderNumber,
          trackingNumber: effectiveTracking,
          shippingMethod: order?.shippingMethod,
          storeOrAddress: order?.storeOrAddress || order?.shippingAddress,
          orderStatus: order?.orderStatus || order?.status,
          paymentStatus: order?.paymentStatus,
          paymentGateway: order?.paymentGateway || order?.paymentMethod,
          isVerifiedByNewebPay: order?.isVerifiedByNewebPay,
          createdAt: order?.createdAt,
          payTime: order?.payTime || order?.paidAt,
          shippedAt: order?.shippedAt,
          arrivedAt: order?.arrivedAt,
          deliveredAt: order?.deliveredAt || order?.completedAt,
          cancelledAt: order?.cancelledAt,
          afterSalesRequestedAt: order?.afterSalesRequestedAt,
          afterSalesReason: order?.afterSalesReason,
          trackingEvents: order?.trackingEvents,
          customerName: order?.customerName,
          tradeNo: order?.tradeNo,
          amt: order?.totalAmount || order?.total || order?.subtotal,
        }),
      }).finally(() => clearTimeout(timer));

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data?.success && data?.tracking) {
          setTrackingData(data.tracking);
          return;
        }
      }

      if (!order && effectiveTracking) {
        const fbCtrl = new AbortController();
        const fbTimer = setTimeout(() => fbCtrl.abort(), 2000);
        const fallbackRes = await fetch(
          `/api/logistics/track/${encodeURIComponent(effectiveTracking)}`,
          { signal: fbCtrl.signal }
        ).finally(() => clearTimeout(fbTimer));
        const fbType = fallbackRes.headers.get('content-type') || '';
        if (fallbackRes.ok && fbType.includes('application/json')) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.success && fallbackData?.tracking) {
            setTrackingData(fallbackData.tracking);
            return;
          }
        }
      }

      if (order) {
        setTrackingData(buildClientFallbackTracking(order, effectiveTracking));
      } else {
        setErrorMsg('目前查無該託運單號的出貨紀錄，請確認單號或直接至物流官網查詢。');
      }
    } catch {
      if (order) {
        setTrackingData(buildClientFallbackTracking(order, effectiveTracking));
      } else {
        setErrorMsg('目前無法查詢該單號，請稍後重試。');
      }
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

  const modalNode = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-0 bg-slate-950/70"
          />

          {/* Foreground Container */}
          <div
            className="relative z-10 flex min-h-full items-end sm:items-center justify-center p-2 sm:p-5"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88dvh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2 flex-wrap">
                      <span>訂單與物流配送狀態</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                      依據真實訂單付款與出貨進度顯示
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={fetchTracking}
                    disabled={isLoading}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                    title="重新整理物流狀態"
                  >
                    <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="關閉"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/70 dark:bg-slate-950/60">
                {isLoading && !trackingData ? (
                  <div className="py-14 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                      <RotateCw className="w-6 h-6 animate-spin" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      正在查詢訂單與物流狀態...
                    </h4>
                  </div>
                ) : errorMsg ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">物流查詢提醒</h4>
                        <p className="text-xs text-amber-700 mt-1">{errorMsg}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchTracking}
                      className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>重新查詢</span>
                    </button>
                  </div>
                ) : trackingData ? (
                  <>
                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            {trackingData.carrierName}
                          </span>
                          {trackingData.isVerifiedByNewebPay ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{trackingData.paymentBadge || '已核帳'}</span>
                            </span>
                          ) : trackingData.statusCode === 'UNPAID' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>{trackingData.paymentBadge || '待付款 · 尚未核帳'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              <span>{trackingData.paymentBadge || '訂單檢視'}</span>
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                            trackingData.statusCode === 'UNPAID'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : trackingData.statusCode === 'CANCELLED'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : trackingData.statusCode === 'COLLECTED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800'
                          }`}
                        >
                          {trackingData.currentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          <div className="text-[10px] font-bold text-slate-400">訂單編號</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {trackingData.orderNumber || order?.orderNumber || order?.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(trackingData.orderNumber || order?.orderNumber || order?.id, 'order')}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
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

                        <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          <div className="text-[10px] font-bold text-slate-400">包裹託運單號</div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span
                              className={`font-mono text-xs truncate ${
                                trackingData.trackingNumber
                                  ? 'font-black text-indigo-600 dark:text-indigo-400'
                                  : 'font-semibold text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {trackingData.trackingNumber ||
                                (trackingData.statusCode === 'CANCELLED'
                                  ? '未配發（訂單已取消）'
                                  : trackingData.statusCode === 'UNPAID'
                                  ? '待付款完成後配發'
                                  : '待倉庫出貨配號')}
                            </span>
                            {trackingData.trackingNumber && (
                              <button
                                type="button"
                                onClick={() => handleCopy(trackingData.trackingNumber, 'tracking')}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 ml-1"
                                title="複製託運單號"
                              >
                                {copiedKey === 'tracking' ? (
                                  <span className="text-[9px] text-emerald-600 font-bold">已複製</span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-0.5 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-400 text-[11px]">取件門市 / 地址：</span>
                          <strong className="text-slate-800 dark:text-slate-100 ml-1 break-words">
                            {trackingData.storeOrAddress || order?.storeOrAddress || '尚未填寫'}
                          </strong>
                        </div>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          trackingData.statusCode === 'UNPAID'
                            ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                            : trackingData.statusCode === 'CANCELLED'
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-bold text-[11px]">{trackingData.estimatedArrival}</span>
                        </div>
                        {trackingData.officialInquiryUrl && trackingData.trackingNumber && (
                          <a
                            href={trackingData.officialInquiryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline shrink-0 ml-2"
                          >
                            <span>官網查詢</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span>配送進度時間軸</span>
                        </h4>
                      </div>

                      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                        {trackingData.timeline?.map((step: any, idx: number) => {
                          const isDone = step.status === 'done';
                          const isCurrent = step.status === 'current';

                          return (
                            <div key={idx} className="relative">
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
                                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  </div>
                                )}
                              </div>

                              <div className={`space-y-1 ${isCurrent ? 'bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50' : ''}`}>
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <h5 className={`font-black text-xs sm:text-sm ${
                                    isCurrent ? 'text-indigo-900 dark:text-indigo-200' : isDone ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
                                  }`}>
                                    {step.title}
                                  </h5>
                                  <span className={`text-[11px] font-mono ${
                                    isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
                                  }`}>
                                    {step.time}
                                  </span>
                                </div>

                                <p className={`text-xs leading-relaxed ${
                                  isCurrent ? 'text-indigo-950 dark:text-slate-200 font-medium' : isDone ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'
                                }`}>
                                  {step.desc}
                                </p>

                                {step.location && (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1">
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
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  關閉視窗
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
};
