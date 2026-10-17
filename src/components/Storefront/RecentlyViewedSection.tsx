import React, { useState, useEffect, useCallback } from 'react';
import { History, Eye, ArrowRight, Trash2, ShoppingCart, Sparkles, X, Check, ShieldCheck } from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode, MemberProfile } from '../../types';
import { formatPrice, translateProductName, translateMaterial } from '../../utils/i18n';
import { 
  getStoredRecentlyViewedSync, 
  clearCustomerRecentlyViewed, 
  deleteSingleCustomerRecentlyViewed 
} from '../../lib/customerPersistence';
import { getSafeProductImageUrl, handleProductImageError } from '../../utils/productImage';
import { auth } from '../../lib/firebase';

interface RecentlyViewedSectionProps {
  products: FilamentProduct[];
  currency: CurrencyCode;
  lang: LanguageCode;
  member?: MemberProfile;
  onSelectProduct: (product: FilamentProduct) => void;
  onAddToCart: (product: FilamentProduct) => void;
  onOpenHistoryModal?: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  currency,
  lang,
  member,
  onSelectProduct,
  onAddToCart,
  onOpenHistoryModal,
}) => {
  const effectiveUid = member?.id || auth.currentUser?.uid;
  const [recentItems, setRecentItems] = useState<any[]>(() => {
    return getStoredRecentlyViewedSync(effectiveUid);
  });
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const refreshList = useCallback(() => {
    const list = getStoredRecentlyViewedSync(effectiveUid);
    setRecentItems(list);
  }, [effectiveUid]);

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('printcore_recently_viewed_updated', handleUpdate);
    window.addEventListener('printcore_recently_viewed_cleared', handleUpdate);
    return () => {
      window.removeEventListener('printcore_recently_viewed_updated', handleUpdate);
      window.removeEventListener('printcore_recently_viewed_cleared', handleUpdate);
    };
  }, [refreshList]);

  const handleClear = async () => {
    await clearCustomerRecentlyViewed(effectiveUid);
    setRecentItems([]);
    setIsConfirmingClear(false);
  };

  const handleDeleteItem = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await deleteSingleCustomerRecentlyViewed(effectiveUid, productId);
    setRecentItems(updated);
  };

  const handleAdd = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const matched = products.find((p) => p.id === item.id) || item;
    onAddToCart(matched);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  if (!recentItems || recentItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8 bg-slate-50/70 dark:bg-slate-900/50 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {lang === 'en' ? 'Recently Viewed Filaments' : lang === 'ja' ? '最近閲覧したフィラメント' : '👀 最近瀏覽記錄'}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold font-mono">
                {recentItems.length}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>{effectiveUid 
                  ? (lang === 'en' ? 'Account Cloud Storage' : lang === 'ja' ? 'アカウント専用クラウド保存' : '帳號專屬雲端存檔') 
                  : (lang === 'en' ? 'Guest Local Storage' : lang === 'ja' ? 'ゲスト端末保存' : '訪客本機存檔')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en' 
                ? 'Quickly jump back to filaments you recently inspected'
                : lang === 'ja'
                ? '最近チェックしたフィラメントをワンクリックで再確認・削除できます'
                : '獨立紀錄於您的個人空間，支援隨時個別移除或清空'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHistoryModal && (
            <button
              onClick={onOpenHistoryModal}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-2xs"
            >
              <span>{lang === 'en' ? 'View all' : lang === 'ja' ? '全履歴を見る' : '查看完整紀錄'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Inline Clear Confirmation (Never uses window.confirm) */}
          {isConfirmingClear ? (
            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/80 px-2 py-1 rounded-xl animate-in fade-in zoom-in duration-200">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                {lang === 'en' ? 'Clear all?' : lang === 'ja' ? 'すべて削除しますか？' : '確認清空全部？'}
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-2xs"
              >
                {lang === 'en' ? 'Clear' : lang === 'ja' ? '削除' : '清空'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-rose-200/50 dark:hover:bg-rose-900/50 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : lang === 'ja' ? 'キャンセル' : '取消'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingClear(true)}
              className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium"
              title={lang === 'en' ? 'Clear history' : lang === 'ja' ? '履歴をクリア' : '清空紀錄'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Clear' : lang === 'ja' ? '履歴クリア' : '清空'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal scrolling shelf of recently viewed items */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {recentItems.slice(0, 12).map((item) => {
          const matchedProduct = products.find((p) => p.id === item.id);
          const fullProduct = matchedProduct || item;
          const displayName = translateProductName(item.name || '', lang, item.brand || '', item.material || item.category || '', item.weight || '');
          const displayMaterial = translateMaterial(item.material || item.category || '', lang);

          return (
            <div
              key={item.id}
              onClick={() => onSelectProduct(fullProduct)}
              className="w-48 sm:w-56 shrink-0 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-3 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer relative"
            >
              {/* Single item delete button */}
              <button
                type="button"
                onClick={(e) => handleDeleteItem(item.id, e)}
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md"
                title={lang === 'en' ? 'Remove this item' : lang === 'ja' ? 'この項目を削除' : '從瀏覽記錄中刪除此商品'}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="relative aspect-square w-full rounded-xl bg-slate-100 dark:bg-slate-700/50 overflow-hidden mb-2.5 flex items-center justify-center p-2">
                <img
                  src={getSafeProductImageUrl(item.imageUrl || item.image || item.img, item.material || item.category, item.name)}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => handleProductImageError(e, item.material || item.category, item.name)}
                />
                {displayMaterial && (
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {displayMaterial}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {item.brand && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono block">
                      {item.brand === '神狗勾' ? (lang === 'en' ? 'GodDog' : lang === 'ja' ? '神狗勾 (GodDog)' : '神狗勾') : item.brand}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {displayName}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-1">
                  <div className="text-indigo-600 dark:text-indigo-400 font-black text-sm font-mono">
                    {formatPrice(item.price, currency)}
                  </div>

                  <button
                    onClick={(e) => handleAdd(item, e)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      addedIds[item.id]
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200'
                    }`}
                    title={addedIds[item.id] 
                      ? (lang === 'en' ? 'Added' : lang === 'ja' ? '追加済み' : '已加入') 
                      : (lang === 'en' ? 'Quick Add' : lang === 'ja' ? 'クイック追加' : '快速加購')}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{addedIds[item.id] 
                      ? (lang === 'en' ? 'Added' : lang === 'ja' ? '済' : '已加') 
                      : (lang === 'en' ? 'Add' : lang === 'ja' ? '追加' : '加購')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
