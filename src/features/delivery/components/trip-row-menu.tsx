import { EllipsisVertical, Eye, PackageCheck, PencilLine, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TripActions } from '../hooks/use-trip-actions'
import { shortTripNumber } from '../lib/delivery-meta'
import { tripIsEditable } from '../types'
import type { TripRecord } from '../types'
import { useT } from '@/lib/i18n'

/**
 * A trip's row menu. What is offered follows the same two rules the server
 * enforces — who (the author, or Admin and Manager) and when (only an `Open`
 * trip can be edited or deleted) — so nothing here is a button the API would
 * refuse.
 *
 * There are no status steps on it any more. "Mark dispatched" and "Mark
 * delivered" recorded whether somebody remembered to press them; what ends a
 * delivery now is the receiver's signed copy being scanned in, which happens
 * on the trip's own page, one challan at a time.
 */
export function TripRowMenu({ trip, actions }: { trip: TripRecord; actions: TripActions }) {
  const t = useT()

  const canChange = actions.canChange(trip)
  const editable = tripIsEditable(trip.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('delivery.trip.actionsAria', { trip: shortTripNumber(trip.tripNumber) })}
          >
            <EllipsisVertical aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => actions.open(trip)}>
          <Eye aria-hidden />
          Open
        </DropdownMenuItem>

        {trip.status === 'Open' && (
          <DropdownMenuItem onClick={() => actions.open(trip)}>
            <PackageCheck aria-hidden />
            {t('delivery.trip.fileSignedCopy')}
          </DropdownMenuItem>
        )}

        {canChange && (
          <>
            {editable && (
              <DropdownMenuItem onClick={() => actions.edit(trip)}>
                <PencilLine aria-hidden />
                {t('delivery.trip.editTrip')}
              </DropdownMenuItem>
            )}
            {editable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => actions.askDelete(trip)}>
                  <Trash2 aria-hidden />
                  {t('delivery.trip.deleteTrip')}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
