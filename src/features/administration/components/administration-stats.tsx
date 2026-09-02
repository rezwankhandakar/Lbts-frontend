import {
  CircleCheck,
  CircleMinus,
  Clock,
  RefreshCcw,
  TriangleAlert,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { UserStats } from '../types'

interface StatDef {
  key: keyof UserStats
  label: string
  hint: string
  icon: LucideIcon
  chip: string
  /** Drawn only while the figure is non-zero — a queue that needs attention. */
  emphasis?: string
}

const STATS: StatDef[] = [
  {
    key: 'total',
    label: 'Total users',
    hint: 'Every account on record',
    icon: UsersRound,
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  {
    key: 'pending',
    label: 'Pending approval',
    hint: 'Waiting on a decision',
    icon: Clock,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    emphasis: 'ring-1 ring-tone-amber/30',
  },
  {
    key: 'active',
    label: 'Active users',
    hint: 'Approved and able to sign in',
    icon: CircleCheck,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  {
    key: 'suspended',
    label: 'Suspended',
    hint: 'Access withdrawn',
    icon: CircleMinus,
    chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
  },
]

interface AdministrationStatsProps {
  stats: UserStats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/**
 * Four real counts, straight from one grouped aggregation. Never a placeholder
 * figure: an overview that invents numbers is worse than one that admits it
 * has none, so a failed request says so and offers a retry.
 *
 * Colour is confined to the icon chip. Tinting whole cards would turn the top
 * of the page into a rainbow and cost the figures their prominence.
 */
export function AdministrationStats({
  stats,
  isLoading,
  isError,
  onRetry,
}: AdministrationStatsProps) {
  if (isError) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          The account overview could not be loaded.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => {
        const value = stats?.[stat.key]
        const Icon = stat.icon

        return (
          <div
            key={stat.key}
            className={cn(
              'rounded-xl border bg-card p-4 shadow-sm transition-colors duration-200',
              stat.emphasis && value ? stat.emphasis : null,
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
                  stat.chip,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
            </div>

            {isLoading || value === undefined ? (
              <Skeleton className="mt-3 h-8 w-14" />
            ) : (
              <p className="mt-2 text-3xl leading-none font-semibold tracking-tight tabular-nums">
                {value}
              </p>
            )}

            <p className="mt-2 text-[11px] text-muted-foreground/80">{stat.hint}</p>
          </div>
        )
      })}
    </div>
  )
}
