/**
 * Date and time presentation for the whole app. Lives in lib/ rather than in
 * one feature because administration and profile both render the same account
 * timestamps — two copies would eventually disagree about what "3 days ago"
 * looks like.
 *
 * Every formatter takes the ISO string the API returns and renders in the
 * viewer's own locale and timezone.
 */
const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** "Sep 2026" — for a membership date, where the day adds nothing. */
const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  year: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

export function formatDate(iso: string | null): string {
  return iso ? DATE_FORMAT.format(new Date(iso)) : '—'
}

export function formatDateTime(iso: string | null): string {
  return iso ? DATE_TIME_FORMAT.format(new Date(iso)) : '—'
}

/** "3 days ago" — used where recency matters more than the exact timestamp. */
export function formatRelative(iso: string | null): string {
  if (!iso) {
    return 'Never'
  }

  const elapsed = new Date(iso).getTime() - Date.now()

  for (const [unit, ms] of UNITS) {
    if (Math.abs(elapsed) >= ms) {
      return RELATIVE_FORMAT.format(Math.round(elapsed / ms), unit)
    }
  }

  return 'Just now'
}

/** "Sep 2026". Used where only the month a person joined matters. */
export function formatMonthYear(iso: string | null): string {
  return iso ? MONTH_YEAR_FORMAT.format(new Date(iso)) : '—'
}

/**
 * "Today, 7:15 PM" for the last day or two, the full date and time before
 * that. A recent timestamp is read as "when today", an older one as "which
 * day" — this renders whichever question the reader is actually asking.
 */
export function formatSmartDateTime(iso: string | null): string {
  if (!iso) {
    return 'Not available'
  }

  const value = new Date(iso)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const dayDifference = Math.floor((startOfToday.getTime() - value.getTime()) / 86_400_000)

  if (value.getTime() >= startOfToday.getTime()) {
    return `Today, ${TIME_FORMAT.format(value)}`
  }

  if (dayDifference < 1) {
    return `Yesterday, ${TIME_FORMAT.format(value)}`
  }

  return DATE_TIME_FORMAT.format(value)
}
