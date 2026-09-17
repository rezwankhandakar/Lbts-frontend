import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { plural, shortTripNumber, taka } from '@/features/delivery/lib/delivery-meta'
import { formatDay } from '../lib/vendor-meta'
import type { VendorTripRecord } from '../types'
import { VendorTripCards } from './vendor-trip-cards'
import { netOf, tripProgress } from '../lib/trip-figures'
import { TripCharge } from './vendor-trip-list-parts'

interface VendorTripListProps {
  records: VendorTripRecord[]
  /** Opens the trip's detail sheet. */
  onOpen: (trip: VendorTripRecord) => void
}

const MONEY = 'text-right whitespace-nowrap tabular-nums'

/**
 * The vendor's trips: a table from `xl`, where nine columns fit without
 * scrolling, and cards below it. Nothing on either changes anything — a row
 * opens the trip's detail sheet, which is read-only for every account. A row
 * carries its bill and its advances and no paid or due; a payment names a
 * month, so those are the monthly bill's, above.
 */
export function VendorTripList({ records, onOpen }: VendorTripListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Trip</TableHead>
              <TableHead>Vehicle · driver</TableHead>
              <TableHead>Challans</TableHead>
              <TableHead className="text-right">Trip rent</TableHead>
              <TableHead className="text-right">Labour</TableHead>
              <TableHead className="text-right">Total amount</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Net amount</TableHead>
              <TableHead className="pr-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((trip) => (
              <TableRow
                key={trip.id}
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => onOpen(trip)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpen(trip)
                  }
                }}
              >
                <TableCell className="pl-4">
                  <span className="block font-mono text-[13px] font-semibold">
                    {shortTripNumber(trip.tripNumber)}
                  </span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground">
                    {formatDay(trip.tripDate)}
                  </span>
                </TableCell>
                <TableCell className="text-[13px]">
                  <span className="block font-mono">{trip.registrationNo}</span>
                  <span className="text-xs text-muted-foreground">{trip.driverName}</span>
                </TableCell>
                <TableCell className="text-[13px] whitespace-nowrap">
                  {plural(trip.challanCount, 'challan')}
                  <span className="block text-xs text-muted-foreground">
                    {trip.totalQty} pcs
                    {trip.returnedQty > 0 && (
                      <span className="text-tone-rose"> · {trip.returnedQty} back</span>
                    )}
                  </span>
                </TableCell>
                <TableCell className={MONEY}>
                  <TripCharge value={trip.tripRent} />
                </TableCell>
                <TableCell className={MONEY}>
                  <TripCharge value={trip.labourBill} />
                </TableCell>
                <TableCell className={`${MONEY} font-semibold`}>{taka(trip.bill)}</TableCell>
                <TableCell className={MONEY}>{taka(trip.advance)}</TableCell>
                <TableCell className={`${MONEY} font-semibold`}>{taka(netOf(trip))}</TableCell>
                <TableCell className="pr-4">
                  <TripStatusBadge value={trip.status} progress={tripProgress(trip)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VendorTripCards records={records} onOpen={onOpen} />
    </>
  )
}
