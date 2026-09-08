import { formatAmount, formatTaka } from '@/lib/format'
import type { Rate } from '../types'

/**
 * Rendering a rate.
 *
 * A tiered rate is the only value in this app that cannot be shown as a
 * number, so it needs both a short form for a table cell and a long one for
 * the place somebody is deciding whether it is right. Keeping both here is
 * what stops a table and a dialog quietly describing the same figure two
 * different ways.
 */

/** "৳650" or "৳60 / ৳24" — short enough for a column. */
export function rateLabel(rate: Rate | null): string {
  if (!rate) {
    return '—'
  }

  return rate.kind === 'flat'
    ? formatTaka(rate.amount)
    : `${formatTaka(rate.firstAmount)} / ${formatTaka(rate.restAmount)}`
}

/**
 * The same rate as a sentence. Used wherever the short form would be a riddle
 * — a details page, a tooltip, the confirmation before a charge is saved.
 */
export function rateDescription(rate: Rate | null): string {
  if (!rate) {
    return 'No rate set.'
  }

  if (rate.kind === 'flat') {
    return `${formatTaka(rate.amount)} per piece.`
  }

  return (
    `First ${rate.firstQty} ${rate.firstQty === 1 ? 'piece' : 'pieces'} on a challan at ` +
    `${formatTaka(rate.firstAmount)} each, then ${formatTaka(rate.restAmount)} each.`
  )
}

/**
 * What a rate charges for a given quantity, mirroring `lineAmount` on the
 * server.
 *
 * A preview only. Every figure a challan actually carries was computed and
 * stored by the API — this exists so the rate form can show what it is about
 * to mean, which is the difference between checking a tiered rate and
 * believing it.
 */
export function previewAmount(rate: Rate, qty: number): number {
  if (qty <= 0) {
    return 0
  }

  if (rate.kind === 'flat') {
    return Math.round(qty * rate.amount * 100) / 100
  }

  const atFirst = Math.min(qty, rate.firstQty)
  const atRest = qty - atFirst

  return Math.round((atFirst * rate.firstAmount + atRest * rate.restAmount) * 100) / 100
}

export { formatAmount, formatTaka }
