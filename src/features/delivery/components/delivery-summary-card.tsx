import { ArrowRight, PackageCheck, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentRole } from '@/hooks/use-current-role'
import { cn } from '@/lib/utils'
import { useTripStats } from '../hooks/use-deliveries'
import { canReadDeliveries, canWriteDeliveries } from '../types'
import type { TripStats } from '../types'

interface Figure {
  key: keyof TripStats
  label: string
  className?: string
}

const FIGURES: Figure[] = [
  { key: 'today', label: 'Trips today' },
  { key: 'todayQty', label: 'Pcs today', className: 'text-primary' },
  /**
   * "Open" is the backlog somebody actually works: trips with a signed copy
   * still to come back. It replaced two counts of a status an operator used to
   * set by hand, which measured how diligent they had been rather than what
   * was outstanding.
   */
  { key: 'open', label: 'Awaiting copies', className: 'text-tone-amber' },
  { key: 'completed', label: 'Signed for', className: 'text-tone-emerald' },
]

/**
 * The dashboard's view of Delivery: four real counts and a way in. Renders
 * nothing for a role that cannot reach the module, and nothing here is ever a
 * placeholder — every figure is the same aggregation the deliveries page shows.
 */
export function DeliverySummaryCard() {
  const role = useCurrentRole()
  const readable = canReadDeliveries(role)
  const query = useTripStats(readable)

  if (!readable) {
    return null
  }

  const stats = query.data
  const isEmpty = stats !== undefined && stats.total === 0

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-amber/10 text-tone-amber ring-1 ring-tone-amber/20"
          aria-hidden
        >
          <PackageCheck className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Delivery</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Trips, and the challans that went out on them.</p>
        </div>
        <Button variant="ghost" size="sm" render={<Link to="/delivery" />} className="shrink-0">
          Open
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isError ? (
        <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
            The delivery summary could not be loaded.
          </p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Retry
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="px-4 py-6 text-center sm:px-5">
          <p className="text-sm text-muted-foreground">No trips on record yet.</p>
          {canWriteDeliveries(role) && (
            <Button size="sm" className="mt-3" render={<Link to="/delivery/new" />}>
              Create the first delivery
            </Button>
          )}
        </div>
      ) : (
        <dl className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
          {FIGURES.map((figure) => (
            <div key={figure.key} className="px-4 py-4 sm:px-5">
              <dt className="text-xs text-muted-foreground">{figure.label}</dt>
              <dd
                className={cn(
                  'mt-1.5 text-2xl leading-none font-semibold tracking-tight tabular-nums',
                  figure.className,
                )}
              >
                {query.isPending || stats === undefined ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  stats[figure.key].toLocaleString()
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
