import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { countOf, t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { scanChallan } from '../api/delivery-api'
import { isFullyDispatched } from '../lib/cart'
import { shortTripNumber } from '../lib/delivery-meta'
import { normalizeScan } from '@/lib/barcode-wedge'
import { scanTone } from '@/lib/scan-feedback'
import type { CartState, ChallanCandidate } from '../types'

export type ScanOutcome =
  | { kind: 'added'; code: string; candidate: ChallanCandidate }
  | { kind: 'duplicate'; code: string; challanNumber: string }
  | { kind: 'dispatched'; code: string; candidate: ChallanCandidate }
  | { kind: 'missing'; code: string; message: string }

interface ChallanScanArgs {
  cart: CartState
  add: (candidate: ChallanCandidate) => void
  excludeTripId?: string
}

/**
 * What happens when a printed challan's barcode is read.
 *
 * The barcode on the back page is the challan number — so this is an exact
 * lookup, never a search, and it answers in four ways, each with its own tone
 * so an operator looking at the paper rather than the screen knows which:
 *
 * - found and not on this trip → added, with what is still to go;
 * - already on this trip → nothing changes, and it says so;
 * - fully sent on other trips → not added, with an "Add anyway" for a real
 *   re-delivery;
 * - not a challan → said beside the scanner, not raised as a fault.
 */
export function useChallanScan({ cart, add, excludeTripId }: ChallanScanArgs) {
  const [pending, setPending] = useState(false)
  const [last, setLast] = useState<ScanOutcome | null>(null)

  const scan = useCallback(
    async (raw: string) => {
      const code = normalizeScan(raw)
      if (!code) {
        return
      }

      const already = cart.challans.find(
        (challan) => challan.challanNumber === code || String(challan.slNumber) === code,
      )
      if (already) {
        scanTone('warn')
        setLast({ kind: 'duplicate', code, challanNumber: already.challanNumber })
        toast.info(t('delivery.finder.alreadyOn', { challan: already.challanNumber }))
        return
      }

      setPending(true)
      try {
        const candidate = await scanChallan(code, excludeTripId)

        if (cart.challans.some((challan) => challan.challanId === candidate.id)) {
          scanTone('warn')
          setLast({ kind: 'duplicate', code, challanNumber: candidate.challanNumber })
          toast.info(t('delivery.finder.alreadyOn', { challan: candidate.challanNumber }))
        } else if (isFullyDispatched(candidate)) {
          scanTone('warn')
          setLast({ kind: 'dispatched', code, candidate })
          toast.warning(t('delivery.finder.goneOutInFull', { challan: candidate.challanNumber }), {
            description: t('delivery.finder.onTrips', {
              trips: candidate.trips
                .map((trip) => shortTripNumber(trip.tripNumber))
                .join(', '),
            }),
            action: { label: t('delivery.finder.addAnyway'), onClick: () => add(candidate) },
          })
        } else {
          add(candidate)
          scanTone('ok')
          setLast({ kind: 'added', code, candidate })
          toast.success(t('delivery.finder.addedToast', { challan: candidate.challanNumber }), {
            description: t('delivery.finder.addedNote', {
              customer: candidate.customerName,
              pieces: countOf(candidate.remaining, 'nouns.pc', t),
            }),
          })
        }
      } catch (error) {
        const message = (error as ApiError).message
        scanTone('warn')
        setLast({ kind: 'missing', code, message })
        toast.error(message)
      } finally {
        setPending(false)
      }
    },
    [cart.challans, add, excludeTripId],
  )

  return { scan, pending, last }
}
