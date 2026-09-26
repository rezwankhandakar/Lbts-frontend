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

/** What a link of `linkQty` does to a row of `rowQty`. */
export function linkOutcome(
  rowQty: number,
  linkQty: number,
): { linked: number; remainder: number } {
  const linked = Math.max(0, Math.min(rowQty, linkQty))
  return { linked, remainder: rowQty - linked }
}
