import { useLocation, useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { backlogAfterBillSave } from '../lib/bill-backlog'
import { TRIP_BILL_FILTERS, TRIP_STATUSES } from '../types'
import type { TripListParams } from '../types'

/**
 * The list's filters as a trip page received them — router state, so it is
 * checked rather than trusted: a history entry can outlive the shape that
 * wrote it, and a malformed one must open the list unfiltered rather than
 * hand it a page of `NaN`.
 */
const tripListSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  search: z.string(),
  status: z.enum([...TRIP_STATUSES, 'all'] as const),
  vendorId: z.string(),
  from: z.string(),
  to: z.string(),
  bill: z.enum(TRIP_BILL_FILTERS),
})

/** What the deliveries list puts in router state when it opens a trip. */
export function tripListState(params: TripListParams): { tripList: TripListParams } {
  return { tripList: params }
}

/**
 * The way back from a trip to the list that opened it.
 *
 * The list's filters live in component state rather than the URL, so they are
 * handed to the trip on the way in (`tripListState`) and handed back on the way
 * out as `tripFilters` — the key the list already reads its seed from. Two
 * ways out use it: the back link, which returns to exactly what was left, and
 * a saved bill, which returns to the bill backlog inside those same filters
 * (`backlogAfterBillSave` decides the backlog and the page). A trip opened from
 * anywhere else has nothing to hand back, and a saved bill then opens the
 * backlog unfiltered.
 *
 * `replace` on the bill return, so Back from the list goes to the list as it
 * was before the trip was opened rather than to the trip again.
 */
export function useTripListReturn() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const parsed = tripListSchema.safeParse((state as { tripList?: unknown } | null)?.tripList)
  const list: TripListParams | null = parsed.success ? parsed.data : null

  return {
    /** Router state for the link back to the list — the filters it was left with. */
    backState: list ? { tripFilters: list } : undefined,
    afterBillSaved: () =>
      navigate('/delivery', {
        replace: true,
        state: { tripFilters: { ...list, ...backlogAfterBillSave(list) } },
      }),
  }
}
