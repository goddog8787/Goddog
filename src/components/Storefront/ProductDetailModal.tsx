import { useClipboardFeedback } from '../../hooks/useClipboardFeedback';
import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { 
  X, 
  ShoppingCart, 
  Star, 
  Check, 
  ArrowRight,
  Bot,
  Calculator,
  Copy,
  CheckCheck,
  MessageSquarePlus
} from 'lucide-react';
import { FilamentProduct, CartItem, ColorOption, CurrencyCode, LanguageCode, ProductReview, MemberProfile } from '../../types';
import { formatPrice, translations, translateProduct, translateColorName } from '../../utils/i18n';
import { subscribeToProductReviews } from '../../lib/reviewPersistence';
import { saveCustomerRecentlyViewed } from '../../lib/customerPersistence';
import { auth } from '../../lib/firebase';
import { cartStockRemaining } from '../../utils/cartStock';
import { ProductPurchaseInfo } from './ProductPurchaseInfo';
import { ProductPhoto } from './ProductPhoto';
import { triggerFlyToCart } from './FlyToCartOverlay';

const WriteReviewModal = React.lazy(() =>
  import('./WriteReviewModal').then((m) => ({ default: m.WriteReviewModal }))
);

interface ProductDetailModalProps {
  product: FilamentProduct | null;
  currency: CurrencyCode;
  lang: LanguageCode;
  member?: MemberProfile;
  relatedProducts: FilamentProduct[];
  cartItems: CartItem[];
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onSelectRelated: (product: FilamentProduct) => void;
  onClose: () => void;
  onAddToCart: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => boolean | void;
  onQuickCheckout: (product: FilamentProduct, color: ColorOption, diameter: '1.75mm' | '2.85mm', quantity: number) => void;
  onAskAI?: (product: FilamentProduct) => void;
  onReviewSubmitted?: (updatedProduct: FilamentProduct, review: ProductReview) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  lang,
  member,
  relatedProducts,
  cartItems,
  isWishlisted,
  onToggleWishlist,
  onSelectRelated,
  onClose,
  onAddToCart,
  onQuickCheckout,
  onAskAI,
  onReviewSubmitted,
}) => {
  const t = translations[lang];

  // Dynamic automatic translation of product details (supports newly added products seamlessly)
  const displayProduct = useMemo(() => product ? translateProduct(product, lang) : null, [product, lang]);

  const [colorName, setColorName] = useState<string>();
  const [requestedQuantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'slicer' | 'calculator' | 'reviews'>('specs');
  const [isAdded, setIsAdded] = useState(false);
  const addedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(addedTimer.current), []);
  const [partWeightInput, setPartWeightInput] = useState('45');
  const { copy, copiedKey, failedKey, errorText } = useClipboardFeedback(lang);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [liveReviews, setLiveReviews] = useState<ProductReview[]>([]);
  const [localProduct, setLocalProduct] = useState<FilamentProduct | null>(displayProduct);

  useEffect(() => {
    setLocalProduct(displayProduct);
  }, [displayProduct]);

  // Subscribe to real-time reviews for this product
  useEffect(() => {
    if (!product?.id) {
      setLiveReviews([]);
      return;
    }
    const unsub = subscribeToProductReviews(product.id, (reviews) => {
      setLiveReviews(reviews);
    });
    return () => unsub();
  }, [product?.id]);

  // Close on Escape key (only when WriteReviewModal sub-modal isn't open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isWriteReviewOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isWriteReviewOpen]);

  
  useEffect(() => {
    if (product) {
      const uid = member?.id || auth.currentUser?.uid;
      saveCustomerRecentlyViewed(uid, product).catch(() => {});
    }
  }, [product, member?.id]);

  if (!product || !displayProduct) return null;

  const translate = (zh: string, en: string, ja: string) => lang === 'en' ? en : lang === 'ja' ? ja : zh;
  const isAccessory = product.material === 'Accessories';
  const isFilamentMaterial = !isAccessory && product.material !== 'Resin';
  const selectedDiameter = product.diameter || '1.75mm';
  const mass = /^(\d+(?:\.\d+)?)\s*(kg|g)$/i.exec(displayProduct.weight?.trim() ?? '');
  const spoolNetGrams = mass ? Number(mass[1]) * (mass[2].toLowerCase() === 'kg' ? 1000 : 1) : 0;
  const partWeightGrams = Number(partWeightInput);
  const hasPartEstimate = Number.isFinite(partWeightGrams) && partWeightGrams > 0;
  const slicingSpecs = [
    [t.nozzleTemp, displayProduct.nozzleTemp || displayProduct.printTemp],
    [t.bedTemp, displayProduct.bedTemp],
    [t.speedMax, displayProduct.maxSpeed],
  ].filter(([, value]) => value?.trim() && !/^(?:[-—–]+|n\/a|不適用)$/i.test(value.trim()));
  const overviewSpecs = [
    [translate('材質', 'Material', '材質'), !isAccessory ? displayProduct.material : null],
    [translate('線徑', 'Diameter', '直径'), isFilamentMaterial ? selectedDiameter : null],
    [isAccessory ? translate('商品規格', 'Item specification', '製品仕様') : translate('淨重', 'Net weight', '正味重量'), displayProduct.weight],
    [translate('線盤形式', 'Spool type', 'スプール形式'), isFilamentMaterial ? displayProduct.spoolType : null],
  ].filter(([, value]) => value?.trim());

  const handleCopyParams = () => {
    const lines = [...overviewSpecs, ...slicingSpecs].map(([label, value]) => `${label}: ${value}`);
    void copy([displayProduct.name, ...lines].join('\n'), 'params');
  };

  const colors = (product.colors ?? []).map(color => ({
    color,
    remaining: cartStockRemaining(cartItems, product, color),
  }));
  const selection = colors.find(({ color }) => color.name === colorName)
    ?? colors.find(({ remaining }) => remaining > 0)
    ?? colors[0];
  const selectedColor = selection?.color;
  const colorStock = selection?.remaining ?? 0;
  const isOutOfStock = colorStock <= 0;
  const quantity = Math.min(colorStock, requestedQuantity);
  const quantityInCart = cartItems.reduce((count, item) => count + (item.product.id === product.id ? item.quantity : 0), 0);
  const stockMessage = quantityInCart > 0
    ? translate('此規格目前可加購 0 件，購物車已計入庫存。', 'No additional units of this option can be added with your current cart.', '現在のカート内容では、この仕様を追加できません。')
    : translate('此規格目前缺貨，請查看其他顏色或同類商品。', 'This option is out of stock. Check other colors or related products.', 'この仕様は在庫切れです。ほかの色や関連商品をご確認ください。');
  const effectiveReviewsCount = liveReviews.length > 0 ? liveReviews.length : (displayProduct.reviewsCount || 0);
  const effectiveRating = liveReviews.length > 0
    ? Number((liveReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / liveReviews.length).toFixed(1))
    : displayProduct.rating;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOutOfStock || !selectedColor) return;
    if (onAddToCart(product, selectedColor, selectedDiameter, quantity) === false) return;
    triggerFlyToCart({
      sourceEl: e.currentTarget,
      imageUrl: displayProduct.imageUrl || product.imageUrl,
      material: product.material,
      productName: displayProduct.name,
      accentColor: selectedColor?.hex,
    });
    setColorName(selectedColor.name);
    setIsAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock || !selectedColor) return;
    onQuickCheckout(product, selectedColor, selectedDiameter, quantity);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/65 flex items-center justify-center p-0 sm:p-5 store-panel-backdrop cursor-pointer select-none"
      onClick={onClose}
      title={lang === 'en' ? 'Click background to close' : lang === 'ja' ? '背景クリックで閉じる' : '點擊背景空白處可返回主頁面'}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl rounded-none sm:max-w-4xl overflow-y-auto shadow-2xl border-0 sm:border border-slate-200 flex flex-col relative cursor-default select-text store-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-modal-btn"
          type="button"
          aria-label={lang === 'en' ? 'Close product details' : lang === 'ja' ? '商品詳細を閉じる' : '關閉商品詳情'}
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-[auto_1fr]">
          {/* Left Column: Image & Spool preview */}
          <div className="bg-slate-50 p-4 sm:p-6 min-w-0 border-b border-slate-200 md:col-start-1 md:row-start-1 md:border-b-0 md:border-r">
            <div className="relative aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner flex items-center justify-center p-4">
              <ProductPhoto url={displayProduct.imageUrl} name={displayProduct.name} material={displayProduct.material} lang={lang}
                priority showFallbackNote className="h-full w-full overflow-hidden rounded-xl" imageClassName="object-contain" />
              
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {displayProduct.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {displayProduct.badge}
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* Right Column: Configurations & Actions */}
          <div className="p-4 sm:p-6 min-w-0 md:col-start-2 md:row-start-1 md:row-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-indigo-600 font-bold mb-1 pr-10">
                <span className="[overflow-wrap:anywhere]">{(displayProduct.brand || '').replace(/\s*pro/gi, '') || '神狗勾'}</span>
                <span className="text-slate-500 font-mono [overflow-wrap:anywhere]">{displayProduct.sku && `SKU: ${displayProduct.sku}`}</span>
              </div>

              <h2 id="product-detail-title" className="text-xl sm:text-2xl font-black text-slate-900 leading-tight pr-10 text-balance">
                {(displayProduct.name || '').replace(/莫蘭迪\s*/g, '')}
              </h2>

              {/* Rating & reviews */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                {effectiveReviewsCount > 0 ? (
                  <>
                    <div className="flex items-center text-amber-500 font-bold whitespace-nowrap">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="ml-1 text-slate-900 dark:text-slate-100 font-mono">{effectiveRating}</span>
                    </div>
                    <span className="whitespace-nowrap">({effectiveReviewsCount} {lang === 'en' ? 'Reviews' : lang === 'ja' ? '件の評価' : '則顧客評價'})</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {t.noReviewsYet}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    {formatPrice(displayProduct.price, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {lang === 'en' ? `+${Math.floor(displayProduct.price / 10)} pts` : lang === 'ja' ? `+${Math.floor(displayProduct.price / 10)} pt還元` : `贈 ${Math.floor(displayProduct.price / 10)} 點積分`}
                  </span>
                </div>
              </div>

              {/* Color Picker */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {lang === 'en' ? 'Color' : lang === 'ja' ? 'カラー' : '顏色選擇'}
                  <span className="text-indigo-600 font-semibold ml-1">
                    {selectedColor ? translateColorName(selectedColor.name, lang) : '—'}
                  </span>
                  <span className="text-slate-400 font-normal ml-2">
                    ({translate(`可加購 ${colorStock} 件`, `${colorStock} available to add`, `追加可能 ${colorStock} 点`)})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(({ color: c, remaining }) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-pressed={selectedColor?.name === c.name}
                      disabled={remaining < 1}
                      onClick={() => {
                        setColorName(c.name);
                        setQuantity(Math.max(1, Math.min(quantity, remaining)));
                        setIsAdded(false);
                      }}
                      className={`flex items-center gap-2 px-3 min-h-10 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                        selectedColor?.name === c.name
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{translateColorName(c.name, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {isFilamentMaterial
                    ? (lang === 'en' ? 'Quantity (spools)' : lang === 'ja' ? '数量（巻）' : '購買數量（卷）')
                    : (lang === 'en' ? 'Quantity' : lang === 'ja' ? '数量' : '購買數量')}
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    aria-label={translate('減少數量', 'Decrease quantity', '数量を減らす')}
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-slate-900">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={translate('增加數量', 'Increase quantity', '数量を増やす')}
                    disabled={isOutOfStock || quantity >= colorStock}
                    onClick={() => setQuantity(Math.min(colorStock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <span aria-live="polite">
                  {quantityInCart > 0 && translate(`購物車已有 ${quantityInCart} 件`, `${quantityInCart} in cart`, `カートに ${quantityInCart} 点`)}
                </span>
                <span aria-live="polite">
                  {translate('商品小計', 'Item subtotal', '商品小計')} <strong className="ml-1 tabular-nums">{formatPrice(product.price * quantity, currency)}</strong>
                </span>
              </div>
              {isOutOfStock && <p className="mt-2 text-xs leading-relaxed text-amber-800">{stockMessage}</p>}
              {/* Action Buttons - Equal-width 2-column grid so Add-to-Cart animation never shifts Buy Now button */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  id="modal-add-to-cart-btn"
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`btn-tactile-primary store-action w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white cursor-pointer'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 cursor-pointer'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{t.addedToCart}</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>{translate('暫無可加購數量', 'Unavailable to add', '追加できません')}</span>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 shrink-0" />
                      <span>{t.addToCart}</span>
                    </>
                  )}
                </button>

                <button
                  id="modal-buy-now-btn"
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`btn-tactile-primary store-action w-full py-3 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 whitespace-nowrap ${
                    isOutOfStock
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-500/20 cursor-pointer'
                  }`}
                >
                  <span>{isOutOfStock ? (lang === 'en' ? 'Unavailable' : lang === 'ja' ? '入荷待ち' : '暫時缺貨') : (lang === 'zh-TW' ? '立即結帳付款' : lang === 'ja' ? '今すぐ購入' : 'Buy Now')}</span>
                  {!isOutOfStock && <ArrowRight className="w-4 h-4 shrink-0" />}
                </button>
              </div>

              {/* Quick Ask AI button */}
              {onAskAI && (
                <div className="mt-2">
                  <button
                    id="modal-ask-ai-btn"
                    type="button"
                    onClick={() => onAskAI(displayProduct)}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{lang === 'en' ? 'Ask AI for Slicer Settings' : lang === 'ja' ? 'AIにスライス設定を質問' : '詢問 AI 顧問此款切片參數'}</span>
                  </button>
                </div>
              )}

              {/* Detail Tabs - Concise 4-character single-line labels */}
              <div className="mt-5 border-t border-slate-100 pt-3">
                <div className="flex border-b border-slate-200 gap-3 mb-3 flex-wrap">
                  <button
                    type="button"
                    aria-pressed={activeTab === 'specs'}
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang === 'en' ? 'Specs' : lang === 'ja' ? '製品特徴' : '物性特點'}
                  </button>
                  {isFilamentMaterial && slicingSpecs.length > 0 && (
                    <button
                      type="button"
                      aria-pressed={activeTab === 'slicer'}
                      onClick={() => setActiveTab('slicer')}
                      className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === 'slicer'
                          ? 'border-b-2 border-indigo-600 text-indigo-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {lang === 'en' ? 'Slicer' : lang === 'ja' ? 'スライス設定' : '切片參數'}
                    </button>
                  )}
                  {isFilamentMaterial && spoolNetGrams > 0 && (
                    <button
                      type="button"
                      aria-pressed={activeTab === 'calculator'}
                      onClick={() => setActiveTab('calculator')}
                      className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                        activeTab === 'calculator'
                          ? 'border-b-2 border-indigo-600 text-indigo-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Calculator' : lang === 'ja' ? 'コスト試算' : '成本試算'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    aria-pressed={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {lang === 'en' ? `Reviews (${effectiveReviewsCount})` : lang === 'ja' ? `評価 (${effectiveReviewsCount})` : `創客評價 (${effectiveReviewsCount})`}
                  </button>
                </div>

                {activeTab === 'specs' && (
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <p className="leading-relaxed">{displayProduct.description}</p>
                    <div className="space-y-1.5 pt-1">
                      {(displayProduct.features ?? []).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'slicer' && (
                  <div className="space-y-2.5 text-xs">
                    <dl className="grid grid-cols-2 gap-2 text-xs">
                      {slicingSpecs.map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <dt className="text-slate-600">{label}</dt>
                          <dd className="mt-1 font-bold text-slate-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="leading-relaxed text-slate-600">
                      {translate('以商品列出的參數為起點，回抽、風扇和流量請按機型與試印結果調整。', 'Use these listed settings as a starting point and tune retraction, cooling and flow for your printer.', '記載の設定を目安に、引き戻し・冷却・流量は機種と試し刷りに合わせて調整してください。')}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyParams}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {failedKey === 'params' ? <span role="status">{errorText}</span> : copiedKey === 'params' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">{lang === 'en' ? 'Profile Copied' : lang === 'ja' ? 'コピー完了' : '已複製切片配置'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Copy Slicer Settings' : lang === 'ja' ? '設定をコピー' : '一鍵複製切片參數'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'calculator' && spoolNetGrams > 0 && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <label className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-800">
                      {translate('每件用料（g）', 'Material per part (g)', '1個の使用量（g）')}
                      <input type="number" min="0.1" step="0.1" inputMode="decimal"
                        value={partWeightInput} onChange={event => setPartWeightInput(event.target.value)}
                        className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-right font-mono text-slate-900" />
                    </label>
                    <dl className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white p-3">
                        <dt className="text-slate-600">{translate('單件線材成本', 'Material cost per part', '1個あたりの材料費')}</dt>
                        <dd className="mt-1 text-sm font-bold text-indigo-700">{hasPartEstimate ? formatPrice(product.price * partWeightGrams / spoolNetGrams, currency) : '—'}</dd>
                      </div>
                      <div className="rounded-xl bg-white p-3">
                        <dt className="text-slate-600">{translate('每卷可印件數', 'Parts per spool', '1巻あたりの造形数')}</dt>
                        <dd className="mt-1 text-sm font-bold text-indigo-700">{hasPartEstimate ? Math.floor(spoolNetGrams / partWeightGrams) : '—'}</dd>
                      </div>
                    </dl>
                    <p className="text-slate-600">{translate('依此商品的標示淨重估算。請輸入切片軟體估算的總用料，含支撐與換色耗材。', 'Based on the listed net weight. Enter your slicer’s total material estimate, including supports and purge.', '表示の正味重量を基に算出します。サポートやパージを含む使用量を入力してください。')}</p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    {/* Header Summary & Write Review CTA */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold font-mono text-sm">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{localProduct?.rating || 5.0}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          ({lang === 'en' ? `Total ${liveReviews.length || localProduct?.reviewsCount || 0} reviews` : lang === 'ja' ? `全 ${liveReviews.length || localProduct?.reviewsCount || 0} 件のレビュー` : `共 ${liveReviews.length || localProduct?.reviewsCount || 0} 則創客實測評價`})
                        </span>
                      </div>
                      <button
                        type="button"
                        id="detail-write-review-btn"
                        onClick={() => setIsWriteReviewOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>{lang === 'en' ? 'Write Review' : lang === 'ja' ? 'レビューを書く' : '撰寫評價'}</span>
                      </button>
                    </div>

                    {/* Review Items List */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                      {liveReviews.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-slate-500 text-xs">{lang === 'en' ? 'No reviews yet. Be the first maker to share your experience!' : lang === 'ja' ? 'まだレビューはありません。最初のレビューを投稿してみましょう！' : '目前尚無評價，歡迎成為首位留下實測心得的創客！'}</p>
                          <button
                            type="button"
                            onClick={() => setIsWriteReviewOpen(true)}
                            className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            {lang === 'en' ? 'Write the first review →' : lang === 'ja' ? '最初のレビューを投稿する →' : '立即撰寫第一則評價 →'}
                          </button>
                        </div>
                      ) : (
                        liveReviews.map((rev) => (
                          <div key={rev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                                  <span>{rev.userName}</span>
                                  {rev.printerModel && (
                                    <span className="text-[10px] text-slate-400 font-normal font-mono">
                                      [{rev.printerModel}]
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold border border-indigo-200/50">
                                    {lang === 'en' ? 'Maker' : lang === 'ja' ? 'メイカー' : '列印創客'}
                                  </span>
                                  {rev.verifiedPurchase && (
                                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-normal flex items-center gap-0.5 border border-emerald-200/50">
                                      <CheckCheck className="w-2.5 h-2.5 text-emerald-600"/> {lang === 'en' ? 'Verified Purchase' : lang === 'ja' ? '購入者確認済み' : '已驗證購買'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                              {rev.comment}
                            </p>
                            {rev.createdAt && (
                              <div className="text-[9px] text-slate-400 text-right">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4 sm:p-6 md:col-start-1 md:row-start-2 md:border-r md:border-t-0 md:pt-0">
            <dl className="grid grid-cols-2 gap-2 text-xs" aria-label={translate('商品規格一覽', 'Product at a glance', '製品仕様の概要')}>
              {overviewSpecs.map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                  <dt className="text-slate-600">{label}</dt>
                  <dd className="mt-1 font-semibold text-slate-900 [overflow-wrap:anywhere]">{value}</dd>
                </div>
              ))}
            </dl>
            <ProductPurchaseInfo product={product} quantity={isOutOfStock ? 0 : quantity}
              currency={currency} lang={lang} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} />
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <section aria-labelledby="product-related-heading" className="border-t border-slate-200 bg-slate-50 p-4 sm:p-6">
            <h3 id="product-related-heading" className="mb-3 text-sm font-bold text-slate-900">
              {translate('同類商品', 'Related products', '関連商品')}
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {relatedProducts.map(item => (
                <a key={item.id} href={`/?product=${encodeURIComponent(item.id)}`} onClick={event => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onSelectRelated(item);
                }} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-left hover:border-indigo-300">
                  <ProductPhoto url={item.imageUrl} name={item.name} material={item.material} alt="" className="size-12 shrink-0 overflow-hidden rounded-lg" imageClassName="object-contain" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-xs font-semibold text-slate-900">{translateProduct(item, lang).name}</span>
                    <span className="mt-1 block text-xs font-bold text-indigo-700">{formatPrice(item.price, currency)}</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {isWriteReviewOpen && localProduct && (
        <Suspense fallback={null}>
          <WriteReviewModal
            isOpen={isWriteReviewOpen}
            onClose={() => setIsWriteReviewOpen(false)}
            product={localProduct}
            lang={lang}
            onReviewSubmitted={(updated, review) => {
              setLocalProduct(updated);
              if (onReviewSubmitted) {
                onReviewSubmitted(updated, review);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
