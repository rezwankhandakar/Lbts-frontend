import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TripStatusBadge } from '@/features/delivery/components/delivery-badges'
import { BillAmount, PlateBadge } from '@/features/delivery/components/trip-cells'
import { shortTripNumber } from '@/features/delivery/lib/delivery-meta'
import type { VendorTripRecord } from '../types'
import { VendorTripCards } from './vendor-trip-cards'
import { netOf, tripProgress } from '../lib/trip-figures'
import { countOf, useFormatters, useT } from '@/lib/i18n'

interface VendorTripListProps {
  records: VendorTripRecord[]
  /** Opens the trip's detail sheet. */
  onOpen: (trip: VendorTripRecord) => void
}

const MONEY = 'text-right whitespace-nowrap tabular-nums'
const HEAD = 'h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * The vendor's trips: a table from `xl`, where nine columns fit without
 * scrolling, and cards below it. Nothing on either changes anything — a row
 * opens the trip's detail sheet, which is read-only for every account. A row
 * carries its bill and its advances and no paid or due; a payment names a
 * month, so those are the monthly bill's.
 *
 * The plate and a blank bill are drawn with the Delivery list's own cells, so a
 * trip reads the same on the vendor's page as on the office's.
 */
export function VendorTripList({ records, onOpen }: VendorTripListProps) {
  const t = useT()
  const format = useFormatters()

  return (
    <>
      <div className="hidden overflow-x-auto xl:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className={`${HEAD} pl-5`}>{t('vendor.trip.trip')}</TableHead>
              <TableHead className={HEAD}>{t('vendor.trip.vehicleDriver')}</TableHead>
              <TableHead className={HEAD}>{t('vendor.trip.challans')}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t('vendor.trip.tripRent')}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t('vendor.trip.labour')}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t('vendor.trip.totalAmount')}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t('vendor.trip.advance')}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t('vendor.trip.netAmount')}</TableHead>
              <TableHead className={`${HEAD} pr-5`}>{t('vendor.trip.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((trip) => (
              <TableRow
                key={trip.id}
                tabIndex={0}
                aria-label={t('vendor.trip.openAria', { trip: shortTripNumber(trip.tripNumber) })}
                className="cursor-pointer outline-none focus-visible:bg-muted/50"
                onClick={() => onOpen(trip)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpen(trip)
                  }
                }}
              >
                <TableCell className="py-3.5 pl-5">
                  <span className="block font-mono text-sm font-semibold">
                    {shortTripNumber(trip.tripNumber)}
                  </span>
                  <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                    {format.calendarDay(trip.tripDate)}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <PlateBadge plate={trip.registrationNo} className="text-[13px]" />
                  <span className="mt-1 block max-w-48 truncate text-[13px] text-muted-foreground">
                    {trip.driverName}
                  </span>
                </TableCell>
                <TableCell className="py-3.5 text-sm whitespace-nowrap">
                  {countOf(trip.challanCount, 'nouns.challan', t)}
                  <span className="block text-[13px] text-muted-foreground">
                    {countOf(trip.totalQty, 'nouns.pc', t)}
                    {trip.returnedQty > 0 && (
                      <span className="text-tone-rose">
                        {' · '}
                        {t('vendor.trip.returned', { count: format.number(trip.returnedQty) })}
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className={MONEY}>
                  <BillAmount amount={trip.tripRent} className="text-sm" />
                </TableCell>
                <TableCell className={MONEY}>
                  <BillAmount amount={trip.labourBill} className="text-sm" />
                </TableCell>
                <TableCell className={`${MONEY} text-sm font-semibold`}>{format.taka(trip.bill)}</TableCell>
                <TableCell className={`${MONEY} text-sm`}>{format.taka(trip.advance)}</TableCell>
                <TableCell className={`${MONEY} text-base font-bold`}>{format.taka(netOf(trip))}</TableCell>
                <TableCell className="pr-5">
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
