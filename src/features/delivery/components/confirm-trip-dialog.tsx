import { Loader2, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import type { TripWorkspace } from '../hooks/use-trip-workspace'
import { challanChanges } from '../lib/cart'
import { ChallanChangeNotice } from './challan-change-notice'
import { shortTripNumber } from '../lib/delivery-meta'
import { SummaryFigures } from './summary-figures'
import { useT } from '@/lib/i18n'

interface ConfirmTripDialogProps {
  workspace: TripWorkspace
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The last look before a trip is numbered.
 *
 * Everything on it has already been visible in the cart; this repeats the
 * parts that are expensive to get wrong — which lorry, whose serial, who
 * drives, which day — beside the counts, and says plainly that the number
 * spent now is not given back.
 */
export function ConfirmTripDialog({ workspace, open, onOpenChange, onConfirm }: ConfirmTripDialogProps) {
  const t = useT()

  const { vehicle, driver, cart, editing, isSaving, tripDate } = workspace
  if (!vehicle || !driver) {
    return null
  }

  const override = vehicle.currentDriver !== null && vehicle.currentDriver.id !== driver.id

  /**
   * The challans this trip rewrites. Shown here as well as on each card,
   * because this is the press that makes it permanent — and because a
   * correction is easy to make without noticing while trimming quantities.
   */
  const corrections = cart.state.challans
    .map((challan) => ({ challan, changes: challanChanges(challan) }))
    .filter((entry) => entry.changes.length > 0)
  const rows: [string, string][] = [
    ['Vehicle', vehicle.vehicle.registrationNo],
    ['Vendor', `${vehicle.vendor.name} (${vehicle.vendor.vendorCode})`],
    ['Driver', `${driver.name} · ${driver.mobile}`],
    [t('delivery.summary.tripDate'), formatDay(tripDate)],
  ]

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? t('delivery.confirm.saveTitle', { trip: shortTripNumber(editing.tripNumber) })
              : t('delivery.confirm.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? t('delivery.confirm.saveDescription')
              : t('delivery.confirm.createDescription', { vendor: vehicle.vendor.name })}
          </DialogDescription>
        </DialogHeader>

        <dl className="divide-y rounded-lg border text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 px-3 py-2">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium wrap-break-word">{value}</dd>
            </div>
          ))}
        </dl>

        <SummaryFigures summary={cart.summary} />

        {corrections.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {corrections.map(({ challan, changes }) => (
              <ChallanChangeNotice
                key={challan.challanId}
                challanNumber={challan.challanNumber}
                changes={changes}
              />
            ))}
          </div>
        )}

        {override && (
          <p className="text-xs text-muted-foreground">
            {driver.name} drives this trip in place of {vehicle.currentDriver?.name}, who stays the
            vehicle&apos;s assigned driver.
          </p>
        )}
        {driver.licenceStatus === 'Expired' && (
          <p className="flex items-start gap-1.5 text-xs text-tone-rose">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {driver.name}&apos;s licence has expired.
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
            {t('delivery.confirm.backToCart')}
          </Button>
          <Button type="button" disabled={isSaving} onClick={onConfirm}>
            {isSaving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Send data-icon="inline-start" aria-hidden />
            )}
            {editing ? t('delivery.confirm.saveTrip') : t('delivery.confirm.confirmDelivery')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
