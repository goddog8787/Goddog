import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, DollarSign, ExternalLink, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { AdSenseConfig } from '../../types';

interface AdSenseBannerProps {
  placement: 'header-top' | 'in-feed' | 'footer-bottom';
  config: AdSenseConfig;
  onSimulateClick?: () => void;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

// Curated 3D maker / engineering sponsors for test & fallback display
const SPONSORED_DEMO_ADS = {
  'header-top': {
    brand: 'Bambu Lab 拓竹科技',
    badge: '贊助商廣告',
    title: 'Bambu Lab H2S 高速工程級 3D 印表機全新上市',
    description: '最大 600mm/s 列印速度、全自動雙雷射第一層校正，支援神狗勾全系列高速 PLA/PETG/碳纖維耗材！限時現貨供應免等待。',
    cta: '立即前往官方旗艦店了解',
    url: 'https://bambulab.com',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80',
    tags: ['雙色列印', 'AMS 相容', '極致靜音'],
  },
  'in-feed': {
    brand: 'Polymaker 工業材料',
    badge: 'Google 贊助內容',
    title: 'PolySonic™ 高速列印專用工程線材系列',
    description: '針對 300mm/s+ 高速擠出機優化融融流動指數，層間剪切強度提升 45%，搭配神狗勾滿額免運優惠中！',
    cta: '探索高速工程線材',
    url: 'https://polymaker.com',
    image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&auto=format&fit=crop&q=80',
    tags: ['高流速', '耐衝擊', '工業認證'],
  },
  'footer-bottom': {
    brand: 'PCBWay 創客雲端打樣製造',
    badge: 'Google Ads 展示廣告',
    title: '全球創客首選：CNC 加工、金屬 3D 列印、尼龍 SLS 快速打樣',
    description: '24 小時快速出貨，極限公差 ±0.05mm，百萬創客與工程師信賴的雲端原型製作平台，註冊立享 US$5 新人券！',
    cta: '免費取得工程打樣報價',
    url: 'https://www.pcbway.com',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=700&auto=format&fit=crop&q=80',
    tags: ['SLS 尼龍', '金屬列印', 'CNC 銑削'],
  },
};

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  placement,
  config,
  onSimulateClick,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [googleAdUnfilled, setGoogleAdUnfilled] = useState(false);

  // Determine slot ID
  const slotId =
    placement === 'header-top'
      ? config.slots.storefrontTopBanner
      : placement === 'in-feed'
      ? config.slots.inFeedSponsored
      : config.slots.footerLeaderboard;

  // Determine visibility
  const isVisible =
    config.enabled &&
    (placement === 'header-top'
      ? config.showTopBanner
      : placement === 'in-feed'
      ? config.showInFeedAd
      : config.showFooterBanner);

  // Push to adsbygoogle when real AdSense is enabled and not in testMode
  useEffect(() => {
    if (!isVisible) return;

    if (!config.testMode && config.publisherId && config.publisherId.startsWith('ca-pub-')) {
      // Ensure Google AdSense script is loaded
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Push ad slot with safe delay to ensure ins ref is mounted
      const timer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && adRef.current) {
            if (!adRef.current.getAttribute('data-adsbygoogle-status')) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdLoaded(true);
            }
          }
        } catch (err) {
          console.warn('AdSense push notice (normal during site review/sandbox):', err);
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isVisible, config.testMode, config.publisherId, slotId]);

  // Monitor if Google AdSense rendered an ad or returned unfilled / collapsed
  useEffect(() => {
    if (!isVisible || config.testMode) return;
    const checkTimer = setTimeout(() => {
      if (adRef.current) {
        const status = adRef.current.getAttribute('data-ad-status');
        // If Google AdSense returns 'unfilled' or iframe is empty / 0 height, fallback to sponsored ad
        if (status === 'unfilled' || (adRef.current.clientHeight === 0 && !adLoaded)) {
          setGoogleAdUnfilled(true);
        }
      }
    }, 1200);

    return () => clearTimeout(checkTimer);
  }, [isVisible, adLoaded, config.testMode]);

  if (!isVisible) return null;

  const demoAd = SPONSORED_DEMO_ADS[placement];

  // If in test mode OR if Google ad is unfilled / rejected / pending review, render rich interactive maker sponsor ad
  if (config.testMode || googleAdUnfilled || !config.publisherId || !config.publisherId.startsWith('ca-pub-')) {
    if (placement === 'header-top') {
      return (
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-indigo-200/80 rounded-2xl p-3 sm:p-4 shadow-xs relative overflow-hidden my-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs">
                    {demoAd.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{demoAd.brand}</span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200">
                    Google AdSense 測試版位 (Slot: {slotId})
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{demoAd.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{demoAd.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setClicked(true);
                  if (onSimulateClick) onSimulateClick();
                  setTimeout(() => setClicked(false), 2000);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  clicked
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {clicked ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>模擬點擊成功 (計入收益)</span>
                  </>
                ) : (
                  <>
                    <span>{demoAd.cta}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'in-feed') {
      return (
        <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl border-2 border-dashed border-indigo-300 p-4 shadow-xs flex flex-col justify-between relative overflow-hidden animate-fade-in group hover:border-indigo-500 transition-all">
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              Google Ads 原生贊助
            </span>
          </div>

          <div>
            <div className="h-36 rounded-xl overflow-hidden mb-3 relative bg-slate-100">
              {demoAd.image && demoAd.image.trim() !== '' && (
                <img
                  src={demoAd.image}
                  alt={demoAd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {demoAd.brand}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-1.5 flex-wrap">
                {demoAd.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">{demoAd.title}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{demoAd.description}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Slot: {slotId}</span>
            <button
              type="button"
              onClick={() => {
                setClicked(true);
                if (onSimulateClick) onSimulateClick();
                setTimeout(() => setClicked(false), 2000);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                clicked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-indigo-600 text-white'
              }`}
            >
              {clicked ? '點擊成功' : '前往了解'}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    // footer-bottom
    return (
      <div className="w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 my-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-sm shrink-0">
              AD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                  Google AdSense 大版位廣告 (728x90)
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {slotId}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{demoAd.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-1">{demoAd.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setClicked(true);
              if (onSimulateClick) onSimulateClick();
              setTimeout(() => setClicked(false), 2000);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              clicked
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
            }`}
          >
            {clicked ? '廣告收益已記錄' : demoAd.cta}
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Real production Google AdSense ins tag
  return (
    <div className="w-full my-4 flex flex-col items-center justify-center overflow-hidden bg-slate-50/80 border border-dashed border-indigo-200 rounded-2xl p-3 min-h-[90px] relative">
      <div className="w-full flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">Google AdSense 官方廣告位</span>
          <span className="text-slate-400 font-mono">({config.publisherId})</span>
        </div>
        <span className="font-medium bg-slate-200/80 px-1.5 py-0.5 rounded text-[9px] text-slate-600">Ads by Google</span>
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle w-full block text-center min-h-[60px]"
        style={{ display: 'block' }}
        data-ad-client={config.publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <div className="mt-2 text-[10px] text-slate-400 text-center">
        （若廣告為空白：代表 Google 正對此預覽網域進行審核，或瀏覽器安裝了 AdBlock 廣告攔截器）
      </div>
    </div>
  );
};
