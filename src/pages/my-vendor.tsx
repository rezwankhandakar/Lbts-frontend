import { Building2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { localToday } from '@/features/delivery/lib/delivery-meta'
import { MyVendorHero, MyVendorHeroSkeleton } from '@/features/vendor/components/my-vendor-hero'
import { PanelSkeleton } from '@/features/vendor/components/panel-states'
import { VendorTripBoard } from '@/features/vendor/components/vendor-trip-board'
import { useVendorTripList } from '@/features/vendor/hooks/use-vendor-trip-list'
import { useMyVendor } from '@/features/vendor/hooks/use-vendors'
import { billPeriodLabel } from '@/features/vendor/lib/vendor-meta'
import type { VendorRecord } from '@/features/vendor/types'
import { useT } from '@/lib/i18n'

/**
 * The vendor account's own record: who they are, what they are owed, and their
 * trips.
 *
 * **This is a vendor's whole app.** There is no dashboard for this role — `/`
 * sends it here — and the business asked for a vendor to see their trips and
 * nothing else, so the fleet, the drivers, the assignments, the documents and
 * the overview are not tabs to be hidden here: this page never draws a tab bar
 * at all, and never asks for any of them. It is composed from the same pieces
 * the staff Trips tab uses — `useVendorTripList` and `VendorTripBoard` — with
 * the monthly bill moved up into the hero, so the two can never disagree about
 * a trip or a figure.
 *
 * **No id appears anywhere in the request.** `GET /vendors/me` reads the link
 * off the profile the auth middleware loaded from MongoDB, so a vendor user
 * never sends a vendor id and has nothing to tamper with. Every request the
 * trips then make carries the id this returned, and every one of those is
 * checked against the same profile — so even a hand-edited id in a network tab
 * is answered 404.
 *
 * The write controls are simply absent rather than disabled. A greyed-out
 * button is a promise of something that will never be allowed, and this account
 * is not waiting for permission.
 */
export function MyVendorPage() {
  const t = useT()

  const query = useMyVendor()

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
        <MyVendorHeroSkeleton />
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <PanelSkeleton rows={5} />
        </div>
      </div>
    )
  }

  if (query.isError || !query.data) {
    /**
     * Two quite different situations, and they are worth telling apart. A 403
     * means the account has not been linked to a vendor yet, which an
     * administrator fixes; anything else is a failure worth retrying.
     */
    const unlinked = query.error?.statusCode === 403

    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title={t('vendor.page.myTitle')}
          description={t('vendor.page.myDescription')}
        />
        <EmptyState
          icon={Building2}
          badge={unlinked ? t('vendor.page.notLinkedBadge') : undefined}
          title={unlinked ? t('vendor.page.notLinkedTitle') : t('vendor.page.myLoadFailed')}
          description={
            unlinked
              ? t('vendor.page.notLinkedDescription')
              : (query.error?.message ?? t('vendor.somethingWrong'))
          }
          action={
            unlinked ? undefined : (
              <Button onClick={() => void query.refetch()}>
                {t('common.actions.retry')}
              </Button>
            )
          }
          footnote={unlinked ? t('vendor.page.notLinkedFootnote') : undefined}
        />
      </div>
    )
  }

  return <MyVendorView vendor={query.data} />
}

/**
 * The page once the vendor is known. Its own component because the trip list's
 * state is a hook, and a hook cannot wait for the vendor id behind an early
 * return.
 */
function MyVendorView({ vendor }: { vendor: VendorRecord }) {
  const t = useT()
  const list = useVendorTripList(vendor.id)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
      <MyVendorHero
        vendor={vendor}
        bill={list.meta && !list.query.isPending ? list.meta.monthlyBill : undefined}
        period={billPeriodLabel(list.params.from, list.params.to, localToday(), t)}
        isFetching={list.query.isFetching}
      />

      <VendorTripBoard vendor={vendor} list={list} showBill={false} />

      <p className="flex items-start gap-2 px-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
        <Eye className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('vendor.page.readOnlyNotice')}
      </p>
    </div>
  )
}
