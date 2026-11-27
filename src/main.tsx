import { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { clearLegacyLocalAccounts, clearLegacyLogisticsCredentials } from './lib/firebase';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }



  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-lg space-y-5">
            <h1 className="text-xl font-bold text-slate-900">神狗勾商城系統</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              檢測到暫時性資源連線問題，請點擊下方按鈕重新載入頁面。
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                重新載入頁面
              </button>
              <button
                onClick={() => window.location.assign('/')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
              >
                返回商城首頁
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Migrate callbacks from the previous mobile login page before the router mounts.
if (location.pathname === '/google-login.html') {
  let destination = '/profile';
  try {
    if (new URLSearchParams(location.search).has('return')) {
      sessionStorage.setItem('goddog_google_redirect_pending', '1');
      const saved = new URL(sessionStorage.getItem('goddog_google_return_path') || destination, location.origin);
      if (saved.origin === location.origin && saved.pathname !== location.pathname) {
        destination = saved.href;
      }
    }
    sessionStorage.removeItem('goddog_google_return_path');
  } catch { /* Use the profile page when storage is unavailable. */ }
  history.replaceState(null, '', destination);
}

clearLegacyLogisticsCredentials();
clearLegacyLocalAccounts();
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HelmetProvider>
      </GlobalErrorBoundary>
    </StrictMode>,
  );
}

