import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { getMaterialFallbackImage, getSafeProductImageUrl } from '../../utils/productImage';
import type { LanguageCode } from '../../types';

interface ProductPhotoProps {
  url?: string;
  material?: string;
  name: string;
  alt?: string;
  lang?: LanguageCode;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  showFallbackNote?: boolean;
}

type PhotoStateProps = Omit<ProductPhotoProps, 'url' | 'material'> & {
  primary: string;
  fallback: string;
  primaryIsReference: boolean;
};

function PhotoState({
  primary, fallback, primaryIsReference, alt, name, lang = 'zh-TW', priority = false, className = '', imageClassName = '', showFallbackNote = false,
}: PhotoStateProps) {
  const [source, setSource] = useState<string | null>(primary);
  const [loaded, setLoaded] = useState(false);
  const isReference = loaded && (primaryIsReference || source !== primary);
  const unavailable = lang === 'en' ? 'Photo unavailable' : lang === 'ja' ? '画像を表示できません' : '商品圖片暫無法顯示';
  const reference = lang === 'en' ? 'Reference photo' : lang === 'ja' ? '参考画像' : '材質示意圖';

  return (
    <div className={`relative ${className}`} data-product-photo={loaded ? 'loaded' : source ? 'loading' : 'unavailable'}>
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <ImageIcon aria-hidden="true" className="h-1/3 max-h-8 w-1/3 max-w-8" />
          {!source && showFallbackNote && <span className="px-2 text-center text-[11px]">{unavailable}</span>}
        </div>
      )}
      {source && (
        <img
          key={source}
          src={source}
          alt={isReference ? (alt === '' ? '' : `${name} · ${reference}`) : alt ?? name}
          width={320}
          height={320}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full ${loaded ? 'opacity-100' : 'opacity-0'} ${imageClassName}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setSource(source === fallback ? null : fallback);
          }}
        />
      )}
      {isReference && showFallbackNote && (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-1 text-[10px] text-white">{reference}</span>
      )}
    </div>
  );
}

export function ProductPhoto({ url, material, ...props }: ProductPhotoProps) {
  const primary = getSafeProductImageUrl(url, material, props.name);
  const fallback = getMaterialFallbackImage(material, props.name);
  const primaryIsReference = primary !== (typeof url === 'string' ? url.trim() : undefined);
  return <PhotoState key={JSON.stringify([primary, fallback, primaryIsReference])}
    primary={primary} fallback={fallback} primaryIsReference={primaryIsReference} {...props} />;
}
