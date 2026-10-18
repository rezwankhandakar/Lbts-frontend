import { CalendarDays, RefreshCcw, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { countOf, useFormatters, useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { TRIP_STATUS_META, tripStatusMeta } from '../lib/delivery-meta'
import type { TripStats, TripStatus } from '../types'

interface TripStatsProps {
  stats: TripStats | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  /** Pressing a status card filters the list to it; pressing it again lets go. */
  onStatus: (status: TripStatus) => void
  /** Pressing the today card filters the list to today's trips; again lets go. */
  onToday: () => void
  /** Which card is the filter in force, so it can say so. */
  active: { status: TripStatus | null; today: boolean }
}

interface Card {
  key: string
  label: string
  value: (stats: TripStats) => number
  /** Drawn beside the number — today's pieces — when the card has one. */
  aside?: (stats: TripStats) => string
  /** What the count means, as the card's tooltip. */
  hint?: string
  icon: LucideIcon
  /** The status dot, for the two cards that are a status. */
  dot?: string
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
      aside: (stats) => countOf(stats.todayQty, 'nouns.pc', t),
      icon: CalendarDays,
    },
    ...(['Open', 'Completed'] as const).map((status) => ({
      key: status,
      label: tripStatusMeta(status, t).label,
      value: (stats: TripStats) => (status === 'Open' ? stats.open : stats.completed),
      hint: tripStatusMeta(status, t).description,
      icon: TRIP_STATUS_META[status].icon,
      dot: TRIP_STATUS_META[status].dot,
      status,
    })),
  ]
}

const TILE =
  'flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left ring-1 transition outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60 sm:px-3'

/**
 * Three counts on the deliveries page's brand band. Every card is a button —
 * a count is a way into the list, not a number to look at, the rule the
 * Challan backlog chips follow — and the one whose filter is in force is drawn
 * pressed, so the list beneath never looks filtered for no visible reason.
 *
 * `Open` is the one that matters: those are the trips with a signed copy still
 * to come back, which is the pile somebody is working through.
 *
 * Drawn for the gradient: glass rather than cards, and a skeleton of its own,
 * since the shared one is built for a light surface and vanishes on this one.
 * Two lines a card — the label, then the number — because the band is kept
 * thin; what a status count means is its tooltip rather than a caption cut off
 * halfway through its sentence.
 */
export function TripStatsPanel({ stats, isLoading, isError, onRetry, onStatus, onToday, active }: TripStatsProps) {
  const t = useT()
  const format = useFormatters()

  if (isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-foreground/10 px-3.5 py-3 ring-1 ring-primary-foreground/15">
        <p className="flex items-center gap-2 text-[13px]">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          {t('delivery.list.figuresFailed')}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-foreground/15 px-3 text-xs font-semibold ring-1 ring-primary-foreground/25 hover:bg-primary-foreground/25"
        >
          <RefreshCcw className="size-3.5" aria-hidden />
          {t('common.actions.retry')}
        </button>
      </div>
    )
  }

  return (
    // Three across even on a phone: stacked, they were three rows of band
    // above a list somebody opened the page to read. The icon is what gives
    // way below `sm`, so the label and the number keep the width.
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {cardsFor(t).map((card) => {
        const Icon = card.icon
        const status = card.status
        const pressed = status ? active.status === status : active.today

        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={pressed}
            title={card.hint}
            onClick={() => (status ? onStatus(status) : onToday())}
            className={cn(
              TILE,
              pressed
                ? 'bg-primary-foreground/25 ring-primary-foreground/45'
                : 'bg-primary-foreground/10 ring-primary-foreground/15 hover:bg-primary-foreground/15',
            )}
          >
            <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 sm:flex">
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/85">
                {card.dot && <span className={cn('size-1.5 shrink-0 rounded-full', card.dot)} aria-hidden />}
                <span className="truncate">{card.label}</span>
              </span>
              {isLoading || !stats ? (
                <span className="mt-1 block h-5 w-12 animate-pulse rounded-md bg-primary-foreground/20" aria-hidden />
              ) : (
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-xl leading-tight font-bold tracking-tight tabular-nums">
                    {format.number(card.value(stats))}
                  </span>
                  {card.aside && (
                    <span className="truncate text-xs text-primary-foreground/75">{card.aside(stats)}</span>
                  )}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
