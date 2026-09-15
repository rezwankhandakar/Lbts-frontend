import type { CarryingChargeRecord, CompletionPayload, TripChallanRecord } from '../types'

/**
 * The completion endpoint is a **whole-list replace** — returns, floor,
 * carrying and note travel together. The delivery page saves them from two
 * places (what came back, and the extra details), so each builds its payload
 * from what is on record and overrides only its own half. Otherwise saving a
 * floor number would quietly wipe a return, or the other way round.
 */

/** Pieces that came back, keyed by position on this trip's manifest. */
export type ReturnQuantities = Record<number, number>

function lineIndexOf(challan: TripChallanRecord, entry: { productName: string; model: string }) {
  return challan.lines.findIndex(
    (line) => line.productName === entry.productName && line.model === entry.model,
  )
}

/** What is on record as having come back, by line. */
export function storedReturns(challan: TripChallanRecord): ReturnQuantities {
  const result: ReturnQuantities = {}
  for (const entry of challan.returned) {
    const index = lineIndexOf(challan, entry)
    if (index >= 0) {
      result[index] = (result[index] ?? 0) + entry.qty
    }
  }
  return result
}

export function returnedTotal(returns: ReturnQuantities): number {
  return Object.values(returns).reduce((sum, qty) => sum + qty, 0)
}

/** Every line, back in full. */
export function everythingReturned(challan: TripChallanRecord): ReturnQuantities {
  return Object.fromEntries(challan.lines.map((line, index) => [index, line.qty]))
}

export function completionPayload(
  challan: TripChallanRecord,
  patch: {
    returns?: ReturnQuantities
    floorNo?: number | null
    carrying?: CarryingChargeRecord[]
    deliveryNote?: string
  },
): CompletionPayload {
  const returns = patch.returns ?? storedReturns(challan)

  return {
    returned: Object.entries(returns)
      .map(([index, qty]) => ({ lineIndex: Number(index), qty }))
      .filter(({ lineIndex, qty }) => qty > 0 && challan.lines[lineIndex] !== undefined)
      .map(({ lineIndex, qty }) => ({
        lineIndex,
        qty: Math.min(qty, challan.lines[lineIndex].qty),
        // A reason typed on an earlier save survives a quantity change.
        reason:
          challan.returned.find((entry) => lineIndexOf(challan, entry) === lineIndex)?.reason ?? '',
      })),
    floorNo: patch.floorNo !== undefined ? patch.floorNo : challan.floorNo,
    carrying: patch.carrying ?? challan.carrying,
    deliveryNote: patch.deliveryNote ?? challan.deliveryNote,
  }
}
