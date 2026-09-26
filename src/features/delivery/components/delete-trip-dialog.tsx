import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { shortTripNumber } from '../lib/delivery-meta'
import type { TripActions } from '../hooks/use-trip-actions'
import { useT } from '@/lib/i18n'

/**
 * Deleting a trip that never left the gate. The shared confirmation the Vendor
 * module uses, with the one consequence that matters spelt out: every challan
 * quantity it held becomes free for another trip, and the number is not
 * given back.
 */
export function DeleteTripDialog({
  actions,
  onDeleted,
}: {
  actions: TripActions
  onDeleted?: () => void
}) {
  const t = useT()

  const trip = actions.deleting

  return (
    <ConfirmDialog
      open={trip !== null}
      isPending={actions.isDeleting}
      title={
        trip
          ? t('delivery.trip.deleteTitle', { trip: shortTripNumber(trip.tripNumber) })
          : t('delivery.trip.deleteTitleGeneric')
      }
      description={t('delivery.trip.deleteDescription')}
      confirmLabel={t('delivery.trip.deleteTrip')}
      pendingLabel={t('delivery.trip.deleting')}
      cancelLabel="Keep it"
      onOpenChange={(open) => !open && actions.cancelDelete()}
      onConfirm={() => actions.confirmDelete(onDeleted)}
    />
  )
}
