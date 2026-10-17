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
import { MemberProfile, CurrencyCode, Order, LanguageCode } from '../../types';
import { formatPrice, translateProductName, translateColorName } from '../../utils/i18n';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberProfile;
  currency: CurrencyCode;
  orders?: Order[];
  lang?: LanguageCode;
  onOpenTrackingWithCode?: (trackingCode: string) => void;
  onLogout?: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  member,
  currency,
  orders = [],
  lang: propLang = 'zh-TW',
  onOpenTrackingWithCode,
  onLogout,
}) => {
  const lang: LanguageCode = (propLang as LanguageCode) || 'zh-TW';
  const [activeTab, setActiveTab] = useState<'perks' | 'orders'>('perks');
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://printhub.3d/join?ref=${member?.referralCode || 'MAKER3D'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextTierNeeded = 20000;
  const progressToNextTier = Math.min(100, Math.round(((member?.totalSpent || 0) / nextTierNeeded) * 100));

  // Filter orders for this customer if user ID exists
  const customerOrders = orders.filter(
    (o) => !o.customerEmail || o.customerEmail.toLowerCase() === (member?.email || "").toLowerCase() || (o as any).userId === member?.id
  );
  const displayOrders = customerOrders.length > 0 ? customerOrders : orders;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative cursor-default select-text"
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
                  <h3 className="text-xl font-extrabold">{member?.name || (lang === 'en' ? 'Member' : lang === 'ja' ? '会員' : '會員')}</h3>
                  <span className="bg-slate-900 text-amber-300 font-bold px-2 py-0.5 rounded-full text-xs">
                    {(member?.tier || "Silver")} {lang === 'en' ? 'Maker' : lang === 'ja' ? 'メイカー' : '創客'}
                  </span>
                </div>
                <p className="text-xs text-amber-100 mt-0.5 font-mono">
                  {lang === 'en' ? 'Account: ' : lang === 'ja' ? 'アカウント：' : '帳號：'}{member?.email || ""} • {lang === 'en' ? 'Total Spent: ' : lang === 'ja' ? '累計購入額：' : '累積消費 '}{formatPrice(member?.totalSpent || 0, currency)}
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
                title={lang === 'en' ? 'Sign out' : lang === 'ja' ? 'ログアウト' : '登出目前帳號'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Sign Out' : lang === 'ja' ? 'ログアウト' : '登出'}</span>
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
                {lang === 'en' ? 'Privileges & Points' : lang === 'ja' ? '特典＆ポイント' : '會員禮遇與點數'}
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
                {lang === 'en' ? `Orders & Logistics (${displayOrders.length})` : lang === 'ja' ? `注文履歴＆配送 (${displayOrders.length})` : `購買紀錄與物流 (${displayOrders.length})`}
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
                  <span className="text-xs font-semibold text-amber-800">
                    {lang === 'en' ? 'Available Member Points' : lang === 'ja' ? '保有会員ポイント' : '現有可用會員積分'}
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-900 mt-1 flex items-baseline gap-1">
                    <span>{(member?.points || 0)}</span>
                    <span className="text-sm font-normal text-amber-700">pt</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block">
                    {lang === 'en' 
                      ? `Redeemable for approx. ${formatPrice(member?.points || 0, currency)} at checkout` 
                      : lang === 'ja' 
                      ? `決済時に約 ${formatPrice(member?.points || 0, currency)} 相当の割引可能` 
                      : `約可折抵現金 NT$ ${(member?.points || 0)} 元 (結帳無門檻折抵)`}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-700 flex items-center justify-center">
                  <Coins className="w-7 h-7" />
                </div>
              </div>

              {/* Tier Progress */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">
                    {lang === 'en' ? 'Progress to [Diamond Geek] Tier' : lang === 'ja' ? '【Diamond ギーク】昇格進捗' : '晉升至【Diamond 鑽石極客】等級進度'}
                  </span>
                  <span className="text-indigo-600 font-mono">{progressToNextTier}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressToNextTier}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en'
                    ? `Spend ${formatPrice(Math.max(0, nextTierNeeded - (member?.totalSpent || 0)), currency)} more to unlock Lifetime Free Shipping + 3x Points!`
                    : lang === 'ja'
                    ? `あと ${formatPrice(Math.max(0, nextTierNeeded - (member?.totalSpent || 0)), currency)} のご購入で「全品永久送料無料＋ポイント3倍」解禁！`
                    : `再消費 NT$ ${Math.max(0, nextTierNeeded - (member?.totalSpent || 0)).toLocaleString()} 即可解鎖「全館終身免運 + 3倍積分回饋」！`}
                </p>
              </div>

              {/* Member Privileges List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'en' ? 'Current Maker Privileges' : lang === 'ja' ? '現在のメイカー限定特典' : '當前創客專屬禮遇'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? '5% Points Cashback' : lang === 'ja' ? '5% ポイント還元' : '消費享 5% 點數回饋'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'en' ? 'Earn 5 pts per $100 spent, points never expire' : lang === 'ja' ? '100元購入ごとに5pt、有効期限なし' : '每滿 $100 送 5 點，積分無期限'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Gift className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? 'Birthday Month Bonus 500 Pts' : lang === 'ja' ? '誕生月ボーナス 500pt' : '生日當月加贈 500 點'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'en' ? 'Instant coupon redemption' : lang === 'ja' ? 'お買い物クーポンとして即時利用可能' : '現折購物金'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? 'Early Access to New Colors' : lang === 'ja' ? '新色先行予約権利' : '新限定色優先預購權'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'en' ? '48 hours advance order lock' : lang === 'ja' ? '48時間前先行確保' : '提早 48 小時鎖定'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? 'Unlimited AI Slicing Advisor' : lang === 'ja' ? 'AIスライスアドバイザー無制限' : '無限制 AI 切片顧問'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {lang === 'en' ? 'Cloud sync for consultation logs' : lang === 'ja' ? 'クラウドに相談履歴を自動同期' : '雲端保存諮詢紀錄'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    {lang === 'en' ? 'Invite maker friends! Both get 100 points!' : lang === 'ja' ? 'お友達を招待！お互いに100ポイント獲得！' : '推薦好友創客加入，雙方各得 100 點！'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://printhub.3d/join?ref=${member?.referralCode || 'MAKER3D'}`}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (lang === 'en' ? 'Copied' : lang === 'ja' ? 'コピー済' : '已複製') : (lang === 'en' ? 'Copy' : lang === 'ja' ? 'コピー' : '複製')}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Orders and Purchase Records Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {lang === 'en' ? 'Your Order History & Package Logistics' : lang === 'ja' ? 'ご注文履歴＆お荷物追跡' : '您的歷史購買紀錄與包裹物流'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'en' ? 'Synced with cloud storage, preserved across devices.' : lang === 'ja' ? 'クラウドと自動同期され、どの端末からでも確認可能。' : '已自動同步至 Firebase 雲端資料庫，更換裝置或瀏覽器皆會完整保留。'}
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
                  {lang === 'en' ? `Total ${displayOrders.length} orders` : lang === 'ja' ? `全 ${displayOrders.length} 件` : `共 ${displayOrders.length} 筆訂單`}
                </span>
              </div>

              {displayOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-slate-600 text-sm font-medium">
                    {lang === 'en' ? 'No completed orders yet' : lang === 'ja' ? '注文履歴はまだありません' : '目前尚無已完成的訂單紀錄'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? 'Orders placed in the store will automatically appear here.' : lang === 'ja' ? 'ストアでご注文いただくと、配送番号と履歴がここに表示されます。' : '在耗材商城下單後，訂單與配送單號將即時同步於此。'}
                  </p>
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
                            {order.orderStatus === 'completed' 
                              ? (lang === 'en' ? 'Delivered' : lang === 'ja' ? '受取完了' : '已取貨完成') 
                              : order.orderStatus === 'delivered' 
                              ? (lang === 'en' ? 'Arrived at Store' : lang === 'ja' ? '店舗到着済' : '已抵達門市') 
                              : order.orderStatus === 'dispatched' 
                              ? (lang === 'en' ? 'Dispatched' : lang === 'ja' ? '発送済' : '已出庫配送') 
                              : order.orderStatus === 'in_transit' 
                              ? (lang === 'en' ? 'In Transit' : lang === 'ja' ? '配送中' : '包裹轉運中') 
                              : (lang === 'en' ? 'Processing' : lang === 'ja' ? '処理中' : '訂單處理中')}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="font-medium text-slate-800">{translateProductName(item.name, lang)}</span>
                              <span className="text-slate-400 text-[11px]">({translateColorName(item.colorName, lang)})</span>
                            </div>
                            <span className="font-mono text-slate-600">
                              x{item.quantity} • {formatPrice(item.price * item.quantity, currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Logistics Tracking Info */}
                      <div className="bg-slate-50 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{lang === 'en' ? 'Method: ' : lang === 'ja' ? '配送方法：' : '配送方式：'}{order.shippingMethod?.toUpperCase() || '7-11'} | {order.storeOrAddress}</span>
                          </div>
                          <div className="text-slate-700 font-mono text-[11px]">
                            {lang === 'en' ? 'Tracking No: ' : lang === 'ja' ? '追跡番号：' : '託運單號：'}<strong className="text-slate-900">{order.trackingNumber}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Total' : lang === 'ja' ? '合計' : '總金額'}</div>
                            <div className="font-mono font-bold text-slate-900 text-sm">
                              {formatPrice(order.total || 0, currency)}
                            </div>
                          </div>
                          {onOpenTrackingWithCode && (
                            <button
                              onClick={() => {
                                onOpenTrackingWithCode(order.trackingNumber);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title={lang === 'en' ? 'Track Package' : lang === 'ja' ? '追跡確認' : '查詢此包裹詳細即時物流'}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Track' : lang === 'ja' ? '追跡' : '即時追蹤'}</span>
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
                <span>{lang === 'en' ? 'Sign out' : lang === 'ja' ? 'ログアウト' : '登出目前帳號'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
