import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { EntryListParams } from '../types'

export type EntryFilterPatch = Partial<Omit<EntryListParams, 'page' | 'limit'>>

const EMPTY: Omit<EntryListParams, 'page' | 'limit'> = {
  kind: 'all',
  walletId: '',
  vendorId: '',
  expenseName: '',
  from: '',
  to: '',
  search: '',
}

/**
 * A list's filters, held in component state as every list in the app holds
 * them. Any filter change returns to the first page; the search is debounced
 * so typing is one request, not one per key. `fixed` is what a page pins —
 * the Expenses page is always expenses — and survives Clear.
 */
export function useEntryListParams(seed: Partial<EntryListParams> = {}, fixed: Partial<EntryListParams> = {}) {
  const [params, setParams] = useState<EntryListParams>({ page: 1, limit: 20, ...EMPTY, ...seed, ...fixed })
  const search = useDebouncedValue(params.search, 350)

  const applyFilters = (patch: EntryFilterPatch) => setParams((current) => ({ ...current, ...patch, ...fixed, page: 1 }))
  const setPage = (page: number) => setParams((current) => ({ ...current, page }))
  const reset = () => setParams((current) => ({ ...current, ...EMPTY, ...fixed, page: 1 }))

  const isFiltered = (Object.keys(EMPTY) as (keyof typeof EMPTY)[]).some(
    (key) => !(key in fixed) && params[key] !== EMPTY[key],
  )

  return { params, applied: { ...params, search }, applyFilters, setPage, reset, isFiltered }
}
