/**
 * The arithmetic behind dividing a sheet row, mirrored from the rules the API
 * enforces in `trip-do.service.ts`.
 *
 * Import-free so `node --test` can load it; the constant is declared here and
 * re-exported from `../types`, the direction CLAUDE.md sets for tested files.
 */

export const MAX_SPLIT_PARTS = 20

/**
 * `total` pieces in `count` parts as evenly as whole pieces allow, the larger
 * parts first — five in two is three and two, which is the split somebody
 * would write down by hand.
 */
export function evenParts(total: number, count: number): number[] {
  const parts = Math.max(1, Math.min(count, total))
  const base = Math.floor(total / parts)
  const extra = total - base * parts
  return Array.from({ length: parts }, (_, index) => base + (index < extra ? 1 : 0))
}

/**
 * A refusal, as a key and the numbers that go in it.
 *
 * Not a sentence: this file is import-free so `node --test` can load it, and a
 * sentence built here could only ever be English. Returning the key with its
 * values lets the component render it in the reader's language and lets the
 * test pin the *decision* — which refusal, about which numbers — rather than
 * the wording, which is the thing most likely to change.
 */
export interface SplitProblem {
  key: string
  values?: Record<string, number>
}

/** Why a split cannot be saved, or null when it can. */
export function splitProblem(parts: readonly number[], total: number): SplitProblem | null {
  if (parts.length < 2) {
    return { key: 'tripDo.split.atLeastTwo' }
  }
  if (parts.length > MAX_SPLIT_PARTS) {
    return { key: 'tripDo.split.tooManyParts', values: { max: MAX_SPLIT_PARTS } }
  }
  if (parts.some((part) => !Number.isInteger(part) || part < 1)) {
    return { key: 'tripDo.split.everyPart' }
  }

  const sum = parts.reduce((running, part) => running + part, 0)
  if (sum !== total) {
    return sum < total
      ? { key: 'tripDo.split.stillToPlace', values: { short: total - sum, sum, total } }
      : { key: 'tripDo.split.tooMany', values: { over: sum - total, sum, total } }
  }
  return null
}

/**
 * How many pieces a Trip DO link should offer by default: the whole row when
 * the gate pass has room for it, otherwise what is left on the gate pass —
 * which is the split the operator was about to make by hand.
 */
export function defaultLinkQty(rowQty: number, remaining: number): number {
  return Math.max(0, Math.min(rowQty, remaining))
}

/**
 * How a bulk link of `qty` pieces falls across ticked rows, in the order given:
 * each row is taken whole while the pieces last, the row they run out on is
 * split, and any after it are left as they were. Mirrors `planBulkLink` in the
 * backend's `trip-do.ledger.ts`, which is what actually decides — change one,
 * change both.
 */
export function bulkLinkShares(rowQtys: readonly number[], qty: number): number[] {
  let left = Math.max(0, qty)
  return rowQtys.map((rowQty) => {
    const take = Math.max(0, Math.min(rowQty, left))
    left -= take
    return take
  })
}

/** What a bulk link leaves behind, for the sentence under the stepper. */
export interface BulkLinkPreview<T> {
  /** The row the pieces ran out on, and how many of it wait for another Trip DO. */
  split: { part: T; remainder: number } | null
  /** Ticked rows after that one, which the link does not touch at all. */
  untouchedRows: number
}

export function bulkLinkPreview<T extends { qty: number }>(
  parts: readonly T[],
  qty: number,
): BulkLinkPreview<T> {
  const shares = bulkLinkShares(
    parts.map((part) => part.qty),
    qty,
  )
  const splitAt = parts.findIndex((part, index) => shares[index] > 0 && shares[index] < part.qty)

  return {
    split: splitAt >= 0 ? { part: parts[splitAt], remainder: parts[splitAt].qty - shares[splitAt] } : null,
    untouchedRows: shares.filter((share) => share === 0).length,
  }
}

/** A ticked row's present link, for working out the room it would give back. */
export interface TickedLink {
  gatePassId: string
  lineKey: string
  qty: number
}

/** What `withTickedRoom` reads off a gate pass option. */
export interface RoomOption {
  id: string
  lineKey: string
  qty: number
  allocatedQty: number
  remainingQty: number
  countsTowardQty: boolean
}

/**
 * A gate pass option as it stands for a set of ticked rows.
 *
 * The picker is asked about one row and counts only that one as its own, so
 * any *other* ticked order row already on the same line is reported as taken —
 * yet it moves with the rest, and the server gives its pieces back before it
 * checks. Without this a line the ticked rows already fill reads as full and
 * cannot be chosen, and one partly filled caps the stepper below what the
 * server accepts and proposes a split nobody needs. A return or re-sent row's
 * option is the whole line already, so it is returned as it is.
 */
export function withTickedRoom<T extends RoomOption>(option: T, others: readonly TickedLink[]): T {
  if (!option.countsTowardQty) {
    return option
  }
  const own = others
    .filter((link) => link.gatePassId === option.id && link.lineKey === option.lineKey)
    .reduce((sum, link) => sum + link.qty, 0)
  if (own === 0) {
    return option
  }
  const allocatedQty = Math.max(0, option.allocatedQty - own)
  return { ...option, allocatedQty, remainingQty: Math.max(0, option.qty - allocatedQty) }
}

/** What a link of `linkQty` does to a row of `rowQty`. */
export function linkOutcome(
  rowQty: number,
  linkQty: number,
): { linked: number; remainder: number } {
  const linked = Math.max(0, Math.min(rowQty, linkQty))
  return { linked, remainder: rowQty - linked }
}
