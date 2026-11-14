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
    <footer className="bg-slate-900 pt-14 pb-10 lg:pb-12 border-t border-slate-800 text-slate-400 mt-14 sm:mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                3D
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                {t.footerBrand || '神狗勾耗材旗艦館'}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t.footerDesc || '專營高品質 3D 列印線材，提供卓越的列印體驗與技術支援。'}
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm">
              {t.footerAboutServices || '關於與服務'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-sky-400 transition-colors">{t.footerFilamentStore || '耗材商城'}</Link></li>
              <li><Link to="/guide" className="hover:text-sky-400 transition-colors">{t.footerMaterialGuide || '3D 耗材材質全指南'}</Link></li>
              <li><Link to="/faq" className="hover:text-sky-400 transition-colors">{t.footerFaq || '常見問題 FAQ'}</Link></li>
              <li><Link to="/blog" className="hover:text-sky-400 transition-colors">{t.footerBlog || '創客知識庫 (Blog)'}</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">{t.footerAboutUs || '關於我們'}</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">{t.footerContactUs || '聯絡我們'}</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm">
              {t.footerLegalPolicies || '法律與政策'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-sky-400 transition-colors">{t.footerPrivacy || '隱私權保護政策'}</Link></li>
              <li><Link to="/terms" className="hover:text-sky-400 transition-colors">{t.footerTerms || '服務條款'}</Link></li>
              <li><Link to="/refund-policy" className="hover:text-sky-400 transition-colors">{t.footerRefund || '退換貨政策'}</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold mb-4 tracking-wide text-sm">
              {t.footerContactInfo || '聯絡資訊'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="whitespace-nowrap">{activeLang === 'en' ? `Hotline: ${t.contactHotlineVal || '+886 911331772'}` : activeLang === 'ja' ? `電話: ${t.contactHotlineVal || '+886 911331772'}` : `客服專線：${t.contactHotlineVal || '+886 911331772'}`}</li>
              <li className="break-all sm:break-normal">{activeLang === 'en' ? `Email: ${t.contactEmailVal || 'babe0615@gmail.com'}` : activeLang === 'ja' ? `メール: ${t.contactEmailVal || 'babe0615@gmail.com'}` : `信箱：${t.contactEmailVal || 'babe0615@gmail.com'}`}</li>
              <li>{activeLang === 'en' ? `Hours: ${t.contactHoursVal || 'Mon - Fri 09:00 - 18:00'}` : activeLang === 'ja' ? `営業時間: ${t.contactHoursVal || '月〜金 09:00 - 18:00'}` : `服務時間：${t.contactHoursVal || '週一至週五 09:00 - 18:00'}`}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-center md:text-left">{t.footerCopyright || `© ${new Date().getFullYear()} ${activeLang === 'en' ? 'GodDog 3D Filaments Store. All rights reserved.' : activeLang === 'ja' ? '神狗勾 3D フィラメントストア. All rights reserved.' : '神狗勾 3D 耗材商城. All rights reserved.'}`}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2">
            <span>{t.footerSupportPaymentNote || (activeLang === 'en' ? 'Supports NewebPay / Apple Pay / CVS COD' : activeLang === 'ja' ? '藍新決済 / Apple Pay / コンビニ後払い対応' : '支援 藍新安全金流 / Apple Pay / 超商取貨付款')}</span>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">|</span>
            <span>{t.footerSslSecure || 'SSL 安全加密'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

