import { useCallback } from 'react'
import { isTripCode } from '@/lib/barcode-wedge'
import { useReceiptScan } from './use-receipt-scan'
import { useTripScan } from './use-trip-scan'
import type { TripRecord } from '../types'

interface SheetScanOptions {
  /** The trip on screen, so its own challans open without a request. */
  trip?: TripRecord
  /** The challan already open, so scanning it again does not reload the page. */
  currentChallanId?: string
}

/**
 * One scanner, two kinds of paper.
 *
 * There is a single wedge listening on a page, and by now two printed sheets
 * carry a barcode: a challan's back page, which means "this came back signed",
 * and a trip manifest, which means "open this trip". Which question is being
 * asked is decided by the **shape of the code** — `isTripCode`, pure and
 * tested — because the operator is pointing a scanner at paper, and the paper
 * is the only thing that knows.
 *
 * It exists as a hook rather than as three lines repeated on each page for the
 * usual reason: two copies of "which sheet is this" is how one of them comes
 * to route a manifest into the receipt lookup and report that no challan
 * carries the barcode.
 */
export function useSheetScan({ trip, currentChallanId }: SheetScanOptions = {}) {
  const receipt = useReceiptScan({ trip, currentChallanId })
  const manifest = useTripScan(trip?.id)

  const scanReceiptCode = receipt.scan
  const scanTripCode = manifest.scan

  const scan = useCallback(
    (raw: string) => {
      void (isTripCode(raw) ? scanTripCode(raw) : scanReceiptCode(raw))
    },
    [scanTripCode, scanReceiptCode],
  )

  return { scan, pending: receipt.pending || manifest.pending }
}
