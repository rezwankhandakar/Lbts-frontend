import { CalendarClock, History, Siren, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { rangeFor } from '@/lib/date-ranges'
import { useFormatters, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ActivityFilterPatch, ActivityListParams, ActivityStats } from '../types'
import { ActivityTrend } from './activity-trend'

interface ActivityOverviewProps {
  stats: ActivityStats | undefined
  isLoading: boolean
  params: ActivityListParams
  onChange: (patch: ActivityFilterPatch) => void
}

interface Tile {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  chip: string
  /** Pressing the tile applies this filter, and pressing it again clears it. */
  filter?: { pressed: boolean; apply: ActivityFilterPatch; clear: ActivityFilterPatch }
}

/**
 * What the journal under the current filters adds up to.
 *
 * Every figure answers the filters rather than the page, like every total in
 * this app — so narrowing to Accounts makes these four numbers describe
 * Accounts, and the tiles that are also filters narrow the others in turn.
 *
 * **Tiles are drawn at zero.** These are readings rather than a to-do list: a
 * critical count of nought is the answer somebody wants, and an absent tile
 * would read as "no information" rather than "nothing happened". That is the
 * opposite rule to the backlog chips in Challan, and the distinction is
 * deliberate — those are jobs, these are measurements.
 */
export function ActivityOverview({ stats, isLoading, params, onChange }: ActivityOverviewProps) {
  const t = useT()
  const format = useFormatters()

  if (isLoading || !stats) {
    return (
      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[6.25rem] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[6.25rem] rounded-xl" />
      </div>
    )
  }

  const today = rangeFor('today')
  const todayPressed = params.from === today.from && params.to === today.to

  const tiles: Tile[] = [
    {
      label: t('activity.overview.recorded'),
      value: format.number(stats.total),
      hint:
        stats.byModule.length > 0
          ? t('activity.overview.mostIn', {
              module: stats.byModule[0]?.label ?? '',
              count: format.number(stats.byModule[0]?.count ?? 0),
            })
          : t('activity.overview.noMatches'),
      icon: History,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    },
    {
      label: t('activity.overview.today'),
      value: format.number(stats.today),
      hint: t('activity.overview.lastSevenDays', { n: format.number(stats.week) }),
      icon: CalendarClock,
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
      filter: {
        pressed: todayPressed,
        apply: { from: today.from, to: today.to },
        clear: { from: '', to: '' },
      },
    },
    {
      label: t('activity.overview.critical'),
      value: format.number(stats.critical),
      hint: t('activity.overview.criticalHint'),
      icon: Siren,
      chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
      filter: {
        pressed: params.severity === 'critical',
        apply: { severity: 'critical' },
        clear: { severity: 'all' },
      },
    },
    {
      label: t('activity.overview.people'),
      value: format.number(stats.actors),
      hint:
        stats.topActors.length > 0
          ? t('activity.overview.busiest', {
              name: stats.topActors[0]?.name ?? '',
              count: format.number(stats.topActors[0]?.count ?? 0),
            })
          : t('activity.overview.nobody'),
      icon: Users,
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    },
  ]

  return (
    <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => {
          const body = (
            <>
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg ring-1',
                  tile.chip,
                )}
              >
                <tile.icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-2xl leading-tight font-semibold tracking-tight tabular-nums">
                  {tile.value}
                </span>
                <span className="mt-0.5 block text-[13px] font-medium">{tile.label}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {tile.hint}
                </span>
              </span>
            </>
          )

          const base = 'flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs'

          if (!tile.filter) {
            return (
              <div key={tile.label} className={base}>
                {body}
              </div>
            )
          }

          const { pressed, apply, clear } = tile.filter
          return (
            <button
              key={tile.label}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(pressed ? clear : apply)}
              className={cn(
                base,
                'transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50',
                pressed && 'border-primary/50 ring-2 ring-primary/15',
              )}
            >
              {body}
            </button>
          )
        })}
      </div>

      <ActivityTrend trend={stats.trend} />
    </div>
  )
}
