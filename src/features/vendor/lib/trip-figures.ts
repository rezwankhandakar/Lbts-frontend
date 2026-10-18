import type { Translator } from '@/lib/i18n'
import type { VendorTripRecord } from '../types'

/** The trip's bill less the advances paid against it. */
export const netOf = (trip: VendorTripRecord): number => trip.bill - trip.advance

/** Challans finished out of the trip's total, for the status badge. */
export const tripProgress = (trip: VendorTripRecord): { done: number; total: number } => ({
  done: trip.completedChallans,
  total: trip.challanCount,
})

/**
 * What is still owed, read without a sign: "Due" and the amount while anything
 * is owed or nothing is, "Paid ahead" and the amount when advances and payments
 * ran past the bill. A minus sign is the one thing nobody should have to read
 * off a figure about their own money.
 */
export function dueReading(
  due: number,
  t: Translator,
): { label: string; amount: number; tone: string } {
  if (due < 0) {
    return { label: t('vendor.trip.paidAhead'), amount: -due, tone: 'text-tone-amber' }
  }
  return {
    label: t('vendor.trip.due'),
    amount: due,
    tone: due > 0 ? 'text-tone-rose' : 'text-tone-emerald',
  }
}
