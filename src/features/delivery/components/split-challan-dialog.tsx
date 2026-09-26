import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { takenBySource } from '../lib/cart'
import type { CartChallan } from '../types'
import { QtyStepper } from './qty-stepper'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface SplitChallanDialogProps {
  challan: CartChallan
  onOpenChange: (open: boolean) => void
  onSplit: (take: Record<number, number>) => void
}

/**
 * Splitting a challan across trips: how much of each line goes on *this* one.
 *
 * Four refrigerators that will not fit on one lorry become two here and two on
 * the next trip — and the next trip does not need this dialog at all, because
 * adding the same challan there offers exactly what is left. Each line shows
 * three numbers side by side: ordered, already on other trips, and what this
 * trip takes, with the remainder for later worked out rather than typed.
 *
 * Mounted only while open (the caller keys it), so it always starts from the
 * cart as it is now.
 */
export function SplitChallanDialog({ challan, onOpenChange, onSplit }: SplitChallanDialogProps) {
  const t = useT()

  const [take, setTake] = useState<Record<number, number>>(() => takenBySource(challan))

  const total = Object.values(take).reduce((sum, qty) => sum + qty, 0)

  const fill = (share: (available: number) => number) =>
    setTake(
      Object.fromEntries(
        challan.sources.map((source) => [
          source.index,
          share(Math.max(0, source.ordered - source.dispatched)),
        ]),
      ),
    )

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('delivery.split.title', { challan: challan.challanNumber })}</DialogTitle>
          <DialogDescription>
            {t('delivery.split.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => fill((n) => n)}>
            {t('delivery.split.everythingLeft')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fill((n) => Math.ceil(n / 2))}>
            Half
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => fill(() => 0)}>
            None
          </Button>
        </div>

        <ul className="divide-y rounded-lg border">
          {challan.sources.map((source) => {
            const onThisTrip = take[source.index] ?? 0
            const later = Math.max(0, source.ordered - source.dispatched - onThisTrip)

            return (
              <li key={source.index} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{source.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{source.model}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                    {t('delivery.line.ordered', { n: formatNumber(source.ordered) })}
                    {source.dispatched > 0 && ` · ${source.dispatched} on other trips`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <QtyStepper
                    value={onThisTrip}
                    min={0}
                    label={`${source.productName} ${source.model}`}
                    onChange={(qty) => setTake((current) => ({ ...current, [source.index]: qty }))}
                  />
                  <span className="w-20 text-right text-xs text-muted-foreground tabular-nums">
                    {later > 0 ? `${later} later` : 'nothing held'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        {total === 0 && (
          <p className="text-xs text-destructive">
            {t('delivery.split.mustCarrySomething')}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button type="button" disabled={total === 0} onClick={() => onSplit(take)}>
            <Scissors data-icon="inline-start" aria-hidden />
            {t('delivery.split.apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
