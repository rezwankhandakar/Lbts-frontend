import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { BatchListParams } from '../api/challan-api'

/**
 * Ten, the same as the records list. A batch row is two lines and a progress
 * bar, so a page of them is about a screenful.
 */
const PAGE_SIZE = 10

const INITIAL_PARAMS: BatchListParams = {
  page: 1,
  limit: PAGE_SIZE,
  status: 'all',
  search: '',
}

export type BatchFilterPatch = Partial<Omit<BatchListParams, 'page' | 'limit'>>

export interface BatchListParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: BatchListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: BatchListParams
  isFiltered: boolean
  applyFilters: (patch: BatchFilterPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the source PDF list.
 *
 * The same shape the challan, location and rate card lists use, for the same
 * reason: more than one thing reads it, and a second copy of "what is
 * currently being shown" is how a summary ends up describing a list nobody was
 * looking at.
 */
export function useBatchListParams(): BatchListParamsController {
  const [params, setParams] = useState<BatchListParams>(INITIAL_PARAMS)

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
  const applyFilters = useCallback((patch: BatchFilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page }))
  }, [])

  const clampToPages = useCallback((totalPages: number) => {
    setParams((current) => (current.page > totalPages ? { ...current, page: totalPages } : current))
  }, [])

  const reset = useCallback(() => setParams(INITIAL_PARAMS), [])

  const isFiltered = params.search !== '' || params.status !== 'all'

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
