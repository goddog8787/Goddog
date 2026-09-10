import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Camera,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Download,
  Eye,
  SlidersHorizontal,
  Wand2,
  Maximize2,
  Trash2,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FilamentProduct } from '../../types';

interface ProductImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: FilamentProduct | null;
  initialImage?: string;
  onApplyImage: (newImageUrl: string) => void;
}

type AspectRatioOption = '1:1' | '4:3' | '16:9' | 'free';

interface FilterAdjustments {
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  saturation: number; // -50 to 50
  warmth: number; // -50 to 50
  sharpen: number; // 0 to 10
}

const DEFAULT_FILTERS: FilterAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  sharpen: 0,
};

const PRESET_FILTERS: { id: string; name: string; icon: string; adjustments: FilterAdjustments }[] = [
  {
    id: 'original',
    name: '原圖無修飾',
    icon: '📷',
    adjustments: { brightness: 0, contrast: 0, saturation: 0, warmth: 0, sharpen: 0 }
  },
  {
    id: 'studio_clean',
    name: '極簡純白棚拍',
    icon: '🏛️',
    adjustments: { brightness: 12, contrast: 18, saturation: 8, warmth: -2, sharpen: 3 }
  },
  {
    id: 'gloss_vibrant',
    name: '3D 耗材絲滑光澤',
    icon: '✨',
    adjustments: { brightness: 6, contrast: 22, saturation: 28, warmth: 4, sharpen: 5 }
  },
  {
    id: 'carbon_matte',
    name: '碳纖深邃霧面',
    icon: '🏎️',
    adjustments: { brightness: -4, contrast: 26, saturation: -10, warmth: -8, sharpen: 6 }
  },
  {
    id: 'maker_warm',
    name: '創客木質工作台',
    icon: '🛠️',
    adjustments: { brightness: 8, contrast: 14, saturation: 16, warmth: 18, sharpen: 2 }
  },
  {
    id: 'cyber_glow',
    name: '賽博科技冷光',
    icon: '🌌',
    adjustments: { brightness: 5, contrast: 25, saturation: 20, warmth: -22, sharpen: 4 }
  }
];

const WATERMARK_OPTIONS = [
  { id: 'none', label: '不加水印' },
  { id: 'brand', label: '神狗勾 3D 原廠正品' },
  { id: 'ams', label: 'Bambu AMS 相容' },
  { id: 'speed', label: '600mm/s 超高速認證' },
  { id: 'stock', label: '現貨直發 • 24H 出貨' },
  { id: 'vacuum', label: '雙層鋁箔真空防潮' },
];

const QUICK_AI_PROMPTS = [
  '極簡無瑕白色攝影棚拍，帶有柔和自然陰影與地面微倒影，突顯線盤細緻排線質感',
  '放置在現代化 3D 列印機透明工作艙旁，展現高流速平滑出料與高品質成品',
  '拓竹 Bambu AMS 4 色進料系統搭配展示情境，彰顯極致多色切片相容性',
  '碳纖維消光高剛性材質特寫，展示如岩石般的消光霧面與金屬反光質感',
  '極光絲綢雙色漸變反射，旋轉角度展現金屬流光溢彩的光學質感',
  '溫潤實木創客工作桌情境，周圍放置卡尺、六角扳手與專業列印樣品',
];

export const ProductImageStudioModal: React.FC<ProductImageStudioModalProps> = ({
  isOpen,
  onClose,
  product,
  initialImage,
  onApplyImage,
}) => {
  // Tabs: 'editor' | 'ai'
  const [activeTab, setActiveTab] = useState<'editor' | 'ai'>('editor');

  // Default fallback image
  const defaultFallbackImage = initialImage || product?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

  // Images state
  const [currentImage, setCurrentImage] = useState<string>(defaultFallbackImage);
  const [originalLoadedImage, setOriginalLoadedImage] = useState<string>(defaultFallbackImage);
  const [editedPreviewUrl, setEditedPreviewUrl] = useState<string>(defaultFallbackImage);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);

  // Editor states
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('1:1');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterAdjustments>(DEFAULT_FILTERS);
  const [activePreset, setActivePreset] = useState<string>('original');
  const [selectedWatermark, setSelectedWatermark] = useState<string>('none');
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');

  // AI Prompt & Generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'studio' | 'render' | 'maker' | 'cyber'>('studio');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [aiQuotaNotice, setAiQuotaNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Hidden File Inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      const src = initialImage || product?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
      setCurrentImage(src);
      setOriginalLoadedImage(src);
      setEditedPreviewUrl(src);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setFilters(DEFAULT_FILTERS);
      setActivePreset('original');
      setSelectedWatermark('none');
      setAiGeneratedImage(null);
      setAiAnalysisResult(null);
      setAiStatusMessage('');

      if (product) {
        setAiPrompt(`請為【${product.name}】(${product.material}) 製作純白商業電商棚拍主圖，光線均勻柔和，突顯 1.75mm 高速整齊排線與耗材金屬光澤`);
      }
    }
  }, [isOpen, initialImage, product]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Compress & Load File from Mobile / Desktop
  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('請上傳有效的圖片檔案 (JPG、PNG、WEBP 或 HEIC)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Create an image element to downscale huge smartphone photos (> 20MB / 48MP)
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200;
        let w = img.width;
        let h = img.height;

        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }

        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = offCanvas.toDataURL('image/jpeg', 0.88);
          setCurrentImage(compressedDataUrl);
          setOriginalLoadedImage(compressedDataUrl);
          setRotation(0);
          setFlipH(false);
          setFlipV(false);
          setFilters(DEFAULT_FILTERS);
          setActivePreset('original');
          showToast('📸 照片已成功載入！手機畫質已最佳化為電商標準規格。', 'success');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Rerender with Filters, Rotation, Flip, Watermark, and Crop
  const renderCanvas = useCallback(() => {
    if (!currentImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Determine dimensions based on aspect ratio
      let sourceWidth = img.naturalWidth;
      let sourceHeight = img.naturalHeight;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      let cropX = 0;
      let cropY = 0;

      if (aspectRatio === '1:1') {
        const minSide = Math.min(sourceWidth, sourceHeight);
        cropWidth = minSide;
        cropHeight = minSide;
        cropX = (sourceWidth - minSide) / 2;
        cropY = (sourceHeight - minSide) / 2;
      } else if (aspectRatio === '4:3') {
        if (sourceWidth / sourceHeight > 4 / 3) {
          cropHeight = sourceHeight;
          cropWidth = sourceHeight * (4 / 3);
          cropX = (sourceWidth - cropWidth) / 2;
        } else {
          cropWidth = sourceWidth;
          cropHeight = sourceWidth * (3 / 4);
          cropY = (sourceHeight - cropHeight) / 2;
        }
      } else if (aspectRatio === '16:9') {
        if (sourceWidth / sourceHeight > 16 / 9) {
          cropHeight = sourceHeight;
          cropWidth = sourceHeight * (16 / 9);
          cropX = (sourceWidth - cropWidth) / 2;
        } else {
          cropWidth = sourceWidth;
          cropHeight = sourceWidth * (9 / 16);
          cropY = (sourceHeight - cropHeight) / 2;
        }
      }

      // Output size
      const targetSize = 900;
      let outW = targetSize;
      let outH = targetSize;

      if (aspectRatio === '4:3') {
        outW = 960;
        outH = 720;
      } else if (aspectRatio === '16:9') {
        outW = 960;
        outH = 540;
      } else if (aspectRatio === 'free') {
        const ratio = sourceWidth / sourceHeight;
        if (ratio >= 1) {
          outW = 900;
          outH = Math.round(900 / ratio);
        } else {
          outH = 900;
          outW = Math.round(900 * ratio);
        }
      }

      // Rotate dimensions if rotated 90 or 270 deg
      const isRotatedQuarter = rotation % 180 !== 0;
      canvas.width = isRotatedQuarter ? outH : outW;
      canvas.height = isRotatedQuarter ? outW : outH;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Translate for rotation and flips
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Build CSS filter string
      const brightnessVal = 100 + filters.brightness;
      const contrastVal = 100 + filters.contrast;
      const saturateVal = 100 + filters.saturation;
      const warmthSepia = filters.warmth > 0 ? filters.warmth : 0;
      const warmthHue = filters.warmth < 0 ? filters.warmth * 0.5 : 0;

      ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturateVal}%) sepia(${warmthSepia}%) hue-rotate(${warmthHue}deg)`;

      // Draw cropped image centered
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        -outW / 2,
        -outH / 2,
        outW,
        outH
      );

      ctx.restore();

      // Draw Watermark / Badge if enabled
      if (selectedWatermark !== 'none') {
        const watermarkOption = WATERMARK_OPTIONS.find((w) => w.id === selectedWatermark);
        if (watermarkOption) {
          ctx.save();
          const padding = 24;
          const badgeText = watermarkOption.label;
          ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const textMetrics = ctx.measureText(badgeText);
          const badgeWidth = textMetrics.width + 40;
          const badgeHeight = 44;

          let bx = padding;
          let by = padding;

          if (watermarkPosition === 'top-right') {
            bx = canvas.width - badgeWidth - padding;
            by = padding;
          } else if (watermarkPosition === 'bottom-left') {
            bx = padding;
            by = canvas.height - badgeHeight - padding;
          } else if (watermarkPosition === 'bottom-right') {
            bx = canvas.width - badgeWidth - padding;
            by = canvas.height - badgeHeight - padding;
          }

          // Background pill
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, badgeWidth, badgeHeight, 22);
          ctx.fill();
          ctx.stroke();

          // Brand color dot
          ctx.fillStyle = '#6366f1'; // Indigo
          ctx.beginPath();
          ctx.arc(bx + 20, by + badgeHeight / 2, 6, 0, Math.PI * 2);
          ctx.fill();

          // Text
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, bx + 34, by + badgeHeight / 2);
          ctx.restore();
        }
      }

      // Update Preview URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setEditedPreviewUrl(dataUrl);
    };
    img.src = currentImage;
  }, [currentImage, aspectRatio, rotation, flipH, flipV, filters, selectedWatermark, watermarkPosition]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Apply Preset Filter
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_FILTERS.find((p) => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setFilters(preset.adjustments);
    }
  };

  // AI Generation Call
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      showToast('請輸入想要生成的圖片風格或描述需求！', 'error');
      return;
    }

    setIsGeneratingAI(true);
    setAiStatusMessage('Gemini 影像智慧運算中：分析目前耗材色彩與棚拍質感...');

    try {
      const response = await fetch('/api/ai/enhance-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImage,
          prompt: aiPrompt,
          productName: product?.name || '神狗勾 3D 高速列印耗材',
          material: product?.material || 'High-Speed PLA',
          style: aiStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI 生成失敗，請檢查網路或稍後重試');
      }

      if (data.quotaNotice) {
        setAiQuotaNotice(data.quotaNotice);
      } else {
        setAiQuotaNotice(null);
      }

      if (data.imageUrl) {
        // AI image generation or studio render succeeded
        setAiGeneratedImage(data.imageUrl);
        setAiAnalysisResult(data.aiAnalysis || null);
        if (data.filterAdjustments) {
          setFilters(data.filterAdjustments);
          if (data.filterAdjustments.preset) {
            setActivePreset(data.filterAdjustments.preset);
          }
        }
        if (data.hasQuotaNotice) {
          showToast('✨ AI 智能棚拍與材質色調演算完成！', 'success');
        } else {
          showToast('🎉 Gemini 影像生成成功！已為您打造商業電商專屬商品照。', 'success');
        }
      } else if (data.recommendedStudioRender || data.filterAdjustments) {
        // Multi-modal auto-enhancement fallback
        const resultRender = data.recommendedStudioRender || currentImage;
        setAiGeneratedImage(resultRender);
        setAiAnalysisResult(data.aiAnalysis || null);

        if (data.filterAdjustments) {
          setFilters(data.filterAdjustments);
          if (data.filterAdjustments.preset) {
            setActivePreset(data.filterAdjustments.preset);
          }
        }
        showToast('✨ AI 多模態色調校正與棚拍優化完成！已套用專業攝影參數。', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'AI 處理發生錯誤，請重試', 'error');
    } finally {
      setIsGeneratingAI(false);
      setAiStatusMessage('');
    }
  };

  // Adopt AI Image into editor
  const handleAdoptAIImage = () => {
    if (!aiGeneratedImage) return;
    setCurrentImage(aiGeneratedImage);
    setOriginalLoadedImage(aiGeneratedImage);
    setActiveTab('editor');
    showToast('已載入 AI 生成之圖片至工作台，可進一步微調與儲存！', 'success');
  };

  // Final Save & Apply
  const handleConfirmSave = () => {
    const finalUrl = editedPreviewUrl || currentImage;
    onApplyImage(finalUrl);
    showToast('✅ 商品圖片更新成功！', 'success');
    onClose();
  };

  // Download local copy
  const handleDownload = () => {
    if (!editedPreviewUrl) return;
    const a = document.createElement('a');
    a.href = editedPreviewUrl;
    a.download = `${product?.name || 'product'}-studio-edited.jpg`;
    a.click();
    showToast('已下載高畫質圖片至您的裝置！', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  商品圖片編輯與 AI 攝影棚
                </h3>
                {product && (
                  <span className="hidden sm:inline-block font-mono text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-200/60">
                    {product.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                支援手機檔案照片讀取、裁切旋轉、棚拍調色、浮水印，及給圖生圖 AI 智能美化
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

        {/* Tab Selector & Action Buttons */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>1. 照片編輯與調光 (手機/相機)</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>2. 接入 AI 生成更好圖片</span>
            </button>
          </div>

          {/* Upload Quick Access Buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="從手機相簿、檔案或電腦選擇照片"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>從手機檔案選圖</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors sm:flex hidden"
              title="使用手機相機直接拍照"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>相機拍照</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Interactive Image Canvas & Live Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-full aspect-square max-w-[480px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-300 shadow-xl flex items-center justify-center p-2 group select-none">
              {/* Actual Offscreen Canvas */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Rendered View Image */}
              {(() => {
                const targetSrc = isComparingOriginal ? originalLoadedImage : (editedPreviewUrl || currentImage || defaultFallbackImage);
                const safeSrc = (typeof targetSrc === 'string' && targetSrc.trim() !== '') ? targetSrc.trim() : null;
                if (!safeSrc) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <span className="text-xs font-semibold">請選擇或上傳商品照片</span>
                    </div>
                  );
                }
                return (
                  <img
                    src={safeSrc}
                    alt="商品編輯預覽"
                    className="w-full h-full object-contain rounded-2xl transition-all duration-150"
                  />
                );
              })()}

              {/* Comparing Original Overlay Indicator */}
              {isComparingOriginal && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                  原圖對比中
                </div>
              )}

              {/* Quick Toolbar on Hover */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-white text-xs shadow-lg">
                <button
                  onMouseDown={() => setIsComparingOriginal(true)}
                  onMouseUp={() => setIsComparingOriginal(false)}
                  onTouchStart={() => setIsComparingOriginal(true)}
                  onTouchEnd={() => setIsComparingOriginal(false)}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 flex items-center gap-1 font-bold cursor-pointer"
                  title="按住即可即時對比原始照片"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>按住看原圖</span>
                </button>
                <span className="text-slate-500">|</span>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 flex items-center gap-1 font-bold cursor-pointer"
                  title="下載編輯後的成果圖"
                >
                  <Download className="w-3.5 h-3.5 text-sky-300" />
                  <span>下載</span>
                </button>
              </div>
            </div>

            {/* Mobile / Drag File Drop Target Notice */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className="w-full max-w-[480px] p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-700 text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
            >
              <Upload className="w-4 h-4" />
              <span>點擊或將手機/電腦圖片拖放至此處直接替換</span>
            </div>
          </div>

          {/* RIGHT: Tool Panels (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {activeTab === 'editor' && (
              <div className="space-y-4 text-xs">
                {/* 1. Aspect Ratio (Crop) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">📐 裁切顯示比例</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: '1:1', label: '1:1 正方 (電商)' },
                      { id: '4:3', label: '4:3 標準' },
                      { id: '16:9', label: '16:9 寬螢幕' },
                      { id: 'free', label: '原圖比例' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAspectRatio(opt.id as AspectRatioOption)}
                        className={`py-1.5 px-1 rounded-xl font-bold transition-all text-center cursor-pointer ${
                          aspectRatio === opt.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rotate & Flip */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">🔄 旋轉與鏡像翻轉</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-2 bg-white border border-slate-200 rounded-xl flex flex-col items-center gap-1 hover:bg-indigo-50 hover:text-indigo-600 font-bold cursor-pointer"
                      title="順時針旋轉 90 度"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span className="text-[10px]">順轉 90°</span>
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="p-2 bg-white border border-slate-200 rounded-xl flex flex-col items-center gap-1 hover:bg-indigo-50 hover:text-indigo-600 font-bold cursor-pointer"
                      title="逆時針旋轉 90 度"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-[10px]">逆轉 90°</span>
                    </button>
                    <button
                      onClick={() => setFlipH((f) => !f)}
                      className={`p-2 border rounded-xl flex flex-col items-center gap-1 font-bold cursor-pointer ${
                        flipH ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                      title="水平鏡像翻轉"
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      <span className="text-[10px]">左右翻轉</span>
                    </button>
                    <button
                      onClick={() => setFlipV((f) => !f)}
                      className={`p-2 border rounded-xl flex flex-col items-center gap-1 font-bold cursor-pointer ${
                        flipV ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-100'
                      }`}
                      title="垂直翻轉"
                    >
                      <FlipVertical className="w-4 h-4" />
                      <span className="text-[10px]">上下翻轉</span>
                    </button>
                  </div>
                </div>

                {/* 3. One-Click Studio Presets */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">✨ 一鍵專業電商濾鏡</span>
                    <button
                      onClick={() => {
                        setActivePreset('original');
                        setFilters(DEFAULT_FILTERS);
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      重置調光
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PRESET_FILTERS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          activePreset === preset.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-sm">{preset.icon}</div>
                        <div className="font-bold text-[11px] mt-0.5 truncate">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Fine-Tune Sliders */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-800 block">🎛️ 畫面光線微調</span>
                  
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>亮度 (Brightness)</span>
                      <span className="font-mono font-bold text-slate-900">{filters.brightness > 0 ? `+${filters.brightness}` : filters.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={filters.brightness}
                      onChange={(e) => setFilters({ ...filters, brightness: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>對比度 (Contrast)</span>
                      <span className="font-mono font-bold text-slate-900">{filters.contrast > 0 ? `+${filters.contrast}` : filters.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={filters.contrast}
                      onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>飽和色彩 (Vibrance)</span>
                      <span className="font-mono font-bold text-slate-900">{filters.saturation > 0 ? `+${filters.saturation}` : filters.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="50"
                      value={filters.saturation}
                      onChange={(e) => setFilters({ ...filters, saturation: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Warmth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                      <span>色溫冷暖 (Warmth)</span>
                      <span className="font-mono font-bold text-slate-900">{filters.warmth > 0 ? `+${filters.warmth} 暖` : filters.warmth < 0 ? `${filters.warmth} 冷` : '中性'}</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={filters.warmth}
                      onChange={(e) => setFilters({ ...filters, warmth: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* 5. Watermark Badge */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">🏷️ 品牌品質印花 / 角標</span>
                    <select
                      value={watermarkPosition}
                      onChange={(e) => setWatermarkPosition(e.target.value as any)}
                      className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600"
                    >
                      <option value="bottom-right">右下角</option>
                      <option value="bottom-left">左下角</option>
                      <option value="top-right">右上角</option>
                      <option value="top-left">左上角</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {WATERMARK_OPTIONS.map((wm) => (
                      <button
                        key={wm.id}
                        onClick={() => setSelectedWatermark(wm.id)}
                        className={`p-2 rounded-xl text-left border transition-all text-[11px] font-semibold cursor-pointer ${
                          selectedWatermark === wm.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {wm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI GENERATION & ENHANCEMENT */}
            {activeTab === 'ai' && (
              <div className="space-y-4 text-xs">
                {/* AI Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 text-white space-y-1.5 shadow-md">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Gemini 3.1 AI 商品圖重繪與增強引擎</span>
                  </div>
                  <p className="text-indigo-100 text-[11px] leading-relaxed">
                    給予參考圖片與文字需求，AI 將自動消除雜亂背景、重構棚拍柔光、突顯 3D 耗材金屬排線質感與商業立體感。
                  </p>
                </div>

                {/* Style Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">選擇希望的生成風格</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'studio', label: '🏛️ 純白電商棚拍', desc: '純白無瑕背景與柔和漫反射陰影' },
                      { id: 'render', label: '✨ 3D 高精超寫實', desc: '極致反光材質與排線微雕層次' },
                      { id: 'maker', label: '🛠️ 創客工作室實景', desc: '實木工作台與專業印表機氛圍' },
                      { id: 'cyber', label: '🌌 賽博極光科技感', desc: '深色冷光、霓虹光影與金屬感' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAiStyle(st.id as any)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          aiStyle === st.id
                            ? 'bg-indigo-50/70 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-xs">{st.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Prompt */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    輸入修圖與生成提示詞 (Prompt)
                  </label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="請描述您希望如何改良或生成更好的圖片..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white resize-none"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 text-[11px] block">快速套用精選提示詞：</span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {QUICK_AI_PROMPTS.map((qp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(qp)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[10px] transition-colors cursor-pointer text-left line-clamp-1 max-w-full"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{aiStatusMessage || 'AI 智慧繪製運算中...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>開始 AI 智能生成 / 美化商品圖</span>
                    </>
                  )}
                </button>

                {/* AI Quota Notice */}
                {aiQuotaNotice && (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-amber-900 text-[11px] flex items-start gap-2.5 shadow-xs animate-fade-in">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{aiQuotaNotice}</span>
                  </div>
                )}

                {/* AI Result Card */}
                {aiGeneratedImage && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        AI 圖片已生成就緒！
                      </span>
                      <button
                        onClick={handleAdoptAIImage}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>載入微調</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {aiAnalysisResult && (
                      <div className="text-[11px] text-emerald-800 space-y-1 bg-white/70 p-2.5 rounded-xl border border-emerald-200/60">
                        {aiAnalysisResult.assessment && (
                          <p className="font-medium">💡 診斷：{aiAnalysisResult.assessment}</p>
                        )}
                        {aiAnalysisResult.studioImprovements && (
                          <ul className="list-disc pl-4 space-y-0.5 text-emerald-700 text-[10px]">
                            {aiAnalysisResult.studioImprovements.map((imp: string, i: number) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions: Save or Cancel */}
            <div className="pt-3 border-t border-slate-200 mt-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>套用為商品封面圖片</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Toast within modal */}
        {toast && (
          <div className="absolute bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
