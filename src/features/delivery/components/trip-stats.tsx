import { CalendarDays, RefreshCcw, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { countOf, useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { TRIP_STATUS_META, tripStatusMeta } from '../lib/delivery-meta'
import type { TripStats, TripStatus } from '../types'

interface TripStatsProps {
  stats: TripStats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** Pressing a status card filters the list to it. */
  onStatus: (status: TripStatus) => void
  /** Pressing the today card filters the list to today's trips. */
  onToday: () => void
}

interface Card {
  key: string
  label: string
  value: (stats: TripStats) => number
  caption: (stats: TripStats) => string
  icon: LucideIcon
  tile: string
  status?: TripStatus
}

/**
 * The three cards, built per render rather than once at import.
 *
 * A list frozen at module scope would keep whichever language the tab opened
 * in — the same reason every `*_META` lookup in this module takes a
 * translator rather than reaching for one.
 */
function cardsFor(t: Translator): Card[] {
  return [
    {
      key: 'today',
      label: t('delivery.list.tripsToday'),
      value: (stats) => stats.today,
      caption: (stats) => countOf(stats.todayQty, 'nouns.pc', t),
      icon: CalendarDays,
      tile: 'bg-primary/10 text-primary ring-primary/20',
    },
    ...(['Open', 'Completed'] as const).map((status) => ({
      key: status,
      label: tripStatusMeta(status, t).label,
      value: (stats: TripStats) => (status === 'Open' ? stats.open : stats.completed),
      caption: () => tripStatusMeta(status, t).description.split('.')[0],
      icon: TRIP_STATUS_META[status].icon,
      tile: TRIP_STATUS_META[status].tile,
      status,
    })),
  ]
}

/**
 * Three counts across the top of the deliveries page. The two status cards are
 * buttons — a count is a way into the list, not a number to look at, the same
 * rule the Challan backlog chips follow.
 *
 * `Open` is the one that matters: those are the trips with a signed copy still
 * to come back, which is the pile somebody is working through.
 */
export function TripStatsPanel({ stats, isLoading, isError, onRetry, onStatus, onToday }: TripStatsProps) {
  const t = useT()

  if (isError) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          {t('delivery.list.figuresFailed')}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cardsFor(t).map((card) => {
        const Icon = card.icon
        const body = (
          <>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', card.tile)}>
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-xs text-muted-foreground">{card.label}</span>
              <span className="mt-0.5 block text-2xl leading-none font-semibold tracking-tight tabular-nums">
                {isLoading || !stats ? <Skeleton className="h-6 w-10" /> : card.value(stats).toLocaleString()}
              </span>
              <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                {stats ? card.caption(stats) : ' '}
              </span>
            </span>
          </>
        )

        const className = 'flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm'

        // Every card is a way into the list: a status card filters by status,
        // the today card by today's date.
        const status = card.status
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => (status ? onStatus(status) : onToday())}
            className={cn(className, 'transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring')}
          >
            {body}
          </button>
        )
      })}
    </div>
  )
}
