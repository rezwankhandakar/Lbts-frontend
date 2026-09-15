import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-current-role'
import { DeleteTripDialog } from '@/features/delivery/components/delete-trip-dialog'
import { ReceiptScanBar } from '@/features/delivery/components/receipt-scan-bar'
import { TripDirectory } from '@/features/delivery/components/trip-directory'
import { TripFilters } from '@/features/delivery/components/trip-filters'
import { TripStatsPanel } from '@/features/delivery/components/trip-stats'
import { useBarcodeWedge } from '@/features/delivery/hooks/use-barcode-wedge'
import { useTripStats, useTrips } from '@/features/delivery/hooks/use-deliveries'
import { useReceiptScan } from '@/features/delivery/hooks/use-receipt-scan'
import { useTripActions } from '@/features/delivery/hooks/use-trip-actions'
import { useTripListParams } from '@/features/delivery/hooks/use-trip-list-params'
import { localToday, plural } from '@/features/delivery/lib/delivery-meta'
import { canWriteDeliveries } from '@/features/delivery/types'

/**
 * Every trip, filtered and paged server-side — and the desk where signed
 * copies come back.
 *
 * The totals in the toolbar answer the filters rather than the page — "how
 * many pieces did Malek Transport carry last month" is one vendor filter, one
 * date range and one number — which is the rule every list in this app keeps.
 *
 * The page also **listens for a barcode scanner**, exactly as the trip
 * workspace does. There, a scan means "put this challan on a lorry"; here it
 * means "this came back signed", and it opens the delivery the sheet belongs
 * to. That is the shape of the actual job at this end: an operator holds a
 * stack of signed copies, scans one, records what came back and what carrying
 * it took, scans the sheet in, and reaches for the next — without touching the
 * mouse once.
 */
export function DeliveryPage() {
  const role = useCurrentRole()
  const canWrite = canWriteDeliveries(role)

  const list = useTripListParams()
  const query = useTrips(list.applied)
  const statsQuery = useTripStats()
  const actions = useTripActions()
  const receipt = useReceiptScan()

  /**
   * Only for somebody who may write: a scan opens a page whose whole purpose
   * is recording a delivery, and sending a reader there would be offering a
   * form they cannot submit. The hook suspends itself while a field has focus
   * or a dialog is open, so a number typed into the search box is never read
   * as a scan.
   */
  useBarcodeWedge(receipt.scan, canWrite && !receipt.pending)

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Delivery</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Every trip: which vehicle and driver, which vendor it was assigned to, and exactly
            which challans — and how much of each — went out on it.
          </p>
        </div>
        {canWrite && (
          <Button size="lg" className="shrink-0" render={<Link to="/delivery/new" />}>
            <Plus data-icon="inline-start" aria-hidden />
            New delivery
          </Button>
        )}
      </div>

      {canWrite && (
        <ReceiptScanBar
          onScan={receipt.scan}
          pending={receipt.pending}
          listening={!receipt.pending}
        />
      )}

      <TripStatsPanel
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isError={statsQuery.isError}
        onRetry={() => void statsQuery.refetch()}
        onStatus={(status) => list.applyFilters({ status })}
        onToday={() => {
          const today = localToday()
          list.applyFilters({ from: today, to: today })
        }}
      />

      <section aria-label="Trips" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <TripFilters
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          isFiltered={list.isFiltered}
          summary={
            meta && !query.isPending
              ? `${plural(meta.total, 'trip')}${list.isFiltered ? ' match these filters' : ''} · ${plural(
                  meta.totalChallans ?? 0,
                  'challan',
                )} · ${plural(meta.totalQty ?? 0, 'piece')}`
              : undefined
          }
          totals={
            meta && !query.isPending
              ? {
                  rent: meta.totalRent ?? 0,
                  labour: meta.totalLabour ?? 0,
                  blankRent: meta.blankRent ?? 0,
                  blankLabour: meta.blankLabour ?? 0,
                }
              : undefined
          }
        />

        <TripDirectory
          records={records}
          isLoading={query.isPending}
          isFetching={query.isFetching}
          isError={query.isError}
          errorMessage={query.error?.message ?? 'Something went wrong.'}
          isFiltered={list.isFiltered}
          canWrite={canWrite}
          actions={actions}
          onRetry={() => void query.refetch()}
          onReset={list.reset}
        />

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={query.isFetching}
            noun={['trip', 'trips']}
          />
        )}
      </section>

      <DeleteTripDialog actions={actions} />
    </div>
  )
}
