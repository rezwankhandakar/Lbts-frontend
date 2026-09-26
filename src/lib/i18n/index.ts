/**
 * The i18n surface the rest of the app imports from.
 *
 * One barrel rather than six deep paths, because every feature touches this and
 * `@/lib/i18n` reads as one thing. The files behind it stay separate for the
 * reason CLAUDE.md gives for `page-ranges.ts`: `translate.ts`, `numerals.ts` and
 * `locales.ts` are import-free so `node --test` can load them, and a barrel that
 * pulled React into them would take that away.
 */
export type { Locale, LocaleMeta } from '@/lib/i18n/locales'
export { LOCALES, LOCALE_ORDER, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale, otherLocale } from '@/lib/i18n/locales'

export type { InterpolationValues, PluralMessage, MessageTree } from '@/lib/i18n/translate'

export type { Messages, TranslationKey } from '@/lib/i18n/messages'

export { useLocaleStore, applyLocale, currentLocale } from '@/lib/i18n/locale-store'

export type { Translator, UseTranslation } from '@/lib/i18n/use-t'
export type { Formatters } from '@/lib/i18n/format'
export { useTranslation, useT, t, countOf } from '@/lib/i18n/use-t'

export { toBengaliDigits, toLatinDigits, hasBengaliDigits, shapeDigits } from '@/lib/i18n/numerals'

export {
  formatDate,
  formatDateTime,
  formatTime,
  formatMonthYear,
  monthNames,
  monthName,
  shortMonthName,
  formatPeriod,
  formatShortPeriod,
  formatDayLong,
  formatRelative,
  formatSmartDateTime,
  formatNumber,
  formatPadded,
  formatTaka,
  formatAmount,
  formatCalendarDay,
  formatPercent,
  formatFileSize,
  useFormatters,
} from '@/lib/i18n/format'
