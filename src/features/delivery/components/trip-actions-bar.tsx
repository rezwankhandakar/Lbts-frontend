import { PencilLine, Printer, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TripActions } from '../hooks/use-trip-actions'
import { printManifest } from '../lib/print-manifest'
import { tripIsEditable } from '../types'
import type { TripRecord } from '../types'

/**
 * What can be done to the trip on screen: print it for the driver, correct it
 * or delete it — each offered only when the server would accept it. Printing
 * is open to every reader; the rest follow `canChangeTrip`.
 *
 * There is no "Mark dispatched" and no "Mark delivered" here any more. A trip
 * finishes when every challan on it has been signed for, and that is recorded
 * challan by challan on the manifest below, against the signed copy that
 * proves it — so the bar has nothing to step.
 */
export function TripActionsBar({ trip, actions }: { trip: TripRecord; actions: TripActions }) {
  const canChange = actions.canChange(trip)
  const editable = tripIsEditable(trip.status)

  return (
    <>
      <Button variant="outline" onClick={() => printManifest(trip)}>
        <Printer data-icon="inline-start" aria-hidden />
        Print manifest
      </Button>

      {canChange && editable && (
        <Button variant="outline" onClick={() => actions.edit(trip)}>
          <PencilLine data-icon="inline-start" aria-hidden />
          Edit
        </Button>
      )}

      {canChange && editable && (
        <Button variant="destructive" onClick={() => actions.askDelete(trip)} aria-label="Delete trip">
          <Trash2 aria-hidden />
        </Button>
      )}
    </>
  )
}
