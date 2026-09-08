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
  resumeSession,
  selectEntry,
  setRange,
  setValues,
  skipEntry,
  startSession,
} from '../lib/challan-session'
import type { ChallanEntry, ChallanSession, FiledChallanPages } from '../lib/challan-session'
import type { RangeProblem } from '../lib/page-ranges'
import type { ChallanRecord, ChallanValues, PageRange } from '../types'

/**
 * An unfinished batch this workspace is picking up.
 *
 * The source PDF is not stored, so resuming is the operator opening the same
 * file again — and everything the earlier session knew has to come back from
 * the collection instead: which pages became challans, and which were declared
 * blank.
 */
export interface ResumedBatch {
  batchId: string
  filed: FiledChallanPages[]
  skippedPages: number[]
}

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
export function useChallanSession(
  sourcePageCount: number,
  resume?: ResumedBatch | null,
): ChallanSessionController {
  /**
   * Generated once per workspace and never reused. It is what ties fifteen
   * separate submissions to one batch, and scoping it to the operator
   * server-side is what stops it tying them to somebody else's.
   *
   * A resumed workspace still has one and it still names nothing — which is
   * precisely why resuming carries the batch id instead. The key is left in
   * place rather than made conditional, so there is one shape of session.
   */
  const [sessionKey] = useState(() => makeId('session'))
  /**
   * Read once. Which challans exist is a fact about the moment the file was
   * reopened; anything filed after that is this session's own doing, and a
   * refetch rebuilding the queue underneath somebody mid-entry would lose what
   * they had typed.
   */
  const [session, setSession] = useState<ChallanSession>(() =>
    resume
      ? resumeSession(sourcePageCount, resume.filed, resume.skippedPages)
      : startSession(sourcePageCount),
  )

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
  const settled = useDebouncedValue(`${active?.startPage ?? 0}:${active?.endPage ?? 0}`, 400)
  const [settledStart, settledEnd] = settled.split(':').map(Number)

  const batchId = resume?.batchId
  const rangeQuery = useQuery({
    queryKey: [
      'challans',
      'page-range',
      batchId ?? sessionKey,
      settledStart,
      settledEnd,
      sourcePageCount,
    ],
    queryFn: () =>
      checkPageRange({
        sessionKey,
        batchId,
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

  const setActiveRange = useCallback((range: PageRange) => {
    setSession((current) =>
      current.activeId ? setRange(current, current.activeId, range) : current,
    )
  }, [])

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
