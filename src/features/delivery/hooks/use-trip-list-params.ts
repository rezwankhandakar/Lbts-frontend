import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { TripFilterPatch, TripListParams } from '../types'

const INITIAL: TripListParams = {
  page: 1,
  limit: 10,
  search: '',
  status: 'all',
  vendorId: '',
  from: '',
  to: '',
  bill: 'all',
}

/**
 * The state behind the trips list — the same shape every list in this app
 * uses: the search is debounced before it reaches the query key, any change of
 * filter returns to page one in the same update, and the page can be clamped
 * after a deletion shrinks the result set. Filters live in component state,
 * not the URL, which is the convention the app already follows.
 */
/**
 * `restored` seeds the first render and nothing else — the dashboard linking
 * here with the backlog it just counted. Clear still clears to nothing, the
 * arrangement `useChallanListParams` already has.
 */
export function useTripListParams(restored?: Partial<TripListParams>) {
  const [params, setParams] = useState<TripListParams>(
    restored ? { ...INITIAL, ...restored } : INITIAL,
  )
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(() => ({ ...params, search: debouncedSearch }), [params, debouncedSearch])

  const applyFilters = useCallback((patch: TripFilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page }))
  }, [])

  const clampToPages = useCallback((totalPages: number) => {
    setParams((current) => (current.page > totalPages ? { ...current, page: totalPages } : current))
  }, [])

  const reset = useCallback(() => setParams(INITIAL), [])

  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.vendorId !== '' ||
    params.from !== '' ||
    params.to !== '' ||
    params.bill !== 'all'

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
