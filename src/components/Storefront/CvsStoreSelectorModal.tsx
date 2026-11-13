import React, { useState, useMemo, useEffect } from 'react';
import {
  Store,
  MapPin,
  Search,
  X,
  Check,
  ExternalLink,
  Building2,
  Sparkles,
  Copy,
  CheckCheck,
  Compass,
  PlusCircle,
  ClipboardPaste,
} from 'lucide-react';
import { ShippingMethod } from '../../types';
import { TAIWAN_CITIES, TAIWAN_REGIONS } from '../../data/taiwanDistricts';
import {
  queryTaiwanCvsStores,
  CvsStoreItem,
  registerNewFranchiseStore,
  parseCvsStoreText,
} from '../../data/taiwanCvsDatabase';

interface CvsStoreSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBrand?: '7-11' | 'familymart' | 'hilife' | 'okmart';
  initialMethod?: ShippingMethod;
  onSelectStore: (result: {
    brand: string;
    storeName: string;
    storeCode: string;
    storeAddress: string;
    fullFormatted: string;
    shippingMethod: ShippingMethod;
  }) => void;
}

export const CvsStoreSelectorModal: React.FC<CvsStoreSelectorModalProps> = ({
  isOpen,
  onClose,
  targetBrand,
  initialMethod = 'UNIMARTC2C',
  onSelectStore,
}) => {
  // Brand selection
  const [selectedBrand, setSelectedBrand] = useState<'7-11' | 'familymart' | 'hilife' | 'okmart'>(() => {
    if (targetBrand) return targetBrand;
    if (initialMethod === 'FAMIC2C') return 'familymart';
    if (initialMethod === 'HILIFEC2C') return 'hilife';
    if (initialMethod === 'OKMARTC2C') return 'okmart';
    return '7-11';
  });

  useEffect(() => {
    if (isOpen) {
      if (targetBrand) {
        setSelectedBrand(targetBrand);
      } else if (initialMethod === 'FAMIC2C') {
        setSelectedBrand('familymart');
      } else if (initialMethod === 'HILIFEC2C') {
        setSelectedBrand('hilife');
      } else if (initialMethod === 'OKMARTC2C') {
        setSelectedBrand('okmart');
      } else {
        setSelectedBrand('7-11');
      }
      setSearchKeyword('');
    }
  }, [isOpen, targetBrand, initialMethod]);

  // Location filter state
  const [selectedRegion, setSelectedRegion] = useState<string>('全部地區');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Mode: browse vs manual
  const [activeTab, setActiveTab] = useState<'browse' | 'manual'>('browse');
  const [manualName, setManualName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualAddr, setManualAddr] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Quick New Franchise Form & Smart Paste toggles
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [showSmartPaste, setShowSmartPaste] = useState<boolean>(false);
  const [quickAddName, setQuickAddName] = useState<string>('');
  const [quickAddCode, setQuickAddCode] = useState<string>('');
  const [quickAddAddr, setQuickAddAddr] = useState<string>('');

  // Smart Paste Parser state
  const [pasteInputText, setPasteInputText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<Partial<CvsStoreItem> | null>(null);

  // Copied store code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Available cities filtered by region
  const filteredCities = useMemo(() => {
    if (selectedRegion === '全部地區') {
      return TAIWAN_CITIES;
    }
    return TAIWAN_CITIES.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  // Available districts filtered by selected city
  const availableDistricts = useMemo(() => {
    if (selectedCity === 'all') return [];
    const found = TAIWAN_CITIES.find((c) => c.city === selectedCity);
    return found ? found.districts : [];
  }, [selectedCity]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('all');
    setSelectedDistrict('all');
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('all');
  };

  // Query stores using the 7,000+ per-chain database engine
  const storeResults = useMemo(() => {
    return queryTaiwanCvsStores({
      brand: selectedBrand,
      region: selectedRegion === '全部地區' ? 'all' : selectedRegion,
      city: selectedCity === 'all' ? 'all' : selectedCity,
      district: selectedDistrict === 'all' ? 'all' : selectedDistrict,
      query: searchKeyword,
      limit: 300,
    });
  }, [selectedBrand, selectedRegion, selectedCity, selectedDistrict, searchKeyword, refreshTrigger]);

  if (!isOpen) return null;

  const getShippingMethod = (brand: string): ShippingMethod => {
    if (brand === 'familymart') return 'FAMIC2C';
    if (brand === 'hilife') return 'HILIFEC2C';
    if (brand === 'okmart') return 'OKMARTC2C';
    return 'UNIMARTC2C';
  };

  const handleSelectStoreItem = (store: CvsStoreItem) => {
    const shippingMethod = getShippingMethod(store.brand);
    const fullFormatted = `${store.brandName} ${store.storeName} (${store.storeCode}) - ${store.address}`;
    onSelectStore({
      brand: store.brandName,
      storeName: store.storeName,
      storeCode: store.storeCode,
      storeAddress: store.address,
      fullFormatted,
      shippingMethod,
    });
    onClose();
  };

  const handleQuickRegisterAndSelect = (name: string, code?: string, addr?: string) => {
    const targetCity = selectedCity !== 'all' ? selectedCity : '嘉義縣';
    const targetDistrict = selectedDistrict !== 'all' ? selectedDistrict : '民雄鄉';

    const newStore = registerNewFranchiseStore({
      brand: selectedBrand,
      storeName: name.trim(),
      storeCode: code?.trim(),
      city: targetCity,
      district: targetDistrict,
      address: addr?.trim(),
    });

    setRefreshTrigger((prev) => prev + 1);
    handleSelectStoreItem(newStore);
  };

  const handleApplyManualStore = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    if (!manualName.trim()) {
      setManualError('請填寫門市名稱（例如：信義門市）');
      return;
    }

    const brandNames = {
      '7-11': '7-ELEVEN',
      familymart: '全家便利商店',
      hilife: '萊爾富',
      okmart: 'OK超商',
    };
    const bName = brandNames[selectedBrand];
    const shippingMethod = getShippingMethod(selectedBrand);
    const code = manualCode.trim() || `${Date.now().toString().slice(-6)}`;
    const addr =
      manualAddr.trim() ||
      `${selectedCity !== 'all' ? selectedCity : ''}${selectedDistrict !== 'all' ? selectedDistrict : ''}`;

    registerNewFranchiseStore({
      brand: selectedBrand,
      storeName: manualName.trim(),
      storeCode: code,
      city: selectedCity !== 'all' ? selectedCity : '嘉義縣',
      district: selectedDistrict !== 'all' ? selectedDistrict : '民雄鄉',
      address: addr,
    });

    const fullFormatted = `${bName} ${manualName.trim()} (${code}) - ${addr}`;

    onSelectStore({
      brand: bName,
      storeName: manualName.trim(),
      storeCode: code,
      storeAddress: addr,
      fullFormatted,
      shippingMethod,
    });
    onClose();
  };

  const handleSmartPasteParse = (text: string) => {
    setPasteInputText(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    const result = parseCvsStoreText(text);
    if (result) {
      setParsedPreview(result);
      if (result.brand) {
        setSelectedBrand(result.brand);
      }
      if (result.city) {
        setSelectedCity(result.city);
      }
      if (result.district) {
        setSelectedDistrict(result.district);
      }
    }
  };

  const copyStoreCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col h-[92vh] sm:h-[86vh] overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Clean Non-Wrapping Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base whitespace-nowrap">
                  選擇取件超商門市
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 inline-flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  全台 22 縣市・368 鄉鎮
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug truncate">
                藍新物流 (NewebPay) 電子地圖連動・支援全台 7,000+ 門市檢索與新增
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Controls Section (Compact & Non-Clipping) */}
        <div className="px-3.5 sm:px-5 pt-2.5 pb-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 space-y-2 shrink-0">
          {/* Segmented Mode Switcher: 2 Equal Columns, Single-Line Text */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'browse'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>全台門市檢索 ({storeResults.totalCount.toLocaleString()})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>手動填寫 / 官方地圖</span>
            </button>
          </div>

          {/* 4 CVS Brand Selector Cards: Uniform Height & Single-Line Labels */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* 7-11 */}
            <button
              type="button"
              onClick={() => setSelectedBrand('7-11')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                selectedBrand === '7-11'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/50 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#008000] text-white font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                7
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                7-ELEVEN
              </span>
            </button>

            {/* FamilyMart */}
            <button
              type="button"
              onClick={() => setSelectedBrand('familymart')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                selectedBrand === 'familymart'
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500/50 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#00A1E9] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                全家
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                全家超商
              </span>
            </button>

            {/* Hi-Life */}
            <button
              type="button"
              onClick={() => setSelectedBrand('hilife')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                selectedBrand === 'hilife'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500/50 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                萊
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                萊爾富
              </span>
            </button>

            {/* OK Mart */}
            <button
              type="button"
              onClick={() => setSelectedBrand('okmart')}
              className={`py-2 px-1.5 sm:px-2.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                selectedBrand === 'okmart'
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/50 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-red-700 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                OK
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold whitespace-nowrap">
                OK 超商
              </span>
            </button>
          </div>

          {/* Region + City/District + Search Controls (Only in Browse mode) */}
          {activeTab === 'browse' && (
            <div className="space-y-2 pt-0.5">
              {/* 6 Region Buttons in a full-width 6-column grid so nothing is clipped */}
              <div className="grid grid-cols-6 gap-1">
                {TAIWAN_REGIONS.map((reg) => {
                  const shortLabel = reg === '全部地區' ? '全部地區' : reg;
                  return (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => handleRegionChange(reg)}
                      className={`py-1 px-1 rounded-lg font-bold text-[11px] sm:text-xs text-center transition-colors cursor-pointer whitespace-nowrap ${
                        selectedRegion === reg
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              {/* Side-by-Side City & District Dropdowns + Search Box */}
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-1.5 sm:gap-2">
                {/* City Select */}
                <div className="col-span-1 sm:col-span-3">
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="all">全台所有縣市 ({filteredCities.length})</option>
                    {filteredCities.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.districts.length}區)
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Select */}
                <div className="col-span-1 sm:col-span-3">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedCity === 'all'}
                    className={`w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 font-bold ${
                      selectedCity === 'all'
                        ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'text-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <option value="all">
                      {selectedCity === 'all' ? '請先選取縣市' : '全部鄉鎮市區'}
                    </option>
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.zip})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Keyword Input */}
                <div className="col-span-2 sm:col-span-6 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜尋門市名稱 (例: 逢甲、民雄)、6碼店號或路名..."
                    className="w-full pl-8 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 font-medium"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Main Scrollable Store List / Manual Entry Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-slate-900 p-4 sm:p-5">
          {activeTab === 'browse' ? (
            <div className="space-y-2.5">
              {/* Compact Action & Count Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedCity === 'all' ? '全台灣' : selectedCity}
                    {selectedDistrict !== 'all' ? `・${selectedDistrict}` : ''} 門市：
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-black ml-0.5">
                      {storeResults.totalCount.toLocaleString()}
                    </span>{' '}
                    間
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSmartPaste(!showSmartPaste);
                      if (!showSmartPaste) setShowQuickAddModal(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors border ${
                      showSmartPaste
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-400 text-indigo-800 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <ClipboardPaste className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>智慧貼上</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddModal(!showQuickAddModal);
                      if (!showQuickAddModal) setShowSmartPaste(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>{showQuickAddModal ? '收合表單' : '＋ 新增未列出店面'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Smart Paste Box */}
              {showSmartPaste && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      貼上官方電子地圖或簡訊門市文字，自動辨識店名與店號
                    </span>
                    {parsedPreview && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> 已辨識門市
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pasteInputText}
                      onChange={(e) => handleSmartPasteParse(e.target.value)}
                      placeholder="例：全家 民雄東榮店 018273 嘉義縣民雄鄉東榮村民權路15號"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                    {parsedPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          if (parsedPreview.storeName) {
                            handleQuickRegisterAndSelect(
                              parsedPreview.storeName,
                              parsedPreview.storeCode,
                              parsedPreview.address
                            );
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>立即套用</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Collapsible Quick Add New Franchise Form */}
              {showQuickAddModal && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-500/40 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        新增未列出 / 新開幕超商門市（永久存入門市清單）
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                    >
                      ✕ 關閉
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={quickAddName}
                      onChange={(e) => setQuickAddName(e.target.value)}
                      placeholder="門市名稱 * (例：雙福門市)"
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={quickAddCode}
                      onChange={(e) => setQuickAddCode(e.target.value)}
                      placeholder="6碼店號 (選填，未填自動編號)"
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={quickAddAddr}
                      onChange={(e) => setQuickAddAddr(e.target.value)}
                      placeholder="門市地址 (選填)"
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!quickAddName.trim()}
                      onClick={() => {
                        handleQuickRegisterAndSelect(quickAddName, quickAddCode, quickAddAddr);
                        setQuickAddName('');
                        setQuickAddCode('');
                        setQuickAddAddr('');
                        setShowQuickAddModal(false);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>新增並立即選取此門市</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Store Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {storeResults.stores.map((store) => (
                  <div
                    key={`${store.brand}-${store.storeCode}-${store.storeName}`}
                    onClick={() => handleSelectStoreItem(store)}
                    className={`p-3 bg-white dark:bg-slate-950/70 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border rounded-2xl transition-all cursor-pointer group flex items-center justify-between gap-2.5 shadow-2xs ${
                      store.isNewlyOpened
                        ? 'border-emerald-400 dark:border-emerald-500/50'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                          {store.storeName}
                        </span>
                        {store.isNewlyOpened && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
                            新加盟/特約
                          </span>
                        )}
                        {store.isFlagship && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30">
                            旗艦店
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => copyStoreCode(store.storeCode, e)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                          title="複製店號"
                        >
                          <span>店號 {store.storeCode}</span>
                          {copiedCode === store.storeCode ? (
                            <CheckCheck className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-start gap-1 text-slate-600 dark:text-slate-300 text-[11px] leading-snug">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-words">{store.address}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStoreItem(store);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 group-hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 group-hover:text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      選取
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Tab 2: Manual Entry & Official External Maps */
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    四大超商官方電子地圖查詢
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    查詢後可將店名與店號填入下方表單
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <a
                    href="https://emap.presco.com.tw/c2cemap.ashx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl text-center font-bold transition-all flex flex-col items-center gap-0.5"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs">7-ELEVEN 地圖 ↗</span>
                    <span className="text-[10px] text-slate-400">emap.presco.com.tw</span>
                  </a>

                  <a
                    href="https://www.family.com.tw/marketing/inquiry.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-sky-50 border border-slate-200 dark:border-slate-800 hover:border-sky-500 rounded-xl text-center font-bold transition-all flex flex-col items-center gap-0.5"
                  >
                    <span className="text-sky-600 dark:text-sky-400 text-xs">全家店舖查詢 ↗</span>
                    <span className="text-[10px] text-slate-400">family.com.tw</span>
                  </a>

                  <a
                    href="https://www.hilife.com.tw/storeInquiry_street.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-rose-50 border border-slate-200 dark:border-slate-800 hover:border-rose-500 rounded-xl text-center font-bold transition-all flex flex-col items-center gap-0.5"
                  >
                    <span className="text-rose-600 dark:text-rose-400 text-xs">萊爾富門市查詢 ↗</span>
                    <span className="text-[10px] text-slate-400">hilife.com.tw</span>
                  </a>

                  <a
                    href="https://www.okmart.com.tw/convenient_shopSearch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-amber-50 border border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-xl text-center font-bold transition-all flex flex-col items-center gap-0.5"
                  >
                    <span className="text-amber-600 dark:text-amber-400 text-xs">OK超商門市查詢 ↗</span>
                    <span className="text-[10px] text-slate-400">okmart.com.tw</span>
                  </a>
                </div>
              </div>

              <form onSubmit={handleApplyManualStore} className="space-y-3.5 bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-200">
                    手動填寫或新增指定超商門市
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    輸入後將自動存入全台門市清單並立即套用至此筆訂單
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      門市名稱 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="例如：民雄東榮店 或 科技門市"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      6 碼門市店號 (選填)
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="例如：018273"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      門市完整地址 (選填)
                    </label>
                    <input
                      type="text"
                      value={manualAddr}
                      onChange={(e) => setManualAddr(e.target.value)}
                      placeholder="例如：嘉義縣民雄鄉建國路二段88號"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {manualError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    {manualError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>確認套用並儲存此超商門市</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 4. Compact Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">
              已載入全台灣 22 縣市・368 鄉鎮超商門市資料庫
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
