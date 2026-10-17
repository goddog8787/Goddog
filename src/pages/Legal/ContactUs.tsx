import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Check, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LanguageCode } from '../../types';
import { translations } from '../../utils/i18n';

interface ContactUsProps {
  lang?: LanguageCode;
}

export const ContactUs: React.FC<ContactUsProps> = ({ lang: propLang }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSuccess = searchParams.get('success') === 'true';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const activeLang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  const t = translations[activeLang] || translations['zh-TW'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/contact?success=true');
      } else {
        setFormError(t.contactFormError || '發送失敗，請確認填寫內容或稍後再試。');
      }
    } catch (err) {
      setFormError(t.contactNetworkError || '網路連線異常，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 bg-white rounded-2xl shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">{t.contactTitle || '聯絡我們'}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {t.contactSubtitle || '無論是 3D 列印線材選購問題、訂單查詢，或是大宗採購與技術支援，神狗勾耗材商城的客服團隊都隨時準備好為您服務。'}
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{t.contactHotline || '客服專線'}</h3>
                <p className="text-slate-600 font-mono">{t.contactHotlineVal || '+886 911331772'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{t.contactEmail || '電子郵件'}</h3>
                <p className="text-slate-600">{t.contactEmailVal || 'babe0615@gmail.com'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{t.contactHours || '服務時間'}</h3>
                <p className="text-slate-600 whitespace-pre-line">{t.contactHoursVal || '週一至週五 09:00 - 18:00\n(國定假日休息)'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{t.contactAddress || '公司地址'}</h3>
                <p className="text-slate-600">{t.contactAddressVal || '621 嘉義縣民雄鄉福樂村埤角1-50號'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          {isSuccess ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.contactSuccessTitle || '感謝您的來信！'}</h3>
              <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
                {t.contactSuccessDesc || '我們已經收到您的訊息，神狗勾客服團隊會盡量在 24 小時內回覆您，謝謝您的支持！'}
              </p>
              <a 
                href="/contact" 
                className="inline-block px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                {t.contactBackBtn || '返回'}
              </a>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{t.contactFormHeading || '發送訊息給我們'}</h3>
              <p className="text-xs text-slate-500 mb-4">
                {t.contactFormDesc || '訊息將直接傳送至我們的客服信箱。我們會在 24 小時內回覆您的郵件！'}
              </p>
              {formError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contactNameLabel || '您的姓名'}</label>
                  <input type="text" name="name" required disabled={isSubmitting} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50" placeholder={t.contactNamePlaceholder || '王大明'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contactEmailLabel || '聯絡信箱'}</label>
                  <input type="email" name="email" required disabled={isSubmitting} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50" placeholder={t.contactEmailPlaceholder || 'your@email.com'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contactMsgLabel || '訊息內容'}</label>
                  <textarea name="message" required disabled={isSubmitting} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none disabled:opacity-50" placeholder={t.contactMsgPlaceholder || '請描述您的問題...'}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isSubmitting ? (t.contactSubmitting || '發送中...') : (t.contactSubmitBtn || '送出訊息')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
