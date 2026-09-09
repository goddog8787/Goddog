import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Coins, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Award, 
  Zap,
  Package,
  Truck,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MemberProfile, CurrencyCode, Order } from '../../types';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  currency: CurrencyCode;
  orders?: Order[];
  onOpenTrackingWithCode?: (trackingCode: string) => void;
  onLogout?: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  member,
  currency,
  orders = [],
  onOpenTrackingWithCode,
  onLogout,
}) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState<'perks' | 'orders'>('perks');
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://printhub.3d/join?ref=${member.referralCode || 'MAKER3D'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextTierNeeded = 20000;
  const progressToNextTier = Math.min(100, Math.round(((member.totalSpent || 0) / nextTierNeeded) * 100));

  // Filter orders for this customer if user ID exists
  const customerOrders = orders.filter(
    (o) => !o.customerEmail || o.customerEmail.toLowerCase() === member.email.toLowerCase() || (o as any).userId === member.id
  );
  const displayOrders = customerOrders.length > 0 ? customerOrders : orders;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Crown className="w-7 h-7 text-amber-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold">{member.name}</h3>
                  <span className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full text-xs">
                    {member.tier} 創客
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-0.5 font-mono">
                  帳號：{member.email} • 累積消費 NT$ {(member.totalSpent || 0).toLocaleString()} 元
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer transition-colors"
                title="登出目前帳號"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出</span>
              </button>
            )}
          </div>

          {/* Navigation Tabs inside Header */}
          <div className="flex gap-2 mt-5 border-t border-white/20 pt-3">
            <button
              onClick={() => setActiveTab('perks')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'perks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-amber-100 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                會員禮遇與點數
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-amber-100 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                購買紀錄與物流 ({displayOrders.length})
              </span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'perks' ? (
            <>
              {/* Points Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-800">現有可用會員積分</span>
                  <div className="text-3xl font-black font-mono text-amber-900 mt-1 flex items-baseline gap-1">
                    <span>{member.points}</span>
                    <span className="text-sm font-normal text-amber-700">pt</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block">
                    約可折抵現金 <strong className="font-mono">NT$ {member.points}</strong> 元 (結帳無門檻折抵)
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-700 flex items-center justify-center">
                  <Coins className="w-7 h-7" />
                </div>
              </div>

              {/* Tier Progress */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">晉升至【Diamond 鑽石極客】等級進度</span>
                  <span className="text-indigo-600 font-mono">{progressToNextTier}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressToNextTier}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  再消費 NT$ {Math.max(0, nextTierNeeded - (member.totalSpent || 0)).toLocaleString()} 即可解鎖「全館終身免運 + 3倍積分回饋」！
                </p>
              </div>

              {/* Member Privileges List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  當前創客專屬禮遇
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">消費每滿 $10 贈 1 點</div>
                      <div className="text-[10px] text-slate-500">積分無使用期限</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">生日當月加贈 500 點</div>
                      <div className="text-[10px] text-slate-500">現折 NT$500 購物金</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">新限定色優先預購權</div>
                      <div className="text-[10px] text-slate-500">提早 48 小時鎖定</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">無限制 AI 切片顧問</div>
                      <div className="text-[10px] text-slate-500">雲端保存諮詢紀錄</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    推薦好友創客加入，雙方各得 100 點！
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://printhub.3d/join?ref=${member.referralCode || 'MAKER3D'}`}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製' : '複製'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Orders and Purchase Records Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">您的歷史購買紀錄與包裹物流</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已自動同步至 Firebase 雲端資料庫，更換裝置或瀏覽器皆會完整保留。
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
                  共 {displayOrders.length} 筆訂單
                </span>
              </div>

              {displayOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-600 text-sm font-medium">目前尚無已完成的訂單紀錄</p>
                  <p className="text-xs text-slate-400">在耗材商城下單後，訂單與配送單號將即時同步於此。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-shadow shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {order.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdAt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            order.orderStatus === 'completed' || order.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'dispatched' || order.orderStatus === 'in_transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus === 'completed' ? '已取貨完成' :
                             order.orderStatus === 'delivered' ? '已抵達門市' :
                             order.orderStatus === 'dispatched' ? '已出庫配送' :
                             order.orderStatus === 'in_transit' ? '包裹轉運中' : '訂單處理中'}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="font-medium text-slate-800">{item.name}</span>
                              <span className="text-slate-400 text-[11px]">({item.colorName})</span>
                            </div>
                            <span className="font-mono text-slate-600">
                              x{item.quantity} • NT$ {item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Logistics Tracking Info */}
                      <div className="bg-slate-50 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>配送方式：{order.shippingMethod?.toUpperCase() || '7-11'} | {order.storeOrAddress}</span>
                          </div>
                          <div className="text-slate-700 font-mono text-[11px]">
                            託運單號：<strong className="text-slate-900">{order.trackingNumber}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">總金額</div>
                            <div className="font-mono font-bold text-slate-900 text-sm">
                              NT$ {order.total?.toLocaleString()}
                            </div>
                          </div>
                          {onOpenTrackingWithCode && (
                            <button
                              onClick={() => {
                                onOpenTrackingWithCode(order.trackingNumber);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="查詢此包裹詳細即時物流"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>即時追蹤</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Logout Button for Mobile */}
          {onLogout && (
            <div className="pt-3 border-t border-slate-100 flex sm:hidden justify-center">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1"
              >
                <LogOut className="w-4 h-4" />
                <span>登出目前帳號</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
