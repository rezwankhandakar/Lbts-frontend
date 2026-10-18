import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import { shortTripNumber } from '../lib/delivery-meta'
import { useRowLink } from '../hooks/use-row-link'
import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripStatusBadge } from './delivery-badges'
import { BillAmount, DriverName, PlateBadge } from './trip-cells'
import { TripRowMenu } from './trip-row-menu'

/** The column headings: small capitals, quiet, so the values carry the row. */
const HEAD = 'h-10 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'

/**
 * The trips on a wide screen: one row per trip, in the order it is read at a
 * gate — which trip, which day, which lorry and whose, who drove, what it
 * carried, what it cost, where it stands.
 *
 * Drawn from `xl` only. Ten columns want about 900px, and beside an open
 * sidebar a laptop's content column is well short of that until 1280 — so
 * below it the cards stand in rather than the table scrolling sideways.
 *
 * Set for reading rather than for density: every value at 13px or more, a
 * row tall enough to hold its second line without crowding it, the plate as
 * a plate, the driver behind their initials, and a blank bill in amber rather
 * than a dash that reads the same as a zero. The challans are counted rather
 * than listed: the numbers are on the trip's own page, and a truncated run of
 * them in a cell was one nobody could read.
 */
export function TripTable({
  records,
  actions,
  listState,
}: {
  records: TripRecord[]
  actions: TripActions
  /** Router state handed to the trip a row opens — the list's filters. */
  listState?: unknown
}) {
  const t = useT()
  const format = useFormatters()

  const openRow = useRowLink()

  return (
    <div className="hidden overflow-x-auto xl:block">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${HEAD} pl-4`}>{t('delivery.table.trip')}</TableHead>
            <TableHead className={HEAD}>{t('delivery.table.date')}</TableHead>
            <TableHead className={HEAD}>{t('delivery.table.vehicle')}</TableHead>
            <TableHead className={HEAD}>{t('delivery.table.driver')}</TableHead>
            <TableHead className={HEAD}>{t('delivery.table.challans')}</TableHead>
            <TableHead className={`${HEAD} text-right`}>{t('delivery.manifest.qty')}</TableHead>
            <TableHead className={`${HEAD} text-right`}>{t('delivery.table.tripRent')}</TableHead>
            <TableHead className={`${HEAD} text-right`}>{t('delivery.table.labourBill')}</TableHead>
            <TableHead className={HEAD}>{t('delivery.table.status')}</TableHead>
            <TableHead className="w-10 pr-4">
              <span className="sr-only">{t('delivery.table.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((trip) => (
            <TableRow
              key={trip.id}
              className="cursor-pointer hover:bg-primary/[0.035]"
              onClick={openRow(`/delivery/${trip.id}`, listState)}
            >
              <TableCell className="py-3 pl-4">
                <Link
                  to={`/delivery/${trip.id}`}
                  state={listState}
                  className="font-mono text-[13px] font-bold text-primary hover:underline"
                >
                  {shortTripNumber(trip.tripNumber)}
                </Link>
                <p className="max-w-44 truncate text-xs text-muted-foreground">{trip.vendor.name}</p>
              </TableCell>
              <TableCell className="py-3 text-[13px]">{format.calendarDay(trip.tripDate)}</TableCell>
              <TableCell className="py-3">
                <PlateBadge plate={trip.vehicle.registrationNo} />
                <p className="mt-1 text-xs text-muted-foreground">{trip.vehicle.ownershipType}</p>
              </TableCell>
              <TableCell className="py-3">
                <DriverName
                  name={trip.driver.name}
                  note={trip.driverIsOverride ? t('delivery.trip.forThisTripOnly') : undefined}
                />
              </TableCell>
              <TableCell className="py-3">
                <p className="text-[13px] font-medium">{countOf(trip.challanCount, 'nouns.challan', t)}</p>
                {trip.changedLines > 0 && (
                  <p className="text-xs text-tone-violet">
                    {t('delivery.list.linesChanged', { count: trip.changedLines, n: format.number(trip.changedLines) })}
                  </p>
                )}
              </TableCell>
              <TableCell className="py-3 text-right text-sm font-bold tabular-nums">
                {format.number(trip.totalQty)}
              </TableCell>
              <TableCell className="py-3 text-right">
                <BillAmount amount={trip.tripRent} />
              </TableCell>
              <TableCell className="py-3 text-right">
                <BillAmount amount={trip.labourBill} />
              </TableCell>
              <TableCell className="py-3">
                <TripStatusBadge
                  value={trip.status}
                  progress={{ done: trip.completedChallans, total: trip.challanCount }}
                />
              </TableCell>
              <TableCell className="py-3 pr-4">
                <TripRowMenu trip={trip} actions={actions} listState={listState} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
