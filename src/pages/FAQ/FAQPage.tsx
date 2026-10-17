import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Flame,
  ShieldCheck,
  Sparkles,
  Cpu
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { LanguageCode } from '../../types';

interface FAQPageProps {
  lang?: LanguageCode;
}

interface FAQItem {
  category: 'printing' | 'materials' | 'hardware' | 'shipping_payment';
  q: string;
  a: string;
}

const FAQS_DATA: Record<LanguageCode, {
  seoTitle: string;
  seoDesc: string;
  badge: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  clearSearch: string;
  allCat: string;
  printingCat: string;
  materialsCat: string;
  hardwareCat: string;
  shippingCat: string;
  noFaqFound: string;
  noFaqDesc: string;
  items: FAQItem[];
}> = {
  'zh-TW': {
    seoTitle: '3D 列印常見問題百科 (FAQ) 與故障排查指南',
    seoDesc: '最完整的 3D 列印常見問題解答庫：翹邊、牽絲、噴嘴堵塞、AMS 多色調校、PLA/PETG 材質特性與金流物流完整說明。',
    badge: '神狗勾創客知識庫 • 故障排除中心',
    title: '3D 列印常見問題百科 (FAQ)',
    subtitle: '匯集台灣創客最常遇到的列印疑難雜症、切片參數調校心法、材料特性與購物售後解答。',
    searchPlaceholder: '搜尋問題關鍵字（如：翹邊、牽絲、堵料、AMS、PETG、免運...）',
    clearSearch: '清除',
    allCat: '全部問題',
    printingCat: '列印故障排查',
    materialsCat: '耗材特性與保養',
    hardwareCat: '機台與配件維護',
    shippingCat: '金流與出貨配送',
    noFaqFound: '沒有找到符合搜尋條件的問題',
    noFaqDesc: '嘗試更換其他關鍵字，或直接點擊右下角「AI 客服顧問」由智能助手為您即時解答！',
    items: [
      {
        category: 'printing',
        q: '3D 列印模型嚴重翹邊（Warping），該如何徹底解決？',
        a: '翹邊主要是由於塑料冷卻時收縮產生的內應力大於底板抓地力。解決步驟：1. 用溫水加洗碗精徹底洗淨 PEI 彈簧鋼板（除去手汗皮脂）；2. 稍微下調 Z-Offset 讓第一層線條被適度壓平；3. 切片軟體開啟 5-8mm 的 Brim（外緣裙邊）；4. 前 3 層關閉模型風扇；5. 較難印的 ABS/PETG 請務必塗抹 3D 列印專用膠水並做好機箱保溫。'
      },
      {
        category: 'printing',
        q: '列印表面出現細小蛛網般的「牽絲（Stringing）」怎麼辦？',
        a: '牽絲常由溫度過高、回抽參數不良或線材受潮引起。建議：1. 列印「溫度塔」尋求臨界流動溫度，通常降低 5°C-10°C 效果顯著；2. 近端擠出機回抽距離設為 0.6-1.0mm（速度 35-45mm/s），遠端設 4-6mm；3. 開啟 Wipe（擦嘴）動作；4. PETG/TPU 請務必使用烘烤箱以 55°C-65°C 烘烤 6 小時以上排除水分。'
      },
      {
        category: 'printing',
        q: '列印中途突然不出料，擠出機發出「喀喀喀」跳齒聲是為什麼？',
        a: '這代表噴嘴或喉管發生了阻力卡死。常見成因：1. 喉管散熱不良引發「熱蠕變（Heat Creep）」，塑料在冷端提前軟化；2. 噴嘴孔被雜質或積碳堵塞；3. 線徑公差過大；4. 列印溫度太低導致融化速度跟不上推進速度。建議立刻執行「原子冷抽法（Cold Pull）」或使用細通針清潔噴孔。'
      },
      {
        category: 'printing',
        q: '什麼是「壓力提前（Pressure Advance / Linear Advance）」？為什麼需要校正？',
        a: '塑料在噴嘴內部具有彈性蓄壓。當機台在轉角減速時，內部殘壓會持續將料擠出造成轉角外凸（Corner Bulge）；加速時又會因升壓遲滯導致出料不足。開啟並校準壓力提前數值（PA/K值），能讓擠出機在加減速時動態微調推力，印出筆直銳利的稜角。'
      },
      {
        category: 'printing',
        q: '印出來的模型一折就斷，層間結合力（Layer Adhesion）很差怎麼辦？',
        a: '層間結合不良通常是新擠出的高溫塑料無法與下層冷卻塑料充分熱熔融合。改善對策：1. 調高噴嘴列印溫度 5°C-10°C；2. 適度降低模型冷卻風扇轉速；3. 降低列印速度或提高外壁圈數（增加層間接觸面積）；4. 確認線材未嚴重受潮水解。'
      },
      {
        category: 'materials',
        q: 'PLA 與 PETG 有什麼差異？日常功能件該選哪一種？',
        a: 'PLA 易列印、無翹曲、細節佳，但耐溫僅約 55°C，放置於酷暑汽車內容易變形；PETG 耐溫可達 75°C-85°C，具備極高韌性與抗衝擊力，且具備優異的耐化學性與抗紫外線能力，非常適合戶外、衛浴或機械結構零件。日常功能件強烈推薦選用神狗勾高速 PETG。'
      },
      {
        category: 'materials',
        q: '如何判斷我的 3D 列印線材是否已經「受潮」？',
        a: '受潮線材有四個明顯特徵：1. 出料時能聽到微小的「啪啪」爆裂聲；2. 噴嘴擠出線條表面粗糙有氣泡或冒白煙；3. 牽絲嚴重不可控；4. 線材本身變得極脆，用手指輕輕對折就啪一聲折斷。'
      },
      {
        category: 'materials',
        q: '神狗勾「高速 Hyper PLA」能用在一般舊款列印機（如 Ender-3）上嗎？',
        a: '完全可以！高速 PLA 透過配方改質提高了熔融流動指數（MFI）與熱傳導率。用在舊款列印機上，能大幅降低擠出機推料負載、改善層間結合力並減少牽絲，甚至能在稍微低 5°C 的溫度下流暢運作，獲得更平整細膩的表面質感。'
      },
      {
        category: 'materials',
        q: '印碳纖維線材（PLA-CF / PETG-CF / PA-CF）需要升級硬化鋼噴嘴嗎？',
        a: '強烈需要！碳纖維微粒具有微米級研磨性，一般原廠配備的黃銅噴嘴（Brass）列印不到 500g 就會被磨蝕擴孔，導致出料失控。請務必更換為硬化鋼（Hardened Steel）或雙金屬噴嘴，並注意硬化鋼導熱較慢，列印溫度建議比黃銅提高約 5°C。'
      },
      {
        category: 'materials',
        q: 'TPU 彈性軟料可以放進拓竹 AMS 多色供料系統嗎？',
        a: '絕對不行！TPU 柔軟且富有彈性，在經過 AMS 的長距離導管、選料五通閥與驅動輪時，極易發生擠壓折疊卡料。原廠與神狗勾皆嚴正建議將 TPU 掛在機身後方或外部乾燥料架，直接由近端擠出機獨立進料。'
      },
      {
        category: 'hardware',
        q: '拓竹 AMS 多色供料系統常遇到「料盤退料卡死」，有哪些解決技巧？',
        a: '1. 環保紙盤邊緣摩擦力不均易打滑，建議加裝 3D 列印的「AMS 紙盤轉接外環」；2. 剩餘耗材少於 100g 時料盤太輕易被拉起，可在軸心放入乾燥劑盒或配重塊；3. 檢查機頂鐵氟龍進料管彎折半徑是否過急，可印製進料導向轉接支架減少進退料阻力。'
      },
      {
        category: 'hardware',
        q: '什麼時候該更換 3D 列印機噴嘴？壽命大概多長？',
        a: '若只印普通純 PLA/PETG，高品質黃銅噴嘴可印製約 15-20 卷線材（15-20kg）；若印製含有金屬粉、碳纖維、夜光粉等研磨顆粒材料，黃銅噴嘴可能 1-2 卷就報廢。當您發現平整度突然變差、同參數下牽絲變嚴重、或量測擠出線徑明顯大於 0.4mm 時，代表噴嘴已磨損需更換。'
      },
      {
        category: 'hardware',
        q: 'PEI 彈簧鋼板雙面有什麼差別？平滑面 vs 粗糙紋理面該怎麼選？',
        a: 'Smooth 光面 PEI：能賦予模型底面如鏡面般的極致平整度，非常適合展示公仔、卡牌盒；Textured 粗糙紋理 PEI：表面帶有細緻啞光顆粒紋，附著力最強且最耐刮，對隱藏第一層瑕疵效果極佳，印 PETG 與 ABS 推薦優先使用紋理面。'
      },
      {
        category: 'shipping_payment',
        q: '神狗勾商城支援哪些付款方式？',
        a: '我們提供多元安全的金流支援：1. 藍新金流 NewebPay（全台灣各大銀行信用卡一次付清、Apple Pay、ATM 虛擬帳號轉帳、超商代碼繳費）；2. 全台 7-11 與全家便利商店「超商取貨付款」。'
      },
      {
        category: 'shipping_payment',
        q: '下單後多久可以收到耗材？有免運門檻嗎？',
        a: '全館常態備有現貨。平日週一至週五下午 15:00 前完成之訂單，當日即由嘉義倉儲打包出貨。超商取貨通常在寄出後 2 天送達指定門市；宅配通常隔天抵達。全館消費滿 NT$999 即享超商免運優惠！'
      },
      {
        category: 'shipping_payment',
        q: '如果收到的耗材有包裝漏氣或品質瑕疵，可以退換貨嗎？',
        a: '神狗勾承諾最高品管標準！若收到之線材發生真空袋破損漏氣、線徑嚴重超標（超出 ±0.02mm）或原廠製程瑕疵，到貨 7 天內請直接透過「聯絡我們」或客服信箱聯繫，我們將提供免費換新或全額退款保障。'
      }
    ]
  },
  'en': {
    seoTitle: '3D Printing FAQ & Troubleshooting Knowledge Base',
    seoDesc: 'Comprehensive guide to solving 3D printing issues: warping, stringing, nozzle clogs, AMS multi-color calibration, material guides, and shipping info.',
    badge: 'GodDog Maker Knowledge Base • Troubleshooting Center',
    title: '3D Printing FAQ & Troubleshooting',
    subtitle: 'Practical troubleshooting guides, slicer tuning secrets, material engineering specs, and ordering details for makers worldwide.',
    searchPlaceholder: 'Search questions (e.g. warping, stringing, clog, AMS, PETG, shipping...)',
    clearSearch: 'Clear',
    allCat: 'All FAQs',
    printingCat: 'Print Troubleshooting',
    materialsCat: 'Filaments & Care',
    hardwareCat: 'Hardware & Maintenance',
    shippingCat: 'Payment & Logistics',
    noFaqFound: 'No matching questions found',
    noFaqDesc: 'Try adjusting your search terms, or open our AI Advisor chat in the lower corner for immediate personalized help!',
    items: [
      {
        category: 'printing',
        q: 'Severe model warping / lifting from bed. How do I fix it?',
        a: 'Warping occurs when cooling contraction stresses overcome bed adhesion. Fixes: 1. Wash PEI plate thoroughly with warm water and dish soap to remove finger oils; 2. Lower Z-Offset slightly to squish the first layer adequately; 3. Enable a 5-8mm Brim in your slicer; 4. Turn off part cooling fans for the first 3 layers; 5. For ABS or PETG, apply 3D bed adhesive glue and maintain enclosure chamber warmth.'
      },
      {
        category: 'printing',
        q: 'Fine web-like stringing on the print surface. What causes it?',
        a: 'Stringing is typically caused by excessive nozzle temps, incorrect retraction settings, or wet filament. Solutions: 1. Print a temp tower—dropping 5°C-10°C often helps drastically; 2. Set direct-drive retraction to 0.6-1.0mm (35-45mm/s), or bowden to 4-6mm; 3. Enable nozzle wipe movements; 4. Dry PETG/TPU in a filament dryer at 55°C-65°C for 6+ hours before printing.'
      },
      {
        category: 'printing',
        q: 'Extruder starts clicking ("clicking/skipping steps") and stops extruding mid-print. Why?',
        a: 'Clicking indicates excessive backpressure or a jammed hotend. Root causes: 1. Heat creep softening filament prematurely in the heatbreak; 2. Partial debris clog in the nozzle orifice; 3. Filament diameter bulging beyond tolerance; 4. Printing temperature too low for the current volumetric flow rate. Perform an atomic cold pull or clear the orifice with an acupuncture needle.'
      },
      {
        category: 'printing',
        q: 'What is Pressure Advance / Linear Advance, and why must I tune it?',
        a: 'Molten polymer acts like an elastic spring in the nozzle. When the toolhead decelerates at corners, residual pressure continues oozing, bulging out the corner. When accelerating, lag creates underextrusion. Pressure Advance dynamically modulates extruder motor pressure during acceleration and deceleration, yielding razor-sharp, flat corners.'
      },
      {
        category: 'printing',
        q: 'Models break easily along layer lines. How do I improve layer adhesion?',
        a: 'Weak layer adhesion means the new molten bead is not thermal-fusing adequately with the cooled substrate below. Fixes: 1. Raise nozzle temperature by 5°C-10°C; 2. Reduce part cooling fan speed; 3. Slow down outer walls to increase heat contact duration; 4. Ensure filament is thoroughly dry.'
      },
      {
        category: 'materials',
        q: 'What is the real difference between PLA and PETG? Which should I pick for functional parts?',
        a: 'PLA prints effortlessly with crisp details but softens around 55°C (deforming inside parked summer cars). PETG withstands 75°C-85°C with superior impact toughness, water resistance, and UV stability. For functional brackets, drone parts, or outdoor mounts, GodDog High-Speed PETG is the clear winner.'
      },
      {
        category: 'materials',
        q: 'How can I tell if my filament has absorbed moisture?',
        a: 'Four classic signs of wet filament: 1. Audible popping or crackling hiss during extrusion; 2. Rough, bubbly surface texture on extruded lines with steam/haze; 3. Uncontrollable whispy stringing; 4. Filament becomes unusually brittle, snapping easily when bent 90 degrees.'
      },
      {
        category: 'materials',
        q: 'Can GodDog High-Speed Hyper PLA be printed on standard older printers like the Ender-3?',
        a: 'Absolutely! Our High-Speed PLA features modified molecular chains with a high melt flow index (MFI). On standard machines, it reduces extruder stepper motor workload, improves interlayer bonding, reduces stringing, and prints silky-smooth even at slightly lower temperatures.'
      },
      {
        category: 'materials',
        q: 'Do I need a hardened steel nozzle to print carbon fiber filaments (PLA-CF / PETG-CF / PA-CF)?',
        a: 'Yes, mandatory! Carbon fiber micro-particles are highly abrasive. Standard brass nozzles will wear out and enlarge within a single 500g spool. Upgrade to a hardened steel or ruby/carbide nozzle, and increase print temp by ~5°C to compensate for lower thermal conductivity.'
      },
      {
        category: 'materials',
        q: 'Can I feed flexible TPU filament through the Bambu Lab AMS multi-color unit?',
        a: 'No! TPU is elastic and will buckle, jam, or fold inside the long PTFE tubing, selector hub, and feed gears of the AMS. Both Bambu Lab and GodDog strongly advise mounting TPU externally on a spool holder feeding directly into the extruder.'
      },
      {
        category: 'hardware',
        q: 'Bambu Lab AMS retraction errors and spool binding: what are the best fixes?',
        a: '1. Cardboard spools have uneven edge friction—fit 3D-printed AMS spool adapter rings; 2. Spools with under 100g remaining are too lightweight and lift up—place a desiccant holder weight inside the core; 3. Check PTFE tube bending radius at the printer top and install a curved filament guide bracket.'
      },
      {
        category: 'hardware',
        q: 'How often should I replace my 3D printer nozzle? What is its lifespan?',
        a: 'For pure PLA/PETG, a quality brass nozzle easily lasts 15-20 spools (15-20 kg). With abrasive filaments (carbon fiber, glow-in-the-dark, metal fill), brass can degrade in just 1-2 spools. Replace when layer uniformity declines or the orifice measures visibly over 0.4mm.'
      },
      {
        category: 'hardware',
        q: 'Smooth PEI vs Textured PEI bed sheet: which is better?',
        a: 'Smooth PEI provides a mirror-flat bottom finish ideal for figurines, card boxes, and precision dimensional faces. Textured PEI offers a premium matte pebble grain with phenomenal mechanical grip and scratch resistance—ideal for concealing first layer imperfections and printing PETG/ABS.'
      },
      {
        category: 'shipping_payment',
        q: 'Which payment methods are supported on GodDog Store?',
        a: 'We support NewebPay 256-bit encrypted checkout: Credit Cards (Visa, MasterCard, JCB), Apple Pay, Google Pay, ATM Virtual Accounts, and Taiwan Convenience Store Cash on Delivery (7-11 & FamilyMart).'
      },
      {
        category: 'shipping_payment',
        q: 'How fast is order dispatch? What is the free shipping threshold?',
        a: 'All inventory listed is stocked locally in Taiwan. Orders confirmed before 15:00 on business days ship the same day from our Chiayi fulfillment hub. Store pickup takes 2 days; home delivery arrives next day. Orders over NT$999 enjoy free store shipping!'
      },
      {
        category: 'shipping_payment',
        q: 'What is your return & replacement policy for defective or unsealed spools?',
        a: 'GodDog guarantees industrial-grade quality control! If a spool arrives with vacuum seal failure, diameter variance beyond ±0.02mm, or manufacturer defects, contact our customer support within 7 days of delivery for a 100% free replacement or refund.'
      }
    ]
  },
  'ja': {
    seoTitle: '3Dプリントよくある質問・トラブルシューティング (FAQ)',
    seoDesc: '3Dプリントの疑問を徹底解決：反り、糸引き、ノズル詰まり、Bambu AMS調整、フィラメント特性、決済・配送情報。',
    badge: '神狗勾メイカー知識ベース • トラブルシューティングセンター',
    title: '3Dプリントよくある質問百科 (FAQ)',
    subtitle: '台湾・日本のメイカーが直面する印刷トラブルの解決法、スライサー設定のコツ、材料工学の基礎知識を網羅。',
    searchPlaceholder: 'キーワード検索（反り、糸引き、詰まり、AMS、PETG、送料無料...）',
    clearSearch: 'クリア',
    allCat: 'すべての質問',
    printingCat: '造形トラブル解決',
    materialsCat: 'フィラメント特性・管理',
    hardwareCat: '機材・メンテ保守',
    shippingCat: '決済・お届け配送',
    noFaqFound: '一致する質問が見つかりませんでした',
    noFaqDesc: '別の検索キーワードを試すか、右下の「AI相談顧問」から直接質問してください！',
    items: [
      {
        category: 'printing',
        q: '造形物の底面が激しく反って（Warping）剥がれます。対策は？',
        a: '反りは樹脂冷却時の収縮応力がベッド定着力を上回ることで発生します。対処法：1. PEIプレートを台所用洗剤とぬるま湯でしっかり洗浄し皮脂を除去；2. Zオフセットをわずかに下げて第1層を適度に押し潰す；3. スライサーで5〜8mmのブリム（Brim）を追加；4. 最初の3層は冷却ファンを完全OFF；5. 反りやすいABS/PETGは定着糊を塗布し庫内保温を行ってください。'
      },
      {
        category: 'printing',
        q: '造形物表面にクモの巣のような「糸引き（Stringing）」が多発します。',
        a: '糸引きは過剰なノズル温度、リトラクション不足、フィラメントの吸湿が主因です。改善策：1. 温度タワーを出力し最適な温度を見極める（5°C〜10°C下げるだけで劇的に改善）；2. ダイレクト式はリトラクション0.6〜1.0mm（速度35〜45mm/s）、ボーデン式は4〜6mmに設定；3. ワイプ（Wipe）動作を有効化；4. PETG/TPUはドライヤーで55°C〜65°C・6時間以上しっかり乾燥させてください。'
      },
      {
        category: 'printing',
        q: 'プリント途中で樹脂が出なくなり、エクストルーダーから「カチカチ」と異音がします。',
        a: 'ノズルまたはヒートブレイクで送り抵抗が限界に達し脱調しています。原因：1. ヒートクリープによる冷却不足で冷部でフィラメントが早期軟化；2. ノズル先端のゴミや炭化物の詰まり；3. フィラメント径の局所的な太り；4. 設定温度が低すぎて溶融速度が追いついていない。コールドプル（原子冷引抜法）や掃除針で速やかにノズルを清掃してください。'
      },
      {
        category: 'printing',
        q: 'プレッシャーアドバンス（Pressure Advance / Linear Advance）とは何ですか？',
        a: '溶融樹脂はノズル内でゴムのような弾性蓄圧を持ちます。コーナーでヘッドが減速する際、残圧で樹脂が押し出され角が膨らんでしまいます。プレッシャーアドバンスを校正することで、加減速に応じてエクストルーダーの押し出し圧をリアルタイム補正し、シャープで美しい直角を実現できます。'
      },
      {
        category: 'printing',
        q: '造形物が層間で簡単にパキッと割れます。層間密着性を高めるには？',
        a: '新しく吐出された高温樹脂が、すでに冷えた下層の樹脂と十分に熱融合できていない状態です。改善策：1. ノズル温度を5°C〜10°C引き上げる；2. 冷却ファンの回転数を適度に抑える；3. プリント速度を落として熱接触時間を増やす；4. フィラメントが吸湿劣化していないか確認してください。'
      },
      {
        category: 'materials',
        q: 'PLAとPETGの違いは何ですか？実用部品にはどちらを選ぶべき？',
        a: 'PLAは印刷が極めて容易で寸法精度が高く細部が綺麗ですが、耐熱温度が約55°Cのため夏の車内では変形します。PETGは75°C〜85°Cの耐熱性を持ち、優れた粘り強さと耐衝撃性、耐候性・耐薬品性を備えます。屋外器具や実用ブラケットには神狗勾の高速PETGが最適です。'
      },
      {
        category: 'materials',
        q: 'フィラメントが「吸湿」しているかどうかはどうやって見分ければいいですか？',
        a: '吸湿したフィラメントには4つの典型的な症状があります：1. 吐出時に「パチパチ」と水蒸気のはぜる音がする；2. ノズルから出る樹脂の表面に気泡があり白煙が上がる；3. 制御不能な激しい糸引き；4. フィラメントが極端にもろくなり、手で軽く曲げただけでポキッと折れる。'
      },
      {
        category: 'materials',
        q: '神狗勾の「超高速 Hyper PLA」はEnder-3などの従来機でも使えますか？',
        a: 'もちろん問題なくご使用いただけます！高速PLAは分子設計を最適化し、メルトフローレート（流動性）と熱伝導率を高めています。標準的な旧型プリンターでもエクストルーダーの負荷を軽減し、糸引きを抑え、滑らかで美しい仕上がりを実現します。'
      },
      {
        category: 'materials',
        q: 'カーボン配合フィラメント（PLA-CF / PETG-CF / PA-CF）には焼き入れ鋼ノズルが必要？',
        a: '必須です！カーボンファイバー粒子は微細なヤスリのような研磨性を持ちます。真鍮ノズルで印刷すると500g程度でノズル穴が削れて広がり、吐出が暴走します。必ず焼き入れ鋼（Hardened Steel）ノズルを使用し、真鍮より熱伝導が遅いためノズル温度を約5°C高めに設定してください。'
      },
      {
        category: 'materials',
        q: 'TPUフレキシブルフィラメントはBambu Lab AMS多色システムに入れられますか？',
        a: '絶対に不可です！TPUは弾力性があり柔らかいため、AMSの長いPTFEチューブやセレクター分岐バルブ、送りギア内部で座屈・詰まりを起こします。TPUは必ずプリンター背面の単独スプールホルダーまたは外部ドライボックスから直接給料してください。'
      },
      {
        category: 'hardware',
        q: 'Bambu Lab AMSで「スプール巻き戻しスタック」が起きるときの対策は？',
        a: '1. 段ボール紙スプールはフチの摩擦ムラで滑りやすいため、3Dプリント製AMSアダプターリングを装着する；2. 残量100g以下の軽いスプールは浮き上がりやすいため、スプール芯に乾燥剤や重りを詰める；3. 天面のPTFEチューブの曲がりが急でないか確認し、ガイドアダプターを取り付けてください。'
      },
      {
        category: 'hardware',
        q: '3Dプリンターのノズルはいつ交換すべきですか？寿命の目安は？',
        a: '通常のPLA/PETGのみの場合、高品質な真鍮ノズルで約15〜20巻（15〜20kg）持ちます。カーボンや蓄光、金属粉配合フィラメントを使うと1〜2巻で消耗します。吐出の均一性が急に悪化したり、ノズル径が0.4mmを超えて広がっている場合は交換時期です。'
      },
      {
        category: 'hardware',
        q: 'スムーズPEIとテクスチャーPEI（粗面）ベッドはどう使い分ければいいですか？',
        a: 'Smooth（平滑PEI）：模型底面が鏡のようにピカピカに仕上がり、フィギュアやカードボックスに最適。Textured（テクスチャー粗面PEI）：高級感のあるマットな梨地模様で定着力と耐摩耗性が最強。第1層のわずかなアラを隠し、PETGやABSの印刷に最適です。'
      },
      {
        category: 'shipping_payment',
        q: '対応している決済方法を教えてください。',
        a: 'NewebPay 256-bit SSL暗号化決済に対応：各種クレジットカード（Visa, MasterCard, JCB）、Apple Pay、Google Pay、ATM仮想口座振込、コンビニ受取時現金支払いをご利用いただけます。'
      },
      {
        category: 'shipping_payment',
        q: '注文後どのくらいで届きますか？送料無料ラインはありますか？',
        a: '商品はすべて台湾国内倉庫に現品在庫を保有。営業日15:00までのご注文は即日発送いたします。コンビニ受取は発送から約2日、宅配は翌日到着。NT$999以上のお買い上げでコンビニ受取送料無料となります！'
      },
      {
        category: 'shipping_payment',
        q: '届いたフィラメントに真空漏れや品質不良があった場合、交換・返品はできますか？',
        a: '神狗勾は厳格な品質基準をお約束します！万一真空パックの空気漏れ、線径公差（±0.02mm）を超える異常、初期不良がございましたら、お届け後7日以内にお問い合わせフォームまたはメールよりご連絡ください。全額返金または新品交換にて迅速に対応いたします。'
      }
    ]
  }
};

export const FAQPage: React.FC<FAQPageProps> = ({ lang: propLang }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const c = FAQS_DATA[activeLang] || FAQS_DATA['zh-TW'];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleFAQ = (idx: number) => {
    setOpenIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredFaqs = c.items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Schema.org FAQPage JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-2">
      <SEO 
        title={c.seoTitle} 
        description={c.seoDesc} 
        url="/faq" 
      />
      
      {/* Inject FAQPage JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{c.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {c.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={c.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
          >
            {c.clearSearch}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          {c.allCat} ({c.items.length})
        </button>
        <button
          onClick={() => setSelectedCategory('printing')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'printing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{c.printingCat}</span>
        </button>
        <button
          onClick={() => setSelectedCategory('materials')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'materials'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{c.materialsCat}</span>
        </button>
        <button
          onClick={() => setSelectedCategory('hardware')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'hardware'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{c.hardwareCat}</span>
        </button>
        <button
          onClick={() => setSelectedCategory('shipping_payment')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'shipping_payment'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{c.shippingCat}</span>
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-200">{c.noFaqFound}</p>
            <p className="text-xs text-slate-400">{c.noFaqDesc}</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = !!openIndices[idx];
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <div className="text-slate-400 shrink-0 mt-0.5">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/60 mt-1 pl-13">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
