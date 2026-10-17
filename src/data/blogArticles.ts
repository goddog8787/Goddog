export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorTitle: string;
  category: '新手入門' | '進階技巧' | '耗材評測' | '硬體改裝' | '切片參數';
  readTime: string;
  tags: string[];
  coverImage?: string;
  content: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    slug: 'pla-vs-petg-comparison-guide',
    title: 'PLA 與 PETG 3D 列印線材大解密：新手該怎麼選？四大面向深度解析',
    excerpt: '3D 列印新手最常問的問題：「我到底該用 PLA 還是 PETG？」這篇文章將帶你從材質特性、列印難易度、耐溫性與後處理等四大面向，深度解析這兩種最受歡迎的 3D 列印耗材。',
    date: '2026-09-01',
    author: '神狗勾材料實驗室',
    authorTitle: '資深材料工程師',
    category: '新手入門',
    readTime: '8 分鐘',
    tags: ['PLA', 'PETG', '耗材選購', '新手指南'],
    content: `
      <h2>一、前言：踏入 3D 列印的第一道選擇題</h2>
      <p>無論你是剛購入第一台 3D 列印機的創客新手，還是需要大量印製打樣的專業機構設計師，在開始列印之前，都必須面對這道最經典的難題：「這一件作品，到底該用 PLA 還是 PETG？」</p>
      <p>PLA（Polylactic Acid，聚乳酸）與 PETG（Polyethylene Terephthalate Glycol-modified，聚對苯二甲酸乙二醇酯-1,4-環己烷二甲醇酯）是目前消費級 FDM 3D 列印市場上佔有率最高、泛用性最強的兩大主力線材。然而，兩者在熔融流動性、玻璃轉移溫度、耐衝擊力以及列印環境要求上有著顯著差異。本文將從四個核心維度為您徹底剖析。</p>

      <h2>二、材質特性全方位對比分析</h2>
      <table class="w-full text-left border-collapse my-6 text-sm">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th class="p-3 font-bold">比較項目</th>
            <th class="p-3 font-bold text-indigo-600 dark:text-indigo-400">PLA / 高速 PLA</th>
            <th class="p-3 font-bold text-teal-600 dark:text-teal-400">PETG / 高速 PETG</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">耐溫性 (玻璃轉移溫度 Tg)</td>
            <td class="p-3">約 55°C - 60°C（高溫車內易軟化）</td>
            <td class="p-3">約 75°C - 85°C（抗高溫性能優秀）</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">機械韌性與抗衝擊力</td>
            <td class="p-3">剛性高但偏脆，受大應力易碎裂</td>
            <td class="p-3">極佳延展韌性，受力彎曲不易折斷</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">列印難度與底板附著力</td>
            <td class="p-3">極低，近乎零翹曲，不需要封箱</td>
            <td class="p-3">中等，需精調回抽避免牽絲，需上膠隔離</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">戶外抗 UV 與耐候性</td>
            <td class="p-3">長期日曬易脆化分解</td>
            <td class="p-3">優良抗水、抗酸鹼與紫外線耐受性</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">典型噴嘴 / 熱床溫度</td>
            <td class="p-3">200°C - 220°C / 50°C - 60°C</td>
            <td class="p-3">230°C - 250°C / 70°C - 80°C</td>
          </tr>
        </tbody>
      </table>

      <h2>三、深入了解 PLA：易印、美觀、細節之王</h2>
      <p>PLA 是以玉米澱粉或甘蔗等可再生植物資源提煉而成，列印時會散發淡淡的焦糖甜香，完全沒有刺鼻毒性。在列印過程中，PLA 的冷卻結晶速度快、熱收縮率極低，即使列印直徑 25 公分的大型模型，也不容易發生邊角翹起（Warping）的慘劇。</p>
      <p><strong>最佳適用情境：</strong>動漫手辦、微縮模型、室內收納盒、外殼外觀樣品、建築砂盤模型、教育教學教具。</p>

      <h2>四、深入了解 PETG：日常功能件與結構受力件的基石</h2>
      <p>PETG 是大家喝的寶特瓶材料（PET）加入乙二醇改質後的產物。改質後大幅降低了材料結晶化脆度，同時保留了 PET 原生優異的耐化學性、防水性以及極高的層間熔融強度。如果您印製的模型需要承受螺絲鎖附扭力、卡榫開闔卡扣，或是需要放置於汽車儀表板、陽台戶外，PETG 絕對是第一選擇。</p>
      <p><strong>注意要點：</strong>PETG 吸濕性較高，暴露在台灣潮濕環境中數天便容易受潮，列印時容易產生惱人的細絲。建議印製前放置於乾燥箱中維持 15% 以下濕度。</p>

      <h2>五、結論與神狗勾建議選購指南</h2>
      <p>如果您才剛接觸 3D 列印不到三個月，請專注於「神狗勾高速 Hyper PLA」，先掌握切片軟體的基本壁厚、填充與支撐設定；當您需要製作浴室吸盤掛鉤、四軸無人機保護架、工具吊架等需要強度與耐熱的零件時，再升級使用「神狗勾高速 PETG」，您將體驗到前所未有的強韌工藝品質！</p>
    `
  },
  {
    id: 2,
    slug: 'eliminate-3d-printing-stringing-definitive-guide',
    title: '如何徹底解決 3D 列印「牽絲 (Stringing)」的噩夢？三管齊下調校心法',
    excerpt: '每次印 PETG 或是 TPU，模型表面總是佈滿蜘蛛網般的牽絲嗎？這篇文章教你如何透過溫度調整、回抽設定以及耗材烘烤，三管齊下徹底消滅牽絲。',
    date: '2026-09-08',
    author: '神狗勾實驗室',
    authorTitle: '製程技術顧問',
    category: '進階技巧',
    readTime: '9 分鐘',
    tags: ['牽絲排查', '切片參數', '回抽設定', 'PETG'],
    content: `
      <h2>一、什麼是牽絲？它的物理機制是什麼？</h2>
      <p>牽絲（Stringing）是指當 3D 列印機的噴嘴在模型不同島嶼或結構之間進行空跑移動（Travel Move）時，未受擠出的熔融塑料因重力、毛細現象或內部熔膠腔壓力，從噴嘴微孔拉出如蛛絲般的纖細塑膠殘留。</p>
      <p>這不僅會嚴重破壞成品的表面平整度，後續還得耗費數十分鐘拿熱風槍或美工刀逐一修整。要徹底剷除牽絲，必須從「溫度」、「回抽壓力釋放」與「材料水分」三個環節逐一擊破。</p>

      <h2>二、步驟一：以溫度塔（Temp Tower）抓出臨界流動點</h2>
      <p>許多玩家為了追求出料順暢，習慣把噴嘴溫度開得過高。過高的溫度會讓塑料黏度（Viscosity）驟降，流動性像水一樣，即使擠出機回抽再快，液態塑料仍然會自發滴落。</p>
      <ul>
        <li><strong>切片步驟：</strong>在 OrcaSlicer、Bambu Studio 或 Cura 中載入內建的溫度塔校準模型。</li>
        <li><strong>觀察指標：</strong>每一層以 5°C 為級距遞減（例如 PETG 從 255°C 遞減至 230°C），找出既能保證層間結合力、又完全看不到牽絲的黃金溫度。</li>
        <li><strong>神狗勾測試數據：</strong>神狗勾高速 PETG 在近端擠出機（如 Bambu X1C / Creality K1）的甜蜜溫度區間通常為 235°C - 240°C。</li>
      </ul>

      <h2>三、步驟二：精準校調回抽（Retraction）與擦嘴（Wipe）</h2>
      <p>回抽的作用並不是像針筒一樣把塑料吸回喉管，而是「消除噴嘴融化區底部的流體靜壓」。</p>
      <ul>
        <li><strong>近端擠出機（Direct Drive）：</strong>回抽距離建議設定在 0.4 mm 至 1.2 mm，速度設定在 30 - 45 mm/s。千萬不要設定超過 2mm，否則易導致熱端軟化塑料被拉入冷端造成喉管堵塞。</li>
        <li><strong>遠端擠出機（Bowden）：</strong>由於鐵氟龍管內部的線材彈性遲滯，回抽距離通常需要 4.0 mm 至 6.5 mm，速度 40 - 60 mm/s。</li>
        <li><strong>開啟擦嘴動作（Wipe while retracting）：</strong>在回抽時讓噴嘴沿著模型內壁微幅移動 1-2mm，將掛在噴嘴尖端的小熔滴抹在外壁內側，能消滅 80% 的外觀拉絲。</li>
      </ul>

      <h2>四、步驟三：耗材水分徹底烘烤（最常被忽視的元兇）</h2>
      <p>很多玩家調了幾百次切片參數依然滿頭拉絲，最後才發現罪魁禍首是「線材受潮」。當含有水分的線材進入 200°C 以上的高溫噴嘴時，微米級水滴瞬間氣化膨脹為水蒸氣，產生爆裂聲（Popping sound），蒸氣壓力會無情地將塑料強制擠出噴嘴孔！</p>
      <p>針對 PETG、TPU、Nylon 等高吸水性線材，請務必在列印前使用專用烘烤箱進行 55°C - 65°C 連續 6-8 小時的去濕乾燥，並在印製過程中保持乾燥密封。</p>
    `
  },
  {
    id: 3,
    slug: 'high-speed-pla-formulation-and-tuning',
    title: '高速 PLA (High Speed PLA) 到底差在哪？解析 600mm/s 次世代線材技術',
    excerpt: '隨著 Bambu Lab、Creality K1 等高速機的普及，傳統 PLA 已經無法滿足 300mm/s 以上的列印速度。這篇為你解析高速 PLA 的配方奧秘，以及為什麼你的高速機需要它。',
    date: '2026-09-10',
    author: '神狗勾研發部',
    authorTitle: '高分子材料碩士',
    category: '耗材評測',
    readTime: '7 分鐘',
    tags: ['高速PLA', '拓竹Bambu', '熔融指數', '列印速度'],
    content: `
      <h2>一、當列印速度從 50mm/s 飆升到 500mm/s，線材面臨什麼考驗？</h2>
      <p>在 2022 年以前，消費級 3D 列印機的主流速度約在 50 至 80 mm/s 之間。但隨著拓竹 Bambu Lab、創想三維 Creality K 系列等 CoreXY 機種掀起高速旋風，加速度衝上 20000 mm/s²、直線列印速度突破 500 mm/s 已經成為業界新常態。</p>
      <p>然而，許多玩家將原本的普通 PLA 裝上高速機後，卻發現印出來的模型外觀發白、表面粗糙不平，用手輕輕一掰就層間分離破碎。這就是典型的「出料供不應求（Under-extrusion）」現象。</p>

      <h2>二、高分子化學視角：高速 PLA 的改質原理</h2>
      <p>塑料要在極短的時間內完成「冷固體 → 均勻熔體 → 擠出定型」的過程。在 500mm/s 速度下，線材經過噴嘴加熱區的時間只有短短的數十毫秒！</p>
      <ul>
        <li><strong>高熔融流動指數（Higher MFI）：</strong>高速 PLA 透過特定分子量分佈控制與添加流動促進劑，在高剪切速率下黏度顯著下降，能以極小的擠出阻力高速流過 0.4mm 噴嘴孔徑。</li>
        <li><strong>高熱導率配方：</strong>添加了超微晶成核改質劑，讓熱量能更迅速地從噴嘴內壁傳導至線材核心，確保塑料徹底熔融，杜絕冷心出料。</li>
        <li><strong>快速結晶硬化特性：</strong>高速擠出後，模型如果冷卻太慢，在高速風扇吹拂下很容易發生懸垂坍塌。高速 PLA 最佳化了結晶溫度點，使塑料離開噴嘴後能瞬間凝固成型，維持銳利的角落稜角。</li>
      </ul>

      <h2>三、實測數據：神狗勾高速 PLA vs 一般普通 PLA</h2>
      <p>我們在神狗勾實驗室的 Bambu Lab X1C 上，使用標準 0.4mm 硬化鋼噴嘴進行體積流速上限測試（Max Volumetric Flow Test）：</p>
      <ul>
        <li><strong>市售普通 PLA：</strong>約在 14 - 16 mm³/s 即開始出現缺料與啞光發白，折算速度極限約 220 mm/s。</li>
        <li><strong>神狗勾極速 Hyper PLA：</strong>體積流速可穩定達到 <strong>28 - 32 mm³/s</strong>，即使在 550 mm/s 高速運動下，層間結合強度依舊保有原本的 92% 以上！</li>
      </ul>
    `
  },
  {
    id: 4,
    slug: '5-proven-steps-to-fix-3d-print-bed-warping',
    title: '模型狂翹邊 (Warping) 怎麼辦？5 招徹底搞定熱床底板附著力',
    excerpt: '列印了十幾個小時的模型，結果邊角翹起來導致變形甚至脫落撞機？底板附著力 (Bed Adhesion) 是所有玩家的痛，這篇教你 5 招保證黏死死的秘訣。',
    date: '2026-09-11',
    author: '神狗勾實驗室',
    authorTitle: '資深維修技師',
    category: '新手入門',
    readTime: '6 分鐘',
    tags: ['翹邊排查', '底板附著', 'PEI鋼板', 'Z軸補償'],
    content: `
      <h2>一、翹邊的物理根本原因</h2>
      <p>任何高分子塑料在從高溫熔融態冷卻固化時，體積都會產生熱收縮（Thermal Contraction）。當模型的第一層緊貼熱床，而上方幾十層逐漸冷卻收縮時，上層產生的張應力會不斷把第一層的邊緣向上拉扯。一旦這股收縮力大於第一層與列印底板之間的抓地力，翹邊就發生了。</p>

      <h2>二、五大實戰招式徹底封殺翹邊</h2>
      <h3>第一招：徹底清洗 PEI 彈簧鋼板（拒絕只用酒精）</h3>
      <p>人體手指分泌的微量皮脂是 PEI 塗層的最大殺手。許多人習慣只用酒精棉片擦拭，但異丙醇只能把油脂「抹均勻」，無法真正帶走油脂。<strong>正確做法：</strong>把彈簧鋼板拔下，使用溫水搭配家用洗碗精，用海綿細緻面徹底搓出泡沫沖洗，並用紙巾垂直壓乾。洗完後附著力立刻提升 300%！</p>

      <h3>第二招：微調第一層 Z-Offset（讓第一層產生適當扁平度）</h3>
      <p>自動熱床調平（ABL）只能偵測熱床起伏，無法保證最完美的下壓量。第一層的線條截面應該要是被均勻「壓平的橢圓形」，線與線之間不能有縫隙，但也不能下壓過度導致邊緣擠出波浪狀肉刺。</p>

      <h3>第三招：善用 Brim（外緣裙邊）擴大受力面積</h3>
      <p>在切片軟體中開啟「外緣（Outer Brim Only）」，設定寬度 5 - 10 mm。這就如同建築地基的連續壁，將應力釋放點轉移到外圍裙邊，模型本身邊緣便能牢牢平貼。</p>

      <h3>第四招：關閉前 3 層模型冷卻風扇</h3>
      <p>第一層出料時，若冷卻風扇全力運轉，會加速塑料收縮拉扯。切片設定中應強制將第 1 至第 3 層的風扇轉速設為 0%，讓塑料在熱床上維持軟化流平狀態，與底板紋理深度咬合。</p>

      <h3>第五招：針對特殊材料塗抹專用列印膠水</h3>
      <p>印製 ABS、ASA、尼龍或是 PETG 時，塗抹薄薄一層 3D 列印專用高溫膠水，不僅能在高溫下提供微米級黏著鍵結，在降溫至室溫後還會自動釋放應力，讓模型輕輕一彈便順暢取下。</p>
    `
  },
  {
    id: 5,
    slug: 'carbon-fiber-3d-printing-nozzle-guide',
    title: '碳纖維 (Carbon Fiber) 耗材指南：為什麼你需要硬化鋼噴嘴與專用參數？',
    excerpt: '想印出超高強度、表面帶有消光高級質感的零件？PA-CF (尼龍碳纖維) 和 PETG-CF 是你的好選擇。但印之前，先確認你的噴嘴扛得住！',
    date: '2026-09-12',
    author: '神狗勾材料實驗室',
    authorTitle: '資深材料工程師',
    category: '進階技巧',
    readTime: '7 分鐘',
    tags: ['碳纖維', 'CF線材', '硬化鋼噴嘴', '消光質感'],
    content: `
      <h2>一、碳纖維增強複合材料的魅力</h2>
      <p>在熱塑性樹脂基體中混入短切碳纖維（Short Carbon Fiber，長度約 50-150 微米），能大幅提升材料的拉伸模量與彎曲強度。更重要的是，碳纖維能大幅降低材料在 X-Y 平面的各向異性收縮，大幅改善大尺寸零件的翹邊問題，並賦予零件一種極度奢華的深邃磨砂消光表面，讓令人在意的 3D 列印層紋幾乎隱形！</p>

      <h2>二、原廠黃銅噴嘴的致命危機</h2>
      <p>大多數入門機種標配的是「黃銅噴嘴（Brass Nozzle）」。黃銅材質硬度極低（莫氏硬度約 3），而碳纖維微粒本質上如同高硬度的微型磨刀石。若使用黃銅噴嘴列印碳纖維線材，往往列印不到半卷（約 500g），原本精準的 0.4mm 噴嘴孔就會被磨損擴孔至 0.6mm 甚至 0.7mm 以上，導致嚴重的過量擠出、牽絲與輪廓失真。</p>

      <h2>三、噴嘴材質挑選指南</h2>
      <ul>
        <li><strong>硬化鋼噴嘴（Hardened Steel）：</strong>性價比首選，洛氏硬度達 HRC 55-60 以上，能承受數十卷碳纖維磨耗。注意：硬化鋼導熱性略遜於黃銅，切片列印溫度通常需提高 5°C - 10°C。</li>
        <li><strong>DLC / 碳化鎢噴嘴（Tungsten Carbide）：</strong>兼具超高硬度與接近銅的極速導熱性，屬於免頻繁調溫的進階夢幻配置。</li>
        <li><strong>紅寶石人造寶石噴嘴（Ruby Tip）：</strong>前端鑲嵌人造剛玉，永不磨損，但價格較高且需小心碰撞熱床。</li>
      </ul>

      <h2>四、碳纖維線材最佳列印設定要點</h2>
      <p>1. <strong>噴嘴孔徑選擇：</strong>建議優先使用 0.4mm 或 0.6mm 噴嘴，避免使用 0.2mm 微孔噴嘴，以防短切纖維在噴嘴收斂角發生堆積堵塞。<br/>
      2. <strong>防潮要求：</strong>特別是 PA-CF（尼龍碳纖維），尼龍極度嗜水，列印時務必配合密閉進料箱，印前建議 80°C 烘烤 8 小時以上。<br/>
      3. <strong>回抽參數：</strong>碳纖維線材流動黏度較高，回抽距離可比純料微幅減少 10-20%，以確保連續出料穩定。</p>
    `
  },
  {
    id: 6,
    slug: 'bambu-lab-ams-multi-color-tuning-guide',
    title: '拓竹 Bambu Lab AMS 多色耗材系統調校秘笈：防卡料、色阻與廢料最佳化',
    excerpt: '入手了 Bambu Lab X1 或 P1S 的 AMS 多色系統，卻常遇到卡料、退料失敗或是廢料大便拉不停嗎？本文傳授 6 個進階調控絕招。',
    date: '2026-09-13',
    author: '神狗勾測試機隊',
    authorTitle: '自動化設備維護組',
    category: '硬體改裝',
    readTime: '10 分鐘',
    tags: ['BambuLab', 'AMS多色', '防卡料', '廢料最佳化'],
    content: `
      <h2>一、AMS 多色供料系統的運作架構</h2>
      <p>拓竹 AMS（Automatic Material System）採用四組獨立的主動進料馬達、光學編碼輪、選料五通閥以及耗材緩衝器（Buffer），實現了極高可靠度的多色切換與自動續料。然而在長時間高強度運轉下，玩家常遇到「料盤打滑」、「退料喉管阻力過大」與「沖刷廢料過多」等痛點。</p>

      <h2>二、料盤材質與重量管理心法</h2>
      <p>AMS 是依靠底部的橡膠滾輪旋轉帶動料盤邊緣來送退料：</p>
      <ul>
        <li><strong>紙質料盤問題：</strong>部分副廠採用環保紙盤，紙盤邊緣受潮或磨損後容易在滾輪上打滑，甚至掉落紙屑卡住傳動齒輪。<strong>解決方案：</strong>請在 Printables 或 MakerWorld 下載列印專用「AMS 紙盤轉接環（Spool Adapter ring）」，或使用神狗勾原廠耐磨高剛性塑膠輪盤。</li>
        <li><strong>殘料過輕問題：</strong>當線材剩下不到 100g 時，料盤重心過高，在快速退料時容易整盤彈起卡住 AMS 上蓋。<strong>解決方案：</strong>在料盤中央空心軸內放入「配重塊（Weight Core）」或乾燥劑盒，增加約 200g 下壓力。</li>
      </ul>

      <h2>三、如何減少高達 70% 的切色沖刷廢料（Flush Volume）</h2>
      <p>切片軟體預設的顏色切換沖刷量通常極度保守，換一次顏色動輒噴掉 300-500mm³ 的塑料，造成「廢料大便比模型還重」的窘境。</p>
      <ul>
        <li><strong>自動計算沖刷矩陣：</strong>在 Bambu Studio 中點選「沖刷體積（Flushing Volumes）」，點選「自動計算（Auto-Calculate）」，並將倍率調整為 0.6 至 0.7。</li>
        <li><strong>深色切換到淺色：</strong>黑色換白色需要較多沖刷量避免滲色；但如果是白色切換到黑色，只需極少沖刷量即可完全覆蓋，可手動將沖刷量調降至 100mm³ 以下。</li>
        <li><strong>開啟「沖刷到填充（Flush into infill）」：</strong>將換色時的過渡色廢料直接擠在模型內部的填充骨架中，外表看不出來，卻能直接省下一大半的排料！</li>
      </ul>
    `
  },
  {
    id: 7,
    slug: 'tpu-flexible-filament-complete-printing-guide',
    title: 'TPU 彈性耗材列印全攻略：從 95A 到 85A 的近端擠出與零堵料設定',
    excerpt: '想印手機保護殼、避震墊圈或四軸無人機腳墊？TPU 彈性線材好用但出了名的難印。本文帶你深入掌握硬度選擇、列印速度與擠出張力控制。',
    date: '2026-09-14',
    author: '神狗勾材料實驗室',
    authorTitle: '資深材料工程師',
    category: '進階技巧',
    readTime: '8 分鐘',
    tags: ['TPU', '彈性耗材', '軟料印製', '95A'],
    content: `
      <h2>一、認識肖氏硬度（Shore Hardness）：95A vs 85A</h2>
      <p>熱塑性聚氨酯彈性體（TPU）擁有極佳的抗衝擊力、耐磨性、耐油性與類似橡膠的高彈性。選購 TPU 時，規格上一定會標示肖氏硬度：</p>
      <ul>
        <li><strong>TPU 95A：</strong>目前消費級 3D 列印的黃金標準硬度。軟硬適中，手感類似硬橡膠或直排輪輪子。具有足夠的推擠剛性，在大多數近端擠出機上能流暢運行。</li>
        <li><strong>TPU 85A / 83A：</strong>極軟，手感類似軟糖或矽膠吸盤。由於線材本身太過柔軟，如果擠出齒輪間隙稍大，線材就會在齒輪下方發生彎折纏繞（Spaghetti），需要非常專業的改裝機台。</li>
      </ul>

      <h2>二、TPU 列印的三大硬體鐵律</h2>
      <p>1. <strong>嚴禁使用遠端進料機（Bowden）：</strong>鐵氟龍管長達數十公分，推動軟麵條般的 TPU 會在管內壓縮膨脹，回抽幾乎完全無效。必須使用近端擠出機（Direct Drive）。<br/>
      2. <strong>絕對不要放進拓竹 AMS 或多色換料機：</strong>TPU 的彈性會導致五通閥與編碼器偵測錯誤，原廠明確禁止將 TPU 放入 AMS 系統中，必須使用外部掛架獨立進料。<br/>
      3. <strong>放鬆擠出機彈簧壓力：</strong>如果齒輪咬合力道過緊，會直接把圓形線材壓扁成扁平橢圓，造成進入喉管時摩擦力驟增卡料。請適度鬆開調節螺絲。</p>

      <h2>三、切片軟體四大黃金參數</h2>
      <ul>
        <li><strong>速度要慢：</strong>外壁與填充速度建議控制在 25 - 40 mm/s 之間，體積流速上限建議設為 3.0 - 5.0 mm³/s。印軟料心急必敗！</li>
        <li><strong>關閉或極小化回抽：</strong>回抽容易使軟化的 TPU 尾端在喉管內折疊卡死。建議回抽距離設為 0.2 - 0.5 mm，或乾脆關閉回抽，靠後續美工刀修除少量拉絲。</li>
        <li><strong>調高熱床與噴嘴溫度：</strong>噴嘴建議 220°C - 235°C，熱床 50°C - 60°C。</li>
        <li><strong>避免過度沾黏破壞底板：</strong>TPU 對 Smooth PEI 光面鋼板的附著力強得可怕，直接列印冷卻後可能把 PEI 膜撕破！<strong>請務必塗抹膠水作為隔離脫模劑</strong>，或使用紋理 Textured PEI 鋼板。</li>
      </ul>
    `
  },
  {
    id: 8,
    slug: 'abs-asa-printing-enclosure-and-safety-guide',
    title: 'ABS 與 ASA 耐候工程耗材印製守則：機箱保溫、防裂層與 VOC 廢氣安全解析',
    excerpt: '印耐高溫耐衝擊的汽車零件必備 ABS/ASA，但總是層間裂開、翹得亂七八糟？本文教你如何建立恆溫列印環境與活性碳排氣防護。',
    date: '2026-09-15',
    author: '神狗勾實驗室',
    authorTitle: '安全規範稽核員',
    category: '進階技巧',
    readTime: '9 分鐘',
    tags: ['ABS', 'ASA', '封箱保溫', '防裂層', '空氣過濾'],
    content: `
      <h2>一、為什麼工程零件非 ABS / ASA 不可？</h2>
      <p>ABS（丙烯腈-丁二烯-苯乙烯）和 ASA（丙烯腈-苯乙烯-丙烯酸酯）是傳統注塑工業中最泛用的工程塑料。它們擁有高達 95°C - 105°C 的高耐熱溫度，且具備極佳的表面抗刮性，可使用丙酮蒸汽進行化學拋光達到鏡面質感。而 ASA 更是專門為戶外打造，耐紫外線老化能力是 ABS 的 10 倍以上，長期日曬雨淋也不褪色脆化。</p>

      <h2>二、列印 ABS/ASA 的最大痛點：收縮應力與層間開裂</h2>
      <p>ABS 的熱收縮率高達 0.5% - 0.8%（PLA 僅約 0.1%）。當下層冷卻而上層尚溫熱時，垂直方向的拉伸應力會直接將相鄰兩層撕開，形成橫向的大裂縫（Delamination）。</p>
      <ul>
        <li><strong>封閉式機箱（Enclosure）是必備條件：</strong>開放式機台絕對印不好大尺寸 ABS。機箱能阻隔室內冷空氣流動，並利用熱床將箱內被動加熱至 45°C - 60°C 的恆溫環境，大幅減緩冷卻速度。</li>
        <li><strong>熱床溫度：</strong>必須維持在 95°C - 110°C 之間。在開始列印前，建議提前 15 分鐘開啟熱床預熱機箱。</li>
        <li><strong>模型風扇轉速：</strong>大部分時間保持 0% 關閉，僅在過橋（Bridge）和極陡懸垂處短暫開啟 20-30% 低速輔助。</li>
      </ul>

      <h2>三、不可忽視的健康安全：VOC 與苯乙烯微粒防護</h2>
      <p>ABS 在超過 230°C 高溫熔融時，會釋放揮發性有機化合物（VOCs）以及帶有刺鼻氣味的超細苯乙烯顆粒。長期吸入會對呼吸道黏膜造成刺激。<br/>
      <strong>神狗勾安全建議：</strong><br/>
      1. 機台應加裝內循環 HEPA + 柱狀活性碳空氣過濾模組（如 Nevermore 或 Bentobox 系統）。<br/>
      2. 列印作業應在通風良好的獨立工作室進行，嚴禁擺放在臥室或封閉書房中通宵運轉。</p>
    `
  },
  {
    id: 9,
    slug: 'how-to-dry-3d-printer-filament-temperature-chart',
    title: '耗材受潮如何自我診斷？8 大材質烘烤時間與溫度完整對照表',
    excerpt: '線材劈啪響、表面冒氣泡、成品一折就斷？這不是列印機壞了，是線材喝飽了水！本文提供家用烘烤箱溫度時間表與長期防潮收納方案。',
    date: '2026-09-16',
    author: '神狗勾材料實驗室',
    authorTitle: '資深材料工程師',
    category: '新手入門',
    readTime: '6 分鐘',
    tags: ['線材烘烤', '防潮乾燥', '溫度對照表', '受潮徵兆'],
    content: `
      <h2>一、線材受潮的四大經典症狀</h2>
      <p>台灣屬於海島型氣候，夏季平均相對濕度常高達 75% - 85%。塑膠高分子內部有許多極性基團，會自發吸收空氣中的水分：</p>
      <ul>
        <li><strong>列印時有爆裂聲（Popping Sound）：</strong>水分在噴嘴內蒸發瞬間引爆，聽起來像微小的爆米花聲。</li>
        <li><strong>出料線條起伏不平且伴隨蒸汽白煙：</strong>噴出的擠出線表面粗糙，甚至能看見微細水氣上升。</li>
        <li><strong>牽絲與滲料（Oozing）嚴重失控：</strong>蒸汽膨脹產生的內部壓力抵消了回抽效果。</li>
        <li><strong>成品機械強度大幅衰退：</strong>水分子在 200°C 高溫下會引發「高分子水解反應（Hydrolysis）」，切斷長分子鏈，使成品質地脆化脆弱。</li>
      </ul>

      <h2>二、常見 3D 列印耗材烘烤溫度與時間官方對照表</h2>
      <table class="w-full text-left border-collapse my-6 text-sm">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <th class="p-3 font-bold">材質分類</th>
            <th class="p-3 font-bold text-indigo-600 dark:text-indigo-400">建議烘烤溫度 (°C)</th>
            <th class="p-3 font-bold">建議烘烤時間 (小時)</th>
            <th class="p-3 font-bold">吸濕敏感度評估</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">PLA / PLA+</td>
            <td class="p-3 font-bold">45°C - 50°C</td>
            <td class="p-3">4 - 6 小時</td>
            <td class="p-3 text-emerald-600">低（開封數週仍可用）</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">PETG / PETG-CF</td>
            <td class="p-3 font-bold">60°C - 65°C</td>
            <td class="p-3">6 - 8 小時</td>
            <td class="p-3 text-amber-600">中（潮濕環境數天即拉絲）</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">TPU 彈性軟料</td>
            <td class="p-3 font-bold">55°C - 60°C</td>
            <td class="p-3">6 - 10 小時</td>
            <td class="p-3 text-rose-600">高（受潮嚴重起泡發白）</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">ABS / ASA</td>
            <td class="p-3 font-bold">70°C - 80°C</td>
            <td class="p-3">4 - 6 小時</td>
            <td class="p-3 text-amber-600">中</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">PA 尼龍 / PA-CF 碳纖</td>
            <td class="p-3 font-bold">80°C - 90°C</td>
            <td class="p-3">8 - 12 小時</td>
            <td class="p-3 text-rose-700 font-bold">極高（暴露半天即水解）</td>
          </tr>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <td class="p-3 font-medium">PC 聚碳酸酯</td>
            <td class="p-3 font-bold">80°C - 90°C</td>
            <td class="p-3">8 - 10 小時</td>
            <td class="p-3 text-rose-600">高</td>
          </tr>
        </tbody>
      </table>

      <h2>三、烘烤注意事項與神狗勾防潮收納策略</h2>
      <p><strong>注意：烘烤溫度切勿超過材料的玻璃轉移溫度（Tg）！</strong>若將 PLA 放在 60°C 烤箱中，整個料盤上的線材會軟化沾黏融成一坨塑膠大餅，直接報廢。<br/>
      <strong>收納最佳實踐：</strong>拆封未用完的線材，請立刻放回神狗勾加厚真空密封袋，投入至少 2 包食品級矽膠乾燥劑（Silica Gel），並抽真空排除空氣，存放在相對濕度 20% 以下的電子防潮箱內。</p>
    `
  },
  {
    id: 10,
    slug: '3d-printer-nozzle-clog-troubleshooting-cold-pull',
    title: '噴嘴堵塞 (Clog) 自救手冊：冷抽法 (Cold Pull) 與通針操作步驟圖解',
    excerpt: '列印中途突然不出料、擠出機發出咖咖咖跳齒聲？90% 的情況是噴嘴或喉管局部堵塞。學會冷抽法，不用拆卸整組噴頭也能 5 分鐘排除堵料！',
    date: '2026-09-17',
    author: '神狗勾維修部',
    authorTitle: '硬體工程師',
    category: '硬體改裝',
    readTime: '7 分鐘',
    tags: ['噴嘴堵塞', '冷抽法', 'Cold Pull', '硬體排查'],
    content: `
      <h2>一、為什麼噴嘴會堵塞？常見的三大成因</h2>
      <ul>
        <li><strong>熱蠕變（Heat Creep）：</strong>喉管風扇散熱效率不足，或長時間在封箱內印製低熔點的 PLA，導致熱量沿著金屬喉管向上擴散，線材還沒到達加熱塊就在喉管冷端提前融化軟化，冷卻後卡死在進料通道。</li>
        <li><strong>顆粒雜質沉積：</strong>劣質線材中夾雜的灰塵微粒、碳化殘膠，或是碳纖維微粒在 0.4mm 噴嘴孔內形成架橋堵塞。</li>
        <li><strong>換料溫差殘留：</strong>從高溫材料（如 250°C 的 PETG/ABS）換成低溫材料（如 200°C 的 PLA）時，喉管內殘留的高溫料在低溫下無法融化，阻擋了新料的通過。</li>
      </ul>

      <h2>二、神奇自救絕招：原子冷抽法（Atomic Cold Pull）標準流程</h2>
      <p>冷抽法的原理是利用線材在「剛好處於玻璃轉移溫度邊緣」時的半固態特性，讓塑料剛好抓住噴嘴內壁的所有殘渣微粒，然後整根拉出，如同為噴嘴做深層毛孔清潔！建議使用 <strong>Nylon（尼龍）</strong> 或 <strong>清洗專用料</strong>，若無也可用純白色 PLA 代替。</p>
      <ol class="list-decimal pl-6 space-y-3 my-4">
        <li>將噴嘴加熱至 240°C - 250°C，用手動推動一段尼龍或 PLA 線材，直到看見噴嘴孔有少量塑料擠出。</li>
        <li>將加熱棒關閉，讓噴嘴自然降溫至 90°C - 100°C（若使用尼龍可降至 110°C - 120°C）。</li>
        <li>當溫度降到目標溫度時，按住擠出機鬆料卡榫，以垂直向上的方向<strong>乾脆、迅速地將線材猛力拔出</strong>。</li>
        <li>檢查拔出來的線材前端：如果成功，線材尖端會呈現一個完美的「噴嘴內腔倒模錐形」，並且尖端通常會包裹著黑色的碳化雜質顆粒！</li>
        <li>重複上述步驟 2-3 次，直到拔出的線材尖端完全純淨無暇，堵塞即告排除。</li>
      </ol>

      <h2>三、細通針（Accupuncture Needle）輔助法</h2>
      <p>如果是金屬微粒或剛硬雜質卡在噴孔，可將噴嘴加熱至 230°C，從噴嘴正下方垂直向上插入 0.35mm 鋼製通針反覆戳刺 3-5 次，破壞雜質架橋結構，接著立刻執行上述冷抽法將雜質帶出。</p>
    `
  },
  {
    id: 11,
    slug: 'z-banding-and-layer-inconsistency-calibration',
    title: '3D 列印層紋不均與 Z 軸條紋 (Z-Banding) 消除：結構與機械校正全指南',
    excerpt: '明明用了高品質耗材，印出來的模型側面卻總是出現週期性一圈一圈的水平紋路？本文從 Z 軸螺桿、聯軸器、皮帶張力與 PID 溫控全方位排查。',
    date: '2026-09-17',
    author: '神狗勾實驗室',
    authorTitle: '機械自動化工程師',
    category: '切片參數',
    readTime: '8 分鐘',
    tags: ['Z軸紋', 'Z-Banding', '機械校準', '層紋最佳化'],
    content: `
      <h2>一、什麼是 Z 軸條紋（Z-Banding）？</h2>
      <p>Z-Banding 是指模型在垂直高度方向上，表面出現重複、週期性的凸起與凹陷水平環紋。當用手指觸摸模型外表面時，會感受到明顯的波浪起伏感。這通常代表某一高度處的擠出塑料被過度擠壓橫向擴展，而下一高度處又出料收縮。</p>

      <h2>二、四大核心肇因與排查清單</h2>
      <h3>1. 週期性條紋（螺桿螺距週期吻合）</h3>
      <p>若紋路間距剛好等於 T8 導程螺桿的螺距（通常為 2mm、4mm 或 8mm），問題 100% 來自 Z 軸機械傳動組件：</p>
      <ul>
        <li><strong>螺桿彎曲偏擺：</strong>螺桿在旋轉時產生擺動，推擠 X 軸橫樑前後位移。建議更換為高精度研磨螺桿或加裝 Oldham 浮動聯軸器。</li>
        <li><strong>固定螺絲鎖太死：</strong>Z 軸銅螺母若鎖得太死，無法吸收微量公差。適當放鬆銅螺母的兩顆固定螺絲半圈，保留微量浮動餘裕。</li>
      </ul>

      <h3>2. 熱床 / 噴嘴 PID 溫度震盪（熱脹冷縮效應）</h3>
      <p>許多人不知道，如果熱床溫度在設定的 60°C 上下以 ±4°C 的幅度週期性擺動，鋁合金熱床與彈簧鋼板會因為熱脹冷縮週期性膨脹微米級厚度，造成每隔幾分鐘就出現一層厚度突變！<br/>
      <strong>解決方案：</strong>在機器選單中重新執行「PID 自動校準（PID Autotune）」，讓熱床與噴嘴溫度波動壓制在 ±0.3°C 以內。</p>

      <h3>3. 耗材線徑不均勻（外徑公差過大）</h3>
      <p>若購買了劣質便宜雜牌耗材，線徑在 1.62mm 到 1.88mm 之間劇烈波動，即使步進馬達旋轉角度完全精確，擠出的體積依然會暴增或暴減，形成隨機的不規則層紋。<br/>
      <strong>解決方案：</strong>使用神狗勾商城嚴選的 0.02mm 高精度光學線徑檢驗線材，從材料端徹底杜絕出料波動。</p>
    `
  },
  {
    id: 12,
    slug: 'perfect-first-layer-and-flow-calibration-guide',
    title: '第一層厚度 (Z-Offset) 與擠出流量 (Flow Rate) 終極校正：印出如鏡面般底面',
    excerpt: '第一層決定了 3D 列印 80% 的成功率。如何將 Z-Offset 調校到微米級完美高度？如何使用雙壁方塊精確算出切片軟體的擠出流量倍率？',
    date: '2026-09-18',
    author: '神狗勾技術團隊',
    authorTitle: '資深軟韌體工程師',
    category: '新手入門',
    readTime: '7 分鐘',
    tags: ['Z-Offset', '流量校正', 'FlowRate', '第一層'],
    content: `
      <h2>一、第一層好壞的三種狀態圖解</h2>
      <ul>
        <li><strong>太遠（Too High）：</strong>擠出的線條呈現鬆散的圓柱狀，彼此無法熔合在一起，熱床抓地力極弱，輕碰即脫落，邊緣瞬間翹起。</li>
        <li><strong>太近（Too Low）：</strong>噴嘴刮蹭到底板，出料被擠扁成半透明薄膜，多餘的熔料被擠出並在兩側形成尖銳的波浪狀毛刺（Ridges），嚴重時噴嘴會刮傷 PEI 塗層甚至直接堵料。</li>
        <li><strong>完美黃金高度（Just Right）：</strong>相鄰線條緊密交融成一整片平滑無縫的均勻平面，表面手感平整微凸，撕下後背面呈現均勻緊實的細膩紋路。</li>
      </ul>

      <h2>二、單層大方塊即時微調法</h2>
      <p>建議切片一個 100mm x 100mm、厚度 0.2mm 的單層薄片模型。在列印進行時，蹲在機器旁透過螢幕的微調選單，以 0.01mm 為單位逐步上下調整 Z-Offset，直到肉眼觀察到每條擠出線之間完全無縫，且噴嘴在走過時不會帶起塑料毛邊為止。</p>

      <h2>三、精準計算擠出流量倍率（Flow Calibration）</h2>
      <p>不同廠牌或不同材質的線材，由於硬度與齒輪咬合深度不同，實際出料量往往與切片預設有 3% - 8% 的偏差：</p>
      <ol class="list-decimal pl-6 space-y-2 my-4">
        <li>切片一個 30x30x30 mm 的無頂蓋、無填充、2 圈外壁的立方體（Flow Cube）。</li>
        <li>設定外壁線寬為 0.45 mm，因此兩圈外壁的理論總厚度為 0.90 mm。</li>
        <li>列印完成後，使用數位電子游標卡尺量測四個外壁中央厚度，取平均值（假設量出為 0.96 mm）。</li>
        <li>新流量倍率公式：<strong>新流量 = 原流量 x (理論厚度 0.90 / 實測厚度 0.96)</strong>。將算出來的數值填入切片軟體的「擠出倍率（Extrusion Multiplier）」中即可。</li>
      </ol>
    `
  },
  {
    id: 13,
    slug: 'orcaslicer-bambu-studio-advanced-pressure-advance',
    title: 'OrcaSlicer 與 Bambu Studio 必學進階切片功能：壓力提前 (Pressure Advance)',
    excerpt: '為什麼模型的直角轉角總是鼓包外凸？減速處出料過剩、加速處出料不足？掌握壓力提前 (PA / Linear Advance) 校準，讓轉角銳利無比！',
    date: '2026-09-18',
    author: '神狗勾研發部',
    authorTitle: '切片演算法專員',
    category: '切片參數',
    readTime: '9 分鐘',
    tags: ['OrcaSlicer', 'BambuStudio', '壓力提前', 'LinearAdvance'],
    content: `
      <h2>一、噴嘴內的彈性流體延遲現象</h2>
      <p>3D 列印線材並不是堅硬的鋼筋，高溫塑料在噴嘴內部像是一根被壓縮的彈簧。當擠出機加速移動到轉角處減速轉彎時，由於噴嘴內部的殘存蓄壓，即使步進馬達已經減速，塑料依然會源源不絕被擠出，造成<strong>轉角處鼓起一個難看的大肉包（Corner Bulge）</strong>。</p>
      <p>反之，當轉彎完畢重新加速時，由於建立腔體壓力需要時間，又會導致<strong>加速段初期出料不足形成細孔</strong>。</p>

      <h2>二、壓力提前（Pressure Advance / Linear Advance）的作用</h2>
      <p>壓力提前演算法會提前計算出噴嘴在加減速過程中的腔體壓力變化：在噴嘴即將到達轉角前，擠出機提前放鬆推擠力道；在轉彎剛起步瞬間，擠出機提前大力增壓。這讓噴嘴的實際出料量與機台運動速度達成毫秒級同步！</p>

      <h2>三、使用 OrcaSlicer 一鍵校準 PA 數值</h2>
      <p>OrcaSlicer 提供了極其強大的內建標定工具（Calibration Menu）：</p>
      <ul>
        <li><strong>PA Line 標定法：</strong>列印數十條短線，每條線在中央會有一次急停轉折，觀察哪一條線在轉折處寬度最均勻，讀取該行的 K 值。</li>
        <li><strong>PA Pattern / Tower 標定法：</strong>列印一個帶有銳角外凸的測試塔，手摸四個直角角柱，找到最筆直、完全沒有鼓起突起的一層高度。</li>
        <li><strong>典型數值參考：</strong>近端擠出機的高速 PLA 數值通常在 0.015 - 0.035 之間；PETG 通常在 0.030 - 0.050 之間。</li>
      </ul>
    `
  },
  {
    id: 14,
    slug: 'tree-supports-optimization-guide-clean-removal',
    title: '樹狀支撐 (Tree Supports) 參數最佳化：好拆、無痕、省料 60% 的完美平衡',
    excerpt: '拆支撐拆到滿手水泡、模型表面坑坑洞洞像月球表面？樹狀支撐是公仔與異形結構的救星。本文教你調整頂層接觸面與 Z 軸間隙，一撕即掉不留痕！',
    date: '2026-09-19',
    author: '神狗勾實驗室',
    authorTitle: '3D 模型後製技師',
    category: '切片參數',
    readTime: '6 分鐘',
    tags: ['樹狀支撐', '拆支撐', '接觸面參數', '切片技巧'],
    content: `
      <h2>一、傳統網格支撐 vs 樹狀有機支撐（Organic / Tree）</h2>
      <p>傳統的柱狀網格支撐（Standard Supports）從底板一路垂直向上生長，不僅耗費極多線材，而且會將模型的大面積下表面完全包覆，拆卸時常需要動用斜口鉗、尖嘴鉗暴力啃咬，極易刮傷模型本體。</p>
      <p>樹狀支撐則像樹枝一樣從底板或模型邊緣生長分叉，並以極小的「支撐葉片尖端」精確點擊在需要支撐的懸空點上。平均能<strong>節省 40% - 65% 的列印時間與耗材消耗</strong>！</p>

      <h2>二、讓樹狀支撐「一撕即落」的黃金四參數</h2>
      <ul>
        <li><strong>頂部 Z 軸距離（Top Z Distance）：</strong>支撐頂層與模型懸垂面之間的垂直空氣縫隙。如果設 0，支撐會與模型焊死；設太遠，懸空面會下垂拉絲。<br/>
        <strong>黃金建議值：</strong>使用 0.2mm 層高列印時，建議設定在 <strong>0.20 mm - 0.22 mm</strong>（剛好等於一層層高），能達到乾脆俐落的脫模效果。</li>
        <li><strong>頂部接觸層數（Top Interface Layers）：</strong>建議設定為 <strong>3 - 4 層</strong>。這會在樹枝頂端形成一片平整的緊密薄墊，能有效分散支撐點壓力，避免單點凹陷。</li>
        <li><strong>接觸層圖案（Interface Pattern）：</strong>推薦選擇「同心圓（Concentric）」，比傳統的直線往復更容易撕扯分離。</li>
        <li><strong>分枝角度（Branch Angle）：</strong>建議設為 40° - 45°，避免樹枝過於水平導致支撐本體自己發生懸垂坍塌。</li>
      </ul>
    `
  },
  {
    id: 15,
    slug: 'maximizing-3d-print-strength-infill-vs-walls',
    title: '3D 列印結構零件強度最大化：外壁圈數 (Walls) 與填充率 (Infill) 的力學分析',
    excerpt: '想印出能承受 50 公斤踩踏的高強度零件，直接把填充開到 100% 嗎？錯！力學測試證明：增加外壁圈數的效益遠大於死命塞填充。',
    date: '2026-09-19',
    author: '神狗勾材料實驗室',
    authorTitle: '資深結構分析師',
    category: '進階技巧',
    readTime: '8 分鐘',
    tags: ['零件強度', '外壁圈數', '填充率', '陀螺儀填充'],
    content: `
      <h2>一、破除迷思：100% 填充率真的最堅固嗎？</h2>
      <p>許多新手在需要印製高強度零件時，第一反應就是把切片軟體的填充率（Infill Density）直接拉到 100%。但這往往帶來三大副作用：列印時間暴增 3-4 倍、耗材消耗巨大，且由於內部散熱困難累積過多殘餘應力，零件內部反而容易產生微裂紋。</p>
      <p>從材料力學的「慣性矩（Moment of Inertia）」公式可知，受彎曲或扭轉應力時，最外層的纖維承受了絕大部分的張力與壓力（I 型鋼與竹子空心原理）。</p>

      <h2>二、實測對比：外壁圈數 vs 填充率</h2>
      <p>神狗勾實驗室針對標準拉伸樣條進行三點彎曲破壞測試：</p>
      <ul>
        <li><strong>樣品 A（2 圈外壁 + 80% 網格填充）：</strong>承受載重 28 kgf 即發生層裂。</li>
        <li><strong>樣品 B（5 圈外壁 + 25% 陀螺儀填充）：</strong>耗材用量僅為 A 的 60%，但承受載重飆升至 <strong>62 kgf</strong>！</li>
      </ul>
      <p><strong>結論：增加 1 圈外壁（Perimeter / Wall loops），帶來的抗彎曲與抗扭轉強度相當於增加 20% 的內部填充！</strong>在大多數功能性零件中，將外壁設定為 4 - 6 圈，頂部/底部實心層設定為 5 - 6 層，內部搭配 25% - 35% 填充，即可達到卓越的工業級強度。</p>

      <h2>三、最推薦的填充圖案：陀螺儀（Gyroid）</h2>
      <p>傳統的網格（Grid）或三角形填充在同一個層面上線條會互相交叉碰撞，高速時噴嘴常撞擊發出喀喀聲，且受力具有強烈方向性。<br/>
      <strong>陀螺儀填充（Gyroid Infill）：</strong>線條永不交叉，且呈現三維均勻連續的三向受力特性（各向同性強度最高），能讓液態樹脂或膠水完美穿透，是功能結構件的首選！</p>
    `
  },
  {
    id: 16,
    slug: 'annealing-3d-prints-heat-resistance-boost',
    title: '3D 列印後處理退火 (Annealing) 實務：大幅提升耐熱溫度與層間熔合強度',
    excerpt: 'PLA 遇到 60°C 熱水就變軟軟趴趴？透過烤箱低溫「退火」工藝，重新排列高分子結晶微結構，讓 PLA 也能承受近 100°C 高溫！',
    date: '2026-09-19',
    author: '神狗勾材料實驗室',
    authorTitle: '資深材料工程師',
    category: '進階技巧',
    readTime: '7 分鐘',
    tags: ['退火工藝', 'Annealing', '耐熱提升', '高分子結晶'],
    content: `
      <h2>一、什麼是高分子退火（Annealing）？</h2>
      <p>FDM 列印出的塑膠零件，因為在噴嘴擠出後被風扇急遽降溫淬火，內部的高分子鏈處於高度混亂、無定型（Amorphous）的凍結狀態，結晶度通常低於 10%。這也是為什麼 PLA 在達到玻璃轉移溫度（約 60°C）時，分子鏈便能輕易滑動軟化。</p>
      <p>退火就是將成品放置在「玻璃轉移溫度（Tg）之上、熔點（Tm）之下」的特定溫度環境中保持一定時間。此時高分子鏈獲得足夠能量重新伸展摺疊，形成緻密有序的球晶結構（Spherulites），使結晶度大幅提升至 40% - 50% 以上！</p>

      <h2>二、退火帶來的三大飛躍性提升</h2>
      <ul>
        <li><strong>耐溫極限狂升：</strong>經過適當退火改質的高性能 PLA（如神狗勾 Tough PLA），熱變形溫度（HDT）可從原本的 58°C 劇增至 <strong>95°C - 105°C</strong>，直接浸入滾燙沸水中依然堅挺！</li>
        <li><strong>層間熔合強度增強：</strong>分子鏈跨越相鄰層間界面擴散纏結，將弱點層紋徹底縫合，抗衝擊韌性提升約 30% - 40%。</li>
      </ul>

      <h2>三、退火操作步驟與「尺寸收縮補償」秘技</h2>
      <ol class="list-decimal pl-6 space-y-2 my-4">
        <li><strong>設定烤箱：</strong>普通家用電烤箱溫度波動大，建議使用帶熱風循環的恆溫烤箱，設定在 90°C - 100°C。</li>
        <li><strong>鹽浴或細砂支撐（防止重力變形）：</strong>高分子在剛軟化時容易因自重塌陷。強烈建議將零件完全埋入極細的食用鹽或石英砂中，均勻傳熱並提供全方位物理支撐。</li>
        <li><strong>保溫時間：</strong>依零件壁厚，每 1mm 壁厚保溫約 10-15 分鐘，通常整體保溫 30-45 分鐘，隨後關閉烤箱使其<strong>隨爐自然緩慢冷卻至室溫</strong>。</li>
        <li><strong>預留縮水率補償：</strong>結晶化會使零件體積收縮！在 X/Y 軸方向通常會收縮約 1.5% - 2.0%，而在 Z 軸垂直方向則會膨脹約 1.0%。切片時可事先在軟體中放大尺寸以做幾何補償。</li>
      </ol>
    `
  },
  {
    id: 17,
    slug: 'filament-diameter-tolerance-and-optical-inspection',
    title: '耗材線徑精度與公差解析：為什麼 ±0.02mm 公差能防止 99% 的卡機悲劇？',
    excerpt: '市售便宜耗材寫 ±0.05mm，神狗勾嚴選堅持 ±0.02mm，這小小的 0.03mm 差距到底有多重要？揭開雙軸雷射即時光學檢測的品管秘密。',
    date: '2026-09-20',
    author: '神狗勾品保中心',
    authorTitle: '品管總監',
    category: '耗材評測',
    readTime: '6 分鐘',
    tags: ['線徑公差', '雷射檢驗', '品質控管', '0.02mm'],
    content: `
      <h2>一、線徑公式：圓柱體積與半徑平方的放大效應</h2>
      <p>標準消費級 3D 列印線材的標稱直徑為 1.75 mm。很多人以為 0.05mm 的誤差微不足道，但讓我們回歸基礎幾何學：圓截面積公式為 $A = \\pi \\times r^2$。出料體積是與半徑的<strong>平方</strong>成正比！</p>
      <ul>
        <li>當線徑為 1.75 mm 時，橫截面積為 2.405 mm²。</li>
        <li>若線徑暴衝至 1.83 mm（+0.08mm 劣質偏差），橫截面積來到 2.630 mm²，<strong>出料量瞬間暴增近 10%！</strong>這會直接把噴嘴塞爆，在喉管形成巨大回壓卡死。</li>
        <li>反之，若線徑縮水至 1.67 mm，出料量瞬間減少 9%，模型表面立刻出現肉眼可見的空洞與層間開裂。</li>
      </ul>

      <h2>二、雙軸雷射光學測徑儀的即時監控流程</h2>
      <p>神狗勾商城的每一條出廠耗材，在擠出冷卻水槽後，都會經過工業級雙軸（X軸與Y軸）高頻雷射測徑儀：</p>
      <ul>
        <li>以每秒超過 1,000 次的超高頻率，360 度無死角量測線材的真圓度（Ovality）與外徑。</li>
        <li>只要連續 10 公分內線徑超過 ±0.02mm 的嚴苛公差範圍，自動切料伺服系統立刻觸發報警並予以剔除。</li>
        <li>這確保您拿到的每一卷神狗勾線材，從第一公尺到第一千公尺，出料流速始終保持微米級精準一致，讓高速拓竹 AMS 與 K1C 永不停機！</li>
      </ul>
    `
  },
  {
    id: 18,
    slug: 'eco-friendly-3d-printing-pla-recycling-spool-reuse',
    title: '3D 列印環保實務：廢料回收、空盤再利用與 PLA 生物降解真實探討',
    excerpt: '滿地的廢棄支撐、失敗列印和堆積如山的空線盤怎麼辦？PLA 丟土裡真的會自然降解嗎？神狗勾帶你探索永續 3D 列印與空盤換幣循環經濟。',
    date: '2026-09-20',
    author: '神狗勾綠色永續小組',
    authorTitle: 'ESG 專案主任',
    category: '新手入門',
    readTime: '7 分鐘',
    tags: ['環保回收', 'PLA降解', '空盤換積分', '永續創客'],
    content: `
      <h2>一、戳破迷思：PLA 埋在花盆裡真的會自己消失嗎？</h2>
      <p>PLA（聚乳酸）常被標榜為「綠色環保、生物可降解」。這讓許多玩家誤以為把失敗的 PLA 零件隨意丟進後花園土壤或堆肥箱，過幾個月就會變成肥料。<br/>
      <strong>殘酷的科學真相：</strong>PLA 必須在<strong>工業堆肥環境（Industrial Composting）</strong>下——即溫度維持在 58°C - 65°C、濕度高達 90% 且具備專屬嗜熱微生物群的條件下，才會在 60 至 90 天內分解為水與二氧化碳。在一般的常溫海水或普通土壤中，PLA 的降解速度與一般傳統塑膠幾乎沒有顯著差異（需耗時數百年）！</p>

      <h2>二、創客必學的四大減廢實踐</h2>
      <ol class="list-decimal pl-6 space-y-3 my-4">
        <li><strong>善用神狗勾「空盤回收換積分」機制：</strong>不要把塑膠線盤當垃圾丟棄！神狗勾商城提供空盤回收集點服務，每回收一個完整線盤即可兌換商城創客紅利，再製成再生無軸線材。</li>
        <li><strong>分類收集不同材質廢料：</strong>將 PLA、PETG、ABS 嚴格分箱放置。混入雜質的碎料無法再次拉絲，純淨的單一材質碎料才能送入小型粉碎造粒機重新擠出再生線。</li>
        <li><strong>無軸補充包（Refill Spool）是未來趨勢：</strong>選購免線盤的補充包線材，重複使用可拆卸式的卡扣主軸，直接從源頭省去 80% 的塑膠包裝浪費。</li>
        <li><strong>校準第一層防失敗：</strong>預防勝於治療。每次更換材質確實做好調平和切片預覽，能直接減少 90% 因翹邊撞機產生的廢料。</li>
      </ol>
    `
  }
];
