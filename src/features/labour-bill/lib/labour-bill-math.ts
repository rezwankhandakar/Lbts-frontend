/**
 * The Walton Labour Bill's arithmetic, as pure functions.
 *
 * Import-free on purpose, for the reason `features/challan/lib/page-ranges.ts`
 * is: `node --test` resolves module specifiers the way Node does and knows
 * nothing about the `@/` alias, so anything tested directly can import only
 * what Node can find. `types/index.ts` re-exports what belongs to the module's
 * vocabulary, which keeps the alias-free file the owner of the value.
 *
 * `lineTotal` deliberately mirrors
 * `LBTS-Backend/src/modules/labour-bill/labour-bill.constants.ts`. The server
 * is the source of truth — every stored total is written there — and this copy
 * exists so a cell shows its own total the instant it is typed, rather than
 * after a round trip to a sleeping Render instance.
 */

/**
 * A row's Total column: the Ven/Pulling/Labour cell plus the Floor cell, and
 * **null while neither has been typed**.
 *
 * A blank row and a row charged nothing are different statements — one is work
 * nobody has priced, the other a delivery that needed no help — so a Total of
 * zero must never stand for both. Typing `0` is how somebody says "nothing".
 */
export function lineTotal(
  labourAmount: number | null | undefined,
  floorAmount: number | null | undefined,
): number | null {
  if (labourAmount == null && floorAmount == null) {
    return null
  }
  return (labourAmount ?? 0) + (floorAmount ?? 0)
}

/** True for a row nobody has priced yet — neither cell typed. */
export function isUnpricedLabourLine(line: {
  labourAmount: number | null | undefined
  floorAmount: number | null | undefined
}): boolean {
  return line.labourAmount == null && line.floorAmount == null
}

/**
 * What an amount or floor cell should become when somebody stops typing.
 *
 * Three answers rather than two, because clearing a cell is a real correction
 * and is not the same as mistyping one: an empty box is `null` — back to "not
 * typed" — a readable number is that number, and anything else is `invalid`,
 * which the cell refuses by putting back what was there before. Whole numbers
 * only, and never negative: this is taka out of a cash box and a floor of a
 * building, and neither goes below zero.
 */
export type CellValue = number | null
export type CellParse = { ok: true; value: CellValue } | { ok: false }

export function parseCellInput(raw: string, max: number): CellParse {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: true, value: null }
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false }
  }
  const value = Number(trimmed)
  if (!Number.isSafeInteger(value) || value > max) {
    return { ok: false }
  }
  return { ok: true, value }
}

/** A cell's value as the box shows it: an untyped cell is empty, never "0". */
export function cellText(value: number | null | undefined): string {
  return value == null ? '' : String(value)
}

/** What one CSD's section comes to. Mirrors `labourGroupTotals` on the server. */
export interface GroupTotals {
  rows: number
  challans: number
  qty: number
  labourTotal: number
  floorTotal: number
  totalAmount: number
  unpricedLines: number
}

export interface TotallableLine {
  challanId: string
  qty: number
  labourAmount: number | null
  floorAmount: number | null
}

/**
 * A section's figures, worked out from its rows.
 *
 * A mirror of the server's, for the same reason `lineTotal` is one: a cell is
 * written optimistically so it can be typed at spreadsheet speed, and the
 * section's foot has to move with it rather than a round trip later. The
 * server's arithmetic is still the one that is stored — this only keeps the
 * screen honest between the keystroke and the answer.
 */
export function groupTotalsOf(lines: readonly TotallableLine[]): GroupTotals {
  const labourTotal = lines.reduce((sum, line) => sum + (line.labourAmount ?? 0), 0)
  const floorTotal = lines.reduce((sum, line) => sum + (line.floorAmount ?? 0), 0)

  return {
    rows: lines.length,
    challans: new Set(lines.map((line) => line.challanId)).size,
    qty: lines.reduce((sum, line) => sum + line.qty, 0),
    labourTotal,
    floorTotal,
    totalAmount: labourTotal + floorTotal,
    unpricedLines: lines.filter((line) => lineTotal(line.labourAmount, line.floorAmount) === null)
      .length,
  }
}

export interface PlacedLine {
  id: string
  /** Rows the SL cell spans on its challan's first row; 0 on the rest of it. */
  slRowSpan: number
}

/**
 * Every row's challan group, as row ids, for the SL cell's "take this challan
 * off" button and for the sheet's banding.
 *
 * Read off `slRowSpan` rather than off the challan id, because the span is what
 * the server actually laid out — deriving the group a second way is how a
 * screen comes to disagree with the file it is previewing.
 */
export function groupLineIds<T extends PlacedLine>(lines: readonly T[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()

  lines.forEach((line, index) => {
    if (line.slRowSpan > 0) {
      const members = lines.slice(index, index + line.slRowSpan).map((member) => member.id)
      for (const id of members) {
        groups.set(id, members)
      }
    }
  })

  return groups
}

/** The years a slot offers, oldest first: two back, this one and next — and `current` if it is none of those. */
export function labourBillYearOptions(current: number, now: Date = new Date()): number[] {
  const year = now.getFullYear()
  return [...new Set([year - 2, year - 1, year, year + 1, current])].sort((a, b) => a - b)
}

/** `LBTS-WLB-2026-0007` read as `WLB-0007` where the year is already on screen. */
export function shortLabourBillNumber(billNumber: string): string {
  const match = /^LBTS-WLB-\d{4}-(\d+)$/.exec(billNumber)
  return match ? `WLB-${match[1]}` : billNumber
}
