import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Tag, 
  Share2, 
  ChevronRight,
  Award,
  BookOpen,
  Check,
} from 'lucide-react';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { SEO } from '../../components/SEO';
import { AdSenseBanner } from '../../components/Monetization/AdSenseBanner';
import { AdSenseConfig, LanguageCode } from '../../types';
import { translateBlogArticle } from '../../utils/i18n';

interface BlogPostPageProps {
  adSenseConfig?: AdSenseConfig;
  lang?: LanguageCode;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ adSenseConfig, lang: propLang = 'zh-TW' }) => {
  const lang: LanguageCode = (propLang as LanguageCode) || 'zh-TW';
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const rawArticle = BLOG_ARTICLES.find(a => a.slug === slug || String(a.id) === slug);
  const article = useMemo(() => rawArticle ? translateBlogArticle(rawArticle, lang) : null, [rawArticle, lang]);

  // Split article content into two parts to cleanly insert one native In-Article ad without clutter
  const splitContent = useMemo(() => {
    if (!article?.content) return { part1: '', part2: '' };

    // Look for the 3rd <h2> tag so the first two chapters appear before the in-article ad
    const h2Matches = [...article.content.matchAll(/<h2>/gi)];
    if (h2Matches.length >= 3) {
      const splitIdx = h2Matches[2].index!;
      return {
        part1: article.content.slice(0, splitIdx),
        part2: article.content.slice(splitIdx),
      };
    } else if (h2Matches.length === 2) {
      const splitIdx = h2Matches[1].index!;
      return {
        part1: article.content.slice(0, splitIdx),
        part2: article.content.slice(splitIdx),
      };
    }

    // Fallback: split at middle paragraph
    const pMatches = [...article.content.matchAll(/<\/p>/gi)];
    if (pMatches.length >= 4) {
      const midMatch = pMatches[Math.floor(pMatches.length / 2)];
      const splitIdx = midMatch.index! + midMatch[0].length;
      return {
        part1: article.content.slice(0, splitIdx),
        part2: article.content.slice(splitIdx),
      };
    }

    return { part1: article.content, part2: '' };
  }, [article?.content]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <SEO 
          title={lang === 'en' ? 'Article Not Found - GodDog Maker Hub' : lang === 'ja' ? '記事が見つかりません - 神狗勾 3D' : '找不到文章 - 神狗勾創客知識庫'} 
          description={lang === 'en' ? 'The requested article does not exist or has been moved.' : lang === 'ja' ? 'お探しの記事は存在しないか移動されました。' : '您所尋找的文章不存在或已被移動。'} 
          url="/blog" 
        />
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {lang === 'en' ? 'Article Not Found' : lang === 'ja' ? '記事が見つかりません' : '找不到此篇專題文章'}
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          {lang === 'en' ? 'The article URL may be incorrect or consolidated into a newer guide.' : lang === 'ja' ? 'URLが間違っているか、最新ガイドへ統合された可能性があります。' : '可能文章網址有誤，或已被整併至最新版本專題中。'}
        </p>
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Knowledge Hub' : lang === 'ja' ? '知識ベース一覧に戻る' : '返回創客知識庫總覽'}</span>
        </Link>
      </div>
    );
  }

  // Related articles in same category or adjacent
  const relatedArticles = BLOG_ARTICLES
    .filter(a => a.id !== article.id)
    .sort((a, b) => (a.category === rawArticle?.category ? -1 : 1))
    .slice(0, 3)
    .map(a => translateBlogArticle(a, lang));

  // Article Schema JSON-LD for Google Search & AdSense crawler
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorTitle
    },
    publisher: {
      '@type': 'Organization',
      name: lang === 'en' ? 'GodDog 3D Filament Hub' : lang === 'ja' ? '神狗勾 3D フィラメント' : '神狗勾 3D 耗材商城',
      logo: {
        '@type': 'ImageObject',
        url: 'https://goddog.space/wolf-logo.jpg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://goddog.space/blog/${article.slug}`
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-2">
      <SEO 
        title={article.title} 
        description={article.excerpt} 
        url={`/blog/${article.slug}`} 
      />

      {/* Structured Data for SEO / AdSense */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          {lang === 'en' ? 'Home' : lang === 'ja' ? 'ホーム' : '首頁'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/blog" className="hover:text-indigo-600 transition-colors">
          {lang === 'en' ? 'Knowledge Hub' : lang === 'ja' ? '知識ベース' : '創客知識庫'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-300 font-medium truncate max-w-xs">{article.category}</span>
      </nav>

      {/* Back to Blog button */}
      <div className="mb-6">
        <Link 
          to="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'en' ? 'Back to Knowledge Hub' : lang === 'ja' ? '記事一覧に戻る' : '返回知識庫列表'}</span>
        </Link>
      </div>

      {/* Main Article Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs mb-4">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.date}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? `Read time ~ ${article.readTime}` : lang === 'ja' ? `所要時間 約 ${article.readTime}` : `閱讀時間約 ${article.readTime}`}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-6">
          {article.title}
        </h1>

        {/* Author Bio Header Card (E-E-A-T) */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{article.author}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-medium">
                  {article.authorTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'en' ? 'Certified by GodDog 3D Printing Materials R&D Center' : lang === 'ja' ? '神狗勾 3Dプリント材料工学研究センター監修' : '神狗勾 3D 列印材料研發中心認證專欄'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={lang === 'en' ? 'Share this article' : lang === 'ja' ? 'この記事を共有' : '分享這篇文章'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'en' ? 'Link Copied!' : lang === 'ja' ? 'リンクをコピーしました！' : '已複製文章連結！'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Share' : lang === 'ja' ? '共有' : '分享'}</span>
              </>
            )}
          </button>
        </div>

        {/* Excerpt Lead paragraph */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-8 font-medium">
          {article.excerpt}
        </div>

        {/* Article HTML Content - Section 1 */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4
            prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
            prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-700
            prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
            prose-li:text-slate-700 dark:prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: splitContent.part1 }}
        />

        {/* Official Adsterra In-Article Native Placement */}
        {adSenseConfig?.enabled && adSenseConfig.showArticleAd && (
          <div className="my-6">
            <AdSenseBanner
              placement="article-mid"
              config={adSenseConfig}
              format="fluid"
              network="adsterra"
            />
          </div>
        )}

        {/* Article HTML Content - Section 2 */}
        {splitContent.part2 && (
          <div 
            className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4
              prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
              prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-700
              prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
              prose-li:text-slate-700 dark:prose-li:text-slate-300"
            dangerouslySetInnerHTML={{ __html: splitContent.part2 }}
          />
        )}

        {/* Tags */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Related Tags:' : lang === 'ja' ? '関連タグ：' : '相關標籤：'}
          </span>
          {article.tags.map((tag: string, idx: number) => (
            <span 
              key={idx}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Footer Signoff (E-E-A-T) */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-900/60 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {lang === 'en' ? 'Verified by GodDog 3D Maker Lab Technical Team' : lang === 'ja' ? '神狗勾 3D メイカーラボ技術チーム監修' : '本文由 神狗勾 3D 創客實驗室 技術團隊審核'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'en' 
                  ? 'GodDog Lab specializes in FDM high-speed 3D printing polymer modification, Bambu AMS certification, and industrial-grade quality control.'
                  : lang === 'ja'
                  ? '神狗勾ラボはFDM高速3Dプリンター材料の改変、Bambu AMS完全互換検証、工業品質管理を専門としています。'
                  : '神狗勾實驗室專注於 FDM 高速 3D 列印材料改質、拓竹 AMS 相容性認證與工業級品質檢測。我們堅持分享真實、可重複驗證的調校實戰經驗，協助台灣創客擺脫失敗列印。'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Official Adsterra Article Bottom Placement */}
      {adSenseConfig?.enabled && adSenseConfig.showArticleAd && (
        <div className="my-6">
          <AdSenseBanner
            placement="article-bottom"
            config={adSenseConfig}
            format="auto"
            network="adsterra"
          />
        </div>
      )}

      {/* Related Articles Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>{lang === 'en' ? 'Recommended Reading' : lang === 'ja' ? 'おすすめの関連記事' : '推薦延伸閱讀專題'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.id}
              to={`/blog/${rel.slug}`}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {rel.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {rel.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {rel.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] font-bold text-indigo-600 flex items-center justify-between">
                <span>{lang === 'en' ? 'Read Article →' : lang === 'ja' ? '記事を読む →' : '閱讀專題 →'}</span>
                <span className="text-slate-400 font-normal">{rel.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};
