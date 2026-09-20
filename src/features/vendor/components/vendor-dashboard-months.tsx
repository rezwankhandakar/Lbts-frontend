import { useState } from 'react'
import { shortPeriodLabel } from '@/features/accounts/lib/accounts-meta'
import { plural, taka } from '@/features/delivery/lib/delivery-meta'
import { cn } from '@/lib/utils'
import type { VendorMonthPoint } from '../types'

/** A clean upper bound for the axis: 1, 2, 2.5 or 5 times a power of ten. */
function niceMax(value: number): number {
  if (value <= 0) return 1000
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= value) ?? 10
  return step * power
}

/** A taka figure short enough for an axis: 12K, 1.5L, 2Cr — the local scale. */
function compact(value: number): string {
  if (value >= 10_000_000)
    return `${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 1)}Cr`
  if (value >= 100_000) return `${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)}L`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(value)
}

/**
 * Six months of what this vendor's trips were billed.
 *
 * **One measure on one axis.** Trips and taka are two different scales, and
 * drawing both as paired columns would be a dual-axis chart — a picture where
 * "the orange bar is taller" means nothing at all. So the bill is the series,
 * because it is what a vendor reads a season by, and the trip and piece counts
 * ride in the tooltip and in the table beneath, where they are read as numbers
 * rather than compared as heights.
 *
 * A single series needs no legend: the caption names it. Only the current month
 * is direct-labelled — it is the one the figures above the chart describe, and
 * a number over every column is a table pretending to be a picture.
 *
 * A column is **pressed as well as hovered**, because a phone has no hover and
 * the counts exist only in the tooltip. Every month in the window is drawn even
 * where nothing ran, so the columns never slide out of step with their labels.
 */
export function VendorDashboardMonths({ months }: { months: VendorMonthPoint[] }) {
  const [active, setActive] = useState<number | null>(null)

  const top = niceMax(Math.max(0, ...months.map((point) => point.bill)))
  const ticks = [top, top / 2, 0]
  const current = months.length - 1
  const nothingBilled = months.every((point) => point.bill === 0)

  return (
    <figure className="grid gap-3">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-[3px] bg-viz-1" aria-hidden />
          Billed per month — trip rent and labour
        </span>
        {nothingBilled && (
          <span className="text-xs text-muted-foreground">Nothing billed in this window yet</span>
        )}
      </figcaption>

      <div className="grid grid-cols-[2.75rem_1fr] gap-2" aria-hidden>
        <div className="relative h-44 text-right text-[10px] text-muted-foreground tabular-nums sm:h-52">
          {ticks.map((tick, index) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${index * 50}%` }}
            >
              {compact(tick)}
            </span>
          ))}
        </div>

        <div className="relative h-44 sm:h-52">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              className="absolute inset-x-0 h-px bg-border"
              style={{ top: `${index * 50}%` }}
            />
          ))}

          <div className="relative flex h-full items-end">
            {months.map((point, index) => (
              <div
                key={`${point.year}-${point.month}`}
                className="relative flex h-full flex-1 cursor-default touch-manipulation items-end justify-center px-1"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((open) => (open === index ? null : index))}
              >
                {active === index && (
                  <div className="absolute inset-y-0 inset-x-0.5 rounded-md bg-muted/60" />
                )}

                {/* The current month is labelled; the rest answer on press. */}
                {index === current && point.bill > 0 && (
                  <span className="absolute bottom-full mb-1 text-[10px] font-medium text-muted-foreground tabular-nums">
                    {compact(point.bill)}
                  </span>
                )}

                <div
                  className={cn(
                    'relative w-full max-w-9 rounded-t-[4px] bg-viz-1 transition-opacity',
                    active !== null && active !== index && 'opacity-60',
                  )}
                  style={{
                    height: `${(point.bill / top) * 100}%`,
                    minHeight: point.bill > 0 ? 2 : 0,
                  }}
                />

                {active === index && (
                  <div
                    className={cn(
                      'absolute bottom-full z-10 mb-2 w-44 rounded-lg border bg-popover p-2.5 text-xs shadow-lg',
                      index > months.length / 2 ? 'right-0' : 'left-0',
                    )}
                  >
                    <p className="mb-1.5 font-medium">{shortPeriodLabel(point)}</p>
                    <p className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="size-2 rounded-[2px] bg-viz-1" />
                        Billed
                      </span>
                      <span className="tabular-nums">{taka(point.bill)}</span>
                    </p>
                    <p className="mt-1.5 flex justify-between gap-2 border-t pt-1.5 text-muted-foreground">
                      <span>{plural(point.trips, 'trip')}</span>
                      <span className="tabular-nums">{point.qty.toLocaleString()} pcs</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div />
        <div className="flex">
          {months.map((point) => (
            <span
              key={`${point.year}-${point.month}`}
              className="min-w-0 flex-1 text-center text-[11px] text-muted-foreground"
            >
              {shortPeriodLabel(point)}
            </span>
          ))}
        </div>
      </div>

      {/* The same figures as a table, for a reader who is not reading the picture. */}
      <table className="sr-only">
        <caption>Trips, pieces and amount billed by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Trips</th>
            <th>Pieces</th>
            <th>Billed</th>
          </tr>
        </thead>
        <tbody>
          {months.map((point) => (
            <tr key={`${point.year}-${point.month}`}>
              <td>{shortPeriodLabel(point)}</td>
              <td>{point.trips}</td>
              <td>{point.qty}</td>
              <td>{taka(point.bill)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
