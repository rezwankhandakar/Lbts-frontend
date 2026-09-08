import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ProductRateFilterPatch, ProductRateListParams } from '../types'

/**
 * Twenty rather than ten. This is a reference card somebody scans rather than
 * a record they read, and a product's models mostly fit on one page at this
 * size.
 */
const PAGE_SIZE = 20

const INITIAL_PARAMS: ProductRateListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  productName: '',
  hasModel: 'all',
  active: 'all',
}

export interface ProductRateListParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: ProductRateListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: ProductRateListParams
  isFiltered: boolean
  applyFilters: (patch: ProductRateFilterPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the rate card list. The same shape the location, challan
 * and gate pass lists use, for the same reason: more than one thing reads it,
 * and a second copy of "what is currently being shown" is how a summary ends
 * up describing a list nobody was looking at.
 */
export function useProductRateListParams(): ProductRateListParamsController {
  const [params, setParams] = useState<ProductRateListParams>(INITIAL_PARAMS)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(
    () => ({ ...params, search: debouncedSearch }),
    [params, debouncedSearch],
  )

  /**
   * Any narrowing of the result set invalidates the current page number, so
   * every filter change returns to page one in the same update — there is
   * never a render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: ProductRateFilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page }))
  }, [])

  const clampToPages = useCallback((totalPages: number) => {
    setParams((current) => (current.page > totalPages ? { ...current, page: totalPages } : current))
  }, [])

  const reset = useCallback(() => setParams(INITIAL_PARAMS), [])

  const isFiltered =
    params.search !== '' ||
    params.productName !== '' ||
    params.hasModel !== 'all' ||
    params.active !== 'all'

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
