import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { DeleteTripDialog } from '@/features/delivery/components/delete-trip-dialog'
import { TripChallanGrid } from '@/features/delivery/components/trip-challan-grid'
import { TripHero } from '@/features/delivery/components/trip-hero'
import { TripLoadError } from '@/features/delivery/components/trip-load-error'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useTrip } from '@/features/delivery/hooks/use-deliveries'
import { useSheetScan } from '@/features/delivery/hooks/use-sheet-scan'
import { useTripActions } from '@/features/delivery/hooks/use-trip-actions'
import { useTripListReturn } from '@/features/delivery/hooks/use-trip-list-return'
import { useT } from '@/lib/i18n'

/**
 * One trip: who ran it, what it cost and what went — and, below, each challan
 * on it, where it was delivered and how its delivery ended.
 *
 * Everything on this page is the trip's own record — the copies taken when it
 * was confirmed — so it reads the same next year whatever has happened to the
 * vehicle, the driver or the challans since.
 *
 * Two sections, top to bottom. The hero is the trip as a whole: its number and
 * progress, the parties, the notes and the bill, and the load by product. The
 * grid is the challans themselves, two to a row, each carrying its address,
 * returns, floor, carrying and note, and each finished on its own page.
 */
export function DeliveryDetailsPage() {
  const t = useT()

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const query = useTrip(id)
  const actions = useTripActions()
  /**
   * The list's filters, handed back on the way out: as they were by the back
   * link and a delete, and narrowed to the bill backlog by a saved bill — the
   * reader is working through the trips with no rent and wants the next one.
   */
  const listReturn = useTripListReturn()
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

  return (
    /*
     * The negative top margin takes back all but 4px of the padding `<main>`
     * puts above every page (`p-4 md:p-6 lg:p-8` in `app-layout.tsx`), so the
     * trip starts at the top of the screen — the head of this page is sized to
     * fit a laptop, and the gap above it was a third of a card. Change one,
     * change the other.
     */
    <div className="mx-auto -mt-3 w-full max-w-7xl md:-mt-5 lg:-mt-7">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-1.5"
        render={<Link to="/delivery" state={listReturn.backState} />}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden />
        {t('delivery.deliveries')}
      </Button>

      <div className="space-y-6">
        <TripHero trip={trip} actions={actions} onBillSaved={listReturn.afterBillSaved} />

        <TripChallanGrid
          challans={trip.challans ?? []}
          completionHref={(challan) => `/delivery/${trip.id}/challans/${challan.challanId}`}
        />
      </div>

      <DeleteTripDialog
        actions={actions}
        onDeleted={() => navigate('/delivery', { replace: true, state: listReturn.backState })}
      />
    </div>
  )
}
