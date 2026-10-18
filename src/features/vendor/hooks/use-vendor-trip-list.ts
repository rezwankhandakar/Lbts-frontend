import { useMemo, useState } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { monthRange } from '@/features/delivery/lib/delivery-meta'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ApiError } from '@/lib/axios'
import type {
  VendorTripFilterPatch,
  VendorTripListParams,
  VendorTripListResult,
  VendorTripPageMeta,
  VendorTripRecord,
} from '../types'
import { useVendorTrips } from './use-vendors'

/**
 * The list opens on this month, because that is the bill a vendor is waiting on.
 * Worked out when called rather than once at import, so a page left open past
 * midnight on the last day still starts on the right month.
 */
function initialParams(): VendorTripListParams {
  return { page: 1, limit: 10, search: '', status: 'all', ...monthRange(0), bill: 'all' }
}

export interface VendorTripList {
  params: VendorTripListParams
  query: UseQueryResult<VendorTripListResult, ApiError>
  records: VendorTripRecord[]
  /** Totals and the monthly bill for the matching trips, once loaded. */
  meta: VendorTripPageMeta | undefined
  isFiltered: boolean
  apply: (patch: VendorTripFilterPatch) => void
  reset: () => void
  setPage: (page: number) => void
}

/**
 * A vendor's trip list as state: the filters, the request they make, and the
 * answer.
 *
 * A hook rather than state inside the panel, because two screens read the same
 * answer in two places. The staff Trips tab draws the monthly bill inside the
 * panel; a vendor's own page draws it in the hero above, so the figure a vendor
 * opens the page for is the first thing on it — and both have to be the bill
 * for whatever the list below is filtered to, which only one shared state can
 * promise.
 */
export function useVendorTripList(vendorId: string): VendorTripList {
  const [params, setParams] = useState<VendorTripListParams>(initialParams)
  const search = useDebouncedValue(params.search, 350)
  const applied = useMemo(() => ({ ...params, search }), [params, search])

  const query = useVendorTrips(vendorId, applied)
  const meta = query.data?.meta

  // Removing filters can leave the page past the end; step back to the last one.
  if (meta && meta.totalPages > 0 && params.page > meta.totalPages) {
    setParams((current) => ({ ...current, page: meta.totalPages }))
  }

  const initial = initialParams()

  return {
    params,
    query,
    records: query.data?.records ?? [],
    meta,
    isFiltered:
      params.search !== '' ||
      params.status !== 'all' ||
      params.from !== initial.from ||
      params.to !== initial.to ||
      params.bill !== 'all',
    apply: (patch) => setParams((current) => ({ ...current, ...patch, page: 1 })),
    reset: () => setParams(initialParams()),
    setPage: (page) => setParams((current) => ({ ...current, page })),
  }
}
