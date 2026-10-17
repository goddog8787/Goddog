import React, { useState, useEffect } from 'react';
import { 
  Star, 
  X, 
  Check, 
  ShieldCheck, 
  Printer, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Lock,
  Truck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { FilamentProduct, ProductReview, Order, LanguageCode } from '../../types';
import { saveProductReview } from '../../lib/reviewPersistence';
import { auth } from '../../lib/firebase';
import { getStoredCustomerSession } from '../../lib/customerPersistence';
import { 
  verifyProductReviewEligibility, 
  EligibilityResult 
} from '../../lib/orderVerification';
import confetti from 'canvas-confetti';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FilamentProduct;
  onReviewSubmitted?: (updatedProduct: FilamentProduct, review: ProductReview) => void;
  lang?: LanguageCode;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; desc: string }> = {
  5: { title: '5 星 - 極致推薦！', desc: '公差精準無瑕疵，拓竹/高流速推薦必買' },
  4: { title: '4 星 - 品質良好', desc: '列印順暢層紋細膩，值得回購推薦' },
  3: { title: '3 星 - 普通標準', desc: '表現中規中矩，符合基本列印預期' },
  2: { title: '2 星 - 稍需調整', desc: '有些微拉絲或翹邊，需微調切片參數' },
  1: { title: '1 星 - 不如預期', desc: '尺寸公差或易脆卡料，需改進' },
};

const POPULAR_PRINTERS = [
  'Bambu Lab X1-Carbon',
  'Bambu Lab P1S / P1P',
  'Bambu Lab A1 / mini',
  'Creality K1 / K1 Max',
  'Voron 2.4 350',
  'Prusa MK4 / XL',
];

const SUGGESTED_TAGS = [
  '#AMS換色順暢',
  '#零拉絲極細緻',
  '#層間結合強韌',
  '#高光金屬絲滑',
  '#紙盤環保無毛邊',
  '#耐熱抗衝擊',
];

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  onReviewSubmitted,
  lang = 'zh-TW',
}) => {
  const customerSession = getStoredCustomerSession();
  const defaultUserName =
    auth.currentUser?.displayName ||
    customerSession?.name ||
    auth.currentUser?.email?.split('@')[0] ||
    '3D 創客老手';

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>(defaultUserName);
  const [printerModel, setPrinterModel] = useState<string>('Bambu Lab X1-Carbon');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Purchase Verification State
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  // Check purchase and receipt status whenever modal opens for this product
  useEffect(() => {
    if (!isOpen || !product) return;

    let isMounted = true;
    setIsVerifying(true);
    setErrorMsg(null);

    verifyProductReviewEligibility(product.id, product.name)
      .then((res) => {
        if (isMounted) {
          setEligibility(res);
          setIsVerifying(false);
        }
      })
      .catch((err) => {
        console.error('Error verifying eligibility:', err);
        if (isMounted) {
          setEligibility({
            canReview: false,
            reason: 'not_purchased',
            message: '系統驗證購買紀錄時發生異常，請稍候再試。',
          });
          setIsVerifying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, product]);

  if (!isOpen) return null;

  const activeRating = hoverRating || rating;

  const handleAddTag = (tag: string) => {
    if (!comment.includes(tag)) {
      setComment((prev) => (prev.trim() ? `${prev.trim()} ${tag}` : tag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict guard: verify eligibility again before submit
    if (!eligibility || !eligibility.canReview) {
      setErrorMsg('抱歉，系統嚴格限制必須擁有該商品的購買紀錄且「已確認收貨」才能進行評價！');
      return;
    }

    if (comment.trim().length < 5) {
      setErrorMsg('請至少輸入 5 個字的心得評論，協助其他創客參考！');
      return;
    }
    if (!userName.trim()) {
      setErrorMsg('請填寫評價者暱稱');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const reviewId = `rev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      const currentUserId = auth.currentUser?.uid || customerSession?.id || `guest-${Date.now()}`;

      const newReview: ProductReview = {
        id: reviewId,
        productId: product.id,
        userId: currentUserId,
        userName: userName.trim(),
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        printerModel: printerModel.trim() || '3D 創客印表機',
        verifiedPurchase: true,
      };

      // Save to database (Firestore + LocalStorage) and update aggregate score
      const { updatedProduct, savedReview } = await saveProductReview(newReview, product);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}

      setIsSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(updatedProduct, savedReview);
      }

      // Close modal after showing success state briefly
      setTimeout(() => {
        setIsSuccess(false);
        setComment('');
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('Review submission error:', err);
      setErrorMsg(err?.message || '評價提交失敗，請檢查網路連線後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div 
        id="write-review-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
                撰寫創客真實評價
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                嚴格防偽防洗評：僅限購買過且已確認收貨的創客留評
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Target Product Badge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                3D
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold tracking-wide uppercase">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.material}</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-500 font-bold font-mono">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {product.rating}
                </span>
                <span>目前共 {product.reviewsCount} 則評價</span>
              </div>
            </div>
          </div>

          {/* Verification Status Check Indicator */}
          {isVerifying ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                正在調閱商城雲端訂單紀錄，驗證購買資格與收貨狀態...
              </p>
            </div>
          ) : !eligibility?.canReview ? (
            /* Locked / Ineligible Gate */
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <span>未符合商品評價資格</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                      防偽實名機制
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {eligibility?.message}
                  </p>
                </div>
              </div>

              {/* Case A: User has an order for this product, but not confirmed receipt yet */}
              {eligibility?.reason === 'not_delivered_yet' && eligibility.matchedOrder && (
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Truck className="w-3.5 h-3.5 text-blue-500" />
                      <span>關聯訂單：{eligibility.matchedOrder.orderNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      尚未確認收貨
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    本商城嚴格執行「確認收貨後才能評價」原則。請待您實際收到商品包裹後，至「會員中心」的「我的訂單」點選【確認收貨】，系統便會自動解鎖此商品的實測評價功能。
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>返回商城（收到商品後再來評）</span>
                  </button>
                </div>
              )}

              {/* Case B: User has never purchased this product */}
              {eligibility?.reason === 'not_purchased' && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ShoppingBag className="w-4 h-4 text-indigo-500" />
                    <span>想要評價這款耗材嗎？</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    先前往下單購買 →
                  </button>
                </div>
              )}

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>神狗勾嚴選堅持 100% 真實購買與到貨憑證，杜絕網路水軍與虛假宣傳。</span>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success Banner */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shadow-xs animate-bounce">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                感謝您的真實評價！
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                評價已成功儲存至 Firestore 資料庫，商品平均分數已即時刷新完成。
              </p>
            </div>
          ) : (
            /* Eligible Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Verified Purchase Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{eligibility.message}</span>
              </div>

              {/* Star Rating Section */}
              <div className="space-y-1.5 text-center bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  為這款耗材打分數（1 - 5 星）
                </label>
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeRating;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        id={`star-select-${starVal}`}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`${starVal} 星`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="min-h-[22px] pt-1">
                  <span className="inline-block text-xs font-bold text-amber-700 dark:text-amber-300">
                    {RATING_DESCRIPTIONS[activeRating]?.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">
                    ({RATING_DESCRIPTIONS[activeRating]?.desc})
                  </span>
                </div>
              </div>

              {/* Reviewer Name and Printer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    評價創客暱稱
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="例：拓竹極速創客"
                    maxLength={20}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>實測使用機種</span>
                  </label>
                  <select
                    value={printerModel}
                    onChange={(e) => setPrinterModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {POPULAR_PRINTERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="其他 3D 列印機">其他 3D 列印機</option>
                  </select>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    列印實測心得與建議（至少 5 字）
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {comment.trim().length} 字
                  </span>
                </div>
                <textarea
                  id="review-comment-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="例如：AMS 退料順暢零拉絲、220°C 噴嘴出料極其均勻、推薦層高 0.16mm..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200 resize-none leading-relaxed"
                />
              </div>

              {/* Quick Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  快捷標籤：
                </span>
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Verification & Trust Badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>此評價將標註為【已驗證購買創客】並永久寫入雲端資料庫。</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={isSubmitting || comment.trim().length < 5}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isSubmitting || comment.trim().length < 5
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
                      : 'bg-amber-500 hover:bg-amber-600 active:scale-98 shadow-amber-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在存入資料庫...</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 fill-white" />
                      <span>提交真實評價</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
