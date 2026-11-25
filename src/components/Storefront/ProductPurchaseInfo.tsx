import { Heart, Link2, PackageCheck, Truck } from 'lucide-react';
import { useClipboardFeedback } from '../../hooks/useClipboardFeedback';
import type { CurrencyCode, FilamentProduct, LanguageCode } from '../../types';
import { checkoutShippingFee } from '../../utils/checkoutDetails';
import { formatPrice } from '../../utils/i18n';

const labels = {
  'zh-TW': {
    title: '配送與退換貨', pickup: '超商取貨', home: '宅配', free: '免運',
    estimate: '以此商品選購數量估算本島運費，實際金額以結帳為準。',
    unavailableEstimate: '選擇有庫存的規格即可查看運費估算。', returns: '退換貨政策',
    save: '收藏商品', saved: '已收藏', share: '複製商品連結', copied: '已複製連結',
  },
  en: {
    title: 'Shipping & returns', pickup: 'Store pickup', home: 'Home delivery', free: 'Free',
    estimate: 'Main-island estimate for this item and quantity. Final rates appear at checkout.',
    unavailableEstimate: 'Select an in-stock option to estimate shipping.', returns: 'Return policy',
    save: 'Save item', saved: 'Saved', share: 'Copy product link', copied: 'Link copied',
  },
  ja: {
    title: '配送・返品', pickup: 'コンビニ受取', home: '宅配', free: '送料無料',
    estimate: '台湾本島向けの、この商品・数量での目安です。最終送料は決済時に確認できます。',
    unavailableEstimate: '在庫のある種類を選ぶと送料の目安が表示されます。', returns: '返品ポリシー',
    save: 'お気に入りに追加', saved: '登録済み', share: '商品リンクをコピー', copied: 'リンクをコピーしました',
  },
};

interface Props {
  product: FilamentProduct;
  quantity: number;
  lang: LanguageCode;
  currency: CurrencyCode;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export function ProductPurchaseInfo({ product, quantity, lang, currency, isWishlisted, onToggleWishlist }: Props) {
  const t = labels[lang];
  const { copy, copiedKey, failedKey, errorText } = useClipboardFeedback(lang);
  const itemSubtotal = product.price * quantity;
  const amounts = (['UNIMARTC2C', 'HOME'] as const).map(method =>
    checkoutShippingFee(method, itemSubtotal, product.customShippingFee === 0)
  );

  return (
    <section aria-labelledby="product-delivery-heading" className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
      <h3 id="product-delivery-heading" className="flex items-center gap-2 text-sm font-bold">
        <Truck className="size-4 text-indigo-600" aria-hidden="true" />
        {t.title}
      </h3>
      {quantity > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {[t.pickup, t.home].map((label, index) => (
            <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-2.5">
              <dt className="text-slate-600">{label}</dt>
              <dd className="mt-1 font-bold tabular-nums">{amounts[index] ? formatPrice(amounts[index], currency) : t.free}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{quantity > 0 ? t.estimate : t.unavailableEstimate}</p>
      {(product.leadTime || product.packagingNote) && (
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {[product.leadTime, product.packagingNote].filter(Boolean).join(' · ')}
        </p>
      )}
      <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:underline">
        <PackageCheck className="size-4" aria-hidden="true" /> {t.returns}
      </a>
      <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onToggleWishlist} aria-label={t.save} aria-pressed={isWishlisted}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 aria-pressed:border-rose-200 aria-pressed:text-rose-700">
          <Heart className={isWishlisted ? 'size-4 fill-current' : 'size-4'} aria-hidden="true" />
          {isWishlisted ? t.saved : t.save}
        </button>
        <button type="button" onClick={() => {
          const url = new URL('/', window.location.origin);
          url.searchParams.set('product', product.id);
          void copy(url.href, 'product-link');
        }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50">
          <Link2 className="size-4" aria-hidden="true" /> {t.share}
        </button>
      </div>
      <p role="status" className={failedKey === 'product-link' ? 'mt-2 text-xs text-rose-700' : copiedKey === 'product-link' ? 'mt-2 text-xs text-emerald-700' : 'sr-only'}>
        {copiedKey === 'product-link' ? t.copied : failedKey === 'product-link' ? errorText : ''}
      </p>
    </section>
  );
}
