import { CalendarDays, Package, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { plural, shortTripNumber, taka } from '../lib/delivery-meta'
import { useRowLink } from '../hooks/use-row-link'
import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripStatusBadge } from './delivery-badges'
import { TripRowMenu } from './trip-row-menu'

/**
 * The trips on a narrow screen. A swap rather than a scrolling table, in the
 * same reading order as the row, so somebody moving between a desk and a phone
 * sees the same record laid out differently.
 */
export function TripCards({ records, actions }: { records: TripRecord[]; actions: TripActions }) {
  const openRow = useRowLink()

  return (
    <ul className="divide-y md:hidden">
      {records.map((trip) => (
        <li
          key={trip.id}
          className="cursor-pointer p-4 transition-colors hover:bg-muted/40"
          onClick={openRow(`/delivery/${trip.id}`)}
        >
          <div className="flex items-start gap-3">
            <Link to={`/delivery/${trip.id}`} className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <p className="font-mono text-sm font-semibold">
                {shortTripNumber(trip.tripNumber)}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {trip.vehicle.registrationNo}
              </p>
              <p className="truncate text-xs text-muted-foreground">{trip.vendor.name}</p>
            </Link>
            <TripStatusBadge
              value={trip.status}
              progress={{ done: trip.completedChallans, total: trip.challanCount }}
            />
            <TripRowMenu trip={trip} actions={actions} />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{formatDay(trip.tripDate)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate text-foreground">{trip.driver.name}</span>
            </span>
            <span className="flex items-center justify-end gap-1.5 text-muted-foreground">
              <Package className="size-3.5 shrink-0" aria-hidden />
              <span className="font-semibold text-foreground tabular-nums">{trip.totalQty}</span> pcs
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{plural(trip.challanCount, 'challan')}</span>
            <span>
              Rent{' '}
              <span className="font-semibold text-foreground tabular-nums">
                {trip.tripRent === null ? '—' : taka(trip.tripRent)}
              </span>
            </span>
            <span>
              Labour{' '}
              <span className="font-semibold text-foreground tabular-nums">
                {trip.labourBill === null ? '—' : taka(trip.labourBill)}
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
