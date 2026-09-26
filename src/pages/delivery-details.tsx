import { useNavigate, useParams } from 'react-router-dom'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { ChallanQuantitySummary } from '@/features/delivery/components/challan-quantity-summary'
import { DeleteTripDialog } from '@/features/delivery/components/delete-trip-dialog'
import { DeliveryPageHeader } from '@/features/delivery/components/delivery-page-header'
import { SummaryFigures } from '@/features/delivery/components/summary-figures'
import { TripActionsBar } from '@/features/delivery/components/trip-actions-bar'
import { TripBillCard } from '@/features/delivery/components/trip-bill-card'
import { TripLoadError } from '@/features/delivery/components/trip-load-error'
import { TripManifest } from '@/features/delivery/components/trip-manifest'
import { TripSidePanel } from '@/features/delivery/components/trip-side-panel'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useTrip } from '@/features/delivery/hooks/use-deliveries'
import { useSheetScan } from '@/features/delivery/hooks/use-sheet-scan'
import { useTripActions } from '@/features/delivery/hooks/use-trip-actions'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { useT } from '@/lib/i18n'

/**
 * One trip: the manifest of what went, who ran it, and how each delivery on it
 * ended.
 *
 * Everything on this page is the trip's own record — the copies taken when it
 * was confirmed — so it reads the same next year whatever has happened to the
 * vehicle, the driver or the challans since.
 *
 * What heads it is the **quantity**, by product. The three tiles that used to
 * sit here counted challans, pieces and changed lines: an operator at a
 * tailgate is counting refrigerators, and the only summary that helps is the
 * one written in the same units. What is left of the old figures is drawn only
 * when there is an exception to report.
 */
export function DeliveryDetailsPage() {
  const t = useT()

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const query = useTrip(id)
  const actions = useTripActions()
  // A signed copy scanned here opens its delivery — this trip's, or another's.
  const receipt = useSheetScan({ trip: query.data })
  useBarcodeWedge((code) => void receipt.scan(code), query.isSuccess && !receipt.pending)

  if (query.isPending) {
    return <PageSkeleton />
  }

  if (query.isError) {
    return <TripLoadError error={query.error} onRetry={() => void query.refetch()} />
  }

  const trip = query.data
  const challans = trip.challans ?? []
  const lines = challans.flatMap((challan) => challan.lines)
  const returned = challans.flatMap((challan) => challan.returned)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <DeliveryPageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{shortTripNumber(trip.tripNumber)}</span>
            <TripStatusBadge
              value={trip.status}
              progress={{ done: trip.completedChallans, total: trip.challanCount }}
              className="text-[13px]"
            />
          </span>
        }
        description={t('delivery.trip.assignedTo', {
          vendor: trip.vendor.name,
          date: formatDay(trip.tripDate),
          plate: trip.vehicle.registrationNo,
          driver: trip.driver.name,
        })}
        back={{ to: '/delivery', label: t('delivery.deliveries') }}
        actions={<TripActionsBar trip={trip} actions={actions} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label={t('delivery.manifestAria')} className="min-w-0 space-y-4">
          <ChallanQuantitySummary lines={lines} returned={returned} />

          <SummaryFigures
            className="sm:grid-cols-4"
            summary={{
              challans: trip.challanCount,
              lines: lines.length,
              qty: trip.totalQty,
              changedLines: trip.changedLines,
              editedChallans: challans.filter((challan) => challan.edited.length > 0).length,
              splitChallans: challans.filter((challan) => challan.reserved.length > 0).length,
              /**
               * A saved trip has already made its corrections, so there is
               * nothing pending to warn about — the manifest's own badges say
               * what each line did.
               */
              correctedChallans: 0,
              overages: [],
            }}
          />

          <TripManifest
            challans={challans}
            completionHref={(challan) => `/delivery/${trip.id}/challans/${challan.challanId}`}
          />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <TripBillCard key={trip.id} trip={trip} canChange={actions.canChange(trip)} />
          <TripSidePanel trip={trip} />
        </aside>
      </div>

      <DeleteTripDialog actions={actions} onDeleted={() => navigate('/delivery', { replace: true })} />
    </div>
  )
}
