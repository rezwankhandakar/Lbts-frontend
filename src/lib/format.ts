/**
 * Date, time and money presentation for the whole app.
 *
 * **The implementation moved to `lib/i18n/format.ts` when the app learned a
 * second language, and this file is deliberately still here.** Fifty-three
 * files import `@/lib/format`, and every one of them wants exactly what it
 * always wanted — the viewer's date, the viewer's grouping, the taka sign. What
 * changed is that "the viewer's" now means the chosen locale rather than the
 * browser's, and that is a fact about the formatter rather than about any of
 * its callers. Re-pointing one module beats editing fifty-three.
 *
 * Two things are worth knowing about what the move bought:
 *
 *  - **English is unchanged.** It still formats against the browser's own
 *    locale, exactly as the `Intl` formatters here did before. Nothing on an
 *    English screen moved by a character.
 *  - **Bangla is `Intl`'s, not a transliteration.** `bn-BD` produces Bengali
 *    digits, Bengali month names and the lakh grouping — ১,৫০,০০০ rather than
 *    ১৫০,০০০ — so `২৪ সেপ, ২০২৬` and `৳১,৫০,০০০` come out of the platform
 *    rather than out of a string replacement this app would have had to get
 *    right on its own.
 *
 * **Inside a component, prefer `useFormatters()` from `@/lib/i18n`.** The
 * functions below read the locale at call time, which is right for a print
 * helper or a toast and not enough for a rendered cell: nothing subscribes, so
 * a component that *only* formatted would keep its old digits after a language
 * switch. A component that also translates text is already subscribed through
 * `useT()` and is fine either way — which is why a file is translated as a
 * whole rather than a line at a time.
 */
export {
  BLANK,
  formatDate,
  formatDateTime,
  formatTime,
  formatMonthYear,
  formatPeriod,
  formatShortPeriod,
  monthName,
  shortMonthName,
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

export type { Formatters } from '@/lib/i18n/format'
