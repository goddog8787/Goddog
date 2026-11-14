import React, { useEffect, useMemo } from 'react';
import { FilamentProduct, LanguageCode } from '../types';
import { buildProductSEOKeywords } from '../utils/productSearch';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  product?: FilamentProduct | null;
  products?: FilamentProduct[];
  jsonLd?: Record<string, any> | Record<string, any>[];
  schema?: Record<string, any> | Record<string, any>[];
}

function buildSingleProductJsonLd(
  prod: FilamentProduct,
  originUrl: string
): Record<string, any> {
  const productUrl = `${originUrl}/?product=${encodeURIComponent(prod.id)}`;
  const imageUrl =
    prod.imageUrl && prod.imageUrl.startsWith('http')
      ? prod.imageUrl
      : `${originUrl}/wolf-logo.jpg`;

  const featureProps = Array.isArray(prod.features)
    ? prod.features.filter(Boolean).map((feat) => ({
        '@type': 'PropertyValue',
        name: '商品特色特點',
        value: feat,
      }))
    : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: prod.name,
    sku: prod.sku || prod.id,
    mpn: prod.sku || prod.id,
    description:
      prod.description ||
      `${prod.name}｜${prod.brand} ${prod.material} ${prod.diameter || '1.75mm'} 3D 列印耗材，特點：${(prod.features || []).join('、')}`,
    image: [imageUrl],
    category: `3D 列印耗材 > ${prod.material}`,
    material: prod.material,
    keywords: [
      prod.name,
      prod.brand,
      prod.material,
      prod.badge || '',
      ...(prod.features || []),
    ]
      .filter(Boolean)
      .join(', '),
    brand: {
      '@type': 'Brand',
      name: prod.brand || '神狗勾',
    },
    additionalProperty: [
      ...featureProps,
      ...(prod.nozzleTemp || prod.printTemp
        ? [
            {
              '@type': 'PropertyValue',
              name: '建議噴嘴溫度',
              value: prod.nozzleTemp || prod.printTemp,
            },
          ]
        : []),
      ...(prod.bedTemp
        ? [
            {
              '@type': 'PropertyValue',
              name: '建議熱床溫度',
              value: prod.bedTemp,
            },
          ]
        : []),
      ...(prod.maxSpeed
        ? [
            {
              '@type': 'PropertyValue',
              name: '最高支援列印速度',
              value: prod.maxSpeed,
            },
          ]
        : []),
    ],
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'TWD',
      price: String(prod.price),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        prod.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: '神狗勾 3D 列印耗材商城',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(prod.rating || 4.9),
      reviewCount: String(Math.max(1, prod.reviewsCount || 28)),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  url,
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&q=80&w=1200',
  ogType = 'website',
  product,
  products,
  jsonLd,
  schema,
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

  const effectiveTitle = product ? `${product.name} (${product.material})` : title;

  const fullTitle = effectiveTitle
    ? effectiveTitle.includes('GodDog') || effectiveTitle.includes('神狗勾')
      ? effectiveTitle
      : `${effectiveTitle} | ${siteName}`
    : siteName;

  const defaultDesc =
    activeLang === 'en'
      ? 'High-precision ±0.02mm 3D printing filaments (PLA, PETG, ABS, ASA, TPU, PA-CF) verified for Bambu Lab AMS, Creality K1 & Prusa. Same-day dispatch & Free Shipping over NT$999.'
      : activeLang === 'ja'
      ? 'Bambu Lab AMS・Creality K1対応の±0.02mm高精度3Dプリントフィラメント専門店（PLA, PETG, ABS, ASA, TPU, PA-CF）。防湿密封袋包装・NT$999以上で送料無料。'
      : '專為 Bambu Lab 拓竹 AMS、Creality K1/K2/K3、Prusa 打造的高精度 ±0.02mm 3D列印耗材（PLA, PETG, ABS, ASA, TPU, PA-CF 碳纖維）。全館密封袋防潮包裝，滿 NT$999 超商免運當日出貨。';

  const productDesc = product
    ? `${product.name} — ${product.description || ''} 特色特點：${(product.features || []).join('、')}。台灣現貨 NT$${product.price}，支援 7-11/全家取貨滿 $999 免運。`.slice(
        0,
        160
      )
    : undefined;

  const finalDesc = description || productDesc || defaultDesc;

  const finalKeywords = useMemo(() => {
    const autoKeywords = buildProductSEOKeywords(products || [], product);
    if (keywords && keywords.trim()) {
      return `${keywords.trim()}, ${autoKeywords}`;
    }
    return autoKeywords;
  }, [keywords, products, product]);

  const resolvedCanonical = useMemo(() => {
    if (canonicalUrl) return canonicalUrl;
    if (typeof window === 'undefined') return 'https://goddog.space/';
    const origin = window.location.origin || 'https://goddog.space';
    const path = url || window.location.pathname || '/';
    if (product?.id) {
      return `${origin}${path === '/' ? '/' : path}?product=${encodeURIComponent(product.id)}`;
    }
    return `${origin}${path}`;
  }, [canonicalUrl, url, product?.id]);

  const resolvedOgImage = useMemo(() => {
    if (product?.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    return ogImage;
  }, [product?.imageUrl, ogImage]);

  const computedJsonLd = useMemo(() => {
    const customSchema = jsonLd || schema;
    if (customSchema) return customSchema;

    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://goddog.space';

    if (product) {
      return buildSingleProductJsonLd(product, origin);
    }

    if (Array.isArray(products) && products.length > 0) {
      const topProducts = products.slice(0, 16);
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Store',
            '@id': `${origin}/#store`,
            name: '神狗勾 3D 列印耗材商城',
            url: origin,
            description: finalDesc,
            priceRange: 'NT$350 - NT$6880',
            currenciesAccepted: 'TWD',
            paymentAccepted: 'Credit Card, LINE Pay, Apple Pay, ATM, 7-ELEVEN, FamilyMart',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: '神狗勾 3D 列印耗材與設備全系列目錄',
              itemListElement: topProducts.map((p) => buildSingleProductJsonLd(p, origin)),
            },
          },
          {
            '@type': 'ItemList',
            name: '神狗勾熱銷 3D 列印線材與配件',
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            numberOfItems: topProducts.length,
            itemListElement: topProducts.map((p, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: buildSingleProductJsonLd(p, origin),
            })),
          },
        ],
      };
    }

    return null;
  }, [jsonLd, schema, product, products, finalDesc]);

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

    // 1. Canonical URL (<link rel="canonical">) & og:url
    let canonicalLink = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.id = 'seo-canonical-link';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', resolvedCanonical);
    setMetaTag('property', 'og:url', resolvedCanonical);

    // 2. Standard & Social Meta Tags
    setMetaTag('name', 'description', finalDesc);
    if (finalKeywords) {
      setMetaTag('name', 'keywords', finalKeywords);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:type', product ? 'product' : ogType);
    setMetaTag('property', 'og:image', resolvedOgImage);

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', finalDesc);
    setMetaTag('name', 'twitter:image', resolvedOgImage);

    // 3. Dynamic Schema.org JSON-LD (Product / Store / ItemList)
    let scriptElement = document.querySelector('#seo-json-ld') as HTMLScriptElement | null;
    if (computedJsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-json-ld';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(computedJsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [
    fullTitle,
    finalDesc,
    finalKeywords,
    resolvedCanonical,
    resolvedOgImage,
    ogType,
    product,
    computedJsonLd,
    activeLang,
  ]);

  return null;
};
