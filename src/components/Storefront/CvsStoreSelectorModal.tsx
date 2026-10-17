import React, { useState, useMemo } from 'react';
import { 
  Store, 
  MapPin, 
  Search, 
  X, 
  Check, 
  ExternalLink, 
  Building2,
  Sparkles,
  Layers,
  Copy,
  CheckCheck,
  Compass,
  PlusCircle,
  ClipboardPaste,
  FileText
} from 'lucide-react';
import { ShippingMethod } from '../../types';
import { TAIWAN_CITIES, TAIWAN_REGIONS, CityInfo } from '../../data/taiwanDistricts';
import { 
  queryTaiwanCvsStores, 
  CvsStoreItem, 
  registerNewFranchiseStore, 
  parseCvsStoreText,
  getStoredCustomStores 
} from '../../data/taiwanCvsDatabase';

interface CvsStoreSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  initialMethod = 'UNIMARTC2C',
  onSelectStore
}) => {
  // Brand selection
  const [selectedBrand, setSelectedBrand] = useState<'7-11' | 'familymart' | 'hilife' | 'okmart'>(() => {
    if (initialMethod === 'FAMIC2C') return 'familymart';
    if (initialMethod === 'HILIFEC2C') return 'hilife';
    if (initialMethod === 'OKMARTC2C') return 'okmart';
    return '7-11';
  });

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

  // Quick New Franchise Form state
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
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

  // Handle region change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('all');
    setSelectedDistrict('all');
  };

  // Handle city change
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedDistrict('all');
  };

  // Query stores using the database engine
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

  // Map brand to ShippingMethod
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

  // Quick Register and Select New Franchise Store
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
    const addr = manualAddr.trim() || `${selectedCity !== 'all' ? selectedCity : ''}${selectedDistrict !== 'all' ? selectedDistrict : ''}`;
    
    // Also persist into custom stores database
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

  // Trigger Smart Paste Text Parsing
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
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  選擇取件超商門市
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  支援全台 22 縣市・368 鄉鎮
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[260px] sm:max-w-none">
                支援藍新物流 (NewebPay) 連動電子地圖，防阻擋彈跳視窗，安全直選
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Single Scroll Container: entire body scrolls naturally together */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-slate-900">
          {/* Tab & Brand Bar */}
          <div className="px-3.5 sm:px-5 pt-3 pb-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 space-y-2.5">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'browse'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>全台門市檢索 ({storeResults.totalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>手動填寫 / 官方電子地圖</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>藍新特約超商網絡</span>
            </div>
          </div>

          {/* CVS Brand Pills */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* 7-11 */}
            <button
              type="button"
              onClick={() => setSelectedBrand('7-11')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedBrand === '7-11'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-[#008000] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                7
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">7-ELEVEN</div>
                <div className="text-[10px] opacity-70 hidden sm:block">交貨便取貨</div>
              </div>
            </button>

            {/* FamilyMart */}
            <button
              type="button"
              onClick={() => setSelectedBrand('familymart')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedBrand === 'familymart'
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-[#00A1E9] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                全家
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">全家便利商店</div>
                <div className="text-[10px] opacity-70 hidden sm:block">店到店取貨</div>
              </div>
            </button>

            {/* Hi-Life */}
            <button
              type="button"
              onClick={() => setSelectedBrand('hilife')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedBrand === 'hilife'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                萊
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">萊爾富 Hi-Life</div>
                <div className="text-[10px] opacity-70 hidden sm:block">Life-ET 取件</div>
              </div>
            </button>

            {/* OK Mart */}
            <button
              type="button"
              onClick={() => setSelectedBrand('okmart')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                selectedBrand === 'okmart'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/50 shadow-xs'
                  : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-red-700 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                OK
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">OK 超商</div>
                <div className="text-[10px] opacity-70 hidden sm:block">OK·MART 門市</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab 1: Browse Stores Mode */}
        {activeTab === 'browse' && (
          <div>
            {/* Filter Bar: Region + City + District + Search */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5">
              {/* Region Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold shrink-0 mr-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  區域：
                </span>
                {TAIWAN_REGIONS.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => handleRegionChange(reg)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                      selectedRegion === reg
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* City, District & Keyword Search */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* City Select */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="all">全台灣所有縣市 ({filteredCities.length})</option>
                    {filteredCities.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.districts.length} 鄉鎮區)
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Select */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedCity === 'all'}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium ${
                      selectedCity === 'all' ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <option value="all">
                      {selectedCity === 'all' ? '請先選取縣市' : '全部行政區 / 鄉鎮'}
                    </option>
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.zip})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Keyword */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="輸入門市名稱 (例: 逢甲、站前)、6碼店號或路名..."
                    className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 font-medium"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Store List: Flowing directly within unified modal scroll */}
            <div className="p-3.5 sm:p-5 space-y-3 pb-12">
              {/* Statistics & Quick Add Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedCity === 'all' ? '全台灣' : selectedCity}
                    {selectedDistrict !== 'all' ? `・${selectedDistrict}` : ''}
                    {' '}符合門市：<span className="text-emerald-700 dark:text-emerald-400 font-mono font-black">{storeResults.totalCount}</span> 間
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                    (全台四大超商特約庫共 13,842 間)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(!showQuickAddModal)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showQuickAddModal ? '收合登記表' : '＋ 登記新加盟/未列出門市'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Quick Add Franchise Form */}
              {showQuickAddModal && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/40 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        登記新開幕加盟門市 (即時存入全台清單)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddModal(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      ✕ 關閉
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    登記後將立即注入您的本地門市資料庫，永久有效且供本次訂單立即選取！
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        門市名稱 <span className="text-rose-500 dark:text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={quickAddName}
                        onChange={(e) => setQuickAddName(e.target.value)}
                        placeholder="例如：民雄新開門市"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        6 碼店號 (選填)
                      </label>
                      <input
                        type="text"
                        value={quickAddCode}
                        onChange={(e) => setQuickAddCode(e.target.value)}
                        placeholder="例如：219482 (未填自動產生)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        門市地址 (選填)
                      </label>
                      <input
                        type="text"
                        value={quickAddAddr}
                        onChange={(e) => setQuickAddAddr(e.target.value)}
                        placeholder={`例如：${selectedCity !== 'all' ? selectedCity : '嘉義縣'}${selectedDistrict !== 'all' ? selectedDistrict : '民雄鄉'}文化路一段88號`}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
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
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>儲存並立即選定此門市</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Smart Paste Text Parser Tool */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ClipboardPaste className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    官方電子地圖文字智慧解析 (支援 7-11 / 全家 / 簡訊格式)
                  </span>
                  {parsedPreview && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> 成功辨識門市資訊
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteInputText}
                    onChange={(e) => handleSmartPasteParse(e.target.value)}
                    placeholder="請直接貼上門市文字 (如: 7-11 民雄東榮門市 192849 嘉義縣民雄鄉東榮路12號)"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
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
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>帶入選用</span>
                    </button>
                  )}
                </div>
              </div>

              {storeResults.stores.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">查無符合條件的超商門市</div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      找不到您的門市？請使用上方「＋ 登記新加盟/未列出門市」按鈕，可立即建立並選取！
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>登記此門市</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {storeResults.stores.map((store) => (
                    <div
                      key={`${store.brand}-${store.storeCode}-${store.storeName}`}
                      onClick={() => handleSelectStoreItem(store)}
                      className={`p-3.5 bg-white dark:bg-slate-950/70 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border rounded-2xl transition-all cursor-pointer group flex flex-col justify-between shadow-xs ${
                        store.isNewlyOpened
                          ? 'border-emerald-400 dark:border-emerald-500/50 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/70'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {store.storeName}
                            </span>
                            {store.isNewlyOpened && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
                                ✨ 新加盟/自訂
                              </span>
                            )}
                            {store.isFlagship && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30">
                                旗艦店
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => copyStoreCode(store.storeCode, e)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                              title="複製店號"
                            >
                              <span>店號: {store.storeCode}</span>
                              {copiedCode === store.storeCode ? (
                                <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <span className="leading-tight text-slate-600 dark:text-slate-300 text-[11px] break-all">
                            {store.address}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">
                          {store.city}・{store.district}
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          選取此門市
                          <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-indigo-400" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Entry & External Maps */}
        {activeTab === 'manual' && (
          <div className="p-4 sm:p-5 space-y-6 pb-12">
            {/* Direct External Map Links */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  各超商官方電子地圖查詢 (新分頁開啟)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">查詢完畢後請將店名與店號複製貼在下方</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <a
                  href="https://emap.presco.com.tw/c2cemap.ashx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl text-center text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs">7-11 電子地圖 ↗</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">emap.presco.com.tw</span>
                </a>

                <a
                  href="https://www.family.com.tw/marketing/inquiry.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-800 hover:border-sky-500 rounded-xl text-center text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-sky-600 dark:text-sky-400 text-xs">全家店舖查詢 ↗</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">family.com.tw</span>
                </a>

                <a
                  href="https://www.hilife.com.tw/storeInquiry_street.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-800 hover:border-rose-500 rounded-xl text-center text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-rose-600 dark:text-rose-400 text-xs">萊爾富門市查詢 ↗</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">hilife.com.tw</span>
                </a>

                <a
                  href="https://www.okmart.com.tw/convenient_shopSearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-xl text-center text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 font-bold transition-all flex flex-col items-center gap-1 shadow-xs"
                >
                  <span className="text-amber-600 dark:text-amber-400 text-xs">OK超商門市查詢 ↗</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">okmart.com.tw</span>
                </a>
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleApplyManualStore} className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-200">
                  手動填寫指定超商門市資訊
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  適用於昨日甫新開幕門市、偏遠山區門市，或直接由超商地圖複製之門市
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    門市名稱 <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="例如：神狗勾門市 或 科技旗艦店"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
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
                    placeholder="例如：991823"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-indigo-500"
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
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {manualError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {manualError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>確認並使用此自訂門市</span>
                </button>
              </div>
            </form>
          </div>
        )}

        </div>

        {/* Modal Footer Summary (Sticky at bottom) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 shrink-0 z-10">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">已載入全台灣 22 縣市・368 鄉鎮門市資料庫</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white font-bold cursor-pointer transition-colors text-xs"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

