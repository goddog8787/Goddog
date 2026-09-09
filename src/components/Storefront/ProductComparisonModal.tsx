import React from 'react';
import {
  X,
  Scale,
  ShoppingCart,
  Check,
  Zap,
  Gauge,
  Flame,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { FilamentProduct, CurrencyCode, LanguageCode } from '../../types';
import { formatPrice } from '../../utils/i18n';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  comparisonIds: string[];
  onRemoveComparisonId: (id: string) => void;
  onClearAll: () => void;
  onAddToCart: (product: FilamentProduct) => void;
  currency: CurrencyCode;
  lang: LanguageCode;
}

// Tech spec mapping for comparing materials
const SPEC_MAPPING: Record<string, { tensile: string; hdt: string; impact: string; ams: string; enclosure: string; odor: string }> = {
  'High-Speed PLA': { tensile: '52 MPa (高剛性)', hdt: '55°C', impact: '16 kJ/m²', ams: '完全相容 (首選)', enclosure: '不需要 (開放通風佳)', odor: '幾乎無氣味 (天然玉米澱粉)' },
  'PLA': { tensile: '50 MPa (高剛性)', hdt: '55°C', impact: '15 kJ/m²', ams: '完全相容', enclosure: '不需要', odor: '極低無味' },
  'PETG': { tensile: '46 MPa (韌性高)', hdt: '75°C (抗溫水)', impact: '22 kJ/m² (耐摔)', ams: '完全相容', enclosure: '不需要 (通風環境佳)', odor: '微弱無毒' },
  'ABS': { tensile: '42 MPa (抗磨耗)', hdt: '98°C (耐高溫)', impact: '28 kJ/m² (耐衝擊)', ams: '完全相容', enclosure: '必須密閉恒溫箱', odor: '有輕微塑膠味 (需活性碳濾網)' },
  'TPU': { tensile: '35 MPa (彈性體)', hdt: '50°C', impact: '無破裂 (超彈性 95A)', ams: '不建議 (易卡管)', enclosure: '不需要', odor: '無氣味' },
  'Carbon Fiber': { tensile: '78 MPa (極致高剛性)', hdt: '88°C', impact: '18 kJ/m²', ams: '完全相容 (需耐磨嘴)', enclosure: '建議保溫', odor: '極微弱' },
};

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  comparisonIds,
  onRemoveComparisonId,
  onClearAll,
  onAddToCart,
  currency,
  lang,
}) => {
  if (!isOpen) return null;

  const comparedProducts = products.filter((p) => comparisonIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  耗材規格與機械物性橫向對比
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-mono">
                  {comparedProducts.length} 款耗材
                </span>
              </div>
              <p className="text-xs text-slate-400">
                深入比較抗拉強度、熱變形溫度 (HDT)、AMS 相容性與切片極速
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              清空對比
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {comparedProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Scale className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <div className="text-base font-bold text-slate-700">目前尚未選取對比項目</div>
            <p className="text-xs max-w-sm mx-auto text-slate-400">
              在商品卡片上點擊「加入對比」按鈕，最多可選取 4 款線材進行完整物性、切片溫度與價格分析。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              {/* Product Header Row */}
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 bg-slate-50 w-44 font-bold text-slate-400 uppercase tracking-wider text-[11px] rounded-l-2xl">
                    耗材名稱與外觀
                  </th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} className="p-3 w-64 align-top relative group">
                      <button
                        onClick={() => onRemoveComparisonId(p.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="移除此項對比"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-2 p-1.5 flex items-center justify-center">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                      </div>

                      <div className="text-center">
                        <div className="font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</div>
                        <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">{p.brand} • {p.weight}</div>
                        <div className="text-base font-black text-slate-900 font-mono mt-1">
                          {formatPrice(p.price, currency)}
                        </div>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="mt-2 w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>加入購物車</span>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Specs Rows */}
              <tbody className="divide-y divide-slate-100">
                {/* Material Category */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">材料分類</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 text-slate-800 font-bold font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {p.material}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Tensile Strength */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">
                    <div>抗拉強度</div>
                    <div className="text-[10px] text-slate-400 font-normal">Tensile Strength (MPa)</div>
                  </td>
                  {comparedProducts.map((p) => {
                    const info = SPEC_MAPPING[p.material] || SPEC_MAPPING['PLA'];
                    return (
                      <td key={p.id} className="p-3 text-slate-800 font-medium">
                        {info.tensile}
                      </td>
                    );
                  })}
                </tr>

                {/* HDT */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">
                    <div>熱變形溫度 (HDT)</div>
                    <div className="text-[10px] text-slate-400 font-normal">耐溫抗軟化極限</div>
                  </td>
                  {comparedProducts.map((p) => {
                    const info = SPEC_MAPPING[p.material] || SPEC_MAPPING['PLA'];
                    return (
                      <td key={p.id} className="p-3 font-mono font-bold text-amber-700">
                        {info.hdt}
                      </td>
                    );
                  })}
                </tr>

                {/* Impact Resistance */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">
                    <div>耐衝擊強度 (Izod)</div>
                    <div className="text-[10px] text-slate-400 font-normal">抗摔落破裂能力</div>
                  </td>
                  {comparedProducts.map((p) => {
                    const info = SPEC_MAPPING[p.material] || SPEC_MAPPING['PLA'];
                    return (
                      <td key={p.id} className="p-3 text-slate-800 font-medium">
                        {info.impact}
                      </td>
                    );
                  })}
                </tr>

                {/* Max Speed */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">
                    <div>最大推薦列印速度</div>
                    <div className="text-[10px] text-slate-400 font-normal">切片極限 (mm/s)</div>
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 font-mono font-bold text-cyan-600">
                      {p.maxSpeed}
                    </td>
                  ))}
                </tr>

                {/* Nozzle Temp */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">推薦噴嘴溫度</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 font-mono text-slate-800">
                      {p.nozzleTemp}
                    </td>
                  ))}
                </tr>

                {/* Bed Temp */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">推薦熱床溫度</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 font-mono text-slate-800">
                      {p.bedTemp}
                    </td>
                  ))}
                </tr>

                {/* Bambu AMS compatibility */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">拓竹 AMS 多色相容性</td>
                  {comparedProducts.map((p) => {
                    const info = SPEC_MAPPING[p.material] || SPEC_MAPPING['PLA'];
                    const isOk = !info.ams.includes('不建議');
                    return (
                      <td key={p.id} className="p-3 font-medium">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isOk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isOk ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          {info.ams}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Enclosure & Smell */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 bg-slate-50">箱體與氣味要求</td>
                  {comparedProducts.map((p) => {
                    const info = SPEC_MAPPING[p.material] || SPEC_MAPPING['PLA'];
                    return (
                      <td key={p.id} className="p-3 text-slate-600 space-y-1">
                        <div>▪ 封箱：{info.enclosure}</div>
                        <div className="text-[11px] text-slate-400">▪ 氣味：{info.odor}</div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
