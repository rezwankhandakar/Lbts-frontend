import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DEFAULT_NOTIFICATION_PARAMS } from '../types'
import type { NotificationListParams } from '../types'

/**
 * Twenty rather than twenty-five. A message is taller than a journal row — it
 * carries a sentence, a line under it and two controls — so twenty is about the
 * same amount of scrolling the activity page's twenty-five is.
 */
const PAGE_SIZE = 20

const INITIAL_PARAMS: NotificationListParams = { ...DEFAULT_NOTIFICATION_PARAMS, limit: PAGE_SIZE }

export type NotificationFilterPatch = Partial<Omit<NotificationListParams, 'page' | 'limit'>>

export interface NotificationParamsController {
  /** What the controls render from — the search box included, as it is typed. */
  params: NotificationListParams
  /** What the server is actually asked for: the same thing, search settled. */
  applied: NotificationListParams
  isFiltered: boolean
  applyFilters: (patch: NotificationFilterPatch) => void
  setPage: (page: number) => void
  /** Pulls the page back inside a result set that has just shrunk. */
  clampToPages: (totalPages: number) => void
  reset: () => void
}

/**
 * The state behind the notification list.
 *
 * The same shape every list in this app uses, and in component state rather than
 * the URL — this codebase's convention for list filters, stated outright by
 * `useChallanListParams`. There is one seed argument for the same reason the
 * other list hooks grew one: the bell's panel offers "see everything that is
 * unread", which lands on this page already filtered. **It seeds the first render
 * and nothing else**, so *Clear* still clears to nothing rather than back to the
 * seed — the one control whose whole job is emptying the list must not quietly
 * refuse to.
 *
 * There are no date filters, deliberately, where the journal has four. A
 * notification is ninety days old at most and is read within a day or two of
 * arriving; "unread", "what kind" and a search box are the whole of how somebody
 * narrows a list like this, and a date range would be a control nobody touches
 * sitting where the useful ones go.
 */
export function useNotificationParams(
  seed?: NotificationFilterPatch,
): NotificationParamsController {
  const [params, setParams] = useState<NotificationListParams>(() => ({
    ...INITIAL_PARAMS,
    ...seed,
  }))

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  const applied = useMemo(() => ({ ...params, search: debouncedSearch }), [params, debouncedSearch])

  /**
   * Any narrowing of the result set invalidates the current page number, so every
   * filter change returns to page one in the same update — there is never a
   * render where the page and the filters disagree.
   */
  const applyFilters = useCallback((patch: NotificationFilterPatch) => {
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
    params.state !== 'all' ||
    params.module !== 'all' ||
    params.category !== 'all' ||
    params.priority !== 'all' ||
    params.event !== 'all' ||
    params.search !== ''

  return { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset }
}

export { PAGE_SIZE as NOTIFICATION_PAGE_SIZE }
