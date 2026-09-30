import { Building2, FileWarning, RefreshCcw, TriangleAlert, Truck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { VendorStats } from '../types'

interface StatDef {
  key: keyof VendorStats
  labelKey: TranslationKey
  hintKey: TranslationKey
  icon: LucideIcon
  chip: string
  /** Drawn only while the figure is non-zero — a queue that wants attention. */
  emphasis?: string
}

/**
 * Four counts, and only the fourth is coloured.
 *
 * The first three are facts about the size of the operation and the fourth is a
 * backlog, so it is the only one that changes appearance when it is non-zero.
 * Colouring all four would make the row decoration, and a screen where
 * everything is urgent has nothing urgent on it.
 */
const STATS: StatDef[] = [
  {
    key: 'active',
    labelKey: 'vendor.stats.activeVendors',
    hintKey: 'vendor.stats.activeVendorsHint',
    icon: Building2,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  {
    key: 'vehicles',
    labelKey: 'vendor.stats.vehicles',
    hintKey: 'vendor.stats.acrossEvery',
    icon: Truck,
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  {
    key: 'drivers',
    labelKey: 'vendor.stats.drivers',
    hintKey: 'vendor.stats.acrossEvery',
    icon: Users,
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  },
  {
    key: 'expiredDocuments',
    labelKey: 'vendor.stats.expiredDocuments',
    hintKey: 'vendor.stats.expiredHint',
    icon: FileWarning,
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    emphasis: 'ring-1 ring-tone-rose/30',
  },
]

interface VendorStatsProps {
  stats: VendorStats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/**
 * Four real counts, scoped to what the viewer may see — a Vendor account's row
 * describes their own vendor rather than the collection.
 *
 * Never a placeholder figure: an overview that invents numbers is worse than
 * one that admits it has none, so a failed request says so and offers a retry.
 */
export function VendorStatsPanel({ stats, isLoading, isError, onRetry }: VendorStatsProps) {
  const t = useT()

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          {t('vendor.stats.loadFailed')}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
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
                {value}
              </p>
            )}

            <p className="mt-2 text-[11px] text-muted-foreground/80">{t(stat.hintKey)}</p>
          </div>
        )
      })}
    </div>
  )
}
