import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  User, 
  Search, 
  Clock, 
  Sparkles,
  Play,
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { hasBlogArticleAnimation } from '../../data/blogAnimations';
import { AdSenseBanner } from '../../components/Monetization/AdSenseBanner';
import { AdSenseConfig, LanguageCode } from '../../types';
import { translateBlogArticle, translateBlogCategory } from '../../utils/i18n';

interface BlogListProps {
  adSenseConfig?: AdSenseConfig;
  lang?: LanguageCode;
}

const rawCategories = ['全部', '新手入門', '進階技巧', '耗材評測', '硬體改裝', '切片參數'];
const normalizeText = (text: string) => text.normalize('NFKC').toLowerCase();

export const BlogList: React.FC<BlogListProps> = ({ adSenseConfig, lang: propLang = 'zh-TW' }) => {
  const lang: LanguageCode = (propLang as LanguageCode) || 'zh-TW';
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic') || '';
  const selectedCategory = rawCategories.includes(topic) ? topic : '全部';
  const searchQuery = params.get('articleQ') || '';
  const shortOnly = params.get('short') === '1';
  const filtered = selectedCategory !== '全部' || Boolean(searchQuery) || shortOnly;

  function updateFilters(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  }

  const resetFilters = () => updateFilters({ topic: '', articleQ: '', short: '' });
  const translatedArticles = useMemo(() => BLOG_ARTICLES.map(a => translateBlogArticle(a, lang)), [lang]);
  const filteredArticles = useMemo(() => {
    const words = normalizeText(searchQuery).split(/\s+/).filter(Boolean);
    const category = translateBlogCategory(selectedCategory, lang);
    return translatedArticles.filter(article => {
      if (selectedCategory !== '全部' && article.category !== category) return false;
      if (shortOnly && !(Number.parseInt(article.readTime, 10) <= 7)) return false;
      const text = normalizeText([article.title, article.excerpt, article.author, article.category, ...article.tags].join(' '));
      return words.every(word => text.includes(word));
    });
  }, [translatedArticles, selectedCategory, shortOnly, searchQuery, lang]);
  const featured = filtered ? undefined : filteredArticles[0];
  const gridArticles = featured ? filteredArticles.slice(1) : filteredArticles;
  const resetLabel = lang === 'en' ? 'Reset filters' : lang === 'ja' ? '条件をリセット' : '重設篩選條件';

  const seoTitle = lang === 'en'
    ? 'Maker Knowledge Hub - 3D Printing Technical Guides & Filament Reviews'
    : lang === 'ja'
    ? 'メイカー知識ベース - 3Dプリント技術ガイド・フィラメントレビュー'
    : '創客知識庫 (Maker Knowledge Hub) - 3D 列印專業技術指南與線材評測';

  const seoDesc = lang === 'en'
    ? '18+ Original engineering articles from GodDog Lab: PLA/PETG/TPU/CF benchmark tests, Bambu AMS tuning, OrcaSlicer configs, and bed warping troubleshooting.'
    : lang === 'ja'
    ? '神狗勾材料工学ラボ厳選の技術コラム：PLA/PETG/TPU/CF実測、Bambu AMS調整、OrcaSlicer設定、反り・糸引きの解決法。'
    : '匯集神狗勾材料實驗室 18+ 篇原創 3D 列印技術專題：PLA/PETG/TPU/碳纖維實測、拓竹 AMS 調校、OrcaSlicer 參數設定、翹邊與牽絲故障排查。';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 mt-2">
      <SEO 
        title={seoTitle} 
        description={seoDesc} 
        url="/blog" 
      />

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {lang === 'en' 
              ? 'GodDog 3D Maker Lab • Original Engineering Articles' 
              : lang === 'ja' 
              ? '神狗勾 3D メイカーラボ • 原創技術專題庫' 
              : '神狗勾 3D 創客實驗室 • 原創技術專題庫'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {lang === 'en' ? 'Maker Knowledge Hub' : lang === 'ja' ? 'メイカー知識ベース (Maker Hub)' : '創客知識庫 (Maker Hub)'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {lang === 'en'
            ? 'In-depth analysis of high-polymer filaments, slicer parameter calibration, Bambu AMS anti-jamming tricks, and print troubleshooting.'
            : lang === 'ja'
            ? '高分子フィラメントの物性、スライサー設定値の校正、Bambu AMS給排エラー防止、印刷トラブルシューティングを徹底解説。'
            : '深入解析高分子線材特性、切片軟體參數校正、拓竹 AMS 防卡料技巧與列印失敗排查，為台灣創客提供最高價值的實戰指南。'}
        </p>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {rawCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = translateBlogCategory(cat, lang);
            return (
              <button
                key={cat}
                aria-pressed={isSelected}
                onClick={() => updateFilters({ topic: cat === '全部' ? '' : cat })}
                className={`min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label={lang === 'en' ? 'Search articles' : lang === 'ja' ? '記事を検索' : '搜尋文章'}
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => updateFilters({ articleQ: e.target.value })}
            placeholder={lang === 'en' ? 'Search technical articles...' : lang === 'ja' ? '記事をキーワードで検索...' : '搜尋知識庫文章...'}
            className="w-full pl-10 pr-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-sm text-slate-700 dark:text-slate-300">
        <label className="inline-flex min-h-10 items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={shortOnly} onChange={e => updateFilters({ short: e.target.checked ? '1' : '' })} />
          {lang === 'en' ? '7 minutes or less' : lang === 'ja' ? '7分以内で読める記事' : '7 分鐘內讀完'}
        </label>
        <span role="status" className="tabular-nums">
          {filteredArticles.length} {lang === 'en' ? 'articles' : lang === 'ja' ? '件の記事' : '篇文章'}
        </span>
        {filtered && filteredArticles.length > 0 && (
          <button type="button" onClick={resetFilters} className="min-h-10 font-bold text-indigo-700 dark:text-indigo-300">{resetLabel}</button>
        )}
      </div>

      {/* Featured / Lead Article Banner (first article) */}
      {featured && (
        <div className="mb-10 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-indigo-800/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-4">
              <span>{lang === 'en' ? 'Featured In-Depth Review' : lang === 'ja' ? '注目ディープレビュー' : '焦點深度評測'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight text-balance">
              <Link 
                to={`/blog/${featured.slug}`}
                className="hover:text-indigo-300 transition-colors"
              >
                {featured.title}
              </Link>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 text-pretty line-clamp-3 leading-relaxed mb-6">
              {featured.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {featured.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {lang === 'en' ? `Read time ~ ${featured.readTime}` : lang === 'ja' ? `所要時間 約 ${featured.readTime}` : `閱讀時間約 ${featured.readTime}`}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {featured.author}
              </span>
            </div>
            <div className="mt-6">
              <Link
                to={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>{lang === 'en' ? 'Read Full Article' : lang === 'ja' ? '記事を読む' : '閱讀專題文章'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sponsored Ad Banner (Adsterra / HilltopAds) */}
      {adSenseConfig?.enabled && adSenseConfig.showArticleAd && (
        <div className="mb-8">
          <AdSenseBanner placement="article-mid" config={adSenseConfig} />
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridArticles.map((article) => (
          <Link
            key={article.id}
            to={`/blog/${article.slug}`}
            className="bg-white dark:bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Category & Date */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800 text-[11px]">
                  {article.category}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-balance line-clamp-2 min-h-[2.75em]">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-pretty line-clamp-3 min-h-[4.6em] mb-4">
                {article.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag: string, idx: number) => (
                  <span 
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
                {hasBlogArticleAnimation(article.id) && (
                  <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium ml-1.5">
                    <Play className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Interactive Lab' : lang === 'ja' ? '実験アニメ付' : '互動實驗'}</span>
                  </span>
                )}
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>{lang === 'en' ? 'Read More' : lang === 'ja' ? '続きを読む' : '閱讀全文'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Adsterra In-Feed Native Placement (List Bottom) */}
      {filteredArticles.length > 0 && adSenseConfig?.enabled && adSenseConfig.showArticleAd && (
        <div className="mt-10">
          <AdSenseBanner
            placement="in-feed"
            config={adSenseConfig}
            network="adsterra"
          />
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-bold mb-1">
            {lang === 'en' ? 'No matching technical articles found' : lang === 'ja' ? '関連する記事が見つかりませんでした' : '找不到相關的技術文章'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            {lang === 'en' ? 'Try adjusting your search query or selecting a different category.' : lang === 'ja' ? '検索キーワードを変更するか、別のカテゴリーを選択してください。' : '請嘗試清除搜尋關鍵字，或切換至其他主題分類。'}
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
          >
            {resetLabel}
          </button>
        </div>
      )}
    </div>
  );
};
