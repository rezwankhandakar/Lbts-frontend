import type { ReactNode } from 'react'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { plural, shortTripNumber, taka } from '@/features/delivery/lib/delivery-meta'
import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { VendorTripRecord } from '../types'
import { netOf, tripProgress } from '../lib/trip-figures'
import { TripCharge } from './vendor-trip-list-parts'

function Figure({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-semibold wrap-break-word tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * The trips as cards, for everything narrower than the table needs.
 *
 * Nine columns only fit from `xl`, so a phone *and* a tablet get these rather
 * than a table that scrolls sideways and hides the money off the edge. The five
 * figures sit in a strip that is two columns on a phone — with the net amount
 * across the bottom, because it is the one somebody is looking for — and one
 * row of five from `sm`, where they fit.
 */
export function VendorTripCards({
  records,
  onOpen,
}: {
  records: VendorTripRecord[]
  onOpen: (trip: VendorTripRecord) => void
}) {
  return (
    <ul className="divide-y xl:hidden">
      {records.map((trip) => (
        <li key={trip.id}>
          <button
            type="button"
            onClick={() => onOpen(trip)}
            className="w-full px-3 py-3.5 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">
                  {shortTripNumber(trip.tripNumber)}
                </p>
                <p className="text-xs text-muted-foreground">{formatDay(trip.tripDate)}</p>
              </div>
              <TripStatusBadge value={trip.status} progress={tripProgress(trip)} />
            </div>

            <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
              <span className="font-mono text-foreground">{trip.registrationNo}</span>
              <span>{trip.driverName}</span>
              <span>
                {plural(trip.challanCount, 'challan')} · {trip.totalQty} pcs
                {trip.returnedQty > 0 && (
                  <span className="text-tone-rose"> · {trip.returnedQty} back</span>
                )}
              </span>
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border bg-muted/30 p-2.5 text-xs sm:grid-cols-5">
              <Figure label="Trip rent">
                <TripCharge value={trip.tripRent} />
              </Figure>
              <Figure label="Labour">
                <TripCharge value={trip.labourBill} />
              </Figure>
              <Figure label="Total amount">{taka(trip.bill)}</Figure>
              <Figure label="Advance">{taka(trip.advance)}</Figure>
              <Figure
                label="Net amount"
                className="col-span-2 flex items-baseline justify-between gap-3 border-t pt-2 sm:col-span-1 sm:block sm:border-0 sm:pt-0"
              >
                <span className="text-sm">{taka(netOf(trip))}</span>
              </Figure>
            </dl>
          </button>
        </li>
      ))}
    </ul>
  )
}
