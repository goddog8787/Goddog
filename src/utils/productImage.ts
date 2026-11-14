import React from 'react';

/**
 * Maps filament material type or product name keywords to authentic local product photos.
 */
export function getMaterialFallbackImage(material?: string, name?: string): string {
  const text = `${material || ''} ${name || ''}`.toLowerCase();

  if (text.includes('s4') || (text.includes('sunlu') && (text.includes('dry') || text.includes('烘') || text.includes('乾')))) {
    return '/assets/aistudio/1794141738451-1734206707_ccc83181.jpg';
  }
  if ((text.includes('petg') && text.includes('matte')) || text.includes('petg matte') || text.includes('petgmatte')) {
    return '/assets/aistudio/IMG_20260908_230642_0d9581e2.png';
  }
  if (text.includes('ams') || text.includes('四色') || text.includes('進料器') || text.includes('供料系統')) {
    return '/images/products/bambu_ams.jpg';
  }
  if (text.includes('resin') || text.includes('樹脂') || text.includes('光敏')) {
    if (text.includes('abs') || text.includes('韌')) {
      return '/images/products/resin_abs_tough.jpg';
    }
    return '/images/products/resin_8k_grey.jpg';
  }
  if (text.includes('tpu') || text.includes('柔性') || text.includes('軟膠') || text.includes('彈性')) {
    if (text.includes('85a')) return '/images/products/tpu_cyan.webp';
    if (text.includes('64d')) return '/images/products/tpu_64d.webp';
    return '/images/products/tpu_orange.webp';
  }
  if (text.includes('pa12') && text.includes('cf')) {
    return '/images/products/pa12_cf.webp';
  }
  if ((text.includes('pa') || text.includes('nylon') || text.includes('尼龍')) && text.includes('cf')) {
    return '/images/products/pa6_cf.webp';
  }
  if ((text.includes('pa') || text.includes('nylon') || text.includes('尼龍')) && text.includes('gf')) {
    return '/images/products/pa_gf.webp';
  }
  if (text.includes('petg') && text.includes('cf')) {
    return '/images/products/petg_cf.webp';
  }
  if (text.includes('carbon') || text.includes('cf') || text.includes('碳纖維')) {
    return '/images/products/pla_cf_black.webp';
  }
  if (text.includes('petg') && (text.includes('trans') || text.includes('透明') || text.includes('透光'))) {
    return '/images/products/petg_translucent.webp';
  }
  if (text.includes('petg') && (text.includes('esd') || text.includes('靜電'))) {
    return '/images/products/petg_esd.webp';
  }
  if (text.includes('vacuum') || text.includes('真空') || text.includes('密封袋') || text.includes('乾燥劑')) {
    return '/images/products/filament_vacuum_kit.jpg';
  }
  if (text.includes('ptfe') || text.includes('鐵氟龍') || text.includes('導料管') || text.includes('斜口剪')) {
    return '/images/products/bambu_hotend_nozzle.png';
  }
  if (text.includes('petg-hf') || (text.includes('petg') && text.includes('hf'))) {
    return '/images/products/petg_hf_spool.jpg';
  }
  if (text.includes('petg')) {
    return '/images/products/petg_blue.webp';
  }
  if (text.includes('pc-abs') || (text.includes('pc') && text.includes('abs'))) {
    return '/images/products/pc_abs.webp';
  }
  if (text.includes('abs+')) {
    return '/images/products/abs_plus_spool.jpg';
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
  if (text.includes('pp') || text.includes('聚丙烯')) {
    return '/images/products/pp_poly.webp';
  }
  if (text.includes('pva') || text.includes('hips') || text.includes('support') || text.includes('支撐')) {
    return '/images/products/pva_support.webp';
  }
  if (text.includes('peek') || text.includes('ultem')) {
    return '/images/products/peek_ultem.webp';
  }
  if (text.includes('marble') || text.includes('大理石') || text.includes('石材')) {
    return '/images/products/pla_marble_spool.jpg';
  }
  if (text.includes('wood') || text.includes('木')) {
    return '/images/products/pla_wood.webp';
  }
  if (text.includes('glow') || text.includes('夜光')) {
    return '/images/products/pla_glow.webp';
  }
  if (text.includes('tri-color') || text.includes('tricolor') || text.includes('三色')) {
    return '/images/products/pla_tricolor_silk.jpg';
  }
  if (text.includes('silk') || text.includes('絲綢')) {
    return '/images/products/pla_silk.webp';
  }
  if (text.includes('lw-pla') || text.includes('發泡') || text.includes('輕量')) {
    return '/images/products/lw_pla.webp';
  }
  if (text.includes('refill') || text.includes('補充包')) {
    return '/images/products/refill_bambu.webp';
  }
  if (text.includes('dry') || text.includes('乾燥') || text.includes('烘乾')) {
    return '/images/products/dryer_box_s2.png';
  }
  if (text.includes('esun') && (text.includes('matte') || text.includes('消光'))) {
    return '/images/products/esun_pla_matte.jpg';
  }
  if (text.includes('matte') || text.includes('消光') || text.includes('啞光') || text.includes('莫蘭迪')) {
    return '/images/products/pla_matte.webp';
  }
  if (text.includes('pei') || text.includes('鋼板') || text.includes('熱床')) {
    if (text.includes('bambu') || text.includes('拓竹')) {
      return '/images/products/bambu_pei_plate.png';
    }
    return '/images/products/pei_textured_sheet.png';
  }
  if (text.includes('nozzle') || text.includes('噴嘴') || text.includes('熱端')) {
    return '/images/products/bambu_hotend_nozzle.png';
  }
  if (text.includes('bambu') && text.includes('pla')) {
    return '/images/products/bambu_pla_basic.jpg';
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
  if (url.startsWith('data:image/')) {
    return url;
  }
  if (
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

const preloadedImageCache = new Map<string, HTMLImageElement>();

export function preloadProductImageUrl(url?: string): void {
  if (typeof window === 'undefined' || !url || preloadedImageCache.has(url)) return;
  if (url.startsWith('data:image/')) return;
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    preloadedImageCache.set(url, img);
  } catch {}
}

// Auto-warm core product images in browser memory cache on idle
if (typeof window !== 'undefined') {
  const CORE_PRODUCT_IMAGES = [
    '/assets/aistudio/IMG_20260908_230642_0d9581e2.png',
    '/assets/aistudio/1794141738451-1734206707_ccc83181.jpg',
    '/images/products/bambu_ams.jpg',
    '/images/products/bambu_pla_basic.jpg',
    '/images/products/hyper_pla_red.webp',
    '/images/products/pla_matte.webp',
    '/images/products/esun_pla_matte.jpg',
    '/images/products/pla_silk.webp',
    '/images/products/pla_cf_black.webp',
    '/images/products/petg_blue.webp',
    '/images/products/petg_cf.webp',
    '/images/products/abs_black.webp',
    '/images/products/asa_grey.webp',
    '/images/products/tpu_orange.webp',
    '/images/products/tpu_cyan.webp',
    '/images/products/pa6_cf.webp',
    '/images/products/pa12_cf.webp',
    '/images/products/pc_clear.webp',
    '/images/products/resin_8k_grey.jpg',
    '/images/products/resin_abs_tough.jpg',
    '/images/products/dryer_box_s2.png',
    '/images/products/bambu_pei_plate.png',
    '/images/products/bambu_hotend_nozzle.png',
    '/images/products/abs_plus_spool.jpg',
    '/images/products/pla_marble_spool.jpg',
    '/images/products/pla_tricolor_silk.jpg',
    '/images/products/petg_hf_spool.jpg',
    '/images/products/filament_vacuum_kit.jpg',
    '/images/products/refill_bambu.webp',
    '/images/products/cardboard_spool.webp',
  ];
  setTimeout(() => {
    for (const src of CORE_PRODUCT_IMAGES) {
      preloadProductImageUrl(src);
    }
  }, 50);
}

