/**
 * The quick date ranges the records page offers.
 *
 * Computed in the viewer's own calendar and sent as plain YYYY-MM-DD, because
 * a trip date is a calendar day rather than an instant — "today" has to mean
 * the day the operator is having, not a UTC window that starts at six in the
 * morning.
 */

export type QuickRange = 'today' | 'week' | 'month' | 'custom' | 'all'

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

  if (quick === 'week') {
    // Monday-first, which is how the depot week runs.
    const start = new Date(now)
    const offset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - offset)
    return { from: toIso(start), to: today }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toIso(start), to: today }
}

export const QUICK_RANGE_LABELS: Record<Exclude<QuickRange, 'custom'>, string> = {
  all: 'Any date',
  today: 'Today',
  week: 'This week',
  month: 'This month',
}

/** Which quick range a from/to pair corresponds to, if any. */
export function quickRangeFor(range: DateRange): QuickRange {
  if (!range.from && !range.to) {
    return 'all'
  }

  for (const quick of ['today', 'week', 'month'] as const) {
    const candidate = rangeFor(quick)
    if (candidate.from === range.from && candidate.to === range.to) {
      return quick
    }
  }

  return 'custom'
}
