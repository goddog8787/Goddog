import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  BookmarkPlus,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Order, LanguageCode } from '../../types';
import { 
  loadCustomerTrackingNumbers, 
  saveCustomerTrackingNumbers 
} from '../../lib/customerPersistence';
import { isMockOrder } from '../../lib/orderVerification';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrackingNumber?: string;
  orders: Order[];
  userId?: string;
  lang?: LanguageCode;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  defaultTrackingNumber = '',
  orders,
  userId,
  lang: propLang,
}) => {
  const lang: LanguageCode = propLang || (typeof window !== 'undefined' ? (localStorage.getItem('printcore_lang') as LanguageCode) : null) || 'zh-TW';
  // Strictly filter out any mock/simulated orders
  const genuineOrders = useMemo(() => {
    return (orders || []).filter(o => 
      !isMockOrder(o) && 
      (o.paymentStatus === 'paid' || o.isVerifiedByNewebPay) && 
      o.trackingNumber && 
      o.trackingNumber !== '77391829310' && 
      !o.trackingNumber.includes('77391829310') &&
      !o.trackingNumber.startsWith('TEST') &&
      !o.trackingNumber.startsWith('MOCK')
    );
  }, [orders]);

  const cleanDefaultCode = (defaultTrackingNumber && defaultTrackingNumber !== '77391829310' && !defaultTrackingNumber.includes('77391829310'))
    ? defaultTrackingNumber
    : (genuineOrders[0]?.trackingNumber || '');

  const [inputCode, setInputCode] = useState(cleanDefaultCode);
  const [carrier, setCarrier] = useState<'7-11' | 'familymart' | 'blackcat'>('7-11');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedNumbers, setSavedNumbers] = useState<string[]>([]);

  // Load saved tracking numbers on open, purges any mock test numbers
  useEffect(() => {
    if (isOpen) {
      loadCustomerTrackingNumbers(userId).then((nums) => {
        if (nums && nums.length > 0) {
          const clean = nums.filter(n => 
            n && 
            n !== '77391829310' && 
            !n.includes('77391829310') && 
            !n.startsWith('TEST') && 
            !n.startsWith('MOCK')
          );
          setSavedNumbers(clean);
          if (clean.length !== nums.length) {
            saveCustomerTrackingNumbers(userId, clean);
          }
        } else {
          setSavedNumbers([]);
        }
      });
    }
  }, [isOpen, userId]);

  const fetchTracking = async (code: string, car: string) => {
    const trimmed = String(code || '').trim();
    if (!trimmed) {
      setTrackingData(null);
      setErrorMessage(
        lang === 'en' 
          ? 'Please enter a package tracking number to search.' 
          : lang === 'ja' 
          ? '検索する追跡番号を入力してください。' 
          : '請輸入包裹託運單號以進行查詢。'
      );
      return;
    }

    if (trimmed === '77391829310' || trimmed.includes('77391829310') || trimmed.startsWith('TEST') || trimmed.startsWith('MOCK')) {
      setTrackingData(null);
      setErrorMessage(
        lang === 'en'
          ? 'This tracking number was a demo test reference and has been invalidated. Please enter your genuine tracking number.'
          : lang === 'ja'
          ? 'この番号はテスト用の無効な番号です。決済後に発行された正規の追跡番号をご入力ください。'
          : '此單號為過期測試單號，已被系統全面作廢。請輸入真實藍新付款後指派之正式單號。'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/logistics/track/${encodeURIComponent(trimmed)}?carrier=${car}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackingData(data.tracking);
        // Automatically save to customer's tracking numbers if valid
        if (trimmed && !savedNumbers.includes(trimmed)) {
          const updated = [trimmed, ...savedNumbers].slice(0, 15);
          setSavedNumbers(updated);
          saveCustomerTrackingNumbers(userId, updated);
        }
      } else {
        setTrackingData(null);
        setErrorMessage(
          data.message || (
            lang === 'en'
              ? 'No tracking records found. Please verify your tracking code or check the carrier portal directly.'
              : lang === 'ja'
              ? '荷物情報が見つかりませんでした。番号をご確認いただくか、各社公式サイトでお確かめください。'
              : '查無此包裹託運單號。請確認單號正確性，或至超商物流官網進行查詢。'
          )
        );
      }
    } catch (e) {
      console.error(e);
      setTrackingData(null);
      setErrorMessage(
        lang === 'en'
          ? 'Connecting to logistics network. Please retry in a moment or visit official carrier site.'
          : lang === 'ja'
          ? '配送サーバーに接続中です。しばらくしてから再試行するか各社公式サイトをご確認ください。'
          : '物流狀態伺服器連線中，請稍候重試或至物流官網查詢。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSavedNumber = (codeToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedNumbers.filter((n) => n !== codeToRemove);
    setSavedNumbers(updated);
    saveCustomerTrackingNumbers(userId, updated);
  };

  useEffect(() => {
    if (isOpen) {
      const targetCode = cleanDefaultCode || inputCode || '';
      if (targetCode && targetCode !== '77391829310' && !targetCode.includes('77391829310')) {
        fetchTracking(targetCode, carrier);
      } else {
        setTrackingData(null);
      }
    }
  }, [isOpen, cleanDefaultCode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      title="點擊背景空白處可返回主頁面"
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative cursor-default select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'en' ? 'Live Order Tracking Portal' : lang === 'ja' ? 'リアルタイム配送追跡センター' : '即時物流動態查詢中心'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en'
                  ? '7-ELEVEN, FamilyMart & T-Cat Courier • Live Official Carrier Status'
                  : lang === 'ja'
                  ? '7-11、FamilyMart、ヤマト黒猫宅急便公式追跡連動'
                  : '真實藍新金流物流服務 • 支援 7-11、全家、黑貓宅急便 • 官網動態聯網查詢'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
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
                  placeholder={lang === 'en' ? 'Enter tracking number (e.g., 773... / 882...)' : lang === 'ja' ? '追跡番号を入力 (例: 773... / 882...)' : '輸入包裹託運單號 (如 773... / 882... / 903...)'}
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
                <option value="7-11">7-ELEVEN {lang === 'en' ? 'Drop-off' : lang === 'ja' ? '受取便' : '交貨便'}</option>
                <option value="familymart">FamilyMart {lang === 'en' ? 'Store-to-Store' : lang === 'ja' ? '店舗受取' : '店到店'}</option>
                <option value="blackcat">{lang === 'en' ? 'T-Cat Express Courier' : lang === 'ja' ? 'クロネコヤマト宅急便' : '黑貓宅急便'}</option>
              </select>

              <button
                onClick={() => fetchTracking(inputCode, carrier)}
                disabled={isLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{lang === 'en' ? 'Search' : lang === 'ja' ? '追跡' : '查詢'}</span>
              </button>
            </div>

            {/* Quick recent orders chips - ONLY genuine verified orders */}
            {genuineOrders.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
                  <span className="text-slate-400 shrink-0 font-medium">
                    {lang === 'en' ? 'My Verified Orders:' : lang === 'ja' ? 'ご注文履歴:' : '我的正式訂單：'}
                  </span>
                  {genuineOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setInputCode(o.trackingNumber);
                        const car = o.shippingMethod === 'blackcat' ? 'blackcat' : o.shippingMethod === 'familymart' ? 'familymart' : '7-11';
                        setCarrier(car);
                        fetchTracking(o.trackingNumber, car);
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
              </div>
            )}

            {/* Customer Saved Tracking Numbers History - ONLY genuine numbers */}
            {savedNumbers.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
                <span className="text-slate-400 shrink-0 font-medium">
                  {lang === 'en' ? 'Saved Numbers:' : lang === 'ja' ? '保存済み番号:' : '已保存單號：'}
                </span>
                {savedNumbers.map((num) => (
                  <div
                    key={num}
                    onClick={() => {
                      setInputCode(num);
                      fetchTracking(num, carrier);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-xs cursor-pointer transition-colors ${
                      inputCode === num
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{num}</span>
                    <button
                      onClick={(e) => handleRemoveSavedNumber(num, e)}
                      className="text-slate-400 hover:text-rose-500 ml-0.5"
                      title={lang === 'en' ? 'Remove' : lang === 'ja' ? '削除' : '移除記錄'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error / Not Found View */}
          {errorMessage && !isLoading && (
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    {lang === 'en' ? 'Logistics Status Notice' : lang === 'ja' ? '配送状況のご案内' : '物流檢索提醒'}
                  </h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{errorMessage}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/80">
                <p className="text-[11px] font-medium text-amber-800 mb-2">
                  {lang === 'en' ? 'You can also inspect status via official carrier systems:' : lang === 'ja' ? '各社公式システムからも直接ご確認いただけます：' : '您也可以直接前往物流官方系統查詢最新貨態：'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="https://eservice.7-11.com.tw/E-Tracking/search.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-medium"
                  >
                    <span>7-11 {lang === 'en' ? 'Portal' : lang === 'ja' ? '追跡' : '交貨便查詢'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.famiport.com.tw/Web_Famiport/page/process.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-medium"
                  >
                    <span>FamilyMart {lang === 'en' ? 'Portal' : lang === 'ja' ? '追跡' : '店到店查詢'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.t-cat.com.tw/Inquire/Trace.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-medium"
                  >
                    <span>{lang === 'en' ? 'T-Cat Portal' : lang === 'ja' ? '黒猫ヤマト追跡' : '黑貓宅急便查詢'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Current Status Card */}
          {trackingData && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-md">
                  {trackingData.carrierName}
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">
                  {lang === 'en' ? 'Tracking #: ' : lang === 'ja' ? '追跡番号: ' : '單號：'}{trackingData.trackingNumber}
                </span>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {trackingData.currentStatus}
                    </h4>
                    {trackingData.isVerifiedByNewebPay && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        {lang === 'en' ? 'Payment Verified' : lang === 'ja' ? '決済照合済み' : '藍新入帳驗證通過'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {trackingData.estimatedArrival}
                  </p>
                  {trackingData.tradeNo && (
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {lang === 'en' ? 'Gateway Ref: ' : lang === 'ja' ? '決済参照番号: ' : '藍新交易序號：'}{trackingData.tradeNo}
                    </p>
                  )}
                </div>
              </div>

              {/* Official carrier verification link */}
              {trackingData.officialInquiryUrl && (
                <div className="pt-2 border-t border-indigo-100 flex justify-end">
                  <a
                    href={trackingData.officialInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    <span>
                      {lang === 'en' 
                        ? `Inspect directly on ${trackingData.carrierName.split(' ')[0]} portal`
                        : lang === 'ja'
                        ? `${trackingData.carrierName.split(' ')[0]} 公式サイトで確認`
                        : `前往 ${trackingData.carrierName.split(' ')[0]} 官網直接檢索即時貨態`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Timeline Checkpoints */}
          {trackingData?.timeline && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                {lang === 'en' ? 'Shipment Checkpoints' : lang === 'ja' ? '配送ステータス履歴' : '配送進度明細檢索'}
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
