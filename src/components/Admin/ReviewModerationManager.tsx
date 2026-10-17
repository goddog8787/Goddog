import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Pin, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Send, 
  Trash2, 
  ShieldCheck, 
  ThumbsUp, 
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ProductReview, FilamentProduct } from '../../types';

interface ReviewModerationManagerProps {
  products: FilamentProduct[];
}

const LOCAL_REVIEWS_KEY = 'printcore_product_reviews_v1';

export const ReviewModerationManager: React.FC<ReviewModerationManagerProps> = ({ products }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unreplied' | 'pinned' | 'hidden' | 'low_stars'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Reply modal / drawer state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Initial load
  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadReviews = () => {
    try {
      const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Strictly purge legacy mock seed reviews (陳創客, Alex Lin, 王工程師, 張同學)
          const cleaned = parsed.filter(r => 
            r.id !== 'rev-1' && 
            r.id !== 'rev-2' && 
            r.id !== 'rev-3' && 
            r.id !== 'rev-4' &&
            !r.userName?.includes('陳創客') &&
            !r.userName?.includes('Alex Lin') &&
            !r.userName?.includes('王工程師') &&
            !r.userName?.includes('張同學')
          );
          setReviews(cleaned);
          localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(cleaned));
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load reviews:', e);
    }

    // 100% Genuine: Zero mock seed reviews
    setReviews([]);
  };

  const saveReviews = (updated: ProductReview[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist reviews:', e);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, isPinned: !r.isPinned } : r
    );
    saveReviews(updated);
    showToast('已更新置頂精選狀態！');
  };

  const handleToggleHide = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, isHidden: !r.isHidden } : r
    );
    saveReviews(updated);
    showToast('已更新評價前台可見狀態！');
  };

  const handleDeleteReview = (id: string) => {
    if (!window.confirm('確定要刪除這筆評價嗎？此動作無法復原。')) return;
    const updated = reviews.filter((r) => r.id !== id);
    saveReviews(updated);
    showToast('評價已成功刪除');
  };

  const handleOpenReply = (review: ProductReview) => {
    setReplyingReviewId(review.id);
    setReplyText(review.ownerReply?.reply || '');
  };

  const handleSaveReply = () => {
    if (!replyingReviewId) return;
    const cleanReply = replyText.trim();
    const updated = reviews.map((r) => {
      if (r.id === replyingReviewId) {
        return {
          ...r,
          ownerReply: cleanReply ? {
            reply: cleanReply,
            repliedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
          } : undefined,
        };
      }
      return r;
    });
    saveReviews(updated);
    setReplyingReviewId(null);
    setReplyText('');
    showToast('✅ 店長官方回覆已發布！');
  };

  // Metrics calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const count5 = reviews.filter((r) => r.rating === 5).length;
  const count4 = reviews.filter((r) => r.rating === 4).length;
  const count3 = reviews.filter((r) => r.rating === 3).length;
  const count2 = reviews.filter((r) => r.rating === 2).length;
  const count1 = reviews.filter((r) => r.rating === 1).length;
  const lowRatingCount = count1 + count2 + count3;
  const unrepliedCount = reviews.filter((r) => !r.ownerReply).length;

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.printerModel && r.printerModel.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedRating === 'all' || r.rating === selectedRating;

    if (filterMode === 'unreplied') return matchesSearch && matchesRating && !r.ownerReply;
    if (filterMode === 'pinned') return matchesSearch && matchesRating && r.isPinned;
    if (filterMode === 'hidden') return matchesSearch && matchesRating && r.isHidden;
    if (filterMode === 'low_stars') return matchesSearch && matchesRating && r.rating <= 3;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">顧客創客評價審核與店長回覆</h2>
            <p className="text-xs text-slate-500">
              審核前台商品真實評論、回覆切片參數建議、精選置頂五星買家分享，守護店鋪信譽
            </p>
          </div>
        </div>
      </div>

      {/* Rating Analytics Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Overall Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
          <span className="text-5xl font-black text-slate-900 tracking-tight">{avgRating}</span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  totalReviews > 0 && s <= Math.round(Number(avgRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            全店累計 {totalReviews} 則創客真實回饋
          </span>
        </div>

        {/* Right: Star Breakdown Bars */}
        <div className="md:col-span-8 space-y-2">
          {[
            { star: 5, count: count5 },
            { star: 4, count: count4 },
            { star: 3, count: count3 },
            { star: 2, count: count2 },
            { star: 1, count: count1 },
          ].map(({ star, count }) => {
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-slate-700 flex items-center gap-0.5">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-indigo-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-slate-500 text-[11px]">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋買家、評價內容、3D 印表機型號..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: '全部評價' },
            { id: 'unreplied', label: `待店長回覆 (${unrepliedCount})` },
            { id: 'low_stars', label: `需關懷 (≤3星 ${lowRatingCount})` },
            { id: 'pinned', label: '精選置頂' },
            { id: 'hidden', label: '已隱藏' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">查無符合條件的評價</p>
            <p className="text-xs text-slate-400 mt-1">請嘗試變更搜尋關鍵字或篩選標籤</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const product = products.find((p) => p.id === review.productId);
            return (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  review.isPinned
                    ? 'border-amber-300 bg-amber-50/20'
                    : review.isHidden
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : review.rating <= 3
                    ? 'border-rose-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="font-bold text-slate-900 text-xs">{review.userName}</span>

                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <UserCheck className="w-3 h-3" />
                        真實認證買家
                      </span>
                    )}

                    {review.isPinned && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <Pin className="w-3 h-3 fill-amber-700" />
                        精選置頂
                      </span>
                    )}

                    {review.isHidden && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                        <EyeOff className="w-3 h-3" />
                        前台已隱藏
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {review.printerModel && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
                        🖨️ {review.printerModel}
                      </span>
                    )}
                    <span>{review.createdAt}</span>
                  </div>
                </div>

                {/* Product Name reference */}
                <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                  <span>評價耗材：</span>
                  <span className="font-semibold text-slate-800">
                    {product?.name || `商品 ID: ${review.productId}`}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 leading-relaxed my-2 font-normal">
                  {review.comment}
                </p>

                {/* Store Owner Official Reply */}
                {review.ownerReply ? (
                  <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs">
                    <div className="flex items-center justify-between text-indigo-900 font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        神狗勾店長專屬回覆：
                      </span>
                      <span className="text-[10px] text-indigo-400 font-normal font-mono">
                        {review.ownerReply.repliedAt}
                      </span>
                    </div>
                    <p className="text-indigo-800 leading-relaxed text-xs">
                      {review.ownerReply.reply}
                    </p>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(review.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        review.isPinned
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Pin className="w-3 h-3" />
                      <span>{review.isPinned ? '取消置頂' : '設為置頂'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleHide(review.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        review.isHidden
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {review.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{review.isHidden ? '取消隱藏' : '隱藏評價'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>刪除</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenReply(review)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{review.ownerReply ? '編輯回覆' : '以店長身分回覆'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">以「神狗勾店長」身分回覆評價</h3>
              </div>
              <button
                onClick={() => setReplyingReviewId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                回覆內容 (將公開展示於商品頁評價專區)
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="例如：感謝創客大大的實測！建議可嘗試將熱床溫度調為 60°C，首層速度設為 25mm/s，列印成功率可大幅提升！若有任何耗材問題歡迎隨時敲我們 LINE 客服！"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingReviewId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveReply}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>發布官方回覆</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
