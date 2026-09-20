import { useParams } from 'react-router-dom'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { PackageX } from 'lucide-react'
import { DeliveryCompletionEditor } from '@/features/delivery/components/delivery-completion-editor'
import { DeliveryPageHeader } from '@/features/delivery/components/delivery-page-header'
import { TripLoadError } from '@/features/delivery/components/trip-load-error'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useTrip } from '@/features/delivery/hooks/use-deliveries'
import { useReceiptScan } from '@/features/delivery/hooks/use-receipt-scan'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { canWriteDeliveries } from '@/features/delivery/types'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * One challan's delivery, completed.
 *
 * A **page** rather than a dialog, for the reason `/challan/:id/location` is
 * one: the work is reading a signed sheet against a manifest — several product
 * lines with what came back beside each, a floor, a list of what was hired, and
 * a scan to file — and a modal is a box that gets smaller the more of that you
 * put in it. On a page it all sits at full size and the browser's own back
 * button means something.
 *
 * Reached three ways, which is the point: from the trip's manifest, from the
 * deliveries list, and — the one that matters at a desk — by reading the
 * barcode on the signed copy itself, which opens this page for whichever trip
 * is still waiting on it.
 */
export function DeliveryCompletionPage() {
  const { id, challanId } = useParams<{ id: string; challanId: string }>()
  const query = useTrip(id)
  const canWrite = canWriteDeliveries(useCurrentRole())
  // Scanning the next signed copy opens it, whichever trip it went out on.
  const receipt = useReceiptScan({ trip: query.data, currentChallanId: challanId })
  useBarcodeWedge((code) => void receipt.scan(code), query.isSuccess && !receipt.pending)

  if (query.isPending) {
    return <PageSkeleton />
  }

  if (query.isError) {
    return <TripLoadError error={query.error} onRetry={() => void query.refetch()} />
  }

  const trip = query.data
  const challan = (trip.challans ?? []).find((entry) => entry.challanId === challanId)

  if (!challan) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <DeliveryPageHeader
          title={shortTripNumber(trip.tripNumber)}
          description={`${trip.vendor.name} · ${formatDay(trip.tripDate)}`}
          back={{ to: `/delivery/${trip.id}`, label: shortTripNumber(trip.tripNumber) }}
        />
        <EmptyState
          icon={PackageX}
          title="That challan is not on this trip"
          description="It may have been taken off when the trip was corrected. Open the trip to see what it carries now."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <DeliveryPageHeader
        title="Complete delivery"
        description={`${shortTripNumber(trip.tripNumber)} · ${trip.vehicle.registrationNo} · ${trip.driver.name} · ${formatDay(trip.tripDate)}`}
        back={{ to: `/delivery/${trip.id}`, label: shortTripNumber(trip.tripNumber) }}
      />

      {/*
        Keyed on the challan, so nothing carries between two deliveries worked
        through one after another. The same rule `ChallanLocationEditor` is
        mounted under, and for the same reason: a floor number belonging to the
        previous challan is how a wrong one gets filed.
      */}
      <DeliveryCompletionEditor
        key={challan.challanId}
        trip={trip}
        challan={challan}
        canWrite={canWrite}
      />
    </div>
  )
}
