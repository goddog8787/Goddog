import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Save, 
  RotateCcw, 
  Store, 
  PackageCheck,
  AlertTriangle,
  Barcode,
  Key,
  Globe,
  Radio,
  ExternalLink,
  Printer,
  Sparkles,
  QrCode
} from 'lucide-react';
import { LogisticsSettings } from '../../types';

interface LogisticsManagerProps {
  settings: LogisticsSettings;
  onSaveSettings: (newSettings: LogisticsSettings) => void;
}

export const LogisticsManager: React.FC<LogisticsManagerProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<LogisticsSettings>({
    freeShippingThreshold: settings.freeShippingThreshold ?? 999,
    shippingFee711: settings.shippingFee711 ?? 60,
    shippingFeeFamilyMart: settings.shippingFeeFamilyMart ?? 60,
    shippingFeeHiLife: settings.shippingFeeHiLife ?? 55,
    shippingFeeOKMart: settings.shippingFeeOKMart ?? 55,
    shippingFeeBlackCat: settings.shippingFeeBlackCat ?? 100,
    enableCOD: settings.enableCOD ?? true,
    enablePrepaidCVS: settings.enablePrepaidCVS ?? true,
    enableHomeDelivery: settings.enableHomeDelivery ?? true,
    dispatchLeadTime: settings.dispatchLeadTime || '24H 現貨快速出貨 (工作日 15:00 前完成付款當日發貨)',
    packagingSpecs: settings.packagingSpecs || '雙層鋁箔真空包裝 + 變色矽膠乾燥劑 + 防震氣柱加固',
    ecpayLogisticsMerchantId: settings.ecpayLogisticsMerchantId || '3002607',
    newebpayLogisticsMerchantId: settings.newebpayLogisticsMerchantId || 'MS1843364339',
    newebpayLogisticsHashKey: settings.newebpayLogisticsHashKey || 'cNc71ejlg5iZFQLR2bBAHGOoRNs8q1NZ',
    newebpayLogisticsHashIV: settings.newebpayLogisticsHashIV || 'P4rlxhbNjCyiK5qC',
    newebpayLogisticsTestMode: settings.newebpayLogisticsTestMode ?? false,
    senderName: settings.senderName || '神狗勾 3D 台灣官方旗艦店',
    senderPhone: settings.senderPhone || '0911-331-772',
    senderAddress: settings.senderAddress || '嘉義縣民雄鄉福樂村埤角1-50號',
  });

  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedLabelBrand, setSelectedLabelBrand] = useState<'7-11' | 'familymart' | 'hilife' | 'okmart'>('7-11');
  
  // NewebPay connection testing state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    gatewayUrl?: string;
  } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: LogisticsSettings = {
      freeShippingThreshold: 999,
      shippingFee711: 60,
      shippingFeeFamilyMart: 60,
      shippingFeeHiLife: 55,
      shippingFeeOKMart: 55,
      shippingFeeBlackCat: 100,
      enableCOD: true,
      enablePrepaidCVS: true,
      enableHomeDelivery: true,
      dispatchLeadTime: '24H 現貨快速出貨 (工作日 15:00 前完成付款當日發貨)',
      packagingSpecs: '雙層鋁箔真空包裝 + 變色矽膠乾燥劑 + 防震氣柱加固',
      ecpayLogisticsMerchantId: '3002607',
      newebpayLogisticsMerchantId: 'MS1843364339',
      newebpayLogisticsHashKey: 'cNc71ejlg5iZFQLR2bBAHGOoRNs8q1NZ',
      newebpayLogisticsHashIV: 'P4rlxhbNjCyiK5qC',
      newebpayLogisticsTestMode: false,
      senderName: '神狗勾 3D 台灣官方旗艦店',
      senderPhone: '0911-331-772',
      senderAddress: '嘉義縣民雄鄉福樂村埤角1-50號',
    };
    setFormData(defaults);
    onSaveSettings(defaults);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleTestNewebpayConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Direct call to local NewebPay logistics backend service
      const res = await fetch('/api/payment/logistics/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'PING_HANDSHAKE_' + Date.now(),
          orderNumber: 'PING-HANDSHAKE-' + Date.now().toString().slice(-6),
          shippingMethod: 'UNIMARTC2C',
          receiverName: '測試收件人',
          receiverPhone: '0912345678',
          receiverAddress: '台北市信義區忠孝東路五段6號',
          storeCode: '131149',
          storeName: '時代門市',
          amount: 0,
          isCollection: 'N',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConnectionTestResult({
          success: true,
          message: `連線成功！藍新物流 API 金鑰驗證正常，通訊就緒 (${data.shipOrderNo ? '物流單號:' + data.shipOrderNo : '通訊握手完成'})`,
          gatewayUrl: formData.newebpayLogisticsTestMode ? 'https://clogistics.newebpay.com' : 'https://logistics.newebpay.com',
        });
      } else {
        throw new Error('伺服器回傳狀態碼 ' + res.status);
      }
    } catch (err: any) {
      setConnectionTestResult({
        success: false,
        message: '連線檢查異常：' + (err.message || '請確認網路狀態與金鑰配置'),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showSavedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500/40 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">藍新物流與運費配置已成功儲存並即時生效！</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">藍新物流與運費配送管理</h2>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                藍新金流 NewebPay 物流正式對接
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              設定藍新特店代號與 AES 密鑰、全台超商 (7-11/全家/萊爾富/OK) 運費、免運門檻與電子託運單列印
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTestNewebpayConnection}
            disabled={isTestingConnection}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <Radio className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : 'text-indigo-600'}`} />
            <span>{isTestingConnection ? '連線中...' : '測試藍新物流 API 連線'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLabelModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4 text-indigo-600" />
            <span>預覽超商電子託運單</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重設預設值</span>
          </button>
        </div>
      </div>

      {/* Connection Test Result Banner */}
      {connectionTestResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            connectionTestResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {connectionTestResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <div className="font-bold">{connectionTestResult.message}</div>
            {connectionTestResult.gatewayUrl && (
              <div className="text-[11px] opacity-80 font-mono">
                連線閘道：{connectionTestResult.gatewayUrl}
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: NewebPay Logistics API Credentials (藍新物流特店設定) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Key className="w-4 h-4" />
              </div>
              <span>藍新物流 (NewebPay Logistics) API 金鑰與連線參數</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newebpayLogisticsTestMode}
                  onChange={(e) =>
                    setFormData({ ...formData, newebpayLogisticsTestMode: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>啟用測試環境 (Sandbox)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                藍新物流特店代號 (Merchant ID)
              </label>
              <input
                type="text"
                required
                value={formData.newebpayLogisticsMerchantId}
                onChange={(e) =>
                  setFormData({ ...formData, newebpayLogisticsMerchantId: e.target.value })
                }
                placeholder="例如: MS1843364339"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                請填入藍新金流後台取得之特店代號 (同支付商店代號)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                藍新物流 HashKey (AES-256)
              </label>
              <input
                type="text"
                required
                value={formData.newebpayLogisticsHashKey}
                onChange={(e) =>
                  setFormData({ ...formData, newebpayLogisticsHashKey: e.target.value })
                }
                placeholder="32 字元 HashKey"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                用於 TradeInfo 壓碼與數位簽章
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                藍新物流 HashIV (16 bytes)
              </label>
              <input
                type="text"
                required
                value={formData.newebpayLogisticsHashIV}
                onChange={(e) =>
                  setFormData({ ...formData, newebpayLogisticsHashIV: e.target.value })
                }
                placeholder="16 字元 HashIV"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                CBC 向量初始值，確保交易傳輸防篡改
              </span>
            </div>

            <div className="sm:col-span-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>電子地圖選店回傳網址 (ReplyURL)：</strong>
                  <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-indigo-700">
                    /api/payment/logistics/reply
                  </code>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>貨態即時更新通知 (NotifyURL)：</strong>
                  <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700">
                    /api/payment/logistics/notify
                  </code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Free Shipping & Channel Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free Shipping Settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <span>全館免運費門檻與行銷激勵</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  全館免運門檻金額 (NT$)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.freeShippingThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })
                    }
                    className="w-36 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono text-base font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    單筆滿 NT$ {formData.freeShippingThreshold.toLocaleString()} 全館超商與宅配免運
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  前台連動效果：
                </div>
                購物車抽屜將顯示「還差 NT$ XXX 免運進度條」，引導顧客加購耗材湊單！
              </div>
            </div>
          </div>

          {/* Core Channels & Rates */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Store className="w-4 h-4" />
              </div>
              <span>各大超商與物流管道運費 (未達免運門檻時)</span>
            </div>

            <div className="space-y-2.5">
              {/* 7-11 */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#008000]/10 text-[#008000] font-black text-xs flex items-center justify-center border border-[#008000]/20">
                    7-11
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">7-ELEVEN 超商交貨便 (C2C)</div>
                    <div className="text-[10px] text-slate-500">本島門市取件 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFee711}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFee711: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* FamilyMart */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#00A1E9]/10 text-[#00A1E9] font-black text-xs flex items-center justify-center border border-[#00A1E9]/20">
                    全家
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">全家 FamilyMart 店到店</div>
                    <div className="text-[10px] text-slate-500">本島門市取件 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeFamilyMart}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeFamilyMart: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Hi-Life */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 font-black text-xs flex items-center justify-center border border-rose-500/20">
                    萊爾富
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">萊爾富 Hi-Life 店到店</div>
                    <div className="text-[10px] text-slate-500">Life-ET 寄件代碼 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeHiLife}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeHiLife: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* OK Mart */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-black text-xs flex items-center justify-center border border-amber-500/20">
                    OK
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">OK·MART 超商交寄</div>
                    <div className="text-[10px] text-slate-500">全台 OK 超商門市取貨 (約 2-3 天送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeOKMart}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeOKMart: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* BlackCat */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center">
                    黑貓
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">黑貓宅急便 專車直達</div>
                    <div className="text-[10px] text-slate-500">本島宅配到府 (最快隔日送達)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-400">NT$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingFeeBlackCat}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingFeeBlackCat: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Payment & Delivery Options & Lead Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Delivery Method Toggles */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <PackageCheck className="w-4 h-4" />
              </div>
              <span>配送取件服務開關</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">超商取貨付款 (COD)</div>
                  <div className="text-[11px] text-slate-500">
                    顧客前往 7-11 / 全家 / 萊爾富 / OK 門市取貨時現場付現或刷卡結帳
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableCOD}
                  onChange={(e) => setFormData({ ...formData, enableCOD: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">超商純取件 (線上先付款)</div>
                  <div className="text-[11px] text-slate-500">
                    透過藍新線上信用卡 / Apple Pay / LINE Pay 先行結帳，憑身分證件門市領貨
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enablePrepaidCVS}
                  onChange={(e) => setFormData({ ...formData, enablePrepaidCVS: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <div className="font-bold text-xs text-slate-900">黑貓宅急便 宅配到府</div>
                  <div className="text-[11px] text-slate-500">
                    適合大量線材訂單、多捲裝 2.5kg/5kg 工業級耗材專車快速直送
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableHomeDelivery}
                  onChange={(e) => setFormData({ ...formData, enableHomeDelivery: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded-lg cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Dispatch Policy & Packaging Protection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>出貨時效與防潮包裝規格承諾</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  物流出貨時效政策
                </label>
                <input
                  type="text"
                  value={formData.dispatchLeadTime}
                  onChange={(e) => setFormData({ ...formData, dispatchLeadTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 text-xs">
                  官方耗材防潮包裝規格
                </label>
                <input
                  type="text"
                  value={formData.packagingSpecs}
                  onChange={(e) => setFormData({ ...formData, packagingSpecs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-900 leading-relaxed">
                  <strong>3D 列印耗材品質守護：</strong>
                  所有出庫耗材均通過嚴格氣密鋁箔封裝檢測。若買家收到商品有受潮脆化或真空漏氣，提供 100% 免費補寄新品服務。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Warehouse & Sender Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-sm">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <MapPin className="w-4 h-4" />
            </div>
            <span>出貨倉儲與超商逆物流退換貨資訊</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">寄件人 / 倉儲名稱</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">倉管聯絡電話</label>
              <input
                type="text"
                value={formData.senderPhone}
                onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">藍新物流發貨帳號</label>
              <input
                type="text"
                disabled
                value={formData.newebpayLogisticsMerchantId}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 outline-none cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-slate-800 block mb-1">
                發貨倉庫完整地址 / 逆物流退貨點
              </label>
              <input
                type="text"
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <span className="text-xs text-slate-500">
            變更將同步更新全店購物車免運判定與結帳運費計算公式
          </span>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>儲存藍新物流與運費配置</span>
          </button>
        </div>
      </form>

      {/* Simulated NewebPay Electronic Shipping Label Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600" />
                <span className="font-black text-slate-900 text-sm">
                  藍新超商電子託運單與門市交寄單 (A6 規格預覽)
                </span>
              </div>
              <button
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                關閉
              </button>
            </div>

            {/* Brand Switcher in Modal */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedLabelBrand('7-11')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  selectedLabelBrand === '7-11' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                7-11 交貨便
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabelBrand('familymart')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  selectedLabelBrand === 'familymart' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                全家店到店
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabelBrand('hilife')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  selectedLabelBrand === 'hilife' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                萊爾富 Life-ET
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabelBrand('okmart')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  selectedLabelBrand === 'okmart' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                OK 超商
              </button>
            </div>

            {/* Printable Thermal Label */}
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 font-mono text-[11px] space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-black text-sm text-slate-900">
                  {selectedLabelBrand === '7-11' && '7-ELEVEN 交貨便 C2C'}
                  {selectedLabelBrand === 'familymart' && '全家 FamilyMart 店到店'}
                  {selectedLabelBrand === 'hilife' && '萊爾富 Hi-Life 電子寄件'}
                  {selectedLabelBrand === 'okmart' && 'OK·MART 超商託運單'}
                </span>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                  熱感應標籤樣板 (依訂單動態套印)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">藍新物流託運單號：</div>
                  <div className="text-sm font-black tracking-wider text-slate-900">
                    （正式出貨由藍新金流即時指派）
                  </div>
                </div>
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg">
                  <QrCode className="w-7 h-7 text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">取件門市：</span>
                  <div className="font-bold text-slate-900">依買家結帳指定門市</div>
                </div>
                <div>
                  <span className="text-slate-400">代收貨款金額：</span>
                  <div className="font-bold text-indigo-700">依正式訂單實付金額</div>
                </div>
                <div>
                  <span className="text-slate-400">寄件人：</span>
                  <div className="font-bold text-slate-700">{formData.senderName}</div>
                </div>
                <div>
                  <span className="text-slate-400">藍新特店編號：</span>
                  <div className="font-bold text-slate-700">{formData.newebpayLogisticsMerchantId}</div>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="py-2 border-y border-slate-200 text-center font-bold text-slate-800 space-y-1">
                <div className="tracking-[6px] text-sm">||| | ||||| ||| || |||||| |||| |</div>
                <div className="text-[10px] tracking-widest text-slate-500">託運單號條碼依正式單據動態列印</div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>到店簡訊通知取件，請攜帶相片證件領取。</span>
                <span className="font-bold text-slate-600">NewebPay 物流</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  alert('已傳送熱感應列印指令至標籤機！列印規格：A6 (100x150mm) 4x6 吋。');
                  setShowLabelModal(false);
                }}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>列印熱感應標籤 (A6 / 4x6)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
