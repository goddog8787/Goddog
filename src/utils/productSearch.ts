import { FilamentProduct } from '../types';

/**
 * 深度聯想詞索引字典 (Deep Associative Keyword Index)
 * 將使用者搜尋意圖、應用場景、列印痛點、機型適配與物理特性，
 * 擴充映射至商品特色特點 (features)、材質 (material)、描述與標籤。
 */
export const DEEP_ASSOCIATIVE_KEYWORD_MAP: Record<string, string[]> = {
  // 1. 表面質感與視覺效果
  消光: ['消光', '啞光', 'matte', '隱藏層紋', '零層紋', '無層紋', '磨砂', '低反光', '細膩表面', 'pla-cf'],
  啞光: ['啞光', '消光', 'matte', '隱藏層紋', '零層紋', '無層紋', '磨砂', '低反光'],
  磨砂: ['磨砂', '消光', '啞光', 'matte', '碳纖維', 'pla-cf', 'pei', '金剛砂'],
  隱藏層紋: ['隱藏層紋', '零層紋', '無層紋', '消光', '啞光', 'matte', 'pla-cf', '碳纖維', '表面細膩'],
  無層紋: ['隱藏層紋', '零層紋', '無層紋', '消光', '啞光', 'matte', 'pla-cf', '碳纖維'],
  零層紋: ['零層紋', '隱藏層紋', '無層紋', '消光', '啞光', 'matte', 'pla-cf', '碳纖維'],
  絲綢: ['絲綢', 'silk', '光澤', '金屬感', '高亮', '流光'],
  光滑: ['光滑', '細膩', '8k', 'resin', '光固化', '高精度'],

  // 2. 機械強度、韌性與工程結構
  高韌性: ['高韌性', '韌性', '抗衝擊', '耐衝擊', '耐摔', '不易斷', 'pla+', 'petg', 'tpu', 'abs', '層間結合'],
  韌性: ['韌性', '高韌性', '抗衝擊', '耐衝擊', 'pla+', 'petg', 'tpu', 'abs'],
  耐衝擊: ['耐衝擊', '抗衝擊', '高韌性', '防摔', '耐摔', 'petg', 'pla+', 'tpu', 'abs'],
  抗衝擊: ['抗衝擊', '耐衝擊', '高韌性', '防摔', 'petg', 'pla+', 'tpu', 'abs'],
  防摔: ['防摔', '耐摔', '抗衝擊', '耐衝擊', '高韌性', '緩震', 'tpu', '95a', 'pla+', 'petg'],
  高剛性: ['高剛性', '剛性', '高強度', '碳纖維', 'pla-cf', 'carbon fiber', '抗彎曲', '結構件', '不變形'],
  碳纖: ['碳纖維', '碳纖', 'pla-cf', 'petg-cf', 'pa-cf', 'carbon fiber', 'cf', '高剛性', '輕量化'],
  碳纖維: ['碳纖維', '碳纖', 'pla-cf', 'carbon fiber', 'cf', '高剛性', '消光碳纖', '航太'],
  結構件: ['結構', '高剛性', '高強度', '工程', '治具', '齒輪', '無人機', 'pla-cf', 'petg', 'abs'],
  無人機: ['無人機', '穿越機', '航太', '輕量化', '高剛性', '碳纖維', 'pla-cf', 'tpu', '防撞'],
  齒輪: ['齒輪', '機構', '卡扣', '高剛性', '耐磨', '高韌性', 'petg', 'pla-cf', 'abs'],
  卡扣: ['卡扣', '高韌性', '抗衝擊', '耐彎折', 'petg', 'pla+'],

  // 3. 耐溫、戶外耐候與化學防護
  耐高溫: ['耐高溫', '耐溫', '耐熱', '抗熱變形', 'abs', 'asa', 'petg', 'pc', '100°c', '75°c'],
  耐熱: ['耐熱', '耐溫', '耐高溫', 'abs', 'petg', '熱變形'],
  耐溫: ['耐溫', '耐熱', '耐高溫', 'abs', 'petg', '熱變形'],
  戶外: ['戶外', '耐候', '抗uv', '紫外線', '防水', '日曬', 'petg', 'asa'],
  耐候: ['耐候', '戶外', '抗uv', '紫外線', '防水', 'petg', 'asa'],
  防水: ['防水', '耐候', '戶外', '抗化學', 'petg', 'tpu'],
  抗uv: ['抗uv', '紫外線', '耐候', '戶外', '不褪色', 'petg', 'asa'],
  車用: ['汽車', '車用', '車內', '耐高溫', '耐熱', 'abs', 'petg', 'pla-cf'],

  // 4. 列印體驗、高速與痛點解決
  高速: ['高速', 'high-speed', '極速', '600mm/s', '500mm/s', '300mm/s', '高流動', '快速冷卻'],
  極速: ['極速', '高速', 'high-speed', '600mm/s', '500mm/s', '高流動'],
  不拉絲: ['不拉絲', '低拉絲', '不牽絲', '高流動', '乾淨', '易列印', '收縮率低'],
  不翹邊: ['不翹邊', '低收縮', '超低收縮', '首層附著', '不變形', '穩定', 'pla', 'pla-cf'],
  低收縮: ['低收縮', '超低收縮', '不翹邊', '尺寸精準', '±0.02mm', '不變形'],
  不堵頭: ['不堵頭', '不塞嘴', '純料', '無雜質', '±0.02mm', '順暢', '穩定出料'],
  好印: ['易列印', '好印', '新手', '高成功率', '不翹邊', '穩定', 'pla'],
  新手: ['新手', '易列印', '高成功率', '不翹邊', '免封箱', 'pla', 'high-speed pla'],
  好拆: ['易剝離', '好拆', '支撐好拆', 'matte', '消光', 'pei', '彈簧鋼板'],

  // 5. 彈性軟料與緩衝應用
  軟料: ['tpu', '95a', '軟膠', '軟料', '彈性', '柔韌', '高回彈', '緩震'],
  軟膠: ['tpu', '95a', '軟膠', '軟料', '彈性', '柔韌', '高回彈', '緩震'],
  彈性: ['彈性', '高回彈', 'tpu', '95a', '軟膠', '柔韌', '伸長率', '緩震'],
  緩震: ['緩震', '減震', '防撞', '吸震', 'tpu', '95a', '彈性'],
  手機殼: ['手機殼', '防摔', '保護套', 'tpu', '95a', '彈性', '耐磨'],

  // 6. 公仔模型、光固化與文創
  公仔: ['公仔', '手辦', '模型', '擺件', '微雕', '8k', 'resin', '光固化', 'pla matte', '消光'],
  手辦: ['手辦', '公仔', '模型', '8k', 'resin', '光固化', '細節', '高精度'],
  模型: ['模型', '公仔', '手辦', '建築', '細節', 'pla', 'matte', 'resin', '8k'],
  光固化: ['光固化', 'resin', '8k', '12k', '光敏樹脂', 'lcd', '低氣味'],
  樹脂: ['樹脂', '光敏樹脂', 'resin', '8k', '光固化'],

  // 7. 機型與多色供料系統 (AMS / 高速機)
  拓竹: ['bambu', '拓竹', 'ams', 'x1c', 'p1s', 'a1', 'h2d', 'h2c', 'p2s', '紙盤', '高速'],
  bambu: ['bambu', '拓竹', 'ams', 'x1c', 'p1s', 'a1', 'h2d', '紙盤', '高速'],
  ams: ['ams', 'bambu', '拓竹', '紙盤', 'cardboard', '多色', '防卡', '整齊排線'],
  多色: ['ams', '多色', 'bambu', '拓竹', '紙盤', '色彩飽和'],
  紙盤: ['紙盤', 'cardboard', '環保紙盤', 'ams'],
  創想: ['creality', '創想', 'k1', 'k2', 'k3', 'ender', '高速'],
  sparkx: ['sparkx', 'i8', '高速', '600mm/s', 'high-speed'],
  snapmaker: ['snapmaker', 'u1', '快造', '高速', '多色'],

  // 8. 防潮乾燥與周邊設備
  防潮: ['防潮', '乾燥', '烘乾', '真空', '真空袋', '密封袋', '乾燥劑', 'dry', 's2', 's4'],
  真空袋: ['真空袋', '防潮', '真空', '密封袋', '抽氣泵', '乾燥劑', 'accessories'],
  乾燥劑: ['乾燥劑', '防潮', '真空袋', '除濕', '矽膠', 'accessories'],
  烘乾: ['烘乾', '乾燥', '除濕', '受潮', '恆溫', '乾燥盒', 's2', 's4', 'accessories'],
  乾燥: ['乾燥', '烘乾', '防潮', '除濕', '乾燥盒', 'accessories'],
  熱床: ['熱床', 'pei', '彈簧鋼板', '底板', '附著', '不翹邊', '免膠水'],
  鋼板: ['鋼板', '彈簧鋼板', 'pei', '金剛砂', '熱床', '雙面'],
  鐵氟龍: ['ptfe', '鐵氟龍', '導管', '導料管', '斜口剪', '通針', 'ams', 'accessories'],
  補充包: ['refill', '補充包', '無盤', '裸裝', '環保', 'rfid', 'bambu'],
  大理石: ['大理石', 'marble', '石材', '雲紋', '消光', 'polyterra', '雕塑', 'pla matte'],
  三色: ['三色', 'tri-color', 'tricolor', '幻彩', '共擠', 'silk', '絲綢', '漸變'],

  // 9. 神狗勾品牌核心聯想
  神狗勾: ['神狗勾', 'goddog', '自研', '旗艦', '±0.02mm', '台灣現貨', '真空'],
  goddog: ['goddog', '神狗勾', '自研', '旗艦', '±0.02mm'],
};

/**
 * 將單一搜尋關鍵字擴充為深度聯想詞集合
 */
export function expandAssociativeKeywords(token: string): string[] {
  const clean = token.trim().toLowerCase();
  if (!clean) return [];

  const expanded = new Set<string>([clean]);

  for (const [key, synonyms] of Object.entries(DEEP_ASSOCIATIVE_KEYWORD_MAP)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes(clean) || clean.includes(lowerKey)) {
      expanded.add(lowerKey);
      for (const syn of synonyms) {
        expanded.add(syn.toLowerCase());
      }
    } else if (synonyms.some((s) => s.toLowerCase() === clean)) {
      expanded.add(lowerKey);
      for (const syn of synonyms) {
        expanded.add(syn.toLowerCase());
      }
    }
  }

  return Array.from(expanded);
}

export interface ProductSearchMatchResult {
  matched: boolean;
  score: number;
  matchedFeatures: string[];
  matchedAssociativeTerms: string[];
}

/**
 * 深度搜尋計分與特色特點 (Features) 聯想匹配引擎
 * 支援：
 * 1. 商品名稱 (name)、品牌 (brand)、材質 (material)、SKU、促銷標籤 (badge)
 * 2. 商品特色特點 (features) 欄位深度權重匹配
 * 3. 商品描述 (description)、線盤規格 (spoolType)、列印溫度/速度、顏色名稱
 * 4. 深度聯想詞索引擴充匹配 (DEEP_ASSOCIATIVE_KEYWORD_MAP)
 */
export function evaluateProductDeepSearch(
  product: FilamentProduct,
  rawQuery: string
): ProductSearchMatchResult {
  const query = (rawQuery || '').trim().toLowerCase();
  if (!query) {
    return {
      matched: true,
      score: 100,
      matchedFeatures: [],
      matchedAssociativeTerms: [],
    };
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  const nameLower = (product.name || '').toLowerCase();
  const brandLower = (product.brand || '').toLowerCase();
  const materialLower = (product.material || '').toLowerCase();
  const badgeLower = (product.badge || '').toLowerCase();
  const skuLower = (product.sku || '').toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const spoolLower = (product.spoolType || '').toLowerCase();
  const speedLower = (product.maxSpeed || '').toLowerCase();
  const nozzleLower = (product.nozzleTemp || product.printTemp || '').toLowerCase();
  const bedLower = (product.bedTemp || '').toLowerCase();
  const packagingLower = (product.packagingNote || '').toLowerCase();
  const featuresList = Array.isArray(product.features) ? product.features : [];
  const colorsList = Array.isArray(product.colors) ? product.colors : [];

  let totalScore = 0;
  const matchedFeaturesSet = new Set<string>();
  const matchedAssocSet = new Set<string>();

  for (const token of tokens) {
    let tokenScore = 0;

    // 1. Direct primary field matches
    if (nameLower.includes(token)) tokenScore += 50;
    if (brandLower.includes(token)) tokenScore += 40;
    if (materialLower.includes(token)) tokenScore += 45;
    if (badgeLower.includes(token)) tokenScore += 30;
    if (skuLower.includes(token)) tokenScore += 35;

    // 2. Direct match in product features (商品特色特點)
    for (const feat of featuresList) {
      if (feat && feat.toLowerCase().includes(token)) {
        tokenScore += 42;
        matchedFeaturesSet.add(feat);
      }
    }

    // 3. Direct match in secondary specs & description
    if (descLower.includes(token)) tokenScore += 22;
    if (spoolLower.includes(token)) tokenScore += 18;
    if (speedLower.includes(token)) tokenScore += 15;
    if (nozzleLower.includes(token) || bedLower.includes(token)) tokenScore += 12;
    if (packagingLower.includes(token)) tokenScore += 12;
    if (colorsList.some((c) => c?.name?.toLowerCase().includes(token))) {
      tokenScore += 20;
    }

    // 4. Deep associative keyword expansion (深度聯想詞索引)
    const associativeTerms = expandAssociativeKeywords(token);
    for (const assoc of associativeTerms) {
      if (assoc === token) continue;

      // Check product features first for associative hits
      for (const feat of featuresList) {
        if (feat && feat.toLowerCase().includes(assoc)) {
          tokenScore += 28;
          matchedFeaturesSet.add(feat);
          matchedAssocSet.add(assoc);
        }
      }

      if (nameLower.includes(assoc)) {
        tokenScore += 25;
        matchedAssocSet.add(assoc);
      }
      if (materialLower.includes(assoc)) {
        tokenScore += 24;
        matchedAssocSet.add(assoc);
      }
      if (badgeLower.includes(assoc)) {
        tokenScore += 18;
        matchedAssocSet.add(assoc);
      }
      if (descLower.includes(assoc)) {
        tokenScore += 14;
        matchedAssocSet.add(assoc);
      }
      if (spoolLower.includes(assoc) || speedLower.includes(assoc)) {
        tokenScore += 10;
        matchedAssocSet.add(assoc);
      }
    }

    // In multi-word search, every token must match either directly or via associative index
    if (tokenScore === 0) {
      return {
        matched: false,
        score: 0,
        matchedFeatures: [],
        matchedAssociativeTerms: [],
      };
    }

    totalScore += tokenScore;
  }

  return {
    matched: totalScore > 0,
    score: totalScore,
    matchedFeatures: Array.from(matchedFeaturesSet),
    matchedAssociativeTerms: Array.from(matchedAssocSet),
  };
}

/**
 * 布林快速判斷商品是否符合深度關鍵字與特點 (Features) 聯想搜尋
 */
export function matchesProductDeepSearch(product: FilamentProduct, rawQuery: string): boolean {
  return evaluateProductDeepSearch(product, rawQuery).matched;
}

/**
 * 為單一商品或商品目錄生成深度 SEO 關鍵字字串 (包含品牌、材質、名稱與所有 Features 特點)
 */
export function buildProductSEOKeywords(
  products: FilamentProduct[],
  activeProduct?: FilamentProduct | null
): string {
  const baseKeywords = [
    '神狗勾',
    '神狗勾 3D列印耗材',
    'GodDog 3D',
    '3D列印線材推薦',
    '拓竹耗材',
    'Bambu Lab AMS相容線材',
    'High-Speed PLA高速耗材',
    'PLA-CF碳纖維線材',
    'PETG耐候高韌性線材',
    'TPU 95A彈性軟料',
    '±0.02mm高精度線材',
    '密封袋防潮包裝',
    '台灣現貨24H出貨',
  ];

  const dynamicSet = new Set<string>(baseKeywords);

  if (activeProduct) {
    dynamicSet.add(activeProduct.name);
    dynamicSet.add(`${activeProduct.brand} ${activeProduct.material}`);
    if (activeProduct.badge) dynamicSet.add(activeProduct.badge);
    if (activeProduct.spoolType) dynamicSet.add(activeProduct.spoolType);
    for (const feat of activeProduct.features || []) {
      if (feat) dynamicSet.add(feat);
    }
  }

  for (const p of (products || []).slice(0, 18)) {
    if (!p) continue;
    dynamicSet.add(p.name);
    dynamicSet.add(`${p.brand} ${p.material}`);
    for (const feat of (p.features || []).slice(0, 4)) {
      if (feat) dynamicSet.add(feat);
    }
  }

  return Array.from(dynamicSet).slice(0, 65).join(', ');
}
