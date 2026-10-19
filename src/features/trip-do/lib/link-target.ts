import { countOf } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import type { LinkTarget, TickedLink, TripDoRowRecord } from '../types'
import { modelKey } from './trip-do-meta'

/** The Trip DO picker for one row, which may link part of it. */
export function linkTargetForRow(row: TripDoRowRecord): LinkTarget {
  return {
    rowIds: [row.id],
    anchorRowId: row.id,
    productName: row.productName,
    model: row.model,
    qty: row.qty,
    label: row.challanNumber,
    currentGatePassId: row.link?.gatePassId ?? null,
    canSplit: row.qty > 1,
    parts: [],
    otherLinks: [],
  }
}

/**
 * Why a set of ticked rows cannot share one Trip DO, or null when they can.
 *
 * One model, because a gate pass line is one model — a bulk link across two
 * models is two gate pass lines, and the picker can only show one line's room.
 */
export function bulkLinkProblem(rows: readonly TripDoRowRecord[]): string | null {
  if (rows.length === 0) {
    return 'tripDo.assign.tickRows'
  }
  const keys = new Set(rows.map((row) => modelKey(row.model)))
  if (keys.size > 1) {
    return 'tripDo.assign.differentModels'
  }
  return null
}

/**
 * The order a short bulk link fills ticked rows in: the oldest challan first,
 * so the piece that waits for another Trip DO is on the one filed most
 * recently — the delivery that has been waiting least.
 */
function fillOrder(a: TripDoRowRecord, b: TripDoRowRecord): number {
  return a.slNumber - b.slNumber || a.splitIndex - b.splitIndex
}

/** An order row's present link, as `withTickedRoom` reads it. */
function tickedLink(row: TripDoRowRecord): TickedLink | null {
  if (row.kind !== 'Order' || !row.link) {
    return null
  }
  return { gatePassId: row.link.gatePassId, lineKey: modelKey(row.link.model), qty: row.qty }
}

/**
 * The picker for several ticked rows of one model. The whole lot by default;
 * fewer pieces fills them oldest challan first and splits the row they run
 * out on.
 */
export function linkTargetForRows(
  rows: readonly TripDoRowRecord[],
  t: Translator,
): LinkTarget | null {
  if (rows.length === 0 || bulkLinkProblem(rows)) {
    return null
  }
  if (rows.length === 1) {
    return linkTargetForRow(rows[0])
  }

  const ordered = [...rows].sort(fillOrder)
  const [first, ...rest] = ordered
  const shared = ordered.every((row) => row.link?.gatePassId === first.link?.gatePassId)
  const qty = ordered.reduce((sum, row) => sum + row.qty, 0)

  return {
    rowIds: ordered.map((row) => row.id),
    anchorRowId: first.id,
    productName: first.productName,
    model: first.model,
    qty,
    label: countOf(ordered.length, 'nouns.row', t),
    currentGatePassId: shared ? (first.link?.gatePassId ?? null) : null,
    canSplit: qty > 1,
    parts: ordered.map((row) => ({ slNumber: row.slNumber, qty: row.qty })),
    otherLinks: rest.map(tickedLink).filter((link): link is TickedLink => link !== null),
  }
}
