import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { QUICK_RANGE_KEYS, quickRangeFor, rangeFor } from '@/lib/date-ranges'
import type { QuickRange } from '@/lib/date-ranges'
import type { ActivityFilterPatch, ActivityListParams } from '../types'

/**
 * Twenty-five rather than ten. This is a list somebody scans for one event
 * rather than a set of records they work through, and a short page turns
 * "when did that happen" into a paging exercise.
 */
const PAGE_SIZE = 25

const INITIAL_PARAMS: ActivityListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  module: 'all',
  category: 'all',
  severity: 'all',
  action: 'all',
  entityType: 'all',
  actorId: '',
  from: '',
  to: '',
}

export interface ActivityListParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: ActivityListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: ActivityListParams
  isFiltered: boolean
  /** Which quick date chip the current range corresponds to, if any. */
  quickRange: QuickRange
  applyFilters: (patch: ActivityFilterPatch) => void
  applyQuickRange: (quick: QuickRange) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the journal.
 *
 * The same shape every list in this app uses, and for the same reason: more
 * than one thing reads it — the timeline, the overview tiles and the export
 * all take these params — and a second copy of "what is currently being shown"
 * is how a summary ends up describing a list nobody was looking at.
 *
 * It stays in component state rather than the URL, which is this codebase's
 * convention for list filters. There is no journey here that has to reproduce
 * a view, so a query string would be a promise nothing keeps.
 */
export function useActivityListParams(): ActivityListParamsController {
  const [params, setParams] = useState<ActivityListParams>(INITIAL_PARAMS)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(() => ({ ...params, search: debouncedSearch }), [params, debouncedSearch])

  /**
   * Any narrowing of the result set invalidates the current page number, so
   * every filter change returns to page one in the same update — there is
   * never a render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: ActivityFilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }, [])

  /**
   * The date chips. `all` clears both ends rather than setting a wide range,
   * so an unbounded journal is genuinely unbounded and the server leaves
   * `createdAt` out of the query entirely.
   */
  const applyQuickRange = useCallback((quick: QuickRange) => {
    if (quick === 'custom') {
      return
    }
    const range = quick === 'all' ? { from: '', to: '' } : rangeFor(quick)
    setParams((current) => ({ ...current, ...range, page: 1 }))
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
    params.module !== 'all' ||
    params.category !== 'all' ||
    params.severity !== 'all' ||
    params.action !== 'all' ||
    params.entityType !== 'all' ||
    params.actorId !== '' ||
    params.from !== '' ||
    params.to !== ''

  const quickRange = quickRangeFor({ from: params.from, to: params.to })

  return {
    params,
    applied,
    isFiltered,
    quickRange,
    applyFilters,
    applyQuickRange,
    setPage,
    clampToPages,
    reset,
  }
}

export { PAGE_SIZE as ACTIVITY_PAGE_SIZE, QUICK_RANGE_KEYS }
