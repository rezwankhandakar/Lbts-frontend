import { ArrowRight, Navigation } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { shortTripNumber, taka } from '@/features/delivery/lib/delivery-meta'
import { formatDay } from '../lib/vendor-meta'
import { netOf, tripProgress } from '../lib/trip-figures'
import type { VendorTripRecord } from '../types'
import { countOf, useT } from '@/lib/i18n'

interface VendorDashboardRecentProps {
  trips: VendorTripRecord[]
  /** Opens the trip's read-only detail sheet — the Trips tab's own. */
  onOpen: (trip: VendorTripRecord) => void
}

/**
 * The last few trips, as a glance rather than as a list.
 *
 * Deliberately short and deliberately unfiltered: this answers "what went out
 * lately", and the Trips tab — searched, filtered, paged and totalled — is
 * where the list is actually worked. A dashboard that tries to be the list ends
 * up a list nobody opens and a dashboard nobody reads.
 *
 * A row opens the same detail sheet the Trips tab opens, by composing that
 * component rather than by linking away: the trip is read in place and the
 * dashboard is still behind it. The **net amount** is the figure on the row —
 * the bill less what has already been advanced against it — because that is the
 * one a vendor is looking for; the rent and labour behind it are in the sheet.
 */
export function VendorDashboardRecent({ trips, onOpen }: VendorDashboardRecentProps) {
  const t = useT()

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-indigo/10 text-tone-indigo ring-1 ring-tone-indigo/20"
          aria-hidden
        >
          <Navigation className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Latest trips</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The most recent runs for LBTS. Open one to see its challans and its money.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/my-vendor?tab=trips" />}
          className="shrink-0"
        >
          All trips
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {trips.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No trip has been run for LBTS yet. When one is, it appears here.
        </p>
      ) : (
        <ul className="divide-y">
          {trips.map((trip) => (
            <li key={trip.id}>
              <button
                type="button"
                onClick={() => onOpen(trip)}
                className="w-full px-4 py-3 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-semibold">
                      {shortTripNumber(trip.tripNumber)}
                      <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                        {formatDay(trip.tripDate)}
                      </span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-mono text-foreground">{trip.registrationNo}</span>
                      <span>{trip.driverName}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="text-sm font-semibold tabular-nums">{taka(netOf(trip))}</span>
                    <TripStatusBadge value={trip.status} progress={tripProgress(trip)} />
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  {countOf(trip.challanCount, 'nouns.challan', t)} · {trip.totalQty.toLocaleString()} pcs
                  {trip.returnedQty > 0 && (
                    <span className="text-tone-rose"> · {trip.returnedQty} back at depot</span>
                  )}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
