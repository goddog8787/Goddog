import React from 'react';
import { BookOpen, ArrowRight, Clock, User, Tag, Sparkles, Wrench, Calculator, Scale, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOG_ARTICLES } from '../../data/blogArticles';

export const FeaturedKnowledgeSection: React.FC = () => {
  // Grab 4 top high-value technical articles
  const featuredArticles = BLOG_ARTICLES.slice(0, 4);

  return (
    <section className="my-14 space-y-10">
      {/* 1. Maker Tools Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-indigo-900/50 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>開源創客工程工具箱 · 免費線上使用</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              3D 列印代印成本報價與線盤餘量計算器
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              專為 3D 列印工作室與玩家設計：輸入模型重量與時長即時產出客戶報價單；扣除空盤皮重精密推算剩餘長度，避免印到一半斷料！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/tools"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>立即使用創客工具</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-6 border-t border-slate-800/80">
          <Link to="/tools" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">代印成品報價算式</div>
              <div className="text-[11px] text-slate-400">含電費、損耗與機台折舊</div>
            </div>
          </Link>

          <Link to="/tools" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">線盤餘量秤重換算</div>
              <div className="text-[11px] text-slate-400">各廠空盤扣重推算剩餘米數</div>
            </div>
          </Link>

          <Link to="/tools" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">烘烤溫度與防潮指南</div>
              <div className="text-[11px] text-slate-400">徹底消除受潮氣泡與牽絲</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Featured Knowledge Base & Articles Section */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                3D 列印技術專欄與選材百科
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                收錄 18 篇深入淺出的材料工程學、切片參數調教與疑難雜症排查實戰教學
              </p>
            </div>
          </div>

          <Link
            to="/blog"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <span>瀏覽全部 18 篇專題</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Featured Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredArticles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  作者：{article.author}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>閱讀全文</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50"
          >
            <span>瀏覽全部 18 篇專題指南</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
