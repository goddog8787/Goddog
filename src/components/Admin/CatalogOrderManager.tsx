import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, GripVertical, ListOrdered } from 'lucide-react';
import type { FilamentProduct } from '../../types';
import { CatalogOrderConflict, saveCatalogOrder } from '../../lib/catalogOrderPersistence';
import { MAX_CATALOG_ORDER_IDS, moveCatalogProduct, normalizeCatalogOrder, orderCatalog, type CatalogOrder } from '../../utils/catalogOrder';
import { isProductInStock } from '../../utils/cartStock';
import { normalizeProductSearch } from '../../utils/productSearch';

interface Props {
  products: FilamentProduct[];
  order: CatalogOrder | null;
  connectionFailed: boolean;
  onSaved: (order: CatalogOrder) => void;
}

const smallButton = 'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 px-2 text-slate-700 hover:bg-slate-100 disabled:opacity-35';

const draftKey = 'goddog_catalog_order_draft';

function readDraft(): CatalogOrder | null {
  try {
    const saved = sessionStorage.getItem(draftKey);
    if (!saved) return null;
    const value = JSON.parse(saved);
    return Array.isArray(value?.productIds) && Number.isSafeInteger(value?.revision)
      ? normalizeCatalogOrder(value)
      : null;
  } catch {
    return null;
  }
}

export function CatalogOrderManager({ products, order, connectionFailed, onSaved }: Props) {
  const [draft, setDraft] = useState<CatalogOrder | null>(readDraft);
  const [undoStack, setUndoStack] = useState<(CatalogOrder | null)[]>([]);
  const [stockOnly, setStockOnly] = useState(false);
  useEffect(() => {
    try {
      if (draft) sessionStorage.setItem(draftKey, JSON.stringify(draft));
      else sessionStorage.removeItem(draftKey);
    } catch {
      // The draft still works in memory when browser storage is unavailable.
    }
  }, [draft]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [position, setPosition] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const dragging = useRef<string | null>(null);
  const ordered = useMemo(() => orderCatalog(products, draft?.productIds ?? order?.productIds ?? []), [products, draft, order]);
  const positions = useMemo(() => new Map(ordered.map((product, index) => [product.id, index])), [ordered]);
  const query = normalizeProductSearch(search);
  const rows = ordered.filter(product => (!stockOnly || isProductInStock(product)) && (!query || normalizeProductSearch(
    [product.name, product.brand, product.material, product.sku, product.id].join(' '),
  ).includes(query)));
  const stale = draft !== null && order !== null && draft.revision !== order.revision;
  const tooLarge = ordered.length > MAX_CATALOG_ORDER_IDS;
  const canEdit = order !== null && !connectionFailed && !saving && !stale && !tooLarge;

  function editDraft(next: CatalogOrder) {
    setUndoStack(stack => [...stack.slice(-19), draft]);
    setDraft(next);
    setFailed(false);
    setMessage('');
  }

  function undoDraft() {
    if (!undoStack.length) return;
    setDraft(undoStack[undoStack.length - 1]);
    setUndoStack(undoStack.slice(0, -1));
    setPosition('');
    setMessage('已復原上一步。');
    setFailed(false);
  }

  function move(id: string, index: number) {
    if (!order || !canEdit || positions.get(id) === index || !positions.has(id)) return;
    editDraft({ revision: draft?.revision ?? order.revision, productIds: moveCatalogProduct(ordered.map(product => product.id), id, index) });
    setSelectedId(id);
    setPosition(String(index + 1));
  }

  async function publish() {
    if (!draft || !canEdit) return;
    setSaving(true);
    setMessage('');
    setFailed(false);
    try {
      const result = await saveCatalogOrder(draft.productIds.length ? ordered.map(product => product.id) : [], draft.revision);
      onSaved(result);
      setDraft(null);
      setUndoStack([]);
      setMessage('商城排序已儲存，訪客的推薦商品列表會更新。');
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof CatalogOrderConflict
        ? '雲端已有新版本。請按載入已發布順序，再重新調整。'
        : '儲存失敗，草稿已保留。請確認網路與管理員登入狀態後重試。');
    } finally {
      setSaving(false);
    }
  }

  const selectedIndex = positions.get(selectedId);
  const targetPosition = Number(position);

  return (
    <section aria-labelledby="catalog-order-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="catalog-order-title" className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ListOrdered className="size-5 text-indigo-600" aria-hidden="true" /> 商城商品排序
          </h3>
          <p className="mt-1 text-sm text-slate-600">調整顧客在「推薦排序」首先看見的商品。輸入關鍵字搜尋或拖曳清單，也可用按鈕移動。</p>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {draft ? '未儲存草稿' : order?.productIds.length ? '已自訂順序' : '預設順序'}
        </p>
      </header>
      <p className="text-xs text-slate-600">清單顯示全商城的位置。顧客搜尋關鍵字或選擇價格、熱銷和評價排序時，會優先使用所選條件。</p>
      {(connectionFailed || stale || tooLarge) && (
        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          {connectionFailed ? '目前無法讀取雲端排序。請重新載入頁面再試。' : stale
            ? '另一個視窗已發布新順序，請先載入已發布順序。'
            : '目前商品數量超過可儲存的排序上限。'}
        </p>
      )}
      {order === null && !connectionFailed && <p role="status" className="text-sm text-slate-600">正在載入雲端排序…</p>}
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 basis-52 text-xs font-semibold text-slate-700">
          搜尋商品
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="商品名稱、品牌或 SKU"
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
        </label>
        <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
          event.preventDefault();
          if (selectedIndex !== undefined && Number.isInteger(targetPosition) && targetPosition >= 1 && targetPosition <= ordered.length) {
            move(selectedId, targetPosition - 1);
          }
        }}>
          <label className="text-xs font-semibold text-slate-700">
            移到第幾個
            <input type="number" min="1" max={ordered.length} step="1" value={position}
              disabled={!canEdit || selectedIndex === undefined}
              onChange={event => setPosition(event.target.value)}
              className="mt-1 block min-h-11 w-24 rounded-xl border border-slate-200 px-3 text-sm" />
          </label>
          <button type="submit" className={smallButton} disabled={!canEdit || selectedIndex === undefined || !Number.isInteger(targetPosition) || targetPosition < 1 || targetPosition > ordered.length}>移動</button>
        </form>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <label className="inline-flex min-h-9 items-center gap-2">
          <input type="checkbox" checked={stockOnly} onChange={event => setStockOnly(event.target.checked)} className="size-4 accent-indigo-600" />
          只顯示有庫存
        </label>
        <span role="status">顯示 {rows.length} / {ordered.length} 件</span>
      </div>
      <p className="text-xs text-slate-600">{selectedIndex === undefined ? '點選清單中的商品可指定位置。' : `已選：${ordered[selectedIndex].name}（第 ${selectedIndex + 1} 個）`}</p>
      <div className="max-h-[28rem] overflow-y-auto overscroll-contain rounded-xl border border-slate-200">
        <ol aria-label="排序預覽" className="divide-y divide-slate-100">
          {rows.map(product => {
            const index = positions.get(product.id)!;
            return (
              <li key={product.id} draggable={canEdit}
                onDragStart={event => {
                  dragging.current = product.id;
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', product.id);
                }}
                onDragEnd={() => { dragging.current = null; }}
                onDragOver={event => { if (canEdit && dragging.current) event.preventDefault(); }}
                onDrop={event => {
                  if (!dragging.current) return;
                  event.preventDefault();
                  move(dragging.current, index);
                  dragging.current = null;
                }}
                className={`flex flex-wrap items-center gap-2 p-2.5 sm:flex-nowrap ${selectedId === product.id ? 'bg-indigo-50' : 'bg-white'}`}>
                <button type="button" aria-pressed={selectedId === product.id}
                  onClick={() => { setSelectedId(product.id); setPosition(String(index + 1)); }}
                  className="flex min-h-10 min-w-0 basis-full items-center gap-2 rounded-lg text-left sm:flex-1">
                  <GripVertical className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="min-w-7 text-xs font-semibold tabular-nums text-slate-500">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 [overflow-wrap:anywhere]">{product.name}</span>
                    <span className="block text-xs text-slate-600">{[product.sku, product.material, isProductInStock(product) ? '有庫存' : '缺貨'].filter(Boolean).join(' · ')}</span>
                  </span>
                </button>
                <div className="flex gap-1 pl-6 sm:pl-0">
                  <button type="button" className={smallButton} aria-label={`將${product.name}移到最前`} title="移到最前" disabled={!canEdit || index === 0} onClick={() => move(product.id, 0)}><ArrowUpToLine className="size-4" /></button>
                  <button type="button" className={smallButton} aria-label={`上移${product.name}`} title="上移" disabled={!canEdit || index === 0} onClick={() => move(product.id, index - 1)}><ArrowUp className="size-4" /></button>
                  <button type="button" className={smallButton} aria-label={`下移${product.name}`} title="下移" disabled={!canEdit || index === ordered.length - 1} onClick={() => move(product.id, index + 1)}><ArrowDown className="size-4" /></button>
                  <button type="button" className={smallButton} aria-label={`將${product.name}移到最後`} title="移到最後" disabled={!canEdit || index === ordered.length - 1} onClick={() => move(product.id, ordered.length - 1)}><ArrowDownToLine className="size-4" /></button>
                </div>
              </li>
            );
          })}
        </ol>
        {!rows.length && <p className="p-4 text-sm text-slate-600">沒有符合條件的商品。</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!draft || !canEdit} onClick={() => void publish()}
          className="min-h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-45">
          {saving ? '儲存中…' : '儲存並發布排序'}
        </button>
        <button type="button" className={smallButton} disabled={!canEdit || !undoStack.length} onClick={undoDraft}>復原上一步</button>
        <button type="button" className={smallButton} disabled={saving || !draft}
          onClick={() => { setDraft(null); setUndoStack([]); setPosition(''); setSelectedId(''); setMessage('已載入已發布順序。'); setFailed(false); }}>載入已發布順序</button>
        <button type="button" className={smallButton} disabled={!canEdit || !order || !(draft?.productIds.length ?? order.productIds.length)}
          onClick={() => { if (order) editDraft({ productIds: [], revision: order.revision }); setMessage('已預覽預設順序，儲存後才會套用。'); setFailed(false); }}>預覽恢復預設</button>
      </div>
      {message && <p role={failed ? 'alert' : 'status'} className={failed ? 'text-sm text-rose-700' : 'text-sm text-slate-700'}>{message}</p>}
    </section>
  );
}
