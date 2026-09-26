import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { scanTripManifest } from '../api/delivery-api'
import { normalizeScan } from '@/lib/barcode-wedge'
import { shortTripNumber } from '../lib/delivery-meta'
import { scanTone } from '@/lib/scan-feedback'

/**
 * What happens when a **printed trip manifest** is read.
 *
 * Two sheets in this operation carry a barcode and an operator holds both. A
 * challan's back page means "this came back signed" and is answered by
 * `useReceiptScan`; a manifest means "open this trip", which is this. They are
 * told apart by the shape of the code (`isTripCode`), so the paper decides the
 * question rather than whichever page happened to be open — the same rule the
 * two server-side scan endpoints already keep.
 *
 * A trip already on screen is not reloaded: at a gate the same sheet gets
 * scanned twice more often than not, and a page that jumps for no reason is
 * worse than one that says it is already there.
 */
export function useTripScan(currentTripId?: string) {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const scan = useCallback(
    async (raw: string) => {
      const code = normalizeScan(raw)
      if (!code) {
        return
      }

      setPending(true)
      try {
        const trip = await scanTripManifest(code)
        scanTone('ok')

        const label = shortTripNumber(trip.tripNumber)
        if (trip.id === currentTripId) {
          toast.info(t('delivery.receipt.tripAlreadyOpen', { trip: label }))
          return
        }

        toast.success(t('delivery.receipt.tripOpened', { trip: label, vendor: trip.vendor.name }), {
          description: t('delivery.finder.tripOpenedNote', {
            plate: trip.vehicle.registrationNo,
            driver: trip.driver.name,
          }),
        })
        navigate(`/delivery/${trip.id}`)
      } catch (error) {
        // A manifest from a trip that has since been deleted is an ordinary
        // answer, said beside the scanner rather than raised as a fault.
        scanTone('warn')
        toast.error((error as ApiError).message)
      } finally {
        setPending(false)
      }
    },
    [navigate, currentTripId],
  )

  return { scan, pending }
}
