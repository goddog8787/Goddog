import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  registerWithEmail 
} from '../../lib/firebase';
import { MemberProfile, LanguageCode } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: Partial<MemberProfile>) => void;
  lang?: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'zh-TW',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, error, profile } = await signInWithGoogle();
      if (user) {
        onLoginSuccess({
          id: user.uid,
          name: profile?.name || user.displayName || (lang === 'en' ? 'Google Maker Member' : lang === 'ja' ? 'Google メイカー会員' : 'Google 創客會員'),
          email: profile?.email || user.email || 'user@gmail.com',
          tier: profile?.tier || 'Silver',
          points: profile?.points || 150,
        });
        setSuccessMessage(
          lang === 'en' 
            ? '🎉 Google authentication successful! Welcome back!' 
            : lang === 'ja' 
            ? '🎉 Google認証に成功しました！おかえりなさい！' 
            : '🎉 Google 帳號驗證成功！歡迎回到神狗勾耗材商城！'
        );
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (error) {
        setErrorMessage(error);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || (lang === 'en' ? 'Login error occurred' : lang === 'ja' ? 'ログインエラーが発生しました' : '登入發生錯誤'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'login') {
        const { user, error } = await signInWithEmail(email, password);
        if (user) {
          onLoginSuccess({
            id: user.uid,
            name: user.displayName || email.split('@')[0],
            email: user.email || email,
            tier: 'Bronze',
            points: 100,
          });
          setSuccessMessage(lang === 'en' ? '🎉 Signed in successfully!' : lang === 'ja' ? '🎉 ログインに成功しました！' : '🎉 登入成功！');
          setTimeout(() => onClose(), 1000);
        } else {
          setErrorMessage(error || (lang === 'en' ? 'Sign in failed' : lang === 'ja' ? 'ログインに失敗しました' : '登入失敗'));
        }
      } else {
        const { user, error, profile } = await registerWithEmail(email, password, name);
        if (user) {
          onLoginSuccess({
            id: user.uid,
            name: profile?.name || name || user.displayName || email.split('@')[0],
            email: profile?.email || user.email || email,
            tier: profile?.tier || 'Bronze',
            points: profile?.points || 120,
          });
          setSuccessMessage(
            lang === 'en' 
              ? '🎉 Registered successfully! 120 bonus points awarded!' 
              : lang === 'ja' 
              ? '🎉 新規登録完了！120ボーナスポイントを付与しました！' 
              : '🎉 註冊成功！已為您贈送新會員 120 點紅利積點！'
          );
          setTimeout(() => onClose(), 1200);
        } else {
          setErrorMessage(error || (lang === 'en' ? 'Registration failed' : lang === 'ja' ? '登録に失敗しました' : '註冊失敗'));
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (lang === 'en' ? 'Operation failed' : lang === 'ja' ? '処理に失敗しました' : '操作失敗'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {lang === 'en' ? 'GodDog 3D Member Center' : lang === 'ja' ? '神狗勾 3D 会員センター' : '神狗勾 3D 會員中心'}
              </h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {lang === 'en' ? 'Google Account & Firebase Cloud Authentication' : lang === 'ja' ? 'Googleアカウント＆Firebaseクラウド認証' : '串聯 Google 帳號與 Firebase 雲端認證'}
              </p>
            </div>
          </div>

          {/* Tab Switchers */}
          <div className="flex bg-white/10 p-1 rounded-2xl mt-6 gap-1 backdrop-blur-md">
            <button
              id="auth-tab-login"
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'Sign In' : lang === 'ja' ? 'ログイン' : '會員登入'}
            </button>
            <button
              id="auth-tab-register"
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-300 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'Register' : lang === 'ja' ? '新規登録' : '免費註冊'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notifications */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-4">
              {/* Google One-Click Login Button */}
              <button
                id="btn-google-signin"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-indigo-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                {/* Official Google G SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{lang === 'en' ? 'Sign in with Google' : lang === 'ja' ? 'Googleでログイン' : '使用 Google 帳號快速登入'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-xs font-medium">
                  {lang === 'en' ? 'Or with Email' : lang === 'ja' ? 'またはメールアドレスで' : '或使用 Email'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Nickname / Maker Name' : lang === 'ja' ? 'ニックネーム / お名前' : '您的暱稱 / 創客姓名'}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="auth-input-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={lang === 'en' ? 'e.g. MakerJohn / BambuFan' : lang === 'ja' ? '例：メイカー太郎 / BambuFan' : '例如：王小明 / BambuMaker'}
                        required
                        className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'en' ? 'Account / Email' : lang === 'ja' ? 'アカウント / メールアドレス' : '帳號 / 電子郵件 (Account / Email)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="auth-input-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'en' ? 'Enter email address' : lang === 'ja' ? 'メールアドレスを入力' : '請輸入帳號或電子郵件'}
                      required
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {lang === 'en' ? 'Password' : lang === 'ja' ? 'パスワード' : '密碼 (Password)'}
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="auth-input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={lang === 'en' ? 'Enter password' : lang === 'ja' ? 'パスワードを入力' : '請輸入密碼'}
                      required
                      className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? '隱藏密碼' : '顯示密碼'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>{lang === 'en' ? 'Processing...' : lang === 'ja' ? '処理中...' : '處理中...'}</span>
                  ) : activeTab === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Sign In' : lang === 'ja' ? 'ログイン' : '登入帳號'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Register & Claim 120 Pts' : lang === 'ja' ? '登録して120pt獲得' : '註冊領取 120 點紅利'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'en' ? 'Secured by Google Firebase Authentication' : lang === 'ja' ? 'Google Firebase エンタープライズ認証で保護されています' : '採用 Google Firebase 企業級安全身份驗證機制'}</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
