import { Link } from 'react-router-dom'
import { Banknote, ExternalLink, FileText, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { PlateBadge } from '@/features/delivery/components/trip-cells'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { useVendorTrip } from '../hooks/use-vendors'
import { InfoRow } from './form-parts'
import { PanelError } from './panel-states'
import { VendorTripChallans } from './vendor-trip-challans'
import { VendorTripMoney } from './vendor-trip-money'
import { countOf, useFormatters, useT } from '@/lib/i18n'

interface VendorTripDetailSheetProps {
  vendorId: string
  /** The trip to show; null closes the sheet. */
  tripId: string | null
  /** Staff who can read Delivery get a way through to the full trip. */
  canOpenDelivery: boolean
  onClose: () => void
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Truck
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 border-b pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-4" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * One of a vendor's trips, in a side sheet — the same reading surface a vehicle
 * opens in, so the trip list stays behind it.
 *
 * Read-only for every account. It carries what the vendor's own work was — the
 * lorry, the driver, where each challan went (its delivery address, thana and
 * district), what went and what came back — and what the trip was billed and
 * advanced. A customer's name and the receiver's number are not in the response
 * at all, which is what lets a Vendor account open it.
 */
export function VendorTripDetailSheet({
  vendorId,
  tripId,
  canOpenDelivery,
  onClose,
}: VendorTripDetailSheetProps) {
  const t = useT()
  const format = useFormatters()

  const query = useVendorTrip(vendorId, tripId)
  const trip = query.data

  return (
    <Sheet open={tripId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-mono text-lg">
            {trip ? shortTripNumber(trip.tripNumber) : t('vendor.trip.tripFallback')}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {trip
              ? `${format.calendarDay(trip.tripDate)} · ${countOf(
                  trip.challanCount,
                  'nouns.challan',
                  t,
                )} · ${countOf(trip.totalQty, 'nouns.pc', t)}`
              : t('common.states.loading')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {query.isPending ? (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : query.isError || !trip ? (
            <PanelError
              title={t('vendor.trip.detailLoadFailed')}
              message={query.error?.message ?? t('vendor.somethingWrong')}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <TripStatusBadge
                  value={trip.status}
                  progress={{ done: trip.completedChallans, total: trip.challanCount }}
                />
                {canOpenDelivery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    render={<Link to={`/delivery/${trip.id}`} />}
                  >
                    <ExternalLink data-icon="inline-start" aria-hidden />
                    {t('vendor.trip.openInDelivery')}
                  </Button>
                )}
              </div>

              <Section title={t('vendor.trip.tripSection')} icon={Truck}>
                <dl className="divide-y">
                  <InfoRow label={t('vendor.trip.vehicle')}>
                    <PlateBadge plate={trip.registrationNo} className="text-[13px]" />
                  </InfoRow>
                  <InfoRow label={t('vendor.trip.driver')}>
                    <span className="text-sm">{trip.driverName}</span>
                    {trip.driverMobile && (
                      <a
                        href={`tel:${trip.driverMobile.replace(/\s/g, '')}`}
                        className="block w-fit text-[13px] text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {trip.driverMobile}
                      </a>
                    )}
                  </InfoRow>
                  <InfoRow label={t('vendor.trip.pieces')}>
                    <span className="text-sm">
                      {t('vendor.trip.deliveredCount', { count: format.number(trip.deliveredQty) })}
                    </span>
                    {trip.returnedQty > 0 && (
                      <span className="text-sm text-tone-rose">
                        {' · '}
                        {t('vendor.trip.cameBack', { count: format.number(trip.returnedQty) })}
                      </span>
                    )}
                  </InfoRow>
                </dl>
              </Section>

              <Section title={t('vendor.trip.billSection')} icon={Banknote}>
                <VendorTripMoney trip={trip} />
              </Section>

              <Section title={t('vendor.trip.challansSection')} icon={FileText}>
                <VendorTripChallans challans={trip.challans} />
              </Section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
