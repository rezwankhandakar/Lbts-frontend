import { useCallback } from 'react'
import { normalizeScan } from '@/lib/barcode-wedge'
import { scanTone } from '@/lib/scan-feedback'
import { labourTabOfSection } from '../lib/labour-bill-math'
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
 *
 * `onLanded` is handed the unit tab the new rows were filed on, so the page can
 * open it: a WFR challan scanned while the WAC tab is showing would otherwise be
 * added somewhere off screen. Where one challan lands on two units, the first
 * in the sheet's own order is opened and the toast names both.
 */
export function useLabourBillScan(
  billId: string,
  onLanded?: (tab: string) => void,
): {
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
          onSuccess: (result) => {
            // A challan already on the sheet is the ordinary outcome of scanning
            // a stack twice, so it gets the "not that" tone rather than the
            // "added" one — the same distinction the cart makes.
            scanTone(result.added.length > 0 ? 'ok' : 'warn')

            const [first] = result.sections
            if (result.added.length > 0 && first !== undefined) {
              const tab = labourTabOfSection(result.detail.groups, first)
              if (tab !== null) {
                onLanded?.(tab)
              }
            }
          },
          onError: () => scanTone('warn'),
        },
      )
    },
    [billId, isPending, mutate, onLanded],
  )

  return { scan, pending: isPending }
}
