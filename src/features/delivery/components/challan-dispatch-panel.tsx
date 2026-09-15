import { ArrowRight, PackageX, Truck, Undo2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDay } from '@/features/vendor/lib/vendor-meta'
import { cn } from '@/lib/utils'
import { useChallanDispatch } from '../hooks/use-deliveries'
import { plural, shortTripNumber, tripStatusMeta } from '../lib/delivery-meta'
import type { ChallanDispatchDetail } from '../types'
import { DispatchCorrections, DispatchReturns } from './challan-dispatch-notes'
import { TripStatusBadge } from './delivery-badges'

/**
 * What happened to a challan's goods, on the challan's own page.
 *
 * A challan says what was ordered; only the trips know what left the gate, so
 * this is the one place the two are shown together — line by line, with the
 * lorries that carried them, what came back, and what each corrected. It reads
 * as the answer to the questions somebody has in front of a challan: has it
 * gone, who took it, what came back, and why does it say `Amended`.
 *
 * It lives in the Delivery feature and is mounted by the Challan page, the way
 * the dashboard mounts each module's own summary card: the data is trips, and
 * Challan should not have to know how a trip is shaped.
 */
export function ChallanDispatchPanel({ challanId }: { challanId: string }) {
  const query = useChallanDispatch(challanId)

  if (query.isPending) {
    return <Skeleton className="h-40 w-full rounded-xl" />
  }

  if (query.isError) {
    return null
  }

  return <DispatchBody detail={query.data} />
}

function DispatchBody({ detail }: { detail: ChallanDispatchDetail }) {
  const sent = detail.dispatched > 0
  const returned = detail.returns.reduce((sum, entry) => sum + entry.qty, 0)
  const summary = [
    sent
      ? `${detail.dispatched} of ${detail.ordered} pieces sent`
      : 'Nothing on this challan has been delivered yet',
    returned > 0 ? `${returned} came back` : null,
    sent && detail.remaining > 0 ? `${detail.remaining} still to go` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <section aria-label="Dispatch" className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
            sent
              ? 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20'
              : 'bg-muted text-muted-foreground ring-border',
          )}
          aria-hidden
        >
          {sent ? <Truck className="size-4" /> : <PackageX className="size-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">Dispatch</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{summary}</p>
        </div>
      </header>

      {(sent || returned > 0) && (
        <ul className="divide-y">
          {detail.lines.map((line) => (
            <li key={`${line.productName}|${line.model}`} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium wrap-break-word">{line.productName}</p>
                <p className="font-mono text-xs text-muted-foreground">{line.model}</p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    line.remaining === 0 ? 'text-tone-emerald' : 'text-tone-cyan',
                  )}
                >
                  {line.dispatched} of {line.ordered}
                </span>
                {line.returned > 0 && (
                  <p className="flex items-center justify-end gap-1 text-[11px] text-tone-rose tabular-nums">
                    <Undo2 className="size-3" aria-hidden />
                    {line.returned} came back
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {detail.trips.length > 0 && (
        <ul className="divide-y border-t">
          {detail.trips.map((trip) => {
            const Icon = tripStatusMeta(trip.status).icon

            return (
              <li key={trip.id}>
                <Link
                  to={`/delivery/${trip.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[13px] font-semibold">
                      {shortTripNumber(trip.tripNumber)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDay(trip.tripDate)} · {trip.registrationNo} · {trip.driverName}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-xs tabular-nums">
                    <span className="font-semibold">{plural(trip.qty, 'pc', 'pcs')}</span>
                    {trip.returnedQty > 0 && (
                      <span className="block text-[11px] text-tone-rose">
                        {trip.returnedQty} came back
                      </span>
                    )}
                  </span>
                  <TripStatusBadge value={trip.status} />
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {detail.returns.length > 0 && <DispatchReturns returns={detail.returns} />}
      {detail.corrections.length > 0 && <DispatchCorrections corrections={detail.corrections} />}
    </section>
  )
}
