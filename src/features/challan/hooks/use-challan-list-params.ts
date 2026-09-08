import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ChallanFilterPatch, ChallanListParams } from '../types'

/** Ten rows fill a screen without paging on every scroll. */
const PAGE_SIZE = 10

const INITIAL_PARAMS: ChallanListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  status: 'all',
  location: 'all',
  amount: 'all',
  district: '',
  customer: '',
  product: '',
  model: '',
  zonePo: '',
  batchId: '',
  createdBy: '',
  from: '',
  to: '',
}

export interface ChallanListParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: ChallanListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: ChallanListParams
  isFiltered: boolean
  applyFilters: (patch: ChallanFilterPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the records list: which filters are set, which page, and
 * what the server should therefore be asked for.
 *
 * It lives in a hook rather than in the page because more than one thing reads
 * it, and each has to see the same set of records. A second copy of "what is
 * currently being shown" is how a summary ends up describing a list nobody was
 * looking at.
 */
export function useChallanListParams(
  overrides: Partial<ChallanListParams> = {},
  restored?: ChallanListParams,
): ChallanListParamsController {
  const initial = useMemo(() => ({ ...INITIAL_PARAMS, ...overrides }), [overrides])

  /**
   * `restored` seeds the first render and nothing else — it is what somebody
   * returning from settling a run of locations was looking at before they
   * left, handed back so they do not have to re-select "Location pending" to
   * see the ones still waiting.
   *
   * Deliberately not folded into `initial`: **Clear** must return to no
   * filters at all, not to the ones that happened to be restored, or the one
   * control whose entire job is emptying the list would quietly refuse to.
   */
  const [params, setParams] = useState<ChallanListParams>(restored ?? initial)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(() => ({ ...params, search: debouncedSearch }), [params, debouncedSearch])

  /**
   * Any narrowing of the result set invalidates the current page number —
   * filtering to three results while on page four would show nothing. Every
   * filter change returns to page one in the same update, so there is never a
   * render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: ChallanFilterPatch) => {
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

  const reset = useCallback(() => setParams(initial), [initial])

  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.location !== 'all' ||
    params.amount !== 'all' ||
    params.district !== '' ||
    params.customer !== '' ||
    params.product !== '' ||
    params.model !== '' ||
    params.zonePo !== '' ||
    params.createdBy !== '' ||
    params.from !== '' ||
    params.to !== '' ||
    // A batch filter fixed by the route is not a filter the operator set, so
    // it does not make the list "filtered" for the purpose of a Clear button.
    (params.batchId !== '' && overrides.batchId === undefined)

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}
