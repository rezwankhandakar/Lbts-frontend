import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { plural, shortTripNumber, taka } from '../lib/delivery-meta'
import { useRowLink } from '../hooks/use-row-link'
import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripStatusBadge } from './delivery-badges'
import { TripRowMenu } from './trip-row-menu'

/** A bill amount in a cell, or a quiet dash when nobody has entered it yet. */
function BillCell({ amount }: { amount: number | null }) {
  return (
    <TableCell className="text-right whitespace-nowrap tabular-nums">
      {amount === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <span className="font-medium">{taka(amount)}</span>
      )}
    </TableCell>
  )
}

/**
 * The trips on a wide screen: one row per trip, in the order it is read at a
 * gate — which trip, which day, which lorry and whose, who drove, what it
 * carried, what it cost, where it stands.
 *
 * The challans are counted rather than listed: the numbers are on the trip's
 * own page, and a truncated run of them in a cell was one nobody could read.
 */
export function TripTable({ records, actions }: { records: TripRecord[]; actions: TripActions }) {
  const openRow = useRowLink()

  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Trip</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Challans</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Trip rent</TableHead>
            <TableHead className="text-right">Labour bill</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((trip) => (
            <TableRow
              key={trip.id}
              className="cursor-pointer"
              onClick={openRow(`/delivery/${trip.id}`)}
            >
              <TableCell className="pl-4">
                <Link
                  to={`/delivery/${trip.id}`}
                  className="font-mono text-[13px] font-semibold hover:underline"
                >
                  {shortTripNumber(trip.tripNumber)}
                </Link>
                <p className="max-w-44 truncate text-xs text-muted-foreground">{trip.vendor.name}</p>
              </TableCell>
              <TableCell className="text-[13px] whitespace-nowrap">{formatDay(trip.tripDate)}</TableCell>
              <TableCell>
                <p className="font-mono text-[13px]">{trip.vehicle.registrationNo}</p>
                <p className="text-xs text-muted-foreground">{trip.vehicle.ownershipType}</p>
              </TableCell>
              <TableCell>
                <p className="text-[13px]">{trip.driver.name}</p>
                {trip.driverIsOverride && (
                  <p className="text-[11px] text-tone-indigo">For this trip only</p>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <p className="text-[13px] font-medium">{plural(trip.challanCount, 'challan')}</p>
                {trip.changedLines > 0 && (
                  <p className="text-xs text-muted-foreground">{trip.changedLines} changed</p>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {trip.totalQty.toLocaleString()}
              </TableCell>
              <BillCell amount={trip.tripRent} />
              <BillCell amount={trip.labourBill} />
              <TableCell>
                <TripStatusBadge
                  value={trip.status}
                  progress={{ done: trip.completedChallans, total: trip.challanCount }}
                />
              </TableCell>
              <TableCell className="pr-4">
                <TripRowMenu trip={trip} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
