import type { VendorTripRecord } from '../types'

/** The trip's bill less the advances paid against it. */
export const netOf = (trip: VendorTripRecord): number => trip.bill - trip.advance

/** Challans finished out of the trip's total, for the status badge. */
export const tripProgress = (trip: VendorTripRecord): { done: number; total: number } => ({
  done: trip.completedChallans,
  total: trip.challanCount,
})
