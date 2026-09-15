/**
 * The quick date ranges the records page offers.
 *
 * Computed in the viewer's own calendar and sent as plain YYYY-MM-DD, because
 * a trip date is a calendar day rather than an instant — "today" has to mean
 * the day the operator is having, not a UTC window that starts at six in the
 * morning.
 */

export type QuickRange = 'today' | 'month' | 'lastMonth' | 'custom' | 'all'

export interface DateRange {
  from: string
  to: string
}

function toIso(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function rangeFor(quick: Exclude<QuickRange, 'custom' | 'all'>): DateRange {
  const now = new Date()
  const today = toIso(now)

  if (quick === 'today') {
    return { from: today, to: today }
  }

  /**
   * A whole calendar month that has already closed, which is the range every
   * month-end reconciliation is run over. It ends on the last day of that
   * month rather than today: day 0 of this month is the last day of the one
   * before it, whatever length that month happened to be.
   */
  if (quick === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: toIso(start), to: toIso(end) }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toIso(start), to: today }
}

export const QUICK_RANGE_LABELS: Record<Exclude<QuickRange, 'custom'>, string> = {
  all: 'Any date',
  today: 'Today',
  month: 'This month',
  lastMonth: 'Last month',
}

/** Which quick range a from/to pair corresponds to, if any. */
export function quickRangeFor(range: DateRange): QuickRange {
  if (!range.from && !range.to) {
    return 'all'
  }

  for (const quick of ['today', 'month', 'lastMonth'] as const) {
    const candidate = rangeFor(quick)
    if (candidate.from === range.from && candidate.to === range.to) {
      return quick
    }
  }

  return 'custom'
}
