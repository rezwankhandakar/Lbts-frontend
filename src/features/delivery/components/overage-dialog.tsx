import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { TripOverage } from '../types'

interface OverageDialogProps {
  overages: TripOverage[] | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * The server's question: this trip would send more than the challan orders.
 *
 * Asked rather than refused, because a customer sent five against a challan
 * for four is a real thing that happens. But the far more common way to get
 * here is the same four refrigerators filed on two trips, so each line is
 * shown with all three numbers — ordered, already out, on this trip — and the
 * default button is the one that goes back.
 */
export function OverageDialog({ overages, isPending, onCancel, onConfirm }: OverageDialogProps) {
  return (
    <AlertDialog open={overages !== null} onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>More than the challan orders</AlertDialogTitle>
          <AlertDialogDescription>
            Check these lines against the load. Sending them anyway is allowed — the trip records
            what actually went — but it also <strong>raises the challan</strong> to match, so a
            quantity typed by mistake would rewrite the office&apos;s record.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="max-h-64 divide-y overflow-y-auto rounded-lg border text-sm">
          {(overages ?? []).map((overage) => (
            <li key={`${overage.challanId}:${overage.index}`} className="px-3 py-2">
              <p className="font-mono text-xs text-muted-foreground">{overage.challanNumber}</p>
              <p className="font-medium">
                {overage.productName} <span className="font-mono text-xs">{overage.model}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                Ordered {overage.ordered}
                {overage.onOtherTrips > 0 && ` · ${overage.onOtherTrips} already on other trips`} ·{' '}
                <span className="font-semibold text-tone-orange">{overage.onThisTrip} on this trip</span>
              </p>
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Go back and adjust</AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
            Send anyway
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
