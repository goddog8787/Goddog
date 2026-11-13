import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Code2, Copy, Check, RotateCcw, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { getBlogArticleAnimation } from '../../data/blogAnimations';
import { LanguageCode } from '../../types';

interface ArticleInteractiveAnimationProps {
  articleId: number;
  lang?: LanguageCode;
}

export const ArticleInteractiveAnimation: React.FC<ArticleInteractiveAnimationProps> = ({
  articleId,
  lang = 'zh-TW',
}) => {
  const animation = useMemo(() => getBlogArticleAnimation(articleId), [articleId]);
  const [reloadKey, setReloadKey] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setFrameHeight(null);
  }, [articleId, reloadKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const data = event.data;
      if (data && data.type === 'goddog-sim-height' && typeof data.height === 'number') {
        const clamped = Math.max(330, Math.min(720, Math.ceil(data.height)));
        setFrameHeight(clamped);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!animation) return null;

  const htmlLineCount = animation.html.split('\n').length;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(animation.html);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2200);
    } catch {
      // Fallback ignored if clipboard blocked in preview frame
    }
  };

  const labels = {
    badge:
      lang === 'en'
        ? 'PURE HTML5 INTERACTIVE LAB'
        : lang === 'ja'
        ? 'PURE HTML5 物理シミュレーション'
        : '純 HTML5 互動物理實驗室',
    reload: lang === 'en' ? 'Reset' : lang === 'ja' ? '再起動' : '重置動畫',
    viewCode:
      lang === 'en'
        ? 'Pure HTML'
        : lang === 'ja'
        ? 'HTML コード'
        : '純 HTML 代碼',
    copyHtml: lang === 'en' ? 'Copy HTML' : lang === 'ja' ? 'HTML コピー' : '複製純 HTML',
    copied: lang === 'en' ? 'Copied' : lang === 'ja' ? 'コピー済' : '已複製',
    sourceNote:
      lang === 'en'
        ? `Self-contained single-file HTML (${htmlLineCount} lines, inline CSS + Canvas 2D + JS, zero external dependencies)`
        : lang === 'ja'
        ? `単一ファイル完結 HTML（${htmlLineCount} 行、外部依存ゼロ）`
        : `單一獨立純 HTML5 檔案（共 ${htmlLineCount} 行，內嵌 CSS + Canvas 2D + 原生 JS，零外部相依）`,
  };

  return (
    <section
      aria-label={animation.title}
      className="my-7 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 overflow-hidden shadow-sm"
    >
      {/* Instrument Header Bar */}
      <div className="px-3.5 sm:px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-sky-400">
            <Play className="w-3.5 h-3.5 shrink-0" />
            <span>{labels.badge}</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-50 mt-0.5 leading-snug">
            {animation.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {animation.subtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            title={labels.reload}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>{labels.reload}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSource((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              showSource
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>{labels.viewCode}</span>
            {showSource ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Sandboxed Pure HTML Simulation Viewport */}
      <div className="relative w-full bg-[#0b1120]">
        <iframe
          ref={iframeRef}
          key={`${articleId}-${reloadKey}`}
          srcDoc={animation.html}
          sandbox="allow-scripts"
          title={animation.title}
          loading="lazy"
          style={frameHeight ? { height: `${frameHeight}px` } : undefined}
          className={`w-full border-0 block bg-[#0b1120] transition-[height] duration-150 ${
            frameHeight ? '' : 'h-[440px] sm:h-[430px] md:h-[450px]'
          }`}
        />
      </div>

      {/* Collapsible Pure HTML Source Code Viewer */}
      {showSource && (
        <div className="border-t border-slate-800 bg-slate-950">
          <div className="px-3.5 sm:px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {labels.sourceNote}
            </span>
            <button
              type="button"
              onClick={handleCopyHtml}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                copiedHtml
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {copiedHtml ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{labels.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{labels.copyHtml}</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 max-h-80 overflow-auto text-[11px] leading-relaxed font-mono text-slate-300 select-all">
            <code>{animation.html}</code>
          </pre>
        </div>
      )}
    </section>
  );
};
