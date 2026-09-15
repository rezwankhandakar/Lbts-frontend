import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { TripDoFilterPatch, TripDoListParams } from '../types'

/**
 * Fifty rows a page. This is a sheet somebody scans down and across, not a
 * list of records they open one by one, and a challan's lines should rarely
 * be cut across a page boundary.
 */
const PAGE_SIZE = 50

const INITIAL_PARAMS: TripDoListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  kind: 'all',
  link: 'all',
  from: '',
  to: '',
  columns: {},
}

export interface TripDoListParamsController {
  /** What the controls render from, the search box as it is typed. */
  params: TripDoListParams
  /** What the server is asked for: the same, with the search settled. */
  applied: TripDoListParams
  isFiltered: boolean
  applyFilters: (patch: TripDoFilterPatch) => void
  setPage: (page: number) => void
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the sheet — the shape every list here uses, for the reason
 * they give: more than one thing reads it, and a second copy of "what is being
 * shown" is how an export ends up describing a sheet nobody was looking at.
 */
export function useTripDoListParams(initialSearch = ''): TripDoListParamsController {
  // `initialSearch` seeds the first render only — a gate pass page linking here
  // with its Trip DO — so Clear still clears to nothing.
  const [params, setParams] = useState<TripDoListParams>(() => ({
    ...INITIAL_PARAMS,
    search: initialSearch,
  }))
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(() => ({ ...params, search: debouncedSearch }), [params, debouncedSearch])

  // Any narrowing returns to page one in the same update.
  const applyFilters = useCallback((patch: TripDoFilterPatch) => {
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
    params.kind !== 'all' ||
    params.link !== 'all' ||
    params.from !== '' ||
    params.to !== '' ||
    Object.keys(params.columns).length > 0

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
