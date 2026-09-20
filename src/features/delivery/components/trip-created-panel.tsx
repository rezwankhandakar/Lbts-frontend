import { ArrowRight, CircleCheckBig, ListChecks, Plus, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { plural, shortTripNumber } from '../lib/delivery-meta'
import { printManifest } from '../lib/print-manifest'
import type { TripRecord } from '../types'

interface TripCreatedPanelProps {
  trip: TripRecord
  /** False when an existing trip was saved rather than a new one created. */
  isNew: boolean
  onStartAnother: () => void
}

/**
 * What the operator sees the moment a trip is numbered.
 *
 * The trip number is the largest thing on the screen, because it is the thing
 * that is written on the gate register and read out to the vendor. The next
 * step — another delivery — is the primary button, since a gate rarely sends
 * one lorry.
 *
 * **The manifest prints from here**, rather than only from the trip's own
 * page. This is the moment the driver is standing at the desk waiting for a
 * sheet, and sending the operator through the trip page to find the button is
 * a navigation that exists for no reason: the confirmation response already
 * carries the whole trip, challans included, so there is nothing to fetch.
 */
export function TripCreatedPanel({ trip, isNew, onStartAnother }: TripCreatedPanelProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-10 text-center shadow-sm sm:px-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-success/15 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg ring-8 ring-success/15">
          <CircleCheckBig className="size-8" aria-hidden />
        </span>

        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {isNew ? `Trip assigned to ${trip.vendor.name}` : 'Trip saved'}
        </p>
        <h2 className="mt-1 font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          {shortTripNumber(trip.tripNumber)}
        </h2>

        <dl className="mt-6 grid w-full gap-px overflow-hidden rounded-xl border bg-border text-sm sm:grid-cols-3">
          {[
            ['Vehicle', trip.vehicle.registrationNo],
            ['Driver', trip.driver.name],
            ['Date', formatDay(trip.tripDate)],
          ].map(([label, value]) => (
            <div key={label} className="bg-card px-3 py-2.5">
              <dt className="text-[11px] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium wrap-break-word">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-xs text-muted-foreground">
          {plural(trip.challanCount, 'challan')} · {plural(trip.totalQty, 'piece')}
          {trip.changedLines > 0 && ` · ${plural(trip.changedLines, 'line')} changed from the paper`}
        </p>

        <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          {isNew && (
            <Button type="button" size="lg" onClick={onStartAnother}>
              <Plus data-icon="inline-start" aria-hidden />
              Start another delivery
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => printManifest(trip)}>
            <Printer data-icon="inline-start" aria-hidden />
            Print manifest
          </Button>
          <Button variant="outline" size="lg" render={<Link to={`/delivery/${trip.id}`} />}>
            Open the trip
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
          <Button variant="ghost" size="lg" render={<Link to="/delivery" />}>
            <ListChecks data-icon="inline-start" aria-hidden />
            All deliveries
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          The manifest carries this trip&rsquo;s barcode — scanning it on the deliveries page
          opens the trip again.
        </p>
      </div>
    </section>
  )
}
