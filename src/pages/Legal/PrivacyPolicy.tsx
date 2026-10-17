import React from 'react';
import { Shield } from 'lucide-react';
import { LanguageCode } from '../../types';

interface PrivacyPolicyProps {
  lang?: LanguageCode;
}

const contentByLang = {
  'zh-TW': {
    title: '隱私權保護政策',
    lead: '非常歡迎您光臨「神狗勾 3D 耗材商城」（以下簡稱本網站），為了讓您能夠安心的使用本網站的各項服務與資訊，特此向您說明本網站的隱私權保護政策，以保障您的權益，請您詳閱下列內容：',
    sec1Title: '一、隱私權保護政策的適用範圍',
    sec1Desc: '隱私權保護政策內容，包括本網站如何處理在您使用網站服務時收集到的個人識別資料。隱私權保護政策不適用於本網站以外的相關連結網站，也不適用於非本網站所委託或參與管理的人員。',
    sec2Title: '二、個人資料的蒐集、處理及利用方式',
    sec2Points: [
      '當您造訪本網站或使用本網站所提供之功能服務時，我們將視該服務功能性質，請您提供必要的個人資料，並在該特定目的範圍內處理及利用您的個人資料；非經您書面同意，本網站不會將個人資料用於其他用途。',
      '本網站在您使用服務信箱、問卷調查等互動性功能時，會保留您所提供的姓名、電子郵件地址、聯絡方式及使用時間等。',
      '於一般瀏覽時，伺服器會自行記錄相關行徑，包括您使用連線設備的IP位址、使用時間、使用的瀏覽器、瀏覽及點選資料記錄等，做為我們增進網站服務的參考依據，此記錄為內部應用，決不對外公佈。'
    ],
    sec3Title: '三、資料之保護',
    sec3Desc: '本網站主機均設有防火牆、防毒系統等相關的各項資訊安全設備及必要的安全防護措施，加以保護網站及您的個人資料採用嚴格的保護措施，只由經過授權的人員才能接觸您的個人資料，相關處理人員皆簽有保密合約，如有違反保密義務者，將受相關法律處分。',
    sec4Title: '四、第三方金流與物流',
    sec4Desc: '本網站使用第三方金流服務（藍新金流 NewebPay、LINE Pay 等）進行線上交易。您的信用卡資訊與支付密碼等敏感資料，皆在受高度加密與 PCI-DSS 認證之第三方金流閘道內處理，本網站伺服器不會紀錄或儲存您的完整信用卡卡號。同時，本網站與各大物流商合作，僅在配送必要範圍內提供您的姓名與收件地址。',
    sec5Title: '五、Cookie 之使用與 Google AdSense 廣告政策',
    sec5Desc: '為了提供您最佳的服務與改善網站使用體驗，本網站會在您的電腦或連線裝置中放置並取用我們的 Cookie。若您不願接受 Cookie 的寫入，您可在您使用的瀏覽器功能項中設定隱私權等級為高，即可拒絕 Cookie 的寫入，但可能會導致網站某些功能無法正常執行。',
    sec5GoogleHeading: '關於 Google 廣告 Cookie 之特別聲明：',
    sec5GooglePoints: [
      '第三方供應商（包括 Google）會使用 Cookie 根據使用者先前在您網站或其他網站上的造訪紀錄向使用者放送廣告。',
      'Google 使用廣告 Cookie 可讓 Google 及其合作夥伴根據使用者在您網站和/或網際網路其他網站上的造訪紀錄，向使用者放送個人化廣告。',
      '使用者可以前往 Google 廣告設定隨時選擇停用個人化廣告放送。'
    ],
    sec6Title: '六、隱私權保護政策之修正',
    sec6Desc: '本網站隱私權保護政策將因應需求隨時進行修正，修正後的條款將刊登於網站上。'
  },
  'en': {
    title: 'Privacy Policy',
    lead: 'Welcome to GodDog 3D Filament Mall ("this Website"). To ensure that you can comfortably utilize our services and information, we hereby present our Privacy Policy to safeguard your personal rights and interests. Please read the following carefully:',
    sec1Title: '1. Scope of the Privacy Policy',
    sec1Desc: 'This Privacy Policy governs how this Website collects, processes, and protects personally identifiable information gathered during your use of our services. It does not apply to external websites linked through our platform, nor to third parties not contracted or managed by us.',
    sec2Title: '2. Collection, Processing, and Use of Personal Information',
    sec2Points: [
      'When you visit this Website or use our features, we may request necessary personal data according to the specific service nature, and will process it exclusively within the defined scope. We will not utilize your data for other purposes without written consent.',
      'When utilizing contact forms, inquiries, or interactive features, we retain your submitted name, email address, contact phone, and timestamp.',
      'During general browsing, our servers automatically log connection activities (such as IP address, access time, browser type, and clickstream records) strictly for system optimization and analytical purposes. These logs remain confidential.'
    ],
    sec3Title: '3. Data Security and Protection',
    sec3Desc: 'Our servers are fortified with enterprise firewalls, anti-virus protections, and rigorous physical/digital security controls. Access to user data is strictly restricted to authorized staff bound by signed confidentiality covenants.',
    sec4Title: '4. Third-Party Payment and Logistics Providers',
    sec4Desc: 'Online transactions on this Website are processed via PCI-DSS compliant payment gateways (such as NewebPay and LINE Pay). Your credit card details and payment credentials are encrypted end-to-end; our servers never store full credit card numbers. Recipient shipping details are shared with delivery couriers strictly as required for fulfillment.',
    sec5Title: '5. Cookie Usage & Google Advertising Policy',
    sec5Desc: 'To provide tailored experiences and enhance website functionality, we may place and access cookies on your client device. You may configure your browser to decline cookies, although certain functions may be impaired.',
    sec5GoogleHeading: 'Notice Regarding Google Advertising Cookies:',
    sec5GooglePoints: [
      'Third-party vendors, including Google, use cookies to serve ads based on prior user visits to this website or other sites.',
      'Google advertising cookies enable Google and its partners to serve personalized ads based on your visit history across the web.',
      'Users may opt out of personalized advertising by visiting Google Ads Settings.'
    ],
    sec6Title: '6. Amendments to the Privacy Policy',
    sec6Desc: 'This Privacy Policy may be updated periodically to reflect changing regulatory requirements and service advancements. Revised terms will be posted directly on this page.'
  },
  'ja': {
    title: 'プライバシーポリシー (個人情報保護方針)',
    lead: '神狗勾 (GodDog) 3Dフィラメントモール（以下「本サイト」）をご利用いただきありがとうございます。お客様に安心して本サイトのサービスや情報をご利用いただけるよう、以下のプライバシーポリシーを定めています。',
    sec1Title: '第1条：本ポリシーの適用範囲',
    sec1Desc: '本プライバシーポリシーは、お客様が本サイトを利用する際に収集される個人情報の取り扱いについて適用されます。本サイトからリンクされている外部サイトや、委託関係にない第三者には適用されません。',
    sec2Title: '第2条：個人情報の収集・処理および利用目的',
    sec2Points: [
      '本サイトのご利用にあたり、各機能の提供に必要な範囲でお客様の個人情報（お名前、メールアドレス、お届け先住所等）をご提供いただき、明示した目的の範囲内で適正に取り扱います。',
      'お問い合わせフォーム等のご利用時には、送信されたお名前、メールアドレス、連絡先およびアクセス日時が記録されます。',
      '通常のアクセス時、サーバーはアクセス元IPアドレス、アクセス日時、使用ブラウザ、閲覧履歴等のアクセスログを自動記録し、サービス向上および不正防止のために内部利用します。'
    ],
    sec3Title: '第3条：安全管理措置',
    sec3Desc: '本サイトのサーバーはファイアウォールやウイルス対策等のセキュリティ対策を講じており、権限を付与されたスタッフのみが厳格な秘密保持契約の下で個人データにアクセス可能です。',
    sec4Title: '第4条：外部決済および配送代行',
    sec4Desc: 'オンライン決済はPCI-DSS認定を取得した安全な決済ゲートウェイ（NewebPay、LINE Pay等）を介して暗号化通信により処理されます。本サイトのサーバーにはクレジットカード番号は一切保管されません。お届け先情報は配送手配の目的のみで配送業者に共有されます。',
    sec5Title: '第5条：Cookieの使用およびGoogle広告ポリシー',
    sec5Desc: '本サイトでは利便性向上および統計分析のためにCookieを使用しています。ブラウザ設定によりCookieを拒否することも可能ですが、一部機能が正しく動作しない場合があります。',
    sec5GoogleHeading: 'Google広告Cookieに関する特記事項：',
    sec5GooglePoints: [
      'Google等の第三者配信事業者は、本サイトや他のウェブサイトへの過去のアクセス情報に基づいて広告を配信します。',
      '広告用Cookieにより、Googleおよびパートナー企業はお客様に適したパーソナライズ広告を表示することができます。',
      'ユーザーはGoogle広告設定ページからパーソナライズ広告の配信を無効にできます。'
    ],
    sec6Title: '第6条：プライバシーポリシーの改定',
    sec6Desc: '本ポリシーは法令の改正や事業方針の変更に伴い随時改定されることがあります。改定後のポリシーは本サイト上に掲載された時点で効力を生じます。'
  }
};

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ lang: propLang }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const c = contentByLang[activeLang] || contentByLang['zh-TW'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mt-8 border border-slate-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{c.title}</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-600 dark:prose-p:text-slate-400">
        <p className="lead font-medium text-slate-700 dark:text-slate-300">{c.lead}</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec1Title}</h2>
        <p>{c.sec1Desc}</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec2Title}</h2>
        <ul className="list-disc pl-6 space-y-2">
          {c.sec2Points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec3Title}</h2>
        <p>{c.sec3Desc}</p>
        
        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec4Title}</h2>
        <p>{c.sec4Desc}</p>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec5Title}</h2>
        <p>{c.sec5Desc}</p>
        
        <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">{c.sec5GoogleHeading}</h3>
        <ul className="list-disc pl-6 space-y-2">
          {c.sec5GooglePoints.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-4">{c.sec6Title}</h2>
        <p>{c.sec6Desc}</p>
      </div>
    </div>
  );
};
