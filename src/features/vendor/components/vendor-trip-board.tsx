import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { localToday } from '@/features/delivery/lib/delivery-meta'
import { canReadDeliveries } from '@/features/delivery/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { VendorTripList } from '../hooks/use-vendor-trip-list'
import { billPeriodLabel } from '../lib/vendor-meta'
import type { VendorRecord } from '../types'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { VendorTripDetailSheet } from './vendor-trip-detail-sheet'
import { VendorTripFilters } from './vendor-trip-filters'
import { VendorTripList as VendorTripRows } from './vendor-trip-list'
import { MonthlyBill } from './vendor-trip-monthly-bill'

interface VendorTripBoardProps {
  vendor: VendorRecord
  list: VendorTripList
  /**
   * The staff Trips tab draws the monthly bill inside the panel; a vendor's own
   * page draws it in the hero above, and passes false.
   */
  showBill: boolean
}

/**
 * A vendor's trips, as one card: a heading that says how much the filters
 * match, the toolbar, the trips, and the pager.
 *
 * **Read-only for everybody.** A trip is created and corrected in Delivery, and
 * its money is recorded in Accounts; this is where somebody looking at a
 * vendor, or the vendor themselves, reads both. A row opens the trip in a sheet
 * for every account; only staff who can read Delivery get a way through from
 * there to the full trip, which carries customers.
 *
 * Totals answer the filters, not the page, so *Last month* is the vendor's
 * bill for last month in one press.
 */
export function VendorTripBoard({ vendor, list, showBill }: VendorTripBoardProps) {
  const t = useT()
  const format = useFormatters()

  const [openTripId, setOpenTripId] = useState<string | null>(null)
  const canOpenDelivery = canReadDeliveries(useCurrentRole())
  const { params, query, records, meta } = list

  return (
    <Panel label={t('vendor.trip.panel')} className="rounded-2xl">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          <Navigation className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">{t('vendor.trip.panel')}</h2>
          {meta && !query.isPending ? (
            <p className="text-[13px] text-muted-foreground sm:text-sm">
              {countOf(meta.total, 'nouns.trip', t)} · {countOf(meta.totalQty, 'nouns.piece', t)}
              <span className="hidden sm:inline">
                {' · '}
                {t('vendor.trip.rentTotal', { amount: format.taka(meta.totalRent) })}
                {' · '}
                {t('vendor.trip.labourTotal', { amount: format.taka(meta.totalLabour) })}
              </span>
            </p>
          ) : (
            <span className="mt-1 block h-4 w-40 animate-pulse rounded bg-muted" aria-hidden />
          )}
        </div>
      </header>

      <VendorTripFilters
        params={params}
        onChange={list.apply}
        onReset={list.reset}
        isFiltered={list.isFiltered}
        meta={meta && !query.isPending ? meta : undefined}
      />

      {showBill && meta && (
        <div className="px-4 pb-4 sm:px-5">
          <MonthlyBill
            bill={meta.monthlyBill}
            period={billPeriodLabel(params.from, params.to, localToday(), t)}
          />
        </div>
      )}

      <div className="border-t">
        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title={t('vendor.trip.loadFailed')}
            message={query.error?.message ?? t('vendor.somethingWrong')}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Navigation}
            title={t('vendor.trip.noneThisMonth')}
            description={t('vendor.trip.noneHint', { vendor: vendor.name })}
            isFiltered={list.isFiltered}
            onReset={list.reset}
          />
        ) : (
          <div className={cn('transition-opacity', query.isFetching && 'opacity-60')}>
            <VendorTripRows records={records} onOpen={(trip) => setOpenTripId(trip.id)} />
          </div>
        )}
      </div>

      {meta && !query.isError && (
        <ListPagination
          meta={meta}
          onPageChange={list.setPage}
          isFetching={query.isFetching}
          nounKey="nouns.trip"
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
