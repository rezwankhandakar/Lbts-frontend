import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { useRowLink } from '@/features/delivery/hooks/use-row-link'
import { plural, shortTripNumber, taka } from '@/features/delivery/lib/delivery-meta'
import { formatDay } from '../lib/vendor-meta'
import type { VendorTripRecord } from '../types'

interface VendorTripListProps {
  records: VendorTripRecord[]
  /** True for an account that may open a trip in Delivery; false for a Vendor account. */
  canOpen: boolean
}

function amount(value: number | null) {
  return value === null ? <span className="text-muted-foreground">—</span> : taka(value)
}

/**
 * The vendor's trips as a table on a wide screen and as cards on a narrow one,
 * with nothing that changes anything. A row opens the trip only for somebody
 * who can read Delivery; for a Vendor account it is the whole record.
 */
export function VendorTripList({ records, canOpen }: VendorTripListProps) {
  const openRow = useRowLink()
  const href = (trip: VendorTripRecord) => `/delivery/${trip.id}`
  const progress = (trip: VendorTripRecord) => ({ done: trip.completedChallans, total: trip.challanCount })

  return (
    <>
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
              <TableHead className="pr-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((trip) => (
              <TableRow
                key={trip.id}
                className={canOpen ? 'cursor-pointer' : undefined}
                onClick={canOpen ? openRow(href(trip)) : undefined}
              >
                <TableCell className="pl-4 font-mono text-[13px] font-semibold">
                  {canOpen ? (
                    <Link to={href(trip)} className="hover:underline">
                      {shortTripNumber(trip.tripNumber)}
                    </Link>
                  ) : (
                    shortTripNumber(trip.tripNumber)
                  )}
                </TableCell>
                <TableCell className="text-[13px] whitespace-nowrap">{formatDay(trip.tripDate)}</TableCell>
                <TableCell className="font-mono text-[13px]">{trip.registrationNo}</TableCell>
                <TableCell className="text-[13px]">{trip.driverName}</TableCell>
                <TableCell className="text-[13px] whitespace-nowrap">{plural(trip.challanCount, 'challan')}</TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="font-semibold">{trip.totalQty.toLocaleString()}</span>
                  {trip.returnedQty > 0 && (
                    <span className="block text-[11px] text-tone-rose">{trip.returnedQty} came back</span>
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">{amount(trip.tripRent)}</TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">{amount(trip.labourBill)}</TableCell>
                <TableCell className="pr-4">
                  <TripStatusBadge value={trip.status} progress={progress(trip)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y md:hidden">
        {records.map((trip) => (
          <li
            key={trip.id}
            className={canOpen ? 'cursor-pointer p-4 hover:bg-muted/40' : 'p-4'}
            onClick={canOpen ? openRow(href(trip)) : undefined}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold">{shortTripNumber(trip.tripNumber)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDay(trip.tripDate)} · <span className="font-mono">{trip.registrationNo}</span> ·{' '}
                  {trip.driverName}
                </p>
              </div>
              <TripStatusBadge value={trip.status} progress={progress(trip)} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{plural(trip.challanCount, 'challan')}</span>
              <span>
                <span className="font-semibold text-foreground tabular-nums">{trip.totalQty}</span> pcs
              </span>
              <span>Rent <span className="font-semibold text-foreground">{amount(trip.tripRent)}</span></span>
              <span>Labour <span className="font-semibold text-foreground">{amount(trip.labourBill)}</span></span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
