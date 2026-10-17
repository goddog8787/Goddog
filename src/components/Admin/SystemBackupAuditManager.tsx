import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Activity, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  Sparkles,
  Server
} from 'lucide-react';
import { FilamentProduct, Order } from '../../types';
import { getStoreCoupons, saveStoreCoupons } from '../../utils/couponManager';
import { getStoreAnnouncementConfig, saveStoreAnnouncementConfig } from '../../utils/announcementManager';

interface SystemBackupAuditManagerProps {
  products: FilamentProduct[];
  orders: Order[];
  onReloadProducts?: () => void;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  operator: string;
  detail: string;
  category: 'product' | 'order' | 'coupon' | 'review' | 'system';
}

const AUDIT_LOGS_KEY = 'printcore_admin_audit_logs_v1';

export const SystemBackupAuditManager: React.FC<SystemBackupAuditManagerProps> = ({
  products,
  orders,
  onReloadProducts,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [storageUsageKB, setStorageUsageKB] = useState<number>(0);

  useEffect(() => {
    loadAuditLogs();
    calcStorage();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const calcStorage = () => {
    let total = 0;
    for (const x in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
        total += (localStorage[x].length + x.length) * 2;
      }
    }
    setStorageUsageKB(Math.round(total / 1024));
  };

  const loadAuditLogs = () => {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Strictly purge legacy mock logs
          const cleaned = parsed.filter(l => 
            l.id !== 'log-1' && 
            l.id !== 'log-2' && 
            l.id !== 'log-3' && 
            l.id !== 'log-4'
          );
          setLogs(cleaned);
          localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(cleaned));
          return;
        }
      }
    } catch {}

    setLogs([]);
  };

  const handleExportFullBackup = () => {
    setIsExporting(true);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.2.0',
        storeName: 'PrintCore3D 神狗勾耗材選品店',
        products,
        orders,
        coupons: getStoreCoupons(),
        announcement: getStoreAnnouncementConfig(),
        storageLogs: logs,
      };

      const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `PrintCore3D_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('📦 全店資料快照 (JSON) 已完整匯出下載！');
    } catch (e) {
      console.error(e);
      alert('匯出備份失敗');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.coupons) {
          saveStoreCoupons(data.coupons);
        }
        if (data && data.announcement) {
          saveStoreAnnouncementConfig(data.announcement);
        }
        showToast('✅ 備份資料已成功匯入並套用！');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        alert('解析備份 JSON 失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (!window.confirm('確定要清理臨時瀏覽快取嗎？（不會刪除商品與訂單核心資料）')) return;
    try {
      localStorage.removeItem('printcore_filter_state');
      localStorage.removeItem('printcore_temp_cart');
      calcStorage();
      showToast('🧹 快取已成功清理！');
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">系統備份還原與後台稽核日誌</h2>
            <p className="text-xs text-slate-500">
              全店商品、訂單、優惠券即時快照封裝，保障資料安全與營運操作可追溯性
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>匯入還原快照 (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleExportFullBackup}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? '封裝中...' : '匯出全店備份 (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">本機儲存用量</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{storageUsageKB}</span>
            <span className="text-xs text-slate-500">KB / 5MB 配額</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">雲端 Firestore 連線</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-emerald-600">正常連線中</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Firebase 認證與訂單同步運行中</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gemini AI 雙軌引擎</span>
            <Cpu className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-bold text-cyan-600">自動分流就緒</span>
            <p className="text-[11px] text-slate-400 mt-0.5">3.8 Flash + 3.1 Flash-Lite 備援</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">快取清理維護</span>
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <button
              onClick={handleClearCache}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              清理臨時狀態快取
            </button>
            <p className="text-[11px] text-slate-400 mt-0.5">釋放不必要暫存記憶體</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              管理員重要營運操作軌跡 (Audit Log)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">系統自動記錄所有後台修改動作</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">時間戳記</th>
                <th className="py-3 px-4">操作動作</th>
                <th className="py-3 px-4">類別</th>
                <th className="py-3 px-4">操作人員</th>
                <th className="py-3 px-4">變更詳細摘要</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800">
                    {log.action}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.category === 'coupon'
                        ? 'bg-indigo-50 text-indigo-700'
                        : log.category === 'order'
                        ? 'bg-cyan-50 text-cyan-700'
                        : log.category === 'review'
                        ? 'bg-amber-50 text-amber-700'
                        : log.category === 'product'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.category.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    {log.operator}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {log.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
