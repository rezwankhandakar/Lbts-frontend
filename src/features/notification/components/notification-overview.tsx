import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { NOTIFICATION_CATEGORY_META, notificationPriorityMeta } from '../lib/notification-meta'
import { NOTIFICATION_CATEGORIES } from '../types'
import type {
  NotificationCategory,
  NotificationListParams,
  NotificationSummary,
} from '../types'
import type { NotificationFilterPatch } from '../hooks/use-notification-params'

interface NotificationOverviewProps {
  summary: NotificationSummary | undefined
  isLoading: boolean
  params: NotificationListParams
  onChange: (patch: NotificationFilterPatch) => void
}

interface Tile {
  key: string
  label: string
  value: number
  hint: string
  icon: LucideIcon
  chip: string
  /** Pressing the tile applies this filter, and pressing it again clears it. */
  filter: { pressed: boolean; apply: NotificationFilterPatch; clear: NotificationFilterPatch }
}

/**
 * What is waiting, above the list.
 *
 * **Every tile is a filter**, which is the rule the Challan backlog chips and
 * the Vendor overview's alerts both follow: a count nobody can act on is a
 * number to scroll past, and pressing one is how somebody actually gets from
 * "four urgent" to the four.
 *
 * Two things separate these from the journal's tiles beside them, and both come
 * from what a notification *is*:
 *
 * - **They answer the inbox rather than the filters.** Every other total in this
 *   app answers the filters in force; these answer "what is unread, anywhere",
 *   because the moment they narrowed with the list they would stop being able to
 *   tell somebody what they had *not* looked at yet — which is the only question
 *   this row exists for. The list's own count underneath is the filtered one.
 * - **A tile with nothing behind it is not drawn.** These are jobs rather than
 *   readings, so the row is a to-do list — the distinction the dashboard draws
 *   between an attention row and a module card. An *active* tile stays drawn at
 *   zero, or clearing the last message would remove the only thing saying why the
 *   list is suddenly empty.
 */
export function NotificationOverview({
  summary,
  isLoading,
  params,
  onChange,
}: NotificationOverviewProps) {
  if (isLoading || !summary) {
    return (
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[5.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  const urgent = notificationPriorityMeta('urgent')
  const attention = notificationPriorityMeta('attention')

  const tiles: Tile[] = [
    {
      key: 'unread',
      label: 'Unread',
      value: summary.unread,
      hint: summary.unread === 0 ? 'You are up to date' : 'Everything you have not opened',
      icon: Inbox,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
      filter: {
        pressed: params.state === 'unread',
        apply: { state: 'unread' },
        clear: { state: 'all' },
      },
    },
    {
      key: 'urgent',
      label: 'Urgent',
      value: summary.byPriority.urgent,
      hint: 'Already wrong, or hard to undo',
      icon: urgent.icon,
      chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
      filter: {
        pressed: params.priority === 'urgent',
        apply: { priority: 'urgent', state: 'unread' },
        clear: { priority: 'all' },
      },
    },
    {
      key: 'attention',
      label: 'Needs attention',
      value: summary.byPriority.attention,
      hint: 'Waiting on somebody to do something',
      icon: attention.icon,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      filter: {
        pressed: params.priority === 'attention',
        apply: { priority: 'attention', state: 'unread' },
        clear: { priority: 'all' },
      },
    },
  ]

  /**
   * And the busiest category, whichever it turns out to be. A fixed fourth tile
   * would be one that reads zero for most accounts most of the time — a Manager's
   * inbox is compliance and money, an operator's is review — so the row says what
   * is actually there instead of what somebody guessed would be.
   */
  const busiest = NOTIFICATION_CATEGORIES.reduce<{ category: NotificationCategory; count: number }>(
    (best, category) => {
      const count = summary.byCategory[category] ?? 0
      return count > best.count ? { category, count } : best
    },
    { category: 'approvals', count: 0 },
  )

  if (busiest.count > 0) {
    const meta = NOTIFICATION_CATEGORY_META[busiest.category]
    tiles.push({
      key: busiest.category,
      label: meta.label,
      value: busiest.count,
      hint: 'The most of any kind right now',
      icon: meta.icon,
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
      filter: {
        pressed: params.category === busiest.category,
        apply: { category: busiest.category, state: 'unread' },
        clear: { category: 'all' },
      },
    })
  }

  const shown = tiles.filter((tile) => tile.value > 0 || tile.filter.pressed)

  if (shown.length === 0) {
    return null
  }

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {shown.map((tile) => {
        const { pressed, apply, clear } = tile.filter

        return (
          <button
            key={tile.key}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(pressed ? clear : apply)}
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs',
              'transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50',
              pressed && 'border-primary/50 ring-2 ring-primary/15',
            )}
          >
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
                {tile.value.toLocaleString()}
              </span>
              <span className="mt-0.5 block text-[13px] font-medium">{tile.label}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {tile.hint}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
