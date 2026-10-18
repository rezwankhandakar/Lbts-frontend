/**
 * Which months a vendor's bill covers, worked out from the trip list's two
 * dates.
 *
 * The server adds the bill up over exactly these months — see
 * `vendorMonthlyBill` in `accounts/vendor-trip-money.ts`, which this mirrors —
 * and it sends a label with it, but in English. A vendor account opens in
 * Bangla, so the screen names the months itself from the same arithmetic
 * rather than printing "October 2026" inside a Bangla page.
 *
 * Import-free, so `node --test` loads it.
 */

export interface BillMonth {
  year: number
  /** 1–12. */
  month: number
}

export type BillPeriod =
  | { kind: 'all' }
  | { kind: 'months'; first: BillMonth; last: BillMonth }

function monthOf(day: string): BillMonth {
  return { year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)) }
}

function indexOf(month: BillMonth): number {
  return month.year * 12 + (month.month - 1)
}

/**
 * The months a range touches. No dates is every month. An open end reaches as
 * far as the other, and an open `to` runs on to `today` — "from September"
 * alone is September up to now. A range that runs backwards names the month it
 * starts in, which is what the server's label does.
 */
export function billPeriodOf(from: string, to: string, today: string): BillPeriod {
  if (!from && !to) {
    return { kind: 'all' }
  }

  const first = monthOf(from || to || today)
  const last = monthOf(to || today)

  return { kind: 'months', first, last: indexOf(last) > indexOf(first) ? last : first }
}

/** True when the period is one calendar month. */
export function isSingleMonth(period: BillPeriod): boolean {
  return period.kind === 'months' && indexOf(period.first) === indexOf(period.last)
}
