import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdSenseConfig } from '../../types';

export interface AdSenseBannerProps {
  placement: 'header-top' | 'in-feed' | 'footer-bottom' | 'article-mid' | 'article-bottom' | 'sidebar' | 'native-banner' | 'mobile-sticky';
  config?: AdSenseConfig;
  className?: string;
  onClose?: () => void;
  network?: 'auto' | 'adsterra' | 'hilltopads' | 'custom';
  format?: 'auto' | 'fluid' | 'rectangle';
}

export interface AdsterraSlot {
  key: string;
  width: number;
  height: number;
  label: string;
}

// User-provided Adsterra active banner units
export const ADSTERRA_PRESETS: Record<string, AdsterraSlot> = {
  skyscraper160x600: { key: '41c153635cb5ee0f0b1922414c7126b3', width: 160, height: 600, label: '160x600 高摩天樓 (桌機側邊欄浮動)' },
  skyscraper160x300: { key: '6431fa09ab57bc2decb1d6a4836130da', width: 160, height: 300, label: '160x300 中摩天樓 (筆電/側邊欄)' },
  banner468x60: { key: '3edcabb7f92741e66473112ece6909ec', width: 468, height: 60, label: '468x60 標準橫幅 (桌機/平板頂部與頁尾)' },
  mobile320x50: { key: 'f3ad411bb599f45c20d47d01e993ff2d', width: 320, height: 50, label: '320x50 手機橫幅 (行動裝置頂部/底部)' },
  rectangle300x250: { key: 'ecf3942b69d65da2b1c5075b1324f668', width: 300, height: 250, label: '300x250 中矩形 (文章內嵌/原生卡片)' },
  nativeBanner: { key: 'ecf3942b69d65da2b1c5075b1324f668', width: 300, height: 250, label: 'Native Banner 原生商品卡片' },
};

export const generateAdsterraHtml = (slot: AdsterraSlot): string => {
  return `<script>
  atOptions = {
    'key' : '${slot.key}',
    'format' : 'iframe',
    'height' : ${slot.height},
    'width' : ${slot.width},
    'params' : {}
  };
</script>
<script src="https://bicea.org/22/${slot.key}"></script>`;
};

// User-provided official HilltopAds active ad zone script
export const HILLTOPADS_DEFAULT_SCRIPT = `<script>
(function(tyu){
var d = document,
    s = d.createElement('script'),
    l = d.currentScript || d.scripts[d.scripts.length - 1];
s.settings = tyu || {};
s.src = "\\/\\/massivesalad.com\\/b.XoVPsxdEGhl\\/0xY_WlcC\\/ieFmC9OuAZuUDl\\/k\\/PbTdci0fOLD\\/kM2bO\\/TBcptCNxzVQ\\/4EOkTWcQwOM\\/Qu";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})
</script>`;

export const DEFAULT_ADSENSE_CONFIG: AdSenseConfig = {
  enabled: false, // User requested: hide all ads across the entire site
  publisherId: 'ca-pub-7053299616784703',
  enableAutoAds: false,
  testMode: false,
  networkType: 'adsterra', // Adsterra as primary ad network
  blogAdNetwork: 'adsterra',
  storeAdNetwork: 'adsterra',
  hilltopadsVerificationCode: '01cbacb252bfbf5662b80265d72c30d5b946cc3e',
  hilltopadsVerified: true,
  hilltopadsBannerHtml: HILLTOPADS_DEFAULT_SCRIPT,
  customBannerHtml: '',
  lazyLoading: true,
  slots: {
    storefrontTopBanner: '7728192031',
    inFeedSponsored: '5538192042',
    footerLeaderboard: '9928192053',
    articleMid: '4829103851',
    articleBottom: '6192840192',
  },
  showTopBanner: false,
  showInFeedAd: false,
  showFooterBanner: false,
  showArticleAd: false,
  showSidebarAd: false,
  showMobileStickyAd: false,
};

// Safe isolated iframe renderer for Adsterra and HilltopAds script ad tags
export const ScriptAdFrame: React.FC<{
  slot?: AdsterraSlot;
  html?: string;
  className?: string;
}> = ({ slot, html, className = '' }) => {
  const content = slot ? generateAdsterraHtml(slot) : (html || '');
  if (!content || !content.trim()) return null;

  const w = slot?.width || 300;
  const h = slot?.height || 250;

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

  return (
    <iframe
      srcDoc={srcDoc}
      width={w}
      height={h}
      style={{
        width: `${w}px`,
        maxWidth: '100%',
        height: `${h}px`,
        border: 'none',
        overflow: 'hidden',
        background: 'transparent',
      }}
      title={`Ad Frame ${slot?.key || 'Custom'}`}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      loading="lazy"
      className={`rounded-lg ${className}`}
    />
  );
};

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  placement,
  config,
  className = '',
  network,
  onClose,
}) => {
  const activeConfig = config || DEFAULT_ADSENSE_CONFIG;
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !activeConfig.enabled) {
    return null;
  }

  // Check specific placement toggles
  if (placement === 'header-top' && !activeConfig.showTopBanner) return null;
  if (placement === 'in-feed' && !activeConfig.showInFeedAd) return null;
  if (placement === 'footer-bottom' && !activeConfig.showFooterBanner) return null;
  if ((placement === 'article-mid' || placement === 'article-bottom') && !activeConfig.showArticleAd) return null;
  if (placement === 'sidebar' && !activeConfig.showSidebarAd) return null;
  if (placement === 'mobile-sticky') return null;

  const isArticle = placement === 'article-mid' || placement === 'article-bottom';
  const effectiveNetwork = network && network !== 'auto'
    ? network
    : isArticle
      ? (activeConfig.blogAdNetwork || 'adsterra')
      : (activeConfig.networkType || 'adsterra');

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose?.();
  };

  // ---------------------------------------------------------------------------
  // HILLTOPADS NETWORK
  // ---------------------------------------------------------------------------
  if (effectiveNetwork === 'hilltopads') {
    const rawHilltopHtml = activeConfig.hilltopadsBannerHtml || activeConfig.customBannerHtml;
    if (rawHilltopHtml && rawHilltopHtml.trim() !== '') {
      return (
        <div className={`w-full my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
          <div className="w-full flex justify-between items-center px-2 mb-1 text-[10px] text-slate-400">
            <span className="font-mono">AD • HilltopAds</span>
            <button type="button" onClick={handleDismiss} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex justify-center items-center w-full">
            <ScriptAdFrame html={rawHilltopHtml} />
          </div>
        </div>
      );
    }
    // If no HilltopAds HTML snippet is pasted yet, fall through to default Adsterra units
  }

  // ---------------------------------------------------------------------------
  // ADSTERRA NETWORK (DEFAULT)
  // ---------------------------------------------------------------------------
  // A. Article Mid / Native Banner (300x250)
  if (placement === 'article-mid' || placement === 'native-banner') {
    return (
      <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div className="w-full flex justify-between items-center px-2 mb-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-sans select-none tracking-wider">贊助廣告</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">AD</span>
            <button type="button" onClick={handleDismiss} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center w-full bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-2 border border-slate-200/60 dark:border-slate-800/60">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.rectangle300x250} />
        </div>
      </div>
    );
  }

  // B. Article Bottom (468x60 desktop, 320x50 mobile)
  if (placement === 'article-bottom') {
    return (
      <div className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div className="w-full flex justify-between items-center px-2 mb-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-sans select-none tracking-wider">贊助廣告</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">AD</span>
            <button type="button" onClick={handleDismiss} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="w-full flex justify-center items-center bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-2 border border-slate-200/60 dark:border-slate-800/60">
          <div className="hidden sm:flex justify-center items-center w-full">
            <ScriptAdFrame slot={ADSTERRA_PRESETS.banner468x60} />
          </div>
          <div className="flex sm:hidden justify-center items-center w-full">
            <ScriptAdFrame slot={ADSTERRA_PRESETS.mobile320x50} />
          </div>
        </div>
      </div>
    );
  }

  // C. In-Feed Product Card (300x250)
  if (placement === 'in-feed') {
    return (
      <div
        className={`col-span-2 sm:col-span-1 h-full min-h-[360px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center overflow-hidden p-2 sm:p-2.5 ${className}`}
      >
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-xs select-none">
            AD
          </span>
          <button type="button" onClick={handleDismiss} className="p-0.5 text-white/80 hover:text-white bg-black/50 rounded cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="w-full h-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.rectangle300x250} />
        </div>
      </div>
    );
  }

  // D. Sidebar Skyscraper (160x600 / 160x300)
  if (placement === 'sidebar') {
    return (
      <div className={`w-full my-3 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <div className="w-full flex justify-between items-center px-1 mb-1 text-[10px] text-slate-400">
          <span className="font-sans select-none tracking-wider">贊助廣告</span>
          <button type="button" onClick={handleDismiss} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="hidden 2xl:flex justify-center items-center w-full">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.skyscraper160x600} />
        </div>
        <div className="hidden xl:flex 2xl:hidden justify-center items-center w-full">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.skyscraper160x300} />
        </div>
      </div>
    );
  }

  // E. Header Top / Footer Bottom (468x60 desktop, 320x50 mobile)
  return (
    <div className={`w-full my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <div className="w-full flex justify-between items-center px-2 mb-1 text-[10px] text-slate-400 dark:text-slate-500">
        <span className="font-sans select-none tracking-wider">贊助廣告</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">AD</span>
          <button type="button" onClick={handleDismiss} className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="hidden sm:flex justify-center items-center w-full">
        <ScriptAdFrame slot={ADSTERRA_PRESETS.banner468x60} />
      </div>
      <div className="flex sm:hidden justify-center items-center w-full">
        <ScriptAdFrame slot={ADSTERRA_PRESETS.mobile320x50} />
      </div>
    </div>
  );
};

// =============================================================================
// NATIVE PRODUCT AD CARD (商城商品列表中原生穿插的純淨廣告卡片)
// =============================================================================
export const NativeProductAdCard: React.FC<{
  config?: AdSenseConfig;
  className?: string;
}> = ({ config, className = '' }) => {
  const activeConfig = config || DEFAULT_ADSENSE_CONFIG;

  if (!activeConfig.enabled || !activeConfig.showInFeedAd) {
    return null;
  }

  const effectiveNetwork = activeConfig.storeAdNetwork || activeConfig.networkType || 'adsterra';

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center overflow-hidden p-2 sm:p-2.5 min-h-[360px] col-span-2 sm:col-span-1 ${className}`}
    >
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-xs select-none">
          AD
        </span>
      </div>

      <div className="w-full h-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
        {effectiveNetwork === 'hilltopads' && activeConfig.hilltopadsBannerHtml ? (
          <ScriptAdFrame html={activeConfig.hilltopadsBannerHtml} />
        ) : (
          <ScriptAdFrame slot={ADSTERRA_PRESETS.rectangle300x250} />
        )}
      </div>
    </div>
  );
};

// =============================================================================
// FLOATING SKYSCRAPER AD (桌機專屬側邊懸浮摩天樓 - 160x600 / 160x300)
// =============================================================================
export const FloatingSkyscraperAd: React.FC<{
  config?: AdSenseConfig;
}> = ({ config }) => {
  const [dismissed, setDismissed] = useState(false);
  const activeConfig = config || DEFAULT_ADSENSE_CONFIG;

  if (dismissed || !activeConfig.enabled || !activeConfig.showSidebarAd) {
    return null;
  }

  return (
    <aside
      aria-label="贊助商廣告"
      className="hidden xl:flex fixed right-2 2xl:right-6 top-32 z-30 flex-col items-center select-none"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-1 mb-1 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-sans tracking-wider">贊助廣告</span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="暫時關閉此側邊廣告"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* 2XL Desktop (>= 1536px): 160x600 Wide Skyscraper */}
        <div className="hidden 2xl:block">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.skyscraper160x600} />
        </div>

        {/* XL Desktop (1280px ~ 1536px): 160x300 Mini Skyscraper */}
        <div className="block 2xl:hidden">
          <ScriptAdFrame slot={ADSTERRA_PRESETS.skyscraper160x300} />
        </div>
      </div>
    </aside>
  );
};

// =============================================================================
// MOBILE STICKY BOTTOM AD (Permanently disabled)
// =============================================================================
export const MobileStickyAd: React.FC = () => {
  return null;
};
