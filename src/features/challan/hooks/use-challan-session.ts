import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { checkPageRange } from '../api/challan-api'
import {
  activeEntry,
  addEntry,
  checkEntryRange,
  clearSkipped,
  hasUnsavedWork,
  labelFor,
  makeId,
  markSubmitted,
  progressOf,
  removeEntry,
  selectEntry,
  setRange,
  setValues,
  skipEntry,
  startSession,
} from '../lib/challan-session'
import type { ChallanEntry, ChallanSession } from '../lib/challan-session'
import type { RangeProblem } from '../lib/page-ranges'
import type { ChallanRecord, ChallanValues, PageRange } from '../types'

export interface ChallanSessionController {
  /** Identifies this workspace session to the server, so the second challan
   *  out of one PDF joins the batch the first one created. */
  sessionKey: string
  session: ChallanSession
  active: ChallanEntry | null
  activeLabel: string
  progress: ReturnType<typeof progressOf>
  /** What is wrong with the active entry's range, if anything. */
  rangeProblem: RangeProblem | null
  isCheckingRange: boolean
  hasUnsaved: boolean

  select: (id: string) => void
  add: () => void
  remove: (id: string) => void
  setActiveRange: (range: PageRange) => void
  rememberValues: (values: ChallanValues | null) => void
  /** Marks the active challan's pages as not being a challan at all. */
  skipActive: () => void
  unskipAll: () => void
  markFiled: (id: string, record: ChallanRecord) => void
  labelOf: (id: string) => string
}

/**
 * The workspace's processing session, wired to the one thing it cannot know on
 * its own.
 *
 * Everything about which pages belong to which challan is local state — see
 * `lib/challan-session.ts` — because none of it is a business record until
 * something is submitted. The exception is the page ranges already filed from
 * this same source PDF: a browser crash halfway through a stack, or the
 * operator picking the file up again tomorrow, leaves challans on the server
 * that this session has never heard of. So the range check is asked of the
 * server too, and the two answers are merged.
 */
export function useChallanSession(sourcePageCount: number): ChallanSessionController {
  /**
   * Generated once per workspace and never reused. It is what ties fifteen
   * separate submissions to one batch, and scoping it to the operator
   * server-side is what stops it tying them to somebody else's.
   */
  const [sessionKey] = useState(() => makeId('session'))
  const [session, setSession] = useState<ChallanSession>(() => startSession(sourcePageCount))

  const active = activeEntry(session)

  /**
   * What the server already holds for this session's source file.
   *
   * Debounced, because clicking through a page strip moves the range on every
   * chip and an undebounced check would fire a request per click — on a free
   * tier that shares one rate limit with everything else the operator is
   * doing, that is the request nobody notices until filing stops working.
   *
   * Failures are silent by design: the local check still runs, and the
   * submission itself is refused server-side if the range really is taken, so
   * a check that could not reach the network must never block somebody from
   * typing.
   */
  const settled = useDebouncedValue(
    `${active?.startPage ?? 0}:${active?.endPage ?? 0}`,
    400,
  )
  const [settledStart, settledEnd] = settled.split(':').map(Number)

  const rangeQuery = useQuery({
    queryKey: ['challans', 'page-range', sessionKey, settledStart, settledEnd, sourcePageCount],
    queryFn: () =>
      checkPageRange({
        sessionKey,
        sourcePageCount,
        sourcePageStart: settledStart,
        sourcePageEnd: settledEnd,
      }),
    enabled: Boolean(active) && sourcePageCount > 0 && settledStart >= 1,
    /**
     * Long enough that clicking back and forth between two challans does not
     * re-ask, short enough that a colleague filing from the same PDF is
     * noticed within a challan or two.
     */
    staleTime: 30_000,
    retry: false,
  })

  const rangeProblem = useMemo(() => {
    if (!active) {
      return null
    }
    return checkEntryRange(session, active.id, rangeQuery.data?.claimed ?? [])
  }, [session, active, rangeQuery.data])

  const select = useCallback((id: string) => setSession((current) => selectEntry(current, id)), [])
  const add = useCallback(() => setSession((current) => addEntry(current)), [])
  const remove = useCallback((id: string) => setSession((current) => removeEntry(current, id)), [])

  const setActiveRange = useCallback(
    (range: PageRange) => {
      setSession((current) =>
        current.activeId ? setRange(current, current.activeId, range) : current,
      )
    },
    [],
  )

  const rememberValues = useCallback((values: ChallanValues | null) => {
    setSession((current) =>
      current.activeId ? setValues(current, current.activeId, values) : current,
    )
  }, [])

  const skipActive = useCallback(() => {
    setSession((current) => (current.activeId ? skipEntry(current, current.activeId) : current))
  }, [])

  const unskipAll = useCallback(() => setSession(clearSkipped), [])

  const markFiled = useCallback((id: string, record: ChallanRecord) => {
    setSession((current) => markSubmitted(current, id, record))
  }, [])

  return {
    sessionKey,
    session,
    active,
    activeLabel: active ? labelFor(session, active.id) : 'Challan',
    progress: progressOf(session),
    rangeProblem,
    isCheckingRange: rangeQuery.isFetching,
    hasUnsaved: hasUnsavedWork(session),
    select,
    add,
    remove,
    setActiveRange,
    rememberValues,
    skipActive,
    unskipAll,
    markFiled,
    labelOf: useCallback((id: string) => labelFor(session, id), [session]),
  }
}
