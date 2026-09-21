import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { FilterPatch, GatePassListParams } from '../types'

/** Ten rows fill a screen without paging on every scroll. */
const PAGE_SIZE = 20

const INITIAL_PARAMS: GatePassListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  columns: {},
  referenceType: 'all',
  bill: 'all',
  reference: '',
  createdBy: '',
  from: '',
  to: '',
}

export interface GatePassListParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: GatePassListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: GatePassListParams
  isFiltered: boolean
  applyFilters: (patch: FilterPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the records list: which filters are set, which page, and
 * what the server should therefore be asked for.
 *
 * It lives in a hook rather than in the page because three different things
 * read it — the list, the summary and the export — and each has to see the
 * same set of records. A second copy of "what is currently being shown" is how
 * a downloaded spreadsheet ends up describing a list nobody was looking at.
 */
/**
 * `restored` seeds the first render and nothing else — the dashboard linking
 * here with the backlog it just counted, so the list opens on the records the
 * row was about rather than on everything.
 *
 * Deliberately not folded into the initial params: **Clear** must return to no
 * filters at all, not to the ones that happened to be seeded, or the one
 * control whose entire job is emptying the list would quietly refuse to. The
 * same arrangement `useChallanListParams` already has.
 */
export function useGatePassListParams(
  restored?: Partial<GatePassListParams>,
): GatePassListParamsController {
  const [params, setParams] = useState<GatePassListParams>(
    restored ? { ...INITIAL_PARAMS, ...restored } : INITIAL_PARAMS,
  )

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(
    () => ({ ...params, search: debouncedSearch }),
    [params, debouncedSearch],
  )

  /**
   * Any narrowing of the result set invalidates the current page number —
   * filtering to three results while on page four would show nothing. Every
   * filter change returns to page one in the same update, so there is never a
   * render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: FilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setParams((current) => ({ ...current, page }))
  }, [])

  /**
   * Deleting the last row on a page leaves the current page past the end of
   * the result set. The page calls this during render, so the operator lands
   * on the last real page rather than watching an empty one paint first.
   */
  const clampToPages = useCallback((totalPages: number) => {
    setParams((current) => (current.page > totalPages ? { ...current, page: totalPages } : current))
  }, [])

  const reset = useCallback(() => setParams(INITIAL_PARAMS), [])

  const isFiltered =
    params.search !== '' ||
    Object.keys(params.columns).length > 0 ||
    params.referenceType !== 'all' ||
    params.bill !== 'all' ||
    params.reference !== '' ||
    params.createdBy !== '' ||
    params.from !== '' ||
    params.to !== ''

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
