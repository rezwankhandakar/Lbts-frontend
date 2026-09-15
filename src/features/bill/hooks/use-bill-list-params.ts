import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { BillFilterPatch, BillListParams } from '../types'

/** Twelve cards: a year of one unit on one page. */
const PAGE_SIZE = 12

const INITIAL_PARAMS: BillListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  year: null,
  month: null,
  unit: '',
  status: 'all',
}

export interface BillListParamsController {
  /** What the controls render from, the search box as it is typed. */
  params: BillListParams
  /** What the server is asked for: the same, with search and unit settled. */
  applied: BillListParams
  isFiltered: boolean
  applyFilters: (patch: BillFilterPatch) => void
  setPage: (page: number) => void
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/** The bills list's filters. Narrowing always returns to page one. */
export function useBillListParams(): BillListParamsController {
  const [params, setParams] = useState<BillListParams>(INITIAL_PARAMS)
  const search = useDebouncedValue(params.search, 300)
  const unit = useDebouncedValue(params.unit, 300)

  const applied = useMemo(() => ({ ...params, search, unit }), [params, search, unit])

  const applyFilters = useCallback(
    (patch: BillFilterPatch) => setParams((current) => ({ ...current, ...patch, page: 1 })),
    [],
  )
  const setPage = useCallback((page: number) => setParams((current) => ({ ...current, page })), [])
  const clampToPages = useCallback(
    (totalPages: number) =>
      setParams((current) => (current.page > totalPages ? { ...current, page: Math.max(1, totalPages) } : current)),
    [],
  )
  const reset = useCallback(() => setParams(INITIAL_PARAMS), [])

  const isFiltered =
    params.search !== '' ||
    params.year !== null ||
    params.month !== null ||
    params.unit !== '' ||
    params.status !== 'all'

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
