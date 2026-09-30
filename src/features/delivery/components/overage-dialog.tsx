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
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { SentenceWith } from '@/components/shared/sentence-with'

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
  const t = useT()

  return (
    <AlertDialog open={overages !== null} onOpenChange={(open) => !open && !isPending && onCancel()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delivery.overage.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            <SentenceWith text={t('delivery.overage.bodyRaises')} placeholder="{raises}">
              <strong>{t('delivery.overage.raisesTheChallan')}</strong>
            </SentenceWith>
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
                {t('delivery.line.ordered', { n: formatNumber(overage.ordered) })}
                {overage.onOtherTrips > 0 &&
                  t('delivery.line.alreadyOnOtherTrips', {
                    qty: formatNumber(overage.onOtherTrips),
                  })}{' '}
                ·{' '}
                <span className="font-semibold text-tone-orange">
                  {t('delivery.line.onThisTripCount', { qty: formatNumber(overage.onThisTrip) })}
                </span>
              </p>
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('delivery.overage.goBack')}
          </AlertDialogCancel>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
            {t('delivery.overage.sendAnyway')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
