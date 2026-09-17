import { HandCoins, TriangleAlert, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { formatDay, signedTaka, taka } from '../lib/accounts-meta'
import type { VendorBillTrip } from '../types'

function Blank() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-tone-amber">
      <TriangleAlert className="size-3" aria-hidden />
      Not entered
    </span>
  )
}

/**
 * The month's trips, each with its own bill, what was advanced against it and
 * what it still asks of the monthly payment. A blank bill says so: it counts as
 * nothing, which is the one way a vendor's month can look paid when it is not.
 */
export function VendorTripTable({ trips, canWrite }: { trips: VendorBillTrip[]; canWrite: boolean }) {
  const dialog = useEntryDialog()

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <Truck className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">No trip ran for this vendor in the month.</p>
      </div>
    )
  }

  const advance = (trip: VendorBillTrip) =>
    dialog.open({
      kind: 'TripAdvance',
      preset: { tripId: trip.id },
      locked: ['tripId'],
      tripSummary: {
        label: `${trip.tripNumber} · ${trip.registrationNo}`,
        detail: `${formatDay(trip.tripDate)} · ${trip.driverName} · bill ${trip.tripRent === null && trip.labourBill === null ? 'not entered' : taka(trip.bill)}${trip.advance > 0 ? ` · ${taka(trip.advance)} advanced` : ''}`,
      },
    })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Trip</th>
            <th className="px-2 py-2.5 text-right font-medium">Trip rent</th>
            <th className="px-2 py-2.5 text-right font-medium">Labour</th>
            <th className="px-2 py-2.5 text-right font-medium">Bill</th>
            <th className="px-2 py-2.5 text-right font-medium">Advance</th>
            <th className="px-2 py-2.5 text-right font-medium">Net</th>
            {canWrite && <th className="px-4 py-2.5" aria-label="Actions" />}
          </tr>
        </thead>
        <tbody className="divide-y">
          {trips.map((trip) => (
            <tr key={trip.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-2.5">
                <Link to={`/delivery/${trip.id}`} className="font-medium hover:text-primary hover:underline">
                  {trip.tripNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatDay(trip.tripDate)} · {trip.registrationNo} · {trip.driverName}
                </p>
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{trip.tripRent === null ? <Blank /> : taka(trip.tripRent)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{trip.labourBill === null ? <Blank /> : taka(trip.labourBill)}</td>
              <td className="px-2 py-2.5 text-right font-medium tabular-nums">{taka(trip.bill)}</td>
              <td className="px-2 py-2.5 text-right text-muted-foreground tabular-nums">{trip.advance > 0 ? taka(trip.advance) : '—'}</td>
              <td className={cn('px-2 py-2.5 text-right font-semibold tabular-nums', trip.net < 0 && 'text-tone-violet')}>
                {signedTaka(trip.net)}
              </td>
              {canWrite && (
                <td className="px-4 py-2.5 text-right">
                  <Button variant="outline" size="sm" onClick={() => advance(trip)}>
                    <HandCoins data-icon="inline-start" aria-hidden />
                    Advance
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/30 text-sm font-semibold">
            <td className="px-4 py-2.5">{trips.length} trips</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(trips.reduce((sum, trip) => sum + (trip.tripRent ?? 0), 0))}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(trips.reduce((sum, trip) => sum + (trip.labourBill ?? 0), 0))}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(trips.reduce((sum, trip) => sum + trip.bill, 0))}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{taka(trips.reduce((sum, trip) => sum + trip.advance, 0))}</td>
            <td className="px-2 py-2.5 text-right tabular-nums">{signedTaka(trips.reduce((sum, trip) => sum + trip.net, 0))}</td>
            {canWrite && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
