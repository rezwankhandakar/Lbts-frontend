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
import {
  DeliveryOutcomeBadge,
  TripStatusBadge,
} from '@/features/delivery/components/delivery-badges'
import { plural, shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import { useVendorTrip } from '../hooks/use-vendors'
import { formatDay } from '../lib/vendor-meta'
import type { VendorTripDetail } from '../types'
import { InfoRow } from './form-parts'
import { PanelError } from './panel-states'
import { VendorTripMoney } from './vendor-trip-money'

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
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  )
}

function ChallanList({ challans }: { challans: VendorTripDetail['challans'] }) {
  return (
    <ul className="divide-y">
      {challans.map((challan) => (
        <li key={challan.challanNumber} className="space-y-1.5 py-2.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="font-mono text-[13px] font-semibold">{challan.challanNumber}</p>
              <p className="text-xs text-muted-foreground">
                SL {challan.slNumber} · Thana: {challan.thana || '—'} · District:{' '}
                {challan.district || '—'}
              </p>
            </div>
            <DeliveryOutcomeBadge
              value={challan.completionMethod ? 'Complete' : 'Pending'}
              method={challan.completionMethod}
            />
          </div>
          <ul className="space-y-0.5 text-xs">
            {challan.lines.map((line, index) => (
              <li
                key={`${line.productName}-${line.model}-${index}`}
                className="flex justify-between gap-3"
              >
                <span className="min-w-0 wrap-break-word">
                  {line.productName}
                  {line.model && <span className="text-muted-foreground"> · {line.model}</span>}
                </span>
                <span className="shrink-0 tabular-nums">
                  × {line.qty}
                  {line.returnedQty > 0 && (
                    <span className="text-tone-rose"> ({line.returnedQty} back)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

/**
 * One of a vendor's trips, in a side sheet — the same reading surface a vehicle
 * opens in, so the trip list stays behind it.
 *
 * Read-only for every account. It carries what the vendor's own work was — the
 * lorry, the driver, each challan's district and thana, what went and what came
 * back — and what the trip was billed and advanced. A customer's name, address and
 * number are not in the response at all, which is what lets a Vendor account
 * open it.
 */
export function VendorTripDetailSheet({
  vendorId,
  tripId,
  canOpenDelivery,
  onClose,
}: VendorTripDetailSheetProps) {
  const query = useVendorTrip(vendorId, tripId)
  const trip = query.data

  return (
    <Sheet open={tripId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono">
            {trip ? shortTripNumber(trip.tripNumber) : 'Trip'}
          </SheetTitle>
          <SheetDescription>
            {trip
              ? `${formatDay(trip.tripDate)} · ${plural(trip.challanCount, 'challan')} · ${trip.totalQty} pcs`
              : 'Loading…'}
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
              title="Could not load the trip"
              message={query.error?.message ?? 'Something went wrong.'}
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
                    Open in Delivery
                  </Button>
                )}
              </div>

              <Section title="Trip" icon={Truck}>
                <dl className="divide-y">
                  <InfoRow label="Vehicle">
                    <span className="font-mono">{trip.registrationNo}</span>
                  </InfoRow>
                  <InfoRow label="Driver">
                    {trip.driverName}
                    {trip.driverMobile && (
                      <span className="block text-xs text-muted-foreground">
                        {trip.driverMobile}
                      </span>
                    )}
                  </InfoRow>
                  <InfoRow label="Pieces">
                    {trip.deliveredQty} delivered
                    {trip.returnedQty > 0 && (
                      <span className="text-tone-rose"> · {trip.returnedQty} came back</span>
                    )}
                  </InfoRow>
                </dl>
              </Section>

              <Section title="Bill and payment" icon={Banknote}>
                <VendorTripMoney trip={trip} />
              </Section>

              <Section title="Challans" icon={FileText}>
                <ChallanList challans={trip.challans} />
              </Section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
