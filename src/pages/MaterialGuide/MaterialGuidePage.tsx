import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Sun, 
  Layers, 
  Search,
  Sparkles,
  Zap,
  Box,
  ChevronRight
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { FilamentProduct, LanguageCode } from '../../types';

interface MaterialGuidePageProps {
  products: FilamentProduct[];
  onSelectProduct: (product: FilamentProduct) => void;
  onFilterCategory?: (materialKey: string) => void;
  lang?: LanguageCode;
}

interface MaterialSpec {
  id: string;
  name: string;
  badge: Record<LanguageCode, string>;
  category: 'standard' | 'engineering' | 'outdoor' | 'flexible' | 'art';
  description: Record<LanguageCode, string>;
  strength: number; // 1-5
  heatResistance: string;
  uvResistance: number; // 1-5
  printDifficulty: number; // 1-5
  amsCompatible: boolean;
  chamberRequired: boolean;
  hardenedNozzle: boolean;
  nozzleTemp: string;
  bedTemp: string;
  speed: Record<LanguageCode, string>;
  bestFor: Record<LanguageCode, string[]>;
  tips: Record<LanguageCode, string>;
  matchedKeywords: string[];
}

const MATERIAL_DATABASE: MaterialSpec[] = [
  {
    id: 'pla-plus',
    name: 'High-Speed Hyper PLA / PLA+',
    badge: { 'zh-TW': '熱銷長青款', en: 'Best Seller Classic', ja: '不動のベストセラー' },
    category: 'standard',
    description: {
      'zh-TW': '改性聚乳酸，大幅提升流動性與抗衝擊韌性，支援高達 500-600 mm/s 高速列印，無翹曲、易列印，初學者與日常量產唯一推薦。',
      en: 'Modified PLA with significantly improved melt flow and impact toughness. Supports up to 600 mm/s ultra high-speed printing. Zero warping, effortless printing—the #1 choice for beginners and production.',
      ja: '改変ポリ乳酸。流動性と耐衝撃性を大幅に向上させ、最高600mm/sの超高速造形に対応。反り知らずで印刷容易、初心者から量産まで最も推奨される定番素材。'
    },
    strength: 4,
    heatResistance: '55°C - 60°C',
    uvResistance: 2,
    printDifficulty: 1,
    amsCompatible: true,
    chamberRequired: false,
    hardenedNozzle: false,
    nozzleTemp: '190°C - 230°C',
    bedTemp: '45°C - 60°C',
    speed: { 'zh-TW': '最高 600 mm/s', en: 'Up to 600 mm/s', ja: '最高 600 mm/s' },
    bestFor: {
      'zh-TW': ['日常收納盒', '快速打樣原型', '文創擺件', '機構驗證件'],
      en: ['Organizer boxes', 'Rapid prototypes', 'Figurines & Decor', 'Fit checks'],
      ja: ['日常収納ボックス', '迅速試作プロトタイプ', 'インテリア置物', '機構検証パーツ']
    },
    tips: {
      'zh-TW': '完全不需要加熱封箱，開放式機台即可列印極為平整的底面。',
      en: 'No enclosure chamber required; prints perfectly flat first layers on open-bed machines.',
      ja: '庫内加温は一切不要。オープン型プリンターでも非常にフラットで美しい底面が得られます。'
    },
    matchedKeywords: ['PLA', 'Hyper PLA', 'PLA+']
  },
  {
    id: 'petg-hf',
    name: 'PETG / PETG-HF 高流速耐衝擊',
    badge: { 'zh-TW': '戶外性價比首選', en: 'Top Outdoor Value', ja: '屋外耐候コスパNo.1' },
    category: 'outdoor',
    description: {
      'zh-TW': '具備 PLA 的易印性與接近 ABS 的抗衝擊抗溫表現，優越耐水性與耐化學清潔劑，耐熱 75°C，適合戶外水管配件與日曬外殼。',
      en: 'Combines the ease of PLA with near-ABS impact and thermal durability. Superior chemical and moisture resistance. Heat deflection up to 75°C—ideal for outdoor plumbing and sunlit brackets.',
      ja: 'PLAの印刷容易性とABS並みの耐熱・耐衝撃性を両立。耐水性・耐薬品性に優れ耐熱75°C。屋外配管パーツや直射日光の当たるケースに最適。'
    },
    strength: 4,
    heatResistance: '70°C - 80°C',
    uvResistance: 4,
    printDifficulty: 2,
    amsCompatible: true,
    chamberRequired: false,
    hardenedNozzle: false,
    nozzleTemp: '230°C - 255°C',
    bedTemp: '70°C - 85°C',
    speed: { 'zh-TW': '最高 300 mm/s', en: 'Up to 300 mm/s', ja: '最高 300 mm/s' },
    bestFor: {
      'zh-TW': ['戶外防水盒', '盆栽與水培零件', '車用掛勾', '高韌性卡扣'],
      en: ['Waterproof boxes', 'Hydroponic fittings', 'Car accessory clips', 'Snap-fit joints'],
      ja: ['屋外防水ケース', '水耕栽培パーツ', '車載フック', '高靭性スナップフィット']
    },
    tips: {
      'zh-TW': 'PETG 吸濕性略高於 PLA，開封後若有牽絲請放入乾燥箱 65°C 烘乾 4 小時。',
      en: 'Slightly hygroscopic. If stringing occurs, dry at 65°C for 4 hours in a filament dryer.',
      ja: '吸湿性はPLAよりやや高め。糸引きが発生した場合はドライボックスで65°C・4時間乾燥推奨。'
    },
    matchedKeywords: ['PETG', 'PETG-HF']
  },
  {
    id: 'pa6-cf',
    name: 'PA6-CF 航太級碳纖維尼龍',
    badge: { 'zh-TW': '工業極限強度', en: 'Industrial Max Strength', ja: '産業級・極限剛性' },
    category: 'engineering',
    description: {
      'zh-TW': '以尼龍 6 為基底複合 15%-20% 短切高剛性碳纖維，熱變形溫度高達 150°C-180°C，強度超越普通鋁合金，抗拉剛性極高且啞光零層紋。',
      en: 'Reinforced with 15-20% chopped high-modulus carbon fibers in a Nylon 6 matrix. Heat deflection up to 180°C, strength rivaling aluminum alloys, and a stunning matte finish hiding all layer lines.',
      ja: 'ポリアミド6に15〜20%の微細炭素繊維を高密度複合。熱変形温度は150°C〜180°Cに達し、アルミ合金に匹敵する強度と積層痕ゼロの高級マット質感を誇ります。'
    },
    strength: 5,
    heatResistance: '150°C - 180°C',
    uvResistance: 4,
    printDifficulty: 4,
    amsCompatible: true,
    chamberRequired: true,
    hardenedNozzle: true,
    nozzleTemp: '280°C - 300°C',
    bedTemp: '80°C - 100°C',
    speed: { 'zh-TW': '最高 200 mm/s', en: 'Up to 200 mm/s', ja: '最高 200 mm/s' },
    bestFor: {
      'zh-TW': ['無人機機架', '競技單車零件', '引擎艙耐熱支架', '工具夾具治具'],
      en: ['Drone airframes', 'Bicycle race components', 'Engine bay brackets', 'Industrial jigs'],
      ja: ['ドローン機体フレーム', '競技用自転車パーツ', 'エンジンルーム内ブラケット', '治具・固定具']
    },
    tips: {
      'zh-TW': '務必使用硬化鋼噴嘴並烘烤除濕（80°C 烘烤 8 小時），機箱建議維持 50°C 預防翹曲。',
      en: 'Requires hardened steel nozzle and pre-drying (80°C for 8 hours). Maintain 50°C chamber temp.',
      ja: '焼き入れ鋼ノズル必須。80°Cで8時間以上の事前乾燥と、50°Cの庫内保温が反り防止に不可欠です。'
    },
    matchedKeywords: ['PA-CF', 'PA6-CF', '碳纖維']
  },
  {
    id: 'tpu-95a',
    name: 'TPU 95A 高彈性耐衝擊軟料',
    badge: { 'zh-TW': '抗震防摔神器', en: 'Shock-Absorbing King', ja: '耐衝撃・防振の決定版' },
    category: 'flexible',
    description: {
      'zh-TW': '熱塑性聚氨酯彈性體，具備如輪胎般的強大回彈性、耐磨性與耐油脂性能，斷裂伸長率高達 500%，完美承受劇烈衝擊與重複彎折。',
      en: 'Thermoplastic polyurethane offering tire-like rebound, abrasion resistance, and chemical defense. Over 500% elongation at break—handles severe impacts and continuous bending.',
      ja: '熱可塑性ポリウレタンエラストマー。タイヤのような弾性反発、耐摩耗性、耐油性を持ち、破断伸びは500%以上。強烈な衝撃や屈曲疲労に耐え抜きます。'
    },
    strength: 4,
    heatResistance: '65°C - 75°C',
    uvResistance: 3,
    printDifficulty: 3,
    amsCompatible: false,
    chamberRequired: false,
    hardenedNozzle: false,
    nozzleTemp: '210°C - 230°C',
    bedTemp: '30°C - 50°C',
    speed: { 'zh-TW': '30 - 80 mm/s', en: '30 - 80 mm/s', ja: '30 - 80 mm/s' },
    bestFor: {
      'zh-TW': ['手機防摔保護殼', '無人機防撞緩衝墊', '密封防水墊圈', '減震機腳墊'],
      en: ['Phone shock cases', 'Drone bumper pads', 'Waterproof seals & gaskets', 'Vibration feet'],
      ja: ['耐衝撃スマホケース', 'ドローン衝突バンパー', '防水パッキン・ガスケット', '防振インシュレーター']
    },
    tips: {
      'zh-TW': '切勿放入 AMS 多色系統！建議關閉回抽或設為 0.4mm，慢速 40mm/s 出料最為平穩。',
      en: 'Do NOT feed into AMS! Disable or set retraction to 0.4mm; print slowly at ~40mm/s.',
      ja: 'AMSには絶対に入れないでください！リトラクションは0.4mm以下またはOFF、40mm/s前後の低速が安定します。'
    },
    matchedKeywords: ['TPU', '95A', '軟料']
  }
];

export const MaterialGuidePage: React.FC<MaterialGuidePageProps> = ({
  products,
  onSelectProduct,
  onFilterCategory,
  lang: propLang
}) => {
  const navigate = useNavigate();
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const labels = {
    'zh-TW': {
      seoTitle: '耗材百科與選材指南 | 神狗勾 3D 列印',
      seoDesc: '詳細的 3D 列印材質特性對比表，包含 PLA+、PETG、PA6-CF 碳纖維、ASA、TPU 等耗材的耐溫、強度、列印參數與最佳應用場景。',
      badge: '專業創客選材決策系統',
      title: '耗材特性全景百科 & 智能選型指南',
      desc: '不知道該買哪種材質？我們依據抗拉剛性、耐溫極限、戶外耐候性、列印難度與 AMS 相容度為您梳理完整參數矩陣，助您為專案選出最佳線材。',
      searchPlaceholder: '搜尋材質名稱、溫度、特性或用途 (如: 戶外、無人機、耐熱)...',
      allCat: '全部材質',
      standardCat: '🚀 高速量產 (PLA)',
      engineeringCat: '⚙️ 碳纖工程 (CF/尼龍)',
      outdoorCat: '☀️ 戶外耐候 (PETG/ASA)',
      flexibleCat: '💧 柔性吸震 (TPU)',
      strengthLabel: '機械強度',
      heatLabel: '耐熱溫度',
      uvLabel: '抗 UV 暴曬',
      difficultyLabel: '列印難度',
      nozzleTempLabel: '噴嘴溫度',
      bedTempLabel: '熱床溫度',
      speedLabel: '建議速度',
      amsYes: '✓ 拓竹 AMS 相容',
      amsNo: '✗ 建議外部料架',
      chamberYes: '⚠️ 建議機箱封閉',
      chamberNo: '✓ 開放式機台可印',
      hardenedYes: '⚡ 需硬化鋼噴嘴',
      bestForLabel: '適用場景與專案：',
      tipsLabel: '創客經驗談：',
      shopBtn: '選購此系列耗材'
    },
    'en': {
      seoTitle: 'Filament Guide & Material Selector | GodDog 3D',
      seoDesc: 'Comprehensive 3D printing material comparison matrix covering PLA+, PETG, PA6-CF Carbon Fiber, ASA, and TPU temps, mechanical specs, and slicer settings.',
      badge: 'Professional Maker Material Decision Matrix',
      title: 'Filament Material Guide & Matrix',
      desc: 'Unsure which filament suits your design? Compare tensile rigidity, heat deflection, weather defense, print ease, and AMS compatibility to select the ideal spool.',
      searchPlaceholder: 'Search material, temps, specs or uses (e.g., outdoor, drone, heat)...',
      allCat: 'All Materials',
      standardCat: '🚀 High-Speed PLA',
      engineeringCat: '⚙️ Carbon Fiber (CF/PA)',
      outdoorCat: '☀️ Weatherproof (PETG/ASA)',
      flexibleCat: '💧 Flexible TPU',
      strengthLabel: 'Tensile Strength',
      heatLabel: 'Heat Resistance',
      uvLabel: 'UV Defense',
      difficultyLabel: 'Print Ease',
      nozzleTempLabel: 'Nozzle Temp',
      bedTempLabel: 'Bed Temp',
      speedLabel: 'Max Speed',
      amsYes: '✓ Bambu AMS Ready',
      amsNo: '✗ Use External Holder',
      chamberYes: '⚠️ Enclosure Advised',
      chamberNo: '✓ Open Bed Friendly',
      hardenedYes: '⚡ Hardened Nozzle Needed',
      bestForLabel: 'Optimal Applications:',
      tipsLabel: 'Pro Maker Tip:',
      shopBtn: 'Shop This Filament Series'
    },
    'ja': {
      seoTitle: 'フィラメント選材ガイド・材質事典 | 神狗勾 (GodDog) 3D',
      seoDesc: 'PLA+、PETG、PA6-CFカーボン、ASA、TPU等の物性比較表。耐熱温度、機械強度、スライサー推奨値、最適な用途を完全解説。',
      badge: 'プロ仕様 メイカー選材ディシジョンマトリクス',
      title: '3Dプリント素材特性百科 & 選材ガイド',
      desc: 'どの素材を選ぶべきか迷っていませんか？引張強度・耐熱限界・耐候性・印刷難易度・AMS適性を一覧化。プロジェクトに最適な線材がすぐに見つかります。',
      searchPlaceholder: '材質名、温度、特性、用途で検索（屋外、ドローン、耐熱など）...',
      allCat: 'すべての材質',
      standardCat: '🚀 超高速PLA',
      engineeringCat: '⚙️ 炭素繊維 (CF/ナイロン)',
      outdoorCat: '☀️ 屋外耐候 (PETG/ASA)',
      flexibleCat: '💧 弾性TPU',
      strengthLabel: '機械的強度',
      heatLabel: '耐熱温度',
      uvLabel: '耐UV性',
      difficultyLabel: '印刷難易度',
      nozzleTempLabel: 'ノズル温度',
      bedTempLabel: 'ベッド温度',
      speedLabel: '推奨速度',
      amsYes: '✓ Bambu AMS対応',
      amsNo: '✗ 外部ホルダー推奨',
      chamberYes: '⚠️ 庫内保温推奨',
      chamberNo: '✓ 開放型プリンターOK',
      hardenedYes: '⚡ 焼き入れ鋼ノズル必須',
      bestForLabel: '推奨用途・活用例：',
      tipsLabel: 'メイカーの秘訣：',
      shopBtn: 'このシリーズを購入'
    }
  }[activeLang] || {
    seoTitle: '耗材百科與選材指南 | 神狗勾 3D 列印',
    seoDesc: '詳細的 3D 列印材質特性對比表，包含 PLA+、PETG、PA6-CF 碳纖維、ASA、TPU 等耗材的耐溫、強度、列印參數與最佳應用場景。',
    badge: '專業創客選材決策系統',
    title: '耗材特性全景百科 & 智能選型指南',
    desc: '不知道該買哪種材質？我們依據抗拉剛性、耐溫極限、戶外耐候性、列印難度與 AMS 相容度為您梳理完整參數矩陣。',
    searchPlaceholder: '搜尋材質名稱...',
    allCat: '全部材質',
    standardCat: '🚀 高速量產 (PLA)',
    engineeringCat: '⚙️ 碳纖工程 (CF/尼龍)',
    outdoorCat: '☀️ 戶外耐候 (PETG/ASA)',
    flexibleCat: '💧 柔性吸震 (TPU)',
    strengthLabel: '機械強度',
    heatLabel: '耐熱溫度',
    uvLabel: '抗 UV 暴曬',
    difficultyLabel: '列印難度',
    nozzleTempLabel: '噴嘴溫度',
    bedTempLabel: '熱床溫度',
    speedLabel: '建議速度',
    amsYes: '✓ 拓竹 AMS 相容',
    amsNo: '✗ 建議外部料架',
    chamberYes: '⚠️ 建議機箱封閉',
    chamberNo: '✓ 開放式機台可印',
    hardenedYes: '⚡ 需硬化鋼噴嘴',
    bestForLabel: '適用場景與專案：',
    tipsLabel: '創客經驗談：',
    shopBtn: '選購此系列耗材'
  };

  const categories = [
    { id: 'all', label: labels.allCat, icon: Compass },
    { id: 'standard', label: labels.standardCat, icon: Zap },
    { id: 'engineering', label: labels.engineeringCat, icon: Box },
    { id: 'outdoor', label: labels.outdoorCat, icon: Sun },
    { id: 'flexible', label: labels.flexibleCat, icon: Layers },
  ];

  const filteredMaterials = MATERIAL_DATABASE.filter(mat => {
    if (activeCategory !== 'all' && mat.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = mat.name.toLowerCase().includes(q);
      const matchDesc = (mat.description[activeLang] || mat.description['zh-TW']).toLowerCase().includes(q);
      const matchBest = (mat.bestFor[activeLang] || mat.bestFor['zh-TW']).some(b => b.toLowerCase().includes(q));
      return matchName || matchDesc || matchBest;
    }
    return true;
  });

  const handleShopMaterial = (mat: MaterialSpec) => {
    const matched = products.find(p => 
      mat.matchedKeywords.some(kw => 
        p.material.toLowerCase().includes(kw.toLowerCase()) || 
        p.name.toLowerCase().includes(kw.toLowerCase())
      )
    );
    if (matched) {
      onSelectProduct(matched);
    } else {
      if (onFilterCategory) {
        onFilterCategory(mat.matchedKeywords[0]);
      }
      navigate('/');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <SEO 
        title={labels.seoTitle}
        description={labels.seoDesc}
        url="/guide"
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>{labels.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {labels.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {labels.desc}
          </p>

          {/* Quick Search Input */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400 backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {/* Decorative background grid effect */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </section>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-300'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Material Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredMaterials.map((mat) => {
          const badgeText = mat.badge[activeLang] || mat.badge['zh-TW'];
          const descText = mat.description[activeLang] || mat.description['zh-TW'];
          const speedText = mat.speed[activeLang] || mat.speed['zh-TW'];
          const bestForList = mat.bestFor[activeLang] || mat.bestFor['zh-TW'];
          const tipsText = mat.tips[activeLang] || mat.tips['zh-TW'];

          return (
            <div 
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Name & Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 border border-indigo-200/50 dark:border-indigo-800">
                      {badgeText}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                      {mat.name}
                    </h2>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {descText}
                </p>

                {/* Property Meters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">{labels.strengthLabel}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div 
                          key={s} 
                          className={`h-1.5 flex-1 rounded-full ${s <= mat.strength ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">{labels.heatLabel}</span>
                    <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-[11px]">
                      {mat.heatResistance}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">{labels.uvLabel}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div 
                          key={s} 
                          className={`h-1.5 flex-1 rounded-full ${s <= mat.uvResistance ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block mb-0.5">{labels.difficultyLabel}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                      {'★'.repeat(mat.printDifficulty) + '☆'.repeat(5 - mat.printDifficulty)}
                    </span>
                  </div>
                </div>

                {/* Recommended Slicing Specs */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <div className="bg-slate-100/70 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-400 text-[10px] block font-sans">{labels.nozzleTempLabel}</span>
                    <span className="font-bold">{mat.nozzleTemp}</span>
                  </div>
                  <div className="bg-slate-100/70 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-400 text-[10px] block font-sans">{labels.bedTempLabel}</span>
                    <span className="font-bold">{mat.bedTemp}</span>
                  </div>
                  <div className="bg-slate-100/70 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-400 text-[10px] block font-sans">{labels.speedLabel}</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{speedText}</span>
                  </div>
                </div>

                {/* Compatibility Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-medium ${mat.amsCompatible ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                    {mat.amsCompatible ? labels.amsYes : labels.amsNo}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-medium ${mat.chamberRequired ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {mat.chamberRequired ? labels.chamberYes : labels.chamberNo}
                  </span>
                  {mat.hardenedNozzle && (
                    <span className="px-2 py-0.5 rounded font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      {labels.hardenedYes}
                    </span>
                  )}
                </div>

                {/* Best Applications */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {labels.bestForLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bestForList.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md text-xs font-medium">
                        • {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border-l-2 border-amber-500 p-2.5 rounded-r-lg text-xs text-amber-900 dark:text-amber-300 mb-4">
                  <span className="font-bold">{labels.tipsLabel}</span> {tipsText}
                </div>
              </div>

              {/* Action Button: Shop This Material */}
              <button
                type="button"
                onClick={() => handleShopMaterial(mat)}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-indigo-500/20 active:scale-98 cursor-pointer"
              >
                <span>{labels.shopBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
