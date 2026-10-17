import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { LanguageCode } from '../../types';

interface RefundPolicyProps {
  lang?: LanguageCode;
}

const contentByLang = {
  'zh-TW': {
    title: '退換貨政策',
    lead: '為了提供您良好的購物體驗，神狗勾耗材商城提供優於業界的退換貨保障機制。',
    sec1Title: '七天鑑賞期權益',
    sec1Desc: '依據消費者保護法規定，您享有商品到貨次日起 7 天猶豫期（鑑賞期）的權益。但請注意：猶豫期並非試用期。您所退回的商品必須是全新的狀態、而且完整包裝（含商品本體、配件、贈品、保證書、原廠包裝及所有附隨文件或資料的完整性），切勿缺漏任何配件或損毀原廠外盒。',
    sec2Title: '特殊耗材退換貨規範 (重要)',
    sec2Desc: '由於 3D 列印線材（如 PLA, PETG, ABS, TPU 等）極度容易受到環境溫濕度影響，為保障所有創客買家收到的皆為頂級乾燥狀態的耗材，請留意以下規範：',
    sec2Points: [
      '真空包裝一經拆封，即無法辦理退貨。如您在未拆封真空袋的情況下發現線材有明顯瑕疵（如：嚴重打結、受潮氣泡），請立即拍照並連繫客服辦理換貨。',
      '若真空包裝未拆封，您可在七日鑑賞期內無條件申請退貨，退貨運費將由本網站全額負擔。'
    ],
    sec3Title: '瑕疵品換貨流程',
    sec3Desc: '如果您在使用過程中，發現線材直徑公差嚴重異常（超過 ±0.03mm）或因生產瑕疵導致無法列印，請依照以下步驟處理：',
    sec3Steps: [
      '請透過網站下方的「聯絡我們」或客服信箱，附上瑕疵照片與訂單編號。',
      '經由客服人員初步判定後，我們將派請物流人員至您指定地點回收瑕疵品。',
      '待回收中心確認瑕疵狀況後，我們將於 2-3 個工作天內，免費補發一卷全新的同款線材給您。'
    ],
    sec4Title: '退款作業時間',
    sec4Desc: '退款作業將於我們收到您的退貨商品，確認商品狀態無誤後進行。如果您使用信用卡（藍新金流）付款，我們會直接為您辦理線上退刷，退刷金額約需 7-14 個工作天（依各家銀行作業時間為準）才會顯示在您的信用卡帳單中。'
  },
  'en': {
    title: 'Return & Refund Policy',
    lead: 'To ensure a seamless maker shopping experience, GodDog 3D Filament Mall provides customer-first return and warranty guarantees.',
    sec1Title: '7-Day Inspection Period',
    sec1Desc: 'Pursuant to the Consumer Protection Act, you are entitled to a 7-day unconditional cooling-off period starting the day following delivery. Please note: the cooling-off period is an inspection privilege, not a trial period. Returned merchandise must remain in brand-new, unopened condition with all original packaging, desiccant pouches, and accessories intact.',
    sec2Title: 'Filament Return Guidelines (Crucial)',
    sec2Desc: 'Because polymer filaments (such as PLA, PETG, ABS, and TPU) are highly susceptible to moisture degradation, we uphold strict standards so every maker receives factory-dry spools:',
    sec2Points: [
      'Once the vacuum seal is broken, the filament cannot be returned. If you observe defects prior to unsealing (e.g., spool fractures, loose winding, or puncture in vacuum bag), take a photo immediately and contact our support team.',
      'Unopened vacuum-sealed spools can be returned within 7 days for a full refund with return shipping covered by us.'
    ],
    sec3Title: 'Defect Replacement Procedure',
    sec3Desc: 'If you experience severe dimensional tolerance deviations (> ±0.03mm) or extrusion failure caused by manufacturing defects, please follow these steps:',
    sec3Steps: [
      'Submit an inquiry via our "Contact Us" portal or support email, attaching photos of the spool and your order reference.',
      'Following verification by our technical support, we will arrange a courier pickup at your designated address.',
      'Upon inspection at our fulfillment facility, a brand-new replacement spool will be dispatched free of charge within 2-3 business days.'
    ],
    sec4Title: 'Refund Processing Timeline',
    sec4Desc: 'Refunds are initiated once the returned items are received and inspected. For credit card payments (NewebPay), refunds are credited directly back to the original card within 7-14 business days, depending on your bank\'s processing schedule.'
  },
  'ja': {
    title: '返品・交換・返金ポリシー',
    lead: '神狗勾 (GodDog) 3Dフィラメントモールでは、お客様に安心してご購入いただけるよう、業界標準を上回る品質保証と返品対応体制を整えています。',
    sec1Title: '7日間クーリングオフ（返品保証）',
    sec1Desc: '消費者保護規定に基づき、商品到着の翌日から7日間の返品猶予期間が適用されます。ただし「返品猶予期間はお試し期間ではありません」。返品される商品は、未開封・未使用の新品状態であり、外箱・付属品・乾燥剤・保証書等がすべて揃っている必要があります。',
    sec2Title: '3Dフィラメント商品の返品特約 (重要)',
    sec2Desc: '3Dプリント用フィラメント（PLA, PETG, ABS, TPU等）は空気中の湿気に非常に敏感です。すべての創客（メイカー）の皆様に最高品質の乾燥フィラメントをお届けするため、以下の特約を定めています：',
    sec2Points: [
      'アルミ防湿真空パックを開封された商品の返品は承りかねます。開封前に真空パックの破損、著しい巻き乱れ等の初期不良が見つかった場合は、直ちに写真を撮影の上サポートへご連絡ください。',
      '真空パック未開封の商品に限り、7日以内であれば無条件で返品を承り、返送料は当店が全額負担いたします。'
    ],
    sec3Title: '初期不良・交換手続きの流れ',
    sec3Desc: '線径公差の異常（±0.03mm超過）や製造上の欠陥により印刷不可能な場合は、以下の手順で無償交換いたします：',
    sec3Steps: [
      '「お問い合わせ」またはサポート窓口宛に、受注番号と不具合箇所の写真を添付してご連絡ください。',
      'サポートチームの確認後、配送業者による回収を手配いたします。',
      '回収品の確認完了後、2〜3営業日以内に同一商品の新品を無償にて再発送いたします。'
    ],
    sec4Title: 'ご返金について',
    sec4Desc: '返品商品が弊社倉庫に到着し検品が完了次第、返金手続きを行います。クレジットカード決済（NewebPay）の場合はカード会社経由での返金となり、ご利用の金融機関により7〜14営業日程度で明細に反映されます。'
  }
};

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ lang: propLang }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const c = contentByLang[activeLang] || contentByLang['zh-TW'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mt-8 border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
          <RefreshCcw className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{c.title}</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-600 dark:prose-p:text-slate-400">
        <p className="lead font-medium text-slate-700 dark:text-slate-300">{c.lead}</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec1Title}</h2>
        <p>{c.sec1Desc}</p>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec2Title}</h2>
        <p>{c.sec2Desc}</p>
        <ul className="list-disc pl-6 space-y-2">
          {c.sec2Points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec3Title}</h2>
        <p>{c.sec3Desc}</p>
        <ol className="list-decimal pl-6 space-y-2">
          {c.sec3Steps.map((st, i) => (
            <li key={i}>{st}</li>
          ))}
        </ol>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec4Title}</h2>
        <p>{c.sec4Desc}</p>
      </div>
    </div>
  );
};
