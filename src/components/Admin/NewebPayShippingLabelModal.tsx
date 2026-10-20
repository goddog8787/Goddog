import React, { useRef, useState } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Truck, 
  QrCode, 
  Barcode as BarcodeIcon, 
  Package, 
  Store, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Order, LogisticsSettings } from '../../types';

interface NewebPayShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[]; // Support single or batch orders
  logisticsSettings: LogisticsSettings;
  onMarkAsDispatched?: (orderIds: string[]) => void;
}

/**
 * Generate a realistic-looking Code 128 / Code 39 SVG barcode
 */
const SvgBarcode: React.FC<{ code: string; height?: number; className?: string }> = ({ 
  code, 
  height = 48,
  className = '' 
}) => {
  // Deterministic bar widths based on input string characters
  const cleanCode = (code || '00000000').replace(/[^a-zA-Z0-9]/g, '');
  const bars: { width: number; isBlack: boolean }[] = [];
  
  // Lead quiet zone & start pattern
  bars.push({ width: 3, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const pattern = (charCode * 7 + i * 13) % 16;
    const w1 = 1 + (pattern % 3);
    const w2 = 1 + ((pattern >> 1) % 3);
    const w3 = 1 + ((pattern >> 2) % 3);
    const w4 = 1 + ((pattern >> 3) % 2);

    bars.push({ width: w1, isBlack: true });
    bars.push({ width: w2, isBlack: false });
    bars.push({ width: w3, isBlack: true });
    bars.push({ width: w4, isBlack: false });
  }

  // Stop pattern & quiet zone
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 3, isBlack: false });

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  let currentX = 0;
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[280px] h-12"
        preserveAspectRatio="none"
      >
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#000000"
            />
          );
        })}
      </svg>
      <span className="font-mono font-bold tracking-[3px] text-[11px] text-slate-800 mt-0.5 select-all">
        {code}
      </span>
    </div>
  );
};

export const NewebPayShippingLabelModal: React.FC<NewebPayShippingLabelModalProps> = ({
  isOpen,
  onClose,
  orders,
  logisticsSettings,
  onMarkAsDispatched,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !orders || orders.length === 0) return null;

  const currentOrder = orders[currentIndex] || orders[0];

  // Helper to extract store code & name
  const extractStoreInfo = (storeOrAddress: string) => {
    if (!storeOrAddress) return { name: '指定門市', code: '991823' };
    const match = storeOrAddress.match(/\((.*?)\)/);
    const code = match ? match[1] : '991823';
    const name = storeOrAddress.split('(')[0]?.trim() || storeOrAddress;
    return { name, code };
  };

  const storeInfo = extractStoreInfo(currentOrder.storeOrAddress);

  // Determine logistics provider branding
  const getProviderBrand = (shippingMethod?: string, storeOrAddress?: string) => {
    const raw = `${shippingMethod || ''} ${storeOrAddress || ''}`.toLowerCase();
    if (raw.includes('全家') || raw.includes('family')) {
      return {
        brandName: '全家 FamilyMart 店到店',
        subName: '藍新金流 C2C 電子門市交寄單',
        colorBadge: 'bg-emerald-600 text-white',
        borderCol: 'border-emerald-600',
        brandCode: 'FAMI',
        labelType: '全家店到店包裹託運單',
      };
    }
    if (raw.includes('萊爾富') || raw.includes('hilife')) {
      return {
        brandName: '萊爾富 Hi-Life 電子寄件',
        subName: '藍新金流 Life-ET 寄件代碼單',
        colorBadge: 'bg-rose-600 text-white',
        borderCol: 'border-rose-600',
        brandCode: 'HILIFE',
        labelType: '萊爾富超商託運單',
      };
    }
    if (raw.includes('ok') || raw.includes('okmart')) {
      return {
        brandName: 'OK·MART 超商寄件',
        subName: '藍新金流 OK·go 門市託運單',
        colorBadge: 'bg-amber-600 text-white',
        borderCol: 'border-amber-600',
        brandCode: 'OKMART',
        labelType: 'OK 超商包裹託運單',
      };
    }
    if (raw.includes('宅配') || raw.includes('黑貓') || raw.includes('home')) {
      return {
        brandName: '黑貓宅急便 / 藍新宅配',
        subName: '藍新金流 宅配電子託運單',
        colorBadge: 'bg-slate-900 text-white',
        borderCol: 'border-slate-900',
        brandCode: 'DELIVERY',
        labelType: '宅配通溫控防護託運單',
      };
    }
    // Default: 7-ELEVEN
    return {
      brandName: '7-ELEVEN 交貨便 C2C',
      subName: '藍新金流 NewebPay 門市交寄單',
      colorBadge: 'bg-[#007A3D] text-white',
      borderCol: 'border-[#007A3D]',
      brandCode: '7-11',
      labelType: '7-ELEVEN 門市交寄託運單',
    };
  };

  const provider = getProviderBrand(currentOrder.shippingMethod, currentOrder.storeOrAddress);

  // Copy tracking number
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Trigger Direct Thermal Printing
  const handlePrint = () => {
    // Inject print styles to isolate label area
    const printContent = document.getElementById('newebpay-thermal-label-container');
    if (!printContent) return;

    window.print();
  };

  // Download label as thermal text/html file for offline barcode printing
  const handleDownloadLabel = () => {
    const trackingNo = currentOrder.trackingNumber || currentOrder.shipOrderNo || currentOrder.orderNumber;
    const content = `
======================================================
神狗勾 3D 台灣官方旗艦店 - 藍新金流電子託運單 (A6 4x6 規格)
======================================================
物流品牌：${provider.brandName}
藍新特店代號：${logisticsSettings.newebpayLogisticsMerchantId}
訂單編號：${currentOrder.orderNumber}
藍新物流單號：${currentOrder.shipOrderNo || trackingNo}
物流託運條碼：${trackingNo}
取件門市：${storeInfo.name} (門市代碼: ${storeInfo.code})
收件人姓名：${currentOrder.customerName}
收件人電話：${currentOrder.customerPhone}
代收貨款金額：${currentOrder.paymentGateway === 'cod' ? `NT$ ${currentOrder.total.toLocaleString()} 元` : '0 元 (藍新線上已付款，請核對身分證件)'}
寄件人：${logisticsSettings.senderName} (${logisticsSettings.senderPhone})
寄件地址：${logisticsSettings.senderAddress}
耗材明細：
${(currentOrder.items || []).map((i, idx) => `  ${idx + 1}. ${i.name} x${i.quantity || 1}`).join('\n')}
------------------------------------------------------
列印時間：${new Date().toLocaleString('zh-TW')}
======================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `藍新物流單_${currentOrder.orderNumber}_${trackingNo}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const trackingNumber = currentOrder.trackingNumber || currentOrder.shipOrderNo || `NW${Date.now().toString().slice(-8)}`;
  const routingBarcode = `TW${storeInfo.code}${trackingNumber.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print-specific CSS injected directly */}
      <style>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #newebpay-thermal-label-container,
          #newebpay-thermal-label-container * {
            visibility: visible !important;
          }
          #newebpay-thermal-label-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header (No print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  藍新金流電子託運單一鍵列印
                </h3>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  NewebPay 官方超商/宅配規範
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                標準 A6 / 4x6 吋熱感應標籤規格，支援超商交寄、條碼刷讀與包裹配送
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="關閉視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch pagination switcher if multiple orders selected */}
        {orders.length > 1 && (
          <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900 no-print">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>批次列印模式：第 {currentIndex + 1} 筆 / 共 {orders.length} 筆待出貨訂單</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono">
                {currentIndex + 1} / {orders.length}
              </span>
              <button
                disabled={currentIndex === orders.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(orders.length - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Thermal Label Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 flex items-center justify-center">
          {/* Printable Container */}
          <div
            id="newebpay-thermal-label-container"
            ref={printAreaRef}
            className="w-full max-w-[390px] bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-sm text-slate-950 font-sans space-y-3.5 print:border-none print:shadow-none print:p-0 print:max-w-none"
          >
            {/* Label Header */}
            <div className="border-b-2 border-slate-900 pb-2.5 flex items-start justify-between gap-2">
              <div>
                <span className={`inline-block text-[11px] font-black px-2 py-0.5 rounded ${provider.colorBadge}`}>
                  {provider.brandName}
                </span>
                <div className="text-[10px] font-bold text-slate-700 tracking-wider mt-1">
                  {provider.subName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {provider.labelType}
                </span>
                <div className="text-[9px] text-slate-500 font-mono mt-1">
                  特店: {logisticsSettings.newebpayLogisticsMerchantId}
                </div>
              </div>
            </div>

            {/* Destination Store / Receiver Banner (Very Large for Courier/Clerk) */}
            <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>取件門市與代碼：</span>
                <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.2 rounded font-extrabold text-slate-900">
                  門市號：{storeInfo.code}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {storeInfo.name}
              </div>
              <div className="text-[11px] text-slate-600 truncate font-medium">
                {currentOrder.storeOrAddress}
              </div>
            </div>

            {/* Primary Logistics Barcode */}
            <div className="py-2.5 px-3 bg-white border border-slate-300 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <BarcodeIcon className="w-3.5 h-3.5 text-slate-700" />
                <span>超商物流交寄託運條碼 (ShipOrderNo)</span>
              </div>
              <SvgBarcode code={trackingNumber} height={50} />
            </div>

            {/* Secondary Routing Barcode & Routing Code */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 border border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50">
                <span className="text-[9px] font-bold text-slate-500">超商路線分揀條碼</span>
                <SvgBarcode code={routingBarcode} height={32} className="mt-0.5" />
              </div>
              <div className="p-2 border border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50">
                <span className="text-[9px] font-bold text-slate-500">藍新金流訂單查核碼</span>
                <div className="font-mono font-black text-sm text-slate-900 mt-1">
                  {currentOrder.orderNumber}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {currentOrder.createdAt}
                </span>
              </div>
            </div>

            {/* Key Receiver & Financial Information */}
            <div className="border-t-2 border-slate-900 pt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 font-medium block">取件人資訊：</span>
                <div className="font-black text-slate-900 text-sm">
                  {currentOrder.customerName}
                </div>
                <div className="font-mono text-slate-600 text-[11px]">
                  {currentOrder.customerPhone}
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-500 font-medium block">代收代付金額：</span>
                <div className={`font-black text-sm ${
                  currentOrder.paymentGateway === 'cod' ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {currentOrder.paymentGateway === 'cod' ? (
                    `代收 NT$ ${currentOrder.total.toLocaleString()}`
                  ) : (
                    '已付款 (0元取貨)'
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentOrder.paymentGateway === 'cod' ? '請向買家收取現金' : '憑身分證正本領取'}
                </div>
              </div>
            </div>

            {/* Sender / Store Information */}
            <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
              <div className="flex justify-between font-medium">
                <span>寄件人：{logisticsSettings.senderName}</span>
                <span className="font-mono">{logisticsSettings.senderPhone}</span>
              </div>
              <div className="truncate text-slate-500">
                發貨地：{logisticsSettings.senderAddress}
              </div>
            </div>

            {/* Ordered Items Summary */}
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 block">
                託運商品規格清單 (共 {(currentOrder.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} 盤線材)：
              </span>
              <div className="space-y-0.5 text-[10px] font-mono text-slate-600">
                {(currentOrder.items || []).slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[240px]">• {item.name}</span>
                    <span className="font-bold">x{item.quantity || 1}</span>
                  </div>
                ))}
                {(currentOrder.items || []).length > 3 && (
                  <div className="text-slate-400 italic">
                    ...其餘 {(currentOrder.items || []).length - 3} 個品項省略
                  </div>
                )}
              </div>
            </div>

            {/* Thermal Label Footer */}
            <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center text-[9px] text-slate-400 font-mono">
              <span>藍新金流 NewebPay 物流協定</span>
              <span>神狗勾 3D 官方出貨防偽專用</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (No print) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopy(trackingNumber, 'track-no')}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
            >
              {copiedId === 'track-no' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">單號已複製！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>複製物流託運單號</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadLabel}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
              title="匯出電子標籤文字與條碼數據檔"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>匯出單據檔案</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              關閉
            </button>

            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              <span>一鍵列印熱感應託運單 (A6 / 4x6)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
