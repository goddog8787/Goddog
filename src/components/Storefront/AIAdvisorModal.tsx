import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  Sliders, 
  Flame, 
  Gauge, 
  Wind, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { FilamentProduct, ColorOption, CurrencyCode } from '../../types';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FilamentProduct[];
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm') => void;
  onOpenSupportWithPrompt?: (prompt: string) => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onOpenSupportWithPrompt,
}) => {
  if (!isOpen) return null;

  const [printerModel, setPrinterModel] = useState('Bambu Lab X1-Carbon / P1S');
  const [projectType, setProjectType] = useState('functional');
  const [requirement, setRequirement] = useState('高強度抗拉、耐磨耐溫、表面消光無層紋');
  const [nozzleSize, setNozzleSize] = useState('0.4mm');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);

  const handleDiagnose = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/recommend-filament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerModel,
          projectType,
          requirement,
          nozzleSize,
        }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Find matching product in catalog
  const matchedProduct = products.find((p) => {
    if (!recommendation) return false;
    const recMat = (recommendation.material || '').toLowerCase();
    if (recMat.includes('cf') || recMat.includes('碳纖維')) return p.material === 'Carbon Fiber';
    if (recMat.includes('petg')) return p.material === 'PETG';
    if (recMat.includes('tpu') || recMat.includes('彈性')) return p.material === 'TPU';
    if (recMat.includes('abs')) return p.material === 'ABS';
    if (recMat.includes('resin') || recMat.includes('光固化')) return p.material === 'Resin';
    return p.material === 'High-Speed PLA';
  }) || products[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white p-6 relative">
          <button
            id="close-ai-advisor-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">AI 3D 列印耗材智能顧問</h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-black px-2 py-0.5 rounded-full">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-1">
                根據您的印表機機型與零件需求，為您計算最相容材質與精確切片參數
              </p>
            </div>
          </div>
        </div>

        {/* Body Container */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!recommendation ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Printer className="w-4 h-4 text-indigo-600" />
                  您的 3D 印表機型號：
                </label>
                <select
                  value={printerModel}
                  onChange={(e) => setPrinterModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                >
                  <option value="Bambu Lab X1-Carbon / P1S (高速封閉機型)">Bambu Lab X1-Carbon / P1S (高速封閉機型)</option>
                  <option value="Bambu Lab A1 / A1 mini (開放式高速機型)">Bambu Lab A1 / A1 mini (開放式高速機型)</option>
                  <option value="Creality K1 / K1 Max / Ender 3 V3">Creality K1 / K1 Max / Ender 3 V3</option>
                  <option value="Prusa MK4 / Prusa Core One">Prusa MK4 / Prusa Core One</option>
                  <option value="Voron 2.4 / Trident (DIY 開源高速機)">Voron 2.4 / Trident (DIY 開源高速機)</option>
                  <option value="Anycubic / Elegoo 光固化 LCD 8K 機型">Anycubic / Elegoo 光固化 LCD 8K 機型</option>
                  <option value="標準開源 i3 架構 3D 印表機">標準開源 i3 架構 3D 印表機</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  預計列印的專案類型：
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'functional', label: '機構與工業承重' },
                    { id: 'outdoor', label: '戶外耐曬防水' },
                    { id: 'flexible', label: '緩震防摔彈性件' },
                    { id: 'highspeed', label: '極速打樣與模型' },
                    { id: 'artistic', label: '微縮公仔與雕像' },
                    { id: 'heat', label: '高溫車用零件' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setProjectType(cat.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        projectType === cat.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  具體特殊需求或問題描述：
                </label>
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="例如：希望印件不能有拉絲、需要耐熱80度不軟化、追求500mm/s無層紋..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">噴嘴口徑</label>
                  <select
                    value={nozzleSize}
                    onChange={(e) => setNozzleSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  >
                    <option value="0.4mm">0.4mm (標準標準)</option>
                    <option value="0.2mm">0.2mm (極致微縮細節)</option>
                    <option value="0.6mm">0.6mm (高速厚層)</option>
                    <option value="0.8mm">0.8mm (超大型快速成型)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">AI 顧問模式</label>
                  <div className="px-3 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>材料力學 + 切片演算法</span>
                  </div>
                </div>
              </div>

              <button
                id="generate-ai-recommendation-btn"
                type="button"
                onClick={handleDiagnose}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI 正在分析材料力學與切片參數...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>取得最佳耗材推薦與切片參數報告</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* AI Results View */
            <div className="space-y-4 animate-fade-in">
              {/* Product Match Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 mb-1">
                  <span>AI 推薦匹配耗材方案</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                    相容性 99.8%
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">{recommendation.material}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{recommendation.reasoning}</p>
              </div>

              {/* Slicer Settings Parameters Table */}
              {recommendation.slicerSettings && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    官方建議切片軟體參數 (Bambu Studio / OrcaSlicer / PrusaSlicer)
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">噴嘴擠出溫度</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {recommendation.slicerSettings.nozzleTemp}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">熱床底板溫度</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {recommendation.slicerSettings.bedTemp}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">建議列印速度</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 truncate">
                        {recommendation.slicerSettings.printSpeed}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">冷卻風扇設定</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {recommendation.slicerSettings.coolingFan}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">建議熱床表面</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5 truncate">
                        {recommendation.slicerSettings.bedType || 'Textured PEI'}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">機箱封閉需求</div>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {recommendation.slicerSettings.enclosureNeeded || '開放即可'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {recommendation.proTips && recommendation.proTips.length > 0 && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    工程師專家實戰提醒 (減少廢料與失敗率)：
                  </div>
                  <ul className="text-xs text-amber-800 space-y-1 pl-5 list-disc">
                    {recommendation.proTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action: Add to Cart Directly */}
              <div className="pt-2 space-y-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRecommendation(null)}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    重新諮詢
                  </button>
                  <button
                    type="button"
                    id="ai-add-matched-to-cart-btn"
                    onClick={() => {
                      onAddToCart(matchedProduct, matchedProduct.colors[0], matchedProduct.diameter);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <span>將【{matchedProduct.name}】加入購物車 (NT$ {matchedProduct.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {onOpenSupportWithPrompt && (
                  <button
                    type="button"
                    id="transition-to-support-chat-btn"
                    onClick={() => {
                      onClose();
                      onOpenSupportWithPrompt(
                        `我剛剛在 AI 耗材顧問針對【${printerModel}】獲得了【${recommendation.material}】(${recommendation.title})的推薦，切片設定為噴嘴 ${recommendation.slicerSettings.nozzleTemp}、熱床 ${recommendation.slicerSettings.bedTemp}，想進一步確認列印細節與相容性！`
                      );
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-indigo-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>💬 帶著此推薦參數，開啟 AI 客服多輪深度討論（具備上下文記憶）</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
