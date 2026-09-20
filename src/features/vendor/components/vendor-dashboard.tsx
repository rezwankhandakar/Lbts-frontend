import { useState } from 'react'
import { Building2, Eye, RefreshCcw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { canReadDeliveries } from '@/features/delivery/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useVendorDashboard } from '../hooks/use-vendors'
import { VendorDashboardAttention } from './vendor-dashboard-attention'
import { VendorDashboardHero } from './vendor-dashboard-hero'
import { VendorDashboardMonths } from './vendor-dashboard-months'
import { VendorDashboardRecent } from './vendor-dashboard-recent'
import { VendorDashboardFleet, VendorDashboardTiles } from './vendor-dashboard-tiles'
import { VendorTripDetailSheet } from './vendor-trip-detail-sheet'

/**
 * The vendor account's dashboard, and it is about **trips**.
 *
 * A Vendor account reaches none of the operating modules — Gate Pass, Challan,
 * Delivery, Trip DO, Excel Bill and Accounts are all closed to it, because each
 * of them carries a customer's address and phone number. So where every other
 * role lands on a page of module cards, a vendor landed on an empty state. This
 * is what belongs there instead: the one part of LBTS that is genuinely theirs
 * — the trips their lorries ran, what those trips came to, and what is still
 * outstanding on either side.
 *
 * **One request** stands behind all of it. This is the first screen after a
 * sign-in, and the instance may have been asleep for fifteen minutes; four
 * calls here would be four cold starts stacked one behind the other. Every part
 * of the answer comes from a service the Trips tab, the Vendor Bills page or
 * the vendor list already uses, so nothing on this page can quote a figure that
 * one of those pages would disagree with.
 *
 * It is **read-only**, like everything a vendor account sees. The write
 * controls are not disabled, they are absent: a greyed-out button is a promise
 * of something that will never be allowed, and this account is not waiting for
 * permission.
 */
export function VendorDashboard() {
  const query = useVendorDashboard()
  const [openTripId, setOpenTripId] = useState<string | null>(null)
  const canOpenDelivery = canReadDeliveries(useCurrentRole())

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl" aria-busy="true">
        <PageHeader title="Dashboard" description={DESCRIPTION} />
        <Skeleton className="h-[30rem] rounded-3xl sm:h-80 lg:h-64" />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((tile) => (
            <Skeleton key={tile} className="h-36 rounded-xl" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (query.isError || !query.data) {
    /**
     * Two quite different situations, told apart exactly as `/my-vendor` tells
     * them apart. A 403 means the account has not been linked to a vendor yet,
     * which only an administrator can fix — retrying it forever would be the
     * wrong advice. Anything else is a failure worth another go.
     */
    const unlinked = query.error?.statusCode === 403

    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="Dashboard" description={DESCRIPTION} />
        <EmptyState
          icon={Building2}
          badge={unlinked ? 'Not linked yet' : undefined}
          title={unlinked ? 'No vendor is linked to this account' : 'Could not load your dashboard'}
          description={
            unlinked
              ? 'A vendor account has to be linked to the vendor it speaks for before there is anything to show. An administrator does that from the Administration page.'
              : (query.error?.message ?? 'Something went wrong.')
          }
          action={
            unlinked ? undefined : (
              <Button onClick={() => void query.refetch()}>
                <RefreshCcw data-icon="inline-start" aria-hidden />
                Try again
              </Button>
            )
          }
          footnote={unlinked ? 'Contact an administrator to have your account linked.' : undefined}
        />
      </div>
    )
  }

  const dashboard = query.data

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Dashboard" description={DESCRIPTION} />

      <div className="space-y-4">
        <VendorDashboardHero dashboard={dashboard} />

        <VendorDashboardTiles dashboard={dashboard} />

        {/*
         * Two columns from `lg` and one below it, with what is outstanding
         * first in the source order: on a phone the backlog is what somebody
         * should meet before six months of history.
         */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <section aria-label="Needs attention" className="space-y-2">
              <h2 className="text-[13px] font-semibold tracking-tight">Needs attention</h2>
              <VendorDashboardAttention dashboard={dashboard} />
            </section>

            <VendorDashboardFleet dashboard={dashboard} />
          </div>

          <section className="overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-3">
            <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20"
                aria-hidden
              >
                <TrendingUp className="size-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[13px] font-semibold tracking-tight">Last six months</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  What the trips in each month were billed. A month with no trips is a zero, not a
                  gap.
                </p>
              </div>
            </header>
            <div className="p-4">
              <VendorDashboardMonths months={dashboard.figures.months} />
            </div>
          </section>
        </div>

        <VendorDashboardRecent
          trips={dashboard.recentTrips}
          onOpen={(trip) => setOpenTripId(trip.id)}
        />

        <p className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Eye className="mt-px size-3.5 shrink-0" aria-hidden />
          Everything here is your own vendor record and is read-only. Trips, bills and payments are
          entered by LBTS — contact the office to have anything corrected.
        </p>
      </div>

      <VendorTripDetailSheet
        vendorId={dashboard.vendor.id}
        tripId={openTripId}
        canOpenDelivery={canOpenDelivery}
        onClose={() => setOpenTripId(null)}
      />
    </div>
  )
}

const DESCRIPTION =
  'Your trips for LBTS — what went out, what came back, what it was billed and what is still due.'
