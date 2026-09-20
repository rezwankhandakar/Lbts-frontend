import { useCallback } from 'react'
import { normalizeScan } from '@/lib/barcode-wedge'
import { scanTone } from '@/lib/scan-feedback'
import { useScanOntoLabourBill } from './use-labour-bill-mutations'

/**
 * What happens when a challan's barcode is read onto a labour bill.
 *
 * It asks a third question of the same sheet of paper. On the cart a scan means
 * "put this on a lorry"; on the deliveries list it means "this came back
 * signed"; here it means **"charge what it cost to carry this in"**, and the
 * answer is every model on the challan, each as its own row waiting for an
 * amount.
 *
 * Two tones, for the reason Delivery gives: an operator working through a stack
 * is looking at the paper rather than the screen, and a handheld scanner's own
 * beep only says a barcode was *read* — not that it was a challan, and not that
 * it was not already on the sheet.
 */
export function useLabourBillScan(billId: string): {
  scan: (raw: string) => void
  pending: boolean
} {
  const mutation = useScanOntoLabourBill()
  const { mutate, isPending } = mutation

  const scan = useCallback(
    (raw: string) => {
      const code = normalizeScan(raw)
      if (!code || isPending) {
        return
      }

      mutate(
        { id: billId, code },
        {
          // A challan already on the sheet is the ordinary outcome of scanning a
          // stack twice, so it gets the "not that" tone rather than the "added"
          // one — the same distinction the cart makes.
          onSuccess: (result) => scanTone(result.added.length > 0 ? 'ok' : 'warn'),
          onError: () => scanTone('warn'),
        },
      )
    },
    [billId, isPending, mutate],
  )

  return { scan, pending: isPending }
}
