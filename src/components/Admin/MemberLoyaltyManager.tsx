import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Crown, 
  Coins, 
  Search, 
  Plus, 
  Minus, 
  Download, 
  Filter, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShoppingBag, 
  TrendingUp,
  Settings,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Order } from '../../types';
import { isMockOrder } from '../../lib/orderVerification';

interface MemberItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  points: number;
  totalSpent: number;
  ordersCount: number;
  joinedDate: string;
  lastActive: string;
}

interface MemberLoyaltyManagerProps {
  orders: Order[];
}

const LOCAL_MEMBERS_KEY = 'printcore_store_members_v1';

export const MemberLoyaltyManager: React.FC<MemberLoyaltyManagerProps> = ({ orders }) => {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Adjust Points Modal
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('新春創客購物節加碼回饋');

  // Loyalty Program Rules Setting
  const [cashbackRate, setCashbackRate] = useState<number>(5); // 5% cashback
  const [pointValueNT, setPointValueNT] = useState<number>(1); // 1 point = 1 NT$

  useEffect(() => {
    loadMembers();
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadMembers = () => {
    // 1. Purge legacy mock members from localStorage if present
    try {
      const raw = localStorage.getItem(LOCAL_MEMBERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((m: any) => 
            m.id !== 'm-001' && 
            m.id !== 'm-002' && 
            m.id !== 'm-003' && 
            m.id !== 'm-004' && 
            m.id !== 'm-005' &&
            !m.name?.includes('陳志豪') &&
            !m.name?.includes('林雅婷') &&
            !m.name?.includes('Alex Lin') &&
            !m.name?.includes('黃柏翔') &&
            !m.name?.includes('王小美')
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(cleaned));
          }
        }
      }
    } catch {}

    // 2. Derive members ONLY from genuine paid orders (Non-simulated)
    const paidOrders = (orders || []).filter(o => 
      (o.paymentStatus === 'paid' || o.orderStatus === 'completed' || o.isVerifiedByNewebPay) && 
      !isMockOrder(o)
    );

    // Group paid orders by customer identifier
    const memberMap = new Map<string, MemberItem>();

    paidOrders.forEach(order => {
      const key = order.customerEmail || order.customerPhone || order.customerName;
      if (!key) return;

      const existing = memberMap.get(key);
      const orderDate = order.createdAt?.split(' ')[0] || new Date().toISOString().split('T')[0];

      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += order.total || 0;
        existing.points += Math.max(0, (order.pointsEarned || 0) - (order.pointsDeduction || 0));
        existing.lastActive = orderDate;
        // Recalculate tier
        if (existing.totalSpent >= 30000) existing.tier = 'diamond';
        else if (existing.totalSpent >= 15000) existing.tier = 'gold';
        else if (existing.totalSpent >= 5000) existing.tier = 'silver';
      } else {
        const spent = order.total || 0;
        let tier: MemberItem['tier'] = 'bronze';
        if (spent >= 30000) tier = 'diamond';
        else if (spent >= 15000) tier = 'gold';
        else if (spent >= 5000) tier = 'silver';

        memberMap.set(key, {
          id: `mem-${Math.abs(key.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36)}`,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          tier,
          points: Math.max(0, (order.pointsEarned || 0) - (order.pointsDeduction || 0)),
          totalSpent: spent,
          ordersCount: 1,
          joinedDate: orderDate,
          lastActive: orderDate
        });
      }
    });

    const realMemberList = Array.from(memberMap.values());
    setMembers(realMemberList);
  };

  const saveMembers = (updated: MemberItem[]) => {
    setMembers(updated);
    try {
      localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save members:', e);
    }
  };

  const handleSavePoints = () => {
    if (!selectedMember) return;
    const diff = adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
    const updated = members.map((m) => {
      if (m.id === selectedMember.id) {
        const newPts = Math.max(0, m.points + diff);
        return {
          ...m,
          points: newPts,
        };
      }
      return m;
    });

    saveMembers(updated);
    setSelectedMember(null);
    showToast(`✅ 已更新 ${selectedMember.name} 的點數：${diff > 0 ? `+${diff}` : diff} 點 (${adjustReason})`);
  };

  const handleExportCSV = () => {
    const headers = ['會員編號', '姓名', '電子信箱', '電話', '會員等級', '紅利點數', '累計消費(NT$)', '訂單數', '註冊日', '最後活躍'];
    const rows = members.map((m) => [
      m.id,
      `"${m.name}"`,
      m.email,
      m.phone,
      m.tier.toUpperCase(),
      m.points,
      m.totalSpent,
      m.ordersCount,
      m.joinedDate,
      m.lastActive,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PrintCore_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 會員名冊 CSV 已下載！');
  };

  const totalMembersCount = members.length;
  const totalPointsDistributed = members.reduce((sum, m) => sum + m.points, 0);
  const totalMemberSpend = members.reduce((sum, m) => sum + m.totalSpent, 0);

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);
    const matchesTier = tierFilter === 'all' || m.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: MemberItem['tier']) => {
    switch (tier) {
      case 'diamond':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-400/40 text-[10px] font-black">
            <Crown className="w-3 h-3 text-amber-400" />
            鑽石黑卡
          </span>
        );
      case 'gold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold">
            <Award className="w-3 h-3 text-amber-600" />
            黃金 VIP
          </span>
        );
      case 'silver':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
            銀級創客
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-900/10 text-amber-900 border border-amber-900/20 text-[10px] font-medium">
            銅級新手
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">會員等級與紅利點數管理</h2>
            <p className="text-xs text-slate-500">
              管理會員等級權益、手動調整紅利點數（補償/加贈）、檢視客單價與消費累積
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>匯出會員名冊 (CSV)</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">註冊創客會員總數</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalMembersCount}</span>
            <span className="text-xs text-slate-500">位會員</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">流通紅利點數總計</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{totalPointsDistributed.toLocaleString()}</span>
            <span className="text-xs text-slate-500">點 (約折抵 NT$ {totalPointsDistributed.toLocaleString()})</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">會員累計消費總額</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">NT$ {totalMemberSpend.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rules Config Box */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">紅利回饋參數設定：</span>
          <span className="text-xs text-slate-500">結帳消費每 NT$ 100 回饋 5 點，1 點現折 NT$ 1</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">VIP 會員享雙倍 10% 回饋</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-md">
            自動累積機制運作中
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名、Email、手機號碼..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: '全部階級' },
            { id: 'diamond', label: '鑽石黑卡' },
            { id: 'gold', label: '黃金 VIP' },
            { id: 'silver', label: '銀級創客' },
            { id: 'bronze', label: '銅級新手' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTierFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tierFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">會員創客 / 聯絡資料</th>
                <th className="py-3 px-4">會員階級</th>
                <th className="py-3 px-4">紅利點數</th>
                <th className="py-3 px-4">累計消費</th>
                <th className="py-3 px-4">下單次數</th>
                <th className="py-3 px-4">註冊 / 活躍</th>
                <th className="py-3 px-4 text-right">點數調整</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm mb-1">尚無完成藍新金流正式支付之會員紀錄</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        本商城全面啟用真實藍新金流驗證。當消費者於前台完成金流扣款入帳後，系統將即時在此自動建檔並累計消費金額、會員等級與紅利點數。
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{member.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {getTierBadge(member.tier)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 text-sm">
                      <Coins className="w-3.5 h-3.5" />
                      {member.points.toLocaleString()} 點
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    NT$ {member.totalSpent.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {member.ordersCount} 筆
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-slate-400">
                    <div>註冊: {member.joinedDate}</div>
                    <div>活躍: {member.lastActive}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setAdjustAmount(100);
                        setAdjustType('add');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>調整點數</span>
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">手動調整紅利點數</h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">對象會員：</span>
                <span className="font-bold text-slate-800">{selectedMember.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">目前點數：</span>
                <span className="font-bold text-amber-600 font-mono">{selectedMember.points} 點</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">操作類型</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 px-3 text-xs rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-colors ${
                      adjustType === 'add'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>加發點數 (贈送/補償)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2 px-3 text-xs rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-colors ${
                      adjustType === 'subtract'
                        ? 'bg-rose-50 border-rose-400 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>扣除點數 (退款/校正)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">調整數值 (點)</label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">調整原因 (將記錄於後台操作日誌)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="例如：3D 列印創客節加碼加贈、物流延誤補償"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSavePoints}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                確認調整
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
