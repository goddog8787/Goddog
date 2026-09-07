import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Package, 
  Truck, 
  DollarSign, 
  Sliders, 
  Info, 
  Check, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { FilamentProduct, ColorOption, MaterialType, CurrencyCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FilamentProduct | null;
  onSave: (updated: FilamentProduct) => void;
  currency: CurrencyCode;
}

const PRESET_IMAGES = [
  { label: '碳纖維/黑色線盤 (AMS 相容)', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' },
  { label: '多色 PLA 環保線盤', url: 'https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&w=800&q=80' },
  { label: '高光 PETG 耐熱耗材', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80' },
  { label: '高流速 High-Speed 列印', url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80' },
  { label: '光固化 8K 高精樹脂', url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80' },
];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'specs' | 'logistics' | 'features'>('basic');

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('神狗勾');
  const [material, setMaterial] = useState<MaterialType>('High-Speed PLA');
  const [diameter, setDiameter] = useState<'1.75mm' | '2.85mm'>('1.75mm');
  const [weight, setWeight] = useState('1.0kg');
  const [spoolType, setSpoolType] = useState('Cardboard 環保紙盤');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Pricing & Stock
  const [price, setPrice] = useState(690);
  const [originalPrice, setOriginalPrice] = useState(850);
  const [stock, setStock] = useState(50);
  const [colors, setColors] = useState<ColorOption[]>([]);

  // 3D Slicer Specs
  const [nozzleTemp, setNozzleTemp] = useState('200°C - 230°C');
  const [bedTemp, setBedTemp] = useState('45°C - 60°C');
  const [maxSpeed, setMaxSpeed] = useState('600 mm/s');

  // Logistics & Shipping
  const [shipping711, setShipping711] = useState(true);
  const [shippingFamilyMart, setShippingFamilyMart] = useState(true);
  const [shippingBlackCat, setShippingBlackCat] = useState(true);
  const [leadTime, setLeadTime] = useState('24H 快速出貨 (現貨直發)');
  const [packagingNote, setPackagingNote] = useState('真空鋁箔袋 + 變色乾燥劑 + 防撞外盒');
  const [customShippingFee, setCustomShippingFee] = useState(0);

  // Description & Features
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // New color row helper
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorStock, setNewColorStock] = useState(10);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '神狗勾');
      setMaterial(product.material || 'High-Speed PLA');
      setDiameter(product.diameter || '1.75mm');
      setWeight(product.weight || '1.0kg');
      setSpoolType(product.spoolType || 'Cardboard 環保紙盤');
      setBadge(product.badge || '');
      setImageUrl(product.imageUrl || '');

      setPrice(product.price || 0);
      setOriginalPrice(product.originalPrice || 0);
      setStock(product.stock || 0);
      setColors(product.colors ? [...product.colors] : []);

      setNozzleTemp(product.nozzleTemp || '200°C - 230°C');
      setBedTemp(product.bedTemp || '45°C - 60°C');
      setMaxSpeed(product.maxSpeed || '600 mm/s');

      setShipping711(product.shippingMethods ? product.shippingMethods.includes('7-11') : true);
      setShippingFamilyMart(product.shippingMethods ? product.shippingMethods.includes('familymart') : true);
      setShippingBlackCat(product.shippingMethods ? product.shippingMethods.includes('blackcat') : true);
      setLeadTime(product.leadTime || '24H 快速出貨 (現貨直發)');
      setPackagingNote(product.packagingNote || '真空鋁箔袋 + 變色乾燥劑 + 防撞外盒');
      setCustomShippingFee(product.customShippingFee || 0);

      setDescription(product.description || '');
      setFeatures(product.features ? [...product.features] : []);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Color actions
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const updated = [
      ...colors,
      { name: newColorName.trim(), hex: newColorHex, stock: Number(newColorStock) || 0 }
    ];
    setColors(updated);
    // Recalculate total stock
    const total = updated.reduce((sum, c) => sum + c.stock, 0);
    setStock(total);
    setNewColorName('');
    setNewColorStock(10);
  };

  const handleRemoveColor = (idx: number) => {
    const updated = colors.filter((_, i) => i !== idx);
    setColors(updated);
    const total = updated.reduce((sum, c) => sum + c.stock, 0);
    setStock(total);
  };

  const handleUpdateColorStock = (idx: number, newQty: number) => {
    const updated = [...colors];
    updated[idx].stock = Math.max(0, newQty);
    setColors(updated);
    const total = updated.reduce((sum, c) => sum + c.stock, 0);
    setStock(total);
  };

  // Feature actions
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Quick preset specs
  const handleApplyPreset = (type: 'highspeed' | 'tough' | 'tpu') => {
    if (type === 'highspeed') {
      setNozzleTemp('210°C - 235°C');
      setBedTemp('50°C - 60°C');
      setMaxSpeed('600 mm/s');
      setSpoolType('Cardboard 環保紙盤 (Bambu AMS 相容)');
    } else if (type === 'tough') {
      setNozzleTemp('230°C - 250°C');
      setBedTemp('70°C - 85°C');
      setMaxSpeed('350 mm/s');
      setSpoolType('High-Temp Reusable 耐高溫線盤');
    } else if (type === 'tpu') {
      setNozzleTemp('210°C - 230°C');
      setBedTemp('30°C - 50°C');
      setMaxSpeed('100 mm/s (彈性體低速)');
      setSpoolType('Cardboard 環保紙盤');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const shippingMethods: ('7-11' | 'familymart' | 'blackcat')[] = [];
    if (shipping711) shippingMethods.push('7-11');
    if (shippingFamilyMart) shippingMethods.push('familymart');
    if (shippingBlackCat) shippingMethods.push('blackcat');

    const updatedProduct: FilamentProduct = {
      ...product,
      name: name.trim(),
      brand: brand.trim() || '神狗勾',
      material,
      diameter,
      weight,
      spoolType,
      badge: badge.trim() || undefined,
      imageUrl: imageUrl.trim() || product.imageUrl,
      price: Number(price),
      originalPrice: Number(originalPrice),
      stock: Number(stock),
      colors: colors.length > 0 ? colors : product.colors,
      nozzleTemp,
      bedTemp,
      maxSpeed,
      shippingMethods,
      leadTime,
      packagingNote,
      customShippingFee: Number(customShippingFee),
      description: description.trim(),
      features: features.length > 0 ? features : product.features,
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  編輯商品與規格設定
                </h3>
                <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                  SKU: {product.sku}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                可自由修改耗材品名、價格、庫存量、多色規格、3D 列印參數與超商/宅配物流選項
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-slate-200 bg-white gap-1 overflow-x-auto">
          {[
            { id: 'basic', label: '1. 基本資訊與圖片', icon: Info },
            { id: 'pricing', label: '2. 價格、庫存與多色', icon: DollarSign },
            { id: 'specs', label: '3. 3D 列印切片參數', icon: Sliders },
            { id: 'logistics', label: '4. 物流配送與出貨', icon: Truck },
            { id: 'features', label: '5. 詳細介紹與特色', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  耗材商品名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：Hyper PLA 600mm/s 超高速 3D 列印耗材"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">材質分類</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer focus:bg-white"
                  >
                    <option value="High-Speed PLA">High-Speed PLA (高速)</option>
                    <option value="PLA">標準 PLA</option>
                    <option value="PETG">PETG (韌性防潮)</option>
                    <option value="ABS">ABS (耐熱工程)</option>
                    <option value="TPU">TPU (高彈性體)</option>
                    <option value="Carbon Fiber">Carbon Fiber (碳纖維複材)</option>
                    <option value="Resin">8K 光固化樹脂</option>
                    <option value="Accessories">3D 列印配件工具</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">品牌 / 製造商</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">促銷標籤 (Badge)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="例如：AMS 拓竹首選 / 熱銷 85 折"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">線徑規格</label>
                  <select
                    value={diameter}
                    onChange={(e) => setDiameter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="1.75mm">1.75mm (主流機種通用)</option>
                    <option value="2.85mm">2.85mm (工業級專用)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">線材淨重</label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="1.0kg">1.0 kg (標準卷)</option>
                    <option value="0.5kg">0.5 kg (樣品體驗卷)</option>
                    <option value="2.5kg">2.5 kg (量產大盤)</option>
                    <option value="5.0kg">5.0 kg (工業連續供料)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">線盤形式</label>
                  <select
                    value={spoolType}
                    onChange={(e) => setSpoolType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="Cardboard 環保紙盤">Cardboard 環保紙盤</option>
                    <option value="High-Temp Reusable 耐高溫線盤">High-Temp Reusable 耐高溫線盤</option>
                    <option value="Refill 裸裝補充包">Refill 裸裝補充包</option>
                  </select>
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    商品封面圖片 URL
                  </label>
                  <span className="text-[11px] text-slate-400">支援 HTTPS 圖片直連</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <div className="w-12 h-12 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {imageUrl ? (
                      <img src={imageUrl} alt="預覽" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                    快速套用推薦圖片庫：
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING, STOCK & COLORS */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">
                    直購售價 (NT$) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-black text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    折合：{formatPrice(price, currency)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-700 block mb-1">官方劃線原價 (NT$)</label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-500"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                    現省：NT$ {Math.max(0, originalPrice - price)} (
                    {originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0}%)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-700 block mb-1">
                    總現貨庫存 (卷) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-black text-indigo-700"
                  />
                  <span className={`text-[10px] font-bold mt-1 block ${stock < 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {stock < 20 ? '⚠️ 低庫存警戒' : '充足備貨'}
                  </span>
                </div>
              </div>

              {/* Multi-Color Management */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">顏色規格與各色庫存分配</h4>
                    <p className="text-[11px] text-slate-500">
                      顧客在前台可挑選各項顏色規格，各色庫存獨立扣減
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                    目前共有 {colors.length} 種顏色
                  </span>
                </div>

                {/* Colors List */}
                <div className="space-y-2">
                  {colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({c.hex})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[11px]">個別庫存：</span>
                        <input
                          type="number"
                          min="0"
                          value={c.stock}
                          onChange={(e) => handleUpdateColorStock(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold text-slate-900"
                        />
                        <span className="text-slate-500">卷</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="移除此顏色"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Color Row */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="新增顏色名稱 (例如：薄荷綠 Mint Green)"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">色碼：</span>
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-white"
                      title="挑選色碼"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-[11px]">庫存：</span>
                    <input
                      type="number"
                      min="0"
                      value={newColorStock}
                      onChange={(e) => setNewColorStock(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>加入新顏色</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D PRINTING & SLICER SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-900 block">專業切片參數快速範本</span>
                  <span className="text-[11px] text-indigo-700">一鍵套用熱門列印情境推薦數值</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('highspeed')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    🚀 600mm/s 高速範本
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('tough')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    🛡️ PETG 耐高溫範本
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('tpu')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    🎈 彈性 TPU 範本
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">建議噴嘴溫度 (Nozzle)</label>
                  <input
                    type="text"
                    value={nozzleTemp}
                    onChange={(e) => setNozzleTemp(e.target.value)}
                    placeholder="200°C - 230°C"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    例如：200°C - 230°C (PLA) / 240°C (PETG)
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">建議熱床溫度 (Bed)</label>
                  <input
                    type="text"
                    value={bedTemp}
                    onChange={(e) => setBedTemp(e.target.value)}
                    placeholder="45°C - 60°C"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    例如：45°C - 60°C (PLA) / 75°C - 85°C (ABS)
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">最高列印速度 (Max Speed)</label>
                  <input
                    type="text"
                    value={maxSpeed}
                    onChange={(e) => setMaxSpeed(e.target.value)}
                    placeholder="600 mm/s"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    支援拓竹 Bambu Lab X1C / P1S / A1 與 Creality K1
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGISTICS & SHIPPING */}
          {activeTab === 'logistics' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  支援物流取件渠道 (此商品)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={shipping711}
                      onChange={(e) => setShipping711(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-900">7-ELEVEN 超商取貨</div>
                      <div className="text-[10px] text-slate-500">支援取貨付款/純取件</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={shippingFamilyMart}
                      onChange={(e) => setShippingFamilyMart(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-900">全家 FamilyMart 取件</div>
                      <div className="text-[10px] text-slate-500">支援店到店快速到貨</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={shippingBlackCat}
                      onChange={(e) => setShippingBlackCat(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-900">黑貓宅急便速配</div>
                      <div className="text-[10px] text-slate-500">專車宅配到府</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">出貨前置時效</label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    placeholder="24H 快速出貨 (現貨直發)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    顯示於商品頁面與購物車出貨承諾
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="font-bold text-slate-800 block mb-1">包裝防潮規格備註</label>
                  <input
                    type="text"
                    value={packagingNote}
                    onChange={(e) => setPackagingNote(e.target.value)}
                    placeholder="真空鋁箔袋 + 變色乾燥劑 + 防撞外盒"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    保障未拆封吸濕退換貨權益
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 block">特定商品自訂加收運費 (NT$)</label>
                    <p className="text-[10px] text-slate-500">
                      若設定為 0，則完全套用全館滿額 NT$999 免運政策
                    </p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={customShippingFee}
                    onChange={(e) => setCustomShippingFee(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-center font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FEATURES & DESCRIPTION */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">商品完整詳細介紹</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細介紹耗材優勢、層間黏合力、材料成分與適用機型..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium leading-relaxed outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">核心賣點清單 (Features)</label>
                <div className="space-y-1.5">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="新增賣點（例如：相容 Bambu AMS 自動供料系統，不卡盤）"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>加入</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-white sticky bottom-0">
            <span className="text-[11px] text-slate-400">
              儲存後將即時同步至耗材商城前台與購物車
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>儲存商品變更</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
