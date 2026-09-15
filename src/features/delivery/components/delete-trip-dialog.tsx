import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { shortTripNumber } from '../lib/delivery-meta'
import type { TripActions } from '../hooks/use-trip-actions'

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
  const trip = actions.deleting

  return (
    <ConfirmDialog
      open={trip !== null}
      isPending={actions.isDeleting}
      title={trip ? `Delete ${shortTripNumber(trip.tripNumber)}?` : 'Delete trip?'}
      description={
        <>
          Only a trip that has not been dispatched can be deleted. Every challan on it is released
          for another trip. The trip number is <strong>not reused</strong> — the vendor&apos;s serial
          simply skips it.
        </>
      }
      confirmLabel="Delete trip"
      pendingLabel="Deleting…"
      cancelLabel="Keep it"
      onOpenChange={(open) => !open && actions.cancelDelete()}
      onConfirm={() => actions.confirmDelete(onDeleted)}
    />
  )
}
