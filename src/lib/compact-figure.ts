import { formatNumber } from '@/lib/format'
import type { Translator } from '@/lib/i18n'

/**
 * A taka figure short enough for a chart axis: 12K, 1.5L, 2Cr — the local scale.
 *
 * Shared rather than copied, the rule CLAUDE.md sets for a helper a second
 * feature wants: the Accounts trend chart drew one and the vendor dashboard's
 * month chart drew a second, and a second copy of "when does a figure become
 * lakhs" is exactly the sort of thing that comes to disagree with the first —
 * one axis reading `1.5L` while the other reads `১.৫ লক্ষ`, on two charts of the
 * same money.
 *
 * The suffix is a **word**, not a symbol, which is why this takes a translator:
 * Bangla writes হাজার, লক্ষ and কোটি out, and a digit-shaped number beside a
 * Latin `L` is the half-translated state the whole i18n layer exists to avoid.
 */
export function formatCompact(value: number, t: Translator): string {
  if (value >= 10_000_000) {
    return t('common.compact.crore', { value: shorten(value, 10_000_000) })
  }
  if (value >= 100_000) {
    return t('common.compact.lakh', { value: shorten(value, 100_000) })
  }
  if (value >= 1000) {
    return t('common.compact.thousand', { value: formatNumber(Math.round(value / 1000)) })
  }
  return formatNumber(value)
}

/** One decimal place, and none at all when the figure is exact. */
function shorten(value: number, unit: number): string {
  const scaled = value / unit
  return formatNumber(value % unit === 0 ? scaled : Math.round(scaled * 10) / 10)
}
