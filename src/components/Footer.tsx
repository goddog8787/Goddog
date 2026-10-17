import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageCode } from '../types';
import { translations } from '../utils/i18n';

interface FooterProps {
  lang?: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ lang: propLang }) => {
  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const t = translations[activeLang] || translations['zh-TW'];

  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 text-slate-400 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                3D
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                {t.footerBrand || '神狗勾耗材旗艦館'}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.footerDesc || '專營高品質 3D 列印線材，提供卓越的列印體驗與技術支援。'}
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-white font-bold mb-4 tracking-wide">
              {t.footerAboutServices || '關於與服務'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">{t.footerFilamentStore || '耗材商城'}</Link></li>
              <li><Link to="/guide" className="hover:text-sky-400 transition-colors">{t.footerMaterialGuide || '3D 耗材材質全指南'}</Link></li>
              <li><Link to="/faq" className="hover:text-sky-400 transition-colors">{t.footerFaq || '常見問題 FAQ'}</Link></li>
              <li><Link to="/blog" className="hover:text-sky-400 transition-colors">{t.footerBlog || '創客知識庫 (Blog)'}</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">{t.footerAboutUs || '關於我們'}</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">{t.footerContactUs || '聯絡我們'}</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-white font-bold mb-4 tracking-wide">
              {t.footerLegalPolicies || '法律與政策'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-sky-400 transition-colors">{t.footerPrivacy || '隱私權保護政策'}</Link></li>
              <li><Link to="/terms" className="hover:text-sky-400 transition-colors">{t.footerTerms || '服務條款'}</Link></li>
              <li><Link to="/refund-policy" className="hover:text-sky-400 transition-colors">{t.footerRefund || '退換貨政策'}</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-white font-bold mb-4 tracking-wide">
              {t.footerContactInfo || '聯絡資訊'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>{activeLang === 'en' ? `Hotline: ${t.contactHotlineVal || '+886 911331772'}` : activeLang === 'ja' ? `電話: ${t.contactHotlineVal || '+886 911331772'}` : `客服專線：${t.contactHotlineVal || '+886 911331772'}`}</li>
              <li>{activeLang === 'en' ? `Email: ${t.contactEmailVal || 'babe0615@gmail.com'}` : activeLang === 'ja' ? `メール: ${t.contactEmailVal || 'babe0615@gmail.com'}` : `信箱：${t.contactEmailVal || 'babe0615@gmail.com'}`}</li>
              <li>{activeLang === 'en' ? `Address: ${t.contactAddressVal || 'No. 1-50, Pijiao, Minxiong Township, Chiayi County 621, Taiwan'}` : activeLang === 'ja' ? `住所: ${t.contactAddressVal || '台湾 嘉義県民雄郷福楽村埤角1-50号'}` : `地址：${t.contactAddressVal || '嘉義縣民雄鄉福樂村埤角1-50號'}`}</li>
              <li>{activeLang === 'en' ? `Hours: ${t.contactHoursVal || 'Mon - Fri 09:00 - 18:00'}` : activeLang === 'ja' ? `営業時間: ${t.contactHoursVal || '月〜金 09:00 - 18:00'}` : `服務時間：${t.contactHoursVal || '週一至週五 09:00 - 18:00'}`}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>{t.footerCopyright || `© ${new Date().getFullYear()} ${activeLang === 'en' ? 'GodDog 3D Filaments Store. All rights reserved.' : activeLang === 'ja' ? '神狗勾 3D フィラメントストア. All rights reserved.' : '神狗勾 3D 耗材商城. All rights reserved.'}`}</p>
          <div className="flex items-center gap-4">
            <span>{t.footerSupportPaymentNote || (activeLang === 'en' ? 'Supports NewebPay / Apple Pay / CVS COD' : activeLang === 'ja' ? '藍新決済 / Apple Pay / コンビニ後払い対応' : '支援 藍新安全金流 / Apple Pay / 超商取貨付款')}</span>
            <span>{t.footerSslSecure || 'SSL 安全加密'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

