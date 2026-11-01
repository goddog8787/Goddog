import { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
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
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-3xl">
              🐕
            </div>
            <h1 className="text-xl font-bold text-slate-100">神狗勾商城系統載入中</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              檢測到暫時性資源連線問題，系統正在切換至備援線路。請點擊下方按鈕重新載入頁面。
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                重新載入頁面
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch {}
                  window.location.href = '/';
                }}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition"
              >
                清除暫存並重啟
              </button>
            </div>
            {this.state.error && (
              <details className="text-left text-xs text-slate-500 bg-slate-950/60 p-3 rounded-lg overflow-x-auto mt-4">
                <summary className="cursor-pointer text-slate-400 font-mono mb-1">診斷詳情 (Diagnostic Info)</summary>
                <p className="font-mono text-red-400 break-all">{this.state.error.message}</p>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
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

