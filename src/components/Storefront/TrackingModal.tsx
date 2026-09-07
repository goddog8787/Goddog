import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  RotateCw,
  Package,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrackingNumber?: string;
  orders: Order[];
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  defaultTrackingNumber = '',
  orders,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState(
    defaultTrackingNumber || orders[0]?.trackingNumber || '77391829310'
  );
  const [carrier, setCarrier] = useState<'7-11' | 'familymart' | 'blackcat'>('7-11');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTracking = async (code: string, car: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/logistics/track/${code}?carrier=${car}`);
      const data = await res.json();
      if (data.success) {
        setTrackingData(data.tracking);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const targetCode = defaultTrackingNumber || inputCode || '77391829310';
      fetchTracking(targetCode, carrier);
    }
  }, [isOpen, defaultTrackingNumber]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">即時物流動態查詢中心</h3>
              <p className="text-xs text-slate-500 mt-1">
                支援 7-ELEVEN 交貨便、全家店到店、黑貓宅急便跨溫控速配
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Tracking Search Input & Carrier selector */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="輸入 11 碼或託運單號 (例如: 77391829310)"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <select
                value={carrier}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setCarrier(val);
                  fetchTracking(inputCode, val);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
              >
                <option value="7-11">7-ELEVEN 交貨便</option>
                <option value="familymart">全家店到店</option>
                <option value="blackcat">黑貓宅急便</option>
              </select>

              <button
                onClick={() => fetchTracking(inputCode, carrier)}
                disabled={isLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>查詢</span>
              </button>
            </div>

            {/* Quick recent orders chips */}
            {orders.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                <span className="text-slate-400 shrink-0">我的近期訂單：</span>
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setInputCode(o.trackingNumber);
                      setCarrier(o.shippingMethod === 'blackcat' ? 'blackcat' : o.shippingMethod === 'familymart' ? 'familymart' : '7-11');
                      fetchTracking(o.trackingNumber, o.shippingMethod);
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-mono transition-colors shrink-0 cursor-pointer ${
                      inputCode === o.trackingNumber
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {o.orderNumber} ({o.trackingNumber})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Status Card */}
          {trackingData && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-md">
                  {trackingData.carrierName}
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">
                  單號：{trackingData.trackingNumber}
                </span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {trackingData.currentStatus}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {trackingData.estimatedArrival}
                  </p>
                  {trackingData.driverPhone && (
                    <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      司機專線：{trackingData.driverPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Checkpoints */}
          {trackingData?.timeline && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                配送進度明細檢索
              </h4>

              <div className="space-y-4 pl-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {trackingData.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className={`w-3.5 h-3.5 rounded-full z-10 mt-1 shrink-0 ${
                      idx === 0 
                        ? 'bg-emerald-500 ring-4 ring-emerald-100' 
                        : 'bg-slate-300'
                    }`} />
                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{step.title}</span>
                        <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
