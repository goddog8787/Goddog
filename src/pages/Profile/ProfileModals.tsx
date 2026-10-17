import { getDocs, query, collection, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { loadCustomerUserData, saveCustomerUserData, loadCustomerRecentlyViewed, clearCustomerRecentlyViewed, deleteSingleCustomerRecentlyViewed, getStoredRecentlyViewedSync } from '../../lib/customerPersistence';
import { isMockOrder } from '../../lib/orderVerification';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { formatPrice, translateProductName, translateMaterial } from '../../utils/i18n';
import { LanguageCode, CurrencyCode } from '../../types';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import {  X, MapPin, Printer, Package, Copy, Share2, Medal, Lock, Bell, Check, Edit2, Trash2, Plus, ArrowRight, ShieldCheck, Clock, CreditCard, ShoppingCart, Gift, Ticket, Download, ChevronDown, Star , Zap, Palette, Layers, Users, Calendar, Sliders, Truck } from 'lucide-react';
import { OrderCertificateModal } from '../../components/Storefront/OrderCertificateModal';

const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" />
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-x-0 bottom-0 z-50 bg-slate-50 rounded-t-[32px] overflow-hidden flex flex-col max-w-xl mx-auto shadow-2xl" style={{ maxHeight: '90vh' }}>
          <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 shrink-0">
            <h3 className="font-black text-lg text-slate-900">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 pb-24">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);


export const OrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  orders?: any[];
  member?: any;
  onConfirmReceipt?: (orderId: string) => Promise<void> | void;
  onGoReview?: (productId: string) => void;
  onOpenTracking?: (trackingNumber: string) => void;
}> = ({ isOpen, onClose, initialTab = 'all', orders = [], member, onConfirmReceipt, onGoReview, onOpenTracking }) => {
  const [tab, setTab] = useState(initialTab);
  const [selectedCertOrder, setSelectedCertOrder] = useState<any | null>(null);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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

  const tabs = [{ id: 'all', label: '全部' }, { id: 'unpaid', label: '待付款' }, { id: 'processing', label: '待出貨' }, { id: 'shipping', label: '運送中' }, { id: 'done', label: '已完成' }, { id: 'returning', label: '退換貨' }];
  
  const mappedOrders = orders.filter(o => !isMockOrder(o)).map(o => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    const isDone = s === 'completed' || s === 'delivered' || s === '已完成';
    const isShip = s === 'shipping' || s === 'shipped' || s === '運送中';
    const isProc = s === 'processing' || s === 'picking' || s === 'paid' || s === '待出貨';
    const isRet = s === 'returning' || s === '退換貨';
    const isUnpaid = s === 'unpaid' || s === '待付款';

    return {
      raw: o,
      id: o.orderNumber || o.id,
      status: isUnpaid ? '待付款' : 
              isProc ? '待出貨' : 
              isShip ? '運送中' : 
              isRet ? '退換貨' : '已完成',
      date: new Date(o.createdAt || Date.now()).toLocaleDateString(),
      items: o.items?.map((item:any) => item.name) || [],
      total: o.totalAmount || o.total || o.subtotal || 0,
      color: isUnpaid ? 'text-rose-600' : isDone ? 'text-emerald-600' : 'text-indigo-600',
      bg: isUnpaid ? 'bg-rose-50' : isDone ? 'bg-emerald-50' : 'bg-indigo-50',
      canConfirm: isShip || isProc,
      isDone: isDone,
    };
  });

  const filtered = tab === 'all' ? mappedOrders : mappedOrders.filter(o => {
    if (tab === 'unpaid') return o.status === '待付款';
    if (tab === 'processing') return o.status === '待出貨';
    if (tab === 'shipping') return o.status === '運送中';
    if (tab === 'done') return o.status === '已完成';
    if (tab === 'returning') return o.status === '退換貨';
    return true;
  });

  const handleConfirm = async (orderId: string) => {
    if (!onConfirmReceipt) return;
    setIsConfirmingId(orderId);
    try {
      await onConfirmReceipt(orderId);
    } finally {
      setIsConfirmingId(null);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的訂單">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{t.label}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 font-bold">{order.id}</span>
                <button
                  onClick={() => handleCopy(order.id)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="複製訂單編號"
                >
                  {copiedText === order.id ? (
                    <span className="text-[10px] text-emerald-600 font-bold">已複製</span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.color} ${order.bg}`}>{order.status}</span>
            </div>
            {order.raw?.trackingNumber && order.raw.trackingNumber !== '77391829310' && !order.raw.trackingNumber.includes('77391829310') && (
              <div className="mb-3 px-3 py-1.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px] text-slate-400">物流單號：</span>
                  <span className="font-mono font-bold text-slate-700">{order.raw.trackingNumber}</span>
                  <button
                    onClick={() => handleCopy(order.raw.trackingNumber)}
                    className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="複製物流單號"
                  >
                    {copiedText === order.raw.trackingNumber ? (
                      <span className="text-[10px] text-emerald-600 font-bold">已複製</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                {onOpenTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTracking(order.raw.trackingNumber);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    即時物流進度 ↗
                  </button>
                )}
              </div>
            )}
            <div className="space-y-2 mb-4">
              {order.items.map((item: string, idx: number) => (
                <div key={idx} className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-300" /> {item}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400">{order.date}</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCertOrder(order.raw)}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="檢視憑證驗證與下載證明檔案"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>電子憑證</span>
                </button>
                {order.status === '待付款' && <button className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600">立即付款</button>}
                {order.canConfirm && onConfirmReceipt && (
                  <button
                    onClick={() => handleConfirm(order.raw.id)}
                    disabled={isConfirmingId === order.raw.id}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    title="我已收到包裹，確認收貨並解鎖商品真實評價"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isConfirmingId === order.raw.id ? '確認中...' : '確認收貨'}</span>
                  </button>
                )}
                {order.isDone && order.raw?.items?.[0]?.productId && onGoReview && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoReview(order.raw.items[0].productId);
                    }}
                    className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="已收貨完成，點此發表商品真實評價"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>評價商品</span>
                  </button>
                )}
                {(order.status === '已完成' || order.status === '退換貨') && <button className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-100">申請售後</button>}
                <span className="font-black text-slate-900">NT$ {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <Package className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-400 font-bold">目前沒有相關訂單</p>
          </div>
        )}
      </div>

      <OrderCertificateModal
        isOpen={!!selectedCertOrder}
        onClose={() => setSelectedCertOrder(null)}
        order={selectedCertOrder}
      />
    </ModalWrapper>
  );
};

export const PrinterModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any }> = ({ isOpen, onClose, member }) => {
  const [printers, setPrinters] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomerUserData(member?.id, 'printers').then(data => {
        if (data && data.length > 0) setPrinters(data);
        else setPrinters([]); // Don't add mock data
      });
    }
  }, [isOpen, member?.id]);

  const saveToDb = (newPrinters: any[]) => {
    setPrinters(newPrinters);
    saveCustomerUserData(member?.id, 'printers', newPrinters);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    saveToDb([...printers, { id: Date.now(), name: newName, type: '自訂機台', current: printers.length === 0 }]);
    setNewName('');
    setIsAdding(false);
  };

  const handleSetDefault = (id: number) => {
    saveToDb(printers.map(p => ({ ...p, current: p.id === id })));
  };

  const handleDelete = (id: number) => {
    saveToDb(printers.filter(p => p.id !== id));
  };
return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的列印機車庫">
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex gap-3">
        <Printer className="w-6 h-6 text-indigo-600 shrink-0" />
        <p className="text-sm text-indigo-800 font-medium">設定您的機台，系統在您購物時將自動過濾並提供最精準的參數建議！</p>
      </div>
      
      <div className="space-y-4 mb-6">
        {printers.map((p) => (
          <div key={p.id} className={`bg-white p-4 rounded-2xl border ${p.current ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-slate-900">{p.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{p.type}</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {p.current ? (
              <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> 當前預設使用機台
              </div>
            ) : (
              <button onClick={() => handleSetDefault(p.id)} className="w-full text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors">
                設為預設機台
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="輸入機台型號 (例: Ender 3 V2)" 
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-500 font-bold bg-white border border-slate-300 rounded-xl">取消</button>
            <button onClick={handleAdd} className="flex-1 py-3 text-white font-bold bg-slate-900 rounded-xl hover:bg-slate-800">儲存機台</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> 新增 3D 列印機
        </button>
      )}
    </ModalWrapper>
  );
};


export const AddressModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any }> = ({ isOpen, onClose, member }) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', addr: '' });

  useEffect(() => {
    if (isOpen) {
      loadCustomerUserData(member?.id, 'addresses').then(data => {
        if (data && data.length > 0) setAddresses(data);
        else setAddresses([]);
      });
    }
  }, [isOpen, member?.id]);

  const saveToDb = (newAddrs: any[]) => {
    setAddresses(newAddrs);
    saveCustomerUserData(member?.id, 'addresses', newAddrs);
  };

  const handleAdd = () => {
    if (!form.name || !form.addr) return;
    saveToDb([...addresses, { id: Date.now(), ...form, isDefault: addresses.length === 0 }]);
    setForm({ name: '', phone: '', addr: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    saveToDb(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = (id: number) => {
    saveToDb(addresses.map(a => ({ ...a, isDefault: a.id === id })));
  };
return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="地址資訊管理">
      <div className="space-y-4 mb-6">
        {addresses.map(a => (
          <div key={a.id} className={`bg-white p-5 rounded-2xl border-2 relative overflow-hidden transition-all ${a.isDefault ? 'border-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-100 shadow-sm'}`}>
            {a.isDefault && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">預設收件</div>}
            
            <div className="flex items-start gap-3">
              <MapPin className={`w-5 h-5 mt-0.5 ${a.isDefault ? 'text-indigo-500' : 'text-slate-400'}`} />
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">{a.name} <span className="text-xs font-medium text-slate-500">{a.phone}</span></h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{a.addr}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
              {!a.isDefault && (
                <button onClick={() => handleSetDefault(a.id)} className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">設為預設</button>
              )}
              <button onClick={() => handleDelete(a.id)} className="flex-1 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3" /> 刪除
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && !isAdding && (
          <div className="text-center py-8 text-slate-400 font-bold bg-slate-50 rounded-2xl border border-slate-100">目前沒有設定任何地址</div>
        )}
      </div>

      {isAdding ? (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
          <input type="text" placeholder="收件人姓名" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500" />
          <input type="text" placeholder="聯絡電話" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500" />
          <textarea placeholder="詳細地址" value={form.addr} onChange={e => setForm({...form, addr: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 resize-none" />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-slate-500 font-bold bg-white border border-slate-300 rounded-xl">取消</button>
            <button onClick={handleAdd} className="flex-1 py-3 text-white font-bold bg-slate-900 rounded-xl hover:bg-slate-800">儲存地址</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> 新增收件地址
        </button>
      )}
    </ModalWrapper>
  );
};


export const ReferralModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any; setMember?: (m:any)=>void }> = ({ isOpen, onClose, member, setMember }) => {
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
    const link = `https://goddog.space/r/${member?.referralCode || member?.id || 'guest'}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const referralCount = member?.referrals || 0;
  const referralEarnings = member?.referralEarnings || 0;

  const handleWithdraw = async () => {
    if (referralEarnings <= 0) return;
    setWithdrawing(true);
    try {
      if (setMember && member?.id) {
        // Also call the API or update firestore directly if you had the function. 
        // Update firestore directly
        import('../../lib/firebase').then(({ saveUserProfileToFirestore }) => {
          saveUserProfileToFirestore({
            ...member,
            referralEarnings: 0,
            points: (member.points || 0) + referralEarnings
          });
        });
        setMember((prev:any) => ({
           ...prev, 
           referralEarnings: 0, 
           points: (prev.points || 0) + referralEarnings
        }));
      }
    } catch(e) {
      console.error(e);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="推廣賺現金 (推薦碼)">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white text-center shadow-lg shadow-indigo-500/20 mb-6">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <Gift className="w-8 h-8 text-amber-300" />
        </div>
        <h3 className="font-black text-2xl mb-2">邀請註冊送 100 狗勾幣</h3>
        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
          只要好友透過您的專屬連結完成註冊，您與好友將會自動獲得 <strong className="text-amber-300">100 點狗勾幣 (等值 NT$ 100)</strong>。買耗材立刻折抵！
        </p>
        
        <div className="bg-white/10 p-1.5 rounded-2xl backdrop-blur-md flex items-center border border-white/20">
          <div className="flex-1 text-sm font-mono truncate px-3">{link}</div>
          <button onClick={handleCopy} className="bg-white text-indigo-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已複製' : '複製連結'}
          </button>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black text-slate-900">我的推廣收益</h4>
          <button 
            onClick={handleWithdraw}
            disabled={referralEarnings <= 0 || withdrawing}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${referralEarnings > 0 ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 bg-slate-100 cursor-not-allowed'}`}>
            {withdrawing ? '處理中...' : <><Download className="w-3 h-3" /> 提領至狗勾幣</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-400 mb-1">成功註冊</p>
            <p className="text-2xl font-black text-slate-900">{referralCount} <span className="text-xs font-medium text-slate-500">人</span></p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-400 mb-1">可提領現金</p>
            <p className="text-2xl font-black text-amber-500"><span className="text-lg">$</span>{referralEarnings}</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const CouponModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any; setMember?: (m:any)=>void }> = ({ isOpen, onClose, member, setMember }) => {
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [msg, setMsg] = useState('');

  const coupons = member?.coupons || [];

  const handleRedeem = () => {
    if(!code.trim()) return;
    setRedeeming(true);
    setTimeout(() => {
      if(code === 'GODDOG2026') {
        const newCoupon = { id: Date.now(), name: '新客專屬 $100 折價券', discount: 100, expiry: '2026-12-31' };
        if(setMember) {
          const updated = {...member, coupons: [...(member?.coupons||[]), newCoupon]};
          setMember(updated);
          import('../../lib/firebase').then(({ saveUserProfileToFirestore }) => saveUserProfileToFirestore(updated));
        }
        setMsg('兌換成功！');
      } else {
        setMsg('無效的優惠碼或已過期');
      }
      setRedeeming(false);
      setCode('');
      setTimeout(()=>setMsg(''), 3000);
    }, 800);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="我的優惠券">
      <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm mb-2">輸入優惠代碼</h4>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="輸入序號兌換" 
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono uppercase"
          />
          <button 
            onClick={handleRedeem}
            disabled={redeeming || !code}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
          >
            {redeeming ? '兌換中...' : '兌換'}
          </button>
        </div>
        {msg && <p className={`text-xs font-bold mt-2 ${msg.includes('成功') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
      </div>

      <h4 className="font-bold text-slate-900 mb-3 px-1">可使用的優惠券 ({coupons.length})</h4>
      <div className="space-y-3">
        {coupons.length > 0 ? coupons.map((c:any) => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500"></div>
            <div className="pl-3">
              <h5 className="font-black text-slate-900">{c.name}</h5>
              <p className="text-xs text-slate-500 mt-1">有效期限: {c.expiry}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-600"><span className="text-sm">$</span>{c.discount}</p>
            </div>
          </div>
        )) : (
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


export const AchievementModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any; orders?: any[] }> = ({ isOpen, onClose, member, orders }) => {
  const [demoMaxLevel, setDemoMaxLevel] = useState(false);
  
  const calcBadges = () => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const hasOrder = safeOrders.length > 0;
    
    // Total items bought (approximating 1kg per item)
    const totalItems = safeOrders.reduce((sum, o) => {
       return sum + (o.items?.reduce((s: number, item: any) => s + (item.quantity || 1), 0) || 1);
    }, 0);
    
    // Night owl: 0-4 AM
    const nightOwl = safeOrders.some(o => {
       if (!o.createdAt) return false;
       const hour = new Date(o.createdAt).getHours();
       return hour >= 0 && hour < 4;
    });
    
    // Eco pioneer
    const ecoPioneer = safeOrders.some(o => o.items?.some((i: any) => i.name?.includes('環保') || i.name?.includes('紙盤'))) || (totalItems >= 5);

    // Color master
    const uniqueColors = new Set();
    safeOrders.forEach(o => o.items?.forEach((i: any) => {
       if (i.color || i.selectedColor?.name) uniqueColors.add(i.color || i.selectedColor?.name);
    }));
    
    // Material explorer
    const uniqueMats = new Set();
    safeOrders.forEach(o => o.items?.forEach((i: any) => {
       if (i.material || i.name) uniqueMats.add(i.material || i.name?.split(' ')[0] || 'PLA');
    }));

    const bigSpender = safeOrders.some(o => (Number(o.totalAmount || o.total) || 0) >= 5000);

    return [
      { name: '首購族', desc: '完成第一筆訂單', icon: Medal, color: 'text-amber-500', bg: 'bg-amber-100', locked: !hasOrder },
      { name: '列印狂人', desc: '累積購買 10kg 耗材', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-100', locked: totalItems < 10 },
      { name: '環保先鋒', desc: '購買 5 捲紙盤環保線材', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100', locked: !ecoPioneer },
      { name: '夜貓列印', desc: '凌晨 0-4 點下單', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', locked: !nightOwl },
      { name: '評價達人', desc: '留下 3 則五星評價', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', locked: (member?.reviewsCount || 0) < 3 },
      { name: '早鳥搶購', desc: '在新品上市 24 小時內購買', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', locked: !member?.earlyBird },
      { name: '色彩大師', desc: '購買 10 種不同顏色耗材', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-100', locked: uniqueColors.size < 10 },
      { name: '材質探險家', desc: '購買 5 種不同材質耗材', icon: Layers, color: 'text-cyan-500', bg: 'bg-cyan-100', locked: uniqueMats.size < 5 },
      { name: '呼朋引伴', desc: '成功邀請 3 位好友下單', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100', locked: (member?.referralsCount || 0) < 3 },
      { name: '大戶人家', desc: '單筆訂單超過 $5,000', icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-100', locked: !bigSpender },
      { name: '忠實鐵粉', desc: '連續 6 個月皆有下單', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100', locked: !member?.loyalFan },
      { name: '參數魔法師', desc: '分享 5 組切片參數', icon: Sliders, color: 'text-teal-500', bg: 'bg-teal-100', locked: (member?.sharedParamsCount || 0) < 5 },
    ];
  };

  const badgesData = calcBadges();
  
  const badges = badgesData.map((b) => demoMaxLevel ? { ...b, locked: false } : b);
  const unlockedCount = badges.filter(b => !b.locked).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const milestones = [
    { target: 3, title: '新手創客', reward: '$50 優惠券' },
    { target: 6, title: '列印老手', reward: '$100 優惠券' },
    { target: 9, title: '神狗勾大使', reward: '$200 優惠券' },
    { target: 12, title: '列印大神', reward: '免運神券' },
  ];

  
  const currentTitle = milestones.slice().reverse().find(m => unlockedCount >= m.target)?.title || '見習創客';

  const isRareTitle = currentTitle === '神狗勾大使' || currentTitle === '列印大神';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="創客成就徽章">
      <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-end mb-2 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">目前稱號</p>
              <button onClick={() => setDemoMaxLevel(!demoMaxLevel)} className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold hover:bg-slate-300 transition-colors">
                {demoMaxLevel ? '還原真實進度' : '預覽滿級稱號 ✨'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black ${isRareTitle ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600 animate-gold-shine drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-indigo-700'}`}>【{currentTitle}】</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{unlockedCount} / {totalCount}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500">進度</p>
            <p className="text-lg font-black text-slate-800">{progressPercent}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative z-10 mt-3 mb-1">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progressPercent}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>
        
        {/* Milestones Markers */}
        <div className="flex justify-between mt-2 relative z-10 px-1">
          {milestones.map((m, i) => {
             const reached = unlockedCount >= m.target;
             return (
               <div key={i} className="flex flex-col items-center">
                 <div className={`w-1.5 h-1.5 rounded-full mb-1 ${reached ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                 <span className={`text-[10px] font-bold ${reached ? 'text-indigo-600' : 'text-slate-400'}`}>{m.target}</span>
                 <span className={`text-[9px] mt-0.5 ${reached ? 'text-indigo-500' : 'text-slate-400'}`}>{m.title}</span>
                 <span className="text-[8px] text-slate-400">{m.reward}</span>
               </div>
             );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pb-4">
        {badges.map((b, i) => (
          <div key={i} className={`p-3 rounded-2xl border relative overflow-hidden transition-all duration-300 hover:shadow-md ${b.locked ? 'bg-slate-50 border-slate-100 opacity-70 grayscale' : 'bg-white border-indigo-100 shadow-sm'}`}>
            {b.locked && <Lock className="absolute top-3 right-3 w-3 h-3 text-slate-300" />}
            <div className={`w-10 h-10 rounded-full ${b.bg} ${b.color} flex items-center justify-center mb-2 shadow-inner`}>
              <b.icon className="w-5 h-5" />
            </div>
            <h4 className={`font-black text-sm mb-0.5 ${b.locked ? 'text-slate-600' : 'text-indigo-900'}`}>{b.name}</h4>
            <p className="text-[10px] text-slate-500 leading-tight">{b.desc}</p>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};
export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; member?: any; setMember?: (m:any)=>void }> = ({ isOpen, onClose, member, setMember }) => {
  const [toast, setToast] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const orderNotif = member?.settings?.orderNotif ?? true;
  const promoNotif = member?.settings?.promoNotif ?? false;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleSetting = (key: string) => {
    if (setMember) {
      setMember((prev: any) => {
        const currentSettings = prev.settings || {};
        const currentValue = currentSettings[key] !== undefined 
            ? currentSettings[key] 
            : (key === 'orderNotif' ? true : false);
            
        return {
          ...prev,
          settings: {
            ...currentSettings,
            [key]: !currentValue
          }
        };
      });
    }
  };

  const handlePasswordReset = async () => {
    if (isResetting) return;
    
    // Fallback email if member.email isn't available
    const targetEmail = member?.email || auth?.currentUser?.email;
    
    if (!targetEmail) {
       showToast('無法取得您的信箱，請重新登入後再試。');
       return;
    }
    
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      showToast('密碼重置信已成功發送至：' + targetEmail);
    } catch (error: any) {
      console.error('Password reset error:', error);
      showToast('發送失敗，請稍後再試或聯繫客服。');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="系統設定">
      <div className="space-y-6 relative">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute -top-10 left-0 right-0 flex justify-center z-50">
              <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Check className="w-3 h-3" /> {toast}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 px-1">通知偏好</h4>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">訂單狀態通知</p>
                <p className="text-[10px] text-slate-500 mt-0.5">出貨與到貨時發送 Email</p>
              </div>
              <button onClick={() => toggleSetting('orderNotif')} className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${orderNotif ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm"></motion.div>
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">最新優惠與活動</p>
                <p className="text-[10px] text-slate-500 mt-0.5">接收限時特價與折價券資訊</p>
              </div>
              <button onClick={() => toggleSetting('promoNotif')} className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${promoNotif ? 'bg-indigo-500 justify-end' : 'bg-slate-200 justify-start'}`}>
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm"></motion.div>
              </button>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-3 px-1">帳號安全</h4>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <button onClick={handlePasswordReset} disabled={isResetting} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group disabled:opacity-50">
              <span className="font-bold text-slate-900 text-sm">{isResetting ? '發送中...' : '寄送更改密碼連結'}</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
            <button onClick={() => showToast('為保護帳戶安全，請聯繫客服進行刪除程序')} className="w-full p-4 flex items-center justify-between hover:bg-rose-50 transition-colors text-left group">
              <span className="font-bold text-rose-600 text-sm">刪除帳號</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
            </button>
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
    let unsubscribe: any = null;
    const fetchNotifications = async () => {
      if (isOpen && member?.id) {
        try {
          const { db } = await import('../../lib/firebase');
          const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
          const q = query(collection(db, 'users', member.id, 'notifications'), orderBy('createdAt', 'desc'));
          unsubscribe = onSnapshot(q, (snapshot) => {
             const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             setNotifications(notifs);
             setLoading(false);
          });
        } catch(e) {
          console.warn(e);
          setLoading(false);
        }
      }
    };
    fetchNotifications();
    return () => {
       if(unsubscribe) unsubscribe();
    };
  }, [isOpen, member?.id]);

  const markAllAsRead = async () => {
    if (!member?.id) return;
    try {
      const { db } = await import('../../lib/firebase');
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      notifications.forEach(n => {
        if (!n.read) {
          batch.update(doc(db, 'users', member.id, 'notifications', n.id), { read: true });
        }
      });
      await batch.commit();
    } catch(e) { console.warn(e); }
  };

  useEffect(() => {
    if (isOpen) {
       // Mark all as read when opening
       markAllAsRead();
    }
  }, [isOpen, notifications.length]);

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
