import { ArrowRight, RefreshCcw, ScanLine, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentRole } from '@/hooks/use-current-role'
import { cn } from '@/lib/utils'
import { useGatePassStats } from '../hooks/use-gate-passes'
import { canReadGatePasses, canWriteGatePasses } from '../types'
import type { GatePassStats } from '../types'

interface Figure {
  key: keyof GatePassStats
  label: string
  className?: string
}

const FIGURES: Figure[] = [
  { key: 'today', label: 'Today' },
  { key: 'submitted', label: 'Awaiting check', className: 'text-tone-amber' },
  { key: 'verified', label: 'Verified', className: 'text-tone-emerald' },
  { key: 'rejected', label: 'Sent back', className: 'text-tone-rose' },
]

/**
 * The dashboard's view of Gate Pass: four real counts and a way in.
 *
 * Renders nothing at all for a role that cannot reach the module — a summary
 * of something you are not allowed to open is noise, not information. Every
 * figure comes from the same aggregation the records page uses, scoped to what
 * the viewer may see; nothing here is ever a placeholder number.
 */
export function GatePassSummaryCard() {
  const role = useCurrentRole()
  const canRead = canReadGatePasses(role)
  const query = useGatePassStats()

  if (!canRead) {
    return null
  }

  const stats = query.data
  const isEmpty = stats !== undefined && stats.total === 0

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-cyan/10 text-tone-cyan ring-1 ring-tone-cyan/20"
          aria-hidden
        >
          <ScanLine className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Gate Pass</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Trips recorded against a scanned hard copy.
          </p>
        </div>

        <Button variant="ghost" size="sm" render={<Link to="/gate-pass" />} className="shrink-0">
          Open
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isError ? (
        <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
            The gate pass summary could not be loaded.
          </p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Retry
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="px-4 py-6 text-center sm:px-5">
          <p className="text-sm text-muted-foreground">No gate passes on record yet.</p>
          {canWriteGatePasses(role) && (
            <Button size="sm" className="mt-3" render={<Link to="/gate-pass/new" />}>
              File the first one
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
                  stats[figure.key]
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
