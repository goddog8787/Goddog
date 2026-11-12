import React, { useEffect } from 'react';
import { LanguageCode } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Record<string, any>[];
  schema?: Record<string, any> | Record<string, any>[];
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  url,
  ogImage = 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&q=80&w=1200',
  ogType = 'website',
  jsonLd,
  schema
}) => {
  const activeLang: LanguageCode =
    typeof window !== 'undefined'
      ? ((localStorage.getItem('printcore_lang') as LanguageCode) || 'zh-TW')
      : 'zh-TW';

  const siteName =
    activeLang === 'en'
      ? 'GodDog 3D Filaments & Smart Slicing Store'
      : activeLang === 'ja'
      ? '神狗勾 3Dフィラメント公式ストア'
      : '神狗勾耗材 3D列印線材旗艦館';

  const fullTitle = title
    ? title.includes('GodDog') || title.includes('神狗勾')
      ? title
      : `${title} | ${siteName}`
    : siteName;

  const defaultDesc =
    activeLang === 'en'
      ? 'High-precision ±0.02mm 3D printing filaments (PLA, PETG, ABS, ASA, TPU, PA-CF) verified for Bambu Lab AMS, Creality K1 & Prusa. Same-day dispatch & Free Shipping over NT$999.'
      : activeLang === 'ja'
      ? 'Bambu Lab AMS・Creality K1対応の±0.02mm高精度3Dプリントフィラメント専門店（PLA, PETG, ABS, ASA, TPU, PA-CF）。アルミ真空防湿包装・NT$999以上で送料無料。'
      : '專為 Bambu Lab 拓竹 AMS、Creality K1、Prusa 打造的高精度 ±0.02mm 3D列印耗材（PLA, PETG, ABS, ASA, TPU, PA-CF 碳纖維）。全館真空防潮包裝，滿 NT$999 超商免運當日出貨。';

  const finalDesc = description || defaultDesc;
  const finalJsonLd = jsonLd || schema;

  useEffect(() => {
    document.title = fullTitle;

    const setMetaTag = (attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', finalDesc);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    if (url && typeof window !== 'undefined') {
      setMetaTag('property', 'og:url', `${window.location.origin}${url}`);
    }
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    let scriptElement = document.querySelector('#seo-json-ld') as HTMLScriptElement | null;
    if (finalJsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-json-ld';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(finalJsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [fullTitle, finalDesc, keywords, url, ogImage, ogType, finalJsonLd, activeLang]);

  return null;
};
