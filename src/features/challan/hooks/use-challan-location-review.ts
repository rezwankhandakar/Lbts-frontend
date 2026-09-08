import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { needsLocationAttention } from '../types'
import type { ChallanListParams, ChallanRecord } from '../types'

/**
 * A run of challans to settle, and where it came from.
 *
 * Carried in router state rather than in the URL: the order is a property of
 * the list somebody was looking at, not of any one record, so a link that
 * promised it could not reproduce it once the records moved. A reload
 * therefore degrades honestly to a single challan.
 */
export interface LocationRunState {
  /** Challan ids, in the order they were listed. */
  queue: string[]
  /** The list to come back to when the run ends or is abandoned. */
  returnTo: string
  /**
   * The filters that produced the run, handed back on the way out.
   *
   * The records list keeps its filters in component state rather than in the
   * URL, so leaving the page and returning would otherwise land on an
   * unfiltered list — and an administrator who has just settled twelve
   * locations would have to re-select "Location pending" to see the thirteen
   * still waiting. Absent for a list whose filters are fixed by its route.
   */
  returnFilters?: ChallanListParams
}

export interface ChallanLocationReviewController {
  /** Opens the location page on one row, with the rest of the backlog behind it. */
  openFor: (record: ChallanRecord) => void
}

/**
 * Turning a row into a run.
 *
 * The job is a backlog, not a single edit: an administrator filters to the
 * challans with no location or an unconfirmed one and works down them. Opening
 * one row therefore opens the whole run behind it — **the rows on screen that
 * want attention**, in the order they are listed, which is the same question
 * the `pending` and `review` filters ask. So somebody who filtered gets exactly
 * what they filtered to, and somebody who did not gets only the rows that need
 * it rather than a walk through settled records.
 *
 * A row that wants nothing opens alone. The menu still offers changing a
 * settled location, and that is one edit rather than a run — walking on from
 * it would take somebody through records they never asked to look at.
 */
export function useChallanLocationReview(
  records: ChallanRecord[],
  returnFilters?: ChallanListParams,
): ChallanLocationReviewController {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()

  const openFor = useCallback(
    (target: ChallanRecord) => {
      const backlog = records.filter((record) => needsLocationAttention(record)).map((row) => row.id)

      const state: LocationRunState = {
        queue: backlog.includes(target.id) ? backlog : [target.id],
        returnTo: `${pathname}${search}`,
        returnFilters,
      }

      navigate(`/challan/${target.id}/location`, { state })
    },
    [records, returnFilters, navigate, pathname, search],
  )

  return { openFor }
}
