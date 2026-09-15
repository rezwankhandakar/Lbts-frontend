import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { scanReceipt } from '../api/delivery-api'
import { normalizeScan } from '../lib/barcode-wedge'
import { shortTripNumber } from '../lib/delivery-meta'
import { scanTone } from '../lib/scan-feedback'
import type { TripRecord } from '../types'

interface ReceiptScanOptions {
  /** The trip on screen, so a challan it carries opens without a request. */
  trip?: TripRecord
  /** The challan already open, so scanning it again does not reload the page. */
  currentChallanId?: string
}

/**
 * What happens when a **signed challan copy** that came back off a lorry is
 * read — on the deliveries list, a trip's page, or a delivery's own page.
 *
 * The barcode on a challan's back page is its challan number, so this is an
 * exact lookup — and it asks the opposite question to the cart's scan. There,
 * a scan means "put this on a lorry" and the answer is what is still to go;
 * here it means "this came back", and the answer is which delivery it is the
 * receipt for.
 *
 * On a trip's page the challan is usually one of the trip's own, so that is
 * checked first and opened with no round trip — the lookup is only for a sheet
 * that belongs to some other lorry. A hit navigates straight to that delivery,
 * which is the whole point: scan, record, scan the next.
 */
export function useReceiptScan({ trip, currentChallanId }: ReceiptScanOptions = {}) {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const scan = useCallback(
    async (raw: string) => {
      const code = normalizeScan(raw)
      if (!code) {
        return
      }

      const local = trip?.challans?.find(
        (challan) =>
          challan.challanNumber.toUpperCase() === code || String(challan.slNumber) === code,
      )

      if (trip && local) {
        scanTone('ok')
        if (local.challanId === currentChallanId) {
          toast.info(`${local.challanNumber} is already open`)
          return
        }
        toast.success(`${local.challanNumber} on ${shortTripNumber(trip.tripNumber)}`)
        navigate(`/delivery/${trip.id}/challans/${local.challanId}`)
        return
      }

      setPending(true)
      try {
        const result = await scanReceipt(code)
        scanTone('ok')

        const tripLabel = shortTripNumber(result.trip.tripNumber)
        toast.success(`${result.challanNumber} on ${tripLabel}`, {
          description:
            result.otherTrips.length > 0
              ? `It also went out on ${result.otherTrips
                  .map((other) => shortTripNumber(other.tripNumber))
                  .join(', ')}.`
              : undefined,
        })

        navigate(`/delivery/${result.trip.id}/challans/${result.challanId}`)
      } catch (error) {
        // A barcode that is not a challan — a gate pass, a product, a smudge —
        // is an ordinary answer, said beside the scanner rather than as a fault.
        scanTone('warn')
        toast.error((error as ApiError).message)
      } finally {
        setPending(false)
      }
    },
    [navigate, trip, currentChallanId],
  )

  return { scan, pending }
}
