import { getDocs, getDoc, setDoc, query, collection, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  loadCustomerUserData,
  saveCustomerUserData,
  loadCustomerRecentlyViewed,
  clearCustomerRecentlyViewed,
  deleteSingleCustomerRecentlyViewed,
  getStoredRecentlyViewedSync,
  saveCustomerOrderRecord,
  isMemberVipActive,
} from '../../lib/customerPersistence';
import { isMockOrder, getGenuineUserOrders } from '../../lib/orderVerification';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { formatPrice, translateProductName, translateMaterial } from '../../utils/i18n';
import { LanguageCode, CurrencyCode } from '../../types';
import {
  PRINTER_BRANDS,
  PRINTER_PROFILES,
  PrinterProfile,
  findPrinterProfile,
  getPrintersByBrand,
} from '../../data/printerProfiles';
import {
  auth,
  db,
  generateUserReferralCode,
  saveUserProfileToFirestore,
  bindReferralCodeForUser,
  processReferralOrderReward,
  deleteCustomerAccountAndData,
} from '../../lib/firebase';
import { TaiwanAddressInput } from '../../components/Storefront/TaiwanAddressInput';
import { getStoreCoupons, validateCoupon } from '../../utils/couponManager';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  X,
  MapPin,
  Printer,
  Package,
  Copy,
  Share2,
  Medal,
  Lock,
  Bell,
  Check,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  CreditCard,
  ShoppingCart,
  Gift,
  Ticket,
  Download,
  ChevronDown,
  Star,
  Zap,
  Palette,
  Layers,
  Users,
  Calendar,
  Sliders,
  Truck,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { OrderCertificateModal } from '../../components/Storefront/OrderCertificateModal';
import { LogisticsTimelineModal } from '../../components/Storefront/LogisticsTimelineModal';

const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" />
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-x-0 bottom-0 z-50 bg-slate-50 dark:bg-slate-950 rounded-t-[28px] overflow-hidden flex flex-col max-w-2xl mx-auto shadow-2xl" style={{ maxHeight: '90vh' }}>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight text-balance truncate">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉視窗"
              className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 pb-24">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export function classifyOrderStatusLabel(o: any): '待付款' | '待出貨' | '運送中' | '已完成' | '退換貨' {
  const s = String(o?.orderStatus || o?.status || '').toLowerCase();
  const pay = String(o?.paymentStatus || '').toLowerCase();
  if (
    s === 'returning' ||
    s === 'returned' ||
    s === 'return_requested' ||
    s === 'refunded' ||
    s === 'cancelled' ||
    s === '退換貨'
  ) {
    return '退換貨';
  }
  if (pay === 'unpaid' || s === 'unpaid' || s === 'pending_payment' || s === '待付款') {
    return '待付款';
  }
  if (s === 'completed' || s === 'delivered' || s === '已完成') {
    return '已完成';
  }
  if (s === 'shipping' || s === 'shipped' || s === 'in_transit' || s === '運送中') {
    return '運送中';
  }
  return '待出貨';
}

export const OrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  orders?: any[];
  setOrders?: (orders: any) => void;
  member?: any;
  setMember?: (member: any) => void;
  onConfirmReceipt?: (orderId: string) => Promise<void> | void;
  onGoReview?: (productId: string) => void;
  onOpenTracking?: (trackingNumber: string) => void;
  onOpenSupport?: (prompt?: string) => void;
}> = ({
  isOpen,
  onClose,
  initialTab = 'all',
  orders = [],
  setOrders,
  member,
  setMember,
  onConfirmReceipt,
  onGoReview,
  onOpenTracking,
  onOpenSupport,
}) => {
  const [tab, setTab] = useState(initialTab);
  const [syncedOrders, setSyncedOrders] = useState<any[]>([]);
  const [selectedCertOrder, setSelectedCertOrder] = useState<any | null>(null);
  const [selectedLogisticsOrder, setSelectedLogisticsOrder] = useState<any | null>(null);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [reviewingOrder, setReviewingOrder] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [afterSalesOrder, setAfterSalesOrder] = useState<any | null>(null);
  const [afterSalesReason, setAfterSalesReason] = useState<string>('線材規格/顏色換貨申請');
  const [afterSalesNote, setAfterSalesNote] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Real-time merge of in-memory orders + localStorage orders + Firestore orders
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getGenuineUserOrders(orders)
      .then((cloudMerged) => {
        if (cancelled) return;
        const map = new Map<string, any>();
        for (const o of orders) {
          if (o && !isMockOrder(o)) {
            map.set(o.orderNumber || o.id, o);
          }
        }
        for (const co of cloudMerged) {
          if (co && !isMockOrder(co)) {
            const key = co.orderNumber || co.id;
            const existing = map.get(key);
            map.set(key, existing ? { ...co, ...existing } : co);
          }
        }
        const mergedList = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setSyncedOrders(mergedList);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, orders, member?.id]);

  const effectiveOrders = useMemo(() => {
    const map = new Map<string, any>();
    for (const o of syncedOrders) {
      if (o && !isMockOrder(o)) map.set(o.orderNumber || o.id, o);
    }
    for (const o of orders) {
      if (o && !isMockOrder(o)) {
        const key = o.orderNumber || o.id;
        map.set(key, { ...(map.get(key) || {}), ...o });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [orders, syncedOrders]);

  const mappedOrders = useMemo(() => {
    return effectiveOrders.map((o) => {
      const statusLabel = classifyOrderStatusLabel(o);
      const isDone = statusLabel === '已完成';
      const isShip = statusLabel === '運送中';
      const isProc = statusLabel === '待出貨';
      const isRet = statusLabel === '退換貨';
      const isUnpaid = statusLabel === '待付款';

      return {
        raw: o,
        id: o.orderNumber || o.id,
        status: statusLabel,
        date: new Date(o.createdAt || Date.now()).toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: Array.isArray(o.items) ? o.items : [],
        total: Number(o.totalAmount ?? o.total ?? o.subtotal ?? 0),
        color: isUnpaid
          ? 'text-rose-600'
          : isDone
          ? 'text-emerald-600'
          : isRet
          ? 'text-amber-700'
          : 'text-indigo-600',
        bg: isUnpaid
          ? 'bg-rose-50 border border-rose-200'
          : isDone
          ? 'bg-emerald-50 border border-emerald-200'
          : isRet
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-indigo-50 border border-indigo-200',
        canConfirm: isShip || isProc,
        isDone,
        isRet,
        isUnpaid,
      };
    });
  }, [effectiveOrders]);

  const statusCounts = useMemo(() => {
    return {
      all: mappedOrders.length,
      unpaid: mappedOrders.filter((o) => o.status === '待付款').length,
      processing: mappedOrders.filter((o) => o.status === '待出貨').length,
      shipping: mappedOrders.filter((o) => o.status === '運送中').length,
      done: mappedOrders.filter((o) => o.status === '已完成').length,
      returning: mappedOrders.filter((o) => o.status === '退換貨').length,
    };
  }, [mappedOrders]);

  const tabs = [
    { id: 'all', label: '全部', count: statusCounts.all },
    { id: 'unpaid', label: '待付款', count: statusCounts.unpaid },
    { id: 'processing', label: '待出貨', count: statusCounts.processing },
    { id: 'shipping', label: '運送中', count: statusCounts.shipping },
    { id: 'done', label: '已完成', count: statusCounts.done },
    { id: 'returning', label: '退換貨', count: statusCounts.returning },
  ];

  const filtered =
    tab === 'all'
      ? mappedOrders
      : mappedOrders.filter((o) => {
          if (tab === 'unpaid') return o.status === '待付款';
          if (tab === 'processing') return o.status === '待出貨';
          if (tab === 'shipping') return o.status === '運送中';
          if (tab === 'done') return o.status === '已完成';
          if (tab === 'returning') return o.status === '退換貨';
          return true;
        });

  const persistOrderStateUpdate = async (targetOrder: any, patch: Record<string, any>) => {
    const updatedOrder = {
      ...targetOrder,
      ...patch,
    };
    setSyncedOrders((prev) =>
      prev.map((o) =>
        o.id === targetOrder.id || o.orderNumber === targetOrder.orderNumber ? updatedOrder : o
      )
    );
    if (setOrders) {
      setOrders((prev: any[]) =>
        Array.isArray(prev)
          ? prev.map((o) =>
              o.id === targetOrder.id || o.orderNumber === targetOrder.orderNumber
                ? updatedOrder
                : o
            )
          : [updatedOrder]
      );
    }
    if (member?.id && member.id !== 'guest') {
      saveCustomerOrderRecord(updatedOrder, member.id).catch(() => {});
    }
    try {
      await setDoc(
        doc(db, 'orders', targetOrder.id || targetOrder.orderNumber),
        {
          ...updatedOrder,
          status: patch.orderStatus || updatedOrder.orderStatus || updatedOrder.status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {}
    return updatedOrder;
  };

  const handlePayNow = async (rawOrder: any) => {
    setIsPayingId(rawOrder.id || rawOrder.orderNumber);
    try {
      const updated = await persistOrderStateUpdate(rawOrder, {
        paymentStatus: 'paid',
        orderStatus: 'picking',
        status: 'picking',
        paidAt: new Date().toISOString(),
      });
      showToast(`✅ 訂單 ${rawOrder.orderNumber || rawOrder.id} 付款成功！已進入揀貨待出貨狀態。`);

      // Also verify Stage 2 referral reward if this user was referred and just paid for their first order
      if (member?.id && member.id !== 'guest') {
        const refRes = await processReferralOrderReward(member, updated);
        if (refRes?.rewarded && refRes.updatedBuyerProfile && setMember) {
          setMember(refRes.updatedBuyerProfile);
          showToast(`付款成功並解鎖好友首購推薦獎勵 +50 狗勾幣`);
        }
      }
    } finally {
      setIsPayingId(null);
    }
  };

  const handleConfirm = async (orderId: string, rawOrder: any) => {
    setIsConfirmingId(orderId);
    try {
      if (onConfirmReceipt) {
        await onConfirmReceipt(orderId);
      }
      await persistOrderStateUpdate(rawOrder, {
        orderStatus: 'delivered',
        status: 'delivered',
        paymentStatus: 'paid',
        deliveredAt: new Date().toISOString(),
      });
      showToast(`🎉 已確認收貨！訂單移至「已完成」，您現在可以評價商品領取積分！`);
    } finally {
      setIsConfirmingId(null);
    }
  };

  const handleSubmitOrderReview = async () => {
    if (!reviewingOrder) return;
    const newReviewsCount = Number(member?.reviewsCount || 0) + 1;
    const rewardPts = 30;
    try {
      const localRevCount =
        parseInt(localStorage.getItem(`printcore_reviews_count_${member?.id || 'guest'}`) || '0', 10) || 0;
      localStorage.setItem(
        `printcore_reviews_count_${member?.id || 'guest'}`,
        String(Math.max(newReviewsCount, localRevCount + 1))
      );
    } catch {}

    await persistOrderStateUpdate(reviewingOrder, {
      isReviewed: true,
      reviewRating,
      reviewComment: reviewText || '出料非常順暢，線徑精準不卡頭，值得推薦！',
      reviewedAt: new Date().toISOString(),
    });

    if (member && setMember) {
      const updatedMember = {
        ...member,
        reviewsCount: newReviewsCount,
        points: Number(member.points || 0) + rewardPts,
      };
      setMember(updatedMember);
      saveUserProfileToFirestore(updatedMember);
    }

    showToast(`⭐ 感謝您的五星評價！已獲得 +${rewardPts} 點狗勾幣並更新「評價達人」成就進度！`);
    setReviewingOrder(null);
    setReviewText('');
  };

  const handleSubmitAfterSales = async () => {
    if (!afterSalesOrder) return;
    const updated = await persistOrderStateUpdate(afterSalesOrder, {
      orderStatus: 'returning',
      status: 'returning',
      afterSalesReason,
      afterSalesNote: afterSalesNote || '申請售後換貨服務',
      afterSalesRequestedAt: new Date().toISOString(),
    });
    showToast(`📋 訂單 ${updated.orderNumber || updated.id} 已提交售後申請，客服專員將優先為您處理！`);
    setAfterSalesOrder(null);
    setAfterSalesNote('');
    setTab('returning');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的訂單">
      {toastMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              tab === t.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Inline Review Form Modal */}
      {reviewingOrder && (
        <div className="mb-5 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>評價訂單 {reviewingOrder.orderNumber || reviewingOrder.id}（贈 +30 狗勾幣）</span>
            </h4>
            <button
              onClick={() => setReviewingOrder(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              關閉
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-amber-800 ml-1">{reviewRating}.0 顆星好評</span>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
            placeholder="分享您的列印體驗（例如：首層附著力佳、線徑穩定無氣泡...）"
            className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
          />
          <div className="flex justify-end gap-2">
            {reviewingOrder.items?.[0]?.productId && onGoReview && (
              <button
                type="button"
                onClick={() => {
                  const pid = reviewingOrder.items[0].productId;
                  setReviewingOrder(null);
                  onClose();
                  onGoReview(pid);
                }}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                前往商品頁完整曬圖
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmitOrderReview}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              送出評價領 +30 幣
            </button>
          </div>
        </div>
      )}

      {/* Inline After-Sales Request Form */}
      {afterSalesOrder && (
        <div className="mb-5 p-4 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-rose-950">
              申請售後退換貨（訂單：{afterSalesOrder.orderNumber || afterSalesOrder.id}）
            </h4>
            <button
              onClick={() => setAfterSalesOrder(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              關閉
            </button>
          </div>
          <select
            value={afterSalesReason}
            onChange={(e) => setAfterSalesReason(e.target.value)}
            className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="線材規格/顏色換貨申請">線材規格 / 顏色換貨申請</option>
            <option value="真空鋁箔袋受損免費補換">真空鋁箔袋受潮或受損免費補換</option>
            <option value="7天鑑賞期退貨退款申請">7 天鑑賞期退貨退款申請</option>
            <option value="列印卡料技術檢測與換新">列印卡料技術檢測與換新</option>
          </select>
          <textarea
            value={afterSalesNote}
            onChange={(e) => setAfterSalesNote(e.target.value)}
            rows={2}
            placeholder="請簡述欲更換的顏色或問題狀況，客服將為您安排免費逆物流收件..."
            className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-xs text-slate-800"
          />
          <div className="flex justify-end gap-2">
            {onOpenSupport && (
              <button
                type="button"
                onClick={() => {
                  const num = afterSalesOrder.orderNumber || afterSalesOrder.id;
                  setAfterSalesOrder(null);
                  onClose();
                  onOpenSupport(`您好，我想針對訂單【${num}】辦理售後服務（原因：${afterSalesReason}）`);
                }}
                className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>轉接線上客服</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmitAfterSales}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              提交售後單
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-slate-700 font-black truncate">{order.id}</span>
                  <button
                    onClick={() => handleCopy(order.id)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                    title="複製訂單編號"
                  >
                    {copiedText === order.id ? (
                      <span className="text-[10px] text-emerald-600 font-bold">已複製</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${order.color} ${order.bg}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {order.raw?.trackingNumber &&
                order.raw.trackingNumber !== '77391829310' &&
                !order.raw.trackingNumber.includes('77391829310') && (
                  <div className="mb-3 px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="text-[11px] text-slate-400 shrink-0">物流單號：</span>
                      <span className="font-mono font-bold text-slate-700 truncate">
                        {order.raw.trackingNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(order.raw.trackingNumber)}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                        title="複製物流單號"
                      >
                        {copiedText === order.raw.trackingNumber ? (
                          <span className="text-[10px] text-emerald-600 font-bold">已複製</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedLogisticsOrder(order.raw)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>即時貨態 ↗</span>
                    </button>
                  </div>
                )}

              {/* Rich Item List with Color, Diameter, Quantity, and Price */}
              <div className="space-y-2.5 mb-3">
                {order.items.map((item: any, idx: number) => {
                  const itemName = typeof item === 'string' ? item : item.name || '神狗勾 3D 列印耗材';
                  const itemColor = typeof item === 'object' ? item.color || item.selectedColor?.name : '';
                  const itemHex = typeof item === 'object' ? item.colorHex || item.selectedColor?.hex : '';
                  const itemDiameter = typeof item === 'object' ? item.diameter || item.selectedDiameter || '1.75mm' : '1.75mm';
                  const itemQty = typeof item === 'object' ? item.quantity || 1 : 1;
                  const itemPrice = typeof item === 'object' ? item.price || 0 : 0;
                  const itemImg = typeof item === 'object' ? item.image || item.imageUrl : '';

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {itemImg ? (
                          <img
                            src={getSafeProductImageUrl(itemImg, item.material, itemName)}
                            alt={itemName}
                            className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                            onError={(e) => handleProductImageError(e, item.material, itemName)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{itemName}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {itemColor && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                {itemHex && (
                                  <span
                                    className="w-2 h-2 rounded-full border border-slate-300"
                                    style={{ backgroundColor: itemHex }}
                                  />
                                )}
                                {itemColor}
                              </span>
                            )}
                            <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {itemDiameter}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600">x{itemQty}</span>
                          </div>
                        </div>
                      </div>
                      {itemPrice > 0 && (
                        <div className="text-xs font-mono font-bold text-slate-700 shrink-0">
                          NT$ {(itemPrice * itemQty).toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {order.raw?.afterSalesReason && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold">售後進度：</span>
                  {order.raw.afterSalesReason}（{order.raw.afterSalesNote || '客服審核處理中'}）
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <span className="text-[11px] font-medium text-slate-400">{order.date}</span>
                  <span className="font-black text-sm text-slate-900">
                    總計 NT$ {order.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    onClick={() => setSelectedLogisticsOrder(order.raw)}
                    className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/90 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-sky-600" />
                    <span>物流詳情</span>
                  </button>
                  <button
                    onClick={() => setSelectedCertOrder(order.raw)}
                    className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>電子憑證</span>
                  </button>

                  {order.status === '待付款' && (
                    <button
                      onClick={() => handlePayNow(order.raw)}
                      disabled={isPayingId === (order.raw.id || order.id)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isPayingId === (order.raw.id || order.id) ? '付款確認中...' : '立即付款'}
                    </button>
                  )}

                  {order.canConfirm && (
                    <button
                      onClick={() => handleConfirm(order.raw.id || order.id, order.raw)}
                      disabled={isConfirmingId === (order.raw.id || order.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isConfirmingId === (order.raw.id || order.id) ? '確認中...' : '確認收貨'}</span>
                    </button>
                  )}

                  {order.isDone && (
                    <button
                      onClick={() => setReviewingOrder(order.raw)}
                      className="px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{order.raw?.isReviewed ? '追加評價' : '評價領 30 幣'}</span>
                    </button>
                  )}

                  {(order.status === '已完成' || order.status === '待出貨' || order.status === '運送中') && (
                    <button
                      onClick={() => setAfterSalesOrder(order.raw)}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      申請售後
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-sm">目前此分類沒有相關訂單</p>
            <p className="text-xs text-slate-400 mt-1">購買商品完成結帳後，您的訂單狀態與物流單號將即時顯示於此</p>
          </div>
        )}
      </div>

      <OrderCertificateModal
        isOpen={!!selectedCertOrder}
        onClose={() => setSelectedCertOrder(null)}
        order={selectedCertOrder}
      />
      <LogisticsTimelineModal
        isOpen={!!selectedLogisticsOrder}
        onClose={() => setSelectedLogisticsOrder(null)}
        order={selectedLogisticsOrder}
      />
    </ModalWrapper>
  );
};

export const PrinterModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any }> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [selectedBrandId, setSelectedBrandId] = useState<string>('bambu');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('bambu-x1c');
  const [customNickname, setCustomNickname] = useState<string>('');
  const [selectedNozzle, setSelectedNozzle] = useState<string>('0.4mm 硬化鋼噴嘴');
  const [preferredFilament, setPreferredFilament] = useState<string>('PLA / PETG');

  useEffect(() => {
    if (isOpen) {
      loadCustomerUserData(member?.id, 'printers').then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrinters(data);
          const def = data.find((p: any) => p.current) || data[0];
          if (def) {
            try {
              localStorage.setItem('printcore_default_printer_profile', JSON.stringify(def));
            } catch {}
          }
        } else {
          setPrinters([]);
        }
      });
    }
  }, [isOpen, member?.id]);

  const brandModels = useMemo(() => {
    return getPrintersByBrand(selectedBrandId);
  }, [selectedBrandId]);

  const activeProfile: PrinterProfile = useMemo(() => {
    return findPrinterProfile(selectedProfileId);
  }, [selectedProfileId]);

  useEffect(() => {
    if (activeProfile) {
      setSelectedNozzle(activeProfile.defaultNozzle || '0.4mm 標準噴嘴');
      setPreferredFilament(activeProfile.defaultMaterial || 'PLA / PETG');
    }
  }, [activeProfile]);

  const saveToDb = (newPrinters: any[]) => {
    setPrinters(newPrinters);
    saveCustomerUserData(member?.id, 'printers', newPrinters);
    try {
      const def = newPrinters.find((p) => p.current) || newPrinters[0] || null;
      if (def) {
        localStorage.setItem('printcore_default_printer_profile', JSON.stringify(def));
      } else {
        localStorage.removeItem('printcore_default_printer_profile');
      }
      window.dispatchEvent(new CustomEvent('printcore:printer-changed', { detail: def }));
    } catch {}
  };

  const handleAddPrinter = () => {
    const profile = activeProfile;
    const displayTitle = customNickname.trim()
      ? `${profile.name} (${customNickname.trim()})`
      : profile.name;

    const newEntry = {
      id: Date.now(),
      profileId: profile.id,
      brandId: profile.brandId,
      brand: profile.brand,
      name: displayTitle,
      series: profile.series,
      type: `${profile.extruder === 'direct' ? '直驅' : '遠程'} · ${
        profile.enclosure === 'open' ? '開放式' : '封箱'
      }`,
      nozzle: selectedNozzle,
      material: preferredFilament,
      maxSpeedMmS: profile.maxPrintSpeed,
      maxNozzleTemp: profile.maxTempNozzle,
      maxBedTemp: profile.maxTempBed,
      current: true,
    };

    const updatedList = printers.map((p) => ({ ...p, current: false }));
    saveToDb([...updatedList, newEntry]);
    setCustomNickname('');
    setIsAdding(false);
  };

  const handleSetDefault = (id: number) => {
    saveToDb(printers.map((p) => ({ ...p, current: p.id === id })));
  };

  const handleDelete = (id: number) => {
    const remaining = printers.filter((p) => p.id !== id);
    if (remaining.length > 0 && !remaining.some((p) => p.current)) {
      remaining[0].current = true;
    }
    saveToDb(remaining);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的列印機車庫">
      {/* Saved Printers List */}
      <div className="space-y-3 mb-4">
        {printers.map((p) => (
          <div
            key={p.id}
            className={`bg-white p-4 rounded-2xl border transition-all ${
              p.current ? 'border-indigo-500 shadow-sm' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {p.brand && (
                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                      {p.brand}
                    </span>
                  )}
                  <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {p.nozzle || '0.4mm'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1.5">{p.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">常用耗材：{p.material || 'PLA / PETG'}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer shrink-0"
                title="移除機台"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {p.current ? (
              <div className="w-full bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>預設機台</span>
              </div>
            ) : (
              <button
                onClick={() => handleSetDefault(p.id)}
                className="w-full text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                設為預設機台
              </button>
            )}
          </div>
        ))}

        {printers.length === 0 && !isAdding && (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-100 p-4">
            <Printer className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600 text-sm">尚未新增列印機</p>
            <p className="text-xs text-slate-400 mt-1">新增機台即可快速配對專屬切片參數</p>
          </div>
        )}
      </div>

      {/* Add Printer Form: Clean Brand -> Model */}
      {isAdding ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
          <h4 className="font-bold text-slate-900 text-sm">新增機台</h4>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">選擇品牌</label>
            <select
              value={selectedBrandId}
              onChange={(e) => {
                const bid = e.target.value;
                setSelectedBrandId(bid);
                const list = getPrintersByBrand(bid);
                if (list.length > 0) setSelectedProfileId(list[0].id);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {PRINTER_BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">選擇機型</label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {brandModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">噴嘴規格</label>
              <select
                value={selectedNozzle}
                onChange={(e) => setSelectedNozzle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
              >
                <option value="0.4mm 硬化鋼噴嘴">0.4mm 硬化鋼</option>
                <option value="0.4mm 標準噴嘴">0.4mm 標準噴嘴</option>
                <option value="0.2mm 精細噴嘴">0.2mm 精細噴嘴</option>
                <option value="0.6mm 大流量噴嘴">0.6mm 大流量</option>
                <option value="0.8mm 超大流量噴嘴">0.8mm 超大流量</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">常用耗材</label>
              <input
                type="text"
                value={preferredFilament}
                onChange={(e) => setPreferredFilament(e.target.value)}
                placeholder="PLA / PETG"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">備註暱稱（選填）</label>
            <input
              type="text"
              value={customNickname}
              onChange={(e) => setCustomNickname(e.target.value)}
              placeholder="例如：工作機 1 號"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl text-xs cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAddPrinter}
              className="flex-1 py-2.5 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs cursor-pointer"
            >
              確認新增
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-600 font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>新增機台</span>
        </button>
      )}
    </ModalWrapper>
  );
};


export const AddressModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setMember?: (m: any) => void;
}> = ({ isOpen, onClose, member, setMember }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', addr: '' });
  const [formError, setFormError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(''), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setIsEditingForm(false);
      setEditingId(null);
      setFormError('');
      loadCustomerUserData(member?.id, 'addresses').then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const hasDefault = data.some((a: any) => a?.isDefault);
          const normalized = hasDefault ? data : data.map((a: any, i: number) => ({ ...a, isDefault: i === 0 }));
          setAddresses(normalized);
        } else if (member?.address && member.address.trim()) {
          const migrated = [
            {
              id: Date.now(),
              name: member?.name || '會員本人',
              phone: member?.phone || '',
              addr: member.address.trim(),
              isDefault: true,
            },
          ];
          setAddresses(migrated);
          saveCustomerUserData(member?.id, 'addresses', migrated).catch(() => {});
        } else {
          setAddresses([]);
        }
      });
    }
  }, [isOpen, member?.id]);

  const syncDefaultAddressToMember = (nextAddrs: any[]) => {
    const defaultAddr = nextAddrs.find((a) => a.isDefault) || nextAddrs[0] || null;
    if (setMember && member) {
      const updated = {
        ...member,
        address: defaultAddr?.addr || '',
        phone: defaultAddr?.phone || member.phone || '',
      };
      setMember(updated);
      try {
        localStorage.setItem('printcore_member', JSON.stringify(updated));
      } catch {}
      saveUserProfileToFirestore(updated).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('printcore:addresses-updated', { detail: nextAddrs }));
    }
  };

  const saveToDb = (newAddrs: any[]) => {
    // Guarantee exactly one default address if list is non-empty
    let normalized = newAddrs;
    if (newAddrs.length > 0 && !newAddrs.some((a) => a.isDefault)) {
      normalized = newAddrs.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
    }
    setAddresses(normalized);
    saveCustomerUserData(member?.id, 'addresses', normalized).catch(() => {});
    syncDefaultAddressToMember(normalized);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      name: member?.name && member.name !== '創客訪客' ? member.name : '',
      phone: member?.phone || '',
      addr: '',
    });
    setFormError('');
    setIsEditingForm(true);
  };

  const openEditForm = (addrItem: any) => {
    setEditingId(addrItem.id);
    setForm({
      name: addrItem.name || '',
      phone: addrItem.phone || '',
      addr: addrItem.addr || '',
    });
    setFormError('');
    setIsEditingForm(true);
  };

  const handleSave = () => {
    const cleanName = form.name.trim();
    const cleanPhone = form.phone.trim();
    const cleanAddr = form.addr.trim();

    if (!cleanName) {
      setFormError('請輸入收件人姓名');
      return;
    }
    if (!cleanPhone) {
      setFormError('請輸入聯絡電話');
      return;
    }
    if (!cleanAddr || cleanAddr.length < 4) {
      setFormError('請選擇縣市鄉鎮並輸入完整收件地址');
      return;
    }

    setFormError('');
    if (editingId !== null) {
      const updatedList = addresses.map((a) =>
        a.id === editingId ? { ...a, name: cleanName, phone: cleanPhone, addr: cleanAddr } : a
      );
      saveToDb(updatedList);
      showNotice('已更新收件地址，結帳時將自動帶入預設地址');
    } else {
      const newEntry = {
        id: Date.now(),
        name: cleanName,
        phone: cleanPhone,
        addr: cleanAddr,
        isDefault: addresses.length === 0,
      };
      saveToDb([...addresses, newEntry]);
      showNotice(
        newEntry.isDefault
          ? '已儲存並設為預設收件地址，宅配結帳將自動帶入！'
          : '已新增常用收件地址！'
      );
    }
    setForm({ name: '', phone: '', addr: '' });
    setEditingId(null);
    setIsEditingForm(false);
  };

  const handleDelete = (id: number | string) => {
    const next = addresses.filter((a) => a.id !== id);
    saveToDb(next);
    showNotice('已刪除收件地址');
  };

  const handleSetDefault = (id: number | string) => {
    saveToDb(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    showNotice('已設為預設收件地址，商品宅配結帳將自動套用！');
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="地址資訊管理">
      {statusNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      <div className="mb-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-800 text-xs flex items-start gap-2">
        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <span>設定「預設收件」後，於購物車選擇宅配到府結帳時將自動帶入姓名、電話與完整地址。</span>
      </div>

      <div className="space-y-4 mb-6">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`bg-white p-5 rounded-2xl border-2 relative overflow-hidden transition-all ${
              a.isDefault ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-100 shadow-sm'
            }`}
          >
            {a.isDefault && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                預設收件
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${a.isDefault ? 'text-indigo-500' : 'text-slate-400'}`} />
              <div className="min-w-0 flex-1 pr-14">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>{a.name}</span>
                  <span className="text-xs font-medium text-slate-500">{a.phone}</span>
                </h4>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed break-words">{a.addr}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              {!a.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(a.id)}
                  className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors"
                >
                  設為預設
                </button>
              )}
              <button
                type="button"
                onClick={() => openEditForm(a)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Edit2 className="w-3 h-3" /> 編輯
              </button>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="flex-1 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" /> 刪除
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && !isEditingForm && (
          <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">
            目前沒有設定任何收件地址
          </div>
        )}
      </div>

      {isEditingForm ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-sm font-black text-slate-900">
            {editingId !== null ? '編輯收件地址' : '新增收件地址'}
          </h4>
          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">收件人姓名 *</label>
            <input
              type="text"
              placeholder="請輸入真實姓名"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">聯絡手機 *</label>
            <input
              type="tel"
              placeholder="0912345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <TaiwanAddressInput
            value={form.addr}
            onChange={(val) => setForm({ ...form, addr: val })}
            label="台灣詳細收件地址 *"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditingForm(false);
                setEditingId(null);
                setFormError('');
              }}
              className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 text-white font-bold bg-slate-900 rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer text-sm"
            >
              {editingId !== null ? '儲存修改' : '儲存地址'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAddForm}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> 新增收件地址
        </button>
      )}
    </ModalWrapper>
  );
};


export const ReferralModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setMember?: (m: any) => void;
}> = ({ isOpen, onClose, member, setMember }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [bindStatusMsg, setBindStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isBinding, setIsBinding] = useState(false);

  // Deterministic, guaranteed-unique referral code tied strictly to this user's UID & email
  const uniqueReferralCode = useMemo(() => {
    if (member?.referralCode && member.referralCode !== 'guest') {
      return member.referralCode;
    }
    if (member?.id && member.id !== 'guest') {
      return generateUserReferralCode(member.id, member.email);
    }
    return 'GDGUEST01';
  }, [member?.id, member?.email, member?.referralCode]);

  const originUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://goddog.space';
  const inviteLink = `${originUrl}/r/${uniqueReferralCode}`;

  // Sync latest referral records & earnings from Firestore when modal opens
  const refreshReferralStatsFromCloud = useCallback(async () => {
    if (!member?.id || member.id === 'guest') return;
    setSyncingCloud(true);
    try {
      const snap = await getDoc(doc(db, 'users', member.id));
      if (snap.exists()) {
        const data = snap.data();
        const ensuredCode = data.referralCode || uniqueReferralCode;
        if (!data.referralCode) {
          await setDoc(doc(db, 'users', member.id), { referralCode: ensuredCode }, { merge: true });
        }
        if (setMember) {
          setMember((prev: any) => ({
            ...prev,
            ...data,
            id: member.id,
            referralCode: ensuredCode,
          }));
        }
      } else {
        const saved = await saveUserProfileToFirestore({
          ...member,
          referralCode: uniqueReferralCode,
        });
        if (saved && setMember) {
          setMember(saved);
        }
      }
    } catch (e) {
      console.warn('Referral cloud sync fallback:', e);
    } finally {
      setSyncingCloud(false);
    }
  }, [member, setMember, uniqueReferralCode]);

  useEffect(() => {
    if (isOpen) {
      refreshReferralStatsFromCloud();
    }
  }, [isOpen, refreshReferralStatsFromCloud]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(uniqueReferralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const referralRecords: any[] = Array.isArray(member?.referralRecords)
    ? member.referralRecords
    : [];
  const completedReferrals = Math.max(
    Number(member?.referrals || 0),
    Number(member?.referralsCount || 0),
    referralRecords.filter((r) => r.status === 'order_completed_rewarded').length
  );
  const pendingReferrals = Math.max(
    Number(member?.pendingReferrals || 0),
    referralRecords.filter((r) => r.status === 'registered_pending_order').length
  );
  const referralEarnings = Number(member?.referralEarnings || 0);

  const handleWithdraw = async () => {
    if (referralEarnings <= 0) return;
    setWithdrawing(true);
    try {
      if (setMember && member?.id) {
        const updated = {
          ...member,
          referralEarnings: 0,
          points: Number(member.points || 0) + referralEarnings,
        };
        await saveUserProfileToFirestore(updated);
        setMember(updated);
        setBindStatusMsg({
          ok: true,
          text: `🎉 已成功將 NT$ ${referralEarnings} 推廣獎金提領為 ${referralEarnings} 點狗勾幣！結帳可 1:1 全額折抵。`,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleBindFriendCode = async () => {
    if (!friendCodeInput.trim() || isBinding) return;
    setIsBinding(true);
    setBindStatusMsg(null);
    try {
      const res = await bindReferralCodeForUser(member?.id, friendCodeInput);
      setBindStatusMsg({ ok: res.ok, text: res.message });
      if (res.ok && res.updatedProfile && setMember) {
        setMember(res.updatedProfile);
        setFriendCodeInput('');
      }
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="邀請好友賺狗勾幣">
      <div className="space-y-5">
        {/* Hero Card with Unique Link & Code */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 border border-white/20 px-2.5 py-1 rounded-full text-amber-300">
              專屬推薦碼：{uniqueReferralCode}
            </span>
            <button
              type="button"
              onClick={refreshReferralStatsFromCloud}
              className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${syncingCloud ? 'animate-spin' : ''}`} />
              <span>同步狀態</span>
            </button>
          </div>

          <h3 className="font-black text-xl sm:text-2xl mb-1.5">
            邀請好友註冊並下單，雙方各得 50 狗勾幣！
          </h3>
          <p className="text-indigo-100 text-xs leading-relaxed mb-4">
            每個會員皆擁有專屬推薦連結與代碼。當好友透過您的連結<strong className="text-amber-300">完成註冊並完成首筆訂單付款</strong>後，系統將自動發放 <strong className="text-amber-300">50 狗勾幣</strong> 至雙方帳戶！
          </p>

          {/* 3-Step Verification Pipeline */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-[11px] bg-slate-950/25 p-2.5 rounded-2xl border border-white/10">
            <div className="space-y-0.5">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mx-auto">
                1
              </div>
              <div className="font-bold text-white">分享專屬連結</div>
              <div className="text-[10px] text-indigo-200">每帳號獨立代碼</div>
            </div>
            <div className="space-y-0.5">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mx-auto">
                2
              </div>
              <div className="font-bold text-white">好友完成註冊</div>
              <div className="text-[10px] text-indigo-200">歸戶綁定推薦人</div>
            </div>
            <div className="space-y-0.5">
              <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center mx-auto">
                3
              </div>
              <div className="font-bold text-emerald-300">首購付款完成</div>
              <div className="text-[10px] text-indigo-200">各得 50 狗勾幣</div>
            </div>
          </div>

          {/* Unique Referral Link Copy Box */}
          <div className="space-y-2">
            <div className="bg-white/10 p-1.5 rounded-2xl backdrop-blur-md flex items-center border border-white/20">
              <div className="flex-1 text-xs font-mono truncate px-3 select-all">{inviteLink}</div>
              <button
                onClick={handleCopyLink}
                className="bg-white text-indigo-700 px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '已複製連結' : '複製專屬連結'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 text-xs">
              <span>
                專屬推薦碼：<strong className="font-mono text-amber-300 tracking-wider">{uniqueReferralCode}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '已複製推薦碼' : '複製推薦碼'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Toast / Feedback */}
        {bindStatusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              bindStatusMsg.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span>{bindStatusMsg.text}</span>
          </div>
        )}

        {/* 3-Column Real-Time Verification Dashboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-sm">邀請追蹤狀態</h4>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl text-center">
              <p className="text-[11px] font-bold text-amber-800 mb-1">已註冊・待下單</p>
              <p className="text-xl font-black text-amber-600">
                {pendingReferrals} <span className="text-[10px] font-medium text-amber-700">人</span>
              </p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-center">
              <p className="text-[11px] font-bold text-emerald-800 mb-1">已下單・達標</p>
              <p className="text-xl font-black text-emerald-600">
                {completedReferrals} <span className="text-[10px] font-medium text-emerald-700">人</span>
              </p>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-xl text-center">
              <p className="text-[11px] font-bold text-indigo-800 mb-1">累積獲得狗勾幣</p>
              <p className="text-xl font-black text-indigo-600">
                {completedReferrals * 50} <span className="text-[10px] font-medium text-indigo-700">幣</span>
              </p>
            </div>
          </div>

          {/* Detailed Referral Records List */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">邀請好友明細：</p>
            {referralRecords.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {referralRecords.map((rec, idx) => {
                  const isCompleted = rec.status === 'order_completed_rewarded';
                  return (
                    <div
                      key={rec.inviteeId || idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {rec.inviteeName || '創客好友'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          註冊時間：{rec.registeredAt ? new Date(rec.registeredAt).toLocaleDateString('zh-TW') : '已綁定'}
                          {rec.orderNumber ? `・首購單號：${rec.orderNumber}` : ''}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCompleted ? '已下單・已發放 50 幣' : '已註冊・待首購下單'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-xl text-xs text-slate-400">
                尚無好友邀請紀錄，複製上方專屬連結分享給好友吧！
              </div>
            )}
          </div>
        </div>

        {/* Invitee Referral Binding Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">被好友邀請？綁定好友推薦碼</h4>
            {member?.referredBy && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {member.referralOrderCompleted
                  ? '已完成首購並領取 50 狗勾幣'
                  : `已綁定（${member.referredByCode || member.referredByName || '好友'}）・下單領 50 幣`}
              </span>
            )}
          </div>
          {!member?.referredBy ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                placeholder="輸入好友的專屬推薦碼 (例如 GD...)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleBindFriendCode}
                disabled={isBinding || !friendCodeInput.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isBinding ? '驗證中...' : '綁定推薦碼'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              您已成功綁定推薦人 <strong className="text-indigo-600">{member.referredByName || member.referredByCode || '創客好友'}</strong>！
              {member.referralOrderCompleted
                ? ` 您已完成首筆訂單（${member.referralOrderNumber || '已付款'}），雙方 50 狗勾幣獎勵已入帳！`
                : ' 只要完成首筆訂單結帳付款，系統將自動發放 50 狗勾幣至您與好友的帳戶！'}
            </p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export const CouponModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any; setMember?: (m: any) => void }> = ({ isOpen, onClose, member, setMember }) => {
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = Array.isArray(member?.coupons) ? member.coupons : [];
  const isVip = isMemberVipActive(member);

  const handleCopyCode = (cCode: string) => {
    if (!cCode) return;
    navigator.clipboard?.writeText(cCode).catch(() => {});
    setCopiedCode(cCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRedeem = () => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    setRedeeming(true);

    try {
      // Check duplicate claim
      if (coupons.some((c: any) => String(c.code || '').toUpperCase() === cleanCode)) {
        setMsg({ ok: false, text: `優惠券「${cleanCode}」已在您的錢包中，無需重複領取。` });
        setRedeeming(false);
        setTimeout(() => setMsg(null), 3200);
        return;
      }

      // Check coupon validity against unified coupon manager (pass high subtotal so minSpend doesn't block claiming)
      const checkRes = validateCoupon(cleanCode, 999999, isVip);
      if (!checkRes.isValid || !checkRes.coupon) {
        setMsg({ ok: false, text: checkRes.errorMessage || '無效的優惠碼或已過期' });
        setRedeeming(false);
        setTimeout(() => setMsg(null), 3500);
        return;
      }

      const sc = checkRes.coupon;
      const newCoupon = {
        id: Date.now(),
        code: sc.code,
        name: sc.title,
        discount: sc.discountType === 'free_shipping' ? 60 : sc.discountValue,
        discountType: sc.discountType,
        freeShipping: sc.discountType === 'free_shipping' || sc.code === 'ACHIEVEFREE',
        minSpend: sc.minSpend || 0,
        expiry: sc.expiryDate || '2027-12-31',
      };

      if (setMember && member) {
        const updated = { ...member, coupons: [...coupons, newCoupon] };
        setMember(updated);
        try {
          localStorage.setItem('printcore_member', JSON.stringify(updated));
        } catch {}
        saveUserProfileToFirestore(updated).catch(() => {});
        if (updated.id && updated.id !== 'guest') {
          saveCustomerUserData(updated.id, 'coupons', updated.coupons).catch(() => {});
        }
      }
      setMsg({ ok: true, text: `成功兌換優惠券「${sc.code}」！結帳時可一鍵套用。` });
      setCode('');
    } finally {
      setRedeeming(false);
      setTimeout(() => setMsg(null), 3500);
    }
  };

  // Suggest claimable active store coupons not yet owned
  const claimableSuggestions = getStoreCoupons()
    .filter((sc) => sc.isActive && (!sc.targetTier || sc.targetTier !== 'vip' || isVip))
    .filter((sc) => !coupons.some((mc: any) => String(mc.code || '').toUpperCase() === sc.code.toUpperCase()))
    .slice(0, 4);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的優惠券">
      <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm mb-2">輸入優惠代碼領取</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="例如 GODDOG2026 / MAKER100"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono uppercase text-sm"
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 cursor-pointer text-sm shrink-0"
          >
            {redeeming ? '兌換中...' : '兌換'}
          </button>
        </div>
        {msg && (
          <p className={`text-xs font-bold mt-2 ${msg.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
            {msg.text}
          </p>
        )}
        {claimableSuggestions.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500">可領取代碼：</span>
            {claimableSuggestions.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setCode(sc.code)}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer"
              >
                {sc.code}
              </button>
            ))}
          </div>
        )}
      </div>

      <h4 className="font-bold text-slate-900 mb-3 px-1">可使用的優惠券 ({coupons.length})</h4>
      <div className="space-y-3">
        {coupons.length > 0 ? coupons.map((c: any) => {
          const isFreeShip = c.freeShipping || c.discountType === 'free_shipping';
          const isPercent = c.discountType === 'percentage';
          const codeLabel = c.code || '';
          return (
            <div key={c.id} className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center justify-between gap-3 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500"></div>
              <div className="pl-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-black text-slate-900 text-sm">{c.name}</h5>
                  {codeLabel && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeLabel)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                      title="複製優惠碼於結帳套用"
                    >
                      <span>{codeLabel}</span>
                      {copiedCode === codeLabel ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  有效期限: {c.expiry || '2027-12-31'}
                  {c.minSpend > 0 ? ` ・ 滿 NT$${c.minSpend} 可用` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                {isFreeShip && (!c.discount || c.discountType === 'free_shipping') ? (
                  <p className="text-base font-black text-emerald-600">全館免運</p>
                ) : isPercent ? (
                  <p className="text-xl font-black text-indigo-600">{Math.round((100 - Number(c.discount || 0)) / 10)} 折</p>
                ) : (
                  <p className="text-2xl font-black text-indigo-600">
                    <span className="text-sm">$</span>{c.discount}
                  </p>
                )}
                {codeLabel === 'ACHIEVEFREE' && (
                  <span className="text-[10px] font-bold text-emerald-600 block">含超商/宅配免運</span>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
            <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-bold">目前沒有可用的優惠券</p>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};


export const HistoryModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  member?: any;
  onOpenProductDetail?: (productOrId: any) => void;
  onAddToCart?: (item: any) => void;
  lang?: LanguageCode;
  currency?: CurrencyCode;
}> = ({ isOpen, onClose, member, onOpenProductDetail, onAddToCart, lang: propLang, currency = 'TWD' }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const uid = member?.id || auth.currentUser?.uid;
  const [history, setHistory] = useState<any[]>(() => getStoredRecentlyViewedSync(uid));
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const navigate = useNavigate();

  const fetchHistory = useCallback(() => {
    const currentUid = member?.id || auth.currentUser?.uid;
    const instant = getStoredRecentlyViewedSync(currentUid);
    setHistory(instant);

    loadCustomerRecentlyViewed(currentUid).then((views) => {
      if (views && views.length > 0) {
        setHistory(views);
      }
    }).catch(() => {});
  }, [member?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setIsConfirmingClear(false);
    }
  }, [isOpen, fetchHistory]);

  useEffect(() => {
    const handleUpdate = () => fetchHistory();
    window.addEventListener('printcore_recently_viewed_updated', handleUpdate);
    window.addEventListener('printcore_recently_viewed_cleared', handleUpdate);
    return () => {
      window.removeEventListener('printcore_recently_viewed_updated', handleUpdate);
      window.removeEventListener('printcore_recently_viewed_cleared', handleUpdate);
    };
  }, [fetchHistory]);

  const handleClear = async () => {
    const currentUid = member?.id || auth.currentUser?.uid;
    await clearCustomerRecentlyViewed(currentUid);
    setHistory([]);
    setIsConfirmingClear(false);
  };

  const handleDeleteSingle = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUid = member?.id || auth.currentUser?.uid;
    const updated = await deleteSingleCustomerRecentlyViewed(currentUid, productId);
    setHistory(updated);
  };

  const handleItemClick = (item: any) => {
    onClose();
    if (onOpenProductDetail) {
      onOpenProductDetail(item);
    } else {
      navigate(`/?product=${item.id}`);
    }
  };

  const handleAdd = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(item);
    }
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const formatViewedTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const diffMinutes = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diffMinutes < 1) return activeLang === 'en' ? 'Just now' : activeLang === 'ja' ? 'たった今' : '剛剛瀏覽';
      if (diffMinutes < 60) return activeLang === 'en' ? `${diffMinutes}m ago` : activeLang === 'ja' ? `${diffMinutes}分前` : `${diffMinutes} 分鐘前`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return activeLang === 'en' ? `${diffHours}h ago` : activeLang === 'ja' ? `${diffHours}時間前` : `${diffHours} 小時前`;
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return '';
    }
  };

  const modalTitle = activeLang === 'en' ? 'Recently Viewed' : activeLang === 'ja' ? '最近閲覧した商品' : '最近瀏覽';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className="space-y-4">
        {/* User Account Isolation & Cloud Sync Banner */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-indigo-950">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-bold text-indigo-900">
              {activeLang === 'en' ? 'Personal Cloud History:' : activeLang === 'ja' ? '個人専用クラウド履歴：' : '專屬個人雲端紀錄：'}
            </span>
            {member?.email || member?.name ? (
              <span>
                {activeLang === 'en'
                  ? ` Linked to your account `
                  : activeLang === 'ja'
                  ? ` 会員アカウント `
                  : ' 此瀏覽歷程已綁定於您的會員帳號 '}
                <strong className="font-mono text-indigo-700">({member.email || member.name})</strong>
                {activeLang === 'en'
                  ? `, securely preserved in cloud across all devices.`
                  : activeLang === 'ja'
                  ? ` に紐付けされ、クラウドへ安全に同期されています。`
                  : '，永久安全儲存於雲端，換機登入自動載入，絕不混入其他用戶。'}
              </span>
            ) : (
              <span>
                {activeLang === 'en'
                  ? 'Currently stored on this device. Sign in to permanently sync to your maker account.'
                  : activeLang === 'ja'
                  ? '現在はゲストのローカル履歴です。ログインするとクラウドへ永続同期されます。'
                  : '目前為訪客本機紀錄。登入後所有瀏覽紀錄將永久同步歸戶至您的個人會員中心。'}
              </span>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              {activeLang === 'en' ? (
                <>Viewed <strong className="text-indigo-600 font-bold">{history.length}</strong> items</>
              ) : activeLang === 'ja' ? (
                <>合計 <strong className="text-indigo-600 font-bold">{history.length}</strong> 件閲覧済み</>
              ) : (
                <>共看過 <strong className="text-indigo-600 font-bold">{history.length}</strong> 款商品</>
              )}
            </span>

            {/* Inline Clear Confirmation */}
            {isConfirmingClear ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl animate-in fade-in zoom-in duration-200">
                <span className="text-rose-700 font-bold text-[11px]">
                  {activeLang === 'en' ? 'Clear all?' : activeLang === 'ja' ? '全削除？' : '確認清空？'}
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-2xs"
                >
                  {activeLang === 'en' ? 'Confirm' : activeLang === 'ja' ? '削除' : '確認清空'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-rose-200 text-slate-600 cursor-pointer"
                >
                  {activeLang === 'en' ? 'Cancel' : activeLang === 'ja' ? 'キャンセル' : '取消'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-bold px-2 py-1 rounded-lg hover:bg-rose-50"
                title={activeLang === 'en' ? 'Clear browsing history' : activeLang === 'ja' ? '閲覧履歴を全削除' : '清空所有瀏覽記錄'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{activeLang === 'en' ? 'Clear History' : activeLang === 'ja' ? '履歴を削除' : '清空紀錄'}</span>
              </button>
            )}
          </div>
        )}

        {history.length > 0 ? (
          history.map((item: any, idx) => (
            <div 
              key={item.id || idx} 
              onClick={() => handleItemClick(item)}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-200 shadow-xs hover:shadow-md flex items-center gap-3.5 relative overflow-hidden group cursor-pointer transition-all active:scale-[0.99]"
            >
              <img 
                src={getSafeProductImageUrl(item.image || item.imageUrl || item.img, item.category, item.name)} 
                alt={item.name} 
                className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                onError={(e) => handleProductImageError(e, item.category, item.name)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {item.brand && (
                    <span className="text-[10px] font-bold text-indigo-600 font-mono">
                      {item.brand}
                    </span>
                  )}
                  {item.material && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {translateMaterial(item.material, activeLang)}
                    </span>
                  )}
                  {item.viewedAt && (
                    <span className="text-[10px] text-slate-400 font-medium ml-auto">
                      {formatViewedTime(item.viewedAt)}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-indigo-600 transition-colors">
                  {translateProductName(item.name || '', activeLang, item.brand, item.material, item.weight)}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-indigo-600 font-black text-sm sm:text-base font-mono">
                    {formatPrice(item.price || 0, currency as CurrencyCode)}
                  </span>
                  {item.weight && (
                    <span className="text-[11px] text-slate-400">
                      • {item.weight}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Delete single item button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteSingle(item.id, e)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer border border-slate-100 hover:border-rose-200"
                  title={activeLang === 'en' ? 'Remove from history' : activeLang === 'ja' ? '履歴から削除' : '刪除此筆瀏覽記錄'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {/* Add to Cart button */}
                <button 
                  type="button"
                  onClick={(e) => handleAdd(item, e)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer ${
                    addedIds[item.id]
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-slate-900 text-white hover:bg-indigo-600'
                  }`}
                  title={addedIds[item.id] ? (activeLang === 'en' ? 'Added' : activeLang === 'ja' ? '追加済み' : '已加入購物車') : (activeLang === 'en' ? 'Add to cart' : activeLang === 'ja' ? 'カートへ' : '加入購物車')}
                >
                  {addedIds[item.id] ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-base mb-1">
              {activeLang === 'en' ? 'No browsing history yet!' : activeLang === 'ja' ? '閲覧履歴はまだありません' : '還沒有瀏覽紀錄喔！'}
            </h4>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              {activeLang === 'en'
                ? 'Filaments and specs you view in the store will automatically appear here for quick access.'
                : activeLang === 'ja'
                ? 'ショップで閲覧した3Dフィラメントやスペックは自動的に保存され、いつでも再確認できます。'
                : '您在商城點選查看過的每一款 3D 列印線材與規格，都會自動保存在這裡，方便隨時找回。'}
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
            >
              {activeLang === 'en' ? 'Browse Filament Catalog →' : activeLang === 'ja' ? 'フィラメント一覧へ →' : '前往耗材商城選購 →'}
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};


export const AchievementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setMember?: (m: any) => void;
  orders?: any[];
}> = ({ isOpen, onClose, member, setMember, orders }) => {
  const [demoMaxLevel, setDemoMaxLevel] = useState(false);
  const [verifiedOrders, setVerifiedOrders] = useState<any[]>([]);
  const [userPrinters, setUserPrinters] = useState<any[]>([]);
  const [slicerUsedCount, setSlicerUsedCount] = useState<number>(0);
  const [claimMsg, setClaimMsg] = useState<string>('');

  // Load genuine orders, printers, and slicer usage whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    getGenuineUserOrders(orders || [])
      .then((res) => {
        const map = new Map<string, any>();
        for (const o of orders || []) {
          if (o && !isMockOrder(o)) map.set(o.orderNumber || o.id, o);
        }
        for (const co of res || []) {
          if (co && !isMockOrder(co)) map.set(co.orderNumber || co.id, co);
        }
        setVerifiedOrders(Array.from(map.values()));
      })
      .catch(() => {});

    loadCustomerUserData(member?.id, 'printers')
      .then((p) => {
        if (Array.isArray(p)) setUserPrinters(p);
      })
      .catch(() => {});

    try {
      const sc = parseInt(localStorage.getItem('printcore_slicer_copies') || '0', 10) || 0;
      setSlicerUsedCount(sc);
    } catch {}
  }, [isOpen, orders, member?.id]);

  const badgesData = useMemo(() => {
    const safeOrders = verifiedOrders.length > 0 ? verifiedOrders : (orders || []).filter((o) => !isMockOrder(o));
    const ordersCount = safeOrders.length;

    // Total spools purchased across all genuine orders
    const totalSpools = safeOrders.reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      const orderQty = items.reduce((s: number, item: any) => s + Number(item?.quantity || 1), 0);
      return sum + (orderQty || 1);
    }, 0);

    // Eco spools count (cardboard / eco spools or recycled spools)
    const ecoSpoolsOrdered = safeOrders.reduce((sum, o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return (
        sum +
        items.reduce((s: number, i: any) => {
          const n = String(i?.name || i?.material || '').toLowerCase();
          if (n.includes('環保') || n.includes('紙盤') || n.includes('pla') || n.includes('petg')) {
            return s + Number(i?.quantity || 1);
          }
          return s;
        }, 0)
      );
    }, 0);
    const ecoCount = Math.max(Number(member?.recycledSpools || 0), ecoSpoolsOrdered);

    // Night owl: order placed between 22:00 and 05:00
    const nightOwlCount = safeOrders.filter((o) => {
      if (!o.createdAt) return false;
      const hour = new Date(o.createdAt).getHours();
      return hour >= 22 || hour < 5;
    }).length;

    // Reviews written (from member.reviewsCount + reviewed orders + localStorage review counter)
    let localRevCount = 0;
    try {
      localRevCount =
        parseInt(localStorage.getItem(`printcore_reviews_count_${member?.id || 'guest'}`) || '0', 10) || 0;
    } catch {}
    const reviewedOrdersCount = safeOrders.filter((o) => o.isReviewed).length;
    const totalReviews = Math.max(Number(member?.reviewsCount || 0), localRevCount, reviewedOrdersCount);

    // Early bird: bought flagship / new release product or ordered within 48h of registration
    const boughtNewRelease = safeOrders.some((o) =>
      (o.items || []).some((i: any) => {
        const pid = String(i?.productId || i?.id || '');
        const nm = String(i?.name || '');
        return (
          pid === 'fil-01' ||
          pid === 'fil-02' ||
          pid === 'fil-03' ||
          pid === 'fil-05' ||
          pid === 'fil-07' ||
          nm.includes('高速') ||
          nm.includes('碳纖') ||
          nm.includes('Bambu')
        );
      })
    );
    const earlyBirdDone = Boolean(member?.earlyBird) || boughtNewRelease;

    // Unique colors purchased
    const uniqueColors = new Set<string>();
    safeOrders.forEach((o) =>
      (o.items || []).forEach((i: any) => {
        const c = i?.color || i?.selectedColor?.name || i?.name;
        if (c) uniqueColors.add(String(c));
      })
    );

    // Unique materials purchased
    const uniqueMats = new Set<string>();
    safeOrders.forEach((o) =>
      (o.items || []).forEach((i: any) => {
        const m = String(i?.material || i?.name || '').toUpperCase();
        if (m.includes('PLA-CF') || m.includes('碳纖')) uniqueMats.add('CF');
        else if (m.includes('MATTE') || m.includes('消光')) uniqueMats.add('MATTE');
        else if (m.includes('PETG')) uniqueMats.add('PETG');
        else if (m.includes('TPU')) uniqueMats.add('TPU');
        else if (m.includes('ABS') || m.includes('ASA')) uniqueMats.add('ABS/ASA');
        else if (m.includes('PA') || m.includes('PC') || m.includes('尼龍')) uniqueMats.add('PA/PC');
        else if (m) uniqueMats.add(m.slice(0, 8));
      })
    );

    // Referrals completed
    const referralsDone = Math.max(
      Number(member?.referrals || 0),
      Number(member?.referralsCount || 0)
    );

    // Max single order amount OR cumulative spend >= 3000
    const maxSingleOrder = safeOrders.reduce(
      (max, o) => Math.max(max, Number(o.totalAmount ?? o.total ?? 0)),
      0
    );
    const totalSpend = safeOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount ?? o.total ?? 0),
      0
    );
    const bigSpenderProgress = Math.min(5000, Math.max(maxSingleOrder, totalSpend));

    // Loyal fan: VIP active OR >= 3 orders OR garage >= 2 printers + >= 2 orders
    const isVip = isMemberVipActive(member);
    const loyalCount = isVip ? 3 : Math.min(3, ordersCount + (userPrinters.length >= 2 ? 1 : 0));

    // Slicer parameter wizard
    const totalSlicerParams = Math.max(
      Number(member?.sharedParamsCount || 0),
      slicerUsedCount,
      userPrinters.length
    );

    return [
      {
        name: '首購族',
        desc: '完成第一筆耗材訂單',
        icon: Medal,
        color: 'text-amber-500',
        bg: 'bg-amber-100',
        current: Math.min(1, ordersCount),
        target: 1,
        locked: ordersCount < 1,
      },
      {
        name: '列印狂人',
        desc: '累積購買 10 捲耗材',
        icon: Package,
        color: 'text-indigo-500',
        bg: 'bg-indigo-100',
        current: Math.min(10, totalSpools),
        target: 10,
        locked: totalSpools < 10,
      },
      {
        name: '環保先鋒',
        desc: '累積選購或回收 5 捲環保線盤',
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bg: 'bg-emerald-100',
        current: Math.min(5, ecoCount),
        target: 5,
        locked: ecoCount < 5,
      },
      {
        name: '夜貓創客',
        desc: '於夜間 22:00 - 05:00 下單',
        icon: Clock,
        color: 'text-slate-600',
        bg: 'bg-slate-200',
        current: Math.min(1, nightOwlCount),
        target: 1,
        locked: nightOwlCount < 1,
      },
      {
        name: '評價達人',
        desc: '完成 3 則商品實測評價',
        icon: Star,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        current: Math.min(3, totalReviews),
        target: 3,
        locked: totalReviews < 3,
      },
      {
        name: '早鳥搶購',
        desc: '入手高速/碳纖旗艦新品耗材',
        icon: Zap,
        color: 'text-orange-500',
        bg: 'bg-orange-100',
        current: earlyBirdDone ? 1 : 0,
        target: 1,
        locked: !earlyBirdDone,
      },
      {
        name: '色彩大師',
        desc: '累積體驗 5 種不同色彩線材',
        icon: Palette,
        color: 'text-pink-500',
        bg: 'bg-pink-100',
        current: Math.min(5, uniqueColors.size),
        target: 5,
        locked: uniqueColors.size < 5,
      },
      {
        name: '材質探險家',
        desc: '解鎖 3 種以上不同高分子材質',
        icon: Layers,
        color: 'text-cyan-500',
        bg: 'bg-cyan-100',
        current: Math.min(3, uniqueMats.size),
        target: 3,
        locked: uniqueMats.size < 3,
      },
      {
        name: '呼朋引伴',
        desc: '成功邀請 3 位好友註冊並下單',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        current: Math.min(3, referralsDone),
        target: 3,
        locked: referralsDone < 3,
      },
      {
        name: '大戶人家',
        desc: '單筆或累積消費滿 NT$5,000',
        icon: CreditCard,
        color: 'text-rose-500',
        bg: 'bg-rose-100',
        current: bigSpenderProgress,
        target: 5000,
        locked: bigSpenderProgress < 5000,
      },
      {
        name: '忠實鐵粉',
        desc: '累積 3 筆訂單或開通 VIP 訂閱',
        icon: Calendar,
        color: 'text-purple-500',
        bg: 'bg-purple-100',
        current: Math.min(3, loyalCount),
        target: 3,
        locked: loyalCount < 3,
      },
      {
        name: '參數魔法師',
        desc: '使用 AI 耗材顧問/車庫達 5 次',
        icon: Sliders,
        color: 'text-teal-500',
        bg: 'bg-teal-100',
        current: Math.min(5, totalSlicerParams),
        target: 5,
        locked: totalSlicerParams < 5,
      },
    ];
  }, [verifiedOrders, orders, member, userPrinters.length, slicerUsedCount]);

  const realUnlockedCount = badgesData.filter((b) => !b.locked).length;
  const badges = badgesData.map((b) =>
    demoMaxLevel ? { ...b, locked: false, current: b.target } : b
  );
  const unlockedCount = badges.filter((b) => !b.locked).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const milestones = [
    { target: 3, code: 'ACHIEVE50', title: '新手創客', reward: '$50 優惠券', discount: 50 },
    { target: 6, code: 'ACHIEVE100', title: '列印老手', reward: '$100 優惠券', discount: 100 },
    { target: 9, code: 'ACHIEVE200', title: '神狗勾大使', reward: '$200 優惠券', discount: 200 },
    { target: 12, code: 'ACHIEVEFREE', title: '列印大神', reward: '$300 免運神券', discount: 300 },
  ];

  const claimedCodes: string[] = Array.isArray(member?.claimedMilestones)
    ? member.claimedMilestones
    : [];

  const handleClaimMilestone = (m: (typeof milestones)[number]) => {
    if (demoMaxLevel) return;
    if (realUnlockedCount < m.target) return;
    if (claimedCodes.includes(m.code)) return;
    if ((member?.coupons || []).some((c: any) => c.code === m.code)) return;

    const newCoupon = {
      id: Date.now(),
      code: m.code,
      name: `【${m.title}成就禮】${m.reward}`,
      discount: m.discount,
      expiry: '2027-12-31',
    };
    const nextClaimed = [...claimedCodes, m.code];
    const nextCoupons = [...(member?.coupons || []), newCoupon];

    if (setMember && member) {
      const updated = {
        ...member,
        coupons: nextCoupons,
        claimedMilestones: nextClaimed,
      };
      setMember(updated);
      saveUserProfileToFirestore(updated);
    }
    setClaimMsg(`恭喜解鎖【${m.title}】里程碑！${m.reward} 已自動存入「我的優惠券」！`);
    setTimeout(() => setClaimMsg(''), 3500);
  };

  const currentTitle =
    milestones
      .slice()
      .reverse()
      .find((m) => unlockedCount >= m.target)?.title || '見習創客';

  const isRareTitle = currentTitle === '神狗勾大使' || currentTitle === '列印大神';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="創客成就徽章">
      {claimMsg && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2.5 shadow-sm">
          <Gift className="w-4 h-4 shrink-0" />
          <span>{claimMsg}</span>
        </div>
      )}

      <div
        className={`mb-5 p-4 sm:p-5 rounded-2xl border relative overflow-hidden transition-all duration-500 ${
          isRareTitle
            ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-amber-400/50 text-white shadow-[0_14px_38px_-10px_rgba(245,158,11,0.45)]'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs'
        }`}
      >
        {isRareTitle && (
          <>
            <div className="absolute -top-14 -left-14 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
            <motion.div
              aria-hidden="true"
              animate={{ x: ['-130%', '230%'] }}
              transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/15 to-transparent -skew-x-12 pointer-events-none"
            />
          </>
        )}

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span
                className={`text-xs font-bold tracking-wide whitespace-nowrap ${
                  isRareTitle ? 'text-amber-200/85' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                目前稱號
              </span>
              <button
                type="button"
                onClick={() => setDemoMaxLevel(!demoMaxLevel)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  demoMaxLevel
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-sm shadow-amber-400/30'
                    : isRareTitle
                      ? 'bg-white/15 text-amber-100 hover:bg-white/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {demoMaxLevel ? '還原真實進度' : '預覽滿級稱號 ✨'}
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1.5">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {isRareTitle && (
                  <motion.span
                    animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center shrink-0"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
                  </motion.span>
                )}
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap ${
                    isRareTitle
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 animate-gold-shine drop-shadow-[0_0_14px_rgba(251,191,36,0.65)]'
                      : 'text-indigo-700 dark:text-indigo-400'
                  }`}
                >
                  【{currentTitle}】
                </span>
              </span>
              <span
                className={`text-xs font-semibold tabular-nums whitespace-nowrap ${
                  isRareTitle ? 'text-indigo-200' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                已解鎖 {unlockedCount} / {totalCount}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className={`text-xs font-medium whitespace-nowrap ${isRareTitle ? 'text-amber-200/80' : 'text-slate-500 dark:text-slate-400'}`}>
              達成率
            </p>
            <p
              className={`text-xl sm:text-2xl font-black tabular-nums whitespace-nowrap ${
                isRareTitle
                  ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {progressPercent}%
            </p>
          </div>
        </div>

        {demoMaxLevel && (
          <p
            className={`mt-2.5 text-xs font-medium rounded-xl px-3 py-2 leading-relaxed relative z-10 border ${
              isRareTitle
                ? 'text-amber-100 bg-amber-400/15 border-amber-400/35'
                : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60'
            }`}
          >
            目前為滿級外觀預覽模式，僅供檢視稱號與徽章效果；里程碑優惠券須依實際累積進度解鎖後方可領取。
          </p>
        )}

        {/* Progress Bar */}
        <div
          className={`h-2.5 w-full rounded-full overflow-hidden mt-3.5 relative z-10 ${
            isRareTitle ? 'bg-white/15' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isRareTitle
                ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.65)]'
                : 'bg-gradient-to-r from-indigo-600 to-violet-500'
            }`}
          />
        </div>

        {/* Milestones Markers with Claimable Coupon Rewards (2x2 on mobile, 4-col on desktop) */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t relative z-10 ${
            isRareTitle ? 'border-white/10' : 'border-slate-100 dark:border-slate-800'
          }`}
        >
          {milestones.map((m, i) => {
            const realReached = realUnlockedCount >= m.target;
            const claimed = claimedCodes.includes(m.code) || (member?.coupons || []).some((c: any) => c.code === m.code);
            const remaining = Math.max(0, m.target - realUnlockedCount);

            return (
              <div
                key={i}
                className={`p-3 rounded-xl flex flex-col justify-between gap-2 text-center border ${
                  isRareTitle
                    ? realReached
                      ? 'bg-amber-400/15 border-amber-300/45'
                      : 'bg-white/8 border-white/15'
                    : realReached
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800/60'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="space-y-0.5">
                  <p
                    className={`text-xs font-bold whitespace-nowrap ${
                      isRareTitle
                        ? 'text-white'
                        : realReached
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m.target} 徽章 · {m.title}
                  </p>
                  <p
                    className={`text-xs font-extrabold whitespace-nowrap tabular-nums ${
                      isRareTitle ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {m.reward}
                  </p>
                </div>

                {claimed ? (
                  <span
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                      isRareTitle
                        ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    已領取
                  </span>
                ) : realReached && !demoMaxLevel ? (
                  <button
                    type="button"
                    onClick={() => handleClaimMilestone(m)}
                    className="w-full min-h-[34px] py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold cursor-pointer transition-all whitespace-nowrap"
                  >
                    領取神券
                  </button>
                ) : (
                  <span
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap tabular-nums ${
                      isRareTitle
                        ? 'bg-white/10 text-slate-300'
                        : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {demoMaxLevel ? '預覽不可領' : `尚差 ${remaining} 枚`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pb-4">
        {badges.map((b, i) => {
          const pct = Math.min(100, Math.round((b.current / b.target) * 100));
          return (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                b.locked
                  ? 'bg-white/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 opacity-85'
                  : isRareTitle
                    ? 'bg-white dark:bg-slate-900 border-amber-300/80 dark:border-amber-500/50 shadow-sm shadow-amber-500/10 ring-1 ring-amber-400/25'
                    : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/70 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-full ${b.bg} ${b.color} flex items-center justify-center shrink-0 ${
                      b.locked ? 'grayscale opacity-70' : isRareTitle ? 'ring-2 ring-amber-300/70 shadow-sm shadow-amber-400/30' : ''
                    }`}
                  >
                    <b.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums whitespace-nowrap ${
                      b.locked ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {b.locked ? `${b.current}/${b.target}` : '✓ 已達成'}
                  </span>
                </div>
                <h4 className={`font-black text-sm mb-1 ${b.locked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                  {b.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mb-3">{b.desc}</p>
              </div>

              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    b.locked
                      ? 'bg-slate-400 dark:bg-slate-600'
                      : isRareTitle
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ModalWrapper>
  );
};
export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  member?: any;
  setMember?: (m: any) => void;
  onAccountDeleted?: () => Promise<void> | void;
}> = ({ isOpen, onClose, member, setMember, onAccountDeleted }) => {
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const orderNotif = member?.settings?.orderNotif ?? true;
  const promoNotif = member?.settings?.promoNotif ?? false;

  useEffect(() => {
    if (isOpen) {
      setConfirmDeleteOpen(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const showToast = (text: string, ok: boolean = true) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleSetting = async (key: string) => {
    if (!setMember || !member) return;
    const currentSettings = member.settings || {};
    const currentValue =
      currentSettings[key] !== undefined ? currentSettings[key] : key === 'orderNotif';
    const nextSettings = {
      ...currentSettings,
      [key]: !currentValue,
    };
    const updated = {
      ...member,
      settings: nextSettings,
    };
    setMember(updated);
    try {
      localStorage.setItem('printcore_member', JSON.stringify(updated));
    } catch {}
    if (updated.id && updated.id !== 'guest') {
      saveCustomerUserData(updated.id, 'settings', nextSettings).catch(() => {});
      saveUserProfileToFirestore(updated).catch(() => {});
    }
    showToast(
      `已${!currentValue ? '開啟' : '關閉'}「${key === 'orderNotif' ? '訂單狀態通知' : '最新優惠與活動'}」並同步至雲端`,
      true
    );
  };

  const handlePasswordReset = async () => {
    if (isResetting) return;

    const currentUser = auth?.currentUser;
    const targetEmail = (currentUser?.email || member?.email || '').trim();

    if (!targetEmail) {
      showToast('無法取得您的註冊信箱，請重新登入後再試。', false);
      return;
    }

    // Check if logged in strictly via Google OAuth (no password provider attached)
    const providers = currentUser?.providerData || [];
    const isGoogleOnlyUser =
      providers.length > 0 && providers.every((p) => p.providerId === 'google.com');

    if (isGoogleOnlyUser) {
      showToast(
        '此帳號為 Google 快速登入（無獨立密碼），如需修改密碼請直接前往您的 Google 帳戶安全性設定變更。',
        true
      );
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      showToast(`密碼重設信已發送至 ${targetEmail}，請至收件匣（含垃圾郵件匣）查收！`, true);
    } catch (error: any) {
      console.warn('Password reset info:', error?.code, error?.message);
      if (error?.code === 'auth/too-many-requests') {
        showToast('發送次數過於頻繁，請稍候幾分鐘再試。', false);
      } else if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-email') {
        showToast(
          '此測試／本機帳號尚未註冊於 Firebase 密碼系統，請改用信箱重新註冊或使用 Google 帳號登入。',
          false
        );
      } else {
        showToast('發送密碼重設連結失敗，請確認信箱正確或稍後再試。', false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await deleteCustomerAccountAndData(member?.id);
      if (res.requiresRecentLogin) {
        showToast('雲端會員檔案已清除；若要徹底註銷 Google 驗證憑證，下次登入後可再次執行。', true);
      } else {
        showToast('帳號與所有個人資料已成功清除。', true);
      }
      if (onAccountDeleted) {
        await onAccountDeleted();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Delete account failed:', err);
      showToast('刪除帳號時發生異常，請稍後再試。', false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="系統設定">
      <div className="space-y-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 border shadow-sm ${
                toast.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 px-1">通知偏好</h4>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">訂單狀態通知</p>
                <p className="text-[11px] text-slate-500 mt-0.5">出貨與到貨時發送 Email</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={orderNotif}
                onClick={() => toggleSetting('orderNotif')}
                className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0 ${
                  orderNotif ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'
                }`}
              >
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">最新優惠與活動</p>
                <p className="text-[11px] text-slate-500 mt-0.5">接收限時特價與折價券資訊</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={promoNotif}
                onClick={() => toggleSetting('promoNotif')}
                className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors shrink-0 ${
                  promoNotif ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'
                }`}
              >
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 px-1">帳號安全</h4>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isResetting}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group disabled:opacity-50 cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {isResetting ? '正在發送重設連結...' : '寄送更改密碼連結'}
                </span>
                {member?.email && (
                  <span className="text-[11px] text-slate-400">將寄送至 {member.email}</span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>

            {!confirmDeleteOpen ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-rose-50 transition-colors text-left group cursor-pointer"
              >
                <span className="font-bold text-rose-600 text-sm">刪除帳號</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors shrink-0" />
              </button>
            ) : (
              <div className="p-4 bg-rose-50/90 space-y-3">
                <p className="text-xs font-bold text-rose-800 leading-relaxed">
                  確定要永久刪除帳號嗎？此動作將清除您的會員檔案、常用地址、購物車與通知紀錄，且無法復原。
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    取消保留
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? '正在清除資料...' : '確認永久刪除'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const FAQModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const faqs = [
    { q: '下單後多久會出貨？', a: '現貨商品將於 24 小時內安排出貨。超商取貨約需 2-3 天，宅配約 1-2 天即可送達。' },
    { q: '耗材受潮了怎麼辦？', a: '建議使用專用烘乾機以 50°C 烘烤 4-6 小時（PLA）或 65°C 烘烤（PETG）即可恢復列印品質。' },
    { q: '收到商品有瑕疵可以退換嗎？', a: '我們提供 7 天鑑賞期。若發現真空包裝破損、線材纏結或斷裂，請保持原包裝並聯繫客服，我們將免費為您更換。' },
    { q: '如何獲得免運優惠？', a: '全館單筆訂單滿 NT$ 999 即可享有超商與宅配免運優惠。若有促銷活動期間，免運門檻可能會進一步降低。' }
  ];
  
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="常見問題 (FAQ)">
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-sm">
            <button 
              onClick={() => setOpenIdx(openIdx === i ? null : i)} 
              className="w-full text-left p-4 font-bold text-slate-900 flex justify-between items-center bg-white"
            >
              <span className="pr-4">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${openIdx === i ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-50 mt-1">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h5 className="font-bold text-indigo-900 text-sm mb-1">還有其他問題嗎？</h5>
          <p className="text-xs text-indigo-700/80 leading-relaxed mb-3">如果您在這裡找不到解答，歡迎隨時透過客服管道與我們聯繫，我們將盡快協助您。</p>
          <button onClick={() => {
            onClose();
            navigate('/contact');
          }} className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            前往聯絡客服
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const NotificationModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any }> = ({ isOpen, onClose, member }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (!member?.id || member.id === 'guest') {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: any = null;
    const fetchNotifications = async () => {
      try {
        const { db } = await import('../../lib/firebase');
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        const q = query(collection(db, 'users', member.id, 'notifications'), orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setNotifications(notifs);
            setLoading(false);
          },
          (err) => {
            console.warn('Notifications snapshot fallback:', err);
            setLoading(false);
          }
        );
      } catch (e) {
        console.warn(e);
        setLoading(false);
      }
    };
    fetchNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, member?.id]);

  const markAllAsRead = async () => {
    if (!member?.id || member.id === 'guest') return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      const { db } = await import('../../lib/firebase');
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, 'users', member.id, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (isOpen && notifications.some((n) => !n.read)) {
      markAllAsRead();
    }
  }, [isOpen, notifications]);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="系統通知">
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400">載入中...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-600">目前沒有新通知</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => (
              <div key={n.id || idx} className={`p-4 rounded-2xl border ${n.read ? 'bg-white border-slate-100' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="flex items-start gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                     <Bell className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <h4 className={`font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
                       {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                     </div>
                     <p className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-700'}`}>{n.message}</p>
                     <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString('zh-TW')}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
