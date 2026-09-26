import { CircleSlash, Layers, Package, Tags } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ProductRateStats as Stats } from '../types'

interface ProductRateStatsProps {
  stats: Stats | undefined
  isLoading: boolean
}

interface Tile {
  label: string
  hint: string
  value: string
  icon: LucideIcon
  chip: string
}

/**
 * What the rate card currently holds.
 *
 * Four counts, and the last one is the reason the panel exists rather than
 * being a decoration. A tiered rate is the only figure on this card that
 * cannot be read as a number, and it is the one most likely to have been
 * transcribed wrongly — so how many of them there are is a thing an Admin
 * should be able to see without paging through the card looking for them.
 *
 * Real counts from the collection, never placeholders.
 */
export function ProductRateStatsPanel({ stats, isLoading }: ProductRateStatsProps) {
  const t = useT()
  const format = useFormatters()

  if (isLoading || !stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[5.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const tiles: Tile[] = [
    {
      label: t('productRate.stats.inUse'),
      hint: t('productRate.stats.inUseHint', {
        count: stats.products,
        n: format.number(stats.products),
      }),
      value: format.number(stats.active),
      icon: Tags,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
    {
      label: t('productRate.stats.byModel'),
      hint: t('productRate.stats.byModelHint', { n: format.number(stats.withoutModel) }),
      value: format.number(stats.withModel),
      icon: Package,
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    },
    {
      label: t('productRate.stats.tiered'),
      hint: t('productRate.stats.tieredHint'),
      value: format.number(stats.tiered),
      icon: Layers,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    },
    {
      label: t('productRate.stats.deactivated'),
      hint: t('productRate.stats.deactivatedHint'),
      value: format.number(stats.inactive),
      icon: CircleSlash,
      chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
                tile.chip,
              )}
            >
              <tile.icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xl leading-tight font-semibold tabular-nums">{tile.value}</p>
              <p className="mt-0.5 text-[13px] font-medium">{tile.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{tile.hint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
