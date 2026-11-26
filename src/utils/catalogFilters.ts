const sortOptions = ['relevance', 'popular', 'price_low', 'price_high', 'rating'] as const;
const filterKeys = ['q', 'material', 'stock', 'sort'] as const;

export interface CatalogFilters {
  query: string;
  material: string;
  inStockOnly: boolean;
  sort: typeof sortOptions[number];
}

export function readCatalogFilters(params: URLSearchParams, materialIds: readonly string[]): CatalogFilters {
  const material = params.get('material') ?? 'All';
  return {
    query: (params.get('q') ?? '').trim().slice(0, 160),
    material: materialIds.includes(material) ? material : 'All',
    inStockOnly: params.get('stock') === '1',
    sort: sortOptions.find(sort => sort === params.get('sort')) ?? 'relevance',
  };
}

export function writeCatalogFilters(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim().slice(0, 160));
  if (filters.material !== 'All') params.set('material', filters.material);
  if (filters.inStockOnly) params.set('stock', '1');
  if (filters.sort !== 'relevance') params.set('sort', filters.sort);
  return params;
}

export function extractCatalogFilterParams(search: string): string {
  const params = new URLSearchParams(search);
  for (const key of [...params.keys()]) {
    if (!filterKeys.some(filterKey => filterKey === key)) params.delete(key);
  }
  return params.toString();
}

export function clearCatalogFilterParams(search: string): URLSearchParams {
  const params = new URLSearchParams(search);
  for (const key of filterKeys) params.delete(key);
  return params;
}
