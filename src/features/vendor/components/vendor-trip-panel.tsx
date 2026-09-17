import { useMemo, useState } from 'react'
import { Navigation } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { monthRange } from '@/features/delivery/lib/delivery-meta'
import { canReadDeliveries } from '@/features/delivery/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useVendorTrips } from '../hooks/use-vendors'
import type { VendorRecord, VendorTripFilterPatch, VendorTripListParams } from '../types'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { VendorTripDetailSheet } from './vendor-trip-detail-sheet'
import { VendorTripFilters } from './vendor-trip-filters'
import { VendorTripList } from './vendor-trip-list'

/**
 * The tab opens on this month, because that is the bill a vendor is waiting on.
 * Worked out when called rather than once at import, so a tab left open past
 * midnight on the last day still starts on the right month.
 */
function initialParams(): VendorTripListParams {
  return { page: 1, limit: 10, search: '', status: 'all', ...monthRange(0), bill: 'all' }
}

/**
 * The vendor's Trips tab — every trip this vendor ran for us, this month first.
 *
 * **Read-only for everybody.** A trip is created and corrected in Delivery, and
 * its money is recorded in Accounts; this tab is where somebody looking at a
 * vendor, or the vendor themselves, reads both. A Vendor account reaches it
 * through `/my-vendor` and the server narrows it to their own vendor. A row
 * opens the trip in a sheet for every account; only staff who can read Delivery
 * get a way through from there to the full trip, which carries customers.
 *
 * Totals answer the filters, not the page, so "Last month" is the vendor's bill
 * for last month in one press: what was billed, advanced, paid and is still due.
 */
export function VendorTripPanel({ vendor }: { vendor: VendorRecord }) {
  const [params, setParams] = useState<VendorTripListParams>(initialParams)
  const [openTripId, setOpenTripId] = useState<string | null>(null)
  const search = useDebouncedValue(params.search, 350)
  const applied = useMemo(() => ({ ...params, search }), [params, search])

  const query = useVendorTrips(vendor.id, applied)
  const canOpenDelivery = canReadDeliveries(useCurrentRole())

  const apply = (patch: VendorTripFilterPatch) =>
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  const reset = () => setParams(initialParams())
  const initial = initialParams()
  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.from !== initial.from ||
    params.to !== initial.to ||
    params.bill !== 'all'

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && params.page > meta.totalPages) {
    setParams((current) => ({ ...current, page: meta.totalPages }))
  }

  return (
    <Panel label="Trips">
      <VendorTripFilters
        params={params}
        onChange={apply}
        onReset={reset}
        isFiltered={isFiltered}
        meta={meta && !query.isPending ? meta : undefined}
      />

      {query.isPending ? (
        <PanelSkeleton />
      ) : query.isError ? (
        <PanelError
          title="Could not load the trips"
          message={query.error?.message ?? 'Something went wrong.'}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : records.length === 0 ? (
        <PanelEmpty
          icon={Navigation}
          title="No trips this month"
          description={`None of ${vendor.name}'s vehicles has gone out yet this month. Choose "Any date" to see earlier trips.`}
          isFiltered={isFiltered}
          onReset={reset}
        />
      ) : (
        <div className={cn('transition-opacity', query.isFetching && 'opacity-60')}>
          <VendorTripList records={records} onOpen={(trip) => setOpenTripId(trip.id)} />
        </div>
      )}

      {meta && !query.isError && (
        <ListPagination
          meta={meta}
          onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          isFetching={query.isFetching}
          noun={['trip', 'trips']}
        />
      )}

      <VendorTripDetailSheet
        vendorId={vendor.id}
        tripId={openTripId}
        canOpenDelivery={canOpenDelivery}
        onClose={() => setOpenTripId(null)}
      />
    </Panel>
  )
}
