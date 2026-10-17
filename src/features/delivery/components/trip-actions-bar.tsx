import { PencilLine, Printer, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TripActions } from '../hooks/use-trip-actions'
import { printManifest } from '../lib/print-manifest'
import { tripIsEditable } from '../types'
import type { TripRecord } from '../types'
import { useT } from '@/lib/i18n'

/**
 * Glass on the brand gradient. The button variants are built for a light card,
 * so on the band they are restyled from `primary-foreground` the way the
 * dashboard hero draws its quick actions.
 */
const ON_BAND =
  'border-transparent bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/25 hover:bg-primary-foreground/25 hover:text-primary-foreground focus-visible:ring-primary-foreground/60'

/**
 * What can be done to the trip on screen: print it for the driver, correct it
 * or delete it — each offered only when the server would accept it. Printing
 * is open to every reader; the rest follow `canChangeTrip`.
 *
 * Drawn on the trip page's brand band, so Print — the one every reader has and
 * the one done most — carries the weight and the rest sit behind glass.
 *
 * There is no "Mark dispatched" and no "Mark delivered" here any more. A trip
 * finishes when every challan on it has been signed for, and that is recorded
 * challan by challan on the cards below, against the signed copy that proves
 * it — so the bar has nothing to step.
 */
export function TripActionsBar({ trip, actions }: { trip: TripRecord; actions: TripActions }) {
  const t = useT()

  const canChange = actions.canChange(trip)
  const editable = tripIsEditable(trip.status)

  return (
    <>
      <Button
        className="border-transparent bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        onClick={() => printManifest(trip)}
      >
        <Printer data-icon="inline-start" aria-hidden />
        {t('delivery.trip.printManifest')}
      </Button>

      {canChange && editable && (
        <Button variant="ghost" className={ON_BAND} onClick={() => actions.edit(trip)}>
          <PencilLine data-icon="inline-start" aria-hidden />
          {t('common.actions.edit')}
        </Button>
      )}

      {canChange && editable && (
        <Button
          variant="ghost"
          size="icon"
          className={`${ON_BAND} hover:bg-destructive hover:text-primary-foreground`}
          onClick={() => actions.askDelete(trip)}
          aria-label={t('delivery.trip.deleteTrip')}
          title={t('delivery.trip.deleteTrip')}
        >
          <Trash2 aria-hidden />
        </Button>
      )}
    </>
  )
}
