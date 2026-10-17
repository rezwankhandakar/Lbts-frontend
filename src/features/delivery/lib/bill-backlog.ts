/**
 * Where the deliveries list opens after a trip's bill is saved.
 *
 * Entering trip bills is backlog work: somebody filters the list to the trips
 * with no rent, opens one, types the figure, saves, and wants the next. So a
 * save sends them back to the list on that backlog — inside whatever else they
 * had filtered by, which the caller keeps — and this decides the two values
 * that are this rule's own:
 *
 * - **Which backlog.** The trips with no rent, unless the list was already on
 *   the trips with no labour bill: somebody working that backlog is entering
 *   labour bills, and moving them to a different list on every save would be
 *   the page changing the job under them.
 * - **Which page.** Only a list already on that backlog keeps its page. The
 *   trip just saved has left the backlog, so the server's paging closes the
 *   gap — the next trip slides onto the page, and when a page has been worked
 *   through, the page after it takes its place. A list that was on some other
 *   filter starts at page one, because its page number counted a different
 *   set of trips. A page past the end is the list's own to clamp.
 *
 * Import-free so `node --test` can load it; the filter values are spelled out
 * rather than read from `../types`, and the caller's types check them.
 */

export type BillBacklog = 'no-rent' | 'no-labour'

export function backlogAfterBillSave(previous: { page: number; bill: string } | null): {
  bill: BillBacklog
  page: number
} {
  const bill: BillBacklog = previous?.bill === 'no-labour' ? 'no-labour' : 'no-rent'

  return { bill, page: previous !== null && previous.bill === bill ? previous.page : 1 }
}
