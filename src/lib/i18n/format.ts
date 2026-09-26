import { useMemo } from 'react'
import { currentLocale, useLocaleStore } from '@/lib/i18n/locale-store'
import type { Locale } from '@/lib/i18n/locales'
import { MESSAGES } from '@/lib/i18n/messages'
import { DEFAULT_LOCALE } from '@/lib/i18n/locales'
import { translateKey } from '@/lib/i18n/translate'
import { shapeDigits } from '@/lib/i18n/numerals'

/**
 * Locale-aware date, time and money formatting.
 *
 * The decision that shapes the whole file: **`Intl` is asked for Bangla rather
 * than told it.** `bn-BD` already produces Bengali digits, Bengali month names
 * and the Bangladeshi lakh grouping — ১,৫০,০০০ rather than ১৫০,০০০ — so
 * transliterating digits by hand afterwards would be a second, worse
 * implementation of something the platform gets right. `numerals.ts` stays for
 * the case `Intl` cannot cover: a string this app builds itself, where a count
 * was concatenated rather than formatted.
 *
 * English is deliberately left on the **browser's own locale**, exactly as
 * `lib/format.ts` had it before this module existed. Pinning it to a tag would
 * silently re-order every date on every English screen in the app, which is a
 * change nobody asked for and one no test would catch.
 *
 * Every formatter is cached per locale. `Intl.DateTimeFormat` is expensive to
 * construct and a records sheet builds one per cell otherwise — which on a
 * five-hundred-row Trip DO page is measurable.
 */

/** The tag handed to `Intl`. `undefined` means "whatever the browser is". */
function intlTag(locale: Locale): string | undefined {
  return locale === 'bn' ? 'bn-BD' : undefined
}

/** The tag for *numbers*, where English is pinned so lakh grouping survives. */
function numberTag(locale: Locale): string {
  return locale === 'bn' ? 'bn-BD' : 'en-BD'
}

type FormatterCache<T> = Partial<Record<Locale, T>>

function cached<T>(store: FormatterCache<T>, locale: Locale, build: () => T): T {
  const existing = store[locale]
  if (existing) {
    return existing
  }

  const created = build()
  store[locale] = created
  return created
}

const DATE = {} as FormatterCache<Intl.DateTimeFormat>
const DAY_LONG = {} as FormatterCache<Intl.DateTimeFormat>
const MONTH_YEAR = {} as FormatterCache<Intl.DateTimeFormat>
const TIME = {} as FormatterCache<Intl.DateTimeFormat>
const DATE_TIME = {} as FormatterCache<Intl.DateTimeFormat>
const RELATIVE = {} as FormatterCache<Intl.RelativeTimeFormat>
const NUMBER = {} as FormatterCache<Intl.NumberFormat>
const CALENDAR_DAY = {} as FormatterCache<Intl.DateTimeFormat>

const dateFormat = (locale: Locale) =>
  cached(DATE, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), { day: 'numeric', month: 'short', year: 'numeric' }),
  )

/**
 * A **calendar day**, read at UTC.
 *
 * A trip date is a day rather than a moment: the server stores it at UTC
 * midnight and serialises it as `YYYY-MM-DD`, so formatting it in the viewer's
 * own zone would date a gate pass to the day before for anybody west of
 * Greenwich. Everything else on a record is an instant and uses `formatDate`.
 */
const calendarDayFormat = (locale: Locale) =>
  cached(CALENDAR_DAY, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  )

/** "Monday, 21 September" — the dashboard's date line. */
const dayLongFormat = (locale: Locale) =>
  cached(DAY_LONG, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  )

const monthYearFormat = (locale: Locale) =>
  cached(MONTH_YEAR, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), { month: 'short', year: 'numeric' }),
  )

const timeFormat = (locale: Locale) =>
  cached(TIME, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), { hour: 'numeric', minute: '2-digit' }),
  )

const dateTimeFormat = (locale: Locale) =>
  cached(DATE_TIME, locale, () =>
    new Intl.DateTimeFormat(intlTag(locale), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  )

const relativeFormat = (locale: Locale) =>
  cached(RELATIVE, locale, () =>
    new Intl.RelativeTimeFormat(intlTag(locale), { numeric: 'auto' }),
  )

/**
 * Whole taka by default and decimals only where a figure has them — the rule
 * `lib/format.ts` already stated: every rate on the supplied card is a whole
 * number and `৳650.00` on a page of them is noise, while a tiered line that
 * works out fractional still has to be readable.
 */
const numberFormat = (locale: Locale) =>
  cached(NUMBER, locale, () =>
    new Intl.NumberFormat(numberTag(locale), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
  )

/** The em dash a blank renders as, everywhere in the app. */
export const BLANK = '—'
/** The taka sign. */
const TAKA = '৳'

function word(locale: Locale, key: string, values?: Record<string, string | number>): string {
  return translateKey(MESSAGES[locale], MESSAGES[DEFAULT_LOCALE], key, values)
}

/*
 * The exported formatters below take an optional locale so a caller that
 * already has one — a React component holding `useTranslation()` — can pass it
 * and skip the store read. Omitted, they read the store, which is what makes
 * them safe to call from a print helper or a toast.
 */

export function formatDate(iso: string | null | undefined, locale?: Locale): string {
  if (!iso) {
    return BLANK
  }
  return dateFormat(locale ?? currentLocale()).format(new Date(iso))
}

/** "3 Sep 2026" from a `YYYY-MM-DD` day, never shifted by a timezone. */
export function formatCalendarDay(value: string | null | undefined, locale?: Locale): string {
  if (!value) {
    return BLANK
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(date.getTime())
    ? value
    : calendarDayFormat(locale ?? currentLocale()).format(date)
}

export function formatDateTime(iso: string | null | undefined, locale?: Locale): string {
  if (!iso) {
    return BLANK
  }
  return dateTimeFormat(locale ?? currentLocale()).format(new Date(iso))
}

export function formatTime(iso: string | null | undefined, locale?: Locale): string {
  if (!iso) {
    return BLANK
  }
  return timeFormat(locale ?? currentLocale()).format(new Date(iso))
}

/**
 * "Monday, 21 September" — a day named rather than numbered, for a line
 * somebody reads once at the top of a page rather than scans down a column.
 */
export function formatDayLong(value: Date, locale?: Locale): string {
  return dayLongFormat(locale ?? currentLocale()).format(value)
}

/** "Sep 2026" — where only the month a thing belongs to matters. */
export function formatMonthYear(iso: string | null | undefined, locale?: Locale): string {
  if (!iso) {
    return BLANK
  }
  return monthYearFormat(locale ?? currentLocale()).format(new Date(iso))
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

/** "3 days ago" — where recency matters more than the exact timestamp. */
export function formatRelative(iso: string | null | undefined, locale?: Locale): string {
  const active = locale ?? currentLocale()

  if (!iso) {
    return word(active, 'time.never')
  }

  const elapsed = new Date(iso).getTime() - Date.now()

  for (const [unit, ms] of UNITS) {
    if (Math.abs(elapsed) >= ms) {
      return relativeFormat(active).format(Math.round(elapsed / ms), unit)
    }
  }

  return word(active, 'time.justNow')
}

/**
 * "Today, 7:15 PM" for the last day or two, the full date and time before that.
 * A recent timestamp is read as "when today", an older one as "which day" —
 * the rule `lib/format.ts` established, kept verbatim.
 */
export function formatSmartDateTime(iso: string | null | undefined, locale?: Locale): string {
  const active = locale ?? currentLocale()

  if (!iso) {
    return word(active, 'common.states.notAvailable')
  }

  const value = new Date(iso)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const dayDifference = Math.floor((startOfToday.getTime() - value.getTime()) / 86_400_000)
  const time = timeFormat(active).format(value)

  if (value.getTime() >= startOfToday.getTime()) {
    return word(active, 'time.todayAt', { time })
  }

  if (dayDifference < 1) {
    return word(active, 'time.yesterdayAt', { time })
  }

  return dateTimeFormat(active).format(value)
}

const MONTH_NAMES_CACHE = {} as FormatterCache<string[]>
const SHORT_MONTH_CACHE = {} as FormatterCache<string[]>

/**
 * The twelve month names, in the reader's language.
 *
 * Three modules — the Excel Bill, the Labour Bill and Accounts — each kept a
 * hard-coded English array, and a month is a **name** rather than a number
 * everywhere the office talks about one. Asking `Intl` for it once here is
 * what makes "September 2026" become "সেপ্টেম্বর ২০২৬" without any of the
 * three learning about the other two.
 *
 * Built from a fixed year's twelve months rather than from today, so the list
 * cannot shift under a caller that holds it across a year boundary.
 */
function monthNamesFor(locale: Locale, short: boolean): string[] {
  const cache = short ? SHORT_MONTH_CACHE : MONTH_NAMES_CACHE

  return cached(cache, locale, () => {
    const format = new Intl.DateTimeFormat(intlTag(locale), { month: short ? 'short' : 'long' })
    return Array.from({ length: 12 }, (_, index) => format.format(new Date(Date.UTC(2020, index, 1))))
  })
}

export function monthNames(locale?: Locale): string[] {
  return monthNamesFor(locale ?? currentLocale(), false)
}

/** One month by its 1-based number, the way every caller here holds it. */
export function monthName(month: number, locale?: Locale): string {
  return monthNames(locale)[month - 1] ?? ''
}

export function shortMonthName(month: number, locale?: Locale): string {
  return monthNamesFor(locale ?? currentLocale(), true)[month - 1] ?? ''
}

/** "September 2026" — a billing month, as the office names one. */
export function formatPeriod(month: number, year: number, locale?: Locale): string {
  const active = locale ?? currentLocale()
  // The year is shaped digit by digit rather than grouped: `2,026` is not a year.
  return `${monthName(month, active)} ${shapeDigits(String(year), active)}`.trim()
}

/** "Sep 26" — the same month where a column has no room for the whole of it. */
export function formatShortPeriod(month: number, year: number, locale?: Locale): string {
  const active = locale ?? currentLocale()
  return `${shortMonthName(month, active)} ${shapeDigits(String(year).slice(2), active)}`.trim()
}

/** A plain number, grouped the Bangladeshi way. */
export function formatNumber(
  value: number | null | undefined,
  locale?: Locale,
): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? numberFormat(locale ?? currentLocale()).format(value)
    : BLANK
}

/**
 * "03" — a zero-padded position, in the viewer's own digits.
 *
 * Padding has to happen *before* the digits are shaped, or the zero stays
 * Latin beside a Bengali numeral: `formatNumber(3).padStart(2, '0')` gives
 * "0৩". Grouping is deliberately absent — this is an index, not a quantity.
 */
export function formatPadded(value: number, width: number, locale?: Locale): string {
  return shapeDigits(String(value).padStart(width, '0'), locale ?? currentLocale())
}

/** Money, with the taka sign. */
export function formatTaka(amount: number | null | undefined, locale?: Locale): string {
  return typeof amount === 'number' && Number.isFinite(amount)
    ? TAKA + numberFormat(locale ?? currentLocale()).format(amount)
    : BLANK
}

/** The same figure without the sign, for a cell that already carries one. */
export function formatAmount(amount: number | null | undefined, locale?: Locale): string {
  return typeof amount === 'number' && Number.isFinite(amount)
    ? numberFormat(locale ?? currentLocale()).format(amount)
    : BLANK
}

/** A share, for a progress reading. */
export function formatPercent(
  value: number | null | undefined,
  locale?: Locale,
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return BLANK
  }
  return `${numberFormat(locale ?? currentLocale()).format(Math.round(value))}%`
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

/** "4.2 MB" — for an upload limit and for what somebody just attached. */
export function formatFileSize(bytes: number | null | undefined, locale?: Locale): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return BLANK
  }

  let size = bytes
  let unit = 0

  while (size >= 1024 && unit < SIZE_UNITS.length - 1) {
    size /= 1024
    unit += 1
  }

  const rounded = unit === 0 ? Math.round(size) : Math.round(size * 10) / 10
  return `${numberFormat(locale ?? currentLocale()).format(rounded)} ${SIZE_UNITS[unit]}`
}

export interface Formatters {
  date: (iso: string | null | undefined) => string
  calendarDay: (value: string | null | undefined) => string
  dateTime: (iso: string | null | undefined) => string
  time: (iso: string | null | undefined) => string
  monthYear: (iso: string | null | undefined) => string
  dayLong: (value: Date) => string
  relative: (iso: string | null | undefined) => string
  smartDateTime: (iso: string | null | undefined) => string
  number: (value: number | null | undefined) => string
  taka: (value: number | null | undefined) => string
  amount: (value: number | null | undefined) => string
  percent: (value: number | null | undefined) => string
  fileSize: (value: number | null | undefined) => string
}

/**
 * The reactive way to format inside a component.
 *
 * The module-level functions above read the store at call time, which is right
 * for a print helper and wrong for a rendered cell: nothing subscribes, so a
 * component that only formatted would keep its old digits after a language
 * switch. This hook subscribes, so a component holding it re-renders and
 * reformats with the rest of the page.
 */
export function useFormatters(): Formatters {
  const locale = useLocaleStore((state) => state.locale)

  return useMemo<Formatters>(
    () => ({
      date: (iso) => formatDate(iso, locale),
      calendarDay: (value) => formatCalendarDay(value, locale),
      dateTime: (iso) => formatDateTime(iso, locale),
      time: (iso) => formatTime(iso, locale),
      monthYear: (iso) => formatMonthYear(iso, locale),
      dayLong: (value) => formatDayLong(value, locale),
      relative: (iso) => formatRelative(iso, locale),
      smartDateTime: (iso) => formatSmartDateTime(iso, locale),
      number: (value) => formatNumber(value, locale),
      taka: (value) => formatTaka(value, locale),
      amount: (value) => formatAmount(value, locale),
      percent: (value) => formatPercent(value, locale),
      fileSize: (value) => formatFileSize(value, locale),
    }),
    [locale],
  )
}
