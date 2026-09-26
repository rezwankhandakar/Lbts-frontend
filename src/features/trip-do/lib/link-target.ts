import type { LinkTarget, TripDoRowRecord } from '../types'
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

/** The picker for several ticked rows of one model, linked whole. */
export function linkTargetForRows(rows: readonly TripDoRowRecord[]): LinkTarget | null {
  const [first] = rows
  if (!first || bulkLinkProblem(rows)) {
    return null
  }
  if (rows.length === 1) {
    return linkTargetForRow(first)
  }

  const shared = rows.every((row) => row.link?.gatePassId === first.link?.gatePassId)

  return {
    rowIds: rows.map((row) => row.id),
    anchorRowId: first.id,
    productName: first.productName,
    model: first.model,
    qty: rows.reduce((sum, row) => sum + row.qty, 0),
    label: `${rows.length} rows`,
    currentGatePassId: shared ? (first.link?.gatePassId ?? null) : null,
    canSplit: false,
  }
}
