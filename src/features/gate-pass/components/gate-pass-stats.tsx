import { BadgeCheck, CalendarDays, RefreshCcw, Send, TriangleAlert, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { GatePassStats as Stats } from '../types'

interface StatDef {
  key: keyof Stats
  labelKey: TranslationKey
  hintKey: TranslationKey
  icon: LucideIcon
  chip: string
  /** Drawn only while the figure is non-zero — a queue that needs attention. */
  emphasis?: string
}

const STATS: StatDef[] = [
  {
    key: 'today',
    labelKey: 'gatePass.stats.today',
    hintKey: 'gatePass.stats.todayHint',
    icon: CalendarDays,
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  {
    key: 'submitted',
    labelKey: 'gatePass.stats.submitted',
    hintKey: 'gatePass.stats.submittedHint',
    icon: Send,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    emphasis: 'ring-1 ring-tone-amber/30',
  },
  {
    key: 'verified',
    labelKey: 'gatePass.stats.verified',
    hintKey: 'gatePass.stats.verifiedHint',
    icon: BadgeCheck,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  {
    key: 'rejected',
    labelKey: 'gatePass.stats.rejected',
    hintKey: 'gatePass.stats.rejectedHint',
    icon: Undo2,
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    emphasis: 'ring-1 ring-tone-rose/30',
  },
]

interface GatePassStatsProps {
  stats: Stats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/**
 * Four real counts, from one grouped aggregation scoped to what the viewer may
 * see. Never a placeholder figure: an overview that invents numbers is worse
 * than one that admits it has none, so a failed request says so and offers a
 * retry.
 *
 * Deliberately counts rather than charts. Four numbers answer "is there
 * anything waiting for me" at a glance, which is the only question this row is
 * for; a chart of gate passes per day would be decoration on an operations
 * screen.
 */
export function GatePassStats({ stats, isLoading, isError, onRetry }: GatePassStatsProps) {
  const t = useT()

  if (isError) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          {t('gatePass.stats.loadFailed')}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {t('common.actions.retry')}
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
                {t(stat.labelKey)}
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
                {formatNumber(value)}
              </p>
            )}

            <p className="mt-2 text-[11px] text-muted-foreground/80">{t(stat.hintKey)}</p>
          </div>
        )
      })}
    </div>
  )
}
