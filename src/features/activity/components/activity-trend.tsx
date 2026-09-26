import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ActivityTrendProps {
  /** Oldest first; `date` is the instant each bucket starts. */
  trend: { date: string; count: number }[]
}

const DAY_LABEL = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })
const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/**
 * Fourteen days of activity, as one measure on one axis.
 *
 * A picture rather than a number, because the question it answers is
 * comparative — "is this a normal week" — and a count cannot answer that. One
 * series, so it needs no legend; the caption names it.
 *
 * Three things it deliberately does not do. It has **no axis**: the shape is
 * the information, and a scale printed beside fourteen small bars is more ink
 * than the data. It draws a **zero day as a floor rather than nothing**, so a
 * quiet Friday reads as quiet instead of as a gap in the fortnight — the same
 * reasoning `fillTrend` follows on the server, where dropping the day would
 * silently re-label the rest. And it is **pressable as well as hoverable**,
 * because a phone has no hover and the count lives only in the tooltip.
 *
 * The figures are also in an `sr-only` table: a bar chart says nothing to a
 * screen reader, and the numbers behind it are small enough to simply state.
 */
export function ActivityTrend({ trend }: ActivityTrendProps) {
  const t = useT()

  const peak = Math.max(1, ...trend.map((day) => day.count))
  const total = trend.reduce((sum, day) => sum + day.count, 0)
  const first = trend[0]
  const last = trend[trend.length - 1]

  return (
    <section className="flex flex-col rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-medium">{t('activity.trend.heading')}</h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {total.toLocaleString()} events
        </p>
      </div>

      <div className="mt-3 flex flex-1 items-end gap-[3px]" role="presentation">
        {trend.map((day) => {
          const height = Math.round((day.count / peak) * 100)
          const isLast = day === last

          return (
            <button
              key={day.date}
              type="button"
              // A button so it is reachable and pressable; the title is what a
              // pointer reads, and the sr-only table below is what a reader does.
              title={`${DAY_LABEL.format(new Date(day.date))}: ${day.count} ${
                day.count === 1 ? 'event' : 'events'
              }`}
              className="group/bar relative flex h-10 flex-1 items-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span
                className={cn(
                  'w-full rounded-[2px] transition-[height,opacity] duration-300',
                  isLast ? 'bg-viz-1' : 'bg-viz-1/55 group-hover/bar:bg-viz-1',
                )}
                // A zero day still gets a hairline: absent would read as a gap
                // in the fortnight rather than as a quiet day.
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </button>
          )
        })}
      </div>

      {/* No `Date.now()` fallback: a component must be pure, and an empty
          series is a real state (the server always fills fourteen buckets, but
          a caller could pass none) that simply has no first day to name. */}
      {first && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {WEEKDAY.format(new Date(first.date))} → today
        </p>
      )}

      <table className="sr-only">
        <caption>{t('activity.trend.caption')}</caption>
        <tbody>
          {trend.map((day) => (
            <tr key={day.date}>
              <th scope="row">{DAY_LABEL.format(new Date(day.date))}</th>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
