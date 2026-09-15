import { Boxes, CalendarDays, FileStack, Layers, RefreshCcw, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ChallanStats as Stats } from '../types'

interface StatDef {
  key: keyof Stats
  label: string
  hint: string
  icon: LucideIcon
  chip: string
  /** Drawn only while the figure is non-zero — a queue that needs attention. */
  attention?: boolean
}

const STATS: StatDef[] = [
  {
    key: 'today',
    label: "Today's challans",
    hint: 'Filed since midnight',
    icon: CalendarDays,
    chip: 'bg-tone-indigo/10 text-tone-indigo',
  },
  {
    key: 'total',
    label: 'Challans on record',
    hint: 'Every challan ever filed',
    icon: FileStack,
    chip: 'bg-tone-cyan/10 text-tone-cyan',
  },
  {
    key: 'batchesProcessing',
    label: 'Batches in progress',
    hint: 'Source PDFs with pages unfiled',
    icon: Layers,
    chip: 'bg-tone-amber/10 text-tone-amber',
    attention: true,
  },
  {
    key: 'totalQty',
    label: 'Total quantity',
    hint: 'Units across every challan',
    icon: Boxes,
    chip: 'bg-tone-emerald/10 text-tone-emerald',
  },
]

interface ChallanStatsProps {
  stats: Stats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/**
 * Four real counts, from grouped aggregations on the server. Never a
 * placeholder figure: an overview that invents numbers is worse than one that
 * admits it has none, so a failed request says so and offers a retry.
 *
 * One strip rather than four boxes — the figures are read together, and four
 * bordered cards above a bordered table is a page made of outlines.
 *
 * "Batches in progress" is the one that earns its emphasis — a source PDF with
 * pages nobody filed is work left half done, and it is the only figure here
 * that means somebody should go and look at something.
 */
export function ChallanStats({ stats, isLoading, isError, onRetry }: ChallanStatsProps) {
  if (isError) {
    return (
      <div className="mb-5 flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          The challan overview could not be loaded.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border bg-card shadow-xs lg:grid-cols-4">
      {STATS.map((stat, index) => {
        const value = stats?.[stat.key]
        const Icon = stat.icon
        const needsAttention = stat.attention && Boolean(value)

        return (
          <div
            key={stat.key}
            className={cn(
              'flex min-w-0 flex-col gap-3 p-4 sm:p-5',
              index % 2 === 1 && 'border-l',
              index >= 2 && 'border-t lg:border-t-0',
              index === 2 && 'lg:border-l',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-md',
                  stat.chip,
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <p className="truncate text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>

            {isLoading || value === undefined ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <p className="flex items-center gap-2 text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
                {value.toLocaleString()}
                {needsAttention && (
                  <span className="size-2 rounded-full bg-tone-amber" aria-label="Needs attention" />
                )}
              </p>
            )}

            <p className="truncate text-[11px] text-muted-foreground/80">{stat.hint}</p>
          </div>
        )
      })}
    </div>
  )
}
