import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { LabourBillFilterPatch, LabourBillListParams } from '../types'

/** Twelve cards: a year of slots on one page. */
const PAGE_SIZE = 12

const INITIAL_PARAMS: LabourBillListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  year: null,
  month: null,
  status: 'all',
}

export interface LabourBillListParamsController {
  /** What the controls render from, the search box as it is typed. */
  params: LabourBillListParams
  /** What the server is asked for: the same, with the search settled. */
  applied: LabourBillListParams
  isFiltered: boolean
  applyFilters: (patch: LabourBillFilterPatch) => void
  setPage: (page: number) => void
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/** The labour bill list's filters. Narrowing always returns to page one. */
export function useLabourBillListParams(): LabourBillListParamsController {
  const [params, setParams] = useState<LabourBillListParams>(INITIAL_PARAMS)
  const search = useDebouncedValue(params.search, 300)

  const applied = useMemo(() => ({ ...params, search }), [params, search])

  const applyFilters = useCallback(
    (patch: LabourBillFilterPatch) => setParams((current) => ({ ...current, ...patch, page: 1 })),
    [],
  )
  const setPage = useCallback((page: number) => setParams((current) => ({ ...current, page })), [])
  const clampToPages = useCallback(
    (totalPages: number) =>
      setParams((current) =>
        current.page > totalPages ? { ...current, page: Math.max(1, totalPages) } : current,
      ),
    [],
  )
  const reset = useCallback(() => setParams(INITIAL_PARAMS), [])

  const isFiltered =
    params.search !== '' ||
    params.year !== null ||
    params.month !== null ||
    params.status !== 'all'

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
