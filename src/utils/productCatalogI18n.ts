import { LanguageCode } from '../types';

export interface ProductTranslationOverride {
  name: string;
  brand: string;
  badge?: string;
  spoolType?: string;
  weight?: string;
  nozzleTemp?: string;
  bedTemp?: string;
  maxSpeed?: string;
  description: string;
  features: string[];
}

export const PRODUCT_CATALOG_I18N: Record<string, { en: ProductTranslationOverride; ja: ProductTranslationOverride }> = {
  'maker-bambu-petg-matte': {
    en: {
      name: 'Original PETG Matte Weatherproof Filament',
      brand: 'Bambu Lab',
      badge: 'Official Matte PETG',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Official Bambu Lab PETG Matte weather-resistant 3D filament with built-in RFID smart chip. Delivers a refined low-sheen matte surface, enhanced impact toughness, UV resistance, and low-odor printing.',
      features: [
        'Upgraded impact toughness with low-glare matte finish',
        'Built-in RFID chip for automatic AMS parameter tuning',
        'Zero greasy plastic shine; hides layer lines effortlessly',
        'Low-odor safe formula ideal for outdoor functional parts'
      ]
    },
    ja: {
      name: '純正 PETG Matte マット耐候フィラメント',
      brand: 'Bambu Lab',
      badge: '純正マット耐候',
      spoolType: '耐熱リユーススプール',
      description: 'Bambu Lab純正 PETG Matte 耐候性3Dフィラメント。RFIDスマートチップ内蔵で、上品なマット質感・高耐衝撃・屋外耐UV性・低臭気造形を実現します。',
      features: [
        '耐衝撃性を強化し、反射を抑えた高級マット質感と耐候性を両立',
        '純正RFIDチップ内蔵でAMSにセットするだけで自動パラメータ認識',
        'PETG特有のテカリを解消し、積層痕が極めて目立たない仕上がり',
        '低臭気・安全設計で屋外用ブラケットや美観パーツに最適'
      ]
    }
  },
  'maker-sunlu-s4': {
    en: {
      name: 'FilaDryer S4 Pro 4-Spool Smart Filament Dryer',
      brand: 'SUNLU',
      badge: '4-Spool Dual Chamber',
      spoolType: 'Dual-Chamber 4-Spool Dryer',
      weight: '4-Spool Capacity',
      nozzleTemp: 'PTC Heating up to 70°C',
      bedTemp: 'Dual-Chamber Control',
      maxSpeed: 'Annealing & 4-Spool Drying',
      description: 'SUNLU S4 Pro 4-spool smart filament dryer featuring dual-chamber temperature control, engineering filament annealing, and simultaneous 4-roll drying while printing.',
      features: [
        'Dual-chamber independent temp control for filament annealing',
        'Dries 4 spools simultaneously; fits 1kg spools & multi-printer setups',
        'Large touchscreen displaying real-time temp and humidity',
        'Multi-port PTFE outlets for drying while high-speed printing'
      ]
    },
    ja: {
      name: 'FilaDryer S4 Pro 4スプール対応スマート乾燥機',
      brand: 'SUNLU',
      badge: '4巻同時・デュアル温調',
      spoolType: 'デュアルチャンバー4巻乾燥機',
      weight: '4スプール収納',
      nozzleTemp: 'PTC加熱 最高70°C',
      bedTemp: 'デュアルチャンバー温調',
      maxSpeed: 'アニール＆4巻同時乾燥',
      description: 'SUNLU S4 Pro 大容量4スプール対応スマートフィラメント乾燥機。デュアルチャンバー独立温度管理・エンプラアニール処理・4巻同時乾燥しながらの出力に対応。',
      features: [
        '独立デュアルチャンバー温調設計で高機能材のアニール処理に対応',
        '4巻同時乾燥が可能で1kg各種スプール・複数台プリンター給紙に対応',
        '大型タッチパネルで左右庫内の温度と湿度をリアルタイム監視',
        'マルチ方向PTFE出力ポート搭載で除湿乾燥しながら高速造形が可能'
      ]
    }
  },
  'maker-bambu-ams-feeder': {
    en: {
      name: 'AMS 4-Color Automatic Material System',
      brand: 'Bambu Lab',
      badge: 'Official 4-Color AMS',
      spoolType: 'Official 4-Slot Auto Feeder',
      weight: '4-Slot Main Unit',
      nozzleTemp: 'Auto 4-Color Switching',
      bedTemp: 'Airtight Dry Chamber',
      maxSpeed: 'RFID Smart Sync',
      description: 'Official Bambu Lab AMS 4-color automatic material system supporting multi-color printing, auto filament backup, RFID recognition, and airtight humidity control for X1 / P1 series.',
      features: [
        'Auto 4-color feeder supporting multi-color & soluble supports',
        'Built-in RFID reader auto-detects Bambu filament type & color',
        'Airtight silicone seal with desiccant slots & humidity sensor',
        'Supports auto-spool failover & cascading up to 4 units (16 colors)'
      ]
    },
    ja: {
      name: 'AMS 4色自動素材供給システム (マルチカラー対応)',
      brand: 'Bambu Lab',
      badge: '純正4色AMS',
      spoolType: '純正4スロット自動供給機',
      weight: '4スロット本体',
      nozzleTemp: '4色自動切替対応',
      bedTemp: '密閉防湿チャンバー',
      maxSpeed: 'RFIDスマート認識',
      description: 'Bambu Lab純正 AMS 4色自動供給システム。最大4巻の自動切替マルチカラー造形とフィラメント切れ自動継続、RFID読取、気密防湿構造を備え、最大4台連結で16色造形に対応。',
      features: [
        '純正4色自動給排システムで多色造形や水溶性サポート材切替に対応',
        'RFIDリーダー内蔵で純正フィラメントの材質・色・残量を自動認識',
        '密閉パッキンと乾燥剤スロット、湿度センサー内蔵で線材を乾燥保持',
        '同材質オートリレー機能搭載、Hub経由で最大4台・16色造形に対応'
      ]
    }
  },
  'maker-bambu-pla': {
    en: {
      name: 'Original PLA Basic High-Speed Filament',
      brand: 'Bambu Lab',
      badge: 'Official RFID Chip',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Official Bambu Lab PLA Basic high-speed filament with embedded RFID chip. 100% compatible with AMS for zero-tuning plug-and-play high-speed printing.',
      features: [
        'Official RFID smart chip auto-configures settings in AMS',
        'High-flow formula for smooth surfaces and strong layer bonding',
        'Tough & tangle-free with ±0.03mm precision diameter tolerance',
        'In-stock fast dispatch with free shipping on orders over NT$999'
      ]
    },
    ja: {
      name: '純正 PLA Basic 高速フィラメント (RFID搭載)',
      brand: 'Bambu Lab',
      badge: '純正RFIDチップ搭載',
      spoolType: '耐熱リユーススプール',
      description: 'Bambu Lab純正 PLA Basic 高速フィラメント。RFIDスマートチップを内蔵し、AMSにセットするだけで最適パラメータを自動設定。高速でも滑らかな仕上がりを実現します。',
      features: [
        '純正RFIDチップ内蔵でAMS4色供給システムがパラメータを自動設定',
        '高流動フォーミュラにより高速造形でも表面が滑らかで層間密着が強力',
        '折れにくく公差±0.03mmの高精度で絡まり・詰まりゼロの安定供給',
        '即日発送対応、NT$999以上のご注文で送料無料'
      ]
    }
  },
  'maker-bambu-pei': {
    en: {
      name: 'Dual-Sided Textured PEI Spring Steel Plate',
      brand: 'Bambu Lab',
      badge: 'Official PEI Plate',
      spoolType: 'Dual-Sided Textured PEI Plate',
      weight: '256x256mm',
      nozzleTemp: 'Glue-Free Adhesion',
      bedTemp: 'Heat Resistant 120°C',
      maxSpeed: 'Self-Release on Cooling',
      description: 'Official Bambu Lab dual-sided textured PEI spring steel build plate for X1 / P1P / P1S / A1 series. Delivers strong first-layer grip without glue and effortless pop-off release once cooled.',
      features: [
        'Dual-sided heavy-duty PEI powder coating for premium matte bottom texture',
        'High-strength magnetic stainless spring steel stays flat after flexing',
        'Glue-free printing for PLA, PETG, PETG Matte, ABS, and TPU',
        'Parts release automatically once the plate cools to room temperature'
      ]
    },
    ja: {
      name: '純正 両面テクスチャ PEI バネ鋼ビルドプレート',
      brand: 'Bambu Lab',
      badge: '純正PEI鋼板',
      spoolType: '純正両面テクスチャ鋼板',
      weight: '256x256mm',
      nozzleTemp: 'のり不要で直接造形',
      bedTemp: '耐熱 120°C',
      maxSpeed: '冷却後自動剥離',
      description: 'Bambu Lab X1 / P1P / P1S / A1シリーズ専用の両面テクスチャPEIバネ鋼プレート。スティックのり不要で強力な第1層定着を実現し、冷却後は軽く曲げるだけで簡単に取り外せます。',
      features: [
        '両面厚塗りPEIパウダー塗装によりモデル底面に高級マット質感を付与',
        '高強度磁性ステンレスバネ鋼コア採用で繰り返し曲げても変形なし',
        'PLA / PETG / ABS / TPUなど多様な素材をのり無しで確実に定着',
        '室温まで冷めると応力が自動解放され、軽く曲げるだけで簡単剥離'
      ]
    }
  },
  'maker-hardened-nozzle': {
    en: {
      name: '0.4mm Hardened Steel Hotend Nozzle Assembly',
      brand: 'Bambu Lab',
      badge: 'Hardened Steel Hotend',
      spoolType: 'Abrasion-Resistant Hotend',
      weight: '0.4mm Hotend',
      nozzleTemp: 'Up to 300°C',
      bedTemp: 'Hardness HRC 55+',
      maxSpeed: 'Carbon Fiber Ready',
      description: 'Heavy-duty HRC 55+ hardened steel nozzle hotend assembly engineered for abrasive carbon fiber (PLA-CF / PETG-CF / PA-CF), glass fiber, and glow-in-the-dark filaments.',
      features: [
        'Heat-treated hardened steel lasts 10x longer than brass nozzles',
        'Mirror-polished Ra < 0.4 inner bore ensures smooth clog-free flow',
        'Built for PLA-CF, PETG-CF, PA-CF, woodfill, and glow filaments',
        'Integrated heatsink hotend design for fast swap and maintenance'
      ]
    },
    ja: {
      name: '0.4mm 高耐摩耗 焼入鋼ノズル ホットエンド組立体',
      brand: 'Bambu Lab',
      badge: '焼入鋼耐摩耗ノズル',
      spoolType: '高温耐摩耗焼入鋼ホットエンド',
      weight: '0.4mm ホットエンド',
      nozzleTemp: '耐熱 300°C',
      bedTemp: '硬度 HRC 55+',
      maxSpeed: 'カーボン繊維対応',
      description: '高硬度熱処理済みの焼入鋼ノズルホットエンドアセンブリ。カーボン配合（PLA-CF / PETG-CF / PA-CF）やガラス繊維、夜光フィラメントの摩耗を防止します。',
      features: [
        '高負荷熱処理焼入鋼ノズル採用で真鍮ノズルの10倍以上の耐摩耗寿命',
        '内壁Ra < 0.4鏡面研磨により高速吐出でも詰まりにくくスムーズ',
        'PLA-CF・PETG-CF・PA-CF・ウッド・夜光など高摩耗線材に完全対応',
        '一体型ヒートシンク設計により素早い交換とメンテナンスが可能'
      ]
    }
  },
  'maker-esun-matte': {
    en: {
      name: 'ePLA-Matte Low-Sheen Aesthetic Filament',
      brand: 'eSUN',
      badge: 'Low-Glare Matte',
      spoolType: 'Eco Cardboard Spool',
      description: 'eSUN signature ePLA-Matte filament offering a soft, non-reflective matte texture that hides layer lines and makes support removal effortless for figures and art models.',
      features: [
        'Delicate matte finish eliminates plastic glare with zero sanding',
        'Stable overhangs with easy-peel breakaway support structures',
        'Standard 200mm spool compatible with Bambu AMS multi-color units',
        'Ready stock in Taiwan with rich palette options'
      ]
    },
    ja: {
      name: 'ePLA-Matte マット美観フィラメント (低積層痕)',
      brand: 'eSUN',
      badge: '低積層痕マット',
      spoolType: '環境配慮型 紙スプール',
      description: 'eSUN定番のePLA-Matteシリーズ。プラスチック特有のテカリを抑えた上品なマット質感で積層痕を隠し、サポート材も手で簡単に剥がせるフィギュア造形最適材。',
      features: [
        'きめ細かなマット質感で安っぽい光沢をなくし、研磨不要の高品質',
        'オーバーハング造形が安定し、サポート材も傷を残さず簡単に剥離',
        '標準200mmスプールでBambu AMS 4色自動供給システムに対応',
        '豊富なカラーバリエーションを国内在庫から迅速発送'
      ]
    }
  },
  'fil-01': {
    en: {
      name: 'High-Speed Hyper PLA+ Smooth Filament',
      brand: 'Polymaker',
      badge: '500mm/s Best Seller',
      spoolType: 'Eco Cardboard Spool',
      description: 'Specially formulated for Bambu Lab, Creality K1, and Voron high-speed 3D printers. Ultra-high melt flow delivers string-free, under-extrusion-free printing up to 500mm/s.',
      features: [
        'Supports up to 500mm/s high-speed printing without clogging',
        'High-mobility formula ensures rock-solid first-layer adhesion',
        'Rigid eco cardboard spool compatible with Bambu AMS',
        'Laser-checked ±0.02mm diameter tolerance in moisture-sealed bag'
      ]
    },
    ja: {
      name: 'High-Speed Hyper PLA+ 超高速フィラメント',
      brand: 'Polymaker',
      badge: '高速機ベストセラー',
      spoolType: '環境配慮型 紙スプール',
      description: 'Bambu Lab・Creality K1・Voron等の高速3Dプリンター向けに最適化。高メルトフロー設計により500mm/sの超高速でも糸引きや吐出不足を防ぎます。',
      features: [
        '最高500mm/sの高速プリントでもノズル詰まりや吐出不足なし',
        '高流動性フォーミュラで第1層の定着が安定し反りを防止',
        '高剛性エコ紙スプール採用でBambu AMS 4色システムに対応',
        'レーザー測定公差±0.02mm、防湿密封袋パッケージ封入'
      ]
    }
  },
  'fil-01b': {
    en: {
      name: 'Standard High-Toughness PLA+ 3D Filament',
      brand: 'eSUN',
      badge: 'Everyday Tough PLA+',
      spoolType: 'Eco Cardboard Spool',
      description: 'Modified impact-resistant PLA+ formula that overcomes traditional brittle PLA issues. Prints flat without warping for organizers, jigs, and everyday models.',
      features: [
        '50% higher impact toughness than standard PLA for snap-fit joints',
        'Plant-derived bio-formula with virtually odorless indoor printing',
        'Excellent overhang and bridging performance',
        'Compatible with all 1.75mm FDM 3D printers'
      ]
    },
    ja: {
      name: '高靭性 PLA+ スタンダード 3Dフィラメント',
      brand: 'eSUN',
      badge: '高靭性デイリー定番',
      spoolType: '環境配慮型 紙スプール',
      description: '耐衝撃性を高めた改質PLA+配合により、従来のPLAの脆さを大幅に改善。反りなくフラットに造形でき、収納ケースや治具、日常モデルに最適です。',
      features: [
        '通常のPLAより耐衝撃靭性が50%向上し、スナップフィットが折れにくい',
        '植物由来原料ベースで室内でも嫌な臭いがしない快適造形',
        '優れたオーバーハングおよびブリッジ造形性能',
        'すべての1.75mm FDM方式3Dプリンターに完全対応'
      ]
    }
  },
  'fil-02': {
    en: {
      name: 'PLA-CF Carbon Fiber High-Rigidity Matte Filament',
      brand: 'Bambu Lab',
      badge: 'Zero-Layer Matte CF',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Infused with 15% chopped high-modulus carbon fiber for a stealth matte carbon finish, invisible layer lines, and +45% flexural stiffness without requiring an enclosure.',
      features: [
        '45% higher flexural modulus keeps structural parts rigid',
        'Refined carbon-matte texture makes layer lines virtually invisible',
        'Ultra-low shrinkage prints reliably even on open-frame printers',
        'Recommended with 0.4mm or larger hardened steel nozzle'
      ]
    },
    ja: {
      name: 'PLA-CF カーボン繊維強化 高剛性マットフィラメント',
      brand: 'Bambu Lab',
      badge: 'カーボン消光・積層痕ゼロ',
      spoolType: '耐熱リユーススプール',
      description: '15%高弾性ショートカットカーボンファイバーを配合。高級感あふれるマットカーボン質感で積層痕を消し去り、エンクロージャー不要で高剛性パーツを造形できます。',
      features: [
        '曲げ弾性率が45%向上し、構造パーツがたわまず高剛性を維持',
        '繊細なカーボンマット外観により視覚的な積層痕がほぼゼロ',
        '超低収縮率で反りにくく、オープンフレーム機でも安定出力',
        '0.4mm以上の焼入鋼ノズルとの併用を推奨'
      ]
    }
  },
  'fil-07': {
    en: {
      name: 'PolyTerra PLA Matte Aesthetic Filament',
      brand: 'Polymaker',
      badge: 'Artisan Matte Choice',
      spoolType: 'Eco Cardboard Spool',
      description: 'Polymaker classic matte formula eliminating plastic sheen, hiding layer lines naturally, and enabling clean support removal for architectural models and figures.',
      features: [
        'Low-diffusion matte finish looks great straight off the build plate',
        'Jam-free matte formulation for consistent extrusion',
        'Ultra-clean support interface leaves crisp model details',
        'Fully compatible with Bambu Lab AMS multi-color system'
      ]
    },
    ja: {
      name: 'PolyTerra PLA Matte アートマットフィラメント',
      brand: 'Polymaker',
      badge: '芸術マット仕上げ',
      spoolType: '環境配慮型 紙スプール',
      description: 'Polymaker定番のマット配合。プラスチックの光沢を消し、積層痕が自然に目立たず、サポート材も綺麗に剥がせる建築模型・フィギュア向け素材。',
      features: [
        '低反射マット質感で研磨なしでも高級感のある仕上がり',
        '安定したマット配合でノズル詰まりなくスムーズに吐出',
        'サポート接触面が綺麗に剥がれ、エッジのディテールを鮮明に再現',
        'Bambu Lab AMS 4色自動供給システムに完全対応'
      ]
    }
  },
  'fil-08': {
    en: {
      name: 'PLA Silk Dual-Color Co-Extruded Metallic Filament',
      brand: 'Polymaker',
      badge: 'Dual-Color Silk Glow',
      spoolType: 'Eco Cardboard Spool',
      description: 'Co-axial dual-color extrusion technology shifts metallic hues as you rotate the model. Shimmers like luxurious silk for articulated dragons, vases, and art decor.',
      features: [
        'High-gloss silk metallic mirror refraction finish',
        'Dual-color co-extrusion shifts gradient tones from every angle',
        'Smooth extrusion with low shrinkage and zero curling',
        'Delivers electroplated metallic visuals without painting'
      ]
    },
    ja: {
      name: 'PLA Silk 二色共押出 シルクメタリックフィラメント',
      brand: 'Polymaker',
      badge: '2色シルク偏光沢',
      spoolType: '環境配慮型 紙スプール',
      description: '同軸二色共押出技術により、見る角度によって異なるメタリック偏光カラーへ変化。シルクのような豪華な光沢を放ち、関節ドラゴンや花瓶、装飾品に最適。',
      features: [
        'シルクのように輝く高光沢メタリック鏡面質感',
        '二色同軸構造により視角に応じて美しいグラデーション変化',
        '滑らかな吐出と低収縮設計で反りを防止',
        '塗装や研磨なしでメッキ調の金属光沢を実現'
      ]
    }
  },
  'fil-09': {
    en: {
      name: 'PLA Wood Natural Woodfiber Texture Filament',
      brand: 'Polymaker',
      badge: 'Real Wood Texture',
      spoolType: 'Eco Cardboard Spool',
      description: 'Blended with micron-grade natural wood fibers for a warm timber touch and organic grain. Finished prints can be sanded, oiled, or stained just like real wood.',
      features: [
        'Authentic wood fiber blend creates a natural matte woodgrain feel',
        'Vary nozzle temperature to achieve light-to-dark wood grain tones',
        'Supports sanding, drilling, and wood wax oil finishing',
        'Recommended with 0.4mm or 0.6mm nozzle for smooth extrusion'
      ]
    },
    ja: {
      name: 'PLA Wood 天然木質繊維 ウッド調フィラメント',
      brand: 'Polymaker',
      badge: '天然ウッド質感',
      spoolType: '環境配慮型 紙スプール',
      description: 'ミクロン単位の天然木粉繊維を配合し、温かみのある木肌と自然な木目を再現。造形後は紙やすり研磨や木工用オイル・水性ステイン塗装が可能です。',
      features: [
        '天然木質繊維配合により本物の木のようなマットな手触りを再現',
        'ノズル温度の微調整で濃淡のある木目調表現が可能',
        'ヤスリ掛け・穴あけ・蜜蝋ワックスやニス塗装の後処理に対応',
        'スムーズな吐出のため0.4mmまたは0.6mmノズルの使用を推奨'
      ]
    }
  },
  'fil-10': {
    en: {
      name: 'PLA Glow Long-Lasting Luminous Filament',
      brand: 'eSUN',
      badge: 'Long-Glow Luminous',
      spoolType: 'Eco Cardboard Spool',
      description: 'High-density rare-earth phosphorescent formula charges in 10 minutes under sunlight or UV light to emit vivid, long-lasting luminescence in the dark.',
      features: [
        'High-purity glow powder delivers bright, extended night glow',
        'Non-toxic and radiation-free; safe for nightlights & toys',
        'Warm milky white by day, vibrant neon luminescence by night',
        'Pair with a hardened steel nozzle to prevent bore wear'
      ]
    },
    ja: {
      name: 'PLA Glow 高輝度・長時間蓄光夜光フィラメント',
      brand: 'eSUN',
      badge: '長時間高輝度蓄光',
      spoolType: '環境配慮型 紙スプール',
      description: '高濃度レアアース蓄光材を配合。日光やUVライトを10分照射するだけで暗闇で鮮やかに長時間発光し、ナイトライトやキーホルダー、小道具に最適です。',
      features: [
        '高純度蓄光パウダー採用で暗所での発光輝度と持続時間が抜群',
        '無毒・非放射性でインテリア照明やトイモデルにも安心',
        '日中は温かみのあるミルキーホワイト、暗所では鮮やかなネオン発光',
        'ノズル摩耗を防ぐため焼入鋼ノズルとの併用を推奨'
      ]
    }
  },
  'fil-11': {
    en: {
      name: 'PolyLight LW-PLA Active Foaming Ultralight Filament',
      brand: 'Polymaker',
      badge: 'RC Aircraft Ultralight',
      spoolType: 'Eco Cardboard Spool',
      description: 'Active foaming lightweight PLA achieving densities down to 0.54 g/cm³—cutting part weight by nearly 50%! The top choice for RC fixed-wing planes and drone shells.',
      features: [
        '45%–50% lighter than standard PLA for lower wing loading',
        'Fine matte surface bonds easily with CA glue and hobby paints',
        'Strong interlayer adhesion keeps single-wall airfoils rigid',
        'Compatible with all mainstream desktop FDM 3D printers'
      ]
    },
    ja: {
      name: 'PolyLight LW-PLA 発泡超軽量 RC航空機用フィラメント',
      brand: 'Polymaker',
      badge: 'RC航空機軽量化専用',
      spoolType: '環境配慮型 紙スプール',
      description: 'アクティブ発泡技術により最低密度0.54 g/cm³を実現し、通常のPLA比で約50%軽量化！RC固定翼機やドローンの空力シェルに最適な超軽量素材。',
      features: [
        '従来のPLAより45%〜50%軽量化し、翼面荷重を大幅に低減',
        'きめ細かなマット表面で瞬間接着剤や模型用塗料の乗りが抜群',
        '層間結合が強く、シングルウォールの薄肉翼でも高い剛性を維持',
        '主要なデスクトップFDM 3Dプリンター各種に幅広く対応'
      ]
    }
  },
  'fil-03': {
    en: {
      name: 'PETG-HF High-Speed Weatherproof Engineering Filament',
      brand: 'Bambu Lab',
      badge: 'Anti-Stringing PETG-HF',
      spoolType: 'Eco Cardboard Spool',
      description: 'High-flow PETG-HF engineered for high-speed printing. Combines PLA printability with ABS toughness and water/UV resistance for outdoor brackets and planters.',
      features: [
        'High impact toughness & UV weather resistance without embrittlement',
        'Low-odor styrene-free formula safe for home studio printing',
        'High-speed modified resin virtually eliminates PETG stringing',
        'Fully compatible with Bambu AMS multi-color systems'
      ]
    },
    ja: {
      name: 'PETG-HF 高速耐候・耐衝撃エンジニアリング線材',
      brand: 'Bambu Lab',
      badge: '高速・糸引き防止PETG',
      spoolType: '環境配慮型 紙スプール',
      description: '高速造形向けに調整されたPETG-HF配合。PLAの扱いやすさとABSの耐衝撃・耐候性を兼ね備え、屋外ブラケットや防水ケース、プランターに最適です。',
      features: [
        '高い耐衝撃性と耐UV性を備え、屋外使用でも劣化・脆化しにくい',
        '低臭気・スチレンフリー処方で自宅スタジオでも安心造形',
        '高速改質フォーミュラにより従来のPETGの糸引きやノズル付着を激減',
        'Bambu AMSマルチカラー供給システムに完全対応'
      ]
    }
  },
  'fil-12': {
    en: {
      name: 'PETG Translucent Crystal Optical-Grade Filament',
      brand: 'Bambu Lab',
      badge: 'Crystal Light Diffuser',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Crafted from optical-grade translucent resin with superior light transmission. Prints like colored crystal glass in vase mode—ideal for LED lampshades and diffusers.',
      features: [
        'Optical-grade translucency with soft, uniform light diffusion',
        'Waterproof, moisture-resistant, and chemical cleaner tolerant',
        'Shatter-resistant toughness safely replaces fragile glass shades',
        'Optimized for seamless Vase Mode crystal lighting prints'
      ]
    },
    ja: {
      name: 'PETG Translucent 高透明クリスタル光学フィラメント',
      brand: 'Bambu Lab',
      badge: '照明・高透過専用',
      spoolType: '耐熱リユーススプール',
      description: '光学グレードの高透明原料を採用し、優れた光透過率と層間融合を実現。花瓶モード造形では色ガラスのような美しい輝きを放ち、LEDシェードに最適です。',
      features: [
        '光学グレードの高い光透過性で、光を柔らかく均一に拡散',
        '防水・防湿性に優れ、酸やアルカリ洗剤にも強い耐薬品性',
        '落としても割れにくい強靭さでガラス製シェードの代替に最適',
        '花瓶モード（Vase Mode）でのシームレスな透明造形に対応'
      ]
    }
  },
  'fil-13': {
    en: {
      name: 'PETG-CF Carbon Fiber Weatherproof Rigidity Filament',
      brand: 'Bambu Lab',
      badge: 'Zero-Stringing PETG-CF',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Blends PETG water & weather resistance with chopped carbon fiber stiffness. Eliminates PETG stringing and nozzle blobs while delivering a sleek carbon matte finish.',
      features: [
        '80°C+ heat deflection temp with outdoor UV & moisture defense',
        'Rich carbon-matte texture with zero nozzle sticking or oozing',
        'Exceptional dimensional stability with minimal shrinkage',
        'Recommended with 0.4mm / 0.6mm hardened steel nozzle'
      ]
    },
    ja: {
      name: 'PETG-CF カーボン強化 耐候・高剛性フィラメント',
      brand: 'Bambu Lab',
      badge: '耐候カーボン・糸引きゼロ',
      spoolType: '耐熱リユーススプール',
      description: 'PETGの耐水・耐候性とショートカットカーボン繊維の高剛性を融合。PETG特有の糸引きやノズル付着を解消し、ドローンや治具に最適な重厚マット質感を実現。',
      features: [
        '熱変形温度80°C以上、湿気や屋外の日差しに強い優れた耐候性',
        '高級感のあるカーボン微粒子表面でノズル付着や糸引きを完全解消',
        '寸法安定性が極めて高く、収縮や反りを最小限に抑制',
        '0.4mm / 0.6mm 焼入鋼ノズルでの造形を推奨'
      ]
    }
  },
  'fil-14': {
    en: {
      name: 'PETG-ESD Industrial Anti-Static Semiconductor Filament',
      brand: 'Polymaker',
      badge: 'ESD Safe Cleanroom',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Maintains stable surface resistivity of 10⁶–10⁹ Ω/sq to protect sensitive electronics from electrostatic discharge (ESD). Built for PCB fixtures, wafer carriers, and cleanrooms.',
      features: [
        'Industrial ESD compliance protects ICs and precision PCBs',
        'Uniform carbon nanotube dispersion—permanent ESD with zero dusting',
        'Low outgassing, high dimensional accuracy & IPA wipe resistant',
        'Prints reliably without requiring a heated chamber'
      ]
    },
    ja: {
      name: 'PETG-ESD 工業用帯電防止 半導体・電子治具線材',
      brand: 'Polymaker',
      badge: 'ESD帯電防止・電子治具',
      spoolType: '耐熱リユーススプール',
      description: '表面抵抗率10⁶〜10⁹ Ω/sqを安定維持し、静電気放電（ESD）から精密電子部品を保護。半導体ウェハキャリア、PCB検査治具、クリーンルーム用途の標準素材。',
      features: [
        '工業ESD規格準拠でICチップや精密基板を静電気破壊から保護',
        'カーボンナノチューブ均一複合により粉落ち汚染ゼロで永久帯電防止',
        '低アウトガス・高寸法精度でIPAアルコール清拭にも対応',
        '高温チャンバー不要で安定した成形が可能'
      ]
    }
  },
  'fil-05': {
    en: {
      name: 'ABS-GF Glass Fiber High-Temp Engineering Filament',
      brand: 'Bambu Lab',
      badge: '100°C Heat & Warp Free',
      spoolType: 'High-Temp Reusable Spool',
      description: 'High-toughness ABS reinforced with micron glass fibers for 100°C heat resistance. The fiberglass skeleton prevents traditional ABS cooling cracks and warping.',
      features: [
        'Withstands 100°C heat—won’t soften inside hot summer car cabins',
        'Glass fiber reinforcement slashes internal stress & cracking',
        'Superior electrical insulation and high flexural strength',
        'Recommended for enclosed printers (X1C / P1S / K1 / Voron)'
      ]
    },
    ja: {
      name: 'ABS-GF ガラス繊維強化 高耐熱エンジニアリング線材',
      brand: 'Bambu Lab',
      badge: '耐熱100°C・反り防止',
      spoolType: '耐熱リユーススプール',
      description: '高靭性ABSにミクロンガラス繊維を複合し、熱変形温度100°Cを達成。ガラス繊維骨格が冷却収縮や層間割れを抑制し、車載パーツや構造治具に最適です。',
      features: [
        '耐熱100°Cを誇り、真夏の車内高温環境でも軟化・変形しない',
        'ガラス繊維が内部応力を大幅に低減し、大型パーツの割れを防止',
        '優れた電気絶縁性と高い曲げ強度を両立',
        '密閉型プリンター（X1C / P1S / K1等）での造形を推奨'
      ]
    }
  },
  'fil-15': {
    en: {
      name: 'PolyLite ASA Extreme UV Weatherproof Filament',
      brand: 'Polymaker',
      badge: 'Outdoor UV Champion',
      spoolType: 'High-Temp Reusable Spool',
      description: '10x the UV and weather resistance of standard ABS. Never yellows or turns brittle under harsh sun and rain—ideal for exterior auto trim, weather stations, and mounts.',
      features: [
        'Top-tier UV-stabilized formula resists outdoor chalking & cracking',
        '95°C–100°C heat resistance with strong mechanical durability',
        'Fine matte finish supports acetone vapor smoothing',
        'Print in an enclosed chamber for maximum layer bonding'
      ]
    },
    ja: {
      name: 'PolyLite ASA 超耐UV・屋外耐候エンジニアリング線材',
      brand: 'Polymaker',
      badge: '屋外耐UVベストチョイス',
      spoolType: '耐熱リユーススプール',
      description: '従来のABSの10倍の耐紫外線・耐候性能を実現。長期間の屋外露出でも黄変や脆化を起こさず、自動車外装パーツや百葉箱、屋外カメラマウントに最適です。',
      features: [
        '最高峰の耐UV処方により長期間の直射日光でも劣化・ひび割れなし',
        '耐熱95°C〜100°C、優れた機械的強度と耐衝撃性を兼備',
        'きめ細かなマット表面でアセトン蒸気スムージング処理にも対応',
        '最高の層間密着を得るため密閉型チャンバー機での造形を推奨'
      ]
    }
  },
  'fil-16': {
    en: {
      name: 'PC-ABS Industrial Alloy High-Impact Heat Filament',
      brand: 'Polymaker',
      badge: 'Heavy-Impact Alloy',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Combines the extreme impact and heat resistance of Polycarbonate (PC) with the printability of ABS. Widely used for automotive trim, power tool housings, and armor.',
      features: [
        'Ultra-high notched impact strength survives heavy drops & strikes',
        '105°C heat deflection temperature keeps dimensions stable',
        'Smooth surface ready for electroplating or automotive painting',
        'Requires an enclosed constant-temperature 3D printer'
      ]
    },
    ja: {
      name: 'PC-ABS 工業用ポリマーアロイ 超耐衝撃・高耐熱線材',
      brand: 'Polymaker',
      badge: '工業合金・超耐衝撃',
      spoolType: '耐熱リユーススプール',
      description: 'ポリカーボネート（PC）の超高耐衝撃・耐熱性とABSの優れた成形加工性を融合。自動車内外装、電動工具ハウジング、工業用プロテクターに最適。',
      features: [
        '極めて高いノッチ付き衝撃強度により、落下や強打でも割れない',
        '熱変形温度105°Cに達し、高温環境下でも高い寸法安定性を維持',
        '緻密な表面仕上げでメッキ加工や塗装処理にも好適',
        '密閉型保温チャンバーを備えた3Dプリンターでの造形が必要'
      ]
    }
  },
  'fil-04': {
    en: {
      name: 'PolyFlex TPU 95A High-Speed Elastic Flexible Filament',
      brand: 'Polymaker',
      badge: 'Shock-Absorbing TPU',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Shore 95A high-rebound flexible filament with exceptional tear and oil resistance. Perfect for FPV drone bumpers, phone cases, vibration dampers, and seals.',
      features: [
        'Over 500% elongation at break withstands repeated flexing',
        'Ultra-tight layer fusion ensures airtight & waterproof prints',
        'Low-friction surface feeds smoothly in direct-drive extruders',
        'Resistant to oils, greases, solvents, and heavy abrasion'
      ]
    },
    ja: {
      name: 'PolyFlex TPU 95A 高速・高反発フレキシブル軟質線材',
      brand: 'Polymaker',
      badge: '耐衝撃・防振軟質材',
      spoolType: '耐熱リユーススプール',
      description: 'ショア硬度95Aの高反発フレキシブル素材。耐摩耗・耐油・耐引裂性に優れ、FPVドローンバンパー、スマホケース、防振インシュレーター、パッキンに最適。',
      features: [
        '破断伸び500%以上で繰り返し折り曲げても破断しない高耐久性',
        '層間融合が極めて強固で、気密性・防水性に優れたパーツ造形が可能',
        '表面摩擦係数を改善し、ダイレクト押出機で絡まずスムーズに供給',
        '油汚れ・化学溶剤・摩耗に対する高い耐性'
      ]
    }
  },
  'fil-17': {
    en: {
      name: 'TPU 85A Ultra-Soft Shock-Absorbing Rubber Filament',
      brand: 'Polymaker',
      badge: '85A Ultra-Soft Rubber',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Shore 85A ultra-low hardness elastomer with a supple silicone-like feel. Ideal for wearable braces, custom orthotic insoles, soft robotic grippers, and gaskets.',
      features: [
        'Shore 85A ultra-soft touch with rapid compression recovery',
        'Superior tear strength that stays flexible in freezing temps',
        'Best printed slowly on a Direct Drive extruder',
        'Feed directly from an external spool holder (bypass long PTFE tubes)'
      ]
    },
    ja: {
      name: 'TPU 85A 超柔軟・高弾性ショック吸収ラバー線材',
      brand: 'Polymaker',
      badge: '85A極軟ラバー感触',
      spoolType: '耐熱リユーススプール',
      description: 'ショア硬度85Aの超低硬度エラストマー。シリコンや天然ゴムのようなしなやかさを持ち、ウェアラブルサポーター、インソール、ソフトグリッパー、防水パッキンに最適。',
      features: [
        'ショア85Aの極軟タッチで圧縮後の反発回復が早く永久歪みなし',
        '超高引裂強度を備え、低温環境でも硬化せず柔軟性を維持',
        'ダイレクトドライブ押出機での低速プリントを推奨',
        '外部スプールホルダーからの直接給紙を推奨（AMS非対応）'
      ]
    }
  },
  'fil-18': {
    en: {
      name: 'TPU 64D Semi-Rigid Heavy-Duty Wear-Resistant Filament',
      brand: 'Polymaker',
      badge: 'Heavy-Duty Roller TPU',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Shore 64D semi-rigid polyurethane elastomer combining structural support with extreme TPU wear & impact resistance for rollers, bushings, and bumpers.',
      features: [
        'Shore 64D high hardness feeds stiffly with high print success',
        'Outwears standard Nylon and ABS by multiples in friction tests',
        'Impervious to mineral oils, greases, and industrial solvents',
        'Bombproof layer adhesion resists high-load shear forces'
      ]
    },
    ja: {
      name: 'TPU 64D セミリジッド高硬度・高耐摩耗ウレタン線材',
      brand: 'Polymaker',
      badge: '高耐摩耗ローラー・駆動用',
      spoolType: '耐熱リユーススプール',
      description: 'ショア64Dの半硬質ポリウレタンエラストマー。エンプラの構造支持力とTPUの超耐摩耗・耐衝撃性を兼備し、高負荷ローラー、ブッシュ、バンパーに最適。',
      features: [
        'ショア64Dの高硬度により給紙時のコシが強く、高い造形成功率',
        '一般的なナイロンやABSを数倍上回る圧倒的な耐摩耗性能',
        '鉱物油・グリース・工業用溶剤に対する優れた耐薬品性',
        '層間結合が極めて強固で高負荷のせん断力にも破断しない'
      ]
    }
  },
  'fil-19': {
    en: {
      name: 'PolyMide PA6-CF Carbon Fiber Reinforced Nylon (180°C)',
      brand: 'Polymaker',
      badge: 'Metal Replacement PA6-CF',
      spoolType: 'High-Temp Reusable Spool',
      description: '20% high-modulus carbon fiber reinforced PA6 nylon with Warp-Free technology and 180°C+ heat deflection. Replaces aluminum jigs, gears, and under-hood auto parts.',
      features: [
        '180°C heat resistance built for engine bays & high-temp jigs',
        'Extreme tensile & flexural modulus replaces CNC metal parts',
        'Proprietary Warp-Free tech prevents nylon cooling distortion',
        'Requires hardened steel nozzle and active filament drying'
      ]
    },
    ja: {
      name: 'PolyMide PA6-CF カーボン強化ナイロン (耐熱180°C)',
      brand: 'Polymaker',
      badge: '準金属代替・超高剛性',
      spoolType: '耐熱リユーススプール',
      description: '20%高弾性カーボンファイバー複合PA6ナイロン。Warp-Free反り防止技術を搭載し、熱変形温度180°C以上を実現。アルミ治具や自動車エンジンルーム部品の代替に。',
      features: [
        '耐熱180°Cを誇り、エンジンルーム周辺や高温治具に最適',
        '超高引張強度と曲げ弾性率で金属パーツの軽量化代替を実現',
        '独自の低内部応力処方により純ナイロンの冷却反り問題を大幅改善',
        '焼入鋼ノズル必須、フィラメント乾燥機からの給紙を推奨'
      ]
    }
  },
  'fil-20': {
    en: {
      name: 'PolyMide PA12-CF Ultra-Low Moisture Aerospace Carbon Nylon',
      brand: 'Polymaker',
      badge: 'Low-Moisture Aerospace PA12',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Long-chain PA12 nylon composite with carbon fiber featuring 1/5th the moisture absorption of PA6. Keeps rock-solid dimensions and strength even in humid climates.',
      features: [
        'Ultra-low moisture uptake keeps mechanical specs stable in humidity',
        'Silky stealth carbon-black finish hides layer lines completely',
        'Superior chemical, motor oil, and fatigue resistance',
        'Trusted for industrial drone arms and robotic end-effectors'
      ]
    },
    ja: {
      name: 'PolyMide PA12-CF 超低吸水・航空宇宙級カーボンナイロン',
      brand: 'Polymaker',
      badge: '超低吸水・高寸法安定',
      spoolType: '耐熱リユーススプール',
      description: '長鎖PA12ナイロンにカーボン繊維を複合し、吸水率をPA6の5分の1に抑制。多湿な環境下でも極めて高い寸法安定性と機械的強度を維持します。',
      features: [
        '超低吸湿性により湿度変化の大きい環境でも寸法と強度が極めて安定',
        'きめ細かなマットカーボンブラックで積層痕がほぼ見えない仕上がり',
        '耐薬品性・耐エンジンオイル性・耐疲労靭性に優れる',
        '産業用ドローンアームや精密ロボットハンドの指定素材'
      ]
    }
  },
  'fil-21': {
    en: {
      name: 'PolyMide PA6-GF Glass Fiber Insulated Nylon Filament',
      brand: 'Polymaker',
      badge: 'Insulated Tough PA6-GF',
      spoolType: 'High-Temp Reusable Spool',
      description: '25% glass fiber reinforced nylon offering high stiffness, 160°C+ heat resistance, and 100% electrical insulation (non-conductive) for battery packs and HV enclosures.',
      features: [
        'High dielectric insulation safe for EV battery & electronics housings',
        '25% fiberglass reinforcement resists creep & heat up to 160°C+',
        'Dimensionally stable and dyeable for custom part color-coding',
        'Requires a hardened steel nozzle for printing'
      ]
    },
    ja: {
      name: 'PolyMide PA6-GF ガラス繊維強化 高剛性・絶縁ナイロン',
      brand: 'Polymaker',
      badge: '高絶縁・耐衝撃ナイロン',
      spoolType: '耐熱リユーススプール',
      description: '25%ガラス繊維強化ナイロン。高剛性・160°C以上の耐熱性に加え、カーボン不含のため完全な電気絶縁性を持ち、バッテリーホルダーや高圧電装ケースに最適。',
      features: [
        '高い絶縁耐力を備え、電子機器やバッテリーモジュール筐体に安全',
        'ガラス繊維強化により耐衝撃・耐クリープ性に優れ、耐熱160°C以上',
        '反りにくく寸法が安定し、造形後の染色加工にも対応',
        '焼入鋼ノズルを使用して造形してください'
      ]
    }
  },
  'fil-22': {
    en: {
      name: 'PolyMide CoPA Pure Nylon PA6/66 Self-Lubricating Filament',
      brand: 'Polymaker',
      badge: 'Self-Lubricating Gear PA',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Pure PA6/66 copolymer nylon featuring natural self-lubricating low friction and extreme fatigue toughness—the #1 choice for planetary gears, worms, and bushings.',
      features: [
        'Naturally self-lubricating surface for quiet, long-life gear meshing',
        'Extreme toughness resists cracking and organic solvents/oils',
        'Low-warp copolymer formula prints far easier than standard nylon',
        'Recommend drying in SUNLU S4 dryer before and during printing'
      ]
    },
    ja: {
      name: 'PolyMide CoPA 純ナイロン PA6/66 自己潤滑・耐摩耗線材',
      brand: 'Polymaker',
      badge: '自己潤滑・高耐摩耗ギア用',
      spoolType: '耐熱リユーススプール',
      description: '純ナイロン共重合フォーミュラにより、天然の自己潤滑性（低摩擦係数）と驚異的な耐疲労靭性を実現。遊星ギア、ウォームギア、軸受ブッシュ、強力スナップに最適。',
      features: [
        '自己潤滑性を持つ表面によりギアの噛み合いが静かで長寿命',
        '超高靭性で割れにくく、有機溶剤や機械油にも優れた耐性',
        '低反り共重合処方により従来の純ナイロンよりも造形が容易',
        '造形時はSUNLU S4等の乾燥機からの防湿給紙を推奨'
      ]
    }
  },
  'fil-23': {
    en: {
      name: 'PolyMax PC Aerospace Polycarbonate High-Impact Filament',
      brand: 'Polymaker',
      badge: 'Bulletproof Tough 115°C',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Engineering-modified Polycarbonate (PC) delivering bulletproof-glass impact resistance and 115°C heat deflection for high-temp lighting housings and protective shields.',
      features: [
        'Withstands 115°C continuous heat without softening or deforming',
        'Bulletproof-grade impact strength survives extreme force',
        'Tuned rheology prints cleanly in enclosed desktop printers',
        'Validated for flame-retardant and high-load engineering duties'
      ]
    },
    ja: {
      name: 'PolyMax PC 航空宇宙級ポリカーボネート 耐熱・耐衝撃線材',
      brand: 'Polymaker',
      badge: '防弾級耐衝撃・耐熱115°C',
      spoolType: '耐熱リユーススプール',
      description: 'エンジニアリング改質ポリカーボネート（PC）。防弾ガラス級の耐衝撃靭性と115°Cの高熱変形温度を備え、高温照明ハウジングや機械保護カバー、車載マウントに最適。',
      features: [
        '耐熱115°Cに達し、高温環境下でも軟化せず高い剛性を維持',
        '極めて高い耐衝撃強度により強い外部衝撃を受けても破砕しない',
        '流動特性を改良し、密閉型デスクトップ機で割れずに安定造形可能',
        '難燃性および高強度エンジニアリング検証済み'
      ]
    }
  },
  'fil-24': {
    en: {
      name: 'PP Polypropylene Chemical-Resistant Living Hinge Filament',
      brand: 'Polymaker',
      badge: 'Living Hinge & Acid Proof',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Ultralight Polypropylene (0.90 g/cm³) offering unmatched acid/alkali resistance and fatigue life—living hinges and snap-latches bend 10,000+ times without breaking.',
      features: [
        'Resists strong acids, alkalis & solvents for labware & piping',
        'Bends 10,000+ cycles without fatigue for one-piece living hinges',
        'Floats on water with zero moisture absorption',
        'Apply PP packing tape on the build plate for optimal first-layer grip'
      ]
    },
    ja: {
      name: 'PP ポリプロピレン 耐酸アルカリ・一体ヒンジ用線材',
      brand: 'Polymaker',
      badge: '耐薬品・一体成形ヒンジ',
      spoolType: '耐熱リユーススプール',
      description: '密度わずか0.90 g/cm³の超軽量ポリプロピレン（PP）。強酸・強アルカリへの耐性と卓越した耐屈曲疲労性を備え、一体成形ヒンジは1万回開閉しても破断しません。',
      features: [
        '強酸・強アルカリ・有機溶剤に強く、理化学容器や配管パーツに最適',
        '繰り返し曲げ疲労に極めて強く、一体型ヒンジ収納ケースに最適',
        '水に浮く超低密度で吸水率はほぼゼロ',
        'ビルドプレートにPP透明テープを貼ることで第1層が確実に定着'
      ]
    }
  },
  'fil-25': {
    en: {
      name: 'PolyDissolve S1 PVA Water-Soluble Support Filament (0.5kg)',
      brand: 'Polymaker',
      badge: 'Water-Soluble Zero Scars',
      spoolType: 'Eco Cardboard Spool',
      description: 'Water-soluble PVA support filament built for Bambu AMS and dual-extruder printers. Dissolves completely in tap water for scar-free internal cavities and overhangs.',
      features: [
        'Dissolves in room-temp or warm water—zero manual support picking',
        'Enables 0mm support Z-distance for glass-smooth overhang bottoms',
        'Unlocks complex internal channels, ball joints & hollow geometry',
        'Store in a drybox immediately after unsealing'
      ]
    },
    ja: {
      name: 'PolyDissolve S1 PVA 水溶性マルチカラー専用サポート材',
      brand: 'Polymaker',
      badge: '水溶性・サポート痕ゼロ',
      spoolType: '環境配慮型 紙スプール',
      description: 'Bambu AMSおよびデュアルヘッド機向けに開発された水溶性サポート材（PVA）。PLA / PETG / TPU / PAと併用でき、水に浸すだけで完全に溶けてサポート痕を残しません。',
      features: [
        '常温またはぬるま湯で完全に溶解し、手作業でのサポート除去が不要',
        'サポートZ距離0mm設定が可能で、オーバーハング底面も滑らかに造形',
        '複雑な内部流路・ボールジョイント・中空構造の造形課題を解決',
        '開封後は防湿ドライボックス内で保管・使用してください'
      ]
    }
  },
  'fil-26': {
    en: {
      name: 'PEEK / PEI (Ultem 1010) 220°C+ Aerospace Medical Filament',
      brand: 'Aerospace Grade',
      badge: '220°C+ UL94-V0 Aerospace',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Apex pyramid engineering polymer rated for 210°C–240°C continuous service with inherent UL94-V0 flame retardancy for aerospace, medical autoclave, and semiconductor jigs.',
      features: [
        '220°C+ continuous service temp with native UL94-V0 flame rating',
        'Survives steam autoclave sterilization & harsh chemical baths',
        'Strength-to-weight ratio rivals machined aerospace aluminum',
        'Requires a 380°C+ nozzle and actively heated chamber printer'
      ]
    },
    ja: {
      name: 'PEEK / PEI (Ultem 1010) 220°C+ 航空宇宙・医療級線材',
      brand: '特殊エンジニアリング',
      badge: '航空宇宙超高耐熱・V0難燃',
      spoolType: '耐熱リユーススプール',
      description: 'エンプラ最高峰の特殊ポリマー。連続使用温度210°C〜240°C、UL94-V0自己消火性および耐薬品性を備え、航空宇宙・半導体高温治具・医療滅菌用途に対応。',
      features: [
        '連続耐熱220°C以上、UL94-V0難燃グレードを標準達成',
        '高圧蒸気滅菌（オートクレーブ）や強酸・強アルカリ環境に耐える',
        '極めて高い比強度と寸法安定性で精密金属部品を代替',
        'ノズル380°C以上および高温加熱チャンバーを備えた産業機が必要'
      ]
    }
  },
  'fil-06': {
    en: {
      name: '8K High-Precision Low-Odor Water-Washable UV Resin (1kg)',
      brand: 'Anycubic',
      badge: '8K Micron Figure Resin',
      spoolType: 'UV-Blocking Bottle (1000g)',
      nozzleTemp: 'Working Temp 20°C - 30°C',
      bedTemp: '405nm UV Curing',
      maxSpeed: '1.8s - 2.5s / Layer',
      description: 'Formulated for 8K / 12K / 14K LCD resin printers. Ultra-low shrinkage and low viscosity capture micron-level hair strands, skin pores, and miniature armor textures.',
      features: [
        '8K/12K micron resolution renders razor-sharp miniature details',
        'Low viscosity ensures fast reflow and high release success rates',
        'Mild low-odor formula cures to a ceramic-smooth paintable finish',
        'Compatible with all 365nm–405nm LCD and DLP resin printers'
      ]
    },
    ja: {
      name: '8K 高精度・低臭気 水洗いUV光造形レジン (1000g)',
      brand: 'Anycubic',
      badge: '8K極細ディテール造形',
      spoolType: 'UV遮光ボトル (1000g)',
      nozzleTemp: '推奨室温 20°C - 30°C',
      bedTemp: '405nm UV光硬化',
      maxSpeed: '1.8秒 - 2.5秒 / 層',
      description: '8K / 12K / 14K 高解像度LCD光造形プリンター専用開発。超低収縮率と高い流動性により、ミクロン単位の髪の毛や肌の質感、ミニチュアの装甲ディテールを精密再現。',
      features: [
        '8K/12K級のミクロン高解像度成形でフィギュアの極細ディテールを再現',
        '低粘度・高流動性によりFEPフィルムからの離型がスムーズで高成功率',
        '低臭気マイルド処方で、硬化後は陶器のように滑らかで塗装しやすい',
        '365nm〜405nmの全LCD / DLP方式光造形機に対応'
      ]
    }
  },
  'fil-27': {
    en: {
      name: 'Tough ABS-Like High-Impact Engineering UV Resin (1kg)',
      brand: 'Anycubic',
      badge: 'Drop-Resistant & Drillable',
      spoolType: 'UV-Blocking Bottle (1000g)',
      nozzleTemp: 'Working Temp 20°C - 30°C',
      bedTemp: '405nm UV Curing',
      maxSpeed: '2.0s - 2.8s / Layer',
      description: 'Overcomes brittle standard resin with ABS-like impact strength and flex. Snap-fits and articulated joints won’t shatter, and parts can be drilled and tapped directly.',
      features: [
        'High impact & elongation—models survive accidental table drops',
        'Supports drilling, thread tapping & action figure joint assembly',
        'Low shrinkage accuracy ideal for functional enclosures & prototypes',
        'Refined matte surface holds primer and hobby paints tenaciously'
      ]
    },
    ja: {
      name: 'Tough ABSライク 高靭性・耐衝撃エンジニアリングレジン',
      brand: 'Anycubic',
      badge: '耐落下・穴あけタップ対応',
      spoolType: 'UV遮光ボトル (1000g)',
      nozzleTemp: '推奨室温 20°C - 30°C',
      bedTemp: '405nm UV光硬化',
      maxSpeed: '2.0秒 - 2.8秒 / 層',
      description: '一般的な光造形レジンの脆さを克服し、ABS並みの耐衝撃靭性と曲げ耐性を実現。薄肉スナップや可動関節が割れにくく、直接の穴あけ・ねじ切り加工にも対応。',
      features: [
        '高い耐衝撃性と破断伸びを備え、誤って落としても割れにくい',
        '穴あけ・タップ加工・可動フィギュア関節の組み立てでも欠けにくい',
        '低収縮・高精度でエンジニアリング筐体試作やガレージキットに必須',
        'きめ細かなマット表面でサーフェイサーや塗料の密着性が抜群'
      ]
    }
  },
  'acc-01': {
    en: {
      name: 'FilaDryer S2 360° Touch Smart Filament Dryer Box',
      brand: 'SUNLU',
      badge: '360° Surround Drying',
      spoolType: '360° Surround Heater Box',
      weight: 'Single-Spool Dryer',
      nozzleTemp: 'Temp Control 35°C - 70°C',
      bedTemp: 'Dual Top/Bottom Heaters',
      maxSpeed: 'Print While Drying',
      description: 'SUNLU S2 360° dual-heater surround drying box reaching 70°C with a large circular LED touchscreen and live humidity readout. Revives damp PLA, PETG, TPU, and Nylon.',
      features: [
        '360° top-and-bottom surround heating dries 2x faster & evenly',
        'Large LED touchscreen with one-tap presets for major filaments',
        'Built-in smooth rollers & PTFE ports for drying while printing',
        'Eliminates moisture popping, stringing, bubbles & rough surfaces'
      ]
    },
    ja: {
      name: 'FilaDryer S2 360°全方位加熱 スマート乾燥ボックス',
      brand: 'SUNLU',
      badge: '360°全方位除湿加熱',
      spoolType: '360°全方位加熱ドライボックス',
      weight: '1スプール乾燥機',
      nozzleTemp: '温度調整 35°C - 70°C',
      bedTemp: '上下ダブルヒーター搭載',
      maxSpeed: '乾燥しながら出力対応',
      description: 'SUNLU S2 360°上下全方位加熱式フィラメント乾燥機。最高70°C対応、大型円形LEDタッチスクリーンと湿度計を搭載し、吸湿したPLA / PETG / TPU / ナイロンを復活させます。',
      features: [
        '上下360°全方位均一加熱により、昇温スピードと除湿効率が2倍向上',
        '大型LEDタッチパネル搭載、素材別ワンタッチ推奨温度・時間プリセット内蔵',
        '滑らかなローラーとガイド穴を備え、乾燥しながらのプリントに完全対応',
        '湿気によるパチパチ音・気泡・糸引き・表面荒れを徹底解消'
      ]
    }
  },
  'acc-02': {
    en: {
      name: 'Dual-Sided Textured PEI Magnetic Spring Steel Plate (257mm)',
      brand: 'Maker Gear',
      badge: 'High-Value PEI Upgrade',
      spoolType: 'Dual-Sided Textured PEI Plate',
      weight: '257x257mm',
      nozzleTemp: 'Heat Resistant 180°C',
      bedTemp: 'Glue-Free Printing',
      maxSpeed: 'Auto Pop-Off Release',
      description: '257x257mm magnetic spring steel plate fully compatible with Bambu Lab X1C / P1S / P1P / A1. Dual-sided thick gold PEI coating grips tightly and pops models off when cool.',
      features: [
        'Reversible dual-sided gold PEI coating doubles service lifespan',
        'High-elasticity magnetic spring steel flexes and snaps back flat',
        'Zero glue needed for rock-solid PLA, PETG, and TPU first layers',
        'Imparts an even, professional matte textured finish to bottom layers'
      ]
    },
    ja: {
      name: '両面テクスチャ PEI 磁性バネ鋼プレート (257x257mm X1/P1/A1対応)',
      brand: 'メイカーパーツ',
      badge: '高コスパPEIアップグレード',
      spoolType: '両面テクスチャバネ鋼板',
      weight: '257x257mm',
      nozzleTemp: '耐熱 180°C',
      bedTemp: 'のり塗布不要',
      maxSpeed: '冷却後自動剥離',
      description: 'Bambu Lab X1C / P1S / P1P / A1に完全対応する257x257mm規格。両面に厚塗りゴールドPEIテクスチャ塗装を施し、強力な定着と冷却後の簡単剥離を実現。',
      features: [
        '表裏両面とも使用可能で、耐摩耗PEIコーティングにより長寿命',
        '高弾性マグネットバネ鋼を採用し、曲げて取り外した後も瞬時に平面復帰',
        'PLA / PETG / TPUの第1層がのり無しで強固に密着',
        'モデル底面に均一で美しいマットサンドテクスチャを付与'
      ]
    }
  },
  'acc-03': {
    en: {
      name: '0.4mm / 0.6mm Hardened Steel Nozzle Kit (CF & Glow Ready)',
      brand: 'Maker Gear',
      badge: 'Carbon Fiber Essential',
      spoolType: 'HRC55+ Hardened Steel Nozzle',
      weight: 'Nozzle Combo Kit',
      nozzleTemp: 'Max Temp 450°C',
      bedTemp: 'Precision CNC Machined',
      maxSpeed: 'Polished High-Flow Bore',
      description: 'Quenched HRC 55+ hardened steel nozzle combo kit engineered to resist heavy abrasion from carbon fiber (CF), glass fiber (GF), wood, and glow-in-the-dark filaments.',
      features: [
        'HRC 55+ hardened steel offers 15x the wear life of brass nozzles',
        'Ra < 0.4 polished inner wall minimizes retraction drag & clogs',
        'Precision concentric chamfered orifice lays down clean extrusion lines',
        'Includes both 0.4mm (detail) and 0.6mm (high-flow CF) nozzles'
      ]
    },
    ja: {
      name: '0.4mm / 0.6mm 高耐摩耗 焼入鋼ノズルセット (CF・夜光対応)',
      brand: 'メイカーパーツ',
      badge: 'カーボン造形必須パーツ',
      spoolType: 'HRC55+ 焼入鋼ノズル',
      weight: '2口径セット',
      nozzleTemp: '最高耐熱 450°C',
      bedTemp: '精密CNC旋削加工',
      maxSpeed: '高流動内孔鏡面研磨',
      description: '硬度HRC 55以上の高温焼入鋼ノズルセット。カーボンファイバー（CF）、ガラス繊維（GF）、木質、夜光フィラメントによる摩耗を防ぎ、長期間口径を維持します。',
      features: [
        'HRC 55+高硬度焼入鋼により真鍮ノズルの15倍以上の耐摩耗寿命',
        '内壁Ra < 0.4鏡面仕上げでリトラクション抵抗と詰まりを大幅に低減',
        '精密な同心円面取りオリフィスにより均一で美しい押出ラインを実現',
        '精密造形用0.4mmと大流量複合材用0.6mmの2種類を同梱'
      ]
    }
  },
  'fil-28': {
    en: {
      name: 'eSUN ABS+ High-Toughness Low-Warp Engineering Filament (1kg)',
      brand: 'eSUN',
      badge: 'Low-Warp Tough ABS+',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Modified high-toughness ABS+ formulated to cut shrinkage and odor versus standard ABS. Delivers 35% higher impact strength and 90°C heat resistance for functional housings and mechanical brackets.',
      features: [
        'Low-odor modified formula reduces indoor printing fumes',
        'Reduced thermal shrinkage minimizes warping & layer splitting',
        '90°C heat deflection; supports acetone vapor smoothing',
        '±0.02mm laser-calibrated diameter; enclosed printer recommended'
      ]
    },
    ja: {
      name: 'eSUN ABS+ 高靭性・低反り・低臭気エンジニアリング線材 (1kg)',
      brand: 'eSUN',
      badge: '低反り・高靭性ABS+',
      spoolType: '耐熱リユーススプール',
      description: '従来のABSより収縮反りと臭気を大幅に低減した改質ABS+。耐衝撃強度35%向上、耐熱90°Cを実現し、機能部品やメカニカル筐体に最適です。',
      features: [
        '低揮発・低臭気改質処方で室内プリントの不快感を軽減',
        '低収縮と層間密着強化により大型モデルでも層間剥離しにくい',
        '耐熱約90°C、アセトン蒸気による表面鏡面仕上げに対応',
        'レーザー計測±0.02mm精度、密閉型チャンバープリンター推奨'
      ]
    }
  },
  'fil-29': {
    en: {
      name: 'Bambu Lab PLA Basic Spool-less Refill Pack 1.75mm (with RFID)',
      brand: 'Bambu Lab',
      badge: 'Eco Spool-less Refill',
      spoolType: 'Spool-less Refill Pack',
      description: 'Genuine Bambu Lab PLA Basic spool-less refill pack with factory RFID tag. Snaps onto reusable Bambu spools in 10 seconds to cut plastic waste and save on high-volume color printing.',
      features: [
        'Embedded Bambu RFID chip auto-loads color and print profiles in AMS',
        'Drops straight onto Bambu Reusable Spools in 10 seconds',
        'Supports up to 500mm/s high-speed printing with rich satin colors',
        'Reduces spool waste while keeping costs lower for heavy makers'
      ]
    },
    ja: {
      name: 'Bambu Lab PLA Basic リフィル補充パック 1.75mm (RFID付)',
      brand: 'Bambu Lab',
      badge: 'エコ詰替えパック',
      spoolType: 'リフィル補充用パック',
      description: 'Bambu Lab純正PLA Basicのスプールレス詰替えパック（純正RFIDチップ付）。再利用可能スプールに10秒で装着でき、プラスチック廃棄物とコストを同時に削減します。',
      features: [
        '純正RFIDタグ内蔵によりAMS装着時にカラーと造形設定を自動認識',
        'Bambu純正再利用スプールへ10秒で簡単にセット可能',
        '最高500mm/s高速プリント対応、発色が鮮やかで靭性も優秀',
        '空スプール廃棄を減らし、多色大量造形ユーザーに最も経済的'
      ]
    }
  },
  'fil-30': {
    en: {
      name: 'GodDog Eco Cardboard Spool Hyper PLA+ 1.75mm (600mm/s)',
      brand: 'GodDog',
      badge: 'Sealed Rim Cardboard Spool',
      spoolType: 'Eco Cardboard Spool',
      description: 'Reinforced dust-sealed rim cardboard spool loaded with GodDog 600mm/s Hyper PLA+. Runs smoothly in AMS rollers without paper dust while offering unbeatable daily value.',
      features: [
        'Hardened sealed-rim cardboard spool prevents paper dust in AMS',
        '600mm/s high-melt-flow formula prints sharp corners without gaps',
        'Toughened PLA+ blend resists snapping during long storage',
        'Taiwan ready stock packed in moisture-barrier sealed bags'
      ]
    },
    ja: {
      name: 'GodDog 環境配慮紙スプール 高速 Hyper PLA+ 1.75mm',
      brand: 'GodDog',
      badge: '紙粉防止エッジ・AMS対応',
      spoolType: '環境配慮型 紙スプール',
      description: 'エッジ硬化コーティングを施した紙スプール採用の600mm/s高速Hyper PLA+。AMSローラー上で紙粉が出ず滑らかに回転し、毎日の造形に最適な高コスパを実現。',
      features: [
        '硬化エッジ処理済み紙スプールで紙屑が出ずAMSにそのまま対応',
        '600mm/s高流動配合により高速コーナー造形でも欠け・糸引きゼロ',
        '耐衝撃改質PLA+により保管中の脆性破断を防止',
        '防湿密封袋パックで工場出荷状態を維持したままお届け'
      ]
    }
  },
  'fil-31': {
    en: {
      name: 'Polymaker PolyTerra PLA Marble Stone Matte Filament 1.75mm',
      brand: 'Polymaker',
      badge: 'Stone Finish Zero Layer Lines',
      spoolType: 'Eco Cardboard Spool',
      description: 'Infused with fine natural mineral speckles to replicate authentic Carrara marble texture. Ultra-matte surface hides layer lines completely for architectural models and sculpture art.',
      features: [
        'Uniform mineral speckles flow smoothly through standard 0.4mm nozzles',
        'Ultra-matte stone-like surface renders sculptures seamless',
        'Signature PolyTerra easy-snap supports leave clean overhangs',
        '100% recycled cardboard spool supporting global reforestation'
      ]
    },
    ja: {
      name: 'Polymaker PolyTerra PLA 大理石ストーンマット線材 1.75mm',
      brand: 'Polymaker',
      badge: '天然石風質感・積層痕ゼロ',
      spoolType: '環境配慮型 紙スプール',
      description: '厳選天然ミネラル粒子を配合し、本物のカラーラ大理石のような斑点模様と極上マット質感を再現。彫像、花瓶、建築模型で積層痕を完全に隠します。',
      features: [
        '均一なミネラル粒子設計で標準0.4mmノズルでも目詰まりなく造形',
        '石膏彫刻のような超マット表面が側面の積層痕を徹底カバー',
        'サポート材が手で軽く折れるように綺麗に剥がれる設計',
        '100%再生紙スプール採用、1本販売ごとに植林活動へ貢献'
      ]
    }
  },
  'fil-32': {
    en: {
      name: 'GodDog Tri-Color Silk Co-Extrusion PLA 1.75mm (360° Metallic)',
      brand: 'GodDog',
      badge: '3-Color 360° Shimmer',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Precision three-strand co-extrusion blends gold, magenta, and cyan silk into a single filament—even single-nozzle printers create dazzling iridescent color shifts from every angle.',
      features: [
        'Three-way co-extrusion shifts hues dramatically as you rotate parts',
        'Mirror-like metallic silk luster straight off the build plate',
        'Reinforced interlayer bonding prevents delamination on vases & dragons',
        'Vacuum sealed; print outer walls at 50–120mm/s for peak gloss'
      ]
    },
    ja: {
      name: 'GodDog 3色シルク共押出 PLA Silk Tri-Color 1.75mm',
      brand: 'GodDog',
      badge: '単線3色360°金属光沢',
      spoolType: '耐熱リユーススプール',
      description: 'ゴールド・マゼンタ・シアンの3色シルクを1本に精密共押出！マルチカラー機がなくても、シングルノズル機で角度によって色が変わる幻想的な金属光沢モデルが出力できます。',
      features: [
        '精密3色共押出構造により、見る角度に応じてドラマチックに変色',
        '後加工や研磨なしで鏡面のようなメタリックシルク光沢を実現',
        '層間密着を強化し、ドラゴンや花瓶モデルでも割れにくい',
        '外周速度50〜120mm/s設定で最も鮮やかな金属光沢を発揮'
      ]
    }
  },
  'fil-33': {
    en: {
      name: 'Polymaker PolyLite PETG-HF High-Speed Translucent Weatherproof',
      brand: 'Polymaker',
      badge: 'High-Speed Low-String PETG',
      spoolType: 'Eco Cardboard Spool',
      description: 'Next-gen high-flow PETG-HF engineered to eliminate nozzle sticking and stringing at 350mm/s+ speeds while preserving 78°C heat resistance and outdoor UV/weather durability.',
      features: [
        'Tuned high-melt-flow rheology extrudes cleanly up to 350mm/s',
        'Drastically reduces oozing, blobbing & nozzle buildup',
        '78°C heat deflection with moisture, UV & chemical resistance',
        'Crystal-rich colors ideal for light diffusers and outdoor mounts'
      ]
    },
    ja: {
      name: 'Polymaker PolyLite PETG-HF 高速・高透明・高耐候線材 1.75mm',
      brand: 'Polymaker',
      badge: '高速PETG・糸引き低減',
      spoolType: '環境配慮型 紙スプール',
      description: '次世代高流動PETG-HF配合。350mm/s以上の高速印刷時でもノズル付着や糸引きを大幅に抑制しつつ、78°Cの耐熱性と屋外耐UV・耐候性を維持します。',
      features: [
        '高速機向けに粘度を最適化し、350mm/sでも安定した吐出を実現',
        '従来PETGの課題だった糸引きとサポート癒着を大幅改善',
        '耐熱78°Cに加え防水・耐UV・耐薬品性に優れる',
        'ランプシェード・機械カバー・屋外固定具に最適'
      ]
    }
  },
  'fil-34': {
    en: {
      name: 'eSUN ePETG-Matte Impact & Weather Resistant Matte PETG 1.75mm',
      brand: 'eSUN',
      badge: 'Industrial Matte PETG',
      spoolType: 'Eco Cardboard Spool',
      description: 'Replaces glossy plastic sheen with a refined industrial matte finish. ePETG-Matte combines outdoor UV durability and impact toughness with much cleaner bridging and less stringing.',
      features: [
        'Satin-matte surface hides layer lines for injection-molded looks',
        'UV-resistant and waterproof for long-term outdoor enclosures',
        'Far less stringing and nozzle carbon buildup than glossy PETG',
        'Prints reliably on open or enclosed printers without warping'
      ]
    },
    ja: {
      name: 'eSUN ePETG-Matte マット艶消し・高耐衝撃・耐候性線材 1.75mm',
      brand: 'eSUN',
      badge: '工業級マットPETG',
      spoolType: '環境配慮型 紙スプール',
      description: '従来の光沢あるPETGから脱却し、上品な工業用マット仕上げを実現。屋外耐UV性・防水性と高耐衝撃性を兼ね備え、糸引きも大幅に抑えています。',
      features: [
        '繊細なマット質感で積層痕が目立たず、射出成形品のような仕上がり',
        '耐UV性と防水性を備え、屋外設置ケースでも劣化しにくい',
        '光沢PETGに比べてノズル周りのこびりつきや糸引きが大幅に少ない',
        'エンクロージャー不要で各種FDMプリンターで反りなく安定造形'
      ]
    }
  },
  'fil-35': {
    en: {
      name: 'Polymaker PolySonic PLA-CF High-Speed Carbon Fiber 1.75mm',
      brand: 'Polymaker',
      badge: 'High-Speed Carbon Fiber',
      spoolType: 'Eco Cardboard Spool',
      description: 'Combines PolySonic high-flow chemistry with short-chopped carbon fiber so you can print rigid CF parts at up to 300mm/s with stealthy matte carbon aesthetics.',
      features: [
        'High-speed CF rheology prints up to 300mm/s without under-extrusion',
        'High flexural modulus ideal for drone frames, jigs & rigid brackets',
        'Stealth matte carbon texture conceals layer seams almost completely',
        'Use with a 0.4mm or 0.6mm hardened steel nozzle to prevent wear'
      ]
    },
    ja: {
      name: 'Polymaker PolySonic PLA-CF 高速・高剛性カーボン複合材 1.75mm',
      brand: 'Polymaker',
      badge: '超高速カーボンファイバー',
      spoolType: '環境配慮型 紙スプール',
      description: 'PolySonic高流動技術と短繊維カーボンを融合し、カーボン複合材でありながら最高300mm/sの高速出力に対応。優れた曲げ剛性と重厚なカーボンマット質感を実現。',
      features: [
        '高速高流動カーボン処方で従来CF材の速度制限を突破',
        '高い曲げ弾性率と寸法安定性でドローンフレームや治具に最適',
        '積層痕をほぼ消すシックなマットカーボンテクスチャ',
        'ノズル摩耗を防ぐため0.4mm/0.6mm焼入鋼ノズルの使用を推奨'
      ]
    }
  },
  'fil-36': {
    en: {
      name: 'eSUN eTPU-95A HF High-Speed Flexible Shockproof Filament 1.75mm',
      brand: 'eSUN',
      badge: 'High-Speed Non-Tangling TPU',
      spoolType: 'High-Temp Reusable Spool',
      description: 'Tuned for direct-drive high-speed extruders, eTPU-95A HF prints up to 3x faster than standard flexible filament with extreme tear resistance and shock absorption.',
      features: [
        'Shore 95A hardness balances soft cushioning with crisp feeding',
        'High-flow blend resists extruder gear tangling up to 150mm/s',
        'Oil, abrasion, and seawater resistant for drone bumpers & gaskets',
        'Note: Feed from an external spool holder rather than inside AMS'
      ]
    },
    ja: {
      name: 'eSUN eTPU-95A HF 高速・高反発・耐摩耗フレキシブル材 1.75mm',
      brand: 'eSUN',
      badge: '高速ダイレクト給紙TPU',
      spoolType: '耐熱リユーススプール',
      description: 'ダイレクト式高速エクストルーダー向けに最適化されたeTPU-95A HF。従来軟質フィラメント比3倍の造形速度と優れた引裂耐性・衝撃吸収性を発揮します。',
      features: [
        'ショア硬度95Aにより、柔軟なクッション性とスムーズな押出を両立',
        '最高150mm/sの高速印刷でもギア絡みや詰まりが起きにくい高流動配合',
        '耐油・耐摩耗・耐候性に優れ、ドローンガード・パッキン・保護ケースに最適',
        '（軟質材のためAMSには入れず外部スプールホルダーからの給紙を推奨）'
      ]
    }
  },
  'fil-37': {
    en: {
      name: 'Anycubic Plant-Based Eco Low-Odor 8K UV Resin (1000g)',
      brand: 'Anycubic',
      badge: 'Soy Plant-Based Low Odor',
      spoolType: 'UV-Blocking Eco Bottle (1000g)',
      nozzleTemp: 'Working Temp 20°C - 30°C',
      bedTemp: '405nm UV Curing',
      maxSpeed: '1.8s - 2.4s / Layer',
      description: 'Formulated from renewable soybean oil for minimal indoor odor while achieving razor-sharp 8K/12K micron resolution and ultra-low shrinkage for seamless multi-part assembly.',
      features: [
        'Bio-based soy resin formula dramatically lowers fumes indoors',
        'Ultra-low shrinkage keeps keyed miniature joints fitting tightly',
        'Cures to a dry, non-tacky finish easy to sand and airbrush',
        'Compatible with all 365nm–405nm desktop LCD resin printers'
      ]
    },
    ja: {
      name: 'Anycubic 植物由来バイオ 8K低臭気UVレジン (1000g)',
      brand: 'Anycubic',
      badge: '大豆バイオ・超低臭気',
      spoolType: 'UV遮光エコボトル (1000g)',
      nozzleTemp: '推奨室温 20°C - 30°C',
      bedTemp: '405nm UV光硬化',
      maxSpeed: '1.8秒 - 2.4秒 / 層',
      description: '天然大豆油由来のバイオ原料を採用し、室内の臭気を大幅に抑えた環境配慮型レジン。8K/12K級の高精細ディテールと極めて低い硬化収縮率を両立しています。',
      features: [
        '大豆バイオ処方により揮発臭が少なく室内作業でも快適',
        '極めて低い収縮率により分割フィギュアのダボ結合がぴったり密着',
        '二次硬化後の表面がべたつかず、ヤスリ掛けやエアブラシ塗装が容易',
        '365nm〜405nmの各種デスクトップLCD光造形機に対応'
      ]
    }
  },
  'acc-04': {
    en: {
      name: '10-Pack Filament Vacuum Storage Bags + USB-C Electric Pump + Desiccant Kit',
      brand: 'Maker Gear',
      badge: 'Humidity Defense Kit',
      spoolType: 'Heavy-Duty Double-Zip Vacuum Set',
      weight: '10 Bags + USB Pump + Silica',
      nozzleTemp: 'Fits 1kg & 0.5kg Spools',
      bedTemp: '30x34cm Double-Seal Bags',
      maxSpeed: '15s Electric Vacuum Seal',
      description: 'Complete moisture protection for humid climates: 10 puncture-resistant vacuum bags, a 1-touch USB-C electric vacuum pump, and 10 reusable color-indicating silica desiccant packs.',
      features: [
        '10 thick PA+PE double-zipper bags reusable across dozens of cycles',
        'USB-C rechargeable electric vacuum pump seals bags in 15 seconds',
        '10 orange-to-green indicating silica gel packs (oven rechargeable)',
        'Fits all 1kg/0.5kg spools—essential storage for Nylon, PETG & PLA'
      ]
    },
    ja: {
      name: 'フィラメント防湿真空バッグ 10枚＋USB電動ポンプ＋再生乾燥剤セット',
      brand: 'メイカーパーツ',
      badge: '湿気対策スターター一式',
      spoolType: '厚手ダブルチャック真空袋セット',
      weight: '真空袋10枚+電動ポンプ+乾燥剤',
      nozzleTemp: '1kg / 0.5kg スプール対応',
      bedTemp: '30x34cm 大型ダブルジッパー',
      maxSpeed: 'USB-C 15秒自動排気',
      description: '湿度の高い環境に最適なフィラメント完全防湿セット！破れにくい厚手真空袋10枚、USB-C充電式電動吸引ポンプ、電子レンジ等で再生可能な変色シリカゲル乾燥剤10個を同梱。',
      features: [
        'PA+PE多層厚手ダブルジッパー真空袋×10枚、繰り返し何度でも密閉可能',
        'USB-C充電式ワンタッチ電動ポンプ付属でわずか15秒で真空パック完了',
        '吸湿状態が色でわかるオレンジ変色乾燥剤10袋付（加熱再生で再利用可）',
        '市販の全1kg/0.5kgスプールに対応し、ナイロン・PETG・PLA長期保管に必須'
      ]
    }
  },
  'acc-05': {
    en: {
      name: 'High-Flow PTFE Bowden Tube 2m + Precision Flush Cutter Maintenance Kit',
      brand: 'Maker Gear',
      badge: 'AMS Maintenance Essential',
      spoolType: 'OD4mm x ID2.5mm High-Flow Kit',
      weight: '2m PTFE + Cutter + Needles',
      nozzleTemp: 'AMS / K1 / Direct-Drive Fit',
      bedTemp: 'Includes Nozzle Needles',
      maxSpeed: '40% Lower Feed Friction',
      description: 'Routine high-speed printer & AMS maintenance bundle featuring 2m of widened ID 2.5mm low-friction PTFE tubing, hardened steel flush cutters for 45° filament tips, and 0.4mm cleaning needles.',
      features: [
        'OD 4.0mm / ID 2.5mm slick PTFE tube (2m) slashes AMS retraction friction',
        'Precision hardened-steel flush cutters trim clean 45° filament tips & supports',
        'Includes 0.4mm stainless steel nozzle unclogging needles & pneumatic couplers',
        'Periodic tube replacement prevents AMS feed-error pauses mid-print'
      ]
    },
    ja: {
      name: '低摩擦PTFEテフロンチューブ 2m＋精密ニッパー メンテナンスセット',
      brand: 'メイカーパーツ',
      badge: 'AMS定期保守キット',
      spoolType: '外径4mm・内径2.5mm 高通量仕様',
      weight: '2mチューブ+ニッパー+清掃針',
      nozzleTemp: 'AMS / K1 / ダイレクト機汎用',
      bedTemp: 'ノズル掃除針・継手付属',
      maxSpeed: '給紙抵抗 40%低減',
      description: '高速プリンターおよびBambu AMSシステム向けの定期保守キット。内径2.5mmの高純度・低摩擦PTFEチューブ2mに加え、精密フラッシュニッパーと0.4mmノズル清掃針をセット。',
      features: [
        '外径4.0mm/内径2.5mmの低抵抗PTFEチューブ2mでAMS給紙エラーを大幅低減',
        'フィラメント先端の45°カットやサポート除去に最適な精密鋼製ニッパー',
        '0.4mmステンレス製ノズルクリーニングニードルとワンタッチ継手を同梱',
        '摩耗したチューブの定期交換により高速多色プリントの安定性を維持'
      ]
    }
  }
};

export const EXACT_COLOR_I18N: Record<string, { zh: string; en: string; ja: string }> = {
  '消光極地白 Matte White': { zh: '消光極地白', en: 'Matte White', ja: 'マットホワイト' },
  '消光柠檬黃 Matte Yellow': { zh: '消光檸檬黃', en: 'Matte Yellow', ja: 'マットイエロー' },
  '消光暖杏色 Matte Cream': { zh: '消光暖杏色', en: 'Matte Cream', ja: 'マットクリーム' },
  '消光活力橘 Matte Orange': { zh: '消光活力橘', en: 'Matte Orange', ja: 'マットオレンジ' },
  '消光海洋藍 Matte Blue': { zh: '消光海洋藍', en: 'Matte Ocean Blue', ja: 'マットオーシャンブルー' },
  '極夜黑 Pro': { zh: '極夜黑 Pro', en: 'Midnight Black Pro', ja: 'ミッドナイトブラック Pro' },
  '拓竹原廠標準版 (4盤位)': { zh: '拓竹原廠標準版 (4盤位)', en: 'Bambu Original (4-Slot)', ja: 'Bambu純正標準版 (4スロット)' },
  '拓竹綠 Bambu Green': { zh: '拓竹綠', en: 'Bambu Green', ja: 'バンブーグリーン' },
  '玉石白 Jade White': { zh: '玉石白', en: 'Jade White', ja: 'ジェイドホワイト' },
  '曜石黑 Black': { zh: '曜石黑', en: 'Obsidian Black', ja: 'オブシディアンブラック' },
  '猩紅 Scarlet Red': { zh: '猩紅', en: 'Scarlet Red', ja: 'スカーレットレッド' },
  '紋理金 Textured Gold': { zh: '紋理金', en: 'Textured Gold', ja: 'テクスチャゴールド' },
  '石墨黑 Textured Black': { zh: '石墨黑', en: 'Textured Black', ja: 'テクスチャブラック' },
  '0.4mm 硬化鋼黑': { zh: '0.4mm 硬化鋼黑', en: '0.4mm Hardened Steel', ja: '0.4mm 焼入鋼ブラック' },
  '0.6mm 硬化鋼黑': { zh: '0.6mm 硬化鋼黑', en: '0.6mm Hardened Steel', ja: '0.6mm 焼入鋼ブラック' },
  '杏仁白 Almond White': { zh: '杏仁白', en: 'Almond White', ja: 'アーモンドホワイト' },
  '深海藍 Deep Blue': { zh: '深海藍', en: 'Deep Blue', ja: 'ディープブルー' },
  '抹茶綠 Matcha Green': { zh: '抹茶綠', en: 'Matcha Green', ja: '抹茶グリーン' },
  '莫蘭迪灰 Matte Gray': { zh: '霧面灰', en: 'Matte Gray', ja: 'マットグレー' },
  '極致霧黑 Matte Black': { zh: '極致霧黑', en: 'Matte Black', ja: 'マットブラック' },
  '極致純白 Cold White': { zh: '極致純白', en: 'Cold White', ja: 'コールドホワイト' },
  '太空槍灰 Space Gray': { zh: '太空槍灰', en: 'Space Gray', ja: 'スペースグレー' },
  '賽車極速紅 Racing Red': { zh: '賽車極速紅', en: 'Racing Red', ja: 'レーシングレッド' },
  '科技深海藍 Royal Blue': { zh: '科技深海藍', en: 'Royal Blue', ja: 'ロイヤルブルー' },
  '曜石黑 Obsidian': { zh: '曜石黑', en: 'Obsidian Black', ja: 'オブシディアンブラック' },
  '暖象牙白 Warm Ivory': { zh: '暖象牙白', en: 'Warm Ivory', ja: 'ウォームアイボリー' },
  '森林軍綠 Forest Green': { zh: '森林軍綠', en: 'Forest Green', ja: 'フォレストグリーン' },
  '暖暖亮黃 Sunshine Yellow': { zh: '暖暖亮黃', en: 'Sunshine Yellow', ja: 'サンシャインイエロー' },
  '消光碳素黑 Stealth Black': { zh: '消光碳素黑', en: 'Stealth Carbon Black', ja: 'ステルスマットブラック' },
  '玄武岩深灰 Basalt Gray': { zh: '玄武岩深灰', en: 'Basalt Gray', ja: 'バサルトグレー' },
  '燕麥淺杏 Almond Cream': { zh: '燕麥淺杏', en: 'Almond Cream', ja: 'アーモンドクリーム' },
  '莫蘭迪鼠尾草綠 Sage Green': { zh: '鼠尾草綠', en: 'Sage Green', ja: 'セージグリーン' },
  '煙燻灰藍 Dusty Blue': { zh: '煙燻灰藍', en: 'Dusty Blue', ja: 'ダスティブルー' },
  '極啞碳黑 Matte Deep Black': { zh: '極啞碳黑', en: 'Matte Deep Black', ja: 'ディープマットブラック' },
  '金藍雙色 Gold-Blue': { zh: '金藍雙色', en: 'Gold-Blue Dual', ja: 'ゴールド＆ブルー2色' },
  '紅黑雙色 Red-Black': { zh: '紅黑雙色', en: 'Red-Black Dual', ja: 'レッド＆ブラック2色' },
  '紫金雙色 Purple-Gold': { zh: '紫金雙色', en: 'Purple-Gold Dual', ja: 'パープル＆ゴールド2色' },
  '原木白樺 Birch Wood': { zh: '原木白樺', en: 'Birch Wood', ja: 'バーチウッド (白樺)' },
  '深焙胡桃 Walnut Wood': { zh: '深焙胡桃', en: 'Walnut Wood', ja: 'ウォールナット (胡桃)' },
  '極光螢光綠 Glow Green': { zh: '極光螢光綠', en: 'Glow Green', ja: '蓄光グリーン' },
  '星空極地藍 Glow Blue': { zh: '星空極地藍', en: 'Glow Blue', ja: '蓄光ブルー' },
  '航模純白 Pure White': { zh: '航模純白', en: 'Pure White', ja: 'ピュアホワイト' },
  '消光空軍灰 Airforce Gray': { zh: '消光空軍灰', en: 'Airforce Gray', ja: 'エアフォースグレー' },
  '曜石黑 Solid Black': { zh: '曜石黑', en: 'Solid Black', ja: 'ソリッドブラック' },
  '純淨白 Pure White': { zh: '純淨白', en: 'Pure White', ja: 'ピュアホワイト' },
  '深海藍 Ocean Blue': { zh: '深海藍', en: 'Ocean Blue', ja: 'オーシャンブルー' },
  '工程橘 Safety Orange': { zh: '工程橘', en: 'Safety Orange', ja: 'セーフティオレンジ' },
  '冰透純晶 Ice Clear': { zh: '冰透純晶', en: 'Ice Clear', ja: 'アイスクリア' },
  '冰透寶藍 Translucent Blue': { zh: '冰透寶藍', en: 'Translucent Blue', ja: 'トランスルーセントブルー' },
  '冰透翠綠 Translucent Green': { zh: '冰透翠綠', en: 'Translucent Green', ja: 'トランスルーセントグリーン' },
  '深炭岩石黑 Carbon Black': { zh: '深炭岩石黑', en: 'Carbon Black', ja: 'カーボンブラック' },
  '消光鈦晶灰 Titanium Gray': { zh: '消光鈦晶灰', en: 'Titanium Gray', ja: 'チタニウムグレー' },
  '防靜電深炭黑 ESD Black': { zh: '防靜電深炭黑', en: 'ESD Carbon Black', ja: 'ESD帯電防止ブラック' },
  '軍規霧黑 Tactical Black': { zh: '軍規霧黑', en: 'Tactical Black', ja: 'タクティカルブラック' },
  '工業水泥灰 Industrial Gray': { zh: '工業水泥灰', en: 'Industrial Gray', ja: 'インダストリアルグレー' },
  '深曜黑 Deep Black': { zh: '深曜黑', en: 'Deep Black', ja: 'ディープブラック' },
  '消光水泥灰 Concrete Gray': { zh: '消光水泥灰', en: 'Concrete Gray', ja: 'コンクリートグレー' },
  '工業霧黑 Matte Industrial Black': { zh: '工業霧黑', en: 'Matte Industrial Black', ja: 'マットインダストリアルブラック' },
  '科技銀灰 Metallic Silver': { zh: '科技銀灰', en: 'Metallic Silver', ja: 'メタリックシルバー' },
  '活力亮橘 Safety Orange': { zh: '活力亮橘', en: 'Safety Orange', ja: 'セーフティオレンジ' },
  '半透磨砂白 Semi-Clear': { zh: '半透磨砂白', en: 'Semi-Clear Frosted', ja: 'セミクリアフロスト' },
  '消光極黑 Matte Black': { zh: '消光極黑', en: 'Matte Black', ja: 'マットブラック' },
  '冰川青藍 Glacier Cyan': { zh: '冰川青藍', en: 'Glacier Cyan', ja: 'グレイシャーシアン' },
  '曜石酷黑 Obsidian Black': { zh: '曜石酷黑', en: 'Obsidian Black', ja: 'オブシディアンブラック' },
  '工程純白 Industrial White': { zh: '工程純白', en: 'Industrial White', ja: 'インダストリアルホワイト' },
  '曜石深黑 Industrial Black': { zh: '曜石深黑', en: 'Industrial Black', ja: 'インダストリアルブラック' },
  '航太碳素黑 Carbon Black': { zh: '航太碳素黑', en: 'Aerospace Carbon Black', ja: 'エアロスペースカーボンブラック' },
  '消光曜炭黑 Stealth Carbon': { zh: '消光曜炭黑', en: 'Stealth Carbon', ja: 'ステルスカarbon' },
  '工業灰 Industrial Gray': { zh: '工業灰', en: 'Industrial Gray', ja: 'インダストリアルグレー' },
  '本色米白 Natural': { zh: '本色米白', en: 'Natural Ivory', ja: 'ナチュラルアイボリー' },
  '本色半透白 Natural': { zh: '本色半透白', en: 'Natural Translucent', ja: 'ナチュラルトランスルーセント' },
  '深曜黑 Black': { zh: '深曜黑', en: 'Deep Black', ja: 'ディープブラック' },
  '光學高透晶 Clear': { zh: '光學高透晶', en: 'Optical Clear', ja: 'オプティカルクリア' },
  '本色半透明 Natural Translucent': { zh: '本色半透明', en: 'Natural Translucent', ja: 'ナチュラル半透明' },
  '水溶淡黃白 Soluble Natural': { zh: '水溶淡黃白', en: 'Soluble Natural', ja: '水溶性ナチュラル' },
  '琥珀原色 Amber Natural': { zh: '琥珀原色', en: 'Amber Natural', ja: 'アンバーナチュラル' },
  '手辦素模灰 Model Gray': { zh: '手辦素模灰', en: 'Figure Model Gray', ja: 'フィギュアモデルグレー' },
  '象牙雕刻白 Ivory White': { zh: '象牙雕刻白', en: 'Sculpting Ivory White', ja: 'スカルプトアイボリーホワイト' },
  '工程霧灰 Engineering Gray': { zh: '工程霧灰', en: 'Engineering Gray', ja: 'エンジニアリンググレー' },
  '深曜黑 Onyx Black': { zh: '深曜黑', en: 'Onyx Black', ja: 'オニキスブラック' },
  '經典黑曜款 Black': { zh: '經典黑曜款', en: 'Classic Obsidian Black', ja: 'クラシックブラック' },
  '雙面紋理金 Gold PEI': { zh: '雙面紋理金', en: 'Dual-Sided Gold PEI', ja: '両面テクスチャゴールドPEI' },
  '淬火黑鋼 0.4mm+0.6mm 組': { zh: '淬火黑鋼 0.4+0.6mm 組', en: 'Hardened 0.4+0.6mm Set', ja: '焼入鋼 0.4+0.6mm セット' },
  '卡拉拉白大理石 Carrara Marble': { zh: '卡拉拉白大理石', en: 'Carrara Marble', ja: 'カラーラ大理石ホワイト' },
  '金紫青幻彩 Gold-Magenta-Cyan': { zh: '金紫青幻彩', en: 'Gold-Magenta-Cyan Tri-Color', ja: 'ゴールド・マゼンタ・シアン3色' },
  '10袋+電動泵+乾燥劑全配組': { zh: '10袋+電動泵+乾燥劑全配組', en: '10 Bags + Electric Pump + Silica Kit', ja: '真空袋10枚+電動ポンプ+乾燥剤セット' },
  '標準維護套組 (2m導管+剪鉗)': { zh: '標準維護套組 (2m導管+剪鉗)', en: '2m PTFE + Flush Cutter Kit', ja: '2mチューブ+ニッパー保守セット' },
  '標準規格': { zh: '標準規格', en: 'Standard Spec', ja: '標準仕様' }
};
