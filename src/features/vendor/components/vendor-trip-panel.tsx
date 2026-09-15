import { useMemo, useState } from 'react'
import { Navigation } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { canReadDeliveries } from '@/features/delivery/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useVendorTrips } from '../hooks/use-vendors'
import type { VendorRecord, VendorTripFilterPatch, VendorTripListParams } from '../types'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { VendorTripFilters } from './vendor-trip-filters'
import { VendorTripList } from './vendor-trip-list'

const INITIAL: VendorTripListParams = {
  page: 1,
  limit: 10,
  search: '',
  status: 'all',
  from: '',
  to: '',
  bill: 'all',
}

/**
 * The vendor's Trips tab — every trip this vendor ran for us.
 *
 * **Read-only for everybody.** A trip is created and corrected in Delivery, not
 * here; this tab is where somebody looking at a vendor, or the vendor
 * themselves, sees the work. A Vendor account reaches it through `/my-vendor`
 * and the server narrows it to their own vendor. What differs by account is
 * only whether a row opens the trip: staff who can read Delivery go through to
 * it, and a Vendor account — who is outside Delivery, because a trip carries
 * customer addresses — reads the row and nothing further.
 *
 * Totals answer the filters, not the page, so "Last month" is the vendor's bill
 * for last month in one press, and "No trip rent" beside it is what that bill
 * is still waiting on.
 */
export function VendorTripPanel({ vendor }: { vendor: VendorRecord }) {
  const [params, setParams] = useState<VendorTripListParams>(INITIAL)
  const search = useDebouncedValue(params.search, 350)
  const applied = useMemo(() => ({ ...params, search }), [params, search])

  const query = useVendorTrips(vendor.id, applied)
  const canOpenTrips = canReadDeliveries(useCurrentRole())

  const apply = (patch: VendorTripFilterPatch) =>
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  const reset = () => setParams(INITIAL)
  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.from !== '' ||
    params.to !== '' ||
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
          title="No trips yet"
          description={`A trip appears here once one of ${vendor.name}'s vehicles is sent out with challans.`}
          isFiltered={isFiltered}
          onReset={reset}
        />
      ) : (
        <div className={cn('transition-opacity', query.isFetching && 'opacity-60')}>
          <VendorTripList records={records} canOpen={canOpenTrips} />
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
    </Panel>
  )
}
