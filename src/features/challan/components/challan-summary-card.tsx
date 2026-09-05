import { ArrowRight, ReceiptText, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentRole } from '@/hooks/use-current-role'
import { cn } from '@/lib/utils'
import { useChallanStats } from '../hooks/use-challans'
import { canReadChallans, canWriteChallans } from '../types'
import type { ChallanStats } from '../types'

interface Figure {
  key: keyof ChallanStats
  label: string
  className?: string
}

const FIGURES: Figure[] = [
  { key: 'today', label: 'Today' },
  { key: 'total', label: 'On record' },
  { key: 'batchesProcessing', label: 'Batches open', className: 'text-tone-amber' },
  { key: 'totalQty', label: 'Total qty', className: 'text-tone-emerald' },
]

/**
 * The dashboard's view of Challan: four real counts and a way in.
 *
 * Renders nothing at all for a role that cannot reach the module — a summary
 * of something you are not allowed to open is noise, not information. Every
 * figure comes from the same aggregation the records page uses; nothing here
 * is ever a placeholder number.
 *
 * "Batches open" is the one worth a colour. It counts source PDFs with pages
 * nobody has filed yet, which is the only figure on this card that means
 * somebody should go and finish something.
 */
export function ChallanSummaryCard() {
  const role = useCurrentRole()
  const query = useChallanStats()

  if (!canReadChallans(role)) {
    return null
  }

  const stats = query.data
  const isEmpty = stats !== undefined && stats.total === 0

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20"
          aria-hidden
        >
          <ReceiptText className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Challan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Deliveries filed out of the corporate office's PDFs.
          </p>
        </div>

        <Button variant="ghost" size="sm" render={<Link to="/challan" />} className="shrink-0">
          Open
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isError ? (
        <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
            The challan summary could not be loaded.
          </p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Retry
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="px-4 py-6 text-center sm:px-5">
          <p className="text-sm text-muted-foreground">No challans on record yet.</p>
          {canWriteChallans(role) && (
            <Button size="sm" className="mt-3" render={<Link to="/challan/new" />}>
              Open the first PDF
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
