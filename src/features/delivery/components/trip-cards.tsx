import { CalendarDays, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { shortTripNumber } from '../lib/delivery-meta'
import { useRowLink } from '../hooks/use-row-link'
import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripStatusBadge } from './delivery-badges'
import { BillAmount, DriverName, PlateBadge } from './trip-cells'
import { TripRowMenu } from './trip-row-menu'

/**
 * The trips below `xl` — one to a row on a phone, two on a tablet or a small
 * laptop, where the table's ten columns would only scroll sideways. A swap
 * rather than a scrolling table, in the
 * same reading order as the row and built from the same cells — the plate as
 * a plate, the driver behind their initials, a blank bill in amber — so
 * somebody moving between a desk and a phone sees the same record laid out
 * differently.
 */
export function TripCards({
  records,
  actions,
  listState,
}: {
  records: TripRecord[]
  actions: TripActions
  /** Router state handed to the trip a card opens — the list's filters. */
  listState?: unknown
}) {
  const t = useT()
  const format = useFormatters()

  const openRow = useRowLink()

  return (
    // One column on a phone and two from `md`. Each card draws its own bottom
    // rule, and the left one of a pair its right rule; `-mb-px` lays the last
    // row's rule over the pagination's top border rather than doubling it.
    <ul className="-mb-px grid md:grid-cols-2 xl:hidden">
      {records.map((trip) => (
        <li
          key={trip.id}
          className="min-w-0 cursor-pointer space-y-3 border-b p-4 transition-colors hover:bg-primary/[0.035] md:[&:nth-child(odd):not(:last-child)]:border-r"
          onClick={openRow(`/delivery/${trip.id}`, listState)}
        >
          <div className="flex items-start gap-2">
            <Link
              to={`/delivery/${trip.id}`}
              state={listState}
              className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-mono text-sm font-bold text-primary">{shortTripNumber(trip.tripNumber)}</p>
              <p className="truncate text-xs text-muted-foreground">{trip.vendor.name}</p>
            </Link>
            <TripStatusBadge
              value={trip.status}
              progress={{ done: trip.completedChallans, total: trip.challanCount }}
            />
            <TripRowMenu trip={trip} actions={actions} listState={listState} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <PlateBadge plate={trip.vehicle.registrationNo} />
            <DriverName
              name={trip.driver.name}
              note={trip.driverIsOverride ? t('delivery.trip.forThisTripOnly') : undefined}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {format.calendarDay(trip.tripDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" aria-hidden />
              <span className="font-semibold text-foreground">{countOf(trip.totalQty, 'nouns.pc', t)}</span>
              <span>· {countOf(trip.challanCount, 'nouns.challan', t)}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x rounded-lg bg-muted/50">
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t('delivery.table.tripRent')}
              </p>
              <BillAmount amount={trip.tripRent} />
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {t('delivery.table.labourBill')}
              </p>
              <BillAmount amount={trip.labourBill} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
