import React from 'react';
import { 
  Building2, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  Gauge,
  ShieldCheck
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { LanguageCode } from '../../types';

interface AboutUsProps {
  lang?: LanguageCode;
}

const CONTENT: Record<LanguageCode, {
  seoTitle: string;
  seoDesc: string;
  badge: string;
  title: string;
  subtitle: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  storyHeading: string;
  storyP1: string;
  storyP2: string;
  qaHeading: string;
  qaIntro: string;
  qaItem1: { title: string; desc: string };
  qaItem2: { title: string; desc: string };
  qaItem3: { title: string; desc: string };
  recycleHeading: string;
  recycleDesc: string;
  workshopHeading: string;
  addressLabel: string;
  addressVal: string;
  emailLabel: string;
  emailVal: string;
  phoneLabel: string;
  phoneVal: string;
  hoursLabel: string;
  hoursVal: string;
  websiteLabel: string;
  securityLabel: string;
}> = {
  'zh-TW': {
    seoTitle: '關於我們 - 神狗勾 3D 耗材商城與創客實驗室',
    seoDesc: '深入認識神狗勾 3D 創客團隊：專注於高速 3D 列印線材研發、±0.02mm 雙軸光學測徑品管、12 台主流高速印表機實測驗證與台灣在地實體創客工作室。',
    badge: '台灣在地專業 3D 列印材料研發與品保品牌',
    title: '關於神狗勾 3D 創客實驗室',
    subtitle: '我們是一群熱愛 3D 列印、開源硬體與高分子材料工程的台灣創客。因為自己深知「印到一半卡料、受潮牽絲、公差不良」的痛苦，所以創立了神狗勾商城，為創客帶來真正值得信賴的高速線材。',
    pillar1Title: '±0.02mm 雙軸光學檢測',
    pillar1Desc: '引進工業級高頻雙軸雷射測徑儀，以每秒 1,000 次頻率 360 度監控線徑真圓度，公差牢牢鎖定在 ±0.02mm，拒絕卡機與出料不均。',
    pillar2Title: '12 台旗艦機隊實機驗證',
    pillar2Desc: '實驗室常設 Bambu Lab X1C / P1S / A1 mini、Creality K1 Max、Voron 2.4 等主力機種，每批次耗材均通過 600mm/s 長時間極速列印實測。',
    pillar3Title: '高阻隔鋁箔真空防潮',
    pillar3Desc: '針對台灣高溫高濕海島氣候，全面採用加厚金屬鋁箔真空複合袋與高吸水量乾燥劑封裝，確保開封第一口就擁有極致乾爽。',
    storyHeading: '創辦初衷：從一次長達 38 小時的失敗列印說起',
    storyP1: '在 2023 年的一個週末，我們團隊正在進行一組無人機大型空拍機架的原型打樣。在列印進行到第 37 小時 40 分鐘時，一卷市售便宜耗材因為中途線徑暴衝到 1.91mm，狠狠卡死在擠出機喉管中。不僅整件作品報廢、耗損近千元耗材，還花費了整整四個小時拆卸清料管。',
    storyP2: '這次慘痛的經驗讓我們深刻體會：3D 列印最昂貴的成本不是耗材本身，而是創客的時間與寶貴心血！如果材料品質不穩定，再精準的印表機也只是擺設。因此，「神狗勾 3D 創客實驗室」應運而生。我們的唯一目標，就是讓每一位創客按下列印鍵後，都能安心去睡覺，隔天早上醒來迎接完美的成品。',
    qaHeading: '嚴謹的品質管理與研發標準',
    qaIntro: '神狗勾商城所上架的每一款線材（包括高速 Hyper PLA、耐候 PETG、工業級 PA-CF 碳纖維尼龍與高彈性 TPU），皆經過多道嚴苛驗證手續：',
    qaItem1: {
      title: '熔融指數（MFI）均一性測試：',
      desc: '確保同一批次線材在相同溫度下具備均勻的流體黏度，杜絕外觀發白與跳層。'
    },
    qaItem2: {
      title: '拓竹 AMS 自動換料機相容性認證：',
      desc: '輪盤邊緣強化耐磨塗層，在百次進料與退料測試中無打滑、無卡盤。'
    },
    qaItem3: {
      title: 'RoHS 與 REACH 無毒環保檢驗：',
      desc: '絕不使用回收二次廢料混充，列印過程中無刺鼻重金屬異味，守護創客呼吸健康。'
    },
    recycleHeading: '永續創客計畫：空盤回收換積分',
    recycleDesc: '熱愛造物的同時，我們也深知塑膠廢棄物對環境的負擔。神狗勾開創了台灣首見的「空盤回收循環機制」：凡購買本商城線材使用完畢之空膠盤，均可於下次購物時累積換購創客紅利積分，或是郵寄回實驗室進行回收再造。我們致力於推動可拆卸式無軸補充包（Refill Spool），從源頭減少包裝浪費。',
    workshopHeading: '實體創客工作室與營業資訊',
    addressLabel: '工作室地址：',
    addressVal: '嘉義縣民雄鄉福樂村埤角1-50號（歡迎預約自取參觀）',
    emailLabel: '官方客服信箱：',
    emailVal: 'babe0615@gmail.com',
    phoneLabel: '技術諮詢電話：',
    phoneVal: '+886 911331772',
    hoursLabel: '營業時間：',
    hoursVal: '週一至週五 09:00 - 18:00（國定例假日除外）',
    websiteLabel: '官方網站：https://goddog.space',
    securityLabel: '金流交易安全：藍新金流 NewebPay SSL 256-bit 加密安全傳輸認證'
  },
  'en': {
    seoTitle: 'About Us - GodDog 3D Filament Store & Maker Lab',
    seoDesc: 'Learn about the GodDog 3D Maker Team: Dedicated to high-speed 3D printing filament R&D, ±0.02mm dual-axis laser optical caliper QA, 12 flagship high-speed test rigs, and local physical maker laboratory.',
    badge: 'Taiwan Professional 3D Printing Materials R&D & Quality Assurance',
    title: 'About GodDog 3D Maker Laboratory',
    subtitle: 'We are a team of Taiwanese makers passionate about 3D printing, open hardware, and polymer materials engineering. Because we know the pain of mid-print clogs, moisture stringing, and inconsistent tolerances, we founded GodDog Store to bring makers truly dependable high-speed filaments.',
    pillar1Title: '±0.02mm Dual-Axis Laser Inspection',
    pillar1Desc: 'Equipped with industrial dual-axis high-frequency laser micrometers sampling 1,000 times/sec to monitor true roundness, locking diameter strictly within ±0.02mm to eliminate clogs and under-extrusion.',
    pillar2Title: '12-Printer Flagship Test Fleet',
    pillar2Desc: 'Our lab maintains Bambu Lab X1C, P1S, A1 mini, Creality K1 Max, and Voron 2.4 test printers. Every batch is rigorously certified with sustained 600 mm/s high-speed printing test runs.',
    pillar3Title: 'Heavy-Duty Aluminum Foil Vacuum Pack',
    pillar3Desc: 'Tailored for humid subtropical climates, every spool is sealed in thickened aluminum composite vacuum pouches with high-capacity desiccant, ensuring razor-sharp dryness on opening.',
    storyHeading: 'Our Genesis: A 38-Hour Failed Print Story',
    storyP1: 'Over a weekend in 2023, our engineering crew was prototyping a large custom aerial drone chassis. 37 hours and 40 minutes into the job, a cheap generic filament surged in diameter to 1.91mm and jammed the extruder throat rock-solid. The print was ruined, hundreds of dollars were lost, and clearing the hotend took four painful hours.',
    storyP2: 'This setback taught us a vital lesson: The most costly aspect of 3D printing is not the filament itself—it is your time and dedication! If raw materials fluctuate, even the finest printer cannot deliver. Thus, GodDog 3D Maker Lab was born with one simple mission: so every maker can press print, sleep soundly, and awaken to flawless prototypes.',
    qaHeading: 'Rigorous Quality Control & Material Standards',
    qaIntro: 'Every filament cataloged on GodDog (including High-Speed Hyper PLA, Weatherproof PETG, Industrial PA-CF Carbon Fiber, and Flexible TPU) undergoes uncompromising QA:',
    qaItem1: {
      title: 'Melt Flow Index (MFI) Homogeneity Testing: ',
      desc: 'Guarantees batch-to-batch fluid viscosity consistency at working temps, preventing layer discoloration and ghosting.'
    },
    qaItem2: {
      title: 'Bambu Lab AMS Multi-Color Compatibility: ',
      desc: 'Abrasion-resistant spool rims tested over 100+ feed and retraction cycles with zero slip or binding.'
    },
    qaItem3: {
      title: 'RoHS & REACH Eco-Compliance: ',
      desc: 'Zero recycled junk scrap fillers. Odorless, non-toxic, and free of harsh fumes during hot extrusion.'
    },
    recycleHeading: 'Sustainable Maker Initiative: Spool Recycling Program',
    recycleDesc: 'As passionate makers, we take plastic packaging waste seriously. GodDog pioneered Taiwan\'s first spool recycling circular loop: empty spools purchased from us can be redeemed for maker reward points or mailed back to our lab for repurposing. We also provide spool-less refill packs to eliminate waste at the source.',
    workshopHeading: 'Physical Workshop & Business Information',
    addressLabel: 'Studio Address: ',
    addressVal: 'No. 1-50, Pijiao, Fule Village, Minxiong Township, Chiayi County 621, Taiwan',
    emailLabel: 'Official Customer Service: ',
    emailVal: 'babe0615@gmail.com',
    phoneLabel: 'Technical Support Hotline: ',
    phoneVal: '+886 911331772',
    hoursLabel: 'Business Hours: ',
    hoursVal: 'Monday to Friday 09:00 - 18:00 (National Holidays Excepted)',
    websiteLabel: 'Official Website: https://goddog.space',
    securityLabel: 'Payment Gateway: NewebPay SSL 256-bit Encrypted Transmission Certified'
  },
  'ja': {
    seoTitle: '会社概要・ラボ案内 - 神狗勾 (GodDog) 3Dフィラメントストア',
    seoDesc: '神狗勾 3D メイカーチーム：超高速 3D プリンター用フィラメント研究開発、±0.02mm 2軸レーザー測定品質管理、12台の実機検証フリート、台湾自社工房のご紹介。',
    badge: '台湾発 プロ仕様 3D プリンティング材料開発・品質保証ブランド',
    title: '神狗勾 (GodDog) 3D メイカーラボについて',
    subtitle: '私たちは 3D プリンティング、オープンソースハードウェア、高分子高機能材料工学を深く愛する台湾のメイカー集団です。「印刷途中のノズル詰まり・吸湿糸引き・線径公差ムラ」の苦痛を誰よりも知っているからこそ、メイカーが心から信頼できる超高速フィラメントストアを設立しました。',
    pillar1Title: '±0.02mm 2軸高精度レーザー測定',
    pillar1Desc: '工業用高周波2軸レーザー外径測定器を導入。毎秒1,000回のサンプリングで線径と真円度を全数360度監視し、公差を±0.02mm以内に厳格に維持。送りムラや詰まりを防止します。',
    pillar2Title: '主力12機種による実機検証フリート',
    pillar2Desc: 'Bambu Lab X1C / P1S / A1 mini、Creality K1 Max、Voron 2.4 などの最新鋭機を常設。すべてのロットで最高 600 mm/s の連続長時間高速プリントテストを実施・クリアしています。',
    pillar3Title: 'アルミ防湿真空シールド包装',
    pillar3Desc: '高温多湿な亜熱帯気候に対応するため、厚手アルミラミネート真空袋と大容量シリカゲル乾燥剤で完全密封。開封直後から最高レベルの乾燥状態をお届けします。',
    storyHeading: '創業のきっかけ：38時間に及ぶ失敗プリントの教訓',
    storyP1: '2023年のある週末、私たちのチームは大型ドローンフレームのプロトタイプを造形していました。プリント開始から37時間40分が経過したその時、市販の安価なフィラメントの線径が突如1.91mmまで太くなり、エクストルーダーのノズル喉管に強烈に噛み込んで完全停止。造形物は全滅し、復旧作業に4時間も費やしました。',
    storyP2: 'この痛恨の経験から学んだこと――それは「3Dプリントで最も高価なコストは材料費ではなく、メイカーの時間と情熱である」ということでした。材料の品質が不安定なら、どんな高性能プリンターも意味を成しません。こうして神狗勾 3D メイカーラボは誕生しました。私たちの使命は、メイカーがプリント開始ボタンを押したあと、安心して眠りにつき、翌朝完璧な完成品と出会える環境を作ることです。',
    qaHeading: '徹底した品質管理と材料開発基準',
    qaIntro: '神狗勾ストアに並ぶすべての線材（超高速 Hyper PLA、高耐候 PETG、産業級 PA-CF 炭素繊維ナイロン、柔軟弾性 TPU）は、以下の厳格な検証プロセスを通過しています：',
    qaItem1: {
      title: 'メルトフローレート（MFI）均一性試験：',
      desc: '同一ロットにおける溶融樹脂粘度の均一性を徹底確保。白化や積層割れを防ぎます。'
    },
    qaItem2: {
      title: 'Bambu Lab AMS 多色給排システム完全認証：',
      desc: 'スプール外周のエッジ摩耗対策を強化。100回以上の連続フィード＆リトラクトテストでスリップや噛み込みゼロを実現。'
    },
    qaItem3: {
      title: 'RoHS & REACH 環境安全規格準拠：',
      desc: '二次再生廃プラスチックの混入は一切不使用。造形中の有害な異臭や重金属排出がなく、クリーンな作業空間を守ります。'
    },
    recycleHeading: 'サステナブル活動：空スプール回収ポイント還元',
    recycleDesc: 'ものづくりを愛する者として、プラスチック廃棄物の環境負荷にも真摯に向き合っています。神狗勾では、使用済み空スプールをご返送いただくことで次回のお買い物で使えるメイカーポイントを進呈するリサイクルプログラムを実施。スプールレスなリフィル（Refill）補充パックの普及にも力を注いでいます。',
    workshopHeading: '実店舗工房・事業者情報',
    addressLabel: '工房所在地：',
    addressVal: '台湾 嘉義県民雄郷福楽村埤角1-50号（事前予約による店頭受取・見学可能）',
    emailLabel: '公式サポート窓口：',
    emailVal: 'babe0615@gmail.com',
    phoneLabel: '技術相談ダイヤル：',
    phoneVal: '+886 911331772',
    hoursLabel: '営業時間：',
    hoursVal: '月曜〜金曜 09:00 - 18:00（祝祭日除く）',
    websiteLabel: '公式サイト：https://goddog.space',
    securityLabel: '決済セキュリティ：NewebPay 藍新金流 SSL 256-bit 暗号化安全認証'
  }
};

export const AboutUs: React.FC<AboutUsProps> = ({ lang: propLang }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const c = CONTENT[activeLang] || CONTENT['zh-TW'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 mt-2">
      <SEO 
        title={c.seoTitle} 
        description={c.seoDesc} 
        url="/about" 
      />

      {/* Header Banner */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{c.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {c.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      {/* Key Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Gauge className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{c.pillar1Title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {c.pillar1Desc}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{c.pillar2Title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {c.pillar2Desc}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{c.pillar3Title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {c.pillar3Desc}
          </p>
        </div>
      </div>

      {/* Brand Story & Editorial Depth */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8 mb-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {c.storyHeading}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {c.storyP1}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {c.storyP2}
          </p>
        </section>

        <section className="space-y-4 border-t border-slate-100 dark:border-slate-700/60 pt-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {c.qaHeading}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {c.qaIntro}
          </p>
          <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>{c.qaItem1.title}</strong>{c.qaItem1.desc}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>{c.qaItem2.title}</strong>{c.qaItem2.desc}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>{c.qaItem3.title}</strong>{c.qaItem3.desc}</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 border-t border-slate-100 dark:border-slate-700/60 pt-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {c.recycleHeading}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {c.recycleDesc}
          </p>
        </section>
      </div>

      {/* Workshop Location & Contact Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>{c.workshopHeading}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{c.addressLabel}{c.addressVal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{c.emailLabel}{c.emailVal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{c.phoneLabel}{c.phoneVal}</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <div>{c.hoursLabel}{c.hoursVal}</div>
            <div>{c.websiteLabel}</div>
            <div>{c.securityLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
