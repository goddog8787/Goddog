import React from 'react';

/**
 * Maps filament material type or product name keywords to authentic local product photos.
 */
export function getMaterialFallbackImage(material?: string, name?: string): string {
  const text = `${material || ''} ${name || ''}`.toLowerCase();

  if (text.includes('resin') || text.includes('樹脂') || text.includes('光敏')) {
    return '/images/products/resin_8k_grey.svg';
  }
  if (text.includes('tpu') || text.includes('柔性') || text.includes('軟膠') || text.includes('彈性')) {
    return '/images/products/tpu_orange.webp';
  }
  if (text.includes('carbon') || text.includes('cf') || text.includes('碳纖維')) {
    return '/images/products/pla_cf_black.webp';
  }
  if (text.includes('petg')) {
    return '/images/products/petg_blue.webp';
  }
  if (text.includes('abs')) {
    return '/images/products/abs_black.webp';
  }
  if (text.includes('asa')) {
    return '/images/products/asa_grey.webp';
  }
  if (text.includes('nylon') || text.includes('pa') || text.includes('尼龍')) {
    return '/images/products/nylon_natural.webp';
  }
  if (text.includes('pc') || text.includes('聚碳酸酯')) {
    return '/images/products/pc_clear.webp';
  }
  if (text.includes('wood') || text.includes('木')) {
    return '/images/products/pla_wood.webp';
  }
  if (text.includes('glow') || text.includes('夜光')) {
    return '/images/products/pla_glow.webp';
  }
  if (text.includes('silk') || text.includes('絲綢')) {
    return '/images/products/pla_silk.webp';
  }
  if (text.includes('refill') || text.includes('補充') || text.includes('裸裝')) {
    return '/images/products/refill_yellow.webp';
  }
  if (text.includes('dry') || text.includes('乾燥') || text.includes('烘乾')) {
    return '/images/products/dryer_box_s2.svg';
  }
  if (text.includes('pei') || text.includes('鋼板') || text.includes('熱床')) {
    return '/images/products/pei_textured_sheet.svg';
  }
  if (text.includes('nozzle') || text.includes('噴嘴')) {
    return '/images/products/nozzle_hardened_steel.webp';
  }
  return '/images/products/hyper_pla_red.webp';
}

/**
 * Returns a valid local authentic image URL or an appropriate fallback.
 */
export function getSafeProductImageUrl(url?: string, material?: string, name?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getMaterialFallbackImage(material, name);
  }
  if (
    url.includes('unsplash.com') ||
    url.includes('1550684848') ||
    url.includes('1584308666744') ||
    url.includes('1518770660439')
  ) {
    return getMaterialFallbackImage(material, name);
  }
  return url;
}

/**
 * Image onError handler to cleanly replace broken image URLs without infinite loops.
 */
export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  material?: string,
  name?: string
) {
  const target = e.currentTarget;
  const fallback = getMaterialFallbackImage(material, name);
  if (!target.src.endsWith(fallback)) {
    target.src = fallback;
  }
}
