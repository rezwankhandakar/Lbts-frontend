import { useLocation } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { useCurrentRole } from '@/hooks/use-current-role'
import { DeleteTripDialog } from '@/features/delivery/components/delete-trip-dialog'
import { DeliveryListHero } from '@/features/delivery/components/delivery-list-hero'
import { ReceiptScanBar } from '@/features/delivery/components/receipt-scan-bar'
import { TripDirectory } from '@/features/delivery/components/trip-directory'
import { TripFilterChips } from '@/features/delivery/components/trip-filter-chips'
import { TripFilters } from '@/features/delivery/components/trip-filters'
import { TripListSummary } from '@/features/delivery/components/trip-list-summary'
import { TripStatsPanel } from '@/features/delivery/components/trip-stats'
import { useBarcodeWedge } from '@/hooks/use-barcode-wedge'
import { useTripStats, useTrips } from '@/features/delivery/hooks/use-deliveries'
import { useSheetScan } from '@/features/delivery/hooks/use-sheet-scan'
import { useTripActions } from '@/features/delivery/hooks/use-trip-actions'
import { useTripListParams } from '@/features/delivery/hooks/use-trip-list-params'
import { tripListState } from '@/features/delivery/hooks/use-trip-list-return'
import { localToday } from '@/features/delivery/lib/delivery-meta'
import { canWriteDeliveries } from '@/features/delivery/types'
import type { TripListParams } from '@/features/delivery/types'
import { countOf, useT } from '@/lib/i18n'

/**
 * Every trip, filtered and paged server-side — and the desk where signed
 * copies come back.
 *
 * Two pieces, top to bottom. The brand band says what the page is and what is
 * waiting: the counts — each a way into the list, drawn pressed while it is
 * the filter in force — and the scanner, where paper coming back off a lorry
 * is read in. The list card beneath is the toolbar, the quick ranges and the
 * bill backlog, a strip of what the filters add up to, and the trips.
 *
 * The totals answer the filters rather than the page — "how many pieces did
 * Malek Transport carry last month" is one vendor filter, one date range and
 * one number — which is the rule every list in this app keeps.
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
  const t = useT()

  const role = useCurrentRole()
  const canWrite = canWriteDeliveries(role)

  /**
   * The dashboard links here with the backlog it just counted, and a trip this
   * list opened links back with the filters it was opened from — after a saved
   * bill, narrowed to the bill backlog (`useTripListReturn`). Router state
   * rather than the URL, because these filters have never been in the URL —
   * carrying them is a convenience for one journey, not a promise that a link
   * reproduces a view. It seeds the first render only, so Clear still clears
   * to nothing.
   */
  const { state } = useLocation()
  const seeded = (state as { tripFilters?: Partial<TripListParams> } | null)?.tripFilters

  const list = useTripListParams(seeded)
  const query = useTrips(list.applied)
  const statsQuery = useTripStats()
  const actions = useTripActions()
  const receipt = useSheetScan()

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
  const ready = meta !== undefined && !query.isPending

  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  const today = localToday()
  const todayActive = list.params.from === today && list.params.to === today

  return (
    /*
     * The negative top margin takes back all but 4px of the padding `<main>`
     * puts above every page (`p-4 md:p-6 lg:p-8` in `app-layout.tsx`), the
     * arrangement the trip page has: the band starts at the top of the screen
     * and the list gets the space. Change one, change the other.
     */
    <div className="mx-auto -mt-3 w-full max-w-7xl md:-mt-5 lg:-mt-7">
      <DeliveryListHero
        canWrite={canWrite}
        stats={
          <TripStatsPanel
            stats={statsQuery.data}
            isLoading={statsQuery.isPending}
            isError={statsQuery.isError}
            onRetry={() => void statsQuery.refetch()}
            active={{ status: list.params.status === 'all' ? null : list.params.status, today: todayActive }}
            // A count pressed again lets go of its filter, as a backlog chip does.
            onStatus={(status) => list.applyFilters({ status: list.params.status === status ? 'all' : status })}
            onToday={() => list.applyFilters(todayActive ? { from: '', to: '' } : { from: today, to: today })}
          />
        }
        scan={
          canWrite ? (
            <ReceiptScanBar onScan={receipt.scan} pending={receipt.pending} listening={!receipt.pending} />
          ) : undefined
        }
      />

      <section aria-label={t('delivery.tripsAria')} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="space-y-3 p-3 sm:p-4">
          <TripFilters
            params={list.params}
            onChange={list.applyFilters}
            onReset={list.reset}
            isFiltered={list.isFiltered}
          />
          <TripFilterChips
            params={list.params}
            onChange={list.applyFilters}
            backlog={
              ready ? { blankRent: meta.blankRent ?? 0, blankLabour: meta.blankLabour ?? 0 } : undefined
            }
          />
        </div>

        <TripListSummary
          summary={
            ready
              ? t(list.isFiltered ? 'delivery.list.summaryFiltered' : 'delivery.list.summaryTotal', {
                  trips: countOf(meta.total, 'nouns.trip', t),
                  challans: countOf(meta.totalChallans ?? 0, 'nouns.challan', t),
                  pieces: countOf(meta.totalQty ?? 0, 'nouns.piece', t),
                })
              : undefined
          }
          totals={ready ? { rent: meta.totalRent ?? 0, labour: meta.totalLabour ?? 0 } : undefined}
        />

        <div className="border-t">
          <TripDirectory
            records={records}
            isLoading={query.isPending}
            isFetching={query.isFetching}
            isError={query.isError}
            errorMessage={query.error?.message ?? t('delivery.somethingWrong')}
            isFiltered={list.isFiltered}
            canWrite={canWrite}
            actions={actions}
            onRetry={() => void query.refetch()}
            onReset={list.reset}
            listState={tripListState(list.params)}
          />
        </div>

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={query.isFetching}
            nounKey="nouns.trip"
          />
        )}
      </section>

      <DeleteTripDialog actions={actions} />
    </div>
  )
}
